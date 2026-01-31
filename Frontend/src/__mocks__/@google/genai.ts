// src/__mocks__/@google/genai.ts
// Mock do SDK @google/genai para testes

import { vi } from 'vitest';

// Tipo para chunks de streaming
export interface MockStreamChunk {
  text: string;
}

// Estado do mock para controle nos testes
export const mockState = {
  chunks: [
    { text: '## REESCRITA DO DOCUMENTO\n' },
    { text: 'Conteúdo transcrito do documento...\n' },
    { text: '\n## EXPLICACAO CONTEXTUAL\n' },
    { text: 'Este documento apresenta...\n' },
    { text: '\n## DADOS CATALOGADOS (JSON)\n' },
    { text: '```json\n{"tipo_documento": "TESTE"}\n```' },
  ] as MockStreamChunk[],
  shouldFail: false,
  failError: null as Error | null,
  delay: 0,
};

// Função para resetar o estado do mock
export function resetMockState() {
  mockState.chunks = [
    { text: '## REESCRITA DO DOCUMENTO\n' },
    { text: 'Conteúdo transcrito do documento...\n' },
    { text: '\n## EXPLICACAO CONTEXTUAL\n' },
    { text: 'Este documento apresenta...\n' },
    { text: '\n## DADOS CATALOGADOS (JSON)\n' },
    { text: '```json\n{"tipo_documento": "TESTE"}\n```' },
  ];
  mockState.shouldFail = false;
  mockState.failError = null;
  mockState.delay = 0;
}

// Função para configurar chunks customizados
export function setMockChunks(chunks: MockStreamChunk[]) {
  mockState.chunks = chunks;
}

// Função para simular erro
export function setMockError(error: Error) {
  mockState.shouldFail = true;
  mockState.failError = error;
}

// Função para configurar delay entre chunks
export function setMockDelay(ms: number) {
  mockState.delay = ms;
}

// Gerador assíncrono para simular streaming
async function* createMockStream() {
  if (mockState.shouldFail && mockState.failError) {
    throw mockState.failError;
  }

  for (const chunk of mockState.chunks) {
    if (mockState.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, mockState.delay));
    }
    yield chunk;
  }
}

// Mock do método generateContentStream
const mockGenerateContentStream = vi.fn().mockImplementation(async () => {
  if (mockState.shouldFail && mockState.failError) {
    throw mockState.failError;
  }
  return createMockStream();
});

// Mock da classe GoogleGenAI
export class GoogleGenAI {
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;

    // Simular erro de API key inválida
    if (!this.apiKey || this.apiKey === '') {
      throw new Error('API key is required');
    }
  }

  models = {
    generateContentStream: mockGenerateContentStream,
  };
}

// Exportar o mock function para verificações nos testes
export const mockGenerateContentStreamFn = mockGenerateContentStream;
