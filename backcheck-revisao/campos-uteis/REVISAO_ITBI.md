# REVISAO: ITBI.md (Campos Uteis)

**Data**: 2026-01-30
**Arquivo**: documentacao-campos-extraiveis/campos-uteis/ITBI.md
**Status**: OK

---

## VERIFICACOES EXECUTADAS

### 1. Total de Campos Uteis
- **Mapeamento oficial**: 22 campos (2 PN + 2 PJ + 8 Imovel + 10 Negocio)
- **Documento ITBI.md**: 22 campos (2 PN + 2 PJ + 8 Imovel + 10 Negocio)
- **Status**: CORRETO

### 2. Lista de Campos por Categoria

#### Pessoa Natural (2 campos)
Mapeamento: nome, cpf
Documento: nome, cpf
**Status**: CORRETO

#### Pessoa Juridica (2 campos)
Mapeamento: pj_denominacao, pj_cnpj
Documento: pj_denominacao, pj_cnpj
**Status**: CORRETO

#### Imovel (8 campos)
Mapeamento: matricula_numero, matricula_cartorio_numero, imovel_sql, imovel_logradouro, imovel_numero, imovel_bairro, imovel_cidade, imovel_estado
Documento: matricula_numero, matricula_cartorio_numero, imovel_sql, imovel_logradouro, imovel_numero, imovel_bairro, imovel_cidade, imovel_estado
**Status**: CORRETO

#### Negocio Juridico (10 campos)
Mapeamento: negocio_valor_total, alienante_nome, adquirente_nome, itbi_numero_guia, itbi_base_calculo, itbi_valor, itbi_linha_digitavel, itbi_aliquota, itbi_proporcao_transmitida, itbi_data_pagamento
Documento: negocio_valor_total, alienante_nome, adquirente_nome, itbi_numero_guia, itbi_base_calculo, itbi_valor, itbi_linha_digitavel, itbi_aliquota, itbi_proporcao_transmitida, itbi_data_pagamento
**Status**: CORRETO

### 3. Campos Extras ou Omitidos
- **Campos extras**: NENHUM
- **Campos omitidos**: NENHUM
- **Status**: CORRETO

### 4. Mapeamento Reverso
Verificado secao 3 - todos os campos mapeados correspondem ao mapeamento oficial.
**Status**: CORRETO

### 5. Exemplo JSON (Secao 4)
Estrutura consistente com campos listados.
**Status**: CORRETO

### 6. Correlacao com Outros Documentos (Secao 6)
Campos correlacionados: matricula_numero, imovel_sql, negocio_valor_total, alienante_nome, adquirente_nome
**Status**: CORRETO

---

## CONCLUSAO

O arquivo ITBI.md esta totalmente conforme o mapeamento oficial.
Nenhum problema encontrado.
