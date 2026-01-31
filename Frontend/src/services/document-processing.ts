import { supabase } from '@/lib/supabase';

export interface ClassificationResult {
  tipo_documento: string;
  confianca: number;
}

export interface ExtractionResult {
  dados_extraidos: Record<string, unknown>;
  campos_faltantes: string[];
}

export interface MappingResult {
  campos_mapeados: Record<string, unknown>;
  alertas: string[];
}

export interface GenerationResult {
  texto_minuta: string;
  versao: number;
}

export async function classifyDocument(documentoId: string): Promise<ClassificationResult> {
  const { data, error } = await supabase.functions.invoke('classify-document', {
    body: { documentoId },
  });

  if (error) {
    throw new Error(`Erro ao classificar documento: ${error.message}`);
  }

  return data as ClassificationResult;
}

export async function extractDocument(documentoId: string): Promise<ExtractionResult> {
  const { data, error } = await supabase.functions.invoke('extract-document', {
    body: { documentoId },
  });

  if (error) {
    throw new Error(`Erro ao extrair documento: ${error.message}`);
  }

  return data as ExtractionResult;
}

export async function mapToFields(minutaId: string): Promise<MappingResult> {
  const { data, error } = await supabase.functions.invoke('map-to-fields', {
    body: { minutaId },
  });

  if (error) {
    throw new Error(`Erro ao mapear campos: ${error.message}`);
  }

  return data as MappingResult;
}

export async function generateMinuta(minutaId: string): Promise<GenerationResult> {
  const { data, error } = await supabase.functions.invoke('generate-minuta', {
    body: { minutaId },
  });

  if (error) {
    throw new Error(`Erro ao gerar minuta: ${error.message}`);
  }

  return data as GenerationResult;
}
