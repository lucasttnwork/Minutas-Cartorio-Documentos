import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Hero } from './Hero';

describe('Hero Section', () => {
  it('renderiza sem erros', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    expect(screen.getByTestId('hero')).toBeInTheDocument();
  });

  it('exibe headline correta', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    const headline = screen.getByTestId('hero-headline');
    expect(headline).toBeInTheDocument();
    expect(headline.textContent).toBeTruthy();
  });

  it('exibe subheadline correta', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    const subheadline = screen.getByTestId('hero-subheadline');
    expect(subheadline).toBeInTheDocument();
    expect(subheadline.textContent).toBeTruthy();
  });

  it('exibe 4 stats cards', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    for (let i = 0; i < 4; i++) {
      expect(screen.getByTestId(`hero-stat-${i}`)).toBeInTheDocument();
    }
  });

  it('exibe CTAs primário e secundário', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    expect(screen.getByTestId('hero-cta-primary')).toBeInTheDocument();
    expect(screen.getByTestId('hero-cta-secondary')).toBeInTheDocument();
  });

  it('exibe social proof', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    expect(screen.getByTestId('hero-social-proof')).toBeInTheDocument();
  });

  it('CTAs têm os textos corretos', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    const primaryCta = screen.getByTestId('hero-cta-primary');
    const secondaryCta = screen.getByTestId('hero-cta-secondary');

    expect(primaryCta.textContent).toContain('Solicitar Demonstração Gratuita');
    expect(secondaryCta.textContent).toContain('Ver Como Funciona');
  });

  it('stats cards exibem valores corretos', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );

    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('4.9/5')).toBeInTheDocument();
    expect(screen.getByText('2+')).toBeInTheDocument();
  });
});
