import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { loadExtractionPrompt } from '../_shared/prompts.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';
import type { ExtractionResult } from '../_shared/types.ts';

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

    // Get document info using service client (bypasses RLS)
    const { data: documento, error: docError } = await serviceClient
      .from('documentos')
      .select('*')
      .eq('id', documento_id)
      .single();

    if (docError || !documento) {
      console.error('Document fetch error:', docError);
      throw new Error(`Document not found: ${documento_id}`);
    }

    if (!documento.tipo_documento) {
      throw new Error('Document must be classified before extraction');
    }

    // Update status
    await serviceClient
      .from('documentos')
      .update({ status: 'extraindo' })
      .eq('id', documento_id);

    // Load appropriate prompt
    const prompt = await loadExtractionPrompt(
      documento.tipo_documento,
      documento.tamanho_bytes
    );

    // Start execution logging
    execution = await startExecution(serviceClient, 'extract', {
      documentoId: documento_id,
      minutaId: documento.minuta_id,
      promptUsed: prompt,
    });

    // Download file
    const { data: fileData } = await serviceClient.storage
      .from('documentos')
      .download(documento.storage_path);

    if (!fileData) {
      throw new Error('Failed to download file');
    }

    // Convert to base64 (using safe method for large files)
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    // Call Gemini with extraction prompt
    const { text, usage } = await callGemini(
      prompt,
      base64,
      documento.mime_type,
      { maxTokens: 16384 }
    );

    // Parse result - Gemini returns the extracted data directly (e.g., {"rg": {...}})
    // The structure varies by document type, so we store the entire result
    const result = parseGeminiJson<Record<string, unknown>>(text);

    // Update document with extracted data
    // Store the entire parsed result as dados_extraidos
    await serviceClient
      .from('documentos')
      .update({
        dados_extraidos: result,
        status: 'extraido',
      })
      .eq('id', documento_id);

    // Log successful execution with token usage and cost
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Extraction error:', error);

    // Log error in execution tracking
    if (execution.id) {
      await logError(serviceClient, execution, error as Error);
    }

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
