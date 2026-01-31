import { vi } from 'vitest';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Mock user data
export const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  app_metadata: {},
  user_metadata: {},
};

export const mockProfile: Database['public']['Tables']['profiles']['Row'] = {
  id: 'user-123',
  email: 'test@example.com',
  nome: 'Test User',
  cargo: 'escrevente',
  ativo: true,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Auth subscription callback type
type AuthCallback = (event: AuthChangeEvent, session: Session | null) => void;

// Store for auth callbacks to simulate auth state changes
let authCallbacks: AuthCallback[] = [];

// Mock auth methods
export const mockAuth = {
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  signInWithPassword: vi.fn().mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  onAuthStateChange: vi.fn().mockImplementation((callback: AuthCallback) => {
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
  }),
};

// Mock storage methods
export const mockStorage = {
  from: vi.fn().mockReturnValue({
    upload: vi.fn().mockResolvedValue({ data: { path: 'test/file.pdf' }, error: null }),
    remove: vi.fn().mockResolvedValue({ error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.pdf' } }),
    download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
  }),
};

// Mock database query builder
const createQueryBuilder = (data: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data, error: null }),
  maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
  then: vi.fn().mockImplementation((resolve) => resolve({ data: data ? [data] : [], error: null })),
});

// Mock database methods
export const mockFrom = vi.fn().mockImplementation((table: string) => {
  if (table === 'profiles') {
    return createQueryBuilder(mockProfile);
  }
  return createQueryBuilder();
});

// Mock functions invoke
export const mockFunctions = {
  invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
};

// Mock realtime channel
export const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
};

// Main mock supabase client
export const mockSupabase = {
  auth: mockAuth,
  storage: mockStorage,
  from: mockFrom,
  functions: mockFunctions,
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
};

// Helper to simulate auth state changes in tests
export const simulateAuthStateChange = (event: AuthChangeEvent, session: Session | null) => {
  authCallbacks.forEach((callback) => callback(event, session));
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  authCallbacks = [];
  Object.values(mockAuth).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      mock.mockClear();
    }
  });
  mockFrom.mockClear();
  mockFunctions.invoke.mockClear();
};

// Default export for vi.mock
export default mockSupabase;
