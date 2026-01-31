import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import Login from './Login';

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
import { AuthProvider } from '@/contexts/AuthContext';

// Test wrapper with router and auth provider
interface LocationState {
  from?: string;
}

const TestWrapper = ({
  children,
  initialRoute = '/login',
  locationState
}: {
  children: ReactNode;
  initialRoute?: string;
  locationState?: LocationState;
}) => (
  <MemoryRouter initialEntries={[{ pathname: initialRoute, state: locationState }]}>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={children} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/agentes/extrator" element={<div>Agente Extrator Page</div>} />
        <Route path="/minutas/conferencia" element={<div>Conferencia Page</div>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

// Helper to reset all mocks
const resetAllMocks = () => {
  authCallbacks = [];
  mockGetSession.mockReset();
  mockSignInWithPassword.mockReset();
  mockSignOut.mockReset();
  mockOnAuthStateChange.mockReset();
  mockFromSelect.mockReset();
};

describe('Login Page', () => {
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

  describe('Render Login Form', () => {
    it('should render login form with email, password, and submit button', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      });
    });

    it('should render email input with type="email"', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toHaveAttribute('type', 'email');
      });
    });

    it('should render password input with type="password"', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/senha/i);
        expect(passwordInput).toHaveAttribute('type', 'password');
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'notanemail');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });
    });

    it('should show error for password less than 6 characters', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(passwordInput, '12345');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call signIn with email and password on form submit', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should show loading state during sign in', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockImplementation(() =>
        new Promise((resolve) => setTimeout(() => resolve({
          data: { user: mockUser, session: mockSession },
          error: null,
        }), 100))
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check button is disabled during loading
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should display error message on failed login', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid login credentials';
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: errorMessage },
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should redirect to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Redirect', () => {
    it('should redirect authenticated users away from login', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });
  });

  describe('Post-Login Redirect with Location State', () => {
    it('should redirect to state.from path after successful login', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      render(
        <TestWrapper locationState={{ from: '/agentes/extrator' }}>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Agente Extrator Page')).toBeInTheDocument();
      });
    });

    it('should redirect to dashboard when state.from is not provided', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      });
    });

    it('should redirect to different state.from paths correctly', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      render(
        <TestWrapper locationState={{ from: '/minutas/conferencia' }}>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Conferencia Page')).toBeInTheDocument();
      });
    });
  });
});
