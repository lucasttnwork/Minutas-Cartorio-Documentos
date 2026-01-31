import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAutoSaveOptions<T> {
  /** Debounce delay in ms (default: 500) */
  delay?: number;
  /** Callback executado quando save ocorre */
  onSave: (data: T) => Promise<void>;
  /** Callback executado em caso de erro */
  onError?: (error: Error) => void;
  /** Se true, desabilita auto-save */
  disabled?: boolean;
}

interface UseAutoSaveReturn<T> {
  /** Triggera um save (será debounced) */
  triggerSave: (data: T) => void;
  /** Força um save imediato (sem debounce) */
  forceSave: (data: T) => Promise<void>;
  /** True enquanto está salvando */
  isSaving: boolean;
  /** Último erro ocorrido */
  lastError: Error | null;
  /** Timestamp do último save bem-sucedido */
  lastSavedAt: Date | null;
  /** True se há dados pendentes para salvar */
  hasPendingChanges: boolean;
  /** Cancela pending saves */
  cancel: () => void;
}

export function useAutoSave<T>(options: UseAutoSaveOptions<T>): UseAutoSaveReturn<T> {
  const { delay = 500, onSave, onError, disabled = false } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDataRef = useRef<T | null>(null);
  const savingRef = useRef(false);

  // Limpar timeout no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const executeSave = useCallback(
    async (data: T) => {
      if (disabled || savingRef.current) {
        // Se já está salvando, guardar para depois
        pendingDataRef.current = data;
        return;
      }

      savingRef.current = true;
      setIsSaving(true);
      setLastError(null);

      let currentData: T | null = data;

      // Process current data and any pending data in a loop (avoids recursion)
      while (currentData !== null) {
        try {
          await onSave(currentData);
          setLastSavedAt(new Date());
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setLastError(error);
          onError?.(error);
        }

        // Check for pending data that arrived during the save
        if (pendingDataRef.current) {
          currentData = pendingDataRef.current;
          pendingDataRef.current = null;
          // Reset saving flag temporarily to allow the next iteration
          savingRef.current = false;
          savingRef.current = true;
        } else {
          currentData = null;
        }
      }

      savingRef.current = false;
      setIsSaving(false);
      setHasPendingChanges(false);
    },
    [onSave, onError, disabled]
  );

  const triggerSave = useCallback(
    (data: T) => {
      if (disabled) return;

      setHasPendingChanges(true);

      // Cancelar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Agendar novo save
      timeoutRef.current = setTimeout(() => {
        executeSave(data);
      }, delay);
    },
    [delay, executeSave, disabled]
  );

  const forceSave = useCallback(
    async (data: T) => {
      if (disabled) return;

      // Cancelar qualquer save pendente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      await executeSave(data);
    },
    [executeSave, disabled]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingDataRef.current = null;
    setHasPendingChanges(false);
  }, []);

  return {
    triggerSave,
    forceSave,
    isSaving,
    lastError,
    lastSavedAt,
    hasPendingChanges,
    cancel,
  };
}
