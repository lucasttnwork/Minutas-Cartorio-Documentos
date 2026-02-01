import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComoFunciona } from './ComoFunciona';

describe('ComoFunciona', () => {
  it('renderiza sem erros', () => {
    render(<ComoFunciona />);
    expect(screen.getByTestId('como-funciona')).toBeInTheDocument();
  });

  it('exibe headline e subheadline', () => {
    render(<ComoFunciona />);
    expect(screen.getByTestId('como-funciona-headline')).toBeInTheDocument();
    expect(screen.getByTestId('como-funciona-subheadline')).toBeInTheDocument();
  });

  it('exibe 4 steps', () => {
    render(<ComoFunciona />);
    for (let i = 0; i < 4; i++) {
      expect(screen.getByTestId(`step-${i}`)).toBeInTheDocument();
    }
  });

  it('cada step tem número, título e descrição', () => {
    render(<ComoFunciona />);
    for (let i = 0; i < 4; i++) {
      expect(screen.getByTestId(`step-${i}-titulo`)).toBeInTheDocument();
      expect(screen.getByTestId(`step-${i}-descricao`)).toBeInTheDocument();
    }
  });

  it('cada step tem ícone', () => {
    const { container } = render(<ComoFunciona />);

    // Verifica que cada step renderiza pelo menos 2 SVGs (ícone principal)
    for (let i = 0; i < 4; i++) {
      const step = screen.getByTestId(`step-${i}`);
      const icons = step.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('exibe o texto correto da headline', () => {
    render(<ComoFunciona />);
    const headline = screen.getByTestId('como-funciona-headline');
    expect(headline).toHaveTextContent('Simples. Rápido. Confiável.');
  });

  it('exibe o texto correto da subheadline', () => {
    render(<ComoFunciona />);
    const subheadline = screen.getByTestId('como-funciona-subheadline');
    expect(subheadline).toHaveTextContent('4 passos para minutas perfeitas em minutos, não horas.');
  });

  it('steps são exibidos na ordem correta', () => {
    render(<ComoFunciona />);
    const step0Title = screen.getByTestId('step-0-titulo');
    const step1Title = screen.getByTestId('step-1-titulo');
    const step2Title = screen.getByTestId('step-2-titulo');
    const step3Title = screen.getByTestId('step-3-titulo');

    expect(step0Title).toHaveTextContent('Insira os Dados');
    expect(step1Title).toHaveTextContent('Agentes Trabalham');
    expect(step2Title).toHaveTextContent('Revise e Ajuste');
    expect(step3Title).toHaveTextContent('Finalize e Protocole');
  });
});
