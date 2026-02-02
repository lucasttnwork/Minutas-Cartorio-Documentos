# Arquitetura Técnica: Edge Functions

**Análise Arquitetural Profunda**

---

## 1. CAMADAS E RESPONSABILIDADES

```
┌────────────────────────────────────────────────────────────────┐
│                    HTTP REQUEST LAYER                          │
│  (CORS, routing, request parsing)                              │
└────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                   HANDLER LAYER                                │
│  (Business logic, error handling)                              │
│  - classify/extract/map/generate/agentes-especialistas         │
└────────────────────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ SUPABASE CLIENT  │  │ GEMINI CLIENT    │  │ FILE NORMALIZER  │
│                  │  │                  │  │                  │
│- Auth validation │  │- API calls       │  │- DOCX→HTML       │
│- Data persistence│  │- Response parse  │  │- Base64 encoding │
│- RLS checks      │  │- Token tracking  │  │- MIME validation │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                            │
│  - Supabase PostgreSQL                                         │
│  - Supabase Storage (documentos bucket)                        │
│  - Google Gemini API                                           │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. PADRÕES E CONVENÇÕES

### 2.1 Padrão de Handler

Toda função segue este padrão:

```typescript
serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    // 2. Parse request
    const { documento_id }: RequestBody = await req.json();

    if (!documento_id) {
      throw new Error('documento_id is required');
    }

    // 3. Fetch data from DB
    const { data, error } = await serviceClient
      .from('documentos')
      .select('*')
      .eq('id', documento_id)
      .single();

    if (error || !data) {
      throw new Error(`Not found: ${documento_id}`);
    }

    // 4. Start logging
    execution = await startExecution(serviceClient, 'extract', {
      documentoId: documento_id,
    });

    // 5. Main logic
    const result = await processData(data);

    // 6. Persist result
    await serviceClient
      .from('documentos')
      .update({ /* ... */ })
      .eq('id', documento_id);

    // 7. Log success
    await logSuccess(serviceClient, execution, result);

    // 8. Return response
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Error handling
    if (execution.id) {
      await logError(serviceClient, execution, error as Error);
    }

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 2.2 Padrão de Prompt Dinâmico

```typescript
// 1. Carregar prompt do BD
async function loadPrompt(tipo: string): Promise<string> {
  const { data } = await supabase
    .from('agent_prompts')
    .select('prompt_text')
    .eq('tipo_documento', tipo)
    .eq('ativo', true)
    .order('versao', { ascending: false })
    .single();

  return data?.prompt_text || DEFAULT_PROMPT;
}

// 2. Usar prompt com Gemini
const prompt = await loadPrompt(tipoDocumento);
const result = await callGemini(prompt, imageBase64, imageMimeType);

// 3. Parse e atualizar BD
const parsed = parseGeminiJson<ResultType>(result.text);
await updateDatabase(parsed);
```

### 2.3 Padrão de Logging de Execução

```typescript
// Início
const execution = await startExecution(serviceClient, 'extract', {
  documentoId: 'doc-123',
  promptUsed: prompt,
});

try {
  // ... processamento ...

  // Sucesso com tokens
  await logSuccess(serviceClient, execution, result, {
    inputTokens: 1234,
    outputTokens: 567,
  });
} catch (error) {
  // Erro
  await logError(serviceClient, execution, error);
}
```

---

## 3. FLUXO DE DADOS DETALHADO

### 3.1 Ciclo Completo: Classify → Extract → Map → Generate

```
ENTRADA: minuta_id + [documento1.pdf, documento2.jpg, ...]
│
├─ CLASSIFY_DOCUMENT
│  ├─ Input: { documento_id: "doc-1" }
│  ├─ Process:
│  │  ├─ Fetch documento
│  │  ├─ Download arquivo do storage
│  │  ├─ Encode base64
│  │  ├─ Call Gemini(CLASSIFICATION_PROMPT, image)
│  │  ├─ Parse JSON response
│  │  └─ Update documentos table
│  └─ Output: { tipo_documento: "CNH", confianca: "Alta" }
│
├─ EXTRACT_DOCUMENT
│  ├─ Input: { documento_id: "doc-1" }
│  ├─ Process:
│  │  ├─ Fetch documento
│  │  ├─ Load prompt from agent_prompts (tipo_documento="CNH")
│  │  ├─ Download arquivo
│  │  ├─ Encode base64
│  │  ├─ Call Gemini(prompt, image)
│  │  ├─ Parse JSON response
│  │  └─ Update documentos table { dados_extraidos: {...} }
│  └─ Output: { numero: "123...", cpf: "123...", ... }
│
├─ MAP_TO_FIELDS (para todos docs extraídos)
│  ├─ Input: { minuta_id: "minuta-123" }
│  ├─ Process:
│  │  ├─ Fetch all documentos com status="extraido"
│  │  ├─ Sort by priority (RG>CNH>MATRICULA>...)
│  │  ├─ Para cada documento:
│  │  │  ├─ Map tipo → PessoaNatural/Imovel/NegocioJuridico
│  │  │  ├─ Deduplicate por CPF
│  │  │  ├─ Merge sources
│  │  │  └─ Upsert em tabelas estruturadas
│  │  └─ Return { alienantes, adquirentes, imovel, negocio }
│  └─ Output: Structured schema
│
└─ GENERATE_MINUTA
   ├─ Input: { minuta_id: "minuta-123" }
   ├─ Process:
   │  ├─ Aggregate data from structured tables
   │  ├─ Load template from templates table
   │  ├─ Build prompt = basePrompt + template + dados
   │  ├─ Call Gemini(prompt)
   │  ├─ Parse response
   │  └─ Update minutas table { minuta_texto: "..." }
   └─ Output: minuta_texto (escritura completa)

SAÍDA: Minuta pronta em texto
```

---

## 4. INTEGRAÇÕES EXTERNAS

### 4.1 Gemini API

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

**Request Format**:
```json
{
  "contents": [
    {
      "parts": [
        { "inlineData": { "mimeType": "image/jpeg", "data": "base64string" } },
        { "text": "prompt text" }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.1,
    "maxOutputTokens": 16384
  }
}
```

**Response Format**:
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          { "text": "response text" }
        ]
      },
      "finishReason": "STOP"
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 1234,
    "candidatesTokenCount": 567,
    "totalTokenCount": 1801
  }
}
```

**Timing**: ~2-5s por request (dependendo tamanho documento)

**Rate Limits**:
- 60 requisições por minuto (free tier)
- Sem limite de quota em production

### 4.2 Supabase Storage

**Bucket**: `documentos` (para docs originais)
**Bucket**: `agentes-especialistas-docs` (para runs de agentes)

**Upload Path**:
```
{user_id}/{run_id}/{filename}
```

**Download & Operations**:
```typescript
// Download
const { data: fileData } = await serviceClient.storage
  .from('documentos')
  .download(documento.storage_path);

// Convert to ArrayBuffer
const arrayBuffer = await fileData.arrayBuffer();

// Generate signed URL
const { data: signedUrl } = await serviceClient.storage
  .from('agentes-especialistas-docs')
  .createSignedUrl(storagePath, 3600); // 1 hour validity
```

### 4.3 Supabase PostgreSQL

**Tabelas Principais**:

```sql
-- Minutas
CREATE TABLE minutas (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo VARCHAR,
  tipo_ato VARCHAR,
  data_lavratura DATE,
  minuta_texto TEXT,
  status VARCHAR,
  created_at TIMESTAMP DEFAULT now()
);

-- Documentos
CREATE TABLE documentos (
  id UUID PRIMARY KEY,
  minuta_id UUID NOT NULL REFERENCES minutas(id),
  nome_original VARCHAR,
  storage_path VARCHAR,
  mime_type VARCHAR,
  tipo_documento VARCHAR,
  dados_extraidos JSONB,
  status VARCHAR,
  created_at TIMESTAMP
);

-- Pessoas naturais (mapped)
CREATE TABLE pessoas_naturais (
  id UUID PRIMARY KEY,
  minuta_id UUID NOT NULL,
  cpf VARCHAR UNIQUE,
  nome VARCHAR,
  rg VARCHAR,
  data_nascimento DATE,
  endereco_logradouro VARCHAR,
  endereco_numero VARCHAR,
  endereco_cidade VARCHAR,
  endereco_estado VARCHAR,
  papel VARCHAR, -- 'outorgante', 'outorgado', 'anuente'
  fontes JSONB, -- { campo: ['source1', 'source2'] }
  created_at TIMESTAMP
);

-- Imóveis (mapped)
CREATE TABLE imoveis (
  id UUID PRIMARY KEY,
  minuta_id UUID NOT NULL,
  matricula_numero VARCHAR,
  matricula_cartorio VARCHAR,
  endereco_logradouro VARCHAR,
  endereco_numero VARCHAR,
  endereco_cidade VARCHAR,
  endereco_estado VARCHAR,
  area_total VARCHAR,
  area_privativa VARCHAR,
  valor_venal VARCHAR,
  fontes JSONB,
  created_at TIMESTAMP
);

-- Negócios jurídicos (mapped)
CREATE TABLE negocios_juridicos (
  id UUID PRIMARY KEY,
  minuta_id UUID NOT NULL,
  imovel_id UUID REFERENCES imoveis(id),
  tipo VARCHAR, -- 'compra_venda', etc
  valor DECIMAL,
  forma_pagamento VARCHAR,
  data_contrato DATE,
  fontes JSONB,
  created_at TIMESTAMP
);

-- Agent executions (logging)
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY,
  minuta_id UUID,
  documento_id UUID,
  agent_type VARCHAR, -- 'classify', 'extract', 'map', 'generate'
  status VARCHAR, -- 'running', 'success', 'error'
  prompt_used TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_estimate DECIMAL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  error_message TEXT,
  result JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Agent prompts (for dynamic loading)
CREATE TABLE agent_prompts (
  id UUID PRIMARY KEY,
  tipo_documento VARCHAR,
  prompt_text TEXT,
  versao INTEGER,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Specialist agents
CREATE TABLE specialist_agents (
  agent_slug VARCHAR PRIMARY KEY,
  nome_exibicao VARCHAR,
  descricao TEXT,
  categoria VARCHAR,
  ativo BOOLEAN DEFAULT true
);

-- Specialist prompts (versioned)
CREATE TABLE specialist_prompts (
  id UUID PRIMARY KEY,
  agent_slug VARCHAR REFERENCES specialist_agents(agent_slug),
  system_prompt TEXT,
  versao INTEGER,
  ativo BOOLEAN,
  created_at TIMESTAMP
);

-- Specialist runs (execution history)
CREATE TABLE agentes_especialistas_runs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_slug VARCHAR,
  agent_nome VARCHAR,
  documentos JSONB, -- [{ nome, storage_path, mime_type, tamanho_bytes }]
  instrucoes_customizadas TEXT,
  status VARCHAR, -- 'processing', 'completed', 'error'
  prompt_versao INTEGER,
  prompt_usado TEXT,
  output_texto TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_estimate DECIMAL,
  erro_mensagem TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 5. TRATAMENTO DE ERRORS

### 5.1 Hierarquia de Erros

```
Error
├─ ValidationError
│  ├─ MissingParameterError
│  ├─ InvalidFormatError
│  └─ UnsupportedFileTypeError
├─ AuthenticationError
│  └─ UnauthorizedError
├─ NotFoundError
├─ ExternalServiceError
│  ├─ GeminiAPIError
│  └─ SupabaseError
└─ InternalServerError
```

### 5.2 Tratamento Padrão

```typescript
try {
  // Processing
} catch (error) {
  if (error instanceof ValidationError) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  } else if (error instanceof AuthenticationError) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    );
  } else if (error instanceof NotFoundError) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 404 }
    );
  } else {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
```

---

## 6. SEGURANÇA

### 6.1 Autenticação

```typescript
// Verificar JWT do usuário
const authHeader = req.headers.get('Authorization');
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  throw new Error('Unauthorized');
}
```

### 6.2 RLS (Row Level Security)

```sql
-- Usuários podem ver apenas suas minutas
CREATE POLICY "Users can view own minutas"
ON minutas
FOR SELECT
USING (auth.uid() = user_id);

-- Documentos protegidos via minuta
CREATE POLICY "Users can view documents in their minutas"
ON documentos
FOR SELECT
USING (
  minuta_id IN (
    SELECT id FROM minutas WHERE user_id = auth.uid()
  )
);
```

### 6.3 Service Role

```typescript
// Para operações que precisam bypassar RLS
const serviceClient = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')  // Never expose
);
```

---

## 7. PERFORMANCE E OTIMIZAÇÕES

### 7.1 Gargalos Conhecidos

| Operação | Tempo | Gargalo |
|----------|-------|---------|
| Classify (imagem) | 2-3s | Gemini API |
| Extract (arquivo 5MB) | 4-6s | Gemini + parsing |
| Map (10 docs) | 500ms | DB queries + merge logic |
| Generate (template + dados) | 5-8s | Gemini API |
| DOCX normalize | 1-2s | Mammoth.js parsing |

### 7.2 Otimizações Implementadas

1. **Base64 Encoding Eficiente**
   ```typescript
   // Usa deno std library (otimizada)
   import { encode as base64Encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';
   ```

2. **Prompt Versions**
   - Matriculas > 2MB usam versão compacta
   - Reduz tokens e tempo de processamento

3. **Deduplication por CPF**
   - Evita criar duplicatas na tabela pessoas_naturais
   - Merge automático de fontes

4. **JSON Parsing Resiliente**
   - Trata markdown, newlines, controle chars
   - Não falha por formatação menor

### 7.3 Caching Potencial

```typescript
// Não implementado ainda, mas possível
const PROMPT_CACHE = new Map<string, string>();

async function loadExtractionPromptCached(tipo: string) {
  if (PROMPT_CACHE.has(tipo)) {
    return PROMPT_CACHE.get(tipo)!;
  }

  const prompt = await loadExtractionPrompt(tipo);
  PROMPT_CACHE.set(tipo, prompt);
  return prompt;
}
```

---

## 8. TRANSAÇÕES E ATOMICIDADE

### 8.1 Operação Não-Atômica Atual

Exemplo: `extract-document`

```
1. Update documentos status='extraindo'
2. Call Gemini → pode falhar
3. Se falha em step 2, status fica 'extraindo' indefinidamente
```

### 8.2 Melhoria Sugerida

```typescript
// Usar Supabase transactions (quando disponível)
const { data, error } = await serviceClient.rpc('extract_document_transaction', {
  documento_id: 'doc-123',
  // Função RPC que executa atomicamente
});

// SQL PL/pgSQL
CREATE OR REPLACE FUNCTION extract_document_transaction(
  p_documento_id UUID
)
RETURNS TABLE(...) AS $$
BEGIN
  UPDATE documentos SET status = 'extraindo' WHERE id = p_documento_id;
  -- Call Gemini (via trigger ou worker)
  -- Se sucesso, update status = 'extraido'
  -- Se erro, rollback automático
EXCEPTION WHEN OTHERS THEN
  UPDATE documentos SET status = 'erro_extracao' WHERE id = p_documento_id;
  RAISE;
END;
$$ LANGUAGE plpgsql;
```

---

## 9. VERSIONAMENTO DE PROMPTS

### 9.1 Schema de Versionamento

```sql
-- Manter histórico completo
INSERT INTO agent_prompts (tipo_documento, prompt_text, versao, ativo)
VALUES (
  'MATRICULA_IMOVEL',
  '[NOVO PROMPT]',
  3,  -- Incrementar automaticamente
  true
);

-- Desativar versão anterior
UPDATE agent_prompts
SET ativo = false
WHERE tipo_documento = 'MATRICULA_IMOVEL'
AND versao = 2;
```

### 9.2 Rastreamento em Execuções

```sql
-- Query: qual versão de prompt foi usada em cada execução
SELECT
  agent_type,
  tipo_documento,
  prompt_used,  -- Salva prompt completo para auditoria
  COUNT(*) as vezes_usado,
  AVG(duration_ms) as tempo_medio_ms,
  AVG(cost_estimate) as custo_medio
FROM agent_executions
WHERE created_at >= now() - interval '7 days'
GROUP BY agent_type, tipo_documento
ORDER BY vezes_usado DESC;
```

---

## 10. EVOLUÇÃO ARQUITETURAL

### 10.1 Atual (4 functions sequenciais)

```
Classify → Extract → Map → Generate
```

**Limitações**:
- Processamento sequencial
- Reprocessamento necessário se erro
- Sem paralelismo

### 10.2 Proposto (v2 com paralelismo)

```
Classify ─┐
          ├─→ Map
Extract ──┘
          └─→ Generate
```

**Melhorias**:
- Classify + Extract em paralelo
- Map aguarda todos docs extraídos
- Generate começa após map

### 10.3 Futuro (v3 com orquestrador)

```
Queue Job
  │
  ├─ Classify Worker 1
  ├─ Extract Worker 2
  ├─ Map Worker 3
  └─ Generate Worker 4

Webhook on complete
```

**Tecnologias**:
- Bull Queue ou similar
- Multiple workers
- Webhooks para notificação

---

## 11. MONITORAMENTO RECOMENDADO

### Métricas Críticas

```
1. Taxa de sucesso por tipo de documento
2. Token usage trends (detectar abusos)
3. Latência por stage (identify bottlenecks)
4. Custo acumulado por usuário
5. Error rate por tipo de erro
```

### Dashboards

```sql
-- Prometheus-compatible query
SELECT
  time_bucket('5 minutes', created_at) as time,
  agent_type,
  COUNT(*) as success,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
  AVG(duration_ms) as avg_duration_ms
FROM agent_executions
WHERE created_at >= now() - interval '24 hours'
GROUP BY time, agent_type
ORDER BY time DESC;
```

---

**Documento Técnico Concluído**
