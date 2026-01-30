# COMPROMISSO_COMPRA_VENDA - Contrato de Compromisso (Campos Uteis)

**Total de Campos Uteis**: 53 campos (maior de todos os documentos)
**Categorias**: Pessoa Natural (19), Pessoa Juridica (9), Imovel (12), Negocio (13)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

O COMPROMISSO e o documento com MAIOR numero de campos uteis, sendo a fonte primaria para dados do negocio antes da escritura. Contem dados completos das partes, imovel e condicoes de pagamento.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (19 campos)

Qualificacao completa de vendedores e compradores.

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome completo | "JOAO DA SILVA" | SIM |
| CPF | CPF | "123.456.789-00" | SIM |
| RG | RG | "12.345.678-9" | SIM |
| ORGAO EMISSOR DO RG | Orgao emissor | "SSP" | SIM |
| ESTADO EMISSOR DO RG | UF do emissor | "SP" | SIM |
| NACIONALIDADE | Nacionalidade | "brasileiro" | SIM |
| PROFISSAO | Profissao | "empresario" | SIM |
| ESTADO CIVIL | Estado civil | "casado" | SIM |
| REGIME DE BENS | Regime de bens | "comunhao parcial" | Se casado |
| DATA DE NASCIMENTO | Data de nascimento | "10/05/1985" | Condicional |
| LOGRADOURO | Logradouro | "Rua das Flores" | SIM |
| NUMERO | Numero | "123" | SIM |
| COMPLEMENTO | Complemento | "Apto 45" | Condicional |
| BAIRRO | Bairro | "Centro" | SIM |
| CIDADE | Cidade | "Sao Paulo" | SIM |
| ESTADO | Estado | "SP" | SIM |
| CEP | CEP | "01234-567" | Condicional |
| E-MAIL | Email | "joao@email.com" | Condicional |
| TELEFONE | Telefone | "(11) 99999-9999" | Condicional |

### 2.2 Pessoa Juridica (9 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| DENOMINACAO | Razao social | "XYZ LTDA" | SIM (se PJ) |
| CNPJ | CNPJ | "12.345.678/0001-90" | SIM (se PJ) |
| LOGRADOURO DA SEDE | Logradouro sede | "Av. Paulista" | SIM (se PJ) |
| NUMERO DA SEDE | Numero sede | "1000" | SIM (se PJ) |
| COMPLEMENTO DA SEDE | Complemento sede | "Sala 101" | Condicional |
| BAIRRO DA SEDE | Bairro sede | "Bela Vista" | SIM (se PJ) |
| CIDADE DA SEDE | Cidade sede | "Sao Paulo" | SIM (se PJ) |
| ESTADO DA SEDE | Estado sede | "SP" | SIM (se PJ) |
| CEP DA SEDE | CEP sede | "01310-100" | Condicional |

### 2.3 Dados do Imovel (12 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NUMERO DA MATRICULA | Numero da matricula | "46.511" | SIM |
| NUMERO DO REGISTRO DE IMOVEIS | Cartorio de RI | "1o OFICIAL DE RI" | SIM |
| CIDADE DO REGISTRO DE IMOVEIS | Cidade do cartorio | "Sao Paulo" | SIM |
| DENOMINACAO DO IMOVEL | Tipo do imovel | "apartamento" | SIM |
| LOGRADOURO | Logradouro | "Rua Francisco Cruz" | SIM |
| NUMERO | Numero | "515" | SIM |
| COMPLEMENTO | Complemento | "Apto 124" | Condicional |
| BAIRRO | Bairro | "Vila Mariana" | SIM |
| CIDADE | Cidade | "Sao Paulo" | SIM |
| ESTADO | Estado | "SP" | SIM |
| AREA TOTAL EM M2 | Area total m2 | "83.49" | SIM |
| AREA PRIVATIVA EM M2 | Area privativa m2 | "70.83" | Condicional |

### 2.4 Negocio Juridico (13 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| VALOR TOTAL | Valor total | "500000.00" | SIM |
| FRACAO ALIENADA | Fracao vendida | "100%" | SIM |
| NOME DO ALIENANTE | Nome do vendedor | "ELIZETE APARECIDA SILVA" | SIM |
| FRACAO IDEAL DO ALIENANTE | Fracao do vendedor | "50%" | SIM |
| VALOR DA ALIENACAO | Valor do vendedor | "250000.00" | SIM |
| CONJUGE DO ALIENANTE | Nome do conjuge vendedor | "RODOLFO ORTRIWANO" | Se casado |
| NOME DO ADQUIRENTE | Nome do comprador | "MARINA AYUB" | SIM |
| FRACAO IDEAL DO ADQUIRENTE | Fracao do comprador | "100%" | SIM |
| VALOR DA AQUISICAO | Valor do comprador | "500000.00" | SIM |
| TIPO DE PAGAMENTO | Tipo de pagamento | "A VISTA + FINANCIAMENTO" | SIM |
| MODO DE PAGAMENTO | Modo de pagamento | "TED + CAIXA" | SIM |
| DATA DO PAGAMENTO | Data do pagamento | "15/12/2025" | Condicional |
| TERMOS DA PROMESSA | Termos do contrato | "Imovel entregue vazio..." | Condicional |

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| vendedores[].nome | nome / alienante_nome | pessoa_natural / negocio |
| compradores[].nome | nome / adquirente_nome | pessoa_natural / negocio |
| vendedores[].cpf | cpf | pessoa_natural |
| vendedores[].rg | rg | pessoa_natural |
| vendedores[].email | email | pessoa_natural |
| vendedores[].telefone | telefone | pessoa_natural |
| vendedores[].endereco.* | domicilio_* | pessoa_natural |
| vendedores[].percentual | alienante_fracao_ideal | negocio |
| vendedores[].conjuge.nome | alienante_conjuge | negocio |
| compradores[].percentual | adquirente_fracao_ideal | negocio |
| preco_total | negocio_valor_total | negocio |
| imovel.* | imovel_* | imovel |
| dados_pagamento_sinal.forma_pagamento | pagamento_modo | negocio |
| condicoes_especificas | termos_promessa | negocio |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "JOAO DA SILVA",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "orgao_emissor_rg": "SSP",
    "estado_emissor_rg": "SP",
    "nacionalidade": "brasileiro",
    "profissao": "empresario",
    "estado_civil": "casado",
    "regime_bens": "comunhao parcial de bens",
    "data_nascimento": "10/05/1985",
    "domicilio_logradouro": "Rua das Flores",
    "domicilio_numero": "123",
    "domicilio_bairro": "Centro",
    "domicilio_cidade": "Sao Paulo",
    "domicilio_estado": "SP",
    "domicilio_cep": "01234-567",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999"
  },
  "pessoa_juridica": {},
  "imovel": {
    "matricula_numero": "46.511",
    "matricula_cartorio_numero": "1o OFICIAL DE RI SP",
    "matricula_cartorio_cidade": "Sao Paulo",
    "imovel_denominacao": "apartamento",
    "imovel_logradouro": "Rua Francisco Cruz",
    "imovel_numero": "515",
    "imovel_complemento": "Apto 124",
    "imovel_bairro": "Vila Mariana",
    "imovel_cidade": "Sao Paulo",
    "imovel_estado": "SP",
    "imovel_area_total": "83.49",
    "imovel_area_privativa": "70.83"
  },
  "negocio": {
    "negocio_valor_total": "500000.00",
    "negocio_fracao_alienada": "100%",
    "alienante_nome": "ELIZETE APARECIDA SILVA",
    "alienante_fracao_ideal": "50%",
    "alienante_valor_alienacao": "250000.00",
    "alienante_conjuge": "RODOLFO ORTRIWANO",
    "adquirente_nome": "MARINA AYUB",
    "adquirente_fracao_ideal": "100%",
    "adquirente_valor_aquisicao": "500000.00",
    "pagamento_tipo": "A VISTA + FINANCIAMENTO",
    "pagamento_modo": "TED + CAIXA ECONOMICA",
    "pagamento_data": "15/12/2025",
    "termos_promessa": "Imovel sera entregue vazio em ate 30 dias"
  }
}
```

---

## 5. USO EM MINUTAS

### 5.1 Escritura de Compra e Venda
- Qualificacao completa das partes (vendedores e compradores)
- Dados do imovel objeto da venda
- Valor e condicoes de pagamento
- Termos especiais a constar na minuta

### 5.2 Unico documento com email/telefone
O COMPROMISSO e a unica fonte para dados de contato (email, telefone).

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome, cpf | RG, CNH, CERTIDAO_CASAMENTO, etc. | Validar identidade |
| matricula_numero | MATRICULA_IMOVEL, ITBI, ESCRITURA | Identificar imovel |
| negocio_valor_total | ITBI, ESCRITURA | Validar valor |
| alienante_nome | MATRICULA_IMOVEL (proprietario) | Validar vendedor |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

- `itbi_*`: Obter de ITBI
- `imovel_sql`: Obter de MATRICULA_IMOVEL, ITBI
- `imovel_descricao_conforme_matricula`: Obter de MATRICULA_IMOVEL
- `certidoes (cndt_*, certidao_uniao_*)`: Obter de CNDT, CND_FEDERAL
- `filiacao_*`: Obter de RG, CERTIDAO_NASCIMENTO

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guias: `Guia-de-campos-e-variaveis/campos-*.md`
- Campos Completos: `campos-completos/COMPROMISSO_COMPRA_VENDA.md`
