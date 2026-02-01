#!/usr/bin/env python3
"""
test_extractor.py - Mini Agente de Teste para Extracao de Documentos

Agente simplificado e agnostico de tipo de documento para testar prompts
de extracao com o Gemini. Suporta processamento de multiplos arquivos
em paralelo quando necessario.

Uso:
    # Processar um arquivo especifico
    python test_extractor.py --type escritura --file "Test-Docs/Documentos-isolados-tipo/Escrituras/281773-VersaoImpressao.pdf"

    # Processar todos os arquivos de uma pasta
    python test_extractor.py --type escritura --folder "Test-Docs/Documentos-isolados-tipo/Escrituras"

    # Processar em paralelo
    python test_extractor.py --type escritura --folder "Test-Docs/Documentos-isolados-tipo/Escrituras" --parallel

    # Listar tipos de documento disponiveis
    python test_extractor.py --list-types

Autor: Pipeline de Minutas
Data: Janeiro 2026
"""

import argparse
import json
import logging
import os
import sys
import time
import io
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple

# Adiciona o diretorio raiz ao path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Bibliotecas externas
try:
    from dotenv import load_dotenv
    from google import genai
    from google.genai import types
    from PIL import Image
    import fitz  # PyMuPDF
except ImportError as e:
    print(f"Erro: Biblioteca nao encontrada - {e}")
    print("Instale as dependencias: pip install python-dotenv google-genai Pillow PyMuPDF")
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
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")
GEMINI_MODEL_FALLBACK = os.getenv("GEMINI_MODEL_FALLBACK", "gemini-2.5-flash")
PROMPTS_DIR = ROOT_DIR / 'execution' / 'prompts'
TMP_DIR = ROOT_DIR / '.tmp'
OUTPUT_BASE_DIR = TMP_DIR / 'documentos-isolados-tipo-output'
TEST_DOCS_DIR = ROOT_DIR / 'Test-Docs' / 'Documentos-isolados-tipo'

# Rate limiting
DEFAULT_RPM = 15
RATE_LIMIT_DELAY = 60.0 / DEFAULT_RPM  # ~4 segundos entre requisicoes

# Extensoes suportadas
SUPPORTED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}


# =============================================================================
# FUNCOES DE CONFIGURACAO
# =============================================================================

def get_gemini_client() -> genai.Client:
    """Configura e retorna o cliente Gemini."""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY nao encontrada no .env")

    client = genai.Client(api_key=api_key)
    logger.info(f"Cliente Gemini configurado - Modelo: {GEMINI_MODEL}")
    return client


def list_available_types() -> List[str]:
    """
    Lista todos os tipos de documento com prompts disponiveis.

    Usa o modulo prompt_loader para detectar automaticamente
    todas as versoes disponiveis.
    """
    try:
        from execution.prompt_loader import list_available_prompts
        return list_available_prompts(PROMPTS_DIR)
    except ImportError:
        # Fallback se prompt_loader nao estiver disponivel
        if not PROMPTS_DIR.exists():
            return []

        types_list = []
        for file in PROMPTS_DIR.glob("*.txt"):
            tipo = file.stem.lower()
            if tipo not in ['generic', 'desconhecido'] and not tipo.endswith('_compact'):
                types_list.append(tipo.upper())

        return sorted(types_list)


def load_prompt(tipo_documento: str) -> str:
    """
    Carrega o prompt para o tipo de documento especificado.

    Detecta automaticamente a versao mais recente disponivel.
    Por exemplo, se existirem rg.txt e rg_v2.txt, carrega rg_v2.txt.
    """
    try:
        from execution.prompt_loader import load_prompt as loader_load_prompt
        return loader_load_prompt(tipo_documento, prompts_dir=PROMPTS_DIR)
    except ImportError:
        # Fallback se prompt_loader nao estiver disponivel
        prompt_file = PROMPTS_DIR / f"{tipo_documento.lower()}.txt"

        if not prompt_file.exists():
            generic_file = PROMPTS_DIR / "generic.txt"
            if generic_file.exists():
                logger.warning(f"Prompt '{tipo_documento}' nao encontrado, usando generic")
                return generic_file.read_text(encoding='utf-8')
            raise FileNotFoundError(f"Prompt nao encontrado: {prompt_file}")

        return prompt_file.read_text(encoding='utf-8')


# =============================================================================
# FUNCOES DE PROCESSAMENTO DE ARQUIVOS
# =============================================================================

def extract_all_pages_from_pdf(pdf_path: Path, max_pages: int = 50) -> Optional[Image.Image]:
    """
    Extrai todas as paginas de um PDF e concatena em uma unica imagem vertical.
    """
    try:
        doc = fitz.open(str(pdf_path))
        num_pages = len(doc)

        if num_pages == 0:
            logger.warning(f"PDF vazio: {pdf_path}")
            doc.close()
            return None

        pages_to_process = min(num_pages, max_pages)
        logger.info(f"Extraindo {pages_to_process} pagina(s) de: {pdf_path.name}")

        page_images: List[Image.Image] = []
        zoom = 2.0 if pages_to_process <= 10 else 1.5
        mat = fitz.Matrix(zoom, zoom)

        for page_num in range(pages_to_process):
            page = doc[page_num]
            pix = page.get_pixmap(matrix=mat)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            page_images.append(img)

        doc.close()

        if len(page_images) == 1:
            return page_images[0]

        # Concatena verticalmente
        total_width = max(img.width for img in page_images)
        margin = 5
        total_height = sum(img.height for img in page_images) + margin * (len(page_images) - 1)

        final_image = Image.new('RGB', (total_width, total_height), color=(255, 255, 255))

        y_offset = 0
        for img in page_images:
            x_offset = (total_width - img.width) // 2
            final_image.paste(img, (x_offset, y_offset))
            y_offset += img.height + margin

        # Limpa memoria
        for img in page_images:
            img.close()

        return final_image

    except Exception as e:
        logger.error(f"Erro ao extrair PDF {pdf_path}: {e}")
        return None


def load_file_as_bytes(file_path: Path) -> Tuple[Optional[bytes], Optional[str]]:
    """
    Carrega arquivo como bytes e retorna junto com o MIME type.
    """
    if not file_path.exists():
        logger.error(f"Arquivo nao encontrado: {file_path}")
        return None, None

    ext = file_path.suffix.lower()

    mime_types = {
        '.pdf': 'image/jpeg',  # PDF sera convertido para imagem
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
    }

    if ext not in mime_types:
        logger.warning(f"Extensao nao suportada: {ext}")
        return None, None

    try:
        # Para PDFs, converte para imagem
        if ext == '.pdf':
            img = extract_all_pages_from_pdf(file_path)
            if img is None:
                return None, None

            buffer = io.BytesIO()

            # Qualidade adaptativa
            total_pixels = img.width * img.height
            if total_pixels > 50_000_000:
                quality = 70
            elif total_pixels > 20_000_000:
                quality = 80
            else:
                quality = 95

            img.save(buffer, format='JPEG', quality=quality)
            image_bytes = buffer.getvalue()

            size_mb = len(image_bytes) / (1024 * 1024)
            logger.info(f"PDF convertido: {img.width}x{img.height} pixels, {size_mb:.2f}MB")

            img.close()
            return image_bytes, 'image/jpeg'

        # Para imagens, le diretamente
        with open(file_path, 'rb') as f:
            content = f.read()

        return content, mime_types[ext]

    except Exception as e:
        logger.error(f"Erro ao carregar arquivo {file_path}: {e}")
        return None, None


# =============================================================================
# FUNCOES DE CHAMADA AO GEMINI
# =============================================================================

def call_gemini(
    client: genai.Client,
    prompt: str,
    image_bytes: bytes,
    mime_type: str
) -> str:
    """Chama o Gemini com imagem e prompt."""
    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=mime_type
    )

    config = types.GenerateContentConfig(
        temperature=0.1,
        max_output_tokens=16384
    )

    model_names = [GEMINI_MODEL, GEMINI_MODEL_FALLBACK, "gemini-2.0-flash"]

    last_error = None
    for model_name in model_names:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=[image_part, prompt],
                config=config
            )

            if response is None or not response.text:
                logger.warning(f"Modelo {model_name} retornou resposta vazia")
                continue

            return response.text

        except Exception as e:
            last_error = e
            if "not found" in str(e).lower() or "unavailable" in str(e).lower():
                logger.warning(f"Modelo {model_name} indisponivel, tentando proximo...")
                continue
            raise

    raise RuntimeError(f"Nenhum modelo Gemini disponivel: {last_error}")


def call_gemini_with_retry(
    client: genai.Client,
    prompt: str,
    image_bytes: bytes,
    mime_type: str,
    max_retries: int = 3
) -> str:
    """Chama o Gemini com retry e backoff exponencial."""
    last_error = None

    for attempt in range(max_retries):
        try:
            return call_gemini(client, prompt, image_bytes, mime_type)
        except Exception as e:
            last_error = e
            wait_time = (2 ** attempt) * 2

            logger.warning(f"Tentativa {attempt + 1}/{max_retries} falhou: {e}")

            if attempt < max_retries - 1:
                logger.info(f"Aguardando {wait_time}s antes de retry...")
                time.sleep(wait_time)

    raise RuntimeError(f"Falha apos {max_retries} tentativas: {last_error}")


# =============================================================================
# FUNCOES DE PARSING
# =============================================================================

def parse_response(response: str) -> Dict[str, Any]:
    """Parseia a resposta do Gemini extraindo as secoes principais."""
    import re

    result = {
        "reescrita": "",
        "explicacao": "",
        "dados_catalogados": {},
        "resposta_completa": response
    }

    if not response:
        return result

    # Extrai reescrita
    match = re.search(
        r"##\s*REESCRITA\s+DO\s+DOCUMENTO\s*\n(.*?)(?=##\s*EXPLICA[CÇ][AÃ]O|$)",
        response, re.DOTALL | re.IGNORECASE
    )
    if match:
        result["reescrita"] = match.group(1).strip()

    # Extrai explicacao
    match = re.search(
        r"##\s*EXPLICA[CÇ][AÃ]O\s+CONTEXTUAL\s*\n(.*?)(?=##\s*DADOS|$)",
        response, re.DOTALL | re.IGNORECASE
    )
    if match:
        result["explicacao"] = match.group(1).strip()

    # Extrai JSON
    match = re.search(r"```json\s*\n(.*?)\n```", response, re.DOTALL)
    if match:
        try:
            json_str = match.group(1).strip()
            result["dados_catalogados"] = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.warning(f"Erro ao parsear JSON: {e}")
            try:
                json_str = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', json_str)
                result["dados_catalogados"] = json.loads(json_str)
            except json.JSONDecodeError:
                result["dados_catalogados"] = {"_raw_json": json_str, "_parse_error": str(e)}

    return result


# =============================================================================
# FUNCAO PRINCIPAL DE PROCESSAMENTO
# =============================================================================

def process_document(
    client: genai.Client,
    file_path: Path,
    tipo_documento: str,
    output_dir: Path
) -> Dict[str, Any]:
    """
    Processa um documento e salva o resultado.
    """
    start_time = time.time()

    result = {
        "arquivo": file_path.name,
        "caminho": str(file_path),
        "tipo_documento": tipo_documento,
        "data_processamento": datetime.now().isoformat(),
        "modelo": GEMINI_MODEL,
        "status": "sucesso",
        "erro": None,
        "reescrita": "",
        "explicacao": "",
        "dados_catalogados": {},
        "tempo_processamento_s": 0
    }

    try:
        # 1. Carrega o arquivo
        image_bytes, mime_type = load_file_as_bytes(file_path)
        if image_bytes is None:
            raise ValueError(f"Nao foi possivel carregar: {file_path}")

        # 2. Carrega o prompt
        prompt = load_prompt(tipo_documento)

        # 3. Chama o Gemini
        response = call_gemini_with_retry(client, prompt, image_bytes, mime_type)

        # 4. Parseia a resposta
        parsed = parse_response(response)

        result["reescrita"] = parsed["reescrita"]
        result["explicacao"] = parsed["explicacao"]
        result["dados_catalogados"] = parsed["dados_catalogados"]

        # 5. Salva resultado
        output_file = output_dir / f"{file_path.stem}_resultado.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        # Salva resposta completa separadamente
        raw_output = output_dir / f"{file_path.stem}_resposta_completa.txt"
        with open(raw_output, 'w', encoding='utf-8') as f:
            f.write(response)

        logger.info(f"Processado com sucesso: {file_path.name}")
        logger.info(f"  Output: {output_file}")

    except Exception as e:
        result["status"] = "erro"
        result["erro"] = str(e)
        logger.error(f"Erro ao processar {file_path.name}: {e}")

    finally:
        result["tempo_processamento_s"] = round(time.time() - start_time, 2)

    return result


def process_folder(
    tipo_documento: str,
    folder_path: Path,
    parallel: bool = False,
    workers: int = 3
) -> Dict[str, Any]:
    """
    Processa todos os arquivos de uma pasta.
    """
    start_time = datetime.now()

    # Configura cliente Gemini
    client = get_gemini_client()

    # Cria diretorio de output
    output_dir = OUTPUT_BASE_DIR / tipo_documento.lower()
    output_dir.mkdir(parents=True, exist_ok=True)

    # Lista arquivos
    files = [f for f in folder_path.iterdir()
             if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS]

    if not files:
        logger.warning(f"Nenhum arquivo suportado encontrado em: {folder_path}")
        return {"status": "erro", "erro": "Nenhum arquivo encontrado"}

    logger.info("=" * 60)
    logger.info(f"PROCESSAMENTO DE DOCUMENTOS - TIPO: {tipo_documento.upper()}")
    logger.info(f"  Pasta: {folder_path}")
    logger.info(f"  Arquivos: {len(files)}")
    logger.info(f"  Output: {output_dir}")
    logger.info(f"  Modo: {'paralelo' if parallel else 'serial'}")
    logger.info("=" * 60)

    results = []
    sucesso = 0
    erro = 0

    if parallel:
        # Processamento paralelo
        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_to_file = {
                executor.submit(
                    process_document, client, file, tipo_documento, output_dir
                ): file for file in files
            }

            for future in as_completed(future_to_file):
                file = future_to_file[future]
                try:
                    result = future.result()
                    results.append(result)

                    if result["status"] == "sucesso":
                        sucesso += 1
                    else:
                        erro += 1

                    # Rate limiting
                    time.sleep(RATE_LIMIT_DELAY)

                except Exception as e:
                    erro += 1
                    logger.error(f"Excecao ao processar {file.name}: {e}")
    else:
        # Processamento serial
        for idx, file in enumerate(files, 1):
            logger.info(f"[{idx}/{len(files)}] Processando: {file.name}")

            result = process_document(client, file, tipo_documento, output_dir)
            results.append(result)

            if result["status"] == "sucesso":
                sucesso += 1
            else:
                erro += 1

            # Rate limiting (exceto no ultimo)
            if idx < len(files):
                logger.debug(f"Rate limiting: aguardando {RATE_LIMIT_DELAY:.1f}s...")
                time.sleep(RATE_LIMIT_DELAY)

    # Relatorio final
    tempo_total = (datetime.now() - start_time).total_seconds()

    relatorio = {
        "tipo_documento": tipo_documento,
        "pasta_origem": str(folder_path),
        "pasta_output": str(output_dir),
        "data_processamento": start_time.isoformat(),
        "data_conclusao": datetime.now().isoformat(),
        "tempo_total_s": round(tempo_total, 2),
        "total_arquivos": len(files),
        "sucesso": sucesso,
        "erro": erro,
        "taxa_sucesso": round(sucesso / len(files) * 100, 1) if files else 0,
        "resultados": results
    }

    # Salva relatorio
    report_path = output_dir / "relatorio_processamento.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(relatorio, f, ensure_ascii=False, indent=2)

    # Resumo
    logger.info("=" * 60)
    logger.info("PROCESSAMENTO CONCLUIDO")
    logger.info(f"  Total: {len(files)}")
    logger.info(f"  Sucesso: {sucesso}")
    logger.info(f"  Erros: {erro}")
    logger.info(f"  Taxa de sucesso: {relatorio['taxa_sucesso']}%")
    logger.info(f"  Tempo total: {tempo_total:.2f}s")
    logger.info(f"  Relatorio: {report_path}")
    logger.info("=" * 60)

    return relatorio


def process_single_file(
    tipo_documento: str,
    file_path: Path
) -> Dict[str, Any]:
    """
    Processa um unico arquivo.
    """
    # Configura cliente Gemini
    client = get_gemini_client()

    # Cria diretorio de output
    output_dir = OUTPUT_BASE_DIR / tipo_documento.lower()
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info("=" * 60)
    logger.info(f"PROCESSAMENTO DE DOCUMENTO - TIPO: {tipo_documento.upper()}")
    logger.info(f"  Arquivo: {file_path.name}")
    logger.info(f"  Output: {output_dir}")
    logger.info("=" * 60)

    result = process_document(client, file_path, tipo_documento, output_dir)

    logger.info("=" * 60)
    logger.info(f"Status: {result['status']}")
    logger.info(f"Tempo: {result['tempo_processamento_s']}s")
    if result['status'] == 'erro':
        logger.error(f"Erro: {result['erro']}")
    logger.info("=" * 60)

    return result


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Mini Agente de Teste para Extracao de Documentos',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  # Listar tipos disponiveis
  python test_extractor.py --list-types

  # Processar um arquivo
  python test_extractor.py --type escritura --file "caminho/para/arquivo.pdf"

  # Processar pasta inteira
  python test_extractor.py --type escritura --folder "Test-Docs/Documentos-isolados-tipo/Escrituras"

  # Processar em paralelo
  python test_extractor.py --type escritura --folder "pasta" --parallel --workers 3

Tipos disponiveis:
  Use --list-types para ver todos os tipos de documento com prompts configurados.
  O agente e agnostico - pode processar qualquer tipo desde que exista o prompt.
        """
    )

    parser.add_argument(
        '--type', '-t',
        type=str,
        help='Tipo de documento (ex: escritura, cnh, matricula_imovel)'
    )

    parser.add_argument(
        '--file', '-f',
        type=str,
        help='Caminho para um arquivo especifico'
    )

    parser.add_argument(
        '--folder', '-d',
        type=str,
        help='Caminho para uma pasta com arquivos'
    )

    parser.add_argument(
        '--parallel', '-p',
        action='store_true',
        help='Processa arquivos em paralelo'
    )

    parser.add_argument(
        '--workers', '-w',
        type=int,
        default=3,
        help='Numero de workers para processamento paralelo (padrao: 3)'
    )

    parser.add_argument(
        '--list-types',
        action='store_true',
        help='Lista tipos de documento disponiveis'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Modo verbose'
    )

    args = parser.parse_args()

    # Configura nivel de log
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Lista tipos disponiveis
    if args.list_types:
        print("\nTipos de documento disponiveis:")
        print("-" * 40)
        for tipo in list_available_types():
            print(f"  - {tipo}")
        print("-" * 40)
        print(f"Total: {len(list_available_types())}")
        print(f"Diretorio de prompts: {PROMPTS_DIR}")
        sys.exit(0)

    # Valida argumentos
    if not args.type:
        parser.error("--type e obrigatorio (use --list-types para ver opcoes)")

    if not args.file and not args.folder:
        parser.error("Especifique --file ou --folder")

    if args.file and args.folder:
        parser.error("Use --file OU --folder, nao ambos")

    try:
        if args.file:
            # Processa arquivo unico
            file_path = Path(args.file)
            if not file_path.is_absolute():
                file_path = ROOT_DIR / file_path

            if not file_path.exists():
                logger.error(f"Arquivo nao encontrado: {file_path}")
                sys.exit(1)

            result = process_single_file(args.type, file_path)
            sys.exit(0 if result['status'] == 'sucesso' else 1)

        else:
            # Processa pasta
            folder_path = Path(args.folder)
            if not folder_path.is_absolute():
                folder_path = ROOT_DIR / folder_path

            if not folder_path.exists():
                logger.error(f"Pasta nao encontrada: {folder_path}")
                sys.exit(1)

            result = process_folder(
                args.type,
                folder_path,
                parallel=args.parallel,
                workers=args.workers
            )
            sys.exit(0 if result.get('erro', 0) == 0 else 1)

    except KeyboardInterrupt:
        logger.info("\nProcessamento interrompido pelo usuario")
        sys.exit(130)
    except Exception as e:
        logger.exception(f"Erro fatal: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
