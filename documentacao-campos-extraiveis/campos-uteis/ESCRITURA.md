# ESCRITURA - Escritura Publica (Campos Uteis)

**Total de Campos Uteis**: 41 campos
**Categorias**: Pessoa Natural (15), Pessoa Juridica (10), Imovel (11), Negocio (5)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

A ESCRITURA e um documento de saida (gerado pelo sistema) e tambem entrada (escrituras anteriores). E o segundo documento com mais campos uteis do sistema.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (15 campos)

Qualificacao completa das partes.

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
| LOGRADOURO | Logradouro | "Rua das Flores" | SIM |
| NUMERO | Numero | "123" | SIM |
| BAIRRO | Bairro | "Centro" | SIM |
| CIDADE | Cidade | "Sao Paulo" | SIM |
| ESTADO | Estado | "SP" | SIM |
| CEP | CEP | "01234-567" | Condicional |

### 2.2 Pessoa Juridica (10 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| DENOMINACAO | Razao social | "XYZ EMPREENDIMENTOS LTDA" | SIM (se PJ) |
| CNPJ | CNPJ | "12.345.678/0001-90" | SIM (se PJ) |
| LOGRADOURO DA SEDE | Logradouro da sede | "Av. Paulista" | SIM (se PJ) |
| NUMERO DA SEDE | Numero da sede | "1000" | SIM (se PJ) |
| BAIRRO DA SEDE | Bairro da sede | "Bela Vista" | SIM (se PJ) |
| CIDADE DA SEDE | Cidade da sede | "Sao Paulo" | SIM (se PJ) |
| ESTADO DA SEDE | Estado da sede | "SP" | SIM (se PJ) |
| CEP DA SEDE | CEP da sede | "01310-100" | Condicional |
| NOME DO ADMINISTRADOR | Nome do administrador | "CARLOS PEREIRA" | SIM (se PJ) |
| CPF DO ADMINISTRADOR | CPF do administrador | "987.654.321-00" | SIM (se PJ) |

### 2.3 Dados do Imovel (11 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NUMERO DA MATRICULA | Numero da matricula | "46.511" | SIM |
| NUMERO DO REGISTRO DE IMOVEIS | Cartorio de RI | "1o OFICIAL DE RI" | SIM |
| CIDADE DO REGISTRO DE IMOVEIS | Cidade do cartorio | "Sao Paulo" | SIM |
| DENOMINACAO DO IMOVEL | Tipo do imovel | "apartamento" | SIM |
| DESCRICAO CONFORME MATRICULA | Descricao completa | "Unidade autonoma..." | SIM |
| LOGRADOURO | Logradouro | "Rua Francisco Cruz" | SIM |
| NUMERO | Numero | "515" | SIM |
| COMPLEMENTO | Complemento | "Apto 124" | Condicional |
| BAIRRO | Bairro | "Vila Mariana" | SIM |
| CIDADE | Cidade | "Sao Paulo" | SIM |
| ESTADO | Estado | "SP" | SIM |

### 2.4 Negocio Juridico (5 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| VALOR TOTAL | Valor da transacao | "500000.00" | SIM |
| NOME DO ALIENANTE | Nome do vendedor | "ELIZETE APARECIDA SILVA" | SIM |
| NOME DO ADQUIRENTE | Nome do comprador | "MARINA AYUB" | SIM |
| TIPO DE PAGAMENTO | Tipo de pagamento | "A VISTA + FINANCIAMENTO" | SIM |
| MODO DE PAGAMENTO | Modo de pagamento | "TED + CEF" | SIM |

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| outorgantes[].nome | NOME / NOME DO ALIENANTE | pessoa_natural / negocio |
| outorgados[].nome | NOME / NOME DO ADQUIRENTE | pessoa_natural / negocio |
| outorgantes[].cpf | CPF | pessoa_natural |
| outorgantes[].rg | RG | pessoa_natural |
| outorgantes[].orgao_rg | ORGAO EMISSOR DO RG | pessoa_natural |
| outorgantes[].nacionalidade | NACIONALIDADE | pessoa_natural |
| outorgantes[].profissao | PROFISSAO | pessoa_natural |
| outorgantes[].estado_civil | ESTADO CIVIL | pessoa_natural |
| outorgantes[].regime_bens | REGIME DE BENS | pessoa_natural |
| outorgantes[].endereco.* | LOGRADOURO/NUMERO/COMPLEMENTO/BAIRRO/CIDADE/ESTADO/CEP | pessoa_natural |
| imovel.matricula | NUMERO DA MATRICULA | imovel |
| imovel.cartorio_ri | NUMERO DO REGISTRO DE IMOVEIS | imovel |
| imovel.descricao | DESCRICAO CONFORME MATRICULA | imovel |
| valor_transacao | VALOR TOTAL | negocio |
| forma_pagamento.* | TIPO DE PAGAMENTO/MODO DE PAGAMENTO | negocio |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "NOME": "JOAO DA SILVA",
    "CPF": "123.456.789-00",
    "RG": "12.345.678-9",
    "ORGAO EMISSOR DO RG": "SSP",
    "ESTADO EMISSOR DO RG": "SP",
    "NACIONALIDADE": "brasileiro",
    "PROFISSAO": "empresario",
    "ESTADO CIVIL": "casado",
    "REGIME DE BENS": "comunhao parcial de bens",
    "LOGRADOURO": "Rua das Flores",
    "NUMERO": "123",
    "BAIRRO": "Centro",
    "CIDADE": "Sao Paulo",
    "ESTADO": "SP",
    "CEP": "01234-567"
  },
  "pessoa_juridica": {},
  "imovel": {
    "NUMERO DA MATRICULA": "46.511",
    "NUMERO DO REGISTRO DE IMOVEIS": "1o OFICIAL DE RI SP",
    "CIDADE DO REGISTRO DE IMOVEIS": "Sao Paulo",
    "DENOMINACAO DO IMOVEL": "apartamento",
    "DESCRICAO CONFORME MATRICULA": "Unidade autonoma no 124...",
    "LOGRADOURO": "Rua Francisco Cruz",
    "NUMERO": "515",
    "COMPLEMENTO": "Apto 124",
    "BAIRRO": "Vila Mariana",
    "CIDADE": "Sao Paulo",
    "ESTADO": "SP"
  },
  "negocio": {
    "VALOR TOTAL": "500000.00",
    "NOME DO ALIENANTE": "ELIZETE APARECIDA SILVA",
    "NOME DO ADQUIRENTE": "MARINA AYUB",
    "TIPO DE PAGAMENTO": "A VISTA + FINANCIAMENTO",
    "MODO DE PAGAMENTO": "TED + CAIXA ECONOMICA FEDERAL"
  }
}
```

---

## 5. USO EM MINUTAS

A ESCRITURA e tanto entrada (escrituras anteriores) quanto saida (minuta gerada).

### 5.1 Como Entrada (Escritura Anterior)
- Dados das partes para correlacao
- Historico de transacoes do imovel
- Referencia para cadeia dominial

### 5.2 Como Saida (Minuta Gerada)
Todos os campos uteis sao usados para gerar a minuta final.

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| NUMERO DA MATRICULA | MATRICULA_IMOVEL, ITBI, COMPROMISSO | Identificar imovel |
| NOME, CPF | RG, CNH, CERTIDAO_CASAMENTO, etc. | Identificar pessoa |
| VALOR TOTAL | ITBI, COMPROMISSO | Validar valor |
| DESCRICAO CONFORME MATRICULA | MATRICULA_IMOVEL | Descricao oficial |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

- `data_nascimento`: Obter de RG, CNH
- `filiacao_*`: Obter de RG, CERTIDAO_NASCIMENTO
- `email`, `telefone`: Obter de COMPROMISSO
- `SQL`: Obter de MATRICULA_IMOVEL, ITBI
- `AREA TOTAL EM M2`, `AREA CONSTRUIDA EM M2`: Obter de MATRICULA_IMOVEL
- `itbi_*`: Obter de ITBI
- Dados bancarios: Obter de COMPROVANTE_PAGAMENTO

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guias: `Guia-de-campos-e-variaveis/campos-*.md`
- Campos Completos: `campos-completos/ESCRITURA.md`
