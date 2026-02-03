import { createServiceClient } from './supabase-client.ts';

// Load extraction prompt from database
export async function loadExtractionPrompt(
  tipoDocumento: string,
  fileSize?: number
): Promise<{ prompt: string; versao: number }> {
  const supabase = createServiceClient();

  // Keep original case - database stores tipo_documento in UPPERCASE
  const tipo = tipoDocumento.toUpperCase();

  // For large matriculas, try compact version first
  if (tipo === 'MATRICULA_IMOVEL' && fileSize && fileSize > 2_000_000) {
    const { data: compact } = await supabase
      .from('agent_prompts')
      .select('prompt_text, versao')
      .eq('tipo_documento', 'MATRICULA_IMOVEL_COMPACT')
      .eq('ativo', true)
      .order('versao', { ascending: false })
      .limit(1)
      .single();

    if (compact) return { prompt: compact.prompt_text, versao: compact.versao };
  }

  // Get latest version of prompt for type
  const { data: prompt } = await supabase
    .from('agent_prompts')
    .select('prompt_text, versao')
    .eq('tipo_documento', tipo)
    .eq('ativo', true)
    .order('versao', { ascending: false })
    .limit(1)
    .single();

  if (prompt) return { prompt: prompt.prompt_text, versao: prompt.versao };

  // Fallback to generic
  const { data: generic } = await supabase
    .from('agent_prompts')
    .select('prompt_text, versao')
    .eq('tipo_documento', 'GENERIC')
    .eq('ativo', true)
    .limit(1)
    .single();

  if (generic) return { prompt: generic.prompt_text, versao: generic.versao };

  throw new Error(`No prompt found for document type: ${tipoDocumento}`);
}

/**
 * Carrega o prompt de classificacao do banco de dados
 * Retorna o prompt ativo com maior versao
 */
export async function loadClassificationPrompt(): Promise<{
  prompt: string;
  versao: number;
}> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('agent_prompts')
    .select('prompt_text, versao')
    .eq('tipo_documento', 'CLASSIFICATION')
    .eq('ativo', true)
    .order('versao', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(
      'Classification prompt not found in database. ' +
      'Run migration 20260202150000_insert_classification_prompt.sql'
    );
  }

  return {
    prompt: data.prompt_text,
    versao: data.versao,
  };
}
