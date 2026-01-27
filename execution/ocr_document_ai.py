#!/usr/bin/env python3
"""
OCR Document AI - Extrai texto de documentos usando Google Document AI.

Este script processa um documento unico (PDF, JPG, JPEG, PNG) e extrai
o texto usando o Google Document AI OCR processor.

Uso:
    python ocr_document_ai.py "path/to/document.pdf"
    python ocr_document_ai.py "path/to/document.pdf" --output "path/to/output.txt"
    python ocr_document_ai.py "path/to/document.pdf" --verbose

Autor: Claude AI
Data: 2026-01-27
Versao: 1.0
"""

import os
import sys
import argparse
import logging
import time
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

# Adiciona o diretorio raiz ao path para imports
script_dir = Path(__file__).resolve().parent
project_root = script_dir.parent
sys.path.insert(0, str(project_root))

# Carrega variaveis de ambiente do .env
from dotenv import load_dotenv
load_dotenv(project_root / '.env')

# Google Document AI
from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions
from google.api_core import exceptions as google_exceptions

# Configuracao de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constantes
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
SUPPORTED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}
DOCX_EXTENSIONS = {'.docx', '.doc'}
MIME_TYPES = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
}
DEFAULT_OUTPUT_DIR = project_root / '.tmp' / 'ocr'
DOCX_CONVERSION_DIR = project_root / '.tmp' / 'docx_conversions'
RETRY_DELAY_SECONDS = 5
MAX_RETRIES = 1


class DocumentAIError(Exception):
    """Excecao customizada para erros do Document AI."""
    pass


class ConfigurationError(DocumentAIError):
    """Erro de configuracao (credenciais, variaveis de ambiente, etc)."""
    pass


class FileValidationError(DocumentAIError):
    """Erro de validacao de arquivo (nao existe, muito grande, etc)."""
    pass


class ProcessingError(DocumentAIError):
    """Erro durante o processamento do documento."""
    pass


class DocxConversionError(DocumentAIError):
    """Erro na conversao de DOCX para PDF."""
    pass


def convert_docx_to_pdf(docx_path: Path) -> Optional[Path]:
    """
    Converte arquivo DOCX/DOC para PDF temporario usando docx2pdf.

    Esta funcao usa a biblioteca docx2pdf que, no Windows, utiliza
    o Microsoft Word via COM automation para conversao de alta fidelidade.

    Args:
        docx_path: Caminho para arquivo DOCX/DOC

    Returns:
        Caminho do PDF temporario ou None se falhar

    Raises:
        DocxConversionError: Se a conversao falhar
    """
    try:
        # Tenta importar docx2pdf
        try:
            from docx2pdf import convert
        except ImportError:
            raise DocxConversionError(
                "Biblioteca docx2pdf nao instalada.\n"
                "Instale com: pip install docx2pdf"
            )

        # Cria diretorio temporario para conversoes
        DOCX_CONVERSION_DIR.mkdir(parents=True, exist_ok=True)

        # Nome do PDF temporario (usa timestamp para evitar colisoes)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        pdf_name = f"{docx_path.stem}_{timestamp}.pdf"
        pdf_path = DOCX_CONVERSION_DIR / pdf_name

        logger.info(f"Convertendo DOCX para PDF: {docx_path.name}")
        logger.debug(f"  Origem: {docx_path}")
        logger.debug(f"  Destino: {pdf_path}")

        # Converte usando docx2pdf
        convert(str(docx_path), str(pdf_path))

        # Verifica se PDF foi criado com sucesso
        if not pdf_path.exists():
            raise DocxConversionError(
                f"PDF nao foi criado apos conversao: {pdf_path}"
            )

        if pdf_path.stat().st_size == 0:
            raise DocxConversionError(
                f"PDF criado esta vazio: {pdf_path}"
            )

        file_size_kb = pdf_path.stat().st_size / 1024
        logger.info(f"DOCX convertido com sucesso: {pdf_name} ({file_size_kb:.1f} KB)")
        return pdf_path

    except DocxConversionError:
        raise  # Re-raise erros de conversao especificos

    except Exception as e:
        error_msg = str(e)
        # Mensagens mais amigaveis para erros comuns
        if "Word" in error_msg or "COM" in error_msg:
            raise DocxConversionError(
                f"Erro ao usar Microsoft Word para conversao: {e}\n"
                f"Verifique se o Microsoft Word esta instalado."
            )
        raise DocxConversionError(f"Erro inesperado ao converter DOCX: {e}")


def cleanup_temp_pdf(pdf_path: Path) -> bool:
    """
    Remove PDF temporario apos processamento.

    Args:
        pdf_path: Caminho do PDF temporario a remover

    Returns:
        True se removido com sucesso, False caso contrario
    """
    try:
        if pdf_path and pdf_path.exists():
            pdf_path.unlink()
            logger.debug(f"PDF temporario removido: {pdf_path.name}")
            return True
        return False
    except Exception as e:
        logger.warning(f"Nao foi possivel remover PDF temporario: {pdf_path} - {e}")
        return False


def get_config() -> Dict[str, str]:
    """
    Carrega e valida as configuracoes necessarias do ambiente.

    Returns:
        Dict com configuracoes: project_id, location, processor_id, credentials_path

    Raises:
        ConfigurationError: Se alguma configuracao estiver faltando
    """
    config = {
        'project_id': os.getenv('GOOGLE_PROJECT_ID'),
        'location': os.getenv('DOCUMENT_AI_LOCATION', 'us'),
        'processor_id': os.getenv('DOCUMENT_AI_PROCESSOR_ID'),
        'credentials_path': os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    }

    missing = [k for k, v in config.items() if not v]
    if missing:
        raise ConfigurationError(
            f"Variaveis de ambiente faltando: {', '.join(missing)}\n"
            f"Verifique o arquivo .env"
        )

    # Valida que o arquivo de credenciais existe
    creds_path = project_root / config['credentials_path']
    if not creds_path.exists():
        raise ConfigurationError(
            f"Arquivo de credenciais nao encontrado: {creds_path}\n"
            f"Verifique GOOGLE_APPLICATION_CREDENTIALS no .env"
        )

    # Define o caminho absoluto das credenciais
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = str(creds_path)
    config['credentials_path'] = str(creds_path)

    return config


def setup_document_ai_client() -> Tuple[documentai.DocumentProcessorServiceClient, str]:
    """
    Configura e retorna o cliente Document AI.

    Returns:
        Tuple contendo:
        - Cliente Document AI configurado
        - Nome completo do processador

    Raises:
        ConfigurationError: Se nao conseguir configurar o cliente
    """
    config = get_config()

    # Endpoint especifico para a regiao
    endpoint = f"{config['location']}-documentai.googleapis.com"
    client_options = ClientOptions(api_endpoint=endpoint)

    try:
        client = documentai.DocumentProcessorServiceClient(
            client_options=client_options
        )

        # Monta o nome completo do processador
        processor_name = client.processor_path(
            config['project_id'],
            config['location'],
            config['processor_id']
        )

        logger.info(f"Cliente Document AI configurado com sucesso")
        logger.debug(f"Processador: {processor_name}")

        return client, processor_name

    except Exception as e:
        raise ConfigurationError(
            f"Erro ao configurar cliente Document AI: {e}\n"
            f"Verifique as credenciais em: {config['credentials_path']}"
        )


def validate_file(file_path: Path) -> Tuple[Path, str]:
    """
    Valida o arquivo de entrada.

    Args:
        file_path: Caminho do arquivo a validar

    Returns:
        Tuple contendo:
        - Path absoluto do arquivo
        - MIME type do arquivo

    Raises:
        FileValidationError: Se o arquivo nao for valido
    """
    path = Path(file_path).resolve()

    # Verifica se existe
    if not path.exists():
        raise FileValidationError(f"Arquivo nao encontrado: {path}")

    if not path.is_file():
        raise FileValidationError(f"Caminho nao e um arquivo: {path}")

    # Verifica extensao
    ext = path.suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise FileValidationError(
            f"Extensao nao suportada: {ext}\n"
            f"Extensoes validas: {', '.join(SUPPORTED_EXTENSIONS)}"
        )

    # Verifica tamanho
    file_size = path.stat().st_size
    if file_size > MAX_FILE_SIZE_BYTES:
        size_mb = file_size / (1024 * 1024)
        raise FileValidationError(
            f"Arquivo muito grande: {size_mb:.2f} MB\n"
            f"Tamanho maximo: {MAX_FILE_SIZE_MB} MB"
        )

    if file_size == 0:
        raise FileValidationError(f"Arquivo vazio: {path}")

    mime_type = MIME_TYPES[ext]
    logger.debug(f"Arquivo validado: {path.name} ({file_size/1024:.1f} KB, {mime_type})")

    return path, mime_type


def process_document(
    client: documentai.DocumentProcessorServiceClient,
    processor_name: str,
    file_path: Path,
    mime_type: str
) -> documentai.Document:
    """
    Envia documento para o Document AI e retorna o resultado.

    Args:
        client: Cliente Document AI
        processor_name: Nome completo do processador
        file_path: Caminho do arquivo
        mime_type: Tipo MIME do arquivo

    Returns:
        Documento processado pelo Document AI

    Raises:
        ProcessingError: Se houver erro no processamento
    """
    # Le o arquivo
    with open(file_path, 'rb') as f:
        content = f.read()

    # Cria o documento raw
    raw_document = documentai.RawDocument(
        content=content,
        mime_type=mime_type
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
            logger.info(f"Enviando para Document AI... (tentativa {attempt + 1})")
            result = client.process_document(request=request)
            logger.info("Processamento concluido com sucesso")
            return result.document

        except google_exceptions.DeadlineExceeded as e:
            last_error = e
            if attempt < MAX_RETRIES:
                logger.warning(f"Timeout. Aguardando {RETRY_DELAY_SECONDS}s para retry...")
                time.sleep(RETRY_DELAY_SECONDS)
            continue

        except google_exceptions.ResourceExhausted as e:
            raise ProcessingError(
                f"Quota excedida no Document AI: {e}\n"
                f"Aguarde alguns minutos e tente novamente."
            )

        except google_exceptions.InvalidArgument as e:
            raise ProcessingError(
                f"Argumento invalido: {e}\n"
                f"Verifique se o arquivo e um documento valido."
            )

        except Exception as e:
            raise ProcessingError(f"Erro ao processar documento: {e}")

    # Se chegou aqui, todas as tentativas falharam
    raise ProcessingError(
        f"Timeout apos {MAX_RETRIES + 1} tentativas: {last_error}"
    )


def extract_text_and_metadata(
    document: documentai.Document,
    file_path: Path
) -> Dict[str, Any]:
    """
    Extrai texto e metadados do documento processado.

    Args:
        document: Documento retornado pelo Document AI
        file_path: Caminho do arquivo original

    Returns:
        Dicionario com:
        - success: bool
        - text: str (texto extraido)
        - confidence: float (confianca media)
        - pages: int (numero de paginas)
        - file_name: str
        - file_type: str
        - error: str ou None
    """
    result = {
        'success': True,
        'text': '',
        'confidence': 0.0,
        'pages': 0,
        'file_name': file_path.name,
        'file_type': file_path.suffix.upper().lstrip('.'),
        'error': None,
        'processing_date': datetime.now().isoformat()
    }

    # Extrai texto
    text = document.text if document.text else ''
    result['text'] = text.strip()

    # Conta paginas
    result['pages'] = len(document.pages) if document.pages else 1

    # Calcula confianca media
    if document.pages:
        confidences = []
        for page in document.pages:
            if page.blocks:
                for block in page.blocks:
                    if block.layout and block.layout.confidence:
                        confidences.append(block.layout.confidence)

        if confidences:
            result['confidence'] = sum(confidences) / len(confidences)

    # Verifica se extraiu algo
    if not result['text']:
        result['text'] = '[TEXTO NAO DETECTADO]'
        result['success'] = False
        logger.warning("Nenhum texto detectado no documento")
    else:
        char_count = len(result['text'])
        word_count = len(result['text'].split())
        logger.info(f"Texto extraido: {char_count} caracteres, ~{word_count} palavras")

    return result


def get_output_path(
    file_path: Path,
    output_path: Optional[str] = None,
    escritura_id: Optional[str] = None
) -> Path:
    """
    Determina o caminho de saida para o arquivo OCR.

    Args:
        file_path: Caminho do arquivo original
        output_path: Caminho customizado (opcional)
        escritura_id: ID da escritura para organizar em pasta (opcional)

    Returns:
        Path completo para o arquivo de saida
    """
    if output_path:
        return Path(output_path).resolve()

    # Usa estrutura padrao: .tmp/ocr/{escritura_id}/{nome_arquivo}.txt
    if escritura_id:
        output_dir = DEFAULT_OUTPUT_DIR / escritura_id
    else:
        output_dir = DEFAULT_OUTPUT_DIR / 'single'

    output_name = file_path.stem + '.txt'
    return output_dir / output_name


def save_ocr_result(
    text: str,
    metadata: Dict[str, Any],
    output_path: Path
) -> Path:
    """
    Salva o resultado do OCR em arquivo de texto com cabecalho de metadados.

    Args:
        text: Texto extraido
        metadata: Dicionario com metadados
        output_path: Caminho do arquivo de saida

    Returns:
        Path do arquivo salvo
    """
    # Cria diretorio se necessario
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Formata confianca
    confidence_str = f"{metadata.get('confidence', 0):.2f}"

    # Monta conteudo com cabecalho
    header = f"""DOCUMENTO: {metadata.get('file_name', 'desconhecido')}
TIPO: {metadata.get('file_type', 'desconhecido')}
PAGINAS: {metadata.get('pages', 0)}
CONFIANCA: {confidence_str}
DATA_PROCESSAMENTO: {metadata.get('processing_date', datetime.now().isoformat())}
---
"""

    content = header + text

    # Salva arquivo
    output_path.write_text(content, encoding='utf-8')
    logger.info(f"Resultado salvo em: {output_path}")

    return output_path


def ocr_single_document(
    file_path: str,
    output_path: Optional[str] = None,
    escritura_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Funcao principal: processa um documento e extrai texto via Document AI.

    Suporta arquivos PDF, JPG, JPEG, PNG diretamente.
    Arquivos DOCX/DOC sao automaticamente convertidos para PDF antes do OCR.

    Args:
        file_path: Caminho para o arquivo (PDF, JPG, JPEG, PNG, DOCX, DOC)
        output_path: Caminho customizado para saida (opcional)
        escritura_id: ID da escritura para organizar em pasta (opcional)

    Returns:
        Dicionario com:
        - success: bool
        - text: str (texto extraido)
        - confidence: float (confianca media, 0-1)
        - pages: int (numero de paginas)
        - output_path: str (caminho do arquivo salvo)
        - error: str ou None
        - original_format: str (formato original, ex: 'DOCX' se convertido)

    Raises:
        ConfigurationError: Erro de configuracao
        FileValidationError: Arquivo invalido
        ProcessingError: Erro no processamento
        DocxConversionError: Erro na conversao DOCX
    """
    result = {
        'success': False,
        'text': '',
        'confidence': 0.0,
        'pages': 0,
        'output_path': None,
        'error': None,
        'original_format': None
    }

    original_path = Path(file_path)
    temp_pdf_path = None  # Para rastrear PDF temporario de conversao

    try:
        # 0. Verifica se arquivo existe antes de qualquer processamento
        if not original_path.exists():
            raise FileValidationError(f"Arquivo nao encontrado: {original_path}")

        # 1. Detecta se e DOCX/DOC e converte para PDF
        original_ext = original_path.suffix.lower()
        if original_ext in DOCX_EXTENSIONS:
            logger.info(f"Arquivo DOCX detectado: {original_path.name}")
            result['original_format'] = original_ext.upper().lstrip('.')

            # Converte para PDF temporario
            temp_pdf_path = convert_docx_to_pdf(original_path)
            if temp_pdf_path is None:
                raise DocxConversionError(
                    f"Falha na conversao DOCX -> PDF: {original_path.name}"
                )

            # Usa o PDF temporario para processamento
            processing_path = temp_pdf_path
            logger.info(f"Usando PDF convertido para OCR: {temp_pdf_path.name}")
        else:
            processing_path = original_path
            result['original_format'] = original_ext.upper().lstrip('.')

        # 2. Valida arquivo (PDF ou imagem)
        logger.info(f"Processando: {processing_path}")
        validated_path, mime_type = validate_file(processing_path)

        # 3. Configura cliente
        client, processor_name = setup_document_ai_client()

        # 4. Processa documento
        document = process_document(client, processor_name, validated_path, mime_type)

        # 5. Extrai texto e metadados
        # Usa o path original para metadados (nao o PDF temporario)
        extraction_result = extract_text_and_metadata(document, original_path)

        # 6. Determina caminho de saida (baseado no arquivo original)
        out_path = get_output_path(original_path, output_path, escritura_id)

        # 7. Salva resultado
        saved_path = save_ocr_result(
            extraction_result['text'],
            extraction_result,
            out_path
        )

        # 8. Monta resultado final
        result.update({
            'success': extraction_result['success'],
            'text': extraction_result['text'],
            'confidence': extraction_result['confidence'],
            'pages': extraction_result['pages'],
            'output_path': str(saved_path),
            'file_name': extraction_result['file_name'],
            'file_type': extraction_result['file_type']
        })

        return result

    except DocxConversionError as e:
        result['error'] = str(e)
        logger.error(f"Erro na conversao DOCX: {e}")
        return result

    except (ConfigurationError, FileValidationError, ProcessingError) as e:
        result['error'] = str(e)
        logger.error(f"Erro: {e}")
        return result

    except Exception as e:
        result['error'] = f"Erro inesperado: {e}"
        logger.exception("Erro inesperado durante processamento")
        return result

    finally:
        # Limpa PDF temporario se foi criado
        if temp_pdf_path:
            cleanup_temp_pdf(temp_pdf_path)


def main():
    """Funcao principal - CLI."""
    parser = argparse.ArgumentParser(
        description='Extrai texto de documentos usando Google Document AI.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  python ocr_document_ai.py "documento.pdf"
  python ocr_document_ai.py "foto.jpg" --output "resultado.txt"
  python ocr_document_ai.py "certidao.pdf" --escritura FC_515_124 --verbose
  python ocr_document_ai.py "minuta.docx" --escritura FC_515_124

Formatos suportados:
  PDF, JPG, JPEG, PNG (maximo 10MB)
  DOCX, DOC (convertidos automaticamente para PDF antes do OCR)

Estrutura de saida padrao:
  .tmp/ocr/{escritura_id}/{nome_arquivo}.txt
        """
    )

    parser.add_argument(
        'file_path',
        help='Caminho para o documento a ser processado'
    )

    parser.add_argument(
        '--output', '-o',
        help='Caminho customizado para o arquivo de saida'
    )

    parser.add_argument(
        '--escritura', '-e',
        help='ID da escritura (para organizar em subpasta)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Mostra informacoes detalhadas de debug'
    )

    args = parser.parse_args()

    # Configura nivel de log
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("Modo verbose ativado")

    # Processa documento
    result = ocr_single_document(
        file_path=args.file_path,
        output_path=args.output,
        escritura_id=args.escritura
    )

    # Exibe resultado
    print("\n" + "="*60)
    if result['success']:
        print("PROCESSAMENTO CONCLUIDO COM SUCESSO")
        print("="*60)
        print(f"Arquivo:    {result.get('file_name', 'N/A')}")
        print(f"Tipo:       {result.get('file_type', 'N/A')}")
        print(f"Paginas:    {result['pages']}")
        print(f"Confianca:  {result['confidence']:.2%}")
        print(f"Caracteres: {len(result['text'])}")
        print(f"Saida:      {result['output_path']}")
        print("="*60)

        # Preview do texto
        preview_len = 500
        text_preview = result['text'][:preview_len]
        if len(result['text']) > preview_len:
            text_preview += "..."
        print("\nPreview do texto extraido:")
        print("-"*60)
        print(text_preview)
        print("-"*60)

        sys.exit(0)
    else:
        print("ERRO NO PROCESSAMENTO")
        print("="*60)
        print(f"Erro: {result['error']}")
        print("="*60)
        sys.exit(1)


if __name__ == '__main__':
    main()
