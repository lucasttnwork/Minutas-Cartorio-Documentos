import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini } from '../_shared/gemini-client.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';
import { aggregateMinutaData, type MinutaCompleta } from './data-aggregator.ts';
import {
  buildOutorgantesSection,
  buildOutorgadosSection,
  buildImoveisSection,
  buildNegocioSection,
} from './qualification-builder.ts';
import { MINUTA_TEMPLATES } from '../_shared/templates.ts';

// ============ TYPE DEFINITIONS ============

interface RequestBody {
  minuta_id: string;
  template_type?: 'VENDA_COMPRA' | string;
}

interface GenerationResult {
  success: boolean;
  minuta_texto?: string;
  template_usado?: string;
  dados_utilizados?: Record<string, unknown>;
  error?: string;
}

// ============ TEMPLATE MAPPING ============

/**
 * Maps aggregated minuta data to template placeholders
 */
function mapDataToPlaceholders(data: MinutaCompleta): Record<string, string> {
  const placeholders: Record<string, string> = {};

  // Data de lavratura
  placeholders['DATA_LAVRATURA'] = data.minuta.data_lavratura || '';
  placeholders['DATA_LAVRATURA_EXTENSO'] = data.minuta.data_lavratura || '';

  // Outorgantes (formatted qualifications)
  const outorgantesTexts = data.outorgantes.map((p) => {
    if (p.tipo === 'natural') {
      return `**${p.nome}**, ${p.nacionalidade}, ${p.estado_civil}${p.regime_bens ? ` pelo regime da ${p.regime_bens}` : ''}, ${p.profissao}, RG n. ${p.rg}-${p.orgao_emissor_rg}/${p.estado_emissor_rg}, CPF n. ${p.cpf_formatado}, domiciliado(a) ${p.endereco_formatado ? `em ${p.endereco_formatado}` : 'nesta cidade'}`;
    } else {
      return `**${p.razao_social}**, CNPJ n. ${p.cnpj_formatado}${p.inscricao_estadual ? `, IE ${p.inscricao_estadual}` : ''}, com sede em ${p.endereco_formatado}`;
    }
  });
  placeholders['OUTORGANTES_VENDEDORES'] = outorgantesTexts.join(' e ') || '[OUTORGANTES NAO INFORMADOS]';

  // Outorgados (formatted qualifications)
  const outorgadosTexts = data.outorgados.map((p) => {
    if (p.tipo === 'natural') {
      return `**${p.nome}**, ${p.nacionalidade}, ${p.estado_civil}${p.regime_bens ? ` pelo regime da ${p.regime_bens}` : ''}, ${p.profissao}, RG n. ${p.rg}-${p.orgao_emissor_rg}/${p.estado_emissor_rg}, CPF n. ${p.cpf_formatado}, domiciliado(a) ${p.endereco_formatado ? `em ${p.endereco_formatado}` : 'nesta cidade'}`;
    } else {
      return `**${p.razao_social}**, CNPJ n. ${p.cnpj_formatado}${p.inscricao_estadual ? `, IE ${p.inscricao_estadual}` : ''}, com sede em ${p.endereco_formatado}`;
    }
  });
  placeholders['OUTORGADA_COMPRADORA'] = outorgadosTexts.join(' e ') || '[OUTORGADOS NAO INFORMADOS]';

  // Imovel description
  const imovel = data.imoveis[0]; // Use first imovel
  if (imovel) {
    placeholders['IMOVEL_DESCRICAO'] = imovel.descricao || `${imovel.tipo_imovel || 'Imovel'}, situado em ${imovel.endereco_completo}`;
    placeholders['IMOVEL_MATRICULA'] = imovel.matricula_numero || '[NUMERO NAO INFORMADO]';
    placeholders['IMOVEL_CARTORIO'] = imovel.matricula_cartorio || '[CARTORIO NAO INFORMADO]';
    placeholders['TITULO_AQUISITIVO'] = 'R.___'; // To be filled manually
    placeholders['CADASTRO_MUNICIPAL'] = imovel.inscricao_municipal || '[NAO INFORMADO]';
    placeholders['VALOR_VENAL_REFERENCIA'] = imovel.valor_venal_formatado || '[NAO INFORMADO]';
  }

  // Negocio juridico
  if (data.negocio) {
    placeholders['VALOR_TOTAL'] = data.negocio.valor_formatado || '[VALOR NAO INFORMADO]';
    placeholders['VALOR_EXTENSO'] = data.negocio.valor_extenso || '[VALOR POR EXTENSO NAO INFORMADO]';
    placeholders['FORMA_PAGAMENTO'] = data.negocio.forma_pagamento || '[FORMA DE PAGAMENTO NAO INFORMADA]';
    placeholders['DATA_COMPROMISSO'] = data.negocio.data_contrato_formatada || '[DATA NAO INFORMADA]';

    // ITBI placeholders (to be filled if available)
    placeholders['ITBI_BASE_CALCULO'] = data.negocio.valor_formatado || '';
    placeholders['ITBI_BASE_CALCULO_EXTENSO'] = data.negocio.valor_extenso || '';
    placeholders['ITBI_VALOR'] = ''; // Calculated separately
    placeholders['ITBI_VALOR_EXTENSO'] = '';
  }

  // Certidoes and indisponibilidade (placeholders for manual fill)
  placeholders['CERTIDAO_IPTU_NUMERO'] = '';
  placeholders['CERTIDAO_IPTU_DATA'] = '';
  placeholders['CERTIDAO_IPTU_VALIDADE'] = '';
  placeholders['CERTIDAO_IPTU_CODIGO'] = '';
  placeholders['CERTIDOES_ARQUIVADAS'] = '';
  placeholders['INDISPONIBILIDADE_HASHES'] = '';
  placeholders['INDISPONIBILIDADE_RESULTADO'] = '';

  return placeholders;
}

// ============ PROMPT BUILDER ============

/**
 * Builds the generation prompt with template reference and structured data
 */
function buildGenerationPrompt(
  data: MinutaCompleta,
  template: string,
  templateType: string
): string {
  // Build structured data sections
  const outorgantesSection = buildOutorgantesSection(data.outorgantes);
  const outorgadosSection = buildOutorgadosSection(data.outorgados);
  const imoveisSection = buildImoveisSection(data.imoveis);
  const negocioSection = buildNegocioSection(data.negocio);

  const tipoAto = data.negocio?.tipo_negocio || data.minuta.tipo_ato || 'compra e venda';

  return `Voce e um especialista em minutas de escritura publica brasileira, com profundo conhecimento dos padroes notariais do Estado de Sao Paulo.

## TAREFA
Gere uma minuta completa de ${tipoAto} utilizando o TEMPLATE DE REFERENCIA abaixo e preenchendo-o com os DADOS ESTRUTURADOS fornecidos.

## TEMPLATE DE REFERENCIA (${templateType})
${template}

## DADOS ESTRUTURADOS DA MINUTA

### Informacoes Basicas
- Titulo: ${data.minuta.titulo}
- Tipo de Ato: ${data.minuta.tipo_ato}
- Data de Lavratura: ${data.minuta.data_lavratura}

### ${outorgantesSection}

### ${outorgadosSection}

### ${imoveisSection}

### ${negocioSection}

### Certidoes Disponíveis
${data.certidoes.length > 0 ? data.certidoes.map(c =>
  `- ${c.tipo}: ${c.numero || 'N/A'}, expedida em ${c.data_expedicao || 'N/A'}${c.validade ? `, válida até ${c.validade}` : ''}`
).join('\n') : 'Nenhuma certidao arquivada neste momento.'}

## INSTRUCOES IMPORTANTES

1. **SIGA O TEMPLATE**: Use a estrutura do template de referencia, preenchendo os placeholders com os dados fornecidos.

2. **FORMATACAO NOTARIAL**:
   - Nomes das partes devem estar em **negrito**
   - Use linguagem juridica formal e precisa
   - Mantenha a formatacao de escrituras publicas de Sao Paulo

3. **DADOS EXATOS**:
   - Mantenha CPFs, RGs, CNPJs e valores EXATAMENTE como fornecidos
   - Nao invente ou modifique numeros de documentos
   - Valores monetarios devem aparecer em algarismos e por extenso

4. **CAMPOS FALTANTES**:
   - Para campos nao preenchidos, use marcadores como [A COMPLETAR] ou [___]
   - Isso permite revisao posterior pelo tabeliao

5. **ESTRUTURA**:
   - Cabecalho com data, local e identificacao do cartorio
   - Qualificacao completa das partes
   - Descricao do imovel conforme matricula
   - Clausulas do negocio juridico
   - Declaracoes das partes
   - Clausulas finais e encerramento

6. **QUALIFICACAO DAS PARTES**:
   - Pessoas naturais: nome, nacionalidade, estado civil, regime de bens (se casado), profissao, RG, CPF, endereco
   - Pessoas juridicas: razao social, CNPJ, sede, representantes legais

Gere a minuta completa agora:`;
}

// ============ MAIN HANDLER ============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    const supabase = createSupabaseClient(req);
    const { minuta_id, template_type }: RequestBody = await req.json();

    if (!minuta_id) {
      throw new Error('minuta_id is required');
    }

    // Verify access to the minuta
    const { data: minuta, error: minutaError } = await supabase
      .from('minutas')
      .select('*')
      .eq('id', minuta_id)
      .single();

    if (minutaError || !minuta) {
      throw new Error('Minuta not found or access denied');
    }

    // Step 1: Aggregate all minuta data with proper Brazilian formatting
    console.log(`[generate-minuta] Aggregating data for minuta ${minuta_id}`);
    const minutaData = await aggregateMinutaData(serviceClient, minuta_id);

    // Step 2: Determine template type based on tipo_ato or request
    const templateKey = template_type || 'VENDA_COMPRA';
    const template = MINUTA_TEMPLATES[templateKey as keyof typeof MINUTA_TEMPLATES] || MINUTA_TEMPLATES.VENDA_COMPRA;

    // Step 3: Map data to placeholders (for reference/logging)
    const placeholders = mapDataToPlaceholders(minutaData);

    // Step 4: Build the generation prompt
    const prompt = buildGenerationPrompt(minutaData, template, templateKey);

    // Step 5: Start execution logging
    execution = await startExecution(serviceClient, 'generate', {
      minutaId: minuta_id,
      promptUsed: prompt.substring(0, 5000), // Truncate for logging
    });

    console.log(`[generate-minuta] Calling Gemini for generation...`);

    // Step 6: Call Gemini for generation
    const { text, usage } = await callGemini(prompt, undefined, undefined, {
      temperature: 0.3, // Lower temperature for more consistent output
      maxTokens: 8192,  // Enough for a full minuta
    });

    console.log(`[generate-minuta] Generation complete. Tokens: ${usage.inputTokens} in, ${usage.outputTokens} out`);

    // Step 7: Update minuta with generated text
    const { error: updateError } = await serviceClient
      .from('minutas')
      .update({
        minuta_texto: text,
        status: 'revisao',
        gerado_em: new Date().toISOString(),
      })
      .eq('id', minuta_id);

    if (updateError) {
      console.error(`[generate-minuta] Failed to update minuta:`, updateError);
      throw new Error(`Failed to save generated minuta: ${updateError.message}`);
    }

    // Step 8: Log successful execution
    await logSuccess(
      serviceClient,
      execution,
      {
        texto_gerado: text.substring(0, 500) + '...',
        template_usado: templateKey,
        placeholders_count: Object.keys(placeholders).length,
      },
      {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
      }
    );

    // Return successful response
    const result: GenerationResult = {
      success: true,
      minuta_texto: text,
      template_usado: templateKey,
      dados_utilizados: {
        outorgantes: minutaData.outorgantes.length,
        outorgados: minutaData.outorgados.length,
        imoveis: minutaData.imoveis.length,
        negocio: !!minutaData.negocio,
        certidoes: minutaData.certidoes.length,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-minuta] Error:', error);

    // Log error in execution tracking
    if (execution.id) {
      await logError(serviceClient, execution, error as Error);
    }

    const result: GenerationResult = {
      success: false,
      error: (error as Error).message,
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
