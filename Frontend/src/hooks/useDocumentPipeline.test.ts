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

describe('useDocumentPipeline', () => {
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
  });

  describe('processDocument', () => {
    it('should call classify-document with document_id', async () => {
      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.processDocument('doc-123');
      });

      expect(mockFunctionsInvoke).toHaveBeenCalledWith('classify-document', {
        body: { document_id: 'doc-123' },
      });
    });

    it('should call extract-document after classify-document', async () => {
      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.processDocument('doc-123');
      });

      // Verify order: classify first, then extract
      const calls = mockFunctionsInvoke.mock.calls;
      expect(calls[0][0]).toBe('classify-document');
      expect(calls[1][0]).toBe('extract-document');
      expect(calls[1][1]).toEqual({ body: { document_id: 'doc-123' } });
    });

    it('should update status to classifying at start', async () => {
      // Make classify take time to verify status
      mockFunctionsInvoke.mockImplementation(async (name: string) => {
        if (name === 'classify-document') {
          // Don't resolve immediately
          return new Promise((resolve) => {
            setTimeout(() => resolve({ data: {}, error: null }), 50);
          });
        }
        return { data: {}, error: null };
      });

      const { result } = renderHook(() => useDocumentPipeline());

      // Start processing but don't await
      act(() => {
        result.current.processDocument('doc-123');
      });

      // Check status immediately
      await waitFor(() => {
        expect(result.current.statuses.get('doc-123')?.step).toBe('classifying');
        expect(result.current.statuses.get('doc-123')?.progress).toBe(0);
      });
    });

    it('should update status to extracting after classify', async () => {
      let resolveClassify: (value: any) => void;
      let resolveExtract: (value: any) => void;

      mockFunctionsInvoke.mockImplementation((name: string) => {
        if (name === 'classify-document') {
          return new Promise((resolve) => {
            resolveClassify = resolve;
          });
        }
        if (name === 'extract-document') {
          return new Promise((resolve) => {
            resolveExtract = resolve;
          });
        }
        return Promise.resolve({ data: {}, error: null });
      });

      const { result } = renderHook(() => useDocumentPipeline());

      act(() => {
        result.current.processDocument('doc-123');
      });

      // Resolve classify
      await act(async () => {
        resolveClassify!({ data: {}, error: null });
      });

      await waitFor(() => {
        expect(result.current.statuses.get('doc-123')?.step).toBe('extracting');
        expect(result.current.statuses.get('doc-123')?.progress).toBe(33);
      });

      // Cleanup
      await act(async () => {
        resolveExtract!({ data: {}, error: null });
      });
    });

    it('should update status to done after extract', async () => {
      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.processDocument('doc-123');
      });

      expect(result.current.statuses.get('doc-123')?.step).toBe('done');
      expect(result.current.statuses.get('doc-123')?.progress).toBe(100);
    });

    it('should return true on success', async () => {
      const { result } = renderHook(() => useDocumentPipeline());

      let processResult: boolean | undefined;
      await act(async () => {
        processResult = await result.current.processDocument('doc-123');
      });

      expect(processResult).toBe(true);
    });

    it('should set status to error when classify fails', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Classification failed' },
      });

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        try {
          await result.current.processDocument('doc-123');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.statuses.get('doc-123')?.step).toBe('error');
      expect(result.current.statuses.get('doc-123')?.error).toBe('Classification failed');
    });

    it('should set status to error when extract fails', async () => {
      mockFunctionsInvoke
        .mockResolvedValueOnce({ data: {}, error: null }) // classify succeeds
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Extraction failed' },
        });

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        try {
          await result.current.processDocument('doc-123');
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.statuses.get('doc-123')?.step).toBe('error');
      expect(result.current.statuses.get('doc-123')?.error).toBe('Extraction failed');
    });

    it('should return false on error', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed' },
      });

      const { result } = renderHook(() => useDocumentPipeline());

      let processResult: boolean | undefined;
      await act(async () => {
        processResult = await result.current.processDocument('doc-123');
      });

      expect(processResult).toBe(false);
    });
  });

  describe('startPipeline', () => {
    it('should fetch pending documents for the minuta', async () => {
      const mockIn = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      expect(mockFrom).toHaveBeenCalledWith('documentos');
      expect(mockSelect).toHaveBeenCalledWith('id');
      expect(mockEq).toHaveBeenCalledWith('minuta_id', 'minuta-456');
      expect(mockIn).toHaveBeenCalledWith('status', ['uploaded', 'pendente']);
    });

    it('should set isProcessing to true during pipeline', async () => {
      const mockIn = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ data: [], error: null }), 50);
        });
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useDocumentPipeline());

      act(() => {
        result.current.startPipeline('minuta-456');
      });

      expect(result.current.isProcessing).toBe(true);
    });

    it('should set isProcessing to false after pipeline completes', async () => {
      setupFromMock([]);

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it('should process all pending documents', async () => {
      const mockIn = vi.fn().mockResolvedValue({
        data: [{ id: 'doc-1' }, { id: 'doc-2' }, { id: 'doc-3' }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      // Each document should have classify and extract called
      // 3 docs * 2 calls each + 1 map-to-fields = 7 calls
      expect(mockFunctionsInvoke).toHaveBeenCalledTimes(7);

      // Verify all documents were processed
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('classify-document', {
        body: { document_id: 'doc-1' },
      });
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('classify-document', {
        body: { document_id: 'doc-2' },
      });
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('classify-document', {
        body: { document_id: 'doc-3' },
      });
    });

    it('should call map-to-fields after all documents processed', async () => {
      const mockIn = vi.fn().mockResolvedValue({
        data: [{ id: 'doc-1' }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      // Verify map-to-fields was called last with minuta_id
      const lastCall = mockFunctionsInvoke.mock.calls[mockFunctionsInvoke.mock.calls.length - 1];
      expect(lastCall[0]).toBe('map-to-fields');
      expect(lastCall[1]).toEqual({ body: { minuta_id: 'minuta-456' } });
    });

    it('should update minuta status to revisao after pipeline', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });
      const mockIn = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      mockFrom.mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
      });

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      expect(mockFrom).toHaveBeenCalledWith('minutas');
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'revisao',
        current_step: 'outorgantes',
      });
      expect(mockUpdateEq).toHaveBeenCalledWith('id', 'minuta-456');
    });

    it('should set isProcessing to false even when error occurs', async () => {
      const mockIn = vi.fn().mockRejectedValue(new Error('Database error'));
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        try {
          await result.current.startPipeline('minuta-456');
        } catch {
          // Expected
        }
      });

      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe('overallProgress', () => {
    it('should calculate average progress across all documents', async () => {
      // Test that overallProgress reflects the average of all tracked documents
      // Since documents are processed sequentially, we test with a single document
      // and verify progress updates at each stage
      const mockIn = vi.fn().mockResolvedValue({
        data: [{ id: 'doc-1' }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      let resolveClassify: (value: any) => void;
      let resolveExtract: (value: any) => void;

      mockFunctionsInvoke.mockImplementation((name: string) => {
        if (name === 'classify-document') {
          return new Promise((resolve) => {
            resolveClassify = resolve;
          });
        }
        if (name === 'extract-document') {
          return new Promise((resolve) => {
            resolveExtract = resolve;
          });
        }
        return Promise.resolve({ data: {}, error: null });
      });

      const { result } = renderHook(() => useDocumentPipeline());

      act(() => {
        result.current.startPipeline('minuta-456');
      });

      // Wait for classifying state
      await waitFor(() => {
        return result.current.statuses.get('doc-1')?.step === 'classifying';
      });

      // At classifying: progress should be 0
      expect(result.current.overallProgress).toBe(0);

      // Move to extracting
      await act(async () => {
        resolveClassify!({ data: {}, error: null });
      });

      await waitFor(() => {
        return result.current.statuses.get('doc-1')?.step === 'extracting';
      });

      // At extracting: progress should be 33
      expect(result.current.overallProgress).toBe(33);

      // Cleanup
      await act(async () => {
        resolveExtract!({ data: {}, error: null });
      });
    });

    it('should be 100 when all documents are done', async () => {
      const mockIn = vi.fn().mockResolvedValue({
        data: [{ id: 'doc-1' }, { id: 'doc-2' }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      expect(result.current.overallProgress).toBe(100);
    });
  });

  describe('callbacks', () => {
    it('should call onDocumentComplete when a document finishes', async () => {
      const onDocumentComplete = vi.fn();
      const mockIn = vi.fn().mockResolvedValue({
        data: [{ id: 'doc-1' }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() =>
        useDocumentPipeline({ onDocumentComplete })
      );

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      expect(onDocumentComplete).toHaveBeenCalledWith('doc-1');
    });

    it('should call onPipelineComplete when pipeline finishes', async () => {
      const onPipelineComplete = vi.fn();
      setupFromMock([{ id: 'doc-1' }]);

      const { result } = renderHook(() =>
        useDocumentPipeline({ onPipelineComplete })
      );

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      expect(onPipelineComplete).toHaveBeenCalledWith('minuta-456');
    });

    it('should call onError when document processing fails', async () => {
      const onError = vi.fn();

      const mockIn = vi.fn().mockResolvedValue({
        data: [{ id: 'doc-1' }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      mockFunctionsInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Processing error' },
      });

      const { result } = renderHook(() => useDocumentPipeline({ onError }));

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      expect(onError).toHaveBeenCalledWith('doc-1', 'Processing error');
    });

    it('should not call onPipelineComplete when there are errors', async () => {
      const onPipelineComplete = vi.fn();

      const mockIn = vi.fn().mockResolvedValue({
        data: [{ id: 'doc-1' }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      mockFunctionsInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Failed' },
      });

      const { result } = renderHook(() =>
        useDocumentPipeline({ onPipelineComplete })
      );

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      expect(onPipelineComplete).not.toHaveBeenCalled();
    });
  });

  describe('statuses Map', () => {
    it('should track status for each document independently', async () => {
      let resolveDoc2: (value: any) => void;

      const mockIn = vi.fn().mockResolvedValue({
        data: [{ id: 'doc-1' }, { id: 'doc-2' }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      mockFunctionsInvoke.mockImplementation((name: string, options: any) => {
        if (name === 'classify-document' && options?.body?.document_id === 'doc-2') {
          return new Promise((resolve) => {
            resolveDoc2 = resolve;
          });
        }
        return Promise.resolve({ data: {}, error: null });
      });

      const { result } = renderHook(() => useDocumentPipeline());

      act(() => {
        result.current.startPipeline('minuta-456');
      });

      await waitFor(() => {
        return result.current.statuses.get('doc-1')?.step === 'done';
      });

      // doc-1 should be done, doc-2 should be classifying
      expect(result.current.statuses.get('doc-1')?.step).toBe('done');
      expect(result.current.statuses.get('doc-2')?.step).toBe('classifying');

      // Cleanup
      await act(async () => {
        resolveDoc2!({ data: {}, error: null });
      });
    });

    it('should include documentId in each status', async () => {
      setupFromMock([{ id: 'doc-123' }]);

      const { result } = renderHook(() => useDocumentPipeline());

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      const status = result.current.statuses.get('doc-123');
      expect(status?.documentId).toBe('doc-123');
    });
  });

  describe('edge cases', () => {
    it('should handle empty document list gracefully', async () => {
      const onPipelineComplete = vi.fn();
      setupFromMock([]);

      const { result } = renderHook(() =>
        useDocumentPipeline({ onPipelineComplete })
      );

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      // Should still complete and update minuta
      expect(onPipelineComplete).toHaveBeenCalledWith('minuta-456');
      expect(result.current.isProcessing).toBe(false);
    });

    it('should continue processing other documents when one fails', async () => {
      const onDocumentComplete = vi.fn();
      const onError = vi.fn();

      const mockIn = vi.fn().mockResolvedValue({
        data: [{ id: 'doc-1' }, { id: 'doc-2' }],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      // First doc fails, second succeeds
      mockFunctionsInvoke
        .mockResolvedValueOnce({ data: null, error: { message: 'Doc 1 failed' } })
        .mockResolvedValue({ data: {}, error: null });

      const { result } = renderHook(() =>
        useDocumentPipeline({ onDocumentComplete, onError })
      );

      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      // Error called for doc-1
      expect(onError).toHaveBeenCalledWith('doc-1', 'Doc 1 failed');
      // doc-2 should still complete
      expect(onDocumentComplete).toHaveBeenCalledWith('doc-2');
    });

    it('should handle null data from documentos query', async () => {
      const mockIn = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn().mockReturnValue({ in: mockIn });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({
        select: mockSelect,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useDocumentPipeline());

      // Should not throw
      await act(async () => {
        await result.current.startPipeline('minuta-456');
      });

      expect(result.current.isProcessing).toBe(false);
    });
  });
});
