import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateDeleteDialog } from './TemplateDeleteDialog';
import type { MinutaPadrao } from '@/types/minutas-padrao';

const mockTemplate: MinutaPadrao = {
  id: 'user-1',
  user_id: 'user-123',
  is_global: false,
  nome: 'Meu Template',
  descricao: 'Descricao',
  tipo_negocio: 'compra_venda',
  storage_path: 'templates/test.pdf',
  nome_original: 'test.pdf',
  mime_type: 'application/pdf',
  tamanho_bytes: 1024,
  thumbnail_path: null,
  texto_extraido: null,
  conteudo_markdown: null,
  status_extracao: 'pendente',
  erro_extracao: null,
  extraido_em: null,
  revisado_em: null,
  uso_count: 5,
  deleted_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('TemplateDeleteDialog', () => {
  const defaultProps = {
    isOpen: true,
    template: mockTemplate,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dialog when isOpen is true', () => {
      render(<TemplateDeleteDialog {...defaultProps} />);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<TemplateDeleteDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('shows template name in confirmation message', () => {
      render(<TemplateDeleteDialog {...defaultProps} />);

      expect(screen.getByText(/Meu Template/)).toBeInTheDocument();
    });

    it('shows warning message', () => {
      render(<TemplateDeleteDialog {...defaultProps} />);

      expect(screen.getByText(/esta acao nao pode ser desfeita/i)).toBeInTheDocument();
    });

    it('shows cancel and confirm buttons', () => {
      render(<TemplateDeleteDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /excluir/i })).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('calls onConfirm when confirm button clicked', async () => {
      render(<TemplateDeleteDialog {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /excluir/i }));

      expect(defaultProps.onConfirm).toHaveBeenCalledWith('user-1');
    });

    it('calls onClose when cancel button clicked', async () => {
      render(<TemplateDeleteDialog {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when escape pressed', () => {
      render(<TemplateDeleteDialog {...defaultProps} />);

      fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('disables confirm button while loading', () => {
      render(<TemplateDeleteDialog {...defaultProps} isLoading />);

      expect(screen.getByRole('button', { name: /excluir|excluindo/i })).toBeDisabled();
    });

    it('shows loading indicator', () => {
      render(<TemplateDeleteDialog {...defaultProps} isLoading />);

      expect(screen.getByText(/excluindo/i)).toBeInTheDocument();
    });

    it('disables cancel button while loading', () => {
      render(<TemplateDeleteDialog {...defaultProps} isLoading />);

      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper alertdialog role', () => {
      render(<TemplateDeleteDialog {...defaultProps} />);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('has accessible title', () => {
      render(<TemplateDeleteDialog {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /excluir template/i })).toBeInTheDocument();
    });

    it('confirm button has destructive styling', () => {
      render(<TemplateDeleteDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: /excluir/i });
      expect(confirmButton).toHaveClass('bg-destructive');
    });
  });
});
