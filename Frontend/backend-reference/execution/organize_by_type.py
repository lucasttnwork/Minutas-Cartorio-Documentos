#!/usr/bin/env python3
"""
organize_by_type.py - Organiza documentos por tipo em pastas específicas

Lê o arquivo de classificações consolidadas e copia os documentos para
pastas organizadas por tipo em Test-Docs/Documentos-isolados-tipo/

Uso:
    python organize_by_type.py
    python organize_by_type.py --dry-run  # Apenas simula, não copia
"""

import argparse
import hashlib
import json
import logging
import re
import shutil
import unicodedata
from datetime import datetime
from pathlib import Path

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Diretórios base
SCRIPT_DIR = Path(__file__).parent.parent
CLASSIFICACOES_PATH = SCRIPT_DIR / '.tmp' / 'classificacoes' / 'classificacoes_consolidadas.json'
DESTINO_BASE = SCRIPT_DIR / 'Test-Docs' / 'Documentos-isolados-tipo'
MANIFESTO_PATH = SCRIPT_DIR / '.tmp' / 'classificacoes' / 'manifesto_organizacao.json'


def sanitize_name(name: str) -> str:
    """
    Sanitiza um nome para uso em nome de arquivo.
    Remove acentos, caracteres especiais e normaliza espaços.
    """
    if not name:
        return ""

    # Normaliza unicode e remove acentos
    name = unicodedata.normalize('NFKD', name)
    name = name.encode('ASCII', 'ignore').decode('ASCII')

    # Remove caracteres especiais, mantém apenas alfanuméricos e espaços
    name = re.sub(r'[^\w\s]', '', name)

    # Substitui espaços por underscore e converte para maiúsculas
    name = re.sub(r'\s+', '_', name.strip())
    name = name.upper()

    # Limita o tamanho
    if len(name) > 30:
        name = name[:30]

    return name


def get_file_hash(file_path: Path, length: int = 6) -> str:
    """Calcula hash SHA256 dos primeiros 8KB do arquivo."""
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        hasher.update(f.read(8192))
    return hasher.hexdigest()[:length]


def generate_destination_name(doc: dict, dest_folder: Path, existing_names: set) -> str:
    """
    Gera o nome do arquivo destino seguindo o padrão:
    {TIPO}_{PESSOA}_{ORIGEM}[_pg{N}].{ext}

    Adiciona hash se houver colisão de nomes.
    """
    tipo = doc['tipo']
    pessoa = sanitize_name(doc.get('pessoa') or '')
    origem = doc['origem']

    # Extrai extensão do arquivo original
    original_path = Path(doc['arquivo_original'])
    ext = original_path.suffix.lower()

    # Monta o nome base
    if pessoa:
        base_name = f"{tipo}_{pessoa}_{origem}"
    else:
        base_name = f"{tipo}_{origem}"

    # Verifica colisão e adiciona sufixo se necessário
    candidate = f"{base_name}{ext}"
    counter = 2

    while candidate.lower() in existing_names:
        candidate = f"{base_name}_pg{counter}{ext}"
        counter += 1

    # Se ainda houver colisão (improvável), adiciona hash
    if counter > 10:
        file_hash = get_file_hash(SCRIPT_DIR / doc['arquivo_original'])
        candidate = f"{base_name}_{file_hash}{ext}"

    return candidate


def organize_documents(dry_run: bool = False) -> dict:
    """
    Organiza os documentos copiando-os para as pastas de tipo.

    Args:
        dry_run: Se True, apenas simula sem copiar

    Returns:
        Dicionário com o manifesto da organização
    """
    # Carrega classificações
    if not CLASSIFICACOES_PATH.exists():
        raise FileNotFoundError(f"Arquivo de classificações não encontrado: {CLASSIFICACOES_PATH}")

    with open(CLASSIFICACOES_PATH, 'r', encoding='utf-8') as f:
        classificacoes = json.load(f)

    logger.info(f"Carregadas {len(classificacoes['documentos'])} classificações")

    # Estrutura do manifesto
    manifesto = {
        "data_organizacao": datetime.now().isoformat(timespec='seconds'),
        "dry_run": dry_run,
        "total_documentos": len(classificacoes['documentos']),
        "copiados": 0,
        "erros": 0,
        "mapeamento": [],
        "estatisticas_destino": {}
    }

    # Rastreia nomes existentes por pasta para evitar colisões
    existing_by_folder = {}

    for doc in classificacoes['documentos']:
        tipo = doc['tipo']
        origem_path = SCRIPT_DIR / doc['arquivo_original']
        dest_folder = DESTINO_BASE / tipo

        # Inicializa rastreamento de nomes para esta pasta
        if tipo not in existing_by_folder:
            existing_by_folder[tipo] = set()
            # Adiciona arquivos já existentes na pasta
            if dest_folder.exists():
                for existing_file in dest_folder.iterdir():
                    existing_by_folder[tipo].add(existing_file.name.lower())

        # Verifica se arquivo origem existe
        if not origem_path.exists():
            logger.error(f"Arquivo não encontrado: {origem_path}")
            manifesto['erros'] += 1
            manifesto['mapeamento'].append({
                "origem": doc['arquivo_original'],
                "destino": None,
                "tipo": tipo,
                "erro": "Arquivo origem não encontrado"
            })
            continue

        # Gera nome do arquivo destino
        dest_name = generate_destination_name(doc, dest_folder, existing_by_folder[tipo])
        dest_path = dest_folder / dest_name

        # Adiciona ao rastreamento
        existing_by_folder[tipo].add(dest_name.lower())

        # Atualiza estatísticas
        if tipo not in manifesto['estatisticas_destino']:
            manifesto['estatisticas_destino'][tipo] = 0
        manifesto['estatisticas_destino'][tipo] += 1

        # Copia o arquivo (ou simula)
        if dry_run:
            logger.info(f"[DRY-RUN] Copiaria: {origem_path.name} -> {tipo}/{dest_name}")
        else:
            try:
                # Garante que a pasta destino existe
                dest_folder.mkdir(parents=True, exist_ok=True)

                # Copia o arquivo
                shutil.copy2(origem_path, dest_path)
                logger.info(f"Copiado: {origem_path.name} -> {tipo}/{dest_name}")
            except Exception as e:
                logger.error(f"Erro ao copiar {origem_path}: {e}")
                manifesto['erros'] += 1
                manifesto['mapeamento'].append({
                    "origem": doc['arquivo_original'],
                    "destino": None,
                    "tipo": tipo,
                    "erro": str(e)
                })
                continue

        manifesto['copiados'] += 1
        manifesto['mapeamento'].append({
            "origem": doc['arquivo_original'],
            "destino": f"{tipo}/{dest_name}",
            "tipo": tipo,
            "pessoa": doc.get('pessoa'),
            "origem_escritura": doc['origem'],
            "confianca": doc.get('confianca', 0)
        })

    # Salva o manifesto
    if not dry_run:
        MANIFESTO_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(MANIFESTO_PATH, 'w', encoding='utf-8') as f:
            json.dump(manifesto, f, ensure_ascii=False, indent=2)
        logger.info(f"Manifesto salvo em: {MANIFESTO_PATH}")

    return manifesto


def print_summary(manifesto: dict):
    """Imprime resumo da organização."""
    print("\n" + "="*60)
    print("RESUMO DA ORGANIZAÇÃO")
    print("="*60)
    print(f"Dry run:             {'Sim' if manifesto['dry_run'] else 'Não'}")
    print(f"Total de documentos: {manifesto['total_documentos']}")
    print(f"Copiados:            {manifesto['copiados']}")
    print(f"Erros:               {manifesto['erros']}")
    print("\nDocumentos por tipo:")
    for tipo, count in sorted(manifesto['estatisticas_destino'].items()):
        print(f"  {tipo}: {count}")
    print("="*60)


def main():
    parser = argparse.ArgumentParser(
        description='Organiza documentos por tipo em pastas específicas.'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Simula a organização sem copiar arquivos'
    )

    args = parser.parse_args()

    try:
        manifesto = organize_documents(dry_run=args.dry_run)
        print_summary(manifesto)
        return 0
    except Exception as e:
        logger.error(f"Erro: {e}")
        return 1


if __name__ == '__main__':
    exit(main())
