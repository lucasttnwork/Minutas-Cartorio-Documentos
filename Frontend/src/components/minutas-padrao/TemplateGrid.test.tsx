import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemplateGrid } from './TemplateGrid';
import type { MinutaPadrao } from '@/types/minutas-padrao';

const mockTemplates: MinutaPadrao[] = [
  {
    id: '1',
    user_id: null,
    is_global: true,
    nome: 'Template Global',
    descricao: 'Descrição global',
    tipo_negocio: 'compra_venda',
    storage_path: 'templates/global.pdf',
    nome_original: 'global.pdf',
    mime_type: 'application/pdf',
    tamanho_bytes: 1024,
    thumbnail_path: null,
    uso_count: 10,
    deleted_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    is_global: false,
    nome: 'Meu Template',
    descricao: 'Minha descrição',
    tipo_negocio: 'doacao',
    storage_path: 'templates/meu.pdf',
    nome_original: 'meu.pdf',
    mime_type: 'application/pdf',
    tamanho_bytes: 2048,
    thumbnail_path: null,
    uso_count: 3,
    deleted_at: null,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

describe('TemplateGrid', () => {
  it('renders all templates', () => {
    render(<TemplateGrid templates={mockTemplates} />);

    expect(screen.getByText('Template Global')).toBeInTheDocument();
    expect(screen.getByText('Meu Template')).toBeInTheDocument();
  });

  it('shows global templates first', () => {
    render(<TemplateGrid templates={mockTemplates} />);

    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveTextContent('Template Global');
  });

  it('shows loading state', () => {
    render(<TemplateGrid templates={[]} isLoading />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('shows empty state when no templates', () => {
    render(<TemplateGrid templates={[]} emptyMessage="Nenhum template encontrado" />);

    expect(screen.getByText('Nenhum template encontrado')).toBeInTheDocument();
  });

  it('applies responsive grid classes', () => {
    render(<TemplateGrid templates={mockTemplates} />);

    const grid = screen.getByTestId('template-grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });
});
