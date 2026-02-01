import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import * as AuthContext from '@/contexts/AuthContext';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LogoutButton', () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAuth hook
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    });
  });

  it('renders logout button with correct text', () => {
    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument();
  });

  it('calls signOut when clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /sair/i });
    await user.click(button);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('navigates to /login after logout', async () => {
    const user = userEvent.setup();
    mockSignOut.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /sair/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('shows loading state during logout', async () => {
    const user = userEvent.setup();
    let resolveSignOut: () => void;
    const signOutPromise = new Promise<void>((resolve) => {
      resolveSignOut = resolve;
    });
    mockSignOut.mockReturnValue(signOutPromise);

    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /sair/i });
    await user.click(button);

    // Button should be disabled during logout
    expect(button).toBeDisabled();

    // Resolve the promise
    resolveSignOut!();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('accepts className prop for styling customization', () => {
    render(
      <MemoryRouter>
        <LogoutButton className="custom-class" />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /sair/i });
    expect(button).toHaveClass('custom-class');
  });
});
