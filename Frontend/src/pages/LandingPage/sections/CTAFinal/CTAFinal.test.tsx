import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CTAFinal } from './CTAFinal';
import { ctaFinal } from '../../data/landing-copy';

describe('CTAFinal', () => {
  it('renders the section with correct testid', () => {
    render(<CTAFinal />);
    const section = screen.getByTestId('cta-final');
    expect(section).toBeInTheDocument();
  });

  it('renders the headline correctly', () => {
    render(<CTAFinal />);
    const headline = screen.getByTestId('cta-final-headline');
    expect(headline).toBeInTheDocument();
    expect(headline).toHaveTextContent(ctaFinal.headline);
  });

  it('renders the subheadline correctly', () => {
    render(<CTAFinal />);
    const subheadline = screen.getByTestId('cta-final-subheadline');
    expect(subheadline).toBeInTheDocument();
    expect(subheadline).toHaveTextContent(ctaFinal.subheadline);
  });

  it('renders the primary CTA button', () => {
    render(<CTAFinal />);
    const primaryCta = screen.getByTestId('cta-final-primary');
    expect(primaryCta).toBeInTheDocument();
    expect(primaryCta).toHaveTextContent(ctaFinal.ctaPrimary);
    expect(primaryCta).toHaveAttribute('href', '#contato');
  });

  it('renders the secondary CTA button', () => {
    render(<CTAFinal />);
    const secondaryCta = screen.getByTestId('cta-final-secondary');
    expect(secondaryCta).toBeInTheDocument();
    expect(secondaryCta).toHaveTextContent(ctaFinal.ctaSecondary);
    expect(secondaryCta).toHaveAttribute('href', '#contato');
  });

  it('renders all garantias/trust elements', () => {
    render(<CTAFinal />);

    ctaFinal.garantias.forEach((garantia) => {
      const garantiaElement = screen.getByTestId(`cta-garantia-${garantia.id}`);
      expect(garantiaElement).toBeInTheDocument();
      expect(garantiaElement).toHaveTextContent(garantia.text);
    });
  });

  it('renders the correct number of garantias', () => {
    render(<CTAFinal />);

    const garantiaElements = ctaFinal.garantias.map((g) =>
      screen.getByTestId(`cta-garantia-${g.id}`)
    );

    expect(garantiaElements).toHaveLength(ctaFinal.garantias.length);
  });

  it('has proper accessibility attributes', () => {
    render(<CTAFinal />);
    const section = screen.getByTestId('cta-final');

    expect(section).toHaveAttribute('aria-label', 'Call to Action Final');
    expect(section).toHaveAttribute('id', 'cta-final');
  });

  it('renders with proper structure for responsive design', () => {
    render(<CTAFinal />);
    const section = screen.getByTestId('cta-final');

    // Check that section exists and has proper classes
    expect(section).toBeInTheDocument();
    expect(section.className).toContain('relative');
    expect(section.className).toContain('overflow-hidden');
  });

  it('renders all trust element icons', () => {
    render(<CTAFinal />);

    // Each garantia should have an icon (rendered as SVG)
    const garantiaElements = ctaFinal.garantias.map((g) =>
      screen.getByTestId(`cta-garantia-${g.id}`)
    );

    garantiaElements.forEach((element) => {
      const svg = element.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('matches snapshot', () => {
    const { container } = render(<CTAFinal />);
    expect(container).toMatchSnapshot();
  });
});
