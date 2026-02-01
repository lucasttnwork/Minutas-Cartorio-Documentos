import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type ProcessingStatus = 'idle' | 'classifying' | 'extracting' | 'mapping' | 'generating' | 'completed' | 'error';

export interface ProcessingState {
  status: ProcessingStatus;
  progress: number;
  error: string | null;
  result: unknown | null;
}

const PROGRESS_MAP: Record<ProcessingStatus, number> = {
  idle: 0,
  classifying: 25,
  extracting: 50,
  mapping: 75,
  generating: 90,
  completed: 100,
  error: 0,
};

export function useDocumentProcessing(documentoId: string | null): {
  state: ProcessingState;
  startProcessing: () => Promise<void>;
  reset: () => void;
} {
  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    error: null,
    result: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);

  const updateStatus = (status: ProcessingStatus, error?: string | null) => {
    setState({
      status,
      progress: PROGRESS_MAP[status],
      error: error ?? null,
      result: status === 'completed' ? {} : null,
    });
  };

  const startProcessing = async () => {
    if (!documentoId) {
      updateStatus('error', 'No document ID provided');
      return;
    }

    // Set initial processing state
    updateStatus('classifying');

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`documento-${documentoId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documentos',
          filter: `id=eq.${documentoId}`,
        },
        (payload) => {
          const newRecord = payload.new as { status: ProcessingStatus; error_message?: string };

          if (newRecord.status === 'error') {
            updateStatus('error', newRecord.error_message);
          } else {
            updateStatus(newRecord.status);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Trigger the processing by updating the documento status
    await supabase
      .from('documentos')
      .update({ status: 'classificando' })
      .eq('id', documentoId)
      .select();
  };

  const reset = () => {
    setState({
      status: 'idle',
      progress: 0,
      error: null,
      result: null,
    });
  };

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    state,
    startProcessing,
    reset,
  };
}
