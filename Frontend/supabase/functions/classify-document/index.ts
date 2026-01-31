import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson } from '../_shared/gemini-client.ts';
import { CLASSIFICATION_PROMPT } from '../_shared/prompts.ts';
import type { ClassificationResult } from '../_shared/types.ts';

interface RequestBody {
  documento_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);
    const serviceClient = createServiceClient();
    const { documento_id }: RequestBody = await req.json();

    // Get document info
    const { data: documento, error: docError } = await supabase
      .from('documentos')
      .select('*, minutas!inner(user_id)')
      .eq('id', documento_id)
      .single();

    if (docError || !documento) {
      throw new Error(`Document not found: ${documento_id}`);
    }

    // Update status to classifying
    await serviceClient
      .from('documentos')
      .update({ status: 'classificando' })
      .eq('id', documento_id);

    // Log execution start
    const { data: execution } = await serviceClient
      .from('agent_executions')
      .insert({
        documento_id,
        minuta_id: documento.minuta_id,
        agent_type: 'classify',
        status: 'running',
        started_at: new Date().toISOString(),
        prompt_used: CLASSIFICATION_PROMPT,
      })
      .select()
      .single();

    // Download file from storage
    const { data: fileData, error: fileError } = await serviceClient.storage
      .from('documentos')
      .download(documento.storage_path);

    if (fileError || !fileData) {
      throw new Error(`Failed to download file: ${fileError?.message}`);
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

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

    // Update execution log
    await serviceClient
      .from('agent_executions')
      .update({
        status: 'success',
        result,
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
        completed_at: new Date().toISOString(),
        duration_ms: execution ? Date.now() - new Date(execution.started_at).getTime() : 0,
      })
      .eq('id', execution?.id);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Classification error:', error);

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
