import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialProofBar } from './SocialProofBar';

describe('SocialProofBar', () => {
  it('renderiza sem erros', () => {
    render(<SocialProofBar />);
    expect(screen.getByTestId('social-proof-bar')).toBeInTheDocument();
  });

  it('exibe 6 badges', () => {
    render(<SocialProofBar />);
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`social-proof-badge-${i}`)).toBeInTheDocument();
    }
  });

  it('cada badge tem ícone e texto', () => {
    const { container } = render(<SocialProofBar />);
    const badges = container.querySelectorAll('[data-testid^="social-proof-badge-"]');

    badges.forEach(badge => {
      expect(badge.querySelector('svg')).toBeInTheDocument(); // Ícone
      expect(badge.querySelector('span')).toBeInTheDocument(); // Texto
    });
  });

  it('exibe headline de confiança', () => {
    render(<SocialProofBar />);
    expect(screen.getByText('Confiado por profissionais de cartórios em todo o Brasil')).toBeInTheDocument();
  });

  it('aplica classes de responsividade corretas', () => {
    const { container } = render(<SocialProofBar />);
    const gridContainer = container.querySelector('.grid-cols-1');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('sm:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-3');
    expect(gridContainer).toHaveClass('xl:grid-cols-6');
  });

  it('exibe o indicador de confiança inferior com avatares', () => {
    const { container } = render(<SocialProofBar />);
    const avatars = container.querySelectorAll('.rounded-full.bg-gradient-to-br');
    expect(avatars.length).toBe(4);

    const confianciaTexts = screen.getAllByText(/Confiado por/);
    expect(confianciaTexts.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/150\+/)).toBeInTheDocument();
    expect(screen.getByText(/escreventes/)).toBeInTheDocument();
  });

  it('badges possuem animação de hover', () => {
    const { container } = render(<SocialProofBar />);
    const badge = screen.getByTestId('social-proof-badge-0');
    expect(badge).toHaveClass('group');

    // Verifica se o badge tem as classes de transição
    const badgeContainer = badge.querySelector('div.flex.items-center');
    expect(badgeContainer).toHaveClass('transition-all');
    expect(badgeContainer).toHaveClass('group-hover:shadow-md');
  });

  it('possui elementos decorativos de fundo', () => {
    const { container } = render(<SocialProofBar />);
    const decorativeElements = container.querySelectorAll('.blur-3xl');
    expect(decorativeElements.length).toBeGreaterThanOrEqual(2);
  });

  it('badges exibem os textos corretos do landing copy', () => {
    render(<SocialProofBar />);

    expect(screen.getByText('100% Conforme LGPD')).toBeInTheDocument();
    expect(screen.getByText('Validado por Tabeliães')).toBeInTheDocument();
    expect(screen.getByText('Dados Hospedados no Brasil')).toBeInTheDocument();
    expect(screen.getByText('Sigilo Notarial Garantido')).toBeInTheDocument();
    expect(screen.getByText('Modelos Aprovados CNJ')).toBeInTheDocument();
    expect(screen.getByText('Suporte Dedicado 24/7')).toBeInTheDocument();
  });

  it('possui a estrutura semântica correta', () => {
    render(<SocialProofBar />);
    const section = screen.getByTestId('social-proof-bar');

    expect(section.tagName).toBe('SECTION');
    expect(section).toHaveAttribute('aria-label', 'Social Proof');
  });
});
