#!/usr/bin/env python3
"""
extract_with_gemini.py - Fase 3: Classificacao Contextual com Gemini 2.0 Flash

Este script processa documentos de cartorio usando o Gemini 2.0 Flash para
interpretacao contextual avancada. Diferente da extracao estruturada por regex,
este script usa a capacidade visual e de linguagem do Gemini para:

1. REESCRITA: Transcrever o documento de forma organizada
2. EXPLICACAO CONTEXTUAL: Interpretar semanticamente o documento
3. DADOS CATALOGADOS: Extrair JSON estruturado

Uso:
    python extract_with_gemini.py FC_515_124_p280509
    python extract_with_gemini.py FC_515_124_p280509 --limit 5
    python extract_with_gemini.py FC_515_124_p280509 --type MATRICULA_IMOVEL
    python extract_with_gemini.py FC_515_124_p280509 --verbose

Autor: Pipeline de Minutas
Data: Janeiro 2026
"""

import argparse
import base64
import json
import logging
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple

# Adiciona o diretorio raiz ao path para imports
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Bibliotecas externas
try:
    from dotenv import load_dotenv
    import google.generativeai as genai
    from PIL import Image
    import fitz  # PyMuPDF
except ImportError as e:
    print(f"Erro: Biblioteca nao encontrada - {e}")
    print("Instale as dependencias: pip install python-dotenv google-generativeai Pillow PyMuPDF")
    sys.exit(1)

# Carrega variaveis de ambiente
load_dotenv(ROOT_DIR / '.env')

# Configuracao de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constantes
GEMINI_MODEL = "gemini-3-flash-preview"  # Upgrade para Gemini 3 Flash
PROMPTS_DIR = ROOT_DIR / 'execution' / 'prompts'
TMP_DIR = ROOT_DIR / '.tmp'
RATE_LIMIT_DELAY = 4  # Segundos entre requisicoes (15 RPM = 4s)
MAX_RETRIES = 3
SAVE_PROGRESS_INTERVAL = 5
SUPPORTED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
SUPPORTED_PDF_EXTENSION = '.pdf'


# =============================================================================
# CLASSES DE ERRO
# =============================================================================

class GeminiExtractionError(Exception):
    """Erro durante extracao com Gemini."""
    pass


class PromptNotFoundError(GeminiExtractionError):
    """Prompt nao encontrado para o tipo de documento."""
    pass


class FileLoadError(GeminiExtractionError):
    """Erro ao carregar arquivo."""
    pass


class ParseError(GeminiExtractionError):
    """Erro ao fazer parsing da resposta do Gemini."""
    pass


# =============================================================================
# FUNCOES DE CONFIGURACAO
# =============================================================================

def load_environment() -> str:
    """
    Carrega e valida a API key do Gemini.

    Returns:
        API key do Gemini

    Raises:
        ValueError: Se a API key nao estiver configurada
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY nao encontrada no ambiente.\n"
            "Configure no arquivo .env"
        )
    return api_key


def configure_gemini(api_key: str) -> genai.GenerativeModel:
    """
    Configura o cliente Gemini.

    Args:
        api_key: Chave da API

    Returns:
        Modelo Gemini configurado
    """
    genai.configure(api_key=api_key)

    # Tenta usar gemini-3-flash-preview, com fallbacks
    model_names = [GEMINI_MODEL, "gemini-2.5-flash", "gemini-2.0-flash-exp"]

    for model_name in model_names:
        try:
            model = genai.GenerativeModel(model_name)
            logger.info(f"Modelo configurado: {model_name}")
            return model
        except Exception as e:
            logger.warning(f"Modelo {model_name} nao disponivel: {e}")

    raise RuntimeError("Nenhum modelo Gemini disponivel")


# =============================================================================
# FUNCOES DE CARREGAMENTO DE PROMPTS
# =============================================================================

def load_prompt(tipo_documento: str) -> str:
    """
    Carrega prompt especifico para o tipo de documento.

    Args:
        tipo_documento: Tipo do documento (ex: MATRICULA_IMOVEL, RG)

    Returns:
        Texto do prompt

    Raises:
        PromptNotFoundError: Se prompt nao existir e generic tambem nao
    """
    # Normaliza o nome do arquivo
    prompt_name = tipo_documento.lower()
    prompt_file = PROMPTS_DIR / f"{prompt_name}.txt"

    if prompt_file.exists():
        content = prompt_file.read_text(encoding='utf-8')
        logger.debug(f"Prompt carregado: {prompt_file.name}")
        return content

    # Tenta carregar prompt generico
    generic_file = PROMPTS_DIR / "generic.txt"
    if generic_file.exists():
        content = generic_file.read_text(encoding='utf-8')
        logger.warning(f"Prompt especifico nao encontrado para {tipo_documento}, usando generic")
        return content

    raise PromptNotFoundError(
        f"Prompt nao encontrado: {prompt_file}\n"
        f"Crie o arquivo ou use o prompt generico."
    )


def list_available_prompts() -> List[str]:
    """
    Lista todos os prompts disponiveis.

    Returns:
        Lista de tipos de documento com prompts
    """
    if not PROMPTS_DIR.exists():
        return []

    prompts = []
    for file in PROMPTS_DIR.glob("*.txt"):
        tipo = file.stem.upper()
        if tipo != "GENERIC":
            prompts.append(tipo)

    return sorted(prompts)


# =============================================================================
# FUNCOES DE CARREGAMENTO DE ARQUIVOS
# =============================================================================

def extract_first_page_from_pdf(pdf_path: Path) -> Optional[Image.Image]:
    """
    Extrai a primeira pagina de um PDF como imagem.

    Args:
        pdf_path: Caminho para o arquivo PDF

    Returns:
        Imagem PIL da primeira pagina ou None
    """
    try:
        doc = fitz.open(str(pdf_path))
        if len(doc) == 0:
            logger.warning(f"PDF vazio: {pdf_path}")
            return None

        # Pega a primeira pagina
        page = doc[0]

        # Renderiza em alta resolucao (300 DPI)
        zoom = 2.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)

        # Converte para PIL Image
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        doc.close()
        return img

    except Exception as e:
        logger.error(f"Erro ao extrair pagina do PDF {pdf_path}: {e}")
        return None


def load_original_file(file_path: Path) -> Tuple[Optional[bytes], Optional[str]]:
    """
    Carrega arquivo original como bytes e detecta MIME type.

    Args:
        file_path: Caminho para o arquivo

    Returns:
        Tuple (bytes do arquivo, MIME type) ou (None, None) se falhar
    """
    if not file_path.exists():
        logger.error(f"Arquivo nao encontrado: {file_path}")
        return None, None

    ext = file_path.suffix.lower()

    # Mapeamento de extensao para MIME type
    mime_types = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp'
    }

    mime_type = mime_types.get(ext)
    if not mime_type:
        logger.warning(f"Extensao nao suportada: {ext}")
        return None, None

    try:
        # Para PDFs, converte para imagem primeiro
        if ext == '.pdf':
            img = extract_first_page_from_pdf(file_path)
            if img is None:
                return None, None

            # Converte imagem para bytes JPEG
            import io
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=95)
            return buffer.getvalue(), 'image/jpeg'

        # Para imagens, le diretamente
        with open(file_path, 'rb') as f:
            content = f.read()

        return content, mime_type

    except Exception as e:
        logger.error(f"Erro ao carregar arquivo {file_path}: {e}")
        return None, None


def load_ocr_text(ocr_path: str) -> Optional[str]:
    """
    Carrega texto OCR correspondente.

    Args:
        ocr_path: Caminho para o arquivo OCR

    Returns:
        Texto OCR ou None
    """
    try:
        path = Path(ocr_path)
        if not path.exists():
            logger.warning(f"Arquivo OCR nao encontrado: {ocr_path}")
            return None

        content = path.read_text(encoding='utf-8')

        # Remove cabecalho do OCR (linhas antes de ---)
        if '---' in content:
            content = content.split('---', 1)[1]

        return content.strip()

    except Exception as e:
        logger.error(f"Erro ao carregar OCR {ocr_path}: {e}")
        return None


# =============================================================================
# FUNCOES DE CHAMADA AO GEMINI
# =============================================================================

def call_gemini(
    model: genai.GenerativeModel,
    prompt: str,
    image_bytes: bytes,
    mime_type: str,
    ocr_text: Optional[str] = None
) -> str:
    """
    Chama Gemini com imagem + texto OCR.

    Args:
        model: Modelo Gemini configurado
        prompt: Prompt do tipo de documento
        image_bytes: Bytes da imagem
        mime_type: Tipo MIME da imagem
        ocr_text: Texto OCR (opcional, para referencia)

    Returns:
        Texto da resposta do Gemini
    """
    # Monta o prompt completo
    if ocr_text:
        full_prompt = f"{prompt}\n\n---\nTEXTO OCR (para referencia):\n{ocr_text[:4000]}"  # Limita OCR
    else:
        full_prompt = prompt

    # Prepara a imagem para o Gemini
    image_part = {
        "mime_type": mime_type,
        "data": base64.b64encode(image_bytes).decode('utf-8')
    }

    # Envia para o Gemini
    response = model.generate_content([
        {"inline_data": image_part},
        full_prompt
    ])

    return response.text


def call_gemini_with_retry(
    model: genai.GenerativeModel,
    prompt: str,
    image_bytes: bytes,
    mime_type: str,
    ocr_text: Optional[str] = None,
    max_retries: int = MAX_RETRIES
) -> str:
    """
    Chama Gemini com retry e backoff exponencial.

    Args:
        model: Modelo Gemini configurado
        prompt: Prompt do tipo de documento
        image_bytes: Bytes da imagem
        mime_type: Tipo MIME da imagem
        ocr_text: Texto OCR (opcional)
        max_retries: Numero maximo de tentativas

    Returns:
        Texto da resposta do Gemini

    Raises:
        GeminiExtractionError: Se todas as tentativas falharem
    """
    last_error = None

    for attempt in range(max_retries):
        try:
            return call_gemini(model, prompt, image_bytes, mime_type, ocr_text)

        except Exception as e:
            last_error = e
            wait_time = (2 ** attempt) * 2  # 2, 4, 8 segundos

            logger.warning(f"Tentativa {attempt + 1}/{max_retries} falhou: {e}")

            if attempt < max_retries - 1:
                logger.info(f"Aguardando {wait_time}s antes de retry...")
                time.sleep(wait_time)

    raise GeminiExtractionError(f"Falha apos {max_retries} tentativas: {last_error}")


# =============================================================================
# FUNCOES DE PARSING DA RESPOSTA
# =============================================================================

def parse_gemini_response(response: str) -> Dict[str, Any]:
    """
    Parseia resposta do Gemini em 3 partes.

    Args:
        response: Texto da resposta do Gemini

    Returns:
        Dicionario com reescrita, explicacao e dados_catalogados
    """
    result = {
        "reescrita": "",
        "explicacao": "",
        "dados_catalogados": {}
    }

    # Regex patterns para extrair secoes
    patterns = {
        "reescrita": r"##\s*REESCRITA\s+DO\s+DOCUMENTO\s*\n(.*?)(?=##\s*EXPLICA[CÇ][AÃ]O|$)",
        "explicacao": r"##\s*EXPLICA[CÇ][AÃ]O\s+CONTEXTUAL\s*\n(.*?)(?=##\s*DADOS|$)",
        "json": r"```json\s*\n(.*?)\n```"
    }

    # Extrai reescrita
    match = re.search(patterns["reescrita"], response, re.DOTALL | re.IGNORECASE)
    if match:
        result["reescrita"] = match.group(1).strip()

    # Extrai explicacao
    match = re.search(patterns["explicacao"], response, re.DOTALL | re.IGNORECASE)
    if match:
        result["explicacao"] = match.group(1).strip()

    # Extrai JSON
    match = re.search(patterns["json"], response, re.DOTALL)
    if match:
        try:
            json_str = match.group(1).strip()
            result["dados_catalogados"] = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.warning(f"Erro ao fazer parsing do JSON: {e}")
            # Tenta limpar e parsear novamente
            try:
                # Remove caracteres de controle
                json_str = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', json_str)
                result["dados_catalogados"] = json.loads(json_str)
            except json.JSONDecodeError:
                result["dados_catalogados"] = {"_raw_json": json_str, "_parse_error": str(e)}

    return result


# =============================================================================
# FUNCOES DE PROCESSAMENTO
# =============================================================================

def process_document(
    model: genai.GenerativeModel,
    doc_info: Dict[str, Any],
    escritura_id: str
) -> Dict[str, Any]:
    """
    Processa um documento completo com Gemini.

    Args:
        model: Modelo Gemini configurado
        doc_info: Informacoes do documento do catalogo
        escritura_id: ID da escritura

    Returns:
        Dicionario com resultado da extracao
    """
    start_time = time.time()

    result = {
        "tipo_documento": doc_info.get('tipo_documento', 'OUTRO'),
        "arquivo_origem": doc_info.get('nome', ''),
        "arquivo_ocr": doc_info.get('arquivo_ocr', ''),
        "data_processamento": datetime.now().isoformat(),
        "modelo": GEMINI_MODEL,
        "reescrita_interpretada": "",
        "explicacao_contextual": "",
        "dados_catalogados": {},
        "metadados": {
            "tokens_entrada": 0,
            "tokens_saida": 0,
            "tempo_processamento_s": 0
        },
        "status": "sucesso",
        "erro": None
    }

    try:
        # 1. Carrega o arquivo original
        file_path = Path(doc_info.get('caminho_absoluto', ''))
        image_bytes, mime_type = load_original_file(file_path)

        if image_bytes is None:
            raise FileLoadError(f"Nao foi possivel carregar: {file_path}")

        # 2. Carrega texto OCR (opcional)
        ocr_text = None
        if doc_info.get('arquivo_ocr'):
            ocr_text = load_ocr_text(doc_info['arquivo_ocr'])

        # 3. Carrega prompt especifico
        tipo = doc_info.get('tipo_documento', 'OUTRO')
        prompt = load_prompt(tipo)

        # 4. Chama Gemini
        response = call_gemini_with_retry(
            model=model,
            prompt=prompt,
            image_bytes=image_bytes,
            mime_type=mime_type,
            ocr_text=ocr_text
        )

        # 5. Parseia resposta
        parsed = parse_gemini_response(response)

        result["reescrita_interpretada"] = parsed["reescrita"]
        result["explicacao_contextual"] = parsed["explicacao"]
        result["dados_catalogados"] = parsed["dados_catalogados"]

        # Estima tokens (aproximacao)
        result["metadados"]["tokens_entrada"] = len(prompt.split()) + (len(ocr_text.split()) if ocr_text else 0)
        result["metadados"]["tokens_saida"] = len(response.split())

    except PromptNotFoundError as e:
        result["status"] = "erro"
        result["erro"] = f"Prompt nao encontrado: {e}"
        logger.error(f"Prompt nao encontrado para {doc_info.get('nome')}: {e}")

    except FileLoadError as e:
        result["status"] = "erro"
        result["erro"] = f"Erro ao carregar arquivo: {e}"
        logger.error(f"Erro ao carregar {doc_info.get('nome')}: {e}")

    except GeminiExtractionError as e:
        result["status"] = "erro"
        result["erro"] = f"Erro na extracao Gemini: {e}"
        logger.error(f"Erro Gemini para {doc_info.get('nome')}: {e}")

    except Exception as e:
        result["status"] = "erro"
        result["erro"] = f"Erro inesperado: {e}"
        logger.exception(f"Erro inesperado ao processar {doc_info.get('nome')}")

    finally:
        result["metadados"]["tempo_processamento_s"] = round(time.time() - start_time, 2)

    return result


def load_catalog(escritura_id: str) -> Dict[str, Any]:
    """
    Carrega o catalogo de uma escritura.

    Args:
        escritura_id: ID da escritura

    Returns:
        Dados do catalogo

    Raises:
        FileNotFoundError: Se catalogo nao existir
    """
    catalog_path = TMP_DIR / 'catalogos' / f'{escritura_id}.json'

    if not catalog_path.exists():
        raise FileNotFoundError(f"Catalogo nao encontrado: {catalog_path}")

    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    logger.info(f"Catalogo carregado: {len(catalog.get('arquivos', []))} arquivos")
    return catalog


def run_extraction(
    escritura_id: str,
    limit: Optional[int] = None,
    tipo_filtro: Optional[str] = None,
    verbose: bool = False
) -> Dict[str, Any]:
    """
    Executa extracao contextual para toda a escritura.

    Args:
        escritura_id: ID da escritura
        limit: Limite de arquivos a processar
        tipo_filtro: Filtrar por tipo de documento
        verbose: Modo verbose

    Returns:
        Estatisticas e resultados da extracao
    """
    start_time = datetime.now()

    # Configura Gemini
    api_key = load_environment()
    model = configure_gemini(api_key)

    # Carrega catalogo
    catalog = load_catalog(escritura_id)

    # Filtra arquivos
    arquivos = catalog.get('arquivos', [])

    # Filtra apenas arquivos com OCR processado
    arquivos = [a for a in arquivos if a.get('status_ocr') == 'processado']

    # Filtra por tipo se especificado
    if tipo_filtro:
        tipo_upper = tipo_filtro.upper()
        arquivos = [a for a in arquivos if a.get('tipo_documento') == tipo_upper]

    # Aplica limite
    if limit:
        arquivos = arquivos[:limit]

    total = len(arquivos)

    if total == 0:
        logger.warning("Nenhum arquivo para processar")
        return {
            'escritura_id': escritura_id,
            'data_extracao': start_time.isoformat(),
            'total_arquivos': 0,
            'extraidos_sucesso': 0,
            'extraidos_erro': 0,
            'extracoes': []
        }

    logger.info("=" * 60)
    logger.info("EXTRACAO CONTEXTUAL COM GEMINI")
    logger.info(f"  Escritura: {escritura_id}")
    logger.info(f"  Total de arquivos: {total}")
    logger.info(f"  Modelo: {GEMINI_MODEL}")
    if tipo_filtro:
        logger.info(f"  Filtro de tipo: {tipo_filtro}")
    logger.info(f"  Prompts disponiveis: {len(list_available_prompts())}")
    logger.info("=" * 60)

    # Diretorio de saida
    output_dir = TMP_DIR / 'contextual' / escritura_id
    output_dir.mkdir(parents=True, exist_ok=True)

    # Resultados
    extracoes = []
    sucesso = 0
    erro = 0

    for idx, arquivo in enumerate(arquivos, 1):
        nome = arquivo['nome']
        tipo = arquivo.get('tipo_documento', 'OUTRO')

        logger.info(f"[{idx}/{total}] Processando: {nome} ({tipo})")

        # Processa documento
        resultado = process_document(model, arquivo, escritura_id)

        # Adiciona metadados do catalogo
        resultado['id'] = arquivo['id']
        resultado['nome_arquivo'] = nome
        resultado['pessoa_relacionada'] = arquivo.get('pessoa_relacionada')
        resultado['papel_inferido'] = arquivo.get('papel_inferido')

        # Atualiza contadores
        if resultado['status'] == 'sucesso':
            sucesso += 1
            if verbose:
                logger.info(f"    Campos extraidos: {len(resultado.get('dados_catalogados', {}))}")
                logger.info(f"    Tempo: {resultado['metadados']['tempo_processamento_s']}s")
        else:
            erro += 1
            logger.warning(f"    Erro: {resultado.get('erro', 'desconhecido')}")

        extracoes.append(resultado)

        # Salva resultado individual
        output_file = output_dir / f"{arquivo['id']}_{tipo}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2)

        # Salva progresso
        if idx % SAVE_PROGRESS_INTERVAL == 0:
            logger.info(f"  Progresso: {idx}/{total} arquivos processados")

        # Rate limiting
        if idx < total:
            logger.debug(f"Rate limiting: aguardando {RATE_LIMIT_DELAY}s...")
            time.sleep(RATE_LIMIT_DELAY)

    # Calcula estatisticas
    tempos = [e['metadados']['tempo_processamento_s'] for e in extracoes]
    tempo_medio = sum(tempos) / len(tempos) if tempos else 0

    # Resultado final
    resultado_final = {
        'escritura_id': escritura_id,
        'data_extracao': start_time.isoformat(),
        'data_conclusao': datetime.now().isoformat(),
        'tempo_processamento_total': (datetime.now() - start_time).total_seconds(),
        'tempo_medio_por_documento': round(tempo_medio, 2),
        'modelo': GEMINI_MODEL,
        'total_arquivos': total,
        'extraidos_sucesso': sucesso,
        'extraidos_erro': erro,
        'taxa_sucesso': round(sucesso / total * 100, 1) if total > 0 else 0,
        'extracoes': extracoes
    }

    # Salva relatorio completo
    report_path = output_dir / 'relatorio_contextual.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(resultado_final, f, ensure_ascii=False, indent=2)

    # Resumo final
    logger.info("=" * 60)
    logger.info("EXTRACAO CONTEXTUAL CONCLUIDA")
    logger.info(f"  Escritura: {escritura_id}")
    logger.info(f"  Total processados: {total}")
    logger.info(f"  Sucesso: {sucesso}")
    logger.info(f"  Erros: {erro}")
    logger.info(f"  Taxa de sucesso: {resultado_final['taxa_sucesso']}%")
    logger.info(f"  Tempo total: {resultado_final['tempo_processamento_total']:.2f}s")
    logger.info(f"  Tempo medio/doc: {tempo_medio:.2f}s")
    logger.info(f"  Saida: {output_dir}")
    logger.info("=" * 60)

    return resultado_final


def main():
    """Funcao principal - entry point do script"""
    parser = argparse.ArgumentParser(
        description='Extracao contextual de documentos com Gemini 2.0 Flash',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python extract_with_gemini.py FC_515_124_p280509
  python extract_with_gemini.py FC_515_124_p280509 --type MATRICULA_IMOVEL
  python extract_with_gemini.py FC_515_124_p280509 --limit 5
  python extract_with_gemini.py FC_515_124_p280509 --verbose

O script usa a visao do Gemini para interpretar documentos de cartorio,
gerando reescrita organizada, explicacao contextual e dados estruturados.

Prompts disponiveis em: execution/prompts/
        """
    )

    parser.add_argument(
        'escritura_id',
        nargs='?',
        default=None,
        help='ID da escritura (ex: FC_515_124_p280509)'
    )

    parser.add_argument(
        '--limit', '-l',
        type=int,
        help='Limita o numero de arquivos processados'
    )

    parser.add_argument(
        '--type', '-t',
        type=str,
        dest='tipo',
        help='Filtra por tipo de documento (ex: MATRICULA_IMOVEL, RG, CNDT)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Modo verbose: mostra mais detalhes'
    )

    parser.add_argument(
        '--list-prompts',
        action='store_true',
        help='Lista prompts disponiveis e sai'
    )

    args = parser.parse_args()

    # Configura nivel de log
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Lista prompts se solicitado
    if args.list_prompts:
        print("\nPrompts disponiveis:")
        print("-" * 40)
        for prompt in list_available_prompts():
            print(f"  - {prompt}")
        print("-" * 40)
        print(f"Total: {len(list_available_prompts())}")
        print(f"Diretorio: {PROMPTS_DIR}")
        sys.exit(0)

    # Valida que escritura_id foi fornecido
    if not args.escritura_id:
        parser.error("escritura_id e obrigatorio (ex: FC_515_124_p280509)")

    try:
        result = run_extraction(
            escritura_id=args.escritura_id,
            limit=args.limit,
            tipo_filtro=args.tipo,
            verbose=args.verbose
        )

        # Retorna codigo de saida baseado em erros
        if result['extraidos_erro'] > result['extraidos_sucesso']:
            sys.exit(2)  # Mais erros que sucesso
        sys.exit(0)

    except FileNotFoundError as e:
        logger.error(f"Arquivo nao encontrado: {e}")
        sys.exit(1)
    except ValueError as e:
        logger.error(f"Erro de configuracao: {e}")
        sys.exit(1)
    except Exception as e:
        logger.exception(f"Erro fatal: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
