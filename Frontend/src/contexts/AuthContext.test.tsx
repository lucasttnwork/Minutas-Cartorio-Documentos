import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Mock user data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  app_metadata: {},
  user_metadata: {},
};

const mockProfile: Database['public']['Tables']['profiles']['Row'] = {
  id: 'user-123',
  email: 'test@example.com',
  nome: 'Test User',
  cargo: 'escrevente',
  ativo: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Auth callback storage
type AuthCallback = (event: AuthChangeEvent, session: Session | null) => void;
let authCallbacks: AuthCallback[] = [];

// Mock functions
const mockGetSession = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockFromSelect = vi.fn();

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      signInWithPassword: (params: { email: string; password: string }) => mockSignInWithPassword(params),
      signOut: () => mockSignOut(),
      onAuthStateChange: (callback: AuthCallback) => mockOnAuthStateChange(callback),
    },
    from: (table: string) => mockFromSelect(table),
  },
}));

// Import after mock
import { AuthProvider, useAuth } from './AuthContext';

// Helper to simulate auth state changes
const simulateAuthStateChange = (event: AuthChangeEvent, session: Session | null) => {
  authCallbacks.forEach((callback) => callback(event, session));
};

// Helper to reset all mocks
const resetAllMocks = () => {
  authCallbacks = [];
  mockGetSession.mockReset();
  mockSignInWithPassword.mockReset();
  mockSignOut.mockReset();
  mockOnAuthStateChange.mockReset();
  mockFromSelect.mockReset();
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    resetAllMocks();
    // Reset default mock implementations
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockOnAuthStateChange.mockImplementation((callback: AuthCallback) => {
      authCallbacks.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn().mockImplementation(() => {
              authCallbacks = authCallbacks.filter((cb) => cb !== callback);
            }),
          },
        },
      };
    });
    mockFromSelect.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with loading true and user null', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.profile).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should check session on mount', async () => {
      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Session with User', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
    });

    it('should populate user when session exists', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should fetch profile after getting user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFromSelect).toHaveBeenCalledWith('profiles');
      expect(result.current.profile).toEqual(mockProfile);
    });
  });

  describe('signIn', () => {
    it('should call supabase.auth.signInWithPassword', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error on failure', async () => {
      const errorMessage = 'Invalid login credentials';
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: errorMessage },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signInResult: { error: string | null } = { error: null };
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'wrongpassword');
      });

      expect(signInResult.error).toBe(errorMessage);
    });

    it('should update user state on success', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('signOut', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
    });

    it('should clear user and profile', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBe(null);
      expect(result.current.profile).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should call supabase.auth.signOut', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auth State Change Subscription', () => {
    it('should subscribe to auth changes on mount', async () => {
      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
      });
    });

    it('should unsubscribe on unmount', async () => {
      const { unmount } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });

      const subscription = mockOnAuthStateChange.mock.results[0].value.data.subscription;

      unmount();

      expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should update state on auth change event', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBe(null);

      act(() => {
        simulateAuthStateChange('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle session without user gracefully', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { ...mockSession, user: null as unknown as typeof mockUser } },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should throw error when useAuth is called outside provider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should set loading to false when onAuthStateChange fires SIGNED_IN before initAuth completes', async () => {
      // Simulate slow getSession that takes time to complete
      let resolveGetSession: (value: { data: { session: typeof mockSession }; error: null }) => void;
      mockGetSession.mockReturnValue(
        new Promise((resolve) => {
          resolveGetSession = resolve;
        })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Initially loading should be true
      expect(result.current.loading).toBe(true);

      // Simulate onAuthStateChange firing SIGNED_IN before getSession completes
      act(() => {
        simulateAuthStateChange('SIGNED_IN', mockSession);
      });

      // Wait for the auth state change to process
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // User should be set from onAuthStateChange
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);

      // Now resolve getSession (late)
      act(() => {
        resolveGetSession!({ data: { session: mockSession }, error: null });
      });

      // Loading should still be false
      expect(result.current.loading).toBe(false);
    });

    it('should handle INITIAL_SESSION event from Supabase', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate INITIAL_SESSION event
      act(() => {
        simulateAuthStateChange('INITIAL_SESSION', mockSession);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle getSession error gracefully and still set loading to false', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Network error' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not have user
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle profile fetch error gracefully', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Make profile fetch fail
      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Profile not found', code: 'PGRST116' } }),
          }),
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // User should be set, but profile should be null
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.profile).toBe(null);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
