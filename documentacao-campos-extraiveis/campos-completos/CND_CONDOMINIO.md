# CND_CONDOMINIO - Declaracao de Quitacao de Debitos Condominiais

**Complexidade de Extracao**: MUITO BAIXA
**Schema Fonte**: Nao possui schema dedicado (campos definidos em `mapeamento_documento_campos.json`)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A CND de Condominio (Declaracao de Quitacao de Debitos Condominiais) e um documento emitido pelo sindico ou pela administradora do condominio que atesta a inexistencia de debitos de taxas condominiais referentes a uma unidade especifica. O documento comprova que o proprietario esta em dia com as obrigacoes condominiais, incluindo taxa ordinaria, fundo de reserva, rateios extraordinarios e quaisquer outras despesas condominiais.

Este documento e **obrigatorio** para a lavratura de escrituras publicas de compra e venda de unidades em condominio, conforme estabelecido pela **Lei 4.591/64** (Lei de Condominio e Incorporacoes). A Lei determina que na alienacao de unidade autonoma em edificio ou conjunto de edificios, o adquirente nao pode ser responsabilizado por debitos do alienante, desde que exija e obtenha a declaracao de quitacao.

**Base Legal:**
- **Lei 4.591/64, Art. 4o, Paragrafo unico**: "A alienacao ou oneração dos direitos do incorporador sobre as coisas ou terrenos de seu domínio, bem como de sua quota de construção, dependerá sempre de prévia comunicação ao representante do grupo de adquirentes."
- **Lei 4.591/64, Art. 22, paragrafo 1o**: O sindico deve fornecer certidao de quitacao quando solicitado.
- **Codigo Civil, Art. 1.345**: "O adquirente de unidade responde pelos debitos do alienante, em relacao ao condominio, inclusive multas e juros moratórios."

**Importancia na Transacao Imobiliaria:**
- Protege o comprador de assumir dividas condominiais do vendedor
- E documento obrigatorio para lavratura de escritura de compra e venda de apartamentos
- Comprova a regularidade do vendedor perante o condominio
- Debitos condominiais acompanham a unidade (obrigacao propter rem)

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos CND_CONDOMINIO atraves dos seguintes padroes textuais:

- `DECLARACAO DE QUITACAO`
- `DEBITOS CONDOMINIAIS`
- `CONDOMINIO`
- `SINDICO`
- `TAXA CONDOMINIAL`
- `QUITACAO DE COTAS CONDOMINIAIS`
- `NADA CONSTA`
- `ADMINISTRADORA`
- `UNIDADE AUTONOMA`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **Declaracao Manuscrita** | Declaracao simples assinada pelo sindico | Nome condominio, unidade, situacao |
| **Documento Administradora** | Papel timbrado da administradora, mais formal | Dados completos, CNPJ, codigo verificacao |
| **Certidao Formal** | Documento padronizado com validade definida | Todos os campos, codigo de autenticidade |
| **Carta Simples** | Formato carta com declaracao de quitacao | Dados basicos, assinatura sindico |

A CND de Condominio **nao possui formato padronizado nacionalmente**. Cada condominio ou administradora pode emitir o documento em formato proprio. Isso resulta em alta variabilidade e baixa confianca na extracao automatica de campos.

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| nome_condominio | string | Nome do condominio | "CONDOMINIO EDIFICIO VILLA PARK" | `[A-Z\s]+` | Media |
| unidade | string | Identificacao da unidade (apto, bloco) | "APTO 124, BLOCO B" | `[A-Z0-9\s\-]+` | Media |
| proprietario | string | Nome do proprietario da unidade | "JOAO DA SILVA" | `[A-Z\s]+` | Media |
| situacao | string | Status de quitacao | "QUITADO" ou "EM DIA" ou "NADA CONSTA" | `(QUITADO\|EM DIA\|NADA CONSTA\|COM DEBITOS)` | Alta |
| data_emissao | date | Data de emissao da declaracao | "27/01/2026" | `\d{2}/\d{2}/\d{4}` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| cnpj_condominio | string | CNPJ do condominio | "12.345.678/0001-90" | Em condominios formalizados | Alta |
| data_referencia | date | Mes/ano de referencia da quitacao | "Janeiro/2026" ou "01/2026" | Frequentemente presente | Media |
| sindico | string | Nome do sindico | "MARIA SANTOS" | Quando assinado por sindico | Media |
| administradora | string | Nome da administradora | "LELLO ADMINISTRADORA" | Quando emitido por administradora | Media |
| cnpj_administradora | string | CNPJ da administradora | "01.234.567/0001-89" | Em documentos de administradoras | Alta |
| endereco_condominio | string | Endereco do condominio | "RUA FRANCISCO CRUZ, 515" | Geralmente presente | Media |
| codigo_unidade | string | Codigo interno da unidade | "124-B" ou "0124" | Em sistemas de administradoras | Media |
| validade | date | Data de validade da declaracao | "26/02/2026" | Raramente especificada | Media |
| codigo_verificacao | string | Codigo para validacao online | "ABC123XYZ" | Apenas em administradoras com sistema | Media |

### 2.3 Objetos Nested

A CND de Condominio nao possui estrutura nested complexa. Todos os campos sao de nivel raiz, refletindo a simplicidade do documento.

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

> **ALERTA: BAIXISSIMA COBERTURA DE CAMPOS**
>
> A CND de Condominio possui apenas **2 campos** mapeados para o modelo de dados do sistema, representando uma das menores coberturas entre todos os tipos de documentos. Isso ocorre porque:
> 1. O documento nao possui schema dedicado
> 2. Os campos sao usados principalmente para **validacao**, nao para composicao de minutas
> 3. O formato nao padronizado dificulta a extracao sistematica

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Documento | Campo Mapeado | Usado em Minutas? | Prioridade |
|-------------------|---------------|-------------------|------------|
| proprietario | nome | NAO (apenas validacao) | Baixa |

**Observacao**: O nome do proprietario e extraido apenas para validacao cruzada com o alienante da transacao. Nao e usado como fonte primaria de dados pessoais.

### 3.2 Campos que Alimentam "Pessoa Juridica"

A CND de Condominio **nao alimenta** campos de Pessoa Juridica.

O CNPJ do condominio ou administradora nao e mapeado para o modelo de dados porque sao entidades terceiras, nao partes da transacao.

### 3.3 Campos que Alimentam "Dados do Imovel"

| Campo no Documento | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-------------------|---------------|-------------------|-------------------|
| unidade | COMPLEMENTO | Complemento (apto, bloco) | SIM |

**Observacao**: A unidade (apartamento, bloco) e mapeada para o complemento do endereco do imovel, permitindo validacao cruzada com outros documentos.

### 3.4 Campos que Alimentam "Negocio Juridico"

A CND de Condominio **nao alimenta** campos de Negocio Juridico.

O documento e usado para validacao da regularidade condominial, nao para composicao dos termos do negocio.

### 3.5 Campos Nao Mapeados

| Campo no Documento | Motivo da Exclusao | Observacao |
|-------------------|-------------------|------------|
| nome_condominio | Informativo | Nao utilizado em minutas |
| cnpj_condominio | Informativo | Entidade terceira |
| situacao | Usado para validacao | Determina se transacao pode prosseguir |
| data_emissao | Metadado | Nao referenciado em minutas |
| data_referencia | Metadado | Periodo de referencia apenas |
| sindico | Informativo | Responsavel pela declaracao |
| administradora | Informativo | Entidade terceira |
| validade | Usado para validacao | Verifica se declaracao esta vigente |
| codigo_verificacao | Verificacao interna | Para validacao online apenas |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "CND_CONDOMINIO",
  "dados_catalogados": {
    "nome_condominio": "CONDOMINIO EDIFICIO VILLA PARK",
    "cnpj_condominio": "12.345.678/0001-90",
    "endereco_condominio": "RUA FRANCISCO CRUZ, 515 - VILA MARIANA",
    "unidade": "APARTAMENTO 124, BLOCO B",
    "proprietario": "JOAO DA SILVA",
    "situacao": "QUITADO",
    "data_referencia": "Janeiro/2026",
    "data_emissao": "27/01/2026",
    "sindico": "MARIA SANTOS",
    "administradora": null,
    "validade": null,
    "codigo_verificacao": null
  },
  "confianca_extracao": {
    "geral": 0.75,
    "campos_alta_confianca": ["situacao", "data_emissao"],
    "campos_media_confianca": ["nome_condominio", "unidade", "proprietario"],
    "campos_baixa_confianca": ["data_referencia", "sindico"]
  },
  "validacoes": {
    "situacao_quitado": true,
    "declaracao_vigente": true
  }
}
```

**Fonte**: Exemplo baseado em formato comum de declaracao condominial

### 4.1 Exemplo de Administradora

```json
{
  "tipo_documento": "CND_CONDOMINIO",
  "dados_catalogados": {
    "nome_condominio": "CONDOMINIO RESIDENCIAL PARQUE DAS FLORES",
    "cnpj_condominio": "98.765.432/0001-10",
    "endereco_condominio": "AV PAULISTA, 1000",
    "unidade": "APTO 501, TORRE A",
    "proprietario": "EMPRESA EXEMPLO LTDA",
    "situacao": "NADA CONSTA",
    "data_referencia": "12/2025",
    "data_emissao": "15/01/2026",
    "sindico": null,
    "administradora": "LELLO CONDOMINOS",
    "cnpj_administradora": "01.234.567/0001-89",
    "validade": "14/02/2026",
    "codigo_verificacao": "LELLO2026ABC123"
  },
  "formato_documento": "administradora_sistema",
  "observacao": "Documento emitido por sistema de administradora com codigo de verificacao"
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| proprietario | MATRICULA_IMOVEL, ESCRITURA, IPTU | Validar que proprietario = alienante |
| unidade | IPTU, MATRICULA_IMOVEL, ESCRITURA | Validar identificacao da unidade |
| endereco_condominio | IPTU, MATRICULA_IMOVEL, CND_MUNICIPAL | Validar endereco do imovel |

### 5.2 Redundancia Intencional

A CND de Condominio e correlacionada com outros documentos para garantir consistencia:

1. **MATRICULA_IMOVEL**: Proprietario deve coincidir com o titular atual
2. **IPTU**: Endereco e unidade devem coincidir
3. **ESCRITURA**: Vendedor deve ser o mesmo proprietario declarado
4. **COMPROMISSO_COMPRA_VENDA**: Promitente vendedor deve corresponder

### 5.3 Documentos Correlatos para Venda de Apartamento

A CND de Condominio faz parte do conjunto de documentos especificos para venda de imoveis em condominio:

| Documento | Finalidade | Vinculado a |
|-----------|------------|-------------|
| **CND_CONDOMINIO** | Comprova quitacao de taxas condominiais | Unidade |
| MATRICULA_IMOVEL | Comprova propriedade e historico | Imovel |
| CND_MUNICIPAL | Comprova quitacao de IPTU | Imovel (SQL) |
| IPTU | Identifica contribuinte e endereco | Imovel (SQL) |
| ESCRITURA (anterior) | Comprova aquisicao pelo vendedor | Transacao anterior |

### 5.4 Hierarquia de Fontes

Para dados da unidade autonoma:

1. **MATRICULA_IMOVEL** - Fonte primaria de descricao e titularidade
2. **IPTU / DADOS_CADASTRAIS** - Fonte primaria para endereco fiscal
3. **ESCRITURA** - Fonte de historico de transacoes
4. **CND_CONDOMINIO** - Fonte de **validacao** apenas

A CND de Condominio **nao e usada como fonte primaria** de dados. Serve exclusivamente para validar a regularidade condominial antes da transacao.

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| situacao_quitacao | Status deve indicar quitacao | Logica |
| data_emissao_valida | Data de emissao deve ser recente | Logica |
| unidade_identificada | Unidade deve estar claramente identificada | Estrutural |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Consequencia |
|-----------|-----------|--------------|
| situacao = "QUITADO" / "EM DIA" / "NADA CONSTA" | Declaracao deve atestar quitacao | Transacao pode prosseguir |
| situacao = "COM DEBITOS" | Ha debitos condominiais pendentes | Transacao pode ser bloqueada; quitacao previa obrigatoria |
| Proprietario corresponde ao alienante | Declaracao deve ser do vendedor | Validacao obrigatoria |
| Unidade corresponde ao imovel | Unidade deve ser a mesma da matricula | Validacao obrigatoria |
| Declaracao recente | Idealmente emitida nos ultimos 30 dias | Recomendado |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Declaracao com mais de 30 dias de emissao
- Status diferente de "QUITADO", "EM DIA" ou "NADA CONSTA"
- Proprietario nao corresponde ao alienante da transacao
- Unidade nao corresponde ao imovel da matricula
- Documento sem assinatura identificavel (sindico ou administradora)
- Formato muito informal (declaracao manuscrita sem dados completos)

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

Nenhum campo e computado automaticamente a partir de outros campos da CND de Condominio.

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| tipo_emissor | Inferido pela presenca de sindico ou administradora | Identifica quem emitiu |
| vigencia_estimada | Inferido a partir de data_emissao + 30 dias | Quando validade nao especificada |

### 7.3 Campos Raros

| Campo | Quando Presente |
|-------|-----------------|
| cnpj_condominio | Apenas em condominios formalizados |
| cnpj_administradora | Apenas quando emitido por administradora |
| codigo_verificacao | Apenas em sistemas de administradoras |
| validade | Raramente especificada explicitamente |

### 7.4 Validade

- A CND de Condominio **nao tem validade legal definida**
- Na pratica, cartorios aceitam declaracoes com **ate 30 dias** de emissao
- Recomenda-se solicitar declaracao o mais proximo possivel da escritura
- Alguns condominios/administradoras especificam validade no documento
- A validacao da quitacao e pontual (no momento da emissao)

### 7.5 Status Possiveis

| Status | Significado | Impacto na Transacao |
|--------|-------------|---------------------|
| **QUITADO** | Todas as cotas condominiais estao pagas | Transacao pode prosseguir |
| **EM DIA** | Nao ha debitos em aberto | Transacao pode prosseguir |
| **NADA CONSTA** | Nao ha pendencias registradas | Transacao pode prosseguir |
| **COM DEBITOS** | Ha cotas condominiais em atraso | Quitacao previa obrigatoria |
| **PENDENTE** | Ha valores pendentes de confirmacao | Analise caso a caso |

### 7.6 Lei 4.591/64 - Lei de Condominios

A Lei 4.591/64 regula os condominios edilicional e incorporacoes imobiliarias no Brasil. Pontos relevantes para a CND de Condominio:

**Art. 22**: O sindico compete administrar o condominio, inclusive fornecendo certidoes e declaracoes.

**Codigo Civil, Art. 1.345**: Estabelece que debitos condominiais acompanham a unidade, nao o proprietario:
> "O adquirente de unidade responde pelos debitos do alienante, em relacao ao condominio, inclusive multas e juros moratórios."

Isso significa que:
- Debitos condominiais sao **obrigacao propter rem** (acompanham a coisa)
- O comprador pode ser cobrado por dividas anteriores a sua aquisicao
- A CND de Condominio protege o comprador ao exigir comprovacao de quitacao

### 7.7 Quem Pode Emitir

| Emissor | Validade | Observacao |
|---------|----------|------------|
| **Sindico** | Aceita | Representante legal do condominio |
| **Administradora** | Aceita | Mandataria do condominio para gestao |
| **Subsindico** | Questionavel | Apenas se com poderes delegados |
| **Zelador** | NAO aceita | Nao tem legitimidade |
| **Morador** | NAO aceita | Nao tem legitimidade |

### 7.8 Diferenca entre CND de Condominio e CND Municipal

| Aspecto | CND_CONDOMINIO | CND_MUNICIPAL |
|---------|----------------|---------------|
| **Emissor** | Sindico/Administradora | Prefeitura |
| **O que comprova** | Quitacao de taxas condominiais | Quitacao de IPTU/taxas municipais |
| **Vinculada a** | Unidade em condominio | Imovel (SQL) |
| **Base legal** | Lei 4.591/64, CC Art. 1.345 | CTN Art. 130 |
| **Aplicacao** | Somente imoveis em condominio | Qualquer imovel urbano |

### 7.9 Cobertura de Campos no Sistema

> **NOTA IMPORTANTE**
>
> Este documento possui uma das **menores coberturas de campos uteis** mapeados no sistema:
> - Total de campos mapeados: **2**
> - Pessoa Natural: 1 campo (nome)
> - Imovel: 1 campo (complemento)
> - Pessoa Juridica: 0 campos
> - Negocio: 0 campos
>
> Isso reflete a natureza do documento como ferramenta de **validacao**, nao como fonte de dados para minutas.

---

## 8. REFERENCIAS

- **Mapeamento de Campos**: `execution/mapeamento_documento_campos.json`
- **Guia de Campos Imovel**: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- **Lei 4.591/64**: Lei de Condominio e Incorporacoes
- **Codigo Civil, Art. 1.345 a 1.358**: Condominio edilicio
- **Provimento CGJ-SP 58/89**: Normas do servico notarial e de registro

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
