# CND_IMOVEL - Certidao Negativa de Debitos do Imovel (Certidao de Onus)

**Complexidade de Extracao**: MEDIA
**Schema Fonte**: Nao possui schema dedicado (campos definidos em `mapeamento_documento_campos.json`)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A CND de Imovel (Certidao Negativa de Debitos do Imovel), tambem conhecida como **Certidao de Onus e Alienacoes** ou **Certidao Negativa de Onus Reais**, e uma certidao emitida pelo Cartorio de Registro de Imoveis que atesta a situacao juridica de um imovel especifico quanto a existencia ou inexistencia de:

- **Onus Reais**: Hipotecas, alienacoes fiduciarias, penhoras, arrestos, sequestros
- **Gravames**: Usufruto, servidoes, clausulas restritivas (inalienabilidade, impenhorabilidade, incomunicabilidade)
- **Acoes Judiciais**: Acoes reais ou reipersecutorias que possam afetar o imovel
- **Indisponibilidades**: Bloqueios judiciais registrados no CNIB (Central Nacional de Indisponibilidade de Bens)

**Diferenca entre CND_IMOVEL e MATRICULA_IMOVEL:**

| Documento | Conteudo | Uso Principal |
|-----------|----------|---------------|
| **MATRICULA_IMOVEL** | Inteiro teor da matricula com todo historico | Fonte primaria de dados completos do imovel |
| **CND_IMOVEL** | Resumo focado na situacao de onus atual | Verificacao rapida de existencia de gravames |

A CND de Imovel e fundamental em transacoes imobiliarias porque:
- Permite verificacao rapida da situacao juridica do imovel
- Confirma se o imovel esta livre e desembaracado ou possui restricoes
- E documento obrigatorio para lavratura de escrituras publicas
- Complementa (mas nao substitui) a certidao de matricula completa

### 1.2 Tipos de Certidao de Onus

Existem diferentes modalidades de certidao emitidas pelo Cartorio de Registro de Imoveis:

| Tipo | Sigla/Nome | Descricao | Periodo Coberto |
|------|------------|-----------|-----------------|
| **Certidao Negativa de Onus** | CND Onus | Atesta inexistencia de onus ativos | Data atual |
| **Certidao de Onus Atualizada** | Certidao Atualizada | Situacao atual de onus (positiva ou negativa) | Data atual |
| **Certidao Vintenaria de Onus** | Vintenaria | Historico de onus dos ultimos 20 anos | 20 anos |
| **Certidao Trintenaria de Onus** | Trintenaria | Historico de onus dos ultimos 30 anos | 30 anos |
| **Certidao de Inteiro Teor** | Matricula Completa | Toda a matricula desde abertura | Historico completo |

**Diferenca entre Certidao Atualizada e Vintenaria:**

- **Certidao Atualizada**: Mostra apenas a situacao ATUAL do imovel. Indica se ha onus ativos no momento da emissao. E mais rapida e economica.

- **Certidao Vintenaria**: Mostra o historico de onus dos ultimos 20 anos, incluindo onus ja cancelados. Permite verificar se houve gravames recentes que possam ter sido cancelados fraudulentamente ou se existem riscos ocultos. E mais completa e segura para transacoes de alto valor.

**Quando usar cada tipo:**

| Situacao | Certidao Recomendada |
|----------|---------------------|
| Compra de imovel residencial | Vintenaria (mais segura) |
| Refinanciamento bancario | Atualizada (banco pode exigir vintenaria) |
| Verificacao rapida pre-negociacao | Atualizada |
| Imovel com historico de disputas | Trintenaria ou Inteiro Teor |
| Usucapiao ou regularizacao | Trintenaria ou Inteiro Teor |

### 1.3 Padroes de Identificacao Visual

O sistema identifica documentos CND_IMOVEL atraves dos seguintes padroes textuais:

- `CERTIDAO DE MATRICULA`
- `CERTIDAO DE ONUS`
- `CERTIDAO NEGATIVA DE ONUS`
- `CERTIDAO NEGATIVA DE ONUS E ALIENACOES`
- `CERTIDAO DE ONUS REAIS`
- `CARTORIO DE REGISTRO DE IMOVEIS`
- `OFICIAL DE REGISTRO DE IMOVEIS`
- `LIVRE E DESEMBARACADO`
- `INEXISTEM ONUS`
- `VINTENARIA`

### 1.4 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **PDF Digital (ONR/SAEC)** | Emitida pelo sistema eletronico do ONR, com selo digital | Codigo de verificacao, selo digital, QR Code |
| **Certidao Fisica Digitalizada** | Certidao emitida em papel e escaneada | Carimbos, assinaturas manuscritas |
| **Certidao Resumida** | Apenas informa se ha onus ou nao | Situacao (livre/com onus), data |
| **Certidao Detalhada** | Lista cada onus individualmente | Array de onus com detalhes |

A CND de Imovel varia conforme o cartorio emissor. Cada Registro de Imoveis possui layout proprio, mas os campos essenciais (matricula, cartorio, situacao de onus, validade) sao comuns a todos.

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| numero_certidao | string | Numero da certidao | "2026/123456" | `[\d\/\.\-]+` | Alta |
| matricula_numero | string | Numero da matricula do imovel | "46.511" | `\d{1,6}\.?\d*` | Alta |
| cartorio | string | Nome/numero do Cartorio de RI | "1o Oficial de Registro de Imoveis de Sao Paulo" | - | Alta |
| situacao_onus | string | Situacao de onus do imovel | "LIVRE E DESEMBARACADO" ou "COM ONUS" | `(LIVRE\|DESEMBARACADO\|COM ONUS\|INEXISTEM)` | Alta |
| data_emissao | date | Data de emissao da certidao | "28/01/2026" | `\d{2}/\d{2}/\d{4}` | Alta |
| data_validade | date | Data de validade da certidao | "27/02/2026" | `\d{2}/\d{2}/\d{4}` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| tipo_certidao | string | Tipo da certidao de onus | "VINTENARIA" | Sempre indicado | Alta |
| periodo_abrangido | string | Periodo coberto pela certidao | "20 anos" ou "1984-2026" | Em certidoes vintenarias/trintenarias | Alta |
| contribuinte_municipal | string | SQL do imovel | "039.080.0244-3" | Quando disponivel | Alta |
| endereco_imovel | string | Endereco completo do imovel | "Rua Francisco Cruz, 515, Apto 124" | Sempre presente | Alta |
| proprietarios_atuais | array | Lista de proprietarios registrados | [...] | Em certidoes detalhadas | Media |
| onus_ativos | array | Lista de onus em vigor | [...] | Quando houver onus | Media |
| onus_cancelados | array | Lista de onus ja cancelados | [...] | Em certidoes vintenarias | Media |
| indisponibilidades | array | Bloqueios judiciais (CNIB) | [...] | Quando houver | Media |
| selo_digital | string | Selo digital do cartorio | "1114503C3000000119330423F" | Em certidoes digitais | Alta |
| codigo_verificacao | string | Codigo para validacao online | "ABC123XYZ" | Em certidoes digitais | Alta |
| escrevente | string | Nome do escrevente responsavel | "MARCIA HASSESIAN" | Na maioria | Media |
| oficial | string | Nome do oficial registrador | "Flauzilino Araujo dos Santos" | Na maioria | Media |

### 2.3 Arrays

#### 2.3.1 proprietarios_atuais (array)

Lista de proprietarios registrados na matricula no momento da emissao da certidao.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| proprietarios_atuais[].nome | string | Nome do proprietario | "ELIZETE APARECIDA SILVA" | Sim |
| proprietarios_atuais[].cpf | string | CPF do proprietario | "949.735.638-20" | Nao |
| proprietarios_atuais[].percentual | number | Percentual de propriedade | 50 | Nao |

**Notas:**
- Nem todas as certidoes de onus incluem dados detalhados dos proprietarios
- Em certidoes resumidas, pode constar apenas "conforme matricula"
- Para dados completos de proprietarios, utilizar MATRICULA_IMOVEL

#### 2.3.2 onus_ativos (array)

Lista de onus e gravames atualmente em vigor sobre o imovel.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| onus_ativos[].tipo | string | Tipo do onus | "ALIENACAO FIDUCIARIA" | Sim |
| onus_ativos[].registro | string | Numero do registro | "R-5/46.511" | Sim |
| onus_ativos[].data_constituicao | date | Data de constituicao | "15/06/2018" | Sim |
| onus_ativos[].credor | string | Nome do credor/beneficiario | "CAIXA ECONOMICA FEDERAL" | Nao |
| onus_ativos[].valor | number | Valor do onus | 300000.00 | Nao |
| onus_ativos[].descricao | string | Descricao do onus | "Alienacao fiduciaria em garantia..." | Nao |

**Tipos de Onus Comuns:**
- HIPOTECA
- ALIENACAO FIDUCIARIA
- PENHORA
- ARRESTO
- SEQUESTRO
- USUFRUTO
- SERVIDAO
- CLAUSULA DE INALIENABILIDADE
- CLAUSULA DE IMPENHORABILIDADE
- CLAUSULA DE INCOMUNICABILIDADE
- INDISPONIBILIDADE JUDICIAL

#### 2.3.3 onus_cancelados (array)

Lista de onus que foram cancelados (presente apenas em certidoes vintenarias/trintenarias).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| onus_cancelados[].tipo | string | Tipo do onus | "HIPOTECA" | Sim |
| onus_cancelados[].registro | string | Numero do registro original | "R-2/46.511" | Sim |
| onus_cancelados[].data_constituicao | date | Data de constituicao | "17/07/1984" | Sim |
| onus_cancelados[].averbacao_cancelamento | string | Averbacao de cancelamento | "AV-5/46.511" | Sim |
| onus_cancelados[].data_cancelamento | date | Data do cancelamento | "23/11/1990" | Sim |
| onus_cancelados[].motivo_cancelamento | string | Motivo do cancelamento | "Quitacao" | Nao |

#### 2.3.4 acoes_judiciais (array)

Acoes que podem afetar o imovel (acoes reais, reipersecutorias).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| acoes_judiciais[].tipo | string | Tipo da acao | "ACAO DE EXECUCAO" | Sim |
| acoes_judiciais[].numero_processo | string | Numero do processo | "0001234-56.2020.8.26.0100" | Nao |
| acoes_judiciais[].vara | string | Vara de origem | "2a Vara Civel de Sao Paulo" | Nao |
| acoes_judiciais[].status | string | Status da anotacao | "ATIVO" | Sim |

### 2.4 Objetos Nested

A CND de Imovel nao possui estrutura nested complexa alem dos arrays listados acima.

---

## 3. MAPEAMENTO SCHEMA --> MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

A CND de Imovel **nao alimenta** diretamente campos de Pessoa Natural.

Os dados de proprietarios presentes na certidao servem apenas para validacao e correlacao, nao sendo fonte primaria de dados pessoais. Para dados completos de pessoas, utilizar documentos como RG, CNH, CERTIDAO_CASAMENTO, etc.

### 3.2 Campos que Alimentam "Pessoa Juridica"

A CND de Imovel **nao alimenta** diretamente campos de Pessoa Juridica.

### 3.3 Campos que Alimentam "Dados do Imovel"

| Campo no Documento | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-------------------|---------------|-------------------|-------------------|
| contribuinte_municipal | SQL | Cadastro Municipal (SQL) | SIM |
| matricula_numero | NUMERO DA MATRICULA | Numero da matricula | SIM |
| endereco_imovel | LOGRADOURO | Logradouro do imovel | SIM |
| endereco_imovel | NUMERO | Numero do imovel | SIM |
| endereco_imovel | COMPLEMENTO | Complemento (apto, bloco) | SIM |
| endereco_imovel | BAIRRO | Bairro do imovel | SIM |
| endereco_imovel | CIDADE | Cidade do imovel | SIM |
| endereco_imovel | ESTADO | Estado do imovel | SIM |
| numero_certidao | NUMERO DA CERTIDAO | Referencia da CND na minuta | SIM |
| data_emissao | DATA DE EMISSAO | Data de emissao da certidao | SIM |
| (situacao_onus == "LIVRE") | VALIDADE | Certidao valida (sim/nao) | SIM |

**Observacao:** O endereco na CND de Imovel pode ser um campo unico que precisa ser parseado para extrair os componentes individuais.

### 3.4 Campos que Alimentam "Negocio Juridico"

A CND de Imovel **nao alimenta** diretamente campos de Negocio Juridico.

A certidao e usada para validacao da situacao do imovel, nao para composicao dos termos do negocio. Porem, e mencionada na escritura como parte das certidoes apresentadas e verificacoes realizadas.

### 3.5 Campos Nao Mapeados

| Campo no Documento | Motivo da Exclusao | Observacao |
|-------------------|-------------------|------------|
| data_validade | Usado para validacao, nao para minuta | Verifica se certidao esta vigente |
| selo_digital | Metadado de verificacao | Para validacao online apenas |
| codigo_verificacao | Metadado de verificacao | Para validacao online apenas |
| escrevente | Informativo | Nao utilizado em minutas |
| oficial | Informativo | Nao utilizado em minutas |
| onus_cancelados | Informativo | Historico para analise, nao para minuta |
| acoes_judiciais | Usado para analise de risco | Pode gerar alertas, mas nao vai para minuta |
| periodo_abrangido | Metadado do documento | Nao utilizado em minutas |
| tipo_certidao | Metadado do documento | Nao utilizado em minutas |

---

## 4. EXEMPLO DE EXTRACAO REAL

### 4.1 Certidao Negativa (Imovel Livre)

```json
{
  "tipo_documento": "CND_IMOVEL",
  "dados_catalogados": {
    "numero_certidao": "2026/123456",
    "tipo_certidao": "CERTIDAO DE ONUS ATUALIZADA",
    "matricula_numero": "46.511",
    "cartorio": "1o Oficial de Registro de Imoveis de Sao Paulo",
    "contribuinte_municipal": "039.080.0244-3",
    "endereco_imovel": "Rua Francisco Cruz, 515, Apto 124, Bloco B, Vila Mariana, Sao Paulo-SP",
    "situacao_onus": "LIVRE E DESEMBARACADO",
    "onus_ativos": [],
    "proprietarios_atuais": [
      {
        "nome": "ELIZETE APARECIDA SILVA",
        "cpf": "949.735.638-20",
        "percentual": 50
      },
      {
        "nome": "RODOLFO WOLFGANG ORTRIWANO",
        "cpf": "585.096.668-49",
        "percentual": 50
      }
    ],
    "data_emissao": "28/01/2026",
    "data_validade": "27/02/2026",
    "selo_digital": "1114503C3000000119330423F",
    "codigo_verificacao": "ABC123XYZ",
    "escrevente": "MARCIA HASSESIAN",
    "oficial": "Flauzilino Araujo dos Santos"
  },
  "confianca_extracao": {
    "geral": 0.95,
    "campos_alta_confianca": ["matricula_numero", "situacao_onus", "data_emissao", "data_validade"],
    "campos_media_confianca": ["proprietarios_atuais", "endereco_imovel"]
  },
  "validacoes": {
    "matricula_formato_valido": true,
    "sql_formato_valido": true,
    "certidao_vigente": true,
    "imovel_livre": true
  },
  "alertas": [
    {
      "gravidade": "INFO",
      "tipo": "IMOVEL_LIVRE",
      "mensagem": "Imovel esta livre e desembaracado. Nao constam onus ou gravames."
    }
  ]
}
```

### 4.2 Certidao Positiva (Imovel com Onus)

```json
{
  "tipo_documento": "CND_IMOVEL",
  "dados_catalogados": {
    "numero_certidao": "2026/789012",
    "tipo_certidao": "CERTIDAO DE ONUS ATUALIZADA",
    "matricula_numero": "98.765",
    "cartorio": "5o Oficial de Registro de Imoveis de Sao Paulo",
    "contribuinte_municipal": "045.123.0456-7",
    "endereco_imovel": "Avenida Paulista, 1000, Apto 1501, Bela Vista, Sao Paulo-SP",
    "situacao_onus": "COM ONUS",
    "onus_ativos": [
      {
        "tipo": "ALIENACAO FIDUCIARIA",
        "registro": "R-3/98.765",
        "data_constituicao": "15/06/2020",
        "credor": "CAIXA ECONOMICA FEDERAL",
        "valor": 450000.00,
        "descricao": "Alienacao fiduciaria em garantia de financiamento imobiliario, conforme contrato no 123456789"
      }
    ],
    "proprietarios_atuais": [
      {
        "nome": "JOAO CARLOS MENDES",
        "cpf": "123.456.789-00",
        "percentual": 100
      }
    ],
    "data_emissao": "28/01/2026",
    "data_validade": "27/02/2026",
    "selo_digital": "5514503C3000000298765432A"
  },
  "validacoes": {
    "matricula_formato_valido": true,
    "certidao_vigente": true,
    "imovel_livre": false
  },
  "alertas": [
    {
      "gravidade": "ALERTA",
      "tipo": "ONUS_ATIVO",
      "mensagem": "Imovel possui ALIENACAO FIDUCIARIA ativa em favor de CAIXA ECONOMICA FEDERAL. Necessario baixa do onus antes da escritura."
    }
  ]
}
```

### 4.3 Certidao Vintenaria (Com Historico)

```json
{
  "tipo_documento": "CND_IMOVEL",
  "dados_catalogados": {
    "numero_certidao": "2026/456789",
    "tipo_certidao": "CERTIDAO VINTENARIA DE ONUS",
    "periodo_abrangido": "28/01/2006 a 28/01/2026",
    "matricula_numero": "46.511",
    "cartorio": "1o Oficial de Registro de Imoveis de Sao Paulo",
    "situacao_onus": "LIVRE E DESEMBARACADO",
    "onus_ativos": [],
    "onus_cancelados": [
      {
        "tipo": "HIPOTECA",
        "registro": "R-2/46.511",
        "data_constituicao": "17/07/1984",
        "credor_original": "LUIZ CARLOS TEIXEIRA",
        "credor_final": "BANCO ITAU S/A",
        "valor_original": "Cr$ 15.000.000,00",
        "averbacao_cancelamento": "AV-5/46.511",
        "data_cancelamento": "23/11/1990",
        "motivo_cancelamento": "Quitacao dada pelo BANCO ITAU S/A"
      }
    ],
    "data_emissao": "28/01/2026",
    "data_validade": "27/02/2026"
  },
  "alertas": [
    {
      "gravidade": "INFO",
      "tipo": "IMOVEL_LIVRE",
      "mensagem": "Imovel livre. Ultima hipoteca cancelada em 23/11/1990 (ha mais de 35 anos)."
    }
  ]
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| matricula_numero | MATRICULA_IMOVEL, ITBI, IPTU, ESCRITURA, COMPROMISSO_COMPRA_VENDA, PROTOCOLO_ONR | Identificar mesmo imovel de forma univoca |
| contribuinte_municipal (SQL) | CND_MUNICIPAL, IPTU, VVR, ITBI, DADOS_CADASTRAIS | Correlacao pelo cadastro municipal |
| endereco_imovel | MATRICULA_IMOVEL, IPTU, ITBI, VVR, DADOS_CADASTRAIS, ESCRITURA | Validar endereco do imovel |

### 5.2 Correlacao com MATRICULA_IMOVEL

A CND_IMOVEL e a MATRICULA_IMOVEL sao documentos complementares:

| Aspecto | CND_IMOVEL | MATRICULA_IMOVEL |
|---------|------------|------------------|
| **Emissao** | Cartorio de RI | Cartorio de RI |
| **Conteudo** | Resumo de onus | Inteiro teor completo |
| **Historico** | Limitado (atualizada) ou 20-30 anos (vintenaria) | Completo desde abertura |
| **Campos** | Foco em onus e gravames | Todos os campos da matricula |
| **Uso** | Verificacao rapida de situacao | Fonte primaria de dados |
| **Correlacao** | `matricula_numero` deve ser identico | `matricula_numero` e a chave |

**Regra de Correlacao:**
- O campo `matricula_numero` da CND_IMOVEL deve corresponder exatamente ao `numero_matricula` da MATRICULA_IMOVEL
- Divergencias indicam documentos de imoveis diferentes ou erro de emissao

### 5.3 Redundancia Intencional

A CND de Imovel e correlacionada com outros documentos para garantir consistencia:

1. **MATRICULA_IMOVEL**: Matricula deve ser identica; onus devem corresponder
2. **ITBI**: Matricula deve coincidir; situacao de onus afeta a transacao
3. **CND_MUNICIPAL**: SQL deve coincidir (quando presente em ambos)
4. **ESCRITURA**: Matricula deve coincidir; certidao e mencionada como diligencia

### 5.4 Hierarquia de Fontes

Para dados do imovel:

1. **MATRICULA_IMOVEL** - Fonte primaria (inteiro teor)
2. **CND_IMOVEL** - Fonte de validacao de onus
3. **DADOS_CADASTRAIS** - Fonte secundaria para endereco fiscal
4. **IPTU** - Fonte complementar
5. **VVR** - Fonte de valor venal

A CND de Imovel e usada principalmente para **verificacao de onus**, nao como fonte primaria de dados cadastrais do imovel.

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| matricula_formato_valido | Verifica se matricula segue formato numerico | Estrutural |
| sql_formato_valido | Verifica se SQL segue padrao 000.000.0000-0 | Estrutural |
| data_validade_futura | Certidao deve estar dentro da validade | Logica |
| situacao_onus_valida | Status deve ser reconhecido (LIVRE, COM ONUS) | Logica |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Consequencia |
|-----------|-----------|--------------|
| situacao_onus = "LIVRE" | Imovel livre e desembaracado | Transacao pode prosseguir normalmente |
| situacao_onus = "COM ONUS" | Ha gravames ativos sobre o imovel | Analise obrigatoria; pode requerer baixa do onus |
| Matricula corresponde ao imovel | Certidao deve ser do imovel correto | Validacao obrigatoria |
| Certidao vigente na data da escritura | Data atual < data_validade | Certidao deve estar valida |
| Proprietario corresponde ao alienante | Proprietario registrado = vendedor | Validacao de legitimidade |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:

| Alerta | Gravidade | Descricao |
|--------|-----------|-----------|
| Certidao proxima do vencimento | ATENCAO | Menos de 10 dias de validade restante |
| Onus ativo detectado | ALERTA | Imovel possui gravames que podem impedir transacao |
| Indisponibilidade judicial | CRITICO | Bloqueio CNIB impede transacao |
| Matricula nao corresponde | ERRO | Certidao de imovel diferente do esperado |
| Proprietario divergente | ATENCAO | Proprietario registrado difere do alienante |

### 6.4 Tipos de Onus e Impacto na Transacao

| Tipo de Onus | Impacto | Acao Necessaria |
|--------------|---------|-----------------|
| **Hipoteca** | Impede venda sem anuencia do credor | Quitar ou obter carta de anuencia |
| **Alienacao Fiduciaria** | Impede venda sem baixa | Quitar financiamento e averbar baixa |
| **Penhora** | Impede venda | Resolver processo judicial |
| **Arresto/Sequestro** | Impede venda | Resolver processo judicial |
| **Usufruto** | Nao impede, mas transfere com restricao | Verificar extincao ou anuencia do usufrutuario |
| **Servidao** | Nao impede venda | Informar adquirente |
| **Clausulas Restritivas** | Pode impedir | Verificar prazo e condicoes |
| **Indisponibilidade CNIB** | Impede absolutamente | Resolver bloqueio judicial |

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo Computado | Formula/Logica | Observacao |
|-----------------|----------------|------------|
| imovel_livre | Se `onus_ativos.length == 0` e `indisponibilidades.length == 0` | Determina se imovel esta livre |
| validade_restante | `data_validade - data_atual` | Dias restantes de validade |
| certidao_vigente | `data_atual < data_validade` | Certidao ainda valida |

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| cartorio_numero | Extraido do nome do cartorio | "1o" extraido de "1o Oficial de Registro de Imoveis" |
| cartorio_cidade | Extraido do nome do cartorio | "Sao Paulo" extraido do nome completo |
| tipo_certidao | Inferido de palavras-chave | "VINTENARIA" se mencionar "20 anos" ou "vintenaria" |

### 7.3 Campos Raros

| Campo | Quando Presente |
|-------|-----------------|
| indisponibilidades | Apenas quando ha bloqueios CNIB |
| acoes_judiciais | Quando averbadas acoes reais |
| onus_cancelados | Em certidoes vintenarias/trintenarias |
| periodo_abrangido | Em certidoes vintenarias/trintenarias |

### 7.4 Validade

- A CND de Imovel tem validade variavel conforme o cartorio, geralmente **30 dias**
- Alguns cartorios emitem com validade de **60 dias** ou **90 dias**
- A validade e contada a partir da data de emissao
- Para escrituras, a certidao deve estar valida na data da lavratura
- Recomenda-se solicitar nova certidao se a validade estiver proxima do vencimento

### 7.5 Custos e Prazos

| Tipo de Certidao | Prazo Medio | Custo Aproximado (SP) |
|------------------|-------------|----------------------|
| Atualizada (balcao) | 1-3 dias uteis | R$ 80-120 |
| Atualizada (ONR) | Imediato a 24h | R$ 80-120 |
| Vintenaria | 3-7 dias uteis | R$ 150-250 |
| Trintenaria | 5-10 dias uteis | R$ 200-350 |

### 7.6 Emissao Online (ONR/SAEC)

A maioria dos cartorios de Registro de Imoveis esta conectada ao ONR (Operador Nacional do Registro) atraves do SAEC (Sistema de Atendimento Eletronico Compartilhado):

- **URL**: https://www.registrodeimoveis.org.br/
- Permite solicitacao de certidoes online
- Pagamento por boleto ou cartao
- Entrega digital em PDF com selo eletronico
- Codigo de verificacao para validacao online

### 7.7 Diferenca para CND_MUNICIPAL

| Aspecto | CND_IMOVEL | CND_MUNICIPAL |
|---------|------------|---------------|
| **Emissor** | Cartorio de Registro de Imoveis | Prefeitura Municipal |
| **Vinculacao** | Matricula do imovel | SQL (cadastro fiscal) |
| **Verifica** | Onus e gravames reais | Debitos de IPTU e taxas |
| **Impacto** | Restricoes juridicas sobre propriedade | Pendencias fiscais |
| **Obrigacao** | Propter rem (segue o imovel) | Propter rem (segue o imovel) |

Ambas sao necessarias para transacoes imobiliarias, mas verificam aspectos diferentes.

---

## 8. REFERENCIAS

- **Mapeamento de Campos**: `execution/mapeamento_documento_campos.json`
- **Guia de Campos Imovel**: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- **Documentacao MATRICULA_IMOVEL**: `documentacao-campos-extraiveis/campos-completos/MATRICULA_IMOVEL.md`
- **ONR (emissao online)**: https://www.registrodeimoveis.org.br/
- **CNIB (indisponibilidades)**: https://www.cnib.org.br/
- **Lei 6.015/1973**: Lei de Registros Publicos
- **Lei 9.514/1997**: Alienacao Fiduciaria de coisa imovel
- **Codigo Civil Art. 1.419-1.430**: Hipoteca
- **Codigo Civil Art. 1.225**: Direitos reais

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
