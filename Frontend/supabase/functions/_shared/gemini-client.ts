import { encode as base64Encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';
import { withRetry, RetryOptions } from './retry-utils.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
// Usa variável de ambiente GEMINI_MODEL se configurada, senão usa gemini-3-flash-preview (modelo mais recente)
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-3-flash-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// File API URLs
const GEMINI_FILES_UPLOAD_URL = 'https://generativelanguage.googleapis.com/upload/v1beta/files';
const GEMINI_FILES_URL = 'https://generativelanguage.googleapis.com/v1beta/files';

// Threshold for using File API (files larger than 4MB should use File API)
const FILE_API_THRESHOLD = 4 * 1024 * 1024; // 4MB

/**
 * Convert ArrayBuffer to base64 string safely (handles large files)
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  return base64Encode(uint8Array);
}

/**
 * Upload a file to Gemini File API for large files
 * Returns the file URI to use in generateContent requests
 */
export async function uploadFileToGemini(
  buffer: ArrayBuffer,
  mimeType: string,
  displayName: string
): Promise<{ uri: string; name: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log(`[Gemini File API] Uploading file: ${displayName} (${(buffer.byteLength / 1024 / 1024).toFixed(2)}MB)`);

  // Step 1: Start resumable upload
  const startUploadResponse = await fetch(
    `${GEMINI_FILES_UPLOAD_URL}?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': buffer.byteLength.toString(),
        'X-Goog-Upload-Header-Content-Type': mimeType,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: {
          display_name: displayName,
        },
      }),
    }
  );

  if (!startUploadResponse.ok) {
    const error = await startUploadResponse.text();
    throw new Error(`Failed to start file upload: ${startUploadResponse.status} - ${error}`);
  }

  const uploadUrl = startUploadResponse.headers.get('X-Goog-Upload-URL');
  if (!uploadUrl) {
    throw new Error('No upload URL returned from Gemini File API');
  }

  // Step 2: Upload the file data
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': buffer.byteLength.toString(),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: buffer,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`Failed to upload file: ${uploadResponse.status} - ${error}`);
  }

  const fileInfo = await uploadResponse.json();
  const fileName = fileInfo.file?.name;
  const fileUri = fileInfo.file?.uri;
  
  if (!fileName || !fileUri) {
    throw new Error('No file name or URI returned from upload');
  }
  
  console.log(`[Gemini File API] File uploaded successfully: ${fileName}`);
  console.log(`[Gemini File API] File URI: ${fileUri}`);
  console.log('[Gemini File API] Skipping status polling - Gemini API will wait for file automatically');

  // Return immediately without waiting for ACTIVE state
  // The Gemini generateContent API handles waiting for the file to be ready
  return {
    uri: fileUri,
    name: fileName,
  };
}

/**
 * Delete a file from Gemini File API
 */
export async function deleteGeminiFile(fileName: string): Promise<void> {
  if (!GEMINI_API_KEY) return;

  try {
    await fetch(
      `${GEMINI_FILES_URL}/${fileName}?key=${GEMINI_API_KEY}`,
      { method: 'DELETE' }
    );
    console.log(`[Gemini File API] Deleted file: ${fileName}`);
  } catch (error) {
    console.warn(`[Gemini File API] Failed to delete file ${fileName}:`, error);
  }
}

/**
 * Check if a file should use the File API based on size
 */
export function shouldUseFileApi(sizeBytes: number): boolean {
  return sizeBytes > FILE_API_THRESHOLD;
}

/**
 * Custom error class for Gemini API errors that includes HTTP status codes
 * This allows the retry logic to detect retryable errors (429, 500, etc.)
 */
class GeminiApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GeminiApiError';
    this.status = status;
  }
}

interface GeminiRequest {
  contents: {
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
  }[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export async function callGemini(
  prompt: string,
  imageBase64?: string,
  imageMimeType?: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    maxRetries?: number;
    retryOptions?: Partial<RetryOptions>;
  }
): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const parts: GeminiRequest['contents'][0]['parts'] = [];

  // Add image if provided
  if (imageBase64 && imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: imageBase64,
      },
    });
  }

  // Add text prompt
  parts.push({ text: prompt });

  const request: GeminiRequest = {
    contents: [{ parts }],
    generationConfig: {
      temperature: options?.temperature ?? 0.1,
      maxOutputTokens: options?.maxTokens ?? 16384,
    },
  };

  // Wrap the API call with retry logic
  const result = await withRetry(
    async () => {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new GeminiApiError(`Gemini API error: ${response.status} - ${error}`, response.status);
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No response from Gemini');
      }

      return {
        text: data.candidates[0].content.parts[0].text,
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        },
      };
    },
    {
      maxAttempts: options?.maxRetries ?? 3,
      ...options?.retryOptions,
    }
  );

  console.log('[Gemini] API call successful');
  return result;
}

// Parse JSON from Gemini response (handles markdown code blocks and control characters)
export function parseGeminiJson<T>(text: string): T {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // First try parsing as-is
  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    // If parsing fails, try to fix common issues
    console.log('[parseGeminiJson] First parse failed, attempting cleanup...');

    // Remove any BOM or invisible characters at the start
    cleaned = cleaned.replace(/^\uFEFF/, '');

    // Try to find the JSON object/array boundaries
    const jsonStart = cleaned.indexOf('{');
    const arrayStart = cleaned.indexOf('[');
    let startIndex = -1;

    if (jsonStart >= 0 && (arrayStart < 0 || jsonStart < arrayStart)) {
      startIndex = jsonStart;
    } else if (arrayStart >= 0) {
      startIndex = arrayStart;
    }

    if (startIndex > 0) {
      cleaned = cleaned.substring(startIndex);
    }

    // Fix newlines and control characters within JSON string values
    // This regex finds content between quotes and escapes newlines within them
    cleaned = cleaned.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
      // Escape unescaped newlines, carriage returns, and tabs within the string
      return match
        .replace(/(?<!\\)\n/g, '\\n')
        .replace(/(?<!\\)\r/g, '\\r')
        .replace(/(?<!\\)\t/g, '\\t');
    });

    // Remove any remaining control characters outside strings
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    try {
      return JSON.parse(cleaned);
    } catch (secondError) {
      console.error('[parseGeminiJson] Second parse also failed:', secondError);
      console.error('[parseGeminiJson] Cleaned text (first 500 chars):', cleaned.substring(0, 500));
      throw secondError;
    }
  }
}
