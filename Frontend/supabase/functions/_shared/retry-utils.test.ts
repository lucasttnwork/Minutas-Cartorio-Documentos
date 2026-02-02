/**
 * Tests for retry utility with exponential backoff
 * Run with: deno test supabase/functions/_shared/retry-utils.test.ts
 */

import { assertEquals, assertRejects } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  withRetry,
  isRetryableError,
  calculateBackoffDelay,
  type RetryOptions,
} from "./retry-utils.ts";

// Test: Successful operation on first attempt
Deno.test("withRetry - success on first attempt", async () => {
  let attempts = 0;
  const operation = async () => {
    attempts++;
    return "success";
  };

  const result = await withRetry(operation);

  assertEquals(result, "success");
  assertEquals(attempts, 1);
});

// Test: Retry on 429 error with successful retry
Deno.test("withRetry - retry on 429 error and succeed", async () => {
  let attempts = 0;
  const operation = async () => {
    attempts++;
    if (attempts < 2) {
      const error = new Error("Rate limited") as Error & { status: number };
      error.status = 429;
      throw error;
    }
    return "success after retry";
  };

  const result = await withRetry(operation, {
    maxAttempts: 3,
    initialDelayMs: 10, // Short delay for fast tests
    maxDelayMs: 100,
  });

  assertEquals(result, "success after retry");
  assertEquals(attempts, 2);
});

// Test: Maximum attempts respected
Deno.test("withRetry - respects maximum attempts", async () => {
  let attempts = 0;
  const operation = async () => {
    attempts++;
    const error = new Error("Always fails") as Error & { status: number };
    error.status = 500;
    throw error;
  };

  await assertRejects(
    async () => {
      await withRetry(operation, {
        maxAttempts: 3,
        initialDelayMs: 10,
        maxDelayMs: 100,
      });
    },
    Error,
    "Always fails"
  );

  assertEquals(attempts, 3);
});

// Test: Non-retryable errors fail immediately
Deno.test("withRetry - non-retryable error fails immediately", async () => {
  let attempts = 0;
  const operation = async () => {
    attempts++;
    const error = new Error("Not found") as Error & { status: number };
    error.status = 404;
    throw error;
  };

  await assertRejects(
    async () => {
      await withRetry(operation, {
        maxAttempts: 3,
        initialDelayMs: 10,
      });
    },
    Error,
    "Not found"
  );

  assertEquals(attempts, 1, "Should not retry non-retryable errors");
});

// Test: isRetryableError with status codes
Deno.test("isRetryableError - detects retryable status codes", () => {
  const retryableCodes = [429, 500, 502, 503, 504];

  retryableCodes.forEach(code => {
    const error = { status: code };
    assertEquals(
      isRetryableError(error),
      true,
      `Status ${code} should be retryable`
    );
  });

  const nonRetryableCodes = [400, 401, 403, 404];
  nonRetryableCodes.forEach(code => {
    const error = { status: code };
    assertEquals(
      isRetryableError(error),
      false,
      `Status ${code} should not be retryable`
    );
  });
});

// Test: isRetryableError with error messages
Deno.test("isRetryableError - detects retryable error messages", () => {
  const retryableMessages = [
    "Rate limit exceeded",
    "Too many requests",
    "Request timeout",
    "Connection timed out",
    "ECONNRESET",
    "Socket hang up",
  ];

  retryableMessages.forEach(msg => {
    const error = new Error(msg);
    assertEquals(
      isRetryableError(error),
      true,
      `Message "${msg}" should be retryable`
    );
  });

  const nonRetryableMessages = [
    "Invalid request",
    "Not found",
    "Unauthorized",
  ];

  nonRetryableMessages.forEach(msg => {
    const error = new Error(msg);
    assertEquals(
      isRetryableError(error),
      false,
      `Message "${msg}" should not be retryable`
    );
  });
});

// Test: isRetryableError with Response objects
Deno.test("isRetryableError - detects retryable Response objects", () => {
  const retryableResponse = new Response(null, { status: 503 });
  assertEquals(isRetryableError(retryableResponse), true);

  const nonRetryableResponse = new Response(null, { status: 404 });
  assertEquals(isRetryableError(nonRetryableResponse), false);
});

// Test: Exponential backoff calculation
Deno.test("calculateBackoffDelay - exponential backoff", () => {
  const options: RetryOptions = {
    maxAttempts: 5,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableErrors: [429, 500, 502, 503, 504],
  };

  // Attempt 1: 1000 * 2^0 = 1000ms (±10%)
  const delay1 = calculateBackoffDelay(1, options);
  assertEquals(delay1 >= 900 && delay1 <= 1100, true, `Delay1: ${delay1} should be ~1000ms ±10%`);

  // Attempt 2: 1000 * 2^1 = 2000ms (±10%)
  const delay2 = calculateBackoffDelay(2, options);
  assertEquals(delay2 >= 1800 && delay2 <= 2200, true, `Delay2: ${delay2} should be ~2000ms ±10%`);

  // Attempt 3: 1000 * 2^2 = 4000ms (±10%)
  const delay3 = calculateBackoffDelay(3, options);
  assertEquals(delay3 >= 3600 && delay3 <= 4400, true, `Delay3: ${delay3} should be ~4000ms ±10%`);

  // Attempt 4: 1000 * 2^3 = 8000ms (±10%)
  const delay4 = calculateBackoffDelay(4, options);
  assertEquals(delay4 >= 7200 && delay4 <= 8800, true, `Delay4: ${delay4} should be ~8000ms ±10%`);
});

// Test: Max delay cap
Deno.test("calculateBackoffDelay - respects max delay cap", () => {
  const options: RetryOptions = {
    maxAttempts: 10,
    initialDelayMs: 1000,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    retryableErrors: [429, 500, 502, 503, 504],
  };

  // Attempt 10: 1000 * 2^9 = 512000ms, but should be capped at 5000ms
  const delay = calculateBackoffDelay(10, options);
  assertEquals(delay <= 5500, true, `Delay ${delay} should be capped at ~5000ms + jitter`);
  assertEquals(delay >= 4500, true, `Delay ${delay} should not be below max - jitter`);
});

// Test: Jitter is applied correctly
Deno.test("calculateBackoffDelay - applies jitter", () => {
  const options: RetryOptions = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableErrors: [429, 500, 502, 503, 504],
  };

  // Run multiple times to verify jitter variance
  const delays: number[] = [];
  for (let i = 0; i < 10; i++) {
    delays.push(calculateBackoffDelay(1, options));
  }

  // Not all delays should be identical (jitter should introduce variance)
  const uniqueDelays = new Set(delays);
  assertEquals(
    uniqueDelays.size > 1,
    true,
    "Jitter should produce varied delays"
  );

  // All delays should be within ±10% of base delay (1000ms)
  delays.forEach(delay => {
    assertEquals(
      delay >= 900 && delay <= 1100,
      true,
      `Each delay ${delay} should be within ±10% of 1000ms`
    );
  });
});

// Test: Retry timing is actually delayed
Deno.test("withRetry - actually waits between attempts", async () => {
  let attempts = 0;
  const timestamps: number[] = [];

  const operation = async () => {
    attempts++;
    timestamps.push(Date.now());

    if (attempts < 3) {
      const error = new Error("Retry me") as Error & { status: number };
      error.status = 500;
      throw error;
    }

    return "success";
  };

  await withRetry(operation, {
    maxAttempts: 3,
    initialDelayMs: 50,
    maxDelayMs: 200,
  });

  assertEquals(attempts, 3);
  assertEquals(timestamps.length, 3);

  // Check that there was actual delay between attempts
  const delay1 = timestamps[1] - timestamps[0];
  const delay2 = timestamps[2] - timestamps[1];

  assertEquals(delay1 >= 40, true, `First retry delay ${delay1}ms should be >= 40ms`);
  assertEquals(delay2 >= 80, true, `Second retry delay ${delay2}ms should be >= 80ms (exponential)`);
});
