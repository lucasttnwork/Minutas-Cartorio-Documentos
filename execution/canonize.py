#!/usr/bin/env python3
"""
canonize.py - Script CLI para Canonização de Dados JSON

Este script permite canonizar dados de arquivos JSON utilizando a biblioteca
de nomenclatura, convertendo nomes de campos para o padrão canônico.

Modos de operação:
1. Gerar novo arquivo: python canonize.py input.json -o output.json
2. Modificar original: python canonize.py input.json --in-place
3. Processar pasta: python canonize.py ./pasta/ -o ./saida/
4. Múltiplos arquivos: python canonize.py *.json --in-place

Exemplos:
    # Canonizar um arquivo, gerando novo
    python execution/canonize.py data.json -o data_canonizado.json

    # Canonizar especificando tipo do documento
    python execution/canonize.py rg.json -o rg_canonizado.json -t RG

    # Modificar arquivo original diretamente
    python execution/canonize.py data.json --in-place

    # Processar todos os JSONs de uma pasta
    python execution/canonize.py ./extractions/ -o ./canonizados/

    # Processar pasta modificando originais
    python execution/canonize.py ./extractions/ --in-place

    # Ver o que seria feito sem executar
    python execution/canonize.py data.json --dry-run

Autor: Pipeline de Minutas
Data: Janeiro 2026
Versão: 1.0
"""

import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Adiciona o diretório pai ao path para importar a biblioteca
SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(ROOT_DIR))

from execution.nomenclature import FieldNormalizer, validate_data_batch, get_validation_summary

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)


# Tipos de documento suportados (para detecção automática)
DOCUMENT_TYPES = [
    "RG", "CNH", "CPF", "CERTIDAO_NASCIMENTO", "CERTIDAO_CASAMENTO",
    "CERTIDAO_OBITO", "COMPROVANTE_RESIDENCIA", "CNDT", "CND_FEDERAL",
    "CND_ESTADUAL", "CND_MUNICIPAL", "CND_IMOVEL", "CND_CONDOMINIO",
    "CONTRATO_SOCIAL", "MATRICULA_IMOVEL", "ITBI", "VVR", "IPTU",
    "DADOS_CADASTRAIS", "ESCRITURA", "COMPROMISSO_COMPRA_VENDA",
    "PROCURACAO", "COMPROVANTE_PAGAMENTO", "PROTOCOLO_ONR",
    "ASSINATURA_DIGITAL", "OUTRO"
]


def detect_document_type(data: Dict[str, Any], filename: str = "") -> str:
    """
    Detecta automaticamente o tipo de documento baseado no conteúdo ou nome do arquivo.

    Args:
        data: Dados do documento
        filename: Nome do arquivo (opcional, ajuda na detecção)

    Returns:
        Tipo do documento detectado ou "OUTRO" se não identificado
    """
    # 1. Verifica se o tipo está explícito nos dados
    if "tipo_documento" in data:
        tipo = data["tipo_documento"].upper()
        if tipo in DOCUMENT_TYPES:
            return tipo

    if "document_type" in data:
        tipo = data["document_type"].upper()
        if tipo in DOCUMENT_TYPES:
            return tipo

    # 2. Tenta inferir do nome do arquivo
    filename_upper = filename.upper()
    for doc_type in DOCUMENT_TYPES:
        if doc_type in filename_upper:
            return doc_type
        # Trata variações comuns
        if doc_type.replace("_", "") in filename_upper.replace("_", "").replace("-", "").replace(" ", ""):
            return doc_type

    # 3. Tenta inferir do conteúdo
    data_str = json.dumps(data).upper()

    # Heurísticas baseadas em campos característicos
    if "MATRICULA" in data_str and ("CARTORIO" in data_str or "REGISTRO" in data_str):
        if "ONUS" in data_str or "PROPRIETARIO" in data_str:
            return "MATRICULA_IMOVEL"

    if "NUMERO_RG" in data_str or "ORGAO_EXPEDIDOR" in data_str:
        return "RG"

    if "NUMERO_CNH" in data_str or "CATEGORIA_CNH" in data_str:
        return "CNH"

    if "CNDT" in data_str or "DEBITOS_TRABALHISTAS" in data_str:
        return "CNDT"

    if "ITBI" in data_str or "TRANSMISSAO_BENS" in data_str:
        return "ITBI"

    if "VVR" in data_str or "VALOR_VENAL_REFERENCIA" in data_str:
        return "VVR"

    if "ESCRITURA" in data_str and ("OUTORGANTE" in data_str or "OUTORGADO" in data_str):
        return "ESCRITURA"

    if "COMPROMISSO" in data_str and "COMPRA" in data_str:
        return "COMPROMISSO_COMPRA_VENDA"

    if "PROCURACAO" in data_str or ("OUTORGANTE" in data_str and "PODERES" in data_str):
        return "PROCURACAO"

    if "CONTRATO_SOCIAL" in data_str or "NIRE" in data_str:
        return "CONTRATO_SOCIAL"

    if "NASCIMENTO" in data_str and ("LIVRO" in data_str or "FOLHA" in data_str):
        return "CERTIDAO_NASCIMENTO"

    if "CASAMENTO" in data_str and "REGIME" in data_str:
        return "CERTIDAO_CASAMENTO"

    if "OBITO" in data_str or "FALECIMENTO" in data_str:
        return "CERTIDAO_OBITO"

    # Default
    return "OUTRO"


def load_json_file(filepath: Path) -> Tuple[Optional[Dict], Optional[str]]:
    """
    Carrega um arquivo JSON.

    Args:
        filepath: Caminho do arquivo

    Returns:
        Tupla (dados, erro) - dados é None se houver erro
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data, None
    except FileNotFoundError:
        return None, f"Arquivo não encontrado: {filepath}"
    except json.JSONDecodeError as e:
        return None, f"JSON inválido em {filepath}: {e}"
    except Exception as e:
        return None, f"Erro ao ler {filepath}: {e}"


def save_json_file(filepath: Path, data: Dict, pretty: bool = True) -> Optional[str]:
    """
    Salva dados em arquivo JSON.

    Args:
        filepath: Caminho do arquivo
        data: Dados a salvar
        pretty: Se True, formata com indentação

    Returns:
        None se sucesso, mensagem de erro se falhar
    """
    try:
        # Cria diretório pai se não existir
        filepath.parent.mkdir(parents=True, exist_ok=True)

        with open(filepath, 'w', encoding='utf-8') as f:
            if pretty:
                json.dump(data, f, ensure_ascii=False, indent=2)
            else:
                json.dump(data, f, ensure_ascii=False)
        return None
    except Exception as e:
        return f"Erro ao salvar {filepath}: {e}"


def canonize_data(
    data: Dict[str, Any],
    doc_type: str,
    normalizer: FieldNormalizer,
    preserve_original: bool = False,
    validate: bool = True
) -> Dict[str, Any]:
    """
    Canoniza os dados de um documento.

    Args:
        data: Dados originais
        doc_type: Tipo do documento
        normalizer: Instância do FieldNormalizer
        preserve_original: Se True, mantém campos originais junto com canonizados
        validate: Se True, inclui resultado da validação

    Returns:
        Dados canonizados com metadados
    """
    # Normaliza os dados
    normalized = normalizer.normalize_extracted_data(data, doc_type)

    # Monta resultado
    result = {
        "_metadata": {
            "canonizado_em": datetime.now().isoformat(),
            "tipo_documento": doc_type,
            "versao_nomenclatura": "2.0",
            "campos_originais": len(data) if isinstance(data, dict) else 0,
            "campos_canonizados": len(normalized)
        },
        "dados_canonizados": normalized
    }

    # Preserva dados originais se solicitado
    if preserve_original:
        result["dados_originais"] = data

    # Adiciona validação se solicitado
    if validate:
        validation_results = validate_data_batch(normalized)
        validation_summary = get_validation_summary(validation_results)
        result["_metadata"]["validacao"] = validation_summary

    return result


def process_file(
    input_path: Path,
    output_path: Optional[Path],
    normalizer: FieldNormalizer,
    doc_type: Optional[str] = None,
    in_place: bool = False,
    preserve_original: bool = False,
    validate: bool = True,
    dry_run: bool = False
) -> Dict[str, Any]:
    """
    Processa um único arquivo.

    Args:
        input_path: Caminho do arquivo de entrada
        output_path: Caminho do arquivo de saída (None se in_place)
        normalizer: Instância do FieldNormalizer
        doc_type: Tipo do documento (None para detecção automática)
        in_place: Se True, sobrescreve o arquivo original
        preserve_original: Se True, mantém dados originais no resultado
        validate: Se True, inclui validação
        dry_run: Se True, apenas simula sem salvar

    Returns:
        Relatório do processamento
    """
    report = {
        "arquivo": str(input_path),
        "sucesso": False,
        "tipo_documento": None,
        "campos_originais": 0,
        "campos_canonizados": 0,
        "saida": None,
        "erro": None
    }

    # Carrega arquivo
    data, error = load_json_file(input_path)
    if error:
        report["erro"] = error
        return report

    # Detecta tipo do documento
    detected_type = doc_type or detect_document_type(data, input_path.name)
    report["tipo_documento"] = detected_type
    report["campos_originais"] = len(data) if isinstance(data, dict) else 0

    # Canoniza
    try:
        canonized = canonize_data(
            data,
            detected_type,
            normalizer,
            preserve_original=preserve_original,
            validate=validate
        )
        report["campos_canonizados"] = len(canonized.get("dados_canonizados", {}))
    except Exception as e:
        report["erro"] = f"Erro na canonização: {e}"
        return report

    # Define caminho de saída
    if in_place:
        final_output = input_path
    elif output_path:
        final_output = output_path
    else:
        # Gera nome automático
        final_output = input_path.parent / f"{input_path.stem}_canonizado{input_path.suffix}"

    report["saida"] = str(final_output)

    # Salva (ou simula)
    if dry_run:
        report["sucesso"] = True
        report["dry_run"] = True
        logger.info(f"[DRY-RUN] Seria salvo em: {final_output}")
    else:
        error = save_json_file(final_output, canonized)
        if error:
            report["erro"] = error
        else:
            report["sucesso"] = True
            logger.info(f"Canonizado: {input_path.name} → {final_output.name} ({report['campos_canonizados']} campos)")

    return report


def process_directory(
    input_dir: Path,
    output_dir: Optional[Path],
    normalizer: FieldNormalizer,
    doc_type: Optional[str] = None,
    in_place: bool = False,
    preserve_original: bool = False,
    validate: bool = True,
    dry_run: bool = False,
    recursive: bool = False
) -> List[Dict[str, Any]]:
    """
    Processa todos os arquivos JSON de um diretório.

    Args:
        input_dir: Diretório de entrada
        output_dir: Diretório de saída (None se in_place)
        normalizer: Instância do FieldNormalizer
        doc_type: Tipo do documento (None para detecção automática)
        in_place: Se True, sobrescreve os arquivos originais
        preserve_original: Se True, mantém dados originais no resultado
        validate: Se True, inclui validação
        dry_run: Se True, apenas simula sem salvar
        recursive: Se True, processa subdiretórios

    Returns:
        Lista de relatórios de processamento
    """
    reports = []

    # Lista arquivos JSON
    if recursive:
        json_files = list(input_dir.rglob("*.json"))
    else:
        json_files = list(input_dir.glob("*.json"))

    if not json_files:
        logger.warning(f"Nenhum arquivo JSON encontrado em: {input_dir}")
        return reports

    logger.info(f"Encontrados {len(json_files)} arquivos JSON")

    for json_file in json_files:
        # Define saída mantendo estrutura de diretórios
        if output_dir and not in_place:
            relative_path = json_file.relative_to(input_dir)
            output_path = output_dir / relative_path
        else:
            output_path = None

        report = process_file(
            input_path=json_file,
            output_path=output_path,
            normalizer=normalizer,
            doc_type=doc_type,
            in_place=in_place,
            preserve_original=preserve_original,
            validate=validate,
            dry_run=dry_run
        )
        reports.append(report)

    return reports


def print_summary(reports: List[Dict[str, Any]]) -> None:
    """Imprime resumo do processamento."""
    total = len(reports)
    sucesso = sum(1 for r in reports if r["sucesso"])
    falha = total - sucesso

    print("\n" + "="*60)
    print("RESUMO DA CANONIZAÇÃO")
    print("="*60)
    print(f"Total de arquivos: {total}")
    print(f"Sucesso: {sucesso}")
    print(f"Falhas: {falha}")

    if falha > 0:
        print("\nArquivos com erro:")
        for r in reports:
            if not r["sucesso"]:
                print(f"  - {r['arquivo']}: {r['erro']}")

    # Estatísticas de campos
    total_original = sum(r["campos_originais"] for r in reports if r["sucesso"])
    total_canonizado = sum(r["campos_canonizados"] for r in reports if r["sucesso"])

    print(f"\nCampos processados:")
    print(f"  - Originais: {total_original}")
    print(f"  - Canonizados: {total_canonizado}")
    print("="*60)


def main():
    """Função principal."""
    parser = argparse.ArgumentParser(
        description="Canoniza dados de arquivos JSON usando a biblioteca de nomenclatura",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  # Canonizar um arquivo, gerando novo
  python canonize.py input.json -o output.json

  # Canonizar especificando tipo do documento
  python canonize.py rg.json -o rg_canonizado.json -t RG

  # Modificar arquivo original diretamente
  python canonize.py input.json --in-place

  # Processar pasta inteira
  python canonize.py ./extractions/ -o ./canonizados/

  # Ver o que seria feito sem executar
  python canonize.py input.json --dry-run

  # Processar recursivamente mantendo estrutura
  python canonize.py ./data/ -o ./output/ --recursive
        """
    )

    # Argumentos posicionais
    parser.add_argument(
        "input",
        type=Path,
        help="Arquivo JSON ou diretório de entrada"
    )

    # Argumentos de saída (mutuamente exclusivos)
    output_group = parser.add_mutually_exclusive_group()
    output_group.add_argument(
        "-o", "--output",
        type=Path,
        help="Arquivo ou diretório de saída"
    )
    output_group.add_argument(
        "--in-place",
        action="store_true",
        help="Modificar arquivo(s) original(is) diretamente"
    )

    # Opções de processamento
    parser.add_argument(
        "-t", "--type",
        choices=DOCUMENT_TYPES,
        help="Tipo do documento (detectado automaticamente se omitido)"
    )
    parser.add_argument(
        "--preserve-original",
        action="store_true",
        help="Incluir dados originais no resultado junto com os canonizados"
    )
    parser.add_argument(
        "--no-validate",
        action="store_true",
        help="Não incluir validação dos campos no resultado"
    )
    parser.add_argument(
        "--recursive", "-r",
        action="store_true",
        help="Processar subdiretórios recursivamente"
    )

    # Opções de controle
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simular execução sem salvar arquivos"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Saída detalhada"
    )
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Saída mínima (apenas erros)"
    )
    parser.add_argument(
        "--list-types",
        action="store_true",
        help="Lista tipos de documento suportados e sai"
    )

    args = parser.parse_args()

    # Lista tipos e sai
    if args.list_types:
        print("Tipos de documento suportados:")
        for doc_type in DOCUMENT_TYPES:
            print(f"  - {doc_type}")
        return 0

    # Configura logging
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    elif args.quiet:
        logging.getLogger().setLevel(logging.ERROR)

    # Validações
    if not args.input.exists():
        logger.error(f"Entrada não encontrada: {args.input}")
        return 1

    if not args.output and not args.in_place:
        logger.info("Sem -o/--output ou --in-place, arquivos serão salvos com sufixo '_canonizado'")

    # Confirmação para --in-place
    if args.in_place and not args.dry_run:
        if args.input.is_dir():
            count = len(list(args.input.glob("*.json")))
            msg = f"Isso irá MODIFICAR {count} arquivo(s) em {args.input}. Continuar? [s/N] "
        else:
            msg = f"Isso irá MODIFICAR {args.input}. Continuar? [s/N] "

        resposta = input(msg).strip().lower()
        if resposta not in ['s', 'sim', 'y', 'yes']:
            logger.info("Operação cancelada pelo usuário")
            return 0

    # Inicializa normalizador
    logger.info("Carregando biblioteca de nomenclatura...")
    normalizer = FieldNormalizer()
    stats = normalizer.get_stats()
    logger.debug(f"Carregados {stats['total_canonical_fields']} campos canônicos e {stats['total_aliases']} aliases")

    # Processa
    if args.input.is_file():
        # Arquivo único
        report = process_file(
            input_path=args.input,
            output_path=args.output,
            normalizer=normalizer,
            doc_type=args.type,
            in_place=args.in_place,
            preserve_original=args.preserve_original,
            validate=not args.no_validate,
            dry_run=args.dry_run
        )
        reports = [report]
    else:
        # Diretório
        reports = process_directory(
            input_dir=args.input,
            output_dir=args.output,
            normalizer=normalizer,
            doc_type=args.type,
            in_place=args.in_place,
            preserve_original=args.preserve_original,
            validate=not args.no_validate,
            dry_run=args.dry_run,
            recursive=args.recursive
        )

    # Resumo
    if not args.quiet:
        print_summary(reports)

    # Retorna código de erro se houve falhas
    falhas = sum(1 for r in reports if not r["sucesso"])
    return 1 if falhas > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
