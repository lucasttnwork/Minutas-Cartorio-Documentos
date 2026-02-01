#!/usr/bin/env python3
"""
batch_ocr.py - Fase 2.2 do Pipeline de Extracao de Documentos

Este script processa todos os documentos de uma escritura em lote,
usando o ocr_document_ai.py para OCR de cada documento individual.

Funcionalidades:
- Carrega catalogo da escritura
- Processa arquivos com status_ocr: "pendente"
- Rate limiting para respeitar quotas da API
- Retry automatico em caso de falha
- Progress saving incremental
- Mode resume para continuar processamento interrompido
- Relatorio final com estatisticas
- NOVO: Modo paralelo com preparacao paralela e rate limit sequencial

Uso:
    python batch_ocr.py FC_515_124_p280509
    python batch_ocr.py FC_515_124_p280509 --limit 5
    python batch_ocr.py FC_515_124_p280509 --resume
    python batch_ocr.py FC_515_124_p280509 --force --verbose

Modo Paralelo (recomendado para lotes grandes):
    python batch_ocr.py FC_515_124_p280509 --parallel
    python batch_ocr.py FC_515_124_p280509 --parallel --workers 8

Autor: Pipeline de Minutas
Data: Janeiro 2026
"""

import argparse
import json
import logging
import os
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

# Adiciona o diretorio raiz ao path para imports
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Configuracao de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constantes
RATE_LIMIT_DELAY = 2  # 2 segundos entre requests (margem de seguranca)
MAX_RETRIES = 2  # Maximo de retries por documento
RETRY_DELAY = 10  # Segundos de espera antes de retry
SAVE_PROGRESS_INTERVAL = 5  # Salvar a cada N arquivos

# Constantes para processamento paralelo
PARALLEL_WORKERS = 6  # Numero de workers para preparacao paralela
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB limite do Document AI

# Extensoes suportadas para OCR
# DOCX/DOC sao convertidos automaticamente para PDF pelo ocr_document_ai.py
SUPPORTED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.docx', '.doc'}

# Extensoes que serao ignoradas (nao fazem sentido para OCR)
# NOTA: DOCX/DOC removidos desta lista - agora sao convertidos para PDF automaticamente
SKIP_EXTENSIONS = {'.xlsx', '.xls'}

# Mapeamento de extensao para MIME type
MIME_TYPES = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff'
}


# =============================================================================
# RATE LIMITER - Thread-safe para controle de rate limit global
# =============================================================================

class DocumentAIRateLimiter:
    """
    Thread-safe rate limiter para controlar chamadas a API Document AI.

    Document AI quota: 120 requests/minute (0.5s minimo)
    Usamos 2s para seguranca adicional e evitar throttling.

    Implementa pattern Singleton para garantir controle global.

    Uso:
        rate_limiter = DocumentAIRateLimiter.get_instance()
        rate_limiter.wait()  # Bloqueia ate ser seguro enviar
        # ... faz a requisicao ...
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        """Singleton pattern - garante apenas uma instancia global."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self, min_interval: float = RATE_LIMIT_DELAY):
        """
        Inicializa o rate limiter.

        Args:
            min_interval: Intervalo minimo entre requests em segundos (default: 2s)
        """
        if self._initialized:
            return

        self._min_interval = min_interval
        self._last_request_time = 0.0
        self._request_lock = threading.Lock()
        self._request_count = 0
        self._total_wait_time = 0.0
        self._initialized = True
        logger.debug(f"DocumentAIRateLimiter inicializado com intervalo de {min_interval}s")

    @classmethod
    def get_instance(cls, min_interval: float = RATE_LIMIT_DELAY) -> 'DocumentAIRateLimiter':
        """
        Obtem a instancia singleton do DocumentAIRateLimiter.

        Args:
            min_interval: Intervalo minimo entre requests

        Returns:
            Instancia do DocumentAIRateLimiter
        """
        instance = cls()
        return instance

    @classmethod
    def reset_instance(cls):
        """Reseta a instancia singleton (util para testes)."""
        with cls._lock:
            cls._instance = None

    def wait(self) -> float:
        """
        Aguarda ate ser seguro fazer uma nova requisicao.

        Thread-safe: multiplas threads podem chamar wait() simultaneamente,
        mas apenas uma sera liberada a cada min_interval segundos.

        Returns:
            Tempo efetivamente esperado em segundos
        """
        with self._request_lock:
            current_time = time.time()
            elapsed = current_time - self._last_request_time

            if elapsed < self._min_interval:
                wait_time = self._min_interval - elapsed
                logger.debug(f"RateLimiter: aguardando {wait_time:.2f}s antes do proximo request")
                time.sleep(wait_time)
                waited = wait_time
            else:
                waited = 0.0

            self._last_request_time = time.time()
            self._request_count += 1
            self._total_wait_time += waited
            logger.debug(f"RateLimiter: request #{self._request_count} liberado")

            return waited

    def get_stats(self) -> Dict[str, Any]:
        """
        Retorna estatisticas do rate limiter.

        Returns:
            Dicionario com estatisticas
        """
        return {
            'total_requests': self._request_count,
            'min_interval': self._min_interval,
            'total_wait_time': round(self._total_wait_time, 2),
            'last_request_time': self._last_request_time
        }


# =============================================================================
# ESTRUTURAS PARA PROCESSAMENTO PARALELO
# =============================================================================

@dataclass
class PreparedOCRDocument:
    """
    Documento preparado para OCR via Document AI.

    Contem todas as informacoes necessarias para o processamento,
    ja com o conteudo carregado em memoria (se < 10MB).

    Separacao de concerns:
    - prepare_document(): Carrega arquivo, valida, prepara (paralelo)
    - process_prepared_document(): Envia para API com rate limit (sequencial)
    """
    file_info: Dict[str, Any]  # Info do catalogo
    file_content: Optional[bytes] = None  # Conteudo carregado em memoria
    file_path: Path = field(default_factory=Path)  # Caminho do arquivo
    mime_type: str = ''  # MIME type do arquivo
    is_temp_file: bool = False  # True se for DOCX convertido para PDF
    error: Optional[str] = None  # Erro na preparacao (se houver)
    preparation_time: float = 0.0  # Tempo de preparacao em segundos

    @property
    def is_ready(self) -> bool:
        """Retorna True se o documento esta pronto para processamento."""
        return self.error is None and self.file_content is not None

    @property
    def file_size_mb(self) -> float:
        """Retorna tamanho do arquivo em MB."""
        if self.file_content:
            return len(self.file_content) / (1024 * 1024)
        return 0.0


# =============================================================================
# FUNCOES DE PREPARACAO PARALELA
# =============================================================================

def prepare_document(file_info: Dict[str, Any], escritura_id: str) -> PreparedOCRDocument:
    """
    Prepara um documento para OCR (carrega, valida, converte DOCX se necessario).

    Esta funcao roda em paralelo via ThreadPoolExecutor.
    NAO faz chamadas a API do Document AI.

    Para arquivos DOCX/DOC, converte para PDF usando Microsoft Word via docx2pdf.
    O PDF temporario e carregado em memoria e marcado para limpeza posterior.

    Args:
        file_info: Informacoes do arquivo do catalogo
        escritura_id: ID da escritura

    Returns:
        PreparedOCRDocument com documento pronto ou erro
    """
    start_time = time.time()

    try:
        file_path = Path(file_info['caminho_absoluto'])
        file_name = file_info.get('nome', file_path.name)

        # Validar existencia
        if not file_path.exists():
            return PreparedOCRDocument(
                file_info=file_info,
                file_content=None,
                file_path=file_path,
                is_temp_file=False,
                error=f"Arquivo nao encontrado: {file_path}",
                preparation_time=time.time() - start_time
            )

        # Verificar extensao
        ext = file_path.suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            return PreparedOCRDocument(
                file_info=file_info,
                file_content=None,
                file_path=file_path,
                is_temp_file=False,
                error=f"Extensao nao suportada: {ext}",
                preparation_time=time.time() - start_time
            )

        # Verificar tamanho (antes da conversao)
        file_size = file_path.stat().st_size
        if file_size == 0:
            return PreparedOCRDocument(
                file_info=file_info,
                file_content=None,
                file_path=file_path,
                is_temp_file=False,
                error="Arquivo vazio",
                preparation_time=time.time() - start_time
            )

        # Converter DOCX/DOC para PDF se necessario
        is_temp_file = False
        if ext in {'.docx', '.doc'}:
            try:
                # Inicializa COM para esta thread (necessario no Windows para docx2pdf)
                # Cada thread precisa de sua propria inicializacao COM
                import sys
                if sys.platform == 'win32':
                    try:
                        import pythoncom
                        pythoncom.CoInitialize()
                    except ImportError:
                        pass  # pythoncom pode nao estar disponivel

                # Importa funcao de conversao do ocr_document_ai
                from ocr_document_ai import convert_docx_to_pdf

                logger.debug(f"Convertendo DOCX para PDF: {file_name}")
                pdf_path = convert_docx_to_pdf(file_path)

                if pdf_path is None:
                    return PreparedOCRDocument(
                        file_info=file_info,
                        file_content=None,
                        file_path=file_path,
                        is_temp_file=False,
                        error=f"Falha na conversao DOCX -> PDF: {file_name}",
                        preparation_time=time.time() - start_time
                    )

                # Usa o PDF convertido
                file_path = pdf_path
                is_temp_file = True
                ext = '.pdf'
                logger.debug(f"DOCX convertido: {file_name} -> {pdf_path.name}")

            except ImportError:
                return PreparedOCRDocument(
                    file_info=file_info,
                    file_content=None,
                    file_path=file_path,
                    is_temp_file=False,
                    error="Biblioteca docx2pdf nao disponivel para conversao DOCX",
                    preparation_time=time.time() - start_time
                )
            except Exception as e:
                return PreparedOCRDocument(
                    file_info=file_info,
                    file_content=None,
                    file_path=file_path,
                    is_temp_file=False,
                    error=f"Erro na conversao DOCX: {str(e)[:80]}",
                    preparation_time=time.time() - start_time
                )

        # Verificar tamanho (apos conversao, se aplicavel)
        file_size = file_path.stat().st_size
        if file_size > MAX_FILE_SIZE_BYTES:
            size_mb = file_size / (1024 * 1024)
            # Limpa arquivo temporario se criado
            if is_temp_file:
                try:
                    file_path.unlink()
                except Exception:
                    pass
            return PreparedOCRDocument(
                file_info=file_info,
                file_content=None,
                file_path=file_path,
                is_temp_file=False,
                error=f"Arquivo muito grande: {size_mb:.2f} MB (max: 10 MB)",
                preparation_time=time.time() - start_time
            )

        # Determinar MIME type
        mime_type = MIME_TYPES.get(ext, 'application/pdf')

        # Carregar conteudo em memoria
        with open(file_path, 'rb') as f:
            content = f.read()

        logger.debug(f"Preparado: {file_name} ({len(content)/1024:.1f} KB){' [convertido de DOCX]' if is_temp_file else ''}")

        return PreparedOCRDocument(
            file_info=file_info,
            file_content=content,
            file_path=file_path,
            mime_type=mime_type,
            is_temp_file=is_temp_file,
            error=None,
            preparation_time=time.time() - start_time
        )

    except Exception as e:
        return PreparedOCRDocument(
            file_info=file_info,
            file_content=None,
            file_path=Path(file_info.get('caminho_absoluto', '')),
            is_temp_file=False,
            error=f"Erro na preparacao: {str(e)[:100]}",
            preparation_time=time.time() - start_time
        )


def process_prepared_document(
    prepared_doc: PreparedOCRDocument,
    client,
    processor_name: str,
    output_dir: Path,
    rate_limiter: DocumentAIRateLimiter
) -> Dict[str, Any]:
    """
    Processa um documento preparado via Document AI.

    Esta funcao usa rate limiter e faz chamada a API.
    Deve ser chamada sequencialmente para respeitar rate limits.

    Args:
        prepared_doc: Documento preparado
        client: Cliente Document AI
        processor_name: Nome do processador
        output_dir: Diretorio de saida para arquivos .txt
        rate_limiter: Rate limiter global

    Returns:
        Dicionario com resultado do OCR
    """
    file_id = prepared_doc.file_info['id']
    file_name = prepared_doc.file_info['nome']

    result = {
        'file_id': file_id,
        'file_name': file_name,
        'status': 'erro',
        'data_ocr': datetime.now().isoformat(),
        'confianca_ocr': None,
        'arquivo_ocr': None,
        'erro_ocr': None,
        'texto_extraido': None
    }

    # Se houve erro na preparacao, retornar imediatamente
    if not prepared_doc.is_ready:
        result['erro_ocr'] = prepared_doc.error
        logger.error(f"  Erro preparacao: {file_name} - {prepared_doc.error}")
        return result

    # Aguardar rate limit
    wait_time = rate_limiter.wait()
    if wait_time > 0:
        logger.debug(f"  Rate limit: aguardou {wait_time:.2f}s")

    try:
        # Importa Document AI se necessario
        from google.cloud import documentai_v1 as documentai

        # Cria o documento raw
        raw_document = documentai.RawDocument(
            content=prepared_doc.file_content,
            mime_type=prepared_doc.mime_type
        )

        # Cria a requisicao
        request = documentai.ProcessRequest(
            name=processor_name,
            raw_document=raw_document
        )

        # Processa com retry
        last_error = None
        for attempt in range(MAX_RETRIES + 1):
            try:
                logger.debug(f"  Enviando para Document AI (tentativa {attempt + 1})...")
                api_result = client.process_document(request=request)
                document = api_result.document

                # Extrai texto
                text = document.text.strip() if document.text else ''

                # Calcula confianca media
                confidence = 0.0
                if document.pages:
                    confidences = []
                    for page in document.pages:
                        if page.blocks:
                            for block in page.blocks:
                                if block.layout and block.layout.confidence:
                                    confidences.append(block.layout.confidence)
                    if confidences:
                        confidence = sum(confidences) / len(confidences)

                # Conta paginas
                pages = len(document.pages) if document.pages else 1

                # Salva arquivo de saida
                base_name = prepared_doc.file_path.stem
                output_file = output_dir / f"{base_name}_{file_id}.txt"
                output_dir.mkdir(parents=True, exist_ok=True)

                # Formata conteudo com cabecalho
                header = f"""DOCUMENTO: {file_name}
TIPO: {prepared_doc.file_path.suffix.upper().lstrip('.')}
PAGINAS: {pages}
CONFIANCA: {confidence:.2f}
DATA_PROCESSAMENTO: {datetime.now().isoformat()}
---
"""
                output_file.write_text(header + text, encoding='utf-8')

                # Atualiza resultado
                result['status'] = 'processado'
                result['confianca_ocr'] = confidence
                result['arquivo_ocr'] = str(output_file)
                result['texto_extraido'] = text

                if not text:
                    result['texto_extraido'] = '[TEXTO NAO DETECTADO]'
                    logger.warning(f"  Nenhum texto detectado: {file_name}")

                logger.info(f"  OCR concluido: {file_name} (confianca: {confidence:.2f}, {len(text)} chars)")
                return result

            except Exception as e:
                last_error = e
                if attempt < MAX_RETRIES:
                    logger.warning(f"  Tentativa {attempt + 1} falhou: {e}")
                    time.sleep(RETRY_DELAY)
                continue

        # Todas as tentativas falharam
        result['erro_ocr'] = f"Falha apos {MAX_RETRIES + 1} tentativas: {str(last_error)[:100]}"
        logger.error(f"  OCR falhou: {file_name} - {result['erro_ocr']}")
        return result

    except Exception as e:
        result['erro_ocr'] = f"Excecao: {str(e)[:100]}"
        logger.error(f"  Excecao no OCR: {file_name} - {e}")
        return result

    finally:
        # Limpar arquivo temporario (se DOCX convertido)
        if prepared_doc.is_temp_file:
            try:
                prepared_doc.file_path.unlink()
                logger.debug(f"  Arquivo temporario removido: {prepared_doc.file_path}")
            except Exception as e:
                logger.warning(f"  Falha ao remover temporario: {e}")


def run_parallel_batch(
    escritura_id: str,
    files_to_process: List[Dict[str, Any]],
    client,
    processor_name: str,
    output_dir: Path,
    catalog: Dict[str, Any],
    limit: Optional[int] = None,
    workers: int = PARALLEL_WORKERS
) -> Dict[str, Any]:
    """
    Executa processamento OCR em batch com preparacao paralela.

    Stage 1: Preparacao paralela (ThreadPoolExecutor)
    - Carrega arquivos em memoria
    - Valida extensoes e tamanhos
    - Prepara payloads

    Stage 2: Processamento sequencial com rate limit
    - Envia para Document AI respeitando 2s entre requests
    - Atualiza catalogo
    - Salva progresso

    Args:
        escritura_id: ID da escritura
        files_to_process: Lista de arquivos do catalogo
        client: Cliente Document AI
        processor_name: Nome do processador
        output_dir: Diretorio de saida
        catalog: Catalogo para atualizar
        limit: Limite de arquivos (para testes)
        workers: Numero de workers na preparacao paralela

    Returns:
        Estatisticas do processamento
    """
    if limit:
        files_to_process = files_to_process[:limit]
        logger.info(f"Limitando processamento a {limit} arquivos (modo teste)")

    total = len(files_to_process)
    rate_limiter = DocumentAIRateLimiter.get_instance()

    stats = {
        'escritura_id': escritura_id,
        'data_inicio': datetime.now().isoformat(),
        'modo_processamento': 'paralelo',
        'workers_preparacao': workers,
        'total_arquivos': total,
        'processados_sucesso': 0,
        'processados_erro': 0,
        'confiancas': [],
        'tempo_preparacao': 0.0,
        'tempo_processamento': 0.0,
        'tempo_total': 0.0,
        'arquivos_processados': []
    }

    start_time = time.time()

    # ==========================================================================
    # STAGE 1: Preparacao paralela
    # ==========================================================================
    logger.info(f"=" * 60)
    logger.info(f"[STAGE 1] Preparando {total} documentos em paralelo ({workers} workers)...")
    prep_start = time.time()

    prepared_docs: List[PreparedOCRDocument] = []

    with ThreadPoolExecutor(max_workers=workers) as executor:
        # Submete todas as tarefas de preparacao
        future_to_file = {
            executor.submit(prepare_document, file_info, escritura_id): file_info
            for file_info in files_to_process
        }

        # Coleta resultados conforme completam
        for idx, future in enumerate(as_completed(future_to_file), 1):
            file_info = future_to_file[future]
            try:
                prepared = future.result()
                prepared_docs.append(prepared)
                logger.debug(f"  Preparado {idx}/{total}: {file_info['nome']} ({prepared.preparation_time:.2f}s)")
            except Exception as e:
                logger.error(f"  Erro ao preparar {file_info['nome']}: {e}")
                prepared_docs.append(PreparedOCRDocument(
                    file_info=file_info,
                    file_content=None,
                    file_path=Path(file_info['caminho_absoluto']),
                    is_temp_file=False,
                    error=f"Erro de preparacao: {str(e)[:50]}",
                    preparation_time=0.0
                ))

    stats['tempo_preparacao'] = time.time() - prep_start

    # Ordena por ID para manter ordem consistente
    prepared_docs.sort(key=lambda x: x.file_info['id'])

    # Estatisticas de preparacao
    docs_ready = sum(1 for p in prepared_docs if p.is_ready)
    docs_error = sum(1 for p in prepared_docs if not p.is_ready)
    avg_prep_time = sum(p.preparation_time for p in prepared_docs) / len(prepared_docs) if prepared_docs else 0
    total_size_mb = sum(p.file_size_mb for p in prepared_docs)

    logger.info(f"[STAGE 1] Preparacao concluida em {stats['tempo_preparacao']:.2f}s")
    logger.info(f"  - Documentos prontos: {docs_ready}")
    logger.info(f"  - Documentos com erro: {docs_error}")
    logger.info(f"  - Tempo medio de preparacao: {avg_prep_time:.3f}s")
    logger.info(f"  - Tamanho total carregado: {total_size_mb:.2f} MB")
    logger.info(f"=" * 60)

    # ==========================================================================
    # STAGE 2: Processamento sequencial com rate limit
    # ==========================================================================
    logger.info(f"[STAGE 2] Processando {total} documentos (sequencial com rate limit)...")
    process_start = time.time()

    for idx, prepared_doc in enumerate(prepared_docs, 1):
        file_name = prepared_doc.file_info['nome']
        file_id = prepared_doc.file_info['id']

        logger.info(f"[{idx}/{total}] Processando: {file_name}")

        result = process_prepared_document(
            prepared_doc,
            client,
            processor_name,
            output_dir,
            rate_limiter
        )

        # Atualiza estatisticas
        if result['status'] == 'processado':
            stats['processados_sucesso'] += 1
            if result.get('confianca_ocr'):
                stats['confiancas'].append(result['confianca_ocr'])
        else:
            stats['processados_erro'] += 1

        stats['arquivos_processados'].append({
            'id': file_id,
            'nome': file_name,
            'status': result['status'],
            'confianca': result.get('confianca_ocr'),
            'erro': result.get('erro_ocr')
        })

        # Atualiza catalogo
        catalog = update_catalog_status(
            catalog=catalog,
            file_id=file_id,
            status=result['status'],
            details={
                'data_ocr': result['data_ocr'],
                'confianca_ocr': result.get('confianca_ocr'),
                'arquivo_ocr': result.get('arquivo_ocr'),
                'erro_ocr': result.get('erro_ocr')
            }
        )

        # Salvar progresso a cada N arquivos
        if idx % SAVE_PROGRESS_INTERVAL == 0:
            save_catalog(escritura_id, catalog)
            save_report(escritura_id, stats, partial=True)
            logger.info(f"  Progresso salvo ({idx}/{total})")

    stats['tempo_processamento'] = time.time() - process_start
    stats['tempo_total'] = time.time() - start_time

    # Salva catalogo final
    save_catalog(escritura_id, catalog)

    # Calcula estatisticas finais
    stats['data_fim'] = datetime.now().isoformat()
    stats['confianca_media'] = (
        sum(stats['confiancas']) / len(stats['confiancas'])
        if stats['confiancas'] else 0
    )

    # Remove lista de confiancas individuais do relatorio
    del stats['confiancas']

    # Salva relatorio final
    save_report(escritura_id, stats, partial=False)

    # Resumo final
    logger.info("=" * 60)
    logger.info("PROCESSAMENTO OCR CONCLUIDO (MODO PARALELO)")
    logger.info(f"  Escritura: {escritura_id}")
    logger.info(f"  Total processados: {stats['processados_sucesso'] + stats['processados_erro']}")
    logger.info(f"  Sucesso: {stats['processados_sucesso']}")
    logger.info(f"  Erros: {stats['processados_erro']}")
    logger.info(f"  Confianca media: {stats['confianca_media']:.2%}")
    logger.info(f"  Tempo de preparacao: {stats['tempo_preparacao']:.2f}s")
    logger.info(f"  Tempo de processamento: {stats['tempo_processamento']:.2f}s")
    logger.info(f"  Tempo total: {stats['tempo_total']:.2f}s")
    logger.info(f"  Rate limiter stats: {rate_limiter.get_stats()}")
    logger.info(f"  Diretorio OCR: {output_dir}")
    logger.info("=" * 60)

    return stats


def load_environment():
    """Carrega variaveis de ambiente do arquivo .env"""
    try:
        from dotenv import load_dotenv
        env_path = ROOT_DIR / '.env'
        if env_path.exists():
            load_dotenv(env_path)
            logger.debug(f"Variaveis de ambiente carregadas de {env_path}")
        else:
            logger.warning(f"Arquivo .env nao encontrado em {env_path}")
    except ImportError:
        logger.warning("python-dotenv nao instalado. Usando variaveis de ambiente do sistema.")


def load_catalog(escritura_id: str) -> Dict[str, Any]:
    """
    Carrega o catalogo de uma escritura.

    Args:
        escritura_id: ID da escritura (ex: FC_515_124_p280509)

    Returns:
        Dados do catalogo

    Raises:
        FileNotFoundError: Se catalogo nao existir
        ValueError: Se catalogo tiver estrutura invalida
    """
    catalog_path = ROOT_DIR / '.tmp' / 'catalogos' / f'{escritura_id}.json'

    if not catalog_path.exists():
        raise FileNotFoundError(f"Catalogo nao encontrado: {catalog_path}")

    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    # Valida estrutura basica
    required_fields = ['escritura_id', 'arquivos']
    for field in required_fields:
        if field not in catalog:
            raise ValueError(f"Campo obrigatorio ausente no catalogo: {field}")

    logger.info(f"Catalogo carregado: {len(catalog.get('arquivos', []))} arquivos")
    return catalog


def save_catalog(escritura_id: str, catalog: Dict[str, Any]):
    """
    Salva o catalogo atualizado.

    Args:
        escritura_id: ID da escritura
        catalog: Dados do catalogo
    """
    catalog_path = ROOT_DIR / '.tmp' / 'catalogos' / f'{escritura_id}.json'
    catalog_path.parent.mkdir(parents=True, exist_ok=True)

    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    logger.debug(f"Catalogo salvo: {catalog_path}")


def get_pending_files(catalog: Dict[str, Any], force: bool = False) -> List[Dict[str, Any]]:
    """
    Filtra arquivos que precisam de OCR.

    Args:
        catalog: Dados do catalogo
        force: Se True, reprocessa todos os arquivos

    Returns:
        Lista de arquivos pendentes para OCR
    """
    arquivos = catalog.get('arquivos', [])
    pending = []
    skipped_extension = []
    skipped_processed = []

    for arquivo in arquivos:
        ext = f".{arquivo.get('extensao', '').lower()}"

        # Ignora extensoes que nao fazem sentido para OCR
        if ext in SKIP_EXTENSIONS:
            skipped_extension.append(arquivo['nome'])
            continue

        # Verifica se extensao e suportada
        if ext not in SUPPORTED_EXTENSIONS:
            logger.warning(f"Extensao nao suportada para OCR: {arquivo['nome']} ({ext})")
            continue

        # Verifica status
        status_ocr = arquivo.get('status_ocr', 'pendente')

        if force or status_ocr == 'pendente':
            pending.append(arquivo)
        else:
            skipped_processed.append(arquivo['nome'])

    if skipped_extension:
        logger.info(f"Arquivos ignorados (extensao XLSX/XLS): {len(skipped_extension)}")
        for name in skipped_extension[:3]:
            logger.debug(f"  - {name}")

    if skipped_processed:
        logger.info(f"Arquivos ja processados: {len(skipped_processed)}")

    return pending


def update_catalog_status(
    catalog: Dict[str, Any],
    file_id: str,
    status: str,
    details: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Atualiza o status de OCR de um arquivo no catalogo.

    Args:
        catalog: Dados do catalogo
        file_id: ID do arquivo
        status: Status do OCR ("pendente", "processado", "erro")
        details: Detalhes adicionais (data_ocr, confianca_ocr, arquivo_ocr, erro_ocr)

    Returns:
        Catalogo atualizado
    """
    for arquivo in catalog.get('arquivos', []):
        if arquivo['id'] == file_id:
            arquivo['status_ocr'] = status
            arquivo['data_ocr'] = details.get('data_ocr', datetime.now().isoformat())

            if status == 'processado':
                arquivo['confianca_ocr'] = details.get('confianca_ocr')
                arquivo['arquivo_ocr'] = details.get('arquivo_ocr')
                # Remove erro anterior se existir
                arquivo.pop('erro_ocr', None)
            elif status == 'erro':
                arquivo['erro_ocr'] = details.get('erro_ocr', 'Erro desconhecido')
                # Mantem campos de OCR como None
                arquivo['confianca_ocr'] = None
                arquivo['arquivo_ocr'] = None

            break

    return catalog


def process_single_file(
    file_info: Dict[str, Any],
    output_dir: Path,
    escritura_id: str
) -> Dict[str, Any]:
    """
    Processa um unico arquivo via OCR.

    Args:
        file_info: Informacoes do arquivo do catalogo
        output_dir: Diretorio de saida para arquivos .txt
        escritura_id: ID da escritura para organizar saida

    Returns:
        Resultado do OCR com status e detalhes
    """
    file_path = Path(file_info['caminho_absoluto'])
    file_id = file_info['id']
    file_name = file_info['nome']

    # Gera nome do arquivo de saida
    base_name = file_path.stem
    output_file = output_dir / f"{base_name}_{file_id}.txt"

    result = {
        'file_id': file_id,
        'file_name': file_name,
        'status': 'erro',
        'data_ocr': datetime.now().isoformat(),
        'confianca_ocr': None,
        'arquivo_ocr': None,
        'erro_ocr': None,
        'texto_extraido': None
    }

    # Verifica se arquivo existe
    if not file_path.exists():
        result['erro_ocr'] = f"Arquivo nao encontrado: {file_path}"
        logger.error(f"Arquivo nao encontrado: {file_path}")
        return result

    try:
        # Importa e usa o ocr_document_ai
        from ocr_document_ai import ocr_single_document

        # Processa o documento
        # API: ocr_single_document(file_path, output_path, escritura_id)
        # Retorna: {'success': bool, 'text': str, 'confidence': float, 'output_path': str, 'error': str}
        ocr_result = ocr_single_document(
            file_path=str(file_path),
            output_path=str(output_file),
            escritura_id=escritura_id
        )

        if ocr_result.get('success', False):
            result['status'] = 'processado'
            result['confianca_ocr'] = ocr_result.get('confidence', 0.95)
            result['arquivo_ocr'] = ocr_result.get('output_path', str(output_file))
            result['texto_extraido'] = ocr_result.get('text', '')
            logger.info(f"  OCR concluido: {file_name} (confianca: {result['confianca_ocr']:.2f})")
        else:
            result['erro_ocr'] = ocr_result.get('error', 'Erro desconhecido no OCR')
            logger.error(f"  OCR falhou: {file_name} - {result['erro_ocr']}")

    except ImportError as e:
        # Fallback: se ocr_document_ai nao existe ainda, usa mock
        logger.warning(f"ocr_document_ai nao disponivel, usando modo mock: {e}")
        result = process_single_file_mock(file_info, output_dir)

    except Exception as e:
        result['erro_ocr'] = f"Excecao: {str(e)[:100]}"
        logger.error(f"  Excecao no OCR: {file_name} - {e}")

    return result


def process_single_file_mock(
    file_info: Dict[str, Any],
    output_dir: Path
) -> Dict[str, Any]:
    """
    Processa um arquivo em modo mock (para testes sem API).

    Args:
        file_info: Informacoes do arquivo
        output_dir: Diretorio de saida

    Returns:
        Resultado mock do OCR
    """
    file_path = Path(file_info['caminho_absoluto'])
    file_id = file_info['id']
    file_name = file_info['nome']

    base_name = file_path.stem
    output_file = output_dir / f"{base_name}_{file_id}.txt"

    # Gera texto mock baseado no tipo de documento
    tipo_doc = file_info.get('tipo_documento', 'OUTRO')
    mock_text = f"""[MOCK OCR - {tipo_doc}]
Arquivo: {file_name}
Data processamento: {datetime.now().isoformat()}

Este e um texto de exemplo gerado em modo mock.
O arquivo real seria processado pelo Google Document AI.

Tipo de documento identificado: {tipo_doc}
Pessoa relacionada: {file_info.get('pessoa_relacionada', 'N/A')}
"""

    # Salva arquivo de saida
    output_dir.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(mock_text)

    return {
        'file_id': file_id,
        'file_name': file_name,
        'status': 'processado',
        'data_ocr': datetime.now().isoformat(),
        'confianca_ocr': 0.99,  # Mock sempre tem "alta confianca"
        'arquivo_ocr': str(output_file),
        'erro_ocr': None,
        'texto_extraido': mock_text
    }


def process_batch(
    escritura_id: str,
    limit: Optional[int] = None,
    resume: bool = False,
    force: bool = False,
    mock_mode: bool = False,
    verbose: bool = False
) -> Dict[str, Any]:
    """
    Processa todos os arquivos de uma escritura em lote.

    Args:
        escritura_id: ID da escritura
        limit: Limite de arquivos a processar (para testes)
        resume: Se True, continua processamento anterior
        force: Se True, reprocessa todos os arquivos
        mock_mode: Se True, usa processamento mock sem API
        verbose: Se True, mostra mais detalhes

    Returns:
        Estatisticas do processamento
    """
    start_time = time.time()

    # Carrega catalogo
    logger.info(f"Carregando catalogo da escritura: {escritura_id}")
    catalog = load_catalog(escritura_id)

    # Filtra arquivos pendentes
    pending_files = get_pending_files(catalog, force=force)

    if limit:
        pending_files = pending_files[:limit]
        logger.info(f"Limitando processamento a {limit} arquivos (modo teste)")

    total = len(pending_files)

    if total == 0:
        logger.info("Nenhum arquivo pendente para processar")
        return {
            'escritura_id': escritura_id,
            'total_arquivos': 0,
            'processados_sucesso': 0,
            'processados_erro': 0,
            'tempo_total': 0,
            'confianca_media': 0
        }

    logger.info(f"=" * 60)
    logger.info(f"PROCESSAMENTO OCR EM LOTE")
    logger.info(f"  Escritura: {escritura_id}")
    logger.info(f"  Arquivos a processar: {total}")
    logger.info(f"  Rate limit: {RATE_LIMIT_DELAY}s entre requests")
    logger.info(f"  Modo: {'MOCK' if mock_mode else 'PRODUCAO'}")
    logger.info(f"=" * 60)

    # Diretorio de saida
    output_dir = ROOT_DIR / '.tmp' / 'ocr' / escritura_id
    output_dir.mkdir(parents=True, exist_ok=True)

    # Valida acesso ao Document AI (se nao for mock)
    if not mock_mode:
        try:
            from ocr_document_ai import setup_document_ai_client
            # Testa configuracao do cliente
            client, processor_name = setup_document_ai_client()
            logger.info(f"Cliente Document AI inicializado")
            logger.debug(f"Processador: {processor_name}")
        except ImportError:
            logger.warning("ocr_document_ai nao disponivel, usando modo mock")
            mock_mode = True
        except Exception as e:
            logger.error(f"Erro ao inicializar Document AI: {e}")
            logger.warning("Usando modo mock como fallback")
            mock_mode = True

    # Estatisticas
    stats = {
        'escritura_id': escritura_id,
        'data_inicio': datetime.now().isoformat(),
        'total_arquivos': total,
        'processados_sucesso': 0,
        'processados_erro': 0,
        'confiancas': [],
        'tempo_total': 0,
        'arquivos_processados': []
    }

    # Processa cada arquivo
    for idx, file_info in enumerate(pending_files, 1):
        file_name = file_info['nome']
        file_id = file_info['id']

        logger.info(f"[{idx}/{total}] Processando: {file_name}")

        # Processa com retry
        result = None
        for attempt in range(MAX_RETRIES + 1):
            try:
                if mock_mode:
                    result = process_single_file_mock(file_info, output_dir)
                else:
                    result = process_single_file(file_info, output_dir, escritura_id)

                if result['status'] == 'processado':
                    break  # Sucesso, sai do retry

            except Exception as e:
                logger.warning(f"  Tentativa {attempt + 1}/{MAX_RETRIES + 1} falhou: {e}")

                if attempt < MAX_RETRIES:
                    logger.info(f"  Aguardando {RETRY_DELAY}s antes de retry...")
                    time.sleep(RETRY_DELAY)
                else:
                    result = {
                        'file_id': file_id,
                        'file_name': file_name,
                        'status': 'erro',
                        'data_ocr': datetime.now().isoformat(),
                        'confianca_ocr': None,
                        'arquivo_ocr': None,
                        'erro_ocr': f"Falha apos {MAX_RETRIES + 1} tentativas: {str(e)[:50]}"
                    }

        # Atualiza catalogo
        if result:
            catalog = update_catalog_status(
                catalog=catalog,
                file_id=file_id,
                status=result['status'],
                details=result
            )

            # Atualiza estatisticas
            if result['status'] == 'processado':
                stats['processados_sucesso'] += 1
                if result.get('confianca_ocr'):
                    stats['confiancas'].append(result['confianca_ocr'])
            else:
                stats['processados_erro'] += 1

            stats['arquivos_processados'].append({
                'id': file_id,
                'nome': file_name,
                'status': result['status'],
                'confianca': result.get('confianca_ocr'),
                'erro': result.get('erro_ocr')
            })

        # Salva progresso a cada N arquivos
        if idx % SAVE_PROGRESS_INTERVAL == 0:
            save_catalog(escritura_id, catalog)
            save_report(escritura_id, stats, partial=True)
            logger.info(f"  Progresso salvo ({idx}/{total})")

        # Rate limiting (exceto ultimo arquivo)
        if idx < total and not mock_mode:
            logger.debug(f"  Rate limiting: aguardando {RATE_LIMIT_DELAY}s...")
            time.sleep(RATE_LIMIT_DELAY)

    # Salva catalogo final
    save_catalog(escritura_id, catalog)

    # Calcula estatisticas finais
    stats['data_fim'] = datetime.now().isoformat()
    stats['tempo_total'] = time.time() - start_time
    stats['confianca_media'] = (
        sum(stats['confiancas']) / len(stats['confiancas'])
        if stats['confiancas'] else 0
    )

    # Remove lista de confiancas individuais do relatorio
    del stats['confiancas']

    # Salva relatorio final
    save_report(escritura_id, stats, partial=False)

    # Resumo final
    logger.info("=" * 60)
    logger.info("PROCESSAMENTO OCR CONCLUIDO")
    logger.info(f"  Escritura: {escritura_id}")
    logger.info(f"  Total processados: {stats['processados_sucesso'] + stats['processados_erro']}")
    logger.info(f"  Sucesso: {stats['processados_sucesso']}")
    logger.info(f"  Erros: {stats['processados_erro']}")
    logger.info(f"  Confianca media: {stats['confianca_media']:.2%}")
    logger.info(f"  Tempo total: {stats['tempo_total']:.2f}s")
    logger.info(f"  Diretorio OCR: {output_dir}")
    logger.info("=" * 60)

    return stats


def save_report(escritura_id: str, stats: Dict[str, Any], partial: bool = False):
    """
    Salva relatorio de processamento.

    Args:
        escritura_id: ID da escritura
        stats: Estatisticas do processamento
        partial: Se True, salva como relatorio parcial
    """
    suffix = "_parcial" if partial else ""
    report_path = ROOT_DIR / '.tmp' / 'ocr' / f'{escritura_id}_relatorio{suffix}.json'
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    logger.debug(f"Relatorio salvo: {report_path}")


def generate_report(escritura_id: str) -> Dict[str, Any]:
    """
    Gera relatorio consolidado de uma escritura ja processada.

    Args:
        escritura_id: ID da escritura

    Returns:
        Relatorio consolidado
    """
    catalog = load_catalog(escritura_id)

    # Analisa arquivos
    total = 0
    processados = 0
    erros = 0
    pendentes = 0
    confiancas = []

    for arquivo in catalog.get('arquivos', []):
        ext = f".{arquivo.get('extensao', '').lower()}"

        # Ignora XLSX/XLS (planilhas nao fazem sentido para OCR)
        if ext in SKIP_EXTENSIONS:
            continue

        if ext not in SUPPORTED_EXTENSIONS:
            continue

        total += 1
        status = arquivo.get('status_ocr', 'pendente')

        if status == 'processado':
            processados += 1
            conf = arquivo.get('confianca_ocr')
            if conf:
                confiancas.append(conf)
        elif status == 'erro':
            erros += 1
        else:
            pendentes += 1

    report = {
        'escritura_id': escritura_id,
        'data_relatorio': datetime.now().isoformat(),
        'total_arquivos_ocr': total,
        'processados_sucesso': processados,
        'processados_erro': erros,
        'pendentes': pendentes,
        'taxa_sucesso': (processados / total * 100) if total > 0 else 0,
        'confianca_media': sum(confiancas) / len(confiancas) if confiancas else 0,
        'status': 'completo' if pendentes == 0 else 'parcial'
    }

    return report


def main():
    """Funcao principal - entry point do script"""
    parser = argparse.ArgumentParser(
        description='Processa documentos de escritura em lote via OCR (Document AI)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python batch_ocr.py FC_515_124_p280509
  python batch_ocr.py FC_515_124_p280509 --limit 5
  python batch_ocr.py FC_515_124_p280509 --resume
  python batch_ocr.py FC_515_124_p280509 --force --verbose
  python batch_ocr.py FC_515_124_p280509 --mock  # Teste sem API

Modo Paralelo (recomendado para lotes grandes):
  python batch_ocr.py FC_515_124_p280509 --parallel
  python batch_ocr.py FC_515_124_p280509 --parallel --workers 8
  python batch_ocr.py FC_515_124_p280509 --parallel --mock

O modo paralelo prepara documentos (carrega arquivos em memoria) em paralelo
enquanto mantém o rate limit de 2s entre chamadas a API Document AI.

O script le o catalogo da Fase 1 e processa cada arquivo via Document AI.
Arquivos DOCX/DOC sao convertidos automaticamente para PDF antes do OCR.
Arquivos XLSX/XLS sao ignorados (nao fazem sentido para OCR).
O progresso e salvo a cada 5 arquivos processados.
        """
    )

    parser.add_argument(
        'escritura_id',
        help='ID da escritura (ex: FC_515_124_p280509)'
    )

    parser.add_argument(
        '--limit', '-l',
        type=int,
        help='Limita o numero de arquivos processados (para testes)'
    )

    parser.add_argument(
        '--resume', '-r',
        action='store_true',
        help='Continua processamento anterior (ignora ja processados)'
    )

    parser.add_argument(
        '--force', '-f',
        action='store_true',
        help='Reprocessa todos os arquivos, mesmo os ja processados'
    )

    parser.add_argument(
        '--mock', '-m',
        action='store_true',
        help='Modo mock: gera arquivos de teste sem usar API real'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Modo verbose: mostra mais detalhes'
    )

    parser.add_argument(
        '--report-only',
        action='store_true',
        help='Apenas gera relatorio sem processar'
    )

    parser.add_argument(
        '--parallel', '-p',
        action='store_true',
        help='Modo paralelo: preparacao de documentos em paralelo (mais rapido)'
    )

    parser.add_argument(
        '--workers', '-w',
        type=int,
        default=PARALLEL_WORKERS,
        help=f'Numero de workers para preparacao paralela (default: {PARALLEL_WORKERS})'
    )

    args = parser.parse_args()

    # Configura nivel de log
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Carrega ambiente
    load_environment()

    try:
        if args.report_only:
            # Apenas gera relatorio
            report = generate_report(args.escritura_id)
            print(json.dumps(report, ensure_ascii=False, indent=2))
            sys.exit(0)

        if args.parallel:
            # Modo paralelo: prepara documentos em paralelo, processa com rate limit
            logger.info("Usando modo PARALELO para processamento OCR")

            # Carrega catalogo
            logger.info(f"Carregando catalogo da escritura: {args.escritura_id}")
            catalog = load_catalog(args.escritura_id)

            # Filtra arquivos pendentes
            pending_files = get_pending_files(catalog, force=args.force)

            if len(pending_files) == 0:
                logger.info("Nenhum arquivo pendente para processar")
                sys.exit(0)

            # Diretorio de saida
            output_dir = ROOT_DIR / '.tmp' / 'ocr' / args.escritura_id
            output_dir.mkdir(parents=True, exist_ok=True)

            # Inicializa cliente Document AI (se nao for mock)
            client = None
            processor_name = None

            if not args.mock:
                try:
                    from ocr_document_ai import setup_document_ai_client
                    client, processor_name = setup_document_ai_client()
                    logger.info(f"Cliente Document AI inicializado")
                    logger.debug(f"Processador: {processor_name}")
                except ImportError:
                    logger.warning("ocr_document_ai nao disponivel, usando modo mock")
                    args.mock = True
                except Exception as e:
                    logger.error(f"Erro ao inicializar Document AI: {e}")
                    logger.warning("Usando modo mock como fallback")
                    args.mock = True

            if args.mock:
                # Modo mock paralelo: usa process_batch existente
                logger.info("Modo mock ativado - usando processamento serial")
                stats = process_batch(
                    escritura_id=args.escritura_id,
                    limit=args.limit,
                    resume=args.resume,
                    force=args.force,
                    mock_mode=True,
                    verbose=args.verbose
                )
            else:
                # Executa processamento paralelo real
                stats = run_parallel_batch(
                    escritura_id=args.escritura_id,
                    files_to_process=pending_files,
                    client=client,
                    processor_name=processor_name,
                    output_dir=output_dir,
                    catalog=catalog,
                    limit=args.limit,
                    workers=args.workers
                )
        else:
            # Modo serial: processamento tradicional sequencial
            logger.info("Usando modo SERIAL para processamento OCR")
            stats = process_batch(
                escritura_id=args.escritura_id,
                limit=args.limit,
                resume=args.resume,
                force=args.force,
                mock_mode=args.mock,
                verbose=args.verbose
            )

        # Retorna codigo de saida baseado em erros
        if stats['processados_erro'] > 0:
            sys.exit(2)  # Concluido com erros
        sys.exit(0)  # Sucesso total

    except FileNotFoundError as e:
        logger.error(f"Arquivo nao encontrado: {e}")
        sys.exit(1)
    except Exception as e:
        logger.exception(f"Erro fatal: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
