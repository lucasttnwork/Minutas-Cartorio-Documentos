# CND_ESTADUAL - Certidao Negativa de Debitos Estaduais

**Complexidade de Extracao**: BAIXA
**Schema Fonte**: Nao possui schema dedicado (campos definidos em `mapeamento_documento_campos.json`)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A CND Estadual (Certidao Negativa de Debitos Estaduais) e uma certidao emitida pela Secretaria da Fazenda Estadual (SEFAZ) de cada Unidade Federativa. O documento atesta a situacao fiscal regular do contribuinte perante o Estado, comprovando a inexistencia de debitos relativos a tributos estaduais.

A certidao comprova a inexistencia de debitos relativos a:
- **ICMS** (Imposto sobre Circulacao de Mercadorias e Servicos): Principal tributo estadual, incide sobre comercio, industria e servicos de transporte e comunicacao
- **IPVA** (Imposto sobre a Propriedade de Veiculos Automotores): Imposto anual sobre veiculos
- **ITCD/ITCMD** (Imposto sobre Transmissao Causa Mortis e Doacao): Incide sobre herancas e doacoes
- **Taxas Estaduais**: Taxas de fiscalizacao, licenciamento, etc.
- **Divida Ativa Estadual**: Debitos inscritos e nao pagos

O documento e relevante em transacoes imobiliarias porque:
- Comprova a regularidade fiscal do alienante (vendedor) perante o Estado
- Identifica possivel existencia de debitos que possam gerar penhoras sobre bens
- E frequentemente exigido em escrituras publicas de compra e venda
- Permite verificar se o vendedor esta em dia com obrigacoes tributarias estaduais
- E obrigatorio quando o vendedor e empresa com atividade sujeita ao ICMS

### 1.2 Tributos Estaduais Abrangidos

| Tributo | Sigla | Descricao | Quando Incide |
|---------|-------|-----------|---------------|
| Imposto sobre Circulacao de Mercadorias e Servicos | ICMS | Principal imposto estadual sobre operacoes comerciais | Comercio, industria, transporte, comunicacao |
| Imposto sobre Propriedade de Veiculos Automotores | IPVA | Imposto anual sobre veiculos | Propriedade de veiculos |
| Imposto sobre Transmissao Causa Mortis e Doacao | ITCD/ITCMD | Imposto sobre herancas e doacoes | Transmissao nao onerosa de bens |
| Taxas Estaduais | - | Taxas diversas de fiscalizacao e servicos | Servicos publicos estaduais |

**Observacao sobre ITCD/ITCMD**: Este tributo e especialmente relevante em transacoes imobiliarias quando o imovel foi adquirido por heranca ou doacao. A CND Estadual comprova que o imposto foi recolhido corretamente.

### 1.3 Padroes de Identificacao Visual

O sistema identifica documentos CND_ESTADUAL atraves dos seguintes padroes textuais:

- `CERTIDAO NEGATIVA DE DEBITOS ESTADUAIS`
- `SEFAZ`
- `SECRETARIA DA FAZENDA`
- `SECRETARIA DA FAZENDA ESTADUAL`
- `FAZENDA ESTADUAL`
- `ICMS`
- `TRIBUTOS ESTADUAIS`
- `DIVIDA ATIVA ESTADUAL`
- `RECEITA ESTADUAL`
- `FAZENDA PUBLICA ESTADUAL`

### 1.4 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **PDF Digital (Padrao)** | Documento PDF gerado pelo site da SEFAZ, com codigo de verificacao | Todos os campos padronizados |
| **Certidao Impressa** | Versao impressa do PDF digital ou emitida no balcao | Carimbos e assinaturas |
| **Certidao por E-mail** | Enviada eletronicamente apos solicitacao | Mesma estrutura do PDF |
| **Versao Compartilhavel** | Link para validacao online da certidao | Referencia ao codigo de controle |

A CND Estadual **varia conforme o estado emissor**. Cada SEFAZ possui layout proprio e sistemas distintos, mas os campos essenciais (nome/razao social, CPF/CNPJ, situacao, validade) sao comuns a todas.

### 1.5 Diferenca entre CND e CPDEN

Assim como na esfera federal, os estados podem emitir dois tipos de certidao:

| Tipo | Sigla | Significado | Impacto na Transacao |
|------|-------|-------------|---------------------|
| **Certidao Negativa de Debitos** | CND | Nao existem pendencias fiscais estaduais | Transacao pode prosseguir normalmente |
| **Certidao Positiva com Efeitos de Negativa** | CPDEN | Existem debitos, mas com suspensao de exigibilidade | Transacao pode prosseguir com ressalvas |

A CPDEN estadual e emitida quando o contribuinte possui debitos, mas estes estao com exigibilidade suspensa por:
- Deposito judicial do montante integral
- Recurso administrativo pendente de julgamento
- Concessao de liminar ou tutela antecipada
- Parcelamento em dia
- Moratoria estadual

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| numero_certidao | string | Numero unico da certidao | "2026.123456.789" ou "CND-SP-00012345" | `[\w\.\-]+` | Alta |
| nome_contribuinte | string | Nome ou razao social do contribuinte | "JOAO DA SILVA" ou "EMPRESA LTDA" | `[A-Z\s\.]+` | Alta |
| cpf | string | CPF do contribuinte (pessoa fisica) | "123.456.789-00" | `\d{3}\.\d{3}\.\d{3}-\d{2}` | Alta |
| cnpj | string | CNPJ do contribuinte (pessoa juridica) | "12.345.678/0001-90" | `\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}` | Alta |
| situacao | string | Tipo da certidao | "NEGATIVA" ou "POSITIVA COM EFEITOS DE NEGATIVA" | `(NEGATIVA\|POSITIVA.*)` | Alta |
| data_emissao | date | Data de emissao da certidao | "27/01/2026" | `\d{2}/\d{2}/\d{4}` | Alta |
| data_validade | date | Data de validade | "27/04/2026" | `\d{2}/\d{2}/\d{4}` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| hora_emissao | string | Hora de emissao da certidao | "10:30:45" | Em certidoes digitais | Alta |
| inscricao_estadual | string | Inscricao estadual do contribuinte | "123.456.789.000" | Para empresas com IE | Alta |
| codigo_verificacao | string | Codigo para verificacao online | "ABCD1234EFGH5678" | Na maioria das certidoes digitais | Alta |
| url_verificacao | string | URL para validacao da certidao | "https://www.sefaz.sp.gov.br/..." | Sempre presente | Alta |
| orgao_emissor | string | SEFAZ do estado emissor | "SEFAZ-SP" ou "SECRETARIA DA FAZENDA DO ESTADO DE SAO PAULO" | Sempre presente (implicito) | Alta |
| estado_emissor | string | UF que emitiu a certidao | "SP", "RJ", "MG" | Sempre presente | Alta |
| finalidade | string | Finalidade da certidao | "PARA FINS DE DIREITO" | Quando especificada | Media |

### 2.3 Arrays

#### 2.3.1 tributos_abrangidos (array)

Array opcional contendo a lista de tributos estaduais cobertos pela certidao.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| tributos_abrangidos[] | string | Nome do tributo coberto | "ICMS - Imposto sobre Circulacao de Mercadorias e Servicos" | Nao |

**Valores Comuns**:
- ICMS - Imposto sobre Circulacao de Mercadorias e Servicos
- IPVA - Imposto sobre Propriedade de Veiculos Automotores
- ITCD/ITCMD - Imposto sobre Transmissao Causa Mortis e Doacao
- Taxas Estaduais
- Divida Ativa Estadual

**Notas**:
- A certidao geralmente abrange todos os tributos estaduais
- Alguns estados emitem certidoes especificas por tributo
- A presenca ou ausencia deste campo nao afeta a validade da certidao

### 2.4 Objetos Nested

A CND Estadual nao possui estrutura nested complexa. Todos os campos sao de nivel raiz, refletindo a simplicidade do documento.

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Documento | Campo Mapeado | Usado em Minutas? | Prioridade |
|-------------------|---------------|-------------------|------------|
| nome_contribuinte | nome | NAO (apenas validacao) | Baixa |
| cpf | cpf | NAO (apenas validacao) | Baixa |
| numero_certidao | cnd_estadual_numero | SIM | Alta |
| data_emissao | cnd_estadual_data | SIM | Alta |

**Observacao**: A CND Estadual e usada principalmente para validacao da regularidade fiscal do alienante perante o Estado. Os dados de identificacao do contribuinte servem para correlacionar com o vendedor da transacao. Os campos de numero e data sao referenciados na minuta como comprovacao da diligencia fiscal realizada.

### 3.2 Campos que Alimentam "Pessoa Juridica"

| Campo no Documento | Campo Mapeado | Usado em Minutas? | Prioridade |
|-------------------|---------------|-------------------|------------|
| nome_contribuinte (se PJ) | pj_denominacao | NAO (apenas validacao) | Baixa |
| cnpj | pj_cnpj | NAO (apenas validacao) | Baixa |
| numero_certidao | pj_cnd_estadual_numero | SIM | Alta |
| data_emissao | pj_cnd_estadual_data | SIM | Alta |

**Observacao**: Quando a CND Estadual e de uma pessoa juridica, os campos sao mapeados para os equivalentes com prefixo `pj_`. A identificacao entre PF e PJ e feita pela presenca do campo `cpf` ou `cnpj`.

### 3.3 Campos que Alimentam "Dados do Imovel"

A CND Estadual **nao alimenta** campos de Imovel.

A certidao e vinculada a pessoa (fisica ou juridica), nao ao imovel objeto da transacao. Para certidoes vinculadas ao imovel, deve-se utilizar a CND_MUNICIPAL (tributos imobiliarios).

### 3.4 Campos que Alimentam "Negocio Juridico"

A CND Estadual **nao alimenta** diretamente campos de Negocio Juridico.

A certidao e usada para validacao da regularidade fiscal das partes, nao para composicao dos termos do negocio. Porem, e mencionada na escritura como parte das certidoes apresentadas.

### 3.5 Campos Nao Mapeados

| Campo no Documento | Motivo da Exclusao | Observacao |
|-------------------|-------------------|------------|
| url_verificacao | Informativo | Usado apenas para validacao online |
| orgao_emissor | Variavel por estado | Inferido pelo estado_emissor |
| finalidade | Informativo | Nao utilizado em minutas |
| tributos_abrangidos | Informativo | Lista para referencia, nao vai para minuta |
| inscricao_estadual | Empresarial | Usado apenas para empresas com atividade sujeita a ICMS |
| hora_emissao | Metadado | Nivel de detalhe excessivo |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "CND_ESTADUAL",
  "dados_catalogados": {
    "numero_certidao": "2026.123456.789",
    "nome_contribuinte": "JOAO DA SILVA",
    "cpf": "123.456.789-00",
    "cnpj": null,
    "inscricao_estadual": null,
    "situacao": "NEGATIVA",
    "data_emissao": "27/01/2026",
    "hora_emissao": "10:30:45",
    "data_validade": "27/04/2026",
    "codigo_verificacao": "ABCD1234EFGH5678",
    "url_verificacao": "https://www.fazenda.sp.gov.br/certidao/validar/...",
    "orgao_emissor": "SECRETARIA DA FAZENDA DO ESTADO DE SAO PAULO",
    "estado_emissor": "SP"
  },
  "confianca_extracao": {
    "geral": 0.97,
    "campos_alta_confianca": ["numero_certidao", "cpf", "data_emissao", "data_validade", "situacao"],
    "campos_media_confianca": ["nome_contribuinte"]
  },
  "validacoes": {
    "cpf_valido": true,
    "certidao_vigente": true
  }
}
```

**Fonte**: Exemplo baseado no formato padrao da SEFAZ-SP

### 4.1 Exemplo para Pessoa Juridica

```json
{
  "tipo_documento": "CND_ESTADUAL",
  "dados_catalogados": {
    "numero_certidao": "CND-SP-9876543210",
    "nome_contribuinte": "EMPRESA EXEMPLO LTDA",
    "cpf": null,
    "cnpj": "12.345.678/0001-90",
    "inscricao_estadual": "123.456.789.000",
    "situacao": "POSITIVA COM EFEITOS DE NEGATIVA",
    "data_emissao": "27/01/2026",
    "hora_emissao": "14:22:10",
    "data_validade": "27/04/2026",
    "codigo_verificacao": "WXYZ9876ABCD5432",
    "url_verificacao": "https://www.fazenda.sp.gov.br/certidao/validar/...",
    "orgao_emissor": "SECRETARIA DA FAZENDA DO ESTADO DE SAO PAULO",
    "estado_emissor": "SP"
  },
  "tipo_pessoa": "PJ",
  "observacao_cpden": "Certidao positiva com efeitos de negativa indica debitos com exigibilidade suspensa (parcelamento, recurso, etc.)"
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL, CND_MUNICIPAL, IPTU, COMPROVANTE_RESIDENCIA | Identificar mesma pessoa fisica |
| nome_contribuinte | Todos os documentos de pessoa | Correlacionar pessoas por nome (fuzzy match) |
| cnpj | CONTRATO_SOCIAL, CND_FEDERAL, CND_MUNICIPAL, CNDT, ITBI | Identificar mesma empresa |

### 5.2 Redundancia Intencional

A CND Estadual e uma das certidoes utilizadas para comprovacao de regularidade fiscal em escrituras. O CPF/CNPJ e extraido para correlacionar com o alienante da transacao, permitindo:

1. **Verificacao de identidade**: Confirmar que a certidao pertence ao alienante correto
2. **Validacao cruzada**: Comparar com CPF/CNPJ de outros documentos da mesma pessoa
3. **Deteccao de inconsistencias**: Alertar quando certidao e de pessoa diferente do alienante
4. **Rastreabilidade**: Vincular certidao ao participante correto da transacao

### 5.3 Certidoes Correlatas

A CND Estadual faz parte do conjunto de certidoes fiscais frequentemente exigidas para lavratura de escrituras publicas:

| Certidao | Orgao Emissor | O que Comprova | Vinculada a |
|----------|---------------|----------------|-------------|
| CND Federal | RFB / PGFN | Regularidade com tributos federais e divida ativa | Pessoa (CPF/CNPJ) |
| **CND Estadual** | SEFAZ | Regularidade com tributos estaduais (ICMS, IPVA, ITCD) | Pessoa (CPF/CNPJ) |
| CND Municipal | Prefeitura | Regularidade com tributos imobiliarios (IPTU, taxas) | Imovel (SQL) |
| CNDT | TST | Inexistencia de debitos trabalhistas | Pessoa (CPF/CNPJ) |

### 5.4 Hierarquia de Fontes

Para dados de identificacao da pessoa:

1. **RG/CNH** - Fonte primaria de identificacao pessoal
2. **CND Federal** - Fonte secundaria (validacao fiscal federal)
3. **CND Estadual** - Fonte secundaria (validacao fiscal estadual)
4. **CNDT** - Fonte secundaria (validacao trabalhista)

A CND Estadual nao e usada como fonte primaria de dados pessoais, apenas para confirmar a regularidade fiscal perante o Estado.

### 5.5 Correlacao com CND Federal e CND Municipal

As tres certidoes (Federal, Estadual e Municipal) formam o conjunto de comprovacao de regularidade fiscal em diferentes esferas:

| Esfera | Certidao | Tributos Principais | Vinculacao |
|--------|----------|--------------------| -----------|
| Federal | CND Federal (RFB/PGFN) | IR, CSLL, PIS, COFINS, INSS | CPF/CNPJ (pessoa) |
| Estadual | CND Estadual (SEFAZ) | ICMS, IPVA, ITCD | CPF/CNPJ (pessoa) |
| Municipal | CND Municipal (Prefeitura) | IPTU, ISS, taxas | SQL (imovel) |

**Importante**: A CND Municipal e vinculada ao **imovel** (SQL), enquanto as CNDs Federal e Estadual sao vinculadas a **pessoa** (CPF/CNPJ).

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| cpf_digito_verificador | Verifica se CPF tem digitos validos | Estrutural |
| cnpj_digito_verificador | Verifica se CNPJ tem digitos validos (se PJ) | Estrutural |
| data_validade_futura | Certidao deve estar dentro da validade | Logica |
| codigo_verificacao_formato | Codigo deve seguir formato da SEFAZ | Estrutural |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Consequencia |
|-----------|-----------|--------------|
| situacao = "NEGATIVA" | Certidao negativa plena | Transacao pode prosseguir normalmente |
| situacao = "POSITIVA COM EFEITOS DE NEGATIVA" | Ha debitos com exigibilidade suspensa | Transacao pode prosseguir com ressalvas na minuta |
| situacao = "POSITIVA" | Ha debitos estaduais exigiveis | Transacao pode ser bloqueada; analise de risco obrigatoria |
| CPF/CNPJ corresponde ao alienante | Certidao deve ser do vendedor | Validacao obrigatoria |
| Certidao vigente na data da escritura | Data atual < data_validade | Certidao deve estar valida |
| Estado emissor compativel | UF deve corresponder ao domicilio fiscal | Verificacao de consistencia |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Certidao com menos de 30 dias de validade restante
- Situacao "POSITIVA COM EFEITOS DE NEGATIVA" (requer mencao na minuta)
- Situacao "POSITIVA" (transacao pode ser bloqueada)
- CPF/CNPJ nao corresponde a nenhum participante da transacao
- Codigo de verificacao nao validado no site da SEFAZ (validacao online)
- Estado emissor diferente do domicilio fiscal do contribuinte

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

Nenhum campo e computado automaticamente a partir de outros campos da CND Estadual.

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| tipo_pessoa | Inferido pela presenca de CPF ou CNPJ | PF se CPF presente, PJ se CNPJ presente |
| validade_restante | Calculado a partir de data_validade - data_atual | Usado para alertas |
| status_simplificado | Inferido de situacao | REGULAR (se negativa ou CPDEN), IRREGULAR (se positiva) |
| estado_emissor | Inferido do orgao_emissor ou URL | Identifica UF emissora |

### 7.3 Campos Raros

| Campo | Quando Presente |
|-------|-----------------|
| inscricao_estadual | Apenas para empresas com atividade sujeita a ICMS |
| finalidade | Quando especificada na solicitacao |
| tributos_abrangidos | Em certidoes detalhadas de alguns estados |

### 7.4 Validade

- A CND Estadual tem validade **variavel conforme o estado**, geralmente entre **30 e 180 dias**
- Em Sao Paulo, a validade padrao e de **90 dias**
- E emitida **gratuitamente** na maioria dos estados
- Pode ser verificada pelo codigo de controle no site da SEFAZ
- A validacao online retorna os mesmos dados da certidao emitida

### 7.5 Situacoes Possiveis

| Situacao | Significado | Impacto na Transacao |
|----------|-------------|---------------------|
| **NEGATIVA** | Nao ha debitos tributarios estaduais | Transacao pode prosseguir normalmente |
| **POSITIVA COM EFEITOS DE NEGATIVA** | Ha debitos, mas com suspensao de exigibilidade | Transacao pode prosseguir; recomendar mencao na minuta |
| **POSITIVA** | Ha debitos tributarios estaduais exigiveis | Transacao pode ser bloqueada; recomendado analise de risco e quitacao previa |

### 7.6 Variacoes por Estado

Cada estado possui sistema proprio de emissao de CND, com particularidades:

| Estado | Portal | Validade Padrao | Observacoes |
|--------|--------|-----------------|-------------|
| SP | SEFAZ-SP | 90 dias | Emissao 100% digital |
| RJ | SEFAZ-RJ | 90 dias | Requer cadastro |
| MG | SEF-MG | 90 dias | Sistema integrado |
| PR | SEFA-PR | 90 dias | Portal simplificado |
| RS | SEFAZ-RS | 60 dias | Validade menor |

**Importante**: Sempre verificar a validade especifica no documento emitido, pois pode variar.

### 7.7 Quando a CND Estadual e Obrigatoria

A CND Estadual e especialmente importante quando:

1. **Vendedor e empresa comercial**: Atividades sujeitas ao ICMS exigem regularidade estadual
2. **Imovel adquirido por heranca ou doacao**: Comprova quitacao do ITCD/ITCMD
3. **Vendedor possui veiculos**: Regularidade de IPVA pode afetar patrimonio
4. **Exigencia notarial especifica**: Alguns tabelionatos exigem para todas as transacoes

### 7.8 ITCD/ITCMD e Transacoes Imobiliarias

O ITCD (Imposto sobre Transmissao Causa Mortis e Doacao) e especialmente relevante:

- Incide sobre imoveis recebidos por **heranca** (inventario)
- Incide sobre imoveis recebidos por **doacao**
- A aliquota varia por estado (geralmente entre 4% e 8%)
- Deve ser recolhido **antes** da transmissao no cartorio
- A CND Estadual comprova que o ITCD foi pago corretamente

**Alerta**: Em transacoes onde o vendedor adquiriu o imovel por heranca ou doacao, verificar especificamente a quitacao do ITCD.

### 7.9 Diferenca entre CND Estadual de Pessoa e CND de Tributos Especificos

Alguns estados emitem certidoes separadas:

| Tipo | Abrangencia | Uso |
|------|-------------|-----|
| CND Estadual Geral | Todos os tributos estaduais (ICMS, IPVA, ITCD) | Uso geral, escrituras |
| CND de ICMS | Apenas ICMS | Para empresas comerciais |
| CND de IPVA | Apenas IPVA | Para transferencia de veiculos |
| CND de ITCD | Apenas ITCD | Para inventarios e doacoes |

Para escrituras, recomenda-se a **CND Estadual Geral** que abrange todos os tributos.

---

## 8. REFERENCIAS

- **Mapeamento de Campos**: `execution/mapeamento_documento_campos.json`
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Sites SEFAZ (emissao e validacao)**:
  - SP: https://www.fazenda.sp.gov.br/
  - RJ: https://www.fazenda.rj.gov.br/
  - MG: https://www.fazenda.mg.gov.br/
  - (Demais estados: buscar "SEFAZ" + sigla do estado)
- **CTN Art. 205 e 206**: Certidao negativa e certidao positiva com efeitos de negativa
- **Legislacao Estadual**: Cada estado possui codigo tributario proprio

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
