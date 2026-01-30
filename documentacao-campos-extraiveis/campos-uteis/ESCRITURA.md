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
| nome | Nome completo | "JOAO DA SILVA" | SIM |
| cpf | CPF | "123.456.789-00" | SIM |
| rg | RG | "12.345.678-9" | SIM |
| orgao_emissor_rg | Orgao emissor | "SSP" | SIM |
| estado_emissor_rg | UF do emissor | "SP" | SIM |
| nacionalidade | Nacionalidade | "brasileiro" | SIM |
| profissao | Profissao | "empresario" | SIM |
| estado_civil | Estado civil | "casado" | SIM |
| regime_bens | Regime de bens | "comunhao parcial" | Se casado |
| domicilio_logradouro | Logradouro | "Rua das Flores" | SIM |
| domicilio_numero | Numero | "123" | SIM |
| domicilio_bairro | Bairro | "Centro" | SIM |
| domicilio_cidade | Cidade | "Sao Paulo" | SIM |
| domicilio_estado | Estado | "SP" | SIM |
| domicilio_cep | CEP | "01234-567" | Condicional |

### 2.2 Pessoa Juridica (10 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_denominacao | Razao social | "XYZ EMPREENDIMENTOS LTDA" | SIM (se PJ) |
| pj_cnpj | CNPJ | "12.345.678/0001-90" | SIM (se PJ) |
| pj_sede_logradouro | Logradouro da sede | "Av. Paulista" | SIM (se PJ) |
| pj_sede_numero | Numero da sede | "1000" | SIM (se PJ) |
| pj_sede_bairro | Bairro da sede | "Bela Vista" | SIM (se PJ) |
| pj_sede_cidade | Cidade da sede | "Sao Paulo" | SIM (se PJ) |
| pj_sede_estado | Estado da sede | "SP" | SIM (se PJ) |
| pj_sede_cep | CEP da sede | "01310-100" | Condicional |
| pj_admin_nome | Nome do administrador | "CARLOS PEREIRA" | SIM (se PJ) |
| pj_admin_cpf | CPF do administrador | "987.654.321-00" | SIM (se PJ) |

### 2.3 Dados do Imovel (11 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| matricula_numero | Numero da matricula | "46.511" | SIM |
| matricula_cartorio_numero | Cartorio de RI | "1o OFICIAL DE RI" | SIM |
| matricula_cartorio_cidade | Cidade do cartorio | "Sao Paulo" | SIM |
| imovel_denominacao | Tipo do imovel | "apartamento" | SIM |
| imovel_descricao_conforme_matricula | Descricao completa | "Unidade autonoma..." | SIM |
| imovel_logradouro | Logradouro | "Rua Francisco Cruz" | SIM |
| imovel_numero | Numero | "515" | SIM |
| imovel_complemento | Complemento | "Apto 124" | Condicional |
| imovel_bairro | Bairro | "Vila Mariana" | SIM |
| imovel_cidade | Cidade | "Sao Paulo" | SIM |
| imovel_estado | Estado | "SP" | SIM |

### 2.4 Negocio Juridico (5 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| negocio_valor_total | Valor da transacao | "500000.00" | SIM |
| alienante_nome | Nome do vendedor | "ELIZETE APARECIDA SILVA" | SIM |
| adquirente_nome | Nome do comprador | "MARINA AYUB" | SIM |
| pagamento_tipo | Tipo de pagamento | "A VISTA + FINANCIAMENTO" | SIM |
| pagamento_modo | Modo de pagamento | "TED + CEF" | SIM |

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| outorgantes[].nome | nome / alienante_nome | pessoa_natural / negocio |
| outorgados[].nome | nome / adquirente_nome | pessoa_natural / negocio |
| outorgantes[].cpf | cpf | pessoa_natural |
| outorgantes[].rg | rg | pessoa_natural |
| outorgantes[].orgao_rg | orgao_emissor_rg | pessoa_natural |
| outorgantes[].nacionalidade | nacionalidade | pessoa_natural |
| outorgantes[].profissao | profissao | pessoa_natural |
| outorgantes[].estado_civil | estado_civil | pessoa_natural |
| outorgantes[].regime_bens | regime_bens | pessoa_natural |
| outorgantes[].endereco.* | domicilio_* | pessoa_natural |
| imovel.matricula | matricula_numero | imovel |
| imovel.cartorio_ri | matricula_cartorio_numero | imovel |
| imovel.descricao | imovel_descricao_conforme_matricula | imovel |
| valor_transacao | negocio_valor_total | negocio |
| forma_pagamento.* | pagamento_tipo/modo | negocio |

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
    "domicilio_logradouro": "Rua das Flores",
    "domicilio_numero": "123",
    "domicilio_bairro": "Centro",
    "domicilio_cidade": "Sao Paulo",
    "domicilio_estado": "SP",
    "domicilio_cep": "01234-567"
  },
  "pessoa_juridica": {},
  "imovel": {
    "matricula_numero": "46.511",
    "matricula_cartorio_numero": "1o OFICIAL DE RI SP",
    "matricula_cartorio_cidade": "Sao Paulo",
    "imovel_denominacao": "apartamento",
    "imovel_descricao_conforme_matricula": "Unidade autonoma no 124...",
    "imovel_logradouro": "Rua Francisco Cruz",
    "imovel_numero": "515",
    "imovel_complemento": "Apto 124",
    "imovel_bairro": "Vila Mariana",
    "imovel_cidade": "Sao Paulo",
    "imovel_estado": "SP"
  },
  "negocio": {
    "negocio_valor_total": "500000.00",
    "alienante_nome": "ELIZETE APARECIDA SILVA",
    "adquirente_nome": "MARINA AYUB",
    "pagamento_tipo": "A VISTA + FINANCIAMENTO",
    "pagamento_modo": "TED + CAIXA ECONOMICA FEDERAL"
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
| matricula_numero | MATRICULA_IMOVEL, ITBI, COMPROMISSO | Identificar imovel |
| nome, cpf | RG, CNH, CERTIDAO_CASAMENTO, etc. | Identificar pessoa |
| negocio_valor_total | ITBI, COMPROMISSO | Validar valor |
| imovel_descricao_conforme_matricula | MATRICULA_IMOVEL | Descricao oficial |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

- `data_nascimento`: Obter de RG, CNH
- `filiacao_*`: Obter de RG, CERTIDAO_NASCIMENTO
- `email`, `telefone`: Obter de COMPROMISSO
- `imovel_sql`: Obter de MATRICULA_IMOVEL, ITBI
- `imovel_area_*`: Obter de MATRICULA_IMOVEL
- `itbi_*`: Obter de ITBI
- Dados bancarios: Obter de COMPROVANTE_PAGAMENTO

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guias: `Guia-de-campos-e-variaveis/campos-*.md`
- Campos Completos: `campos-completos/ESCRITURA.md`
