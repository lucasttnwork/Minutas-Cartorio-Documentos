# CERTIDAO_DISTRIBUIDOR - Certidoes de Distribuidores

**Complexidade de Extracao**: MEDIA
**Schema Fonte**: `execution/schemas/certidao_distribuidor.json` (a criar)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A CERTIDAO_DISTRIBUIDOR e uma categoria que agrupa diversos tipos de certidoes emitidas por distribuidores judiciais e cartorios que atestam a situacao juridica de uma pessoa (fisica ou juridica) perante orgaos judiciais e extrajudiciais.

Estas certidoes fazem parte da "due diligence imobiliaria" - o processo de investigacao necessario para garantir que uma transacao imobiliaria seja segura e transparente. Elas protegem o comprador contra:

1. **Penhora posterior** - Processos civeis podem resultar em penhora do imovel apos a venda
2. **Fraude contra credores** - Vendedor insolvente pode ter a venda anulada judicialmente
3. **Incapacidade civil** - Vendedor interdito nao pode vender sem autorizacao judicial
4. **Due diligence** - Compradores de boa fe devem demonstrar diligencia minima

O documento e fundamental para:
- Verificacao de regularidade juridica das partes em escrituras publicas
- Comprovacao de inexistencia de passivos que possam comprometer a transacao
- Atendimento a exigencias notariais para lavratura de escrituras
- Protecao do adquirente de boa fe

### 1.2 Subtipos de Certidao

| Subtipo | Codigo | Fonte | O que Revela |
|---------|--------|-------|--------------|
| **Civel** | `civel` | Distribuidor Civel (2o Oficio) | Processos civeis em tramitacao |
| **Criminal** | `criminal` | Distribuidor Criminal | Processos criminais |
| **Protesto** | `protesto` | Cartorio de Protesto | Titulos protestados |
| **Falencia** | `falencia` | Distribuidor de Falencias | Falencia/Recuperacao Judicial |
| **Execucao Fiscal** | `execucao_fiscal` | Distribuidor Fiscal | Dividas fiscais em execucao |
| **Interdicao/Tutela** | `interdicao` | Registro Civil (1o Oficio) | Capacidade civil |

### 1.3 Padroes de Identificacao Visual

O sistema identifica documentos CERTIDAO_DISTRIBUIDOR atraves dos seguintes padroes textuais:

**Certidao Civel:**
- `CERTIDAO DE DISTRIBUICAO`
- `DISTRIBUIDOR CIVEL`
- `2o OFICIO`
- `ACOES CIVEIS`
- `NADA CONSTA`

**Certidao Criminal:**
- `CERTIDAO CRIMINAL`
- `DISTRIBUIDOR CRIMINAL`
- `ACOES CRIMINAIS`
- `ANTECEDENTES`

**Certidao de Protesto:**
- `CERTIDAO DE PROTESTO`
- `CARTORIO DE PROTESTO`
- `TITULOS PROTESTADOS`
- `INSTITUTO DE PROTESTO`

**Certidao de Falencia:**
- `CERTIDAO DE FALENCIA`
- `RECUPERACAO JUDICIAL`
- `CONCORDATA`
- `INSOLVENCIA`

**Certidao de Execucao Fiscal:**
- `EXECUCAO FISCAL`
- `CERTIDAO NEGATIVA FISCAL`
- `DIVIDA ATIVA`

**Certidao de Interdicao:**
- `INTERDICAO`
- `TUTELA`
- `CURATELA`
- `CAPACIDADE CIVIL`

### 1.4 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **PDF Digital** | Documento PDF gerado pelo tribunal/cartorio, com codigo de verificacao | Todos os campos padronizados |
| **Certidao Impressa** | Versao impressa do PDF digital | Identica ao PDF |
| **Consulta Online** | Screenshot ou exportacao de consulta online | Pode variar |

As certidoes possuem formato que varia por tribunal/cartorio, mas contem elementos comuns:
- Identificacao do pesquisado (nome, CPF/CNPJ)
- Resultado da pesquisa (Nada Consta / Constam Registros)
- Data de emissao e validade
- Codigo de autenticacao para verificacao online

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos de Identificacao do Pesquisado

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| nome_pesquisado | string | Nome da pessoa pesquisada | "JOAO DA SILVA" | `[A-Z][A-Za-z\s]+` | Alta |
| cpf | string | CPF (pessoa fisica) | "123.456.789-00" | `\d{3}\.\d{3}\.\d{3}-\d{2}` | Alta |
| cnpj | string | CNPJ (pessoa juridica) | "12.345.678/0001-90" | `\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}` | Alta |

### 2.2 Campos da Certidao

| Campo | Tipo | Descricao | Exemplo | Valores Validos | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| tipo_certidao | enum | Subtipo da certidao | "civel" | civel, criminal, protesto, falencia, execucao_fiscal, interdicao | Alta |
| orgao_emissor | string | Tribunal/Cartorio emissor | "TRIBUNAL DE JUSTICA DE SAO PAULO" | - | Alta |
| comarca | string | Comarca de emissao | "SAO PAULO" | - | Alta |
| estado | string | UF do orgao emissor | "SP" | UFs brasileiras | Alta |
| resultado | enum | Status da certidao | "nada_consta" | nada_consta, constam_registros | Alta |
| data_emissao | date | Data de expedicao | "30/01/2026" | `\d{2}/\d{2}/\d{4}` | Alta |
| data_validade | date | Data de validade | "30/04/2026" | `\d{2}/\d{2}/\d{4}` | Alta |
| codigo_verificacao | string | Codigo de autenticidade | "TJ-SP-2026-123456" | - | Alta |

### 2.3 Campos Condicionais (quando constam registros)

| Campo | Tipo | Descricao | Quando Presente | Confianca |
|-------|------|-----------|-----------------|-----------|
| processos | array | Lista de processos encontrados | resultado = constam_registros | Media |
| processo_numero | string | Numero do processo | Por processo | Alta |
| processo_natureza | string | Natureza da acao | Por processo | Media |
| processo_valor | string | Valor da causa | Por processo | Media |
| processo_vara | string | Vara/Juizo | Por processo | Alta |

### 2.4 Objetos Nested

```json
{
  "processos": [
    {
      "numero": "1234567-89.2024.8.26.0100",
      "natureza": "ACAO DE COBRANCA",
      "valor": "R$ 50.000,00",
      "vara": "10a VARA CIVEL",
      "data_distribuicao": "15/03/2024",
      "status": "EM TRAMITACAO"
    }
  ]
}
```

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_pesquisado | NOME | SIM | Media |
| cpf | CPF | SIM | Media |

**Observacao**: A CERTIDAO_DISTRIBUIDOR e usada principalmente para validacao (verificar se pessoa tem processos), mas os dados de identificacao sao referenciados na minuta.

### 3.2 Campos que Alimentam "Pessoa Juridica"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_pesquisado (se PJ) | DENOMINACAO | SIM | Media |
| cnpj | CNPJ | SIM | Media |

### 3.3 Campos que Alimentam "Dados do Imovel"

A CERTIDAO_DISTRIBUIDOR **nao alimenta** campos de Imovel.

A certidao e vinculada a pessoa (fisica ou juridica), nao ao imovel objeto da transacao.

### 3.4 Campos que Alimentam "Negocio Juridico"

A CERTIDAO_DISTRIBUIDOR **nao alimenta** diretamente campos de Negocio Juridico.

A certidao e usada para validacao da regularidade das partes, nao para composicao dos termos do negocio.

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| processos | Usado para analise de risco, nao para minuta | Informacao relevante para decisao |
| processo_valor | Usado para analise de risco | Auxilia na avaliacao |

---

## 4. EXEMPLO DE EXTRACAO REAL

### 4.1 Certidao Civel - Nada Consta

```json
{
  "tipo_documento": "CERTIDAO_DISTRIBUIDOR",
  "dados_catalogados": {
    "tipo_certidao": "civel",
    "nome_pesquisado": "JOAO DA SILVA",
    "cpf": "123.456.789-00",
    "cnpj": null,
    "orgao_emissor": "TRIBUNAL DE JUSTICA DE SAO PAULO",
    "comarca": "SAO PAULO",
    "estado": "SP",
    "resultado": "nada_consta",
    "data_emissao": "30/01/2026",
    "data_validade": "30/04/2026",
    "codigo_verificacao": "TJ-SP-CIVEL-2026-123456",
    "processos": []
  },
  "confianca_extracao": {
    "geral": 0.95,
    "campos_alta_confianca": ["nome_pesquisado", "cpf", "resultado", "data_emissao"],
    "campos_media_confianca": ["orgao_emissor", "comarca"]
  },
  "validacoes": {
    "cpf_valido": true,
    "certidao_vigente": true,
    "resultado_favoravel": true
  }
}
```

### 4.2 Certidao de Protesto - Com Registros

```json
{
  "tipo_documento": "CERTIDAO_DISTRIBUIDOR",
  "dados_catalogados": {
    "tipo_certidao": "protesto",
    "nome_pesquisado": "EMPRESA XYZ LTDA",
    "cpf": null,
    "cnpj": "12.345.678/0001-90",
    "orgao_emissor": "1o TABELIAO DE PROTESTO DE SAO PAULO",
    "comarca": "SAO PAULO",
    "estado": "SP",
    "resultado": "constam_registros",
    "data_emissao": "30/01/2026",
    "data_validade": "30/04/2026",
    "codigo_verificacao": "PROT-SP-2026-789012",
    "processos": [
      {
        "numero": "2024/123456",
        "natureza": "DUPLICATA MERCANTIL",
        "valor": "R$ 15.000,00",
        "credor": "FORNECEDOR ABC LTDA",
        "data_protesto": "10/10/2024"
      }
    ]
  },
  "tipo_pessoa": "PJ",
  "alerta": "CONSTAM PROTESTOS - ANALISE DE RISCO NECESSARIA"
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cpf | RG, CNH, CNDT, CND_FEDERAL, COMPROVANTE_RESIDENCIA | Identificar mesma pessoa fisica |
| nome_pesquisado | Todos os documentos de pessoa | Correlacionar pessoas por nome (fuzzy match) |
| cnpj | CONTRATO_SOCIAL, CNDT, CND_FEDERAL, CND_MUNICIPAL | Identificar mesma empresa |

### 5.2 Redundancia Intencional

A CERTIDAO_DISTRIBUIDOR e uma das certidoes importantes para escrituras. O CPF/CNPJ e extraido para correlacionar com o alienante da transacao, permitindo:

1. **Verificacao de identidade**: Confirmar que a certidao pertence ao alienante correto
2. **Validacao cruzada**: Comparar com CPF/CNPJ de outros documentos da mesma pessoa
3. **Deteccao de inconsistencias**: Alertar quando certidao e de pessoa diferente do alienante

### 5.3 Certidoes Correlatas

A CERTIDAO_DISTRIBUIDOR complementa o conjunto de certidoes do vendedor:

| Certidao | Orgao Emissor | O que Comprova |
|----------|---------------|----------------|
| CNDT | TST | Inexistencia de debitos trabalhistas |
| CND Federal | Receita/PGFN | Regularidade com tributos federais |
| CND Estadual | Sefaz | Regularidade com tributos estaduais |
| CND Municipal | Prefeitura | Regularidade com tributos municipais |
| **CERTIDAO_DISTRIBUIDOR** | **Tribunais/Cartorios** | **Situacao juridica (civil, criminal, protesto, falencia)** |

### 5.4 Hierarquia de Fontes

Para dados de identificacao da pessoa:

1. **RG/CNH** - Fonte primaria de identificacao pessoal
2. **CONTRATO_SOCIAL** - Fonte primaria para PJ
3. **CERTIDAO_DISTRIBUIDOR** - Fonte secundaria (apenas para validacao)

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| cpf_digito_verificador | Verifica se CPF tem digitos validos | Estrutural |
| cnpj_digito_verificador | Verifica se CNPJ tem digitos validos (se PJ) | Estrutural |
| data_validade_futura | Certidao deve estar dentro da validade | Logica |
| validade_90_dias | Validade padrao e 90 dias apos expedicao | Logica |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Consequencia |
|-----------|-----------|--------------|
| resultado = "nada_consta" | Certidao deve ser negativa | Transacao pode prosseguir |
| resultado = "constam_registros" | Ha processos/protestos | Analise de risco necessaria |
| CPF/CNPJ corresponde ao alienante | Certidao deve ser do vendedor | Validacao obrigatoria |
| Certidao vigente na data da escritura | Data atual < data_validade | Certidao deve estar valida |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Certidao com menos de 15 dias de validade restante
- Resultado diferente de "NADA CONSTA"
- CPF/CNPJ nao corresponde a nenhum participante da transacao
- Tipo de certidao essencial ausente (civel, protesto)

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

Nenhum campo e computado automaticamente a partir de outros campos.

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| tipo_pessoa | Inferido pela presenca de CPF ou CNPJ | PF se CPF presente, PJ se CNPJ presente |
| validade_restante | Calculado a partir de data_validade - data_atual | Usado para alertas |
| nivel_risco | Inferido pelo resultado e tipo de certidao | Alto se constam_registros em civel/protesto |

### 7.3 Validade por Tipo

| Tipo de Certidao | Validade Padrao | Observacao |
|------------------|-----------------|------------|
| Civel | 90 dias | Padrao dos tribunais |
| Criminal | 90 dias | Padrao dos tribunais |
| Protesto | 90 dias | Varia por cartorio |
| Falencia | 90 dias | Padrao dos tribunais |
| Execucao Fiscal | 90 dias | Pode variar |
| Interdicao/Tutela | 180 dias | Validade maior |

### 7.4 Status Possiveis

| Resultado | Significado | Impacto na Transacao |
|-----------|-------------|---------------------|
| **NADA CONSTA** | Sem registros no periodo pesquisado | Transacao pode prosseguir |
| **CONSTAM REGISTROS** | Ha processos/protestos ativos | Analise de risco necessaria |

### 7.5 Periodo de Pesquisa

| Tipo de Certidao | Periodo Minimo | Periodo Recomendado |
|------------------|----------------|---------------------|
| Civel | 5 anos | 10 anos |
| Criminal | 5 anos | 10 anos |
| Protesto | 5 anos | 10 anos |
| Falencia | 5 anos | 10 anos |
| Execucao Fiscal | 5 anos | 10 anos |
| Interdicao | Toda a vida | Toda a vida |

---

## 8. LEGISLACAO APLICAVEL

| Lei/Norma | Assunto |
|-----------|---------|
| Lei 8.935/1994 | Funcionamento dos cartorios |
| Lei 11.101/2005 | Falencia e Recuperacao Judicial |
| Lei 10.406/2002 (CC) | Capacidade civil, boa fe |
| Lei 14.825/2024 | Protecao ao adquirente de boa fe |

---

## 9. REFERENCIAS

- **Schema JSON**: `execution/schemas/certidao_distribuidor.json` (a criar)
- **Guia de Campos**: `documentacao-campos-extraiveis/campos-uteis/CERTIDAO_DISTRIBUIDOR.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Pesquisa Completa**: `pesquisa-documentos-escritura/10-certidoes-distribuidores.md`
- **Resumo Consolidado**: `pesquisa-documentos-escritura/RESUMO_CONSOLIDADO.md`

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa - novo tipo de documento |
