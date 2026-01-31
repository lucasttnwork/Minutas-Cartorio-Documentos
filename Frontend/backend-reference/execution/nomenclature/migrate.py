#!/usr/bin/env python3
"""
migrate.py - Script de Migracao Inicial

Este script extrai campos das fontes existentes e popula a biblioteca
de nomenclatura com aliases adicionais encontrados.

Funcoes principais:
1. Analisa mapeamento_documento_campos.json existente
2. Analisa schemas em execution/schemas/
3. Analisa extracoes reais em .tmp/contextual/
4. Adiciona aliases descobertos ao aliases.json

Uso:
    python execution/nomenclature/migrate.py --analyze
    python execution/nomenclature/migrate.py --update-aliases
    python execution/nomenclature/migrate.py --report

Autor: Pipeline de Minutas
Data: Janeiro 2026
Versao: 2.0
"""

import argparse
import json
import os
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

# Diretorios
NOMENCLATURE_DIR = Path(__file__).resolve().parent
ROOT_DIR = NOMENCLATURE_DIR.parent.parent
EXECUTION_DIR = ROOT_DIR / "execution"
SCHEMAS_DIR = EXECUTION_DIR / "schemas"
TMP_DIR = ROOT_DIR / ".tmp"
CONTEXTUAL_DIR = TMP_DIR / "contextual"


def load_json_file(filepath: Path) -> Dict:
    """Carrega arquivo JSON."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Erro ao carregar {filepath}: {e}")
        return {}


def save_json_file(filepath: Path, data: Dict) -> None:
    """Salva arquivo JSON."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def analyze_mapping_file() -> Dict[str, Set[str]]:
    """
    Analisa mapeamento_documento_campos.json e extrai campos por categoria.

    Returns:
        Dicionario {categoria: set de campos}
    """
    filepath = EXECUTION_DIR / "mapeamento_documento_campos.json"
    data = load_json_file(filepath)

    fields_by_category = defaultdict(set)

    # Extrai field_definitions
    field_definitions = data.get("field_definitions", {})
    for category, fields in field_definitions.items():
        for field_name in fields.keys():
            fields_by_category[category].add(field_name)

    # Extrai document_field_mapping
    doc_mapping = data.get("document_field_mapping", {})
    for doc_type, categories in doc_mapping.items():
        for category, fields in categories.items():
            for field_name in fields:
                fields_by_category[category].add(field_name)

    return dict(fields_by_category)


def analyze_schemas() -> Dict[str, List[str]]:
    """
    Analisa schemas em execution/schemas/ e extrai nomes de campos.

    Returns:
        Dicionario {tipo_documento: lista de campos}
    """
    fields_by_schema = {}

    if not SCHEMAS_DIR.exists():
        print(f"Diretorio de schemas nao encontrado: {SCHEMAS_DIR}")
        return fields_by_schema

    for schema_file in SCHEMAS_DIR.glob("*.json"):
        schema = load_json_file(schema_file)
        doc_type = schema.get("tipo_documento", schema_file.stem.upper())

        campos = []
        for campo in schema.get("campos", []):
            campo_nome = campo.get("nome", "")
            if campo_nome:
                campos.append(campo_nome)

            # Extrai campos internos de tipos complexos
            for campo_interno in campo.get("campos_internos", []):
                interno_nome = campo_interno.get("nome", "")
                if interno_nome:
                    campos.append(f"{campo_nome}.{interno_nome}")

        fields_by_schema[doc_type] = campos

    return fields_by_schema


def analyze_extractions() -> Dict[str, Set[str]]:
    """
    Analisa extracoes reais em .tmp/contextual/ e coleta todos os campos usados.

    Returns:
        Dicionario {tipo_documento: set de caminhos de campo}
    """
    fields_by_extraction = defaultdict(set)

    if not CONTEXTUAL_DIR.exists():
        print(f"Diretorio de extracoes nao encontrado: {CONTEXTUAL_DIR}")
        return dict(fields_by_extraction)

    def collect_paths(obj: Any, prefix: str = "") -> Set[str]:
        """Coleta todos os caminhos de um objeto."""
        paths = set()
        if isinstance(obj, dict):
            for key, value in obj.items():
                new_prefix = f"{prefix}.{key}" if prefix else key
                paths.add(new_prefix)
                paths.update(collect_paths(value, new_prefix))
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                new_prefix = f"{prefix}[{i}]"
                paths.update(collect_paths(item, new_prefix))
        return paths

    # Itera por todas as pastas de caso
    for caso_dir in CONTEXTUAL_DIR.iterdir():
        if not caso_dir.is_dir():
            continue

        for json_file in caso_dir.glob("*.json"):
            try:
                data = load_json_file(json_file)

                # Tenta identificar tipo do documento
                doc_type = data.get("tipo_documento", "DESCONHECIDO")
                if doc_type == "DESCONHECIDO":
                    # Tenta inferir do nome do arquivo
                    filename_upper = json_file.stem.upper()
                    for tipo in ["RG", "CNH", "CNDT", "ITBI", "MATRICULA", "ESCRITURA"]:
                        if tipo in filename_upper:
                            doc_type = tipo
                            break

                # Coleta caminhos
                paths = collect_paths(data)
                fields_by_extraction[doc_type].update(paths)

            except Exception as e:
                print(f"Erro ao processar {json_file}: {e}")

    return dict(fields_by_extraction)


def find_unmapped_fields(
    canonical_fields: Dict,
    aliases: Dict,
    discovered_fields: Set[str]
) -> List[str]:
    """
    Encontra campos que nao tem mapeamento para IDs canonicos.

    Args:
        canonical_fields: Definicoes canonicas
        aliases: Mapeamento de aliases
        discovered_fields: Campos descobertos nas fontes

    Returns:
        Lista de campos sem mapeamento
    """
    # Coleta todos os aliases conhecidos
    known_aliases = set()

    # IDs canonicos
    for cat_data in canonical_fields.get("categories", {}).values():
        known_aliases.update(cat_data.get("fields", {}).keys())

    # Aliases
    for mapping in aliases.get("alias_mappings", {}).values():
        for alias_entry in mapping.get("aliases", []):
            known_aliases.add(alias_entry.get("alias", "").lower())

    # Encontra campos nao mapeados
    unmapped = []
    for field in discovered_fields:
        field_lower = field.lower()
        # Remove indices de array
        field_clean = field_lower.replace("[0]", "").replace("[*]", "")

        if field_clean not in known_aliases:
            unmapped.append(field)

    return sorted(unmapped)


def generate_migration_report() -> Dict:
    """
    Gera relatorio completo de migracao.

    Returns:
        Dicionario com estatisticas e campos descobertos
    """
    print("Analisando fontes de dados...")

    # Analisa fontes
    mapping_fields = analyze_mapping_file()
    schema_fields = analyze_schemas()
    extraction_fields = analyze_extractions()

    # Carrega definicoes atuais
    canonical_fields = load_json_file(NOMENCLATURE_DIR / "canonical_fields.json")
    aliases = load_json_file(NOMENCLATURE_DIR / "aliases.json")

    # Consolida todos os campos descobertos
    all_fields = set()
    for fields in mapping_fields.values():
        all_fields.update(fields)
    for fields in schema_fields.values():
        all_fields.update(fields)
    for fields in extraction_fields.values():
        all_fields.update(fields)

    # Encontra campos nao mapeados
    unmapped = find_unmapped_fields(canonical_fields, aliases, all_fields)

    report = {
        "analysis_date": str(Path(__file__).stat().st_mtime),
        "sources_analyzed": {
            "mapping_file": {
                "categories": len(mapping_fields),
                "total_fields": sum(len(f) for f in mapping_fields.values())
            },
            "schemas": {
                "documents": len(schema_fields),
                "total_fields": sum(len(f) for f in schema_fields.values())
            },
            "extractions": {
                "documents": len(extraction_fields),
                "total_paths": sum(len(f) for f in extraction_fields.values())
            }
        },
        "canonical_coverage": {
            "total_canonical_fields": canonical_fields.get("total_fields", 0),
            "total_aliases": aliases.get("total_aliases", 0)
        },
        "unmapped_fields": {
            "count": len(unmapped),
            "fields": unmapped[:50]  # Limita para nao ficar muito grande
        },
        "fields_by_source": {
            "mapping": {cat: list(fields) for cat, fields in mapping_fields.items()},
            "schemas": schema_fields,
        }
    }

    return report


def update_aliases_with_discovered(dry_run: bool = True) -> int:
    """
    Atualiza aliases.json com campos descobertos.

    Args:
        dry_run: Se True, apenas mostra o que seria feito

    Returns:
        Numero de aliases adicionados
    """
    # TODO: Implementar logica de sugestao de mapeamento
    # Por enquanto, apenas relata campos nao mapeados

    report = generate_migration_report()
    unmapped = report["unmapped_fields"]["fields"]

    print(f"\nCampos nao mapeados encontrados: {len(unmapped)}")

    if unmapped:
        print("\nExemplos de campos para mapear manualmente:")
        for field in unmapped[:20]:
            print(f"  - {field}")

    if not dry_run:
        print("\nAtualizacao automatica ainda nao implementada.")
        print("Por favor, adicione mapeamentos manualmente em aliases.json")

    return 0


def main():
    """Funcao principal."""
    parser = argparse.ArgumentParser(
        description="Script de migracao para biblioteca de nomenclatura"
    )
    parser.add_argument(
        '--analyze',
        action='store_true',
        help="Analisa fontes de dados existentes"
    )
    parser.add_argument(
        '--report',
        action='store_true',
        help="Gera relatorio de migracao em JSON"
    )
    parser.add_argument(
        '--update-aliases',
        action='store_true',
        help="Atualiza aliases com campos descobertos"
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        default=True,
        help="Apenas mostra o que seria feito (default: True)"
    )
    parser.add_argument(
        '--output',
        type=Path,
        default=None,
        help="Arquivo de saida para relatorio"
    )

    args = parser.parse_args()

    if args.analyze or args.report:
        report = generate_migration_report()

        if args.output:
            save_json_file(args.output, report)
            print(f"\nRelatorio salvo em: {args.output}")
        else:
            print("\n=== RELATORIO DE MIGRACAO ===")
            print(json.dumps(report, indent=2, ensure_ascii=False))

    elif args.update_aliases:
        added = update_aliases_with_discovered(dry_run=args.dry_run)
        print(f"\nAliases adicionados: {added}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
