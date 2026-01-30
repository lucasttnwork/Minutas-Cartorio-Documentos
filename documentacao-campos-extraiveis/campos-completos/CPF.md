# CPF - Cadastro de Pessoa Fisica

**Complexidade de Extracao**: BAIXA
**Schema Fonte**: Nao possui schema dedicado (extracao generica)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O CPF (Cadastro de Pessoa Fisica) e o documento de identificacao fiscal emitido pela Receita Federal do Brasil. Contem o numero unico de identificacao tributaria do cidadao brasileiro ou estrangeiro residente no pais. E um dos documentos mais simples do sistema, porem fundamental como identificador unico em todas as transacoes imobiliarias e atos notariais.

O documento e fundamental para:
- Identificacao fiscal do cidadao em qualquer ato cartorial
- Verificacao de situacao cadastral perante a Receita Federal
- Correlacao entre documentos (chave primaria de identificacao)
- Consulta de certidoes e pendencias fiscais

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos CPF atraves dos seguintes padroes textuais:

- `CADASTRO DE PESSOAS FISICAS`
- `CPF`
- `RECEITA FEDERAL`
- `MINISTERIO DA FAZENDA`
- `MINISTERIO DA ECONOMIA`
- `REPUBLICA FEDERATIVA DO BRASIL`
- Numero no formato `XXX.XXX.XXX-XX`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **Cartao CPF (Modelo Antigo)** | Cartao plastico azul/branco, formato credito | Nome, CPF, data nascimento |
| **Cartao CPF (Modelo Novo)** | Cartao com QR Code e layout atualizado | Nome, CPF, data inscricao |
| **Comprovante de Situacao Cadastral** | Documento digital gerado via site da Receita | Nome, CPF, situacao, data consulta |
| **CPF Impresso em Outros Documentos** | RG novo, CNH, certidoes | Apenas numero do CPF |
| **e-CPF (Certificado Digital)** | Certificado A1/A3 com CPF | Dados completos do titular |

**Nota**: O CPF como documento isolado e cada vez mais raro. Na pratica, o numero CPF vem impresso em outros documentos (RG, CNH) ou e consultado via Comprovante de Situacao Cadastral online.

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| numero_cpf | string | Numero do CPF com digitos verificadores | "123.456.789-00" | `\d{3}\.?\d{3}\.?\d{3}-?\d{2}` | Alta |
| nome_completo | string | Nome completo do titular | "JOSE DA SILVA" | `[A-Z][A-Z\s]+` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| data_nascimento | date | Data de nascimento do titular | "15/03/1980" | Cartao fisico e alguns comprovantes | Alta |
| situacao_cadastral | string | Situacao perante a Receita Federal | "REGULAR" | Comprovante de Situacao Cadastral | Alta |
| data_inscricao | date | Data de inscricao no CPF | "01/01/1995" | Cartao fisico (modelo antigo) | Media |
| digito_verificador | string | Digitos verificadores separados | "00" | Extraido do numero completo | Alta |
| data_consulta | datetime | Data/hora da consulta (comprovante) | "30/01/2026 14:35:20" | Comprovante de Situacao Cadastral | Alta |
| hora_consulta | time | Hora da consulta (comprovante) | "14:35:20" | Comprovante de Situacao Cadastral | Alta |
| codigo_controle | string | Codigo de controle do comprovante | "AB1C.DE2F.GH3I.JK4L" | Comprovante de Situacao Cadastral | Alta |

### 2.3 Campos Derivados do Comprovante de Situacao Cadastral

Quando o CPF e extraido de um Comprovante de Situacao Cadastral (forma mais comum atualmente), campos adicionais podem estar presentes:

| Campo | Tipo | Descricao | Exemplo | Frequencia |
|-------|------|-----------|---------|------------|
| ano_obito | string | Ano do obito (se titular falecido) | "2020" | Raro |
| situacao_data | date | Data da ultima atualizacao da situacao | "01/01/2020" | Sempre no comprovante |
| nome_mae | string | Nome da mae (parcialmente oculto) | "M*** D* S***" | Versoes antigas do comprovante |

### 2.4 Situacoes Cadastrais Possiveis

O campo `situacao_cadastral` pode assumir os seguintes valores:

| Valor | Descricao | Impacto em Minutas |
|-------|-----------|-------------------|
| **REGULAR** | CPF ativo e sem pendencias | Nenhum impedimento |
| **PENDENTE DE REGULARIZACAO** | Necessita regularizacao | Alerta ao usuario |
| **SUSPENSA** | CPF suspenso pela Receita | Impedimento grave |
| **CANCELADA** | CPF cancelado | Impedimento total |
| **TITULAR FALECIDO** | Obito informado a Receita | Ajuste no fluxo (espolio) |
| **NULA** | Inscricao anulada | Impedimento total |

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_completo | nome | SIM | Media |
| numero_cpf | cpf | SIM | Alta |
| data_nascimento | data_nascimento | SIM | Media |

**Observacoes:**
- O CPF e a **chave primaria** para identificacao de pessoas naturais no sistema
- O campo `cpf` e altamente redundante - presente em 17 tipos de documentos
- O CPF e usado para correlacionar informacoes entre diferentes documentos

### 3.2 Campos que Alimentam "Pessoa Juridica"

O CPF **nao alimenta** diretamente campos de Pessoa Juridica.

No entanto, o CPF de uma pessoa fisica pode ser usado para:
- Identificar socios de empresas
- Identificar administradores
- Identificar procuradores

### 3.3 Campos que Alimentam "Dados do Imovel"

O CPF **nao alimenta** campos de Imovel.

### 3.4 Campos que Alimentam "Negocio Juridico"

O CPF **nao alimenta** diretamente campos de Negocio Juridico.

Os dados sao usados para qualificar as partes (outorgantes, outorgados) nos negocios.

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| situacao_cadastral | Metadado de verificacao | Usado apenas para alertas |
| data_inscricao | Dado historico | Nao relevante para minutas |
| digito_verificador | Redundante | Ja incluso no numero_cpf |
| data_consulta | Metadado do comprovante | Controle interno |
| hora_consulta | Metadado do comprovante | Controle interno |
| codigo_controle | Metadado do comprovante | Validacao de autenticidade |

---

## 4. EXEMPLO DE EXTRACAO REAL

### 4.1 Extracao de Cartao CPF

```json
{
  "tipo_documento": "CPF",
  "dados_catalogados": {
    "nome_completo": "JOSE DA SILVA",
    "numero_cpf": "123.456.789-00",
    "data_nascimento": "15/03/1980"
  },
  "pessoa_relacionada": "JOSE DA SILVA",
  "confianca_extracao": {
    "geral": 0.98,
    "campos_alta_confianca": ["numero_cpf", "nome_completo"],
    "campos_media_confianca": ["data_nascimento"]
  }
}
```

### 4.2 Extracao de Comprovante de Situacao Cadastral

```json
{
  "tipo_documento": "CPF",
  "subtipo": "COMPROVANTE_SITUACAO_CADASTRAL",
  "dados_catalogados": {
    "nome_completo": "JOSE DA SILVA",
    "numero_cpf": "123.456.789-00",
    "situacao_cadastral": "REGULAR",
    "data_consulta": "30/01/2026 14:35:20",
    "codigo_controle": "AB1C.DE2F.GH3I.JK4L"
  },
  "pessoa_relacionada": "JOSE DA SILVA",
  "confianca_extracao": {
    "geral": 0.99,
    "campos_alta_confianca": ["numero_cpf", "nome_completo", "situacao_cadastral"]
  },
  "alertas": []
}
```

### 4.3 Extracao de CPF com Situacao Irregular

```json
{
  "tipo_documento": "CPF",
  "subtipo": "COMPROVANTE_SITUACAO_CADASTRAL",
  "dados_catalogados": {
    "nome_completo": "MARIA OLIVEIRA",
    "numero_cpf": "987.654.321-00",
    "situacao_cadastral": "PENDENTE DE REGULARIZACAO",
    "data_consulta": "30/01/2026 10:00:00"
  },
  "pessoa_relacionada": "MARIA OLIVEIRA",
  "confianca_extracao": {
    "geral": 0.99
  },
  "alertas": [
    {
      "tipo": "SITUACAO_IRREGULAR",
      "mensagem": "CPF com situacao PENDENTE DE REGULARIZACAO",
      "severidade": "alta"
    }
  ]
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL, CONTRATO_SOCIAL, MATRICULA_IMOVEL, ITBI, IPTU, ESCRITURA, COMPROMISSO_COMPRA_VENDA, PROCURACAO, COMPROVANTE_PAGAMENTO, CERTIDAO_NASCIMENTO, CERTIDAO_OBITO, COMPROVANTE_RESIDENCIA, CND_MUNICIPAL, CND_ESTADUAL | **Identificador unico da pessoa** |
| nome_completo | Todos os documentos de pessoa | Match por nome (fuzzy) |
| data_nascimento | RG, CNH, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO, COMPROMISSO_COMPRA_VENDA | Validar identidade |

### 5.2 Papel do CPF na Correlacao

O CPF e o **identificador primario** para correlacao de documentos de pessoa natural:

1. **Chave de Agrupamento**: Todos os documentos com o mesmo CPF sao agrupados como pertencentes a mesma pessoa
2. **Validacao Cruzada**: Nome e data de nascimento sao validados entre documentos com mesmo CPF
3. **Deteccao de Inconsistencias**: Divergencias de nome em documentos com mesmo CPF geram alertas
4. **Resolucao de Ambiguidades**: Nomes similares sao diferenciados pelo CPF

### 5.3 Redundancia Intencional

O CPF aparece em **17 tipos de documentos diferentes** (maior redundancia do sistema). Isso e intencional para:

1. **Garantir disponibilidade**: Se um documento nao tem CPF legivel, outro tera
2. **Validar autenticidade**: CPF deve ser consistente em todos os documentos
3. **Facilitar correlacao**: Multiplas fontes do mesmo dado aumentam confianca

### 5.4 Hierarquia de Fontes para CPF

Para obter o CPF de uma pessoa, a prioridade de extracao e:

1. **RG (modelo novo)** - CPF integrado ao documento de identidade
2. **CNH** - CPF sempre presente
3. **CPF (documento dedicado)** - Fonte primaria quando disponivel
4. **CERTIDAO_CASAMENTO** - CPF dos conjuges
5. **Outros documentos** - CNDT, CND_FEDERAL, ITBI, etc.

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| cpf_digito_verificador | Algoritmo de validacao dos 2 digitos verificadores | Estrutural |
| cpf_formato_valido | CPF segue formato XXX.XXX.XXX-XX | Estrutural |
| cpf_nao_sequencial | CPF nao e sequencia invalida (111.111.111-11) | Estrutural |
| nome_minimo | Nome tem pelo menos 2 palavras | Estrutural |
| data_nascimento_valida | Data no passado e idade razoavel (0-130 anos) | Logica |

### 6.2 Validacao de Digitos Verificadores

O CPF possui um algoritmo de validacao matematica dos digitos verificadores:

```
CPF: ABC.DEF.GHI-JK

Primeiro digito (J):
  soma = A*10 + B*9 + C*8 + D*7 + E*6 + F*5 + G*4 + H*3 + I*2
  resto = soma % 11
  J = (resto < 2) ? 0 : (11 - resto)

Segundo digito (K):
  soma = A*11 + B*10 + C*9 + D*8 + E*7 + F*6 + G*5 + H*4 + I*3 + J*2
  resto = soma % 11
  K = (resto < 2) ? 0 : (11 - resto)
```

### 6.3 CPFs Invalidos Conhecidos

Os seguintes CPFs, embora passem na validacao matematica, sao considerados invalidos:

- 000.000.000-00
- 111.111.111-11
- 222.222.222-22
- 333.333.333-33
- 444.444.444-44
- 555.555.555-55
- 666.666.666-66
- 777.777.777-77
- 888.888.888-88
- 999.999.999-99

### 6.4 Alertas de Qualidade

O sistema gera alertas quando:
- CPF com situacao diferente de REGULAR
- CPF de titular falecido (requer tratamento especial - espolio)
- CPF inconsistente entre documentos do mesmo dossie
- CPF ausente em documentos onde deveria estar presente

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo | Computacao | Exemplo |
|-------|------------|---------|
| digito_verificador | Extraido dos 2 ultimos digitos do CPF | "00" de "123.456.789-00" |
| cpf_formatado | Formatacao padrao XXX.XXX.XXX-XX | "123.456.789-00" |
| cpf_numerico | Apenas digitos, sem formatacao | "12345678900" |

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| tipo_documento_cpf | Inferido do layout visual | cartao_fisico, comprovante_situacao, cpf_em_outro_documento |
| fonte_cpf | Documento de origem do CPF | RG, CNH, CPF, etc. |

### 7.3 Campos Raros

| Campo | Frequencia | Contexto |
|-------|------------|----------|
| data_inscricao | < 10% | Apenas em cartoes CPF antigos |
| nome_mae | < 5% | Versoes antigas de comprovantes |
| ano_obito | < 1% | Apenas para titulares falecidos |

### 7.4 Evolucao Historica do CPF

| Periodo | Caracteristicas | Observacao |
|---------|-----------------|------------|
| Ate 1990 | CIC (Cartao de Identificacao do Contribuinte) | 11 digitos, nome diferente |
| 1990-2000 | Cartao CPF azul | Formato similar ao atual |
| 2000-2010 | Cartao CPF branco/azul | Design atualizado |
| 2010-presente | CPF integrado ao RG e CNH | Cartao dedicado menos comum |
| 2015-presente | Comprovante de Situacao Cadastral online | Forma mais comum de apresentar CPF |

### 7.5 CPF de Estrangeiros

Estrangeiros residentes no Brasil tambem possuem CPF, com algumas particularidades:

- Numero segue o mesmo formato
- Pode estar vinculado a RNE/RNM (Registro Nacional de Estrangeiro/Migrante)
- Situacao cadastral pode indicar tipo de visto

---

## 8. REFERENCIAS

- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Documentacao de Campos Uteis**: `documentacao-campos-extraiveis/campos-uteis/`
- **Documentacao RG (correlato)**: `documentacao-campos-extraiveis/campos-completos/RG.md`
- **Documentacao CNH (correlato)**: `documentacao-campos-extraiveis/campos-completos/CNH.md`
- **Site Receita Federal**: https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
