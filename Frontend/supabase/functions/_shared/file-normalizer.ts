/**
 * File Normalizer - Converts files to Gemini-compatible formats
 *
 * Gemini API natively supports:
 * - PDFs (application/pdf) - up to 50MB, 1000 pages
 * - Images (jpeg, png, webp, gif, heic, heif, bmp)
 * - Text (plain, markdown, html, csv)
 *
 * Files that need conversion:
 * - DOCX → HTML (using Mammoth.js)
 */

import * as mammoth from 'npm:mammoth@1.8.0';

/**
 * MIME types natively supported by Gemini API
 */
export const GEMINI_NATIVE_TYPES = new Set([
  // PDFs
  'application/pdf',
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/bmp',
  // Text formats
  'text/plain',
  'text/markdown',
  'text/html',
  'text/csv',
]);

/**
 * MIME types that require conversion before sending to Gemini
 */
export const TYPES_REQUIRING_CONVERSION = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
]);

/**
 * Result of normalizing a single file
 */
export interface NormalizedFile {
  /** File content ready for Gemini (may be converted) */
  content: ArrayBuffer;
  /** MIME type to send to Gemini */
  mimeType: string;
  /** Original filename */
  originalName: string;
  /** Original MIME type before conversion */
  originalMimeType: string;
  /** Whether the file was converted */
  wasConverted: boolean;
  /** Warnings from conversion process */
  conversionWarnings?: string[];
}

/**
 * Result of normalizing multiple files
 */
export interface NormalizationResult {
  /** Normalized files ready for Gemini */
  files: NormalizedFile[];
  /** Aggregate warnings from all conversions */
  warnings: string[];
}

/**
 * Input file format
 */
export interface InputFile {
  buffer: ArrayBuffer;
  name: string;
  mimeType: string;
}

/**
 * Convert DOCX to HTML using Mammoth
 *
 * Note: Mammoth extracts text and basic formatting.
 * Embedded images may not be preserved.
 */
async function convertDocxToHtml(
  buffer: ArrayBuffer
): Promise<{ html: string; warnings: string[] }> {
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });

  const warnings = result.messages
    .filter((m: { type: string; message: string }) => m.type === 'warning')
    .map((m: { type: string; message: string }) => m.message);

  return {
    html: result.value,
    warnings,
  };
}

/**
 * Normalize a single file for Gemini API
 */
async function normalizeFile(file: InputFile): Promise<NormalizedFile> {
  // File is already natively supported - pass through
  if (GEMINI_NATIVE_TYPES.has(file.mimeType)) {
    return {
      content: file.buffer,
      mimeType: file.mimeType,
      originalName: file.name,
      originalMimeType: file.mimeType,
      wasConverted: false,
    };
  }

  // DOCX → HTML conversion
  if (
    file.mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const { html, warnings: docWarnings } = await convertDocxToHtml(file.buffer);

    // Convert HTML string to ArrayBuffer
    const encoder = new TextEncoder();
    const htmlBuffer = encoder.encode(html).buffer;

    return {
      content: htmlBuffer,
      mimeType: 'text/html',
      originalName: file.name,
      originalMimeType: file.mimeType,
      wasConverted: true,
      conversionWarnings: docWarnings,
    };
  }

  // Unsupported type
  throw new Error(
    `Tipo de arquivo não suportado: ${file.mimeType} (${file.name}). ` +
      'Formatos aceitos: PDF, imagens (JPG, PNG, WebP, GIF, HEIC, BMP), ' +
      'documentos (DOCX), texto (TXT, MD, CSV).'
  );
}

/**
 * Normalize multiple files for Gemini API
 *
 * - Native formats (PDF, images, text) pass through unchanged
 * - DOCX files are converted to HTML
 * - Unsupported formats throw an error
 *
 * @param files Array of files to normalize
 * @returns Normalized files and warnings
 */
export async function normalizeFilesForGemini(
  files: InputFile[]
): Promise<NormalizationResult> {
  const normalizedFiles: NormalizedFile[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    try {
      const normalized = await normalizeFile(file);
      normalizedFiles.push(normalized);

      // Collect conversion warnings
      if (normalized.wasConverted) {
        if (normalized.conversionWarnings && normalized.conversionWarnings.length > 0) {
          warnings.push(`${file.name}: ${normalized.conversionWarnings.join('; ')}`);
        }
        // Add general conversion notice
        warnings.push(
          `${file.name}: Convertido de DOCX para HTML. Imagens embutidas podem não ter sido preservadas.`
        );
      }
    } catch (error) {
      // Re-throw with file context
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Erro ao processar ${file.name}: Erro desconhecido`);
    }
  }

  return { files: normalizedFiles, warnings };
}

/**
 * Check if a MIME type is supported (either natively or via conversion)
 */
export function isMimeTypeSupported(mimeType: string): boolean {
  return GEMINI_NATIVE_TYPES.has(mimeType) || TYPES_REQUIRING_CONVERSION.has(mimeType);
}

/**
 * Check if a MIME type requires conversion
 */
export function requiresConversion(mimeType: string): boolean {
  return TYPES_REQUIRING_CONVERSION.has(mimeType);
}

/**
 * Get human-readable list of supported formats
 */
export function getSupportedFormatsDescription(): string {
  return 'PDF, imagens (JPG, PNG, WebP, GIF, HEIC, BMP), documentos (DOCX), texto (TXT, MD, CSV)';
}
