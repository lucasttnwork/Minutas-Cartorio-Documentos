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

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| plataforma | string | Plataforma de assinatura utilizada | "DOCUSIGN" | `(DOCUSIGN\|ADOBE SIGN\|CLICKSIGN\|D4SIGN\|ZAPSIGN)` | Alta |
| envelope_id | string | Identificador unico do envelope/processo | "BBD017A3224B4B11E8D29269736F25BD7" | `[A-Z0-9-]{20,}` | Alta |
| signatarios | array | Lista de pessoas que assinaram | [...] | - | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| documento_nome | string | Nome do documento assinado | "Compromisso_Compra_Venda.pdf" | Sempre presente | Alta |
| data_envio | date | Data de envio para assinatura | "10/10/2023" | Maioria das plataformas | Alta |
| data_conclusao | date | Data de conclusao de todas assinaturas | "12/10/2023" | Quando processo concluido | Alta |
| status_envelope | string | Status atual do processo | "CONCLUIDO" | Sempre presente | Alta |
| hash_documento | string | Hash criptografico do documento | "a3b2c1d4e5f6..." | Plataformas avancadas | Media |
| total_paginas | number | Numero de paginas do documento | 9 | DocuSign, Adobe Sign | Alta |
| total_assinaturas | number | Quantidade de assinaturas coletadas | 3 | Maioria das plataformas | Alta |
| total_rubricas | number | Quantidade de rubricas/iniciais | 35 | DocuSign | Media |
| assinatura_guiada | string | Se assinatura guiada estava ativa | "ATIVADO" | DocuSign | Baixa |

### 2.3 Arrays

#### 2.3.1 signatarios (array)

Lista de signatarios do documento. Este e o principal array do documento. Confianca esperada: ALTA.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| signatarios[].nome | string | Nome completo do signatario | "Elizete Aparecida Silva" | Sim |
| signatarios[].email | string | E-mail do signatario | "elizetesilva85@hotmail.com" | Sim |
| signatarios[].cpf | string | CPF do signatario (quando informado) | "949.735.638-20" | Nao |
| signatarios[].status | string | Status da assinatura | "ASSINADO" | Sim |
| signatarios[].data_assinatura | string | Data e hora da assinatura | "10/10/2023 15:14:50" | Sim (se assinado) |
| signatarios[].ip_assinatura | string | IP do dispositivo usado | "187.38.185.233" | Sim (se assinado) |
| signatarios[].dispositivo | string | Tipo de dispositivo | "CELULAR" | Nao |
| signatarios[].certificado | string | Informacoes do certificado digital | "CN=Elizete..." | Nao |
| signatarios[].papel | string | Papel no processo | "SIGNATARIO" | Nao |

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

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| signatarios[].timeline.enviado | datetime | Quando foi enviado para o signatario | "10/10/2023 12:17:58" |
| signatarios[].timeline.visualizado | datetime | Quando o signatario abriu o documento | "10/10/2023 15:09:50" |
| signatarios[].timeline.assinado | datetime | Quando efetivamente assinou | "10/10/2023 15:14:50" |

### 2.4 Objetos Nested

#### 2.4.1 identificacao_documento (object)

Informacoes de identificacao do documento assinado:

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| identificacao_documento.plataforma | string | Plataforma utilizada | "DOCUSIGN" |
| identificacao_documento.envelope_id | string | ID do envelope | "BBD017A3..." |
| identificacao_documento.titulo_documento_completo | string | Titulo original do documento | "Compromisso de Compra e Venda [894066473]" |
| identificacao_documento.status | string | Status geral | "COMPLETO" |

#### 2.4.2 datas_envelope (object)

Datas do ciclo de vida do envelope:

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| datas_envelope.criacao | datetime | Data de criacao do envelope | "10/10/2023 12:17:56" |
| datas_envelope.conclusao | datetime | Data de conclusao | "12/10/2023 19:29:56" |
| datas_envelope.expiracao | datetime | Data de expiracao (se aplicavel) | "10/11/2023 12:17:56" |

#### 2.4.3 configuracoes_envelope (object)

Configuracoes do processo de assinatura:

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| configuracoes_envelope.documentar_paginas | number | Numero de paginas | 9 |
| configuracoes_envelope.total_assinaturas_esperadas | number | Assinaturas esperadas | 3 |
| configuracoes_envelope.total_rubricas | number | Rubricas esperadas | 35 |
| configuracoes_envelope.assinatura_guiada | string | Se usa assinatura guiada | "ATIVADO" |

---

## 3. MAPEAMENTO SCHEMA --> MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Observacao |
|-----------------|---------------|-------------------|------------|
| signatarios[].nome | - | NAO | Usado apenas para correlacao |
| signatarios[].email | - | NAO | Usado apenas para correlacao |
| signatarios[].cpf | - | NAO | Usado apenas para correlacao/validacao |

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

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| plataforma | Metadado tecnico | Nao relevante para minutas |
| envelope_id | Identificador tecnico | Usado para correlacao, nao para minuta |
| documento_nome | Metadado | Usado para identificar o documento correlacionado |
| ip_assinatura | Dado de auditoria | Nao usado em minutas |
| dispositivo | Dado de auditoria | Nao usado em minutas |
| certificado | Dado tecnico | Nao usado em minutas |
| hash_documento | Dado de integridade | Nao usado em minutas |
| status_envelope | Dado de validacao | Usado para confirmar conclusao |
| configuracoes_envelope | Metadados | Nao relevante para minutas |

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

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| signatarios[].nome | COMPROMISSO_COMPRA_VENDA (vendedores, compradores) | Validar que partes assinaram |
| signatarios[].email | COMPROMISSO_COMPRA_VENDA (vendedores[].email, compradores[].email) | Correlacionar signatario com parte |
| signatarios[].cpf | RG, CNH, COMPROMISSO_COMPRA_VENDA | Identificacao inequivoca do signatario |
| documento_nome | COMPROMISSO_COMPRA_VENDA (arquivo_origem) | Vincular certificado ao documento |
| envelope_id | COMPROMISSO_COMPRA_VENDA (assinatura_digital.envelope_id) | Vincular certificado ao contrato |

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

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| envelope_id_formato_valido | Formato do ID compativel com plataforma | Estrutural |
| todos_signatarios_assinaram | Todos os signatarios tem status ASSINADO | Logica |
| status_envelope_concluido | Envelope tem status CONCLUIDO | Logica |
| datas_coerentes | Data conclusao >= data criacao >= data envio | Logica |
| quantidade_signatarios_positiva | Ao menos 1 signatario no array | Estrutural |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Consequencia |
|-----------|-----------|--------------|
| signatarios_correspondem_partes | Signatarios sao vendedores/compradores do CCV | Valida autenticidade |
| todos_vendedores_assinaram | Todos os vendedores do CCV assinaram | Contrato valido |
| todos_compradores_assinaram | Todos os compradores do CCV assinaram | Contrato valido |
| conjuges_assinaram | Conjuges de partes casadas tambem assinaram | Regime de bens respeitado |

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

| Campo Computado | Formula/Logica | Observacao |
|-----------------|----------------|------------|
| todos_assinaram | Verifica se todos signatarios tem status ASSINADO | Validacao booleana |
| tempo_total_assinatura | data_conclusao - data_criacao | Tempo em dias/horas |
| ultimo_signatario | Signatario com maior data_assinatura | Identificacao |

### 7.2 Campos Inferidos

| Campo Inferido | Origem | Logica de Inferencia |
|----------------|--------|---------------------|
| plataforma | envelope_id | Formato do ID identifica a plataforma |
| tipo_assinatura | certificado | Presenca de certificado ICP-Brasil indica qualificada |

### 7.3 Formatos de Envelope ID por Plataforma

| Plataforma | Formato do Envelope ID | Exemplo |
|------------|------------------------|---------|
| DocuSign | UUID (32 hex sem hifen ou com hifen) | BBD017A3224B4B11E8D29269736F25BD7 |
| Adobe Sign | Alfanumerico com prefixo | CBJCHBCAABAAu5PZx... |
| ClickSign | Alfanumerico com hifen | abc-123-def-456 |
| D4Sign | Numerico longo | 12345678901234567890 |
| ZapSign | Alfanumerico curto | ZABC123 |

### 7.4 Timezones

- **DocuSign**: Datas em UTC por padrao, pode converter para timezone local
- **Adobe Sign**: Datas em timezone do remetente
- **ClickSign**: Datas em horario de Brasilia (BRT/BRST)
- **D4Sign**: Datas em horario de Brasilia
- **ZapSign**: Datas em horario de Brasilia

### 7.5 Validade Juridica

**Assinatura Eletronica vs ICP-Brasil:**

| Aspecto | Assinatura Eletronica (DocuSign, etc) | Assinatura ICP-Brasil |
|---------|--------------------------------------|----------------------|
| Base Legal | MP 2.200-2/2001, Art. 10, §2 | MP 2.200-2/2001, Art. 10, §1 |
| Validade | Valida se partes concordam | Presuncao de veracidade (fe publica) |
| Uso em Contratos | Sim (contratos particulares) | Sim (todos os tipos) |
| Uso em Escrituras | Nao (exceto e-Notariado) | Sim (obrigatorio) |
| Custo | Pago por uso da plataforma | Certificado digital + token |
| Verificacao | Portal da plataforma | Portal ITI/ICP-Brasil |

**Para Compromisso de Compra e Venda:**
- Assinatura eletronica simples/avancada e **suficiente** e **valida**
- Tribunais brasileiros reconhecem validade de contratos assinados eletronicamente
- Lei 14.063/2020 regulamentou uso de assinaturas eletronicas

### 7.6 Verificacao de Autenticidade

Cada plataforma oferece forma de verificar autenticidade:

| Plataforma | Como Verificar |
|------------|----------------|
| DocuSign | docusign.com/verify com envelope_id |
| Adobe Sign | QR Code no documento ou portal Adobe |
| ClickSign | clicksign.com/verificar com codigo |
| D4Sign | d4sign.com.br/verificar com codigo |
| ZapSign | QR Code no documento |

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

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
