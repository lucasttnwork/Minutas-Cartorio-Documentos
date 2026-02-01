// src/pages/ConferenciaImoveis.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ConferenciaImoveis from './ConferenciaImoveis';

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

vi.mock('@/components/forms/EditableField', () => ({
  EditableField: () => <div data-testid="editable-field">Editable Field</div>,
}));

vi.mock('@/components/forms/FormSection', () => ({
  FormSection: ({ children }: { children: React.ReactNode }) => <div data-testid="form-section">{children}</div>,
}));

describe('ConferenciaImoveis', () => {
  const defaultMinutaContext = {
    currentMinuta: null,
    isLoading: false,
    syncError: null,
    isSaving: false,
    loadMinutaFromDatabase: mockLoadMinutaFromDatabase,
    addImovel: vi.fn(),
    updateImovel: vi.fn(),
    removeImovel: vi.fn(),
  };

  const renderWithRouter = (minutaId?: string) => {
    const path = minutaId ? `/minuta/${minutaId}/imoveis` : '/minuta/imoveis';
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/minuta/:id/imoveis" element={<ConferenciaImoveis />} />
          <Route path="/minuta/imoveis" element={<ConferenciaImoveis />} />
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
              id: '1',
              matricula: {
                numeroMatricula: '12345',
                numeroRegistroImoveis: '',
                cidadeRegistroImoveis: '',
                estadoRegistroImoveis: '',
                numeroNacionalMatricula: '',
              },
              descricao: {
                denominacao: 'Apartamento 101',
                areaTotalM2: '',
                areaPrivativaM2: '',
                areaConstruida: '',
                descricaoConformeMatricula: '',
                endereco: {
                  logradouro: '',
                  numero: '',
                  complemento: '',
                  bairro: '',
                  cidade: '',
                  estado: '',
                  cep: '',
                },
              },
              cadastro: {
                cadastroMunicipalSQL: '',
                dataExpedicaoCertidao: '',
              },
              valoresVenais: {
                valorVenalIPTU: '',
                valorVenalReferenciaITBI: '',
              },
              negativaIPTU: {
                numeroCertidao: '',
                dataExpedicao: '',
                certidaoValida: '',
              },
              certidaoMatricula: {
                certidaoMatricula: '',
                dataExpedicao: '',
                certidaoValida: '',
              },
              proprietarios: [],
              onus: [],
              ressalvas: {
                existeRessalva: '',
                descricaoRessalva: '',
              },
              camposEditados: [],
            },
          ],
        },
      });

      renderWithRouter('test-id');

      // Check for the page-header which contains the title
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
    });
  });
});
