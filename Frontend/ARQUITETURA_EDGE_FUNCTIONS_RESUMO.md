# Arquitetura de Edge Functions - Guia Completo

## 📋 Estrutura Geral

### Diretório Principal
```
supabase/functions/
├── _shared/                    # Shared utilities (importadas por todas as functions)
├── classify-document/index.ts  # Classifica tipo de documento
├── extract-document/index.ts   # Extrai dados do documento
├── generate-minuta/index.ts    # Gera minuta completa
├── map-to-fields/index.ts      # Mapeia dados para campos estruturados
└── agentes-especialistas/      # (Legacy) Sistema de agentes
```

---

## 🔧 Shared Utilities (`supabase/functions/_shared/`)

### 1. **supabase-client.ts**
Cria clientes Supabase com diferentes níveis de permissão:

```typescript
// Cliente anon (respeita RLS - Row Level Security)
export function createSupabaseClient(req: Request) {
  const authHeader = req.headers.get('Authorization');
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader ?? '' } } }
  );
}

// Cliente service role (bypassa RLS - use com cuidado!)
export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}
```

**Quando usar qual:**
- `createServiceClient()`: Para operações que precisam ler/escrever sem RLS (storage, agent logging)
- `createSupabaseClient(req)`: Para operações que respeitam permissões do usuário

---

### 2. **file-normalizer.ts**
Converte arquivos para formatos compatíveis com Gemini API.

**Formatos nativos (passam direto):**
- PDFs (até 50MB, 1000 páginas)
- Imagens: JPEG, PNG, WebP, GIF, HEIC, HEIF, BMP
- Texto: plain, markdown, HTML, CSV

**Conversões automáticas:**
- DOCX → HTML (usando Mammoth.js `npm:mammoth@1.8.0`)

```typescript
export interface NormalizedFile {
  content: ArrayBuffer;          // Conteúdo pronto para Gemini
  mimeType: string;              // MIME type final (pode ser convertido)
  originalName: string;
  originalMimeType: string;      // MIME type original
  wasConverted: boolean;
  conversionWarnings?: string[];
}

// Uso
const normalized = await normalizeFilesForGemini([
  { buffer: fileBuffer, name: 'documento.docx', mimeType: 'application/...' }
]);
```

**Funções úteis:**
```typescript
isMimeTypeSupported(mimeType: string): boolean
requiresConversion(mimeType: string): boolean
getSupportedFormatsDescription(): string  // Descrição para usuários
```

---

### 3. **gemini-client.ts**
Interface com Google Gemini API (2.0-Flash).

```typescript
// Importações
import { encode as base64Encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';

// Função principal
export async function callGemini(
  prompt: string,
  imageBase64?: string,
  imageMimeType?: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<{
  text: string;
  usage: { inputTokens: number; outputTokens: number }
}>

// Utilidades
export function arrayBufferToBase64(buffer: ArrayBuffer): string
export function parseGeminiJson<T>(text: string): T  // Robusta contra formatação quebrada
```

**Configuração:**
- Model: `gemini-2.0-flash`
- Temperature padrão: 0.1 (muito determinístico)
- Max tokens padrão: 16384
- Chave: `Deno.env.get('GEMINI_API_KEY')`

**Tratamento de resposta:**
O `parseGeminiJson()` é robusto contra:
- Markdown code blocks (```json ... ```)
- BOM e caracteres invisíveis
- Newlines e control characters em strings
- Remove automaticamente espaços em branco

---

### 4. **cors.ts**
Headers CORS padrão para todas as respostas:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

**Uso em todas as respostas:**
```typescript
return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

---

### 5. **execution-logger.ts**
Registra execução de agents com custo e tokens.

```typescript
export type AgentType = 'classify' | 'extract' | 'generate' | 'map';

export interface ExecutionLog {
  id: string;
  started_at: string;
}

// Uso: opção 1 (verbose)
const execution = await startExecution(serviceClient, 'classify', {
  documentoId: doc_id,
  minutaId: minuta_id,
  promptUsed: prompt,
  promptVersion: 1
});

try {
  // ... fazer trabalho ...
  await logSuccess(serviceClient, execution, result, {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens
  });
} catch (error) {
  await logError(serviceClient, execution, error);
  throw error;
}

// Uso: opção 2 (wrapper limpo)
const result = await withExecutionLogging(
  serviceClient,
  'extract',
  { documentoId: doc_id },
  async () => {
    const response = await callGemini(prompt, base64, mimeType);
    return {
      result: parseResult(response.text),
      usage: response.usage
    };
  }
);
```

**Cálculo de custo (Gemini 1.5 Flash):**
- Input: $0.25 por 1M tokens
- Output: $1.25 por 1M tokens

---

### 6. **prompts.ts**
Carrega prompts dinâmicos do banco de dados.

```typescript
// Prompts de extração por tipo de documento
export async function loadExtractionPrompt(
  tipoDocumento: string,
  fileSize?: number
): Promise<{ prompt: string; versao: number }>

// Exemplo: para MATRICULA_IMOVEL grande (>2MB), carrega versão compacta

// Prompt de classificação (único)
export async function loadClassificationPrompt(): Promise<{
  prompt: string;
  versao: number;
}>
```

**Tabela no banco:** `agent_prompts`
- `tipo_documento` (VARCHAR): tipo ou "CLASSIFICATION"
- `prompt_text` (TEXT): conteúdo do prompt
- `versao` (INTEGER): versão ativa
- `ativo` (BOOLEAN): permite desativar sem deletar

---

### 7. **types.ts**
Tipos compartilhados do sistema:

```typescript
// Tipos de documento
export const VALID_DOCUMENT_TYPES = [
  'RG', 'CNH', 'CPF', 'CERTIDAO_NASCIMENTO', ...
] as const;
export type DocumentType = typeof VALID_DOCUMENT_TYPES[number];

// Resultado de classificação
export interface ClassificationResult {
  tipo_documento: DocumentType;
  confianca: 'Alta' | 'Media' | 'Baixa';
  pessoa_relacionada: string | null;
  observacao: string;
}

// Resultado de extração (dados estruturados)
export interface ExtractionResult {
  dados_estruturados: Record<string, unknown>;
  explicacao_contextual: string;
  campos_extraidos: string[];
  campos_faltantes: string[];
}

// Dados mapeados (output final)
export interface MappedFields {
  alienantes: PessoaNatural[];
  adquirentes: PessoaNatural[];
  anuentes: PessoaNatural[];
  imovel: Imovel;
  negocio: NegocioJuridico;
  alertas_juridicos: AlertaJuridico[];
  metadata: MappingMetadata;
}

// E muitos outros... ver arquivo completo para estrutura de pessoas, imóveis, etc
```

---

### 8. **templates.ts**
Templates para geração de minutas com placeholders.

**Tipos principais:**
```typescript
export interface PessoaQualificacao {
  nome: string;
  cpf: string;
  rg?: string;
  nacionalidade: string;
  profissao: string;
  estadoCivil: string;
  domicilio: Endereco;
  // ... e outros campos
}

export interface ImovelMinuta {
  matricula: string;
  cartorio: string;
  tipo: string;
  endereco: Partial<Endereco>;
  // ... e outros campos
}

export const QUALIFICATION_TEMPLATES = {
  SOLTEIRO: "**{{NOME}},** {{NACIONALIDADE}}, solteiro{{GENERO_A}}, ...",
  CASADO_SEM_PACTO: "...",
  CASADO_COM_PACTO_AMBOS: "...",
  PESSOA_JURIDICA: "...",
  // etc
}

export const MINUTA_TEMPLATES = {
  VENDA_COMPRA: "**ESCRITURA DE VENDA E COMPRA**\n\nAos {{DATA_LAVRATURA_EXTENSO}} ...",
}
```

**Funções úteis:**
```typescript
generateQualificationText(pessoa: PessoaQualificacao, options?): string
mapDatabaseToPlaceholders(data: MinutaCompleta): Record<string, string>
replacePlaceholders(template: string, values: Record<string, string>): string
```

---

## 📦 Padrão de Edge Function

Toda edge function segue este padrão:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson } from '../_shared/gemini-client.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';

interface RequestBody {
  // ... campos específicos
}

serve(async (req) => {
  // ✅ CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    // ✅ Parse request
    const body: RequestBody = await req.json();

    // ✅ Validação
    if (!body.required_field) {
      throw new Error('required_field is required');
    }

    // ✅ Fetch data from database
    const { data, error } = await serviceClient
      .from('table_name')
      .select('*')
      .eq('id', body.id)
      .single();

    if (error || !data) throw new Error('Data not found');

    // ✅ Update status (processing)
    await serviceClient
      .from('table_name')
      .update({ status: 'processing' })
      .eq('id', body.id);

    // ✅ Start execution logging
    execution = await startExecution(serviceClient, 'classify' | 'extract' | 'generate' | 'map', {
      documentoId: body.id,
      promptUsed: prompt,
    });

    // ✅ Download file if needed
    const { data: fileData } = await serviceClient.storage
      .from('bucket_name')
      .download(data.storage_path);

    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    // ✅ Call Gemini
    const { text, usage } = await callGemini(
      prompt,
      base64,
      data.mime_type,
      { maxTokens: 16384 }
    );

    // ✅ Parse response
    const result = parseGeminiJson<ResultType>(text);

    // ✅ Update database with result
    await serviceClient
      .from('table_name')
      .update({
        result_field: result,
        status: 'completed',
      })
      .eq('id', body.id);

    // ✅ Log success
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });

    // ✅ Return response
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);

    // ✅ Log error
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

---

## 🔗 Importações Padrão

### De Deno STD
```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';
```

### De npm (via esm.sh)
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as mammoth from 'npm:mammoth@1.8.0';
```

### Locais (_shared)
```typescript
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient, createSupabaseClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { startExecution, logSuccess, logError, withExecutionLogging } from '../_shared/execution-logger.ts';
import { loadClassificationPrompt, loadExtractionPrompt } from '../_shared/prompts.ts';
import type { ClassificationResult, ExtractionResult } from '../_shared/types.ts';
import { MINUTA_TEMPLATES, replacePlaceholders } from '../_shared/templates.ts';
import { normalizeFilesForGemini } from '../_shared/file-normalizer.ts';
```

---

## 📊 Fluxo de Operações

### Pipeline Classificação → Extração → Geração

```
[Frontend Upload]
        ↓
[classify-document]
  - Download arquivo
  - Chama Gemini com prompt CLASSIFICATION
  - Atualiza tipo_documento em documentos
  - Log execução
        ↓
[extract-document] (triggered quando status = 'classificado')
  - Download arquivo
  - Load extraction prompt por tipo_documento
  - Chama Gemini
  - Atualiza dados_extraidos
  - Log execução
        ↓
[map-to-fields] (triggered quando status = 'extraido')
  - Mapeia dados_extraidos para MappedFields
  - Salva em minutas table
  - Log execução
        ↓
[generate-minuta] (triggered manualmente)
  - Agrega dados de múltiplos documentos
  - Load template MINUTA_TEMPLATES
  - Chama Gemini com prompt generation
  - Atualiza minuta_texto
  - Log execução
```

---

## 🔑 Variáveis de Ambiente

```bash
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ⚠️ Mais privilegiado
GEMINI_API_KEY=AIzaSy...
```

---

## 💾 Tabelas Importantes

### `documentos`
```sql
id (UUID)
minuta_id (UUID, FK)
tipo_documento (VARCHAR) -- Preenchido por classify-document
status (VARCHAR) -- 'pendente' → 'classificando' → 'classificado' → 'extraindo' → 'extraido'
dados_extraidos (JSONB) -- Preenchido por extract-document
mime_type (VARCHAR)
storage_path (TEXT) -- Caminho no Storage
```

### `agent_executions`
```sql
id (UUID, PK)
agent_type (VARCHAR) -- 'classify', 'extract', 'generate', 'map'
documento_id (UUID, FK)
minuta_id (UUID, FK)
status (VARCHAR) -- 'running', 'success', 'error'
started_at (TIMESTAMP)
completed_at (TIMESTAMP)
duration_ms (INTEGER)
prompt_used (TEXT)
prompt_version (INTEGER)
input_tokens (INTEGER)
output_tokens (INTEGER)
cost_estimate (DECIMAL)
result (JSONB)
error_message (TEXT)
```

### `agent_prompts`
```sql
id (UUID, PK)
tipo_documento (VARCHAR) -- 'CLASSIFICATION', 'RG', 'CNH', etc
prompt_text (TEXT)
versao (INTEGER)
ativo (BOOLEAN)
criado_em (TIMESTAMP)
```

---

## ⚡ Otimizações e Boas Práticas

### 1. **Usar Service Client para Bypass de RLS**
```typescript
// ✅ Correto - Bypass RLS para operações administrativas
const serviceClient = createServiceClient();
const data = await serviceClient.from('documentos').select('*').eq('id', id);

// ⚠️ Não use anon client para storage bypass
const anonClient = createSupabaseClient(req);  // Respeita RLS
```

### 2. **Converter DOCX Antes de Enviar para Gemini**
```typescript
// ✅ Correto
const normalized = await normalizeFilesForGemini([
  { buffer, name: 'documento.docx', mimeType: 'application/vnd.openxmlformats...' }
]);
const { content, mimeType } = normalized.files[0];

// ❌ Não envie DOCX diretamente - Gemini não suporta nativamente
```

### 3. **Sempre Usar withExecutionLogging para Wrapper**
```typescript
// ✅ Limpo e automático
const result = await withExecutionLogging(
  serviceClient, 'extract', { documentoId },
  async () => {
    const response = await callGemini(prompt, base64, mimeType);
    return { result: parse(response.text), usage: response.usage };
  }
);

// vs Manual (mais verboso)
const execution = await startExecution(...);
try {
  // ... fazer coisa ...
  await logSuccess(...);
} catch (e) {
  await logError(...);
}
```

### 4. **Validar Status Antes de Processar**
```typescript
if (!documento.tipo_documento) {
  throw new Error('Document must be classified before extraction');
}
```

### 5. **Truncar Prompts para Logging**
```typescript
// Não log prompts completos (muito espaço)
promptUsed: prompt.substring(0, 5000)
```

### 6. **Tratar Erros de Gemini**
```typescript
// parseGeminiJson é robusto, mas se falhar:
try {
  const result = parseGeminiJson<T>(text);
} catch (e) {
  console.error('Failed to parse:', e);
  console.error('Raw text (first 500 chars):', text.substring(0, 500));
  throw e;
}
```

---

## 🚀 Checklist para Nova Edge Function `extract-template-text`

```typescript
// Arquivo: supabase/functions/extract-template-text/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { normalizeFilesForGemini } from '../_shared/file-normalizer.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';

interface RequestBody {
  template_id: string;
  // adicionar campos conforme necessário
}

interface ExtractedTemplateText {
  texto_extraido: string;
  secoes: Record<string, string>;
  campos_identificados: string[];
  metadados: {
    total_caracteres: number;
    total_paragrafos: number;
  };
}

serve(async (req) => {
  // ✅ CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    const { template_id }: RequestBody = await req.json();

    if (!template_id) {
      throw new Error('template_id is required');
    }

    // ✅ Fetch template
    const { data: template, error: templateError } = await serviceClient
      .from('minutas_padrao')  // ou tabela de templates
      .select('*')
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${template_id}`);
    }

    // ✅ Update status
    await serviceClient
      .from('minutas_padrao')
      .update({ status: 'extraindo' })
      .eq('id', template_id);

    // ✅ Start logging
    execution = await startExecution(serviceClient, 'extract', {
      documentoId: template_id,
      promptUsed: 'Extract template text and identify sections',
    });

    // ✅ Download file
    const { data: fileData } = await serviceClient.storage
      .from('templates')  // ou bucket certo
      .download(template.storage_path);

    if (!fileData) throw new Error('Failed to download file');

    // ✅ Normalize file (importante!)
    const arrayBuffer = await fileData.arrayBuffer();
    const normalized = await normalizeFilesForGemini([
      {
        buffer: arrayBuffer,
        name: template.nome,
        mimeType: template.mime_type
      }
    ]);

    const { content, mimeType } = normalized.files[0];
    const base64 = arrayBufferToBase64(content);

    // ✅ Call Gemini
    const prompt = `Você é um especialista em análise de documentos jurídicos.
Extraia o texto completo do documento e identifique as principais seções e campos.
Retorne um JSON com:
- texto_extraido: texto completo
- secoes: objeto com seções identificadas
- campos_identificados: array de campos encontrados
- metadados: contagem de caracteres e parágrafos`;

    const { text, usage } = await callGemini(
      prompt,
      base64,
      mimeType,
      { maxTokens: 16384 }
    );

    // ✅ Parse result
    const result = parseGeminiJson<ExtractedTemplateText>(text);

    // ✅ Update database
    await serviceClient
      .from('minutas_padrao')
      .update({
        texto_extraido: result.texto_extraido,
        secoes: result.secoes,
        status: 'extraido',
      })
      .eq('id', template_id);

    // ✅ Log success
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Extract template error:', error);

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

---

## 📝 Resumo: Próximas Etapas para `extract-template-text`

1. **Criar arquivo:** `/supabase/functions/extract-template-text/index.ts`
2. **Seguir padrão:** Use template acima como base
3. **Imports:** Use os 5 _shared imports principais
4. **Request/Response types:** Define RequestBody e ResponseType específicos
5. **Logging:** Sempre use execution logger
6. **File handling:** Normalize files antes de enviar para Gemini
7. **Error handling:** Wrap em try/catch com logging
8. **CORS:** Sempre responder OPTIONS com corsHeaders
9. **Database:** Usar serviceClient para bypass de RLS
10. **Testing:** Testar com arquivo real (PDF ou DOCX)

---

## 🎯 Padrão de Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `DOCX file not found in Gemini` | Enviando DOCX direto | Use `normalizeFilesForGemini()` primeiro |
| `RLS policy violation` | Usando anon client | Trocar para `createServiceClient()` |
| `Unexpected token in JSON` | Gemini retornou markdown | `parseGeminiJson()` já trata isso |
| `Prompt too long` | Prompt excedendo limite | Truncar ou usar versão compacta |
| `Execution log failed` | Falha ao inserir em agent_executions | Code continua (graceful degradation) |

---

## 🔗 Referências de Imports Completas

```typescript
// STD Library
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';

// External packages (npm via esm.sh)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as mammoth from 'npm:mammoth@1.8.0';

// Local _shared
import { corsHeaders } from '../_shared/cors.ts';
import {
  createServiceClient,
  createSupabaseClient
} from '../_shared/supabase-client.ts';
import {
  callGemini,
  parseGeminiJson,
  arrayBufferToBase64
} from '../_shared/gemini-client.ts';
import {
  normalizeFilesForGemini,
  isMimeTypeSupported,
  requiresConversion
} from '../_shared/file-normalizer.ts';
import {
  startExecution,
  logSuccess,
  logError,
  withExecutionLogging,
  calculateCost
} from '../_shared/execution-logger.ts';
import {
  loadClassificationPrompt,
  loadExtractionPrompt
} from '../_shared/prompts.ts';
import type {
  ClassificationResult,
  ExtractionResult,
  MappedFields,
  DocumentType,
  AgentType
} from '../_shared/types.ts';
import {
  MINUTA_TEMPLATES,
  replacePlaceholders,
  generateQualificationText,
  mapDatabaseToPlaceholders
} from '../_shared/templates.ts';
```

Este é o guia completo para implementar `extract-template-text` e outras edge functions mantendo consistência com a arquitetura existente!
