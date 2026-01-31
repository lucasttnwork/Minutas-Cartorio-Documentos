import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Mock profile cache functions
const mockGetCachedProfile = vi.fn();
const mockCacheProfile = vi.fn();
const mockClearProfileCache = vi.fn();

vi.mock('@/lib/profile-cache', () => ({
  getCachedProfile: () => mockGetCachedProfile(),
  cacheProfile: (profile: Database['public']['Tables']['profiles']['Row']) => mockCacheProfile(profile),
  clearProfileCache: () => mockClearProfileCache(),
}));

// Mock delay function to make tests fast
const mockDelay = vi.fn();
vi.mock('@/lib/delay', () => ({
  delay: (ms: number) => mockDelay(ms),
  PROFILE_FETCH_DELAYS: [500, 1000, 2000],
}));

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
  mockGetCachedProfile.mockReset();
  mockCacheProfile.mockReset();
  mockClearProfileCache.mockReset();
  mockDelay.mockReset();
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

  describe('fetchProfile with Cache and Retry', () => {
    beforeEach(() => {
      // Reset cache mocks to default behavior
      mockGetCachedProfile.mockReturnValue(null);
      mockCacheProfile.mockImplementation(() => {});
      mockClearProfileCache.mockImplementation(() => {});
      // Mock delay to resolve immediately (no actual waiting)
      mockDelay.mockResolvedValue(undefined);
    });

    it('should return profile from cache if valid and matches userId', async () => {
      // Setup: cache returns a valid profile for the user
      mockGetCachedProfile.mockReturnValue(mockProfile);

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      // Should have used cache instead of fetching from Supabase
      expect(mockGetCachedProfile).toHaveBeenCalled();
    });

    it('should retry with exponential backoff when PGRST116 error occurs', async () => {
      const singleMock = vi.fn()
        .mockResolvedValueOnce({ data: null, error: { message: 'Profile not found', code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: null, error: { message: 'Profile not found', code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: mockProfile, error: null });

      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      });

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      // Should have made 3 attempts
      expect(singleMock).toHaveBeenCalledTimes(3);
      // Should have called delay with correct values (500ms, 1000ms)
      expect(mockDelay).toHaveBeenCalledWith(500);
      expect(mockDelay).toHaveBeenCalledWith(1000);
    });

    it('should save profile to cache after successful fetch', async () => {
      mockGetCachedProfile.mockReturnValue(null); // No cache

      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      // Profile should be cached after fetch
      expect(mockCacheProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('should return null after 3 failed retry attempts', async () => {
      const singleMock = vi.fn()
        .mockResolvedValue({ data: null, error: { message: 'Profile not found', code: 'PGRST116' } });

      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      });

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Wait for all retries to complete
      await waitFor(() => {
        expect(singleMock).toHaveBeenCalledTimes(3);
      });

      // Profile should be null after all retries failed
      expect(result.current.profile).toBe(null);
      // Should have called delay twice (between attempts 1-2 and 2-3)
      expect(mockDelay).toHaveBeenCalledWith(500);
      expect(mockDelay).toHaveBeenCalledWith(1000);
    });

    it('should not use cache if cached profile has different userId', async () => {
      // Cache has profile for a different user
      const differentUserProfile = { ...mockProfile, id: 'different-user-id' };
      mockGetCachedProfile.mockReturnValue(differentUserProfile);

      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      // Should have fetched from Supabase since cache didn't match
      expect(mockFromSelect).toHaveBeenCalledWith('profiles');
      // Should have cached the new profile
      expect(mockCacheProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('should clear cache on signOut', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockClearProfileCache).toHaveBeenCalled();
    });
  });

  describe('profileLoading and lastProfileSync states', () => {
    beforeEach(() => {
      mockGetCachedProfile.mockReturnValue(null);
      mockCacheProfile.mockImplementation(() => {});
      mockClearProfileCache.mockImplementation(() => {});
      mockDelay.mockResolvedValue(undefined);
    });

    it('should have profileLoading as false initially', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Initial state before any async operations complete
      expect(result.current.profileLoading).toBe(false);
    });

    it('should have lastProfileSync as null initially', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Initial state
      expect(result.current.lastProfileSync).toBe(null);
    });

    it('should set profileLoading to true during fetch and false after', async () => {
      // Track profileLoading states during fetch
      const profileLoadingStates: boolean[] = [];

      // Create a promise we can control to track profileLoading states
      let resolveProfileFetch: (value: { data: typeof mockProfile; error: null }) => void;
      const profileFetchPromise = new Promise<{ data: typeof mockProfile; error: null }>((resolve) => {
        resolveProfileFetch = resolve;
      });

      const singleMock = vi.fn().mockReturnValue(profileFetchPromise);

      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      });

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for loading to be false (Supabase fires INITIAL_SESSION immediately and sets loading false)
      // and wait for profile fetch to have started
      await waitFor(() => {
        expect(singleMock).toHaveBeenCalled();
      });

      // Capture profileLoading state while fetch is in progress
      profileLoadingStates.push(result.current.profileLoading);

      // Resolve the profile fetch
      await act(async () => {
        resolveProfileFetch!({ data: mockProfile, error: null });
      });

      // Wait for profile to be set
      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      // profileLoading should have been true during fetch
      expect(profileLoadingStates[0]).toBe(true);

      // profileLoading should be false after fetch completes
      expect(result.current.profileLoading).toBe(false);
    });

    it('should update lastProfileSync after successful profile fetch', async () => {
      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const beforeFetch = new Date();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      // lastProfileSync should be updated after successful fetch
      expect(result.current.lastProfileSync).not.toBe(null);
      expect(result.current.lastProfileSync!.getTime()).toBeGreaterThanOrEqual(beforeFetch.getTime());
    });

    it('should not update lastProfileSync after failed profile fetch', async () => {
      const singleMock = vi.fn()
        .mockResolvedValue({ data: null, error: { message: 'Profile not found', code: 'PGRST116' } });

      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      });

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Wait for all retries to complete
      await waitFor(() => {
        expect(singleMock).toHaveBeenCalledTimes(3);
      });

      // lastProfileSync should remain null after failed fetch
      expect(result.current.lastProfileSync).toBe(null);
    });
  });

  describe('refreshProfile', () => {
    beforeEach(() => {
      mockGetCachedProfile.mockReturnValue(null);
      mockCacheProfile.mockImplementation(() => {});
      mockClearProfileCache.mockImplementation(() => {});
      mockDelay.mockResolvedValue(undefined);
    });

    it('should be a function', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refreshProfile).toBe('function');
    });

    it('should clear cache and refetch profile when called', async () => {
      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      // Clear mock call counts
      mockClearProfileCache.mockClear();
      mockFromSelect.mockClear();

      // Reset profile fetch mock
      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { ...mockProfile, nome: 'Updated Name' }, error: null }),
          }),
        }),
      });

      await act(async () => {
        await result.current.refreshProfile();
      });

      // Should have cleared cache
      expect(mockClearProfileCache).toHaveBeenCalled();

      // Should have refetched profile
      expect(mockFromSelect).toHaveBeenCalledWith('profiles');
    });

    it('should do nothing if no user is logged in', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBe(null);

      // Clear mock call counts
      mockClearProfileCache.mockClear();
      mockFromSelect.mockClear();

      await act(async () => {
        await result.current.refreshProfile();
      });

      // Should not have cleared cache or fetched profile
      expect(mockClearProfileCache).not.toHaveBeenCalled();
      expect(mockFromSelect).not.toHaveBeenCalled();
    });

    it('should update lastProfileSync after refresh', async () => {
      mockFromSelect.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      const firstSyncTime = result.current.lastProfileSync;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      await act(async () => {
        await result.current.refreshProfile();
      });

      // lastProfileSync should be updated after refresh
      expect(result.current.lastProfileSync).not.toBe(null);
      expect(result.current.lastProfileSync!.getTime()).toBeGreaterThan(firstSyncTime!.getTime());
    });
  });
});
