# ASSINATURA_DIGITAL - Certificado de Conclusao de Assinatura Eletronica

**Complexidade de Extracao**: MUITO_BAIXA
**Schema Fonte**: `execution/schemas/assinatura_digital.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O Certificado de Conclusao de Assinatura Digital (ou Comprovante de Assinatura Eletronica) e um documento gerado automaticamente por plataformas de assinatura eletronica como DocuSign, Adobe Sign, ClickSign, D4Sign e ZapSign. Este documento comprova que um ou mais documentos foram assinados eletronicamente, registrando:

- **Identificacao do Envelope**: Codigo unico que identifica o processo de assinatura
- **Documento Assinado**: Nome e identificacao do documento que foi assinado
- **Signatarios**: Lista completa de pessoas que assinaram o documento
- **Timeline de Assinaturas**: Data, hora, IP e dispositivo de cada assinatura
- **Status do Processo**: Concluido, pendente, cancelado ou expirado
- **Hash/Certificado**: Codigo criptografico que garante a integridade do documento

Este documento tem **complexidade MUITO_BAIXA** porque:
- Estrutura padronizada por plataforma
- Campos bem definidos e consistentes
- Nao requer interpretacao juridica
- Serve principalmente para validacao de autenticidade

**Funcao no Sistema:**
- Validar que documentos como COMPROMISSO_COMPRA_VENDA foram devidamente assinados
- Correlacionar signatarios com partes da transacao
- Comprovar a data e hora efetiva das assinaturas
- Fornecer trilha de auditoria para o processo de assinatura

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos de Assinatura Digital atraves dos seguintes padroes textuais:

- `DOCUSIGN`
- `ADOBE SIGN`
- `ASSINATURA ELETRONICA`
- `ASSINATURA DIGITAL`
- `ENVELOPE ID`
- `CERTIFICATE OF COMPLETION`
- `CERTIFICADO DE CONCLUSAO`
- `CLICKSIGN`
- `D4SIGN`
- `ZAPSIGN`
- `ELECTRONIC RECORD AND SIGNATURE`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Plataforma |
|---------|-----------------|------------|
| **DocuSign Certificate of Completion** | PDF com historico detalhado, IPs, timestamps UTC, envelope ID no formato UUID | DocuSign |
| **Adobe Sign Audit Trail** | PDF com trilha de auditoria, eventos detalhados, certificado PDF/A | Adobe Sign |
| **ClickSign Relatorio** | PDF com QR Code, codigo de verificacao alfanumerico | ClickSign |
| **D4Sign Comprovante** | PDF com codigo numerico longo, hash SHA-256 | D4Sign |
| **ZapSign Certificado** | PDF simplificado, codigo alfanumerico curto | ZapSign |

### 1.4 Tipos de Assinatura Eletronica no Brasil

E importante entender a diferenca entre os tipos de assinatura:

| Tipo | Base Legal | Validade Juridica | Uso Comum |
|------|------------|-------------------|-----------|
| **Assinatura Eletronica Simples** | MP 2.200-2/2001 (Art. 10, §2) | Valida se partes concordam | Contratos particulares, CCV |
| **Assinatura Eletronica Avancada** | Lei 14.063/2020 | Valida com identificacao inequivoca | Documentos empresariais |
| **Assinatura Eletronica Qualificada (ICP-Brasil)** | MP 2.200-2/2001 (Art. 10, §1) | Equivalente a assinatura de proprio punho | Escrituras publicas, atos notariais |

**Para transacoes imobiliarias:**
- **Compromisso de Compra e Venda**: Aceita assinatura eletronica simples ou avancada
- **Escritura Publica**: Requer assinatura qualificada ICP-Brasil ou presencial no cartorio

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| CAMPO | TIPO | DESCRICAO | EXEMPLO | REGEX | CONFIANCA |
|-------|------|-----------|---------|-------|-----------|
| PLATAFORMA | STRING | Plataforma de assinatura utilizada | "DOCUSIGN" | `(DOCUSIGN\|ADOBE SIGN\|CLICKSIGN\|D4SIGN\|ZAPSIGN)` | Alta |
| ENVELOPE_ID | STRING | Identificador unico do envelope/processo | "BBD017A3224B4B11E8D29269736F25BD7" | `[A-Z0-9-]{20,}` | Alta |
| SIGNATARIOS | ARRAY | Lista de pessoas que assinaram | [...] | - | Alta |

### 2.2 Campos Raiz (Opcionais)

| CAMPO | TIPO | DESCRICAO | EXEMPLO | QUANDO PRESENTE | CONFIANCA |
|-------|------|-----------|---------|-----------------|-----------|
| DOCUMENTO_NOME | STRING | Nome do documento assinado | "Compromisso_Compra_Venda.pdf" | Sempre presente | Alta |
| DATA_ENVIO | DATE | Data de envio para assinatura | "10/10/2023" | Maioria das plataformas | Alta |
| DATA_CONCLUSAO | DATE | Data de conclusao de todas assinaturas | "12/10/2023" | Quando processo concluido | Alta |
| STATUS_ENVELOPE | STRING | Status atual do processo | "CONCLUIDO" | Sempre presente | Alta |
| HASH_DOCUMENTO | STRING | Hash criptografico do documento | "a3b2c1d4e5f6..." | Plataformas avancadas | Media |
| TOTAL_PAGINAS | NUMBER | Numero de paginas do documento | 9 | DocuSign, Adobe Sign | Alta |
| TOTAL_ASSINATURAS | NUMBER | Quantidade de assinaturas coletadas | 3 | Maioria das plataformas | Alta |
| TOTAL_RUBRICAS | NUMBER | Quantidade de rubricas/iniciais | 35 | DocuSign | Media |
| ASSINATURA_GUIADA | STRING | Se assinatura guiada estava ativa | "ATIVADO" | DocuSign | Baixa |

### 2.3 Arrays

#### 2.3.1 signatarios (array)

Lista de signatarios do documento. Este e o principal array do documento. Confianca esperada: ALTA.

| SUBCAMPO | TIPO | DESCRICAO | EXEMPLO | OBRIGATORIO |
|----------|------|-----------|---------|-------------|
| SIGNATARIOS[].NOME | STRING | Nome completo do signatario | "Elizete Aparecida Silva" | Sim |
| SIGNATARIOS[].EMAIL | STRING | E-mail do signatario | "elizetesilva85@hotmail.com" | Sim |
| SIGNATARIOS[].CPF | STRING | CPF do signatario (quando informado) | "949.735.638-20" | Nao |
| SIGNATARIOS[].STATUS | STRING | Status da assinatura | "ASSINADO" | Sim |
| SIGNATARIOS[].DATA_ASSINATURA | STRING | Data e hora da assinatura | "10/10/2023 15:14:50" | Sim (se assinado) |
| SIGNATARIOS[].IP_ASSINATURA | STRING | IP do dispositivo usado | "187.38.185.233" | Sim (se assinado) |
| SIGNATARIOS[].DISPOSITIVO | STRING | Tipo de dispositivo | "CELULAR" | Nao |
| SIGNATARIOS[].CERTIFICADO | STRING | Informacoes do certificado digital | "CN=Elizete..." | Nao |
| SIGNATARIOS[].PAPEL | STRING | Papel no processo | "SIGNATARIO" | Nao |

**Valores aceitos para status:**
- ASSINADO
- PENDENTE
- RECUSADO
- CANCELADO
- EXPIRADO

**Valores aceitos para dispositivo:**
- CELULAR
- COMPUTADOR
- TABLET
- DESCONHECIDO

#### 2.3.2 timeline (array ou objeto dentro de signatarios)

Algumas plataformas fornecem timeline detalhada por signatario:

| SUBCAMPO | TIPO | DESCRICAO | EXEMPLO |
|----------|------|-----------|---------|
| SIGNATARIOS[].TIMELINE.ENVIADO | DATETIME | Quando foi enviado para o signatario | "10/10/2023 12:17:58" |
| SIGNATARIOS[].TIMELINE.VISUALIZADO | DATETIME | Quando o signatario abriu o documento | "10/10/2023 15:09:50" |
| SIGNATARIOS[].TIMELINE.ASSINADO | DATETIME | Quando efetivamente assinou | "10/10/2023 15:14:50" |

### 2.4 Objetos Nested

#### 2.4.1 identificacao_documento (object)

Informacoes de identificacao do documento assinado:

| SUBCAMPO | TIPO | DESCRICAO | EXEMPLO |
|----------|------|-----------|---------|
| IDENTIFICACAO_DOCUMENTO.PLATAFORMA | STRING | Plataforma utilizada | "DOCUSIGN" |
| IDENTIFICACAO_DOCUMENTO.ENVELOPE_ID | STRING | ID do envelope | "BBD017A3..." |
| IDENTIFICACAO_DOCUMENTO.TITULO_DOCUMENTO_COMPLETO | STRING | Titulo original do documento | "Compromisso de Compra e Venda [894066473]" |
| IDENTIFICACAO_DOCUMENTO.STATUS | STRING | Status geral | "COMPLETO" |

#### 2.4.2 datas_envelope (object)

Datas do ciclo de vida do envelope:

| SUBCAMPO | TIPO | DESCRICAO | EXEMPLO |
|----------|------|-----------|---------|
| DATAS_ENVELOPE.CRIACAO | DATETIME | Data de criacao do envelope | "10/10/2023 12:17:56" |
| DATAS_ENVELOPE.CONCLUSAO | DATETIME | Data de conclusao | "12/10/2023 19:29:56" |
| DATAS_ENVELOPE.EXPIRACAO | DATETIME | Data de expiracao (se aplicavel) | "10/11/2023 12:17:56" |

#### 2.4.3 configuracoes_envelope (object)

Configuracoes do processo de assinatura:

| SUBCAMPO | TIPO | DESCRICAO | EXEMPLO |
|----------|------|-----------|---------|
| CONFIGURACOES_ENVELOPE.DOCUMENTAR_PAGINAS | NUMBER | Numero de paginas | 9 |
| CONFIGURACOES_ENVELOPE.TOTAL_ASSINATURAS_ESPERADAS | NUMBER | Assinaturas esperadas | 3 |
| CONFIGURACOES_ENVELOPE.TOTAL_RUBRICAS | NUMBER | Rubricas esperadas | 35 |
| CONFIGURACOES_ENVELOPE.ASSINATURA_GUIADA | STRING | Se usa assinatura guiada | "ATIVADO" |

---

## 3. MAPEAMENTO SCHEMA --> MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| CAMPO NO SCHEMA | CAMPO MAPEADO | USADO EM MINUTAS? | OBSERVACAO |
|-----------------|---------------|-------------------|------------|
| SIGNATARIOS[].NOME | - | NAO | Usado apenas para correlacao |
| SIGNATARIOS[].EMAIL | - | NAO | Usado apenas para correlacao |
| SIGNATARIOS[].CPF | - | NAO | Usado apenas para correlacao/validacao |

**Observacao Importante**: A ASSINATURA_DIGITAL **nao alimenta** diretamente campos de minutas. Os dados extraidos sao usados exclusivamente para:
1. Correlacionar signatarios com partes do COMPROMISSO_COMPRA_VENDA
2. Validar que todas as partes assinaram
3. Registrar a data efetiva de assinatura do contrato

### 3.2 Campos que Alimentam "Pessoa Juridica"

A ASSINATURA_DIGITAL **nao alimenta** campos de Pessoa Juridica.

### 3.3 Campos que Alimentam "Dados do Imovel"

A ASSINATURA_DIGITAL **nao alimenta** campos de Imovel.

### 3.4 Campos que Alimentam "Negocio Juridico"

A ASSINATURA_DIGITAL **nao alimenta** diretamente campos de Negocio Juridico.

No entanto, o campo `data_conclusao` pode ser usado para determinar a data efetiva do contrato quando esta nao estiver clara no documento principal.

### 3.5 Campos Nao Mapeados

| CAMPO NO SCHEMA | MOTIVO DA EXCLUSAO | OBSERVACAO |
|-----------------|-------------------|------------|
| PLATAFORMA | Metadado tecnico | Nao relevante para minutas |
| ENVELOPE_ID | Identificador tecnico | Usado para correlacao, nao para minuta |
| DOCUMENTO_NOME | Metadado | Usado para identificar o documento correlacionado |
| IP_ASSINATURA | Dado de auditoria | Nao usado em minutas |
| DISPOSITIVO | Dado de auditoria | Nao usado em minutas |
| CERTIFICADO | Dado tecnico | Nao usado em minutas |
| HASH_DOCUMENTO | Dado de integridade | Nao usado em minutas |
| STATUS_ENVELOPE | Dado de validacao | Usado para confirmar conclusao |
| CONFIGURACOES_ENVELOPE | Metadados | Nao relevante para minutas |

**Conclusao**: Este documento tem **cobertura minima** no mapeamento para minutas. Seu valor esta na **validacao** e **correlacao**, nao na **alimentacao** de campos.

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "ASSINATURA_DIGITAL",
  "identificacao_documento": {
    "plataforma": "DOCUSIGN",
    "envelope_id": "BBD017A3224B4B11E8D29269736F25BD7",
    "titulo_documento_completo": "Compromisso de Compra e Venda [894066473]",
    "status": "COMPLETO"
  },
  "datas_envelope": {
    "criacao": "10/10/2023 12:17:56",
    "conclusao": "12/10/2023 19:29:56"
  },
  "configuracoes_envelope": {
    "documentar_paginas": 9,
    "total_assinaturas_esperadas": 3,
    "total_rubricas": 35,
    "assinatura_guiada": "ATIVADO"
  },
  "partes_contratantes": [
    {
      "nome_completo": "Elizete Aparecida Silva",
      "email": "elizetesilva85@hotmail.com",
      "ip_assinatura": "187.38.185.233",
      "dispositivo": "CELULAR",
      "timeline": {
        "enviado": "10/10/2023 12:17:58",
        "visualizado": "10/10/2023 15:09:50",
        "assinado": "10/10/2023 15:14:50"
      }
    },
    {
      "nome_completo": "Marina Ayub",
      "email": "marina.ayub7@gmail.com",
      "ip_assinatura": "189.96.232.110",
      "dispositivo": "CELULAR",
      "timeline": {
        "assinado": "12/10/2023 19:29:56"
      }
    },
    {
      "nome_completo": "Rodolfo Wolfgang Ortrivano",
      "email": "rortri@gmail.com",
      "ip_assinatura": "187.38.185.233",
      "dispositivo": "CELULAR",
      "timeline": {
        "assinado": "11/10/2023 09:13:11"
      }
    }
  ],
  "confianca_extracao": {
    "geral": 0.99,
    "campos_alta_confianca": ["envelope_id", "plataforma", "signatarios", "datas"],
    "campos_media_confianca": []
  },
  "validacoes": {
    "todos_signatarios_assinaram": true,
    "envelope_concluido": true,
    "quantidade_signatarios": 3
  }
}
```

**Fonte**: Extracao de Certificate of Completion DocuSign vinculado ao COMPROMISSO_COMPRA_VENDA

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| CAMPO | TAMBEM PRESENTE EM | USO NA CORRELACAO |
|-------|-------------------|-------------------|
| SIGNATARIOS[].NOME | COMPROMISSO_COMPRA_VENDA (vendedores, compradores) | Validar que partes assinaram |
| SIGNATARIOS[].EMAIL | COMPROMISSO_COMPRA_VENDA (vendedores[].email, compradores[].email) | Correlacionar signatario com parte |
| SIGNATARIOS[].CPF | RG, CNH, COMPROMISSO_COMPRA_VENDA | Identificacao inequivoca do signatario |
| DOCUMENTO_NOME | COMPROMISSO_COMPRA_VENDA (arquivo_origem) | Vincular certificado ao documento |
| ENVELOPE_ID | COMPROMISSO_COMPRA_VENDA (assinatura_digital.envelope_id) | Vincular certificado ao contrato |

### 5.2 Correlacao Principal: COMPROMISSO_COMPRA_VENDA

A ASSINATURA_DIGITAL tem correlacao **direta e forte** com o COMPROMISSO_COMPRA_VENDA:

```
COMPROMISSO_COMPRA_VENDA
|
+-- assinatura_digital.envelope_id -----+
|                                       |
+-- vendedores[]                        |
|   +-- nome                            |
|   +-- email -------------------------+|
|                                      ||
+-- compradores[]                      ||
    +-- nome                           ||
    +-- email -------------------------+|
                                       ||
                                       vv
                        ASSINATURA_DIGITAL
                        |
                        +-- envelope_id
                        |
                        +-- signatarios[]
                            +-- nome
                            +-- email
                            +-- status
                            +-- data_assinatura
```

**Validacoes de Correlacao:**
1. `envelope_id` do CCV deve corresponder ao `envelope_id` do certificado
2. Todos os `signatarios` devem aparecer como `vendedores` ou `compradores` no CCV
3. Todos os `vendedores` e `compradores` do CCV devem ter `status = ASSINADO`

### 5.3 Redundancia Intencional

A redundancia de nome e email serve para:
1. **Validacao de completude**: Confirmar que todas as partes assinaram
2. **Auditoria**: Registrar quem assinou, quando e de onde
3. **Deteccao de inconsistencias**: Alertar se signatario nao e parte do contrato

### 5.4 Hierarquia de Fontes

Para dados de assinatura:

1. **ASSINATURA_DIGITAL** - Fonte primaria (dados do certificado)
2. **COMPROMISSO_COMPRA_VENDA** - Fonte secundaria (metadados no campo `assinatura_digital`)

Para dados de partes:

1. **COMPROMISSO_COMPRA_VENDA** - Fonte primaria (qualificacao completa)
2. **ASSINATURA_DIGITAL** - Fonte secundaria (apenas nome, email, CPF)

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| VALIDACAO | DESCRICAO | TIPO |
|-----------|-----------|------|
| ENVELOPE_ID_FORMATO_VALIDO | Formato do ID compativel com plataforma | Estrutural |
| TODOS_SIGNATARIOS_ASSINARAM | Todos os signatarios tem status ASSINADO | Logica |
| STATUS_ENVELOPE_CONCLUIDO | Envelope tem status CONCLUIDO | Logica |
| DATAS_COERENTES | Data conclusao >= data criacao >= data envio | Logica |
| QUANTIDADE_SIGNATARIOS_POSITIVA | Ao menos 1 signatario no array | Estrutural |

### 6.2 Validacoes de Negocio

| VALIDACAO | DESCRICAO | CONSEQUENCIA |
|-----------|-----------|--------------|
| SIGNATARIOS_CORRESPONDEM_PARTES | Signatarios sao vendedores/compradores do CCV | Valida autenticidade |
| TODOS_VENDEDORES_ASSINARAM | Todos os vendedores do CCV assinaram | Contrato valido |
| TODOS_COMPRADORES_ASSINARAM | Todos os compradores do CCV assinaram | Contrato valido |
| CONJUGES_ASSINARAM | Conjuges de partes casadas tambem assinaram | Regime de bens respeitado |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Status do envelope diferente de CONCLUIDO
- Signatario presente no certificado mas ausente no CCV
- Parte do CCV ausente no certificado de assinaturas
- Envelope expirado ou cancelado
- Assinatura recusada por algum signatario

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| CAMPO COMPUTADO | FORMULA/LOGICA | OBSERVACAO |
|-----------------|----------------|------------|
| TODOS_ASSINARAM | Verifica se todos signatarios tem status ASSINADO | Validacao booleana |
| TEMPO_TOTAL_ASSINATURA | data_conclusao - data_criacao | Tempo em dias/horas |
| ULTIMO_SIGNATARIO | Signatario com maior data_assinatura | Identificacao |

### 7.2 Campos Inferidos

| CAMPO INFERIDO | ORIGEM | LOGICA DE INFERENCIA |
|----------------|--------|---------------------|
| PLATAFORMA | ENVELOPE_ID | Formato do ID identifica a plataforma |
| TIPO_ASSINATURA | CERTIFICADO | Presenca de certificado ICP-Brasil indica qualificada |

### 7.3 Formatos de Envelope ID por Plataforma

| PLATAFORMA | FORMATO DO ENVELOPE ID | EXEMPLO |
|------------|------------------------|---------|
| DOCUSIGN | UUID (32 HEX SEM HIFEN OU COM HIFEN) | BBD017A3224B4B11E8D29269736F25BD7 |
| ADOBE SIGN | ALFANUMERICO COM PREFIXO | CBJCHBCAABAAu5PZx... |
| CLICKSIGN | ALFANUMERICO COM HIFEN | abc-123-def-456 |
| D4SIGN | NUMERICO LONGO | 12345678901234567890 |
| ZAPSIGN | ALFANUMERICO CURTO | ZABC123 |

### 7.4 Timezones

- **DOCUSIGN**: Datas em UTC por padrao, pode converter para timezone local
- **ADOBE SIGN**: Datas em timezone do remetente
- **CLICKSIGN**: Datas em horario de Brasilia (BRT/BRST)
- **D4SIGN**: Datas em horario de Brasilia
- **ZAPSIGN**: Datas em horario de Brasilia

### 7.5 Validade Juridica

**Assinatura Eletronica vs ICP-Brasil:**

| ASPECTO | ASSINATURA ELETRONICA (DOCUSIGN, ETC) | ASSINATURA ICP-BRASIL |
|---------|--------------------------------------|----------------------|
| BASE LEGAL | MP 2.200-2/2001, ART. 10, §2 | MP 2.200-2/2001, ART. 10, §1 |
| VALIDADE | Valida se partes concordam | Presuncao de veracidade (fe publica) |
| USO EM CONTRATOS | Sim (contratos particulares) | Sim (todos os tipos) |
| USO EM ESCRITURAS | Nao (exceto e-Notariado) | Sim (obrigatorio) |
| CUSTO | Pago por uso da plataforma | Certificado digital + token |
| VERIFICACAO | Portal da plataforma | Portal ITI/ICP-Brasil |

**Para Compromisso de Compra e Venda:**
- Assinatura eletronica simples/avancada e **suficiente** e **valida**
- Tribunais brasileiros reconhecem validade de contratos assinados eletronicamente
- Lei 14.063/2020 regulamentou uso de assinaturas eletronicas

### 7.6 Verificacao de Autenticidade

Cada plataforma oferece forma de verificar autenticidade:

| PLATAFORMA | COMO VERIFICAR |
|------------|----------------|
| DOCUSIGN | docusign.com/verify com envelope_id |
| ADOBE SIGN | QR Code no documento ou portal Adobe |
| CLICKSIGN | clicksign.com/verificar com codigo |
| D4SIGN | d4sign.com.br/verificar com codigo |
| ZAPSIGN | QR Code no documento |

---

## 8. REFERENCIAS

- **Schema JSON**: `execution/schemas/assinatura_digital.json`
- **Prompt de Extracao**: `execution/prompts/assinatura_digital.txt`
- **Documento Correlato**: `documentacao-campos-extraiveis/campos-completos/COMPROMISSO_COMPRA_VENDA.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **MP 2.200-2/2001**: Infraestrutura de Chaves Publicas Brasileira (ICP-Brasil)
- **Lei 14.063/2020**: Uso de assinaturas eletronicas em interacoes com entes publicos
- **DocuSign Legality Guide Brazil**: https://www.docusign.com/how-it-works/legality/global/brazil

---

## CHANGELOG

| DATA | VERSAO | ALTERACAO |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
