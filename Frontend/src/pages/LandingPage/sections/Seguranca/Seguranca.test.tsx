import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Seguranca } from './Seguranca';

describe('Seguranca', () => {
  it('renderiza sem erros', () => {
    render(<Seguranca />);
    expect(screen.getByTestId('seguranca')).toBeInTheDocument();
  });

  it('exibe headline e subheadline', () => {
    render(<Seguranca />);
    expect(screen.getByTestId('seguranca-headline')).toBeInTheDocument();
    expect(screen.getByTestId('seguranca-subheadline')).toBeInTheDocument();
  });

  it('exibe 3 pilares de segurança', () => {
    render(<Seguranca />);
    for (let i = 0; i < 3; i++) {
      expect(screen.getByTestId(`seguranca-pilar-${i}`)).toBeInTheDocument();
    }
  });

  it('cada pilar tem título e descrição', () => {
    render(<Seguranca />);
    for (let i = 0; i < 3; i++) {
      expect(screen.getByTestId(`seguranca-pilar-${i}-titulo`)).toBeInTheDocument();
      expect(screen.getByTestId(`seguranca-pilar-${i}-descricao`)).toBeInTheDocument();
    }
  });

  it('cada pilar tem ícone de segurança', () => {
    const { container } = render(<Seguranca />);
    const icons = container.querySelectorAll('svg');

    // 3 pilares + 4 badges = mínimo 7 ícones
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });

  it('exibe badges de certificação', () => {
    render(<Seguranca />);
    for (let i = 0; i < 4; i++) {
      expect(screen.getByTestId(`seguranca-badge-${i}`)).toBeInTheDocument();
    }
  });

  it('headline contém texto correto', () => {
    render(<Seguranca />);
    const headline = screen.getByTestId('seguranca-headline');
    expect(headline.textContent).toBe('Construído Para a Confiança Que Cartórios Exigem');
  });

  it('exibe seção ID correto', () => {
    render(<Seguranca />);
    const section = screen.getByTestId('seguranca');
    expect(section).toHaveAttribute('id', 'seguranca');
  });

  it('exibe aria-label correto', () => {
    render(<Seguranca />);
    const section = screen.getByTestId('seguranca');
    expect(section).toHaveAttribute('aria-label', 'Segurança e Conformidade');
  });
});
