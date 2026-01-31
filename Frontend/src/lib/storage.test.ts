// src/lib/storage.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateUniqueFileName,
  validateFileType,
  validateFileSize,
  uploadFile,
  uploadFiles,
  deleteFile,
  deleteFiles,
  getPublicUrl,
  ALLOWED_DOCUMENT_TYPES,
  MAX_FILE_SIZE_MB,
} from './storage';
import { supabase } from './supabase';

// Mock supabase
vi.mock('./supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}));

describe('Storage Utilities', () => {
  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  describe('generateUniqueFileName', () => {
    it('should generate unique filename with timestamp and random string', () => {
      const original = 'document.pdf';
      const unique1 = generateUniqueFileName(original);
      const unique2 = generateUniqueFileName(original);

      expect(unique1).toMatch(/document_\d+_[a-z0-9]+\.pdf/);
      expect(unique2).toMatch(/document_\d+_[a-z0-9]+\.pdf/);
      expect(unique1).not.toBe(unique2);
    });

    it('should sanitize filename special characters', () => {
      const original = 'my-document with spaces!@#.pdf';
      const unique = generateUniqueFileName(original);

      expect(unique).toMatch(/my_document_with_spaces____\d+_[a-z0-9]+\.pdf/);
    });

    it('should preserve file extension', () => {
      const extensions = ['pdf', 'jpg', 'docx', 'png'];

      extensions.forEach(ext => {
        const original = `file.${ext}`;
        const unique = generateUniqueFileName(original);
        expect(unique).toMatch(new RegExp(`\\.${ext}$`));
      });
    });
  });

  describe('validateFileType', () => {
    it('should validate exact file type match', () => {
      const pdfFile = createMockFile('doc.pdf', 1024, 'application/pdf');

      expect(validateFileType(pdfFile, ['application/pdf'])).toBe(true);
      expect(validateFileType(pdfFile, ['image/jpeg'])).toBe(false);
    });

    it('should validate wildcard type match', () => {
      const jpegFile = createMockFile('photo.jpg', 1024, 'image/jpeg');
      const pngFile = createMockFile('photo.png', 1024, 'image/png');

      expect(validateFileType(jpegFile, ['image/*'])).toBe(true);
      expect(validateFileType(pngFile, ['image/*'])).toBe(true);
      expect(validateFileType(jpegFile, ['application/*'])).toBe(false);
    });

    it('should validate against multiple allowed types', () => {
      const pdfFile = createMockFile('doc.pdf', 1024, 'application/pdf');
      const jpgFile = createMockFile('photo.jpg', 1024, 'image/jpeg');

      expect(validateFileType(pdfFile, ALLOWED_DOCUMENT_TYPES)).toBe(true);
      expect(validateFileType(jpgFile, ALLOWED_DOCUMENT_TYPES)).toBe(true);
    });

    it('should reject invalid types', () => {
      const textFile = createMockFile('data.txt', 1024, 'text/plain');
      const excelFile = createMockFile('data.xlsx', 1024, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      expect(validateFileType(textFile, ALLOWED_DOCUMENT_TYPES)).toBe(false);
      expect(validateFileType(excelFile, ALLOWED_DOCUMENT_TYPES)).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should accept files within size limit', () => {
      const smallFile = createMockFile('small.pdf', 1024 * 1024 * 2, 'application/pdf'); // 2MB

      expect(validateFileSize(smallFile, MAX_FILE_SIZE_MB)).toBe(true);
    });

    it('should reject files exceeding size limit', () => {
      const largeFile = createMockFile('large.pdf', 1024 * 1024 * 15, 'application/pdf'); // 15MB

      expect(validateFileSize(largeFile, MAX_FILE_SIZE_MB)).toBe(false);
    });

    it('should accept files at exact size limit', () => {
      const exactFile = createMockFile('exact.pdf', 1024 * 1024 * 10, 'application/pdf'); // 10MB

      expect(validateFileSize(exactFile, 10)).toBe(true);
    });

    it('should handle different size limits', () => {
      const file = createMockFile('file.pdf', 1024 * 1024 * 5, 'application/pdf'); // 5MB

      expect(validateFileSize(file, 3)).toBe(false);
      expect(validateFileSize(file, 5)).toBe(true);
      expect(validateFileSize(file, 10)).toBe(true);
    });
  });

  describe('uploadFile', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should upload file successfully', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'test-path/file.pdf' },
        error: null,
      });

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/file.pdf' },
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      } as any);

      const file = createMockFile('document.pdf', 1024, 'application/pdf');
      const result = await uploadFile(file);

      expect(result).toEqual({
        url: 'https://example.com/file.pdf',
        path: 'test-path/file.pdf',
      });
    });

    it('should call progress callback during upload', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'test-path/file.pdf' },
        error: null,
      });

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/file.pdf' },
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      } as any);

      const file = createMockFile('document.pdf', 1024, 'application/pdf');
      const onProgress = vi.fn();

      await uploadFile(file, undefined, onProgress);

      expect(onProgress).toHaveBeenCalledWith({ loaded: 0, total: 1024, percentage: 0 });
      expect(onProgress).toHaveBeenCalledWith({ loaded: 1024, total: 1024, percentage: 100 });
    });

    it('should throw error on upload failure', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
      } as any);

      const file = createMockFile('document.pdf', 1024, 'application/pdf');

      await expect(uploadFile(file)).rejects.toThrow('Erro ao fazer upload do arquivo: Upload failed');
    });
  });

  describe('uploadFiles', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should upload multiple files successfully', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'test-path/file.pdf' },
        error: null,
      });

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/file.pdf' },
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      } as any);

      const files = [
        createMockFile('doc1.pdf', 1024, 'application/pdf'),
        createMockFile('doc2.pdf', 2048, 'application/pdf'),
      ];

      const results = await uploadFiles(files);

      expect(results).toHaveLength(2);
      expect(mockUpload).toHaveBeenCalledTimes(2);
    });

    it('should call progress callback for each file', async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'test-path/file.pdf' },
        error: null,
      });

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/file.pdf' },
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      } as any);

      const files = [
        createMockFile('doc1.pdf', 1024, 'application/pdf'),
        createMockFile('doc2.pdf', 2048, 'application/pdf'),
      ];

      const onProgress = vi.fn();
      await uploadFiles(files, undefined, onProgress);

      // Should be called for each file (start and end)
      expect(onProgress).toHaveBeenCalledWith(0, { loaded: 0, total: 1024, percentage: 0 });
      expect(onProgress).toHaveBeenCalledWith(0, { loaded: 1024, total: 1024, percentage: 100 });
      expect(onProgress).toHaveBeenCalledWith(1, { loaded: 0, total: 2048, percentage: 0 });
      expect(onProgress).toHaveBeenCalledWith(1, { loaded: 2048, total: 2048, percentage: 100 });
    });
  });

  describe('deleteFile', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should delete file successfully', async () => {
      const mockRemove = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        remove: mockRemove,
      } as any);

      await deleteFile('test-path/file.pdf');

      expect(mockRemove).toHaveBeenCalledWith(['test-path/file.pdf']);
    });

    it('should throw error on delete failure', async () => {
      const mockRemove = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' },
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        remove: mockRemove,
      } as any);

      await expect(deleteFile('test-path/file.pdf')).rejects.toThrow('Erro ao remover arquivo: Delete failed');
    });
  });

  describe('deleteFiles', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should delete multiple files successfully', async () => {
      const mockRemove = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        remove: mockRemove,
      } as any);

      const paths = ['path1/file1.pdf', 'path2/file2.pdf'];
      await deleteFiles(paths);

      expect(mockRemove).toHaveBeenCalledWith(paths);
    });
  });

  describe('getPublicUrl', () => {
    it('should return public URL for file', () => {
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/file.pdf' },
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        getPublicUrl: mockGetPublicUrl,
      } as any);

      const url = getPublicUrl('test-path/file.pdf');

      expect(url).toBe('https://example.com/file.pdf');
      expect(mockGetPublicUrl).toHaveBeenCalledWith('test-path/file.pdf');
    });
  });
});
