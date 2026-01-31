// src/pages/ConferenciaOutorgados.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ConferenciaOutorgados from './ConferenciaOutorgados';

// Mock the MinutaContext
const mockLoadMinutaFromDatabase = vi.fn();
const mockUseMinuta = vi.fn();

vi.mock('@/contexts/MinutaContext', async () => {
  const actual = await vi.importActual('@/contexts/MinutaContext');
  return {
    ...actual,
    useMinuta: () => mockUseMinuta(),
    MinutaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
}));

// Mock the AnimatedBackground
vi.mock('@/components/layout/AnimatedBackground', () => ({
  AnimatedBackground: ({ children }: { children: React.ReactNode }) => <div data-testid="animated-bg">{children}</div>,
}));

// Mock layout components
vi.mock('@/components/layout/PageHeader', () => ({
  PageHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
    </div>
  ),
}));

vi.mock('@/components/layout/FlowStepper', () => ({
  FlowStepper: () => <div data-testid="flow-stepper">Flow Stepper</div>,
}));

vi.mock('@/components/layout/FlowNavigation', () => ({
  FlowNavigation: () => <div data-testid="flow-navigation">Flow Navigation</div>,
}));

vi.mock('@/components/layout/SectionCard', () => ({
  SectionCard: ({ children, title }: { children: React.ReactNode; title: React.ReactNode }) => (
    <div data-testid="section-card">
      <div data-testid="section-title">{title}</div>
      {children}
    </div>
  ),
}));

vi.mock('@/components/layout/EntityCard', () => ({
  EntityCard: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="entity-card">
      <span>{title}</span>
      {children}
    </div>
  ),
}));

vi.mock('@/components/forms/pessoa/PessoaNaturalForm', () => ({
  PessoaNaturalForm: () => <div data-testid="pessoa-natural-form">Pessoa Natural Form</div>,
}));

vi.mock('@/components/forms/pessoa/PessoaJuridicaForm', () => ({
  PessoaJuridicaForm: () => <div data-testid="pessoa-juridica-form">Pessoa Juridica Form</div>,
}));

describe('ConferenciaOutorgados', () => {
  const defaultMinutaContext = {
    currentMinuta: null,
    isLoading: false,
    syncError: null,
    isSaving: false,
    loadMinutaFromDatabase: mockLoadMinutaFromDatabase,
    addPessoaNaturalOutorgado: vi.fn(),
    updatePessoaNaturalOutorgado: vi.fn(),
    removePessoaNaturalOutorgado: vi.fn(),
    addPessoaJuridicaOutorgado: vi.fn(),
    updatePessoaJuridicaOutorgado: vi.fn(),
    removePessoaJuridicaOutorgado: vi.fn(),
    addAdministradorOutorgado: vi.fn(),
    updateAdministradorOutorgado: vi.fn(),
    removeAdministradorOutorgado: vi.fn(),
    addProcuradorOutorgado: vi.fn(),
    updateProcuradorOutorgado: vi.fn(),
    removeProcuradorOutorgado: vi.fn(),
  };

  const renderWithRouter = (minutaId?: string) => {
    const path = minutaId ? `/minuta/${minutaId}/outorgados` : '/minuta/outorgados';
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/minuta/:id/outorgados" element={<ConferenciaOutorgados />} />
          <Route path="/minuta/outorgados" element={<ConferenciaOutorgados />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMinuta.mockReturnValue(defaultMinutaContext);
  });

  describe('Database Loading', () => {
    it('should call loadMinutaFromDatabase when minutaId is in URL', async () => {
      const testMinutaId = '550e8400-e29b-41d4-a716-446655440000';
      mockUseMinuta.mockReturnValue({
        ...defaultMinutaContext,
        currentMinuta: null,
      });

      renderWithRouter(testMinutaId);

      await waitFor(() => {
        expect(mockLoadMinutaFromDatabase).toHaveBeenCalledWith(testMinutaId);
      });
    });

    it('should NOT call loadMinutaFromDatabase when minutaId matches currentMinuta.id', async () => {
      const testMinutaId = '550e8400-e29b-41d4-a716-446655440000';
      mockUseMinuta.mockReturnValue({
        ...defaultMinutaContext,
        currentMinuta: {
          id: testMinutaId,
          titulo: 'Test Minuta',
          outorgantes: { pessoasNaturais: [], pessoasJuridicas: [] },
          outorgados: { pessoasNaturais: [], pessoasJuridicas: [] },
        },
      });

      renderWithRouter(testMinutaId);

      await waitFor(() => {
        expect(mockLoadMinutaFromDatabase).not.toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      mockUseMinuta.mockReturnValue({
        ...defaultMinutaContext,
        isLoading: true,
      });

      renderWithRouter('test-id');

      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error alert when syncError exists', () => {
      const errorMessage = 'Failed to load minuta from database';
      mockUseMinuta.mockReturnValue({
        ...defaultMinutaContext,
        syncError: errorMessage,
      });

      renderWithRouter('test-id');

      expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Redirect when no minuta', () => {
    it('should redirect to dashboard when no currentMinuta and not loading', async () => {
      mockUseMinuta.mockReturnValue({
        ...defaultMinutaContext,
        currentMinuta: null,
        isLoading: false,
      });

      renderWithRouter('test-id');

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Form Rendering', () => {
    it('should render form when data is loaded', () => {
      mockUseMinuta.mockReturnValue({
        ...defaultMinutaContext,
        currentMinuta: {
          id: 'test-id',
          titulo: 'Test Minuta',
          outorgantes: { pessoasNaturais: [], pessoasJuridicas: [] },
          outorgados: {
            pessoasNaturais: [
              { id: '1', nome: 'Maria Santos', cpf: '987.654.321-00', camposEditados: [] },
            ],
            pessoasJuridicas: [],
          },
        },
      });

      renderWithRouter('test-id');

      expect(screen.getByText(/conferencia/i)).toBeInTheDocument();
      expect(screen.getByText(/outorgado/i)).toBeInTheDocument();
    });
  });
});
