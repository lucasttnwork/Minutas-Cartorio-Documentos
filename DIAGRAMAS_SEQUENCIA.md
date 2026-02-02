# Diagramas de Sequência - Fluxo de Classificação

## 1. DIAGRAMA: Upload de Documentos

```
UploadDocumentos.tsx                   useDocumentUpload              Supabase
        │                                    │                           │
        │ uploadDocument()                   │                           │
        ├───────────────────────────────────►│                           │
        │                                    │ auth.getUser()            │
        │                                    ├──────────────────────────►│
        │                                    │◄─────── user_id ──────────┤
        │                                    │                           │
        │                                    │ generateStoragePath()     │
        │                                    ├────────────────────┐      │
        │                                    │ → {userId}/{minutaId}/   │
        │                                    │     {timestamp}_{filename}│
        │                                    │◄────────────────────┘     │
        │                                    │                           │
        │                                    │ storage.upload()          │
        │                                    ├──────────────────────────►│
        │                                    │ • bucket: 'documentos'    │
        │                                    │ • path: generated path    │
        │                                    │ • onUploadProgress()      │
        │                                    │◄──── progress ────────────┤
        │ (update UI: progress)              │◄──────────────────────────┤
        │◄─────────────────────────────────────                          │
        │                                    │                           │
        │                                    │ documentos.insert()       │
        │                                    ├──────────────────────────►│
        │                                    │ {                         │
        │                                    │   minuta_id,              │
        │                                    │   nome_original,          │
        │                                    │   storage_path,           │
        │                                    │   mime_type,              │
        │                                    │   tamanho_bytes,          │
        │                                    │   status: 'uploaded'      │
        │                                    │ }                         │
        │                                    │◄─── documento_id ─────────┤
        │                                    │                           │
        │ { id, storagePath }                │                           │
        │◄───────────────────────────────────┤                           │
        │                                    │                           │
        │ (addDocument to context)           │                           │
        │ (status: 'complete')               │                           │
        │                                    │                           │
```

## 2. DIAGRAMA: Processamento Pipeline (Simplified)

```
Processando.tsx              useDocumentPipeline         Edge Functions         Supabase
       │                            │                          │                   │
       │ startPipeline()            │                          │                   │
       ├───────────────────────────►│                          │                   │
       │                            │                          │                   │
       │                            │ SELECT documentos...     │                   │
       │                            ├─────────────────────────────────────────────►│
       │                            │◄──────── [doc1, doc2...] ─────────────────────┤
       │                            │                          │                   │
       │                            │                          │                   │
       │  ┌─ LOOP: for each doc ───┐                          │                   │
       │  │                         │                          │                   │
       │  │ processDocument(doc1)   │                          │                   │
       │  │ ├────────────────────►│                          │                   │
       │  │ │                     │ invoke('classify-document')                   │
       │  │ │ updateStatus(        │ { documento_id }                            │
       │  │ │   'classifying')     ├──────────────────────►│                   │
       │  │ │                      │                      │ Gemini Vision API   │
       │  │ │                      │                      ├──────────────────┐  │
       │  │ │                      │                      │ Download Storage │ │
       │  │ │                      │                      │ Convert Base64   │ │
       │  │ │                      │◄─ result ────────────┤ Call Gemini      │  │
       │  │ │                      │                      │ Parse JSON       │  │
       │  │ │ updateStatus(        │                      │◄──────────────────┘  │
       │  │ │   'extracting')      │                      │                   │
       │  │ │                      │ invoke('extract-document')                  │
       │  │ │                      │ { documento_id }                            │
       │  │ │                      ├──────────────────────►│                   │
       │  │ │                      │                      │ (same as classify)   │
       │  │ │                      │◄─ result ────────────┤                   │
       │  │ │                      │                      │                   │
       │  │ │ updateStatus(        │                      │                   │
       │  │ │   'done')            │                      │                   │
       │  │ │◄────────────────────│                      │                   │
       │  │ │                     │                      │                   │
       │  │ └─ Loop: doc2, doc3...│                      │                   │
       │  │                       │                      │                   │
       │  └─ All docs done ───────┘                      │                   │
       │                            │                      │                   │
       │                            │ invoke('map-to-fields')                  │
       │                            │ { minuta_id }                            │
       │                            ├──────────────────────►│                   │
       │                            │                      │ SELECT documentos │
       │                            │                      │ WHERE status=     │
       │                            │                      │   'extraido' ─────────────────────►│
       │                            │                      │                   │◄─ dados ────────┤
       │                            │                      │ Normalize & Merge │                  │
       │                            │                      │ Resolve Conflicts │                  │
       │                            │                      │                   │                  │
       │                            │                      │ INSERT pessoas_naturais             │
       │                            │                      ├──────────────────────────────────►│
       │                            │                      │ INSERT imoveis                      │
       │                            │                      ├──────────────────────────────────►│
       │                            │                      │ INSERT negocios_juridicos           │
       │                            │                      ├──────────────────────────────────►│
       │                            │                      │                   │                  │
       │                            │◄─ result ────────────┤                   │                  │
       │                            │                      │                   │                  │
       │                            │ UPDATE minutas       │                   │                  │
       │                            │ { status: 'revisao',│                   │                  │
       │                            │   current_step:     ├─────────────────────────────────────►│
       │                            │   'outorgantes' }   │                   │                  │
       │                            │                     │                   │                  │
       │ onPipelineComplete()       │                     │                   │                  │
       │◄────────────────────────────┤                     │                   │                  │
       │ navigate('/outorgantes')   │                     │                   │                  │
       │                            │                     │                   │                  │
```

## 3. DIAGRAMA: Classificação em Detalhe

```
classify-document                     Gemini API              Supabase
(Edge Function)                       (Vision Model)          (Database)
      │                                    │                       │
      │ Input: { documento_id }            │                       │
      │                                    │                       │
      │ SELECT documentos                  │                       │
      ├────────────────────────────────────────────────────────────►│
      │◄─ {storage_path, mime_type, ...} ─────────────────────────┤
      │                                    │                       │
      │ UPDATE status='classificando'      │                       │
      ├────────────────────────────────────────────────────────────►│
      │                                    │                       │
      │ storage.download(storage_path)     │                       │
      ├────────────────────────────────────────────────────────────►│
      │◄─ fileData (ArrayBuffer) ──────────────────────────────────┤
      │                                    │                       │
      │ arrayBufferToBase64(fileData)      │                       │
      ├────────────────┐                   │                       │
      │ → base64String │                   │                       │
      │◄───────────────┘                   │                       │
      │                                    │                       │
      │ loadClassificationPrompt()         │                       │
      ├────────────────────────────────────────────────────────────►│
      │◄─ prompt (from prompts table) ─────────────────────────────┤
      │                                    │                       │
      │ callGemini(prompt, base64,         │                       │
      │            mime_type)              │                       │
      ├───────────────────────────────────►│                       │
      │ • Visual Understanding             │                       │
      │ • Document Type Detection          │                       │
      │ • Confidence Scoring               │                       │
      │                                    │                       │
      │◄───────── JSON Response ───────────┤                       │
      │ {                                  │                       │
      │   "tipo_documento": "RG",          │                       │
      │   "confianca": "ALTA",             │                       │
      │   "pessoa_relacionada": "João"     │                       │
      │ }                                  │                       │
      │                                    │                       │
      │ parseGeminiJson(response)          │                       │
      ├────────────────┐                   │                       │
      │ → ClassResult  │                   │                       │
      │◄───────────────┘                   │                       │
      │                                    │                       │
      │ UPDATE documentos                  │                       │
      │ {                                  │                       │
      │   tipo_documento: 'RG',            ├──────────────────────►│
      │   classificacao_confianca: 'alta', │                       │
      │   pessoa_relacionada: 'João',      │                       │
      │   status: 'classificado'           │                       │
      │ }                                  │                       │
      │                                    │                       │
      │ startExecution(logger)             │                       │
      │ logSuccess(inputTokens,            ├──────────────────────►│
      │            outputTokens)           │ Save to execution_logs│
      │                                    │                       │
      │ Return:                            │                       │
      │ {success: true, result: {...}}     │                       │
      │                                    │                       │
```

## 4. DIAGRAMA: Extração em Detalhe

```
extract-document                      Gemini API              Supabase
(Edge Function)                       (Vision Model)          (Database)
      │                                    │                       │
      │ Input: { documento_id }            │                       │
      │                                    │                       │
      │ SELECT documentos                  │                       │
      ├────────────────────────────────────────────────────────────►│
      │◄─ {..., tipo_documento, ...} ──────────────────────────────┤
      │                                    │                       │
      │ if tipo_documento is NULL:         │                       │
      │   throw Error("Must classify first")                       │
      │                                    │                       │
      │ UPDATE status='extraindo'          │                       │
      ├────────────────────────────────────────────────────────────►│
      │                                    │                       │
      │ loadExtractionPrompt(              │                       │
      │   tipo_documento,                  │                       │
      │   tamanho_bytes)                   │                       │
      ├────────────────────────────────────────────────────────────►│
      │◄─ prompt (from prompts table) ─────────────────────────────┤
      │ └─ Prompt específico para RG       │                       │
      │                                    │                       │
      │ storage.download(storage_path)     │                       │
      ├────────────────────────────────────────────────────────────►│
      │◄─ fileData ────────────────────────────────────────────────┤
      │                                    │                       │
      │ arrayBufferToBase64()              │                       │
      │ → base64String                     │                       │
      │                                    │                       │
      │ callGemini(prompt, base64,         │                       │
      │            mime_type,              │                       │
      │            {maxTokens: 16384})     │                       │
      ├───────────────────────────────────►│                       │
      │ • Field Extraction                 │                       │
      │ • Data Structuring                 │                       │
      │ • Validation                       │                       │
      │                                    │                       │
      │◄───────── JSON Response ───────────┤                       │
      │ {                                  │                       │
      │   "rg": {                          │                       │
      │     "numero_rg": "123456789",      │                       │
      │     "cpf": "123.456.789-00",       │                       │
      │     "nome": "JOÃO SILVA",          │                       │
      │     "data_nascimento": "1980-...",│                       │
      │     "... mais campos ..."          │                       │
      │   }                                │                       │
      │ }                                  │                       │
      │                                    │                       │
      │ parseGeminiJson(response)          │                       │
      │ → ExtractionResult                 │                       │
      │                                    │                       │
      │ UPDATE documentos                  │                       │
      │ {                                  │                       │
      │   dados_extraidos: result,         ├──────────────────────►│
      │   status: 'extraido'               │ (JSONB column)        │
      │ }                                  │                       │
      │                                    │                       │
      │ logSuccess(inputTokens,            ├──────────────────────►│
      │            outputTokens)           │ Save to execution_logs│
      │                                    │                       │
      │ Return:                            │                       │
      │ {success: true, result: {...}}     │                       │
      │                                    │                       │
```

## 5. DIAGRAMA: Map-to-Fields em Detalhe

```
map-to-fields                      Supabase                        User
(Edge Function)                    (Database)                      (Tables)
      │                                  │                          │
      │ Input: { minuta_id }             │                          │
      │                                  │                          │
      │ SELECT documentos                │                          │
      │ WHERE status='extraido'          │                          │
      │ AND dados_extraidos NOT NULL     ├─────────────────────────►│
      │                                  │◄─ [doc1, doc2...] ────────┤
      │                                  │                          │
      │ Sort by TYPE_PRIORITIES          │                          │
      │ (RG: 100 > CERT: 95 > CNH: 88...)│                          │
      │ └─ [RG, CNH, CERT_CASAMENTO, ...]│                          │
      │                                  │                          │
      │ FOR EACH doc:                    │                          │
      │                                  │                          │
      │ ┌─ IF tipo='RG':                 │                          │
      │ │  mapIdentityDocument()         │                          │
      │ │  └─ Extract: cpf, nome, rg,   │                          │
      │ │     data_nascimento, etc.     │                          │
      │ │  └─ Add to alienantes (Map)   │                          │
      │ │                                │                          │
      │ ├─ IF tipo='CERT_CASAMENTO':     │                          │
      │ │  mapMarriageCertificate()      │                          │
      │ │  └─ Update pessoa.estado_civil │                          │
      │ │     pessoa.regime_bens         │                          │
      │ │     pessoa.conjuge             │                          │
      │ │                                │                          │
      │ ├─ IF tipo='COMPROMISSO':        │                          │
      │ │  mapPurchaseContract()         │                          │
      │ │  └─ Populate alienantes        │                          │
      │ │     (vendedores)               │                          │
      │ │  └─ Populate adquirentes       │                          │
      │ │     (compradores)              │                          │
      │ │  └─ Extract imovel data        │                          │
      │ │     valores de transação       │                          │
      │ │                                │                          │
      │ ├─ IF tipo='MATRICULA_IMOVEL':   │                          │
      │ │  mapPropertyRegistry()         │                          │
      │ │  └─ Extract: matricula,        │                          │
      │ │     tipo, endereco, area       │                          │
      │ │  └─ IF onus_ativos exists:     │                          │
      │ │     └─ Add AlertaJuridico      │                          │
      │ │                                │                          │
      │ └─ ... more type mappings ...    │                          │
      │                                  │                          │
      │ identifyAnuentes()               │                          │
      │ └─ FOR EACH married alienante:   │                          │
      │    └─ IF conjuge not in         │                          │
      │       alienantes/adquirentes:   │                          │
      │       └─ Add to anuentes        │                          │
      │                                  │                          │
      │ MappedFields = {                 │                          │
      │   alienantes: [...],             │                          │
      │   adquirentes: [...],            │                          │
      │   anuentes: [...],               │                          │
      │   imovel: {...},                 │                          │
      │   negocio: {...},                │                          │
      │   alertas_juridicos: [...]       │                          │
      │ }                                │                          │
      │                                  │                          │
      │ persistMappedFields()            │                          │
      │                                  │                          │
      │ FOR EACH pessoa in alienantes:   │                          │
      │ INSERT pessoas_naturais          ├─────────────────────────►│
      │ {                                │                          │
      │   minuta_id,                     │                          │
      │   cpf, nome, rg,                 │                          │
      │   data_nascimento, ...,          │                          │
      │   _fontes: {...}                 │                          │
      │ }                                │                          │
      │                                  │ [Upsert: unique(minuta, cpf)]
      │ (same for adquirentes, anuentes)│                          │
      │                                  │                          │
      │ INSERT imovel                    ├─────────────────────────►│
      │ {                                │                          │
      │   minuta_id, matricula_numero,   │                          │
      │   tipo, endereco, area, ...      │                          │
      │ }                                │                          │
      │                                  │ [Upsert: unique(minuta, matricula)]
      │ INSERT negocios_juridicos        ├─────────────────────────►│
      │ {                                │                          │
      │   minuta_id, tipo, valor_total,  │                          │
      │   pagamento, itbi, ...           │                          │
      │ }                                │                          │
      │                                  │                          │
      │ FOR EACH alerta in alertas:      │                          │
      │ INSERT alertas_juridicos         ├─────────────────────────►│
      │ {                                │                          │
      │   minuta_id, tipo, severidade,   │                          │
      │   mensagem, recomendacao         │                          │
      │ }                                │                          │
      │                                  │                          │
      │ logSuccess()                     │                          │
      │                                  │                          │
      │ Return:                          │                          │
      │ {success: true, result: {...}}   │                          │
      │                                  │                          │
```

## 6. DIAGRAMA: Geração de Minuta

```
MinutaFinal.tsx                 generate-minuta         Gemini API     Supabase
(Frontend)                      (Edge Function)         (LLM)          (Database)
    │                                 │                    │              │
    │ generateMinuta()                │                    │              │
    ├────────────────────────────────►│                    │              │
    │ { minuta_id,                    │                    │              │
    │   template_type,                │                    │              │
    │   template_id? }                │                    │              │
    │                                 │                    │              │
    │                                 │ UPDATE minutas     │              │
    │                                 │ {                  ├─────────────►│
    │                                 │   geracao_status:  │              │
    │                                 │   'gerando'        │              │
    │                                 │ }                  │              │
    │                                 │                    │              │
    │                                 │ aggregateMinutaData(minutaId)    │
    │                                 │ ├─ SELECT pessoas_naturais      │
    │                                 │ ├─────────────────────────────►│
    │                                 │ │◄─ alienantes ───────────────┤
    │                                 │ │                              │
    │                                 │ ├─ SELECT pessoas_naturais    │
    │                                 │ │ (WHERE role='adquirentes')   │
    │                                 │ ├─────────────────────────────►│
    │                                 │ │◄─ adquirentes ──────────────┤
    │                                 │ │                              │
    │                                 │ ├─ SELECT imoveis             │
    │                                 │ ├─────────────────────────────►│
    │                                 │ │◄─ imovel data ──────────────┤
    │                                 │ │                              │
    │                                 │ ├─ SELECT negocios_juridicos  │
    │                                 │ ├─────────────────────────────►│
    │                                 │ │◄─ negocio data ──────────────┤
    │                                 │ │                              │
    │                                 │ └─ MinutaCompleta loaded      │
    │                                 │                    │              │
    │                                 │ mapDataToPlaceholders()         │
    │                                 │ └─ PlaceHolders = {             │
    │                                 │      OUTORGANTES_VENDEDORES,    │
    │                                 │      OUTORGADOS_COMPRADORES,    │
    │                                 │      IMOVEL_DESCRICAO,          │
    │                                 │      VALOR_NEGOCIO,             │
    │                                 │      DATA_LAVRATURA,            │
    │                                 │      ... mais ...               │
    │                                 │    }                           │
    │                                 │                    │              │
    │                                 │ loadTemplate(template_type)    │
    │                                 │ ├─────────────────────────────►│
    │                                 │ │◄─ template ─────────────────┤
    │                                 │ │  (com {PLACEHOLDER_NAMES})   │
    │                                 │ │                              │
    │                                 │ substituteTemplate()            │
    │                                 │ └─ Template com valores        │
    │                                 │    preenchidos               │
    │                                 │                    │              │
    │                                 │ callGemini(                     │
    │                                 │   prompt: "Gere uma escritura  │
    │                                 │             com estes dados"   │
    │                                 │   template_content: {...}      │
    │                                 │ )                              │
    │                                 ├───────────────────────────────►│
    │                                 │                    │ Generation │
    │                                 │                    │ (Streaming │
    │                                 │                    │  Tokens)   │
    │                                 │                    │            │
    │                                 │◄─────── Generated Text ────────┤
    │                                 │ (fully formatted document)      │
    │                                 │                    │              │
    │                                 │ UPDATE minutas                 │
    │                                 │ {                  ├────────────►│
    │                                 │   conteudo_gerado: text,      │
    │                                 │   template_usado: "VENDA...",  │
    │                                 │   geracao_status: 'gerado',    │
    │                                 │   gerado_em: now()             │
    │                                 │ }                  │              │
    │                                 │                    │              │
    │                                 │ logSuccess()       │              │
    │                                 │                    │              │
    │ {success: true,                │                    │              │
    │  minuta_texto: "...",          ├────────────────────────────────►│
    │  template_usado: "..."}         │                    │              │
    │◄────────────────────────────────┤                    │              │
    │                                 │                    │              │
    │ editor.setContent(minuta_texto)│                    │              │
    │                                 │                    │              │
    │ [Display in Editor]             │                    │              │
    │                                 │                    │              │
    │ (User edits content)            │                    │              │
    │                                 │                    │              │
    │ handleSave()                    │                    │              │
    ├──────────────────── UPDATE minutas ──────────────────┼────────────►│
    │ {                              │                    │              │
    │   conteudo_gerado: edited_text │                    │              │
    │ }                              │                    │              │
    │                                 │                    │              │
```

## 7. Fluxo Completo de Estados do Documento

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Estado 1: UPLOADED                                        │
│  ─────────────────────────────────────────────────────────│
│  • Arquivo enviado para Storage                           │
│  • Registro criado em 'documentos'                         │
│  • tipo_documento: NULL                                   │
│  • dados_extraidos: NULL                                  │
│  • status: 'uploaded'                                     │
│                                                             │
│  ↓                                                         │
│                                                             │
│  Estado 2: CLASSIFICANDO → CLASSIFICADO                   │
│  ─────────────────────────────────────────────────────────│
│  • Edge function: classify-document                       │
│  • Gemini Vision API detecta tipo                         │
│  • tipo_documento: 'RG'                                   │
│  • classificacao_confianca: 'ALTA'                        │
│  • status: 'classificado'                                 │
│                                                             │
│  ↓                                                         │
│                                                             │
│  Estado 3: EXTRAINDO → EXTRAIDO                           │
│  ─────────────────────────────────────────────────────────│
│  • Edge function: extract-document                        │
│  • Gemini Vision API extrai dados estruturados            │
│  • dados_extraidos: {                                     │
│      rg: {                                                │
│        cpf: "123.456.789-00",                             │
│        nome: "JOÃO SILVA",                                │
│        ... mais campos                                    │
│      }                                                    │
│    }                                                      │
│  • status: 'extraido'                                     │
│                                                             │
│  ↓                                                         │
│                                                             │
│  Estado 4: NORMALIZADO (em tabelas estruturadas)          │
│  ─────────────────────────────────────────────────────────│
│  • Edge function: map-to-fields                          │
│  • Dados persistidos em pessoas_naturais, imoveis, etc.  │
│  • _fontes rastreiam origem de cada dado                 │
│  • Alertas jurídicos gerados (se houver)                │
│                                                             │
│  ↓                                                         │
│                                                             │
│  Estado 5: FINALIZADO (em minuta final)                  │
│  ─────────────────────────────────────────────────────────│
│  • Edge function: generate-minuta                        │
│  • Dados agregados em conteudo_gerado                    │
│  • Minuta pronta para edição e assinatura                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                    Transições de Status:

    uploaded
        │
        ├─ Classify-Document Edge Function
        │  └─ classificado
        │     │
        │     ├─ Extract-Document Edge Function
        │     │  └─ extraido
        │     │     │
        │     │     ├─ Map-to-Fields Edge Function
        │     │     │  └─ (persistido em tabelas)
        │     │     │
        │     │     └─ Generate-Minuta Edge Function
        │     │        └─ (incluído em conteudo_gerado)
        │     │
        │     └─ [Error] → classificado com status 'error'
        │
        └─ [Error] → uploaded com status 'error'
```

## 8. Integração com Frontend States

```
UploadDocumentos.tsx
    │
    ├─ Estado Local: uploaded
    │  └─ showPickFile → upload file
    │
    ├─ Estado Upload: uploading
    │  └─ progressBar = 45%
    │
    ├─ Estado Upload Complete: complete
    │  └─ checkmark ✓
    │  └─ readyForProcessing = true
    │
    └─ Clica "Processar"
       └─ navigate('/processando')

Processando.tsx
    │
    ├─ useDocumentPipeline.startPipeline()
    │  └─ FOR EACH documento:
    │     ├─ updateStatus('classifying')
    │     │  └─ UI: "Analisando documentos..."
    │     │
    │     ├─ updateStatus('extracting')
    │     │  └─ UI: "Extraindo dados com IA..."
    │     │
    │     └─ updateStatus('done')
    │        └─ UI: ✓ completed
    │
    ├─ overallProgress = (0 + 33 + 66 + 100 + 100) / 5 = 60%
    │  └─ Progress bar = 60%
    │
    ├─ onPipelineComplete callback
    │  └─ navigate('/outorgantes')
    │
    └─ Exibição de Erro:
       └─ onError callback
          └─ toast.error()
          └─ permitir continuar mesmo com erros

ConferenciaOutorgantes.tsx
    │
    ├─ Carrega dados de pessoas_naturais (já persistidos)
    ├─ Permite edição manual
    ├─ User revisa e confirma
    └─ Save em useMinutaDatabase

MinutaFinal.tsx
    │
    ├─ Clica "Gerar Minuta"
    │  └─ generateMinuta(minutaId)
    │
    ├─ UI: "Gerando minuta com IA..."
    │  └─ Loading spinner
    │
    ├─ conteudo_gerado carregado no editor TipTap
    │  └─ User pode editar manualmente
    │
    ├─ Clica "Salvar"
    │  └─ Update minuta em database
    │
    └─ Clica "Finalizar"
       └─ finalizarMinuta()
       └─ navigate('/dashboard')
```

---

Este conjunto de diagramas fornece uma visão completa do fluxo de classificação e processamento de documentos no sistema de minutas.
