/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDocumentPipeline } from './useDocumentPipeline';

// Mock supabase module
const mockFunctionsInvoke = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockFunctionsInvoke(...args),
    },
    from: (...args: any[]) => mockFrom(...args),
  },
}));

describe('useDocumentPipeline - Parallel Worker Pool', () => {
  // Helper to setup mock chain for from().select().eq().in()
  const setupFromMock = (data: any[] | null = [], error: any = null) => {
    const mockIn = vi.fn().mockResolvedValue({ data, error });
    const mockEq = vi.fn().mockReturnValue({ in: mockIn });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });
    return { mockSelect, mockEq, mockIn };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupFromMock();
    mockFunctionsInvoke.mockResolvedValue({ data: {}, error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should start with isProcessing as false', () => {
      const { result } = renderHook(() => useDocumentPipeline());

      expect(result.current.isProcessing).toBe(false);
    });

    it('should start with empty statuses Map', () => {
      const { result } = renderHook(() => useDocumentPipeline());

      expect(result.current.statuses.size).toBe(0);
    });

    it('should start with overallProgress as 0', () => {
      const { result } = renderHook(() => useDocumentPipeline());

      expect(result.current.overallProgress).toBe(0);
    });

    it('should start with 0 active workers', () => {
      const { result } = renderHook(() => useDocumentPipeline());

      expect(result.current.classificationWorkers).toBe(0);
      expect(result.current.extractionWorkers).toBe(0);
      expect(result.current.classificationQueue).toBe(0);
      expect(result.current.extractionQueue).toBe(0);
    });
  });

  describe('parallel classification', () => {
    it('should process multiple documents via startPipeline', async () => {
      const docs = [{ id: 'doc-1' }, { id: 'doc-2' }, { id: 'doc-3' }];
      setupFromMock(docs);

      const onDocumentComplete = vi.fn();

      mockFunctionsInvoke.mockImplementation(async (name: string) => {
        if (name === 'classify-document') {
          return { data: { tipo_documento: 'RG', confianca: 0.95 }, error: null };
        }
        if (name === 'extract-document') {
          return { data: { dados_extraidos: {} }, error: null };
        }
        return { data: {}, error: null };
      });

      const { result } = renderHook(() => useDocumentPipeline({ onDocumentComplete }));

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      await waitFor(() => !result.current.isProcessing, { timeout: 5000 });

      // All 3 documents should have completed
      expect(onDocumentComplete).toHaveBeenCalledTimes(3);
      expect(onDocumentComplete).toHaveBeenCalledWith('doc-1');
      expect(onDocumentComplete).toHaveBeenCalledWith('doc-2');
      expect(onDocumentComplete).toHaveBeenCalledWith('doc-3');
    });

    it('should automatically start extraction after classification completes', async () => {
      const docs = [{ id: 'doc-1' }];
      setupFromMock(docs);

      const onDocumentComplete = vi.fn();

      mockFunctionsInvoke.mockImplementation(async (name: string) => {
        if (name === 'classify-document') {
          return { data: { tipo_documento: 'RG' }, error: null };
        }
        if (name === 'extract-document') {
          return { data: { dados_extraidos: {} }, error: null };
        }
        return { data: {}, error: null };
      });

      const { result } = renderHook(() => useDocumentPipeline({ onDocumentComplete }));

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      await waitFor(() => !result.current.isProcessing, { timeout: 3000 });

      // Document should complete (which means both classify and extract happened)
      expect(onDocumentComplete).toHaveBeenCalledWith('doc-1');

      // Verify both classify and extract were called
      const classifyCalls = mockFunctionsInvoke.mock.calls.filter(
        call => call[0] === 'classify-document'
      );
      const extractCalls = mockFunctionsInvoke.mock.calls.filter(
        call => call[0] === 'extract-document'
      );
      expect(classifyCalls.length).toBe(1);
      expect(extractCalls.length).toBe(1);
    });
  });

  describe('parallel extraction', () => {
    it('should support extraction via processDocument', async () => {
      const { result } = renderHook(() => useDocumentPipeline());

      mockFunctionsInvoke.mockResolvedValue({ data: {}, error: null });

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.processDocument('doc-1');
      });

      // processDocument should complete successfully
      expect(success).toBe(true);

      // Verify extract-document was called
      const extractCalls = mockFunctionsInvoke.mock.calls.filter(
        call => call[0] === 'extract-document'
      );
      expect(extractCalls.length).toBe(1);
    });
  });

  describe('overallProgress calculation', () => {
    it('should start at 0 before processing', () => {
      const { result } = renderHook(() => useDocumentPipeline());
      expect(result.current.overallProgress).toBe(0);
    });

    it('should track progress for processDocument', async () => {
      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.processDocument('doc-1');
      });

      // Status should be 'done' after processDocument
      expect(result.current.statuses.get('doc-1')?.step).toBe('done');
    });
  });

  describe('error handling', () => {
    it('should continue processing other documents when one classification fails', async () => {
      const docs = [{ id: 'doc-1' }, { id: 'doc-2' }, { id: 'doc-3' }];
      setupFromMock(docs);

      const onDocumentComplete = vi.fn();
      const onError = vi.fn();

      mockFunctionsInvoke.mockImplementation(async (name: string, options: any) => {
        if (name === 'classify-document') {
          if (options.body.documento_id === 'doc-2') {
            throw new Error('Classification failed for doc-2');
          }
          return { data: { tipo_documento: 'RG' }, error: null };
        }
        if (name === 'extract-document') {
          return { data: { dados_extraidos: {} }, error: null };
        }
        return { data: {}, error: null };
      });

      const { result } = renderHook(() =>
        useDocumentPipeline({ onDocumentComplete, onError })
      );

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      await waitFor(() => !result.current.isProcessing, { timeout: 3000 });

      // Error should be called for doc-2
      expect(onError).toHaveBeenCalledWith('doc-2', 'Classification failed for doc-2');

      // Other documents should complete successfully
      expect(onDocumentComplete).toHaveBeenCalledWith('doc-1');
      expect(onDocumentComplete).toHaveBeenCalledWith('doc-3');

      // Check statuses
      expect(result.current.statuses.get('doc-1')?.step).toBe('done');
      expect(result.current.statuses.get('doc-2')?.step).toBe('error');
      expect(result.current.statuses.get('doc-3')?.step).toBe('done');
    });

    it('should continue processing when extraction fails', async () => {
      const docs = [{ id: 'doc-1' }, { id: 'doc-2' }];
      setupFromMock(docs);

      const onError = vi.fn();

      mockFunctionsInvoke.mockImplementation(async (name: string, options: any) => {
        if (name === 'classify-document') {
          return { data: { tipo_documento: 'RG' }, error: null };
        }
        if (name === 'extract-document') {
          if (options.body.documento_id === 'doc-1') {
            throw new Error('Extraction failed for doc-1');
          }
          return { data: { dados_extraidos: {} }, error: null };
        }
        return { data: {}, error: null };
      });

      const { result } = renderHook(() =>
        useDocumentPipeline({ onError })
      );

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      // Wait for both documents to reach terminal state
      await waitFor(
        () => {
          const doc1Status = result.current.statuses.get('doc-1')?.step;
          const doc2Status = result.current.statuses.get('doc-2')?.step;
          return (doc1Status === 'error' || doc1Status === 'done') &&
                 (doc2Status === 'error' || doc2Status === 'done');
        },
        { timeout: 5000 }
      );

      expect(onError).toHaveBeenCalledWith('doc-1', 'Extraction failed for doc-1');
      expect(result.current.statuses.get('doc-1')?.step).toBe('error');
      expect(result.current.statuses.get('doc-2')?.step).toBe('done');
    });

    it('should not call map-to-fields when there are errors', async () => {
      const docs = [{ id: 'doc-1' }];
      setupFromMock(docs);

      mockFunctionsInvoke.mockImplementation(async (name: string) => {
        if (name === 'classify-document') {
          throw new Error('Classification failed');
        }
        return { data: {}, error: null };
      });

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      await waitFor(() => !result.current.isProcessing, { timeout: 3000 });

      // map-to-fields should not have been called
      const mapToFieldsCalls = mockFunctionsInvoke.mock.calls.filter(
        call => call[0] === 'map-to-fields'
      );
      expect(mapToFieldsCalls).toHaveLength(0);
    });
  });

  describe('processDocument (single document)', () => {
    it('should still work for processing a single document', async () => {
      const { result } = renderHook(() => useDocumentPipeline());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.processDocument('doc-single');
      });

      expect(success).toBe(true);
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('classify-document', {
        body: { documento_id: 'doc-single' },
      });
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('extract-document', {
        body: { documento_id: 'doc-single' },
      });
    });
  });

  describe('status tracking', () => {
    it('should update statuses during processDocument', async () => {
      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.processDocument('doc-1');
      });

      // Final status should be 'done'
      expect(result.current.statuses.get('doc-1')?.step).toBe('done');
    });

    it('should set error status when processing fails', async () => {
      mockFunctionsInvoke.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.processDocument('doc-1');
      });

      expect(result.current.statuses.get('doc-1')?.step).toBe('error');
    });
  });

  describe('worker metrics', () => {
    it('should expose worker count fields', async () => {
      const { result } = renderHook(() => useDocumentPipeline());

      // Check that worker metrics are exposed
      expect(typeof result.current.classificationWorkers).toBe('number');
      expect(typeof result.current.extractionWorkers).toBe('number');
      expect(typeof result.current.classificationQueue).toBe('number');
      expect(typeof result.current.extractionQueue).toBe('number');
    });
  });

  describe('generateMinuta', () => {
    it('should call generate-minuta edge function', async () => {
      const { result } = renderHook(() => useDocumentPipeline());

      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { success: true, minuta_texto: 'Generated text' },
        error: null,
      });

      let genResult: any;
      await act(async () => {
        genResult = await result.current.generateMinuta('minuta-123', 'VENDA_COMPRA');
      });

      expect(genResult.success).toBe(true);
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('generate-minuta', {
        body: {
          minuta_id: 'minuta-123',
          template_type: 'VENDA_COMPRA',
          template_id: undefined,
        },
      });
    });

    it('should handle generation error', async () => {
      const onGenerationError = vi.fn();
      const { result } = renderHook(() =>
        useDocumentPipeline({ onGenerationError })
      );

      mockFunctionsInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Generation failed' },
      });

      let genResult: any;
      await act(async () => {
        genResult = await result.current.generateMinuta('minuta-123');
      });

      expect(genResult.success).toBe(false);
      expect(genResult.error).toBe('Generation failed');
      expect(onGenerationError).toHaveBeenCalledWith('minuta-123', 'Generation failed');
    });
  });
});
