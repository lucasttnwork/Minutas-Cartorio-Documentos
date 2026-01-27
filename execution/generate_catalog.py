#!/usr/bin/env python3
"""
generate_catalog.py - Fase 1.3 do Pipeline de Catalogacao

Combina o inventario bruto (Fase 1.1) com as classificacoes (Fase 1.2)
para gerar o catalogo final consolidado.

Uso:
    python generate_catalog.py FC_515_124
    python generate_catalog.py --inventario .tmp/inventarios/FC_515_124_bruto.json \
                               --classificacao .tmp/classificacoes/FC_515_124_classificacao.json
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

# Configuracao de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Diretorio base do projeto
PROJECT_ROOT = Path(__file__).parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"
INVENTARIOS_DIR = TMP_DIR / "inventarios"
CLASSIFICACOES_DIR = TMP_DIR / "classificacoes"
CATALOGOS_DIR = TMP_DIR / "catalogos"

# Versao do catalogo
CATALOG_VERSION = "1.0"


def inferir_papel(subpasta: str, tipo_documento: str) -> str:
    """
    Infere o papel (comprador, vendedor, imovel, etc.) baseado na subpasta
    e no tipo de documento.

    Args:
        subpasta: Nome da subpasta onde o arquivo esta localizado
        tipo_documento: Tipo do documento classificado

    Returns:
        Papel inferido: 'comprador', 'vendedor', 'imovel', 'negocio',
                        'comprovante', ou 'desconhecido'
    """
    subpasta_lower = subpasta.lower() if subpasta else ""

    # Inferencia por subpasta (prioridade mais alta)
    if "comprador" in subpasta_lower:
        return "comprador"
    if "vendedor" in subpasta_lower:
        return "vendedor"
    if "recibo" in subpasta_lower or "comprovante" in subpasta_lower:
        return "comprovante"

    # Inferencia por tipo de documento (quando subpasta nao e conclusiva)
    tipos_imovel = [
        "MATRICULA_IMOVEL", "ITBI", "VVR", "IPTU",
        "DADOS_CADASTRAIS", "CND_MUNICIPAL", "CND_IMOVEL"
    ]
    if tipo_documento in tipos_imovel:
        return "imovel"

    tipos_negocio = ["COMPROMISSO_COMPRA_VENDA", "ESCRITURA", "PROCURACAO"]
    if tipo_documento in tipos_negocio:
        return "negocio"

    tipos_comprovante = ["COMPROVANTE_PAGAMENTO", "COMPROVANTE"]
    if tipo_documento in tipos_comprovante:
        return "comprovante"

    return "desconhecido"


def carregar_json(filepath: Path) -> Optional[Dict]:
    """
    Carrega um arquivo JSON de forma segura.

    Args:
        filepath: Caminho para o arquivo JSON

    Returns:
        Dicionario com dados do JSON ou None se falhar
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Arquivo nao encontrado: {filepath}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Erro ao decodificar JSON em {filepath}: {e}")
        return None
    except Exception as e:
        logger.error(f"Erro inesperado ao ler {filepath}: {e}")
        return None


def salvar_json(data: Dict, filepath: Path) -> bool:
    """
    Salva dados em um arquivo JSON.

    Args:
        data: Dicionario a ser salvo
        filepath: Caminho para o arquivo de saida

    Returns:
        True se sucesso, False se falhar
    """
    try:
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"Catalogo salvo em: {filepath}")
        return True
    except Exception as e:
        logger.error(f"Erro ao salvar JSON em {filepath}: {e}")
        return False


def fazer_join_arquivos(
    arquivos_inventario: List[Dict],
    classificacoes: List[Dict]
) -> Tuple[List[Dict], List[Dict], List[Dict]]:
    """
    Faz o JOIN entre arquivos do inventario e suas classificacoes.

    Args:
        arquivos_inventario: Lista de arquivos do inventario bruto
        classificacoes: Lista de classificacoes

    Returns:
        Tupla com (arquivos_completos, arquivos_para_revisao, arquivos_com_erro)
    """
    # Criar dicionario de classificacoes por ID para lookup rapido
    class_por_id = {c["id"]: c for c in classificacoes}

    arquivos_completos = []
    arquivos_para_revisao = []
    arquivos_com_erro = []
    ids_faltantes = []

    for arq in arquivos_inventario:
        arquivo_id = arq["id"]
        classificacao = class_por_id.get(arquivo_id)

        if classificacao is None:
            # ID nao encontrado na classificacao
            ids_faltantes.append(arquivo_id)
            logger.warning(f"ID {arquivo_id} ({arq['nome']}) nao encontrado na classificacao")

            # Criar entrada com status pendente
            arquivo_final = {
                **arq,
                "tipo_documento": "PENDENTE",
                "confianca": "N/A",
                "pessoa_relacionada": None,
                "observacao": "Classificacao pendente",
                "papel_inferido": inferir_papel(arq.get("subpasta", ""), "PENDENTE"),
                "status_ocr": "pendente"
            }
            arquivos_para_revisao.append({
                "id": arquivo_id,
                "nome": arq["nome"],
                "motivo": "Classificacao nao encontrada",
                "tipo_sugerido": "PENDENTE",
                "confianca": "N/A"
            })
        elif classificacao.get("status") == "erro":
            # Classificacao com erro
            arquivo_final = {
                **arq,
                "tipo_documento": classificacao.get("tipo_documento", "ERRO"),
                "confianca": classificacao.get("confianca", "N/A"),
                "pessoa_relacionada": classificacao.get("pessoa_relacionada"),
                "observacao": classificacao.get("observacao", ""),
                "papel_inferido": inferir_papel(
                    arq.get("subpasta", ""),
                    classificacao.get("tipo_documento", "ERRO")
                ),
                "status_ocr": "pendente"
            }
            arquivos_com_erro.append({
                "id": arquivo_id,
                "nome": arq["nome"],
                "erro": classificacao.get("observacao", "Erro na classificacao")
            })
        else:
            # Classificacao com sucesso
            tipo_doc = classificacao.get("tipo_documento", "DESCONHECIDO")
            confianca = classificacao.get("confianca", "Media")

            arquivo_final = {
                "id": arquivo_id,
                "nome": arq["nome"],
                "caminho_relativo": arq.get("caminho_relativo", ""),
                "caminho_absoluto": arq.get("caminho_absoluto", ""),
                "extensao": arq.get("extensao", ""),
                "tamanho_bytes": arq.get("tamanho_bytes", 0),
                "subpasta": arq.get("subpasta", ""),
                "tipo_documento": tipo_doc,
                "confianca": confianca,
                "pessoa_relacionada": classificacao.get("pessoa_relacionada"),
                "observacao": classificacao.get("observacao", ""),
                "papel_inferido": inferir_papel(arq.get("subpasta", ""), tipo_doc),
                "status_ocr": "pendente"
            }

            # Verificar se precisa revisao (baixa confianca ou tipo desconhecido)
            if confianca == "Baixa" or tipo_doc in ["DESCONHECIDO", "OUTRO"]:
                arquivos_para_revisao.append({
                    "id": arquivo_id,
                    "nome": arq["nome"],
                    "motivo": "Classificacao com baixa confianca" if confianca == "Baixa"
                             else f"Tipo de documento: {tipo_doc}",
                    "tipo_sugerido": tipo_doc,
                    "confianca": confianca
                })

        arquivos_completos.append(arquivo_final)

    if ids_faltantes:
        logger.warning(f"Total de {len(ids_faltantes)} arquivos sem classificacao")

    return arquivos_completos, arquivos_para_revisao, arquivos_com_erro


def calcular_estatisticas(
    arquivos: List[Dict],
    arquivos_com_erro: List[Dict]
) -> Dict[str, Any]:
    """
    Calcula estatisticas agregadas do catalogo.

    Args:
        arquivos: Lista de arquivos processados
        arquivos_com_erro: Lista de arquivos com erro

    Returns:
        Dicionario com estatisticas
    """
    total = len(arquivos)
    erros = len(arquivos_com_erro)
    sucesso = total - erros

    # Contagem por confianca
    alta = sum(1 for a in arquivos if a.get("confianca") == "Alta")
    media = sum(1 for a in arquivos if a.get("confianca") == "Media")
    baixa = sum(1 for a in arquivos if a.get("confianca") == "Baixa")

    return {
        "total_arquivos": total,
        "classificados_sucesso": sucesso,
        "classificados_erro": erros,
        "alta_confianca": alta,
        "media_confianca": media,
        "baixa_confianca": baixa
    }


def contar_por_tipo(arquivos: List[Dict]) -> Dict[str, int]:
    """
    Conta arquivos por tipo de documento.

    Args:
        arquivos: Lista de arquivos processados

    Returns:
        Dicionario com contagem por tipo
    """
    contagem = {}
    for arq in arquivos:
        tipo = arq.get("tipo_documento", "DESCONHECIDO")
        contagem[tipo] = contagem.get(tipo, 0) + 1
    return dict(sorted(contagem.items()))


def contar_por_papel(arquivos: List[Dict]) -> Dict[str, int]:
    """
    Conta arquivos por papel inferido.

    Args:
        arquivos: Lista de arquivos processados

    Returns:
        Dicionario com contagem por papel
    """
    contagem = {}
    for arq in arquivos:
        papel = arq.get("papel_inferido", "desconhecido")
        contagem[papel] = contagem.get(papel, 0) + 1
    return dict(sorted(contagem.items()))


def gerar_catalogo(
    inventario: Dict,
    classificacao: Dict
) -> Dict:
    """
    Gera o catalogo final combinando inventario e classificacoes.

    Args:
        inventario: Dados do inventario bruto
        classificacao: Dados das classificacoes

    Returns:
        Catalogo final consolidado
    """
    escritura_id = inventario.get("escritura_id", "desconhecido")

    logger.info(f"Gerando catalogo para escritura: {escritura_id}")
    logger.info(f"  Arquivos no inventario: {len(inventario.get('arquivos', []))}")
    logger.info(f"  Classificacoes disponiveis: {len(classificacao.get('classificacoes', []))}")

    # Fazer JOIN dos dados
    arquivos, para_revisao, com_erro = fazer_join_arquivos(
        inventario.get("arquivos", []),
        classificacao.get("classificacoes", [])
    )

    # Calcular estatisticas
    estatisticas = calcular_estatisticas(arquivos, com_erro)
    arquivos_por_tipo = contar_por_tipo(arquivos)
    arquivos_por_papel = contar_por_papel(arquivos)

    # Montar catalogo final
    catalogo = {
        "escritura_id": escritura_id,
        "pasta_origem": inventario.get("pasta_origem", ""),
        "data_catalogo": datetime.now().isoformat(),
        "versao_catalogo": CATALOG_VERSION,

        "estatisticas": estatisticas,
        "arquivos_por_tipo": arquivos_por_tipo,
        "arquivos_por_papel": arquivos_por_papel,

        "arquivos": arquivos,
        "arquivos_para_revisao": para_revisao,
        "arquivos_com_erro": com_erro
    }

    # Log de estatisticas
    logger.info(f"Catalogo gerado com sucesso:")
    logger.info(f"  Total de arquivos: {estatisticas['total_arquivos']}")
    logger.info(f"  Classificados com sucesso: {estatisticas['classificados_sucesso']}")
    logger.info(f"  Com erro: {estatisticas['classificados_erro']}")
    logger.info(f"  Alta confianca: {estatisticas['alta_confianca']}")
    logger.info(f"  Media confianca: {estatisticas['media_confianca']}")
    logger.info(f"  Baixa confianca: {estatisticas['baixa_confianca']}")
    logger.info(f"  Para revisao manual: {len(para_revisao)}")

    return catalogo


def main():
    """Funcao principal - processa argumentos e executa geracao do catalogo."""
    parser = argparse.ArgumentParser(
        description="Gera catalogo final combinando inventario e classificacoes",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python generate_catalog.py FC_515_124
  python generate_catalog.py --inventario .tmp/inventarios/FC_515_124_bruto.json \\
                             --classificacao .tmp/classificacoes/FC_515_124_classificacao.json
        """
    )

    parser.add_argument(
        "escritura_id",
        nargs="?",
        help="ID da escritura (ex: FC_515_124)"
    )
    parser.add_argument(
        "--inventario", "-i",
        help="Caminho para o arquivo de inventario bruto"
    )
    parser.add_argument(
        "--classificacao", "-c",
        help="Caminho para o arquivo de classificacao"
    )
    parser.add_argument(
        "--output", "-o",
        help="Caminho para o arquivo de saida (opcional)"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Modo verbose (mais detalhes no log)"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Determinar caminhos dos arquivos de entrada
    if args.inventario and args.classificacao:
        inventario_path = Path(args.inventario)
        classificacao_path = Path(args.classificacao)
        # Extrair escritura_id do nome do arquivo se nao fornecido
        escritura_id = args.escritura_id
        if not escritura_id:
            # Tenta extrair do nome do arquivo de inventario
            nome_arquivo = inventario_path.stem
            if nome_arquivo.endswith("_bruto"):
                escritura_id = nome_arquivo[:-6]
            else:
                escritura_id = nome_arquivo
    elif args.escritura_id:
        escritura_id = args.escritura_id
        inventario_path = INVENTARIOS_DIR / f"{escritura_id}_bruto.json"
        classificacao_path = CLASSIFICACOES_DIR / f"{escritura_id}_classificacao.json"
    else:
        parser.error("Forneca escritura_id ou ambos --inventario e --classificacao")
        return 1

    logger.info(f"Processando escritura: {escritura_id}")
    logger.info(f"  Inventario: {inventario_path}")
    logger.info(f"  Classificacao: {classificacao_path}")

    # Carregar arquivos de entrada
    inventario = carregar_json(inventario_path)
    if inventario is None:
        logger.error("Falha ao carregar inventario. Abortando.")
        return 1

    classificacao = carregar_json(classificacao_path)
    if classificacao is None:
        logger.error("Falha ao carregar classificacao. Abortando.")
        return 1

    # Validar que os IDs das escrituras correspondem
    inv_id = inventario.get("escritura_id", "")
    class_id = classificacao.get("escritura_id", "")
    if inv_id and class_id and inv_id != class_id:
        logger.warning(
            f"IDs de escritura diferentes: inventario={inv_id}, classificacao={class_id}"
        )

    # Gerar catalogo
    catalogo = gerar_catalogo(inventario, classificacao)

    # Determinar caminho de saida
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = CATALOGOS_DIR / f"{escritura_id}.json"

    # Salvar catalogo
    if not salvar_json(catalogo, output_path):
        logger.error("Falha ao salvar catalogo.")
        return 1

    logger.info("Processamento concluido com sucesso!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
