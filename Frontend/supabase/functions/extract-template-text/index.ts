/**
 * Edge Function: extract-template-text
 *
 * Extrai texto de arquivos PDF/DOCX de templates de minutas padrão.
 * - DOCX: Usa Mammoth.js para converter para HTML, depois strip tags
 * - PDF: Usa Gemini Flash para OCR inteligente
 *
 * O texto extraído é armazenado no banco para uso por agentes de IA.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { normalizeFilesForGemini } from '../_shared/file-normalizer.ts';

interface RequestBody {
  template_id: string;
}

interface MinutaPadrao {
  id: string;
  storage_path: string | null;
  nome_original: string | null;
  mime_type: string | null;
  status_extracao: string;
}

// Prompt otimizado para extração de texto de documentos jurídicos
const EXTRACTION_PROMPT = `Você é um especialista em extração de texto de documentos jurídicos.

TAREFA: Extraia TODO o texto visível deste documento, preservando:
1. Estrutura de parágrafos
2. Títulos e subtítulos (marque com # para níveis)
3. Listas numeradas ou com marcadores
4. Campos de preenchimento como [NOME], {{VALOR}}, ___________
5. Formatação de negrito (**texto**) e itálico (*texto*)

NÃO interprete ou resuma. Extraia o texto EXATAMENTE como aparece.
Se houver tabelas, converta para formato Markdown.

Retorne apenas o texto extraído em formato Markdown, sem comentários ou explicações.`;

/**
 * Remove tags HTML e mantém apenas o texto
 */
function stripHtmlTags(html: string): string {
  // Converte algumas tags para Markdown antes de remover
  let text = html
    .replace(/<h1[^>]*>/gi, '\n# ')
    .replace(/<\/h1>/gi, '\n')
    .replace(/<h2[^>]*>/gi, '\n## ')
    .replace(/<\/h2>/gi, '\n')
    .replace(/<h3[^>]*>/gi, '\n### ')
    .replace(/<\/h3>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<b[^>]*>/gi, '**')
    .replace(/<\/b>/gi, '**')
    .replace(/<em[^>]*>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<i[^>]*>/gi, '*')
    .replace(/<\/i>/gi, '*');

  // Remove todas as outras tags
  text = text.replace(/<[^>]+>/g, '');

  // Limpa espaços extras e normaliza quebras de linha
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();

  try {
    const { template_id }: RequestBody = await req.json();

    if (!template_id) {
      throw new Error('template_id is required');
    }

    console.log(`[extract-template-text] Starting extraction for template: ${template_id}`);

    // 1. Buscar template do banco
    const { data: template, error: fetchError } = await serviceClient
      .from('minutas_padrao')
      .select('id, storage_path, nome_original, mime_type, status_extracao')
      .eq('id', template_id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !template) {
      console.error('Template fetch error:', fetchError);
      throw new Error(`Template não encontrado: ${template_id}`);
    }

    const typedTemplate = template as MinutaPadrao;

    // Verificar se tem arquivo para extrair
    if (!typedTemplate.storage_path) {
      throw new Error('Template não possui arquivo para extração');
    }

    // 2. Atualizar status para 'extraindo'
    await serviceClient
      .from('minutas_padrao')
      .update({ status_extracao: 'extraindo' })
      .eq('id', template_id);

    console.log(`[extract-template-text] Status updated to 'extraindo'`);

    // 3. Baixar arquivo do Storage
    const { data: fileData, error: downloadError } = await serviceClient.storage
      .from('minutas-padrao')
      .download(typedTemplate.storage_path);

    if (downloadError || !fileData) {
      throw new Error(`Falha ao baixar arquivo: ${downloadError?.message || 'Arquivo não encontrado'}`);
    }

    console.log(`[extract-template-text] File downloaded: ${typedTemplate.nome_original}, ${fileData.size} bytes`);

    const arrayBuffer = await fileData.arrayBuffer();
    let extractedText: string;

    // 4. Extrair texto baseado no tipo de arquivo
    const mimeType = typedTemplate.mime_type || 'application/pdf';

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // DOCX: Usar Mammoth.js via file-normalizer
      console.log('[extract-template-text] Processing DOCX with Mammoth.js');

      const { files, warnings } = await normalizeFilesForGemini([{
        buffer: arrayBuffer,
        name: typedTemplate.nome_original || 'document.docx',
        mimeType: mimeType,
      }]);

      if (warnings.length > 0) {
        console.log('[extract-template-text] Conversion warnings:', warnings);
      }

      // O file-normalizer converte DOCX para HTML
      const htmlContent = new TextDecoder().decode(new Uint8Array(files[0].content));
      extractedText = stripHtmlTags(htmlContent);

      console.log(`[extract-template-text] DOCX extracted: ${extractedText.length} characters`);

    } else if (mimeType === 'application/pdf') {
      // PDF: Usar Gemini para OCR inteligente
      console.log('[extract-template-text] Processing PDF with Gemini');

      const base64 = arrayBufferToBase64(arrayBuffer);

      const { text, usage } = await callGemini(
        EXTRACTION_PROMPT,
        base64,
        mimeType,
        { maxTokens: 32768, temperature: 0.1 }
      );

      extractedText = text;

      console.log(`[extract-template-text] PDF extracted: ${extractedText.length} characters, tokens: ${usage.inputTokens}/${usage.outputTokens}`);

    } else {
      throw new Error(`Tipo de arquivo não suportado para extração: ${mimeType}`);
    }

    // 5. Atualizar template com texto extraído
    const { error: updateError } = await serviceClient
      .from('minutas_padrao')
      .update({
        texto_extraido: extractedText,
        status_extracao: 'extraido',
        erro_extracao: null,
        extraido_em: new Date().toISOString(),
      })
      .eq('id', template_id);

    if (updateError) {
      throw new Error(`Erro ao salvar texto extraído: ${updateError.message}`);
    }

    console.log(`[extract-template-text] Extraction completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        template_id,
        characters_extracted: extractedText.length,
        preview: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[extract-template-text] Error:', error);

    // Tentar atualizar status para erro
    try {
      const { template_id } = await req.clone().json();
      if (template_id) {
        await serviceClient
          .from('minutas_padrao')
          .update({
            status_extracao: 'erro',
            erro_extracao: (error as Error).message,
          })
          .eq('id', template_id);
      }
    } catch (e) {
      console.error('[extract-template-text] Failed to update error status:', e);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
