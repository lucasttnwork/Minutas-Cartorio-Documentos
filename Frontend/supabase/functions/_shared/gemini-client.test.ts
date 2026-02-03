import { assertEquals, assertRejects } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { callGemini, parseGeminiJson } from './gemini-client.ts';

// Mock fetch globally
const originalFetch = globalThis.fetch;

function mockFetch(responses: Array<{ status: number; body: unknown }>) {
  let callCount = 0;

  globalThis.fetch = async (_input: string | URL | Request, _init?: RequestInit) => {
    const response = responses[callCount] || responses[responses.length - 1];
    callCount++;

    if (response.status === 200) {
      return new Response(JSON.stringify(response.body), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'API Error' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };

  return callCount;
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

Deno.test('callGemini - retry on 429 rate limit error', async () => {
  // Mock: first call returns 429, second call succeeds
  mockFetch([
    { status: 429, body: { error: 'Rate limit exceeded' } },
    {
      status: 200,
      body: {
        candidates: [
          {
            content: {
              parts: [{ text: 'Success after retry' }],
            },
            finishReason: 'STOP',
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      },
    },
  ]);

  try {
    const result = await callGemini('Test prompt', undefined, undefined, {
      maxRetries: 3,
      retryOptions: {
        initialDelayMs: 100, // Speed up test
        maxDelayMs: 200,
      },
    });

    assertEquals(result.text, 'Success after retry');
    assertEquals(result.usage.inputTokens, 10);
    assertEquals(result.usage.outputTokens, 5);
  } finally {
    restoreFetch();
  }
});

Deno.test('callGemini - retry on 500 server error', async () => {
  // Mock: first call returns 500, second call succeeds
  mockFetch([
    { status: 500, body: { error: 'Internal server error' } },
    {
      status: 200,
      body: {
        candidates: [
          {
            content: {
              parts: [{ text: 'Success after server error' }],
            },
            finishReason: 'STOP',
          },
        ],
        usageMetadata: {
          promptTokenCount: 20,
          candidatesTokenCount: 10,
          totalTokenCount: 30,
        },
      },
    },
  ]);

  try {
    const result = await callGemini('Test prompt', undefined, undefined, {
      maxRetries: 3,
      retryOptions: {
        initialDelayMs: 100,
        maxDelayMs: 200,
      },
    });

    assertEquals(result.text, 'Success after server error');
    assertEquals(result.usage.inputTokens, 20);
    assertEquals(result.usage.outputTokens, 10);
  } finally {
    restoreFetch();
  }
});

Deno.test('callGemini - success on second attempt after 503', async () => {
  // Mock: 503 then success
  mockFetch([
    { status: 503, body: { error: 'Service unavailable' } },
    {
      status: 200,
      body: {
        candidates: [
          {
            content: {
              parts: [{ text: 'Recovered from 503' }],
            },
            finishReason: 'STOP',
          },
        ],
        usageMetadata: {
          promptTokenCount: 15,
          candidatesTokenCount: 8,
          totalTokenCount: 23,
        },
      },
    },
  ]);

  try {
    const result = await callGemini('Test prompt', undefined, undefined, {
      maxRetries: 3,
      retryOptions: {
        initialDelayMs: 100,
        maxDelayMs: 200,
      },
    });

    assertEquals(result.text, 'Recovered from 503');
  } finally {
    restoreFetch();
  }
});

Deno.test('callGemini - respects maxRetries limit', async () => {
  // Mock: all calls return 429
  mockFetch([
    { status: 429, body: { error: 'Rate limit' } },
    { status: 429, body: { error: 'Rate limit' } },
    { status: 429, body: { error: 'Rate limit' } },
  ]);

  try {
    await assertRejects(
      async () => {
        await callGemini('Test prompt', undefined, undefined, {
          maxRetries: 2, // Only 2 attempts total
          retryOptions: {
            initialDelayMs: 50,
            maxDelayMs: 100,
          },
        });
      },
      Error,
      'Gemini API error: 429'
    );
  } finally {
    restoreFetch();
  }
});

Deno.test('callGemini - fails immediately on non-retryable error (400)', async () => {
  // Mock: 400 Bad Request (non-retryable)
  mockFetch([
    { status: 400, body: { error: 'Bad request' } },
  ]);

  try {
    await assertRejects(
      async () => {
        await callGemini('Test prompt', undefined, undefined, {
          maxRetries: 3,
          retryOptions: {
            initialDelayMs: 50,
            maxDelayMs: 100,
          },
        });
      },
      Error,
      'Gemini API error: 400'
    );
  } finally {
    restoreFetch();
  }
});

Deno.test('callGemini - success on first attempt (no retry needed)', async () => {
  mockFetch([
    {
      status: 200,
      body: {
        candidates: [
          {
            content: {
              parts: [{ text: 'First attempt success' }],
            },
            finishReason: 'STOP',
          },
        ],
        usageMetadata: {
          promptTokenCount: 5,
          candidatesTokenCount: 3,
          totalTokenCount: 8,
        },
      },
    },
  ]);

  try {
    const result = await callGemini('Test prompt', undefined, undefined, {
      maxRetries: 3,
    });

    assertEquals(result.text, 'First attempt success');
    assertEquals(result.usage.inputTokens, 5);
    assertEquals(result.usage.outputTokens, 3);
  } finally {
    restoreFetch();
  }
});

Deno.test('parseGeminiJson - parses valid JSON', () => {
  const input = '{"name": "test", "value": 123}';
  const result = parseGeminiJson(input);
  assertEquals(result, { name: 'test', value: 123 });
});

Deno.test('parseGeminiJson - handles markdown code blocks', () => {
  const input = '```json\n{"name": "test"}\n```';
  const result = parseGeminiJson(input);
  assertEquals(result, { name: 'test' });
});
