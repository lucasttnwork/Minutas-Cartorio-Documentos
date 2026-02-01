# IPTU - Carne/Certidao de IPTU

**Complexidade de Extracao**: MEDIA
**Schema Fonte**: `execution/schemas/iptu.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O IPTU (Imposto Predial e Territorial Urbano) e um tributo municipal anual que incide sobre a propriedade de imoveis urbanos. O carne ou certidao de IPTU e emitido pela Prefeitura do municipio onde o imovel esta localizado e contem dados cadastrais oficiais do imovel para fins de tributacao.

O documento e fundamental em transacoes imobiliarias por conter:
- **Cadastro do Imovel (SQL)**: Identificador unico do imovel no cadastro municipal
- **Dados do Terreno e Construcao**: Areas, fracoes ideais e caracteristicas fisicas
- **Valor Venal para IPTU**: Base de calculo do imposto, utilizada como referencia em avaliacoes
- **Identificacao dos Contribuintes**: Proprietarios ou responsaveis tributarios registrados

A "Certidao de Dados Cadastrais do Imovel" e uma variante comum que consolida todas essas informacoes em um documento oficial emitido pela Secretaria da Fazenda municipal.

### 1.2 Padroes de Identificacao Visual

Os seguintes padroes indicam que um documento e um IPTU ou Certidao de Dados Cadastrais:

- **IPTU** ou **IMPOSTO PREDIAL E TERRITORIAL URBANO**
- **IMPOSTO PREDIAL** ou **IMPOSTO TERRITORIAL**
- **PREFEITURA** seguido do nome do municipio
- **EXERCICIO** seguido de ano (ex: "Exercicio 2026")
- **VALOR VENAL** ou **BASE DE CALCULO DO IPTU**
- **CERTIDAO DE DADOS CADASTRAIS DO IMOVEL**
- **CADASTRO DO IMOVEL** ou **SQL** (Setor Quadra Lote)
- Presenca de campos como "Area construida", "Fracao ideal", "Padrao da construcao"

### 1.3 Formatos Comuns

O IPTU pode ser encontrado nos seguintes formatos:

1. **Carne de IPTU**: Documento anual com guias de pagamento parcelado ou a vista
2. **Certidao de Dados Cadastrais**: Documento descritivo com dados cadastrais completos do imovel
3. **Certidao de Valor Venal**: Documento especifico informando o valor venal para IPTU
4. **Extrato de IPTU**: Versao resumida emitida online com dados principais
5. **2a Via Digital**: Reimpressao via portal da prefeitura

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Nivel Extracao | Confianca |
|-------|------|-----------|---------|----------------|-----------|
| cadastro_imovel | string | SQL - Setor Quadra Lote do imovel | "039.080.0244-3" | 1 | Alta |
| ano_exercicio | number | Ano do exercicio fiscal | 2026 | 1 | Alta |
| endereco_imovel | object | Endereco completo do imovel | (ver secao 2.3.1) | 2 | Alta |
| contribuintes | array | Lista de contribuintes do imovel | (ver secao 2.4.1) | 2 | Alta |
| valor_venal_total | number | Valor venal total do imovel | 234191.00 | 1 | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Nivel Extracao | Confianca | Quando Presente |
|-------|------|-----------|---------|----------------|-----------|-----------------|
| endereco_notificacao | object | Endereco para correspondencia | (ver secao 2.3.2) | 2 | Media | Se diferente do imovel |
| dados_terreno | object | Dados cadastrais do terreno | (ver secao 2.3.3) | 2 | Media | Sempre em certidoes detalhadas |
| dados_construcao | object | Dados cadastrais da construcao | (ver secao 2.3.4) | 2 | Media | Se imovel edificado |
| valores_m2 | object | Valores por metro quadrado | (ver secao 2.3.5) | 1 | Media | Em certidoes detalhadas |
| valor_venal_terreno | number | Valor venal do terreno | 89818.00 | 1 | Alta | Em certidoes detalhadas |
| valor_venal_construcao | number | Valor venal da construcao | 144373.00 | 1 | Alta | Se imovel edificado |
| valores_iptu | object | Valores do imposto | (ver secao 2.3.6) | 1 | Alta | Em carnes de pagamento |
| uso_imovel | string | Uso do imovel | "RESIDENCIAL" | 1 | Alta | Sempre |
| data_emissao | date | Data de emissao do documento | "26/10/2023" | 1 | Alta | Sempre |

### 2.3 Objetos Nested

#### 2.3.1 endereco_imovel (object)

Objeto obrigatorio contendo o endereco completo do imovel tributado.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| endereco_imovel.logradouro | string | Nome da rua/avenida | "R FRANCISCO CRUZ" | Sim |
| endereco_imovel.numero | string | Numero do imovel | "515" | Sim |
| endereco_imovel.complemento | string | Complemento (apto, bloco) | "APTO 124 BL-B" | Nao |
| endereco_imovel.bairro | string | Bairro do imovel | "VILA MARIANA" | Nao |
| endereco_imovel.cep | string | CEP do imovel | "04117-902" | Sim |

**Notas**:
- O bairro frequentemente nao aparece de forma explicita no IPTU de Sao Paulo
- A cidade e o estado sao inferidos pelo orgao emissor (Prefeitura)
- O complemento pode conter informacoes de apartamento, bloco, andar

#### 2.3.2 endereco_notificacao (object)

Objeto opcional contendo o endereco para correspondencia, quando diferente do imovel.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| endereco_notificacao.logradouro | string | Nome da rua/avenida | "AV PAULISTA" | Nao |
| endereco_notificacao.numero | string | Numero | "1000" | Nao |
| endereco_notificacao.complemento | string | Complemento | "SALA 1001" | Nao |
| endereco_notificacao.bairro | string | Bairro | "BELA VISTA" | Nao |
| endereco_notificacao.cep | string | CEP | "01310-100" | Nao |

**Notas**:
- Frequentemente e igual ao endereco do imovel
- Importante para identificar correspondencia de contribuinte nao residente

#### 2.3.3 dados_terreno (object)

Objeto opcional contendo as caracteristicas cadastrais do terreno.

| Subcampo | Tipo | Unidade | Descricao | Exemplo | Obrigatorio |
|----------|------|---------|-----------|---------|-------------|
| dados_terreno.area | number | m2 | Area total do terreno | 1666.00 | Sim |
| dados_terreno.fracao_ideal | number | decimal | Fracao ideal do contribuinte | 0.0089 | Nao |
| dados_terreno.testada | number | m | Testada principal do terreno | 32.50 | Nao |

**Notas**:
- A `fracao_ideal` e fundamental para condominios (apartamentos)
- Pode haver subdivisao em "area incorporada" e "area nao incorporada"
- A `testada` e a medida de frente do terreno para a via publica

#### 2.3.4 dados_construcao (object)

Objeto opcional contendo as caracteristicas cadastrais da construcao.

| Subcampo | Tipo | Unidade | Descricao | Exemplo | Obrigatorio |
|----------|------|---------|-----------|---------|-------------|
| dados_construcao.area | number | m2 | Area construida | 112.00 | Sim |
| dados_construcao.tipo | string | - | Tipo de construcao | "APARTAMENTO" | Nao |
| dados_construcao.padrao | string | - | Padrao construtivo | "2-C" | Nao |
| dados_construcao.ano_construcao | number | ano | Ano da construcao | 1974 | Nao |

**Notas**:
- O `padrao` influencia diretamente o valor venal (A=alto, B=medio, C=baixo)
- O `tipo` pode ser: APARTAMENTO, CASA, BARRACAO, LOJA, SALA, etc.
- O `ano_construcao` pode ser "corrigido" (ajustado pela prefeitura)

#### 2.3.5 valores_m2 (object)

Objeto opcional contendo os valores de metro quadrado utilizados no calculo.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| valores_m2.terreno | number | Valor do m2 do terreno | 4275.00 | Nao |
| valores_m2.construcao | number | Valor do m2 da construcao | 3144.00 | Nao |

**Notas**:
- Valores definidos pela planta de valores genericos do municipio
- Variam conforme localizacao (bairro) e padrao construtivo

#### 2.3.6 valores_iptu (object)

Objeto opcional contendo os valores do imposto (presente em carnes de pagamento).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| valores_iptu.imposto | number | Valor do IPTU | 5000.00 | Nao |
| valores_iptu.taxa_lixo | number | Taxa de coleta de lixo | 500.00 | Nao |
| valores_iptu.taxa_bombeiros | number | Taxa de bombeiros (alguns municipios) | 0.00 | Nao |
| valores_iptu.total | number | Total a pagar | 5500.00 | Nao |
| valores_iptu.desconto | number | Desconto para pagamento a vista | 275.00 | Nao |
| valores_iptu.total_com_desconto | number | Total com desconto | 5225.00 | Nao |

**Notas**:
- A taxa de lixo e frequentemente cobrada junto com o IPTU
- O desconto para pagamento a vista e comum (geralmente 3% a 5%)
- Estes campos estao presentes principalmente em carnes, nao em certidoes

### 2.4 Arrays

#### 2.4.1 contribuintes (array)

Array obrigatorio contendo a lista de contribuintes (proprietarios ou responsaveis tributarios).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| contribuintes[].nome | string | Nome completo do contribuinte | "RODOLFO WOLFGANG ORTRIWANO" | Sim |
| contribuintes[].cpf | string | CPF do contribuinte | "585.096.668-49" | Nao |
| contribuintes[].cnpj | string | CNPJ se pessoa juridica | "01.588.805/0001-60" | Nao |

**Notas**:
- Um imovel pode ter multiplos contribuintes (co-proprietarios)
- O contribuinte pode ser PF (CPF) ou PJ (CNPJ)
- A ordem dos contribuintes pode indicar titularidade principal

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| contribuintes[].nome | NOME | Nome completo da pessoa | SIM |
| contribuintes[].cpf | CPF | Cadastro de Pessoa Fisica | SIM |

**Observacao**: O IPTU fornece dados basicos de identificacao (nome e CPF/CNPJ). Dados complementares como RG, profissao, estado civil e endereco domiciliar devem ser obtidos de outros documentos (RG, Certidao de Casamento, Comprovante de Residencia).

### 3.2 Campos que Alimentam "Dados do Imovel"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| cadastro_imovel | SQL | Cadastro Municipal (SQL) | SIM |
| endereco_imovel.logradouro | LOGRADOURO | Logradouro do imovel | SIM |
| endereco_imovel.numero | NUMERO | Numero do imovel | SIM |
| endereco_imovel.complemento | COMPLEMENTO | Complemento do imovel | SIM |
| endereco_imovel.bairro | BAIRRO | Bairro do imovel | SIM |
| (inferido) | CIDADE | Cidade do imovel | SIM |
| (inferido) | ESTADO | Estado do imovel | SIM |
| endereco_imovel.cep | CEP | CEP do imovel | SIM |
| dados_terreno.area | AREA TOTAL EM M2 | Area total em m2 | SIM |
| dados_construcao.area | AREA CONSTRUIDA EM M2 | Area construida em m2 | SIM |
| valor_venal_total | VALOR VENAL DO IPTU | Valor venal para IPTU | SIM |

**Observacoes**:
- A cidade e estado sao inferidos do orgao emissor ("Prefeitura de Sao Paulo" = Sao Paulo/SP)
- O `matricula_numero` NAO e fornecido pelo IPTU - deve ser obtido da Matricula ou CND

### 3.3 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao |
|-----------------|-------------------|
| ano_exercicio | Metadado do documento - usado apenas para validacao de vigencia |
| endereco_notificacao | Endereco de correspondencia - nao usado em minutas |
| dados_terreno.fracao_ideal | Dado tecnico - fracao ideal vem preferencialmente da matricula |
| dados_terreno.testada | Dado tecnico cadastral - nao usado em minutas |
| dados_construcao.tipo | Informativo - tipo de imovel vem da matricula |
| dados_construcao.padrao | Dado tecnico para calculo de imposto |
| dados_construcao.ano_construcao | Informativo - usado apenas internamente |
| valores_m2.* | Dados de calculo interno |
| valor_venal_terreno | Dado parcial - apenas total e utilizado |
| valor_venal_construcao | Dado parcial - apenas total e utilizado |
| valores_iptu.* | Dados de imposto - nao usados em minutas de escritura |
| uso_imovel | Informativo - tipo de uso vem da matricula |
| data_emissao | Metadado do documento |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "IPTU",
  "cadastro_imovel": "039.080.0244-3",
  "ano_exercicio": 2023,

  "endereco_imovel": {
    "logradouro": "R FRANCISCO CRUZ",
    "numero": "515",
    "complemento": "APTO 124 BL-B",
    "bairro": null,
    "cep": "04117-902"
  },

  "endereco_notificacao": {
    "logradouro": "R FRANCISCO CRUZ",
    "numero": "515",
    "complemento": "APTO 124 BL-B",
    "cep": "04117-902",
    "igual_ao_imovel": true
  },

  "contribuintes": [
    {
      "tipo": "juridica",
      "cnpj": "01.588.805/0001-60",
      "nome": "VERTICE ENGENHARIA E COMERCIO LTDA",
      "cpf": null
    },
    {
      "tipo": "fisica",
      "cpf": "585.096.668-49",
      "nome": "RODOLFO WOLFGANG ORTRIWANO",
      "cnpj": null
    }
  ],

  "dados_terreno": {
    "area_incorporada_m2": 1666,
    "area_nao_incorporada_m2": 0,
    "area": 1666,
    "testada": 32.50,
    "fracao_ideal": 0.0089
  },

  "dados_construcao": {
    "area": 112,
    "area_ocupada": 1332,
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

  "metadados_extracao": {
    "confianca_geral": "alta",
    "campos_ilegiveis": [],
    "validacoes_executadas": [
      "sql_formato_valido",
      "cpf_digito_verificador",
      "soma_valores_venais",
      "ano_exercicio_valido"
    ]
  }
}
```

**Fonte**: `.tmp/analise_subagentes/FC_515_124_p280509/001_IPTU_analise.json`

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cadastro_imovel (SQL) | VVR, CND_MUNICIPAL, CND_IMOVEL, ITBI, DADOS_CADASTRAIS, MATRICULA_IMOVEL | Identificador PRIMARIO do imovel no cadastro municipal |
| endereco_imovel | MATRICULA_IMOVEL, ITBI, COMPROMISSO, ESCRITURA, VVR, DADOS_CADASTRAIS | Validar localizacao do imovel |
| contribuintes[].cpf | RG, CNH, CPF, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL | Identificar proprietario/contribuinte |
| contribuintes[].nome | RG, MATRICULA_IMOVEL, COMPROMISSO, ESCRITURA | Validar nome do proprietario |
| valor_venal_total | VVR (diferente), ITBI (referencia) | Comparar valores venais |
| dados_construcao.area | MATRICULA_IMOVEL, COMPROMISSO, ESCRITURA, DADOS_CADASTRAIS | Validar area construida |

### 5.2 Redundancia Intencional

O IPTU e **fonte primaria** para os seguintes dados:

1. **Cadastro Municipal (SQL)**: Identificador unico do imovel na prefeitura
2. **Valor Venal para IPTU**: Base de calculo do imposto predial
3. **Dados Cadastrais do Terreno**: Area total, fracao ideal, testada
4. **Dados Cadastrais da Construcao**: Area construida, tipo, padrao, ano
5. **Contribuintes Registrados**: Proprietarios conforme cadastro municipal

**Validacoes Cruzadas Recomendadas**:

- **IPTU x MATRICULA**: SQL deve estar presente na matricula; areas devem ser compativeis
- **IPTU x VVR**: SQL deve ser identico; VVR e diferente do valor venal IPTU
- **IPTU x CND_MUNICIPAL**: SQL deve coincidir; contribuinte deve ser o mesmo
- **IPTU x ITBI**: SQL deve coincidir; valor venal IPTU pode diferir do VVR/base ITBI
- **IPTU x DADOS_CADASTRAIS**: Pode ser o mesmo documento (Certidao de Dados Cadastrais)
- **IPTU x COMPROMISSO/ESCRITURA**: Endereco e areas devem ser compativeis

### 5.3 Diferenca entre Valor Venal IPTU e VVR

| Aspecto | Valor Venal IPTU | Valor Venal de Referencia (VVR) |
|---------|------------------|--------------------------------|
| **Finalidade** | Base de calculo do IPTU anual | Base de calculo do ITBI |
| **Fonte** | Carne/Certidao de IPTU | Consulta VVR no portal da prefeitura |
| **Atualizacao** | Anual (exercicio fiscal) | Pode ser atualizado periodicamente |
| **Valor tipico** | Geralmente MENOR | Geralmente MAIOR (mais proximo do mercado) |
| **Usado em minutas** | imovel_valor_venal_iptu | imovel_valor_venal_referencia |

**Exemplo Real (mesmo imovel)**:
- Valor Venal IPTU (2023): R$ 234.191,00
- VVR (26/10/2023): R$ 301.147,00

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

As seguintes validacoes sao executadas automaticamente na extracao:

- [x] **sql_formato_valido**: Verifica se o SQL segue o padrao 000.000.0000-0
- [x] **cpf_digito_verificador**: Valida digito verificador de CPF dos contribuintes
- [x] **cnpj_digito_verificador**: Valida digito verificador de CNPJ dos contribuintes
- [x] **soma_valores_venais**: Verifica se terreno + construcao = total (quando ambos presentes)
- [x] **ano_exercicio_valido**: Verifica se o ano do exercicio e valido (atual ou recente)

### 6.2 Validacoes Adicionais Recomendadas

| Validacao | Formula | Resultado Esperado |
|-----------|---------|-------------------|
| Soma areas | area_terreno >= area_construida | Verdadeiro |
| Fracao ideal | 0 < fracao_ideal <= 1 | Verdadeiro |
| Valor venal positivo | valor_venal_total > 0 | Verdadeiro |
| Ano construcao coerente | ano_construcao <= ano_exercicio | Verdadeiro |
| CEP valido | CEP no formato 00000-000 | Verdadeiro |

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
| valor_venal_terreno | area_terreno x valor_m2_terreno x fracao_ideal |
| valor_venal_construcao | area_construida x valor_m2_construcao |

### 7.2 Campos Inferidos

| Campo | Regra de Inferencia |
|-------|---------------------|
| imovel_cidade | Extraido do nome do orgao emissor ("Prefeitura de Sao Paulo" = "Sao Paulo") |
| imovel_estado | Extraido do nome do orgao emissor ("Prefeitura de Sao Paulo" = "SP") |
| uso_imovel | Pode ser "RESIDENCIAL", "COMERCIAL", "INDUSTRIAL", "MISTO" ou "TERRENO" |

### 7.3 Campos Raros

| Campo | Quando Presente |
|-------|-----------------|
| dados_terreno.area_nao_incorporada | Imoveis com areas condominiais especiais |
| valores_iptu.taxa_bombeiros | Alguns municipios especificos |
| endereco_notificacao | Quando contribuinte reside em endereco diferente |

### 7.4 Expressoes Regulares

| Campo | Regex | Exemplo |
|-------|-------|---------|
| cadastro_imovel (SQL) | `\d{3}\.\d{3}\.\d{4}-\d` | "039.080.0244-3" |
| ano_exercicio | `\d{4}` | "2026" |
| valor_monetario | `R\$\s*[\d.,]+` | "R$ 234.191,00" |
| cep | `\d{5}-\d{3}` | "04117-902" |
| cpf | `\d{3}\.\d{3}\.\d{3}-\d{2}` | "585.096.668-49" |
| cnpj | `\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}` | "01.588.805/0001-60" |
| uso_imovel | `(RESIDENCIAL\|COMERCIAL\|INDUSTRIAL\|MISTO\|TERRENO)` | "RESIDENCIAL" |
| data (geral) | `\d{2}/\d{2}/\d{4}` | "26/10/2023" |

### 7.5 Diferenca entre IPTU e DADOS_CADASTRAIS

Na pratica, a "Certidao de Dados Cadastrais do Imovel" emitida pela Prefeitura pode ser classificada como:
- **IPTU**: Quando o foco e no lancamento do imposto e valores
- **DADOS_CADASTRAIS**: Quando o foco e nos dados fisicos do imovel

Ambos os tipos contem informacoes sobrepostas e podem ser utilizados de forma intercambiavel para fins de extracao de dados cadastrais do imovel.

---

## 8. REFERENCIAS

### 8.1 Arquivos do Sistema

| Tipo | Caminho |
|------|---------|
| Schema JSON | `execution/schemas/iptu.json` |
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
| pessoa_juridica | 0 |
| imovel | 11 campos (matricula_numero, imovel_sql, imovel_valor_venal_iptu, imovel_logradouro, imovel_numero, imovel_bairro, imovel_cidade, imovel_estado, imovel_cep, imovel_area_total, imovel_area_construida) |
| negocio | 0 |
| **Total** | **13 campos** |

---

## APENDICE: CHECKLIST DE CAMPOS CRITICOS

Antes de considerar uma extracao completa, verifique:

**Identificacao do Imovel**:
- [ ] cadastro_imovel (SQL) - CRITICO
- [ ] ano_exercicio

**Endereco**:
- [ ] endereco_imovel.logradouro
- [ ] endereco_imovel.numero
- [ ] endereco_imovel.complemento (se aplicavel)
- [ ] endereco_imovel.cep

**Contribuintes**:
- [ ] contribuintes[].nome (pelo menos 1)
- [ ] contribuintes[].cpf ou contribuintes[].cnpj

**Valores**:
- [ ] valor_venal_total - CRITICO

**Areas (se certidao detalhada)**:
- [ ] dados_terreno.area
- [ ] dados_construcao.area (se edificado)

**Caracteristicas (se certidao detalhada)**:
- [ ] dados_construcao.tipo
- [ ] uso_imovel

Se algum campo CRITICO nao foi encontrado:
1. Retornar null para o campo
2. Listar em metadados_extracao.campos_nao_encontrados
3. Mencionar na explicacao contextual
