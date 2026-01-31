import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson } from '../_shared/gemini-client.ts';
import { loadExtractionPrompt } from '../_shared/prompts.ts';
import type { ExtractionResult } from '../_shared/types.ts';

interface RequestBody {
  documento_id: string;
}

serve(async (req) => {
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
      .select('*')
      .eq('id', documento_id)
      .single();

    if (docError || !documento) {
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

    // Log execution
    const { data: execution } = await serviceClient
      .from('agent_executions')
      .insert({
        documento_id,
        minuta_id: documento.minuta_id,
        agent_type: 'extract',
        status: 'running',
        started_at: new Date().toISOString(),
        prompt_used: prompt,
      })
      .select()
      .single();

    // Download file
    const { data: fileData } = await serviceClient.storage
      .from('documentos')
      .download(documento.storage_path);

    if (!fileData) {
      throw new Error('Failed to download file');
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Call Gemini with extraction prompt
    const { text, usage } = await callGemini(
      prompt,
      base64,
      documento.mime_type,
      { maxTokens: 16384 }
    );

    // Parse result
    const result = parseGeminiJson<ExtractionResult>(text);

    // Update document with extracted data
    await serviceClient
      .from('documentos')
      .update({
        dados_extraidos: result.dados_estruturados,
        status: 'extraido',
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
    console.error('Extraction error:', error);

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
