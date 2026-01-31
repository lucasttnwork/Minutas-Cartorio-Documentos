"""
nomenclature - Biblioteca de Normalizacao de Nomenclaturas de Campos

Esta biblioteca fornece uma fonte de verdade unica para nomenclatura de campos
no projeto de minutas cartorarias. Ela permite:

1. Converter nomes de campo entre diferentes formatos (schema, extraction, UI)
2. Normalizar dados extraidos para formato canonico
3. Validar valores de campos conforme especificacoes
4. Gerar documentacao automatica

Uso basico:
    from execution.nomenclature import FieldNormalizer, to_canonical, normalize_data

    # Usando a classe principal
    normalizer = FieldNormalizer()
    canonical_id = normalizer.to_canonical("nome_completo")
    normalized = normalizer.normalize_extracted_data(data, "RG")

    # Usando funcoes de conveniencia
    canonical_id = to_canonical("nome_completo")
    normalized = normalize_data(data, "RG")

Autor: Pipeline de Minutas
Data: Janeiro 2026
Versao: 2.0
"""

from .normalizer import (
    FieldNormalizer,
    get_normalizer,
    to_canonical,
    to_display,
    normalize_data,
)

from .validators import (
    validate_cpf,
    validate_cnpj,
    validate_uf,
    validate_cep,
    validate_date,
    validate_email,
    validate_field,
    validate_data_batch,
    get_validation_summary,
)

__version__ = "2.0.0"
__all__ = [
    # Classes principais
    "FieldNormalizer",

    # Funcoes de normalizacao
    "get_normalizer",
    "to_canonical",
    "to_display",
    "normalize_data",

    # Funcoes de validacao
    "validate_cpf",
    "validate_cnpj",
    "validate_uf",
    "validate_cep",
    "validate_date",
    "validate_email",
    "validate_field",
    "validate_data_batch",
    "get_validation_summary",
]
