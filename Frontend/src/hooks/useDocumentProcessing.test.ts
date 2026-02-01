/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDocumentProcessing } from './useDocumentProcessing';
import { supabase } from '@/lib/supabase';

// Mock the supabase module
vi.mock('@/lib/supabase', () => {
  const mockOn = vi.fn();
  const mockSubscribe = vi.fn();
  const mockUnsubscribe = vi.fn();

  return {
    supabase: {
      channel: vi.fn(() => ({
        on: mockOn.mockReturnThis(),
        subscribe: mockSubscribe.mockReturnValue({
          unsubscribe: mockUnsubscribe,
        }),
      })),
      from: vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    },
  };
});

describe('useDocumentProcessing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with idle status', () => {
    const { result } = renderHook(() => useDocumentProcessing('doc-123'));

    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.progress).toBe(0);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.result).toBeNull();
  });

  it('should set status to processing when startProcessing called', async () => {
    const { result } = renderHook(() => useDocumentProcessing('doc-123'));

    await act(async () => {
      await result.current.startProcessing();
    });

    expect(result.current.state.status).toBe('classifying');
    expect(result.current.state.progress).toBe(25);
  });

  it('should subscribe to realtime updates on start', async () => {
    const { result } = renderHook(() => useDocumentProcessing('doc-123'));

    await act(async () => {
      await result.current.startProcessing();
    });

    expect(supabase.channel).toHaveBeenCalledWith('documento-doc-123');
    const channelInstance = (supabase.channel as any).mock.results[0].value;
    expect(channelInstance.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: 'UPDATE',
        schema: 'public',
        table: 'documentos',
        filter: 'id=eq.doc-123',
      }),
      expect.any(Function)
    );
    expect(channelInstance.subscribe).toHaveBeenCalled();
  });

  it('should update status when realtime event received', async () => {
    let realtimeCallback: any;

    const mockChannel = {
      on: vi.fn((event, config, callback) => {
        realtimeCallback = callback;
        return mockChannel;
      }),
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    const { result } = renderHook(() => useDocumentProcessing('doc-123'));

    await act(async () => {
      await result.current.startProcessing();
    });

    // Simulate realtime update
    await act(async () => {
      realtimeCallback({
        new: { status: 'extracting' },
      });
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('extracting');
      expect(result.current.state.progress).toBe(50);
    });
  });

  it('should unsubscribe on unmount', async () => {
    const mockUnsubscribe = vi.fn();
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(() => ({
        unsubscribe: mockUnsubscribe,
      })),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    const { result, unmount } = renderHook(() => useDocumentProcessing('doc-123'));

    await act(async () => {
      await result.current.startProcessing();
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle processing errors and set error status', async () => {
    let realtimeCallback: any;

    const mockChannel = {
      on: vi.fn((event, config, callback) => {
        realtimeCallback = callback;
        return mockChannel;
      }),
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    const { result } = renderHook(() => useDocumentProcessing('doc-123'));

    await act(async () => {
      await result.current.startProcessing();
    });

    // Simulate error update
    await act(async () => {
      realtimeCallback({
        new: {
          status: 'error',
          error_message: 'Processing failed'
        },
      });
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
      expect(result.current.state.error).toBe('Processing failed');
    });
  });

  it('should provide progress percentage based on step', async () => {
    const progressMap = {
      'idle': 0,
      'classifying': 25,
      'extracting': 50,
      'mapping': 75,
      'generating': 90,
      'completed': 100,
    };

    let realtimeCallback: any;

    const mockChannel = {
      on: vi.fn((event, config, callback) => {
        realtimeCallback = callback;
        return mockChannel;
      }),
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    const { result } = renderHook(() => useDocumentProcessing('doc-123'));

    await act(async () => {
      await result.current.startProcessing();
    });

    for (const [status, expectedProgress] of Object.entries(progressMap)) {
      if (status === 'idle') continue; // Skip idle as it's the initial state

      await act(async () => {
        realtimeCallback({
          new: { status },
        });
      });

      await waitFor(() => {
        expect(result.current.state.progress).toBe(expectedProgress);
      });
    }
  });

  it('should reset to idle when reset called', async () => {
    let realtimeCallback: any;

    const mockChannel = {
      on: vi.fn((event, config, callback) => {
        realtimeCallback = callback;
        return mockChannel;
      }),
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    const { result } = renderHook(() => useDocumentProcessing('doc-123'));

    await act(async () => {
      await result.current.startProcessing();
    });

    await act(async () => {
      realtimeCallback({
        new: { status: 'extracting' },
      });
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('extracting');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.progress).toBe(0);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.result).toBeNull();
  });
});
