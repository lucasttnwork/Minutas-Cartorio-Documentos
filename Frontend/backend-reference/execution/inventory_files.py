#!/usr/bin/env python3
"""
inventory_files.py - Fase 1.1 do Pipeline de Extração de Documentos de Cartório

Percorre recursivamente uma pasta de escritura e gera um inventário bruto de todos
os arquivos em formato JSON.

Uso:
    python inventory_files.py "C:/caminho/para/pasta/escritura"
    python inventory_files.py "C:/caminho/para/pasta/escritura" --output "C:/caminho/saida.json"

Regras:
    - Ignora subpastas cujo nome é similar ao nome da pasta mãe
    - Filtra apenas extensões suportadas: pdf, jpg, jpeg, png, tiff, docx, doc
    - Ignora arquivos de sistema (.DS_Store, Thumbs.db, arquivos ocultos)
"""

import argparse
import json
import logging
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Extensões de arquivos suportadas
SUPPORTED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.docx', '.doc'}

# Arquivos de sistema a serem ignorados
SYSTEM_FILES = {'.ds_store', 'thumbs.db', 'desktop.ini', '.gitkeep'}


def normalize_name(name: str) -> str:
    """
    Normaliza um nome removendo espaços, caracteres especiais e convertendo para lowercase.

    Args:
        name: Nome original do arquivo ou pasta

    Returns:
        Nome normalizado para comparação
    """
    # Remove caracteres não alfanuméricos (mantém apenas letras e números)
    normalized = re.sub(r'[^a-zA-Z0-9]', '', name.lower())
    return normalized


def extract_escritura_id(folder_name: str) -> str:
    """
    Extrai o ID da escritura a partir do nome da pasta.
    Normaliza: remove espaços, pontos, converte para underscore.

    Args:
        folder_name: Nome da pasta da escritura

    Returns:
        ID normalizado da escritura
    """
    # Remove caracteres especiais mantendo apenas alfanuméricos e espaços
    clean_name = re.sub(r'[^\w\s-]', '', folder_name)
    # Substitui espaços e hífens por underscore
    escritura_id = re.sub(r'[\s-]+', '_', clean_name.strip())
    return escritura_id


def is_similar_to_parent(subfolder_name: str, parent_name: str) -> bool:
    """
    Verifica se o nome de uma subpasta é similar ao nome da pasta mãe.

    A lógica é: normaliza ambos os nomes e verifica se um está contido no outro.

    Args:
        subfolder_name: Nome da subpasta
        parent_name: Nome da pasta mãe

    Returns:
        True se a subpasta deve ser ignorada (é similar à pasta mãe)
    """
    norm_subfolder = normalize_name(subfolder_name)
    norm_parent = normalize_name(parent_name)

    # Se um está contido no outro, são similares
    # Também considera se são muito parecidos (apenas diferença no espaçamento)
    if norm_subfolder in norm_parent or norm_parent in norm_subfolder:
        return True

    return False


def is_hidden_file(file_path: Path) -> bool:
    """
    Verifica se um arquivo é oculto (começa com ponto).

    Args:
        file_path: Caminho do arquivo

    Returns:
        True se o arquivo é oculto
    """
    return file_path.name.startswith('.')


def is_system_file(file_path: Path) -> bool:
    """
    Verifica se um arquivo é um arquivo de sistema a ser ignorado.

    Args:
        file_path: Caminho do arquivo

    Returns:
        True se o arquivo deve ser ignorado
    """
    return file_path.name.lower() in SYSTEM_FILES


def is_supported_extension(file_path: Path) -> bool:
    """
    Verifica se o arquivo tem uma extensão suportada.

    Args:
        file_path: Caminho do arquivo

    Returns:
        True se a extensão é suportada
    """
    return file_path.suffix.lower() in SUPPORTED_EXTENSIONS


def inventory_folder(
    folder_path: Path,
    output_path: Optional[Path] = None
) -> dict:
    """
    Gera o inventário de arquivos de uma pasta de escritura.

    Args:
        folder_path: Caminho da pasta a ser inventariada
        output_path: Caminho opcional para salvar o JSON de saída

    Returns:
        Dicionário com o inventário completo
    """
    if not folder_path.exists():
        raise FileNotFoundError(f"Pasta não encontrada: {folder_path}")

    if not folder_path.is_dir():
        raise NotADirectoryError(f"O caminho não é uma pasta: {folder_path}")

    parent_name = folder_path.name
    escritura_id = extract_escritura_id(parent_name)

    logger.info(f"Iniciando inventário da pasta: {folder_path}")
    logger.info(f"ID da escritura: {escritura_id}")

    # Estrutura do inventário
    inventory = {
        "escritura_id": escritura_id,
        "pasta_origem": str(folder_path.absolute()).replace('\\', '/'),
        "data_inventario": datetime.now().isoformat(timespec='seconds'),
        "total_arquivos": 0,
        "pastas_ignoradas": [],
        "arquivos": []
    }

    # Conjunto para rastrear pastas ignoradas (para evitar duplicatas)
    ignored_folders = set()

    # Contador para ID sequencial
    file_counter = 0

    def process_directory(current_path: Path, relative_base: Path):
        """Processa recursivamente um diretório."""
        nonlocal file_counter

        try:
            items = list(current_path.iterdir())
        except PermissionError as e:
            logger.warning(f"Permissão negada para acessar: {current_path}")
            return

        for item in sorted(items):
            try:
                if item.is_dir():
                    # Verifica se a subpasta deve ser ignorada
                    if is_similar_to_parent(item.name, parent_name):
                        # Marca esta pasta e todas as subpastas como ignoradas
                        relative_ignored = str(item.relative_to(folder_path)).replace('\\', '/')
                        if relative_ignored not in ignored_folders:
                            ignored_folders.add(relative_ignored)
                            logger.info(f"Ignorando subpasta similar: {relative_ignored}")

                        # Também marca subpastas da pasta ignorada
                        for subitem in item.rglob('*'):
                            if subitem.is_dir():
                                sub_relative = str(subitem.relative_to(folder_path)).replace('\\', '/')
                                if sub_relative not in ignored_folders:
                                    ignored_folders.add(sub_relative)
                        continue

                    # Processa subpasta normalmente
                    process_directory(item, relative_base)

                elif item.is_file():
                    # Ignora arquivos ocultos e de sistema
                    if is_hidden_file(item) or is_system_file(item):
                        logger.debug(f"Ignorando arquivo de sistema/oculto: {item.name}")
                        continue

                    # Verifica extensão suportada
                    if not is_supported_extension(item):
                        logger.debug(f"Ignorando extensão não suportada: {item.name}")
                        continue

                    # Adiciona arquivo ao inventário
                    file_counter += 1
                    relative_path = item.relative_to(folder_path)

                    # Determina a subpasta (pasta pai relativa)
                    subpasta = str(relative_path.parent).replace('\\', '/')
                    if subpasta == '.':
                        subpasta = ""  # Arquivo na raiz

                    file_info = {
                        "id": f"{file_counter:03d}",
                        "nome": item.name,
                        "caminho_relativo": str(relative_path).replace('\\', '/'),
                        "caminho_absoluto": str(item.absolute()).replace('\\', '/'),
                        "extensao": item.suffix.lower().lstrip('.'),
                        "tamanho_bytes": item.stat().st_size,
                        "subpasta": subpasta,
                        "status_classificacao": "pendente"
                    }

                    inventory["arquivos"].append(file_info)
                    logger.debug(f"Arquivo adicionado: {file_info['caminho_relativo']}")

            except PermissionError as e:
                logger.warning(f"Permissão negada para: {item}")
            except Exception as e:
                logger.error(f"Erro ao processar {item}: {e}")

    # Inicia o processamento
    process_directory(folder_path, folder_path)

    # Atualiza totais
    inventory["total_arquivos"] = len(inventory["arquivos"])
    inventory["pastas_ignoradas"] = sorted(list(ignored_folders))

    logger.info(f"Inventário concluído: {inventory['total_arquivos']} arquivos encontrados")
    logger.info(f"Pastas ignoradas: {len(inventory['pastas_ignoradas'])}")

    # Salva o JSON
    if output_path is None:
        # Determina o diretório de saída padrão
        script_dir = Path(__file__).parent.parent
        output_dir = script_dir / '.tmp' / 'inventarios'
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{escritura_id}_bruto.json"
    else:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, ensure_ascii=False, indent=2)

    logger.info(f"Inventário salvo em: {output_path}")

    return inventory


def main():
    """Função principal - entry point do CLI."""
    parser = argparse.ArgumentParser(
        description='Gera inventário de arquivos de uma pasta de escritura.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
    python inventory_files.py "C:/Documentos/FC 515 - 124 p280509"
    python inventory_files.py "C:/Documentos/FC 515 - 124 p280509" --output "C:/saida/inventario.json"
        """
    )

    parser.add_argument(
        'pasta',
        type=str,
        help='Caminho para a pasta da escritura a ser inventariada'
    )

    parser.add_argument(
        '--output', '-o',
        type=str,
        default=None,
        help='Caminho para salvar o arquivo JSON de saída (opcional)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Modo verbose - mostra mais detalhes no log'
    )

    args = parser.parse_args()

    # Ajusta nível de log se verbose
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    try:
        folder_path = Path(args.pasta)
        output_path = Path(args.output) if args.output else None

        inventory = inventory_folder(folder_path, output_path)

        # Imprime resumo
        print("\n" + "="*60)
        print("RESUMO DO INVENTÁRIO")
        print("="*60)
        print(f"Escritura ID:        {inventory['escritura_id']}")
        print(f"Total de arquivos:   {inventory['total_arquivos']}")
        print(f"Pastas ignoradas:    {len(inventory['pastas_ignoradas'])}")
        if inventory['pastas_ignoradas']:
            for pasta in inventory['pastas_ignoradas']:
                print(f"  - {pasta}")
        print("="*60)

        return 0

    except FileNotFoundError as e:
        logger.error(str(e))
        return 1
    except NotADirectoryError as e:
        logger.error(str(e))
        return 1
    except Exception as e:
        logger.error(f"Erro inesperado: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
