/**
 * Edge Function: agentes-especialistas
 *
 * Endpoints:
 * - POST /run - Inicia uma nova run (upload docs, cria run, chama Gemini, salva resultado)
 * - GET /history - Lista histórico de runs do usuário
 * - GET /run/:id - Detalhes de uma run específica
 * - GET /agents - Lista todos os agentes disponíveis
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import {
  normalizeFilesForGemini,
  isMimeTypeSupported,
  getSupportedFormatsDescription,
} from '../_shared/file-normalizer.ts';
import type {
  RunResponse,
  HistoryResponse,
  RunDetailResponse,
  ActivePrompt,
  DocumentMetadata,
  AgentListItem,
} from './types.ts';

// Gemini configuration
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_MODEL = 'gemini-3-flash-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Storage bucket
const STORAGE_BUCKET = 'agentes-especialistas-docs';

// Max file size: 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Allowed MIME types (includes types that will be converted)
const ALLOWED_MIME_TYPES = [
  // PDFs
  'application/pdf',
  // Images - all formats supported by Gemini
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/bmp',
  // Office documents (will be converted to HTML)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Text formats
  'text/plain',
  'text/markdown',
  'text/csv',
];

/**
 * Create Supabase client with user's auth token
 */
function createSupabaseClient(req: Request) {
  const authHeader = req.headers.get('Authorization');

  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader ?? '' },
      },
    }
  );
}

/**
 * Create service client for admin operations
 */
function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

/**
 * Get authenticated user from request
 */
async function getUser(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Build full prompt with user instructions
 */
function buildFullPrompt(basePrompt: string, userInstructions?: string): string {
  if (!userInstructions || userInstructions.trim() === '') {
    return basePrompt;
  }

  return `${basePrompt}

---

## INSTRUCOES ADICIONAIS DO USUARIO

${userInstructions.trim()}

---

IMPORTANTE: Aplique as instrucoes adicionais do usuario ao analisar este documento, mas mantenha o formato de saida especificado acima.`;
}

/**
 * Call Gemini API with documents
 */
async function callGeminiWithDocuments(
  prompt: string,
  documents: Array<{ base64: string; mimeType: string }>
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Build parts array with documents first, then prompt
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  // Add all documents
  for (const doc of documents) {
    parts.push({
      inlineData: {
        mimeType: doc.mimeType,
        data: doc.base64,
      },
    });
  }

  // Add prompt
  parts.push({ text: prompt });

  const request = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 16384,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('No response from Gemini');
  }

  return {
    text: data.candidates[0].content.parts[0].text,
    inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
  };
}

/**
 * Estimate cost based on token usage
 * Gemini 2.0 Flash: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
 */
function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 0.075;
  const outputCost = (outputTokens / 1_000_000) * 0.30;
  return inputCost + outputCost;
}

/**
 * Handle POST /run - Create and execute a new run
 */
async function handleRun(req: Request): Promise<Response> {
  console.log('[handleRun] Starting run request');
  const supabase = createSupabaseClient(req);
  const serviceClient = createServiceClient();

  try {
    console.log('[handleRun] Getting user...');
    const user = await getUser(supabase);
    console.log('[handleRun] User authenticated:', user.id);

    // Parse FormData
    const formData = await req.formData();
    const agentSlug = formData.get('agent_slug') as string;
    const instrucoesCustomizadas = formData.get('instrucoes_customizadas') as string | null;

    if (!agentSlug) {
      return new Response(JSON.stringify({ error: 'agent_slug is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get active prompt for agent
    console.log('[handleRun] Getting prompt for agent:', agentSlug);
    const { data: promptData, error: promptError } = await supabase
      .rpc('get_active_specialist_prompt', { p_agent_slug: agentSlug })
      .single();

    if (promptError || !promptData) {
      console.error('[handleRun] Prompt error:', promptError);
      return new Response(
        JSON.stringify({ error: `Prompt nao encontrado para agente: ${agentSlug}. Verifique se o agente existe no banco de dados.` }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    console.log('[handleRun] Prompt found:', promptData.nome_exibicao);

    const activePrompt = promptData as ActivePrompt;

    // Generate run ID
    const runId = crypto.randomUUID();

    // Process uploaded files
    const files = formData.getAll('documentos') as File[];
    if (files.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one document is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const documentsMetadata: DocumentMetadata[] = [];
    const rawFiles: Array<{ buffer: ArrayBuffer; name: string; mimeType: string }> = [];

    // First pass: validate and collect files
    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ error: `Arquivo ${file.name} excede o tamanho máximo de 20MB` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Validate MIME type
      if (!isMimeTypeSupported(file.type)) {
        return new Response(
          JSON.stringify({
            error: `Tipo de arquivo ${file.type} não suportado. Formatos aceitos: ${getSupportedFormatsDescription()}`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Read file content
      const arrayBuffer = await file.arrayBuffer();

      // Storage path: {user_id}/{run_id}/{filename}
      const storagePath = `${user.id}/${runId}/${file.name}`;

      // Upload original file to storage (keep original format for reference)
      const { error: uploadError } = await serviceClient.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return new Response(
          JSON.stringify({ error: `Falha ao fazer upload de ${file.name}: ${uploadError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      documentsMetadata.push({
        nome: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        tamanho_bytes: file.size,
      });

      rawFiles.push({
        buffer: arrayBuffer,
        name: file.name,
        mimeType: file.type,
      });
    }

    // Normalize files for Gemini (converts DOCX to HTML, etc.)
    let normalizationResult;
    try {
      normalizationResult = await normalizeFilesForGemini(rawFiles);
    } catch (normalizeError) {
      console.error('Normalization error:', normalizeError);
      return new Response(
        JSON.stringify({
          error: normalizeError instanceof Error
            ? normalizeError.message
            : 'Erro ao processar arquivos',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log conversion warnings (helpful for debugging)
    if (normalizationResult.warnings.length > 0) {
      console.log('File normalization warnings:', normalizationResult.warnings);
    }

    // Prepare documents for Gemini
    const documentsForGemini: Array<{ base64: string; mimeType: string }> = [];
    for (const normalizedFile of normalizationResult.files) {
      documentsForGemini.push({
        base64: arrayBufferToBase64(normalizedFile.content),
        mimeType: normalizedFile.mimeType,
      });
    }

    // Create run record with 'processing' status
    const { error: insertError } = await serviceClient
      .from('agentes_especialistas_runs')
      .insert({
        id: runId,
        user_id: user.id,
        agent_slug: agentSlug,
        agent_nome: activePrompt.nome_exibicao,
        documentos: documentsMetadata,
        instrucoes_customizadas: instrucoesCustomizadas,
        prompt_versao: activePrompt.versao,
        prompt_usado: activePrompt.system_prompt,
        status: 'processing',
        started_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create run record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build full prompt
    const fullPrompt = buildFullPrompt(activePrompt.system_prompt, instrucoesCustomizadas ?? undefined);

    // Call Gemini
    let geminiResult: { text: string; inputTokens: number; outputTokens: number };
    const startTime = Date.now();

    try {
      geminiResult = await callGeminiWithDocuments(fullPrompt, documentsForGemini);
    } catch (geminiError) {
      // Update run with error status
      await serviceClient
        .from('agentes_especialistas_runs')
        .update({
          status: 'error',
          erro_mensagem: geminiError instanceof Error ? geminiError.message : 'Unknown Gemini error',
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        })
        .eq('id', runId);

      return new Response(
        JSON.stringify({
          run_id: runId,
          status: 'error',
          error: geminiError instanceof Error ? geminiError.message : 'Gemini processing failed',
        } as RunResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const durationMs = Date.now() - startTime;
    const costEstimate = estimateCost(geminiResult.inputTokens, geminiResult.outputTokens);

    // Update run with success
    await serviceClient
      .from('agentes_especialistas_runs')
      .update({
        status: 'completed',
        output_texto: geminiResult.text,
        input_tokens: geminiResult.inputTokens,
        output_tokens: geminiResult.outputTokens,
        cost_estimate: costEstimate,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      })
      .eq('id', runId);

    // Return success response
    const response: RunResponse = {
      run_id: runId,
      status: 'completed',
      output_texto: geminiResult.text,
      input_tokens: geminiResult.inputTokens,
      output_tokens: geminiResult.outputTokens,
      duration_ms: durationMs,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[handleRun] Unhandled error:', error);
    console.error('[handleRun] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Nao autorizado. Por favor, faca login novamente.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Retorna mensagem mais detalhada para facilitar debug
    const errorMessage = error instanceof Error
      ? `Erro interno: ${error.message}`
      : 'Erro interno do servidor. Tente novamente.';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle GET /history - List user's run history
 */
async function handleHistory(req: Request): Promise<Response> {
  const supabase = createSupabaseClient(req);

  try {
    const user = await getUser(supabase);

    // Parse query params
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);
    const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);
    const agentSlug = url.searchParams.get('agent_slug');

    // Get history using helper function
    const { data, error } = await supabase.rpc('get_specialist_runs_history', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
      p_agent_slug: agentSlug,
    });

    if (error) {
      console.error('History error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch history' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get total count
    let query = supabase
      .from('agentes_especialistas_runs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (agentSlug) {
      query = query.eq('agent_slug', agentSlug);
    }

    const { count } = await query;

    const response: HistoryResponse = {
      runs: data ?? [],
      total: count ?? 0,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle GET /run/:id - Get run details
 */
async function handleRunDetail(req: Request, runId: string): Promise<Response> {
  const supabase = createSupabaseClient(req);

  try {
    const user = await getUser(supabase);

    // Get run detail (RLS ensures user can only see their own)
    const { data, error } = await supabase
      .from('agentes_especialistas_runs')
      .select('*')
      .eq('id', runId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Run not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data as RunDetailResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle GET /agents - List available agents
 */
async function handleAgentsList(req: Request): Promise<Response> {
  const supabase = createSupabaseClient(req);

  try {
    await getUser(supabase); // Verify authentication

    const { data, error } = await supabase.rpc('list_specialist_agents');

    if (error) {
      console.error('Agents list error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch agents' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ agents: data as AgentListItem[] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handle GET /run/:id/document/:filename - Download document from run
 */
async function handleDocumentDownload(
  req: Request,
  runId: string,
  filename: string
): Promise<Response> {
  const supabase = createSupabaseClient(req);

  try {
    const user = await getUser(supabase);

    // Verify run belongs to user
    const { data: runData, error: runError } = await supabase
      .from('agentes_especialistas_runs')
      .select('documentos')
      .eq('id', runId)
      .eq('user_id', user.id)
      .single();

    if (runError || !runData) {
      return new Response(JSON.stringify({ error: 'Run not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find document in run
    const docs = runData.documentos as DocumentMetadata[];
    const doc = docs.find((d) => d.nome === filename);

    if (!doc) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate signed URL for download
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(doc.storage_path, 3600); // 1 hour validity

    if (signedUrlError || !signedUrlData) {
      return new Response(JSON.stringify({ error: 'Failed to generate download URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        download_url: signedUrlData.signedUrl,
        filename: doc.nome,
        mime_type: doc.mime_type,
        size_bytes: doc.tamanho_bytes,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Main handler
 */
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  let pathParts = url.pathname.split('/').filter(Boolean);

  // Remove common path prefixes from Supabase Edge Functions
  // Path can be: /agentes-especialistas/run or /functions/v1/agentes-especialistas/run
  if (pathParts[0] === 'functions' && pathParts[1] === 'v1') {
    pathParts = pathParts.slice(2);
  }
  if (pathParts[0] === 'agentes-especialistas') {
    pathParts.shift();
  }

  try {
    // Route: POST /run
    if (req.method === 'POST' && pathParts[0] === 'run' && pathParts.length === 1) {
      return await handleRun(req);
    }

    // Route: GET /history
    if (req.method === 'GET' && pathParts[0] === 'history') {
      return await handleHistory(req);
    }

    // Route: GET /agents
    if (req.method === 'GET' && pathParts[0] === 'agents') {
      return await handleAgentsList(req);
    }

    // Route: GET /run/:id
    if (req.method === 'GET' && pathParts[0] === 'run' && pathParts.length === 2) {
      return await handleRunDetail(req, pathParts[1]);
    }

    // Route: GET /run/:id/document/:filename
    if (
      req.method === 'GET' &&
      pathParts[0] === 'run' &&
      pathParts.length === 4 &&
      pathParts[2] === 'document'
    ) {
      return await handleDocumentDownload(req, pathParts[1], decodeURIComponent(pathParts[3]));
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
