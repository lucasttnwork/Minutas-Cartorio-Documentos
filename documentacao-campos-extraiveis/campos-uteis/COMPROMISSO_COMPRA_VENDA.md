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
| nome | Nome completo | "JOAO DA SILVA" | SIM |
| cpf | CPF | "123.456.789-00" | SIM |
| rg | RG | "12.345.678-9" | SIM |
| orgao_emissor_rg | Orgao emissor | "SSP" | SIM |
| estado_emissor_rg | UF do emissor | "SP" | SIM |
| nacionalidade | Nacionalidade | "brasileiro" | SIM |
| profissao | Profissao | "empresario" | SIM |
| estado_civil | Estado civil | "casado" | SIM |
| regime_bens | Regime de bens | "comunhao parcial" | Se casado |
| data_nascimento | Data de nascimento | "10/05/1985" | Condicional |
| domicilio_logradouro | Logradouro | "Rua das Flores" | SIM |
| domicilio_numero | Numero | "123" | SIM |
| domicilio_complemento | Complemento | "Apto 45" | Condicional |
| domicilio_bairro | Bairro | "Centro" | SIM |
| domicilio_cidade | Cidade | "Sao Paulo" | SIM |
| domicilio_estado | Estado | "SP" | SIM |
| domicilio_cep | CEP | "01234-567" | Condicional |
| email | Email | "joao@email.com" | Condicional |
| telefone | Telefone | "(11) 99999-9999" | Condicional |

### 2.2 Pessoa Juridica (9 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_denominacao | Razao social | "XYZ LTDA" | SIM (se PJ) |
| pj_cnpj | CNPJ | "12.345.678/0001-90" | SIM (se PJ) |
| pj_sede_logradouro | Logradouro sede | "Av. Paulista" | SIM (se PJ) |
| pj_sede_numero | Numero sede | "1000" | SIM (se PJ) |
| pj_sede_complemento | Complemento sede | "Sala 101" | Condicional |
| pj_sede_bairro | Bairro sede | "Bela Vista" | SIM (se PJ) |
| pj_sede_cidade | Cidade sede | "Sao Paulo" | SIM (se PJ) |
| pj_sede_estado | Estado sede | "SP" | SIM (se PJ) |
| pj_sede_cep | CEP sede | "01310-100" | Condicional |

### 2.3 Dados do Imovel (12 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| matricula_numero | Numero da matricula | "46.511" | SIM |
| matricula_cartorio_numero | Cartorio de RI | "1o OFICIAL DE RI" | SIM |
| matricula_cartorio_cidade | Cidade do cartorio | "Sao Paulo" | SIM |
| imovel_denominacao | Tipo do imovel | "apartamento" | SIM |
| imovel_logradouro | Logradouro | "Rua Francisco Cruz" | SIM |
| imovel_numero | Numero | "515" | SIM |
| imovel_complemento | Complemento | "Apto 124" | Condicional |
| imovel_bairro | Bairro | "Vila Mariana" | SIM |
| imovel_cidade | Cidade | "Sao Paulo" | SIM |
| imovel_estado | Estado | "SP" | SIM |
| imovel_area_total | Area total m2 | "83.49" | SIM |
| imovel_area_privativa | Area privativa m2 | "70.83" | Condicional |

### 2.4 Negocio Juridico (13 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| negocio_valor_total | Valor total | "500000.00" | SIM |
| negocio_fracao_alienada | Fracao vendida | "100%" | SIM |
| alienante_nome | Nome do vendedor | "ELIZETE APARECIDA SILVA" | SIM |
| alienante_fracao_ideal | Fracao do vendedor | "50%" | SIM |
| alienante_valor_alienacao | Valor do vendedor | "250000.00" | SIM |
| alienante_conjuge | Nome do conjuge vendedor | "RODOLFO ORTRIWANO" | Se casado |
| adquirente_nome | Nome do comprador | "MARINA AYUB" | SIM |
| adquirente_fracao_ideal | Fracao do comprador | "100%" | SIM |
| adquirente_valor_aquisicao | Valor do comprador | "500000.00" | SIM |
| pagamento_tipo | Tipo de pagamento | "A VISTA + FINANCIAMENTO" | SIM |
| pagamento_modo | Modo de pagamento | "TED + CAIXA" | SIM |
| pagamento_data | Data do pagamento | "15/12/2025" | Condicional |
| termos_promessa | Termos do contrato | "Imovel entregue vazio..." | Condicional |

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
