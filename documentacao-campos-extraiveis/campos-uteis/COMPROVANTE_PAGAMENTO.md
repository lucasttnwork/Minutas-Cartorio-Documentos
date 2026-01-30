# COMPROVANTE_PAGAMENTO - Comprovante de Pagamento (Campos Uteis)

**Total de Campos Uteis**: 14 campos
**Categorias**: Pessoa Natural (2), Pessoa Juridica (2), Negocio (10)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

O COMPROVANTE_PAGAMENTO e essencial para comprovar:
- Pagamento do valor do imovel (PIX, TED, DOC)
- Pagamento do ITBI (boleto bancario)
- Pagamento de custas cartoriais

Este documento NAO contem dados de imovel - apenas dados transacionais e identificacao basica das partes.

---

## 2. TIPOS DE COMPROVANTES

### 2.1 PIX
- Transferencia instantanea
- Contem chave PIX (CPF, CNPJ, email, telefone ou aleatoria)
- Codigo de autenticacao unico (E2E ID)
- Disponivel 24/7

### 2.2 TED (Transferencia Eletronica Disponivel)
- Transferencia entre bancos diferentes
- Limite minimo geralmente R$ 5.000
- Disponivel em dias uteis, horario bancario
- Codigo de autenticacao do banco

### 2.3 DOC (Documento de Credito)
- Transferencia entre bancos diferentes
- Limite maximo R$ 4.999,99
- Compensacao D+1 (proximo dia util)
- Em desuso - substituido pelo PIX

### 2.4 Boleto Bancario
- Usado principalmente para ITBI e custas
- Contem linha digitavel (codigo de barras)
- Pode ter juros/multa se pago apos vencimento
- Compensacao em ate 3 dias uteis

---

## 3. CAMPOS POR CATEGORIA

### 3.1 Pessoa Natural (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| nome | Nome do pagador | "MARINA AYUB" | SIM |
| cpf | CPF do pagador | "368.366.718-43" | SIM |

### 3.2 Pessoa Juridica (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_denominacao | Razao social do beneficiario | "PREFEITURA DE SAO PAULO" | SIM (se PJ) |
| pj_cnpj | CNPJ do beneficiario | "46.395.000/0001-39" | SIM (se PJ) |

### 3.3 Negocio Juridico (10 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| negocio_valor_total | Valor pago | "15000.00" | SIM |
| pagamento_tipo | Tipo de transferencia | "PIX" / "TED" / "DOC" / "BOLETO" | SIM |
| pagamento_modo | Modo de pagamento | "Transferencia" / "Boleto" | SIM |
| pagamento_data | Data do pagamento | "25/01/2026" | SIM |
| pagamento_banco_origem | Banco do pagador | "Itau Unibanco S.A." | SIM |
| pagamento_agencia_origem | Agencia do pagador | "0001" | SIM |
| pagamento_conta_origem | Conta do pagador | "12345-6" | SIM |
| pagamento_banco_destino | Banco do beneficiario | "Banco do Brasil S.A." | SIM |
| pagamento_agencia_destino | Agencia do beneficiario | "1234-5" | SIM |
| pagamento_conta_destino | Conta do beneficiario | "98765-4" | SIM |

---

## 4. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| pagador.nome | nome | pessoa_natural |
| pagador.cpf | cpf | pessoa_natural |
| beneficiario.razao_social | pj_denominacao | pessoa_juridica |
| beneficiario.cnpj | pj_cnpj | pessoa_juridica |
| valor | negocio_valor_total | negocio |
| tipo_transferencia | pagamento_tipo | negocio |
| forma_pagamento | pagamento_modo | negocio |
| data_pagamento | pagamento_data | negocio |
| banco_origem | pagamento_banco_origem | negocio |
| agencia_origem | pagamento_agencia_origem | negocio |
| conta_origem | pagamento_conta_origem | negocio |
| banco_destino | pagamento_banco_destino | negocio |
| agencia_destino | pagamento_agencia_destino | negocio |
| conta_destino | pagamento_conta_destino | negocio |

---

## 5. EXEMPLO SIMPLIFICADO

### 5.1 Comprovante PIX (Pagamento de Imovel)

```json
{
  "pessoa_natural": {
    "nome": "MARINA AYUB",
    "cpf": "368.366.718-43"
  },
  "pessoa_juridica": {},
  "negocio": {
    "negocio_valor_total": "500000.00",
    "pagamento_tipo": "PIX",
    "pagamento_modo": "Transferencia",
    "pagamento_data": "25/01/2026",
    "pagamento_banco_origem": "Itau Unibanco S.A.",
    "pagamento_agencia_origem": "0001",
    "pagamento_conta_origem": "12345-6",
    "pagamento_banco_destino": "Bradesco S.A.",
    "pagamento_agencia_destino": "1234-5",
    "pagamento_conta_destino": "98765-4"
  }
}
```

### 5.2 Comprovante Boleto (Pagamento ITBI)

```json
{
  "pessoa_natural": {
    "nome": "MARINA AYUB",
    "cpf": "368.366.718-43"
  },
  "pessoa_juridica": {
    "pj_denominacao": "PREFEITURA MUNICIPAL DE SAO PAULO",
    "pj_cnpj": "46.395.000/0001-39"
  },
  "negocio": {
    "negocio_valor_total": "15000.00",
    "pagamento_tipo": "BOLETO",
    "pagamento_modo": "Boleto",
    "pagamento_data": "20/01/2026",
    "pagamento_banco_origem": "Itau Unibanco S.A.",
    "pagamento_agencia_origem": "0001",
    "pagamento_conta_origem": "12345-6",
    "pagamento_banco_destino": "Banco do Brasil S.A.",
    "pagamento_agencia_destino": "0001",
    "pagamento_conta_destino": "Conta Arrecadacao PMSP"
  }
}
```

---

## 6. USO EM MINUTAS

### 6.1 Escritura de Compra e Venda

- `negocio_valor_total` -> Valor pago/total da transacao
- `pagamento_data` -> Data do pagamento
- `pagamento_tipo` -> Forma de pagamento (PIX, TED, etc.)

**Exemplo de texto em minuta:**
> "...pelo preco certo e ajustado de R$ 500.000,00 (quinhentos mil reais),
> pago nesta data atraves de PIX..."

### 6.2 Comprovacao de Pagamento ITBI

- Comprovante do boleto ITBI deve ser anexado a escritura
- `negocio_valor_total` -> Deve conferir com `itbi_valor` da guia
- `pagamento_data` -> Data efetiva do pagamento

### 6.3 Custas Cartoriais

- Comprovantes de emolumentos e taxas
- Podem ser PIX ou boleto
- Geralmente necessarios para registro

---

## 7. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome | TODOS (RG, CNH, CERTIDOES, etc.) | Identificar pagador |
| cpf | TODOS (RG, CNH, CERTIDOES, etc.) | Identificar pagador |
| negocio_valor_total | COMPROMISSO, ESCRITURA | Validar valor pago |
| pagamento_data | ESCRITURA | Data efetiva do pagamento |

### 7.1 Correlacao Especifica com ITBI

O COMPROVANTE_PAGAMENTO do ITBI deve ser correlacionado com a Guia ITBI:

| Campo Comprovante | Campo ITBI | Validacao |
|-------------------|-----------|-----------|
| negocio_valor_total | itbi_valor | Devem ser iguais |
| pagamento_data | itbi_data_pagamento | Data efetiva |

**IMPORTANTE**: O comprovante de pagamento do ITBI e obrigatorio para lavratura da escritura.

---

## 8. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos uteis que NAO vem do COMPROVANTE_PAGAMENTO:

### 8.1 Dados de Imovel
- matricula_numero, imovel_sql, imovel_logradouro, etc.
- **Obter de**: MATRICULA_IMOVEL, IPTU, VVR

### 8.2 Qualificacao Completa das Partes
- rg, estado_civil, profissao, nacionalidade, domicilio completo
- **Obter de**: RG, CNH, CERTIDAO_CASAMENTO, COMPROVANTE_RESIDENCIA

### 8.3 Dados do Negocio Completo
- negocio_valor_total, itbi_numero_guia, itbi_base_calculo
- **Obter de**: COMPROMISSO_COMPRA_VENDA, ITBI, ESCRITURA

### 8.4 Dados de Pessoa Juridica Completos
- pj_nire, instrumento_constitutivo, pj_admin_nome
- **Obter de**: CONTRATO_SOCIAL, PROCURACAO_PJ

---

## 9. VALIDACOES RECOMENDADAS

### 9.1 Validacao de Valor
- Somatoria dos comprovantes deve bater com valor total da transacao
- Comprovante ITBI deve bater com guia ITBI

### 9.2 Validacao de Data
- Data do pagamento deve ser anterior ou igual a data da escritura
- ITBI deve estar pago ANTES da lavratura

### 9.3 Validacao de Identificacao
- CPF/nome do pagador deve conferir com adquirente
- Excecao: pagamento por terceiros (procurador, parente)

---

## 10. PARTICULARIDADES POR TIPO

### 10.1 PIX
- Codigo E2E (End-to-End) e unico e rastreavel
- Horario exato do pagamento disponivel
- Confirmacao instantanea

### 10.2 TED/DOC
- Codigo de autenticacao do banco emissor
- Pode levar horas para confirmacao (TED) ou D+1 (DOC)
- Sujeito a horario bancario

### 10.3 Boleto
- Linha digitavel permite rastreamento
- Compensacao pode levar ate 3 dias uteis
- Pode ter valor diferente se pago apos vencimento

---

## 11. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-negocio-juridico.md`
- Campos Completos: `campos-completos/COMPROVANTE_PAGAMENTO.md` (quando disponivel)
- Correlacao ITBI: `campos-uteis/ITBI.md`
