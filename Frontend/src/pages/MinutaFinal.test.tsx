import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MinutaFinal from './MinutaFinal';

// Mock hooks
const mockLoadTemplates = vi.fn();
const mockIncrementUsage = vi.fn();
const mockGenerateMinuta = vi.fn();
const mockUpdateMinutaTexto = vi.fn();
const mockLoadMinutaFromDatabase = vi.fn();
const mockFinalizarMinuta = vi.fn();

vi.mock('@/hooks/useMinutasPadrao', () => ({
  useMinutasPadrao: () => ({
    templates: [
      {
        id: 'template-1',
        nome: 'Template Teste',
        is_global: true,
        tipo_negocio: 'compra_venda',
        descricao: 'Template de teste para compra e venda',
        uso_count: 10,
        storage_path: '/path/to/template',
        nome_original: 'template.pdf',
        mime_type: 'application/pdf',
        tamanho_bytes: 1024,
        user_id: null,
        thumbnail_path: null,
        deleted_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'template-2',
        nome: 'Meu Template Personalizado',
        is_global: false,
        tipo_negocio: 'doacao',
        descricao: 'Template personalizado',
        uso_count: 5,
        storage_path: '/path/to/template2',
        nome_original: 'template2.pdf',
        mime_type: 'application/pdf',
        tamanho_bytes: 2048,
        user_id: 'user-123',
        thumbnail_path: null,
        deleted_at: null,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ],
    isLoading: false,
    error: null,
    loadTemplates: mockLoadTemplates,
    incrementUsage: mockIncrementUsage,
    uploadTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
    getDownloadUrl: vi.fn(),
  }),
}));

vi.mock('@/hooks/useDocumentPipeline', () => ({
  useDocumentPipeline: () => ({
    generateMinuta: mockGenerateMinuta,
    isGenerating: false,
    generationStatus: { status: 'idle' },
    startPipeline: vi.fn(),
    processDocument: vi.fn(),
    isProcessing: false,
    statuses: new Map(),
    overallProgress: 0,
  }),
}));

vi.mock('@/contexts/MinutaContext', () => ({
  useMinuta: () => ({
    currentMinuta: {
      id: '123',
      titulo: 'Minuta Teste',
      minutaTexto: 'Texto inicial da minuta',
      outorgantes: {
        pessoasNaturais: [
          { nome: 'Joao Silva', cpf: '123.456.789-00' },
        ],
        pessoasJuridicas: [],
      },
      outorgados: {
        pessoasNaturais: [
          { nome: 'Maria Santos', cpf: '987.654.321-00' },
        ],
        pessoasJuridicas: [],
      },
      imoveis: [
        { matricula: { numeroMatricula: '12345' } },
      ],
      negociosJuridicos: [
        { tipo: 'compra_venda' },
      ],
    },
    isSaving: false,
    isLoading: false,
    syncError: null,
    loadMinutaFromDatabase: mockLoadMinutaFromDatabase,
    updateMinutaTexto: mockUpdateMinutaTexto,
    finalizarMinuta: mockFinalizarMinuta,
  }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: {
              conteudo_gerado: null,
              template_usado: null,
              geracao_status: null,
              gerado_em: null,
              geracao_erro: null,
            },
            error: null,
          }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Helper to render component with router
const renderMinutaFinal = () => {
  return render(
    <MemoryRouter initialEntries={['/minuta/123/final']}>
      <Routes>
        <Route path="/minuta/:id/final" element={<MinutaFinal />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('MinutaFinal - Template Selection Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateMinuta.mockResolvedValue({
      success: true,
      minuta_texto: '<p>Minuta gerada com sucesso</p>',
    });
  });

  it('opens template selection modal when "Gerar Minuta" is clicked', async () => {
    const user = userEvent.setup();
    renderMinutaFinal();

    // Wait for component to load
    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    });

    // Find and click "Gerar Minuta" button
    const generateButton = screen.getByRole('button', { name: /gerar minuta/i });
    await user.click(generateButton);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText(/selecionar template/i)).toBeInTheDocument();
  });

  it('shows available templates in modal', async () => {
    const user = userEvent.setup();
    renderMinutaFinal();

    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /gerar minuta/i }));

    await waitFor(() => {
      expect(screen.getByText('Template Teste')).toBeInTheDocument();
      expect(screen.getByText('Meu Template Personalizado')).toBeInTheDocument();
    });
  });

  it('closes modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderMinutaFinal();

    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /gerar minuta/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('generates minuta with selected template when confirmed', async () => {
    const user = userEvent.setup();
    renderMinutaFinal();

    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    });

    // Open modal
    await user.click(screen.getByRole('button', { name: /gerar minuta/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Select template by clicking on it
    await user.click(screen.getByText('Template Teste'));

    // Confirm selection
    await user.click(screen.getByRole('button', { name: /selecionar/i }));

    await waitFor(() => {
      expect(mockGenerateMinuta).toHaveBeenCalledWith(
        '123',
        'VENDA_COMPRA',
        'template-1'
      );
    });
  });

  it('increments template usage after selection', async () => {
    const user = userEvent.setup();
    renderMinutaFinal();

    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /gerar minuta/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Template Teste'));
    await user.click(screen.getByRole('button', { name: /selecionar/i }));

    await waitFor(() => {
      expect(mockIncrementUsage).toHaveBeenCalledWith('template-1');
    });
  });

  it('loads templates when modal opens', async () => {
    const user = userEvent.setup();
    renderMinutaFinal();

    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /gerar minuta/i }));

    await waitFor(() => {
      expect(mockLoadTemplates).toHaveBeenCalled();
    });
  });

  it('closes modal after successful template selection', async () => {
    const user = userEvent.setup();
    renderMinutaFinal();

    await waitFor(() => {
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /gerar minuta/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Template Teste'));
    await user.click(screen.getByRole('button', { name: /selecionar/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
