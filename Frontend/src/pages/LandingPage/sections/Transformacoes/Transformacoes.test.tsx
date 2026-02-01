import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Transformacoes } from './Transformacoes';

describe('Transformacoes', () => {
  it('renderiza sem erros', () => {
    render(<Transformacoes />);
    expect(screen.getByTestId('transformacoes')).toBeInTheDocument();
  });

  it('exibe headline e subheadline', () => {
    render(<Transformacoes />);
    expect(screen.getByTestId('transformacoes-headline')).toBeInTheDocument();
    expect(screen.getByTestId('transformacoes-subheadline')).toBeInTheDocument();
  });

  it('exibe 3 cards de transformação', () => {
    render(<Transformacoes />);
    for (let i = 0; i < 3; i++) {
      expect(screen.getByTestId(`transformacao-card-${i}`)).toBeInTheDocument();
    }
  });

  it('cada card tem antes, depois e métrica', () => {
    const { container } = render(<Transformacoes />);
    const cards = container.querySelectorAll('[data-testid^="transformacao-card-"]');

    expect(cards).toHaveLength(3);

    cards.forEach(card => {
      // Antes (texto "Antes" case-insensitive)
      expect(card.textContent?.toLowerCase()).toContain('antes');

      // Depois (texto "Depois" case-insensitive)
      expect(card.textContent?.toLowerCase()).toContain('depois');

      // Resultado
      expect(card.textContent?.toLowerCase()).toContain('resultado');

      // Ícones (Clock, Zap, TrendingUp)
      const icons = card.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(3);
    });
  });
});
