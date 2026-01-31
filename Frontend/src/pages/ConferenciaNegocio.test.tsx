// src/pages/ConferenciaNegocio.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ConferenciaNegocio from './ConferenciaNegocio';

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
  PageHeader: ({ title }: { title: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
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

vi.mock('@/components/forms/negocio/NegocioJuridicoForm', () => ({
  NegocioJuridicoForm: () => <div data-testid="negocio-juridico-form">Negocio Juridico Form</div>,
}));

describe('ConferenciaNegocio', () => {
  const defaultMinutaContext = {
    currentMinuta: null,
    isLoading: false,
    syncError: null,
    isSaving: false,
    loadMinutaFromDatabase: mockLoadMinutaFromDatabase,
    updateNegocioJuridico: vi.fn(),
    updateMinuta: vi.fn(),
  };

  const renderWithRouter = (minutaId?: string) => {
    const path = minutaId ? `/minuta/${minutaId}/negocio` : '/minuta/negocio';
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/minuta/:id/negocio" element={<ConferenciaNegocio />} />
          <Route path="/minuta/negocio" element={<ConferenciaNegocio />} />
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
          imoveis: [],
          negociosJuridicos: [],
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
          imoveis: [
            {
              id: 'imovel-1',
              matricula: { numeroMatricula: '12345' },
              descricao: { denominacao: 'Apartamento 101' },
            },
          ],
          negociosJuridicos: [
            {
              id: 'negocio-1',
              imovelId: 'imovel-1',
              tipoAto: 'Compra e Venda',
              camposEditados: [],
              alienantes: [],
              adquirentes: [],
            },
          ],
          outorgantes: { pessoasNaturais: [], pessoasJuridicas: [] },
          outorgados: { pessoasNaturais: [], pessoasJuridicas: [] },
        },
      });

      renderWithRouter('test-id');

      // Check for the page-header which contains the title
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
    });
  });
});
