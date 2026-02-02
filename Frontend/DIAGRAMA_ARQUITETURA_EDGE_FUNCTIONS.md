# Diagrama de Arquitetura - Edge Functions

## 🏗️ Estrutura Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React SPA)                            │
│  - Upload de documentos                                                 │
│  - Chamadas HTTP para edge functions                                    │
│  - Display de resultados                                                │
└────────────────────┬────────────────────────────────────────────────────┘
                     │
                     │ HTTP/POST com Auth
                     ↓
┌─────────────────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (Deno Runtime)                      │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  classify-       │  │  extract-        │  │  map-to-fields   │      │
│  │  document        │  │  document        │  │  (future)        │      │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤      │
│  │ Classifica tipo  │  │ Extrai dados     │  │ Mapeia para      │      │
│  │ documento        │  │ estruturados     │  │ campos            │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  generate-       │  │  extract-        │  │  agentes-        │      │
│  │  minuta          │  │  template-text   │  │  especialistas   │      │
│  │  (novo!)         │  │  (novo!)         │  │  (legacy)        │      │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤      │
│  │ Gera minuta      │  │ Extrai texto     │  │ Sistema de       │      │
│  │ completa         │  │ de templates     │  │ agentes antigo   │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                          │
└──────────────────┬───────────────────┬────────────────────┬─────────────┘
                   │                   │                    │
                   ↓                   ↓                    ↓
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │   SHARED UTILS   │  │   SUPABASE DB    │  │  GOOGLE GEMINI   │
        │  (_shared/)      │  │                  │  │      API         │
        ├──────────────────┤  ├──────────────────┤  ├──────────────────┤
        │ • cors.ts        │  │ • documentos     │  │ • Model:         │
        │ • gemini-client  │  │ • minutas        │  │   gemini-2.0-    │
        │ • file-          │  │ • agent_exec.    │  │   flash          │
        │   normalizer     │  │ • agent_prompts  │  │ • Max: 50MB      │
        │ • execution-     │  │ • minutas_padrao │  │ • Supports:      │
        │   logger         │  │                  │  │   PDF, images,   │
        │ • prompts        │  │                  │  │   text, DOCX*    │
        │ • templates      │  │                  │  │   (*via Mammoth) │
        │ • types          │  │                  │  │                  │
        └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🔄 Pipeline de Processamento

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DOCUMENTO UPLOAD PIPELINE                            │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: CLASSIFICAÇÃO
┌────────────────────────────────────────────────────────────────┐
│ [Frontend Upload] → classify-document (edge function)          │
├────────────────────────────────────────────────────────────────┤
│ 1. Download arquivo do Storage                                 │
│ 2. Normalizar arquivo (DOCX → HTML via Mammoth)              │
│ 3. Chamar Gemini com prompt CLASSIFICATION                     │
│ 4. Parse resultado → ClassificationResult                      │
│ 5. UPDATE documentos SET tipo_documento = result               │
│ 6. Log execução com custo                                      │
│ Status: pendente → classificando → classificado                │
└────────────────────────────────────────────────────────────────┘
                           ↓
STEP 2: EXTRAÇÃO
┌────────────────────────────────────────────────────────────────┐
│ (Triggered quando status = 'classificado')                      │
│ extract-document (edge function)                               │
├────────────────────────────────────────────────────────────────┤
│ 1. Load extraction prompt de agent_prompts (por tipo_documento)│
│ 2. Download arquivo do Storage                                 │
│ 3. Normalizar arquivo                                          │
│ 4. Chamar Gemini com prompt dinâmico                           │
│ 5. Parse resultado → ExtractionResult                          │
│ 6. UPDATE documentos SET dados_extraidos = result              │
│ 7. Log execução com custo e versão do prompt                   │
│ Status: classificado → extraindo → extraido                    │
└────────────────────────────────────────────────────────────────┘
                           ↓
STEP 3: MAPEAMENTO DE CAMPOS (FUTURE)
┌────────────────────────────────────────────────────────────────┐
│ (Triggered quando status = 'extraido')                          │
│ map-to-fields (edge function)                                  │
├────────────────────────────────────────────────────────────────┤
│ 1. Query dados_extraidos do documento                          │
│ 2. Mapear para estrutura MappedFields                          │
│ 3. Validar campos obrigatórios                                 │
│ 4. UPDATE minutas SET mapped_fields = result                   │
│ 5. Log execução                                                │
│ Status: extraido → mapeado                                     │
└────────────────────────────────────────────────────────────────┘
                           ↓
STEP 4: GERAÇÃO DE MINUTA
┌────────────────────────────────────────────────────────────────┐
│ (Triggered manualmente ou por workflow)                         │
│ generate-minuta (edge function)                                │
├────────────────────────────────────────────────────────────────┤
│ 1. Agregar dados de múltiplos documentos                       │
│ 2. Load template MINUTA_TEMPLATES[template_type]               │
│ 3. Mapear dados para placeholders                              │
│ 4. Chamar Gemini com prompt generation + template              │
│ 5. Parse resultado → minuta_texto                              │
│ 6. UPDATE minutas SET minuta_texto = result                    │
│ 7. Log execução com custo                                      │
│ Status: processando → revisao                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 Diagrama de Dependências - _shared/

```
_shared/
│
├─ cors.ts
│  └─ Exporta: corsHeaders
│     ├─ Usado por: TODAS as edge functions
│
├─ supabase-client.ts
│  └─ Exporta: createServiceClient(), createSupabaseClient()
│     ├─ createServiceClient() → Bypass RLS
│     │  └─ Usado por: Todas (service role access)
│     └─ createSupabaseClient() → Respeita RLS
│        └─ Usado por: Operações que respeitam permissões
│
├─ gemini-client.ts
│  └─ Exporta: callGemini(), parseGeminiJson(), arrayBufferToBase64()
│     └─ Usado por: classify, extract, generate
│        ├─ callGemini() → Chama API Google Gemini 2.0-Flash
│        ├─ parseGeminiJson() → Robusto contra formatação quebrada
│        └─ arrayBufferToBase64() → Converte arquivo para base64
│
├─ file-normalizer.ts
│  └─ Exporta: normalizeFilesForGemini(), isMimeTypeSupported(), etc
│     └─ Usado por: Qualquer edge function que aceita arquivos
│        ├─ Suporta nativo: PDF, imagens, texto
│        └─ Converte: DOCX → HTML (via Mammoth.js)
│
├─ execution-logger.ts
│  └─ Exporta: startExecution(), logSuccess(), logError(), withExecutionLogging()
│     └─ Usado por: TODAS as edge functions
│        ├─ Registra em agent_executions
│        ├─ Calcula custo (Gemini pricing)
│        └─ Tracks tokens de entrada/saída
│
├─ prompts.ts
│  └─ Exporta: loadClassificationPrompt(), loadExtractionPrompt()
│     └─ Usado por: classify-document, extract-document
│        ├─ Load de agent_prompts (versionado)
│        ├─ Fallback para versão compacta se arquivo > 2MB
│        └─ Permite A/B testing de prompts
│
├─ templates.ts
│  └─ Exporta: QUALIFICATION_TEMPLATES, MINUTA_TEMPLATES, replacePlaceholders()
│     └─ Usado por: generate-minuta, map-to-fields
│        ├─ Templates de qualificação (7 tipos)
│        ├─ Template de minuta (venda_compra)
│        └─ Funções de formatação (datas, valores, endereços)
│
└─ types.ts
   └─ Exporta: VALID_DOCUMENT_TYPES, ClassificationResult, ExtractionResult, etc
      └─ Usado por: TODAS as edge functions
         ├─ Type safety
         └─ Contrato de dados
```

---

## 🔗 Fluxo de Dados - Exemplo Real

```
╔════════════════════════════════════════════════════════════════════╗
║         USUÁRIO UPLOAD: CNH + RG + CONTRATO SOCIAL                ║
╚════════════════════════════════════════════════════════════════════╝

                    ┌─── CNH.pdf (1.2MB)
                    │
                    ├─── RG.jpg (2.5MB)
                    │
                    └─── Contrato_Social.docx (0.8MB)
                           │
                           ↓
                    ┌──────────────────────┐
                    │ uploadDocumentos()   │
                    │ (Frontend/React)     │
                    └──────┬───────────────┘
                           │
                           │ INSERT INTO documentos
                           │ storage.upload()
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ TABLE: documentos                                               │
├─────────────────────────────────────────────────────────────────┤
│ id  │ nome     │ tipo_documento │ status        │ storage_path  │
├─────┼──────────┼────────────────┼───────────────┼───────────────┤
│ d1  │ CNH.pdf  │ NULL           │ pendente      │ docs/cnh.pdf  │
│ d2  │ RG.jpg   │ NULL           │ pendente      │ docs/rg.jpg   │
│ d3  │ Contrato │ NULL           │ pendente      │ docs/contr... │
└─────┴──────────┴────────────────┴───────────────┴───────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓

   [POST]             [POST]             [POST]
classify-         classify-          classify-
document(d1)      document(d2)        document(d3)
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
     Gemini            Gemini              Gemini
   (CLASSIFY)      (CLASSIFY)         (CLASSIFY)
        │                  │                  │
        ↓                  ↓                  ↓
  tipo: CNH       tipo: RG          tipo: CONTRATO_SOCIAL
  conf: Alta      conf: Alta        conf: Media
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ↓             ↓
                 UPDATE        UPDATE
              documentos       documentos
              tipo_documento   tipo_documento
                   │                │
                   ↓                ↓
┌──────────────────────────────────────────────────────────────┐
│ TABLE: documentos (UPDATED)                                  │
├──────────────────────────────────────────────────────────────┤
│ id │ nome     │ tipo_documento        │ status       │       │
├────┼──────────┼───────────────────────┼──────────────┤       │
│ d1 │ CNH.pdf  │ CNH                   │ classificado │       │
│ d2 │ RG.jpg   │ RG                    │ classificado │       │
│ d3 │ Contrato │ CONTRATO_SOCIAL       │ classificado │       │
└────┴──────────┴───────────────────────┴──────────────┘       │
                           │                                   │
        ┌──────────────────┼──────────────────┐               │
        ↓                  ↓                  ↓               │
   [POST]             [POST]             [POST]              │
extract-           extract-             extract-            │
document(d1)       document(d2)          document(d3)        │
        │                  │                  │              │
        │ Load extraction  │ Load extraction  │ Load          │
        │ prompt CNH       │ prompt RG        │ extraction    │
        │ (from DB v2)     │ (from DB v1)     │ prompt        │
        │                  │                  │ CONTRATO_...  │
        ↓                  ↓                  ↓              │
    Gemini            Gemini             Gemini             │
   (EXTRACT)       (EXTRACT)           (EXTRACT)           │
        │                  │                  │              │
        ↓                  ↓                  ↓              │
  dados_extraidos  dados_extraidos   dados_extraidos       │
  - nome           - numero          - razao_social        │
  - cpf            - orgao_emissor    - cnpj               │
  - rg             - data_validade    - socios             │
  - data_validade  etc               - endereco            │
  etc                                etc                   │
        │                  │                  │              │
        └──────────────────┼──────────────────┘              │
                           │                                 │
                    UPDATE documentos                        │
                    dados_extraidos =                        │
                       result                                │
                           │                                 │
                           ↓                                 │
┌──────────────────────────────────────────────────────────────┐
│ TABLE: documentos (FULLY PROCESSED)                          │
├──────────────────────────────────────────────────────────────┤
│ id │ nome     │ tipo_documento  │ dados_extraidos      │     │
├────┼──────────┼─────────────────┼──────────────────────┤     │
│ d1 │ CNH.pdf  │ CNH             │ {nome, cpf, rg, ...} │     │
│ d2 │ RG.jpg   │ RG              │ {numero, orgao, ...} │     │
│ d3 │ Contrato │ CONTRATO_SOCIAL │ {razao_social, ...}  │     │
└────┴──────────┴─────────────────┴──────────────────────┘     │
                           │                                   │
                    ┌──────┴──────────┐                        │
                    │                 │                        │
                  Trigger          Manual
                map-to-fields      generate-minuta
                    │                 │
                    ↓                 ↓
              UPDATE minutas    UPDATE minutas
              SET               SET minuta_texto
              mapped_fields     (generated content)
```

---

## 💾 Esquema de Banco - Relações

```
┌──────────────────────────────────────────────────────────────┐
│                    SCHEMA DO BANCO                           │
└──────────────────────────────────────────────────────────────┘

                      ┌─────────────────────┐
                      │      minutas        │
                      ├─────────────────────┤
                      │ id (PK)             │
                      │ user_id (FK)        │
                      │ minuta_texto        │
                      │ status              │
                      │ tipo_ato            │
                      └────────┬────────────┘
                               │
                      ┌────────┴────────┐
                      │                 │
                      ↓                 ↓
        ┌─────────────────────┐  ┌─────────────────────┐
        │     documentos      │  │  minutas_padrao     │
        ├─────────────────────┤  ├─────────────────────┤
        │ id (PK)             │  │ id (PK)             │
        │ minuta_id (FK)      │  │ nome                │
        │ tipo_documento      │  │ tipo                │
        │ status              │  │ texto_extraido      │
        │ dados_extraidos     │  │ secoes              │
        │ storage_path        │  │ campos_identificados│
        │ mime_type           │  │ metadados_extracao  │
        └────────┬────────────┘  │ status              │
                 │               │ storage_path        │
                 │               └─────────────────────┘
                 │
                 └────────────────────────────────┐
                                                  │
                            ┌─────────────────────┴─────┐
                            │                           │
                            ↓                           ↓
                ┌──────────────────────────┐  ┌────────────────────────┐
                │   agent_executions       │  │   agent_prompts        │
                ├──────────────────────────┤  ├────────────────────────┤
                │ id (PK)                  │  │ id (PK)                │
                │ agent_type               │  │ tipo_documento         │
                │ documento_id (FK)        │  │ prompt_text            │
                │ minuta_id (FK)           │  │ versao                 │
                │ status                   │  │ ativo                  │
                │ started_at               │  │ criado_em              │
                │ completed_at             │  └────────────────────────┘
                │ input_tokens             │
                │ output_tokens            │
                │ cost_estimate            │
                │ result                   │
                │ error_message            │
                └──────────────────────────┘
```

---

## 🎯 Fluxo de Execução - Detalhado

```
┌─────────────────────────────────────────────────────────────────────────┐
│          FLUXO COMPLETO: classify-document (exemplo)                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─ REQUEST ────────────────────────────────────────────────────────────────┐
│ POST /functions/v1/classify-document                                      │
│ Authorization: Bearer [JWT_TOKEN]                                        │
│ Content-Type: application/json                                           │
│                                                                           │
│ {                                                                         │
│   "documento_id": "doc-123"                                              │
│ }                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
                                 ↓
                    ┌─ OPTIONS CHECK ──┐
                    │ req.method ===    │
                    │ 'OPTIONS'?        │
                    ├──────────────────┤
                    │ Sim: Return 200   │
                    │      (CORS)       │
                    └──────────────────┘
                                 ↓
                    ┌─ PARSE REQUEST ──┐
                    │ RequestBody:      │
                    │ {documento_id}    │
                    └──────────────────┘
                                 ↓
                    ┌─ VALIDATE ───────┐
                    │ documento_id      │
                    │ required?         │
                    ├──────────────────┤
                    │ Não: Throw Error  │
                    └──────────────────┘
                                 ↓
                    ┌─ START LOGGING ──┐
                    │ execution =       │
                    │ startExecution()  │
                    ├──────────────────┤
                    │ INSERT INTO       │
                    │ agent_executions  │
                    │ {agent_type:      │
                    │  'classify',      │
                    │  status:          │
                    │  'running'}       │
                    └──────────────────┘
                                 ↓
                    ┌─ FETCH DATA ─────┐
                    │ SELECT * FROM     │
                    │ documentos        │
                    │ WHERE id =        │
                    │ documento_id      │
                    └──────────────────┘
                                 ↓
                    ┌─ VALIDATION ─────┐
                    │ documento existe? │
                    ├──────────────────┤
                    │ Não: Throw Error  │
                    │ Sim: Continue     │
                    └──────────────────┘
                                 ↓
                    ┌─ UPDATE STATUS ──┐
                    │ UPDATE documentos │
                    │ status =          │
                    │ 'classificando'   │
                    └──────────────────┘
                                 ↓
                    ┌─ LOAD PROMPT ────┐
                    │ SELECT prompt     │
                    │ FROM              │
                    │ agent_prompts     │
                    │ tipo_documento =  │
                    │ 'CLASSIFICATION'  │
                    └──────────────────┘
                                 ↓
                    ┌─ DOWNLOAD FILE ──┐
                    │ storage.download( │
                    │ storage_path)     │
                    ├──────────────────┤
                    │ Erro: Throw Error │
                    └──────────────────┘
                                 ↓
                    ┌─ NORMALIZE ──────┐
                    │ normalizeFiles    │
                    │ ForGemini()       │
                    ├──────────────────┤
                    │ DOCX → HTML       │
                    │ (se necessário)   │
                    └──────────────────┘
                                 ↓
                    ┌─ TO BASE64 ──────┐
                    │ arrayBufferTo     │
                    │ Base64()          │
                    └──────────────────┘
                                 ↓
         ┌─────────┘───────────────────────────┘──────────┐
         │          CALL GEMINI API                       │
         ├──────────────────────────────────────────────────┤
         │ POST https://generativelanguage.googleapis...    │
         │                                                 │
         │ {                                               │
         │   "contents": [{                                │
         │     "parts": [                                  │
         │       { "inlineData": {                         │
         │           "mimeType": "...",                    │
         │           "data": "[base64]"                    │
         │         }                                       │
         │       },                                        │
         │       { "text": "[prompt]" }                    │
         │     ]                                           │
         │   }],                                           │
         │   "generationConfig": {                         │
         │     "temperature": 0.1,                         │
         │     "maxOutputTokens": 16384                    │
         │   }                                             │
         │ }                                               │
         └──────────────────────────────────────────────────┘
                                 ↓
                    ┌─ PARSE JSON ─────┐
                    │ parseGeminiJson() │
                    │ <ClassificationR> │
                    ├──────────────────┤
                    │ Remove markdown   │
                    │ Handle escapes    │
                    │ Robust parsing    │
                    └──────────────────┘
                                 ↓
                    ┌─ UPDATE DB ──────┐
                    │ UPDATE documentos │
                    │ SET               │
                    │ tipo_documento,   │
                    │ classificacao_... │
                    │ status =          │
                    │ 'classificado'    │
                    └──────────────────┘
                                 ↓
                    ┌─ LOG SUCCESS ────┐
                    │ UPDATE            │
                    │ agent_executions  │
                    │ {                 │
                    │  status:          │
                    │  'success',       │
                    │  completed_at,    │
                    │  input_tokens,    │
                    │  output_tokens,   │
                    │  cost_estimate    │
                    │ }                 │
                    └──────────────────┘
                                 ↓
┌─ RESPONSE ───────────────────────────────────────────────────────────────┐
│ HTTP 200 OK                                                               │
│ Content-Type: application/json                                           │
│                                                                           │
│ {                                                                         │
│   "success": true,                                                        │
│   "result": {                                                             │
│     "tipo_documento": "CNH",                                              │
│     "confianca": "Alta",                                                  │
│     "pessoa_relacionada": null,                                           │
│     "observacao": "Documento claro, sem problemas"                        │
│   }                                                                       │
│ }                                                                         │
└──────────────────────────────────────────────────────────────────────────┘

┌─ ERRO HANDLER ───────────────────────────────────────────────────────────┐
│ Em qualquer ponto do fluxo:                                               │
│                                                                           │
│ catch (error) {                                                           │
│   console.error(error);                                                  │
│   if (execution.id) {                                                    │
│     logError(serviceClient, execution, error);                           │
│   }                                                                       │
│   return Response(                                                       │
│     { success: false, error: error.message },                            │
│     { status: 500, headers: corsHeaders }                                │
│   );                                                                     │
│ }                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🎪 Visão Geral - Todos os Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STACK COMPLETO                                        │
└─────────────────────────────────────────────────────────────────────────┘

FRONTEND              EDGE FUNCTIONS          INFRASTRUCTURE
─────────             ──────────────          ────────────────

React                 Deno Runtime            Supabase
├─ Zustand store      ├─ classify-doc        ├─ PostgreSQL
├─ React Query        ├─ extract-doc         ├─ Storage
├─ Upload hook        ├─ generate-minuta     ├─ Auth JWT
└─ Display results    ├─ map-to-fields       └─ RLS policies
                      ├─ extract-template
                      └─ agentes-esp.
                           │
                           ├─→ _shared/
                           │   ├─ cors
                           │   ├─ db client
                           │   ├─ gemini API
                           │   ├─ normalizer
                           │   ├─ logger
                           │   ├─ prompts
                           │   ├─ templates
                           │   └─ types
                           │
                           └─→ Google Gemini
                               ├─ 2.0-Flash
                               ├─ Vision API
                               └─ Generation
```

Este diagrama fornece uma visão completa de como as edge functions se conectam!
