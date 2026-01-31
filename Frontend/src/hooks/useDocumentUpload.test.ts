// src/hooks/useDocumentUpload.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDocumentUpload } from './useDocumentUpload';

// Mock supabase
const mockUpload = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();
const mockStorage = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
      }),
    },
    from: (table: string) => {
      mockFrom(table);
      return {
        insert: (data: any) => {
          mockInsert(data);
          return {
            select: () => {
              mockSelect();
              return {
                single: mockSingle,
              };
            },
          };
        },
      };
    },
  },
}));

describe('useDocumentUpload', () => {
  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful upload mock
    mockUpload.mockResolvedValue({
      data: { path: 'test-minuta-id/1234567890_test.pdf' },
      error: null,
    });

    // Default successful insert mock
    mockSingle.mockResolvedValue({
      data: {
        id: 'doc-uuid-123',
        minuta_id: 'test-minuta-id',
        nome_arquivo: 'test.pdf',
        storage_path: 'test-minuta-id/1234567890_test.pdf',
        status: 'pendente',
      },
      error: null,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useDocumentUpload());

      expect(result.current.uploading).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('uploadDocument', () => {
    it('should upload file to Supabase Storage', async () => {
      const { result } = renderHook(() => useDocumentUpload());

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.uploadDocument(file, 'test-minuta-id', 'outorgantes');
      });

      // Verify storage upload was called with correct bucket and path pattern
      expect(mockUpload).toHaveBeenCalledTimes(1);
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^test-minuta-id\/\d+_test\.pdf$/),
        file,
        expect.objectContaining({
          cacheControl: '3600',
          upsert: false,
        })
      );
    });

    it('should create record in documentos table', async () => {
      const { result } = renderHook(() => useDocumentUpload());

      const file = createMockFile('document.pdf', 2048, 'application/pdf');

      await act(async () => {
        await result.current.uploadDocument(file, 'minuta-123', 'imoveis');
      });

      // Verify database insert was called
      expect(mockFrom).toHaveBeenCalledWith('documentos');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          minuta_id: 'minuta-123',
          nome_arquivo: 'document.pdf',
          storage_path: expect.any(String),
          status: 'pendente',
        })
      );
    });

    it('should return id and storagePath on success', async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: 'returned-doc-id',
          storage_path: 'minuta-123/file.pdf',
        },
        error: null,
      });

      const { result } = renderHook(() => useDocumentUpload());

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadDocument(file, 'minuta-123', 'outorgantes');
      });

      expect(uploadResult).toEqual({
        id: 'returned-doc-id',
        storagePath: 'minuta-123/file.pdf',
      });
    });

    it('should set uploading to true during upload and false after', async () => {
      // Make upload take time
      mockUpload.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: { path: 'test.pdf' }, error: null }), 100))
      );

      const { result } = renderHook(() => useDocumentUpload());

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      let uploadPromise: Promise<any>;
      act(() => {
        uploadPromise = result.current.uploadDocument(file, 'minuta-id', 'outorgantes');
      });

      // Should be uploading
      expect(result.current.uploading).toBe(true);

      await act(async () => {
        await uploadPromise;
      });

      // Should be done
      expect(result.current.uploading).toBe(false);
    });

    it('should capture storage upload error', async () => {
      mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Storage quota exceeded' },
      });

      const { result } = renderHook(() => useDocumentUpload());

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadDocument(file, 'minuta-id', 'outorgantes');
      });

      expect(uploadResult).toBeNull();
      expect(result.current.error).toBe('Erro ao fazer upload: Storage quota exceeded');
      expect(result.current.uploading).toBe(false);
    });

    it('should capture database insert error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Foreign key constraint violation' },
      });

      const { result } = renderHook(() => useDocumentUpload());

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      let uploadResult: any;
      await act(async () => {
        uploadResult = await result.current.uploadDocument(file, 'minuta-id', 'outorgantes');
      });

      expect(uploadResult).toBeNull();
      expect(result.current.error).toBe('Erro ao salvar documento: Foreign key constraint violation');
      expect(result.current.uploading).toBe(false);
    });

    it('should update progress during upload', async () => {
      // Track the onUploadProgress callback
      let capturedOnProgress: ((progress: { loaded: number; total: number }) => void) | undefined;

      mockUpload.mockImplementation((_path, _file, options) => {
        capturedOnProgress = options?.onUploadProgress;
        // Simulate progress
        if (capturedOnProgress) {
          capturedOnProgress({ loaded: 0, total: 100 });
          capturedOnProgress({ loaded: 50, total: 100 });
          capturedOnProgress({ loaded: 100, total: 100 });
        }
        return Promise.resolve({ data: { path: 'test.pdf' }, error: null });
      });

      const { result } = renderHook(() => useDocumentUpload());

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.uploadDocument(file, 'minuta-id', 'outorgantes');
      });

      // After completion, progress should be 100
      expect(result.current.progress).toBe(100);
    });

    it('should handle file with special characters in name', async () => {
      const { result } = renderHook(() => useDocumentUpload());

      const file = createMockFile('documento com espacos (1).pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.uploadDocument(file, 'minuta-id', 'outorgantes');
      });

      // Should still upload successfully
      expect(mockUpload).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          nome_arquivo: 'documento com espacos (1).pdf',
        })
      );
    });

    it('should reset progress on new upload', async () => {
      const { result } = renderHook(() => useDocumentUpload());

      // First upload
      const file1 = createMockFile('test1.pdf', 1024, 'application/pdf');
      await act(async () => {
        await result.current.uploadDocument(file1, 'minuta-id', 'outorgantes');
      });

      expect(result.current.progress).toBe(100);

      // Second upload - progress should reset
      mockUpload.mockImplementation((_path, _file, options) => {
        // Check that progress was reset
        expect(result.current.progress).toBe(0);
        return Promise.resolve({ data: { path: 'test2.pdf' }, error: null });
      });

      const file2 = createMockFile('test2.pdf', 1024, 'application/pdf');
      await act(async () => {
        await result.current.uploadDocument(file2, 'minuta-id', 'outorgantes');
      });
    });

    it('should clear error on new upload', async () => {
      // First upload fails
      mockUpload.mockResolvedValueOnce({
        data: null,
        error: { message: 'First error' },
      });

      const { result } = renderHook(() => useDocumentUpload());

      const file1 = createMockFile('test1.pdf', 1024, 'application/pdf');
      await act(async () => {
        await result.current.uploadDocument(file1, 'minuta-id', 'outorgantes');
      });

      expect(result.current.error).toBe('Erro ao fazer upload: First error');

      // Second upload succeeds
      mockUpload.mockResolvedValueOnce({
        data: { path: 'test2.pdf' },
        error: null,
      });

      const file2 = createMockFile('test2.pdf', 1024, 'application/pdf');
      await act(async () => {
        await result.current.uploadDocument(file2, 'minuta-id', 'outorgantes');
      });

      // Error should be cleared
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear the error state', async () => {
      mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Some error' },
      });

      const { result } = renderHook(() => useDocumentUpload());

      const file = createMockFile('test.pdf', 1024, 'application/pdf');
      await act(async () => {
        await result.current.uploadDocument(file, 'minuta-id', 'outorgantes');
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
