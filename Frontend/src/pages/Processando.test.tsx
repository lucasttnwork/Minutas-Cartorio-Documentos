import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Processando from './Processando';
import { MinutaProvider } from '@/contexts/MinutaContext';
import { useDocumentPipeline } from '@/hooks/useDocumentPipeline';
import { supabase } from '@/lib/supabase';

// Mock dependencies
vi.mock('@/hooks/useDocumentPipeline');
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUseDocumentPipeline = useDocumentPipeline as ReturnType<typeof vi.fn>;

const defaultPipelineReturn = {
  startPipeline: vi.fn().mockResolvedValue(undefined),
  processDocument: vi.fn().mockResolvedValue(true),
  generateMinuta: vi.fn().mockResolvedValue({ success: true }),
  isProcessing: true,
  isGenerating: false,
  statuses: new Map(),
  generationStatus: { status: 'idle' as const },
  overallProgress: 0,
  classificationWorkers: 0,
  extractionWorkers: 0,
  classificationQueue: 0,
  extractionQueue: 0,
};

const mockDocuments = [
  { id: 'doc-1', nome_original: 'Contrato de Compra e Venda.pdf' },
  { id: 'doc-2', nome_original: 'RG Comprador.pdf' },
  { id: 'doc-3', nome_original: 'CPF Vendedor.pdf' },
];

function renderProcessando(minutaId = 'minuta-123') {
  return render(
    <MemoryRouter initialEntries={[`/minuta/${minutaId}/processando`]}>
      <MinutaProvider>
        <Routes>
          <Route path="/minuta/:id/processando" element={<Processando />} />
        </Routes>
      </MinutaProvider>
    </MemoryRouter>
  );
}

describe('Processando Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock supabase document fetch
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          in: vi.fn(() => ({
            then: vi.fn((callback) => {
              callback({ data: mockDocuments });
              return Promise.resolve();
            }),
          })),
        })),
      })),
    }));

    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

    mockUseDocumentPipeline.mockReturnValue(defaultPipelineReturn);
  });

  it('renders lista de documentos', async () => {
    renderProcessando();

    await waitFor(() => {
      expect(screen.getByText('Contrato de Compra e Venda.pdf')).toBeInTheDocument();
    });

    expect(screen.getByText('RG Comprador.pdf')).toBeInTheDocument();
    expect(screen.getByText('CPF Vendedor.pdf')).toBeInTheDocument();
  });

  it('status atualiza baseado no statuses do hook - queued', async () => {
    const statuses = new Map([
      ['doc-1', { documentId: 'doc-1', step: 'queued' as const, progress: 0 }],
    ]);

    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      statuses,
    });

    renderProcessando();

    await waitFor(() => {
      // When a document has 'queued' status, it should show "Na fila"
      // Multiple documents may have this status, so we check if at least one exists
      const queuedElements = screen.getAllByText('Na fila');
      expect(queuedElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('status atualiza baseado no statuses do hook - classifying', async () => {
    const statuses = new Map([
      ['doc-1', { documentId: 'doc-1', step: 'classifying' as const, progress: 0 }],
    ]);

    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      statuses,
      classificationWorkers: 3,
    });

    renderProcessando();

    await waitFor(() => {
      expect(screen.getByText('Classificando...')).toBeInTheDocument();
    });
  });

  it('status atualiza baseado no statuses do hook - extracting', async () => {
    const statuses = new Map([
      ['doc-2', { documentId: 'doc-2', step: 'extracting' as const, progress: 33 }],
    ]);

    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      statuses,
      extractionWorkers: 2,
    });

    renderProcessando();

    await waitFor(() => {
      expect(screen.getByText('Extraindo dados...')).toBeInTheDocument();
    });
  });

  it('status atualiza baseado no statuses do hook - done', async () => {
    const statuses = new Map([
      ['doc-3', { documentId: 'doc-3', step: 'done' as const, progress: 100 }],
    ]);

    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      statuses,
    });

    renderProcessando();

    await waitFor(() => {
      expect(screen.getByText('Concluído')).toBeInTheDocument();
    });
  });

  it('workers indicators mostram valores corretos', async () => {
    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      classificationWorkers: 5,
      extractionWorkers: 3,
      classificationQueue: 2,
      extractionQueue: 7,
    });

    renderProcessando();

    await waitFor(() => {
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    expect(screen.getByText('3/10')).toBeInTheDocument();
    expect(screen.getByText('(+2 na fila)')).toBeInTheDocument();
    expect(screen.getByText('(+7 na fila)')).toBeInTheDocument();
  });

  it('erro individual é mostrado no documento específico', async () => {
    const statuses = new Map([
      ['doc-1', { documentId: 'doc-1', step: 'error' as const, progress: 0, error: 'Falha na classificação' }],
    ]);

    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      statuses,
    });

    renderProcessando();

    await waitFor(() => {
      expect(screen.getByText('Falha na classificação')).toBeInTheDocument();
    });
  });

  it('mostra status message baseado em workers ativos - classificando', async () => {
    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      classificationWorkers: 5,
      extractionWorkers: 0,
    });

    renderProcessando();

    await waitFor(() => {
      expect(screen.getByText('Classificando documentos...')).toBeInTheDocument();
    });
  });

  it('mostra status message baseado em workers ativos - extraindo', async () => {
    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      classificationWorkers: 0,
      extractionWorkers: 3,
    });

    renderProcessando();

    await waitFor(() => {
      expect(screen.getByText('Extraindo dados com IA...')).toBeInTheDocument();
    });
  });

  it('mostra status message finalizando quando progresso é 100%', async () => {
    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      overallProgress: 100,
      classificationWorkers: 0,
      extractionWorkers: 0,
    });

    renderProcessando();

    await waitFor(() => {
      expect(screen.getByText('Finalizando...')).toBeInTheDocument();
    });
  });

  it('atualiza barra de progresso com overallProgress', async () => {
    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      overallProgress: 45,
    });

    renderProcessando();

    await waitFor(() => {
      const progressBar = document.querySelector('.bg-primary.rounded-full');
      expect(progressBar).toHaveStyle({ width: '45%' });
    });
  });

  it('exibe indicador animado quando workers estão ativos', async () => {
    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      classificationWorkers: 3,
    });

    renderProcessando();

    await waitFor(() => {
      const pulsingIndicator = document.querySelector('.animate-pulse.bg-blue-500');
      expect(pulsingIndicator).toBeInTheDocument();
    });
  });

  it('exibe múltiplos documentos com diferentes status', async () => {
    const statuses = new Map([
      ['doc-1', { documentId: 'doc-1', step: 'done' as const, progress: 100 }],
      ['doc-2', { documentId: 'doc-2', step: 'extracting' as const, progress: 33 }],
      ['doc-3', { documentId: 'doc-3', step: 'queued' as const, progress: 0 }],
    ]);

    mockUseDocumentPipeline.mockReturnValue({
      ...defaultPipelineReturn,
      statuses,
    });

    renderProcessando();

    await waitFor(() => {
      expect(screen.getByText('Concluído')).toBeInTheDocument();
      expect(screen.getByText('Extraindo dados...')).toBeInTheDocument();
      expect(screen.getByText('Na fila')).toBeInTheDocument();
    });
  });
});
