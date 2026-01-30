#!/usr/bin/env python3
"""
batch_test_extraction.py - Processamento em lote de documentos isolados por tipo

Este script processa todas as pastas em Test-Docs/Documentos-isolados-tipo/,
usando o prompt apropriado para cada tipo de documento. O objetivo e validar
a eficacia dos prompts de extracao.

Uso:
    python execution/batch_test_extraction.py
    python execution/batch_test_extraction.py --dry-run
    python execution/batch_test_extraction.py --types RG,CNH,CNDT
    python execution/batch_test_extraction.py --parallel

Saida:
    .tmp/documentos-isolados-tipo-output/<tipo>/
        - <arquivo>_resultado.json
        - <arquivo>_resposta_completa.txt
        - relatorio_processamento.json

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
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

# Adiciona o diretorio raiz ao path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Importa funcoes do test_extractor
from execution.test_extractor import (
    get_gemini_client,
    process_document,
    SUPPORTED_EXTENSIONS,
    OUTPUT_BASE_DIR,
)

# Rate limiting para plano pago (Tier 1: 150-300 RPM)
DEFAULT_RPM_PAID = 150
DEFAULT_WORKERS = 10
RATE_LIMIT_DELAY = 60.0 / DEFAULT_RPM_PAID  # ~0.4 segundos entre requests globais

# Lock global para rate limiting thread-safe
_rate_limit_lock = threading.Lock()
_last_request_time = 0.0

# Configuracao de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constantes
TEST_DOCS_DIR = ROOT_DIR / 'Test-Docs' / 'Documentos-isolados-tipo'
PROMPTS_DIR = ROOT_DIR / 'execution' / 'prompts'

# Mapeamento de pasta -> tipo de prompt
# Quando a pasta tem nome diferente do prompt, ou quando nao existe prompt especifico
FOLDER_TO_PROMPT_MAPPING = {
    # Mapeamentos diretos (pasta = prompt)
    'ASSINATURA_DIGITAL': 'assinatura_digital',
    'CERTIDAO_CASAMENTO': 'certidao_casamento',
    'CERTIDAO_NASCIMENTO': 'certidao_nascimento',
    'CNDT': 'cndt',
    'CNH': 'cnh',
    'COMPROMISSO_COMPRA_VENDA': 'compromisso_compra_venda',
    'COMPROVANTE_PAGAMENTO': 'comprovante_pagamento',
    'IPTU': 'iptu',
    'ITBI': 'itbi',
    'MATRICULA_IMOVEL': 'matricula_imovel',
    'PROTOCOLO_ONR': 'protocolo_onr',
    'RG': 'rg',
    'VVR': 'vvr',

    # Mapeamentos especiais (pasta != prompt ou usa generic)
    'ESCRITURA': 'escritura_v3',  # Usa versao V3 (mais flexivel)
    'CND_IMOVEL': 'cnd_municipal',  # Usa prompt de CND municipal como base
    'DADOS_CADASTRAIS': 'generic',  # Sem prompt especifico
    'OUTRO': 'generic',  # Documentos nao classificados
    'DESCONHECIDO': 'desconhecido',  # Usa prompt de desconhecido

    # Pastas que normalmente estao vazias mas podem ter documentos
    'CERTIDAO_OBITO': 'generic',
    'COMPROVANTE_RESIDENCIA': 'generic',
    'CONTRATO_SOCIAL': 'generic',
    'CPF': 'generic',
    'PROCURACAO': 'generic',
}


def get_available_prompts() -> List[str]:
    """Lista prompts disponiveis."""
    if not PROMPTS_DIR.exists():
        return []

    prompts = []
    for file in PROMPTS_DIR.glob("*.txt"):
        prompts.append(file.stem.lower())

    return sorted(prompts)


def get_folders_with_files() -> Dict[str, List[Path]]:
    """
    Retorna dicionario de pastas que contem arquivos para processar.

    Returns:
        Dict com nome da pasta -> lista de arquivos
    """
    folders = {}

    if not TEST_DOCS_DIR.exists():
        logger.error(f"Diretorio de testes nao encontrado: {TEST_DOCS_DIR}")
        return folders

    for folder in sorted(TEST_DOCS_DIR.iterdir()):
        if not folder.is_dir():
            continue

        # Lista arquivos suportados
        files = [f for f in folder.iterdir()
                 if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS]

        if files:
            folders[folder.name] = files
            logger.debug(f"Pasta {folder.name}: {len(files)} arquivo(s)")

    return folders


def rate_limited_request():
    """
    Controla rate limiting global entre threads.
    Aguarda tempo minimo entre requests.
    """
    global _last_request_time

    with _rate_limit_lock:
        current_time = time.time()
        elapsed = current_time - _last_request_time

        if elapsed < RATE_LIMIT_DELAY:
            sleep_time = RATE_LIMIT_DELAY - elapsed
            time.sleep(sleep_time)

        _last_request_time = time.time()


def process_file_threadsafe(
    client,
    file_path: Path,
    prompt_type: str,
    output_dir: Path,
    worker_id: int
) -> Dict[str, Any]:
    """
    Processa um arquivo com rate limiting thread-safe.
    """
    # Aplica rate limiting global
    rate_limited_request()

    logger.info(f"  [Worker {worker_id}] Processando: {file_path.name}")

    result = process_document(client, file_path, prompt_type, output_dir)

    if result['status'] == 'sucesso':
        logger.info(f"  [Worker {worker_id}] OK: {file_path.name} - {result['tempo_processamento_s']}s")
    else:
        logger.warning(f"  [Worker {worker_id}] ERRO: {file_path.name} - {result.get('erro', 'desconhecido')}")

    return result


def process_folder_batch(
    folder_name: str,
    files: List[Path],
    client,
    dry_run: bool = False,
    parallel: bool = False,
    workers: int = DEFAULT_WORKERS
) -> Dict[str, Any]:
    """
    Processa todos os arquivos de uma pasta.

    Args:
        folder_name: Nome da pasta (tipo de documento)
        files: Lista de arquivos para processar
        client: Cliente Gemini
        dry_run: Se True, apenas simula sem chamar API
        parallel: Se True, usa processamento paralelo
        workers: Numero de workers para modo paralelo

    Returns:
        Relatorio de processamento
    """
    start_time = datetime.now()

    # Determina o tipo de prompt a usar
    prompt_type = FOLDER_TO_PROMPT_MAPPING.get(folder_name, 'generic')

    # Verifica se prompt existe
    available_prompts = get_available_prompts()
    if prompt_type not in available_prompts:
        logger.warning(f"Prompt '{prompt_type}' nao encontrado, usando 'generic'")
        prompt_type = 'generic'

    # Cria diretorio de output
    output_dir = OUTPUT_BASE_DIR / folder_name.lower()
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info("=" * 60)
    logger.info(f"PROCESSANDO: {folder_name}")
    logger.info(f"  Arquivos: {len(files)}")
    logger.info(f"  Prompt: {prompt_type}")
    logger.info(f"  Output: {output_dir}")
    logger.info(f"  Modo: {'PARALELO (' + str(workers) + ' workers)' if parallel else 'SERIAL'}")
    if dry_run:
        logger.info("  [DRY RUN - Nao chama API]")
    logger.info("=" * 60)

    results = []
    sucesso = 0
    erro = 0

    if dry_run:
        # Modo dry run - simula todos
        for idx, file_path in enumerate(files, 1):
            logger.info(f"  [{idx}/{len(files)}] {file_path.name}")
            result = {
                "arquivo": file_path.name,
                "caminho": str(file_path),
                "tipo_documento": prompt_type,
                "status": "dry_run",
                "dados_catalogados": {},
                "tempo_processamento_s": 0
            }
            results.append(result)
            sucesso += 1

    elif parallel:
        # Modo paralelo com ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_to_file = {
                executor.submit(
                    process_file_threadsafe,
                    client,
                    file_path,
                    prompt_type,
                    output_dir,
                    idx % workers
                ): file_path
                for idx, file_path in enumerate(files)
            }

            for future in as_completed(future_to_file):
                file_path = future_to_file[future]
                try:
                    result = future.result()
                    results.append(result)

                    if result['status'] == 'sucesso':
                        sucesso += 1
                    else:
                        erro += 1
                except Exception as e:
                    erro += 1
                    logger.error(f"  Excecao ao processar {file_path.name}: {e}")
                    results.append({
                        "arquivo": file_path.name,
                        "caminho": str(file_path),
                        "tipo_documento": prompt_type,
                        "status": "erro",
                        "erro": str(e),
                        "dados_catalogados": {},
                        "tempo_processamento_s": 0
                    })
    else:
        # Modo serial
        for idx, file_path in enumerate(files, 1):
            logger.info(f"  [{idx}/{len(files)}] {file_path.name}")

            result = process_document(client, file_path, prompt_type, output_dir)

            if result['status'] == 'sucesso':
                sucesso += 1
                logger.info(f"      OK - {result['tempo_processamento_s']}s")
            else:
                erro += 1
                logger.warning(f"      ERRO: {result.get('erro', 'desconhecido')}")

            results.append(result)

            # Rate limiting (exceto no ultimo)
            if idx < len(files):
                time.sleep(RATE_LIMIT_DELAY)

    # Monta relatorio
    tempo_total = (datetime.now() - start_time).total_seconds()

    relatorio = {
        "tipo_documento": folder_name,
        "prompt_utilizado": prompt_type,
        "pasta_origem": str(TEST_DOCS_DIR / folder_name),
        "pasta_output": str(output_dir),
        "data_processamento": start_time.isoformat(),
        "data_conclusao": datetime.now().isoformat(),
        "tempo_total_s": round(tempo_total, 2),
        "total_arquivos": len(files),
        "sucesso": sucesso,
        "erro": erro,
        "taxa_sucesso": round(sucesso / len(files) * 100, 1) if files else 0,
        "dry_run": dry_run,
        "parallel": parallel,
        "workers": workers if parallel else 1,
        "resultados": results
    }

    # Salva relatorio da pasta
    if not dry_run:
        report_path = output_dir / "relatorio_processamento.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(relatorio, f, ensure_ascii=False, indent=2)

    logger.info(f"  Concluido: {sucesso}/{len(files)} sucesso ({relatorio['taxa_sucesso']}%)")

    return relatorio


def run_batch_extraction(
    types_filter: Optional[List[str]] = None,
    dry_run: bool = False,
    verbose: bool = False,
    parallel: bool = False,
    workers: int = DEFAULT_WORKERS,
    rpm: int = DEFAULT_RPM_PAID
) -> Dict[str, Any]:
    """
    Executa extracao em lote para todas as pastas de tipos.

    Args:
        types_filter: Lista de tipos para filtrar (ou None para todos)
        dry_run: Se True, apenas simula
        verbose: Modo verbose
        parallel: Se True, usa processamento paralelo
        workers: Numero de workers para modo paralelo
        rpm: Requests per minute (para ajustar rate limiting)

    Returns:
        Relatorio consolidado
    """
    global RATE_LIMIT_DELAY
    RATE_LIMIT_DELAY = 60.0 / rpm  # Ajusta rate limit baseado no RPM

    start_time = datetime.now()

    # Configura cliente Gemini (apenas se nao for dry run)
    client = None
    if not dry_run:
        client = get_gemini_client()

    # Lista pastas com arquivos
    folders = get_folders_with_files()

    if not folders:
        logger.error("Nenhuma pasta com arquivos encontrada")
        return {"status": "erro", "erro": "Nenhuma pasta encontrada"}

    # Filtra tipos se especificado
    if types_filter:
        types_upper = [t.upper() for t in types_filter]
        folders = {k: v for k, v in folders.items() if k.upper() in types_upper}

    if not folders:
        logger.error("Nenhuma pasta corresponde ao filtro")
        return {"status": "erro", "erro": "Nenhuma pasta corresponde ao filtro"}

    # Conta total de arquivos
    total_files = sum(len(files) for files in folders.values())

    logger.info("=" * 70)
    logger.info("EXTRACAO EM LOTE - DOCUMENTOS ISOLADOS POR TIPO")
    logger.info("=" * 70)
    logger.info(f"  Pastas a processar: {len(folders)}")
    logger.info(f"  Total de arquivos: {total_files}")
    logger.info(f"  Modo: {'DRY RUN' if dry_run else 'PRODUCAO'}")
    if parallel:
        logger.info(f"  Processamento: PARALELO ({workers} workers)")
        logger.info(f"  RPM configurado: {rpm}")
        logger.info(f"  Delay entre requests: {RATE_LIMIT_DELAY:.2f}s")
    else:
        logger.info(f"  Processamento: SERIAL")
    logger.info("=" * 70)

    # Processa cada pasta
    relatorios = []
    total_sucesso = 0
    total_erro = 0

    for folder_name, files in folders.items():
        relatorio = process_folder_batch(
            folder_name, files, client, dry_run,
            parallel=parallel, workers=workers
        )
        relatorios.append(relatorio)
        total_sucesso += relatorio['sucesso']
        total_erro += relatorio['erro']

    # Monta relatorio consolidado
    tempo_total = (datetime.now() - start_time).total_seconds()

    relatorio_consolidado = {
        "data_execucao": start_time.isoformat(),
        "data_conclusao": datetime.now().isoformat(),
        "tempo_total_s": round(tempo_total, 2),
        "dry_run": dry_run,
        "modo_paralelo": parallel,
        "workers": workers if parallel else 1,
        "rpm_configurado": rpm,
        "estatisticas": {
            "pastas_processadas": len(folders),
            "total_arquivos": total_files,
            "total_sucesso": total_sucesso,
            "total_erro": total_erro,
            "taxa_sucesso_global": round(total_sucesso / total_files * 100, 1) if total_files else 0,
            "throughput_docs_por_minuto": round(total_files / (tempo_total / 60), 2) if tempo_total > 0 else 0
        },
        "resumo_por_tipo": [
            {
                "tipo": r["tipo_documento"],
                "prompt": r["prompt_utilizado"],
                "arquivos": r["total_arquivos"],
                "sucesso": r["sucesso"],
                "erro": r["erro"],
                "taxa": r["taxa_sucesso"]
            }
            for r in relatorios
        ],
        "relatorios_detalhados": relatorios
    }

    # Salva relatorio consolidado
    OUTPUT_BASE_DIR.mkdir(parents=True, exist_ok=True)
    consolidated_path = OUTPUT_BASE_DIR / "relatorio_consolidado.json"
    with open(consolidated_path, 'w', encoding='utf-8') as f:
        json.dump(relatorio_consolidado, f, ensure_ascii=False, indent=2)

    # Resumo final
    logger.info("")
    logger.info("=" * 70)
    logger.info("EXTRACAO EM LOTE CONCLUIDA")
    logger.info("=" * 70)
    logger.info(f"  Pastas processadas: {len(folders)}")
    logger.info(f"  Total arquivos: {total_files}")
    logger.info(f"  Sucesso: {total_sucesso}")
    logger.info(f"  Erros: {total_erro}")
    logger.info(f"  Taxa global: {relatorio_consolidado['estatisticas']['taxa_sucesso_global']}%")
    logger.info(f"  Tempo total: {tempo_total:.2f}s")
    logger.info(f"  Relatorio: {consolidated_path}")
    logger.info("")
    logger.info("Resumo por tipo:")
    for r in relatorio_consolidado['resumo_por_tipo']:
        status = "OK" if r['erro'] == 0 else f"ERRO({r['erro']})"
        logger.info(f"  - {r['tipo']:30} {r['arquivos']:3} arquivos | {r['taxa']:5.1f}% | {status}")
    logger.info("=" * 70)

    return relatorio_consolidado


def main():
    parser = argparse.ArgumentParser(
        description='Processamento em lote de documentos isolados por tipo',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  # Processar todos os tipos
  python execution/batch_test_extraction.py

  # Simular sem chamar API
  python execution/batch_test_extraction.py --dry-run

  # Processar apenas alguns tipos
  python execution/batch_test_extraction.py --types RG,CNH,CNDT

  # Modo verbose
  python execution/batch_test_extraction.py --verbose

Mapeamento de pastas para prompts:
  A maioria das pastas usa o prompt com mesmo nome (RG -> rg.txt).
  Excecoes:
    - ESCRITURA -> escritura_v3.txt (versao mais flexivel)
    - CND_IMOVEL -> cnd_municipal.txt
    - DADOS_CADASTRAIS -> generic.txt
    - OUTRO -> generic.txt
        """
    )

    parser.add_argument(
        '--types', '-t',
        type=str,
        help='Tipos para processar separados por virgula (ex: RG,CNH,CNDT)'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Simula processamento sem chamar API'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Modo verbose'
    )

    parser.add_argument(
        '--list-mapping',
        action='store_true',
        help='Lista mapeamento pasta->prompt e sai'
    )

    parser.add_argument(
        '--parallel', '-p',
        action='store_true',
        help='Ativa processamento paralelo com multiplos workers'
    )

    parser.add_argument(
        '--workers', '-w',
        type=int,
        default=DEFAULT_WORKERS,
        help=f'Numero de workers para processamento paralelo (padrao: {DEFAULT_WORKERS})'
    )

    parser.add_argument(
        '--rpm',
        type=int,
        default=DEFAULT_RPM_PAID,
        help=f'Rate limit em requests por minuto (padrao: {DEFAULT_RPM_PAID} para tier pago)'
    )

    args = parser.parse_args()

    # Configura nivel de log
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Lista mapeamento
    if args.list_mapping:
        print("\nMapeamento Pasta -> Prompt:")
        print("-" * 50)
        for pasta, prompt in sorted(FOLDER_TO_PROMPT_MAPPING.items()):
            print(f"  {pasta:30} -> {prompt}")
        print("-" * 50)
        sys.exit(0)

    # Filtra tipos
    types_filter = None
    if args.types:
        types_filter = [t.strip() for t in args.types.split(',')]

    try:
        result = run_batch_extraction(
            types_filter=types_filter,
            dry_run=args.dry_run,
            verbose=args.verbose,
            parallel=args.parallel,
            workers=args.workers,
            rpm=args.rpm
        )

        # Retorna codigo de saida
        if result.get('estatisticas', {}).get('total_erro', 0) > 0:
            sys.exit(1)
        sys.exit(0)

    except KeyboardInterrupt:
        logger.info("\nProcessamento interrompido pelo usuario")
        sys.exit(130)
    except Exception as e:
        logger.exception(f"Erro fatal: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
