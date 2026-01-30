# CNDT - Certidao Negativa de Debitos Trabalhistas

**Complexidade de Extracao**: BAIXA
**Schema Fonte**: `execution/schemas/cndt.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A CNDT (Certidao Negativa de Debitos Trabalhistas) e uma certidao emitida pelo Tribunal Superior do Trabalho (TST) que comprova a inexistencia de debitos trabalhistas perante a Justica do Trabalho. A certidao atesta se uma pessoa fisica ou juridica possui ou nao debitos decorrentes de condenacoes trabalhistas transitadas em julgado ou acordos judiciais trabalhistas, incluindo recolhimentos previdenciarios e FGTS.

A certidao e exigida em transacoes imobiliarias para verificar se o alienante (vendedor) possui dividas trabalhistas que possam comprometer a transacao. A existencia de debitos trabalhistas pode resultar em penhoras sobre bens, incluindo imoveis, para satisfacao de creditos trabalhistas.

O documento e fundamental para:
- Verificacao de regularidade trabalhista das partes em escrituras publicas
- Comprovacao de inexistencia de passivo trabalhista em transacoes imobiliarias
- Diligencia obrigatoria em aquisicoes de imoveis de pessoas juridicas
- Atendimento a exigencias notariais para lavratura de escrituras

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos CNDT atraves dos seguintes padroes textuais:

- `CNDT`
- `CERTIDAO NEGATIVA DE DEBITOS TRABALHISTAS`
- `TRIBUNAL SUPERIOR DO TRABALHO`
- `TST`
- `JUSTICA DO TRABALHO`
- `NADA CONSTA`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **PDF Digital (Padrao)** | Documento PDF gerado pelo site do TST, com QR Code para validacao | Todos os campos padronizados |
| **Certidao Impressa** | Versao impressa do PDF digital, mesma estrutura | Identica ao PDF |
| **Versao Compartilhavel** | Link para validacao online da certidao | Referencia ao numero da certidao |

A CNDT possui formato padronizado nacionalmente, sendo emitida exclusivamente pelo Banco Nacional de Devedores Trabalhistas (BNDT) mantido pelo TST. Nao ha variacoes regionais ou por tribunal, garantindo uniformidade na extracao dos campos.

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| numero_certidao | string | Numero da certidao (20+ digitos) | "12345678901234567890" | `\d{20,}` | Alta |
| nome_pessoa | string | Nome da pessoa ou razao social | "JOAO DA SILVA" | `[A-Z...][A-Z...a-z...\s]+` | Alta |
| cpf | string | CPF do titular | "123.456.789-00" | `\d{3}\.\d{3}\.\d{3}-\d{2}` | Alta |
| data_expedicao | date | Data de emissao da certidao | "27/01/2026" | `\d{2}/\d{2}/\d{4}` | Alta |
| data_validade | date | Data de validade (180 dias) | "26/07/2026" | `\d{2}/\d{2}/\d{4}` | Alta |
| status_certidao | string | Resultado da certidao | "NADA CONSTA" | `(NADA CONSTA\|POSITIVA\|NEGATIVA)` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| cnpj | string | CNPJ se pessoa juridica | "12.345.678/0001-90" | Apenas para Pessoa Juridica | Alta |
| hora_expedicao | string | Hora de emissao da certidao | "10:30:45" | Sempre presente | Alta |
| orgao_emissor | string | Orgao emissor | "TRIBUNAL SUPERIOR DO TRABALHO" | Sempre presente (implicito) | Alta |

### 2.3 Objetos Nested

A CNDT nao possui estrutura nested complexa. Todos os campos sao de nivel raiz, refletindo a simplicidade do documento.

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_pessoa | nome | SIM | Media |
| cpf | cpf | SIM | Media |
| numero_certidao | cndt_numero | SIM | Alta |
| data_expedicao | cndt_data_expedicao | SIM | Alta |
| hora_expedicao | cndt_hora_expedicao | SIM | Media |

**Observacao**: A CNDT e usada principalmente para validacao (verificar se pessoa esta regular), mas os dados de numero e data/hora sao referenciados na minuta como comprovacao da diligencia realizada.

### 3.2 Campos que Alimentam "Pessoa Juridica"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_pessoa (se PJ) | pj_denominacao | SIM | Media |
| cnpj | pj_cnpj | SIM | Media |
| numero_certidao | pj_cndt_numero | SIM | Alta |
| data_expedicao | pj_cndt_data_expedicao | SIM | Alta |
| hora_expedicao | pj_cndt_hora_expedicao | SIM | Media |

**Observacao**: Quando a CNDT e de uma pessoa juridica, os campos sao mapeados para os equivalentes com prefixo `pj_`. A identificacao entre PF e PJ e feita pela presenca do campo `cnpj`.

### 3.3 Campos que Alimentam "Dados do Imovel"

A CNDT **nao alimenta** campos de Imovel.

A certidao e vinculada a pessoa (fisica ou juridica), nao ao imovel objeto da transacao.

### 3.4 Campos que Alimentam "Negocio Juridico"

A CNDT **nao alimenta** diretamente campos de Negocio Juridico.

A certidao e usada para validacao da regularidade das partes, nao para composicao dos termos do negocio.

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| data_validade | Usado para validacao, nao para minuta | Verifica se certidao esta vigente |
| status_certidao | Usado para validacao, nao para minuta | Determina se transacao pode prosseguir |
| orgao_emissor | Sempre TST, nao precisa extrair | Valor constante, desnecessario |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "CNDT",
  "dados_catalogados": {
    "numero_certidao": "12345678901234567890",
    "nome_pessoa": "JOAO DA SILVA",
    "cpf": "123.456.789-00",
    "cnpj": null,
    "data_expedicao": "27/01/2026",
    "hora_expedicao": "10:30:45",
    "data_validade": "26/07/2026",
    "status_certidao": "NADA CONSTA",
    "orgao_emissor": "TRIBUNAL SUPERIOR DO TRABALHO"
  },
  "confianca_extracao": {
    "geral": 0.98,
    "campos_alta_confianca": ["numero_certidao", "cpf", "data_expedicao", "data_validade", "status_certidao"],
    "campos_media_confianca": ["nome_pessoa"]
  },
  "validacoes": {
    "cpf_valido": true,
    "certidao_vigente": true,
    "validade_180_dias_confirmada": true
  }
}
```

**Fonte**: `.tmp/contextual/FC_515_124_p280509/005_CNDT.json`

### 4.1 Exemplo para Pessoa Juridica

```json
{
  "tipo_documento": "CNDT",
  "dados_catalogados": {
    "numero_certidao": "98765432109876543210",
    "nome_pessoa": "EMPRESA EXEMPLO LTDA",
    "cpf": null,
    "cnpj": "12.345.678/0001-90",
    "data_expedicao": "27/01/2026",
    "hora_expedicao": "14:22:10",
    "data_validade": "26/07/2026",
    "status_certidao": "NADA CONSTA",
    "orgao_emissor": "TRIBUNAL SUPERIOR DO TRABALHO"
  },
  "tipo_pessoa": "PJ"
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cpf | RG, CNH, CERTIDAO_CASAMENTO, CND_FEDERAL, COMPROVANTE_RESIDENCIA, IPTU | Identificar mesma pessoa fisica |
| nome_pessoa | Todos os documentos de pessoa | Correlacionar pessoas por nome (fuzzy match) |
| cnpj | CONTRATO_SOCIAL, CND_FEDERAL, CND_MUNICIPAL, CND_ESTADUAL, ITBI | Identificar mesma empresa |

### 5.2 Redundancia Intencional

A CNDT e uma das certidoes obrigatorias para escrituras. O CPF/CNPJ e extraido para correlacionar com o alienante da transacao, permitindo:

1. **Verificacao de identidade**: Confirmar que a certidao pertence ao alienante correto
2. **Validacao cruzada**: Comparar com CPF/CNPJ de outros documentos da mesma pessoa
3. **Deteccao de inconsistencias**: Alertar quando certidao e de pessoa diferente do alienante
4. **Rastreabilidade**: Vincular certidao ao participante correto da transacao

### 5.3 Certidoes Correlatas

A CNDT faz parte do conjunto de certidoes obrigatorias para lavratura de escrituras publicas de compra e venda:

| Certidao | Orgao Emissor | O que Comprova |
|----------|---------------|----------------|
| **CNDT** | TST | Inexistencia de debitos trabalhistas |
| CND Federal (PGFN/RFB) | Receita Federal / PGFN | Regularidade com tributos federais e divida ativa |
| CND Estadual | Secretaria da Fazenda Estadual | Regularidade com tributos estaduais |
| CND Municipal | Prefeitura | Regularidade com tributos municipais |

### 5.4 Hierarquia de Fontes

Para dados de identificacao da pessoa:

1. **RG/CNH** - Fonte primaria de identificacao pessoal
2. **CNDT** - Fonte secundaria (apenas para validacao)
3. **CND Federal** - Fonte secundaria (apenas para validacao)

A CNDT nao e usada como fonte primaria de dados pessoais, apenas para confirmar a regularidade trabalhista.

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| cpf_digito_verificador | Verifica se CPF tem digitos validos | Estrutural |
| cnpj_digito_verificador | Verifica se CNPJ tem digitos validos (se PJ) | Estrutural |
| data_validade_futura | Certidao deve estar dentro da validade | Logica |
| validade_180_dias | Validade deve ser exatamente 180 dias apos expedicao | Logica |
| numero_certidao_formato | Numero deve ter 20+ digitos | Estrutural |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Consequencia |
|-----------|-----------|--------------|
| status_certidao = "NADA CONSTA" | Certidao deve ser negativa | Transacao pode prosseguir |
| status_certidao = "POSITIVA" | Ha debitos trabalhistas pendentes | Transacao pode ser bloqueada |
| status_certidao = "POSITIVA COM EFEITOS DE NEGATIVA" | Ha debitos com garantia judicial | Transacao pode prosseguir com ressalvas |
| CPF/CNPJ corresponde ao alienante | Certidao deve ser do vendedor | Validacao obrigatoria |
| Certidao vigente na data da escritura | Data atual < data_validade | Certidao deve estar valida |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Certidao com menos de 30 dias de validade restante
- Status diferente de "NADA CONSTA"
- CPF/CNPJ nao corresponde a nenhum participante da transacao
- Numero da certidao nao encontrado no site do TST (validacao online)

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

Nenhum campo e computado automaticamente a partir de outros campos da CNDT.

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| tipo_pessoa | Inferido pela presenca de CPF ou CNPJ | PF se CPF presente, PJ se CNPJ presente |
| validade_restante | Calculado a partir de data_validade - data_atual | Usado para alertas |

### 7.3 Campos Raros

Todos os campos da CNDT sao padronizados e sempre presentes. Nao ha campos raros ou opcionais que variem entre certidoes.

### 7.4 Validade

- A CNDT tem validade de **180 dias** a partir da data de expedicao
- E emitida **gratuitamente** pelo site do TST (www.tst.jus.br/certidao)
- Pode ser verificada pelo numero da certidao no site do TST
- A validacao online retorna os mesmos dados da certidao emitida

### 7.5 Status Possiveis

| Status | Significado | Impacto na Transacao |
|--------|-------------|---------------------|
| **NADA CONSTA** | Nao ha debitos trabalhistas registrados no BNDT | Transacao pode prosseguir normalmente |
| **POSITIVA** | Ha debitos trabalhistas pendentes no BNDT | Transacao pode ser bloqueada; recomendado analise de risco |
| **POSITIVA COM EFEITOS DE NEGATIVA** | Ha debitos, mas com suspensao de exigibilidade (garantia judicial, parcelamento, etc.) | Transacao pode prosseguir, mas com ressalvas na minuta |

### 7.6 Banco Nacional de Devedores Trabalhistas (BNDT)

O BNDT e o banco de dados mantido pelo TST que consolida informacoes de todos os Tribunais Regionais do Trabalho sobre:
- Condenacoes trabalhistas transitadas em julgado e nao pagas
- Acordos judiciais trabalhistas descumpridos
- Debitos de FGTS e contribuicoes previdenciarias decorrentes de acoes trabalhistas

### 7.7 Diferenca entre CNDT e Certidoes Civeis

A CNDT atesta apenas a inexistencia de debitos **trabalhistas**. Para verificar acoes civeis (execucoes, protestos, etc.), sao necessarias:
- Certidao de distribuicao de acoes civeis (estadual)
- Certidao de protestos (cartorio de protestos)
- Certidao de execucoes fiscais (Justica Federal e Estadual)

---

## 8. REFERENCIAS

- **Schema JSON**: `execution/schemas/cndt.json`
- **Prompt de Extracao**: `execution/prompts/cndt.txt`
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Site TST (emissao e validacao)**: https://www.tst.jus.br/certidao
- **Lei da CNDT**: Lei 12.440/2011 (instituiu a CNDT)
- **CLT Art. 642-A**: Regulamentacao da CNDT

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
