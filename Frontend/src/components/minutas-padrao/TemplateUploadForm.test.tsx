import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateUploadForm } from './TemplateUploadForm';

// Mock pointer capture for Radix UI compatibility
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

describe('TemplateUploadForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders form with all required fields', () => {
      render(<TemplateUploadForm {...defaultProps} />);

      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
      expect(screen.getByTestId('dropzone')).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      render(<TemplateUploadForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('shows dropzone with instructions', () => {
      render(<TemplateUploadForm {...defaultProps} />);

      expect(screen.getByText(/arraste.*arquivo/i)).toBeInTheDocument();
      expect(screen.getByText(/PDF.*DOCX/i)).toBeInTheDocument();
      expect(screen.getByText(/50MB/i)).toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    it('accepts PDF files', async () => {
      render(<TemplateUploadForm {...defaultProps} />);

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      await userEvent.upload(screen.getByTestId('file-input'), file);

      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('accepts DOCX files', async () => {
      render(<TemplateUploadForm {...defaultProps} />);

      const file = new File(['test'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      await userEvent.upload(screen.getByTestId('file-input'), file);

      expect(screen.getByText('test.docx')).toBeInTheDocument();
    });

    it('rejects invalid file types via drop', async () => {
      render(<TemplateUploadForm {...defaultProps} />);

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const dropzone = screen.getByTestId('dropzone');

      // Simulate dropping an invalid file via the dropzone
      // The dropzone should reject it and show an error
      const dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: 'text/plain', getAsFile: () => file }],
        types: ['Files'],
      };

      fireEvent.drop(dropzone, { dataTransfer });

      // Wait for the error message to appear
      await waitFor(() => {
        expect(screen.getByText(/tipo de arquivo não suportado/i)).toBeInTheDocument();
      });
    });

    it('shows file preview after selection', async () => {
      render(<TemplateUploadForm {...defaultProps} />);

      const file = new File(['test content'], 'documento.pdf', { type: 'application/pdf' });

      await userEvent.upload(screen.getByTestId('file-input'), file);

      expect(screen.getByText('documento.pdf')).toBeInTheDocument();
      expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    });

    it('allows removing selected file', async () => {
      render(<TemplateUploadForm {...defaultProps} />);

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      await userEvent.upload(screen.getByTestId('file-input'), file);

      const removeButton = screen.getByLabelText(/remover arquivo/i);
      await userEvent.click(removeButton);

      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });

    it('has dropzone with proper drag and drop attributes', () => {
      render(<TemplateUploadForm {...defaultProps} />);

      const dropzone = screen.getByTestId('dropzone');

      // Verify dropzone has the necessary attributes for drag-and-drop
      expect(dropzone).toHaveAttribute('tabindex', '0');
      expect(dropzone).toHaveClass('cursor-pointer');
      expect(dropzone).toHaveClass('border-dashed');
    });
  });

  describe('Form Validation', () => {
    it('requires nome field', async () => {
      render(<TemplateUploadForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /salvar/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/nome.*obrigatório/i)).toBeInTheDocument();
    });

    it('requires file to be selected', async () => {
      render(<TemplateUploadForm {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/nome/i), 'Meu Template');

      const submitButton = screen.getByRole('button', { name: /salvar/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/selecione um arquivo/i)).toBeInTheDocument();
    });

    it('validates nome minimum length', async () => {
      render(<TemplateUploadForm {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/nome/i), 'AB');

      const submitButton = screen.getByRole('button', { name: /salvar/i });
      await userEvent.click(submitButton);

      expect(screen.getByText(/mínimo.*3.*caracteres/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with form data and file', async () => {
      const user = userEvent.setup();
      render(<TemplateUploadForm {...defaultProps} />);

      // Fill form
      await user.type(screen.getByLabelText(/nome/i), 'Meu Template');
      await user.type(screen.getByLabelText(/descrição/i), 'Descrição do template');

      // Select tipo - usando keyboard navigation
      const selectTrigger = screen.getByLabelText(/tipo/i);
      await user.click(selectTrigger);
      await user.keyboard('{ArrowUp}{Enter}'); // Select Compra e Venda (first option)

      // Upload file
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(screen.getByTestId('file-input'), file);

      // Submit
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Meu Template',
          descricao: 'Descrição do template',
          tipo_negocio: expect.any(String),
        }),
        expect.any(File)
      );
    });

    it('disables submit button while loading', () => {
      render(<TemplateUploadForm {...defaultProps} isLoading />);

      const submitButton = screen.getByRole('button', { name: /salvar|enviando/i });
      expect(submitButton).toBeDisabled();
    });

    it('shows loading state on submit button', () => {
      render(<TemplateUploadForm {...defaultProps} isLoading />);

      expect(screen.getByText(/enviando/i)).toBeInTheDocument();
    });

    it('calls onCancel when cancel button clicked', async () => {
      render(<TemplateUploadForm {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('Tipo Negocio Select', () => {
    it('renders all tipo options when opened', async () => {
      const user = userEvent.setup();
      render(<TemplateUploadForm {...defaultProps} />);

      await user.click(screen.getByLabelText(/tipo/i));

      // Check for all options using role
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(6); // 6 tipos
    });

    it('defaults to Geral', () => {
      render(<TemplateUploadForm {...defaultProps} />);

      // O SelectValue mostra "Geral" como texto dentro do trigger
      const trigger = screen.getByLabelText(/tipo/i);
      expect(trigger).toHaveTextContent('Geral');
    });
  });

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      render(<TemplateUploadForm {...defaultProps} />);

      expect(screen.getByLabelText(/nome do template/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    });

    it('shows error messages with proper aria attributes', async () => {
      render(<TemplateUploadForm {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /salvar/i }));

      const errorMessage = screen.getByText(/nome.*obrigatório/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });
});
