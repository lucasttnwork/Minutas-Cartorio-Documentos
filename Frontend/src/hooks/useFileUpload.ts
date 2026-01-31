/**
 * Hook para gerenciar upload de arquivos com Supabase Storage
 */

import { useState, useCallback } from 'react';
import {
  uploadFile,
  uploadFiles,
  deleteFile,
  validateFileType,
  validateFileSize,
  ALLOWED_DOCUMENT_TYPES,
  MAX_FILE_SIZE_MB,
  type UploadResult,
  type UploadProgress,
} from '@/lib/storage';
import type { ArquivoUpload } from '@/types/agente';

export interface UseFileUploadOptions {
  allowedTypes?: string[];
  maxSizeMB?: number;
  onError?: (error: Error) => void;
}

export interface FileUploadState {
  isUploading: boolean;
  progress: Record<string, UploadProgress>;
  uploadedFiles: Record<string, UploadResult>;
  errors: Record<string, string>;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    allowedTypes = ALLOWED_DOCUMENT_TYPES,
    maxSizeMB = MAX_FILE_SIZE_MB,
    onError,
  } = options;

  const [state, setState] = useState<FileUploadState>({
    isUploading: false,
    progress: {},
    uploadedFiles: {},
    errors: {},
  });

  /**
   * Valida um arquivo antes do upload
   */
  const validateFile = useCallback((file: File): string | null => {
    if (!validateFileType(file, allowedTypes)) {
      return `Tipo de arquivo não permitido: ${file.type}`;
    }

    if (!validateFileSize(file, maxSizeMB)) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`;
    }

    return null;
  }, [allowedTypes, maxSizeMB]);

  /**
   * Faz upload de um único arquivo
   */
  const upload = useCallback(async (
    arquivo: ArquivoUpload,
    path?: string
  ): Promise<UploadResult | null> => {
    const validationError = validateFile(arquivo.file);
    if (validationError) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [arquivo.id]: validationError },
      }));
      onError?.(new Error(validationError));
      return null;
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      errors: { ...prev.errors, [arquivo.id]: '' },
    }));

    try {
      const result = await uploadFile(
        arquivo.file,
        path,
        (progress) => {
          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, [arquivo.id]: progress },
          }));
        }
      );

      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadedFiles: { ...prev.uploadedFiles, [arquivo.id]: result },
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload';
      setState(prev => ({
        ...prev,
        isUploading: false,
        errors: { ...prev.errors, [arquivo.id]: errorMessage },
      }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      return null;
    }
  }, [validateFile, onError]);

  /**
   * Faz upload de múltiplos arquivos
   */
  const uploadMultiple = useCallback(async (
    arquivos: ArquivoUpload[],
    path?: string
  ): Promise<(UploadResult | null)[]> => {
    // Validar todos os arquivos primeiro
    const validations = arquivos.map(arquivo => ({
      arquivo,
      error: validateFile(arquivo.file),
    }));

    const invalidFiles = validations.filter(v => v.error);
    if (invalidFiles.length > 0) {
      const errors = invalidFiles.reduce((acc, { arquivo, error }) => ({
        ...acc,
        [arquivo.id]: error!,
      }), {});

      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, ...errors },
      }));

      invalidFiles.forEach(({ error }) => {
        onError?.(new Error(error!));
      });
    }

    // Fazer upload apenas dos arquivos válidos
    const validFiles = validations.filter(v => !v.error).map(v => v.arquivo);
    if (validFiles.length === 0) {
      return [];
    }

    setState(prev => ({ ...prev, isUploading: true }));

    try {
      const results = await uploadFiles(
        validFiles.map(a => a.file),
        path,
        (fileIndex, progress) => {
          const arquivo = validFiles[fileIndex];
          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, [arquivo.id]: progress },
          }));
        }
      );

      const uploadedMap = results.reduce((acc, result, index) => ({
        ...acc,
        [validFiles[index].id]: result,
      }), {});

      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadedFiles: { ...prev.uploadedFiles, ...uploadedMap },
      }));

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload';
      setState(prev => ({
        ...prev,
        isUploading: false,
      }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      return [];
    }
  }, [validateFile, onError]);

  /**
   * Remove um arquivo do storage
   */
  const remove = useCallback(async (
    arquivoId: string,
    path: string
  ): Promise<boolean> => {
    try {
      await deleteFile(path);

      setState(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [arquivoId]: _removed1, ...remainingUploaded } = prev.uploadedFiles;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [arquivoId]: _removed2, ...remainingProgress } = prev.progress;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [arquivoId]: _removed3, ...remainingErrors } = prev.errors;

        return {
          ...prev,
          uploadedFiles: remainingUploaded,
          progress: remainingProgress,
          errors: remainingErrors,
        };
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover arquivo';
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [arquivoId]: errorMessage },
      }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      return false;
    }
  }, [onError]);

  /**
   * Limpa o estado de upload
   */
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: {},
      uploadedFiles: {},
      errors: {},
    });
  }, []);

  return {
    ...state,
    upload,
    uploadMultiple,
    remove,
    reset,
    validateFile,
  };
}
