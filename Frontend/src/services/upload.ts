import { supabase } from '@/lib/supabase';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Sanitizes a filename by removing special characters and spaces
 */
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * Validates file size and type
 */
function validateFile(file: File): void {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must not exceed 50MB');
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    );
  }
}

/**
 * Generates a unique file path with timestamp
 */
function generateFilePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(filename);
  return `${userId}/${timestamp}-${sanitized}`;
}

/**
 * Uploads a file to Supabase Storage
 *
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param userId - The user ID for path generation
 * @param options - Optional upload options (progress callback)
 * @returns Promise with the uploaded file path
 * @throws Error if validation fails or upload fails
 */
export async function uploadFile(
  file: File,
  bucket: string,
  userId: string,
  options?: UploadOptions
): Promise<{ path: string }> {
  // Validate file
  validateFile(file);

  // Generate unique path
  const path = generateFilePath(userId, file.name);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Upload failed: No data returned');
  }

  // Call progress callback if provided (100% complete)
  if (options?.onProgress) {
    options.onProgress({
      loaded: file.size,
      total: file.size,
      percentage: 100,
    });
  }

  return { path: data.path };
}

/**
 * Deletes a file from Supabase Storage
 *
 * @param bucket - The storage bucket name
 * @param path - The file path to delete
 * @throws Error if delete fails
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Gets the public URL for a file in Supabase Storage
 *
 * @param bucket - The storage bucket name
 * @param path - The file path
 * @returns The public URL for the file
 */
export function getFileUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}
