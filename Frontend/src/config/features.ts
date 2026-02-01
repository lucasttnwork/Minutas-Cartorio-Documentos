// src/config/features.ts
// Feature flags e configurações do sistema

/**
 * Feature flags para controlar funcionalidades
 */
export const features = {
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
   * Inclui formatos nativos do Gemini e formatos que serão convertidos
   */
  supportedMimeTypes: [
    // PDFs
    'application/pdf',
    // Images - all formats supported by Gemini
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/bmp',
    // Office documents (converted to HTML on backend)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Text formats
    'text/plain',
    'text/markdown',
    'text/csv',
  ],
} as const;
