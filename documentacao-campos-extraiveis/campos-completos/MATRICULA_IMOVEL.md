# MATRICULA_IMOVEL - Certidao de Matricula do Registro de Imoveis

**Complexidade de Extracao**: MUITO_ALTA
**Schema Fonte**: `execution/schemas/matricula_imovel.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A Certidao de Matricula do Registro de Imoveis e o documento oficial que comprova a propriedade de um imovel no Brasil. Emitida pelo Cartorio de Registro de Imoveis competente, a matricula contem:

- **Descricao completa do imovel**: localizacao, areas, confrontacoes
- **Historico de propriedade (Cadeia Dominial)**: todos os proprietarios desde a abertura da matricula
- **Registros (R-1, R-2...)**: transmissoes de propriedade e constituicao de onus
- **Averbacoes (AV-1, AV-2...)**: cancelamentos, alteracoes de estado civil, retificacoes
- **Onus e gravames**: hipotecas, penhoras, alienacao fiduciaria, usufruto

Este e o documento MAIS COMPLEXO do sistema devido a sua estrutura hierarquica com multiplos arrays aninhados e a necessidade de interpretar a cadeia dominial cronologicamente.

### 1.2 Padroes de Identificacao Visual

Os seguintes termos indicam que o documento e uma Certidao de Matricula:

- MATRICULA
- REGISTRO DE IMOVEIS
- OFICIAL DE REGISTRO
- LIVRO 2
- CERTIDAO
- ONUS REAIS
- INTEIRO TEOR
- REGISTRO GERAL

### 1.3 Formatos Comuns

| Formato | Descricao | Caracteristicas |
|---------|-----------|-----------------|
| Certidao Digital | Emitida eletronicamente com selo digital | Contem codigo de verificacao, selo digital, URL de verificacao |
| Certidao Fisica | Emitida em papel com selos fisicos | Requer digitalizacao, pode ter carimbos |
| Inteiro Teor | Contem TODO o historico da matricula | R-X, AV-X completos desde a abertura |
| Onus Reais | Resumo focado em onus/gravames | Lista apenas onus ativos e cancelados |
| Negativa de Onus | Certifica ausencia de onus | Usada para imoveis livres |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex |
|-------|------|-----------|---------|-------|
| numero_matricula | string | Numero da matricula do imovel | "46.511" | `\d{1,6}` |
| cartorio | string | Nome do cartorio de registro de imoveis | "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO" | - |
| descricao_imovel | object | Descricao detalhada do imovel | {...} | - |
| endereco | object | Endereco completo do imovel | {...} | - |
| areas | object | Areas do imovel em metros quadrados | {...} | - |
| proprietarios | array | Lista de proprietarios atuais | [...] | - |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Regex |
|-------|------|-----------|---------|-----------------|-------|
| livro | string | Numero do livro (Livro 2 = Registro Geral) | "2" | Sempre | `\d+` |
| numero_ficha | string | Numero da ficha | "12345" | Formato novo | `\d+` |
| contribuinte_municipal | string | SQL - Setor Quadra Lote (cadastro municipal) | "039.080.0244-3" | Maioria (imoveis urbanos) | `\d{3}\.\d{3}\.\d{4}-\d` |
| fracao_ideal | number | Fracao ideal do terreno | 0.0125 | Condominios | `\d+[,.]\d+` |
| quota_parte | string | Quota parte em percentual ou fracao | "0,65228%" | Condominios | - |
| situacao_imovel | string | Situacao geral do imovel | "LIVRE" | Certidoes resumidas | `(LIVRE\|COM ONUS\|INDISPONIVEL)` |
| registros | array | Historico de registros (R.1, R.2, etc) | [...] | Certidoes inteiro teor | - |
| averbacoes | array | Lista de averbacoes (Av.1, Av.2, etc) | [...] | Certidoes inteiro teor | - |
| onus | array | Lista de onus e gravames | [...] | Quando houver onus | - |
| indisponibilidades | array | Indisponibilidades judiciais (CNIB) | [...] | Casos judiciais | - |
| metadados_certidao | object | Metadados da certidao | {...} | Sempre | - |

### 2.3 Objetos Nested

#### 2.3.1 descricao_imovel (object)

Descricao detalhada do imovel. Confianca esperada: MEDIA (nivel de extracao 3).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| descricao_imovel.tipo | string | Tipo do imovel | "APARTAMENTO" | Sim |
| descricao_imovel.numero | string | Numero da unidade | "124" | Nao |
| descricao_imovel.andar | string | Andar | "12" | Nao |
| descricao_imovel.edificio | string | Nome do edificio | "EDIFICIO SERRA DO MAR" | Nao |
| descricao_imovel.bloco | string | Bloco | "B" | Nao |
| descricao_imovel.torre | string | Torre | null | Nao |
| descricao_imovel.descricao_completa | string | Descricao completa conforme matricula | "Unidade autonoma no 124 no 12o andar..." | Sim |

**Valores aceitos para tipo:**
- APARTAMENTO
- CASA
- TERRENO
- LOJA
- SALA
- VAGA
- SOBRADO
- GALPAO
- FAZENDA
- SITIO
- CHACARA

#### 2.3.2 endereco (object)

Endereco completo do imovel. Confianca esperada: ALTA (nivel de extracao 2).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| endereco.logradouro | string | Logradouro | "Rua Francisco Cruz" | Sim |
| endereco.numero | string | Numero | "515" | Sim |
| endereco.complemento | string | Complemento | "Apto 124, Bloco B" | Nao |
| endereco.bairro | string | Bairro | "Vila Mariana" | Nao |
| endereco.subdistrito | string | Subdistrito | "9o subdistrito" | Nao |
| endereco.distrito | string | Distrito | null | Nao |
| endereco.municipio | string | Municipio | "Sao Paulo" | Sim |
| endereco.uf | string | Estado (sigla) | "SP" | Sim |
| endereco.cep | string | CEP | "04117-090" | Nao |

#### 2.3.3 areas (object)

Areas do imovel em metros quadrados. Confianca esperada: ALTA (nivel de extracao 2).

| Subcampo | Tipo | Descricao | Exemplo | Unidade | Obrigatorio |
|----------|------|-----------|---------|---------|-------------|
| areas.privativa | number | Area privativa | 70.83 | m2 | Nao |
| areas.util | number | Area util | 70.83 | m2 | Nao |
| areas.comum | number | Area comum | 12.66 | m2 | Nao |
| areas.total | number | Area total | 83.49 | m2 | Sim |
| areas.terreno | number | Area do terreno | 150.00 | m2 | Nao |
| areas.construida | number | Area construida | 83.49 | m2 | Nao |

**Notas:**
- Em apartamentos, geralmente temos privativa + comum = total
- Em casas/terrenos, temos area de terreno e area construida
- Em condominios, a area util pode ser igual a privativa

#### 2.3.4 metadados_certidao (object)

Metadados da certidao emitida. Confianca esperada: ALTA (nivel de extracao 1).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| metadados_certidao.tipo_certidao | string | Tipo da certidao | "INTEIRO TEOR" | Nao |
| metadados_certidao.data_emissao | date | Data de emissao | "14/11/2023" | Sim |
| metadados_certidao.data_validade | date | Data de validade | "14/12/2023" | Nao |
| metadados_certidao.validade_dias | number | Dias de validade | 30 | Nao |
| metadados_certidao.selo_digital | string | Selo digital | "1114503C3000000119330423F" | Nao |
| metadados_certidao.codigo_verificacao | string | Codigo de verificacao | "ABC123XYZ" | Nao |
| metadados_certidao.escrevente | string | Nome do escrevente | "MARCIA HASSESIAN" | Nao |
| metadados_certidao.oficial | string | Nome do oficial | "Flauzilino Araujo dos Santos" | Nao |

**Valores aceitos para tipo_certidao:**
- INTEIRO TEOR
- ONUS REAIS
- NEGATIVA

### 2.4 Arrays

#### 2.4.1 proprietarios (array)

Lista de proprietarios atuais do imovel. Confianca esperada: MEDIA (nivel de extracao 3).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| proprietarios[].nome | string | Nome completo | "ELIZETE APARECIDA SILVA" | Sim |
| proprietarios[].nacionalidade | string | Nacionalidade | "brasileira" | Nao |
| proprietarios[].estado_civil | string | Estado civil | "solteira" | Nao |
| proprietarios[].regime_bens | string | Regime de bens (se casado) | "comunhao parcial de bens" | Nao |
| proprietarios[].profissao | string | Profissao | "bancaria" | Nao |
| proprietarios[].rg | string | Numero do RG | "7.878.936-SP" | Nao |
| proprietarios[].cpf | string | Numero do CPF | "949.735.638-20" | Sim |
| proprietarios[].endereco | string | Endereco do proprietario | "Rua das Flores, 100" | Nao |
| proprietarios[].percentual | number | Percentual de propriedade | 50 | Nao |
| proprietarios[].conjuge | object | Dados do conjuge | {...} | Nao |

**Estrutura do conjuge:**

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| proprietarios[].conjuge.nome | string | Nome do conjuge | "JOAO DA SILVA" |
| proprietarios[].conjuge.rg | string | RG do conjuge | "12.345.678-9" |
| proprietarios[].conjuge.cpf | string | CPF do conjuge | "123.456.789-00" |
| proprietarios[].conjuge.profissao | string | Profissao do conjuge | "empresario" |

#### 2.4.2 registros (array)

Historico de registros (R.1, R.2, etc). Confianca esperada: MEDIA (nivel de extracao 3).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| registros[].numero | string | Numero do registro | "R-1/46.511" | Sim |
| registros[].tipo_ato | string | Tipo do ato | "TRANSMISSAO_VENDA" | Sim |
| registros[].data | date | Data do registro | "17/07/1984" | Sim |
| registros[].valor | number | Valor da transacao | 22000000.00 | Nao |
| registros[].transmitentes | array | Lista de transmitentes | [...] | Nao |
| registros[].adquirentes | array | Lista de adquirentes | [...] | Nao |
| registros[].texto_completo | string | Texto integral do registro | "..." | Nao |

**Tipos de ato (tipo_ato):**
- TRANSMISSAO_VENDA - Venda comum
- TRANSMISSAO_DOACAO - Doacao
- TRANSMISSAO_HERANCA - Heranca/inventario
- TRANSMISSAO_PERMUTA - Troca de imoveis
- TRANSMISSAO_DACAO - Dacao em pagamento
- CONSTITUICAO_HIPOTECA - Hipoteca
- CONSTITUICAO_ALIENACAO_FIDUCIARIA - Alienacao fiduciaria
- CONSTITUICAO_PENHORA - Penhora judicial
- CONSTITUICAO_USUFRUTO - Usufruto
- CONSTITUICAO_SERVIDAO - Servidao

#### 2.4.3 averbacoes (array)

Lista de averbacoes (Av.1, Av.2, etc). Confianca esperada: MEDIA (nivel de extracao 3).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| averbacoes[].numero | string | Numero da averbacao | "AV-5/46.511" | Sim |
| averbacoes[].tipo | string | Tipo da averbacao | "CANCELAMENTO_HIPOTECA" | Sim |
| averbacoes[].data | date | Data da averbacao | "23/11/1990" | Sim |
| averbacoes[].texto_completo | string | Texto integral | "..." | Nao |

**Tipos de averbacao:**
- CANCELAMENTO_HIPOTECA
- CANCELAMENTO_PENHORA
- CANCELAMENTO_ALIENACAO_FIDUCIARIA
- CANCELAMENTO_USUFRUTO
- ALTERACAO_ESTADO_CIVIL
- ALTERACAO_DENOMINACAO_SOCIAL
- CESSAO_DIREITOS_CREDITORIOS
- RETIFICACAO_AREA
- RETIFICACAO_NOME
- CONSTRUCAO
- DEMOLICAO

#### 2.4.4 onus (array)

Lista de onus e gravames. Confianca esperada: MEDIA (nivel de extracao 3).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| onus[].tipo | string | Tipo do onus | "HIPOTECA" | Sim |
| onus[].credor | string | Nome do credor | "BANCO ITAU S/A" | Nao |
| onus[].devedor | string | Nome do devedor | "ELIZETE APARECIDA SILVA" | Nao |
| onus[].valor | number | Valor do onus | 15000000.00 | Nao |
| onus[].data_constituicao | date | Data de constituicao | "17/07/1984" | Sim |
| onus[].data_cancelamento | date | Data de cancelamento | "23/11/1990" | Nao |
| onus[].status | string | Status (ATIVO, CANCELADO) | "CANCELADO" | Sim |

**Tipos de onus:**
- HIPOTECA
- ALIENACAO_FIDUCIARIA
- PENHORA
- USUFRUTO
- SERVIDAO
- CLAUSULA_RESTRITIVA
- INDISPONIBILIDADE
- ARRESTO
- SEQUESTRO

#### 2.4.5 indisponibilidades (array)

Indisponibilidades judiciais registradas no CNIB (Central Nacional de Indisponibilidade de Bens).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| indisponibilidades[].numero | string | Numero do registro | "IND-1/46.511" | Sim |
| indisponibilidades[].data | date | Data da indisponibilidade | "15/03/2020" | Sim |
| indisponibilidades[].juizo | string | Juizo de origem | "2a Vara Civel de Sao Paulo" | Nao |
| indisponibilidades[].processo | string | Numero do processo | "0001234-56.2020.8.26.0100" | Nao |
| indisponibilidades[].status | string | Status | "ATIVO" | Sim |

---

## 3. MAPEAMENTO SCHEMA --> MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Observacao |
|-----------------|---------------|-------------------|------------|
| proprietarios[].nome | nome | SIM | Nome completo do proprietario |
| proprietarios[].cpf | cpf | SIM | CPF do proprietario |
| proprietarios[].rg | rg | SIM | Numero do RG |
| proprietarios[].rg (inferido) | orgao_emissor_rg | SIM | Inferido do formato (ex: "-SP" = SSP-SP) |
| proprietarios[].rg (inferido) | estado_emissor_rg | SIM | Inferido do formato |
| proprietarios[].estado_civil | estado_civil | SIM | Estado civil |
| proprietarios[].regime_bens | regime_bens | SIM | Se casado |
| proprietarios[].profissao | profissao | SIM | Profissao declarada |
| proprietarios[].nacionalidade | nacionalidade | SIM | Nacionalidade |
| proprietarios[].conjuge.nome | (dados do conjuge) | SIM | Nome do conjuge |
| proprietarios[].conjuge.cpf | (dados do conjuge) | SIM | CPF do conjuge |
| proprietarios[].conjuge.rg | (dados do conjuge) | SIM | RG do conjuge |

### 3.2 Campos que Alimentam "Pessoa Juridica"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Observacao |
|-----------------|---------------|-------------------|------------|
| proprietarios[].nome (se PJ) | pj_denominacao | SIM | Razao social |
| proprietarios[].cpf (se CNPJ) | pj_cnpj | SIM | CNPJ da empresa |

### 3.3 Campos que Alimentam "Dados do Imovel"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Observacao |
|-----------------|---------------|-------------------|------------|
| numero_matricula | matricula_numero | SIM | Numero principal da matricula |
| cartorio | matricula_cartorio_numero | SIM | Identificacao do cartorio |
| endereco.municipio | matricula_cartorio_cidade | SIM | Cidade do cartorio |
| endereco.uf | matricula_cartorio_estado | SIM | Estado do cartorio |
| (numero nacional) | matricula_numero_nacional | SIM | Quando disponivel |
| descricao_imovel.tipo | imovel_denominacao | SIM | Tipo do imovel |
| contribuinte_municipal | imovel_sql | SIM | SQL - Setor Quadra Lote |
| areas.total | imovel_area_total | SIM | Area total em m2 |
| areas.privativa | imovel_area_privativa | SIM | Area privativa em m2 |
| areas.construida | imovel_area_construida | SIM | Area construida em m2 |
| endereco.logradouro | imovel_logradouro | SIM | Logradouro do imovel |
| endereco.numero | imovel_numero | SIM | Numero do imovel |
| endereco.complemento | imovel_complemento | SIM | Complemento |
| endereco.bairro | imovel_bairro | SIM | Bairro |
| endereco.municipio | imovel_cidade | SIM | Cidade do imovel |
| endereco.uf | imovel_estado | SIM | Estado do imovel |
| endereco.cep | imovel_cep | SIM | CEP |
| descricao_imovel.descricao_completa | imovel_descricao_conforme_matricula | SIM | Descricao literal |
| metadados_certidao.selo_digital | imovel_certidao_matricula_numero | SIM | Numero/selo da certidao |
| metadados_certidao.data_emissao | imovel_certidao_matricula_data | SIM | Data de emissao |
| proprietarios[].nome | proprietario_nome | SIM | Nome do proprietario |
| proprietarios[].percentual | proprietario_fracao_ideal | SIM | Percentual de propriedade |
| registros[].numero | proprietario_registro_aquisicao | SIM | Ex: R-1/46.511 |
| registros[].data | proprietario_data_registro | SIM | Data do registro |
| registros[].tipo_ato | proprietario_titulo_aquisicao | SIM | Tipo de aquisicao |
| onus[].tipo | onus_titulo | SIM | Tipo do onus |
| onus[].registro | onus_registro | SIM | Numero do registro |
| onus[].data_constituicao | onus_data_registro | SIM | Data de constituicao |
| onus[].texto_completo | onus_descricao | SIM | Descricao completa |
| onus[].credor | onus_titular_nome | SIM | Nome do credor |
| (fracao do onus) | onus_titular_fracao | SIM | Fracao do onus |
| (existencia ressalva) | ressalva_existencia | SIM | Sim/Nao |
| (descricao ressalva) | ressalva_descricao | SIM | Texto da ressalva |

### 3.4 Campos que Alimentam "Negocio Juridico"

Nenhum campo da matricula alimenta diretamente o negocio juridico. Os dados do negocio vem de outros documentos como:
- COMPROMISSO_COMPRA_VENDA
- ESCRITURA
- ITBI
- COMPROVANTE_PAGAMENTO

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao |
|-----------------|-------------------|
| livro | Metadado interno do cartorio |
| numero_ficha | Metadado interno do cartorio |
| quota_parte | Redundante com fracao_ideal |
| metadados_certidao.codigo_verificacao | Metadado de verificacao apenas |
| metadados_certidao.escrevente | Metadado interno |
| metadados_certidao.oficial | Metadado interno |
| indisponibilidades | Nao processado atualmente |
| registros[].transmitentes | Usado apenas para cadeia dominial historica |
| registros[].adquirentes | Usado apenas para cadeia dominial historica |
| averbacoes[].texto_completo | Texto auxiliar |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "MATRICULA_IMOVEL",
  "numero_matricula": "46.511",
  "livro": "2 - REGISTRO GERAL",
  "ficha": "1",
  "cartorio": "1o Cartorio de Registro de Imoveis de Sao Paulo",
  "data_abertura_matricula": "17/07/1984",
  "imovel": {
    "tipo_unidade": "apartamento",
    "descricao_completa": "Unidade autonoma no 124 no 12o andar do Edificio Serra do Mar, Bloco B",
    "endereco": {
      "logradouro": "Rua Francisco Cruz",
      "numero": "515",
      "complemento": "Apto 124, Bloco B",
      "edificio": "Edificio Serra do Mar",
      "bairro": "Vila Mariana",
      "subdistrito": "9o subdistrito",
      "cidade": "Sao Paulo",
      "uf": "SP",
      "cep": null
    },
    "sql": "039.080.0244-3",
    "area_util_m2": 70.83,
    "area_comum_m2": 12.66,
    "area_total_m2": 83.49,
    "fracao_ideal": "0,65228%"
  },
  "proprietarios_atuais": [
    {
      "nome": "ELIZETE APARECIDA SILVA",
      "cpf": "949.735.638-20",
      "rg": "7.878.936-SP",
      "nacionalidade": "brasileira",
      "profissao": "bancaria",
      "estado_civil": "solteira",
      "fracao": {
        "valor": 0.5,
        "tipo": "presumida",
        "observacao": "Documento nao especifica divisao percentual"
      },
      "registro_aquisicao": "R-1/46.511",
      "data_aquisicao": "17/07/1984"
    },
    {
      "nome": "RODOLFO WOLFGANG ORTRIWANO",
      "cpf": "585.096.668-49",
      "rg": "6.075.352-SP",
      "nacionalidade": "brasileiro",
      "profissao": "jornalista",
      "estado_civil": "separado judicialmente",
      "fracao": {
        "valor": 0.5,
        "tipo": "presumida",
        "observacao": "Documento nao especifica divisao percentual"
      },
      "registro_aquisicao": "R-1/46.511",
      "data_aquisicao": "17/07/1984"
    }
  ],
  "registros_averbacoes": [
    {
      "numero": "R-1/46.511",
      "tipo": "TRANSMISSAO_VENDA",
      "data": "17/07/1984",
      "resumo": "Venda de LUIZ CARLOS TEIXEIRA e esposa para ELIZETE APARECIDA SILVA e RODOLFO WOLFGANG ORTRIWANO"
    },
    {
      "numero": "R-2/46.511",
      "tipo": "CONSTITUICAO_HIPOTECA",
      "data": "17/07/1984",
      "resumo": "Hipoteca de Cr$ 15.000.000,00 em favor dos vendedores",
      "status_atual": "CANCELADO por AV-5"
    },
    {
      "numero": "AV-3/46.511",
      "tipo": "CESSAO_DIREITOS_CREDITORIOS",
      "data": "17/07/1984",
      "resumo": "Cessao dos direitos do R-2 para ITAU S/A CREDITO IMOBILIARIO"
    },
    {
      "numero": "AV-4/46.511",
      "tipo": "ALTERACAO_DENOMINACAO_SOCIAL",
      "data": "23/11/1990",
      "resumo": "ITAU S/A CREDITO IMOBILIARIO passa a se chamar BANCO ITAU S/A"
    },
    {
      "numero": "AV-5/46.511",
      "tipo": "CANCELAMENTO_HIPOTECA",
      "data": "23/11/1990",
      "resumo": "Hipoteca do R-2 CANCELADA por quitacao dada pelo BANCO ITAU S/A"
    }
  ],
  "onus_ativos": [],
  "onus_historicos": [
    {
      "tipo": "HIPOTECA",
      "registro": "R-2/46.511",
      "data_constituicao": "17/07/1984",
      "valor_original": {
        "moeda": "Cr$",
        "valor": "15.000.000,00"
      },
      "credores": ["LUIZ CARLOS TEIXEIRA", "NILCE APARECIDA POLITO TEIXEIRA"],
      "credor_final": "BANCO ITAU S/A",
      "devedores": ["ELIZETE APARECIDA SILVA", "RODOLFO WOLFGANG ORTRIWANO"],
      "status": "CANCELADO",
      "averbacao_cancelamento": "AV-5/46.511",
      "data_cancelamento": "23/11/1990",
      "motivo_cancelamento": "Quitacao dada pelo BANCO ITAU S/A"
    }
  ],
  "certidao_metadata": {
    "tipo": "CERTIDAO_DIGITAL",
    "data_emissao": "14/11/2023",
    "hora_emissao": "14:46:06",
    "oficial": "Flauzilino Araujo dos Santos",
    "escrevente": "MARCIA HASSESIAN",
    "selo_digital": "1114503C3000000119330423F",
    "validade_para_escrituras_dias": 30
  },
  "alertas": [
    {
      "gravidade": "INFO",
      "tipo": "IMOVEL_LIVRE",
      "mensagem": "Imovel esta livre e desembaracado. Ultima hipoteca cancelada em 23/11/1990."
    }
  ]
}
```

**Fonte**: `.tmp/contextual/FC_515_124_p280509/015_MATRICULA_IMOVEL.json`

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| numero_matricula | ITBI, VVR, IPTU, ESCRITURA, COMPROMISSO_COMPRA_VENDA, DADOS_CADASTRAIS, PROTOCOLO_ONR, CND_IMOVEL | Identificar mesmo imovel |
| contribuinte_municipal (SQL) | ITBI, VVR, IPTU, CND_MUNICIPAL, DADOS_CADASTRAIS, CND_IMOVEL | Identificar mesmo imovel |
| proprietarios[].cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL, COMPROMISSO_COMPRA_VENDA, ESCRITURA | Identificar mesma pessoa |
| proprietarios[].nome | Todos os documentos com pessoa | Correlacionar pessoas |
| endereco | IPTU, VVR, ITBI, COMPROMISSO_COMPRA_VENDA, ESCRITURA, DADOS_CADASTRAIS | Validar endereco |

### 5.2 Redundancia Intencional

A matricula e a **fonte primaria de verdade** para dados do imovel. Outros documentos (ITBI, IPTU, VVR) podem ter os mesmos campos extraidos para permitir:

1. **Validacao cruzada**: Verificar se os dados do imovel estao consistentes entre documentos
2. **Preenchimento alternativo**: Quando a matricula nao esta disponivel, outros documentos podem fornecer os dados
3. **Deteccao de inconsistencias**: Alertar quando dados divergem entre documentos

### 5.3 Prioridade de Fontes

Para dados do imovel, a prioridade de fontes e:

1. **MATRICULA_IMOVEL** (fonte primaria)
2. **DADOS_CADASTRAIS** (fonte secundaria)
3. **IPTU** (fonte terciaria)
4. **VVR** (fonte complementar)
5. **ITBI** (fonte complementar)

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Implementada |
|-----------|-----------|--------------|
| numero_matricula_valido | Formato correto (digitos, pontos) | Sim |
| sql_formato_valido | SQL no padrao XXX.XXX.XXXX-X | Sim |
| cpf_digito_verificador | CPF dos proprietarios com digito valido | Sim |
| areas_consistentes | Areas fazem sentido (privativa + comum = total) | Sim |
| soma_percentuais_proprietarios_100 | Percentuais dos proprietarios somam 100% | Sim |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Quando Aplicavel |
|-----------|-----------|------------------|
| certidao_valida | Certidao dentro do prazo de validade | Sempre |
| onus_ativos_alerta | Alerta se houver onus ativos | Sempre |
| indisponibilidade_bloqueio | Bloqueio se houver indisponibilidade CNIB | Sempre |
| cadeia_dominial_completa | Verifica se ha lacunas na cadeia | Inteiro teor |

### 6.3 Campos de Qualidade

| Campo | Tipo | Descricao |
|-------|------|-----------|
| campos_legiveis | array | Campos extraidos com alta confianca |
| campos_ilegiveis | array | Campos com baixa confianca ou nao extraidos |
| confianca_extracao | number | Percentual geral de confianca (0-100) |

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo Computado | Formula/Logica | Observacao |
|-----------------|----------------|------------|
| situacao_imovel | Se `onus_ativos.length == 0` entao "LIVRE", senao "COM ONUS" | Calculado a partir dos onus |
| proprietario_fracao_ideal | `100 / numero_proprietarios` se nao especificado | Divisao igual presumida |
| certidao_valida | `data_emissao + validade_dias > hoje` | Calculo de validade |

### 7.2 Campos Inferidos

| Campo Inferido | Origem | Logica de Inferencia |
|----------------|--------|---------------------|
| orgao_emissor_rg | RG | Sufixo "-SP" indica SSP-SP, "-SSP" indica SSP, etc. |
| estado_emissor_rg | RG | Extraido do sufixo do RG |
| regime_bens | Estado civil + data casamento | Se casado antes de 1977, comunhao universal |

### 7.3 Campos Raros

| Campo | Frequencia | Quando Aparece |
|-------|------------|----------------|
| indisponibilidades | Raro | Bloqueios judiciais, CNIB |
| torre | Raro | Apenas em edificios com multiplas torres |
| quota_parte | Medio | Formato alternativo da fracao ideal |
| subdistrito | Comum em SP | Nomenclatura antiga de Sao Paulo |

### 7.4 Moedas Historicas

O Brasil teve varias moedas ao longo do tempo. Valores historicos devem ser mantidos na moeda original:

| Simbolo | Moeda | Periodo |
|---------|-------|---------|
| Cr$ | Cruzeiros | ate 1986 |
| Cz$ | Cruzados | 1986-1989 |
| NCz$ | Cruzados Novos | 1989-1990 |
| Cr$ | Cruzeiros (novamente) | 1990-1993 |
| CR$ | Cruzeiros Reais | 1993-1994 |
| R$ | Reais | 1994-atual |

---

## 8. ESTRUTURA HIERARQUICA

```
MATRICULA_IMOVEL
|
+-- Identificacao
|   +-- numero_matricula
|   +-- livro
|   +-- numero_ficha
|   +-- cartorio
|
+-- descricao_imovel (object)
|   +-- tipo
|   +-- numero
|   +-- andar
|   +-- edificio
|   +-- bloco
|   +-- torre
|   +-- descricao_completa
|
+-- endereco (object)
|   +-- logradouro
|   +-- numero
|   +-- complemento
|   +-- bairro
|   +-- subdistrito
|   +-- distrito
|   +-- municipio
|   +-- uf
|   +-- cep
|
+-- areas (object)
|   +-- privativa
|   +-- util
|   +-- comum
|   +-- total
|   +-- terreno
|   +-- construida
|
+-- Cadastro
|   +-- contribuinte_municipal (SQL)
|   +-- fracao_ideal
|   +-- quota_parte
|
+-- proprietarios [N] (array)
|   +-- Proprietario 1
|   |   +-- nome
|   |   +-- cpf
|   |   +-- rg
|   |   +-- nacionalidade
|   |   +-- profissao
|   |   +-- estado_civil
|   |   +-- regime_bens
|   |   +-- percentual
|   |   +-- conjuge (object)
|   +-- Proprietario 2
|   +-- ...
|
+-- registros [N] (array)
|   +-- Registro R-1
|   |   +-- numero
|   |   +-- tipo_ato
|   |   +-- data
|   |   +-- valor
|   |   +-- transmitentes [N]
|   |   +-- adquirentes [N]
|   |   +-- texto_completo
|   +-- Registro R-2
|   +-- ...
|
+-- averbacoes [N] (array)
|   +-- Averbacao AV-1
|   |   +-- numero
|   |   +-- tipo
|   |   +-- data
|   |   +-- texto_completo
|   +-- Averbacao AV-2
|   +-- ...
|
+-- onus [N] (array)
|   +-- Onus 1
|   |   +-- tipo
|   |   +-- credor
|   |   +-- devedor
|   |   +-- valor
|   |   +-- data_constituicao
|   |   +-- data_cancelamento
|   |   +-- status
|   +-- Onus 2
|   +-- ...
|
+-- indisponibilidades [N] (array)
|   +-- Indisponibilidade 1
|   +-- ...
|
+-- metadados_certidao (object)
|   +-- tipo_certidao
|   +-- data_emissao
|   +-- data_validade
|   +-- validade_dias
|   +-- selo_digital
|   +-- codigo_verificacao
|   +-- escrevente
|   +-- oficial
|
+-- situacao_imovel
```

---

## 9. REFERENCIAS

- **Schema JSON**: `execution/schemas/matricula_imovel.json`
- **Prompt de Extracao**: `execution/prompts/matricula_imovel.txt`
- **Prompt Compacto**: `execution/prompts/matricula_imovel_compact.txt`
- **Guia de Campos**: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`

---

## 10. CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
