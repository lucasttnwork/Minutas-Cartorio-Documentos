// src/utils/fileToGemini.ts
// Utilitários para conversão de arquivos para o formato Gemini

import type { GeminiPart } from '@/services/gemini';

// Tamanho máximo de arquivo: 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Tipos MIME suportados
const SUPPORTED_MIME_TYPES: Record<string, string> = {
  // Imagens
  'image/jpeg': 'image/jpeg',
  'image/jpg': 'image/jpeg',
  'image/png': 'image/png',
  'image/webp': 'image/webp',
  'image/gif': 'image/gif',
  // PDFs
  'application/pdf': 'application/pdf',
  // Documentos (serão convertidos)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/pdf',
};

// Extensões suportadas
const SUPPORTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.docx'];

/**
 * Valida se um arquivo é suportado
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Verificar tamanho
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 20MB`,
    };
  }

  // Verificar tipo MIME
  const mimeType = file.type.toLowerCase();
  if (!SUPPORTED_MIME_TYPES[mimeType]) {
    // Verificar pela extensão como fallback
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `Tipo de arquivo não suportado: ${file.type || extension}. Suportados: PDF, JPG, PNG, WEBP, DOCX`,
      };
    }
  }

  return { valid: true };
}

/**
 * Converte um File para base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove o prefixo "data:mime/type;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error(`Erro ao ler arquivo: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Obtém o tipo MIME para o Gemini
 */
export function getGeminiMimeType(file: File): string {
  const mimeType = file.type.toLowerCase();

  // Se é um tipo conhecido, retorna o mapeado
  if (SUPPORTED_MIME_TYPES[mimeType]) {
    return SUPPORTED_MIME_TYPES[mimeType];
  }

  // Inferir pelo nome do arquivo
  const extension = file.name.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      // Fallback para PDF
      return 'application/pdf';
  }
}

/**
 * Converte um File para um Part do Gemini
 */
export async function fileToGenerativePart(file: File): Promise<GeminiPart> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const base64Data = await fileToBase64(file);
  const mimeType = getGeminiMimeType(file);

  return {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };
}

/**
 * Converte múltiplos Files para Parts do Gemini
 */
export async function filesToGenerativeParts(files: File[]): Promise<GeminiPart[]> {
  const parts: GeminiPart[] = [];

  for (const file of files) {
    const part = await fileToGenerativePart(file);
    parts.push(part);
  }

  return parts;
}

/**
 * Calcula o tamanho total de uma lista de arquivos
 */
export function getTotalFileSize(files: File[]): number {
  return files.reduce((total, file) => total + file.size, 0);
}

/**
 * Formata o tamanho do arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
