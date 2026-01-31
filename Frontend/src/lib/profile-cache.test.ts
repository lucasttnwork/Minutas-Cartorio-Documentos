/**
 * Testes para o gerenciamento de cache do profile
 *
 * Testa as funcoes getCachedProfile, cacheProfile e clearProfileCache
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCachedProfile, cacheProfile, clearProfileCache } from './profile-cache';
import { PROFILE_CACHE_KEY, PROFILE_CACHE_TTL_MS } from './auth-config';
import type { Profile } from './supabase';

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Substitui o localStorage global
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Profile de teste
const mockProfile: Profile = {
  id: 'user-123',
  email: 'test@example.com',
  nome: 'Usuario Teste',
  cargo: 'escrevente',
  ativo: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('profile-cache', () => {
  beforeEach(() => {
    // Limpa mocks antes de cada teste
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    // Restaura mocks apos cada teste
    vi.restoreAllMocks();
  });

  describe('getCachedProfile', () => {
    it('retorna null quando cache nao existe', () => {
      const result = getCachedProfile();

      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalledWith(PROFILE_CACHE_KEY);
    });

    it('retorna null quando cache e invalido (JSON malformado)', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      const result = getCachedProfile();

      expect(result).toBeNull();
    });

    it('retorna profile quando cache e valido e nao expirou', () => {
      const cachedData = {
        profile: mockProfile,
        cachedAt: Date.now(),
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));

      const result = getCachedProfile();

      expect(result).toEqual(mockProfile);
    });

    it('retorna null quando cache expirou', () => {
      // Mock Date.now para simular tempo passado
      const now = Date.now();
      const expiredTime = now - PROFILE_CACHE_TTL_MS - 1000; // 1 segundo alem do TTL

      const cachedData = {
        profile: mockProfile,
        cachedAt: expiredTime,
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cachedData));

      const result = getCachedProfile();

      expect(result).toBeNull();
      // Deve limpar o cache expirado
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(PROFILE_CACHE_KEY);
    });

    it('retorna null e limpa cache quando dados estao corrompidos', () => {
      const corruptedData = {
        // Falta o campo cachedAt
        profile: mockProfile,
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(corruptedData));

      const result = getCachedProfile();

      expect(result).toBeNull();
    });
  });

  describe('cacheProfile', () => {
    it('salva profile no cache com timestamp atual', () => {
      const mockNow = 1706745600000; // Timestamp fixo para teste
      vi.spyOn(Date, 'now').mockReturnValue(mockNow);

      cacheProfile(mockProfile);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        PROFILE_CACHE_KEY,
        JSON.stringify({
          profile: mockProfile,
          cachedAt: mockNow,
        })
      );
    });

    it('profile salvo pode ser recuperado por getCachedProfile', () => {
      // Primeiro, salva
      cacheProfile(mockProfile);

      // Pega o que foi salvo
      const savedCall = localStorageMock.setItem.mock.calls[0];
      const savedValue = savedCall[1];

      // Simula leitura
      localStorageMock.getItem.mockReturnValueOnce(savedValue);

      const result = getCachedProfile();

      expect(result).toEqual(mockProfile);
    });
  });

  describe('clearProfileCache', () => {
    it('remove o cache do localStorage', () => {
      clearProfileCache();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(PROFILE_CACHE_KEY);
    });

    it('apos limpar, getCachedProfile retorna null', () => {
      // Primeiro salva
      cacheProfile(mockProfile);

      // Limpa
      clearProfileCache();

      // Simula que o storage esta vazio
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = getCachedProfile();

      expect(result).toBeNull();
    });
  });

  describe('integracao', () => {
    it('ciclo completo: cache -> get -> clear -> get', () => {
      const mockNow = 1706745600000;
      vi.spyOn(Date, 'now').mockReturnValue(mockNow);

      // 1. Salva no cache
      cacheProfile(mockProfile);
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // 2. Recupera do cache
      const savedValue = localStorageMock.setItem.mock.calls[0][1];
      localStorageMock.getItem.mockReturnValueOnce(savedValue);

      const cached = getCachedProfile();
      expect(cached).toEqual(mockProfile);

      // 3. Limpa o cache
      clearProfileCache();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(PROFILE_CACHE_KEY);

      // 4. Tenta recuperar (deve ser null)
      localStorageMock.getItem.mockReturnValueOnce(null);
      const afterClear = getCachedProfile();
      expect(afterClear).toBeNull();
    });
  });
});
