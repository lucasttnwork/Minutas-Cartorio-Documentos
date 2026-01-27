#!/usr/bin/env python3
"""
clean_temp_files.py - Limpa arquivos temporarios e de teste

Remove todos os arquivos intermediarios antes de rodar pipeline completo.
Seguro por design: modo dry-run e padrao, opera apenas dentro de .tmp/
"""

import argparse
import logging
import os
from pathlib import Path
from typing import Dict, List

# Configurar caminhos
PROJECT_ROOT = Path(__file__).parent.parent
TMP_DIR = PROJECT_ROOT / '.tmp'

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def get_dir_size(path: Path) -> int:
    """Calcula tamanho total de um diretorio."""
    total = 0
    if path.exists():
        for file in path.rglob('*'):
            if file.is_file():
                try:
                    total += file.stat().st_size
                except (OSError, PermissionError):
                    pass
    return total


def format_size(bytes_size: int) -> str:
    """Formata tamanho em bytes para formato legivel."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024
    return f"{bytes_size:.2f} TB"


def list_temp_files() -> Dict:
    """
    Lista todos os arquivos temporarios que serao deletados.

    Returns:
        Dict com estatisticas por categoria e totais
    """
    stats = {
        'inventarios': [],
        'classificacoes': [],
        'catalogos': [],
        'ocr': [],
        'docx_conversions': [],
        'total_files': 0,
        'total_size': 0
    }

    if not TMP_DIR.exists():
        logger.warning(f"Diretorio .tmp/ nao existe: {TMP_DIR}")
        return stats

    # Inventarios (*.json)
    inv_dir = TMP_DIR / 'inventarios'
    if inv_dir.exists():
        for file in inv_dir.glob('*.json'):
            try:
                size = file.stat().st_size
                stats['inventarios'].append({'path': file, 'size': size})
                stats['total_files'] += 1
                stats['total_size'] += size
            except (OSError, PermissionError) as e:
                logger.warning(f"Erro ao acessar {file}: {e}")

    # Classificacoes (*.json)
    class_dir = TMP_DIR / 'classificacoes'
    if class_dir.exists():
        for file in class_dir.glob('*.json'):
            try:
                size = file.stat().st_size
                stats['classificacoes'].append({'path': file, 'size': size})
                stats['total_files'] += 1
                stats['total_size'] += size
            except (OSError, PermissionError) as e:
                logger.warning(f"Erro ao acessar {file}: {e}")

    # Catalogos (*.json)
    cat_dir = TMP_DIR / 'catalogos'
    if cat_dir.exists():
        for file in cat_dir.glob('*.json'):
            try:
                size = file.stat().st_size
                stats['catalogos'].append({'path': file, 'size': size})
                stats['total_files'] += 1
                stats['total_size'] += size
            except (OSError, PermissionError) as e:
                logger.warning(f"Erro ao acessar {file}: {e}")

    # OCR (todo o conteudo - arquivos e subdiretorios)
    ocr_dir = TMP_DIR / 'ocr'
    if ocr_dir.exists():
        for file in ocr_dir.rglob('*'):
            if file.is_file():
                try:
                    size = file.stat().st_size
                    stats['ocr'].append({'path': file, 'size': size})
                    stats['total_files'] += 1
                    stats['total_size'] += size
                except (OSError, PermissionError) as e:
                    logger.warning(f"Erro ao acessar {file}: {e}")

    # DOCX conversions (*.pdf e outros)
    docx_dir = TMP_DIR / 'docx_conversions'
    if docx_dir.exists():
        for file in docx_dir.rglob('*'):
            if file.is_file():
                try:
                    size = file.stat().st_size
                    stats['docx_conversions'].append({'path': file, 'size': size})
                    stats['total_files'] += 1
                    stats['total_size'] += size
                except (OSError, PermissionError) as e:
                    logger.warning(f"Erro ao acessar {file}: {e}")

    return stats


def clean_directory(dir_path: Path, keep_structure: bool = True) -> Dict:
    """
    Remove conteudo de um diretorio.

    Args:
        dir_path: Caminho do diretorio
        keep_structure: Se True, mantem o diretorio vazio; se False, remove tudo

    Returns:
        Dict com estatisticas de limpeza
    """
    result = {'files_deleted': 0, 'dirs_deleted': 0, 'errors': 0}

    if not dir_path.exists():
        return result

    # Primeiro deletar arquivos
    for item in dir_path.rglob('*'):
        if item.is_file():
            try:
                item.unlink()
                result['files_deleted'] += 1
            except (OSError, PermissionError) as e:
                logger.error(f"Erro ao deletar arquivo {item}: {e}")
                result['errors'] += 1

    # Depois deletar subdiretorios vazios (de dentro para fora)
    subdirs = sorted([d for d in dir_path.rglob('*') if d.is_dir()],
                     key=lambda x: len(x.parts), reverse=True)
    for subdir in subdirs:
        try:
            if not any(subdir.iterdir()):  # So deletar se vazio
                subdir.rmdir()
                result['dirs_deleted'] += 1
        except (OSError, PermissionError) as e:
            logger.error(f"Erro ao deletar diretorio {subdir}: {e}")
            result['errors'] += 1

    # Se nao manter estrutura, remover o diretorio principal
    if not keep_structure:
        try:
            if dir_path.exists() and not any(dir_path.iterdir()):
                dir_path.rmdir()
                result['dirs_deleted'] += 1
        except (OSError, PermissionError) as e:
            logger.error(f"Erro ao deletar diretorio principal {dir_path}: {e}")
            result['errors'] += 1

    return result


def clean_all_temp_files(dry_run: bool = True, verbose: bool = False) -> Dict:
    """
    Limpa todos os arquivos temporarios.

    Args:
        dry_run: Se True, apenas lista (nao deleta)
        verbose: Se True, mostra cada arquivo deletado

    Returns:
        Estatisticas de limpeza
    """
    stats = list_temp_files()

    # Verificar seguranca: TMP_DIR deve estar dentro do PROJECT_ROOT
    try:
        TMP_DIR.relative_to(PROJECT_ROOT)
    except ValueError:
        logger.error(f"ERRO DE SEGURANCA: {TMP_DIR} nao esta dentro de {PROJECT_ROOT}")
        return {'error': 'Diretorio .tmp/ fora do projeto'}

    if dry_run:
        logger.info("=" * 60)
        logger.info("DRY RUN - Nenhum arquivo sera deletado")
        logger.info("=" * 60)
        logger.info(f"Diretorio base: {TMP_DIR}")
        logger.info(f"Total de arquivos a deletar: {stats['total_files']}")
        logger.info(f"Tamanho total: {format_size(stats['total_size'])}")
        logger.info("")

        categories = ['inventarios', 'classificacoes', 'catalogos', 'ocr', 'docx_conversions']

        for category in categories:
            files = stats.get(category, [])
            if files:
                cat_size = sum(f['size'] for f in files)
                logger.info(f"{category.upper()}: {len(files)} arquivo(s) ({format_size(cat_size)})")

                if verbose:
                    for file_info in files:
                        rel_path = file_info['path'].relative_to(TMP_DIR)
                        logger.info(f"  - {rel_path} ({format_size(file_info['size'])})")
                else:
                    # Mostrar primeiros 3 e ultimos 2 se houver mais de 5
                    if len(files) <= 5:
                        for file_info in files:
                            rel_path = file_info['path'].relative_to(TMP_DIR)
                            logger.info(f"  - {rel_path}")
                    else:
                        for file_info in files[:3]:
                            rel_path = file_info['path'].relative_to(TMP_DIR)
                            logger.info(f"  - {rel_path}")
                        logger.info(f"  ... ({len(files) - 5} arquivos omitidos)")
                        for file_info in files[-2:]:
                            rel_path = file_info['path'].relative_to(TMP_DIR)
                            logger.info(f"  - {rel_path}")
                logger.info("")

        logger.info("-" * 60)
        logger.info("Para executar a limpeza, use: python clean_temp_files.py --execute")
        logger.info("Para ver todos os arquivos:  python clean_temp_files.py --verbose")

        return stats

    # Executar limpeza
    logger.info("=" * 60)
    logger.info("EXECUTANDO LIMPEZA")
    logger.info("=" * 60)

    deleted = {
        'files': 0,
        'size': 0,
        'errors': 0,
        'by_category': {}
    }

    categories = ['inventarios', 'classificacoes', 'catalogos', 'ocr', 'docx_conversions']

    for category in categories:
        files = stats.get(category, [])
        if not files:
            continue

        cat_deleted = 0
        cat_size = 0

        logger.info(f"\nLimpando {category}: {len(files)} arquivo(s)...")

        for file_info in files:
            try:
                file_path = file_info['path']

                if verbose:
                    rel_path = file_path.relative_to(TMP_DIR)
                    logger.info(f"  Deletando: {rel_path}")

                file_path.unlink()
                deleted['files'] += 1
                deleted['size'] += file_info['size']
                cat_deleted += 1
                cat_size += file_info['size']

            except (OSError, PermissionError) as e:
                logger.error(f"  ERRO ao deletar {file_path.name}: {e}")
                deleted['errors'] += 1

        deleted['by_category'][category] = {
            'deleted': cat_deleted,
            'size': cat_size
        }

        logger.info(f"  -> {cat_deleted} arquivo(s) deletado(s) ({format_size(cat_size)})")

    # Limpar subdiretorios vazios de OCR
    ocr_dir = TMP_DIR / 'ocr'
    if ocr_dir.exists():
        logger.info("\nLimpando subdiretorios vazios de OCR...")
        subdirs_removed = 0

        # Ordenar de mais profundo para mais raso
        subdirs = sorted([d for d in ocr_dir.iterdir() if d.is_dir()],
                        key=lambda x: len(x.parts), reverse=True)

        for subdir in subdirs:
            try:
                # Verificar se esta vazio
                if subdir.exists() and not any(subdir.iterdir()):
                    if verbose:
                        logger.info(f"  Removendo diretorio: {subdir.name}/")
                    subdir.rmdir()
                    subdirs_removed += 1
            except (OSError, PermissionError) as e:
                logger.error(f"  ERRO ao remover diretorio {subdir.name}: {e}")

        if subdirs_removed > 0:
            logger.info(f"  -> {subdirs_removed} diretorio(s) removido(s)")

    # Resumo final
    logger.info("")
    logger.info("=" * 60)
    logger.info("LIMPEZA CONCLUIDA")
    logger.info("=" * 60)
    logger.info(f"Arquivos deletados: {deleted['files']}")
    logger.info(f"Espaco liberado: {format_size(deleted['size'])}")

    if deleted['errors'] > 0:
        logger.warning(f"Erros encontrados: {deleted['errors']}")

    return deleted


def verify_cleanup() -> Dict:
    """
    Verifica o estado apos a limpeza.

    Returns:
        Dict com status de cada diretorio
    """
    status = {}

    directories = ['inventarios', 'classificacoes', 'catalogos', 'ocr', 'docx_conversions']

    for dirname in directories:
        dir_path = TMP_DIR / dirname

        if not dir_path.exists():
            status[dirname] = {'exists': False, 'files': 0, 'subdirs': 0}
        else:
            files = list(dir_path.rglob('*'))
            file_count = sum(1 for f in files if f.is_file())
            dir_count = sum(1 for f in files if f.is_dir())
            status[dirname] = {
                'exists': True,
                'files': file_count,
                'subdirs': dir_count,
                'empty': file_count == 0
            }

    return status


def main():
    parser = argparse.ArgumentParser(
        description='Limpa arquivos temporarios do pipeline de catalogacao',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python clean_temp_files.py                    # Dry-run (lista arquivos)
  python clean_temp_files.py --execute          # Executa limpeza
  python clean_temp_files.py --execute -v       # Com detalhes
  python clean_temp_files.py --verify           # Verifica estado atual

Seguranca:
  - Modo dry-run e padrao (seguro)
  - Opera apenas dentro de .tmp/
  - Preserva estrutura de diretorios
        """
    )

    parser.add_argument(
        '--execute',
        action='store_true',
        help='Executa limpeza (padrao e dry-run)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Modo verbose (mostra cada arquivo)'
    )

    parser.add_argument(
        '--verify',
        action='store_true',
        help='Verifica estado apos limpeza'
    )

    args = parser.parse_args()

    # Se apenas verificar
    if args.verify:
        logger.info("=" * 60)
        logger.info("VERIFICACAO DE ESTADO")
        logger.info("=" * 60)

        status = verify_cleanup()
        all_clean = True

        for dirname, info in status.items():
            if not info['exists']:
                logger.info(f"{dirname}: diretorio nao existe")
            elif info.get('empty', False):
                logger.info(f"{dirname}: VAZIO (OK)")
            else:
                logger.warning(f"{dirname}: {info['files']} arquivo(s), {info['subdirs']} subdir(s)")
                all_clean = False

        if all_clean:
            logger.info("\n*** Todos os diretorios estao limpos! ***")
        else:
            logger.warning("\n*** Alguns diretorios ainda contem arquivos ***")

        return 0

    # Executar limpeza (dry-run ou real)
    result = clean_all_temp_files(
        dry_run=not args.execute,
        verbose=args.verbose
    )

    return 0


if __name__ == '__main__':
    exit(main())
