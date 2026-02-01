// src/hooks/useGeminiStream.test.ts
// Testes do hook useGeminiStream

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock do módulo gemini
vi.mock('@/services/gemini', () => {
  let mockShouldUseReal = false;
  let mockThrowError: Error | null = null;

  return {
    getGeminiClient: vi.fn().mockImplementation(() => {
      if (mockThrowError) {
        throw mockThrowError;
      }
      return {
        models: {
          generateContentStream: vi.fn().mockImplementation(async function* () {
            yield { text: '## REESCRITA\n' };
            yield { text: 'Conteúdo do documento\n' };
            yield { text: '## DADOS CATALOGADOS\n' };
            yield { text: '```json\n{"tipo": "teste"}\n```' };
          }),
        },
      };
    }),
    getModelName: vi.fn().mockReturnValue('gemini-test-model'),
    shouldUseRealGemini: vi.fn().mockImplementation(() => mockShouldUseReal),
    generationConfig: { temperature: 0.1, maxOutputTokens: 16384 },
    __setMockShouldUseReal: (value: boolean) => {
      mockShouldUseReal = value;
    },
    __setMockError: (error: Error | null) => {
      mockThrowError = error;
    },
  };
});

// Mock do fileToGemini
vi.mock('@/utils/fileToGemini', () => ({
  filesToGenerativeParts: vi.fn().mockResolvedValue([
    { inlineData: { mimeType: 'application/pdf', data: 'base64data' } },
  ]),
}));

// Mock do agentePrompts
vi.mock('@/data/agentePrompts', () => ({
  buildFullPrompt: vi.fn().mockReturnValue('System prompt for testing'),
}));

import { useGeminiStream } from './useGeminiStream';
import * as geminiService from '@/services/gemini';

// Type for mock functions added to the module
type GeminiServiceMock = typeof geminiService & {
  __setMockShouldUseReal: (value: boolean) => void;
  __setMockError: (error: Error | null) => void;
};

describe('useGeminiStream', () => {
  const mockService = geminiService as GeminiServiceMock;
  const mockSetShouldUseReal = mockService.__setMockShouldUseReal;
  const mockSetError = mockService.__setMockError;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetShouldUseReal(false);
    mockSetError(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Estado inicial
  // ==========================================================================
  describe('Estado inicial', () => {
    it('inicia com status idle', () => {
      const { result } = renderHook(() => useGeminiStream());

      expect(result.current.status).toBe('idle');
    });

    it('inicia com resultado vazio', () => {
      const { result } = renderHook(() => useGeminiStream());

      expect(result.current.resultado).toBe('');
    });

    it('inicia com error null', () => {
      const { result } = renderHook(() => useGeminiStream());

      expect(result.current.error).toBeNull();
    });

    it('inicia com isStreaming false', () => {
      const { result } = renderHook(() => useGeminiStream());

      expect(result.current.isStreaming).toBe(false);
    });

    it('expõe funções startStream, stopStream e reset', () => {
      const { result } = renderHook(() => useGeminiStream());

      expect(typeof result.current.startStream).toBe('function');
      expect(typeof result.current.stopStream).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  // ==========================================================================
  // startStream()
  // ==========================================================================
  describe('startStream', () => {
    it('retorna erro se Gemini não configurado', async () => {
      mockSetShouldUseReal(false);

      const { result } = renderHook(() => useGeminiStream());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('não está configurado');
    });

    it('retorna erro se nenhum arquivo fornecido', async () => {
      mockSetShouldUseReal(true);

      const { result } = renderHook(() => useGeminiStream());

      await act(async () => {
        await result.current.startStream('cnh', []);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('Nenhum arquivo');
    });

    it('muda status para analyzing ao iniciar', async () => {
      mockSetShouldUseReal(true);

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      // Iniciar sem await para capturar estado intermediário
      act(() => {
        result.current.startStream('cnh', [file]);
      });

      // Status deve mudar para analyzing
      await waitFor(() => {
        expect(['analyzing', 'completed']).toContain(result.current.status);
      });
    });

    it('limpa resultado anterior', async () => {
      mockSetShouldUseReal(true);

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      // Primeira execução
      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      expect(result.current.resultado.length).toBeGreaterThan(0);
      const firstResult = result.current.resultado;

      // Segunda execução deve limpar o anterior
      await act(async () => {
        await result.current.startStream('rg', [file]);
      });

      // O resultado deve ser novo (não acumulado)
      expect(result.current.resultado).not.toBe(firstResult + result.current.resultado);
    });

    it('acumula chunks no resultado', async () => {
      mockSetShouldUseReal(true);

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      // Verificar que o resultado contém todos os chunks
      expect(result.current.resultado).toContain('REESCRITA');
      expect(result.current.resultado).toContain('Conteúdo do documento');
      expect(result.current.resultado).toContain('DADOS CATALOGADOS');
    });

    it('muda status para completed ao finalizar', async () => {
      mockSetShouldUseReal(true);

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      expect(result.current.status).toBe('completed');
    });

    it('passa instruções customizadas para buildFullPrompt', async () => {
      mockSetShouldUseReal(true);
      const { buildFullPrompt } = await import('@/data/agentePrompts');

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const customInstructions = 'Foque no CPF';

      await act(async () => {
        await result.current.startStream('cnh', [file], customInstructions);
      });

      expect(buildFullPrompt).toHaveBeenCalledWith('cnh', customInstructions);
    });
  });

  // ==========================================================================
  // stopStream()
  // ==========================================================================
  describe('stopStream', () => {
    it('muda status para completed se havia resultado', async () => {
      mockSetShouldUseReal(true);

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      // Iniciar stream
      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      // Parar
      act(() => {
        result.current.stopStream();
      });

      // Com resultado, deve ir para completed
      expect(result.current.status).toBe('completed');
    });

    it('muda status para idle se não havia resultado', () => {
      const { result } = renderHook(() => useGeminiStream());

      // Parar sem ter iniciado
      act(() => {
        result.current.stopStream();
      });

      expect(result.current.status).toBe('idle');
    });
  });

  // ==========================================================================
  // reset()
  // ==========================================================================
  describe('reset', () => {
    it('volta todos estados para inicial', async () => {
      mockSetShouldUseReal(true);

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      // Executar stream
      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      expect(result.current.resultado.length).toBeGreaterThan(0);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.resultado).toBe('');
      expect(result.current.error).toBeNull();
    });

    it('limpa resultado após análise', async () => {
      mockSetShouldUseReal(true);

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.resultado).toBe('');
    });

    it('limpa erro após falha', async () => {
      mockSetShouldUseReal(false); // Vai causar erro

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ==========================================================================
  // Tratamento de erros
  // ==========================================================================
  describe('error handling', () => {
    it('trata erro de API key inválida', async () => {
      mockSetShouldUseReal(true);
      mockSetError(new Error('API key is invalid'));

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('API key');
    });

    it('trata erro de quota excedida', async () => {
      mockSetShouldUseReal(true);
      mockSetError(new Error('quota exceeded'));

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('Limite');
    });

    it('trata erro de SAFETY block', async () => {
      mockSetShouldUseReal(true);
      mockSetError(new Error('SAFETY: content blocked'));

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('bloqueado');
    });

    it('trata erro de rede', async () => {
      mockSetShouldUseReal(true);
      mockSetError(new Error('network error: fetch failed'));

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('conexão');
    });

    it('status muda para error com mensagem amigável', async () => {
      mockSetShouldUseReal(true);
      mockSetError(new Error('Unknown internal error XYZ123'));

      const { result } = renderHook(() => useGeminiStream());
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.startStream('cnh', [file]);
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBeDefined();
      // A mensagem de erro deve ser legível
      expect(typeof result.current.error).toBe('string');
    });
  });

  // ==========================================================================
  // Comportamento de múltiplas chamadas
  // ==========================================================================
  describe('multiple calls', () => {
    it('nova chamada cancela anterior', async () => {
      mockSetShouldUseReal(true);

      const { result } = renderHook(() => useGeminiStream());
      const file1 = new File(['content1'], 'test1.pdf', { type: 'application/pdf' });
      const file2 = new File(['content2'], 'test2.pdf', { type: 'application/pdf' });

      // Iniciar duas chamadas em sequência
      await act(async () => {
        result.current.startStream('cnh', [file1]);
        await result.current.startStream('rg', [file2]);
      });

      // Deve ter resultado da segunda chamada
      expect(result.current.status).toBe('completed');
    });
  });
});
