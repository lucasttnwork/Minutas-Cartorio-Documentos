#!/usr/bin/env python3
"""
analyze_nomenclature.py - Analisa nomenclatura dos campos extraidos

Compara campos extraidos dos Markdown com o sistema canonico,
identifica divergencias e sugere correcoes usando fuzzy matching.

Uso:
    python execution/nomenclature/analyze_nomenclature.py --input .tmp/extraction_results/all_fields.json --output .tmp/analysis/
    python execution/nomenclature/analyze_nomenclature.py --input .tmp/extraction_results/ --report

Autor: Pipeline de Minutas
Data: Janeiro 2026
Versao: 1.0
"""

import argparse
import json
import logging
import re
import sys
from collections import defaultdict
from datetime import datetime
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Importa o normalizador existente
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from execution.nomenclature.normalizer import FieldNormalizer, get_normalizer

# Configuracao de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Diretorio base do projeto
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def similarity_ratio(a: str, b: str) -> float:
    """
    Calcula a similaridade entre duas strings usando SequenceMatcher.

    Args:
        a: Primeira string
        b: Segunda string

    Returns:
        Ratio de similaridade (0.0 a 1.0)
    """
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def normalize_for_comparison(field_name: str) -> str:
    """
    Normaliza um nome de campo para comparacao.

    Args:
        field_name: Nome do campo

    Returns:
        Nome normalizado (lowercase, sem underscores/espacos extras)
    """
    # Lowercase e remove espacos/underscores extras
    normalized = field_name.lower().strip()
    normalized = re.sub(r'[\s_]+', '_', normalized)
    normalized = re.sub(r'[^a-z0-9_]', '', normalized)
    return normalized


def find_best_canonical_match(
    field_name: str,
    normalizer: FieldNormalizer,
    threshold: float = 0.65
) -> Optional[Tuple[str, float, str]]:
    """
    Encontra o melhor match canonico para um campo usando fuzzy matching.

    Args:
        field_name: Nome do campo a ser mapeado
        normalizer: Instancia do FieldNormalizer
        threshold: Limiar minimo de similaridade

    Returns:
        Tupla (canonical_id, score, motivo) ou None
    """
    # Primeiro tenta match direto
    direct_match = normalizer.to_canonical(field_name)
    if direct_match:
        return (direct_match, 1.0, "match_direto")

    # Normaliza para comparacao
    normalized_field = normalize_for_comparison(field_name)

    # Coleta todos os aliases conhecidos
    all_aliases = normalizer._alias_to_canonical

    best_match = None
    best_score = 0.0

    for alias, canonical_id in all_aliases.items():
        normalized_alias = normalize_for_comparison(alias)
        score = similarity_ratio(normalized_field, normalized_alias)

        if score > best_score:
            best_score = score
            best_match = canonical_id

    if best_score >= threshold:
        return (best_match, best_score, "fuzzy_match")

    return None


def analyze_extracted_fields(
    extracted_data: Dict[str, Any],
    normalizer: FieldNormalizer
) -> Dict[str, Any]:
    """
    Analisa campos extraidos e identifica divergencias.

    Args:
        extracted_data: Dados extraidos pelo extract_md_fields.py
        normalizer: Instancia do FieldNormalizer

    Returns:
        Resultado da analise
    """
    analysis = {
        "version": "1.0",
        "analysis_date": datetime.now().isoformat(),
        "summary": {
            "total_fields_analyzed": 0,
            "mapped_directly": 0,
            "mapped_fuzzy": 0,
            "unmapped": 0,
            "by_document": {},
            "by_category": defaultdict(lambda: {"total": 0, "mapped": 0, "unmapped": 0})
        },
        "mappings": {
            "direct": [],
            "fuzzy": [],
            "unmapped": []
        },
        "divergences": [],
        "missing_aliases": [],
        "by_document": {}
    }

    # Processa cada documento
    for doc_name, doc_data in extracted_data.get("documents", {}).items():
        doc_analysis = {
            "campos_uteis": {"mapped": [], "unmapped": []},
            "campos_completos": {"mapped": [], "unmapped": []}
        }

        for folder, folder_data in doc_data.items():
            if folder not in ["campos-uteis", "campos-completos"]:
                continue

            for field_entry in folder_data.get("fields", []):
                campo = field_entry.get("campo")
                categoria = field_entry.get("categoria")
                linha = field_entry.get("linha")

                if not campo:
                    continue

                analysis["summary"]["total_fields_analyzed"] += 1

                # Tenta mapear
                match_result = find_best_canonical_match(campo, normalizer)

                field_record = {
                    "documento": doc_name,
                    "pasta": folder,
                    "campo": campo,
                    "categoria": categoria,
                    "linha": linha
                }

                if match_result:
                    canonical_id, score, match_type = match_result
                    field_record["canonical_id"] = canonical_id
                    field_record["score"] = score
                    field_record["match_type"] = match_type

                    if match_type == "match_direto":
                        analysis["summary"]["mapped_directly"] += 1
                        analysis["mappings"]["direct"].append(field_record)
                        doc_analysis[folder.replace("-", "_")]["mapped"].append(field_record)
                    else:
                        analysis["summary"]["mapped_fuzzy"] += 1
                        analysis["mappings"]["fuzzy"].append(field_record)
                        doc_analysis[folder.replace("-", "_")]["mapped"].append(field_record)

                        # Adiciona como divergencia se score < 0.9
                        if score < 0.9:
                            analysis["divergences"].append({
                                **field_record,
                                "sugestao": canonical_id,
                                "confianca": score,
                                "acao_recomendada": "adicionar_alias" if score >= 0.75 else "revisar_manualmente"
                            })
                else:
                    analysis["summary"]["unmapped"] += 1
                    analysis["mappings"]["unmapped"].append(field_record)
                    doc_analysis[folder.replace("-", "_")]["unmapped"].append(field_record)

                    # Sugere alias se possivel
                    analysis["missing_aliases"].append({
                        **field_record,
                        "sugestao": None,
                        "acao_recomendada": "criar_campo_ou_alias"
                    })

                # Atualiza estatisticas por categoria
                cat_key = categoria or "unknown"
                analysis["summary"]["by_category"][cat_key]["total"] += 1
                if match_result:
                    analysis["summary"]["by_category"][cat_key]["mapped"] += 1
                else:
                    analysis["summary"]["by_category"][cat_key]["unmapped"] += 1

        # Salva analise por documento
        analysis["by_document"][doc_name] = doc_analysis

        # Estatisticas por documento
        mapped_count = (
            len(doc_analysis["campos_uteis"]["mapped"]) +
            len(doc_analysis["campos_completos"]["mapped"])
        )
        unmapped_count = (
            len(doc_analysis["campos_uteis"]["unmapped"]) +
            len(doc_analysis["campos_completos"]["unmapped"])
        )
        analysis["summary"]["by_document"][doc_name] = {
            "mapped": mapped_count,
            "unmapped": unmapped_count,
            "total": mapped_count + unmapped_count
        }

    # Converte defaultdict para dict normal
    analysis["summary"]["by_category"] = dict(analysis["summary"]["by_category"])

    return analysis


def detect_inconsistencies_between_folders(
    extracted_data: Dict[str, Any],
    normalizer: FieldNormalizer
) -> List[Dict[str, Any]]:
    """
    Detecta inconsistencias entre campos-uteis e campos-completos para o mesmo documento.

    Args:
        extracted_data: Dados extraidos
        normalizer: Instancia do FieldNormalizer

    Returns:
        Lista de inconsistencias encontradas
    """
    inconsistencies = []

    for doc_name, doc_data in extracted_data.get("documents", {}).items():
        campos_uteis_fields = set()
        campos_completos_fields = set()

        # Extrai campos de cada pasta
        if "campos-uteis" in doc_data:
            for f in doc_data["campos-uteis"].get("fields", []):
                campos_uteis_fields.add(normalize_for_comparison(f.get("campo", "")))

        if "campos-completos" in doc_data:
            for f in doc_data["campos-completos"].get("fields", []):
                campos_completos_fields.add(normalize_for_comparison(f.get("campo", "")))

        # Campos em campos-uteis que nao estao em campos-completos (possivel erro)
        # Nota: campos-uteis e um subconjunto de campos-completos
        only_in_uteis = campos_uteis_fields - campos_completos_fields
        if only_in_uteis:
            inconsistencies.append({
                "documento": doc_name,
                "tipo": "campo_uteis_nao_em_completos",
                "campos": list(only_in_uteis),
                "descricao": "Campos em campos-uteis que nao aparecem em campos-completos"
            })

    return inconsistencies


def generate_markdown_report(analysis: Dict[str, Any], output_path: Path) -> None:
    """
    Gera relatorio Markdown legivel.

    Args:
        analysis: Resultado da analise
        output_path: Caminho do arquivo de saida
    """
    report = []
    report.append("# Relatorio de Analise de Nomenclatura\n")
    report.append(f"**Data da Analise**: {analysis['analysis_date']}\n")
    report.append("---\n")

    # Resumo
    summary = analysis["summary"]
    report.append("## Resumo\n")
    report.append(f"- **Total de campos analisados**: {summary['total_fields_analyzed']}")
    report.append(f"- **Mapeados diretamente**: {summary['mapped_directly']} ({summary['mapped_directly']/max(1, summary['total_fields_analyzed'])*100:.1f}%)")
    report.append(f"- **Mapeados por fuzzy match**: {summary['mapped_fuzzy']} ({summary['mapped_fuzzy']/max(1, summary['total_fields_analyzed'])*100:.1f}%)")
    report.append(f"- **Nao mapeados**: {summary['unmapped']} ({summary['unmapped']/max(1, summary['total_fields_analyzed'])*100:.1f}%)")
    report.append("")

    # Por categoria
    report.append("### Por Categoria\n")
    report.append("| Categoria | Total | Mapeados | Nao Mapeados |")
    report.append("|-----------|-------|----------|--------------|")
    for cat, stats in sorted(summary.get("by_category", {}).items()):
        report.append(f"| {cat} | {stats['total']} | {stats['mapped']} | {stats['unmapped']} |")
    report.append("")

    # Divergencias
    report.append("## Divergencias Encontradas\n")
    if analysis["divergences"]:
        report.append("| Documento | Campo | Sugestao | Confianca | Acao |")
        report.append("|-----------|-------|----------|-----------|------|")
        for div in analysis["divergences"][:50]:  # Limita a 50
            report.append(
                f"| {div['documento']} | `{div['campo']}` | `{div['sugestao']}` | "
                f"{div['confianca']:.2f} | {div['acao_recomendada']} |"
            )
        if len(analysis["divergences"]) > 50:
            report.append(f"\n*... e mais {len(analysis['divergences']) - 50} divergencias*\n")
    else:
        report.append("Nenhuma divergencia encontrada.\n")
    report.append("")

    # Campos nao mapeados
    report.append("## Campos Nao Mapeados\n")
    if analysis["missing_aliases"]:
        report.append("Campos que nao tem correspondencia no sistema canonico:\n")
        report.append("| Documento | Campo | Categoria | Pasta |")
        report.append("|-----------|-------|-----------|-------|")
        for item in analysis["missing_aliases"][:30]:
            report.append(
                f"| {item['documento']} | `{item['campo']}` | "
                f"{item.get('categoria', 'N/A')} | {item.get('pasta', 'N/A')} |"
            )
        if len(analysis["missing_aliases"]) > 30:
            report.append(f"\n*... e mais {len(analysis['missing_aliases']) - 30} campos nao mapeados*\n")
    else:
        report.append("Todos os campos foram mapeados.\n")
    report.append("")

    # Estatisticas por documento
    report.append("## Por Documento\n")
    report.append("| Documento | Mapeados | Nao Mapeados | Total |")
    report.append("|-----------|----------|--------------|-------|")
    for doc, stats in sorted(summary.get("by_document", {}).items()):
        report.append(f"| {doc} | {stats['mapped']} | {stats['unmapped']} | {stats['total']} |")
    report.append("")

    # Escreve arquivo
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))

    logger.info(f"Relatorio Markdown salvo em: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Analisa nomenclatura dos campos extraidos"
    )

    parser.add_argument(
        "--input", "-i",
        type=str,
        required=True,
        help="Caminho do arquivo JSON de extracao ou diretorio"
    )

    parser.add_argument(
        "--output", "-o",
        type=str,
        help="Diretorio para salvar resultados da analise"
    )

    parser.add_argument(
        "--report",
        action="store_true",
        help="Gera apenas relatorio no console (sem salvar)"
    )

    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Modo verbose"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Carrega dados extraidos
    input_path = Path(args.input)

    if input_path.is_dir():
        # Procura por arquivos JSON no diretorio
        json_files = list(input_path.glob("*.json"))
        if not json_files:
            print(f"Nenhum arquivo JSON encontrado em: {input_path}")
            return 1
        input_path = json_files[0]  # Usa o primeiro

    if not input_path.exists():
        print(f"Arquivo nao encontrado: {input_path}")
        return 1

    logger.info(f"Carregando dados de: {input_path}")
    with open(input_path, 'r', encoding='utf-8') as f:
        extracted_data = json.load(f)

    # Inicializa normalizador
    normalizer = get_normalizer()
    logger.info(f"Normalizador carregado com {len(normalizer._alias_to_canonical)} aliases")

    # Executa analise
    logger.info("Analisando campos...")
    analysis = analyze_extracted_fields(extracted_data, normalizer)

    # Detecta inconsistencias entre pastas
    inconsistencies = detect_inconsistencies_between_folders(extracted_data, normalizer)
    analysis["inconsistencies"] = inconsistencies

    # Output
    if args.report:
        # Apenas console
        print("\n" + "=" * 70)
        print("ANALISE DE NOMENCLATURA")
        print("=" * 70)

        summary = analysis["summary"]
        print(f"\nTotal de campos analisados: {summary['total_fields_analyzed']}")
        print(f"Mapeados diretamente: {summary['mapped_directly']}")
        print(f"Mapeados por fuzzy: {summary['mapped_fuzzy']}")
        print(f"Nao mapeados: {summary['unmapped']}")

        print("\n--- Divergencias (Top 10) ---")
        for div in analysis["divergences"][:10]:
            print(f"  {div['documento']}: '{div['campo']}' -> '{div['sugestao']}' ({div['confianca']:.2f})")

        print("\n--- Campos Nao Mapeados (Top 10) ---")
        for item in analysis["missing_aliases"][:10]:
            print(f"  {item['documento']}: '{item['campo']}' ({item.get('categoria', 'N/A')})")

        return 0

    # Salva resultados
    if args.output:
        output_dir = Path(args.output)
        output_dir.mkdir(parents=True, exist_ok=True)

        # JSON completo
        analysis_path = output_dir / "analysis_results.json"
        with open(analysis_path, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)
        logger.info(f"Resultados JSON salvos em: {analysis_path}")

        # Divergencias separadas
        divergences_path = output_dir / "divergences.json"
        with open(divergences_path, 'w', encoding='utf-8') as f:
            json.dump(analysis["divergences"], f, ensure_ascii=False, indent=2)
        logger.info(f"Divergencias salvas em: {divergences_path}")

        # Aliases faltantes
        missing_path = output_dir / "missing_aliases.json"
        with open(missing_path, 'w', encoding='utf-8') as f:
            json.dump(analysis["missing_aliases"], f, ensure_ascii=False, indent=2)
        logger.info(f"Aliases faltantes salvos em: {missing_path}")

        # Relatorio Markdown
        report_path = output_dir / "RELATORIO.md"
        generate_markdown_report(analysis, report_path)

        print(f"\nResultados salvos em: {output_dir}")
        print(f"  - analysis_results.json")
        print(f"  - divergences.json")
        print(f"  - missing_aliases.json")
        print(f"  - RELATORIO.md")
    else:
        # Imprime JSON no stdout
        print(json.dumps(analysis, ensure_ascii=False, indent=2))

    return 0


if __name__ == "__main__":
    sys.exit(main())
