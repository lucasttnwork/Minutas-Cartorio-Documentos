# DADOS_CADASTRAIS - Certidao de Dados Cadastrais do Imovel

**Complexidade de Extracao**: MEDIA
**Schema Fonte**: Estrutura generica (nao possui schema dedicado)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A Certidao de Dados Cadastrais do Imovel e um documento emitido pela Prefeitura Municipal (geralmente pela Secretaria da Fazenda) que consolida todas as informacoes cadastrais de um imovel registradas no sistema municipal. O documento detalha as caracteristicas fisicas, fiscais e de propriedade do imovel conforme o cadastro imobiliario do municipio.

Este documento e fundamental em transacoes imobiliarias por conter:
- **Cadastro do Imovel (SQL)**: Identificador unico no cadastro municipal
- **Dados do Terreno**: Area, fracao ideal, testada
- **Dados da Construcao**: Area construida, padrao, ano de construcao
- **Valores Venais**: Valor venal total, por componente e por m2
- **Identificacao dos Contribuintes**: Proprietarios ou responsaveis tributarios

### 1.2 Diferenca entre DADOS_CADASTRAIS e IPTU (Carne)

| Aspecto | DADOS_CADASTRAIS | IPTU (Carne) |
|---------|------------------|--------------|
| **Foco** | Dados fisicos e cadastrais do imovel | Lancamento e pagamento do imposto |
| **Conteudo Principal** | Descricao detalhada do imovel | Guias de pagamento e valores |
| **Valores de Imposto** | Nao contem (ou secundario) | Principal conteudo |
| **Uso Tipico** | Transacoes imobiliarias, documentacao | Pagamento de tributos |
| **Emissao** | Sob demanda, com validade | Anual, no exercicio fiscal |

**Na pratica**: A Certidao de Dados Cadastrais e o IPTU compartilham muitos campos. Quando o documento enfatiza os **dados fisicos e cadastrais** do imovel, e classificado como DADOS_CADASTRAIS. Quando enfatiza os **valores e guias de pagamento**, e classificado como IPTU.

### 1.3 Padroes de Identificacao Visual

Os seguintes padroes indicam que um documento e uma Certidao de Dados Cadastrais:

- **CERTIDAO DE DADOS CADASTRAIS DO IMOVEL**
- **DADOS CADASTRAIS** seguido de referencia a IPTU
- **PREFEITURA** seguido do nome do municipio
- **SECRETARIA DA FAZENDA** ou **SECRETARIA MUNICIPAL DA FAZENDA**
- Presenca de campos como "Area construida", "Fracao ideal", "Padrao da construcao"
- **CADASTRO DO IMOVEL** ou **SQL** (Setor Quadra Lote)
- **VALOR VENAL** do terreno e da construcao detalhados
- Ausencia de guias de pagamento (diferenca do carne de IPTU)

### 1.4 Formatos Comuns

A Certidao de Dados Cadastrais pode ser encontrada nos seguintes formatos:

1. **Certidao Digital (PDF)**: Emitida pelo portal da prefeitura, com codigo de verificacao
2. **Certidao Impressa**: Versao emitida em balcao com assinatura e carimbo
3. **Extrato de Dados Cadastrais**: Versao resumida obtida online
4. **Certidao de Dados Cadastrais para IPTU**: Documento especifico vinculado ao exercicio

**Caracteristicas do documento**:
- Documento geralmente de uma pagina
- Estrutura tabular com dados do terreno e construcao
- Inclui codigo de verificacao para validacao online
- Possui data de emissao e validade

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Nivel Extracao | Confianca |
|-------|------|-----------|---------|----------------|-----------|
| cadastro_imovel | string | SQL - Setor Quadra Lote do imovel | "039.080.0244-3" | 1 | Alta |
| endereco_imovel | object | Endereco completo do imovel | (ver secao 2.3.1) | 2 | Alta |
| contribuintes | array | Lista de contribuintes do imovel | (ver secao 2.4.1) | 2 | Alta |
| valor_venal_total | number | Valor venal total do imovel | 234191.00 | 1 | Alta |
| data_emissao | date | Data de emissao da certidao | "26/10/2023" | 1 | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Nivel Extracao | Confianca | Quando Presente |
|-------|------|-----------|---------|----------------|-----------|-----------------|
| subtipo | string | Subtipo especifico do documento | "Certidao de Dados Cadastrais do Imovel - IPTU 2023" | 1 | Alta | Sempre |
| orgao_emissor | string | Prefeitura emissora | "Prefeitura de Sao Paulo - Secretaria da Fazenda" | 1 | Alta | Sempre |
| data_validade | date | Data de validade da certidao | "24/01/2024" | 1 | Alta | Na maioria das certidoes |
| numero_documento | string | Numero da certidao | "2.2023.022156977-1" | 1 | Alta | Na maioria das certidoes |
| codigo_verificacao | string | Codigo para validacao online | "2.2023.022156977-1" | 1 | Alta | Em certidoes digitais |
| url_verificacao | string | URL para validacao | "http://www.prefeitura.sp.gov.br/..." | 1 | Media | Em certidoes digitais |
| dados_terreno | object | Dados cadastrais do terreno | (ver secao 2.3.2) | 2 | Media | Sempre em certidoes detalhadas |
| dados_construcao | object | Dados cadastrais da construcao | (ver secao 2.3.3) | 2 | Media | Se imovel edificado |
| valores_m2 | object | Valores por metro quadrado | (ver secao 2.3.4) | 1 | Media | Em certidoes detalhadas |
| valor_venal_terreno | number | Valor venal do terreno | 89818.00 | 1 | Alta | Em certidoes detalhadas |
| valor_venal_construcao | number | Valor venal da construcao | 144373.00 | 1 | Alta | Se imovel edificado |
| uso_imovel | string | Uso do imovel | "RESIDENCIAL" | 1 | Alta | Sempre |

### 2.3 Objetos Nested

#### 2.3.1 endereco_imovel (object)

Objeto obrigatorio contendo o endereco completo do imovel.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| endereco_imovel.logradouro | string | Nome da rua/avenida | "R FRANCISCO CRUZ" | Sim |
| endereco_imovel.numero | string | Numero do imovel | "515" | Sim |
| endereco_imovel.complemento | string | Complemento (apto, bloco) | "APTO 124 BL-B" | Nao |
| endereco_imovel.bairro | string | Bairro do imovel | "VILA MARIANA" | Nao |
| endereco_imovel.cidade | string | Cidade do imovel | "SAO PAULO" | Sim |
| endereco_imovel.estado | string | Estado (UF) | "SP" | Sim |
| endereco_imovel.cep | string | CEP do imovel | "04117-902" | Sim |

**Notas**:
- O bairro frequentemente nao aparece de forma explicita
- A cidade e o estado podem ser inferidos pelo orgao emissor
- O endereco pode vir em formato unico ("R FRANCISCO CRUZ, 515 - APTO 124 BL-B, CEP 04117-902")

#### 2.3.2 dados_terreno (object)

Objeto opcional contendo as caracteristicas cadastrais do terreno.

| Subcampo | Tipo | Unidade | Descricao | Exemplo | Obrigatorio |
|----------|------|---------|-----------|---------|-------------|
| dados_terreno.area | number | m2 | Area total do terreno | 1666.00 | Sim |
| dados_terreno.area_incorporada | number | m2 | Area incorporada ao condominio | 1666.00 | Nao |
| dados_terreno.fracao_ideal | number | decimal | Fracao ideal do contribuinte | 0.0089 | Nao |
| dados_terreno.testada | number | m | Testada principal do terreno | 32.50 | Nao |

**Notas**:
- A `fracao_ideal` e fundamental para condominios (apartamentos)
- Pode haver subdivisao em "area incorporada" e "area nao incorporada"
- A `testada` e a medida de frente do terreno para a via publica

#### 2.3.3 dados_construcao (object)

Objeto opcional contendo as caracteristicas cadastrais da construcao.

| Subcampo | Tipo | Unidade | Descricao | Exemplo | Obrigatorio |
|----------|------|---------|-----------|---------|-------------|
| dados_construcao.area | number | m2 | Area construida | 112.00 | Sim |
| dados_construcao.tipo | string | - | Tipo de construcao | "APARTAMENTO" | Nao |
| dados_construcao.padrao | string | - | Padrao construtivo | "2-C" | Nao |
| dados_construcao.ano_construcao | number | ano | Ano da construcao | 1974 | Nao |

**Notas**:
- O `padrao` influencia diretamente o valor venal (A=alto, B=medio, C=baixo)
- O numero antes da letra indica a categoria (ex: 2-C = categoria 2, padrao C)
- O `tipo` pode ser: APARTAMENTO, CASA, BARRACAO, LOJA, SALA, TERRENO, etc.

#### 2.3.4 valores_m2 (object)

Objeto opcional contendo os valores de metro quadrado utilizados no calculo.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| valores_m2.terreno | number | Valor do m2 do terreno | 4275.00 | Nao |
| valores_m2.construcao | number | Valor do m2 da construcao | 3144.00 | Nao |

**Notas**:
- Valores definidos pela planta de valores genericos do municipio
- Variam conforme localizacao (bairro) e padrao construtivo

### 2.4 Arrays

#### 2.4.1 contribuintes (array)

Array obrigatorio contendo a lista de contribuintes (proprietarios ou responsaveis tributarios).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| contribuintes[].tipo | string | Tipo de pessoa | "CONTRIBUINTE" | Sim |
| contribuintes[].nome | string | Nome completo do contribuinte | "RODOLFO WOLFGANG ORTRIWANO" | Sim |
| contribuintes[].cpf | string | CPF do contribuinte (se PF) | "585.096.668-49" | Nao* |
| contribuintes[].cnpj | string | CNPJ se pessoa juridica | "01.588.805/0001-60" | Nao* |

*Pelo menos um identificador (CPF ou CNPJ) deve estar presente.

**Notas**:
- Um imovel pode ter multiplos contribuintes (co-proprietarios)
- O array pode conter **mistura de PF e PJ** no mesmo imovel
- A ordem dos contribuintes pode indicar titularidade principal
- Em alguns municipios, o nome pode estar protegido por sigilo fiscal

**Exemplo de Array Misto (PF + PJ)**:
```json
"contribuintes": [
  {
    "tipo": "CONTRIBUINTE",
    "nome": "VERTICE ENGENHARIA E COMERCIO LTDA",
    "cnpj": "01.588.805/0001-60"
  },
  {
    "tipo": "CONTRIBUINTE",
    "nome": "RODOLFO WOLFGANG ORTRIWANO",
    "cpf": "585.096.668-49"
  }
]
```

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| contribuintes[].nome (se PF) | nome | Nome completo da pessoa | SIM |
| contribuintes[].cpf | cpf | Cadastro de Pessoa Fisica | SIM |

**Observacao**: A Certidao de Dados Cadastrais fornece dados basicos de identificacao (nome e CPF). Dados complementares como RG, profissao, estado civil e endereco domiciliar devem ser obtidos de outros documentos (RG, Certidao de Casamento, Comprovante de Residencia).

### 3.2 Campos que Alimentam "Pessoa Juridica"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| contribuintes[].nome (se PJ) | pj_denominacao | Razao social ou denominacao | SIM |
| contribuintes[].cnpj | pj_cnpj | CNPJ da pessoa juridica | SIM |

**Observacao**: A certidao pode conter contribuintes PF e PJ no mesmo imovel. A identificacao e feita pelo tipo de documento (CPF = PF, CNPJ = PJ).

### 3.3 Campos que Alimentam "Dados do Imovel"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| cadastro_imovel | imovel_sql | Cadastro Municipal (SQL) | SIM |
| endereco_imovel.logradouro | imovel_logradouro | Logradouro do imovel | SIM |
| endereco_imovel.numero | imovel_numero | Numero do imovel | SIM |
| endereco_imovel.complemento | imovel_complemento | Complemento do imovel | SIM |
| endereco_imovel.bairro | imovel_bairro | Bairro do imovel | SIM |
| endereco_imovel.cidade | imovel_cidade | Cidade do imovel | SIM |
| endereco_imovel.estado | imovel_estado | Estado do imovel | SIM |
| endereco_imovel.cep | imovel_cep | CEP do imovel | SIM |
| dados_construcao.area | imovel_area_construida | Area construida em m2 | SIM |
| valor_venal_total | imovel_valor_venal_iptu | Valor venal para IPTU | SIM |

### 3.4 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao |
|-----------------|-------------------|
| subtipo | Metadado do documento - para classificacao interna |
| orgao_emissor | Informativo - inferido pelo municipio |
| data_validade | Metadado do documento - usado para validacao de vigencia |
| numero_documento | Metadado do documento - para referencia |
| codigo_verificacao | Para validacao online apenas |
| url_verificacao | Para validacao online apenas |
| dados_terreno.area | Informativo - area total vem preferencialmente da matricula |
| dados_terreno.fracao_ideal | Dado tecnico - fracao ideal vem preferencialmente da matricula |
| dados_terreno.testada | Dado tecnico cadastral - nao usado em minutas |
| dados_construcao.tipo | Informativo - tipo de imovel vem da matricula |
| dados_construcao.padrao | Dado tecnico para calculo de imposto |
| dados_construcao.ano_construcao | Informativo - usado apenas para referencia |
| valores_m2.* | Dados de calculo interno |
| valor_venal_terreno | Dado parcial - apenas total e utilizado |
| valor_venal_construcao | Dado parcial - apenas total e utilizado |
| uso_imovel | Informativo - tipo de uso vem da matricula |
| data_emissao | Metadado do documento |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "DADOS_CADASTRAIS",
  "tipo_documento_identificado": "DADOS_CADASTRAIS",
  "subtipo": "Certidao de Dados Cadastrais do Imovel - IPTU 2023",
  "orgao_emissor": "Prefeitura de Sao Paulo - Secretaria da Fazenda",
  "data_emissao": "26/10/2023",
  "data_validade": "24/01/2024",

  "partes": [
    {
      "tipo": "CONTRIBUINTE",
      "nome": "VERTICE ENGENHARIA E COMERCIO LTDA",
      "cnpj": "01.588.805/0001-60"
    },
    {
      "tipo": "CONTRIBUINTE",
      "nome": "RODOLFO WOLFGANG ORTRIWANO",
      "cpf": "585.096.668-49"
    }
  ],

  "imovel": {
    "endereco": "R FRANCISCO CRUZ, 515 - APTO 124 BL-B, CEP 04117-902, SAO PAULO - SP",
    "sql": "039.080.0244-3",
    "area_m2": 112.0,
    "descricao": "Apartamento residencial com 112m2 de area construida, padrao 2-C, ano de construcao 1974."
  },

  "valores": {
    "valor_principal": 234191.0,
    "moeda": "BRL",
    "valores_adicionais": [
      {"descricao": "Valor venal do terreno (area incorporada)", "valor": 89818.0},
      {"descricao": "Valor venal da construcao", "valor": 144373.0},
      {"descricao": "Valor do m2 do terreno", "valor": 4275.0},
      {"descricao": "Valor do m2 da construcao", "valor": 3144.0}
    ]
  },

  "numeros_identificadores": [
    {"tipo": "Cadastro do Imovel (SQL)", "numero": "039.080.0244-3"},
    {"tipo": "Numero do Documento", "numero": "2.2023.022156977-1"}
  ],

  "codigo_verificacao": "2.2023.022156977-1",
  "url_verificacao": "http://www.prefeitura.sp.gov.br/cidade/secretarias/financas/servicos/certidoes/",

  "metadados_extracao": {
    "confianca_geral": "alta",
    "campos_ilegiveis": [],
    "validacoes_executadas": [
      "sql_formato_valido",
      "cpf_digito_verificador",
      "cnpj_digito_verificador",
      "soma_valores_venais"
    ]
  }
}
```

**Fonte**: Extracao real do sistema de catalogacao

### 4.1 Exemplo Normalizado (Formato Schema)

```json
{
  "tipo_documento": "DADOS_CADASTRAIS",
  "cadastro_imovel": "039.080.0244-3",

  "endereco_imovel": {
    "logradouro": "R FRANCISCO CRUZ",
    "numero": "515",
    "complemento": "APTO 124 BL-B",
    "bairro": null,
    "cidade": "SAO PAULO",
    "estado": "SP",
    "cep": "04117-902"
  },

  "contribuintes": [
    {
      "tipo": "juridica",
      "cnpj": "01.588.805/0001-60",
      "nome": "VERTICE ENGENHARIA E COMERCIO LTDA"
    },
    {
      "tipo": "fisica",
      "cpf": "585.096.668-49",
      "nome": "RODOLFO WOLFGANG ORTRIWANO"
    }
  ],

  "dados_terreno": {
    "area": 1666,
    "area_incorporada": 1666,
    "testada": null,
    "fracao_ideal": null
  },

  "dados_construcao": {
    "area": 112,
    "ano_construcao": 1974,
    "padrao": "2-C",
    "tipo": "APARTAMENTO"
  },

  "valores_m2": {
    "terreno": 4275.00,
    "construcao": 3144.00
  },

  "valor_venal_terreno": 89818.00,
  "valor_venal_construcao": 144373.00,
  "valor_venal_total": 234191.00,

  "uso_imovel": "RESIDENCIAL",
  "data_emissao": "26/10/2023",
  "data_validade": "24/01/2024",
  "numero_documento": "2.2023.022156977-1",
  "codigo_verificacao": "2.2023.022156977-1"
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cadastro_imovel (SQL) | IPTU, VVR, CND_MUNICIPAL, CND_IMOVEL, ITBI, MATRICULA_IMOVEL | Identificador PRIMARIO do imovel no cadastro municipal |
| endereco_imovel | MATRICULA_IMOVEL, ITBI, COMPROMISSO, ESCRITURA, VVR, IPTU | Validar localizacao do imovel |
| contribuintes[].cpf | RG, CNH, CPF, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL | Identificar proprietario/contribuinte |
| contribuintes[].cnpj | CONTRATO_SOCIAL, CND_FEDERAL, CNDT | Identificar pessoa juridica |
| contribuintes[].nome | RG, MATRICULA_IMOVEL, COMPROMISSO, ESCRITURA | Validar nome do proprietario |
| valor_venal_total | IPTU (identico), VVR (diferente), ITBI (referencia) | Comparar valores venais |
| dados_construcao.area | MATRICULA_IMOVEL, COMPROMISSO, ESCRITURA, IPTU | Validar area construida |

### 5.2 Redundancia Intencional

A Certidao de Dados Cadastrais e **fonte primaria** para os seguintes dados:

1. **Cadastro Municipal (SQL)**: Identificador unico do imovel na prefeitura
2. **Valor Venal para IPTU**: Base de calculo do imposto predial
3. **Dados Cadastrais do Terreno**: Area total, fracao ideal, testada
4. **Dados Cadastrais da Construcao**: Area construida, tipo, padrao, ano
5. **Contribuintes Registrados**: Proprietarios conforme cadastro municipal

**Validacoes Cruzadas Recomendadas**:

- **DADOS_CADASTRAIS x MATRICULA**: SQL deve estar presente na matricula; areas devem ser compativeis
- **DADOS_CADASTRAIS x VVR**: SQL deve ser identico; VVR e diferente do valor venal IPTU
- **DADOS_CADASTRAIS x CND_MUNICIPAL**: SQL deve coincidir; contribuinte deve ser o mesmo
- **DADOS_CADASTRAIS x ITBI**: SQL deve coincidir; valor venal IPTU pode diferir do VVR/base ITBI
- **DADOS_CADASTRAIS x IPTU**: Pode ser o mesmo documento com foco diferente; SQL e valores identicos
- **DADOS_CADASTRAIS x COMPROMISSO/ESCRITURA**: Endereco e areas devem ser compativeis

### 5.3 Diferenca entre Valor Venal IPTU e VVR

| Aspecto | Valor Venal IPTU (DADOS_CADASTRAIS) | Valor Venal de Referencia (VVR) |
|---------|-------------------------------------|--------------------------------|
| **Finalidade** | Base de calculo do IPTU anual | Base de calculo do ITBI |
| **Fonte** | Certidao de Dados Cadastrais / IPTU | Consulta VVR no portal da prefeitura |
| **Atualizacao** | Anual (exercicio fiscal) | Pode ser atualizado periodicamente |
| **Valor tipico** | Geralmente MENOR | Geralmente MAIOR (mais proximo do mercado) |
| **Campo mapeado** | imovel_valor_venal_iptu | imovel_valor_venal_referencia |

**Exemplo Real (mesmo imovel)**:
- Valor Venal IPTU (2023): R$ 234.191,00
- VVR (26/10/2023): R$ 301.147,00

### 5.4 Sobreposicao com IPTU

A Certidao de Dados Cadastrais e o carne de IPTU sao documentos **complementares** que podem conter as mesmas informacoes. A diferenca esta no **foco**:

| Documento | Foco Principal | Conteudo Adicional |
|-----------|---------------|-------------------|
| DADOS_CADASTRAIS | Descricao fisica do imovel | Valores venais como informacao |
| IPTU (Carne) | Valores do imposto a pagar | Dados cadastrais como referencia |

Na ausencia de uma Certidao de Dados Cadastrais especifica, o IPTU pode ser utilizado para obter os mesmos dados cadastrais.

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

As seguintes validacoes sao executadas automaticamente na extracao:

- [x] **sql_formato_valido**: Verifica se o SQL segue o padrao 000.000.0000-0
- [x] **cpf_digito_verificador**: Valida digito verificador de CPF dos contribuintes
- [x] **cnpj_digito_verificador**: Valida digito verificador de CNPJ dos contribuintes
- [x] **soma_valores_venais**: Verifica se terreno + construcao = total (quando ambos presentes)
- [x] **data_validade_futura**: Verifica se a certidao ainda esta vigente

### 6.2 Validacoes Adicionais Recomendadas

| Validacao | Formula | Resultado Esperado |
|-----------|---------|-------------------|
| Soma areas | area_terreno >= area_construida | Verdadeiro |
| Fracao ideal | 0 < fracao_ideal <= 1 | Verdadeiro (se presente) |
| Valor venal positivo | valor_venal_total > 0 | Verdadeiro |
| Ano construcao coerente | ano_construcao <= ano_atual | Verdadeiro |
| CEP valido | CEP no formato 00000-000 | Verdadeiro |
| Soma venais | valor_venal_terreno + valor_venal_construcao = valor_venal_total | Verdadeiro (tolerancia de R$ 1) |

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
| valor_venal_total | valor_venal_terreno + valor_venal_construcao |
| valor_venal_terreno | area_terreno x valor_m2_terreno x fracao_ideal (para apartamentos) |
| valor_venal_construcao | area_construida x valor_m2_construcao |

### 7.2 Campos Inferidos

| Campo | Regra de Inferencia |
|-------|---------------------|
| imovel_cidade | Extraido do nome do orgao emissor ("Prefeitura de Sao Paulo" = "Sao Paulo") |
| imovel_estado | Extraido do nome do orgao emissor ("Prefeitura de Sao Paulo" = "SP") |
| tipo_pessoa | Inferido pelo documento (CPF = fisica, CNPJ = juridica) |
| uso_imovel | Pode ser "RESIDENCIAL", "COMERCIAL", "INDUSTRIAL", "MISTO" ou "TERRENO" |

### 7.3 Campos Raros

| Campo | Quando Presente |
|-------|-----------------|
| dados_terreno.area_nao_incorporada | Imoveis com areas condominiais especiais |
| fracao_ideal | Apenas em apartamentos/condominios |
| testada | Terrenos com frente para via publica |

### 7.4 Expressoes Regulares

| Campo | Regex | Exemplo |
|-------|-------|---------|
| cadastro_imovel (SQL) | `\d{3}\.\d{3}\.\d{4}-\d` | "039.080.0244-3" |
| valor_monetario | `R\$\s*[\d.,]+` | "R$ 234.191,00" |
| cep | `\d{5}-\d{3}` | "04117-902" |
| cpf | `\d{3}\.\d{3}\.\d{3}-\d{2}` | "585.096.668-49" |
| cnpj | `\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}` | "01.588.805/0001-60" |
| data (geral) | `\d{2}/\d{2}/\d{4}` | "26/10/2023" |
| padrao_construcao | `\d-[A-C]` | "2-C" |
| uso_imovel | `(RESIDENCIAL\|COMERCIAL\|INDUSTRIAL\|MISTO\|TERRENO)` | "RESIDENCIAL" |

### 7.5 Multiplos Contribuintes (PF + PJ)

A Certidao de Dados Cadastrais pode listar **multiplos contribuintes** de tipos diferentes no mesmo imovel:

```
Cenarios comuns:
1. Dois coiuges (2 PF)
2. Empresa e socio (1 PJ + 1 PF)
3. Condominios pro indiviso (multiplas PF)
4. Holding familiar e proprietarios (multiplas PJ + PF)
```

Para correlacao, todos os contribuintes devem ser considerados e podem aparecer como:
- Alienantes em escrituras de venda
- Outorgantes em procuracoes
- Partes em compromissos de compra e venda

### 7.6 Validade da Certidao

- A Certidao de Dados Cadastrais geralmente tem validade de **90 dias**
- A validade esta indicada no campo `data_validade`
- Apos vencimento, nova certidao deve ser emitida
- Algumas transacoes exigem certidao atualizada (emissao recente)

---

## 8. REFERENCIAS

### 8.1 Arquivos do Sistema

| Tipo | Caminho |
|------|---------|
| Schema JSON | Estrutura generica (usa formato padrao de extracao) |
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
| imovel | 10 campos (imovel_sql, imovel_logradouro, imovel_numero, imovel_complemento, imovel_bairro, imovel_cidade, imovel_estado, imovel_cep, imovel_area_construida, imovel_valor_venal_iptu) |
| negocio | 0 |
| **Total** | **13 campos** |

### 8.4 Documentos Relacionados

| Documento | Relacao |
|-----------|---------|
| IPTU.md | Documento muito similar - foco em valores de imposto |
| VVR.md | Valor venal de referencia (diferente do IPTU) |
| CND_MUNICIPAL.md | Certidao de regularidade fiscal do imovel |
| MATRICULA_IMOVEL.md | Fonte primaria de dados do imovel |

---

## APENDICE: CHECKLIST DE CAMPOS CRITICOS

Antes de considerar uma extracao completa, verifique:

**Identificacao do Imovel**:
- [ ] cadastro_imovel (SQL) - CRITICO
- [ ] endereco_imovel.logradouro
- [ ] endereco_imovel.numero
- [ ] endereco_imovel.cep

**Contribuintes**:
- [ ] contribuintes[].nome (pelo menos 1) - CRITICO
- [ ] contribuintes[].cpf ou contribuintes[].cnpj - CRITICO

**Valores**:
- [ ] valor_venal_total - CRITICO

**Areas (se certidao detalhada)**:
- [ ] dados_construcao.area (se edificado)

**Metadados**:
- [ ] data_emissao
- [ ] data_validade (se aplicavel)

Se algum campo CRITICO nao foi encontrado:
1. Retornar null para o campo
2. Listar em metadados_extracao.campos_nao_encontrados
3. Mencionar na explicacao contextual

---

## APENDICE B: COMPARATIVO DADOS_CADASTRAIS vs IPTU

Para facilitar a classificacao entre os dois tipos de documento:

```
Documento recebido: "Certidao de Dados Cadastrais do Imovel - IPTU 2023"

Criterios para DADOS_CADASTRAIS:
- Titulo menciona "Dados Cadastrais"
- Foco em descricao fisica do imovel
- Detalha padrao construtivo, ano, tipo
- Valores venais aparecem como informacao

Criterios para IPTU (Carne):
- Titulo menciona "IPTU" ou "Imposto Predial"
- Contem guias de pagamento (carne)
- Foco nos valores de imposto a pagar
- Dados cadastrais sao secundarios

Na duvida: classificar como DADOS_CADASTRAIS se o documento
enfatiza a descricao do imovel; classificar como IPTU se
enfatiza valores de imposto e pagamento.
```

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
