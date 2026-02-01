import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Recursos } from './Recursos';

describe('Recursos', () => {
  it('renderiza sem erros', () => {
    render(<Recursos />);
    expect(screen.getByTestId('recursos')).toBeInTheDocument();
  });

  it('exibe headline e subheadline', () => {
    render(<Recursos />);
    expect(screen.getByTestId('recursos-headline')).toBeInTheDocument();
    expect(screen.getByTestId('recursos-subheadline')).toBeInTheDocument();
  });

  it('exibe 8 cards de recursos', () => {
    render(<Recursos />);
    for (let i = 0; i < 8; i++) {
      expect(screen.getByTestId(`recurso-card-${i}`)).toBeInTheDocument();
    }
  });

  it('cada card tem título, descrição e benefício', () => {
    render(<Recursos />);
    for (let i = 0; i < 8; i++) {
      expect(screen.getByTestId(`recurso-card-${i}-titulo`)).toBeInTheDocument();
      expect(screen.getByTestId(`recurso-card-${i}-descricao`)).toBeInTheDocument();
      expect(screen.getByTestId(`recurso-card-${i}-beneficio`)).toBeInTheDocument();
    }
  });

  it('cada card tem ícone', () => {
    const { container } = render(<Recursos />);
    const icons = container.querySelectorAll('svg');

    // 8 cards devem ter 8 ícones
    expect(icons.length).toBeGreaterThanOrEqual(8);
  });

  it('headline contém texto correto', () => {
    render(<Recursos />);
    const headline = screen.getByTestId('recursos-headline');
    expect(headline.textContent).toBe('Tudo Que Você Precisa Para Trabalhar Melhor');
  });

  it('exibe seção ID correto', () => {
    render(<Recursos />);
    const section = screen.getByTestId('recursos');
    expect(section).toHaveAttribute('id', 'recursos');
  });

  it('exibe aria-label correto', () => {
    render(<Recursos />);
    const section = screen.getByTestId('recursos');
    expect(section).toHaveAttribute('aria-label', 'Recursos e Benefícios');
  });
});
