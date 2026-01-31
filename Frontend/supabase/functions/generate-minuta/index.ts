import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini } from '../_shared/gemini-client.ts';

interface RequestBody {
  minuta_id: string;
  template?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);
    const serviceClient = createServiceClient();
    const { minuta_id, template: _template }: RequestBody = await req.json();

    // Verify access
    const { data: minuta, error: minutaError } = await supabase
      .from('minutas')
      .select('*')
      .eq('id', minuta_id)
      .single();

    if (minutaError || !minuta) {
      throw new Error('Minuta not found or access denied');
    }

    // Get all related data
    const [
      { data: pessoas_naturais },
      { data: pessoas_juridicas },
      { data: imoveis },
      { data: negocios },
    ] = await Promise.all([
      serviceClient.from('pessoas_naturais').select('*').eq('minuta_id', minuta_id),
      serviceClient.from('pessoas_juridicas').select('*').eq('minuta_id', minuta_id),
      serviceClient.from('imoveis').select('*').eq('minuta_id', minuta_id),
      serviceClient.from('negocios_juridicos').select('*').eq('minuta_id', minuta_id),
    ]);

    // Log execution
    const { data: execution } = await serviceClient
      .from('agent_executions')
      .insert({
        minuta_id,
        agent_type: 'generate',
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Build context for generation
    const context = {
      outorgantes: pessoas_naturais?.filter((p: { papel: string }) => p.papel === 'outorgante') || [],
      outorgados: pessoas_naturais?.filter((p: { papel: string }) => p.papel === 'outorgado') || [],
      pessoas_juridicas: pessoas_juridicas || [],
      imovel: imoveis?.[0],
      negocio: negocios?.[0],
    };

    // Generate minuta text (simplified - would use proper template)
    const prompt = `Voce e um especialista em minutas de escritura publica brasileira.

Com base nos dados abaixo, gere o texto de uma minuta de ${negocios?.[0]?.tipo || 'compra e venda'}:

${JSON.stringify(context, null, 2)}

Gere um texto completo de minuta de escritura publica, formatado de acordo com os padroes cartoriais brasileiros.

A minuta deve conter:
1. Cabecalho com data, local e cartorio
2. Qualificacao completa das partes (vendedor/comprador ou outorgante/outorgado)
3. Descricao detalhada do imovel
4. Valores e forma de pagamento
5. Clausulas padrao de escritura publica
6. Declaracoes das partes
7. Fecho com assinaturas

Use linguagem juridica formal e siga os padroes de escrituras publicas do Estado de Sao Paulo.`;

    const { text, usage } = await callGemini(prompt, undefined, undefined, {
      temperature: 0.3,
      maxTokens: 8192,
    });

    // Update minuta with generated text
    await serviceClient
      .from('minutas')
      .update({
        minuta_texto: text,
        status: 'revisao',
      })
      .eq('id', minuta_id);

    // Update execution
    await serviceClient
      .from('agent_executions')
      .update({
        status: 'success',
        result: { texto_gerado: text.substring(0, 500) + '...' },
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
        completed_at: new Date().toISOString(),
        duration_ms: execution ? Date.now() - new Date(execution.started_at).getTime() : 0,
      })
      .eq('id', execution?.id);

    return new Response(
      JSON.stringify({ success: true, minuta_texto: text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generation error:', error);

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
