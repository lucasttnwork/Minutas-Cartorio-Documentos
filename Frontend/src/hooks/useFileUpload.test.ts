// src/hooks/useFileUpload.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from './useFileUpload';
import * as storage from '@/lib/storage';
import type { ArquivoUpload } from '@/types/agente';

// Mock storage module
vi.mock('@/lib/storage', () => ({
  uploadFile: vi.fn(),
  uploadFiles: vi.fn(),
  deleteFile: vi.fn(),
  validateFileType: vi.fn(),
  validateFileSize: vi.fn(),
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg'],
  MAX_FILE_SIZE_MB: 10,
}));

describe('useFileUpload', () => {
  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  const createArquivoUpload = (file: File): ArquivoUpload => ({
    id: crypto.randomUUID(),
    file,
    nome: file.name,
    tamanho: file.size,
    tipo: file.type,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks - return valid
    vi.mocked(storage.validateFileType).mockReturnValue(true);
    vi.mocked(storage.validateFileSize).mockReturnValue(true);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(result.current.isUploading).toBe(false);
      expect(result.current.progress).toEqual({});
      expect(result.current.uploadedFiles).toEqual({});
      expect(result.current.errors).toEqual({});
    });
  });

  describe('File Validation', () => {
    it('should validate file type', () => {
      const { result } = renderHook(() => useFileUpload());

      vi.mocked(storage.validateFileType).mockReturnValue(false);

      const file = createMockFile('doc.txt', 1024, 'text/plain');
      const error = result.current.validateFile(file);

      expect(error).toContain('Tipo de arquivo não permitido');
    });

    it('should validate file size', () => {
      const { result } = renderHook(() => useFileUpload());

      vi.mocked(storage.validateFileSize).mockReturnValue(false);

      const file = createMockFile('large.pdf', 1024 * 1024 * 20, 'application/pdf');
      const error = result.current.validateFile(file);

      expect(error).toContain('Arquivo muito grande');
    });

    it('should return null for valid file', () => {
      const { result } = renderHook(() => useFileUpload());

      const file = createMockFile('doc.pdf', 1024, 'application/pdf');
      const error = result.current.validateFile(file);

      expect(error).toBeNull();
    });
  });

  describe('Single File Upload', () => {
    it('should upload file successfully', async () => {
      const mockResult = {
        url: 'https://example.com/file.pdf',
        path: 'uploads/file.pdf',
      };

      vi.mocked(storage.uploadFile).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useFileUpload());

      const file = createMockFile('doc.pdf', 1024, 'application/pdf');
      const arquivo = createArquivoUpload(file);

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.upload(arquivo);
      });

      expect(uploadResult).toEqual(mockResult);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.uploadedFiles[arquivo.id]).toEqual(mockResult);
    });

    it('should track upload progress', async () => {
      const mockResult = {
        url: 'https://example.com/file.pdf',
        path: 'uploads/file.pdf',
      };

      vi.mocked(storage.uploadFile).mockImplementation(async (file, path, onProgress) => {
        onProgress?.({ loaded: 0, total: 100, percentage: 0 });
        onProgress?.({ loaded: 50, total: 100, percentage: 50 });
        onProgress?.({ loaded: 100, total: 100, percentage: 100 });
        return mockResult;
      });

      const { result } = renderHook(() => useFileUpload());

      const file = createMockFile('doc.pdf', 1024, 'application/pdf');
      const arquivo = createArquivoUpload(file);

      await act(async () => {
        await result.current.upload(arquivo);
      });

      expect(result.current.progress[arquivo.id]).toEqual({
        loaded: 100,
        total: 100,
        percentage: 100,
      });
    });

    it('should handle upload error', async () => {
      const mockError = new Error('Upload failed');
      vi.mocked(storage.uploadFile).mockRejectedValue(mockError);

      const onError = vi.fn();
      const { result } = renderHook(() => useFileUpload({ onError }));

      const file = createMockFile('doc.pdf', 1024, 'application/pdf');
      const arquivo = createArquivoUpload(file);

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.upload(arquivo);
      });

      expect(uploadResult).toBeNull();
      expect(result.current.isUploading).toBe(false);
      expect(result.current.errors[arquivo.id]).toBeTruthy();
      expect(onError).toHaveBeenCalledWith(mockError);
    });

    it('should not upload invalid file', async () => {
      vi.mocked(storage.validateFileType).mockReturnValue(false);

      const onError = vi.fn();
      const { result } = renderHook(() => useFileUpload({ onError }));

      const file = createMockFile('doc.txt', 1024, 'text/plain');
      const arquivo = createArquivoUpload(file);

      let uploadResult;
      await act(async () => {
        uploadResult = await result.current.upload(arquivo);
      });

      expect(uploadResult).toBeNull();
      expect(storage.uploadFile).not.toHaveBeenCalled();
      expect(result.current.errors[arquivo.id]).toBeTruthy();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Multiple Files Upload', () => {
    it('should upload multiple files successfully', async () => {
      const mockResults = [
        { url: 'https://example.com/file1.pdf', path: 'uploads/file1.pdf' },
        { url: 'https://example.com/file2.pdf', path: 'uploads/file2.pdf' },
      ];

      vi.mocked(storage.uploadFiles).mockResolvedValue(mockResults);

      const { result } = renderHook(() => useFileUpload());

      const file1 = createMockFile('doc1.pdf', 1024, 'application/pdf');
      const file2 = createMockFile('doc2.pdf', 2048, 'application/pdf');
      const arquivos = [createArquivoUpload(file1), createArquivoUpload(file2)];

      let uploadResults;
      await act(async () => {
        uploadResults = await result.current.uploadMultiple(arquivos);
      });

      expect(uploadResults).toEqual(mockResults);
      expect(result.current.isUploading).toBe(false);
      expect(Object.keys(result.current.uploadedFiles)).toHaveLength(2);
    });

    it('should track progress for each file', async () => {
      const mockResults = [
        { url: 'https://example.com/file1.pdf', path: 'uploads/file1.pdf' },
      ];

      vi.mocked(storage.uploadFiles).mockImplementation(async (files, path, onProgress) => {
        onProgress?.(0, { loaded: 0, total: 100, percentage: 0 });
        onProgress?.(0, { loaded: 100, total: 100, percentage: 100 });
        return mockResults;
      });

      const { result } = renderHook(() => useFileUpload());

      const file = createMockFile('doc.pdf', 1024, 'application/pdf');
      const arquivos = [createArquivoUpload(file)];

      await act(async () => {
        await result.current.uploadMultiple(arquivos);
      });

      expect(result.current.progress[arquivos[0].id]).toEqual({
        loaded: 100,
        total: 100,
        percentage: 100,
      });
    });

    it('should filter out invalid files', async () => {
      vi.mocked(storage.validateFileType)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const mockResults = [
        { url: 'https://example.com/file1.pdf', path: 'uploads/file1.pdf' },
      ];

      vi.mocked(storage.uploadFiles).mockResolvedValue(mockResults);

      const onError = vi.fn();
      const { result } = renderHook(() => useFileUpload({ onError }));

      const file1 = createMockFile('doc1.pdf', 1024, 'application/pdf');
      const file2 = createMockFile('doc2.txt', 1024, 'text/plain');
      const arquivos = [createArquivoUpload(file1), createArquivoUpload(file2)];

      await act(async () => {
        await result.current.uploadMultiple(arquivos);
      });

      // Should only upload the valid file
      expect(storage.uploadFiles).toHaveBeenCalledWith(
        [file1],
        undefined,
        expect.any(Function)
      );

      // Should set error for invalid file
      expect(result.current.errors[arquivos[1].id]).toBeTruthy();
      expect(onError).toHaveBeenCalled();
    });

    it('should return empty array if all files invalid', async () => {
      vi.mocked(storage.validateFileType).mockReturnValue(false);

      const { result } = renderHook(() => useFileUpload());

      const file1 = createMockFile('doc1.txt', 1024, 'text/plain');
      const file2 = createMockFile('doc2.txt', 1024, 'text/plain');
      const arquivos = [createArquivoUpload(file1), createArquivoUpload(file2)];

      let uploadResults;
      await act(async () => {
        uploadResults = await result.current.uploadMultiple(arquivos);
      });

      expect(uploadResults).toEqual([]);
      expect(storage.uploadFiles).not.toHaveBeenCalled();
    });
  });

  describe('File Removal', () => {
    it('should remove file successfully', async () => {
      vi.mocked(storage.deleteFile).mockResolvedValue(undefined);

      const { result } = renderHook(() => useFileUpload());

      const arquivo = createArquivoUpload(createMockFile('doc.pdf', 1024, 'application/pdf'));

      // Set initial state with uploaded file
      act(() => {
        result.current['setState']?.((prev: any) => ({
          ...prev,
          uploadedFiles: {
            [arquivo.id]: { url: 'https://example.com/file.pdf', path: 'uploads/file.pdf' },
          },
        }));
      });

      let success;
      await act(async () => {
        success = await result.current.remove(arquivo.id, 'uploads/file.pdf');
      });

      expect(success).toBe(true);
      expect(storage.deleteFile).toHaveBeenCalledWith('uploads/file.pdf');
      expect(result.current.uploadedFiles[arquivo.id]).toBeUndefined();
    });

    it('should handle removal error', async () => {
      const mockError = new Error('Delete failed');
      vi.mocked(storage.deleteFile).mockRejectedValue(mockError);

      const onError = vi.fn();
      const { result } = renderHook(() => useFileUpload({ onError }));

      const arquivo = createArquivoUpload(createMockFile('doc.pdf', 1024, 'application/pdf'));

      let success;
      await act(async () => {
        success = await result.current.remove(arquivo.id, 'uploads/file.pdf');
      });

      expect(success).toBe(false);
      expect(result.current.errors[arquivo.id]).toBeTruthy();
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Reset', () => {
    it('should reset state', async () => {
      const { result } = renderHook(() => useFileUpload());

      const arquivo = createArquivoUpload(createMockFile('doc.pdf', 1024, 'application/pdf'));

      // Manually set some state
      act(() => {
        result.current['setState']?.((prev: any) => ({
          ...prev,
          uploadedFiles: { [arquivo.id]: { url: 'test', path: 'test' } },
          progress: { [arquivo.id]: { loaded: 50, total: 100, percentage: 50 } },
          errors: { [arquivo.id]: 'Test error' },
        }));
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.progress).toEqual({});
      expect(result.current.uploadedFiles).toEqual({});
      expect(result.current.errors).toEqual({});
    });
  });
});
