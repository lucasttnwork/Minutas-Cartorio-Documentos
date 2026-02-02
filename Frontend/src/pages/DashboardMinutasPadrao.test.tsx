import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { DashboardMinutasPadrao } from './DashboardMinutasPadrao';
import { useMinutasPadrao } from '@/hooks/useMinutasPadrao';
import type { MinutaPadrao } from '@/types/minutas-padrao';

// Mock hook
vi.mock('@/hooks/useMinutasPadrao');

const mockTemplates: MinutaPadrao[] = [
  {
    id: 'global-1',
    user_id: null,
    is_global: true,
    nome: 'Template Global',
    descricao: 'Descricao global',
    tipo_negocio: 'compra_venda',
    storage_path: 'templates/global.pdf',
    nome_original: 'global.pdf',
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
    nome: 'Meu Template',
    descricao: 'Minha descricao',
    tipo_negocio: 'doacao',
    storage_path: 'templates/meu.pdf',
    nome_original: 'meu.pdf',
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
];

const mockHook = {
  templates: mockTemplates,
  isLoading: false,
  error: null,
  loadTemplates: vi.fn(),
  uploadTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  getDownloadUrl: vi.fn(),
  incrementUsage: vi.fn(),
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DashboardMinutasPadrao', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMinutasPadrao).mockReturnValue(mockHook);
  });

  describe('Layout', () => {
    it('renders page header with title', () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      expect(screen.getByRole('heading', { name: /templates/i })).toBeInTheDocument();
    });

    it('renders add template button', () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      expect(screen.getByRole('button', { name: /adicionar template/i })).toBeInTheDocument();
    });

    it('renders tabs for user and global templates', () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      expect(screen.getByRole('tab', { name: /meus templates/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /templates globais/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton while loading', () => {
      vi.mocked(useMinutasPadrao).mockReturnValue({
        ...mockHook,
        isLoading: true,
        templates: [],
      });

      renderWithRouter(<DashboardMinutasPadrao />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('loads templates on mount', () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      expect(mockHook.loadTemplates).toHaveBeenCalled();
    });
  });

  describe('Tabs - Meus Templates', () => {
    it('shows only user templates in Meus Templates tab', () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      // Default is "Meus Templates"
      expect(screen.getByText('Meu Template')).toBeInTheDocument();
      expect(screen.queryByText('Template Global')).not.toBeInTheDocument();
    });

    it('shows empty state when user has no templates', () => {
      vi.mocked(useMinutasPadrao).mockReturnValue({
        ...mockHook,
        templates: mockTemplates.filter(t => t.is_global),
      });

      renderWithRouter(<DashboardMinutasPadrao />);

      expect(screen.getByText(/nenhum template/i)).toBeInTheDocument();
    });

    it('shows edit and delete buttons for user templates', () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      expect(screen.getByLabelText(/editar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/excluir/i)).toBeInTheDocument();
    });
  });

  describe('Tabs - Templates Globais', () => {
    it('shows only global templates in Templates Globais tab', async () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      // Switch to global tab
      await userEvent.click(screen.getByRole('tab', { name: /templates globais/i }));

      expect(screen.getByText('Template Global')).toBeInTheDocument();
      expect(screen.queryByText('Meu Template')).not.toBeInTheDocument();
    });

    it('does not show edit/delete buttons for global templates', async () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByRole('tab', { name: /templates globais/i }));

      expect(screen.queryByLabelText(/editar/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/excluir/i)).not.toBeInTheDocument();
    });
  });

  describe('Add Template', () => {
    it('opens upload modal when add button clicked', async () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByRole('button', { name: /adicionar template/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /novo template/i })).toBeInTheDocument();
    });

    it('closes modal when cancel clicked', async () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByRole('button', { name: /adicionar template/i }));
      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('calls uploadTemplate and closes modal on submit', async () => {
      mockHook.uploadTemplate.mockResolvedValue(mockTemplates[1]);

      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByRole('button', { name: /adicionar template/i }));

      // Fill form
      await userEvent.type(screen.getByLabelText(/nome/i), 'Novo Template');

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByTestId('file-input');
      await userEvent.upload(fileInput, file);

      await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

      await waitFor(() => {
        expect(mockHook.uploadTemplate).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Template', () => {
    it('opens edit modal when edit button clicked', async () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByLabelText(/editar/i));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/editar template/i)).toBeInTheDocument();
    });

    it('pre-fills edit form with template data', async () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByLabelText(/editar/i));

      expect(screen.getByDisplayValue('Meu Template')).toBeInTheDocument();
    });

    it('calls updateTemplate on save', async () => {
      mockHook.updateTemplate.mockResolvedValue(undefined);

      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByLabelText(/editar/i));

      const nomeInput = screen.getByLabelText(/nome/i);
      await userEvent.clear(nomeInput);
      await userEvent.type(nomeInput, 'Nome Atualizado');

      await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

      await waitFor(() => {
        expect(mockHook.updateTemplate).toHaveBeenCalledWith('user-1', expect.objectContaining({
          nome: 'Nome Atualizado',
        }));
      });
    });
  });

  describe('Delete Template', () => {
    it('opens delete dialog when delete button clicked', async () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByLabelText(/excluir/i));

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('shows template name in delete confirmation', async () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByLabelText(/excluir/i));

      // Within the alert dialog, the template name should appear
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveTextContent(/Meu Template/);
    });

    it('calls deleteTemplate on confirm', async () => {
      mockHook.deleteTemplate.mockResolvedValue(undefined);

      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByLabelText(/excluir/i));
      await userEvent.click(screen.getByRole('button', { name: /excluir/i }));

      await waitFor(() => {
        expect(mockHook.deleteTemplate).toHaveBeenCalledWith('user-1');
      });
    });

    it('closes dialog on cancel', async () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByLabelText(/excluir/i));
      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message on error', () => {
      vi.mocked(useMinutasPadrao).mockReturnValue({
        ...mockHook,
        error: 'Erro ao carregar templates',
      });

      renderWithRouter(<DashboardMinutasPadrao />);

      expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      vi.mocked(useMinutasPadrao).mockReturnValue({
        ...mockHook,
        error: 'Erro',
      });

      renderWithRouter(<DashboardMinutasPadrao />);

      expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    });

    it('reloads templates on retry', async () => {
      vi.mocked(useMinutasPadrao).mockReturnValue({
        ...mockHook,
        error: 'Erro',
      });

      renderWithRouter(<DashboardMinutasPadrao />);

      await userEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

      expect(mockHook.loadTemplates).toHaveBeenCalledTimes(2); // mount + retry
    });
  });

  describe('Filter', () => {
    it('renders filter component', () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      // TemplateFilter renders a combobox
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Responsiveness', () => {
    it('renders template grid', () => {
      renderWithRouter(<DashboardMinutasPadrao />);

      const grid = screen.getByTestId('template-grid');
      expect(grid).toBeInTheDocument();
    });
  });
});
