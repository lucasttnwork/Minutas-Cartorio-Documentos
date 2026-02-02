# Fluxo Completo de Classificação de Documentos - Minuta Canvas

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SISTEMA DE MINUTAS                             │
│                     (Frontend SPA + Edge Functions)                       │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────────────┐     ┌──────────┐
│   UPLOAD PAGE    │────────▶│  SUPABASE STORAGE +      │────▶│ DATABASE │
│ (UploadDocumen   │         │    DATABASE              │     │(documentos
│     tos.tsx)     │         └──────────────────────────┘     │  table)  │
└──────────────────┘                                          └──────────┘
        │
        │ user uploads 5 documents
        │
        ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │                    FLUXO DE PROCESSAMENTO                           │
   │              (useDocumentPipeline + Edge Functions)                 │
   └────────────────────────────────────────────────────────────────────┘
        │
        ├─── Documento 1 ──────────────────────────────────────────┐
        │                                                          │
        │  1. CLASSIFY-DOCUMENT (Edge Function)                   │
        │     • Download arquivo do Storage                       │
        │     • Enviar para Gemini API (vision)                   │
        │     • Parse resultado (tipo_documento)                  │
        │     • Update: status='classificado'                     │
        │                tipo_documento='RG'                      │
        │                classificacao_confianca='alta'           │
        │                                                          │
        │  2. EXTRACT-DOCUMENT (Edge Function)                    │
        │     • Verifica se está classificado                     │
        │     • Download arquivo do Storage                       │
        │     • Enviar para Gemini com prompt específico          │
        │     • Parse resultado (CPF, nome, etc)                  │
        │     • Update: status='extraido'                         │
        │                dados_extraidos={...}                    │
        │                                                          │
        ├─── Documento 2, 3, 4, 5 (mesmo fluxo) ──────────────────┤
        │                                                          │
        ├─── Após TODOS os docs classificados e extraídos ────────┤
        │                                                          │
        │  3. MAP-TO-FIELDS (Edge Function)                       │
        │     • Busca todos os docs com status='extraido'        │
        │     • Mapeia dados para estruturas normalizadas         │
        │     • Resolve conflitos usando prioridades              │
        │     • Salva em tabelas estruturadas:                    │
        │       - pessoas_naturais                                │
        │       - pessoas_juridicas                               │
        │       - imoveis                                         │
        │       - negocios_juridicos                              │
        │                                                          │
        │  4. UPDATE MINUTA STATUS                                │
        │     • status='revisao'                                  │
        │     • current_step='outorgantes'                        │
        │                                                          │
        └──────────────────────────────────────────────────────────┘
        │
        ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │              PÁGINA DE REVISÃO (ConferenciaOutorgantes)             │
   │         Usuário revisa/edita dados extraídos pela IA               │
   └────────────────────────────────────────────────────────────────────┘
        │
        ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │         GERAÇÃO DE MINUTA FINAL (MinutaFinal.tsx)                   │
   │                                                                      │
   │  • Usuário clica "Gerar Minuta" ou "Regenerar"                     │
   │  • Chama generate-minuta (Edge Function)                           │
   │  • Agregada dados de todas as tabelas estruturadas                 │
   │  • Aplica template VENDA_COMPRA ou custom                          │
   │  • Gemini gera texto final com formatação adequada                 │
   │  • Salva em conteudo_gerado na tabela minutas                      │
   │  • Editor TipTap carrega conteúdo para edição manual               │
   └────────────────────────────────────────────────────────────────────┘
```

---

## 1. UPLOAD DE DOCUMENTOS

### Componente: `src/pages/UploadDocumentos.tsx`

**Responsabilidade:** Interface para seleção e upload de documentos agrupados por categoria.

**Categorias Suportadas:**
- `outorgantes` - Documentos dos vendedores (RG, CPF, Certidões)
- `outorgados` - Documentos dos compradores (RG, CPF, Certidões)
- `imoveis` - Documentos dos imóveis (Matrículas, IPTU, Certidões)
- `negocio` - Documentos do negócio (Contratos, Procurações, Acordos)
- `outros` - Demais documentos

**Flow:**
```
1. Usuário navega para /minuta/nova
   ↓
2. UploadDocumentos.tsx:
   - Cria minuta no banco se não existir (useMinuta.createMinutaInDatabase)
   - Minuta recebe ID uuid do banco de dados
   - Armazena em MinutaContext
   ↓
3. Usuário seleciona arquivos (drag-drop ou file input)
   ↓
4. handleUploadFile() executa para cada arquivo:
   - Valida tamanho (max 50MB)
   - Valida tipo (PDF, imagens, DOCX, TXT)
   - Chama useDocumentUpload.uploadDocument()
   ↓
5. useDocumentUpload.uploadDocument():
   a) Obtém user_id via supabase.auth.getUser()
   b) Gera storage path: {userId}/{minutaId}/{timestamp}_{filename}
   c) Upload para Supabase Storage (bucket: 'documentos')
   d) Cria registro na tabela 'documentos':
      {
        minuta_id: string (uuid)
        nome_original: string
        storage_path: string
        mime_type: string
        tamanho_bytes: number
        status: 'uploaded' (não classificado ainda)
      }
   ↓
6. Retorna:
   {
     id: string (documento.id)
     storagePath: string
   }
   ↓
7. Componente atualiza estado local (MinutaContext):
   - Adiciona documento com status='complete'
   - Exibe checkmark verde
   ↓
8. Usuário clica "Processar Documentos"
   - Navega para /minuta/{minutaId}/processando
```

### Arquivo: `src/hooks/useDocumentUpload.ts`

```typescript
// Upload de arquivo para Supabase Storage + Database
// Retorna { id, storagePath }

uploadDocument(file: File, minutaId: string, category: string)
  ├─ Get user ID from auth
  ├─ Generate storage path: {userId}/{minutaId}/{timestamp}_{filename}
  ├─ Upload to Storage (bucket: 'documentos')
  └─ Create database record (table: 'documentos')
      └─ status: 'uploaded'
```

**Fluxo de Upload Detalhado:**

```typescript
// Passo 1: Validação
validateFile(file) → { valid: boolean; error?: string }

// Passo 2: Adiciona ao estado local como 'uploading'
const uploadingDoc: UploadedDocument = {
  id: tempId,
  status: 'uploading',
  progress: 0,
  ...
}
addDocument(uploadingDoc)

// Passo 3: Upload real
const result = await uploadDocument(file, minutaId, category)
  → Upload para Supabase Storage
  → Cria registro em 'documentos' com status='uploaded'
  → Retorna { id, storagePath }

// Passo 4: Atualiza para 'complete'
const completeDoc: UploadedDocument = {
  id: result.id,
  status: 'complete',
  progress: 100,
  ...
}
removeDocument(tempId)
addDocument(completeDoc)
```

---

## 2. DISPARO E FLUXO DE CLASSIFICAÇÃO

### Página: `src/pages/Processando.tsx`

**Responsabilidade:** Orquestra o pipeline de processamento enquanto mostra progresso visual.

**Flow:**
```
1. Usuário navega para /minuta/{minutaId}/processando
   ↓
2. useEffect() dispara startPipeline(minutaId):
   ├─ Busca todos os documentos com status 'uploaded' ou 'pendente'
   ├─ Para CADA documento sequencialmente:
   │  ├─ processDocument(docId)
   │  │  ├─ Chama classify-document (Edge Function)
   │  │  └─ Chama extract-document (Edge Function)
   │  └─ Atualiza status da UI
   │
   └─ Após TODOS os documentos:
      ├─ Chama map-to-fields (Edge Function)
      ├─ Atualiza minuta: status='revisao', current_step='outorgantes'
      └─ Navega para /minuta/{minutaId}/outorgantes
```

### Hook: `src/hooks/useDocumentPipeline.ts`

**Interface Principal:**
```typescript
export function useDocumentPipeline(options?: UseDocumentPipelineOptions): UseDocumentPipelineReturn {
  // Retorna:
  return {
    startPipeline,      // (minutaId) → inicia pipeline completo
    processDocument,    // (documentoId) → classifica + extrai um doc
    generateMinuta,     // (minutaId) → gera minuta final
    isProcessing,       // boolean
    isGenerating,       // boolean
    statuses,           // Map<docId, PipelineStatus>
    generationStatus,   // GenerationStatus
    overallProgress,    // 0-100
  }
}
```

**Método startPipeline:**
```typescript
startPipeline(minutaId: string) {
  1. Query 'documentos' com status IN ('uploaded', 'pendente')
  2. For each document:
     └─ await processDocument(docId)
  3. If no errors:
     └─ await supabase.functions.invoke('map-to-fields')
  4. Update minuta:
     └─ status='revisao', current_step='outorgantes'
  5. Callback: onPipelineComplete(minutaId)
}
```

**Método processDocument:**
```typescript
processDocument(documentId: string) {
  1. updateStatus(docId, 'classifying')
  2. Invoke 'classify-document':
     └─ body: { documento_id: documentId }
  3. If error → updateStatus(docId, 'error', message)
  4. updateStatus(docId, 'extracting')
  5. Invoke 'extract-document':
     └─ body: { documento_id: documentId }
  6. If error → updateStatus(docId, 'error', message)
  7. updateStatus(docId, 'done')
  8. Callback: onDocumentComplete(docId)
  9. Return: boolean (success/failure)
}
```

**Mapa de Progresso:**
```typescript
const PROGRESS_MAP: Record<PipelineStatus['step'], number> = {
  classifying: 0,
  extracting: 33,
  mapping: 66,
  done: 100,
  error: 0,
}

// O overallProgress é calculado como média de todos os documentos
// Ex: 3 docs → [0%, 33%, 100%] = 33% de progresso geral
```

---

## 3. EDGE FUNCTION: classify-document

### Localização: `supabase/functions/classify-document/index.ts`

**Entrada:**
```json
{
  "documento_id": "uuid-do-documento"
}
```

**Processo:**

```
┌────────────────────────────────────────────────────────────────┐
│ 1. VALIDAÇÃO E SETUP                                            │
├────────────────────────────────────────────────────────────────┤
│ • Query documentos table para obter:                            │
│   - storage_path                                               │
│   - mime_type                                                  │
│   - minuta_id (para logging)                                   │
│                                                                │
│ • Update status: 'classificando' (user-facing)                │
│                                                                │
│ • Start execution logging (para tracking de custos)            │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 2. DOWNLOAD DO ARQUIVO                                         │
├────────────────────────────────────────────────────────────────┤
│ • Download arquivo de Storage (bucket: 'documentos')           │
│ • Converte para Base64 (usando arrayBufferToBase64)            │
│                                                                │
│ • Suporta: PDF, imagens, DOCX, TXT                            │
│ • Limite: arquivo é carregado na memória                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 3. CHAMADA À GEMINI API (Vision)                              │
├────────────────────────────────────────────────────────────────┤
│ • callGemini(prompt, base64, mimeType)                        │
│                                                                │
│ • PROMPT: loadClassificationPrompt()                          │
│   └─ Carregado da tabela 'prompts' no banco                  │
│   └─ Exemplos de tipos:                                       │
│      RG, CNH, CPF, CERTIDAO_NASCIMENTO,                       │
│      CERTIDAO_CASAMENTO, COMPROMISSO_COMPRA_VENDA,            │
│      MATRICULA_IMOVEL, ESCRITURA, ITBI, IPTU, VVR,            │
│      CNDT, CND_MUNICIPAL, PROTOCOLO_ONR, OUTRO                │
│                                                                │
│ • RESPOSTA ESPERADA:                                          │
│   {                                                            │
│     "tipo_documento": "RG",                                    │
│     "pessoa_relacionada": "João Silva",                       │
│     "confianca": "ALTA"                                        │
│   }                                                            │
│                                                                │
│ • TOKEN TRACKING:                                             │
│   - inputTokens                                               │
│   - outputTokens                                              │
│   └─ Logado em tabela 'execution_logs' para custo             │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 4. PARSE E UPDATE DO BANCO                                     │
├────────────────────────────────────────────────────────────────┤
│ • Parse resposta JSON: parseGeminiJson<ClassificationResult> │
│                                                                │
│ • Update 'documentos' table:                                  │
│   {                                                            │
│     tipo_documento: "RG",                                      │
│     classificacao_confianca: "alta",                           │
│     pessoa_relacionada: "João Silva",                          │
│     status: "classificado"                                     │
│   }                                                            │
│                                                                │
│ • Log sucesso com custos (inputTokens, outputTokens)         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 5. RETORNO E ERROR HANDLING                                    │
├────────────────────────────────────────────────────────────────┤
│ • Success:                                                     │
│   { success: true, result: ClassificationResult }             │
│                                                                │
│ • Error:                                                       │
│   { success: false, error: "message" }                        │
│   └─ Logs erro em execution_logs                              │
│   └─ Update status: "classificado" (mesmo com erro)           │
│   └─ HTTP 500                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Arquivo: `supabase/functions/_shared/types.ts`**
```typescript
export interface ClassificationResult {
  tipo_documento: string;
  confianca: 'ALTA' | 'MEDIA' | 'BAIXA';
  pessoa_relacionada?: string;
}
```

---

## 4. EDGE FUNCTION: extract-document

### Localização: `supabase/functions/extract-document/index.ts`

**Entrada:**
```json
{
  "documento_id": "uuid-do-documento"
}
```

**Processo:**

```
┌────────────────────────────────────────────────────────────────┐
│ 1. VALIDAÇÃO PRÉ-EXTRAÇÃO                                      │
├────────────────────────────────────────────────────────────────┤
│ • Query documento: obter storage_path, mime_type              │
│                                                                │
│ • CRÍTICO: Verificar se tipo_documento NÃO É NULL            │
│   └─ Erro se não classificado: "Document must be classified   │
│      before extraction"                                       │
│                                                                │
│ • Update status: "extraindo" (user-facing)                    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 2. CARREGAR PROMPT ESPECÍFICO                                  │
├────────────────────────────────────────────────────────────────┤
│ • loadExtractionPrompt(tipo_documento, tamanho_bytes)         │
│   └─ Prompts diferentes para cada tipo de documento           │
│   └─ Exemplo: prompt_rg.md, prompt_cnh.md, etc.              │
│   └─ Carregado da tabela 'prompts'                            │
│                                                                │
│ • Personalizações:                                            │
│   └─ Documentos grandes (>5MB) podem ter prompts otimizados  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 3. DOWNLOAD E CONVERSÃO                                        │
├────────────────────────────────────────────────────────────────┤
│ • Download arquivo de Storage                                 │
│ • Converte para Base64                                        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 4. CHAMADA À GEMINI API                                       │
├────────────────────────────────────────────────────────────────┤
│ • callGemini(prompt, base64, mimeType, { maxTokens: 16384 })│
│   └─ Limite de tokens aumentado para docs complexos           │
│                                                                │
│ • RETORNA estrutura JSON específica por tipo de documento     │
│   └─ RG: { rg: { numero_rg, cpf, nome, data_nascimento, } } │
│   └─ CNH: { cnpj, nome_completo, cpf, data_nascimento, ... } │
│   └─ COMPROMISSO_COMPRA_VENDA:                               │
│      {                                                         │
│        "vendedores": [{ cpf, nome, estado_civil, ... }],     │
│        "compradores": [{ cpf, nome, ... }],                  │
│        "imovel": {                                             │
│          "tipo": "casa",                                       │
│          "matricula": "1234567",                              │
│          "endereco": { ... }                                  │
│        },                                                      │
│        "valores": {                                            │
│          "total": "500000.00",                                │
│          "forma_pagamento": "à vista",                        │
│          "sinal": "100000.00",                                │
│          "saldo": "400000.00"                                 │
│        }                                                       │
│      }                                                         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 5. PARSE E ARMAZENAMENTO                                       │
├────────────────────────────────────────────────────────────────┤
│ • Parse resposta JSON: parseGeminiJson<Record<string, any>>  │
│                                                                │
│ • Update 'documentos' table:                                  │
│   {                                                            │
│     dados_extraidos: result,  // JSON inteiro (estrutura)    │
│     status: "extraido"                                        │
│   }                                                            │
│                                                                │
│ • Log sucesso com custo (inputTokens, outputTokens)          │
└────────────────────────────────────────────────────────────────┘
```

**Estrutura de dados_extraidos:**
```typescript
// Armazenado como JSONB na coluna 'dados_extraidos'
// A estrutura varia por tipo de documento

// Exemplo para RG:
{
  "rg": {
    "numero_rg": "123456789",
    "cpf": "123.456.789-00",
    "nome": "JOÃO SILVA",
    "data_nascimento": "1980-01-15",
    "nacionalidade": "Brasileiro",
    "naturalidade": "São Paulo",
    "estado_emissor": "SP",
    "orgao_emissor": "SSP",
    "data_expedicao": "2020-01-01",
    "filiacao_pai": "José Silva",
    "filiacao_mae": "Maria Silva"
  }
}

// Exemplo para COMPROMISSO_COMPRA_VENDA:
{
  "vendedores": [
    {
      "cpf": "123.456.789-00",
      "nome": "João Silva",
      "estado_civil": "casado",
      "profissao": "Engenheiro",
      "endereco": { "logradouro": "Rua X", "numero": "100", ... }
    }
  ],
  "compradores": [...],
  "imovel": {
    "tipo": "casa",
    "matricula": "1234567",
    "endereco": {...}
  },
  "valores": {
    "total": "500000.00",
    "forma_pagamento": "à vista",
    "sinal": "100000.00",
    "saldo": "400000.00"
  }
}
```

---

## 5. EDGE FUNCTION: map-to-fields

### Localização: `supabase/functions/map-to-fields/index.ts`

**Entrada:**
```json
{
  "minuta_id": "uuid-da-minuta"
}
```

**Processo:**

```
┌────────────────────────────────────────────────────────────────┐
│ 1. BUSCA DE DOCUMENTOS EXTRAÍDOS                               │
├────────────────────────────────────────────────────────────────┤
│ • Query 'documentos' com:                                      │
│   └─ minuta_id = {minuta_id}                                  │
│   └─ status = 'extraido'                                      │
│   └─ dados_extraidos NOT NULL                                 │
│                                                                │
│ • Se nenhum documento extraído → erro                         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 2. ORDENAÇÃO POR PRIORIDADE                                    │
├────────────────────────────────────────────────────────────────┤
│ • TYPE_PRIORITIES:                                             │
│   RG: 100 > CERTIDAO_NASCIMENTO: 95 > CNH: 88 > ...          │
│                                                                │
│ • Ordenar documentos by prioridade descendente                │
│   └─ RG resolve conflitos sobre identidade                    │
│   └─ CERTIDAO_CASAMENTO resolve estado civil                 │
│   └─ MATRICULA_IMOVEL resolve dados do imóvel                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 3. MAPEAMENTO PARA ESTRUTURAS NORMALIZADAS                    │
├────────────────────────────────────────────────────────────────┤
│ Para CADA documento:                                            │
│                                                                │
│ a) RG ou CNH:                                                 │
│    mapIdentityDocument()                                       │
│    └─ Extrai: nome, cpf, rg, data_nascimento, etc.          │
│    └─ Adiciona a 'alienantes' (default)                      │
│    └─ Merge com existentes (mesmo CPF)                       │
│                                                                │
│ b) CERTIDAO_CASAMENTO:                                        │
│    mapMarriageCertificate()                                   │
│    └─ Atualiza 'estado_civil', 'regime_bens', 'conjuge'      │
│    └─ Encontra pessoa existente por CPF do cônjuge           │
│                                                                │
│ c) COMPROMISSO_COMPRA_VENDA:                                  │
│    mapPurchaseContract()                                       │
│    └─ Popula 'alienantes' (vendedores)                       │
│    └─ Popula 'adquirentes' (compradores)                    │
│    └─ Extrai dados do imóvel (matricula, endereco)           │
│    └─ Extrai valores da transação                            │
│                                                                │
│ d) MATRICULA_IMOVEL:                                          │
│    mapPropertyRegistry()                                       │
│    └─ Extrai: matricula_numero, registro_imoveis, cidade     │
│    └─ Captura 'onus_ativos' (hipotecas, penhoras)            │
│    └─ Cria AlertaJuridico se houver ônus ativo               │
│    └─ Extrai 'proprietarios' (para validação)                │
│                                                                │
│ e) ITBI, IPTU, VVR, CNDT, CND_MUNICIPAL:                     │
│    Mapeadores específicos para cada tipo                      │
│    └─ Atualiza valores, taxas, certidões                     │
│                                                                │
│ • IMPORTANTE: Usar 'source tracking'                         │
│   └─ _fontes: { campo: ["arquivo.pdf"] }                    │
│   └─ Rastreia qual documento forneceu cada dado              │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 4. IDENTIFICAÇÃO DE ANUENTES                                   │
├────────────────────────────────────────────────────────────────┤
│ • Se alienante está 'casado' e tem 'conjuge':                │
│   └─ Se conjuge NÃO está em alienantes ou adquirentes        │
│   └─ Adiciona como 'anuente' (cônjuge consentidor)           │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 5. PERSISTÊNCIA EM TABELAS ESTRUTURADAS                        │
├────────────────────────────────────────────────────────────────┤
│ persistMappedFields() salva em:                               │
│                                                                │
│ • pessoas_naturais:                                           │
│   { minuta_id, cpf, nome, rg, data_nascimento, ... }        │
│   └─ Chave primária composta: (minuta_id, cpf)               │
│                                                                │
│ • pessoas_juridicas:                                          │
│   { minuta_id, cnpj, razao_social, inscricao_estadual, ... } │
│   └─ Chave primária composta: (minuta_id, cnpj)              │
│                                                                │
│ • imoveis:                                                    │
│   { minuta_id, matricula_numero, endereco, area, ... }       │
│   └─ Chave primária composta: (minuta_id, matricula_numero)  │
│                                                                │
│ • negocios_juridicos:                                         │
│   { minuta_id, tipo, valor_total, data, ... }                │
│   └─ Chave primária: (minuta_id)                             │
│                                                                │
│ • alertas_juridicos:                                          │
│   { minuta_id, tipo, severidade, mensagem, ... }             │
│   └─ Chave primária: auto increment                          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 6. RETORNO E METADADOS                                         │
├────────────────────────────────────────────────────────────────┤
│ Retorna resultado agregado:                                    │
│ {                                                              │
│   "alienantes": [...],                                        │
│   "adquirentes": [...],                                       │
│   "anuentes": [...],                                          │
│   "imovel": {...},                                            │
│   "negocio": {...},                                           │
│   "alertas_juridicos": [...],                                 │
│   "metadata": {                                                │
│     "documentos_processados": 5,                              │
│     "campos_preenchidos": 42,                                 │
│     "campos_faltantes": ["alienantes[0].cpf", ...]           │
│   }                                                            │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
```

**Tipos MappedFields:**
```typescript
interface PessoaNatural {
  nome?: string;
  cpf: string;
  rg?: string;
  data_nascimento?: string;
  estado_civil?: string;
  profissao?: string;
  nacionalidade?: string;
  regime_bens?: string;
  conjuge?: string;
  cndt?: { numero, data_expedicao, ... };
  _fontes?: Record<string, string[]>;
}

interface Imovel {
  matricula_numero?: string;
  registro_imoveis?: string;
  tipo?: string;
  endereco?: string;
  area_total?: string;
  onus_ativos?: Array<any>;
  proprietarios?: Array<any>;
}

interface NegocioJuridico {
  tipo: 'compra_venda';
  valor_total?: string;
  pagamento?: {
    tipo?: string;
    sinal?: string;
    saldo?: string;
  };
  itbi?: { numero_guia, base_calculo, valor, ... };
}

interface AlertaJuridico {
  tipo: string; // 'ONUS_ATIVO', 'PROPRIETARIO_DIFERENTE', etc
  severidade: 'ALTA' | 'MEDIA' | 'BAIXA';
  mensagem: string;
  recomendacao?: string;
}
```

---

## 6. ARMAZENAMENTO E FLUXO DE RESULTADOS

### Estrutura de Tabelas do Banco

**Tabela: documentos**
```sql
id (uuid)
minuta_id (uuid, foreign key)
nome_original (text)
storage_path (text)
mime_type (text)
tamanho_bytes (integer)
status (enum: 'uploaded' → 'classificado' → 'extraido')
tipo_documento (text, nullable)
classificacao_confianca (enum: 'alta', 'media', 'baixa')
pessoa_relacionada (text, nullable)
dados_extraidos (jsonb, nullable)
created_at (timestamp)
updated_at (timestamp)
```

**Tabela: minutas**
```sql
id (uuid)
user_id (uuid)
titulo (text)
status (enum: 'rascunho' → 'revisao' → 'gerada' → 'finalizada')
current_step (enum: 'upload', 'outorgantes', 'outorgados', 'imoveis', 'negocio', 'minuta')
conteudo_gerado (text, nullable)
template_usado (text, nullable)
geracao_status (enum: 'pendente', 'gerando', 'gerado', 'erro')
gerado_em (timestamp, nullable)
geracao_erro (text, nullable)
created_at (timestamp)
updated_at (timestamp)
```

**Tabelas Estruturadas (após map-to-fields):**
```sql
-- pessoas_naturais
id, minuta_id, cpf (UNIQUE per minuta), nome, rg, data_nascimento, ...

-- pessoas_juridicas
id, minuta_id, cnpj (UNIQUE per minuta), razao_social, inscricao_estadual, ...

-- imoveis
id, minuta_id, matricula_numero (UNIQUE per minuta), tipo, endereco, ...

-- negocios_juridicos
id, minuta_id (UNIQUE), tipo, valor_total, data_negocio, ...

-- alertas_juridicos
id, minuta_id, tipo, severidade, mensagem, recomendacao
```

---

## 7. FLUXO COMPLETO: TIMELINE

```
T=0s   Usuário clica "Processar Documentos"
       ↓
T=0.1s Navega para /minuta/{id}/processando
       ├─ useDocumentPipeline.startPipeline(minutaId)
       └─ Query: SELECT id FROM documentos WHERE minuta_id = ? AND status IN ('uploaded', 'pendente')

T=0.5s Documento 1 (RG):
       ├─ processDocument(doc1_id)
       ├─ Invoke classify-document
       │  ├─ Download from Storage
       │  ├─ Gemini API call (vision)
       │  ├─ Parse: { tipo_documento: 'RG', confianca: 'ALTA' }
       │  └─ Update: documentos.status = 'classificado'
       │
       ├─ Invoke extract-document
       │  ├─ Download from Storage
       │  ├─ Gemini API call (extraction)
       │  ├─ Parse: { rg: { cpf, nome, data_nascimento, ... } }
       │  └─ Update: documentos.dados_extraidos = {...}, status = 'extraido'
       │
       └─ Update UI: statuses.set(doc1_id, { step: 'done', progress: 100 })

T=10s  Documento 2 (CNH) → mesmo fluxo
T=20s  Documento 3 (Cert. Nascimento) → mesmo fluxo
T=30s  Documento 4 (Cert. Casamento) → mesmo fluxo
T=40s  Documento 5 (Matrícula Imóvel) → mesmo fluxo

T=50s  Todos os documentos extraídos:
       ├─ Invoke map-to-fields
       │  ├─ Query documentos com status='extraido'
       │  ├─ Mapeia dados para estruturas normalizadas
       │  ├─ Resolve conflitos (prioridades)
       │  └─ Persist em tabelas: pessoas_naturais, pessoas_juridicas, imoveis, negocios
       │
       └─ Update minuta:
          ├─ status = 'revisao'
          └─ current_step = 'outorgantes'

T=51s  onPipelineComplete callback
       ├─ toast.success('Documentos processados com sucesso!')
       └─ navigate('/minuta/{id}/outorgantes')

T=52s  Página ConferenciaOutorgantes carrega
       ├─ Busca dados de pessoas_naturais
       ├─ Permite edição manual
       └─ Usuário revisa e confirma dados

... (usuário navega por outorgados → imoveis → negocio)

T=120s Usuário chega em MinutaFinal.tsx
       ├─ Visualiza status da geração
       └─ Clica "Gerar Minuta"

T=121s Invoke generate-minuta
       ├─ aggregateMinutaData(minutaId)
       │  └─ Busca dados de TODAS as tabelas (pessoas, imoveis, negocios, alertas)
       │
       ├─ Aplica template VENDA_COMPRA
       │  └─ Substitui placeholders:
       │     - {OUTORGANTES_VENDEDORES}
       │     - {OUTORGADOS_COMPRADORES}
       │     - {IMOVEL_DESCRICAO}
       │     - {VALOR_NEGOCIO}
       │     - {DATA_LAVRATURA}
       │
       ├─ Chama Gemini para gerar texto final
       │  └─ Prompt: "Gere uma escritura pública de compra e venda com os dados..."
       │
       ├─ Update minuta:
       │  ├─ conteudo_gerado = texto_gerado
       │  ├─ template_usado = 'VENDA_COMPRA'
       │  ├─ geracao_status = 'gerado'
       │  └─ gerado_em = now()
       │
       └─ Retorna resultado

T=130s Editor carrega com conteúdo gerado
       ├─ Usuário pode editar manualmente
       ├─ Clica "Salvar" para persistir edições
       └─ Clica "Finalizar" para concluir
```

---

## 8. INTEGRAÇÃO COM FRONTEND

### Páginas Envolvidas

```
UploadDocumentos.tsx (Step 1: Upload)
   ↓ navigate to /minuta/{id}/processando

Processando.tsx (Step 2: Processing)
   ├─ Mostra progresso visual
   └─ Chama startPipeline
   ↓ navigate to /minuta/{id}/outorgantes

ConferenciaOutorgantes.tsx (Step 3: Review/Outorgantes)
   ├─ Carrega dados de pessoas_naturais
   ├─ Permite edição
   └─ Usa MinutaContext + useMinutaDatabase
   ↓ navigate to /minuta/{id}/outorgados

ConferenciaOutorgados.tsx (Step 4: Review/Outorgados)
   ↓ navigate to /minuta/{id}/imoveis

ConferenciaImoveis.tsx (Step 5: Review/Imóveis)
   ↓ navigate to /minuta/{id}/negocio

ConferenciaNegocio.tsx (Step 6: Review/Negócio)
   ↓ navigate to /minuta/{id}/minuta

MinutaFinal.tsx (Step 7: Final Generation & Edit)
   ├─ Mostra status da geração
   ├─ useDocumentPipeline.generateMinuta()
   ├─ Carrega conteúdo no editor TipTap
   └─ Permite edição final + export
```

### Hooks Utilizados

```
useDocumentUpload
└─ uploadDocument(file, minutaId, category)
   └─ Usada em: UploadDocumentos.tsx

useDocumentPipeline
├─ startPipeline(minutaId) → Processando.tsx
├─ generateMinuta(minutaId, templateType?, templateId?) → MinutaFinal.tsx
└─ Ambos compartilham mesma instância via hook reuse

useMinuta (Context)
├─ currentMinuta
├─ addDocument, removeDocument
├─ createMinutaInDatabase
└─ updateMinutaTexto, finalizarMinuta

useMinutaDatabase
├─ loadMinutaFromDatabase
├─ savePessoaNatural
├─ saveImovel
└─ Salva dados estruturados das páginas de conferência
```

---

## 9. FLUXO DE DADOS: Documentos → Minuta

```
Documento PDF (RG)
    ↓
Storage: /users/{userId}/minuta_id/timestamp_RG.pdf
    ↓
Database: documentos { id, storage_path, status='uploaded' }
    ↓
[CLASSIFY-DOCUMENT]
    ↓
Database: documentos { tipo_documento='RG', status='classificado' }
    ↓
[EXTRACT-DOCUMENT]
    ↓
Database: documentos {
  dados_extraidos={
    rg: {
      cpf: "123.456.789-00",
      nome: "JOÃO SILVA",
      data_nascimento: "1980-01-15",
      rg: "123456789",
      ...
    }
  },
  status='extraido'
}
    ↓
[MAP-TO-FIELDS]
    ↓
Database: pessoas_naturais {
  minuta_id: uuid,
  cpf: "123.456.789-00",
  nome: "JOÃO SILVA",
  data_nascimento: "1980-01-15",
  rg: "123456789",
  _fontes: { cpf: ["RG.pdf"], nome: ["RG.pdf"] }
}
    ↓
[CONFERENCIA OUTORGANTES]
    ↓
User edits and confirms
    ↓
Database: pessoas_naturais { confirmed=true }
    ↓
[GENERATE-MINUTA]
    ↓
Aggregates all pessoas_naturais for minuta_id
    ↓
Database: minutas {
  conteudo_gerado: "<p>JOÃO SILVA, [...dados...]</p>",
  geracao_status: 'gerado'
}
    ↓
Editor carrega conteúdo
    ↓
User edits in TipTap
    ↓
Database: minutas { conteudo_gerado: "[edited content]" }
```

---

## 10. ERROR HANDLING

### Cenários de Erro

**1. Arquivo corrompido/inacessível**
```
uploadDocument → Upload para Storage falha
├─ error.message armazenado
└─ UploadDocumentos.tsx mostra erro vermelho
```

**2. Classificação falha (Gemini API)**
```
classify-document → callGemini retorna erro
├─ Log erro em execution_logs
├─ Update documentos: status='classificado' (mesmo assim)
├─ processDocument() retorna false
├─ onError callback dispara
└─ Processando.tsx mostra toast.error + permite continuar
```

**3. Extração depende de classificação**
```
extract-document → Verifica if tipo_documento is NULL
├─ Se NULL → throw Error("Document must be classified")
└─ processDocument() retorna false
```

**4. map-to-fields sem documentos extraídos**
```
map-to-fields → Query retorna []
├─ throw Error("No extracted documents found")
└─ startPipeline() rejeita promise
```

**5. Gerar minuta sem dados estruturados**
```
generate-minuta → aggregateMinutaData() retorna campos vazios
├─ Template substitui com placeholders [CAMPO_NAO_PREENCHIDO]
└─ Usuário vê no editor e pode preencher manualmente
```

### Fallback Behavior

```
Processando.tsx
├─ Timeout de 60s se pipeline não completar
│  └─ Navega para outorgantes mesmo assim
│
└─ Error state com botão "Continuar para revisão"
   └─ Permite prosseguir mesmo com erros
```

---

## 11. RESUMO DE RESPONSABILIDADES POR ARQUIVO

| Arquivo | Responsabilidade |
|---------|-----------------|
| `UploadDocumentos.tsx` | UI de upload, categorização, validação de arquivos |
| `useDocumentUpload.ts` | Upload para Storage + criação de registro na tabela documentos |
| `Processando.tsx` | Orquestração visual do pipeline, mostra progresso |
| `useDocumentPipeline.ts` | Lógica de chamada às edge functions, state management do pipeline |
| `classify-document/index.ts` | Vision API call, detecção de tipo de documento |
| `extract-document/index.ts` | Vision API call, extração de dados estruturados |
| `map-to-fields/index.ts` | Normalização e persistência em tabelas estruturadas |
| `MinutaFinal.tsx` | Editor e geração da minuta final |
| `generate-minuta/index.ts` | Agregação de dados + template substitution + Gemini |
| `ConferenciaOutorgantes.tsx` | UI de revisão e edição de dados extraídos |
| `useMinutaDatabase.ts` | CRUD para tabelas estruturadas (pessoas, imoveis, etc) |

---

## 12. FLUXO VISUAL SIMPLIFICADO

```
USER                          FRONTEND                    BACKEND (EDGE)            DATABASE
 │                              │                              │                       │
 ├──────── Upload 5 Docs ──────►│                              │                       │
 │                              │─── createMinutaInDb ────────►│                       │
 │                              │◄─── minuta_id ───────────────│                       │
 │                              │                              │                       │
 │ (Clica "Processar")          │                              │                       │
 │◄─────────────────────────────│ (navega a /processando)      │                       │
 │                              │                              │                       │
 │                              │─── classify-document ──────►│                       │
 │     [Loading...]             │    (para cada doc)          │─ Vision API ─────────┐│
 │                              │                              │                     ││
 │                              │◄── resultado ───────────────│◄────── Parse ────────┘│
 │                              │                              │                       │
 │                              │─── extract-document ──────►│                       │
 │                              │    (para cada doc)          │─ Vision API ─────────┐│
 │                              │                              │                     ││
 │                              │◄── dados_extraidos ────────│◄────── Parse ────────┘│
 │                              │                              │                       │
 │                              │─── map-to-fields ─────────►│                       │
 │                              │    (uma vez)                │─ Normaliza & ────────┬┬─ Save pessoas_naturais
 │                              │                              │   Resolve conflitos ││ ─ Save imoveis
 │                              │◄── resultado ───────────────│◄───────────────────┘│ ─ Save negocios
 │                              │                              │                       │
 │ (Navega para Outorgantes)    │                              │                       │
 │◄─────────────────────────────│ (navigate /outorgantes)     │                       │
 │                              │                              │                       │
 │ [Revisa dados] ─────────────►│ (useMinutaDatabase)         │                       │
 │                              │──────────── Save ───────────────────────────────────►│
 │                              │                              │                       │
 │ (Passa por Outorgados, Imóveis, Negócio)                   │                       │
 │                              │                              │                       │
 │ (Chega em MinutaFinal)       │                              │                       │
 │                              │──── generate-minuta ──────►│                       │
 │     [Gerando...]             │                              │─ aggregateData ─────┐│─ Query pessoas
 │                              │                              │─ Gemini API ────────┼├─ Query imoveis
 │                              │                              │─ mapDataToTemplate ││─ Query negocios
 │                              │◄── conteudo_gerado ────────│◄────── Parse ────────┘│
 │                              │                              │                       │
 │ [Editor com conteúdo]        │                              │                       │
 │ [Edita manualmente]          │                              │                       │
 │ [Clica Finalizar] ──────────►│ (finalizarMinuta)           │                       │
 │                              │────────── Save ─────────────────────────────────────►│
 │ ✓ Minuta criada             │                              │                       │
 │                              │                              │                       │
```

---

## Conclusão

O fluxo de classificação é uma orquestração complexa envolvendo:

1. **Upload** (Frontend) → armazena arquivo + registro inicial
2. **Classificação** (Edge Function) → detecta tipo do documento via Vision
3. **Extração** (Edge Function) → extrai dados estruturados via Vision
4. **Mapeamento** (Edge Function) → normaliza e resolve conflitos
5. **Armazenamento** (Database) → persistência em tabelas estruturadas
6. **Revisão** (Frontend) → usuário valida dados extraídos
7. **Geração** (Edge Function) → cria minuta final com IA
8. **Edição** (Frontend) → usuário edita e finaliza

Cada etapa é determinística (após a IA), permitindo rastreamento completo e recuperação de erros.
