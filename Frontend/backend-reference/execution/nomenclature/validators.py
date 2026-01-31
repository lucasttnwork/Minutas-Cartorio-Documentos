#!/usr/bin/env python3
"""
validators.py - Funcoes de Validacao de Campos

Este modulo fornece funcoes para validar valores de campos conforme
suas especificacoes canonicas.

Uso:
    from execution.nomenclature.validators import validate_cpf, validate_field

    is_valid = validate_cpf("368.366.718-43")
    result = validate_field("pn_cpf", "368.366.718-43")

Autor: Pipeline de Minutas
Data: Janeiro 2026
Versao: 2.0
"""

import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, Union

# Estados validos do Brasil
VALID_UFS = {
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
}

# Estados civis validos
VALID_ESTADOS_CIVIS = {
    'SOLTEIRO', 'SOLTEIRA',
    'CASADO', 'CASADA',
    'DIVORCIADO', 'DIVORCIADA',
    'VIUVO', 'VIUVA',
    'SEPARADO', 'SEPARADA',
    'UNIAO ESTAVEL'
}

# Regimes de bens validos
VALID_REGIMES_BENS = {
    'COMUNHAO PARCIAL DE BENS',
    'COMUNHAO UNIVERSAL DE BENS',
    'SEPARACAO TOTAL DE BENS',
    'SEPARACAO OBRIGATORIA DE BENS',
    'PARTICIPACAO FINAL NOS AQUESTOS'
}


def validate_cpf(cpf: str) -> Tuple[bool, str]:
    """
    Valida um CPF brasileiro.

    Args:
        cpf: CPF com ou sem formatacao

    Returns:
        Tupla (is_valid, message)
    """
    if not cpf:
        return False, "CPF vazio"

    # Remove caracteres nao numericos
    cpf_numbers = re.sub(r'[^0-9]', '', cpf)

    if len(cpf_numbers) != 11:
        return False, f"CPF deve ter 11 digitos, tem {len(cpf_numbers)}"

    # Verifica se todos os digitos sao iguais
    if cpf_numbers == cpf_numbers[0] * 11:
        return False, "CPF invalido (todos os digitos iguais)"

    # Calcula primeiro digito verificador
    soma = sum(int(cpf_numbers[i]) * (10 - i) for i in range(9))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto

    if int(cpf_numbers[9]) != digito1:
        return False, "Primeiro digito verificador invalido"

    # Calcula segundo digito verificador
    soma = sum(int(cpf_numbers[i]) * (11 - i) for i in range(10))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto

    if int(cpf_numbers[10]) != digito2:
        return False, "Segundo digito verificador invalido"

    return True, "CPF valido"


def validate_cnpj(cnpj: str) -> Tuple[bool, str]:
    """
    Valida um CNPJ brasileiro.

    Args:
        cnpj: CNPJ com ou sem formatacao

    Returns:
        Tupla (is_valid, message)
    """
    if not cnpj:
        return False, "CNPJ vazio"

    # Remove caracteres nao numericos
    cnpj_numbers = re.sub(r'[^0-9]', '', cnpj)

    if len(cnpj_numbers) != 14:
        return False, f"CNPJ deve ter 14 digitos, tem {len(cnpj_numbers)}"

    # Verifica se todos os digitos sao iguais
    if cnpj_numbers == cnpj_numbers[0] * 14:
        return False, "CNPJ invalido (todos os digitos iguais)"

    # Calcula primeiro digito verificador
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(cnpj_numbers[i]) * pesos1[i] for i in range(12))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto

    if int(cnpj_numbers[12]) != digito1:
        return False, "Primeiro digito verificador invalido"

    # Calcula segundo digito verificador
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(cnpj_numbers[i]) * pesos2[i] for i in range(13))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto

    if int(cnpj_numbers[13]) != digito2:
        return False, "Segundo digito verificador invalido"

    return True, "CNPJ valido"


def validate_uf(uf: str) -> Tuple[bool, str]:
    """
    Valida uma UF brasileira.

    Args:
        uf: Sigla do estado

    Returns:
        Tupla (is_valid, message)
    """
    if not uf:
        return False, "UF vazia"

    uf_upper = uf.strip().upper()

    if len(uf_upper) != 2:
        return False, "UF deve ter 2 caracteres"

    if uf_upper not in VALID_UFS:
        return False, f"UF '{uf_upper}' nao reconhecida"

    return True, "UF valida"


def validate_cep(cep: str) -> Tuple[bool, str]:
    """
    Valida um CEP brasileiro.

    Args:
        cep: CEP com ou sem formatacao

    Returns:
        Tupla (is_valid, message)
    """
    if not cep:
        return False, "CEP vazio"

    # Remove caracteres nao numericos
    cep_numbers = re.sub(r'[^0-9]', '', cep)

    if len(cep_numbers) != 8:
        return False, f"CEP deve ter 8 digitos, tem {len(cep_numbers)}"

    # CEPs validos nao comecam com 0 em algumas faixas
    # Simplificacao: aceita qualquer sequencia de 8 digitos
    return True, "CEP valido"


def validate_date(date_str: str, format: str = "DD/MM/YYYY") -> Tuple[bool, str]:
    """
    Valida uma data.

    Args:
        date_str: Data como string
        format: Formato esperado

    Returns:
        Tupla (is_valid, message)
    """
    if not date_str:
        return False, "Data vazia"

    # Converte formato para strptime
    py_format = format.replace("DD", "%d").replace("MM", "%m").replace("YYYY", "%Y")

    try:
        parsed = datetime.strptime(date_str.strip(), py_format)

        # Verifica se a data e razoavel (nao no futuro distante)
        if parsed.year > datetime.now().year + 1:
            return False, f"Ano {parsed.year} parece estar no futuro"

        if parsed.year < 1900:
            return False, f"Ano {parsed.year} parece muito antigo"

        return True, "Data valida"
    except ValueError as e:
        return False, f"Formato de data invalido: {e}"


def validate_estado_civil(estado_civil: str) -> Tuple[bool, str]:
    """
    Valida um estado civil.

    Args:
        estado_civil: Estado civil

    Returns:
        Tupla (is_valid, message)
    """
    if not estado_civil:
        return False, "Estado civil vazio"

    ec_upper = estado_civil.strip().upper()

    if ec_upper not in VALID_ESTADOS_CIVIS:
        return False, f"Estado civil '{ec_upper}' nao reconhecido"

    return True, "Estado civil valido"


def validate_regime_bens(regime: str) -> Tuple[bool, str]:
    """
    Valida um regime de bens.

    Args:
        regime: Regime de bens

    Returns:
        Tupla (is_valid, message)
    """
    if not regime:
        return False, "Regime de bens vazio"

    regime_upper = regime.strip().upper()

    if regime_upper not in VALID_REGIMES_BENS:
        return False, f"Regime de bens '{regime_upper}' nao reconhecido"

    return True, "Regime de bens valido"


def validate_email(email: str) -> Tuple[bool, str]:
    """
    Valida um endereco de e-mail.

    Args:
        email: Endereco de e-mail

    Returns:
        Tupla (is_valid, message)
    """
    if not email:
        return False, "E-mail vazio"

    # Regex simples para validacao de e-mail
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if re.match(pattern, email.strip()):
        return True, "E-mail valido"

    return False, "Formato de e-mail invalido"


def validate_currency(value: Union[str, float, int], allow_negative: bool = False) -> Tuple[bool, str]:
    """
    Valida um valor monetario.

    Args:
        value: Valor monetario
        allow_negative: Se permite valores negativos

    Returns:
        Tupla (is_valid, message)
    """
    if value is None:
        return False, "Valor vazio"

    try:
        if isinstance(value, str):
            # Remove formatacao BR
            value_clean = value.replace('R$', '').replace('.', '').replace(',', '.').strip()
            numeric_value = float(value_clean)
        else:
            numeric_value = float(value)

        if not allow_negative and numeric_value < 0:
            return False, "Valor nao pode ser negativo"

        return True, "Valor valido"
    except (ValueError, TypeError) as e:
        return False, f"Valor monetario invalido: {e}"


def validate_field(canonical_id: str, value: Any) -> Tuple[bool, str]:
    """
    Valida um campo baseado em seu ID canonico.

    Args:
        canonical_id: ID canonico do campo
        value: Valor a ser validado

    Returns:
        Tupla (is_valid, message)
    """
    if value is None or (isinstance(value, str) and not value.strip()):
        return True, "Campo vazio (nao validado)"

    # Mapeamento de campos para validadores
    validators = {
        'pn_cpf': validate_cpf,
        'pj_cnpj': validate_cnpj,
        'pj_admin_cpf': validate_cpf,
        'pj_procurador_cpf': validate_cpf,
        'pn_estado_emissor_rg': validate_uf,
        'pn_domicilio_estado': validate_uf,
        'pj_admin_estado_emissor_rg': validate_uf,
        'pj_procurador_estado_emissor_rg': validate_uf,
        'pj_sede_estado': validate_uf,
        'im_estado': validate_uf,
        'im_matricula_cartorio_estado': validate_uf,
        'pn_domicilio_cep': validate_cep,
        'pj_sede_cep': validate_cep,
        'pj_admin_domicilio_cep': validate_cep,
        'pj_procurador_domicilio_cep': validate_cep,
        'im_cep': validate_cep,
        'pn_email': validate_email,
        'pj_admin_email': validate_email,
        'pj_procurador_email': validate_email,
        'pn_estado_civil': validate_estado_civil,
        'pj_admin_estado_civil': validate_estado_civil,
        'pj_procurador_estado_civil': validate_estado_civil,
        'pn_regime_bens': validate_regime_bens,
    }

    # Validadores para campos de data
    date_fields = [
        'pn_data_nascimento', 'pn_data_emissao_rg', 'pn_data_casamento',
        'pn_data_obito', 'pn_data_separacao', 'pn_data_divorcio',
        'pn_cndt_data_expedicao', 'pn_certidao_uniao_data_emissao',
        'pn_certidao_uniao_validade', 'pj_data_sessao_registro',
        'pj_data_procuracao', 'im_cnd_iptu_data', 'im_certidao_matricula_data',
        'ng_pagamento_data', 'ng_itbi_data_pagamento'
    ]

    # Validadores para campos monetarios
    currency_fields = [
        'im_valor_venal_iptu', 'im_valor_venal_referencia',
        'ng_valor_total', 'ng_alienante_valor_alienacao',
        'ng_adquirente_valor_aquisicao', 'ng_itbi_base_calculo', 'ng_itbi_valor'
    ]

    # Executa validador especifico se existir
    if canonical_id in validators:
        return validators[canonical_id](value)

    if canonical_id in date_fields:
        return validate_date(value)

    if canonical_id in currency_fields:
        return validate_currency(value)

    # Validacao generica: campo nao vazio
    return True, "Campo valido (validacao generica)"


def validate_data_batch(data: Dict[str, Any]) -> Dict[str, Tuple[bool, str]]:
    """
    Valida um lote de dados normalizados.

    Args:
        data: Dicionario com campos canonicos e valores

    Returns:
        Dicionario {canonical_id: (is_valid, message)}
    """
    results = {}
    for canonical_id, value in data.items():
        results[canonical_id] = validate_field(canonical_id, value)
    return results


def get_validation_summary(validation_results: Dict[str, Tuple[bool, str]]) -> Dict[str, Any]:
    """
    Gera sumario de validacao.

    Args:
        validation_results: Resultados de validate_data_batch

    Returns:
        Dicionario com estatisticas de validacao
    """
    total = len(validation_results)
    valid = sum(1 for is_valid, _ in validation_results.values() if is_valid)
    invalid = total - valid

    invalid_fields = [
        {"field": field, "message": message}
        for field, (is_valid, message) in validation_results.items()
        if not is_valid
    ]

    return {
        "total_fields": total,
        "valid_fields": valid,
        "invalid_fields": invalid,
        "validation_rate": valid / total if total > 0 else 0,
        "invalid_field_details": invalid_fields
    }
