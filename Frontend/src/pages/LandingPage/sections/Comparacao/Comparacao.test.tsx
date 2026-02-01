import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Comparacao } from './Comparacao';
import { comparacao } from '../../data/landing-copy';

describe('Comparacao', () => {
  it('renders the section with correct heading', () => {
    render(<Comparacao />);

    expect(screen.getByTestId('comparacao')).toBeInTheDocument();
    expect(screen.getByTestId('comparacao-headline')).toHaveTextContent(
      comparacao.headline
    );
    expect(screen.getByTestId('comparacao-subheadline')).toHaveTextContent(
      comparacao.subheadline
    );
  });

  it('renders all 10 comparison aspects', () => {
    render(<Comparacao />);

    // Desktop view
    for (let i = 0; i < 10; i++) {
      expect(screen.getByTestId(`comparacao-row-${i}`)).toBeInTheDocument();
    }

    // Mobile view
    for (let i = 0; i < 10; i++) {
      expect(screen.getByTestId(`comparacao-card-${i}`)).toBeInTheDocument();
    }
  });

  it('renders correct data for each aspect', () => {
    render(<Comparacao />);

    comparacao.aspectos.forEach((item, index) => {
      // Desktop
      expect(screen.getByTestId(`comparacao-${index}-aspecto`)).toHaveTextContent(
        item.aspecto
      );
      expect(screen.getByTestId(`comparacao-${index}-tradicional`)).toHaveTextContent(
        item.tradicional
      );
      expect(screen.getByTestId(`comparacao-${index}-solucao`)).toHaveTextContent(
        item.comSolucao
      );

      // Mobile
      expect(screen.getByTestId(`comparacao-mobile-${index}-aspecto`)).toHaveTextContent(
        item.aspecto
      );
      expect(screen.getByTestId(`comparacao-mobile-${index}-tradicional`)).toHaveTextContent(
        item.tradicional
      );
      expect(screen.getByTestId(`comparacao-mobile-${index}-solucao`)).toHaveTextContent(
        item.comSolucao
      );
    });
  });

  it('has proper accessibility attributes', () => {
    render(<Comparacao />);

    const section = screen.getByTestId('comparacao');
    expect(section).toHaveAttribute(
      'aria-label',
      'Comparação: Método Tradicional vs Sistema Inteligente'
    );
    expect(section).toHaveAttribute('id', 'comparacao');
  });

  it('renders X icons for traditional method', () => {
    const { container } = render(<Comparacao />);

    // Check for X icons via Lucide React (via class or data-testid indirectly)
    const xIcons = container.querySelectorAll('.lucide-x');
    expect(xIcons.length).toBeGreaterThan(0);
  });

  it('renders Check icons for solution method', () => {
    const { container } = render(<Comparacao />);

    // Check for Check icons via Lucide React
    const checkIcons = container.querySelectorAll('.lucide-check');
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('uses glassmorphism card styling', () => {
    const { container } = render(<Comparacao />);

    const glassCards = container.querySelectorAll('.glass-card');
    expect(glassCards.length).toBeGreaterThan(0);
  });
});
