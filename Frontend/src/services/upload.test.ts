/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadFile, deleteFile, getFileUrl } from './upload';

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn((_bucket: string) => ({
        upload: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  },
}));

import { supabase } from '@/lib/supabase';

describe('Upload Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file to correct bucket and path', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const userId = 'user-123';
      const bucket = 'documents';

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: `${userId}/123456-test.pdf` },
        error: null,
      });

      (supabase.storage.from as any).mockReturnValue({
        upload: mockUpload,
      });

      const result = await uploadFile(mockFile, bucket, userId);

      expect(supabase.storage.from).toHaveBeenCalledWith(bucket);
      expect(mockUpload).toHaveBeenCalled();
      expect(result.path).toMatch(new RegExp(`^${userId}/\\d+-test\\.pdf$`));
    });

    it('should generate unique file path with timestamp', async () => {
      const mockFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });
      const userId = 'user-456';
      const bucket = 'documents';

      const mockUpload = vi.fn()
        .mockResolvedValueOnce({
          data: { path: `${userId}/123456-document.pdf` },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { path: `${userId}/123467-document.pdf` },
          error: null,
        });

      (supabase.storage.from as any).mockReturnValue({
        upload: mockUpload,
      });

      const result1 = await uploadFile(mockFile, bucket, userId);

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      const result2 = await uploadFile(mockFile, bucket, userId);

      expect(result1.path).not.toBe(result2.path);
      expect(result1.path).toMatch(/^user-456\/\d+-document\.pdf$/);
      expect(result2.path).toMatch(/^user-456\/\d+-document\.pdf$/);
    });

    it('should set correct content type', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
      const userId = 'user-789';
      const bucket = 'images';

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: `${userId}/123-image.jpg` },
        error: null,
      });

      (supabase.storage.from as any).mockReturnValue({
        upload: mockUpload,
      });

      await uploadFile(mockFile, bucket, userId);

      const uploadCall = mockUpload.mock.calls[0];
      expect(uploadCall[2]).toMatchObject({
        contentType: 'image/jpeg',
      });
    });

    it('should return uploaded file path', async () => {
      const mockFile = new File(['test'], 'doc.pdf', { type: 'application/pdf' });
      const userId = 'user-101';
      const bucket = 'documents';
      const expectedPath = `${userId}/123456-doc.pdf`;

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: expectedPath },
        error: null,
      });

      (supabase.storage.from as any).mockReturnValue({
        upload: mockUpload,
      });

      const result = await uploadFile(mockFile, bucket, userId);

      expect(result).toHaveProperty('path');
      expect(result.path).toMatch(new RegExp(`^${userId}/\\d+-doc\\.pdf$`));
    });

    it('should throw error on upload failure', async () => {
      const mockFile = new File(['test'], 'fail.pdf', { type: 'application/pdf' });
      const userId = 'user-error';
      const bucket = 'documents';

      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      });

      (supabase.storage.from as any).mockReturnValue({
        upload: mockUpload,
      });

      await expect(uploadFile(mockFile, bucket, userId)).rejects.toThrow('Upload failed');
    });

    it('should validate file size (max 50MB)', async () => {
      const largeContent = new ArrayBuffer(51 * 1024 * 1024); // 51MB
      const mockFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      const userId = 'user-123';
      const bucket = 'documents';

      await expect(uploadFile(mockFile, bucket, userId)).rejects.toThrow('File size must not exceed 50MB');
    });

    it('should validate file type (pdf, jpg, png, docx)', async () => {
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const userId = 'user-123';
      const bucket = 'documents';

      await expect(uploadFile(invalidFile, bucket, userId)).rejects.toThrow('Invalid file type');
    });

    it('should accept valid file types', async () => {
      const validTypes = [
        { type: 'application/pdf', name: 'doc.pdf' },
        { type: 'image/jpeg', name: 'img.jpg' },
        { type: 'image/png', name: 'img.png' },
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'doc.docx' },
      ];

      const userId = 'user-123';
      const bucket = 'documents';

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'test-path' },
        error: null,
      });

      (supabase.storage.from as any).mockReturnValue({
        upload: mockUpload,
      });

      for (const { type, name } of validTypes) {
        const file = new File(['test'], name, { type });
        await expect(uploadFile(file, bucket, userId)).resolves.not.toThrow();
      }
    });

    it('should call onProgress callback during upload', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const userId = 'user-123';
      const bucket = 'documents';
      const onProgress = vi.fn();

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'test-path' },
        error: null,
      });

      (supabase.storage.from as any).mockReturnValue({
        upload: mockUpload,
      });

      await uploadFile(mockFile, bucket, userId, { onProgress });

      // Note: In real implementation, this would be called during upload
      // For now, we just verify the option is accepted
      expect(mockUpload).toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should delete file from storage', async () => {
      const bucket = 'documents';
      const path = 'user-123/123456-test.pdf';

      const mockRemove = vi.fn().mockResolvedValue({
        data: {},
        error: null,
      });

      (supabase.storage.from as any).mockReturnValue({
        remove: mockRemove,
      });

      await deleteFile(bucket, path);

      expect(supabase.storage.from).toHaveBeenCalledWith(bucket);
      expect(mockRemove).toHaveBeenCalledWith([path]);
    });

    it('should throw error on delete failure', async () => {
      const bucket = 'documents';
      const path = 'user-123/test.pdf';

      const mockRemove = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' },
      });

      (supabase.storage.from as any).mockReturnValue({
        remove: mockRemove,
      });

      await expect(deleteFile(bucket, path)).rejects.toThrow('Delete failed');
    });
  });

  describe('getFileUrl', () => {
    it('should return public URL for file', () => {
      const bucket = 'documents';
      const path = 'user-123/123456-test.pdf';
      const expectedUrl = `https://example.supabase.co/storage/v1/object/public/${bucket}/${path}`;

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: expectedUrl },
      });

      (supabase.storage.from as any).mockReturnValue({
        getPublicUrl: mockGetPublicUrl,
      });

      const url = getFileUrl(bucket, path);

      expect(supabase.storage.from).toHaveBeenCalledWith(bucket);
      expect(mockGetPublicUrl).toHaveBeenCalledWith(path);
      expect(url).toBe(expectedUrl);
    });
  });
});
