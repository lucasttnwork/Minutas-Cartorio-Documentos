import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Depoimentos } from './Depoimentos';
import { depoimentos } from '../../data/landing-copy';

describe('Depoimentos', () => {
  it('should render the section with correct aria-label', () => {
    render(<Depoimentos />);
    const section = screen.getByTestId('depoimentos');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-label', 'Depoimentos de Clientes');
  });

  it('should render headline and subheadline correctly', () => {
    render(<Depoimentos />);
    const headline = screen.getByTestId('depoimentos-headline');
    const subheadline = screen.getByTestId('depoimentos-subheadline');

    expect(headline).toHaveTextContent(depoimentos.headline);
    expect(subheadline).toHaveTextContent(depoimentos.subheadline);
  });

  it('should render all 4 testimonials', () => {
    render(<Depoimentos />);
    const cards = screen.getAllByTestId(/^depoimento-\d+$/);
    expect(cards).toHaveLength(4);
  });

  it('should render star ratings for each testimonial', () => {
    render(<Depoimentos />);

    depoimentos.testemunhos.forEach((_, index) => {
      const ratingContainer = screen.getByTestId(`depoimento-${index}-rating`);
      expect(ratingContainer).toBeInTheDocument();

      const ariaLabel = `${depoimentos.testemunhos[index].rating} de 5 estrelas`;
      const stars = ratingContainer.querySelector(`[aria-label="${ariaLabel}"]`);
      expect(stars).toBeInTheDocument();
    });
  });

  it('should render testimonial text for each card', () => {
    render(<Depoimentos />);

    depoimentos.testemunhos.forEach((testemunho, index) => {
      const texto = screen.getByTestId(`depoimento-${index}-texto`);
      expect(texto).toHaveTextContent(testemunho.texto);
    });
  });

  it('should render highlight callout for each testimonial', () => {
    render(<Depoimentos />);

    depoimentos.testemunhos.forEach((testemunho, index) => {
      const destaque = screen.getByTestId(`depoimento-${index}-destaque`);
      expect(destaque).toHaveTextContent(testemunho.destaque);
    });
  });

  it('should render results for each testimonial', () => {
    render(<Depoimentos />);

    depoimentos.testemunhos.forEach((testemunho, index) => {
      const resultado = screen.getByTestId(`depoimento-${index}-resultado`);
      expect(resultado).toHaveTextContent(testemunho.resultado);
      expect(resultado).toHaveTextContent('Resultado:');
    });
  });

  it('should render author information for each testimonial', () => {
    render(<Depoimentos />);

    depoimentos.testemunhos.forEach((testemunho, index) => {
      const autor = screen.getByTestId(`depoimento-${index}-autor`);
      const cargo = screen.getByTestId(`depoimento-${index}-cargo`);
      const empresa = screen.getByTestId(`depoimento-${index}-empresa`);

      expect(autor).toHaveTextContent(testemunho.autor);
      expect(cargo).toHaveTextContent(testemunho.cargo);
      expect(empresa).toHaveTextContent(testemunho.empresa);
    });
  });

  it('should render avatar images with correct alt text', () => {
    render(<Depoimentos />);

    depoimentos.testemunhos.forEach((testemunho, index) => {
      const avatar = screen.getByTestId(`depoimento-${index}-avatar`);
      expect(avatar).toHaveAttribute('src', testemunho.avatar);
      expect(avatar).toHaveAttribute('alt', testemunho.autor);
    });
  });

  it('should have correct grid layout classes', () => {
    render(<Depoimentos />);
    const section = screen.getByTestId('depoimentos');
    const gridContainer = section.querySelector('.grid');

    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
  });

  it('should render Quote icon for each testimonial', () => {
    render(<Depoimentos />);
    const cards = screen.getAllByTestId(/^depoimento-\d+$/);

    cards.forEach((card) => {
      const quoteIcon = card.querySelector('svg');
      expect(quoteIcon).toBeInTheDocument();
    });
  });
});
