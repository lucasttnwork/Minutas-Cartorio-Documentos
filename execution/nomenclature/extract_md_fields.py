#!/usr/bin/env python3
"""
extract_md_fields.py - Extrai campos de arquivos Markdown de documentacao

Processa arquivos Markdown linha por linha (eficiente em memoria),
extrai campos das tabelas e detecta categorias pelos headers H3.

Uso:
    python execution/nomenclature/extract_md_fields.py --all --output .tmp/extraction_results/all_fields.json
    python execution/nomenclature/extract_md_fields.py --doc ITBI --folder campos-uteis
    python execution/nomenclature/extract_md_fields.py --list

Autor: Pipeline de Minutas
Data: Janeiro 2026
Versao: 1.0
"""

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Configuracao de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Diretorio base do projeto
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DOCS_DIR = PROJECT_ROOT / "documentacao-campos-extraiveis"

# Mapeamento de headers para categorias canonicas
CATEGORY_PATTERNS = {
    r"pessoa\s*natural": "pessoa_natural",
    r"pessoa\s*juridica": "pessoa_juridica",
    r"dados\s*do\s*imovel": "imovel",
    r"imovel": "imovel",
    r"negocio\s*juridico": "negocio",
    r"negocio": "negocio",
    r"campos\s*raiz": "raiz",
    r"objetos\s*nested": "nested",
    r"arrays": "arrays",
    r"mapeamento": "mapeamento",
}


def detect_category_from_header(header: str) -> Optional[str]:
    """
    Detecta a categoria a partir de um header Markdown.

    Args:
        header: Texto do header (sem ###)

    Returns:
        Nome da categoria ou None
    """
    header_lower = header.lower().strip()

    for pattern, category in CATEGORY_PATTERNS.items():
        if re.search(pattern, header_lower):
            return category

    return None


def is_table_row(line: str) -> bool:
    """Verifica se a linha e uma linha de tabela Markdown (comeca com |)."""
    stripped = line.strip()
    return stripped.startswith("|") and "|" in stripped[1:]


def is_table_separator(line: str) -> bool:
    """Verifica se a linha e um separador de tabela Markdown (|---|...)."""
    stripped = line.strip()
    if not stripped.startswith("|"):
        return False
    # Remove pipes e verifica se contem apenas -, : e espacos
    inner = stripped[1:].rstrip("|")
    parts = inner.split("|")
    for part in parts:
        cleaned = part.strip()
        if cleaned and not re.match(r'^:?-+:?$', cleaned):
            return False
    return len(parts) > 0


def parse_table_row(line: str) -> List[str]:
    """
    Parseia uma linha de tabela Markdown em celulas.

    Args:
        line: Linha da tabela

    Returns:
        Lista de valores das celulas (limpos)
    """
    # Remove pipes externos e divide por pipe
    stripped = line.strip()
    if stripped.startswith("|"):
        stripped = stripped[1:]
    if stripped.endswith("|"):
        stripped = stripped[:-1]

    cells = [cell.strip() for cell in stripped.split("|")]
    return cells


def find_campo_column_index(header_cells: List[str]) -> int:
    """
    Encontra o indice da coluna que contem o nome do campo.

    Args:
        header_cells: Lista de nomes das colunas

    Returns:
        Indice da coluna de campo (0 se nao encontrar especificamente)
    """
    # Padroes para identificar a coluna de campos
    campo_patterns = [
        r"campo\s*mapeado",
        r"^campo$",
        r"subcampo",
        r"campo\s*no\s*schema",
        r"^nome$",
    ]

    for idx, cell in enumerate(header_cells):
        cell_lower = cell.lower().strip()
        for pattern in campo_patterns:
            if re.search(pattern, cell_lower):
                return idx

    # Fallback: primeira coluna
    return 0


def extract_field_name(cell: str) -> Optional[str]:
    """
    Extrai o nome do campo de uma celula da tabela.

    Args:
        cell: Conteudo da celula

    Returns:
        Nome do campo limpo ou None se invalido
    """
    # Remove formatacao Markdown
    clean = cell.strip()

    # Remove codigo inline (`campo`)
    clean = re.sub(r'`([^`]+)`', r'\1', clean)

    # Remove bold (**campo**)
    clean = re.sub(r'\*\*([^*]+)\*\*', r'\1', clean)

    # Remove links [texto](url)
    clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean)

    # Limpa espacos
    clean = clean.strip()

    # Ignora celulas vazias ou com apenas formatacao
    if not clean or clean in ("-", "...", "---", "N/A", "n/a"):
        return None

    # Ignora headers repetidos ou descricoes longas
    if len(clean) > 100:
        return None

    # Ignora se comecar com numeros (provavelmente versao ou secao)
    if re.match(r'^\d+\.', clean):
        return None

    return clean


def extract_fields_from_file(filepath: Path) -> Dict[str, Any]:
    """
    Extrai campos de um arquivo Markdown.

    Args:
        filepath: Caminho do arquivo Markdown

    Returns:
        Dicionario com campos extraidos por categoria
    """
    result = {
        "file": str(filepath.name),
        "folder": str(filepath.parent.name),
        "fields": [],
        "categories": {},
        "total_fields": 0,
        "errors": []
    }

    current_category = None
    in_table = False
    waiting_for_separator = False
    table_header_cells = []
    campo_column_idx = 0
    line_number = 0

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line_number, line in enumerate(f, 1):
                line = line.rstrip('\n\r')

                # Detecta headers H3 para categoria
                if line.startswith("### "):
                    header_text = line[4:].strip()
                    detected = detect_category_from_header(header_text)
                    if detected:
                        current_category = detected
                        if current_category not in result["categories"]:
                            result["categories"][current_category] = []
                    in_table = False
                    waiting_for_separator = False
                    continue

                # Se nao e uma linha de tabela, reseta estado
                if not is_table_row(line):
                    in_table = False
                    waiting_for_separator = False
                    continue

                # Detecta separador de tabela
                if is_table_separator(line):
                    if waiting_for_separator:
                        # Confirma inicio real da tabela (apos header + separator)
                        in_table = True
                        waiting_for_separator = False
                    continue

                # Se ainda nao estamos em tabela, esta linha pode ser o header
                if not in_table and not waiting_for_separator:
                    table_header_cells = parse_table_row(line)
                    campo_column_idx = find_campo_column_index(table_header_cells)
                    waiting_for_separator = True
                    continue

                # Processa linhas de dados da tabela
                if in_table:
                    cells = parse_table_row(line)

                    if len(cells) > campo_column_idx:
                        field_name = extract_field_name(cells[campo_column_idx])

                        if field_name:
                            field_entry = {
                                "campo": field_name,
                                "categoria": current_category or "unknown",
                                "linha": line_number
                            }

                            result["fields"].append(field_entry)

                            if current_category:
                                result["categories"][current_category].append(field_name)

    except Exception as e:
        result["errors"].append(f"Erro ao processar arquivo: {str(e)}")
        logger.error(f"Erro ao processar {filepath}: {e}")

    result["total_fields"] = len(result["fields"])
    return result


def discover_documents() -> Dict[str, List[Path]]:
    """
    Descobre todos os documentos Markdown organizados por pasta.

    Returns:
        Dicionario {pasta: [lista de arquivos]}
    """
    documents = {}

    for folder in ["campos-uteis", "campos-completos"]:
        folder_path = DOCS_DIR / folder
        if folder_path.exists():
            documents[folder] = sorted([
                f for f in folder_path.glob("*.md")
                if f.name != "README.md"
            ])

    return documents


def extract_all_fields(output_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Extrai campos de todos os arquivos Markdown.

    Args:
        output_path: Caminho para salvar resultado (opcional)

    Returns:
        Dicionario completo com todos os campos extraidos
    """
    documents = discover_documents()

    results = {
        "version": "1.0",
        "description": "Campos extraidos de documentacao Markdown",
        "extraction_date": None,  # Sera preenchido pelo caller
        "documents": {},
        "summary": {
            "total_files": 0,
            "total_fields": 0,
            "by_folder": {},
            "by_document": {}
        }
    }

    for folder, files in documents.items():
        results["summary"]["by_folder"][folder] = {
            "files": 0,
            "fields": 0
        }

        for filepath in files:
            doc_name = filepath.stem  # Nome sem extensao

            if doc_name not in results["documents"]:
                results["documents"][doc_name] = {}

            logger.info(f"Extraindo: {folder}/{doc_name}")

            extraction = extract_fields_from_file(filepath)
            results["documents"][doc_name][folder] = extraction

            # Atualiza sumario
            results["summary"]["total_files"] += 1
            results["summary"]["total_fields"] += extraction["total_fields"]
            results["summary"]["by_folder"][folder]["files"] += 1
            results["summary"]["by_folder"][folder]["fields"] += extraction["total_fields"]

            if doc_name not in results["summary"]["by_document"]:
                results["summary"]["by_document"][doc_name] = {
                    "folders": [],
                    "total_fields": 0
                }

            results["summary"]["by_document"][doc_name]["folders"].append(folder)
            results["summary"]["by_document"][doc_name]["total_fields"] += extraction["total_fields"]

    # Adiciona data de extracao
    from datetime import datetime
    results["extraction_date"] = datetime.now().isoformat()

    # Salva se especificado
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        logger.info(f"Resultados salvos em: {output_path}")

    return results


def extract_single_document(doc_name: str, folder: str = "campos-uteis") -> Dict[str, Any]:
    """
    Extrai campos de um documento especifico.

    Args:
        doc_name: Nome do documento (sem extensao)
        folder: Pasta (campos-uteis ou campos-completos)

    Returns:
        Resultado da extracao
    """
    filepath = DOCS_DIR / folder / f"{doc_name}.md"

    if not filepath.exists():
        return {"error": f"Arquivo nao encontrado: {filepath}"}

    return extract_fields_from_file(filepath)


def list_available_documents() -> None:
    """Lista todos os documentos disponiveis."""
    documents = discover_documents()

    print("\n" + "=" * 60)
    print("DOCUMENTOS DISPONIVEIS")
    print("=" * 60)

    for folder, files in documents.items():
        print(f"\n{folder}/ ({len(files)} arquivos)")
        print("-" * 40)
        for f in files:
            print(f"  - {f.stem}")

    print("\n" + "=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Extrai campos de arquivos Markdown de documentacao"
    )

    parser.add_argument(
        "--all",
        action="store_true",
        help="Extrai campos de todos os arquivos"
    )

    parser.add_argument(
        "--doc",
        type=str,
        help="Nome do documento para extrair (ex: ITBI, RG)"
    )

    parser.add_argument(
        "--folder",
        type=str,
        default="campos-uteis",
        choices=["campos-uteis", "campos-completos"],
        help="Pasta do documento (default: campos-uteis)"
    )

    parser.add_argument(
        "--output", "-o",
        type=str,
        help="Caminho para salvar o resultado JSON"
    )

    parser.add_argument(
        "--list",
        action="store_true",
        help="Lista todos os documentos disponiveis"
    )

    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Modo verbose"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Lista documentos
    if args.list:
        list_available_documents()
        return 0

    # Extrai todos
    if args.all:
        output_path = Path(args.output) if args.output else None
        results = extract_all_fields(output_path)

        print("\n" + "=" * 60)
        print("RESUMO DA EXTRACAO")
        print("=" * 60)
        print(f"Total de arquivos: {results['summary']['total_files']}")
        print(f"Total de campos: {results['summary']['total_fields']}")
        print("\nPor pasta:")
        for folder, stats in results['summary']['by_folder'].items():
            print(f"  {folder}: {stats['files']} arquivos, {stats['fields']} campos")

        if not output_path:
            print("\nUse --output para salvar os resultados em JSON")

        return 0

    # Extrai documento especifico
    if args.doc:
        result = extract_single_document(args.doc, args.folder)

        if "error" in result:
            print(f"Erro: {result['error']}")
            return 1

        if args.output:
            output_path = Path(args.output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"Resultado salvo em: {output_path}")
        else:
            print(json.dumps(result, ensure_ascii=False, indent=2))

        return 0

    # Sem argumentos - mostra ajuda
    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
