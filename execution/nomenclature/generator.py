#!/usr/bin/env python3
"""
generator.py - Gerador de Documentacao Automatica

Este modulo gera documentacao em Markdown a partir das definicoes
canonicas de campos.

Uso:
    python execution/nomenclature/generator.py
    python execution/nomenclature/generator.py --output-dir docs/campos

Autor: Pipeline de Minutas
Data: Janeiro 2026
Versao: 2.0
"""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Diretorio base
NOMENCLATURE_DIR = Path(__file__).resolve().parent
ROOT_DIR = NOMENCLATURE_DIR.parent.parent


def load_canonical_fields() -> Dict:
    """Carrega definicoes de campos canonicos."""
    filepath = NOMENCLATURE_DIR / "canonical_fields.json"
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_transformations() -> Dict:
    """Carrega transformacoes por tipo de documento."""
    filepath = NOMENCLATURE_DIR / "transformations.json"
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def generate_category_doc(category_name: str, category_data: Dict) -> str:
    """
    Gera documentacao Markdown para uma categoria de campos.

    Args:
        category_name: Nome da categoria
        category_data: Dados da categoria

    Returns:
        Conteudo Markdown
    """
    lines = []
    lines.append(f"# {category_data.get('description', category_name).upper()}")
    lines.append("")
    lines.append(f"**Prefixo padrao:** `{category_data.get('prefix', 'N/A')}`")
    lines.append("")
    lines.append("## Campos")
    lines.append("")
    lines.append("| ID Canonico | Display | Tipo | Obrigatorio | Descricao |")
    lines.append("|-------------|---------|------|-------------|-----------|")

    for field_id, field_data in sorted(category_data.get("fields", {}).items()):
        display = field_data.get("display_name", field_id)
        tipo = field_data.get("type", "string")
        required = "Sim" if field_data.get("required_in_minuta", False) else "Nao"
        desc = field_data.get("description", "")
        lines.append(f"| `{field_id}` | {display} | {tipo} | {required} | {desc} |")

    lines.append("")
    lines.append("## Detalhes dos Campos")
    lines.append("")

    for field_id, field_data in sorted(category_data.get("fields", {}).items()):
        lines.append(f"### {field_id}")
        lines.append("")
        lines.append(f"- **Display:** {field_data.get('display_name', field_id)}")
        lines.append(f"- **Display PT:** {field_data.get('display_name_pt', field_id)}")
        lines.append(f"- **Tipo:** {field_data.get('type', 'string')}")
        lines.append(f"- **Obrigatorio na Minuta:** {'Sim' if field_data.get('required_in_minuta', False) else 'Nao'}")
        lines.append(f"- **Descricao:** {field_data.get('description', 'N/A')}")
        lines.append(f"- **Exemplo:** `{field_data.get('example', 'N/A')}`")

        sources = field_data.get("sources", [])
        if sources:
            lines.append(f"- **Fontes:** {', '.join(sources)}")

        normalization = field_data.get("normalization", {})
        if normalization:
            norm_str = ", ".join(f"{k}={v}" for k, v in normalization.items())
            lines.append(f"- **Normalizacao:** {norm_str}")

        validation = field_data.get("validation")
        if validation:
            lines.append(f"- **Validacao:** {validation}")

        enum_values = field_data.get("enum", [])
        if enum_values:
            lines.append(f"- **Valores permitidos:** {', '.join(enum_values)}")

        lines.append("")

    return "\n".join(lines)


def generate_document_type_doc(doc_type: str, transforms: Dict, canonical_fields: Dict) -> str:
    """
    Gera documentacao para um tipo de documento.

    Args:
        doc_type: Tipo do documento
        transforms: Transformacoes do documento
        canonical_fields: Definicoes canonicas

    Returns:
        Conteudo Markdown
    """
    lines = []
    lines.append(f"# Campos Extraiveis: {doc_type}")
    lines.append("")
    lines.append(f"**Descricao:** {transforms.get('description', 'N/A')}")
    lines.append(f"**Categoria de saida:** {transforms.get('output_category', 'misto')}")
    lines.append("")

    # Lista campos mapeados
    nested_to_flat = transforms.get("nested_to_flat", {})
    if nested_to_flat:
        lines.append("## Mapeamento de Campos")
        lines.append("")
        lines.append("| Campo no Documento | Campo Canonico | Display |")
        lines.append("|-------------------|----------------|---------|")

        for source_path, canonical_id in sorted(nested_to_flat.items()):
            # Busca display name
            display = canonical_id
            for cat_data in canonical_fields.get("categories", {}).values():
                if canonical_id in cat_data.get("fields", {}):
                    display = cat_data["fields"][canonical_id].get("display_name", canonical_id)
                    break

            lines.append(f"| `{source_path}` | `{canonical_id}` | {display} |")

        lines.append("")

    # Lista renames
    field_renames = transforms.get("field_renames", {})
    if field_renames:
        lines.append("## Renomeacoes Diretas")
        lines.append("")
        lines.append("| Campo Original | Campo Canonico |")
        lines.append("|----------------|----------------|")

        for original, canonical_id in sorted(field_renames.items()):
            lines.append(f"| `{original}` | `{canonical_id}` |")

        lines.append("")

    return "\n".join(lines)


def generate_index_doc(canonical_fields: Dict, transformations: Dict) -> str:
    """
    Gera documento indice.

    Args:
        canonical_fields: Definicoes canonicas
        transformations: Transformacoes

    Returns:
        Conteudo Markdown
    """
    lines = []
    lines.append("# Biblioteca de Nomenclatura de Campos")
    lines.append("")
    lines.append(f"**Versao:** {canonical_fields.get('version', 'N/A')}")
    lines.append(f"**Ultima atualizacao:** {canonical_fields.get('last_updated', 'N/A')}")
    lines.append(f"**Total de campos:** {canonical_fields.get('total_fields', 0)}")
    lines.append("")
    lines.append("## Categorias de Campos")
    lines.append("")

    for category_name, category_data in canonical_fields.get("categories", {}).items():
        num_fields = len(category_data.get("fields", {}))
        prefix = category_data.get("prefix", "")
        desc = category_data.get("description", "")
        lines.append(f"- **{category_name}** ({num_fields} campos)")
        lines.append(f"  - Prefixo: `{prefix}`")
        lines.append(f"  - {desc}")
        lines.append("")

    lines.append("## Tipos de Documento Suportados")
    lines.append("")

    doc_transforms = transformations.get("document_transformations", {})
    for doc_type in sorted(doc_transforms.keys()):
        doc_data = doc_transforms[doc_type]
        num_mappings = len(doc_data.get("nested_to_flat", {}))
        output_cat = doc_data.get("output_category", "misto")
        lines.append(f"- **{doc_type}** ({num_mappings} mapeamentos, categoria: {output_cat})")

    lines.append("")
    lines.append("## Como Usar")
    lines.append("")
    lines.append("```python")
    lines.append("from execution.nomenclature.normalizer import FieldNormalizer")
    lines.append("")
    lines.append("# Inicializa o normalizador")
    lines.append("normalizer = FieldNormalizer()")
    lines.append("")
    lines.append("# Converte nome de campo para ID canonico")
    lines.append('canonical_id = normalizer.to_canonical("nome_completo")')
    lines.append('# Resultado: "pn_nome"')
    lines.append("")
    lines.append("# Converte ID canonico para nome de exibicao")
    lines.append('display_name = normalizer.to_display("pn_nome")')
    lines.append('# Resultado: "NOME"')
    lines.append("")
    lines.append("# Normaliza dados extraidos de um documento")
    lines.append('data = {"nome_completo": "MARINA AYUB", "filiacao": {"pai": "JOSE"}}')
    lines.append('normalized = normalizer.normalize_extracted_data(data, "RG")')
    lines.append('# Resultado: {"pn_nome": "MARINA AYUB", "pn_filiacao_pai": "JOSE"}')
    lines.append("```")
    lines.append("")
    lines.append(f"---")
    lines.append(f"*Documentacao gerada automaticamente em {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}*")

    return "\n".join(lines)


def generate_all_docs(output_dir: Optional[Path] = None) -> None:
    """
    Gera toda a documentacao.

    Args:
        output_dir: Diretorio de saida (default: Guia-de-campos-e-variaveis/)
    """
    if output_dir is None:
        output_dir = ROOT_DIR / "Guia-de-campos-e-variaveis" / "canonicos"

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Gerando documentacao em: {output_dir}")

    # Carrega dados
    canonical_fields = load_canonical_fields()
    transformations = load_transformations()

    # Gera indice
    index_content = generate_index_doc(canonical_fields, transformations)
    index_path = output_dir / "README.md"
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)
    print(f"  - Gerado: {index_path}")

    # Gera documentacao por categoria
    categories_dir = output_dir / "categorias"
    categories_dir.mkdir(exist_ok=True)

    for category_name, category_data in canonical_fields.get("categories", {}).items():
        content = generate_category_doc(category_name, category_data)
        filepath = categories_dir / f"{category_name}.md"
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  - Gerado: {filepath}")

    # Gera documentacao por tipo de documento
    docs_dir = output_dir / "documentos"
    docs_dir.mkdir(exist_ok=True)

    for doc_type, transforms in transformations.get("document_transformations", {}).items():
        content = generate_document_type_doc(doc_type, transforms, canonical_fields)
        filepath = docs_dir / f"{doc_type}.md"
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  - Gerado: {filepath}")

    print(f"\nDocumentacao gerada com sucesso!")


def main():
    """Funcao principal."""
    parser = argparse.ArgumentParser(
        description="Gera documentacao automatica a partir das definicoes canonicas"
    )
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=None,
        help="Diretorio de saida para a documentacao"
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help="Saida detalhada"
    )

    args = parser.parse_args()

    generate_all_docs(args.output_dir)


if __name__ == "__main__":
    main()
