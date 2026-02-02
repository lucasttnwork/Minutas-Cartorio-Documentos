/**
 * Retry utility with exponential backoff for Supabase Edge Functions
 * Handles transient errors with configurable retry logic and jitter
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (including the initial attempt) */
  maxAttempts: number;
  /** Initial delay in milliseconds before first retry */
  initialDelayMs: number;
  /** Maximum delay in milliseconds between retries */
  maxDelayMs: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** HTTP status codes that should trigger a retry */
  retryableErrors: number[];
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [429, 500, 502, 503, 504],
};

/**
 * Executes an async operation with retry logic and exponential backoff
 * @param operation The async function to execute
 * @param options Retry configuration options
 * @returns The result of the operation
 * @throws The last error if all retry attempts fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  const config: RetryOptions = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      console.log(`[Retry] Attempt ${attempt}/${config.maxAttempts}`);
      const result = await operation();

      if (attempt > 1) {
        console.log(`[Retry] Success after ${attempt} attempt(s)`);
      }

      return result;
    } catch (error) {
      lastError = error;

      // If this is the last attempt, throw the error
      if (attempt === config.maxAttempts) {
        console.log(`[Retry] All ${config.maxAttempts} attempts failed`);
        throw error;
      }

      // Check if the error is retryable
      if (!isRetryableError(error)) {
        console.log(`[Retry] Non-retryable error encountered, aborting`);
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = calculateBackoffDelay(attempt, config);
      console.log(`[Retry] Retryable error on attempt ${attempt}, waiting ${delay}ms before retry`);

      // Wait before next retry
      await sleep(delay);
    }
  }

  // This should never be reached due to the throw in the loop, but TypeScript needs it
  throw lastError;
}

/**
 * Checks if an error should trigger a retry
 * @param error The error to check
 * @returns true if the error is retryable, false otherwise
 */
export function isRetryableError(error: unknown): boolean {
  // Check for HTTP status code errors
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    if (DEFAULT_OPTIONS.retryableErrors.includes(status)) {
      return true;
    }
  }

  // Check for error messages indicating rate limits or timeouts
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: unknown }).message).toLowerCase();
    const retryablePatterns = [
      'rate limit',
      'too many requests',
      'timeout',
      'timed out',
      'connection reset',
      'econnreset',
      'socket hang up',
    ];

    return retryablePatterns.some(pattern => message.includes(pattern));
  }

  // Check if error is a Response object with retryable status
  if (error instanceof Response) {
    return DEFAULT_OPTIONS.retryableErrors.includes(error.status);
  }

  return false;
}

/**
 * Calculates the delay for the next retry attempt using exponential backoff
 * Adds jitter to prevent thundering herd problem
 * @param attempt Current attempt number (1-indexed)
 * @param options Retry configuration options
 * @returns Delay in milliseconds
 */
export function calculateBackoffDelay(attempt: number, options: RetryOptions): number {
  // Calculate exponential backoff: initialDelay * (multiplier ^ (attempt - 1))
  const exponentialDelay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1);

  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, options.maxDelayMs);

  // Add jitter: ±10% randomization to prevent thundering herd
  const jitterRange = cappedDelay * 0.1;
  const jitter = (Math.random() * 2 - 1) * jitterRange; // Random value between -jitterRange and +jitterRange

  return Math.max(0, Math.round(cappedDelay + jitter));
}

/**
 * Sleep utility for async delay
 * @param ms Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
