# CND_MUNICIPAL - Certidao Negativa de Debitos de Tributos Imobiliarios

**Complexidade de Extracao**: BAIXA
**Schema Fonte**: `execution/schemas/cnd_municipal.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A CND Municipal (Certidao Negativa de Debitos de Tributos Imobiliarios) e uma certidao emitida pela Prefeitura Municipal que atesta a situacao fiscal regular de um imovel perante o municipio. O documento comprova a inexistencia de debitos relativos a tributos imobiliarios, especialmente IPTU (Imposto Predial e Territorial Urbano) e taxas municipais incidentes sobre o imovel.

A certidao e fundamental em transacoes imobiliarias por garantir que o imovel objeto da venda nao possui pendencias fiscais que possam ser transferidas ao novo proprietario. Debitos de IPTU e taxas municipais acompanham o imovel (obrigacao propter rem), ou seja, o adquirente pode ser responsabilizado por dividas anteriores a sua aquisicao.

O documento e obrigatorio para:
- Lavratura de escrituras publicas de compra e venda de imoveis
- Financiamentos imobiliarios (exigido pelos bancos)
- Registro de transferencia de propriedade no Cartorio de Registro de Imoveis
- Comprovacao de regularidade fiscal do imovel em licitacoes e contratos publicos

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos CND_MUNICIPAL atraves dos seguintes padroes textuais:

- `CERTIDAO NEGATIVA DE TRIBUTOS`
- `TRIBUTOS IMOBILIARIOS`
- `PREFEITURA`
- `CND MUNICIPAL`
- `SEM DEBITOS`
- `IPTU`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **PDF Digital (Padrao)** | Documento PDF gerado pelo site da Prefeitura, com codigo de verificacao | Todos os campos padronizados |
| **Certidao Conjunta** | Abrange todos os tributos imobiliarios em um unico documento | Lista de tributos cobertos |
| **Certidao Especifica** | Certidao apenas de IPTU ou taxa especifica | Tributo especifico informado |
| **Certidao Impressa** | Versao impressa do PDF digital ou emitida no balcao | Carimbos e assinaturas |

A CND Municipal varia conforme o municipio emissor. Cada prefeitura possui layout proprio, mas os campos essenciais (SQL, contribuinte, situacao fiscal, validade) sao comuns a todas.

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| numero_certidao | string | Numero da certidao | "2026.123.456.789" ou "0001046713-2023" | `[\d\.\-]+` | Alta |
| cadastro_imovel | string | SQL - Setor Quadra Lote do imovel | "039.080.0244-3" | `\d{3}\.\d{3}\.\d{4}-\d` | Alta |
| nome_contribuinte | string | Nome do contribuinte | "JOAO DA SILVA" | `[A-Z\s]+` | Alta |
| situacao_fiscal | string | Situacao fiscal do imovel | "SEM DEBITOS" ou "REGULAR" | `(SEM DEBITOS\|REGULAR\|NEGATIVA\|POSITIVA)` | Alta |
| data_validade | date | Data de validade da certidao | "26/04/2026" | `\d{2}/\d{2}/\d{4}` | Alta |
| data_emissao | date | Data de emissao da certidao | "27/01/2026" | `\d{2}/\d{2}/\d{4}` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| cpf_contribuinte | string | CPF do contribuinte | "123.456.789-00" | Quando disponivel no documento | Alta |
| endereco_imovel | string | Endereco do imovel | "RUA DAS FLORES, 123, APTO 45" | Sempre presente | Alta |
| data_liberacao | date | Data de liberacao da certidao | "27/01/2026" | Em alguns municipios | Alta |
| codigo_autenticidade | string | Codigo para verificacao online | "ABC123-DEF456" ou "E79E8BDE" | Na maioria dos documentos digitais | Alta |
| orgao_emissor | string | Prefeitura emissora | "Prefeitura de Sao Paulo" | Sempre presente (implicito) | Alta |
| secretaria_emissora | string | Secretaria responsavel | "Secretaria Municipal da Fazenda" | Em alguns formatos | Media |
| hora_emissao | string | Hora de emissao da certidao | "14:45:06" | Em documentos digitais | Alta |
| cep_imovel | string | CEP do imovel | "04117-091" | Quando endereco detalhado | Alta |

### 2.3 Arrays

#### 2.3.1 tributos_abrangidos (array)

Array opcional contendo a lista de tributos municipais cobertos pela certidao.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| tributos_abrangidos[] | string | Nome do tributo coberto | "Imposto Predial e Territorial Urbano (IPTU)" | Nao |

**Valores Comuns**:
- Imposto Predial e Territorial Urbano (IPTU)
- Taxa de Limpeza Publica
- Taxa de Conservacao de Vias e Logradouros Publicos
- Taxa de Combate a Sinistros
- Contribuicao de Melhoria
- Taxa de Coleta de Lixo
- Taxa de Iluminacao Publica (quando municipal)

**Notas**:
- Em certidoes conjuntas, lista todos os tributos verificados
- Em certidoes especificas, apenas o tributo solicitado
- A presenca ou ausencia deste campo nao afeta a validade da certidao

### 2.4 Objetos Nested

A CND Municipal nao possui estrutura nested complexa. Todos os campos sao de nivel raiz, refletindo a simplicidade do documento.

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_contribuinte | NOME | NAO (apenas validacao) | Baixa |
| cpf_contribuinte | CPF | NAO (apenas validacao) | Baixa |

**Observacao**: A CND Municipal e usada principalmente para validacao da regularidade fiscal do imovel. Os dados do contribuinte servem para correlacionar com o proprietario/alienante da transacao, mas nao sao fonte primaria de dados pessoais.

### 3.2 Campos que Alimentam "Pessoa Juridica"

A CND Municipal pode ser emitida para imoveis de pessoas juridicas. Neste caso:

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_contribuinte (se PJ) | DENOMINACAO | NAO (apenas validacao) | Baixa |
| cpf_contribuinte (se CNPJ) | CNPJ | NAO (apenas validacao) | Baixa |

**Observacao**: A identificacao entre PF e PJ e feita pelo formato do documento (CPF = 11 digitos, CNPJ = 14 digitos).

### 3.3 Campos que Alimentam "Dados do Imovel"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| cadastro_imovel | SQL | Cadastro Municipal (SQL) | SIM |
| endereco_imovel | LOGRADOURO | Logradouro do imovel | SIM |
| endereco_imovel | NUMERO | Numero do imovel | SIM |
| endereco_imovel | COMPLEMENTO | Complemento (apto, bloco) | SIM |
| endereco_imovel | BAIRRO | Bairro do imovel | SIM |
| endereco_imovel | CIDADE | Cidade do imovel | SIM |
| endereco_imovel | ESTADO | Estado do imovel | SIM |
| cep_imovel | imovel_cep | CEP do imovel | SIM |
| numero_certidao | cnd_tributos_municipais | Referencia da CND municipal na minuta | SIM |

**Observacao**: O endereco na CND Municipal e frequentemente um campo unico que precisa ser parseado para extrair os componentes individuais.

### 3.4 Campos que Alimentam "Negocio Juridico"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| numero_certidao | cnd_tributos_municipais | Numero da certidao para referencia na escritura | SIM |

**Observacao**: A CND Municipal e mencionada nas escrituras como comprovacao de diligencia fiscal realizada sobre o imovel.

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| data_validade | Usado para validacao, nao para minuta | Verifica se certidao esta vigente |
| situacao_fiscal | Usado para validacao, nao para minuta | Determina se transacao pode prosseguir |
| data_liberacao | Metadado do documento | Nao utilizado em minutas |
| hora_emissao | Metadado do documento | Nao utilizado em minutas |
| codigo_autenticidade | Verificacao interna | Para validacao online apenas |
| orgao_emissor | Informativo | Valor pode ser inferido pelo municipio |
| secretaria_emissora | Informativo | Nao utilizado em minutas |
| tributos_abrangidos | Informativo | Lista para referencia, nao vai para minuta |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "CND_MUNICIPAL",
  "dados_catalogados": {
    "tipo_certidao": "CND_MUNICIPAL",
    "nome_certidao_completo": "Certidao Conjunta de Debitos de Tributos Imobiliarios",
    "orgao_emissor": "Prefeitura de Sao Paulo",
    "secretaria_emissora": "Secretaria Municipal da Fazenda",
    "sql": "039.080.0244-3",
    "endereco_imovel": "R FRANCISCO CRUZ, 515, APTO 124 BL-B",
    "cep": "04117-091",
    "contribuinte": "INFORMACAO PROTEGIDA POR SIGILO FISCAL",
    "numero_certidao": "0001046713-2023",
    "data_liberacao": "10/10/2023",
    "data_emissao": "26/10/2023",
    "hora_emissao": "14:45:06",
    "data_validade": "07/04/2024",
    "status": "REGULAR",
    "tributos_cobertos": [
      "Imposto Predial e Territorial Urbano (IPTU)",
      "Taxa de Limpeza Publica",
      "Taxa de Conservacao de Vias e Logradouros Publicos",
      "Taxa de Combate e Sinistros",
      "Contribuicao de Melhoria"
    ],
    "codigo_verificacao": "E79E8BDE"
  },
  "confianca_extracao": {
    "geral": 0.97,
    "campos_alta_confianca": ["numero_certidao", "sql", "data_emissao", "data_validade", "status"],
    "campos_media_confianca": ["endereco_imovel", "tributos_cobertos"]
  },
  "validacoes": {
    "sql_formato_valido": true,
    "certidao_vigente": true,
    "situacao_regular": true
  }
}
```

**Fonte**: `.tmp/contextual/FC_515_124_p280509/CND_MUNICIPAL.json`

### 4.1 Exemplo Simplificado

```json
{
  "tipo_documento": "CND_MUNICIPAL",
  "dados_catalogados": {
    "numero_certidao": "2026.123.456.789",
    "cadastro_imovel": "000.000.0000-0",
    "nome_contribuinte": "JOAO DA SILVA",
    "cpf_contribuinte": "123.456.789-00",
    "endereco_imovel": "RUA DAS FLORES, 123",
    "situacao_fiscal": "SEM DEBITOS",
    "tributos_abrangidos": ["IPTU", "TAXAS"],
    "data_liberacao": "27/01/2026",
    "data_validade": "26/04/2026",
    "data_emissao": "27/01/2026",
    "codigo_autenticidade": "ABC123-DEF456"
  }
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cadastro_imovel (SQL) | IPTU, VVR, ITBI, DADOS_CADASTRAIS | Identificar unicamente o imovel no cadastro municipal |
| endereco_imovel | MATRICULA_IMOVEL, ESCRITURA, COMPROMISSO, IPTU, ITBI | Validar endereco do imovel |
| nome_contribuinte | IPTU, VVR, MATRICULA_IMOVEL (proprietario) | Correlacionar proprietario/contribuinte |
| cpf_contribuinte | RG, CNH, CNDT, CND_FEDERAL, ITBI | Identificar mesma pessoa |

### 5.2 Redundancia Intencional

A CND Municipal e correlacionada com outros documentos para garantir consistencia:

1. **IPTU**: O SQL deve ser identico; contribuinte deve corresponder ao proprietario
2. **VVR (Valor Venal de Referencia)**: SQL deve coincidir; usado no calculo do ITBI
3. **ITBI**: SQL deve coincidir; comprador deve corresponder ao adquirente
4. **MATRICULA_IMOVEL**: Endereco deve coincidir; proprietario deve corresponder

### 5.3 Certidoes Correlatas

A CND Municipal faz parte do conjunto de certidoes fiscais obrigatorias:

| Certidao | Orgao Emissor | O que Comprova |
|----------|---------------|----------------|
| **CND Municipal** | Prefeitura | Regularidade de tributos imobiliarios (IPTU, taxas) |
| CND Federal (PGFN/RFB) | Receita Federal / PGFN | Regularidade com tributos federais e divida ativa |
| CND Estadual | Secretaria da Fazenda Estadual | Regularidade com tributos estaduais |
| CNDT | TST | Inexistencia de debitos trabalhistas (vinculada a pessoa) |

### 5.4 Hierarquia de Fontes

Para dados do imovel:

1. **MATRICULA_IMOVEL** - Fonte primaria de descricao e historico
2. **IPTU / DADOS_CADASTRAIS** - Fonte primaria para SQL e endereco fiscal
3. **CND_MUNICIPAL** - Fonte de validacao fiscal
4. **VVR** - Fonte de valor venal para ITBI
5. **ITBI** - Fonte de dados da transacao

A CND Municipal e usada principalmente para **validacao**, nao como fonte primaria de dados cadastrais do imovel.

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| sql_formato_valido | Verifica se SQL segue padrao 000.000.0000-0 | Estrutural |
| cpf_digito_verificador | Verifica se CPF tem digitos validos (se presente) | Estrutural |
| data_validade_futura | Certidao deve estar dentro da validade | Logica |
| situacao_fiscal_aceita | Status deve ser "REGULAR", "NEGATIVA" ou "SEM DEBITOS" | Logica |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Consequencia |
|-----------|-----------|--------------|
| situacao_fiscal = "SEM DEBITOS" ou "REGULAR" ou "NEGATIVA" | Certidao deve ser negativa | Transacao pode prosseguir |
| situacao_fiscal = "POSITIVA" | Ha debitos de IPTU/taxas pendentes | Transacao pode ser bloqueada ou exigir quitacao previa |
| SQL corresponde ao imovel da transacao | Certidao deve ser do imovel correto | Validacao obrigatoria |
| Certidao vigente na data da escritura | Data atual < data_validade | Certidao deve estar valida |
| Contribuinte corresponde ao alienante | Proprietario fiscal = vendedor | Validacao de titularidade |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Certidao com menos de 30 dias de validade restante
- Status diferente de "SEM DEBITOS", "REGULAR" ou "NEGATIVA"
- SQL nao corresponde ao imovel da matricula ou ITBI
- Contribuinte nao corresponde ao alienante/proprietario registrado
- Codigo de autenticidade nao validado no site da prefeitura

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

Nenhum campo e computado automaticamente a partir de outros campos da CND Municipal.

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| tipo_pessoa | Inferido pela presenca de CPF ou CNPJ | PF se CPF presente, PJ se CNPJ presente |
| validade_restante | Calculado a partir de data_validade - data_atual | Usado para alertas |
| municipio | Inferido do orgao_emissor ou SQL | Identifica prefeitura emissora |

### 7.3 Campos Raros

| Campo | Quando Presente |
|-------|-----------------|
| tributos_abrangidos | Apenas em certidoes conjuntas detalhadas |
| secretaria_emissora | Em alguns formatos de prefeitura |
| hora_emissao | Apenas em certidoes digitais |

### 7.4 Validade

- A CND Municipal tem validade variavel conforme o municipio, geralmente entre **30 e 90 dias**
- Em Sao Paulo, a validade padrao e de **90 dias**
- A certidao e **gratuita** na maioria dos municipios
- Pode ser emitida e validada online pelo site da prefeitura
- A validacao online retorna os mesmos dados da certidao emitida

### 7.5 Status Possiveis

| Status | Significado | Impacto na Transacao |
|--------|-------------|---------------------|
| **SEM DEBITOS** | Nao ha debitos de tributos imobiliarios | Transacao pode prosseguir normalmente |
| **REGULAR** | Situacao fiscal regular (mesmo significado de "SEM DEBITOS") | Transacao pode prosseguir normalmente |
| **NEGATIVA** | Certidao negativa (nao ha debitos) | Transacao pode prosseguir normalmente |
| **POSITIVA** | Ha debitos de IPTU/taxas pendentes | Transacao pode ser bloqueada; quitacao previa recomendada |
| **POSITIVA COM EFEITOS DE NEGATIVA** | Ha debitos, mas com suspensao (parcelamento, discussao judicial) | Transacao pode prosseguir com ressalvas |

### 7.6 Importancia para Escrituras

A CND Municipal e **documento obrigatorio** para lavratura de escrituras publicas de compra e venda porque:

1. **Obrigacao Propter Rem**: Debitos de IPTU e taxas acompanham o imovel, nao o proprietario
2. **Protecao ao Comprador**: O adquirente pode ser cobrado por dividas anteriores
3. **Diligencia Notarial**: O tabeliao deve verificar a regularidade fiscal antes de lavrar a escritura
4. **Registro de Imoveis**: O cartorio de RI pode exigir a certidao para registrar a transferencia

### 7.7 SQL (Setor Quadra Lote)

O SQL e o identificador unico do imovel no cadastro municipal:

- **Formato**: 000.000.0000-0 (padrao Sao Paulo)
- **Composicao**: Setor (3 dig) + Quadra (3 dig) + Lote (4 dig) + Digito verificador
- **Uso**: Identifica univocamente o imovel para fins fiscais
- **Correlacao**: Deve coincidir com SQL do IPTU, VVR e ITBI

### 7.8 Diferenca entre CND Municipal e Certidao de Regularidade de Pessoa

A CND Municipal e vinculada ao **imovel** (SQL), nao a pessoa:
- Comprova que o **imovel** esta regular com tributos municipais
- A certidao e emitida por SQL, nao por CPF/CNPJ
- Mesmo que o proprietario tenha outros debitos pessoais, o imovel pode estar regular

Para verificar debitos pessoais do vendedor, sao necessarias outras certidoes (CND Federal, CNDT, etc.).

---

## 8. REFERENCIAS

- **Schema JSON**: `execution/schemas/cnd_municipal.json`
- **Prompt de Extracao**: `execution/prompts/cnd_municipal.txt`
- **Guia de Campos Imovel**: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Site Prefeitura SP (emissao e validacao)**: https://www.prefeitura.sp.gov.br/
- **CTN Art. 130**: Responsabilidade tributaria do adquirente (obrigacao propter rem)
- **Lei Municipal**: Varia por municipio (Codigo Tributario Municipal)

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
