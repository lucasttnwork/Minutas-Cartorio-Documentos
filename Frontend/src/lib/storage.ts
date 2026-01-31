/**
 * Utilitários para upload e gerenciamento de arquivos no Supabase Storage
 */

import { supabase } from './supabase';

export const STORAGE_BUCKET = 'documentos';

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Gera um nome de arquivo único
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

  return `${sanitizedName}_${timestamp}_${random}.${extension}`;
}

/**
 * Faz upload de um arquivo para o Supabase Storage
 */
export async function uploadFile(
  file: File,
  path?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const fileName = generateUniqueFileName(file.name);
  const filePath = path ? `${path}/${fileName}` : fileName;

  // Simular progresso se callback fornecido
  if (onProgress) {
    onProgress({ loaded: 0, total: file.size, percentage: 0 });
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Erro ao fazer upload do arquivo: ${error.message}`);
  }

  // Simular progresso completo
  if (onProgress) {
    onProgress({ loaded: file.size, total: file.size, percentage: 100 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

/**
 * Faz upload de múltiplos arquivos
 */
export async function uploadFiles(
  files: File[],
  path?: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadFile(
      file,
      path,
      onProgress ? (progress) => onProgress(i, progress) : undefined
    );
    results.push(result);
  }

  return results;
}

/**
 * Remove um arquivo do storage
 */
export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Erro ao remover arquivo: ${error.message}`);
  }
}

/**
 * Remove múltiplos arquivos
 */
export async function deleteFiles(paths: string[]): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove(paths);

  if (error) {
    throw new Error(`Erro ao remover arquivos: ${error.message}`);
  }
}

/**
 * Obtém URL pública de um arquivo
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Baixa um arquivo do storage
 */
export async function downloadFile(path: string): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(path);

  if (error) {
    throw new Error(`Erro ao baixar arquivo: ${error.message}`);
  }

  return data;
}

/**
 * Valida tipo de arquivo permitido
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const category = type.split('/')[0];
      return file.type.startsWith(`${category}/`);
    }
    return file.type === type;
  });
}

/**
 * Valida tamanho de arquivo
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Tipos de arquivo permitidos para documentos
 */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
];

/**
 * Extensões permitidas para documentos
 */
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.docx',
  '.doc',
];

/**
 * Tamanho máximo de arquivo em MB
 */
export const MAX_FILE_SIZE_MB = 10;
