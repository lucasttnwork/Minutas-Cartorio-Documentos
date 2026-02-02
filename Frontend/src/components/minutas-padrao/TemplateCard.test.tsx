import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateCard } from './TemplateCard';
import type { MinutaPadrao } from '@/types/minutas-padrao';

const mockTemplate: MinutaPadrao = {
  id: '1',
  user_id: 'user-1',
  is_global: false,
  nome: 'Template Teste',
  descricao: 'Descrição do template de teste',
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

const mockGlobalTemplate: MinutaPadrao = {
  ...mockTemplate,
  id: '2',
  user_id: null,
  is_global: true,
  nome: 'Template Global',
};

describe('TemplateCard', () => {
  it('renders template name and description', () => {
    render(<TemplateCard template={mockTemplate} />);

    expect(screen.getByText('Template Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição do template de teste')).toBeInTheDocument();
  });

  it('shows global badge for global templates', () => {
    render(<TemplateCard template={mockGlobalTemplate} />);

    expect(screen.getByText('Global')).toBeInTheDocument();
  });

  it('does not show global badge for user templates', () => {
    render(<TemplateCard template={mockTemplate} />);

    expect(screen.queryByText('Global')).not.toBeInTheDocument();
  });

  it('shows usage count', () => {
    render(<TemplateCard template={mockTemplate} />);

    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it('shows edit and delete buttons for user templates', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TemplateCard
        template={mockTemplate}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByLabelText(/editar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/excluir/i)).toBeInTheDocument();
  });

  it('hides edit and delete buttons for global templates', () => {
    render(<TemplateCard template={mockGlobalTemplate} />);

    expect(screen.queryByLabelText(/editar/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/excluir/i)).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();

    render(<TemplateCard template={mockTemplate} onEdit={onEdit} />);

    fireEvent.click(screen.getByLabelText(/editar/i));
    expect(onEdit).toHaveBeenCalledWith(mockTemplate);
  });

  it('calls onSelect when card is clicked', () => {
    const onSelect = vi.fn();

    render(<TemplateCard template={mockTemplate} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('article'));
    expect(onSelect).toHaveBeenCalledWith(mockTemplate);
  });

  it('shows selected state when isSelected is true', () => {
    render(<TemplateCard template={mockTemplate} isSelected />);

    const card = screen.getByRole('article');
    expect(card).toHaveClass('ring-2');
  });

  it('displays PDF icon for PDF files', () => {
    render(<TemplateCard template={mockTemplate} />);

    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
  });
});
