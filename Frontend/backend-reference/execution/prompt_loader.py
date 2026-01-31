#!/usr/bin/env python3
"""
prompt_loader.py - Carregador inteligente de prompts com deteccao automatica de versao

Este modulo fornece funcoes para carregar prompts de extracao de documentos,
detectando automaticamente a versao mais recente disponivel.

Convencao de nomenclatura de versoes:
- tipo.txt          = versao 1 (original)
- tipo_v2.txt       = versao 2
- tipo_v3.txt       = versao 3
- tipo_compact.txt  = versao compacta (nao e versao, e variante)

Uso:
    from execution.prompt_loader import load_prompt, get_latest_prompt_version

    # Carrega automaticamente a versao mais recente
    prompt = load_prompt("rg")  # Carrega rg_v2.txt se existir

    # Verifica qual versao sera usada
    version_info = get_latest_prompt_version("escritura")
    # Retorna: {"base": "escritura", "version": 3, "filename": "escritura_v3.txt"}

Autor: Pipeline de Minutas
Data: Janeiro 2026
"""

import logging
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Configuracao
ROOT_DIR = Path(__file__).resolve().parent.parent
PROMPTS_DIR = ROOT_DIR / 'execution' / 'prompts'

logger = logging.getLogger(__name__)

# Regex para detectar versao no nome do arquivo
VERSION_PATTERN = re.compile(r'^(.+?)(?:_v(\d+))?\.txt$', re.IGNORECASE)

# Sufixos especiais que NAO sao versoes (sao variantes)
SPECIAL_SUFFIXES = {'_compact'}


def parse_prompt_filename(filename: str) -> Tuple[str, int]:
    """
    Extrai o nome base e a versao de um arquivo de prompt.

    Args:
        filename: Nome do arquivo (ex: "rg_v2.txt", "escritura.txt")

    Returns:
        Tuple (nome_base, versao)
        - nome_base: Nome sem versao (ex: "rg", "escritura")
        - versao: Numero da versao (1 se nao especificada)

    Exemplos:
        "rg.txt" -> ("rg", 1)
        "rg_v2.txt" -> ("rg", 2)
        "escritura_v3.txt" -> ("escritura", 3)
        "matricula_imovel_compact.txt" -> ("matricula_imovel_compact", 1)
    """
    # Verifica sufixos especiais primeiro
    stem = Path(filename).stem
    for suffix in SPECIAL_SUFFIXES:
        if stem.endswith(suffix):
            # E uma variante, nao uma versao
            return (stem, 1)

    match = VERSION_PATTERN.match(filename)
    if match:
        base_name = match.group(1)
        version_str = match.group(2)
        version = int(version_str) if version_str else 1
        return (base_name, version)

    # Fallback: retorna nome sem extensao como base, versao 1
    return (stem, 1)


def get_all_prompt_versions(prompts_dir: Path = PROMPTS_DIR) -> Dict[str, List[Dict]]:
    """
    Lista todos os prompts disponiveis agrupados por tipo, com suas versoes.

    Args:
        prompts_dir: Diretorio onde estao os prompts

    Returns:
        Dicionario onde:
        - chave: nome base do prompt (ex: "rg", "escritura")
        - valor: lista de dicts com informacoes de cada versao

    Exemplo de retorno:
        {
            "rg": [
                {"version": 1, "filename": "rg.txt", "path": Path(...)},
                {"version": 2, "filename": "rg_v2.txt", "path": Path(...)}
            ],
            "escritura": [
                {"version": 1, "filename": "escritura.txt", "path": Path(...)},
                {"version": 2, "filename": "escritura_v2.txt", "path": Path(...)},
                {"version": 3, "filename": "escritura_v3.txt", "path": Path(...)}
            ]
        }
    """
    if not prompts_dir.exists():
        logger.warning(f"Diretorio de prompts nao encontrado: {prompts_dir}")
        return {}

    versions: Dict[str, List[Dict]] = {}

    for file in prompts_dir.glob("*.txt"):
        base_name, version = parse_prompt_filename(file.name)

        if base_name not in versions:
            versions[base_name] = []

        versions[base_name].append({
            "version": version,
            "filename": file.name,
            "path": file
        })

    # Ordena cada lista por versao (maior primeiro)
    for base_name in versions:
        versions[base_name].sort(key=lambda x: x["version"], reverse=True)

    return versions


def get_latest_prompt_version(
    tipo_documento: str,
    prompts_dir: Path = PROMPTS_DIR
) -> Optional[Dict]:
    """
    Retorna informacoes sobre a versao mais recente de um prompt.

    Args:
        tipo_documento: Tipo do documento (ex: "rg", "escritura", "MATRICULA_IMOVEL")
        prompts_dir: Diretorio onde estao os prompts

    Returns:
        Dict com informacoes da versao mais recente, ou None se nao encontrado
        {
            "base": "rg",
            "version": 2,
            "filename": "rg_v2.txt",
            "path": Path(...)
        }
    """
    tipo_lower = tipo_documento.lower()
    all_versions = get_all_prompt_versions(prompts_dir)

    if tipo_lower in all_versions and all_versions[tipo_lower]:
        latest = all_versions[tipo_lower][0]  # Primeiro e o mais recente (ordenado desc)
        return {
            "base": tipo_lower,
            "version": latest["version"],
            "filename": latest["filename"],
            "path": latest["path"]
        }

    return None


def load_prompt(
    tipo_documento: str,
    file_size_bytes: int = 0,
    prompts_dir: Path = PROMPTS_DIR,
    use_latest_version: bool = True
) -> str:
    """
    Carrega o prompt para o tipo de documento especificado.

    Detecta automaticamente a versao mais recente disponivel quando
    use_latest_version=True (padrao).

    Args:
        tipo_documento: Tipo do documento (ex: "rg", "MATRICULA_IMOVEL")
        file_size_bytes: Tamanho do arquivo (para selecao de prompt compacto)
        prompts_dir: Diretorio onde estao os prompts
        use_latest_version: Se True, usa a versao mais recente automaticamente

    Returns:
        Conteudo do prompt

    Raises:
        FileNotFoundError: Se nenhum prompt for encontrado
    """
    tipo_lower = tipo_documento.lower()

    # Threshold para usar prompt compacto em matriculas grandes (2MB)
    LARGE_FILE_THRESHOLD = 2_000_000

    # Para matriculas grandes, tenta usar versao compacta primeiro
    if tipo_lower == "matricula_imovel" and file_size_bytes > LARGE_FILE_THRESHOLD:
        compact_path = prompts_dir / "matricula_imovel_compact.txt"
        if compact_path.exists():
            logger.info(
                f"Arquivo grande ({file_size_bytes / 1_000_000:.2f}MB > 2MB), "
                f"usando prompt compacto: matricula_imovel_compact.txt"
            )
            return compact_path.read_text(encoding='utf-8')

    # Busca versao mais recente se habilitado
    if use_latest_version:
        latest = get_latest_prompt_version(tipo_lower, prompts_dir)
        if latest:
            version_info = f" (v{latest['version']})" if latest['version'] > 1 else ""
            logger.info(f"Carregando prompt: {latest['filename']}{version_info}")
            return latest['path'].read_text(encoding='utf-8')

    # Fallback: tenta arquivo simples (sem versao)
    simple_path = prompts_dir / f"{tipo_lower}.txt"
    if simple_path.exists():
        logger.info(f"Carregando prompt: {simple_path.name}")
        return simple_path.read_text(encoding='utf-8')

    # Ultimo recurso: prompt generico
    generic_path = prompts_dir / "generic.txt"
    if generic_path.exists():
        logger.warning(f"Prompt '{tipo_documento}' nao encontrado, usando generic.txt")
        return generic_path.read_text(encoding='utf-8')

    raise FileNotFoundError(
        f"Nenhum prompt encontrado para '{tipo_documento}' em {prompts_dir}"
    )


def list_available_prompts(prompts_dir: Path = PROMPTS_DIR) -> List[str]:
    """
    Lista todos os tipos de documento com prompts disponiveis.

    Retorna apenas os nomes base (sem versao), mostrando a versao mais
    recente disponivel.

    Args:
        prompts_dir: Diretorio onde estao os prompts

    Returns:
        Lista de tipos de documento com prompts
    """
    all_versions = get_all_prompt_versions(prompts_dir)

    # Exclui prompts especiais
    excluded = {'generic', 'desconhecido'}

    types_list = []
    for base_name, versions in all_versions.items():
        # Ignora variantes (como _compact)
        if any(suffix in base_name for suffix in SPECIAL_SUFFIXES):
            continue
        if base_name in excluded:
            continue

        types_list.append(base_name.upper())

    return sorted(types_list)


def print_prompt_versions_report(prompts_dir: Path = PROMPTS_DIR) -> None:
    """
    Imprime um relatorio de todas as versoes de prompts disponiveis.

    Util para debug e verificacao.
    """
    all_versions = get_all_prompt_versions(prompts_dir)

    print("\n" + "=" * 60)
    print("RELATORIO DE VERSOES DE PROMPTS")
    print("=" * 60)
    print(f"Diretorio: {prompts_dir}")
    print("-" * 60)

    for base_name in sorted(all_versions.keys()):
        versions = all_versions[base_name]
        latest = versions[0]

        version_str = ", ".join([f"v{v['version']}" for v in versions])
        latest_indicator = f" [USANDO: v{latest['version']}]" if latest['version'] > 1 else ""

        print(f"  {base_name:30} -> {version_str}{latest_indicator}")

    print("-" * 60)
    print(f"Total de tipos: {len(all_versions)}")
    print("=" * 60 + "\n")


# =============================================================================
# MAIN - Para teste direto
# =============================================================================

if __name__ == '__main__':
    # Configura logging para testes
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

    # Imprime relatorio de versoes
    print_prompt_versions_report()

    # Testa carregamento de alguns prompts
    print("\nTestando carregamento de prompts:")
    print("-" * 40)

    for tipo in ["rg", "escritura", "matricula_imovel", "cndt"]:
        try:
            latest = get_latest_prompt_version(tipo)
            if latest:
                print(f"  {tipo:20} -> {latest['filename']} (v{latest['version']})")
            else:
                print(f"  {tipo:20} -> NAO ENCONTRADO")
        except Exception as e:
            print(f"  {tipo:20} -> ERRO: {e}")
