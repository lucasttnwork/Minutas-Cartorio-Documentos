// src/hooks/useAutoSave.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from './useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      expect(result.current.isSaving).toBe(false);
      expect(result.current.lastError).toBeNull();
      expect(result.current.lastSavedAt).toBeNull();
      expect(result.current.hasPendingChanges).toBe(false);
    });
  });

  describe('triggerSave with debounce', () => {
    it('should debounce multiple rapid calls into a single save', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      // Trigger multiple saves rapidly
      act(() => {
        result.current.triggerSave({ data: 1 });
        result.current.triggerSave({ data: 2 });
        result.current.triggerSave({ data: 3 });
      });

      // Advance time but not enough for debounce
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      // Should not have saved yet
      expect(onSave).not.toHaveBeenCalled();

      // Advance past debounce time
      await act(async () => {
        vi.advanceTimersByTime(100);
        // Need to flush promises
        await vi.runAllTimersAsync();
      });

      // Should have saved only once with the last data
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({ data: 3 });
    });

    it('should save after the default delay of 500ms', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      act(() => {
        result.current.triggerSave({ value: 'test' });
      });

      // Advance less than 500ms
      await act(async () => {
        vi.advanceTimersByTime(499);
      });

      expect(onSave).not.toHaveBeenCalled();

      // Advance past 500ms
      await act(async () => {
        vi.advanceTimersByTime(1);
        await vi.runAllTimersAsync();
      });

      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('should respect custom delay', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useAutoSave({ onSave, delay: 1000 })
      );

      act(() => {
        result.current.triggerSave({ value: 'test' });
      });

      // Advance less than 1000ms
      await act(async () => {
        vi.advanceTimersByTime(999);
      });

      expect(onSave).not.toHaveBeenCalled();

      // Advance past 1000ms
      await act(async () => {
        vi.advanceTimersByTime(1);
        await vi.runAllTimersAsync();
      });

      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('should set hasPendingChanges to true when save is triggered', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      expect(result.current.hasPendingChanges).toBe(false);

      act(() => {
        result.current.triggerSave({ value: 'test' });
      });

      expect(result.current.hasPendingChanges).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(500);
        await vi.runAllTimersAsync();
      });

      expect(result.current.hasPendingChanges).toBe(false);
    });
  });

  describe('forceSave', () => {
    it('should save immediately without debounce', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      await act(async () => {
        await result.current.forceSave({ value: 'immediate' });
      });

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({ value: 'immediate' });
    });

    it('should cancel pending debounced saves', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      // Trigger a debounced save
      act(() => {
        result.current.triggerSave({ value: 'debounced' });
      });

      // Force save before debounce completes
      await act(async () => {
        await result.current.forceSave({ value: 'forced' });
      });

      // Advance time past debounce
      await act(async () => {
        vi.advanceTimersByTime(600);
        await vi.runAllTimersAsync();
      });

      // Should have only saved the forced value
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({ value: 'forced' });
    });
  });

  describe('Concurrent saves', () => {
    it('should queue saves if one is already in progress', async () => {
      let resolveFirst: () => void;
      const firstSavePromise = new Promise<void>((resolve) => {
        resolveFirst = resolve;
      });

      const onSave = vi.fn()
        .mockImplementationOnce(() => firstSavePromise)
        .mockResolvedValue(undefined);

      const { result } = renderHook(() => useAutoSave({ onSave }));

      // Start first save
      act(() => {
        result.current.triggerSave({ value: 'first' });
      });

      await act(async () => {
        vi.advanceTimersByTime(500);
        await vi.runAllTimersAsync();
      });

      expect(onSave).toHaveBeenCalledWith({ value: 'first' });
      expect(result.current.isSaving).toBe(true);

      // Trigger second save while first is in progress
      act(() => {
        result.current.triggerSave({ value: 'second' });
      });

      await act(async () => {
        vi.advanceTimersByTime(500);
        await vi.runAllTimersAsync();
      });

      // First save still in progress, second should be queued
      expect(onSave).toHaveBeenCalledTimes(1);

      // Complete first save
      await act(async () => {
        resolveFirst!();
        await vi.runAllTimersAsync();
      });

      // Second save should now execute
      expect(onSave).toHaveBeenCalledTimes(2);
      expect(onSave).toHaveBeenLastCalledWith({ value: 'second' });
    });
  });

  describe('isSaving state', () => {
    it('should be true while saving', async () => {
      let resolveSave: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });

      const onSave = vi.fn().mockReturnValue(savePromise);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      expect(result.current.isSaving).toBe(false);

      await act(async () => {
        result.current.forceSave({ value: 'test' });
      });

      expect(result.current.isSaving).toBe(true);

      await act(async () => {
        resolveSave!();
        await vi.runAllTimersAsync();
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('lastSavedAt', () => {
    it('should update after successful save', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      expect(result.current.lastSavedAt).toBeNull();

      const beforeSave = new Date();

      await act(async () => {
        await result.current.forceSave({ value: 'test' });
      });

      expect(result.current.lastSavedAt).not.toBeNull();
      expect(result.current.lastSavedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeSave.getTime()
      );
    });

    it('should not update after failed save', async () => {
      const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      const { result } = renderHook(() => useAutoSave({ onSave }));

      expect(result.current.lastSavedAt).toBeNull();

      await act(async () => {
        await result.current.forceSave({ value: 'test' });
      });

      expect(result.current.lastSavedAt).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should set lastError on save failure', async () => {
      const error = new Error('Save failed');
      const onSave = vi.fn().mockRejectedValue(error);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      expect(result.current.lastError).toBeNull();

      await act(async () => {
        await result.current.forceSave({ value: 'test' });
      });

      expect(result.current.lastError).toEqual(error);
    });

    it('should call onError callback on failure', async () => {
      const error = new Error('Save failed');
      const onSave = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useAutoSave({ onSave, onError })
      );

      await act(async () => {
        await result.current.forceSave({ value: 'test' });
      });

      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should convert non-Error objects to Error', async () => {
      const onSave = vi.fn().mockRejectedValue('string error');
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useAutoSave({ onSave, onError })
      );

      await act(async () => {
        await result.current.forceSave({ value: 'test' });
      });

      expect(result.current.lastError).toBeInstanceOf(Error);
      expect(result.current.lastError?.message).toBe('string error');
    });

    it('should clear lastError on successful save after failure', async () => {
      const onSave = vi.fn()
        .mockRejectedValueOnce(new Error('First save failed'))
        .mockResolvedValue(undefined);

      const { result } = renderHook(() => useAutoSave({ onSave }));

      // First save - fails
      await act(async () => {
        await result.current.forceSave({ value: 'test' });
      });

      expect(result.current.lastError).not.toBeNull();

      // Second save - succeeds
      await act(async () => {
        await result.current.forceSave({ value: 'test2' });
      });

      expect(result.current.lastError).toBeNull();
    });
  });

  describe('disabled option', () => {
    it('should not save when disabled is true', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useAutoSave({ onSave, disabled: true })
      );

      act(() => {
        result.current.triggerSave({ value: 'test' });
      });

      await act(async () => {
        vi.advanceTimersByTime(600);
        await vi.runAllTimersAsync();
      });

      expect(onSave).not.toHaveBeenCalled();
    });

    it('should not force save when disabled is true', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useAutoSave({ onSave, disabled: true })
      );

      await act(async () => {
        await result.current.forceSave({ value: 'test' });
      });

      expect(onSave).not.toHaveBeenCalled();
    });

    it('should not set hasPendingChanges when disabled', () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useAutoSave({ onSave, disabled: true })
      );

      act(() => {
        result.current.triggerSave({ value: 'test' });
      });

      expect(result.current.hasPendingChanges).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should cancel pending debounced saves', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      act(() => {
        result.current.triggerSave({ value: 'test' });
      });

      expect(result.current.hasPendingChanges).toBe(true);

      act(() => {
        result.current.cancel();
      });

      expect(result.current.hasPendingChanges).toBe(false);

      await act(async () => {
        vi.advanceTimersByTime(600);
        await vi.runAllTimersAsync();
      });

      expect(onSave).not.toHaveBeenCalled();
    });

    it('should clear pending data queue', async () => {
      let resolveSave: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });

      const onSave = vi.fn().mockReturnValue(savePromise);
      const { result } = renderHook(() => useAutoSave({ onSave }));

      // Start a save
      await act(async () => {
        result.current.forceSave({ value: 'first' });
      });

      // Queue another save while first is in progress
      act(() => {
        result.current.triggerSave({ value: 'second' });
      });

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Cancel should clear the queue
      act(() => {
        result.current.cancel();
      });

      // Complete first save
      await act(async () => {
        resolveSave!();
        await vi.runAllTimersAsync();
      });

      // Only first save should have been called
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith({ value: 'first' });
    });
  });

  describe('Cleanup on unmount', () => {
    it('should clear timeout on unmount', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result, unmount } = renderHook(() => useAutoSave({ onSave }));

      act(() => {
        result.current.triggerSave({ value: 'test' });
      });

      unmount();

      await act(async () => {
        vi.advanceTimersByTime(600);
        await vi.runAllTimersAsync();
      });

      expect(onSave).not.toHaveBeenCalled();
    });
  });
});
