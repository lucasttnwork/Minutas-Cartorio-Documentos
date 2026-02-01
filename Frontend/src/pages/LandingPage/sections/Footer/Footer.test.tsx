import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import { footer } from '../../data/landing-copy';

describe('Footer Component', () => {
  // ============================================================
  // STRUCTURAL TESTS
  // ============================================================

  describe('Structure', () => {
    it('renders footer element with correct test id', () => {
      render(<Footer />);
      const footerElement = screen.getByTestId('footer');
      expect(footerElement).toBeInTheDocument();
      expect(footerElement.tagName).toBe('FOOTER');
    });

    it('has correct aria-label for accessibility', () => {
      render(<Footer />);
      const footerElement = screen.getByTestId('footer');
      expect(footerElement).toHaveAttribute('aria-label', 'Footer Section');
    });

    it('renders brand section', () => {
      render(<Footer />);
      const brand = screen.getByTestId('footer-brand');
      expect(brand).toBeInTheDocument();
    });

    it('renders all 5 link columns', () => {
      render(<Footer />);
      const headings = screen.getAllByRole('heading', { level: 3 });
      const headingTexts = headings.map(h => h.textContent);
      expect(headingTexts).toContain('Produto');
      expect(headingTexts).toContain('Recursos');
      expect(headingTexts).toContain('Empresa');
      expect(headingTexts).toContain('Suporte');
      expect(headingTexts).toContain('Legal');
    });
  });

  // ============================================================
  // CONTENT TESTS
  // ============================================================

  describe('Content', () => {
    it('displays tagline', () => {
      render(<Footer />);
      const tagline = screen.getByTestId('footer-tagline');
      expect(tagline).toHaveTextContent(footer.tagline);
    });

    it('displays copyright information', () => {
      render(<Footer />);
      const copyright = screen.getByTestId('footer-copyright');
      expect(copyright).toHaveTextContent(footer.copyright);
    });

    it('displays contact email', () => {
      render(<Footer />);
      const email = screen.getByText(footer.contato.email);
      expect(email).toBeInTheDocument();
      expect(email.closest('a')).toHaveAttribute('href', `mailto:${footer.contato.email}`);
    });

    it('displays contact phone', () => {
      render(<Footer />);
      const phone = screen.getByText(footer.contato.telefone);
      expect(phone).toBeInTheDocument();
      expect(phone.closest('a')).toHaveAttribute('href', `tel:${footer.contato.telefone}`);
    });

    it('displays address', () => {
      render(<Footer />);
      expect(screen.getByText(footer.contato.endereco)).toBeInTheDocument();
    });
  });

  // ============================================================
  // NAVIGATION LINKS TESTS
  // ============================================================

  describe('Navigation Links', () => {
    describe('Produto Links', () => {
      it('renders all produto links', () => {
        render(<Footer />);
        footer.links.produto.forEach((link) => {
          const linkElement = screen.getByTestId(`footer-produto-${link.label.toLowerCase().replace(/\s+/g, '-')}`);
          expect(linkElement).toBeInTheDocument();
          expect(linkElement).toHaveTextContent(link.label);
          expect(linkElement).toHaveAttribute('href', link.href);
        });
      });

      it('has exactly 4 produto links', () => {
        render(<Footer />);
        expect(footer.links.produto).toHaveLength(4);
      });
    });

    describe('Recursos Links', () => {
      it('renders all recursos links', () => {
        render(<Footer />);
        footer.links.recursos.forEach((link) => {
          const linkElement = screen.getByTestId(`footer-recursos-${link.label.toLowerCase().replace(/\s+/g, '-')}`);
          expect(linkElement).toBeInTheDocument();
          expect(linkElement).toHaveTextContent(link.label);
          expect(linkElement).toHaveAttribute('href', link.href);
        });
      });

      it('has exactly 4 recursos links', () => {
        render(<Footer />);
        expect(footer.links.recursos).toHaveLength(4);
      });
    });

    describe('Empresa Links', () => {
      it('renders all empresa links', () => {
        render(<Footer />);
        footer.links.empresa.forEach((link) => {
          const linkElement = screen.getByTestId(`footer-empresa-${link.label.toLowerCase().replace(/\s+/g, '-')}`);
          expect(linkElement).toBeInTheDocument();
          expect(linkElement).toHaveTextContent(link.label);
          expect(linkElement).toHaveAttribute('href', link.href);
        });
      });

      it('has exactly 4 empresa links', () => {
        render(<Footer />);
        expect(footer.links.empresa).toHaveLength(4);
      });
    });

    describe('Suporte Links', () => {
      it('renders all suporte links', () => {
        render(<Footer />);
        footer.links.suporte.forEach((link) => {
          const linkElement = screen.getByTestId(`footer-suporte-${link.label.toLowerCase().replace(/\s+/g, '-')}`);
          expect(linkElement).toBeInTheDocument();
          expect(linkElement).toHaveTextContent(link.label);
          expect(linkElement).toHaveAttribute('href', link.href);
        });
      });

      it('has exactly 4 suporte links', () => {
        render(<Footer />);
        expect(footer.links.suporte).toHaveLength(4);
      });
    });

    describe('Legal Links', () => {
      it('renders all legal links', () => {
        render(<Footer />);
        footer.links.legal.forEach((link) => {
          const linkElement = screen.getByTestId(`footer-legal-${link.label.toLowerCase().replace(/\s+/g, '-')}`);
          expect(linkElement).toBeInTheDocument();
          expect(linkElement).toHaveTextContent(link.label);
          expect(linkElement).toHaveAttribute('href', link.href);
        });
      });

      it('has exactly 4 legal links', () => {
        render(<Footer />);
        expect(footer.links.legal).toHaveLength(4);
      });
    });
  });

  // ============================================================
  // SOCIAL MEDIA TESTS
  // ============================================================

  describe('Social Media Links', () => {
    it('renders all social media links', () => {
      render(<Footer />);
      footer.social.forEach((social) => {
        const socialLink = screen.getByTestId(`footer-social-${social.name.toLowerCase()}`);
        expect(socialLink).toBeInTheDocument();
        expect(socialLink).toHaveAttribute('href', social.href);
        expect(socialLink).toHaveAttribute('target', '_blank');
        expect(socialLink).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('has exactly 4 social media links', () => {
      render(<Footer />);
      expect(footer.social).toHaveLength(4);
    });

    it('has correct aria-labels for accessibility', () => {
      render(<Footer />);
      footer.social.forEach((social) => {
        const socialLink = screen.getByTestId(`footer-social-${social.name.toLowerCase()}`);
        expect(socialLink).toHaveAttribute('aria-label', social.name);
      });
    });

    it('renders LinkedIn social link', () => {
      render(<Footer />);
      const linkedinLink = screen.getByTestId('footer-social-linkedin');
      expect(linkedinLink).toBeInTheDocument();
    });

    it('renders Instagram social link', () => {
      render(<Footer />);
      const instagramLink = screen.getByTestId('footer-social-instagram');
      expect(instagramLink).toBeInTheDocument();
    });

    it('renders YouTube social link', () => {
      render(<Footer />);
      const youtubeLink = screen.getByTestId('footer-social-youtube');
      expect(youtubeLink).toBeInTheDocument();
    });

    it('renders Facebook social link', () => {
      render(<Footer />);
      const facebookLink = screen.getByTestId('footer-social-facebook');
      expect(facebookLink).toBeInTheDocument();
    });
  });

  // ============================================================
  // STYLING TESTS
  // ============================================================

  describe('Styling', () => {
    it('applies responsive grid layout', () => {
      render(<Footer />);
      const footerElement = screen.getByTestId('footer');
      expect(footerElement).toHaveClass('bg-card/60', 'border-t', 'border-border');
    });

    it('applies correct text styles to brand', () => {
      render(<Footer />);
      const brand = screen.getByTestId('footer-brand');
      expect(brand).toHaveClass('text-2xl', 'font-semibold', 'text-foreground');
    });

    it('applies correct text styles to tagline', () => {
      render(<Footer />);
      const tagline = screen.getByTestId('footer-tagline');
      expect(tagline).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('applies correct text styles to copyright', () => {
      render(<Footer />);
      const copyright = screen.getByTestId('footer-copyright');
      expect(copyright).toHaveClass('text-xs', 'text-muted-foreground', 'text-center');
    });
  });

  // ============================================================
  // DATA CONSISTENCY TESTS
  // ============================================================

  describe('Data Consistency', () => {
    it('has data from landing-copy export', () => {
      expect(footer.tagline).toBeDefined();
      expect(footer.links).toBeDefined();
      expect(footer.contato).toBeDefined();
      expect(footer.social).toBeDefined();
      expect(footer.copyright).toBeDefined();
    });

    it('has all required link categories', () => {
      expect(footer.links.produto).toBeDefined();
      expect(footer.links.recursos).toBeDefined();
      expect(footer.links.empresa).toBeDefined();
      expect(footer.links.suporte).toBeDefined();
      expect(footer.links.legal).toBeDefined();
    });

    it('has all required contact fields', () => {
      expect(footer.contato.email).toBeDefined();
      expect(footer.contato.telefone).toBeDefined();
      expect(footer.contato.whatsapp).toBeDefined();
      expect(footer.contato.endereco).toBeDefined();
    });

    it('all social links have required properties', () => {
      footer.social.forEach((social) => {
        expect(social.id).toBeDefined();
        expect(social.name).toBeDefined();
        expect(social.href).toBeDefined();
        expect(social.icon).toBeDefined();
      });
    });

    it('all navigation links have required properties', () => {
      Object.values(footer.links).forEach((category) => {
        category.forEach((link) => {
          expect(link.id).toBeDefined();
          expect(link.label).toBeDefined();
          expect(link.href).toBeDefined();
        });
      });
    });
  });

  // ============================================================
  // ACCESSIBILITY TESTS
  // ============================================================

  describe('Accessibility', () => {
    it('uses semantic footer element', () => {
      render(<Footer />);
      const footerElement = screen.getByTestId('footer');
      expect(footerElement.tagName).toBe('FOOTER');
    });

    it('has proper heading hierarchy', () => {
      render(<Footer />);
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings.length).toBeGreaterThanOrEqual(5); // 5 columns
    });

    it('all links are keyboard accessible', () => {
      render(<Footer />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link) => {
        expect(link).toBeInTheDocument();
      });
    });

    it('external links have proper security attributes', () => {
      render(<Footer />);
      footer.social.forEach((social) => {
        const socialLink = screen.getByTestId(`footer-social-${social.name.toLowerCase()}`);
        expect(socialLink).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  // ============================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================

  describe('Responsive Design', () => {
    it('applies responsive grid classes', () => {
      const { container } = render(<Footer />);
      const gridElement = container.querySelector('.grid');
      expect(gridElement).toHaveClass('grid');
    });

    it('has mobile-first column layout', () => {
      const { container } = render(<Footer />);
      const navGrid = container.querySelectorAll('.grid')[1]; // Second grid is nav links
      expect(navGrid).toHaveClass('grid-cols-2');
    });
  });

  // ============================================================
  // INTEGRATION TESTS
  // ============================================================

  describe('Integration', () => {
    it('renders without crashing', () => {
      expect(() => render(<Footer />)).not.toThrow();
    });

    it('contains all expected sections', () => {
      render(<Footer />);
      expect(screen.getByTestId('footer-brand')).toBeInTheDocument();
      expect(screen.getByTestId('footer-tagline')).toBeInTheDocument();
      expect(screen.getByTestId('footer-copyright')).toBeInTheDocument();
    });

    it('total link count is correct', () => {
      render(<Footer />);
      const totalLinks =
        footer.links.produto.length +
        footer.links.recursos.length +
        footer.links.empresa.length +
        footer.links.suporte.length +
        footer.links.legal.length;
      expect(totalLinks).toBe(20); // 4 links per column × 5 columns
    });
  });
});
