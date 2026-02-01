# COMPROVANTE_PAGAMENTO - Comprovante de Transacao Financeira

**Complexidade de Extracao**: MEDIA
**Schema Fonte**: `execution/schemas/comprovante_pagamento.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O Comprovante de Pagamento e um documento bancario que comprova a realizacao de transacoes financeiras entre contas, incluindo pagamentos via PIX, TED, DOC, boleto bancario e depositos. E amplamente utilizado em transacoes imobiliarias para:

- **Comprovar pagamento de impostos**: ITBI, ITCMD, taxas cartoriais
- **Comprovar pagamento do imovel**: Sinal, parcelas, quitacao total
- **Identificar partes da transacao**: Pagador e beneficiario/recebedor
- **Rastrear origem dos recursos**: Dados bancarios de origem e destino

O documento e fundamental para a lavratura de escrituras publicas, pois comprova que os valores declarados foram efetivamente transferidos entre as partes, atendendo as exigencias legais de identificacao da origem dos recursos.

### 1.2 Padroes de Identificacao Visual

Os seguintes padroes indicam que um documento e um comprovante de pagamento:

- **COMPROVANTE** ou **RECIBO** ou **VOUCHER**
- **PAGAMENTO** ou **TRANSFERENCIA**
- **PIX** ou **TED** ou **DOC** ou **BOLETO**
- **AUTENTICACAO** ou **CODIGO DE AUTENTICACAO**
- **TRANSACAO** seguido de codigo alfanumerico
- Presenca de campos como "VALOR", "DATA/HORA", "BENEFICIARIO", "PAGADOR"

### 1.3 Formatos Comuns

O comprovante de pagamento pode ser encontrado nos seguintes formatos:

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **PIX** | Transferencia instantanea, 24/7, chave PIX | codigo_transacao (32 caracteres), chave_pix |
| **TED** | Transferencia mesmo dia, limite de horario | codigo_autenticacao, codigo_barras |
| **DOC** | Transferencia D+1, limite de valor | codigo_autenticacao |
| **Boleto** | Pagamento via codigo de barras | codigo_barras, linha_digitavel |
| **Deposito** | Deposito em conta | comprovante_deposito, numero_envelope |

### 1.4 Tipos de Transacao por Finalidade

| Finalidade | Tipo Comum | Observacoes |
|------------|------------|-------------|
| **Pagamento ITBI** | PIX, Boleto | Para prefeitura municipal |
| **Pagamento Taxa Cartorio** | PIX, TED | Para tabelionatos de notas |
| **Sinal de Imovel** | PIX, TED | Valor parcial para vendedor |
| **Quitacao Imovel** | TED | Valor total ou saldo para vendedor |
| **Deposito Caducao** | TED | Para conta garantia |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| valor_pago | number | Valor da transacao em reais | 15000.00 | `\d+([.,]\d{2})?` | Alta |
| data_pagamento | date | Data da transacao | "27/01/2026" | `\d{2}/\d{2}/\d{4}` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| banco_origem | string | Banco do pagador | "SANTANDER" | Sempre | Alta |
| banco_destino | string | Banco do beneficiario | "BANCO DO BRASIL" | Sempre | Alta |
| hora_transacao | string | Horario da transacao | "14:30:00" | Sempre | Alta |
| codigo_autenticacao | string | Codigo de autenticacao bancaria | "1234.5678.9012.3456" | Sempre | Alta |
| tipo_transacao | string | Tipo da transacao | "PIX", "TED", "DOC", "BOLETO" | Sempre | Alta |
| descricao | string | Descricao/finalidade | "ITBI - GUIA 2026.123.456" | Quase sempre (~90%) | Media |
| codigo_barras | string | Linha digitavel do boleto | "12345.67890 12345.678901..." | Boletos | Alta |
| chave_pix | string | Chave PIX do destinatario | "email@exemplo.com" ou CNPJ | PIX | Alta |
| codigo_transacao | string | ID da transacao (End-to-End) | "E90400888202311151322..." | PIX | Alta |

### 2.3 Objetos Nested

#### 2.3.1 beneficiario/recebedor (object)

Objeto contendo os dados de quem recebeu o pagamento.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| beneficiario.nome | string | Nome/razao social do recebedor | "2o TABELIAO DE NOTAS" | Sim |
| beneficiario.cpf_cnpj | string | CPF ou CNPJ do recebedor | "22.XXX.XXX/0001-6X" | Nao |
| beneficiario.banco | string | Banco do recebedor | "BCO BRADESCO S.A." | Nao |
| beneficiario.agencia | string | Agencia do recebedor | "0001" | Nao |
| beneficiario.conta | string | Conta do recebedor | "123456-7" | Nao |
| beneficiario.tipo_entidade | string | Tipo de entidade | "CARTORIO", "PREFEITURA", "PESSOA_FISICA" | Nao |
| beneficiario.chave_pix | string | Chave PIX (se aplicavel) | CNPJ ou email | PIX |

**Notas**:
- O CPF/CNPJ pode estar parcialmente mascarado por seguranca
- Em pagamentos para cartorios, o tipo_entidade sera "CARTORIO"
- Em pagamentos de ITBI, o tipo_entidade sera "PREFEITURA"

#### 2.3.2 pagador (object)

Objeto contendo os dados de quem realizou o pagamento.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| pagador.nome | string | Nome completo do pagador | "MARIA SANTOS DA SILVA" | Sim |
| pagador.cpf_cnpj | string | CPF ou CNPJ do pagador | "XXX.366.718-XX" | Nao |
| pagador.banco | string | Banco do pagador | "BCO SANTANDER (BRASIL) S.A." | Nao |
| pagador.agencia | string | Agencia do pagador | "0986" | Nao |
| pagador.conta | string | Conta do pagador | "1000260-0" | Nao |

**Notas**:
- O pagador e frequentemente identificado como "CORRENTISTA" ou "ORDENANTE"
- O CPF/CNPJ pode estar parcialmente mascarado por questoes de seguranca
- E CRITICO que o pagador seja uma das partes da transacao imobiliaria (comprador)

#### 2.3.3 datas (object)

Objeto com diferentes datas relacionadas a transacao.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| datas.transacao | date | Data da operacao | "15/11/2023" | Sim |
| datas.pagamento_efetivo | date | Data de credito | "15/11/2023" | Nao |
| datas.vencimento | date | Data de vencimento (boletos) | "20/11/2023" | Boletos |

**Nota**: Para PIX, as datas de transacao e pagamento_efetivo sao sempre iguais (instantaneo).

### 2.4 Campos por Tipo de Transacao

#### 2.4.1 Campos Especificos PIX

| Campo | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| chave_pix | string | Chave PIX do destinatario | CNPJ, CPF, email, telefone, aleatoria |
| codigo_transacao | string | ID End-to-End | "E9040088820231115132215705700434" |
| tipo_chave | string | Tipo da chave PIX | "CNPJ", "CPF", "EMAIL", "TELEFONE", "ALEATORIA" |

#### 2.4.2 Campos Especificos TED/DOC

| Campo | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| codigo_autenticacao | string | Codigo de autenticacao | "AABC730D03463C802203182" |
| finalidade_ted | string | Codigo de finalidade TED | "10 - CREDITO EM CONTA" |

#### 2.4.3 Campos Especificos Boleto

| Campo | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| codigo_barras | string | Codigo de barras numerico | 47-48 digitos |
| linha_digitavel | string | Linha digitavel formatada | "12345.67890 12345.678901 12345.678901 1 12340000015000" |
| nosso_numero | string | Identificador do boleto | "123.456.789" |

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| pagador.nome | NOME | Nome completo da pessoa | SIM |
| pagador.cpf_cnpj (se CPF) | CPF | Cadastro de Pessoa Fisica | SIM |
| beneficiario.nome (se PF) | NOME | Nome completo do recebedor | SIM |
| beneficiario.cpf_cnpj (se CPF) | CPF | CPF do recebedor | SIM |

**Observacao**: O comprovante de pagamento fornece identificacao basica das partes (nome e CPF). Dados complementares como RG, profissao, estado civil devem ser obtidos de outros documentos (RG, CNH, Certidao de Casamento).

### 3.2 Campos que Alimentam "Pessoa Juridica"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| beneficiario.nome (se PJ) | DENOMINACAO | Razao social | SIM |
| beneficiario.cpf_cnpj (se CNPJ) | CNPJ | CNPJ da empresa | SIM |
| pagador.nome (se PJ) | DENOMINACAO | Razao social | SIM |
| pagador.cpf_cnpj (se CNPJ) | CNPJ | CNPJ da empresa | SIM |

**Observacao**: A identificacao de PJ vs PF e feita pelo formato do documento (CPF = 11 digitos, CNPJ = 14 digitos).

### 3.3 Campos que Alimentam "Dados do Imovel"

O Comprovante de Pagamento **nao alimenta** diretamente campos de imovel.

No entanto, a **descricao** da transacao pode conter referencias ao imovel:
- Numero da guia de ITBI
- Endereco do imovel
- Matricula do imovel

Estes dados sao informativos e nao sao mapeados automaticamente.

### 3.4 Campos que Alimentam "Negocio Juridico"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| valor_pago | VALOR TOTAL | Valor total da transacao | SIM (se pagamento do imovel) |
| tipo_transacao | TIPO DE PAGAMENTO | Tipo de pagamento | SIM |
| tipo_transacao | MODO DE PAGAMENTO | Modo de pagamento (PIX, TED, etc) | SIM |
| data_pagamento | DATA DO PAGAMENTO | Data do pagamento | SIM |
| pagador.banco | BANCO DE ORIGEM | Banco de origem | SIM |
| pagador.agencia | AGENCIA DE ORIGEM | Agencia de origem | SIM |
| pagador.conta | CONTA DE ORIGEM | Conta de origem | SIM |
| beneficiario.banco | BANCO DE DESTINO | Banco de destino | SIM |
| beneficiario.agencia | AGENCIA DE DESTINO | Agencia de destino | SIM |
| beneficiario.conta | CONTA DE DESTINO | Conta de destino | SIM |

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao |
|-----------------|-------------------|
| hora_transacao | Metadado da transacao - nivel de detalhe excessivo |
| codigo_autenticacao | Metadado de validacao bancaria - nao usado em minutas |
| codigo_transacao | Identificador interno da transacao |
| codigo_barras | Dado tecnico do boleto |
| chave_pix | Dado tecnico da transacao PIX |
| beneficiario.tipo_entidade | Classificacao interna |
| datas.vencimento | Metadado do boleto |

---

## 4. EXEMPLO DE EXTRACAO REAL

**Fonte**: Comprovante de pagamento de taxa cartorial via PIX

```json
{
  "tipo_documento": "COMPROVANTE_PAGAMENTO",
  "tipo_comprovante": "Comprovante do Pagamento",
  "subtipo_cobranca": "Transferencia PIX",
  "tipo_tributo": "TAXA_CARTORIO",

  "valor_pago": 5047.70,

  "datas": {
    "transacao": "15/11/2023",
    "pagamento_efetivo": "15/11/2023"
  },

  "hora_transacao": "10:22:45",

  "codigo_autenticacao": "AABC730D03463C802203182",
  "codigo_transacao": "E9040088820231115132215705700434",
  "tipo_transacao": "PIX",

  "pagador": {
    "nome": "Marina Ayub",
    "cpf_cnpj": "***.366.718-**",
    "banco": "BCO SANTANDER (BRASIL) S.A.",
    "agencia": "0986",
    "conta": "1000260-0"
  },

  "beneficiario": {
    "nome": "2 Tabeliao De Notas",
    "tipo_entidade": "CARTORIO",
    "cpf_cnpj": "22.***.***/0001-6*",
    "chave_pix": "22.***.***/0001-6*",
    "banco": "BCO BRADESCO S.A."
  },

  "metadados_extracao": {
    "confianca_geral": "alta",
    "campos_mascarados": ["pagador.cpf_cnpj", "beneficiario.cpf_cnpj"],
    "validacoes_executadas": [
      "valor_positivo",
      "data_nao_futura",
      "codigo_transacao_formato_pix"
    ]
  }
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| pagador.nome | RG, CNH, CERTIDAO_CASAMENTO, COMPROMISSO | Identificar pagador como parte do negocio |
| pagador.cpf_cnpj | RG, CNH, CNDT, CND_FEDERAL | Identificar pagador |
| beneficiario.nome | Depende do tipo | Identificar recebedor |
| valor_pago | ITBI, COMPROMISSO, ESCRITURA | Validar valor da transacao |
| data_pagamento | ITBI, COMPROMISSO, ESCRITURA | Validar sequencia cronologica |

### 5.2 Correlacao CRITICA com ITBI

O Comprovante de Pagamento e **fonte primaria** para comprovar o pagamento do ITBI:

| Campo COMPROVANTE | Campo ITBI | Validacao |
|-------------------|------------|-----------|
| valor_pago | dados_calculo.total_devido | Valores devem coincidir |
| data_pagamento | data_pagamento | Datas devem coincidir |
| beneficiario.nome | "PREFEITURA..." | Deve ser a prefeitura municipal |
| descricao | numero_transacao | Pode conter o numero da guia |

**Regra de Validacao**:
```
SE descricao CONTEM numero_guia_itbi
E valor_pago == itbi.total_devido
E beneficiario.tipo_entidade == "PREFEITURA"
ENTAO comprovante_valido_para_itbi = TRUE
```

### 5.3 Correlacao com COMPROMISSO_COMPRA_VENDA

Para pagamentos do imovel (sinal, parcelas, quitacao):

| Campo COMPROVANTE | Campo COMPROMISSO | Validacao |
|-------------------|-------------------|-----------|
| valor_pago | pagamento_valor | Valores devem coincidir |
| data_pagamento | pagamento_data | Datas devem coincidir |
| pagador.nome | adquirente_nome | Pagador deve ser o comprador |
| beneficiario.nome | alienante_nome | Recebedor deve ser o vendedor |

### 5.4 Redundancia Intencional

O Comprovante de Pagamento e **fonte primaria** para:

1. **Dados Bancarios**: banco, agencia, conta de ambas as partes
2. **Rastreabilidade**: codigo_autenticacao, codigo_transacao
3. **Comprovacao de Transferencia**: data, hora, valor exatos

**Validacoes Cruzadas Recomendadas**:

- **COMPROVANTE x ITBI**: Valor pago deve coincidir com total_devido do ITBI
- **COMPROVANTE x COMPROMISSO**: Valores e partes devem coincidir
- **COMPROVANTE x ESCRITURA**: Valor e partes devem coincidir
- **Multiplos COMPROVANTES**: Soma deve coincidir com valor total da transacao

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

As seguintes validacoes sao executadas automaticamente na extracao:

- [x] **valor_positivo**: Valor pago deve ser maior que zero
- [x] **data_nao_futura**: Data do pagamento nao pode ser no futuro
- [x] **cpf_cnpj_digito_verificador**: Valida digitos de CPF/CNPJ (quando nao mascarados)
- [x] **codigo_transacao_formato_pix**: Para PIX, valida formato E2E (32 caracteres)
- [x] **codigo_barras_modulo**: Para boletos, valida digito verificador

### 6.2 Validacoes Adicionais Recomendadas

| Validacao | Formula | Resultado Esperado |
|-----------|---------|-------------------|
| Pagador e parte do negocio | pagador.nome IN (compradores, adquirentes) | Verdadeiro |
| Valor coerente | valor_pago <= negocio_valor_total | Verdadeiro |
| Data coerente | data_pagamento <= data_escritura | Verdadeiro |
| Banco existente | banco_origem IN (lista_bancos_bcb) | Verdadeiro |

### 6.3 Campos de Qualidade

| Campo | Descricao | Valores Possiveis |
|-------|-----------|-------------------|
| confianca_geral | Nivel de confianca da extracao | alta, media, baixa |
| campos_mascarados | Lista de campos com dados parciais | array de strings |
| campos_nao_encontrados | Campos criticos ausentes | array de strings |

### 6.4 Alertas de Qualidade

O sistema gera alertas quando:
- CPF/CNPJ totalmente mascarado (impossivel validar identidade)
- Valor muito alto sem codigo de autenticacao
- Data de pagamento anterior a emissao da guia (em caso de ITBI)
- Pagador nao identificado como parte do negocio
- Banco nao reconhecido na lista do BCB

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo | Formula de Calculo |
|-------|-------------------|
| tipo_transacao | Inferido de padroes: "E..." = PIX, codigo_barras presente = BOLETO |
| banco_codigo | Extraido do codigo de autenticacao ou codigo de barras |
| pagador.tipo | "PF" se cpf_cnpj tem 11 digitos, "PJ" se tem 14 |

### 7.2 Campos Inferidos

| Campo | Regra de Inferencia |
|-------|---------------------|
| tipo_tributo | "ITBI" se beneficiario contiver "PREFEITURA"; "TAXA_CARTORIO" se contiver "TABELIAO" |
| beneficiario.tipo_entidade | Inferido do nome (CARTORIO, PREFEITURA, PESSOA_FISICA, PESSOA_JURIDICA) |

### 7.3 Campos Raros

| Campo | Quando Presente |
|-------|-----------------|
| finalidade_ted | Apenas em TEDs com finalidade especifica |
| nosso_numero | Apenas em boletos |
| numero_envelope | Apenas em depositos em envelope |
| descricao | Nem sempre presente em PIX |

### 7.4 Expressoes Regulares

| Campo | Regex | Exemplo |
|-------|-------|---------|
| valor_pago | `R?\$?\s*[\d.,]+` | "R$ 15.000,00" ou "15000.00" |
| data_pagamento | `\d{2}/\d{2}/\d{4}` | "27/01/2026" |
| hora_transacao | `\d{2}:\d{2}(:\d{2})?` | "14:30:00" ou "14:30" |
| tipo_transacao | `(PIX\|TED\|DOC\|BOLETO\|DEPOSITO\|TRANSFERENCIA)` | "PIX" |
| codigo_transacao_pix | `E\d{32}` | "E9040088820231115132215705700434" |
| codigo_barras | `\d{44,48}` | 44-48 digitos numericos |
| cpf | `\d{3}\.?\d{3}\.?\d{3}-?\d{2}` | "123.456.789-00" |
| cnpj | `\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}` | "22.123.456/0001-67" |

### 7.5 Mascaramento de Dados Sensiveis

Os bancos frequentemente mascaram dados sensiveis nos comprovantes:

| Campo | Exemplo Mascarado | Dado Original |
|-------|-------------------|---------------|
| CPF | `***.366.718-**` | 123.366.718-00 |
| CNPJ | `22.***.***/0001-6*` | 22.123.456/0001-67 |
| Conta | `******260-0` | 1000260-0 |

**Importante**: Quando dados estao mascarados:
1. Registrar em `metadados_extracao.campos_mascarados`
2. Tentar correlacionar com outros documentos para obter o dado completo
3. Alertar o usuario se campo critico estiver mascarado

---

## 8. REFERENCIAS

### 8.1 Arquivos do Sistema

| Tipo | Caminho |
|------|---------|
| Schema JSON | `execution/schemas/comprovante_pagamento.json` |
| Prompt de Extracao | `execution/prompts/comprovante_pagamento.txt` |
| Mapeamento Geral | `execution/mapeamento_documento_campos.json` |

### 8.2 Guias de Campos

| Categoria | Caminho |
|-----------|---------|
| Pessoa Natural | `Guia-de-campos-e-variaveis/campos-pessoa-natural.md` |
| Pessoa Juridica | `Guia-de-campos-e-variaveis/campos-pessoa-juridica.md` |
| Negocio Juridico | `Guia-de-campos-e-variaveis/campos-negocio-juridico.md` |

### 8.3 Cobertura de Campos

Conforme `execution/mapeamento_documento_campos.json`:

| Categoria | Campos Mapeados |
|-----------|-----------------|
| pessoa_natural | 2 (nome, cpf) |
| pessoa_juridica | 2 (pj_denominacao, pj_cnpj) |
| imovel | 0 campos |
| negocio | 10 campos |
| **Total** | **14 campos** |

---

## APENDICE A: CHECKLIST DE CAMPOS CRITICOS

Antes de considerar uma extracao completa, verifique:

**Identificacao da Transacao**:
- [ ] tipo_transacao (PIX, TED, DOC, BOLETO)
- [ ] codigo_autenticacao ou codigo_transacao

**Valores**:
- [ ] valor_pago (CRITICO)
- [ ] data_pagamento (CRITICO)
- [ ] hora_transacao

**Pagador (Origem)**:
- [ ] pagador.nome (CRITICO)
- [ ] pagador.cpf_cnpj
- [ ] pagador.banco
- [ ] pagador.agencia
- [ ] pagador.conta

**Beneficiario (Destino)**:
- [ ] beneficiario.nome (CRITICO)
- [ ] beneficiario.cpf_cnpj
- [ ] beneficiario.banco (se aplicavel)

**Campos Especificos PIX**:
- [ ] codigo_transacao (E2E ID)
- [ ] chave_pix

**Campos Especificos Boleto**:
- [ ] codigo_barras ou linha_digitavel

Se algum campo CRITICO nao foi encontrado:
1. Retornar null para o campo
2. Listar em metadados_extracao.campos_nao_encontrados
3. Mencionar na explicacao contextual

---

## APENDICE B: TIPOS DE COMPROVANTE POR FINALIDADE

### B.1 Comprovante de Pagamento de ITBI

**Finalidade**: Comprovar recolhimento do imposto de transmissao

| Campo | Valor Esperado |
|-------|----------------|
| beneficiario.nome | "PREFEITURA..." ou "SECRETARIA DA FAZENDA..." |
| beneficiario.tipo_entidade | "PREFEITURA" |
| descricao | Numero da guia ITBI |
| valor_pago | Igual a dados_calculo.total_devido do ITBI |

**Validacao Cruzada com ITBI**:
```
COMPROVANTE.valor_pago == ITBI.dados_calculo.total_devido
COMPROVANTE.data_pagamento == ITBI.data_pagamento
```

### B.2 Comprovante de Pagamento de Taxa Cartorial

**Finalidade**: Comprovar pagamento de emolumentos do cartorio

| Campo | Valor Esperado |
|-------|----------------|
| beneficiario.nome | Nome do tabelionato |
| beneficiario.tipo_entidade | "CARTORIO" |
| tipo_tributo | "TAXA_CARTORIO" |

### B.3 Comprovante de Pagamento do Imovel

**Finalidade**: Comprovar transferencia de valores entre comprador e vendedor

| Campo | Valor Esperado |
|-------|----------------|
| pagador.nome | Nome do comprador/adquirente |
| beneficiario.nome | Nome do vendedor/alienante |
| valor_pago | Valor da transacao (total ou parcial) |

**Validacao Cruzada com COMPROMISSO**:
```
COMPROVANTE.pagador.nome == COMPROMISSO.adquirente_nome
COMPROVANTE.beneficiario.nome == COMPROMISSO.alienante_nome
SOMA(COMPROVANTES.valor_pago) == COMPROMISSO.negocio_valor_total
```

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
