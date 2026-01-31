// src/services/gemini.test.ts
// Testes unitários para o serviço cliente Gemini

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('gemini service', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('generationConfig', () => {
    it('tem temperature 0.1', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
      const { generationConfig } = await import('./gemini');

      expect(generationConfig.temperature).toBe(0.1);
    });

    it('tem maxOutputTokens 16384', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
      const { generationConfig } = await import('./gemini');

      expect(generationConfig.maxOutputTokens).toBe(16384);
    });

    it('generationConfig tem estrutura correta', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
      const { generationConfig } = await import('./gemini');

      expect(generationConfig).toEqual({
        temperature: 0.1,
        maxOutputTokens: 16384,
      });
    });
  });

  describe('getGeminiClient', () => {
    it('lança erro sem API key', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      vi.resetModules();

      const { getGeminiClient } = await import('./gemini');

      expect(() => getGeminiClient()).toThrow('VITE_GEMINI_API_KEY');
    });
  });

  describe('getModelName', () => {
    it('retorna modelo configurado', async () => {
      vi.stubEnv('VITE_GEMINI_MODEL', 'gemini-1.5-pro');
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
      vi.resetModules();

      const { getModelName } = await import('./gemini');
      const model = getModelName();

      expect(model).toBe('gemini-1.5-pro');
    });

    it('usa fallback se não configurado', async () => {
      vi.stubEnv('VITE_GEMINI_MODEL', '');
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
      vi.resetModules();

      const { getModelName } = await import('./gemini');
      const model = getModelName();

      // Fallback deve ser o modelo padrão
      expect(model).toBe('gemini-2.5-flash-preview-05-20');
    });
  });

  describe('shouldUseRealGemini', () => {
    it('retorna false sem API key', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      vi.stubEnv('VITE_USE_REAL_GEMINI', 'true');
      vi.resetModules();

      const { shouldUseRealGemini } = await import('./gemini');

      expect(shouldUseRealGemini()).toBe(false);
    });

    it('retorna false sem USE_REAL_GEMINI', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'valid-key');
      vi.stubEnv('VITE_USE_REAL_GEMINI', '');
      vi.resetModules();

      const { shouldUseRealGemini } = await import('./gemini');

      expect(shouldUseRealGemini()).toBe(false);
    });

    it('retorna false com USE_REAL_GEMINI = false', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'valid-key');
      vi.stubEnv('VITE_USE_REAL_GEMINI', 'false');
      vi.resetModules();

      const { shouldUseRealGemini } = await import('./gemini');

      expect(shouldUseRealGemini()).toBe(false);
    });

    it('retorna true com config completa', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'valid-key');
      vi.stubEnv('VITE_USE_REAL_GEMINI', 'true');
      vi.resetModules();

      const { shouldUseRealGemini } = await import('./gemini');

      expect(shouldUseRealGemini()).toBe(true);
    });
  });

  describe('exported constants', () => {
    it('exporta GEMINI_MODEL', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
      vi.stubEnv('VITE_GEMINI_MODEL', 'test-model');
      vi.resetModules();

      const { GEMINI_MODEL } = await import('./gemini');

      expect(GEMINI_MODEL).toBe('test-model');
    });

    it('exporta USE_REAL_GEMINI', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
      vi.stubEnv('VITE_USE_REAL_GEMINI', 'true');
      vi.resetModules();

      const { USE_REAL_GEMINI } = await import('./gemini');

      expect(USE_REAL_GEMINI).toBe(true);
    });
  });
});
