import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateFilter } from './TemplateFilter';
import type { TipoNegocio } from '@/types/minutas-padrao';

describe('TemplateFilter', () => {
  it('renders all tipo_negocio options', () => {
    render(<TemplateFilter value={undefined} onChange={() => {}} />);

    fireEvent.click(screen.getByRole('combobox'));

    // "Todos" appears in both trigger and dropdown, so use getAllByText
    expect(screen.getAllByText('Todos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Compra e Venda')).toBeInTheDocument();
    expect(screen.getByText('Doação')).toBeInTheDocument();
    expect(screen.getByText('Permuta')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    const onChange = vi.fn();

    render(<TemplateFilter value={undefined} onChange={onChange} />);

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Compra e Venda'));

    expect(onChange).toHaveBeenCalledWith('compra_venda');
  });

  it('shows selected value', () => {
    render(<TemplateFilter value="doacao" onChange={() => {}} />);

    expect(screen.getByText('Doação')).toBeInTheDocument();
  });
});
