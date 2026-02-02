import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMinutasPadrao } from './useMinutasPadrao';
import { supabase } from '@/lib/supabase';
import type { MinutaPadrao } from '@/types/minutas-padrao';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    auth: {
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockTemplates: MinutaPadrao[] = [
  {
    id: 'global-1',
    user_id: null,
    is_global: true,
    nome: 'Template Global',
    descricao: 'Descrição global',
    tipo_negocio: 'compra_venda',
    storage_path: 'templates/global.pdf',
    nome_original: 'global.pdf',
    mime_type: 'application/pdf',
    tamanho_bytes: 1024,
    thumbnail_path: null,
    uso_count: 10,
    deleted_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-1',
    user_id: 'user-123',
    is_global: false,
    nome: 'Meu Template',
    descricao: 'Minha descrição',
    tipo_negocio: 'doacao',
    storage_path: 'templates/meu.pdf',
    nome_original: 'meu.pdf',
    mime_type: 'application/pdf',
    tamanho_bytes: 2048,
    thumbnail_path: null,
    uso_count: 3,
    deleted_at: null,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

describe('useMinutasPadrao', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadTemplates', () => {
    it('loads all templates (global + user)', async () => {
      const mockOrder2 = vi.fn().mockResolvedValue({ data: mockTemplates, error: null });
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder1 });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });

      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      await act(async () => {
        await result.current.loadTemplates();
      });

      expect(result.current.templates).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('filters templates by tipo_negocio', async () => {
      const filteredTemplates = mockTemplates.filter(t => t.tipo_negocio === 'compra_venda');

      const mockOrder2 = vi.fn().mockResolvedValue({ data: filteredTemplates, error: null });
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder1 });
      const mockEq = vi.fn().mockReturnValue({ is: mockIs });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      await act(async () => {
        await result.current.loadTemplates('compra_venda');
      });

      expect(result.current.templates).toHaveLength(1);
      expect(result.current.templates[0].tipo_negocio).toBe('compra_venda');
    });

    it('excludes soft-deleted templates', async () => {
      const templatesWithDeleted = [
        ...mockTemplates,
        { ...mockTemplates[0], id: 'deleted-1', deleted_at: '2024-01-03T00:00:00Z' },
      ];
      const nonDeletedTemplates = templatesWithDeleted.filter(t => !t.deleted_at);

      const mockOrder2 = vi.fn().mockResolvedValue({ data: nonDeletedTemplates, error: null });
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder1 });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });

      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      await act(async () => {
        await result.current.loadTemplates();
      });

      expect(result.current.templates.every(t => !t.deleted_at)).toBe(true);
    });

    it('sets error state on failure', async () => {
      const mockOrder2 = vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } });
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockIs = vi.fn().mockReturnValue({ order: mockOrder1 });
      const mockSelect = vi.fn().mockReturnValue({ is: mockIs });

      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      await act(async () => {
        await result.current.loadTemplates();
      });

      expect(result.current.error).toBe('Database error');
      expect(result.current.templates).toEqual([]);
    });
  });

  describe('uploadTemplate', () => {
    it('uploads file to storage and creates database record', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockInsertData = {
        nome: 'Novo Template',
        tipo_negocio: 'geral' as const,
        descricao: 'Descrição',
      };

      // Mock auth
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);

      // Mock storage upload
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'user-123/test.pdf' },
        error: null
      });
      vi.mocked(supabase.storage.from).mockReturnValue({ upload: mockUpload } as any);

      // Mock database insert
      const mockSingle = vi.fn().mockResolvedValue({
        data: { ...mockTemplates[1], nome: 'Novo Template' },
        error: null,
      });
      const mockSelectAfterInsert = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelectAfterInsert });
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      let uploadedTemplate: MinutaPadrao | null = null;
      await act(async () => {
        uploadedTemplate = await result.current.uploadTemplate(mockFile, mockInsertData);
      });

      expect(uploadedTemplate).toBeDefined();
      expect(mockUpload).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
    });

    it('validates file type', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      const { result } = renderHook(() => useMinutasPadrao());

      await expect(
        result.current.uploadTemplate(invalidFile, {
          nome: 'Test',
          tipo_negocio: 'geral'
        })
      ).rejects.toThrow(/tipo de arquivo/i);
    });

    it('validates file size (max 50MB)', async () => {
      // Create a mock file with size property
      const largeFile = new File([''], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(largeFile, 'size', { value: 51 * 1024 * 1024 });

      const { result } = renderHook(() => useMinutasPadrao());

      await expect(
        result.current.uploadTemplate(largeFile, {
          nome: 'Test',
          tipo_negocio: 'geral'
        })
      ).rejects.toThrow(/tamanho/i);
    });
  });

  describe('updateTemplate', () => {
    it('updates template metadata', async () => {
      // First mock loadTemplates to populate state with user template
      const mockOrder2Load = vi.fn().mockResolvedValue({ data: [mockTemplates[1]], error: null });
      const mockOrder1Load = vi.fn().mockReturnValue({ order: mockOrder2Load });
      const mockIsLoad = vi.fn().mockReturnValue({ order: mockOrder1Load });
      const mockSelectLoad = vi.fn().mockReturnValue({ is: mockIsLoad });

      vi.mocked(supabase.from).mockReturnValue({ select: mockSelectLoad } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      // Load templates first to populate state
      await act(async () => {
        await result.current.loadTemplates();
      });

      // Now mock update
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any);

      await act(async () => {
        await result.current.updateTemplate('user-1', { nome: 'Nome Atualizado' });
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Nome Atualizado' })
      );
    });

    it('prevents updating global templates', async () => {
      // First mock loadTemplates to populate state with global template
      const mockOrder2Load = vi.fn().mockResolvedValue({ data: mockTemplates, error: null });
      const mockOrder1Load = vi.fn().mockReturnValue({ order: mockOrder2Load });
      const mockIsLoad = vi.fn().mockReturnValue({ order: mockOrder1Load });
      const mockSelectLoad = vi.fn().mockReturnValue({ is: mockIsLoad });

      vi.mocked(supabase.from).mockReturnValue({ select: mockSelectLoad } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      // Load templates first to populate state
      await act(async () => {
        await result.current.loadTemplates();
      });

      await expect(
        result.current.updateTemplate('global-1', { nome: 'Tentativa' })
      ).rejects.toThrow(/globais/i);
    });
  });

  describe('deleteTemplate', () => {
    it('soft deletes template by setting deleted_at', async () => {
      // First mock loadTemplates to populate state with user template
      const mockOrder2Load = vi.fn().mockResolvedValue({ data: [mockTemplates[1]], error: null });
      const mockOrder1Load = vi.fn().mockReturnValue({ order: mockOrder2Load });
      const mockIsLoad = vi.fn().mockReturnValue({ order: mockOrder1Load });
      const mockSelectLoad = vi.fn().mockReturnValue({ is: mockIsLoad });

      vi.mocked(supabase.from).mockReturnValue({ select: mockSelectLoad } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      // Load templates first to populate state
      await act(async () => {
        await result.current.loadTemplates();
      });

      // Now mock update for delete
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any);

      await act(async () => {
        await result.current.deleteTemplate('user-1');
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: expect.any(String) })
      );
    });

    it('prevents deleting global templates', async () => {
      // First mock loadTemplates to populate state with global template
      const mockOrder2Load = vi.fn().mockResolvedValue({ data: mockTemplates, error: null });
      const mockOrder1Load = vi.fn().mockReturnValue({ order: mockOrder2Load });
      const mockIsLoad = vi.fn().mockReturnValue({ order: mockOrder1Load });
      const mockSelectLoad = vi.fn().mockReturnValue({ is: mockIsLoad });

      vi.mocked(supabase.from).mockReturnValue({ select: mockSelectLoad } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      // Load templates first to populate state
      await act(async () => {
        await result.current.loadTemplates();
      });

      await expect(
        result.current.deleteTemplate('global-1')
      ).rejects.toThrow(/globais/i);
    });
  });

  describe('getDownloadUrl', () => {
    it('returns signed URL for storage path', async () => {
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: { signedUrl: 'https://signed-url.com/file.pdf' },
        error: null,
      });
      vi.mocked(supabase.storage.from).mockReturnValue({
        createSignedUrl: mockCreateSignedUrl
      } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      let url: string = '';
      await act(async () => {
        url = await result.current.getDownloadUrl('templates/test.pdf');
      });

      expect(url).toBe('https://signed-url.com/file.pdf');
      expect(mockCreateSignedUrl).toHaveBeenCalledWith('templates/test.pdf', 3600);
    });
  });

  describe('incrementUsage', () => {
    it('increments uso_count via RPC', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ error: null } as any);

      const { result } = renderHook(() => useMinutasPadrao());

      await act(async () => {
        await result.current.incrementUsage('template-1');
      });

      expect(supabase.rpc).toHaveBeenCalledWith('increment_template_usage', { template_id: 'template-1' });
    });
  });
});
