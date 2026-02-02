import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWorkerPool } from './useWorkerPool';

describe('useWorkerPool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should respect maximum workers limit', async () => {
    let activeCount = 0;
    let maxConcurrent = 0;

    const processor = vi.fn(async (input: number) => {
      activeCount++;
      maxConcurrent = Math.max(maxConcurrent, activeCount);

      // Simulate work
      await new Promise((resolve) => setTimeout(resolve, 50));

      activeCount--;
      return input * 2;
    });

    const { result } = renderHook(() =>
      useWorkerPool({
        maxWorkers: 2,
        processor,
      })
    );

    // Add 5 tasks
    result.current.addTasks([
      { id: '1', input: 1 },
      { id: '2', input: 2 },
      { id: '3', input: 3 },
      { id: '4', input: 4 },
      { id: '5', input: 5 },
    ]);

    // Wait for all tasks to complete
    await waitFor(
      () => {
        expect(result.current.completedCount).toBe(5);
      },
      { timeout: 500 }
    );

    // Verify max concurrent workers never exceeded 2
    expect(maxConcurrent).toBeLessThanOrEqual(2);
    expect(processor).toHaveBeenCalledTimes(5);
  });

  it('should queue tasks correctly', async () => {
    const processor = vi.fn(async (input: number) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return input * 2;
    });

    const { result } = renderHook(() =>
      useWorkerPool({
        maxWorkers: 1,
        processor,
      })
    );

    // Add task individually
    result.current.addTask('1', 10);

    await waitFor(() => {
      expect(result.current.tasks.size).toBe(1);
    });

    // Add multiple tasks
    result.current.addTasks([
      { id: '2', input: 20 },
      { id: '3', input: 30 },
    ]);

    await waitFor(() => {
      expect(result.current.tasks.size).toBe(3);
    });

    // Wait for all to complete
    await waitFor(
      () => {
        expect(result.current.completedCount).toBe(3);
      },
      { timeout: 200 }
    );

    expect(result.current.queuedCount).toBe(0);
  });

  it('should call onTaskComplete callback', async () => {
    const onTaskComplete = vi.fn();
    const processor = vi.fn(async (input: number) => input * 2);

    const { result } = renderHook(() =>
      useWorkerPool({
        maxWorkers: 2,
        processor,
        onTaskComplete,
      })
    );

    result.current.addTask('test', 5);

    await waitFor(() => {
      expect(onTaskComplete).toHaveBeenCalled();
    });

    expect(onTaskComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test',
        status: 'completed',
        output: 10,
      })
    );
  });

  it('should call onTaskError callback on failure', async () => {
    const onTaskError = vi.fn();
    const testError = new Error('Processing failed');
    const processor = vi.fn(async () => {
      throw testError;
    });

    const { result } = renderHook(() =>
      useWorkerPool({
        maxWorkers: 1,
        processor,
        onTaskError,
      })
    );

    result.current.addTask('error-task', 123);

    await waitFor(() => {
      expect(onTaskError).toHaveBeenCalled();
    });

    expect(onTaskError).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'error-task',
        status: 'failed',
        error: 'Processing failed',
      }),
      testError
    );
  });

  it('should calculate progress correctly', async () => {
    const processor = vi.fn(async (input: number) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return input * 2;
    });

    const { result } = renderHook(() =>
      useWorkerPool({
        maxWorkers: 2,
        processor,
      })
    );

    // Add 4 tasks
    result.current.addTasks([
      { id: '1', input: 1 },
      { id: '2', input: 2 },
      { id: '3', input: 3 },
      { id: '4', input: 4 },
    ]);

    // Progress should be 0 initially
    expect(result.current.progress).toBe(0);

    // Wait for some to complete
    await waitFor(
      () => {
        expect(result.current.completedCount).toBeGreaterThan(0);
      },
      { timeout: 100 }
    );

    // Progress should increase
    expect(result.current.progress).toBeGreaterThan(0);
    expect(result.current.progress).toBeLessThanOrEqual(100);

    // Wait for all to complete
    await waitFor(
      () => {
        expect(result.current.completedCount).toBe(4);
      },
      { timeout: 200 }
    );

    // Progress should be 100%
    expect(result.current.progress).toBe(100);
  });

  it('should continue processing when errors occur', async () => {
    let callCount = 0;
    const processor = vi.fn(async (input: number) => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 20));

      // Fail on second task
      if (callCount === 2) {
        throw new Error('Task 2 failed');
      }

      return input * 2;
    });

    const { result } = renderHook(() =>
      useWorkerPool({
        maxWorkers: 1,
        processor,
      })
    );

    result.current.addTasks([
      { id: '1', input: 1 },
      { id: '2', input: 2 },
      { id: '3', input: 3 },
    ]);

    await waitFor(
      () => {
        expect(result.current.completedCount + result.current.failedCount).toBe(
          3
        );
      },
      { timeout: 200 }
    );

    expect(result.current.completedCount).toBe(2);
    expect(result.current.failedCount).toBe(1);
    expect(processor).toHaveBeenCalledTimes(3);

    // Verify the failed task
    const failedTask = Array.from(result.current.tasks.values()).find(
      (t) => t.status === 'failed'
    );
    expect(failedTask).toBeDefined();
    expect(failedTask?.id).toBe('2');
  });

  it('should reset all state when reset is called', async () => {
    const processor = vi.fn(async (input: number) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return input * 2;
    });

    const { result } = renderHook(() =>
      useWorkerPool({
        maxWorkers: 2,
        processor,
      })
    );

    // Add tasks
    result.current.addTasks([
      { id: '1', input: 1 },
      { id: '2', input: 2 },
    ]);

    await waitFor(() => {
      expect(result.current.tasks.size).toBe(2);
    });

    // Wait a bit for processing to start
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Reset
    result.current.reset();

    await waitFor(() => {
      expect(result.current.tasks.size).toBe(0);
    });

    // All state should be cleared
    expect(result.current.queuedCount).toBe(0);
    expect(result.current.completedCount).toBe(0);
    expect(result.current.failedCount).toBe(0);
    expect(result.current.progress).toBe(0);
    expect(result.current.activeWorkers).toBe(0);
    expect(result.current.isProcessing).toBe(false);
  });

  it('should correctly report isProcessing state', async () => {
    const processor = vi.fn(async (input: number) => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return input * 2;
    });

    const { result } = renderHook(() =>
      useWorkerPool({
        maxWorkers: 1,
        processor,
      })
    );

    // Initially not processing
    expect(result.current.isProcessing).toBe(false);

    // Add a task
    result.current.addTask('1', 10);

    // Should be processing
    await waitFor(() => {
      expect(result.current.isProcessing).toBe(true);
    });

    // Wait for completion
    await waitFor(
      () => {
        expect(result.current.completedCount).toBe(1);
      },
      { timeout: 200 }
    );

    // Should stop processing
    expect(result.current.isProcessing).toBe(false);
  });

  it('should maintain task metadata correctly', async () => {
    const processor = vi.fn(async (input: number) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return input * 2;
    });

    const { result } = renderHook(() =>
      useWorkerPool({
        maxWorkers: 1,
        processor,
      })
    );

    result.current.addTask('test-task', 42);

    await waitFor(() => {
      expect(result.current.completedCount).toBe(1);
    });

    const task = result.current.tasks.get('test-task');
    expect(task).toBeDefined();
    expect(task?.id).toBe('test-task');
    expect(task?.input).toBe(42);
    expect(task?.output).toBe(84);
    expect(task?.status).toBe('completed');
    expect(task?.startedAt).toBeInstanceOf(Date);
    expect(task?.completedAt).toBeInstanceOf(Date);
  });
});
