# ITBI - Imposto de Transmissao de Bens Imoveis (Campos Uteis)

**Total de Campos Uteis**: 22 campos
**Categorias**: Pessoa Natural (2), Pessoa Juridica (2), Imovel (8), Negocio (10)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

O ITBI e a fonte primaria para dados do imposto de transmissao, sendo essencial para a escritura.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome do comprador ou vendedor | "JOAO DA SILVA" | SIM |
| CPF | CPF do comprador ou vendedor | "123.456.789-00" | SIM |

### 2.2 Pessoa Juridica (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| DENOMINACAO | Razao social | "XYZ LTDA" | SIM (se PJ) |
| CNPJ | CNPJ | "12.345.678/0001-90" | SIM (se PJ) |

### 2.3 Dados do Imovel (8 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NUMERO DA MATRICULA | Numero da matricula | "46.511" | SIM |
| NUMERO DO REGISTRO DE IMOVEIS | Cartorio de RI | "1o OFICIAL DE RI" | Condicional |
| SQL | Cadastro municipal | "039.080.0244-3" | SIM |
| LOGRADOURO | Logradouro | "Rua Francisco Cruz" | SIM |
| NUMERO | Numero | "515" | SIM |
| BAIRRO | Bairro | "Vila Mariana" | SIM |
| CIDADE | Cidade | "Sao Paulo" | SIM |
| ESTADO | Estado | "SP" | SIM |

### 2.4 Negocio Juridico (10 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| VALOR TOTAL | Valor da transacao | "500000.00" | SIM |
| NOME DO ALIENANTE | Nome do vendedor | "ELIZETE APARECIDA SILVA" | SIM |
| NOME DO ADQUIRENTE | Nome do comprador | "MARINA AYUB" | SIM |
| NUMERO DA GUIA | Numero da guia | "2026.123.456.789" | SIM |
| BASE DE CALCULO | Base de calculo | "500000.00" | SIM |
| VALOR DO ITBI | Valor do imposto | "15000.00" | SIM |
| LINHA DIGITAVEL | Codigo de barras | "12345.67890..." | Condicional |
| ALIQUOTA | Aliquota (%) | "3.0" | SIM |
| PROPORCAO TRANSMITIDA | Proporcao transmitida | "100" | SIM |
| DATA DO PAGAMENTO | Data do pagamento | "25/01/2026" | SIM |

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| compradores[].nome / vendedores[].nome | nome | pessoa_natural |
| compradores[].cpf / vendedores[].cpf | cpf | pessoa_natural |
| dados_imovel.matricula | matricula_numero | imovel |
| cartorio_registro | matricula_cartorio_numero | imovel |
| dados_imovel.sql | imovel_sql | imovel |
| dados_imovel.endereco | imovel_logradouro/numero/etc | imovel |
| dados_transacao.valor_total | negocio_valor_total | negocio |
| vendedores[].nome | alienante_nome | negocio |
| compradores[].nome | adquirente_nome | negocio |
| numero_transacao | itbi_numero_guia | negocio |
| dados_calculo.base_calculo | itbi_base_calculo | negocio |
| dados_calculo.imposto | itbi_valor | negocio |
| codigo_barras | itbi_linha_digitavel | negocio |
| dados_calculo.aliquota | itbi_aliquota | negocio |
| dados_transacao.proporcao_adquirida | itbi_proporcao_transmitida | negocio |
| data_pagamento | itbi_data_pagamento | negocio |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "MARINA AYUB",
    "cpf": "368.366.718-43"
  },
  "pessoa_juridica": {},
  "imovel": {
    "matricula_numero": "46.511",
    "matricula_cartorio_numero": "1o OFICIAL DE RI SP",
    "imovel_sql": "039.080.0244-3",
    "imovel_logradouro": "Rua Francisco Cruz",
    "imovel_numero": "515",
    "imovel_bairro": "Vila Mariana",
    "imovel_cidade": "Sao Paulo",
    "imovel_estado": "SP"
  },
  "negocio": {
    "negocio_valor_total": "500000.00",
    "alienante_nome": "ELIZETE APARECIDA SILVA",
    "adquirente_nome": "MARINA AYUB",
    "itbi_numero_guia": "2026.123.456.789",
    "itbi_base_calculo": "500000.00",
    "itbi_valor": "15000.00",
    "itbi_aliquota": "3.0",
    "itbi_proporcao_transmitida": "100",
    "itbi_data_pagamento": "25/01/2026"
  }
}
```

---

## 5. USO EM MINUTAS

### 5.1 Escritura de Compra e Venda
- `itbi_numero_guia` -> Referencia do ITBI na escritura
- `itbi_valor` -> Valor do imposto pago
- `itbi_data_pagamento` -> Data do pagamento do imposto
- `negocio_valor_total` -> Valor da transacao

### 5.2 Validacao
- Valor da transacao no ITBI deve bater com COMPROMISSO e ESCRITURA
- Base de calculo deve ser >= VVR

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| matricula_numero | MATRICULA_IMOVEL, ESCRITURA, COMPROMISSO, VVR, IPTU | Identificar imovel |
| imovel_sql | MATRICULA_IMOVEL, VVR, IPTU, CND_MUNICIPAL | Cadastro municipal |
| negocio_valor_total | COMPROMISSO, ESCRITURA | Validar valor |
| alienante_nome | COMPROMISSO, ESCRITURA, MATRICULA | Validar vendedor |
| adquirente_nome | COMPROMISSO, ESCRITURA | Validar comprador |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos uteis que NAO vem do ITBI:
- Qualificacao completa das partes (rg, estado_civil, profissao, etc.): Obter de RG, CERTIDAO_CASAMENTO
- Areas do imovel: Obter de MATRICULA_IMOVEL
- Descricao do imovel: Obter de MATRICULA_IMOVEL
- Forma de pagamento: Obter de COMPROMISSO, COMPROVANTE_PAGAMENTO

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-negocio-juridico.md`
- Campos Completos: `campos-completos/ITBI.md`
