#!/usr/bin/env python3
"""
apply_normalization.py - Aplica normalizacao de nomenclatura

Modos:
  --dry-run: Mostra o que seria alterado (SEMPRE executar primeiro)
  --apply-aliases: Adiciona novos aliases ao aliases.json
  --update-md: Corrige nomenclatura nos arquivos Markdown
  --full: Executa ambos (aliases + correcao de MD)

Seguranca:
  - Cria backup automatico antes de qualquer alteracao
  - Gera diff detalhado das mudancas propostas
  - Processa primeiro "campos-uteis" como referencia

Uso:
    python execution/nomenclature/apply_normalization.py --dry-run --input .tmp/analysis/
    python execution/nomenclature/apply_normalization.py --apply-aliases --input .tmp/analysis/
    python execution/nomenclature/apply_normalization.py --update-md --input .tmp/analysis/
    python execution/nomenclature/apply_normalization.py --full --input .tmp/analysis/

Autor: Pipeline de Minutas
Data: Janeiro 2026
Versao: 1.0
"""

import argparse
import json
import logging
import re
import shutil
import sys
from datetime import datetime
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
NOMENCLATURE_DIR = Path(__file__).resolve().parent
DOCS_DIR = PROJECT_ROOT / "documentacao-campos-extraiveis"
TMP_DIR = PROJECT_ROOT / ".tmp"


class NormalizationApplier:
    """Classe para aplicar normalizacoes de nomenclatura."""

    def __init__(self, analysis_dir: Path):
        """
        Inicializa o aplicador.

        Args:
            analysis_dir: Diretorio com resultados da analise
        """
        self.analysis_dir = analysis_dir
        self.backup_dir = TMP_DIR / "backups" / datetime.now().strftime("%Y%m%d_%H%M%S")
        self.changes_log = []
        self.aliases_to_add = []
        self.md_changes = []

        # Carrega dados da analise
        self._load_analysis_data()

    def _load_analysis_data(self) -> None:
        """Carrega dados da analise."""
        # Carrega divergencias
        divergences_path = self.analysis_dir / "divergences.json"
        if divergences_path.exists():
            with open(divergences_path, 'r', encoding='utf-8') as f:
                self.divergences = json.load(f)
        else:
            self.divergences = []

        # Carrega aliases faltantes
        missing_path = self.analysis_dir / "missing_aliases.json"
        if missing_path.exists():
            with open(missing_path, 'r', encoding='utf-8') as f:
                self.missing_aliases = json.load(f)
        else:
            self.missing_aliases = []

        # Carrega analise completa
        analysis_path = self.analysis_dir / "analysis_results.json"
        if analysis_path.exists():
            with open(analysis_path, 'r', encoding='utf-8') as f:
                self.full_analysis = json.load(f)
        else:
            self.full_analysis = {}

        logger.info(f"Carregadas {len(self.divergences)} divergencias e {len(self.missing_aliases)} aliases faltantes")

    def create_backup(self, filepath: Path) -> Path:
        """
        Cria backup de um arquivo.

        Args:
            filepath: Caminho do arquivo original

        Returns:
            Caminho do backup
        """
        self.backup_dir.mkdir(parents=True, exist_ok=True)

        # Preserva estrutura relativa
        relative_path = filepath.relative_to(PROJECT_ROOT)
        backup_path = self.backup_dir / relative_path

        backup_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(filepath, backup_path)

        logger.debug(f"Backup criado: {backup_path}")
        return backup_path

    def identify_aliases_to_add(self) -> List[Dict[str, Any]]:
        """
        Identifica aliases que devem ser adicionados ao sistema.

        Returns:
            Lista de aliases a adicionar
        """
        aliases_to_add = []

        # Divergencias com alta confianca (>= 0.75) podem virar aliases
        for div in self.divergences:
            if div.get("confianca", 0) >= 0.75 and div.get("sugestao"):
                aliases_to_add.append({
                    "alias": div["campo"],
                    "canonical_id": div["sugestao"],
                    "context": "markdown",
                    "priority": 70,
                    "source": f"{div['documento']}/{div.get('pasta', 'unknown')}",
                    "confianca": div["confianca"]
                })

        # Remove duplicatas (mesmo alias)
        seen = set()
        unique_aliases = []
        for alias in aliases_to_add:
            key = alias["alias"].lower()
            if key not in seen:
                seen.add(key)
                unique_aliases.append(alias)

        self.aliases_to_add = unique_aliases
        return unique_aliases

    def identify_md_changes(self) -> List[Dict[str, Any]]:
        """
        Identifica mudancas necessarias nos arquivos Markdown.

        Returns:
            Lista de mudancas a fazer
        """
        changes = []

        for div in self.divergences:
            if div.get("confianca", 0) >= 0.75 and div.get("sugestao"):
                changes.append({
                    "documento": div["documento"],
                    "pasta": div.get("pasta", "campos-uteis"),
                    "campo_original": div["campo"],
                    "campo_novo": div["sugestao"],
                    "linha": div.get("linha"),
                    "confianca": div["confianca"]
                })

        self.md_changes = changes
        return changes

    def dry_run(self) -> Dict[str, Any]:
        """
        Executa simulacao (dry-run) e mostra o que seria alterado.

        Returns:
            Relatorio do dry-run
        """
        aliases_to_add = self.identify_aliases_to_add()
        md_changes = self.identify_md_changes()

        report = {
            "mode": "dry-run",
            "timestamp": datetime.now().isoformat(),
            "aliases_to_add": {
                "count": len(aliases_to_add),
                "items": aliases_to_add
            },
            "md_changes": {
                "count": len(md_changes),
                "by_document": {}
            },
            "backup_dir": str(self.backup_dir)
        }

        # Agrupa mudancas MD por documento
        for change in md_changes:
            doc = change["documento"]
            if doc not in report["md_changes"]["by_document"]:
                report["md_changes"]["by_document"][doc] = []
            report["md_changes"]["by_document"][doc].append({
                "pasta": change["pasta"],
                "de": change["campo_original"],
                "para": change["campo_novo"],
                "linha": change["linha"],
                "confianca": change["confianca"]
            })

        return report

    def apply_aliases(self, dry_run: bool = False) -> Dict[str, Any]:
        """
        Adiciona novos aliases ao aliases.json.

        Args:
            dry_run: Se True, apenas simula

        Returns:
            Resultado da operacao
        """
        aliases_to_add = self.identify_aliases_to_add()

        if not aliases_to_add:
            return {"status": "no_changes", "message": "Nenhum alias para adicionar"}

        # Carrega aliases.json atual
        aliases_path = NOMENCLATURE_DIR / "aliases.json"
        with open(aliases_path, 'r', encoding='utf-8') as f:
            aliases_data = json.load(f)

        # Prepara mudancas
        added = []
        skipped = []

        for alias_entry in aliases_to_add:
            canonical_id = alias_entry["canonical_id"]
            alias = alias_entry["alias"]

            # Verifica se alias ja existe
            existing_aliases = aliases_data.get("alias_mappings", {}).get(canonical_id, {}).get("aliases", [])
            existing_alias_names = [a.get("alias", "").lower() for a in existing_aliases]

            if alias.lower() in existing_alias_names:
                skipped.append({
                    "alias": alias,
                    "canonical_id": canonical_id,
                    "reason": "already_exists"
                })
                continue

            # Adiciona novo alias
            if canonical_id not in aliases_data.get("alias_mappings", {}):
                # Cria entrada para o canonical_id
                aliases_data.setdefault("alias_mappings", {})[canonical_id] = {
                    "canonical_id": canonical_id,
                    "aliases": []
                }

            new_alias = {
                "alias": alias,
                "context": alias_entry.get("context", "any"),
                "priority": alias_entry.get("priority", 70)
            }

            aliases_data["alias_mappings"][canonical_id]["aliases"].append(new_alias)
            added.append({
                "alias": alias,
                "canonical_id": canonical_id,
                "entry": new_alias
            })

        # Atualiza contador
        total_aliases = sum(
            len(m.get("aliases", []))
            for m in aliases_data.get("alias_mappings", {}).values()
        )
        aliases_data["total_aliases"] = total_aliases
        aliases_data["last_updated"] = datetime.now().strftime("%Y-%m-%d")

        result = {
            "status": "success" if not dry_run else "dry_run",
            "added": added,
            "skipped": skipped,
            "total_aliases_new": total_aliases
        }

        if not dry_run:
            # Cria backup
            self.create_backup(aliases_path)

            # Salva aliases.json atualizado
            with open(aliases_path, 'w', encoding='utf-8') as f:
                json.dump(aliases_data, f, ensure_ascii=False, indent=2)

            logger.info(f"Aliases atualizados: {len(added)} adicionados, {len(skipped)} ignorados")
            result["backup_path"] = str(self.backup_dir / "execution/nomenclature/aliases.json")

        return result

    def apply_md_corrections(self, dry_run: bool = False) -> Dict[str, Any]:
        """
        Corrige nomenclatura nos arquivos Markdown.

        Args:
            dry_run: Se True, apenas simula

        Returns:
            Resultado da operacao
        """
        md_changes = self.identify_md_changes()

        if not md_changes:
            return {"status": "no_changes", "message": "Nenhuma correcao de MD necessaria"}

        # Agrupa mudancas por arquivo
        changes_by_file = {}
        for change in md_changes:
            doc = change["documento"]
            pasta = change["pasta"]
            filepath = DOCS_DIR / pasta / f"{doc}.md"

            if str(filepath) not in changes_by_file:
                changes_by_file[str(filepath)] = []
            changes_by_file[str(filepath)].append(change)

        # Processa cada arquivo
        processed_files = []
        errors = []

        for filepath_str, file_changes in changes_by_file.items():
            filepath = Path(filepath_str)

            if not filepath.exists():
                errors.append({
                    "file": filepath_str,
                    "error": "Arquivo nao encontrado"
                })
                continue

            try:
                result = self._process_md_file(filepath, file_changes, dry_run)
                processed_files.append(result)
            except Exception as e:
                errors.append({
                    "file": filepath_str,
                    "error": str(e)
                })

        return {
            "status": "success" if not dry_run else "dry_run",
            "processed_files": processed_files,
            "errors": errors,
            "backup_dir": str(self.backup_dir) if not dry_run else None
        }

    def _process_md_file(
        self,
        filepath: Path,
        changes: List[Dict[str, Any]],
        dry_run: bool
    ) -> Dict[str, Any]:
        """
        Processa um arquivo Markdown aplicando as correcoes.

        Args:
            filepath: Caminho do arquivo
            changes: Lista de mudancas para este arquivo
            dry_run: Se True, apenas simula

        Returns:
            Resultado do processamento
        """
        # Le conteudo original
        with open(filepath, 'r', encoding='utf-8') as f:
            original_content = f.read()
            original_lines = original_content.split('\n')

        modified_lines = original_lines.copy()
        applied_changes = []

        # Cria mapa de substituicoes por campo
        substitutions = {
            c["campo_original"]: c["campo_novo"]
            for c in changes
        }

        # Processa linhas de tabela
        for i, line in enumerate(modified_lines):
            if not line.strip().startswith("|"):
                continue

            # Verifica se e uma linha de dados (nao separador)
            if re.match(r'^\|\s*[-:]+\s*\|', line):
                continue

            # Processa cada substituicao
            modified = False
            for original, replacement in substitutions.items():
                # Padroes para encontrar o campo na tabela
                # Padrão 1: | campo | (primeira coluna)
                pattern1 = rf'\|\s*{re.escape(original)}\s*\|'
                # Padrão 2: | `campo` | (com backticks)
                pattern2 = rf'\|\s*`{re.escape(original)}`\s*\|'

                if re.search(pattern1, line, re.IGNORECASE) or re.search(pattern2, line, re.IGNORECASE):
                    # Substitui preservando formatacao
                    new_line = re.sub(
                        rf'(\|\s*)`?{re.escape(original)}`?(\s*\|)',
                        rf'\1{replacement}\2',
                        line,
                        count=1,
                        flags=re.IGNORECASE
                    )

                    if new_line != line:
                        modified_lines[i] = new_line
                        applied_changes.append({
                            "linha": i + 1,
                            "de": original,
                            "para": replacement,
                            "linha_original": line.strip(),
                            "linha_modificada": new_line.strip()
                        })
                        modified = True
                        break  # Apenas uma substituicao por linha

        result = {
            "file": str(filepath),
            "changes_requested": len(changes),
            "changes_applied": len(applied_changes),
            "details": applied_changes
        }

        if not dry_run and applied_changes:
            # Cria backup
            self.create_backup(filepath)

            # Salva arquivo modificado
            modified_content = '\n'.join(modified_lines)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(modified_content)

            logger.info(f"Arquivo atualizado: {filepath.name} ({len(applied_changes)} mudancas)")

        return result


def print_dry_run_report(report: Dict[str, Any]) -> None:
    """Imprime relatorio de dry-run formatado."""
    print("\n" + "=" * 70)
    print("DRY-RUN: SIMULACAO DE ALTERACOES")
    print("=" * 70)

    # Aliases
    print("\n" + "-" * 40)
    print("ALIASES A ADICIONAR")
    print("-" * 40)

    aliases = report["aliases_to_add"]
    if aliases["count"] > 0:
        print(f"Total: {aliases['count']} aliases\n")
        for a in aliases["items"][:20]:
            print(f"  '{a['alias']}' -> {a['canonical_id']} (confianca: {a['confianca']:.2f})")
        if aliases["count"] > 20:
            print(f"  ... e mais {aliases['count'] - 20}")
    else:
        print("Nenhum alias a adicionar.")

    # MD changes
    print("\n" + "-" * 40)
    print("ALTERACOES EM MARKDOWN")
    print("-" * 40)

    md = report["md_changes"]
    if md["count"] > 0:
        print(f"Total: {md['count']} alteracoes em {len(md['by_document'])} documentos\n")
        for doc, changes in list(md["by_document"].items())[:10]:
            print(f"\n  {doc}:")
            for c in changes[:5]:
                print(f"    L{c['linha']}: '{c['de']}' -> '{c['para']}' ({c['confianca']:.2f})")
            if len(changes) > 5:
                print(f"    ... e mais {len(changes) - 5} mudancas")
        if len(md["by_document"]) > 10:
            print(f"\n  ... e mais {len(md['by_document']) - 10} documentos")
    else:
        print("Nenhuma alteracao de Markdown necessaria.")

    print("\n" + "=" * 70)
    print("Para aplicar estas mudancas, execute com --apply-aliases ou --update-md")
    print("=" * 70 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Aplica normalizacao de nomenclatura"
    )

    parser.add_argument(
        "--input", "-i",
        type=str,
        required=True,
        help="Diretorio com resultados da analise"
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Mostra o que seria alterado (sem modificar arquivos)"
    )

    parser.add_argument(
        "--apply-aliases",
        action="store_true",
        help="Adiciona novos aliases ao aliases.json"
    )

    parser.add_argument(
        "--update-md",
        action="store_true",
        help="Corrige nomenclatura nos arquivos Markdown"
    )

    parser.add_argument(
        "--full",
        action="store_true",
        help="Executa apply-aliases e update-md"
    )

    parser.add_argument(
        "--output", "-o",
        type=str,
        help="Arquivo para salvar relatorio JSON"
    )

    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Modo verbose"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Verifica argumentos
    if not any([args.dry_run, args.apply_aliases, args.update_md, args.full]):
        print("Erro: Especifique uma acao (--dry-run, --apply-aliases, --update-md, ou --full)")
        parser.print_help()
        return 1

    # Inicializa aplicador
    analysis_dir = Path(args.input)
    if not analysis_dir.exists():
        print(f"Erro: Diretorio de analise nao encontrado: {analysis_dir}")
        return 1

    applier = NormalizationApplier(analysis_dir)

    # Executa acoes
    results = {"actions": []}

    # Dry-run
    if args.dry_run:
        report = applier.dry_run()
        print_dry_run_report(report)
        results["dry_run"] = report

        if args.output:
            output_path = Path(args.output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            print(f"\nRelatorio salvo em: {output_path}")

        return 0

    # Apply aliases
    if args.apply_aliases or args.full:
        print("\n>>> Aplicando aliases...")
        result = applier.apply_aliases(dry_run=False)
        results["apply_aliases"] = result

        if result["status"] == "success":
            print(f"    Aliases adicionados: {len(result['added'])}")
            print(f"    Aliases ignorados: {len(result['skipped'])}")
            if result.get("backup_path"):
                print(f"    Backup em: {result['backup_path']}")
        else:
            print(f"    {result.get('message', 'Nenhuma mudanca')}")

        results["actions"].append("apply_aliases")

    # Update MD
    if args.update_md or args.full:
        print("\n>>> Atualizando Markdown...")
        result = applier.apply_md_corrections(dry_run=False)
        results["update_md"] = result

        if result["status"] == "success":
            total_changes = sum(f["changes_applied"] for f in result["processed_files"])
            print(f"    Arquivos processados: {len(result['processed_files'])}")
            print(f"    Total de mudancas: {total_changes}")
            if result.get("backup_dir"):
                print(f"    Backups em: {result['backup_dir']}")
        else:
            print(f"    {result.get('message', 'Nenhuma mudanca')}")

        if result.get("errors"):
            print(f"    Erros: {len(result['errors'])}")
            for err in result["errors"]:
                print(f"      - {err['file']}: {err['error']}")

        results["actions"].append("update_md")

    # Salva relatorio
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\nRelatorio completo salvo em: {output_path}")

    print("\n>>> Normalizacao concluida!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
