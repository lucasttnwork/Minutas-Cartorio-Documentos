# ITBI - Imposto de Transmissao de Bens Imoveis

**Complexidade de Extracao**: MEDIA
**Schema Fonte**: `execution/schemas/itbi.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O ITBI (Imposto de Transmissao de Bens Imoveis Inter-Vivos) e um tributo municipal cobrado sobre a transmissao onerosa de bens imoveis entre pessoas vivas. E emitido pela Prefeitura do municipio onde o imovel esta localizado e deve ser pago antes da lavratura da escritura publica de compra e venda ou outro instrumento de transmissao.

O imposto incide sobre transacoes como compra e venda, permuta, dacao em pagamento, arrematacao e adjudicacao de imoveis. A base de calculo e o maior valor entre o valor declarado da transacao e o Valor Venal de Referencia (VVR) do imovel, sobre o qual aplica-se a aliquota municipal (geralmente entre 2% e 3%).

### 1.2 Padroes de Identificacao Visual

Os seguintes padroes indicam que um documento e uma guia de ITBI:

- **ITBI** ou **ITBI-IV** (Inter-Vivos)
- **IMPOSTO DE TRANSMISSAO** ou **TRANSMISSAO DE BENS IMOVEIS**
- **INTER VIVOS**
- **GUIA DE RECOLHIMENTO** ou **DAMSP** (Documento de Arrecadacao Municipal de Sao Paulo)
- **PREFEITURA** seguido do nome do municipio
- Presenca de campos como "SQL", "VVR", "BASE DE CALCULO"

### 1.3 Formatos Comuns

O ITBI pode ser encontrado nos seguintes formatos:

1. **Guia de Recolhimento (DAMSP)**: Documento para pagamento do imposto, com codigo de barras e linha digitavel
2. **Comprovante de Pagamento**: Guia com autenticacao mecanica ou carimbo de pagamento
3. **Declaracao Online**: Versao digital emitida pelo sistema da prefeitura
4. **Certidao de Quitacao**: Documento que comprova o pagamento integral do imposto

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Nivel Extracao | Confianca |
|-------|------|-----------|---------|----------------|-----------|
| numero_transacao | string | Numero da guia/transacao | "2026.123.456.789" | 1 | Alta |
| data_emissao | date | Data de emissao da guia | "27/01/2026" | 1 | Alta |
| dados_imovel | object | Dados do imovel transmitido | (ver secao 2.3.1) | 2 | Alta |
| compradores | array | Lista de adquirentes | (ver secao 2.4.1) | 2 | Alta |
| vendedores | array | Lista de transmitentes | (ver secao 2.4.2) | 2 | Alta |
| dados_transacao | object | Dados da transacao | (ver secao 2.3.2) | 2 | Alta |
| dados_calculo | object | Dados do calculo do imposto | (ver secao 2.3.3) | 1 | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Nivel Extracao | Confianca | Quando Presente |
|-------|------|-----------|---------|----------------|-----------|-----------------|
| natureza_transacao | string | Tipo de transmissao | "COMPRA E VENDA" | 2 | Alta | Sempre |
| cartorio_notas | string | Tabelionato de notas | "1o TABELIAO DE NOTAS DE SAO PAULO" | 2 | Media | Com escritura |
| cartorio_registro | string | Cartorio de RI | "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO" | 2 | Media | Com registro |
| codigo_barras | string | Linha digitavel | "12345.67890 12345.678901 12345.678901 1 12340000015000" | 1 | Alta | Guias pendentes |
| data_vencimento | date | Data de vencimento | "27/02/2026" | 1 | Alta | Guias pendentes |
| data_pagamento | date | Data do pagamento | "25/01/2026" | 1 | Alta | Se pago |
| status_pagamento | string | Status | "PAGO", "PENDENTE", "VENCIDO", "CANCELADO" | 2 | Media | Sempre |

### 2.3 Objetos Nested

#### 2.3.1 dados_imovel (object)

Objeto obrigatorio contendo os dados do imovel objeto da transmissao.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| dados_imovel.sql | string | Cadastro municipal (SQL) | "000.000.0000-0" | Sim |
| dados_imovel.endereco | string | Endereco completo | "RUA DAS FLORES, 123, APTO 45, VILA MARIANA, SAO PAULO-SP, CEP 04101-000" | Sim |
| dados_imovel.matricula | string | Numero da matricula no RI | "123456" | Nao |
| dados_imovel.area | number | Area em m2 | 83.49 | Nao |

**Notas**:
- O campo `sql` e o identificador unico do imovel no cadastro municipal
- A matricula pode nao estar presente em todas as guias
- O endereco e formatado para leitura humana

#### 2.3.2 dados_transacao (object)

Objeto obrigatorio com informacoes sobre a transacao imobiliaria.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| dados_transacao.valor_total | number | Valor total da transacao | 500000.00 | Sim |
| dados_transacao.data_escritura | date | Data da escritura | "27/01/2026" | Nao |
| dados_transacao.financiamento | boolean | Indica se tem financiamento | true | Nao |
| dados_transacao.valor_financiado | number | Valor financiado | 400000.00 | Se financiado |
| dados_transacao.proporcao_adquirida | number | Proporcao adquirida (%) | 100 ou 74.89 | Condicional |

**Notas**:
- `proporcao_adquirida` e CRITICO em transmissoes parciais (quando nao e 100%)
- Se "TOTALIDADE DO IMOVEL" = "Nao", a proporcao DEVE estar preenchida
- Comum em apartamentos, herancas e co-propriedades

#### 2.3.3 dados_calculo (object)

Objeto obrigatorio com os dados do calculo do imposto.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| dados_calculo.vvr | number | Valor Venal de Referencia | 450000.00 | Sim |
| dados_calculo.valor_declarado | number | Valor declarado pelo contribuinte | 500000.00 | Nao |
| dados_calculo.base_calculo | number | Base de calculo (MAX entre VVR e declarado) | 500000.00 | Sim |
| dados_calculo.aliquota | number | Aliquota aplicada (%) | 3.0 | Sim |
| dados_calculo.imposto | number | Valor do imposto calculado | 15000.00 | Sim |
| dados_calculo.descontos | number | Descontos aplicados | 0.00 | Nao |
| dados_calculo.total_devido | number | Total a pagar (imposto - descontos) | 15000.00 | Sim |

**Regras de Calculo**:
- `base_calculo` = MAX(valor_transacao, vvr)
- `imposto` = base_calculo x (aliquota / 100)
- `total_devido` = imposto - descontos + multa + juros

**Erro Comum**: Confundir `imposto` (valor do ITBI) com `base_calculo` (valor sobre o qual incide)

### 2.4 Arrays

#### 2.4.1 compradores (array)

Array obrigatorio contendo a lista de adquirentes/compradores.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| compradores[].nome | string | Nome completo do comprador | "MARIA SANTOS DA SILVA" | Sim |
| compradores[].cpf | string | CPF do comprador | "987.654.321-00" | Nao |
| compradores[].percentual | number | Percentual adquirido | 100 ou 50 | Nao |

**Notas**:
- O comprador e frequentemente identificado como "CONTRIBUINTE" na guia
- Em caso de PJ, o campo `cpf` contera o CNPJ
- A soma dos percentuais deve ser 100%

#### 2.4.2 vendedores (array)

Array obrigatorio contendo a lista de transmitentes/vendedores.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| vendedores[].nome | string | Nome completo do vendedor | "JOAO DA SILVA PEREIRA" | Sim |
| vendedores[].cpf | string | CPF do vendedor | "123.456.789-00" | Nao |
| vendedores[].percentual | number | Percentual vendido | 100 ou 50 | Nao |

**Notas**:
- O vendedor e identificado como "TRANSMITENTE" na guia
- Pode nao estar visivel em todas as guias (apenas o contribuinte/comprador)
- Em caso de PJ, o campo `cpf` contera o CNPJ

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| compradores[].nome | NOME | Nome completo da pessoa | SIM |
| compradores[].cpf | CPF | Cadastro de Pessoa Fisica | SIM |
| vendedores[].nome | NOME | Nome completo da pessoa | SIM |
| vendedores[].cpf | CPF | Cadastro de Pessoa Fisica | SIM |

**Observacao**: O ITBI fornece dados basicos de identificacao (nome e CPF). Dados complementares como RG, profissao e estado civil devem ser obtidos de outros documentos.

### 3.2 Campos que Alimentam "Pessoa Juridica"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| compradores[].nome (se PJ) | DENOMINACAO | Razao social ou denominacao | SIM |
| compradores[].cpf (se CNPJ) | CNPJ | CNPJ da empresa | SIM |
| vendedores[].nome (se PJ) | DENOMINACAO | Razao social ou denominacao | SIM |
| vendedores[].cpf (se CNPJ) | CNPJ | CNPJ da empresa | SIM |

**Observacao**: A identificacao de PJ vs PF e feita pelo formato do documento (CPF = 11 digitos, CNPJ = 14 digitos).

### 3.3 Campos que Alimentam "Dados do Imovel"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| dados_imovel.matricula | NUMERO DA MATRICULA | Numero da matricula | SIM |
| cartorio_registro | NUMERO DO REGISTRO DE IMOVEIS | Numero do Registro de Imoveis | SIM |
| dados_imovel.sql | SQL | Cadastro Municipal (SQL) | SIM |
| dados_imovel.endereco | LOGRADOURO | Logradouro do imovel | SIM |
| dados_imovel.endereco | NUMERO | Numero do imovel | SIM |
| dados_imovel.endereco | BAIRRO | Bairro do imovel | SIM |
| dados_imovel.endereco | CIDADE | Cidade do imovel | SIM |
| dados_imovel.endereco | ESTADO | Estado do imovel | SIM |

**Observacao**: O endereco no ITBI e um campo unico que precisa ser parseado para extrair os componentes individuais.

### 3.4 Campos que Alimentam "Negocio Juridico"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| dados_transacao.valor_total | VALOR TOTAL | Valor total da alienacao | SIM |
| vendedores[].nome | NOME DO ALIENANTE | Nome do alienante | SIM |
| compradores[].nome | NOME DO ADQUIRENTE | Nome do adquirente | SIM |
| numero_transacao | NUMERO DA GUIA | Numero da guia de ITBI | SIM |
| dados_calculo.base_calculo | BASE DE CALCULO | Base de calculo do ITBI | SIM |
| dados_calculo.imposto | VALOR DO ITBI | Valor do ITBI | SIM |
| codigo_barras | LINHA DIGITAVEL | Linha digitavel do boleto de ITBI | SIM |
| dados_calculo.aliquota | ALIQUOTA | Aliquota do ITBI (percentual) | SIM |
| dados_transacao.proporcao_adquirida | PROPORCAO TRANSMITIDA | Proporcao transmitida (fracao ideal) | SIM |
| data_pagamento | DATA DO PAGAMENTO | Data de pagamento do ITBI | SIM |

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao |
|-----------------|-------------------|
| cartorio_notas | Referencia interna - nao usado diretamente em minutas |
| dados_calculo.vvr | Dado de calculo interno - apenas a base_calculo e utilizada |
| dados_calculo.valor_declarado | Dado de calculo interno |
| dados_calculo.descontos | Dado de calculo interno |
| dados_calculo.total_devido | Redundante com itbi_valor apos descontos |
| data_emissao | Metadado da guia - nao usado em minutas |
| data_vencimento | Metadado da guia - controle administrativo |
| status_pagamento | Metadado da guia - controle administrativo |
| natureza_transacao | Informativo - tipo de negocio definido pela minuta |
| dados_transacao.financiamento | Informativo - dados de financiamento vem de outros documentos |
| dados_transacao.valor_financiado | Informativo |
| dados_imovel.area | Dados de area vem preferencialmente da matricula |

---

## 4. EXEMPLO DE EXTRACAO REAL

**Nota**: Exemplo sintetico baseado na estrutura do schema `execution/schemas/itbi.json`

```json
{
  "tipo_documento": "ITBI",
  "numero_transacao": "2026.123.456.789",
  "natureza_transacao": "COMPRA E VENDA",

  "dados_imovel": {
    "sql": "123.456.0789-0",
    "endereco": "RUA DAS FLORES, 123, APTO 45, VILA MARIANA, SAO PAULO-SP, CEP 04101-000",
    "matricula": "145678",
    "area": 83.49
  },

  "compradores": [
    {
      "nome": "MARIA SANTOS DA SILVA",
      "cpf": "987.654.321-00",
      "percentual": 50
    },
    {
      "nome": "JOSE SANTOS DA SILVA",
      "cpf": "987.654.321-11",
      "percentual": 50
    }
  ],

  "vendedores": [
    {
      "nome": "JOAO DA SILVA PEREIRA",
      "cpf": "123.456.789-00",
      "percentual": 100
    }
  ],

  "dados_transacao": {
    "valor_total": 500000.00,
    "data_escritura": "27/01/2026",
    "financiamento": true,
    "valor_financiado": 400000.00,
    "proporcao_adquirida": 100
  },

  "cartorio_notas": "1o TABELIAO DE NOTAS DE SAO PAULO",
  "cartorio_registro": "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO",

  "dados_calculo": {
    "vvr": 450000.00,
    "valor_declarado": 500000.00,
    "base_calculo": 500000.00,
    "aliquota": 3.0,
    "imposto": 15000.00,
    "descontos": 0.00,
    "total_devido": 15000.00
  },

  "codigo_barras": "12345.67890 12345.678901 12345.678901 1 12340000015000",
  "data_emissao": "20/01/2026",
  "data_vencimento": "20/02/2026",
  "data_pagamento": "25/01/2026",
  "status_pagamento": "PAGO",

  "metadados_extracao": {
    "confianca_geral": "alta",
    "campos_ilegiveis": [],
    "validacoes_executadas": [
      "sql_formato_valido",
      "cpf_digito_verificador",
      "calculo_imposto_correto",
      "base_calculo_maior_ou_igual_vvr",
      "soma_percentuais_100"
    ]
  }
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| dados_imovel.matricula | MATRICULA_IMOVEL, ESCRITURA, COMPROMISSO, VVR | Identificar unicamente o imovel |
| dados_imovel.sql | IPTU, VVR, CND_MUNICIPAL, CND_IMOVEL, DADOS_CADASTRAIS | Identificar imovel no cadastro municipal |
| compradores[].cpf | RG, CNH, CPF, CERTIDAO_CASAMENTO, CNDT | Identificar adquirente |
| compradores[].nome | RG, CNH, CERTIDAO_NASCIMENTO, COMPROMISSO | Validar nome do adquirente |
| vendedores[].cpf | RG, CNH, CPF, CERTIDAO_CASAMENTO | Identificar alienante |
| vendedores[].nome | MATRICULA_IMOVEL, COMPROMISSO, ESCRITURA | Validar proprietario |
| dados_transacao.valor_total | COMPROMISSO_COMPRA_VENDA, ESCRITURA, COMPROVANTE_PAGAMENTO | Validar valor da transacao |

### 5.2 Redundancia Intencional

O ITBI e **fonte primaria** para os seguintes dados:

1. **Dados do Imposto**: numero_guia, base_calculo, valor_itbi, aliquota, linha_digitavel
2. **Proporcao Transmitida**: Em casos de transmissao parcial, o ITBI e a fonte mais confiavel
3. **Valor Venal de Referencia**: VVR oficial do municipio

**Validacoes Cruzadas Recomendadas**:

- **ITBI x COMPROMISSO**: Valor da transacao deve coincidir
- **ITBI x ESCRITURA**: Valor da transacao e partes devem coincidir
- **ITBI x MATRICULA**: Matricula e SQL devem coincidir
- **ITBI x VVR**: Valor venal de referencia deve coincidir
- **ITBI x COMPROVANTE_PAGAMENTO**: Valor pago deve coincidir com total_devido

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

As seguintes validacoes sao executadas automaticamente na extracao:

- [x] **sql_formato_valido**: Verifica se o SQL segue o padrao 000.000.0000-0
- [x] **cpf_digito_verificador**: Valida digito verificador de CPF/CNPJ
- [x] **calculo_imposto_correto**: Verifica se base_calculo x aliquota = imposto
- [x] **base_calculo_maior_ou_igual_vvr**: Base de calculo >= VVR (regra fiscal)
- [x] **soma_percentuais_100**: Soma dos percentuais de compradores/vendedores = 100%

### 6.2 Validacoes Adicionais Recomendadas

| Validacao | Formula | Resultado Esperado |
|-----------|---------|-------------------|
| Aliquota dentro da faixa | 2% <= aliquota <= 3% | Verdadeiro |
| Total consistente | imposto + multa + juros - descontos = total_devido | Verdadeiro |
| Datas consistentes | data_emissao <= data_vencimento | Verdadeiro |
| Proporcao em transmissao parcial | Se totalidade = "Nao", proporcao != null | Verdadeiro |

### 6.3 Campos de Qualidade

| Campo | Descricao | Valores Possiveis |
|-------|-----------|-------------------|
| confianca_geral | Nivel de confianca da extracao | alta, media, baixa |
| campos_ilegiveis | Lista de campos nao extraidos | array de strings |
| campos_nao_encontrados | Campos criticos ausentes | array de strings |

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo | Formula de Calculo |
|-------|-------------------|
| dados_calculo.base_calculo | MAX(valor_transacao, vvr) |
| dados_calculo.imposto | base_calculo x (aliquota / 100) |
| dados_calculo.total_devido | imposto - descontos + multa + juros |
| dados_calculo.aliquota | (imposto / base_calculo) x 100 (se nao explicito) |

### 7.2 Campos Inferidos

| Campo | Regra de Inferencia |
|-------|---------------------|
| status_pagamento | "PAGO" se data_pagamento presente; "PENDENTE" se data_vencimento > hoje; "VENCIDO" se data_vencimento < hoje |
| natureza_transacao | Pode ser inferida do contexto ("COMPRA E VENDA" e o mais comum) |

### 7.3 Campos Raros

| Campo | Quando Presente |
|-------|-----------------|
| dados_calculo.descontos | Apenas em casos especiais (primeiro imovel, programas habitacionais) |
| dados_transacao.valor_financiado | Apenas em compras financiadas (SFH, SFI) |
| dados_transacao.proporcao_adquirida | Apenas em transmissoes parciais (fracao ideal) |

### 7.4 Expressoes Regulares

| Campo | Regex | Exemplo |
|-------|-------|---------|
| numero_transacao | `[\d.-]+` | "2026.123.456.789" |
| natureza_transacao | `(COMPRA E VENDA\|PERMUTA\|DOACAO\|DACAO EM PAGAMENTO\|ARREMATACAO\|ADJUDICACAO)` | "COMPRA E VENDA" |
| status_pagamento | `(PAGO\|PENDENTE\|VENCIDO\|CANCELADO)` | "PAGO" |
| data (geral) | `\d{2}/\d{2}/\d{4}` | "27/01/2026" |
| codigo_barras | `[\d\s]+` | 47-48 digitos |

---

## 8. REFERENCIAS

### 8.1 Arquivos do Sistema

| Tipo | Caminho |
|------|---------|
| Schema JSON | `execution/schemas/itbi.json` |
| Prompt de Extracao | `execution/prompts/itbi.txt` |
| Mapeamento Geral | `execution/mapeamento_documento_campos.json` |

### 8.2 Guias de Campos

| Categoria | Caminho |
|-----------|---------|
| Pessoa Natural | `Guia-de-campos-e-variaveis/campos-pessoa-natural.md` |
| Pessoa Juridica | `Guia-de-campos-e-variaveis/campos-pessoa-juridica.md` |
| Dados do Imovel | `Guia-de-campos-e-variaveis/campos-dados-imovel.md` |
| Negocio Juridico | `Guia-de-campos-e-variaveis/campos-negocio-juridico.md` |

### 8.3 Cobertura de Campos

Conforme `execution/mapeamento_documento_campos.json`:

| Categoria | Campos Mapeados |
|-----------|-----------------|
| pessoa_natural | 2 (nome, cpf) |
| pessoa_juridica | 2 (pj_denominacao, pj_cnpj) |
| imovel | 8 campos |
| negocio | 10 campos |
| **Total** | **22 campos** |

---

## APENDICE: CHECKLIST DE CAMPOS CRITICOS

Antes de considerar uma extracao completa, verifique:

**Identificacao**:
- [ ] numero_transacao
- [ ] dados_imovel.sql

**Imovel**:
- [ ] dados_imovel.endereco (completo com CEP, cidade, estado)
- [ ] dados_imovel.matricula (CRITICO - frequentemente ignorado)
- [ ] cartorio_registro (CRITICO)

**Transacao**:
- [ ] natureza_transacao
- [ ] dados_transacao.proporcao_adquirida (se transmissao parcial - CRITICO)

**Valores**:
- [ ] dados_transacao.valor_total
- [ ] dados_calculo.vvr
- [ ] dados_calculo.base_calculo (CALCULADO = max dos valores)
- [ ] dados_calculo.aliquota (CALCULADO se nao explicito)
- [ ] dados_calculo.imposto
- [ ] dados_calculo.total_devido

**Partes**:
- [ ] compradores[].nome (contribuinte)
- [ ] compradores[].cpf
- [ ] vendedores[].nome (se visivel)
- [ ] vendedores[].cpf (se visivel)

**Pagamento**:
- [ ] status_pagamento
- [ ] data_vencimento
- [ ] codigo_barras / linha_digitavel (CRITICO para pagamento)

Se algum campo CRITICO nao foi encontrado:
1. Retornar null para o campo
2. Listar em metadados_extracao.campos_nao_encontrados
3. Mencionar na explicacao contextual
