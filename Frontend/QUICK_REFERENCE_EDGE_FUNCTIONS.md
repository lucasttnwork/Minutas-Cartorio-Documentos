# Quick Reference - Edge Functions

## 🚀 TL;DR - Arquitetura

**5 coisas que você PRECISA saber:**

1. **Service Client** - Bypass RLS
   ```typescript
   const serviceClient = createServiceClient();
   ```

2. **File Normalization** - DOCX → HTML
   ```typescript
   const normalized = await normalizeFilesForGemini([...]);
   ```

3. **Execution Logging** - Rastreia tokens e custo
   ```typescript
   const execution = await startExecution(serviceClient, 'extract', {...});
   await logSuccess(serviceClient, execution, result, {...});
   ```

4. **Gemini Call** - Chama API
   ```typescript
   const { text, usage } = await callGemini(prompt, base64, mimeType);
   const result = parseGeminiJson<T>(text);
   ```

5. **CORS** - Necessário para frontend
   ```typescript
   if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
   ```

---

## 📁 Estrutura de Diretórios

```
supabase/functions/
├── _shared/                    ← Importações compartilhadas
│   ├── cors.ts
│   ├── supabase-client.ts
│   ├── gemini-client.ts
│   ├── file-normalizer.ts
│   ├── execution-logger.ts
│   ├── prompts.ts
│   ├── templates.ts
│   └── types.ts
│
├── classify-document/index.ts  ← Classifica tipo de documento
├── extract-document/index.ts   ← Extrai dados do documento
├── generate-minuta/index.ts    ← Gera minuta completa
├── map-to-fields/index.ts      ← Mapeia dados (future)
├── extract-template-text/      ← ⭐ NOVA (você vai criar)
│   └── index.ts
└── agentes-especialistas/      ← Legacy

```

---

## 🎯 3 Minutos - Template Completo

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';

interface RequestBody { id: string; }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    const { id }: RequestBody = await req.json();
    if (!id) throw new Error('id is required');

    // START logging
    execution = await startExecution(serviceClient, 'classify', { documentoId: id });

    // FETCH data
    const { data } = await serviceClient.from('tabela').select('*').eq('id', id).single();
    if (!data) throw new Error('Not found');

    // DOWNLOAD file
    const { data: fileData } = await serviceClient.storage.from('bucket').download(data.path);
    const base64 = arrayBufferToBase64(await fileData.arrayBuffer());

    // CALL Gemini
    const { text, usage } = await callGemini('Your prompt', base64, data.mime_type);

    // PARSE result
    const result = parseGeminiJson(text);

    // SAVE to DB
    await serviceClient.from('tabela').update({ resultado: result }).eq('id', id);

    // LOG success
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    if (execution.id) await logError(serviceClient, execution, error as Error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 📦 Imports - Copia e Cola

```typescript
// STD Library
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';

// Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// NPM
import * as mammoth from 'npm:mammoth@1.8.0';

// Local _shared
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient, createSupabaseClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { normalizeFilesForGemini } from '../_shared/file-normalizer.ts';
import { startExecution, logSuccess, logError, withExecutionLogging } from '../_shared/execution-logger.ts';
import { loadClassificationPrompt, loadExtractionPrompt } from '../_shared/prompts.ts';
import type { ClassificationResult, ExtractionResult } from '../_shared/types.ts';
import { MINUTA_TEMPLATES, replacePlaceholders } from '../_shared/templates.ts';
```

---

## 🔄 Pipeline: Antes → Depois

```
ANTES:                       DEPOIS:
Request                      Request
  ↓                            ↓
[No logging]                 startExecution()
  ↓                            ↓
API call                     Normalize file
  ↓                            ↓
Update DB                    callGemini()
  ↓                            ↓
Response                     parseGeminiJson()
                               ↓
                             Update DB
                               ↓
                             logSuccess()
                               ↓
                             Response
```

---

## 🎪 Gemini API - Configuração

```typescript
// Constants
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

// Pricing (2024)
const COST_PER_1K_INPUT = 0.00025;    // $0.25 per 1M
const COST_PER_1K_OUTPUT = 0.00125;   // $1.25 per 1M

// Defaults
const DEFAULT_TEMPERATURE = 0.1;       // Determinístico
const DEFAULT_MAX_TOKENS = 16384;
const MAX_FILE_SIZE = 50_000_000;      // 50MB
const MAX_PAGES = 1000;                // PDFs
```

---

## 💾 Banco de Dados - Tabelas Principais

### documentos
```sql
id UUID PRIMARY KEY
minuta_id UUID (FK)
tipo_documento VARCHAR  -- RG, CNH, etc (set by classify)
status VARCHAR  -- pendente → classificando → classificado → extraindo → extraido
dados_extraidos JSONB  -- Set by extract
mime_type VARCHAR
storage_path TEXT
classificacao_confianca VARCHAR  -- alta, media, baixa
pessoa_relacionada TEXT
```

### minutas
```sql
id UUID PRIMARY KEY
user_id UUID (FK)
minuta_texto TEXT  -- Set by generate
status VARCHAR  -- rascunho → revisao → finalizado
tipo_ato VARCHAR  -- venda_compra, doacao, etc
gerado_em TIMESTAMP
```

### agent_executions
```sql
id UUID PRIMARY KEY
agent_type VARCHAR  -- classify, extract, generate, map
documento_id UUID (FK)
minuta_id UUID (FK)
status VARCHAR  -- running, success, error
started_at TIMESTAMP
completed_at TIMESTAMP
input_tokens INTEGER
output_tokens INTEGER
cost_estimate DECIMAL
result JSONB
error_message TEXT
```

### agent_prompts
```sql
id UUID PRIMARY KEY
tipo_documento VARCHAR  -- CLASSIFICATION, RG, CNH, MATRICULA_IMOVEL, etc
prompt_text TEXT
versao INTEGER
ativo BOOLEAN
criado_em TIMESTAMP
```

---

## ⚙️ Environment Variables

```bash
# Required in .env or CI/CD
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSy...
```

---

## 🔧 Padrões Comuns

### Padrão 1: Simples com Logging
```typescript
const execution = await startExecution(serviceClient, 'classify', { documentoId });
try {
  // ... fazer coisa ...
  await logSuccess(serviceClient, execution, result, { inputTokens, outputTokens });
} catch (error) {
  await logError(serviceClient, execution, error);
  throw error;
}
```

### Padrão 2: Com Wrapper (Recomendado)
```typescript
const result = await withExecutionLogging(
  serviceClient, 'extract', { documentoId },
  async () => {
    const { text, usage } = await callGemini(...);
    return {
      result: parseGeminiJson(text),
      usage: { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens }
    };
  }
);
```

### Padrão 3: Com Normalização
```typescript
const normalized = await normalizeFilesForGemini([
  { buffer, name, mimeType }
]);
const { content, mimeType, wasConverted } = normalized.files[0];
const base64 = arrayBufferToBase64(content);
```

### Padrão 4: Error Handling
```typescript
try {
  // ... código ...
} catch (error) {
  console.error('Context:', { documentoId, errorMsg: error.message });
  if (execution.id) {
    await logError(serviceClient, execution, error as Error);
  }
  throw error;
}
```

---

## 🧪 Teste Rápido (cURL)

```bash
# Setup
ANON_KEY="seu_anon_key_aqui"
TEMPLATE_ID="test-123"
URL="http://localhost:54321/functions/v1/extract-template-text"

# Call
curl -X POST "$URL" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"template_id\": \"$TEMPLATE_ID\"}"

# Expected response
{
  "success": true,
  "result": {
    "id": "test-123",
    "texto_completo": "...",
    "secoes": {...},
    "campos_identificados": {...},
    "metadados": {...}
  }
}
```

---

## ❌ Erros Comuns & Soluções

| Erro | Causa | Fix |
|------|-------|-----|
| DOCX file not supported | Gemini não aceita DOCX | `normalizeFilesForGemini()` |
| RLS policy violation | Usando anon client | `createServiceClient()` |
| Unexpected token in JSON | Markdown em resposta | `parseGeminiJson()` |
| Template not found | Query errada | SELECT sem alias |
| Download failed | Storage path errado | Verify path exists |
| API key not set | Env var missing | Check GEMINI_API_KEY |
| Execution log failed | DB error | Graceful degradation (ok) |

---

## 📊 Performance Guidelines

| Config | Valor | Caso de Uso |
|--------|-------|-----------|
| temperature | 0.1 | Extração (determinístico) |
| temperature | 0.3-0.5 | Geração (criativo) |
| maxTokens | 4096 | Classificação |
| maxTokens | 8192 | Extração |
| maxTokens | 16384 | Geração |
| timeout | ~30s | Padrão Deno |
| cache | Não | Gemini sem cache |

---

## 🎯 Checklist - Antes de Deploy

- [ ] CORS handling: `if (req.method === 'OPTIONS')`
- [ ] Input validation: `if (!required_field) throw Error`
- [ ] Execution logging: `startExecution()` + `logSuccess/logError()`
- [ ] File normalization: `normalizeFilesForGemini()` se DOCX
- [ ] Error handling: try/catch com logging
- [ ] Response format: `{ success, data?, error? }`
- [ ] Headers: `{ ...corsHeaders, 'Content-Type': 'application/json' }`
- [ ] Types: RequestBody, ResponseType definidos
- [ ] Database: UPDATE com status correto
- [ ] Testado: com arquivo real

---

## 🚀 Deployment

```bash
# Local testing
supabase functions serve

# Deploy
supabase functions deploy extract-template-text

# Check logs
supabase functions fetch extract-template-text
```

---

## 📚 Links para Documentos Completos

1. **ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md** - Visão geral completa
2. **PADROES_CODIGO_EDGE_FUNCTIONS.md** - 10 padrões de código
3. **SPEC_EXTRACT_TEMPLATE_TEXT.md** - Especificação completa
4. **DIAGRAMA_ARQUITETURA_EDGE_FUNCTIONS.md** - Diagramas
5. **INDICE_ARQUITETURA_EDGE_FUNCTIONS.md** - Índice completo

---

## 💡 Pro Tips

1. **Sempre usar `arrayBufferToBase64()`** - Suporta arquivos grandes
2. **Carregar prompts dinamicamente** - Sem redeploy
3. **Logar de tudo** - execution_id é seu amigo
4. **Validar early** - Input validation no início
5. **Temperatura baixa (0.1)** - Para tarefas estruturadas
6. **Temperature média (0.3-0.5)** - Para geração criativa
7. **Monitorar custos** - $0.003-0.01 por execução típica
8. **Handle DOCX** - Use normalizer, não envie direto

---

## 🎪 1 Minuto - Essência

```
1. CORS? return ok
2. VALIDATE input
3. START logging → execution
4. FETCH from DB
5. DOWNLOAD from Storage
6. NORMALIZE if needed
7. CALL Gemini
8. PARSE JSON
9. UPDATE DB
10. LOG success
11. RETURN response
12. CATCH error → LOG error
```

---

**Status:** ✅ Pronto para usar
**Última atualização:** 2026-02-02
**Versão:** 1.0

Para documentação completa, veja INDICE_ARQUITETURA_EDGE_FUNCTIONS.md
