# CND_FEDERAL - Certidao Negativa de Debitos Relativos a Creditos Tributarios Federais e a Divida Ativa da Uniao

**Complexidade de Extracao**: BAIXA
**Schema Fonte**: Nao possui schema dedicado (campos definidos em `mapeamento_documento_campos.json`)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A CND Federal (Certidao Negativa de Debitos Relativos a Creditos Tributarios Federais e a Divida Ativa da Uniao) e uma certidao conjunta emitida pela Receita Federal do Brasil (RFB) e pela Procuradoria-Geral da Fazenda Nacional (PGFN). O documento atesta a situacao fiscal regular do contribuinte perante a Uniao, abrangendo tanto os tributos administrados pela RFB quanto os inscritos em Divida Ativa da Uniao.

A certidao comprova a inexistencia de debitos relativos a:
- **Tributos Federais**: Imposto de Renda (IR), Contribuicao Social sobre o Lucro Liquido (CSLL), PIS/COFINS, IPI, IOF, ITR, entre outros
- **Contribuicoes Previdenciarias**: INSS patronal, contribuicoes de terceiros, FGTS (parcela federal)
- **Divida Ativa da Uniao**: Debitos inscritos e nao pagos, em cobranca pela PGFN

O documento e fundamental para transacoes imobiliarias porque:
- Comprova a regularidade fiscal do alienante (vendedor) perante a Uniao
- Identifica possivel existencia de debitos que possam gerar penhoras sobre bens
- E documento obrigatorio para lavratura de escrituras publicas de compra e venda
- Permite verificar se o vendedor esta em dia com obrigacoes tributarias federais

### 1.2 Diferenca entre CND e CPDEN

Existem dois tipos de certidao emitidas pela RFB/PGFN:

| Tipo | Sigla | Significado | Impacto na Transacao |
|------|-------|-------------|---------------------|
| **Certidao Negativa de Debitos** | CND | Nao existem pendencias fiscais | Transacao pode prosseguir normalmente |
| **Certidao Positiva com Efeitos de Negativa** | CPDEN | Existem debitos, mas com suspensao de exigibilidade | Transacao pode prosseguir com ressalvas |

A CPDEN e emitida quando o contribuinte possui debitos, mas estes estao com exigibilidade suspensa por:
- Deposito judicial do montante integral
- Recurso administrativo pendente de julgamento
- Concessao de liminar ou tutela antecipada
- Parcelamento em dia
- Moratoria

**Importante**: Para fins de escritura publica, tanto a CND quanto a CPDEN sao aceitas. A CPDEN indica que ha debitos, mas que estes nao sao exigiveis no momento, nao impedindo a transacao.

### 1.3 Padroes de Identificacao Visual

O sistema identifica documentos CND_FEDERAL atraves dos seguintes padroes textuais:

- `CERTIDAO NEGATIVA DE DEBITOS`
- `CERTIDAO POSITIVA COM EFEITOS DE NEGATIVA`
- `RECEITA FEDERAL`
- `PGFN`
- `PROCURADORIA-GERAL DA FAZENDA NACIONAL`
- `DIVIDA ATIVA DA UNIAO`
- `TRIBUTOS FEDERAIS`
- `CREDITOS TRIBUTARIOS FEDERAIS`
- `RFB`
- `MINISTERIO DA FAZENDA`

### 1.4 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **PDF Digital (Padrao)** | Documento PDF gerado pelo site da RFB, com codigo de controle para validacao | Todos os campos padronizados |
| **Certidao Conjunta** | Abrange tributos RFB e PGFN em unico documento | Referencia a ambos os orgaos |
| **Certidao Impressa** | Versao impressa do PDF digital, mesma estrutura | Identica ao PDF |
| **Versao Compartilhavel** | Link para validacao online da certidao | Referencia ao codigo de controle |

A CND Federal possui formato padronizado nacionalmente, sendo emitida exclusivamente pelos sistemas da Receita Federal. Nao ha variacoes regionais, garantindo uniformidade na extracao dos campos.

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| numero_certidao | string | Numero unico da certidao | "0123.4567.8901.2345" | `[\d\.]+` | Alta |
| nome_contribuinte | string | Nome ou razao social do contribuinte | "JOAO DA SILVA" ou "EMPRESA LTDA" | `[A-Z\s\.]+` | Alta |
| cpf | string | CPF do contribuinte (pessoa fisica) | "123.456.789-00" | `\d{3}\.\d{3}\.\d{3}-\d{2}` | Alta |
| cnpj | string | CNPJ do contribuinte (pessoa juridica) | "12.345.678/0001-90" | `\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}` | Alta |
| situacao | string | Tipo da certidao | "NEGATIVA" ou "POSITIVA COM EFEITOS DE NEGATIVA" | `(NEGATIVA\|POSITIVA COM EFEITOS DE NEGATIVA)` | Alta |
| data_emissao | date | Data de emissao da certidao | "27/01/2026" | `\d{2}/\d{2}/\d{4}` | Alta |
| data_validade | date | Data de validade (180 dias) | "26/07/2026" | `\d{2}/\d{2}/\d{4}` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| hora_emissao | string | Hora de emissao da certidao | "10:30:45" | Sempre presente em certidoes digitais | Alta |
| codigo_controle | string | Codigo para verificacao online | "ABCD.1234.EFGH.5678" | Sempre presente | Alta |
| url_verificacao | string | URL para validacao da certidao | "https://servicos.receita.fazenda.gov.br/..." | Sempre presente | Alta |
| orgao_emissor | string | Orgao emissor | "RECEITA FEDERAL DO BRASIL / PGFN" | Sempre presente (implicito) | Alta |
| finalidade | string | Finalidade da certidao | "PARA FINS DE DIREITO" | Quando especificada | Media |

### 2.3 Arrays

#### 2.3.1 tributos_abrangidos (array)

Array opcional contendo a lista de tributos federais cobertos pela certidao.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| tributos_abrangidos[] | string | Nome do tributo coberto | "Imposto de Renda Pessoa Fisica (IRPF)" | Nao |

**Valores Comuns**:
- Imposto de Renda Pessoa Fisica (IRPF)
- Imposto de Renda Pessoa Juridica (IRPJ)
- Contribuicao Social sobre o Lucro Liquido (CSLL)
- Contribuicao para o PIS/PASEP
- Contribuicao para o Financiamento da Seguridade Social (COFINS)
- Imposto sobre Produtos Industrializados (IPI)
- Imposto sobre Operacoes Financeiras (IOF)
- Imposto Territorial Rural (ITR)
- Contribuicoes Previdenciarias
- Demais tributos administrados pela RFB
- Divida Ativa da Uniao (inscricoes PGFN)

**Notas**:
- A certidao conjunta abrange todos os tributos federais
- Nao ha emissao de certidao individual por tributo
- A presenca ou ausencia deste campo nao afeta a validade da certidao

### 2.4 Objetos Nested

A CND Federal nao possui estrutura nested complexa. Todos os campos sao de nivel raiz, refletindo a simplicidade do documento.

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Documento | Campo Mapeado | Usado em Minutas? | Prioridade |
|-------------------|---------------|-------------------|------------|
| nome_contribuinte | NOME | NAO (apenas validacao) | Baixa |
| cpf | CPF | NAO (apenas validacao) | Baixa |
| situacao | TIPO | SIM | Alta |
| data_emissao | DATA DE EMISSAO | SIM | Alta |
| hora_emissao | HORA DE EMISSAO | SIM | Media |
| data_validade | VALIDADE | SIM | Alta |
| codigo_controle | CODIGO DE CONTROLE | SIM | Media |

**Observacao**: A CND Federal e usada principalmente para validacao da regularidade fiscal do alienante. Os dados de identificacao do contribuinte servem para correlacionar com o vendedor da transacao. Os campos de numero, tipo, data e codigo sao referenciados na minuta como comprovacao da diligencia fiscal realizada.

### 3.2 Campos que Alimentam "Pessoa Juridica"

| Campo no Documento | Campo Mapeado | Usado em Minutas? | Prioridade |
|-------------------|---------------|-------------------|------------|
| nome_contribuinte (se PJ) | DENOMINACAO | NAO (apenas validacao) | Baixa |
| cnpj | CNPJ | NAO (apenas validacao) | Baixa |
| situacao | TIPO | SIM | Alta |
| data_emissao | DATA DE EMISSAO | SIM | Alta |
| hora_emissao | HORA DE EMISSAO | SIM | Media |
| data_validade | VALIDADE | SIM | Alta |
| codigo_controle | CODIGO DE CONTROLE | SIM | Media |

**Observacao**: Quando a CND Federal e de uma pessoa juridica, os campos sao mapeados para os equivalentes com prefixo `pj_`. A identificacao entre PF e PJ e feita pela presenca do campo `cpf` ou `cnpj`.

### 3.3 Campos que Alimentam "Dados do Imovel"

A CND Federal **nao alimenta** campos de Imovel.

A certidao e vinculada a pessoa (fisica ou juridica), nao ao imovel objeto da transacao. Para certidoes vinculadas ao imovel, deve-se utilizar a CND_MUNICIPAL (tributos imobiliarios).

### 3.4 Campos que Alimentam "Negocio Juridico"

A CND Federal **nao alimenta** diretamente campos de Negocio Juridico.

A certidao e usada para validacao da regularidade fiscal das partes, nao para composicao dos termos do negocio. Porem, e mencionada na escritura como parte das certidoes apresentadas.

### 3.5 Campos Nao Mapeados

| Campo no Documento | Motivo da Exclusao | Observacao |
|-------------------|-------------------|------------|
| url_verificacao | Informativo | Usado apenas para validacao online |
| orgao_emissor | Sempre RFB/PGFN | Valor constante, desnecessario extrair |
| finalidade | Informativo | Nao utilizado em minutas |
| tributos_abrangidos | Informativo | Lista para referencia, nao vai para minuta |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "CND_FEDERAL",
  "dados_catalogados": {
    "numero_certidao": "0123.4567.8901.2345",
    "nome_contribuinte": "JOAO DA SILVA",
    "cpf": "123.456.789-00",
    "cnpj": null,
    "situacao": "NEGATIVA",
    "data_emissao": "27/01/2026",
    "hora_emissao": "10:30:45",
    "data_validade": "26/07/2026",
    "codigo_controle": "ABCD.1234.EFGH.5678",
    "url_verificacao": "https://servicos.receita.fazenda.gov.br/servicos/certidao/verificar/...",
    "orgao_emissor": "RECEITA FEDERAL DO BRASIL / PGFN"
  },
  "confianca_extracao": {
    "geral": 0.98,
    "campos_alta_confianca": ["numero_certidao", "cpf", "data_emissao", "data_validade", "situacao"],
    "campos_media_confianca": ["nome_contribuinte"]
  },
  "validacoes": {
    "cpf_valido": true,
    "certidao_vigente": true,
    "validade_180_dias_confirmada": true
  }
}
```

**Fonte**: Exemplo baseado no formato padrao da RFB

### 4.1 Exemplo para Pessoa Juridica

```json
{
  "tipo_documento": "CND_FEDERAL",
  "dados_catalogados": {
    "numero_certidao": "9876.5432.1098.7654",
    "nome_contribuinte": "EMPRESA EXEMPLO LTDA",
    "cpf": null,
    "cnpj": "12.345.678/0001-90",
    "situacao": "POSITIVA COM EFEITOS DE NEGATIVA",
    "data_emissao": "27/01/2026",
    "hora_emissao": "14:22:10",
    "data_validade": "26/07/2026",
    "codigo_controle": "WXYZ.9876.ABCD.5432",
    "url_verificacao": "https://servicos.receita.fazenda.gov.br/servicos/certidao/verificar/...",
    "orgao_emissor": "RECEITA FEDERAL DO BRASIL / PGFN"
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
| cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT, IPTU, COMPROVANTE_RESIDENCIA | Identificar mesma pessoa fisica |
| nome_contribuinte | Todos os documentos de pessoa | Correlacionar pessoas por nome (fuzzy match) |
| cnpj | CONTRATO_SOCIAL, CND_ESTADUAL, CND_MUNICIPAL, CNDT, ITBI | Identificar mesma empresa |

### 5.2 Redundancia Intencional

A CND Federal e uma das certidoes obrigatorias para escrituras. O CPF/CNPJ e extraido para correlacionar com o alienante da transacao, permitindo:

1. **Verificacao de identidade**: Confirmar que a certidao pertence ao alienante correto
2. **Validacao cruzada**: Comparar com CPF/CNPJ de outros documentos da mesma pessoa
3. **Deteccao de inconsistencias**: Alertar quando certidao e de pessoa diferente do alienante
4. **Rastreabilidade**: Vincular certidao ao participante correto da transacao

### 5.3 Certidoes Correlatas

A CND Federal faz parte do conjunto de certidoes fiscais obrigatorias para lavratura de escrituras publicas:

| Certidao | Orgao Emissor | O que Comprova | Vinculada a |
|----------|---------------|----------------|-------------|
| **CND Federal** | RFB / PGFN | Regularidade com tributos federais e divida ativa | Pessoa (CPF/CNPJ) |
| CND Estadual | SEFAZ | Regularidade com tributos estaduais (ICMS, IPVA) | Pessoa (CPF/CNPJ) |
| CND Municipal | Prefeitura | Regularidade com tributos imobiliarios (IPTU, taxas) | Imovel (SQL) |
| CNDT | TST | Inexistencia de debitos trabalhistas | Pessoa (CPF/CNPJ) |

### 5.4 Hierarquia de Fontes

Para dados de identificacao da pessoa:

1. **RG/CNH** - Fonte primaria de identificacao pessoal
2. **CND Federal** - Fonte secundaria (apenas para validacao fiscal)
3. **CNDT** - Fonte secundaria (apenas para validacao trabalhista)
4. **CND Estadual** - Fonte secundaria (apenas para validacao estadual)

A CND Federal nao e usada como fonte primaria de dados pessoais, apenas para confirmar a regularidade fiscal perante a Uniao.

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| cpf_digito_verificador | Verifica se CPF tem digitos validos | Estrutural |
| cnpj_digito_verificador | Verifica se CNPJ tem digitos validos (se PJ) | Estrutural |
| data_validade_futura | Certidao deve estar dentro da validade | Logica |
| validade_180_dias | Validade deve ser exatamente 180 dias apos emissao | Logica |
| codigo_controle_formato | Codigo deve seguir formato padrao RFB | Estrutural |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Consequencia |
|-----------|-----------|--------------|
| situacao = "NEGATIVA" | Certidao negativa plena | Transacao pode prosseguir normalmente |
| situacao = "POSITIVA COM EFEITOS DE NEGATIVA" | Ha debitos com exigibilidade suspensa | Transacao pode prosseguir com ressalvas na minuta |
| situacao = "POSITIVA" | Ha debitos exigiveis pendentes | Transacao pode ser bloqueada; analise de risco obrigatoria |
| CPF/CNPJ corresponde ao alienante | Certidao deve ser do vendedor | Validacao obrigatoria |
| Certidao vigente na data da escritura | Data atual < data_validade | Certidao deve estar valida |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Certidao com menos de 30 dias de validade restante
- Situacao "POSITIVA COM EFEITOS DE NEGATIVA" (requer mencao na minuta)
- Situacao "POSITIVA" (transacao pode ser bloqueada)
- CPF/CNPJ nao corresponde a nenhum participante da transacao
- Codigo de controle nao validado no site da RFB (validacao online)

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

Nenhum campo e computado automaticamente a partir de outros campos da CND Federal.

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| tipo_pessoa | Inferido pela presenca de CPF ou CNPJ | PF se CPF presente, PJ se CNPJ presente |
| validade_restante | Calculado a partir de data_validade - data_atual | Usado para alertas |
| status_simplificado | Inferido de situacao | REGULAR (se negativa ou CPDEN), IRREGULAR (se positiva) |

### 7.3 Campos Raros

Todos os campos da CND Federal sao padronizados e sempre presentes. Nao ha campos raros ou opcionais que variem entre certidoes.

### 7.4 Validade

- A CND Federal tem validade de **180 dias** a partir da data de emissao
- E emitida **gratuitamente** pelo site da Receita Federal
- Pode ser verificada pelo codigo de controle no site da RFB
- A validacao online retorna os mesmos dados da certidao emitida
- **URL de emissao**: https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/pf/emitir

### 7.5 Situacoes Possiveis

| Situacao | Significado | Impacto na Transacao |
|----------|-------------|---------------------|
| **NEGATIVA** | Nao ha debitos tributarios federais nem inscricoes em divida ativa | Transacao pode prosseguir normalmente |
| **POSITIVA COM EFEITOS DE NEGATIVA** | Ha debitos, mas com suspensao de exigibilidade | Transacao pode prosseguir; recomendar mencao na minuta |
| **POSITIVA** | Ha debitos tributarios exigiveis ou inscricoes em divida ativa | Transacao pode ser bloqueada; recomendado analise de risco e quitacao previa |

### 7.6 Tributos Abrangidos

A CND Federal conjunta abrange todos os tributos administrados pela RFB e inscricoes na Divida Ativa da Uniao:

**Tributos RFB**:
- IRPF / IRPJ - Imposto de Renda
- CSLL - Contribuicao Social sobre o Lucro Liquido
- PIS/PASEP e COFINS - Contribuicoes sobre faturamento
- IPI - Imposto sobre Produtos Industrializados
- IOF - Imposto sobre Operacoes Financeiras
- ITR - Imposto Territorial Rural
- Contribuicoes Previdenciarias (INSS patronal)

**Divida Ativa (PGFN)**:
- Todos os debitos inscritos e nao pagos
- Multas e encargos legais
- Debitos de natureza nao tributaria (multas de orgaos federais, etc.)

### 7.7 Diferenca entre CND Federal e Certidoes Especificas

A CND Federal e uma **certidao conjunta** que substitui a necessidade de emissao de certidoes separadas:

| Antes (Certidoes Separadas) | Agora (Certidao Conjunta) |
|----------------------------|--------------------------|
| Certidao de Tributos Federais (RFB) | CND Federal Conjunta |
| Certidao de Divida Ativa (PGFN) | (unificada) |
| Certidao de INSS | (unificada) |

### 7.8 Importancia para Escrituras

A CND Federal e **documento obrigatorio** para lavratura de escrituras publicas de compra e venda porque:

1. **Protecao ao Comprador**: Debitos tributarios federais podem gerar penhoras sobre bens do devedor
2. **Diligencia Notarial**: O tabeliao deve verificar a regularidade fiscal do alienante
3. **Fraude a Credores**: Alienacao de bens por devedor do fisco pode ser anulada
4. **Registro de Imoveis**: O cartorio pode exigir certidoes para registro da transferencia

### 7.9 Casos Especiais

**Contribuinte com debitos parcelados**:
- Emite-se CPDEN (positiva com efeitos de negativa)
- O parcelamento deve estar em dia
- A escritura pode ser lavrada normalmente

**Contribuinte em discussao judicial**:
- Se houver deposito integral ou garantia, emite-se CPDEN
- A certidao indica a existencia de debito com exigibilidade suspensa
- A escritura pode ser lavrada com ressalvas

**Contribuinte com pendencias de declaracao**:
- Pode impedir a emissao da certidao
- Necessario regularizar as declaracoes pendentes

---

## 8. REFERENCIAS

- **Mapeamento de Campos**: `execution/mapeamento_documento_campos.json`
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Site RFB (emissao e validacao)**: https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/
- **Portaria Conjunta RFB/PGFN 1.751/2014**: Regulamenta a certidao conjunta
- **CTN Art. 205 e 206**: Certidao negativa e certidao positiva com efeitos de negativa
- **Lei 10.522/2002**: Cadastro Informativo de Creditos nao Quitados (CADIN)

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
