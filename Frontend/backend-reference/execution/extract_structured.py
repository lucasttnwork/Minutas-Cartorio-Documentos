#!/usr/bin/env python3
"""
extract_structured.py - Fase 3 do Pipeline de Extracao de Documentos

Este script extrai dados estruturados dos textos OCR usando schemas JSON,
regex patterns e validacoes especificas para cada tipo de documento.

Funcionalidades:
- Carregamento de schemas de execution/schemas/
- Identificacao de tipo de documento via catalogo
- Extracao em 3 niveis:
  - Nivel 1: Regex direto (CPF, RG, datas, valores)
  - Nivel 2: Pattern matching contextual
  - Nivel 3: Gemini para campos complexos (opcional, --use-llm)
- Validacao de campos extraidos (CPF, datas, valores)
- Relatorio de extracao com metricas de confianca

Uso:
    python extract_structured.py FC_515_124_p280509
    python extract_structured.py FC_515_124_p280509 --limit 5
    python extract_structured.py FC_515_124_p280509 --type RG
    python extract_structured.py FC_515_124_p280509 --verbose

Autor: Pipeline de Minutas
Data: Janeiro 2026
"""

import argparse
import json
import logging
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple

# Adiciona o diretorio raiz ao path para imports
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Configuracao de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constantes
TMP_DIR = ROOT_DIR / '.tmp'
SCHEMAS_DIR = ROOT_DIR / 'execution' / 'schemas'
SAVE_PROGRESS_INTERVAL = 10

# =============================================================================
# REGEX PATTERNS GLOBAIS
# =============================================================================

PATTERNS = {
    # Documentos de identificacao
    'cpf': r'\d{3}\.?\d{3}\.?\d{3}[-/]?\d{2}',
    'cnpj': r'\d{2}\.?\d{3}\.?\d{3}/?\d{4}[-]?\d{2}',
    'rg': r'\d{1,2}\.?\d{3}\.?\d{3}[-]?[\dXx]',

    # Datas
    'data': r'\d{2}/\d{2}/\d{4}',
    'data_hora': r'\d{2}/\d{2}/\d{4}[,\s]+(?:às\s+)?\d{2}:\d{2}(?::\d{2})?',

    # Valores monetarios
    'valor_monetario': r'R\$\s?[\d.,]+(?:,\d{2})?',
    'valor_numerico': r'[\d.,]+,\d{2}',

    # Cadastro de imovel (SQL - Setor Quadra Lote)
    'sql': r'\d{3}\.?\d{3}\.?\d{4}[-.]?\d',

    # Certidoes
    'numero_certidao': r'\d{8,}(?:/\d{4})?',
    'numero_transacao': r'[\d.-]{10,}',

    # Matricula de imovel
    'numero_matricula': r'[Mm]atr[ií]cula\s*(?:n[°º]?\s*)?(\d+(?:\.\d+)?)',

    # CEP
    'cep': r'\d{5}[-]?\d{3}',

    # Telefone
    'telefone': r'\(?\d{2}\)?\s*\d{4,5}[-]?\d{4}',
}

# Mapeamento de UFs validas
UFS_VALIDAS = {
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
}


# =============================================================================
# FUNCOES DE VALIDACAO
# =============================================================================

def validate_cpf(cpf: str) -> bool:
    """
    Valida CPF usando digito verificador.

    Args:
        cpf: CPF a ser validado (pode conter pontos e tracos)

    Returns:
        True se CPF e valido, False caso contrario
    """
    # Remove caracteres nao numericos
    cpf_digits = re.sub(r'[^\d]', '', cpf)

    # Verifica se tem 11 digitos
    if len(cpf_digits) != 11:
        return False

    # Verifica se todos os digitos sao iguais
    if cpf_digits == cpf_digits[0] * 11:
        return False

    # Calcula primeiro digito verificador
    soma = sum(int(cpf_digits[i]) * (10 - i) for i in range(9))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto

    if int(cpf_digits[9]) != digito1:
        return False

    # Calcula segundo digito verificador
    soma = sum(int(cpf_digits[i]) * (11 - i) for i in range(10))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto

    return int(cpf_digits[10]) == digito2


def validate_cnpj(cnpj: str) -> bool:
    """
    Valida CNPJ usando digito verificador.

    Args:
        cnpj: CNPJ a ser validado

    Returns:
        True se CNPJ e valido, False caso contrario
    """
    # Remove caracteres nao numericos
    cnpj_digits = re.sub(r'[^\d]', '', cnpj)

    # Verifica se tem 14 digitos
    if len(cnpj_digits) != 14:
        return False

    # Verifica se todos os digitos sao iguais
    if cnpj_digits == cnpj_digits[0] * 14:
        return False

    # Pesos para calculo
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    # Calcula primeiro digito verificador
    soma = sum(int(cnpj_digits[i]) * pesos1[i] for i in range(12))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto

    if int(cnpj_digits[12]) != digito1:
        return False

    # Calcula segundo digito verificador
    soma = sum(int(cnpj_digits[i]) * pesos2[i] for i in range(13))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto

    return int(cnpj_digits[13]) == digito2


def validate_date(date_str: str) -> bool:
    """
    Valida se string e uma data valida no formato DD/MM/AAAA.

    Args:
        date_str: Data a ser validada

    Returns:
        True se data e valida, False caso contrario
    """
    try:
        datetime.strptime(date_str, '%d/%m/%Y')
        return True
    except ValueError:
        return False


def normalize_cpf(cpf: str) -> str:
    """
    Normaliza CPF para formato padrao XXX.XXX.XXX-XX.

    Args:
        cpf: CPF em qualquer formato

    Returns:
        CPF no formato padrao
    """
    digits = re.sub(r'[^\d]', '', cpf)
    if len(digits) == 11:
        return f'{digits[:3]}.{digits[3:6]}.{digits[6:9]}-{digits[9:]}'
    return cpf


def normalize_valor(valor_str: str) -> Optional[float]:
    """
    Normaliza valor monetario para float.

    Args:
        valor_str: Valor em formato brasileiro (ex: "R$ 1.234,56")

    Returns:
        Valor como float ou None se invalido
    """
    try:
        # Remove R$, espacos e pontos de milhar
        cleaned = re.sub(r'[R$\s.]', '', valor_str)
        # Substitui virgula por ponto
        cleaned = cleaned.replace(',', '.')
        return float(cleaned)
    except (ValueError, AttributeError):
        return None


def normalize_sql(sql_str: str) -> str:
    """
    Normaliza SQL (Setor-Quadra-Lote) para formato padrao XXX.XXX.XXXX-X.

    Args:
        sql_str: SQL em qualquer formato

    Returns:
        SQL no formato padrao
    """
    digits = re.sub(r'[^\d]', '', sql_str)
    if len(digits) >= 10:
        return f'{digits[:3]}.{digits[3:6]}.{digits[6:10]}-{digits[10] if len(digits) > 10 else "0"}'
    return sql_str


# =============================================================================
# FUNCOES DE CARREGAMENTO
# =============================================================================

def load_schemas() -> Dict[str, Dict]:
    """
    Carrega todos os schemas JSON do diretorio de schemas.

    Returns:
        Dicionario com tipo_documento -> schema
    """
    schemas = {}

    if not SCHEMAS_DIR.exists():
        logger.warning(f"Diretorio de schemas nao encontrado: {SCHEMAS_DIR}")
        return schemas

    for schema_file in SCHEMAS_DIR.glob('*.json'):
        try:
            with open(schema_file, 'r', encoding='utf-8') as f:
                schema = json.load(f)
                tipo = schema.get('tipo_documento', schema_file.stem.upper())
                schemas[tipo] = schema
                logger.debug(f"Schema carregado: {tipo} ({len(schema.get('campos', []))} campos)")
        except Exception as e:
            logger.error(f"Erro ao carregar schema {schema_file}: {e}")

    logger.info(f"Schemas carregados: {len(schemas)} tipos de documento")
    return schemas


def load_catalog(escritura_id: str) -> Dict[str, Any]:
    """
    Carrega o catalogo de uma escritura.

    Args:
        escritura_id: ID da escritura (ex: FC_515_124_p280509)

    Returns:
        Dados do catalogo

    Raises:
        FileNotFoundError: Se catalogo nao existir
    """
    catalog_path = TMP_DIR / 'catalogos' / f'{escritura_id}.json'

    if not catalog_path.exists():
        raise FileNotFoundError(f"Catalogo nao encontrado: {catalog_path}")

    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    logger.info(f"Catalogo carregado: {len(catalog.get('arquivos', []))} arquivos")
    return catalog


def load_ocr_text(ocr_path: str) -> Optional[str]:
    """
    Carrega texto OCR de um arquivo.

    Args:
        ocr_path: Caminho para o arquivo OCR (.txt)

    Returns:
        Texto do documento ou None se erro
    """
    try:
        # Normaliza caminho para Path
        path = Path(ocr_path)

        if not path.exists():
            logger.warning(f"Arquivo OCR nao encontrado: {ocr_path}")
            return None

        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove cabecalho do OCR (linhas antes de ---)
        if '---' in content:
            content = content.split('---', 1)[1]

        return content.strip()

    except Exception as e:
        logger.error(f"Erro ao carregar OCR {ocr_path}: {e}")
        return None


# =============================================================================
# FUNCOES DE EXTRACAO
# =============================================================================

def extract_by_regex(texto: str, pattern: str, normalize_func=None) -> List[Dict]:
    """
    Extrai valores usando regex.

    Args:
        texto: Texto para busca
        pattern: Padrao regex
        normalize_func: Funcao opcional de normalizacao

    Returns:
        Lista de matches com valor, posicao e valor normalizado
    """
    results = []

    for match in re.finditer(pattern, texto, re.IGNORECASE):
        value = match.group()
        result = {
            'valor': value,
            'posicao_inicio': match.start(),
            'posicao_fim': match.end()
        }

        if normalize_func:
            result['valor_normalizado'] = normalize_func(value)

        results.append(result)

    return results


def extract_contextual(texto: str, campo: str, contextos: List[str]) -> Optional[str]:
    """
    Extrai valor usando contexto (palavras-chave antes do valor).

    Args:
        texto: Texto para busca
        campo: Nome do campo sendo extraido
        contextos: Lista de palavras-chave que precedem o valor

    Returns:
        Valor extraido ou None
    """
    for contexto in contextos:
        # Padroes para diferentes formatos de contexto: valor
        patterns = [
            rf'{contexto}\s*[:=]?\s*([^\n]+)',  # CONTEXTO: valor
            rf'{contexto}\s*\n\s*([^\n]+)',     # CONTEXTO\nvalor
        ]

        for pattern in patterns:
            match = re.search(pattern, texto, re.IGNORECASE)
            if match:
                value = match.group(1).strip()
                # Limpa valor (remove caracteres extras no final)
                value = re.sub(r'\s{2,}.*$', '', value)
                return value

    return None


def extract_rg(texto: str, schema: Dict) -> Dict[str, Any]:
    """
    Extrai campos de documento RG.

    Args:
        texto: Texto OCR do RG
        schema: Schema do RG

    Returns:
        Dicionario com campos extraidos
    """
    campos = {}

    # Nivel 1: Regex direto

    # RG numero
    rg_matches = extract_by_regex(texto, PATTERNS['rg'])
    if rg_matches:
        # Pega o primeiro RG encontrado (geralmente o principal)
        campos['numero_rg'] = {
            'valor': rg_matches[0]['valor'],
            'confianca': 0.95,
            'nivel_extracao': 1,
            'posicao_texto': [rg_matches[0]['posicao_inicio'], rg_matches[0]['posicao_fim']]
        }

    # CPF
    cpf_matches = extract_by_regex(texto, PATTERNS['cpf'], normalize_cpf)
    if cpf_matches:
        cpf = cpf_matches[0]
        is_valid = validate_cpf(cpf['valor'])
        campos['cpf'] = {
            'valor': cpf.get('valor_normalizado', cpf['valor']),
            'confianca': 0.95 if is_valid else 0.70,
            'nivel_extracao': 1,
            'validado': is_valid,
            'posicao_texto': [cpf['posicao_inicio'], cpf['posicao_fim']]
        }

    # Datas
    datas = extract_by_regex(texto, PATTERNS['data'])

    # Tenta identificar qual data e qual
    for data in datas:
        data_valor = data['valor']
        # Verifica contexto
        pos = data['posicao_inicio']
        contexto = texto[max(0, pos-50):pos].upper()

        if 'NASCIMENTO' in contexto and 'data_nascimento' not in campos:
            campos['data_nascimento'] = {
                'valor': data_valor,
                'confianca': 0.90 if validate_date(data_valor) else 0.70,
                'nivel_extracao': 1,
                'validado': validate_date(data_valor)
            }
        elif 'EXPEDI' in contexto and 'data_expedicao' not in campos:
            campos['data_expedicao'] = {
                'valor': data_valor,
                'confianca': 0.90 if validate_date(data_valor) else 0.70,
                'nivel_extracao': 1,
                'validado': validate_date(data_valor)
            }

    # Nivel 2: Pattern matching contextual

    # Nome
    nome = extract_contextual(texto, 'nome', ['NOME', 'NOME COMPLETO'])
    if nome and len(nome) > 3:
        campos['nome_completo'] = {
            'valor': nome.upper(),
            'confianca': 0.85,
            'nivel_extracao': 2
        }

    # Filiacao
    filiacao = extract_contextual(texto, 'filiacao', ['FILIAÇÃO', 'FILIACAO'])
    if filiacao:
        # Tenta separar pai e mae
        linhas = [l.strip() for l in filiacao.split('\n') if l.strip()]
        if len(linhas) >= 2:
            campos['nome_pai'] = {
                'valor': linhas[0].upper(),
                'confianca': 0.80,
                'nivel_extracao': 2
            }
            campos['nome_mae'] = {
                'valor': linhas[1].upper(),
                'confianca': 0.80,
                'nivel_extracao': 2
            }

    # Naturalidade
    naturalidade = extract_contextual(texto, 'naturalidade', ['NATURALIDADE', 'NATURAL DE'])
    if naturalidade:
        campos['naturalidade'] = {
            'valor': naturalidade.upper(),
            'confianca': 0.80,
            'nivel_extracao': 2
        }

    # Orgao expedidor (busca siglas conhecidas)
    orgaos_match = re.search(r'\b(SSP|DETRAN|IFP|PC|PM|SESP|SDS|SEJUSP)[-/]?([A-Z]{2})\b', texto.upper())
    if orgaos_match:
        campos['orgao_expedidor'] = {
            'valor': orgaos_match.group(1),
            'confianca': 0.95,
            'nivel_extracao': 1
        }
        campos['uf_expedidor'] = {
            'valor': orgaos_match.group(2),
            'confianca': 0.95,
            'nivel_extracao': 1
        }

    return campos


def extract_cndt(texto: str, schema: Dict) -> Dict[str, Any]:
    """
    Extrai campos de Certidao Negativa de Debitos Trabalhistas.

    Args:
        texto: Texto OCR da CNDT
        schema: Schema da CNDT

    Returns:
        Dicionario com campos extraidos
    """
    campos = {}

    # Nivel 1: Regex direto

    # CPF
    cpf_matches = extract_by_regex(texto, PATTERNS['cpf'], normalize_cpf)
    if cpf_matches:
        cpf = cpf_matches[0]
        is_valid = validate_cpf(cpf['valor'])
        campos['cpf'] = {
            'valor': cpf.get('valor_normalizado', cpf['valor']),
            'confianca': 0.95 if is_valid else 0.70,
            'nivel_extracao': 1,
            'validado': is_valid
        }

    # CNPJ (se pessoa juridica)
    cnpj_matches = extract_by_regex(texto, PATTERNS['cnpj'])
    if cnpj_matches:
        cnpj = cnpj_matches[0]
        is_valid = validate_cnpj(cnpj['valor'])
        campos['cnpj'] = {
            'valor': cnpj['valor'],
            'confianca': 0.95 if is_valid else 0.70,
            'nivel_extracao': 1,
            'validado': is_valid
        }

    # Numero da certidao
    certidao_match = re.search(r'[Cc]ertid[aã]o\s*n[°º]?\s*:?\s*(\d+(?:/\d{4})?)', texto)
    if certidao_match:
        campos['numero_certidao'] = {
            'valor': certidao_match.group(1),
            'confianca': 0.95,
            'nivel_extracao': 1
        }

    # Datas
    datas = extract_by_regex(texto, PATTERNS['data'])

    for data in datas:
        data_valor = data['valor']
        pos = data['posicao_inicio']
        contexto = texto[max(0, pos-50):pos].upper()

        if ('EXPEDI' in contexto or 'EMISS' in contexto) and 'data_expedicao' not in campos:
            campos['data_expedicao'] = {
                'valor': data_valor,
                'confianca': 0.90,
                'nivel_extracao': 1,
                'validado': validate_date(data_valor)
            }
        elif 'VALIDADE' in contexto and 'data_validade' not in campos:
            campos['data_validade'] = {
                'valor': data_valor,
                'confianca': 0.90,
                'nivel_extracao': 1,
                'validado': validate_date(data_valor)
            }

    # Nivel 2: Pattern matching contextual

    # Nome
    nome = extract_contextual(texto, 'nome', ['Nome:', 'NOME:'])
    if nome:
        campos['nome_pessoa'] = {
            'valor': nome.upper(),
            'confianca': 0.90,
            'nivel_extracao': 2
        }

    # Status da certidao
    if 'NÃO CONSTA' in texto.upper() or 'NAO CONSTA' in texto.upper():
        campos['status_certidao'] = {
            'valor': 'NADA CONSTA',
            'confianca': 0.98,
            'nivel_extracao': 1
        }
    elif 'POSITIVA' in texto.upper():
        campos['status_certidao'] = {
            'valor': 'POSITIVA',
            'confianca': 0.98,
            'nivel_extracao': 1
        }

    return campos


def extract_iptu(texto: str, schema: Dict) -> Dict[str, Any]:
    """
    Extrai campos de IPTU / Certidao de Dados Cadastrais.

    Args:
        texto: Texto OCR do IPTU
        schema: Schema do IPTU

    Returns:
        Dicionario com campos extraidos
    """
    campos = {}

    # Nivel 1: Regex direto

    # SQL (Cadastro do imovel)
    sql_matches = extract_by_regex(texto, PATTERNS['sql'], normalize_sql)
    if sql_matches:
        campos['cadastro_imovel'] = {
            'valor': sql_matches[0].get('valor_normalizado', sql_matches[0]['valor']),
            'confianca': 0.95,
            'nivel_extracao': 1
        }

    # Valores monetarios
    valores = extract_by_regex(texto, PATTERNS['valor_monetario'], normalize_valor)

    # Tenta identificar valores pelo contexto
    for valor in valores:
        pos = valor['posicao_inicio']
        contexto = texto[max(0, pos-100):pos].upper()
        valor_float = valor.get('valor_normalizado')

        if valor_float and valor_float > 0:
            if 'BASE DE CÁLCULO' in contexto or 'BASE DE CALCULO' in contexto:
                campos['valor_venal_total'] = {
                    'valor': valor_float,
                    'valor_formatado': valor['valor'],
                    'confianca': 0.90,
                    'nivel_extracao': 1
                }
            elif 'CONSTRUÇÃO' in contexto or 'CONSTRUCAO' in contexto:
                if 'valor_venal_construcao' not in campos:
                    campos['valor_venal_construcao'] = {
                        'valor': valor_float,
                        'valor_formatado': valor['valor'],
                        'confianca': 0.85,
                        'nivel_extracao': 1
                    }
            elif 'TERRENO' in contexto or 'INCORPORADA' in contexto:
                if 'valor_venal_terreno' not in campos:
                    campos['valor_venal_terreno'] = {
                        'valor': valor_float,
                        'valor_formatado': valor['valor'],
                        'confianca': 0.85,
                        'nivel_extracao': 1
                    }

    # Ano de exercicio
    ano_match = re.search(r'[Ee]xerc[ií]cio\s*(?:de\s*)?(\d{4})|IPTU\s*(\d{4})', texto)
    if ano_match:
        ano = ano_match.group(1) or ano_match.group(2)
        campos['ano_exercicio'] = {
            'valor': int(ano),
            'confianca': 0.95,
            'nivel_extracao': 1
        }

    # Nivel 2: Pattern matching contextual

    # Endereco
    endereco = extract_contextual(texto, 'endereco', ['Local do Imóvel:', 'LOCAL DO IMÓVEL', 'Endereço:'])
    if endereco:
        campos['endereco_imovel'] = {
            'valor': endereco,
            'confianca': 0.85,
            'nivel_extracao': 2
        }

    # CEP
    cep_matches = extract_by_regex(texto, PATTERNS['cep'])
    if cep_matches:
        campos['cep'] = {
            'valor': cep_matches[0]['valor'],
            'confianca': 0.90,
            'nivel_extracao': 1
        }

    # Contribuintes (CPFs encontrados)
    cpf_matches = extract_by_regex(texto, PATTERNS['cpf'], normalize_cpf)
    if cpf_matches:
        contribuintes = []
        for cpf in cpf_matches:
            if validate_cpf(cpf['valor']):
                contribuintes.append(cpf.get('valor_normalizado', cpf['valor']))
        if contribuintes:
            campos['contribuintes_cpf'] = {
                'valor': contribuintes,
                'confianca': 0.85,
                'nivel_extracao': 1
            }

    # Uso do imovel
    uso_match = re.search(r'[Uu]so:\s*(\w+)', texto)
    if uso_match:
        uso = uso_match.group(1).upper()
        campos['uso_imovel'] = {
            'valor': uso,
            'confianca': 0.85,
            'nivel_extracao': 1
        }

    # Area construida
    area_match = re.search(r'[Áá]rea\s+constru[ií]da\s*\(?m[²2]?\)?\s*:?\s*(\d+(?:[.,]\d+)?)', texto, re.IGNORECASE)
    if area_match:
        campos['area_construida'] = {
            'valor': float(area_match.group(1).replace(',', '.')),
            'unidade': 'm2',
            'confianca': 0.85,
            'nivel_extracao': 1
        }

    return campos


def extract_itbi(texto: str, schema: Dict) -> Dict[str, Any]:
    """
    Extrai campos de ITBI.

    Args:
        texto: Texto OCR do ITBI
        schema: Schema do ITBI

    Returns:
        Dicionario com campos extraidos
    """
    campos = {}

    # Nivel 1: Regex direto

    # SQL
    sql_matches = extract_by_regex(texto, PATTERNS['sql'], normalize_sql)
    if sql_matches:
        campos['sql'] = {
            'valor': sql_matches[0].get('valor_normalizado', sql_matches[0]['valor']),
            'confianca': 0.95,
            'nivel_extracao': 1
        }

    # Numero da transacao
    transacao_match = re.search(r'[Nn][°º]?\s*(?:DA\s+)?TRANSAÇÃO\s*:?\s*([\d.-]+)', texto)
    if transacao_match:
        campos['numero_transacao'] = {
            'valor': transacao_match.group(1),
            'confianca': 0.95,
            'nivel_extracao': 1
        }

    # Valores
    valores = extract_by_regex(texto, PATTERNS['valor_monetario'], normalize_valor)

    for valor in valores:
        pos = valor['posicao_inicio']
        contexto = texto[max(0, pos-80):pos].upper()
        valor_float = valor.get('valor_normalizado')

        if valor_float and valor_float > 0:
            if 'TRANSAÇÃO' in contexto or 'TRANSACAO' in contexto:
                campos['valor_transacao'] = {
                    'valor': valor_float,
                    'valor_formatado': valor['valor'],
                    'confianca': 0.90,
                    'nivel_extracao': 1
                }
            elif 'VENAL DE REFERÊNCIA' in contexto or 'VENAL DE REFERENCIA' in contexto or 'VVR' in contexto:
                campos['vvr'] = {
                    'valor': valor_float,
                    'valor_formatado': valor['valor'],
                    'confianca': 0.90,
                    'nivel_extracao': 1
                }
            elif 'TOTAL' in contexto and 'PAGAR' in contexto:
                campos['valor_imposto'] = {
                    'valor': valor_float,
                    'valor_formatado': valor['valor'],
                    'confianca': 0.90,
                    'nivel_extracao': 1
                }

    # Datas
    datas = extract_by_regex(texto, PATTERNS['data'])

    for data in datas:
        data_valor = data['valor']
        pos = data['posicao_inicio']
        contexto = texto[max(0, pos-50):pos].upper()

        if 'TRANSAÇÃO' in contexto or 'TRANSACAO' in contexto:
            campos['data_transacao'] = {
                'valor': data_valor,
                'confianca': 0.90,
                'nivel_extracao': 1
            }
        elif 'VENCIMENTO' in contexto:
            campos['data_vencimento'] = {
                'valor': data_valor,
                'confianca': 0.90,
                'nivel_extracao': 1
            }
        elif 'EMISSÃO' in contexto or 'EMISSAO' in contexto:
            campos['data_emissao'] = {
                'valor': data_valor,
                'confianca': 0.90,
                'nivel_extracao': 1
            }

    # Nivel 2: Pattern matching contextual

    # Nome do contribuinte
    nome = extract_contextual(texto, 'contribuinte', ['NOME DO CONTRIBUINTE', 'CONTRIBUINTE'])
    if nome:
        campos['nome_contribuinte'] = {
            'valor': nome.upper(),
            'confianca': 0.85,
            'nivel_extracao': 2
        }

    # Natureza da transacao
    natureza_match = re.search(r'NATUREZA:\s*([\w\s]+?)(?:\n|DATA)', texto, re.IGNORECASE)
    if natureza_match:
        campos['natureza_transacao'] = {
            'valor': natureza_match.group(1).strip().upper(),
            'confianca': 0.90,
            'nivel_extracao': 1
        }

    # Endereco
    endereco = extract_contextual(texto, 'local', ['LOCAL DO IMÓVEL', 'LOCAL DO IMOVEL'])
    if endereco:
        campos['endereco_imovel'] = {
            'valor': endereco,
            'confianca': 0.80,
            'nivel_extracao': 2
        }

    return campos


def extract_vvr(texto: str, schema: Dict) -> Dict[str, Any]:
    """
    Extrai campos de Valor Venal de Referencia.

    Args:
        texto: Texto OCR do VVR
        schema: Schema do VVR

    Returns:
        Dicionario com campos extraidos
    """
    campos = {}

    # SQL
    sql_matches = extract_by_regex(texto, PATTERNS['sql'], normalize_sql)
    if sql_matches:
        campos['cadastro_imovel'] = {
            'valor': sql_matches[0].get('valor_normalizado', sql_matches[0]['valor']),
            'confianca': 0.95,
            'nivel_extracao': 1
        }

    # Valor VVR - busca no formato da tabela SQL | Valor | Endereco
    vvr_match = re.search(r'\d{3}\.\d{3}\.\d{4}[-.]?\d\s+(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)', texto)
    if vvr_match:
        valor_str = vvr_match.group(1)
        # Converte para float
        valor_float = normalize_valor(f'R$ {valor_str}')
        campos['valor_venal_referencia'] = {
            'valor': valor_float,
            'valor_formatado': f'R$ {valor_str}',
            'confianca': 0.95,
            'nivel_extracao': 1
        }

    # Data da consulta
    datas = extract_by_regex(texto, PATTERNS['data'])
    if datas:
        campos['data_consulta'] = {
            'valor': datas[0]['valor'],
            'confianca': 0.85,
            'nivel_extracao': 1
        }

    # Endereco
    endereco_match = re.search(r'\d{3}\.\d{3}\.\d{4}[-.]?\d\s+[\d.,]+\s+(.+?)(?:\s+\d{5})', texto)
    if endereco_match:
        campos['endereco_completo'] = {
            'valor': endereco_match.group(1).strip(),
            'confianca': 0.80,
            'nivel_extracao': 2
        }

    return campos


def extract_generic(texto: str, schema: Dict) -> Dict[str, Any]:
    """
    Extrator generico para tipos de documento sem extrator especifico.
    Usa os campos definidos no schema para tentar extrair valores.

    Args:
        texto: Texto OCR
        schema: Schema do documento

    Returns:
        Dicionario com campos extraidos
    """
    campos = {}

    # Extrai todos os CPFs
    cpf_matches = extract_by_regex(texto, PATTERNS['cpf'], normalize_cpf)
    for i, cpf in enumerate(cpf_matches[:3]):  # Limita a 3 CPFs
        is_valid = validate_cpf(cpf['valor'])
        campos[f'cpf_{i+1}'] = {
            'valor': cpf.get('valor_normalizado', cpf['valor']),
            'confianca': 0.90 if is_valid else 0.60,
            'nivel_extracao': 1,
            'validado': is_valid
        }

    # Extrai todas as datas
    datas = extract_by_regex(texto, PATTERNS['data'])
    for i, data in enumerate(datas[:3]):  # Limita a 3 datas
        campos[f'data_{i+1}'] = {
            'valor': data['valor'],
            'confianca': 0.80,
            'nivel_extracao': 1
        }

    # Extrai valores monetarios
    valores = extract_by_regex(texto, PATTERNS['valor_monetario'], normalize_valor)
    for i, valor in enumerate(valores[:3]):  # Limita a 3 valores
        if valor.get('valor_normalizado'):
            campos[f'valor_{i+1}'] = {
                'valor': valor['valor_normalizado'],
                'valor_formatado': valor['valor'],
                'confianca': 0.75,
                'nivel_extracao': 1
            }

    return campos


# =============================================================================
# MAPEAMENTO DE EXTRATORES
# =============================================================================

EXTRACTORS = {
    'RG': extract_rg,
    'CNDT': extract_cndt,
    'IPTU': extract_iptu,
    'ITBI': extract_itbi,
    'VVR': extract_vvr,
    # Tipos sem extrator especifico usam extract_generic
}


def extract_document(
    ocr_file: Path,
    tipo_documento: str,
    schema: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Extrai dados estruturados de um documento.

    Args:
        ocr_file: Caminho para arquivo OCR
        tipo_documento: Tipo do documento (RG, CNDT, IPTU, etc)
        schema: Schema do documento (opcional)

    Returns:
        Dicionario com dados extraidos
    """
    # Carrega texto OCR
    texto = load_ocr_text(str(ocr_file))

    if not texto:
        return {
            'tipo_documento': tipo_documento,
            'arquivo_origem': ocr_file.name,
            'arquivo_ocr': str(ocr_file),
            'data_extracao': datetime.now().isoformat(),
            'confianca_global': 0.0,
            'campos_extraidos': 0,
            'campos': {},
            'erros': ['Texto OCR nao encontrado ou vazio']
        }

    # Seleciona extrator apropriado
    extractor = EXTRACTORS.get(tipo_documento, extract_generic)

    # Executa extracao
    try:
        campos = extractor(texto, schema or {})
    except Exception as e:
        logger.error(f"Erro na extracao de {ocr_file.name}: {e}")
        campos = {}

    # Calcula metricas
    num_campos = len(campos)

    if num_campos > 0:
        # Calcula confianca media
        confiancas = [c.get('confianca', 0.5) for c in campos.values() if isinstance(c, dict)]
        confianca_global = sum(confiancas) / len(confiancas) if confiancas else 0.0
    else:
        confianca_global = 0.0

    # Conta campos esperados do schema
    campos_esperados = len(schema.get('campos', [])) if schema else num_campos

    # Identifica campos nao encontrados
    campos_nao_encontrados = []
    if schema:
        campos_schema = {c['nome'] for c in schema.get('campos', []) if c.get('obrigatorio')}
        campos_extraidos_nomes = set(campos.keys())
        campos_nao_encontrados = list(campos_schema - campos_extraidos_nomes)

    return {
        'tipo_documento': tipo_documento,
        'arquivo_origem': ocr_file.name,
        'arquivo_ocr': str(ocr_file),
        'data_extracao': datetime.now().isoformat(),
        'confianca_global': round(confianca_global, 4),
        'campos_extraidos': num_campos,
        'campos_esperados': campos_esperados,
        'campos': campos,
        'campos_nao_encontrados': campos_nao_encontrados,
        'erros': []
    }


def run_extraction(
    escritura_id: str,
    limit: Optional[int] = None,
    tipo_filtro: Optional[str] = None,
    verbose: bool = False
) -> Dict[str, Any]:
    """
    Executa extracao para uma escritura completa.

    Args:
        escritura_id: ID da escritura
        limit: Limite de arquivos a processar
        tipo_filtro: Filtrar por tipo de documento
        verbose: Modo verbose

    Returns:
        Estatisticas e resultados da extracao
    """
    start_time = datetime.now()

    # Carrega schemas
    schemas = load_schemas()

    # Carrega catalogo
    catalog = load_catalog(escritura_id)

    # Filtra arquivos para processar
    arquivos = catalog.get('arquivos', [])

    # Filtra apenas arquivos com OCR processado
    arquivos = [a for a in arquivos if a.get('status_ocr') == 'processado' and a.get('arquivo_ocr')]

    # Filtra por tipo se especificado
    if tipo_filtro:
        arquivos = [a for a in arquivos if a.get('tipo_documento') == tipo_filtro.upper()]

    # Aplica limite
    if limit:
        arquivos = arquivos[:limit]

    total = len(arquivos)

    if total == 0:
        logger.warning("Nenhum arquivo para processar")
        return {
            'escritura_id': escritura_id,
            'data_extracao': start_time.isoformat(),
            'total_arquivos': 0,
            'extraidos_sucesso': 0,
            'extraidos_erro': 0,
            'extracoes': []
        }

    logger.info("=" * 60)
    logger.info("EXTRACAO ESTRUTURADA DE DADOS")
    logger.info(f"  Escritura: {escritura_id}")
    logger.info(f"  Total de arquivos: {total}")
    if tipo_filtro:
        logger.info(f"  Filtro de tipo: {tipo_filtro}")
    logger.info(f"  Schemas disponiveis: {len(schemas)}")
    logger.info("=" * 60)

    # Diretorio de saida
    output_dir = TMP_DIR / 'structured' / escritura_id
    output_dir.mkdir(parents=True, exist_ok=True)

    # Resultados
    extracoes = []
    sucesso = 0
    erro = 0

    for idx, arquivo in enumerate(arquivos, 1):
        nome = arquivo['nome']
        tipo = arquivo.get('tipo_documento', 'OUTRO')
        ocr_path = arquivo.get('arquivo_ocr')

        logger.info(f"[{idx}/{total}] Extraindo: {nome} ({tipo})")

        # Obtem schema
        schema = schemas.get(tipo)

        # Executa extracao
        resultado = extract_document(
            ocr_file=Path(ocr_path),
            tipo_documento=tipo,
            schema=schema
        )

        # Adiciona metadados do catalogo
        resultado['id'] = arquivo['id']
        resultado['nome_arquivo'] = nome
        resultado['pessoa_relacionada'] = arquivo.get('pessoa_relacionada')
        resultado['papel_inferido'] = arquivo.get('papel_inferido')

        # Atualiza contadores
        if resultado['campos_extraidos'] > 0:
            sucesso += 1
        else:
            erro += 1

        extracoes.append(resultado)

        if verbose:
            logger.info(f"    Campos extraidos: {resultado['campos_extraidos']}")
            logger.info(f"    Confianca: {resultado['confianca_global']:.2%}")

        # Salva resultado individual
        output_file = output_dir / f"{arquivo['id']}_{tipo}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2)

        # Salva progresso
        if idx % SAVE_PROGRESS_INTERVAL == 0:
            logger.info(f"  Progresso: {idx}/{total} arquivos processados")

    # Calcula estatisticas
    confiancas = [e['confianca_global'] for e in extracoes if e['confianca_global'] > 0]
    confianca_media = sum(confiancas) / len(confiancas) if confiancas else 0.0

    campos_por_tipo = {}
    for e in extracoes:
        tipo = e['tipo_documento']
        if tipo not in campos_por_tipo:
            campos_por_tipo[tipo] = {'total': 0, 'extraidos': 0}
        campos_por_tipo[tipo]['total'] += 1
        campos_por_tipo[tipo]['extraidos'] += e['campos_extraidos']

    # Resultado final
    resultado_final = {
        'escritura_id': escritura_id,
        'data_extracao': start_time.isoformat(),
        'data_conclusao': datetime.now().isoformat(),
        'tempo_processamento': (datetime.now() - start_time).total_seconds(),
        'total_arquivos': total,
        'extraidos_sucesso': sucesso,
        'extraidos_erro': erro,
        'confianca_media': round(confianca_media, 4),
        'campos_por_tipo': campos_por_tipo,
        'extracoes': extracoes
    }

    # Salva relatorio completo
    report_path = output_dir / 'relatorio_extracao.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(resultado_final, f, ensure_ascii=False, indent=2)

    # Resumo final
    logger.info("=" * 60)
    logger.info("EXTRACAO CONCLUIDA")
    logger.info(f"  Escritura: {escritura_id}")
    logger.info(f"  Total processados: {total}")
    logger.info(f"  Sucesso: {sucesso}")
    logger.info(f"  Sem campos: {erro}")
    logger.info(f"  Confianca media: {confianca_media:.2%}")
    logger.info(f"  Tempo: {resultado_final['tempo_processamento']:.2f}s")
    logger.info(f"  Saida: {output_dir}")
    logger.info("=" * 60)

    return resultado_final


def main():
    """Funcao principal - entry point do script"""
    parser = argparse.ArgumentParser(
        description='Extrai dados estruturados de documentos OCR',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python extract_structured.py FC_515_124_p280509
  python extract_structured.py FC_515_124_p280509 --type RG
  python extract_structured.py FC_515_124_p280509 --limit 5
  python extract_structured.py FC_515_124_p280509 --verbose

O script le os textos OCR da Fase 2 e extrai campos estruturados
usando os schemas definidos em execution/schemas/.
        """
    )

    parser.add_argument(
        'escritura_id',
        help='ID da escritura (ex: FC_515_124_p280509)'
    )

    parser.add_argument(
        '--limit', '-l',
        type=int,
        help='Limita o numero de arquivos processados'
    )

    parser.add_argument(
        '--type', '-t',
        type=str,
        dest='tipo',
        help='Filtra por tipo de documento (ex: RG, CNDT, IPTU)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Modo verbose: mostra mais detalhes'
    )

    parser.add_argument(
        '--use-llm',
        action='store_true',
        help='Usa Gemini para campos complexos (Nivel 3) - NAO IMPLEMENTADO'
    )

    args = parser.parse_args()

    # Configura nivel de log
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if args.use_llm:
        logger.warning("Extracao com LLM (--use-llm) ainda nao implementada. Usando apenas regex.")

    try:
        result = run_extraction(
            escritura_id=args.escritura_id,
            limit=args.limit,
            tipo_filtro=args.tipo,
            verbose=args.verbose
        )

        # Retorna codigo de saida baseado em erros
        if result['extraidos_erro'] > result['extraidos_sucesso']:
            sys.exit(2)  # Mais erros que sucesso
        sys.exit(0)

    except FileNotFoundError as e:
        logger.error(f"Arquivo nao encontrado: {e}")
        sys.exit(1)
    except Exception as e:
        logger.exception(f"Erro fatal: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
