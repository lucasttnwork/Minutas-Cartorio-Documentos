# Padrões de Código para Edge Functions

## 1️⃣ Estrutura Básica - Padrão Mínimo

```typescript
// supabase/functions/sua-funcao/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';

interface RequestBody {
  id: string;
  // ... outros campos
}

serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();

  try {
    // 2. Parse request
    const body: RequestBody = await req.json();

    // 3. Validar inputs
    if (!body.id) {
      throw new Error('id is required');
    }

    // 4. Fazer trabalho aqui

    // 5. Retornar sucesso
    return new Response(
      JSON.stringify({ success: true, data: {} }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 2️⃣ Com Execução Logging

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';

interface RequestBody {
  documento_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    const { documento_id }: RequestBody = await req.json();

    if (!documento_id) {
      throw new Error('documento_id is required');
    }

    // ✅ START execution logging
    execution = await startExecution(serviceClient, 'classify', {
      documentoId: documento_id,
      minutaId: undefined,  // optional
      promptUsed: 'my-prompt-here',
      promptVersion: 1
    });

    // Do work...
    const result = { success: true };

    // ✅ LOG success (com tokens da API)
    await logSuccess(serviceClient, execution, result, {
      inputTokens: 150,
      outputTokens: 250
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);

    // ✅ LOG error
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

## 3️⃣ Com Gemini API

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';

interface RequestBody {
  documento_id: string;
}

interface ExtractionResult {
  dados: Record<string, unknown>;
  confianca: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    const { documento_id }: RequestBody = await req.json();

    if (!documento_id) {
      throw new Error('documento_id is required');
    }

    // Get document
    const { data: documento } = await serviceClient
      .from('documentos')
      .select('*')
      .eq('id', documento_id)
      .single();

    if (!documento) throw new Error('Document not found');

    // Start logging
    execution = await startExecution(serviceClient, 'extract', {
      documentoId: documento_id,
      promptUsed: 'Extract data from document'
    });

    // Download file
    const { data: fileData } = await serviceClient.storage
      .from('documentos')
      .download(documento.storage_path);

    if (!fileData) throw new Error('Failed to download file');

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    // Call Gemini
    const prompt = `Extract structured data from this document and return as JSON with fields: dados, confianca`;

    const { text, usage } = await callGemini(
      prompt,
      base64,
      documento.mime_type,
      {
        temperature: 0.1,
        maxTokens: 8192
      }
    );

    // Parse result (robust against formatting issues)
    const result = parseGeminiJson<ExtractionResult>(text);

    // Update database
    await serviceClient
      .from('documentos')
      .update({ dados_extraidos: result })
      .eq('id', documento_id);

    // Log success
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Extraction error:', error);

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

## 4️⃣ Com Normalização de Arquivo (DOCX → HTML)

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { normalizeFilesForGemini } from '../_shared/file-normalizer.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';

interface RequestBody {
  template_id: string;
}

serve(async (req) => {
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

    // Get template
    const { data: template } = await serviceClient
      .from('minutas_padrao')
      .select('*')
      .eq('id', template_id)
      .single();

    if (!template) throw new Error('Template not found');

    // Start logging
    execution = await startExecution(serviceClient, 'extract', {
      documentoId: template_id
    });

    // Download file
    const { data: fileData } = await serviceClient.storage
      .from('templates')
      .download(template.storage_path);

    if (!fileData) throw new Error('Failed to download file');

    // ⭐ KEY: Normalize file first (DOCX → HTML if needed)
    const arrayBuffer = await fileData.arrayBuffer();
    const normalized = await normalizeFilesForGemini([
      {
        buffer: arrayBuffer,
        name: template.nome || 'template',
        mimeType: template.mime_type
      }
    ]);

    // Use normalized file
    const { content, mimeType, wasConverted } = normalized.files[0];
    const base64 = arrayBufferToBase64(content);

    if (wasConverted) {
      console.log(`File was converted from ${template.mime_type} to ${mimeType}`);
    }

    // Call Gemini
    const { text, usage } = await callGemini(
      'Extract text and sections from template',
      base64,
      mimeType,
      { maxTokens: 16384 }
    );

    const result = parseGeminiJson<Record<string, unknown>>(text);

    // Log success
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);

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

## 5️⃣ Com Wrapper `withExecutionLogging` (Mais Limpo)

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { withExecutionLogging } from '../_shared/execution-logger.ts';

interface RequestBody {
  documento_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();

  try {
    const { documento_id }: RequestBody = await req.json();

    if (!documento_id) {
      throw new Error('documento_id is required');
    }

    // ⭐ withExecutionLogging handles start/success/error automatically
    const result = await withExecutionLogging(
      serviceClient,
      'extract',
      { documentoId: documento_id },
      async () => {
        // Get document
        const { data: documento } = await serviceClient
          .from('documentos')
          .select('*')
          .eq('id', documento_id)
          .single();

        if (!documento) throw new Error('Document not found');

        // Download and process
        const { data: fileData } = await serviceClient.storage
          .from('documentos')
          .download(documento.storage_path);

        if (!fileData) throw new Error('Failed to download file');

        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = arrayBufferToBase64(arrayBuffer);

        // Call Gemini
        const { text, usage } = await callGemini(
          'Extract data from document',
          base64,
          documento.mime_type
        );

        // Return result with usage info
        return {
          result: parseGeminiJson<Record<string, unknown>>(text),
          usage: {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens
          }
        };
      }
    );

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 6️⃣ Loading Prompts Dinâmicos do Banco

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { loadExtractionPrompt } from '../_shared/prompts.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';

interface RequestBody {
  documento_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    const { documento_id }: RequestBody = await req.json();

    if (!documento_id) {
      throw new Error('documento_id is required');
    }

    // Get document
    const { data: documento } = await serviceClient
      .from('documentos')
      .select('*')
      .eq('id', documento_id)
      .single();

    if (!documento) throw new Error('Document not found');

    // ⭐ KEY: Load prompt from database (versionado)
    const { prompt, versao } = await loadExtractionPrompt(
      documento.tipo_documento,  // E.g., 'RG', 'CNH', 'MATRICULA_IMOVEL'
      documento.tamanho_bytes    // Optional: para versões compactas
    );

    // Start logging
    execution = await startExecution(serviceClient, 'extract', {
      documentoId: documento_id,
      promptUsed: prompt,
      promptVersion: versao
    });

    // Download file
    const { data: fileData } = await serviceClient.storage
      .from('documentos')
      .download(documento.storage_path);

    if (!fileData) throw new Error('Failed to download file');

    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    // Call Gemini with loaded prompt
    const { text, usage } = await callGemini(
      prompt,
      base64,
      documento.mime_type,
      { maxTokens: 16384 }
    );

    const result = parseGeminiJson<Record<string, unknown>>(text);

    // Update document
    await serviceClient
      .from('documentos')
      .update({ dados_extraidos: result, status: 'extraido' })
      .eq('id', documento_id);

    // Log success
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);

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

## 7️⃣ Múltiplos Arquivos com Validação

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { normalizeFilesForGemini, isMimeTypeSupported, getSupportedFormatsDescription } from '../_shared/file-normalizer.ts';
import { withExecutionLogging } from '../_shared/execution-logger.ts';

interface RequestBody {
  minuta_id: string;
  documento_ids: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();

  try {
    const { minuta_id, documento_ids }: RequestBody = await req.json();

    if (!minuta_id || !documento_ids || documento_ids.length === 0) {
      throw new Error('minuta_id and documento_ids are required');
    }

    // Download all documents
    const documentsData = await Promise.all(
      documento_ids.map(async (doc_id) => {
        const { data: doc } = await serviceClient
          .from('documentos')
          .select('*')
          .eq('id', doc_id)
          .single();

        if (!doc) throw new Error(`Document not found: ${doc_id}`);

        // ⭐ Validate MIME type before downloading
        if (!isMimeTypeSupported(doc.mime_type)) {
          throw new Error(
            `Tipo de arquivo não suportado: ${doc.mime_type}. ` +
            `Formatos aceitos: ${getSupportedFormatsDescription()}`
          );
        }

        const { data: fileData } = await serviceClient.storage
          .from('documentos')
          .download(doc.storage_path);

        if (!fileData) throw new Error(`Failed to download: ${doc_id}`);

        return {
          id: doc_id,
          buffer: await fileData.arrayBuffer(),
          name: doc.nome_original,
          mimeType: doc.mime_type
        };
      })
    );

    // ⭐ Normalize all files at once
    const normalized = await normalizeFilesForGemini(
      documentsData.map((d) => ({
        buffer: d.buffer,
        name: d.name,
        mimeType: d.mimeType
      }))
    );

    // Convert to base64
    const files = normalized.files.map((f) => ({
      content: arrayBufferToBase64(f.content),
      mimeType: f.mimeType,
      name: f.originalName
    }));

    // Call Gemini with wrapper
    const result = await withExecutionLogging(
      serviceClient,
      'extract',
      { minutaId: minuta_id },
      async () => {
        const prompt = `You are a document analyzer. Process all documents and extract key information.`;

        // Build multi-document request
        let geminiPrompt = prompt + '\n\nDocuments to process:\n';
        for (const file of files) {
          geminiPrompt += `\n- ${file.name} (${file.mimeType})`;
        }

        const { text, usage } = await callGemini(
          geminiPrompt,
          files.length > 0 ? files[0].content : undefined,
          files.length > 0 ? files[0].mimeType : undefined
        );

        return {
          result: parseGeminiJson<Record<string, unknown>>(text),
          usage: {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens
          }
        };
      }
    );

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 8️⃣ Error Handling - Tratamento Robusto

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson } from '../_shared/gemini-client.ts';
import { startExecution, logError } from '../_shared/execution-logger.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    const body = await req.json();

    if (!body.id) {
      throw new Error('id is required');
    }

    execution = await startExecution(serviceClient, 'classify', {
      documentoId: body.id
    });

    // ⭐ Multiple error scenarios
    const { data: documento } = await serviceClient
      .from('documentos')
      .select('*')
      .eq('id', body.id)
      .single();

    if (!documento) {
      throw new Error(`Document not found with id: ${body.id}`);
    }

    if (documento.status === 'deletado') {
      throw new Error('Cannot process deleted document');
    }

    // Try to get file, with specific error message
    const { data: fileData, error: downloadError } = await serviceClient.storage
      .from('documentos')
      .download(documento.storage_path);

    if (downloadError || !fileData) {
      console.error('Download error details:', {
        error: downloadError,
        path: documento.storage_path,
        bucket: 'documentos'
      });
      throw new Error(
        `Failed to download file: ${downloadError?.message || 'Unknown error'}`
      );
    }

    // Gemini call with error handling
    try {
      const { text, usage } = await callGemini('Classify document');
      const result = parseGeminiJson<Record<string, unknown>>(text);
      // success...
    } catch (geminiError) {
      if (geminiError instanceof Error) {
        if (geminiError.message.includes('API error')) {
          console.error('Gemini API error:', geminiError.message);
          throw new Error(`API call failed: ${geminiError.message}`);
        } else if (geminiError.message.includes('parse')) {
          console.error('JSON parse error:', geminiError.message);
          throw new Error(`Response parsing failed: ${geminiError.message}`);
        }
      }
      throw geminiError;
    }

  } catch (error) {
    console.error('Caught error:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      type: error instanceof Error ? 'Error' : typeof error
    });

    if (execution.id) {
      await logError(serviceClient, execution, error as Error);
    }

    // Determine HTTP status
    const statusCode = (error as Error).message.includes('not found') ? 404 : 500;

    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 9️⃣ Testing Patterns

```typescript
// Test file structure: supabase/functions/sua-funcao/index.test.ts

// Basic test pattern (for local testing)
// Note: Deno test environment doesn't have real Supabase in CI/CD
// Tests should focus on logic, not API calls

Deno.test("should validate input", async () => {
  const response = await fetch(
    new Request(
      "http://localhost:3000/functions/v1/sua-funcao",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("ANON_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "" }),
      }
    )
  );

  const body = await response.json();
  assertEquals(body.success, false);
  assertEquals(response.status, 400);
});

// Or for unit tests of helper functions
import { parseGeminiJson } from "../_shared/gemini-client.ts";

Deno.test("parseGeminiJson should handle markdown", () => {
  const input = `\`\`\`json
{
  "test": "value"
}
\`\`\``;

  const result = parseGeminiJson(input);
  assertEquals(result.test, "value");
});
```

---

## 🔟 Checklist para Nova Edge Function

Antes de fazer deploy:

- [ ] CORS handling: `if (req.method === 'OPTIONS')`
- [ ] Execution logging: `startExecution()` + `logSuccess()`/`logError()`
- [ ] Error handling: try/catch com logging
- [ ] Imports corretos: De _shared, de Deno STD
- [ ] Validação de inputs: Verificar campos required
- [ ] Validação de data: Arquivo existe? Status correto?
- [ ] Response format: `{ success: boolean, data?: any, error?: string }`
- [ ] Headers: `...corsHeaders, 'Content-Type': 'application/json'`
- [ ] Types definidos: RequestBody, ResponseType, etc
- [ ] Documentação: Comments explicando fluxo principal
- [ ] Testado: Com arquivo real (PDF, DOCX, etc)
- [ ] Service vs Anon client: Decidir qual usar e documentar por quê

---

## 📊 Comparação de Padrões

| Padrão | Melhor para | Vantagens | Desvantagens |
|--------|-----------|-----------|-------------|
| **Manual logging** | Controle fino | Mais flexível | Mais código |
| **withExecutionLogging** | Maioria dos casos | Menos código, menos erro | Menos controle |
| **Service client** | Bypass de RLS | Acesso direto | ⚠️ Cuidado com segurança |
| **Anon client** | Respeitar permissões | Seguro | Respeita RLS |
| **File normalization** | DOCX e outros | Suporta mais formatos | Performance |
| **Dynamic prompts** | Rápida iteração | Sem deploy | Latência de DB |

---

## 💡 Dicas Finais

1. **Sempre usar `arrayBufferToBase64()` para converter arquivo**
   ```typescript
   const buffer = await fileData.arrayBuffer();
   const base64 = arrayBufferToBase64(buffer);  // ✅ Correto
   ```

2. **Sempre normalizar antes de Gemini se arquivo pode ser DOCX**
   ```typescript
   const normalized = await normalizeFilesForGemini([...]);
   const { content, mimeType } = normalized.files[0];
   ```

3. **Sempre logar com try/catch**
   ```typescript
   if (execution.id) {
     await logError(serviceClient, execution, error);
   }
   ```

4. **Sempre responder OPTIONS com CORS**
   ```typescript
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
   ```

5. **Sempre usar types para RequestBody**
   ```typescript
   interface RequestBody { ... }
   const body: RequestBody = await req.json();
   ```

Este documento fornece todos os padrões necessários para criar edge functions consistentes com a arquitetura do projeto!
