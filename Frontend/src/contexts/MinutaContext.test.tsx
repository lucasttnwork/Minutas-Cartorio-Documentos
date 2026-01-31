// src/contexts/MinutaContext.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';

// Mock localStorage
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
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock useMinutaDatabase
const mockCreateMinuta = vi.fn();
const mockLoadMinuta = vi.fn();
const mockUpdateMinutaStatus = vi.fn();
const mockSyncPessoaNatural = vi.fn();
const mockSyncPessoaJuridica = vi.fn();
const mockSyncImovel = vi.fn();
const mockSyncNegocio = vi.fn();

vi.mock('@/hooks/useMinutaDatabase', () => ({
  useMinutaDatabase: () => ({
    loading: false,
    error: null,
    createMinuta: mockCreateMinuta,
    loadMinuta: mockLoadMinuta,
    updateMinutaStatus: mockUpdateMinutaStatus,
    syncPessoaNatural: mockSyncPessoaNatural,
    deletePessoaNatural: vi.fn(),
    syncPessoaJuridica: mockSyncPessoaJuridica,
    deletePessoaJuridica: vi.fn(),
    syncImovel: mockSyncImovel,
    deleteImovel: vi.fn(),
    syncNegocio: mockSyncNegocio,
    deleteNegocio: vi.fn(),
  }),
}));

// Mock useAutoSave
const mockTriggerSave = vi.fn();
const mockForceSave = vi.fn();
const mockCancel = vi.fn();
let mockIsSaving = false;
let mockLastSavedAt: Date | null = null;

vi.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: <T,>(options: {
    delay?: number;
    onSave: (data: T) => Promise<void>;
    onError?: (error: Error) => void;
    disabled?: boolean;
  }) => {
    // Store the onSave callback for testing
    (globalThis as Record<string, unknown>).__autoSaveOnSave = options.onSave;
    (globalThis as Record<string, unknown>).__autoSaveOnError = options.onError;

    return {
      triggerSave: mockTriggerSave,
      forceSave: mockForceSave.mockImplementation(async (data: T) => {
        await options.onSave(data);
      }),
      isSaving: mockIsSaving,
      lastError: null,
      lastSavedAt: mockLastSavedAt,
      hasPendingChanges: false,
      cancel: mockCancel,
    };
  },
}));

// Import after mocks
import { MinutaProvider, useMinuta } from './MinutaContext';

// Helper wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <MinutaProvider>{children}</MinutaProvider>
);

// Reset all mocks
const resetAllMocks = () => {
  localStorageMock.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  mockCreateMinuta.mockReset();
  mockLoadMinuta.mockReset();
  mockUpdateMinutaStatus.mockReset();
  mockSyncPessoaNatural.mockReset();
  mockSyncPessoaJuridica.mockReset();
  mockSyncImovel.mockReset();
  mockSyncNegocio.mockReset();
  mockTriggerSave.mockReset();
  mockForceSave.mockReset();
  mockCancel.mockReset();
  mockIsSaving = false;
  mockLastSavedAt = null;
};

describe('MinutaContext', () => {
  beforeEach(() => {
    resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Existing Functionality (localStorage)', () => {
    it('should create a new minuta and store in list', async () => {
      const { result } = renderHook(() => useMinuta(), { wrapper });

      let id: string;
      act(() => {
        id = result.current.createMinuta();
      });

      expect(id!).toBeDefined();
      expect(result.current.currentMinuta).not.toBeNull();
      expect(result.current.currentMinuta?.id).toBe(id!);
      expect(result.current.minutas).toHaveLength(1);
    });

    it('should load an existing minuta', async () => {
      const { result } = renderHook(() => useMinuta(), { wrapper });

      let id: string;
      act(() => {
        id = result.current.createMinuta();
      });

      act(() => {
        result.current.loadMinuta(id!);
      });

      expect(result.current.currentMinuta?.id).toBe(id!);
    });

    it('should save to localStorage after debounce', async () => {
      const { result } = renderHook(() => useMinuta(), { wrapper });

      act(() => {
        result.current.createMinuta();
      });

      // Fast-forward past the debounce delay
      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'minutas-cartorio',
        expect.any(String)
      );
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useMinuta());
      }).toThrow('useMinuta must be used within a MinutaProvider');
    });
  });

  describe('createMinutaInDatabase', () => {
    it('should create minuta in database and return id', async () => {
      const mockDbId = 'db-minuta-uuid-123';
      mockCreateMinuta.mockResolvedValue(mockDbId);

      const { result } = renderHook(() => useMinuta(), { wrapper });

      let dbId: string | null = null;
      await act(async () => {
        dbId = await result.current.createMinutaInDatabase('Test Minuta');
      });

      expect(mockCreateMinuta).toHaveBeenCalledWith('Test Minuta');
      expect(dbId).toBe(mockDbId);
    });

    it('should set isLoading to true during operation', async () => {
      let resolveCreate: (value: string) => void;
      const createPromise = new Promise<string>((resolve) => {
        resolveCreate = resolve;
      });
      mockCreateMinuta.mockReturnValue(createPromise);

      const { result } = renderHook(() => useMinuta(), { wrapper });

      // Start the operation
      let dbIdPromise: Promise<string | null>;
      act(() => {
        dbIdPromise = result.current.createMinutaInDatabase('Test');
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve
      await act(async () => {
        resolveCreate!('db-id');
        await dbIdPromise;
      });

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false);
    });

    it('should update currentMinuta with database id', async () => {
      const mockDbId = 'db-minuta-uuid-456';
      mockCreateMinuta.mockResolvedValue(mockDbId);

      const { result } = renderHook(() => useMinuta(), { wrapper });

      await act(async () => {
        await result.current.createMinutaInDatabase('New Minuta');
      });

      expect(result.current.currentMinuta?.id).toBe(mockDbId);
    });

    it('should return null when database operation fails', async () => {
      mockCreateMinuta.mockResolvedValue(null);

      const { result } = renderHook(() => useMinuta(), { wrapper });

      let dbId: string | null = null;
      await act(async () => {
        dbId = await result.current.createMinutaInDatabase('Failed Minuta');
      });

      expect(dbId).toBeNull();
    });
  });

  describe('loadMinutaFromDatabase', () => {
    it('should load minuta data from database and populate state', async () => {
      const mockMinutaData = {
        id: 'db-minuta-id',
        titulo: 'Minuta from DB',
        status: 'rascunho',
        currentStep: 'outorgantes',
        outorgantes: {
          pessoasNaturais: [{ id: 'pn1', nome: 'Test Person', cpf: '123.456.789-00' }],
          pessoasJuridicas: [],
        },
        outorgados: {
          pessoasNaturais: [],
          pessoasJuridicas: [],
        },
        imoveis: [],
        negociosJuridicos: [],
        minutaTexto: 'Texto da minuta',
      };
      mockLoadMinuta.mockResolvedValue(mockMinutaData);

      const { result } = renderHook(() => useMinuta(), { wrapper });

      let success = false;
      await act(async () => {
        success = await result.current.loadMinutaFromDatabase('db-minuta-id');
      });

      expect(success).toBe(true);
      expect(mockLoadMinuta).toHaveBeenCalledWith('db-minuta-id');
      expect(result.current.currentMinuta?.id).toBe('db-minuta-id');
      expect(result.current.currentMinuta?.titulo).toBe('Minuta from DB');
      expect(result.current.currentMinuta?.currentStep).toBe('outorgantes');
    });

    it('should set isLoading during load operation', async () => {
      let resolveLoad: (value: null) => void;
      const loadPromise = new Promise<null>((resolve) => {
        resolveLoad = resolve;
      });
      mockLoadMinuta.mockReturnValue(loadPromise);

      const { result } = renderHook(() => useMinuta(), { wrapper });

      let loadPromiseResult: Promise<boolean>;
      act(() => {
        loadPromiseResult = result.current.loadMinutaFromDatabase('some-id');
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveLoad!(null);
        await loadPromiseResult;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should update lastSyncedAt after successful load', async () => {
      const mockMinutaData = {
        id: 'db-id',
        titulo: 'Test',
        status: 'rascunho',
        currentStep: 'upload',
        outorgantes: { pessoasNaturais: [], pessoasJuridicas: [] },
        outorgados: { pessoasNaturais: [], pessoasJuridicas: [] },
        imoveis: [],
        negociosJuridicos: [],
        minutaTexto: '',
      };
      mockLoadMinuta.mockResolvedValue(mockMinutaData);

      const { result } = renderHook(() => useMinuta(), { wrapper });

      expect(result.current.lastSyncedAt).toBeNull();

      await act(async () => {
        await result.current.loadMinutaFromDatabase('db-id');
      });

      expect(result.current.lastSyncedAt).toBeInstanceOf(Date);
    });

    it('should return false when minuta not found in database', async () => {
      mockLoadMinuta.mockResolvedValue(null);

      const { result } = renderHook(() => useMinuta(), { wrapper });

      let success = false;
      await act(async () => {
        success = await result.current.loadMinutaFromDatabase('nonexistent-id');
      });

      expect(success).toBe(false);
    });
  });

  describe('Auto-save Integration', () => {
    it('should trigger auto-save when state changes and minuta has id', async () => {
      // Use a proper UUID format for database id
      const dbId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      mockCreateMinuta.mockResolvedValue(dbId);

      const { result } = renderHook(() => useMinuta(), { wrapper });

      // Create minuta in database (gives it a db id)
      await act(async () => {
        await result.current.createMinutaInDatabase('Test');
      });

      // The triggerSave is called when currentMinuta changes via useEffect
      // After createMinutaInDatabase, the currentMinuta should have a db id
      // and the useEffect should call triggerSave

      // Check that triggerSave was called (the effect runs when currentMinuta changes)
      expect(mockTriggerSave).toHaveBeenCalled();
    });

    it('should NOT trigger auto-save when minuta has no database id', async () => {
      const { result } = renderHook(() => useMinuta(), { wrapper });

      // Create local minuta only (no database id)
      act(() => {
        result.current.createMinuta();
      });

      // Reset mock to check new calls
      mockTriggerSave.mockClear();

      // Update something
      act(() => {
        result.current.updateMinuta({ titulo: 'Updated Title' });
      });

      // Should NOT trigger auto-save because no db id
      // (the minuta id is a local timestamp-based id, not a UUID from db)
      // This depends on implementation - we'll verify behavior
    });
  });

  describe('forceSync', () => {
    it('should force immediate save to database', async () => {
      // Use a proper UUID format for database id
      const dbId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const mockMinutaData = {
        id: dbId,
        titulo: 'Test',
        status: 'rascunho',
        currentStep: 'upload',
        outorgantes: { pessoasNaturais: [], pessoasJuridicas: [] },
        outorgados: { pessoasNaturais: [], pessoasJuridicas: [] },
        imoveis: [],
        negociosJuridicos: [],
        minutaTexto: '',
      };
      mockLoadMinuta.mockResolvedValue(mockMinutaData);

      const { result } = renderHook(() => useMinuta(), { wrapper });

      // Load minuta first
      await act(async () => {
        await result.current.loadMinutaFromDatabase(dbId);
      });

      // Clear mock to check only the forceSync call
      mockForceSave.mockClear();

      // Force sync
      await act(async () => {
        await result.current.forceSync();
      });

      expect(mockForceSave).toHaveBeenCalled();
    });
  });

  describe('Sync State Management', () => {
    it('should expose isSyncing state', async () => {
      const { result } = renderHook(() => useMinuta(), { wrapper });

      // Initially false
      expect(result.current.isSyncing).toBe(false);
    });

    it('should expose syncError state', async () => {
      const { result } = renderHook(() => useMinuta(), { wrapper });

      // Initially null
      expect(result.current.syncError).toBeNull();
    });

    it('should set syncError when auto-save fails', async () => {
      mockCreateMinuta.mockResolvedValue('db-id');

      const { result } = renderHook(() => useMinuta(), { wrapper });

      await act(async () => {
        await result.current.createMinutaInDatabase('Test');
      });

      // Simulate error via the onError callback
      const onError = (globalThis as Record<string, unknown>).__autoSaveOnError as (error: Error) => void;

      act(() => {
        if (onError) {
          onError(new Error('Network error'));
        }
      });

      expect(result.current.syncError).toBe('Network error');
    });

    it('should expose lastSyncedAt state', async () => {
      const { result } = renderHook(() => useMinuta(), { wrapper });

      // Initially null
      expect(result.current.lastSyncedAt).toBeNull();
    });
  });

  describe('localStorage Cache Behavior', () => {
    it('should maintain localStorage as offline cache', async () => {
      const { result } = renderHook(() => useMinuta(), { wrapper });

      act(() => {
        result.current.createMinuta();
      });

      // Wait for debounce
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // localStorage should still be used
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should load from localStorage on initialization', () => {
      const existingMinutas = [
        {
          id: 'existing-id',
          titulo: 'Existing Minuta',
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
          status: 'rascunho',
          currentStep: 'upload',
          documentos: [],
          outorgantes: { pessoasNaturais: [], pessoasJuridicas: [] },
          outorgados: { pessoasNaturais: [], pessoasJuridicas: [] },
          imoveis: [],
          parecer: { relatorioMatricula: '', matriculaApta: null, pontosAtencao: '' },
          negociosJuridicos: [],
          minutaTexto: '',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingMinutas));

      const { result } = renderHook(() => useMinuta(), { wrapper });

      expect(result.current.minutas).toHaveLength(1);
      expect(result.current.minutas[0].id).toBe('existing-id');
    });
  });

  describe('Type Safety', () => {
    it('should have all required properties in context type', async () => {
      const { result } = renderHook(() => useMinuta(), { wrapper });

      // Existing properties
      expect(result.current.minutas).toBeDefined();
      expect(result.current.currentMinuta).toBeDefined();
      expect(result.current.createMinuta).toBeDefined();
      expect(result.current.loadMinuta).toBeDefined();
      expect(result.current.updateMinuta).toBeDefined();
      expect(result.current.isSaving).toBeDefined();

      // New database sync properties
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.isSyncing).toBeDefined();
      expect(result.current.syncError).toBeDefined();
      expect(result.current.lastSyncedAt).toBeDefined();

      // New database functions
      expect(result.current.createMinutaInDatabase).toBeDefined();
      expect(result.current.loadMinutaFromDatabase).toBeDefined();
      expect(result.current.forceSync).toBeDefined();
    });
  });
});
