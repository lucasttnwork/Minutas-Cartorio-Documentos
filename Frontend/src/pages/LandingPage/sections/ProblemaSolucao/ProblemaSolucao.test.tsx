import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProblemaSolucao } from './ProblemaSolucao';

describe('ProblemaSolucao', () => {
  it('renderiza sem erros', () => {
    render(<ProblemaSolucao />);
    expect(screen.getByTestId('problema-solucao')).toBeInTheDocument();
  });

  it('exibe headline e subheadline', () => {
    render(<ProblemaSolucao />);
    expect(screen.getByTestId('problema-solucao-headline')).toBeInTheDocument();
    expect(
      screen.getByTestId('problema-solucao-subheadline')
    ).toBeInTheDocument();
  });

  it('exibe lista de problemas', () => {
    const { container } = render(<ProblemaSolucao />);
    const problemas = container.querySelectorAll(
      '[data-testid^="problema-item-"]'
    );
    expect(problemas.length).toBeGreaterThan(0);
  });

  it('exibe lista de benefícios (solução)', () => {
    const { container } = render(<ProblemaSolucao />);
    const beneficios = container.querySelectorAll(
      '[data-testid^="solucao-item-"]'
    );
    expect(beneficios.length).toBeGreaterThan(0);
  });

  it('cada item tem ícone e texto', () => {
    const { container } = render(<ProblemaSolucao />);
    const items = container.querySelectorAll(
      '[data-testid^="problema-item-"], [data-testid^="solucao-item-"]'
    );

    items.forEach((item) => {
      expect(item.querySelector('svg')).toBeInTheDocument(); // Ícone
      expect(item.querySelector('h4')).toBeInTheDocument(); // Título
      expect(item.querySelector('p')).toBeInTheDocument(); // Descrição
    });
  });

  it('exibe transição entre problemas e soluções', () => {
    const { container } = render(<ProblemaSolucao />);
    const transicao = container.querySelector('.hidden.lg\\:flex');
    expect(transicao).toBeInTheDocument();
  });

  it('problemas têm tema destructive', () => {
    const { container } = render(<ProblemaSolucao />);
    const primeiroProblema = container.querySelector(
      '[data-testid="problema-item-0"]'
    );
    expect(primeiroProblema).toHaveClass('border-destructive/20');
  });

  it('soluções têm tema primary', () => {
    const { container } = render(<ProblemaSolucao />);
    const primeiraSolucao = container.querySelector(
      '[data-testid="solucao-item-0"]'
    );
    expect(primeiraSolucao).toHaveClass('border-primary/20');
  });
});
