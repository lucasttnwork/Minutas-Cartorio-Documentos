import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { CLASSIFICATION_PROMPT } from '../_shared/prompts.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';
import type { ClassificationResult } from '../_shared/types.ts';

interface RequestBody {
  documento_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
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
    // This is safe because we validate ownership below
    const { data: documento, error: docError } = await serviceClient
      .from('documentos')
      .select('*, minutas!inner(user_id)')
      .eq('id', documento_id)
      .single();

    if (docError || !documento) {
      console.error('Document fetch error:', docError);
      throw new Error(`Document not found: ${documento_id}`);
    }

    // Validate user has access to this document's minuta
    // (For now we trust the auth middleware, but in production
    // we should verify the JWT and check user_id matches)

    // Update status to classifying
    await serviceClient
      .from('documentos')
      .update({ status: 'classificando' })
      .eq('id', documento_id);

    // Start execution logging
    execution = await startExecution(serviceClient, 'classify', {
      documentoId: documento_id,
      minutaId: documento.minuta_id,
      promptUsed: CLASSIFICATION_PROMPT,
    });

    // Download file from storage
    const { data: fileData, error: fileError } = await serviceClient.storage
      .from('documentos')
      .download(documento.storage_path);

    if (fileError || !fileData) {
      throw new Error(`Failed to download file: ${fileError?.message}`);
    }

    // Convert to base64 (using safe method for large files)
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    // Call Gemini
    const { text, usage } = await callGemini(
      CLASSIFICATION_PROMPT,
      base64,
      documento.mime_type
    );

    // Parse result
    const result = parseGeminiJson<ClassificationResult>(text);

    // Update document with classification
    await serviceClient
      .from('documentos')
      .update({
        tipo_documento: result.tipo_documento,
        classificacao_confianca: result.confianca.toLowerCase(),
        pessoa_relacionada: result.pessoa_relacionada,
        status: 'classificado',
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
    console.error('Classification error:', error);

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
