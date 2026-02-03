import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateSelectionModal } from './TemplateSelectionModal';
import type { MinutaPadrao } from '@/types/minutas-padrao';

// Mock templates data
const mockTemplates: MinutaPadrao[] = [
  {
    id: 'global-1',
    user_id: null,
    is_global: true,
    nome: 'Compra e Venda Padrão',
    descricao: 'Template padrão para escrituras de compra e venda',
    tipo_negocio: 'compra_venda',
    storage_path: 'templates/global/compra-venda.pdf',
    nome_original: 'compra-venda.pdf',
    mime_type: 'application/pdf',
    tamanho_bytes: 1024,
    thumbnail_path: null,
    texto_extraido: null,
    conteudo_markdown: null,
    status_extracao: 'pendente',
    erro_extracao: null,
    extraido_em: null,
    revisado_em: null,
    uso_count: 100,
    deleted_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-1',
    user_id: 'user-123',
    is_global: false,
    nome: 'Meu Template Personalizado',
    descricao: 'Template customizado',
    tipo_negocio: 'compra_venda',
    storage_path: 'templates/user/custom.pdf',
    nome_original: 'custom.pdf',
    mime_type: 'application/pdf',
    tamanho_bytes: 2048,
    thumbnail_path: null,
    texto_extraido: null,
    conteudo_markdown: null,
    status_extracao: 'pendente',
    erro_extracao: null,
    extraido_em: null,
    revisado_em: null,
    uso_count: 5,
    deleted_at: null,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'global-2',
    user_id: null,
    is_global: true,
    nome: 'Doação Simples',
    descricao: 'Template para doação simples',
    tipo_negocio: 'doacao',
    storage_path: 'templates/global/doacao.pdf',
    nome_original: 'doacao.pdf',
    mime_type: 'application/pdf',
    tamanho_bytes: 1536,
    thumbnail_path: null,
    texto_extraido: null,
    conteudo_markdown: null,
    status_extracao: 'pendente',
    erro_extracao: null,
    extraido_em: null,
    revisado_em: null,
    uso_count: 50,
    deleted_at: null,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

// Mock do hook - será implementado depois
vi.mock('@/hooks/useMinutasPadrao', () => ({
  useMinutasPadrao: vi.fn(() => ({
    templates: mockTemplates,
    isLoading: false,
    error: null,
    loadTemplates: vi.fn(),
  })),
}));

// Import mock after vi.mock
import { useMinutasPadrao } from '@/hooks/useMinutasPadrao';

describe('TemplateSelectionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default state
    vi.mocked(useMinutasPadrao).mockReturnValue({
      templates: mockTemplates,
      isLoading: false,
      error: null,
      loadTemplates: vi.fn(),
    });
  });

  it('renders modal when isOpen is true', () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Selecionar Template')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<TemplateSelectionModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays all templates', () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    expect(screen.getByText('Compra e Venda Padrão')).toBeInTheDocument();
    expect(screen.getByText('Meu Template Personalizado')).toBeInTheDocument();
  });

  it('shows global templates first with badge', () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveTextContent('Compra e Venda Padrão');
    expect(cards[0]).toHaveTextContent('Global');
  });

  it('allows selecting a template', () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Compra e Venda Padrão'));

    // Should show visual selection state
    const selectedCard = screen.getAllByRole('article')[0];
    expect(selectedCard).toHaveClass('ring-2');
  });

  it('calls onSelect with selected template when confirm button clicked', () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    // Select a template
    fireEvent.click(screen.getByText('Compra e Venda Padrão'));

    // Click confirm button
    fireEvent.click(screen.getByText('Selecionar'));

    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('disables confirm button when no template selected', () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    const confirmButton = screen.getByText('Selecionar');
    expect(confirmButton).toBeDisabled();
  });

  it('calls onClose when cancel button clicked', () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancelar'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking outside modal', () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    // Click on overlay
    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('filters templates by tipo_negocio', async () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    // Open filter dropdown
    fireEvent.click(screen.getByRole('combobox'));

    // Select "Doação" filter - use role option to target the dropdown item specifically
    const doacaoOption = screen.getByRole('option', { name: 'Doação' });
    fireEvent.click(doacaoOption);

    await waitFor(() => {
      // Should only show doacao templates
      expect(screen.getByText('Doação Simples')).toBeInTheDocument();
      // Should not show compra_venda templates
      expect(screen.queryByText('Compra e Venda Padrão')).not.toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    vi.mocked(useMinutasPadrao).mockReturnValue({
      templates: [],
      isLoading: true,
      error: null,
      loadTemplates: vi.fn(),
    });

    render(<TemplateSelectionModal {...defaultProps} />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('shows empty state when no templates match filter', async () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    // Filter by tipo that has no templates
    fireEvent.click(screen.getByRole('combobox'));
    const inventarioOption = screen.getByRole('option', { name: 'Inventário' });
    fireEvent.click(inventarioOption);

    await waitFor(() => {
      expect(screen.getByText(/nenhum template/i)).toBeInTheDocument();
    });
  });

  it('has accessible modal structure', () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('supports keyboard navigation - Escape closes modal', () => {
    render(<TemplateSelectionModal {...defaultProps} />);

    // Press Escape to close
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('preselects template if initialSelectedId provided', () => {
    render(
      <TemplateSelectionModal
        {...defaultProps}
        initialSelectedId="global-1"
      />
    );

    const selectedCard = screen.getAllByRole('article')[0];
    expect(selectedCard).toHaveClass('ring-2');
  });

  it('shows error state when error occurs', () => {
    vi.mocked(useMinutasPadrao).mockReturnValue({
      templates: [],
      isLoading: false,
      error: new Error('Falha ao carregar templates'),
      loadTemplates: vi.fn(),
    });

    render(<TemplateSelectionModal {...defaultProps} />);

    expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
  });

  it('resets selection when modal is closed and reopened', () => {
    const { rerender } = render(<TemplateSelectionModal {...defaultProps} />);

    // Select a template
    fireEvent.click(screen.getByText('Compra e Venda Padrão'));

    // Close modal
    rerender(<TemplateSelectionModal {...defaultProps} isOpen={false} />);

    // Reopen modal
    rerender(<TemplateSelectionModal {...defaultProps} isOpen={true} />);

    // Confirm button should be disabled again
    const confirmButton = screen.getByText('Selecionar');
    expect(confirmButton).toBeDisabled();
  });
});
