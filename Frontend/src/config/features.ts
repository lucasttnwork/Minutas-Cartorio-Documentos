// src/config/features.ts
// Feature flags e configurações do sistema

/**
 * Feature flags para controlar funcionalidades
 */
export const features = {
  /**
   * Usar Gemini real para análise de documentos
   * Se false, usa modo demo com respostas mock
   */
  useRealGemini: import.meta.env.VITE_USE_REAL_GEMINI === 'true',

  /**
   * Modelo do Gemini a ser utilizado
   */
  geminiModel: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20',

  /**
   * Máximo de arquivos por análise
   */
  maxFilesPerAnalysis: 10,

  /**
   * Tamanho máximo de arquivo em bytes (20MB)
   */
  maxFileSizeBytes: 20 * 1024 * 1024,

  /**
   * Tipos MIME suportados para upload
   */
  supportedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
} as const;

/**
 * Verifica se o Gemini está configurado corretamente
 */
export function isGeminiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}

/**
 * Retorna informações sobre o modo de execução atual
 */
export function getExecutionMode(): 'real' | 'demo' {
  return features.useRealGemini && isGeminiConfigured() ? 'real' : 'demo';
}
