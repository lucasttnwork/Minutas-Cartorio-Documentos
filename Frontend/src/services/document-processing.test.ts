import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase';
import {
  classifyDocument,
  extractDocument,
  mapToFields,
  generateMinuta,
} from './document-processing';

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('Document Processing Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('classifyDocument', () => {
    it('invokes edge function with correct params', async () => {
      const mockResult = {
        data: { tipo_documento: 'COMPRA_VENDA', confianca: 0.95 },
        error: null,
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResult);

      await classifyDocument('doc-123');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('classify-document', {
        body: { documentoId: 'doc-123' },
      });
    });

    it('returns classification result', async () => {
      const mockResult = {
        data: { tipo_documento: 'COMPRA_VENDA', confianca: 0.95 },
        error: null,
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResult);

      const result = await classifyDocument('doc-123');

      expect(result).toEqual({
        tipo_documento: 'COMPRA_VENDA',
        confianca: 0.95,
      });
    });

    it('throws on function error', async () => {
      const mockError = {
        data: null,
        error: { message: 'Classification failed' },
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockError);

      await expect(classifyDocument('doc-123')).rejects.toThrow(
        'Erro ao classificar documento: Classification failed'
      );
    });
  });

  describe('extractDocument', () => {
    it('invokes edge function with correct params', async () => {
      const mockResult = {
        data: {
          dados_extraidos: { vendedor: 'João Silva' },
          campos_faltantes: [],
        },
        error: null,
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResult);

      await extractDocument('doc-456');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('extract-document', {
        body: { documentoId: 'doc-456' },
      });
    });

    it('returns structured data', async () => {
      const mockResult = {
        data: {
          dados_extraidos: { vendedor: 'João Silva', valor: 100000 },
          campos_faltantes: ['data_escritura'],
        },
        error: null,
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResult);

      const result = await extractDocument('doc-456');

      expect(result).toEqual({
        dados_extraidos: { vendedor: 'João Silva', valor: 100000 },
        campos_faltantes: ['data_escritura'],
      });
    });

    it('throws on function error', async () => {
      const mockError = {
        data: null,
        error: { message: 'Extraction failed' },
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockError);

      await expect(extractDocument('doc-456')).rejects.toThrow(
        'Erro ao extrair documento: Extraction failed'
      );
    });
  });

  describe('mapToFields', () => {
    it('invokes edge function with correct params', async () => {
      const mockResult = {
        data: {
          campos_mapeados: { outorgante: 'João Silva' },
          alertas: [],
        },
        error: null,
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResult);

      await mapToFields('minuta-789');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('map-to-fields', {
        body: { minutaId: 'minuta-789' },
      });
    });

    it('returns mapping result', async () => {
      const mockResult = {
        data: {
          campos_mapeados: { outorgante: 'João Silva', outorgado: 'Maria Santos' },
          alertas: ['Campo CPF não encontrado'],
        },
        error: null,
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResult);

      const result = await mapToFields('minuta-789');

      expect(result).toEqual({
        campos_mapeados: { outorgante: 'João Silva', outorgado: 'Maria Santos' },
        alertas: ['Campo CPF não encontrado'],
      });
    });

    it('throws on function error', async () => {
      const mockError = {
        data: null,
        error: { message: 'Mapping failed' },
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockError);

      await expect(mapToFields('minuta-789')).rejects.toThrow(
        'Erro ao mapear campos: Mapping failed'
      );
    });
  });

  describe('generateMinuta', () => {
    it('invokes edge function with correct params', async () => {
      const mockResult = {
        data: {
          texto_minuta: 'Texto da minuta gerada...',
          versao: 1,
        },
        error: null,
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResult);

      await generateMinuta('minuta-999');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('generate-minuta', {
        body: { minutaId: 'minuta-999' },
      });
    });

    it('returns generation result', async () => {
      const mockResult = {
        data: {
          texto_minuta: 'Texto completo da minuta...',
          versao: 2,
        },
        error: null,
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResult);

      const result = await generateMinuta('minuta-999');

      expect(result).toEqual({
        texto_minuta: 'Texto completo da minuta...',
        versao: 2,
      });
    });

    it('throws on function error', async () => {
      const mockError = {
        data: null,
        error: { message: 'Generation failed' },
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockError);

      await expect(generateMinuta('minuta-999')).rejects.toThrow(
        'Erro ao gerar minuta: Generation failed'
      );
    });
  });
});
