import { useState, useRef, useCallback, useEffect } from 'react';

export interface WorkerTask<TInput, TOutput> {
  id: string;
  input: TInput;
  status: 'queued' | 'running' | 'completed' | 'failed';
  output?: TOutput;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface UseWorkerPoolOptions<TInput, TOutput> {
  maxWorkers: number;
  processor: (input: TInput) => Promise<TOutput>;
  onTaskComplete?: (task: WorkerTask<TInput, TOutput>) => void;
  onTaskError?: (task: WorkerTask<TInput, TOutput>, error: Error) => void;
}

export function useWorkerPool<TInput, TOutput>(
  options: UseWorkerPoolOptions<TInput, TOutput>
) {
  const { maxWorkers, processor } = options;

  const [tasks, setTasks] = useState<Map<string, WorkerTask<TInput, TOutput>>>(
    new Map()
  );
  const [activeWorkers, setActiveWorkers] = useState(0);
  const activeWorkersRef = useRef(0);

  // Use refs for callbacks to ensure they're always up-to-date without causing re-renders
  const onTaskCompleteRef = useRef(options.onTaskComplete);
  const onTaskErrorRef = useRef(options.onTaskError);
  const processorRef = useRef(processor);

  // Update refs when options change
  useEffect(() => {
    onTaskCompleteRef.current = options.onTaskComplete;
    onTaskErrorRef.current = options.onTaskError;
    processorRef.current = processor;
  }, [options.onTaskComplete, options.onTaskError, processor]);

  const addTask = useCallback((id: string, input: TInput) => {
    setTasks((prev) => {
      const newTasks = new Map(prev);
      newTasks.set(id, {
        id,
        input,
        status: 'queued',
      });
      return newTasks;
    });
  }, []);

  const addTasks = useCallback(
    (taskList: Array<{ id: string; input: TInput }>) => {
      setTasks((prev) => {
        const newTasks = new Map(prev);
        taskList.forEach(({ id, input }) => {
          newTasks.set(id, {
            id,
            input,
            status: 'queued',
          });
        });
        return newTasks;
      });
    },
    []
  );

  const reset = useCallback(() => {
    setTasks(new Map());
    activeWorkersRef.current = 0;
    setActiveWorkers(0);
  }, []);

  const processTask = useCallback(
    async (taskId: string, input: TInput) => {
      activeWorkersRef.current++;
      setActiveWorkers(activeWorkersRef.current);

      const startedAt = new Date();

      // Mark as running
      setTasks((prev) => {
        const newTasks = new Map(prev);
        const task = newTasks.get(taskId);
        if (task) {
          newTasks.set(taskId, {
            ...task,
            status: 'running',
            startedAt,
          });
        }
        return newTasks;
      });

      try {
        const output = await processorRef.current(input);

        const completedAt = new Date();

        const completedTask: WorkerTask<TInput, TOutput> = {
          id: taskId,
          input,
          status: 'completed',
          output,
          startedAt,
          completedAt,
        };

        // Mark as completed
        setTasks((prev) => {
          const newTasks = new Map(prev);
          newTasks.set(taskId, completedTask);
          return newTasks;
        });

        // Call callback after state update using queueMicrotask
        // This ensures React has processed the state update
        queueMicrotask(() => {
          onTaskCompleteRef.current?.(completedTask);
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        const completedAt = new Date();

        const failedTask: WorkerTask<TInput, TOutput> = {
          id: taskId,
          input,
          status: 'failed',
          error: errorMessage,
          startedAt,
          completedAt,
        };

        // Mark as failed
        setTasks((prev) => {
          const newTasks = new Map(prev);
          newTasks.set(taskId, failedTask);
          return newTasks;
        });

        // Call callback after state update using queueMicrotask
        queueMicrotask(() => {
          onTaskErrorRef.current?.(failedTask, error as Error);
        });
      } finally {
        activeWorkersRef.current--;
        setActiveWorkers(activeWorkersRef.current);
      }
    },
    [] // No dependencies - we use refs for everything
  );

  // Process queue whenever tasks change
  useEffect(() => {
    const tasksArray = Array.from(tasks.values());
    const queuedTasks = tasksArray.filter((t) => t.status === 'queued');

    // Start new workers if slots are available
    queuedTasks.forEach((task) => {
      if (activeWorkersRef.current < maxWorkers) {
        processTask(task.id, task.input);
      }
    });
  }, [tasks, maxWorkers, processTask]);

  // Calculate derived values
  const tasksArray = Array.from(tasks.values());
  const queuedCount = tasksArray.filter((t) => t.status === 'queued').length;
  const completedCount = tasksArray.filter((t) => t.status === 'completed')
    .length;
  const failedCount = tasksArray.filter((t) => t.status === 'failed').length;
  const totalTasks = tasks.size;
  const progress =
    totalTasks > 0 ? ((completedCount + failedCount) / totalTasks) * 100 : 0;
  const isProcessing = activeWorkers > 0 || queuedCount > 0;

  return {
    addTask,
    addTasks,
    tasks,
    activeWorkers,
    queuedCount,
    completedCount,
    failedCount,
    isProcessing,
    progress,
    reset,
  };
}
