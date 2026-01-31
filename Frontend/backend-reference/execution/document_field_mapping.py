#!/usr/bin/env python3
"""
document_field_mapping.py - Mapeamento de Tipos de Documento para Campos Uteis

Define quais campos do guia podem ser extraidos de cada tipo de documento.
Permite correlacionar documentos e identificar redundancias/deduplicacao.

Uso:
    python execution/document_field_mapping.py --list-types
    python execution/document_field_mapping.py --list-fields
    python execution/document_field_mapping.py --type RG
    python execution/document_field_mapping.py --field cpf
    python execution/document_field_mapping.py --coverage
    python execution/document_field_mapping.py --export mapping.json
    python execution/document_field_mapping.py --matrix

Autor: Sistema de Minutas
Data: 2026-01-28
"""

import argparse
import json
import sys
from typing import Dict, List, Set, Optional
from collections import defaultdict


# =============================================================================
# DEFINICAO DE CAMPOS POR CATEGORIA
# =============================================================================

# Campos de Pessoa Natural (39 campos no guia)
CAMPOS_PESSOA_NATURAL = {
    # Dados Individuais (12)
    "nome": "Nome completo da pessoa",
    "cpf": "Cadastro de Pessoa Fisica",
    "rg": "Numero do RG",
    "orgao_emissor_rg": "Orgao emissor do RG (SSP, DETRAN, etc.)",
    "estado_emissor_rg": "UF de emissao do RG",
    "data_emissao_rg": "Data de emissao do RG",
    "nacionalidade": "Nacionalidade (brasileiro, etc.)",
    "profissao": "Profissao ou ocupacao",
    "data_nascimento": "Data de nascimento",
    "data_obito": "Data do obito (se falecido)",
    "cnh": "Numero da CNH",
    "orgao_emissor_cnh": "Orgao emissor da CNH (DETRAN-XX)",

    # Dados Familiares (10)
    "estado_civil": "Estado civil (solteiro, casado, etc.)",
    "regime_bens": "Regime de bens do casamento",
    "data_casamento": "Data do casamento",
    "data_separacao": "Data da separacao",
    "data_divorcio": "Data do divorcio",
    "data_falecimento_conjuge": "Data de falecimento do conjuge",
    "uniao_estavel": "Possui uniao estavel (sim/nao)",
    "regime_bens_uniao_estavel": "Regime de bens da uniao estavel",
    "data_uniao_estavel": "Data da uniao estavel",
    "data_extincao_uniao_estavel": "Data de extincao da uniao estavel",

    # Filiacao
    "filiacao_pai": "Nome do pai",
    "filiacao_mae": "Nome da mae",
    "naturalidade": "Local de nascimento (cidade/UF)",

    # Domicilio (7)
    "domicilio_logradouro": "Logradouro do domicilio",
    "domicilio_numero": "Numero do domicilio",
    "domicilio_complemento": "Complemento do domicilio",
    "domicilio_bairro": "Bairro do domicilio",
    "domicilio_cidade": "Cidade do domicilio",
    "domicilio_estado": "Estado do domicilio",
    "domicilio_cep": "CEP do domicilio",

    # Contatos (2)
    "email": "Endereco de e-mail",
    "telefone": "Numero de telefone",

    # CNDT (3)
    "cndt_numero": "Numero da CNDT",
    "cndt_data_expedicao": "Data de expedicao da CNDT",
    "cndt_hora_expedicao": "Hora de expedicao da CNDT",

    # Certidao da Uniao (5)
    "certidao_uniao_tipo": "Tipo da certidao (negativa, positiva com efeitos de negativa)",
    "certidao_uniao_data_emissao": "Data de emissao da certidao da Uniao",
    "certidao_uniao_hora_emissao": "Hora de emissao da certidao da Uniao",
    "certidao_uniao_validade": "Data de validade da certidao",
    "certidao_uniao_codigo_controle": "Codigo de controle da certidao",
}

# Campos de Pessoa Juridica (76 campos no guia)
CAMPOS_PESSOA_JURIDICA = {
    # Qualificacao (3)
    "pj_denominacao": "Razao social ou denominacao",
    "pj_cnpj": "CNPJ da empresa",
    "pj_nire": "NIRE (Numero de Inscricao no Registro de Empresas)",

    # Sede (7)
    "pj_sede_logradouro": "Logradouro da sede",
    "pj_sede_numero": "Numero da sede",
    "pj_sede_complemento": "Complemento da sede",
    "pj_sede_bairro": "Bairro da sede",
    "pj_sede_cidade": "Cidade da sede",
    "pj_sede_estado": "Estado da sede",
    "pj_sede_cep": "CEP da sede",

    # Registro Vigente (4)
    "pj_instrumento_constitutivo": "Tipo do instrumento constitutivo",
    "pj_junta_comercial": "Junta Comercial de registro",
    "pj_numero_registro_contrato": "Numero de registro do contrato social",
    "pj_data_sessao_registro": "Data da sessao de registro",

    # Certidao (2)
    "pj_data_expedicao_ficha_cadastral": "Data de expedicao da ficha cadastral",
    "pj_data_expedicao_certidao_registro": "Data de expedicao da certidao de registro",

    # Administrador - Dados Pessoais (12)
    "pj_admin_nome": "Nome do administrador",
    "pj_admin_cpf": "CPF do administrador",
    "pj_admin_rg": "RG do administrador",
    "pj_admin_orgao_emissor_rg": "Orgao emissor do RG do administrador",
    "pj_admin_estado_emissor_rg": "Estado emissor do RG do administrador",
    "pj_admin_data_emissao_rg": "Data emissao RG do administrador",
    "pj_admin_cnh": "CNH do administrador",
    "pj_admin_orgao_emissor_cnh": "Orgao emissor CNH do administrador",
    "pj_admin_data_nascimento": "Data de nascimento do administrador",
    "pj_admin_estado_civil": "Estado civil do administrador",
    "pj_admin_profissao": "Profissao do administrador",
    "pj_admin_nacionalidade": "Nacionalidade do administrador",

    # Administrador - Domicilio (7)
    "pj_admin_domicilio_logradouro": "Logradouro do administrador",
    "pj_admin_domicilio_numero": "Numero do administrador",
    "pj_admin_domicilio_complemento": "Complemento do administrador",
    "pj_admin_domicilio_bairro": "Bairro do administrador",
    "pj_admin_domicilio_cidade": "Cidade do administrador",
    "pj_admin_domicilio_estado": "Estado do administrador",
    "pj_admin_domicilio_cep": "CEP do administrador",

    # Administrador - Contato (2)
    "pj_admin_email": "E-mail do administrador",
    "pj_admin_telefone": "Telefone do administrador",

    # Instrumento de Representacao - Administracao (5)
    "pj_tipo_representacao": "Tipo de representacao (administrador/procurador)",
    "pj_clausula_indica_admin": "Clausula que indica o administrador",
    "pj_data_ata_admin": "Data da ata que indica o administrador",
    "pj_numero_registro_ata": "Numero de registro da ata",
    "pj_clausula_poderes_admin": "Clausula sobre poderes do administrador",

    # Procurador - Dados Pessoais (12)
    "pj_procurador_nome": "Nome do procurador",
    "pj_procurador_cpf": "CPF do procurador",
    "pj_procurador_rg": "RG do procurador",
    "pj_procurador_orgao_emissor_rg": "Orgao emissor RG do procurador",
    "pj_procurador_estado_emissor_rg": "Estado emissor RG do procurador",
    "pj_procurador_data_emissao_rg": "Data emissao RG do procurador",
    "pj_procurador_cnh": "CNH do procurador",
    "pj_procurador_orgao_emissor_cnh": "Orgao emissor CNH do procurador",
    "pj_procurador_data_nascimento": "Data de nascimento do procurador",
    "pj_procurador_estado_civil": "Estado civil do procurador",
    "pj_procurador_profissao": "Profissao do procurador",
    "pj_procurador_nacionalidade": "Nacionalidade do procurador",

    # Procurador - Domicilio (7)
    "pj_procurador_domicilio_logradouro": "Logradouro do procurador",
    "pj_procurador_domicilio_numero": "Numero do procurador",
    "pj_procurador_domicilio_complemento": "Complemento do procurador",
    "pj_procurador_domicilio_bairro": "Bairro do procurador",
    "pj_procurador_domicilio_cidade": "Cidade do procurador",
    "pj_procurador_domicilio_estado": "Estado do procurador",
    "pj_procurador_domicilio_cep": "CEP do procurador",

    # Procurador - Contato (2)
    "pj_procurador_email": "E-mail do procurador",
    "pj_procurador_telefone": "Telefone do procurador",

    # Instrumento de Representacao - Procuracao (5)
    "pj_tabelionato_procuracao": "Tabelionato da procuracao publica",
    "pj_data_procuracao": "Data da procuracao publica",
    "pj_livro_procuracao": "Livro da procuracao publica",
    "pj_paginas_procuracao": "Paginas da procuracao publica",
    "pj_data_expedicao_certidao_procuracao": "Data de expedicao da certidao da procuracao",

    # CNDT da PJ (3)
    "pj_cndt_numero": "Numero da CNDT da PJ",
    "pj_cndt_data_expedicao": "Data de expedicao da CNDT da PJ",
    "pj_cndt_hora_expedicao": "Hora de expedicao da CNDT da PJ",

    # Certidao da Uniao da PJ (5)
    "pj_certidao_uniao_tipo": "Tipo da certidao da Uniao da PJ",
    "pj_certidao_uniao_data_emissao": "Data de emissao da certidao da Uniao da PJ",
    "pj_certidao_uniao_hora_emissao": "Hora de emissao da certidao da Uniao da PJ",
    "pj_certidao_uniao_validade": "Validade da certidao da Uniao da PJ",
    "pj_certidao_uniao_codigo_controle": "Codigo de controle da certidao da Uniao da PJ",
}

# Campos do Imovel (33+ campos no guia)
CAMPOS_IMOVEL = {
    # Matricula Imobiliaria (5)
    "matricula_numero": "Numero da matricula",
    "matricula_cartorio_numero": "Numero do Registro de Imoveis",
    "matricula_cartorio_cidade": "Cidade do Registro de Imoveis",
    "matricula_cartorio_estado": "Estado do Registro de Imoveis",
    "matricula_numero_nacional": "Numero nacional da matricula",

    # Descricao do Imovel (12)
    "imovel_denominacao": "Tipo do imovel (apartamento, casa, terreno, etc.)",
    "imovel_area_total": "Area total em m2",
    "imovel_area_privativa": "Area privativa em m2",
    "imovel_area_construida": "Area construida em m2",
    "imovel_logradouro": "Logradouro do imovel",
    "imovel_numero": "Numero do imovel",
    "imovel_complemento": "Complemento do imovel",
    "imovel_bairro": "Bairro do imovel",
    "imovel_cidade": "Cidade do imovel",
    "imovel_estado": "Estado do imovel",
    "imovel_cep": "CEP do imovel",
    "imovel_descricao_conforme_matricula": "Descricao completa conforme matricula",

    # Cadastro Imobiliario (2)
    "imovel_sql": "Cadastro Municipal (SQL)",
    "imovel_data_certidao_cadastro": "Data de expedicao da certidao de cadastro municipal",

    # Valores Venais (2)
    "imovel_valor_venal_iptu": "Valor venal para IPTU",
    "imovel_valor_venal_referencia": "Valor venal de referencia para ITBI",

    # Negativa de IPTU (3)
    "imovel_cnd_iptu_numero": "Numero da certidao negativa de IPTU",
    "imovel_cnd_iptu_data": "Data de expedicao da CND de IPTU",
    "imovel_cnd_iptu_valida": "Certidao de IPTU valida (sim/nao)",

    # Certidao da Matricula (3)
    "imovel_certidao_matricula_numero": "Numero da certidao da matricula",
    "imovel_certidao_matricula_data": "Data de expedicao da certidao da matricula",
    "imovel_certidao_matricula_valida": "Certidao da matricula valida (sim/nao)",

    # Proprietarios (5 por proprietario)
    "proprietario_nome": "Nome do proprietario",
    "proprietario_fracao_ideal": "Fracao ideal do proprietario",
    "proprietario_registro_aquisicao": "Numero do registro de aquisicao (R.X)",
    "proprietario_data_registro": "Data do registro de aquisicao",
    "proprietario_titulo_aquisicao": "Titulo de aquisicao (compra e venda, etc.)",

    # Onus (4 + 2 por titular)
    "onus_titulo": "Titulo do onus (penhora, hipoteca, etc.)",
    "onus_registro": "Numero do registro do onus",
    "onus_data_registro": "Data do registro do onus",
    "onus_descricao": "Descricao do onus conforme matricula",
    "onus_titular_nome": "Nome do titular do onus",
    "onus_titular_fracao": "Fracao do titular do onus",

    # Ressalvas (2)
    "ressalva_existencia": "Existe ressalva na certificacao (sim/nao)",
    "ressalva_descricao": "Descricao da ressalva",
}

# Campos do Negocio Juridico (33+ campos no guia)
CAMPOS_NEGOCIO = {
    # Valor (3)
    "negocio_valor_matricula": "Valor da matricula",
    "negocio_fracao_alienada": "Fracao ideal alienada",
    "negocio_valor_total": "Valor total da alienacao",

    # Alienantes - Pessoa Natural (6)
    "alienante_nome": "Nome do alienante",
    "alienante_fracao_ideal": "Fracao ideal do alienante",
    "alienante_valor_alienacao": "Valor da alienacao do alienante",
    "alienante_conjuge": "Conjuge do alienante",
    "alienante_comparece_escritura": "Alienante comparece na escritura (sim/nao)",
    "alienante_qualidade_comparecimento": "Qualidade do comparecimento (autocontratante, etc.)",

    # Alienantes - Pessoa Juridica (3)
    "alienante_pj_denominacao": "Denominacao da PJ alienante",
    "alienante_pj_fracao_ideal": "Fracao ideal da PJ alienante",
    "alienante_pj_valor_alienacao": "Valor da alienacao da PJ alienante",

    # Adquirentes - Pessoa Natural (3)
    "adquirente_nome": "Nome do adquirente",
    "adquirente_fracao_ideal": "Fracao ideal do adquirente",
    "adquirente_valor_aquisicao": "Valor da aquisicao do adquirente",

    # Adquirentes - Pessoa Juridica (3)
    "adquirente_pj_denominacao": "Denominacao da PJ adquirente",
    "adquirente_pj_fracao_ideal": "Fracao ideal da PJ adquirente",
    "adquirente_pj_valor_aquisicao": "Valor da aquisicao da PJ adquirente",

    # Forma de Pagamento (9)
    "pagamento_tipo": "Tipo de pagamento (a vista, financiado, etc.)",
    "pagamento_modo": "Modo de pagamento (transferencia, PIX, etc.)",
    "pagamento_data": "Data do pagamento",
    "pagamento_banco_origem": "Banco de origem do pagamento",
    "pagamento_agencia_origem": "Agencia de origem do pagamento",
    "pagamento_conta_origem": "Conta de origem do pagamento",
    "pagamento_banco_destino": "Banco de destino do pagamento",
    "pagamento_agencia_destino": "Agencia de destino do pagamento",
    "pagamento_conta_destino": "Conta de destino do pagamento",

    # Termos Especiais (3)
    "termos_promessa": "Termos constantes na promessa de compra e venda",
    "termos_especiais": "Termos especiais para a minuta",
    "instrucoes_extras": "Instrucoes extras para a minuta",

    # Imposto de Transmissao (3)
    "itbi_numero_guia": "Numero da guia de ITBI",
    "itbi_base_calculo": "Base de calculo do ITBI",
    "itbi_valor": "Valor do ITBI",
}


# =============================================================================
# MAPEAMENTO: TIPO DE DOCUMENTO -> CAMPOS QUE PODE FORNECER
# =============================================================================

DOCUMENT_FIELD_MAPPING: Dict[str, Dict[str, List[str]]] = {

    # -------------------------------------------------------------------------
    # DOCUMENTOS PESSOAIS
    # -------------------------------------------------------------------------

    "RG": {
        "pessoa_natural": [
            "nome", "cpf", "rg", "orgao_emissor_rg", "estado_emissor_rg",
            "data_emissao_rg", "data_nascimento", "naturalidade",
            "filiacao_pai", "filiacao_mae"
        ],
        "pessoa_juridica": [],
        "imovel": [],
        "negocio": []
    },

    "CNH": {
        "pessoa_natural": [
            "nome", "cpf", "cnh", "orgao_emissor_cnh", "data_nascimento"
        ],
        "pessoa_juridica": [],
        "imovel": [],
        "negocio": []
    },

    "CPF": {
        "pessoa_natural": [
            "nome", "cpf", "data_nascimento"
        ],
        "pessoa_juridica": [],
        "imovel": [],
        "negocio": []
    },

    "CERTIDAO_NASCIMENTO": {
        "pessoa_natural": [
            "nome", "data_nascimento", "naturalidade",
            "filiacao_pai", "filiacao_mae"
        ],
        "pessoa_juridica": [],
        "imovel": [],
        "negocio": []
    },

    "CERTIDAO_CASAMENTO": {
        "pessoa_natural": [
            "nome", "cpf", "data_nascimento", "estado_civil", "regime_bens",
            "data_casamento", "filiacao_pai", "filiacao_mae", "nacionalidade"
        ],
        "pessoa_juridica": [],
        "imovel": [],
        "negocio": [
            "alienante_conjuge"
        ]
    },

    "CERTIDAO_OBITO": {
        "pessoa_natural": [
            "nome", "data_obito", "estado_civil", "data_falecimento_conjuge"
        ],
        "pessoa_juridica": [],
        "imovel": [],
        "negocio": []
    },

    "COMPROVANTE_RESIDENCIA": {
        "pessoa_natural": [
            "nome", "domicilio_logradouro", "domicilio_numero", "domicilio_complemento",
            "domicilio_bairro", "domicilio_cidade", "domicilio_estado", "domicilio_cep"
        ],
        "pessoa_juridica": [],
        "imovel": [],
        "negocio": []
    },

    # -------------------------------------------------------------------------
    # CERTIDOES (CNDT, CND)
    # -------------------------------------------------------------------------

    "CNDT": {
        "pessoa_natural": [
            "nome", "cpf", "cndt_numero", "cndt_data_expedicao", "cndt_hora_expedicao"
        ],
        "pessoa_juridica": [
            "pj_denominacao", "pj_cnpj", "pj_cndt_numero",
            "pj_cndt_data_expedicao", "pj_cndt_hora_expedicao"
        ],
        "imovel": [],
        "negocio": []
    },

    "CND_FEDERAL": {
        "pessoa_natural": [
            "nome", "cpf", "certidao_uniao_tipo", "certidao_uniao_data_emissao",
            "certidao_uniao_hora_emissao", "certidao_uniao_validade",
            "certidao_uniao_codigo_controle"
        ],
        "pessoa_juridica": [
            "pj_denominacao", "pj_cnpj", "pj_certidao_uniao_tipo",
            "pj_certidao_uniao_data_emissao", "pj_certidao_uniao_hora_emissao",
            "pj_certidao_uniao_validade", "pj_certidao_uniao_codigo_controle"
        ],
        "imovel": [],
        "negocio": []
    },

    "CND_ESTADUAL": {
        "pessoa_natural": [
            "nome", "cpf"
        ],
        "pessoa_juridica": [
            "pj_denominacao", "pj_cnpj"
        ],
        "imovel": [],
        "negocio": []
    },

    "CND_MUNICIPAL": {
        "pessoa_natural": [
            "nome", "cpf"
        ],
        "pessoa_juridica": [
            "pj_denominacao", "pj_cnpj"
        ],
        "imovel": [
            "imovel_sql", "imovel_logradouro", "imovel_numero", "imovel_bairro",
            "imovel_cidade", "imovel_estado", "imovel_cnd_iptu_numero",
            "imovel_cnd_iptu_data", "imovel_cnd_iptu_valida"
        ],
        "negocio": []
    },

    "CND_IMOVEL": {
        "pessoa_natural": [],
        "pessoa_juridica": [],
        "imovel": [
            "imovel_sql", "matricula_numero", "imovel_logradouro", "imovel_numero",
            "imovel_complemento", "imovel_bairro", "imovel_cidade", "imovel_estado",
            "imovel_cnd_iptu_numero", "imovel_cnd_iptu_data", "imovel_cnd_iptu_valida"
        ],
        "negocio": []
    },

    "CND_CONDOMINIO": {
        "pessoa_natural": [
            "nome"
        ],
        "pessoa_juridica": [],
        "imovel": [
            "imovel_complemento"  # Identificacao da unidade
        ],
        "negocio": []
    },

    "CONTRATO_SOCIAL": {
        "pessoa_natural": [],
        "pessoa_juridica": [
            "pj_denominacao", "pj_cnpj", "pj_nire",
            "pj_sede_logradouro", "pj_sede_numero", "pj_sede_complemento",
            "pj_sede_bairro", "pj_sede_cidade", "pj_sede_estado", "pj_sede_cep",
            "pj_instrumento_constitutivo", "pj_junta_comercial",
            "pj_numero_registro_contrato", "pj_data_sessao_registro",
            "pj_admin_nome", "pj_admin_cpf", "pj_admin_rg",
            "pj_admin_orgao_emissor_rg", "pj_admin_estado_emissor_rg",
            "pj_admin_data_nascimento", "pj_admin_estado_civil",
            "pj_admin_profissao", "pj_admin_nacionalidade",
            "pj_admin_domicilio_logradouro", "pj_admin_domicilio_numero",
            "pj_admin_domicilio_bairro", "pj_admin_domicilio_cidade",
            "pj_admin_domicilio_estado", "pj_admin_domicilio_cep",
            "pj_tipo_representacao", "pj_clausula_indica_admin",
            "pj_clausula_poderes_admin"
        ],
        "imovel": [],
        "negocio": []
    },

    # -------------------------------------------------------------------------
    # DOCUMENTOS DO IMOVEL
    # -------------------------------------------------------------------------

    "MATRICULA_IMOVEL": {
        "pessoa_natural": [
            "nome", "cpf", "estado_civil", "profissao", "nacionalidade"
        ],
        "pessoa_juridica": [
            "pj_denominacao", "pj_cnpj"
        ],
        "imovel": [
            "matricula_numero", "matricula_cartorio_numero", "matricula_cartorio_cidade",
            "matricula_cartorio_estado", "matricula_numero_nacional",
            "imovel_denominacao", "imovel_area_total", "imovel_area_privativa",
            "imovel_area_construida", "imovel_logradouro", "imovel_numero",
            "imovel_complemento", "imovel_bairro", "imovel_cidade", "imovel_estado",
            "imovel_cep", "imovel_descricao_conforme_matricula",
            "imovel_certidao_matricula_numero", "imovel_certidao_matricula_data",
            "proprietario_nome", "proprietario_fracao_ideal", "proprietario_registro_aquisicao",
            "proprietario_data_registro", "proprietario_titulo_aquisicao",
            "onus_titulo", "onus_registro", "onus_data_registro", "onus_descricao",
            "onus_titular_nome", "onus_titular_fracao",
            "ressalva_existencia", "ressalva_descricao"
        ],
        "negocio": []
    },

    "ITBI": {
        "pessoa_natural": [
            "nome", "cpf"
        ],
        "pessoa_juridica": [
            "pj_denominacao", "pj_cnpj"
        ],
        "imovel": [
            "imovel_sql", "imovel_logradouro", "imovel_numero",
            "imovel_bairro", "imovel_cidade", "imovel_estado"
        ],
        "negocio": [
            "negocio_valor_total", "alienante_nome", "adquirente_nome",
            "itbi_numero_guia", "itbi_base_calculo", "itbi_valor"
        ]
    },

    "VVR": {
        "pessoa_natural": [],
        "pessoa_juridica": [],
        "imovel": [
            "imovel_sql", "imovel_valor_venal_referencia",
            "imovel_logradouro", "imovel_numero", "imovel_area_construida"
        ],
        "negocio": []
    },

    "IPTU": {
        "pessoa_natural": [
            "nome", "cpf"
        ],
        "pessoa_juridica": [],
        "imovel": [
            "imovel_sql", "imovel_valor_venal_iptu",
            "imovel_logradouro", "imovel_numero", "imovel_bairro",
            "imovel_cidade", "imovel_estado", "imovel_cep",
            "imovel_area_total", "imovel_area_construida"
        ],
        "negocio": []
    },

    "DADOS_CADASTRAIS": {
        "pessoa_natural": [],
        "pessoa_juridica": [],
        "imovel": [
            "imovel_sql", "imovel_logradouro", "imovel_numero",
            "imovel_complemento", "imovel_bairro", "imovel_cidade",
            "imovel_estado", "imovel_cep", "imovel_area_total",
            "imovel_area_construida", "imovel_denominacao",
            "imovel_data_certidao_cadastro"
        ],
        "negocio": []
    },

    "ESCRITURA": {
        "pessoa_natural": [
            "nome", "cpf", "rg", "orgao_emissor_rg", "estado_emissor_rg",
            "nacionalidade", "profissao", "estado_civil", "regime_bens",
            "domicilio_logradouro", "domicilio_numero", "domicilio_bairro",
            "domicilio_cidade", "domicilio_estado", "domicilio_cep"
        ],
        "pessoa_juridica": [
            "pj_denominacao", "pj_cnpj", "pj_sede_logradouro", "pj_sede_numero",
            "pj_sede_bairro", "pj_sede_cidade", "pj_sede_estado", "pj_sede_cep",
            "pj_admin_nome", "pj_admin_cpf"
        ],
        "imovel": [
            "matricula_numero", "matricula_cartorio_numero", "matricula_cartorio_cidade",
            "imovel_denominacao", "imovel_descricao_conforme_matricula",
            "imovel_logradouro", "imovel_numero", "imovel_complemento",
            "imovel_bairro", "imovel_cidade", "imovel_estado"
        ],
        "negocio": [
            "negocio_valor_total", "alienante_nome", "adquirente_nome",
            "pagamento_tipo", "pagamento_modo"
        ]
    },

    # -------------------------------------------------------------------------
    # DOCUMENTOS DO NEGOCIO
    # -------------------------------------------------------------------------

    "COMPROMISSO_COMPRA_VENDA": {
        "pessoa_natural": [
            "nome", "cpf", "rg", "orgao_emissor_rg", "estado_emissor_rg",
            "nacionalidade", "profissao", "estado_civil", "regime_bens",
            "data_nascimento", "domicilio_logradouro", "domicilio_numero",
            "domicilio_complemento", "domicilio_bairro", "domicilio_cidade",
            "domicilio_estado", "domicilio_cep", "email", "telefone"
        ],
        "pessoa_juridica": [
            "pj_denominacao", "pj_cnpj", "pj_sede_logradouro", "pj_sede_numero",
            "pj_sede_complemento", "pj_sede_bairro", "pj_sede_cidade",
            "pj_sede_estado", "pj_sede_cep"
        ],
        "imovel": [
            "matricula_numero", "matricula_cartorio_numero", "matricula_cartorio_cidade",
            "imovel_denominacao", "imovel_logradouro", "imovel_numero",
            "imovel_complemento", "imovel_bairro", "imovel_cidade", "imovel_estado",
            "imovel_area_total", "imovel_area_privativa"
        ],
        "negocio": [
            "negocio_valor_total", "negocio_fracao_alienada",
            "alienante_nome", "alienante_fracao_ideal", "alienante_valor_alienacao",
            "alienante_conjuge", "adquirente_nome", "adquirente_fracao_ideal",
            "adquirente_valor_aquisicao", "pagamento_tipo", "pagamento_modo",
            "pagamento_data", "termos_promessa"
        ]
    },

    "PROCURACAO": {
        "pessoa_natural": [
            "nome", "cpf", "rg", "orgao_emissor_rg", "estado_emissor_rg",
            "nacionalidade", "profissao", "estado_civil",
            "domicilio_logradouro", "domicilio_numero", "domicilio_bairro",
            "domicilio_cidade", "domicilio_estado", "domicilio_cep"
        ],
        "pessoa_juridica": [
            "pj_denominacao", "pj_cnpj",
            "pj_procurador_nome", "pj_procurador_cpf", "pj_procurador_rg",
            "pj_procurador_orgao_emissor_rg", "pj_procurador_estado_emissor_rg",
            "pj_procurador_data_nascimento", "pj_procurador_estado_civil",
            "pj_procurador_profissao", "pj_procurador_nacionalidade",
            "pj_procurador_domicilio_logradouro", "pj_procurador_domicilio_numero",
            "pj_procurador_domicilio_bairro", "pj_procurador_domicilio_cidade",
            "pj_procurador_domicilio_estado", "pj_procurador_domicilio_cep",
            "pj_tabelionato_procuracao", "pj_data_procuracao",
            "pj_livro_procuracao", "pj_paginas_procuracao"
        ],
        "imovel": [],
        "negocio": []
    },

    "COMPROVANTE_PAGAMENTO": {
        "pessoa_natural": [
            "nome"
        ],
        "pessoa_juridica": [
            "pj_denominacao"
        ],
        "imovel": [],
        "negocio": [
            "pagamento_tipo", "pagamento_modo", "pagamento_data",
            "pagamento_banco_origem", "pagamento_agencia_origem", "pagamento_conta_origem",
            "pagamento_banco_destino", "pagamento_agencia_destino", "pagamento_conta_destino"
        ]
    },

    # -------------------------------------------------------------------------
    # DOCUMENTOS ADMINISTRATIVOS
    # -------------------------------------------------------------------------

    "PROTOCOLO_ONR": {
        "pessoa_natural": [],
        "pessoa_juridica": [],
        "imovel": [
            "matricula_numero", "matricula_cartorio_numero"
        ],
        "negocio": []
    },

    "ASSINATURA_DIGITAL": {
        "pessoa_natural": [
            "nome"
        ],
        "pessoa_juridica": [],
        "imovel": [],
        "negocio": []
    },

    "OUTRO": {
        "pessoa_natural": [],
        "pessoa_juridica": [],
        "imovel": [],
        "negocio": []
    }
}


# =============================================================================
# FUNCOES DE CONSULTA
# =============================================================================

def get_all_document_types() -> List[str]:
    """Retorna lista de todos os tipos de documentos suportados."""
    return sorted(DOCUMENT_FIELD_MAPPING.keys())


def get_all_fields() -> Dict[str, Dict[str, str]]:
    """Retorna todos os campos organizados por categoria."""
    return {
        "pessoa_natural": CAMPOS_PESSOA_NATURAL,
        "pessoa_juridica": CAMPOS_PESSOA_JURIDICA,
        "imovel": CAMPOS_IMOVEL,
        "negocio": CAMPOS_NEGOCIO
    }


def get_fields_for_document(doc_type: str) -> Dict[str, List[str]]:
    """
    Retorna campos que um tipo de documento pode fornecer.

    Args:
        doc_type: Tipo do documento (ex: "RG", "MATRICULA_IMOVEL")

    Returns:
        Dicionario com campos por categoria
    """
    doc_type = doc_type.upper()
    if doc_type not in DOCUMENT_FIELD_MAPPING:
        return {}
    return DOCUMENT_FIELD_MAPPING[doc_type]


def get_documents_for_field(field: str) -> List[str]:
    """
    Retorna tipos de documento que podem fornecer um campo.

    Args:
        field: Nome do campo (ex: "cpf", "matricula_numero")

    Returns:
        Lista de tipos de documentos
    """
    field = field.lower()
    documents = []

    for doc_type, categories in DOCUMENT_FIELD_MAPPING.items():
        for category, fields in categories.items():
            if field in [f.lower() for f in fields]:
                documents.append(doc_type)
                break

    return sorted(documents)


def get_field_category(field: str) -> Optional[str]:
    """
    Retorna a categoria de um campo.

    Args:
        field: Nome do campo

    Returns:
        Nome da categoria ou None se nao encontrado
    """
    field = field.lower()

    all_fields = get_all_fields()
    for category, fields_dict in all_fields.items():
        if field in [f.lower() for f in fields_dict.keys()]:
            return category

    return None


def get_field_description(field: str) -> Optional[str]:
    """
    Retorna a descricao de um campo.

    Args:
        field: Nome do campo

    Returns:
        Descricao do campo ou None se nao encontrado
    """
    field = field.lower()

    all_fields = get_all_fields()
    for category, fields_dict in all_fields.items():
        for field_name, description in fields_dict.items():
            if field_name.lower() == field:
                return description

    return None


def get_coverage_report() -> Dict:
    """
    Gera relatorio de cobertura de campos.

    Returns:
        Dicionario com estatisticas de cobertura
    """
    all_fields = get_all_fields()

    # Contar total de campos por categoria
    totals = {cat: len(fields) for cat, fields in all_fields.items()}

    # Calcular cobertura por documento
    doc_coverage = {}
    for doc_type, categories in DOCUMENT_FIELD_MAPPING.items():
        doc_coverage[doc_type] = {
            "pessoa_natural": len(categories.get("pessoa_natural", [])),
            "pessoa_juridica": len(categories.get("pessoa_juridica", [])),
            "imovel": len(categories.get("imovel", [])),
            "negocio": len(categories.get("negocio", [])),
            "total": sum(len(v) for v in categories.values())
        }

    # Calcular campos com cobertura (quantos docs fornecem cada campo)
    field_coverage = defaultdict(list)
    for doc_type, categories in DOCUMENT_FIELD_MAPPING.items():
        for category, fields in categories.items():
            for field in fields:
                field_coverage[field].append(doc_type)

    # Identificar campos sem cobertura
    uncovered_fields = []
    for category, fields_dict in all_fields.items():
        for field in fields_dict.keys():
            if field not in field_coverage:
                uncovered_fields.append({"field": field, "category": category})

    # Campos com mais redundancia (mais documentos fornecem)
    most_redundant = sorted(
        [(field, len(docs)) for field, docs in field_coverage.items()],
        key=lambda x: x[1],
        reverse=True
    )[:10]

    return {
        "totals_by_category": totals,
        "total_fields": sum(totals.values()),
        "total_documents": len(DOCUMENT_FIELD_MAPPING),
        "document_coverage": doc_coverage,
        "fields_with_coverage": len(field_coverage),
        "uncovered_fields": uncovered_fields,
        "most_redundant_fields": most_redundant
    }


def export_mapping(output_path: str) -> None:
    """
    Exporta mapeamento completo para JSON.

    Args:
        output_path: Caminho do arquivo de saida
    """
    export_data = {
        "metadata": {
            "version": "1.0",
            "date": "2026-01-28",
            "total_document_types": len(DOCUMENT_FIELD_MAPPING),
            "total_fields": sum(len(f) for f in get_all_fields().values())
        },
        "field_definitions": {
            "pessoa_natural": CAMPOS_PESSOA_NATURAL,
            "pessoa_juridica": CAMPOS_PESSOA_JURIDICA,
            "imovel": CAMPOS_IMOVEL,
            "negocio": CAMPOS_NEGOCIO
        },
        "document_field_mapping": DOCUMENT_FIELD_MAPPING,
        "coverage_report": get_coverage_report()
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)


def generate_matrix() -> str:
    """
    Gera matriz de campos x documentos.

    Returns:
        String formatada com a matriz
    """
    # Coletar todos os campos unicos
    all_doc_fields: Set[str] = set()
    for categories in DOCUMENT_FIELD_MAPPING.values():
        for fields in categories.values():
            all_doc_fields.update(fields)

    sorted_fields = sorted(all_doc_fields)
    doc_types = get_all_document_types()

    # Cabecalho
    header = "Campo," + ",".join(doc_types)
    lines = [header]

    # Linhas de dados
    for field in sorted_fields:
        docs_with_field = get_documents_for_field(field)
        row = [field]
        for doc in doc_types:
            row.append("X" if doc in docs_with_field else "")
        lines.append(",".join(row))

    return "\n".join(lines)


# =============================================================================
# INTERFACE DE LINHA DE COMANDO
# =============================================================================

def print_type_info(doc_type: str) -> None:
    """Imprime informacoes sobre um tipo de documento."""
    fields = get_fields_for_document(doc_type)

    if not fields:
        print(f"Tipo '{doc_type}' nao encontrado.")
        print(f"Tipos disponiveis: {', '.join(get_all_document_types())}")
        return

    print(f"\n{'='*60}")
    print(f"Tipo: {doc_type}")
    print(f"{'='*60}")

    categories = [
        ("pessoa_natural", "Campos de Pessoa Natural"),
        ("pessoa_juridica", "Campos de Pessoa Juridica"),
        ("imovel", "Campos de Imovel"),
        ("negocio", "Campos de Negocio Juridico")
    ]

    total_fields = 0
    for cat_key, cat_name in categories:
        cat_fields = fields.get(cat_key, [])
        if cat_fields:
            print(f"\n{cat_name} ({len(cat_fields)} campos):")
            for field in sorted(cat_fields):
                desc = get_field_description(field)
                print(f"  - {field}: {desc or 'N/A'}")
            total_fields += len(cat_fields)

    print(f"\n{'='*60}")
    print(f"Total de campos: {total_fields}")
    print(f"{'='*60}\n")


def print_field_info(field: str) -> None:
    """Imprime informacoes sobre um campo."""
    documents = get_documents_for_field(field)
    category = get_field_category(field)
    description = get_field_description(field)

    print(f"\n{'='*60}")
    print(f"Campo: {field}")
    print(f"{'='*60}")

    if description:
        print(f"Descricao: {description}")
    if category:
        print(f"Categoria: {category}")

    if documents:
        print(f"\nPode ser extraido de {len(documents)} tipo(s) de documento:")
        for doc in documents:
            print(f"  - {doc}")
    else:
        print("\nEste campo nao e extraido diretamente de nenhum documento.")
        print("Pode ser um campo calculado ou preenchido manualmente.")

    print(f"{'='*60}\n")


def print_coverage_report() -> None:
    """Imprime relatorio de cobertura."""
    report = get_coverage_report()

    print(f"\n{'='*60}")
    print("RELATORIO DE COBERTURA")
    print(f"{'='*60}")

    print(f"\nTotal de campos definidos: {report['total_fields']}")
    print(f"Total de tipos de documento: {report['total_documents']}")
    print(f"Campos com cobertura: {report['fields_with_coverage']}")
    print(f"Campos sem cobertura: {len(report['uncovered_fields'])}")

    print(f"\n--- Campos por Categoria ---")
    for cat, count in report['totals_by_category'].items():
        print(f"  {cat}: {count} campos")

    print(f"\n--- Cobertura por Documento ---")
    sorted_docs = sorted(
        report['document_coverage'].items(),
        key=lambda x: x[1]['total'],
        reverse=True
    )
    for doc, cov in sorted_docs:
        if cov['total'] > 0:
            print(f"  {doc}: {cov['total']} campos")

    print(f"\n--- Top 10 Campos Mais Redundantes ---")
    for field, count in report['most_redundant_fields']:
        docs = get_documents_for_field(field)
        print(f"  {field}: {count} documentos ({', '.join(docs[:3])}{'...' if len(docs) > 3 else ''})")

    if report['uncovered_fields']:
        print(f"\n--- Campos sem Cobertura ---")
        for item in report['uncovered_fields'][:10]:
            print(f"  {item['field']} ({item['category']})")
        if len(report['uncovered_fields']) > 10:
            print(f"  ... e mais {len(report['uncovered_fields']) - 10} campos")

    print(f"{'='*60}\n")


def print_all_types() -> None:
    """Lista todos os tipos de documentos."""
    types = get_all_document_types()
    print(f"\n{'='*60}")
    print(f"TIPOS DE DOCUMENTOS SUPORTADOS ({len(types)})")
    print(f"{'='*60}\n")

    # Organizar por categoria
    categories = {
        "Documentos Pessoais": ["RG", "CNH", "CPF", "CERTIDAO_NASCIMENTO",
                               "CERTIDAO_CASAMENTO", "CERTIDAO_OBITO", "COMPROVANTE_RESIDENCIA"],
        "Certidoes": ["CNDT", "CND_FEDERAL", "CND_ESTADUAL", "CND_MUNICIPAL",
                     "CND_IMOVEL", "CND_CONDOMINIO", "CONTRATO_SOCIAL"],
        "Documentos do Imovel": ["MATRICULA_IMOVEL", "ITBI", "VVR", "IPTU",
                                "DADOS_CADASTRAIS", "ESCRITURA"],
        "Documentos do Negocio": ["COMPROMISSO_COMPRA_VENDA", "PROCURACAO",
                                 "COMPROVANTE_PAGAMENTO"],
        "Documentos Administrativos": ["PROTOCOLO_ONR", "ASSINATURA_DIGITAL", "OUTRO"]
    }

    for cat_name, doc_types in categories.items():
        print(f"{cat_name}:")
        for doc in doc_types:
            fields_count = sum(len(v) for v in DOCUMENT_FIELD_MAPPING.get(doc, {}).values())
            print(f"  - {doc} ({fields_count} campos)")
        print()

    print(f"{'='*60}\n")


def print_all_fields() -> None:
    """Lista todos os campos disponiveis."""
    all_fields = get_all_fields()

    print(f"\n{'='*60}")
    print("TODOS OS CAMPOS DISPONIVEIS")
    print(f"{'='*60}\n")

    category_names = {
        "pessoa_natural": "Pessoa Natural",
        "pessoa_juridica": "Pessoa Juridica",
        "imovel": "Imovel",
        "negocio": "Negocio Juridico"
    }

    for cat_key, fields_dict in all_fields.items():
        cat_name = category_names.get(cat_key, cat_key)
        print(f"\n{cat_name} ({len(fields_dict)} campos):")
        print("-" * 40)
        for field, desc in sorted(fields_dict.items()):
            docs_count = len(get_documents_for_field(field))
            print(f"  {field}")
            print(f"    Descricao: {desc}")
            print(f"    Documentos: {docs_count}")

    print(f"\n{'='*60}\n")


def main():
    """Funcao principal da CLI."""
    parser = argparse.ArgumentParser(
        description="Mapeamento de Tipos de Documento para Campos Uteis",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python document_field_mapping.py --list-types
  python document_field_mapping.py --list-fields
  python document_field_mapping.py --type RG
  python document_field_mapping.py --field cpf
  python document_field_mapping.py --coverage
  python document_field_mapping.py --export mapping.json
  python document_field_mapping.py --matrix > matrix.csv
        """
    )

    parser.add_argument(
        "--list-types",
        action="store_true",
        help="Lista todos os tipos de documentos suportados"
    )

    parser.add_argument(
        "--list-fields",
        action="store_true",
        help="Lista todos os campos disponiveis"
    )

    parser.add_argument(
        "--type", "-t",
        metavar="DOC_TYPE",
        help="Mostra campos que um tipo de documento pode fornecer"
    )

    parser.add_argument(
        "--field", "-f",
        metavar="FIELD_NAME",
        help="Mostra documentos que podem fornecer um campo"
    )

    parser.add_argument(
        "--coverage",
        action="store_true",
        help="Gera relatorio de cobertura de campos"
    )

    parser.add_argument(
        "--export", "-e",
        metavar="OUTPUT_FILE",
        help="Exporta mapeamento completo para JSON"
    )

    parser.add_argument(
        "--matrix",
        action="store_true",
        help="Gera matriz campos x documentos (CSV)"
    )

    args = parser.parse_args()

    # Se nenhum argumento, mostrar help
    if len(sys.argv) == 1:
        parser.print_help()
        return

    # Executar acoes
    if args.list_types:
        print_all_types()

    if args.list_fields:
        print_all_fields()

    if args.type:
        print_type_info(args.type.upper())

    if args.field:
        print_field_info(args.field.lower())

    if args.coverage:
        print_coverage_report()

    if args.export:
        export_mapping(args.export)
        print(f"Mapeamento exportado para: {args.export}")

    if args.matrix:
        print(generate_matrix())


if __name__ == "__main__":
    main()
