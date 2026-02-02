import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateEditModal } from './TemplateEditModal';
import type { MinutaPadrao } from '@/types/minutas-padrao';

const mockTemplate: MinutaPadrao = {
  id: 'user-1',
  user_id: 'user-123',
  is_global: false,
  nome: 'Meu Template',
  descricao: 'Descricao original',
  tipo_negocio: 'compra_venda',
  storage_path: 'templates/test.pdf',
  nome_original: 'test.pdf',
  mime_type: 'application/pdf',
  tamanho_bytes: 1024,
  thumbnail_path: null,
  uso_count: 5,
  deleted_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('TemplateEditModal', () => {
  const defaultProps = {
    isOpen: true,
    template: mockTemplate,
    onClose: vi.fn(),
    onSave: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<TemplateEditModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/editar template/i)).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<TemplateEditModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('pre-fills form with template data', () => {
      render(<TemplateEditModal {...defaultProps} />);

      expect(screen.getByDisplayValue('Meu Template')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Descricao original')).toBeInTheDocument();
      // Select trigger shows the selected value
      const selectTrigger = screen.getByRole('combobox', { name: /tipo/i });
      expect(selectTrigger).toHaveTextContent('Compra e Venda');
    });

    it('shows file info (read-only)', () => {
      render(<TemplateEditModal {...defaultProps} />);

      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      // Look for PDF in the file info section
      expect(screen.getByText(/PDF\s*-/i)).toBeInTheDocument();
    });
  });

  describe('Form Editing', () => {
    it('allows editing nome', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      const nomeInput = screen.getByLabelText(/nome/i);
      await userEvent.clear(nomeInput);
      await userEvent.type(nomeInput, 'Nome Atualizado');

      expect(nomeInput).toHaveValue('Nome Atualizado');
    });

    it('allows editing descricao', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      const descInput = screen.getByLabelText(/descricao/i);
      await userEvent.clear(descInput);
      await userEvent.type(descInput, 'Nova descricao');

      expect(descInput).toHaveValue('Nova descricao');
    });

    it('renders tipo_negocio select with correct initial value', () => {
      render(<TemplateEditModal {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox', { name: /tipo/i });

      // Verify initial value is displayed
      expect(selectTrigger).toHaveTextContent('Compra e Venda');
      expect(selectTrigger).not.toBeDisabled();
    });
  });

  describe('Validation', () => {
    it('requires nome field', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      const nomeInput = screen.getByLabelText(/nome/i);
      await userEvent.clear(nomeInput);

      await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

      expect(screen.getByText(/nome.*obrigatorio/i)).toBeInTheDocument();
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('validates nome minimum length', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      const nomeInput = screen.getByLabelText(/nome/i);
      await userEvent.clear(nomeInput);
      await userEvent.type(nomeInput, 'AB');

      await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

      expect(screen.getByText(/minimo.*3/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onSave with updated data', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      // Update nome
      const nomeInput = screen.getByLabelText(/nome/i);
      await userEvent.clear(nomeInput);
      await userEvent.type(nomeInput, 'Nome Atualizado');

      // Submit
      await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

      expect(defaultProps.onSave).toHaveBeenCalledWith('user-1', {
        nome: 'Nome Atualizado',
        descricao: 'Descricao original',
        tipo_negocio: 'compra_venda',
      });
    });

    it('only sends changed fields', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      // Only change descricao
      const descInput = screen.getByLabelText(/descricao/i);
      await userEvent.clear(descInput);
      await userEvent.type(descInput, 'Nova descricao');

      await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

      expect(defaultProps.onSave).toHaveBeenCalledWith('user-1', expect.objectContaining({
        descricao: 'Nova descricao',
      }));
    });

    it('disables save button while loading', () => {
      render(<TemplateEditModal {...defaultProps} isLoading />);

      expect(screen.getByRole('button', { name: /salvar|salvando/i })).toBeDisabled();
    });

    it('shows loading state', () => {
      render(<TemplateEditModal {...defaultProps} isLoading />);

      expect(screen.getByText(/salvando/i)).toBeInTheDocument();
    });
  });

  describe('Cancel/Close', () => {
    it('calls onClose when cancel clicked', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when escape pressed', () => {
      render(<TemplateEditModal {...defaultProps} />);

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('resets form when reopened', async () => {
      const { rerender } = render(<TemplateEditModal {...defaultProps} />);

      // Edit nome
      const nomeInput = screen.getByLabelText(/nome/i);
      await userEvent.clear(nomeInput);
      await userEvent.type(nomeInput, 'Nome Alterado');

      // Close
      rerender(<TemplateEditModal {...defaultProps} isOpen={false} />);

      // Reopen
      rerender(<TemplateEditModal {...defaultProps} isOpen={true} />);

      // Should show original value
      expect(screen.getByDisplayValue('Meu Template')).toBeInTheDocument();
    });
  });
});
