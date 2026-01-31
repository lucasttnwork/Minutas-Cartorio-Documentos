/**
 * Hook para upload de documentos para Supabase Storage + Database
 *
 * Este hook gerencia:
 * 1. Upload do arquivo para Supabase Storage (bucket 'documentos')
 * 2. Criacao de registro na tabela 'documentos' do banco de dados
 * 3. Estados de progresso, loading e erro
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface UploadResult {
  id: string;           // ID do registro no banco
  storagePath: string;  // Path no Storage
}

export interface UseDocumentUploadReturn {
  uploadDocument: (
    file: File,
    minutaId: string,
    category: string
  ) => Promise<UploadResult | null>;
  uploading: boolean;
  progress: number;
  error: string | null;
  clearError: () => void;
}

/**
 * Gera um nome de arquivo unico para o storage
 * Formato: {userId}/{minutaId}/{timestamp}_{filename}
 * O userId como primeiro folder e necessario para as politicas RLS do storage
 */
function generateStoragePath(userId: string, minutaId: string, fileName: string): string {
  const timestamp = Date.now();
  // Sanitiza o nome do arquivo removendo caracteres especiais, mantendo extensao
  const extension = fileName.split('.').pop() || '';
  const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.')) || fileName;
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

  return `${userId}/${minutaId}/${timestamp}_${sanitizedName}.${extension}`;
}

export function useDocumentUpload(): UseDocumentUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const uploadDocument = useCallback(
    async (
      file: File,
      minutaId: string,
      _category: string // Category is passed for future use (tipo_documento classification)
    ): Promise<UploadResult | null> => {
      // Reset state for new upload
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // 0. Get current user ID for storage path (required by RLS policies)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Usuario nao autenticado');
          setUploading(false);
          return null;
        }

        // 1. Generate storage path with userId as first folder
        const storagePath = generateStoragePath(user.id, minutaId, file.name);

        // 2. Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progressEvent) => {
              const percentage = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setProgress(percentage);
            },
          });

        if (uploadError) {
          setError(`Erro ao fazer upload: ${uploadError.message}`);
          setUploading(false);
          return null;
        }

        // Ensure progress shows 100% after successful upload
        setProgress(100);

        // 3. Create record in 'documentos' table
        const { data: docData, error: dbError } = await supabase
          .from('documentos')
          .insert({
            minuta_id: minutaId,
            nome_original: file.name,
            storage_path: uploadData.path,
            mime_type: file.type || 'application/octet-stream',
            tamanho_bytes: file.size,
            status: 'uploaded' as const,
          })
          .select()
          .single();

        if (dbError) {
          setError(`Erro ao salvar documento: ${dbError.message}`);
          setUploading(false);
          return null;
        }

        setUploading(false);

        return {
          id: docData.id,
          storagePath: docData.storage_path,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(`Erro inesperado: ${errorMessage}`);
        setUploading(false);
        return null;
      }
    },
    []
  );

  return {
    uploadDocument,
    uploading,
    progress,
    error,
    clearError,
  };
}
