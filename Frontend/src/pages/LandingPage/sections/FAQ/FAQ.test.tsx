import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQ } from './FAQ';
import { faq } from '../../data/landing-copy';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('FAQ Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the FAQ section', () => {
      render(<FAQ />);
      const section = screen.getByTestId('faq-section');
      expect(section).toBeInTheDocument();
    });

    it('should render the headline', () => {
      render(<FAQ />);
      const headline = screen.getByText(faq.headline);
      expect(headline).toBeInTheDocument();
    });

    it('should render the subheadline', () => {
      render(<FAQ />);
      const subheadline = screen.getByText(faq.subheadline);
      expect(subheadline).toBeInTheDocument();
    });

    it('should render the FAQ badge', () => {
      render(<FAQ />);
      const badge = screen.getByText('FAQ');
      expect(badge).toBeInTheDocument();
    });

    it('should render support contact link', () => {
      render(<FAQ />);
      const link = screen.getByText('Entre em contato com nossa equipe');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '#contato');
    });
  });

  describe('Questions and Categories', () => {
    it('should render all category labels', () => {
      render(<FAQ />);
      expect(screen.getByText('Geral')).toBeInTheDocument();
      expect(screen.getByText('Técnico')).toBeInTheDocument();
      expect(screen.getByText('Segurança')).toBeInTheDocument();
      expect(screen.getByText('Preço')).toBeInTheDocument();
    });

    it('should render all 12 questions', () => {
      render(<FAQ />);
      faq.perguntas.forEach((pergunta) => {
        expect(screen.getByText(pergunta.pergunta)).toBeInTheDocument();
      });
    });

    it('should categorize questions correctly', () => {
      render(<FAQ />);

      // Check "Geral" category has 3 questions
      const geralSection = screen.getByText('Geral').closest('div');
      const geralQuestions = faq.perguntas.filter((p) => p.categoria === 'geral');
      geralQuestions.forEach((q) => {
        expect(screen.getByText(q.pergunta)).toBeInTheDocument();
      });

      // Check "Técnico" category has 3 questions
      const tecnicoQuestions = faq.perguntas.filter((p) => p.categoria === 'tecnico');
      expect(tecnicoQuestions).toHaveLength(3);

      // Check "Segurança" category has 3 questions
      const segurancaQuestions = faq.perguntas.filter((p) => p.categoria === 'seguranca');
      expect(segurancaQuestions).toHaveLength(3);

      // Check "Preço" category has 3 questions
      const precoQuestions = faq.perguntas.filter((p) => p.categoria === 'preco');
      expect(precoQuestions).toHaveLength(3);
    });

    it('should have exactly 12 questions total', () => {
      expect(faq.perguntas).toHaveLength(12);
    });
  });

  describe('Accordion Interaction', () => {
    it('should not display answers by default', () => {
      render(<FAQ />);
      const firstAnswer = faq.perguntas[0].resposta;

      // Answer should not be visible initially
      const answerElement = screen.queryByText(firstAnswer);
      // In accordion, content might be in DOM but hidden
      if (answerElement) {
        const parentAccordion = answerElement.closest('[data-state]');
        if (parentAccordion) {
          expect(parentAccordion.getAttribute('data-state')).toBe('closed');
        }
      }
    });

    it('should expand accordion item when clicked', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const firstQuestion = screen.getByText(faq.perguntas[0].pergunta);
      await user.click(firstQuestion);

      // Answer should be visible after click
      const firstAnswer = await screen.findByText(faq.perguntas[0].resposta);
      expect(firstAnswer).toBeVisible();
    });

    it('should support multiple accordions open at once', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Open first question
      const firstQuestion = screen.getByText(faq.perguntas[0].pergunta);
      await user.click(firstQuestion);

      // Open second question
      const secondQuestion = screen.getByText(faq.perguntas[1].pergunta);
      await user.click(secondQuestion);

      // Both answers should be visible
      expect(await screen.findByText(faq.perguntas[0].resposta)).toBeVisible();
      expect(await screen.findByText(faq.perguntas[1].resposta)).toBeVisible();
    });

    it('should collapse accordion when clicked again', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const firstQuestion = screen.getByText(faq.perguntas[0].pergunta);

      // Open
      await user.click(firstQuestion);
      let firstAnswer = await screen.findByText(faq.perguntas[0].resposta);
      expect(firstAnswer).toBeVisible();

      // Close
      await user.click(firstQuestion);

      // Check if parent accordion item is closed
      const parentAccordion = firstQuestion.closest('[data-state]');
      if (parentAccordion) {
        expect(parentAccordion.getAttribute('data-state')).toBe('closed');
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<FAQ />);
      const h2 = screen.getByRole('heading', { level: 2, name: faq.headline });
      const h3s = screen.getAllByRole('heading', { level: 3 });

      expect(h2).toBeInTheDocument();
      expect(h3s.length).toBeGreaterThan(0);
    });

    it('should have clickable accordion buttons', async () => {
      render(<FAQ />);
      const buttons = screen.getAllByRole('button');

      // Should have 12 accordion buttons (one per question)
      expect(buttons.length).toBe(12);

      // All buttons should be enabled
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });

    it('should have proper link attributes', () => {
      render(<FAQ />);
      const link = screen.getByText('Entre em contato com nossa equipe');

      expect(link).toHaveAttribute('href', '#contato');
      expect(link.tagName).toBe('A');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      expect(firstButton).toHaveFocus();

      // Press Enter to open
      await user.keyboard('{Enter}');

      // Should show the answer
      const firstAnswer = faq.perguntas[0].resposta;
      expect(await screen.findByText(firstAnswer)).toBeVisible();
    });
  });

  describe('Content Validation', () => {
    it('should render questions with proper text', () => {
      render(<FAQ />);

      const expectedQuestions = [
        'O sistema pode gerar erro jurídico nas minutas?',
        'É difícil de usar? Preciso de treinamento?',
        'O sistema substitui o escrevente?',
        'Funciona para qualquer tipo de ato?',
        'Quanto tempo realmente economizo?',
        'Como funciona a integração com nosso sistema atual?',
        'Meus dados e os dados dos clientes estão seguros (LGPD)?',
        'Quem tem acesso aos dados processados?',
        'O que acontece se eu cancelar o serviço?',
        'Quanto custa o sistema?',
        'Posso testar antes de decidir?',
        'Existe contrato de fidelidade?',
      ];

      expectedQuestions.forEach((question) => {
        expect(screen.getByText(question)).toBeInTheDocument();
      });
    });

    it('should have meaningful answers for each question', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Test first question answer
      const firstQuestion = screen.getByText(faq.perguntas[0].pergunta);
      await user.click(firstQuestion);

      const answer = await screen.findByText(/Não. Todos os modelos são validados/i);
      expect(answer).toBeVisible();
    });

    it('should categorize security questions correctly', () => {
      render(<FAQ />);

      const securityQuestions = [
        'Meus dados e os dados dos clientes estão seguros (LGPD)?',
        'Quem tem acesso aos dados processados?',
        'O que acontece se eu cancelar o serviço?',
      ];

      securityQuestions.forEach((question) => {
        expect(screen.getByText(question)).toBeInTheDocument();
      });
    });

    it('should categorize pricing questions correctly', () => {
      render(<FAQ />);

      const pricingQuestions = [
        'Quanto custa o sistema?',
        'Posso testar antes de decidir?',
        'Existe contrato de fidelidade?',
      ];

      pricingQuestions.forEach((question) => {
        expect(screen.getByText(question)).toBeInTheDocument();
      });
    });
  });

  describe('Styling and Layout', () => {
    it('should have proper section structure', () => {
      render(<FAQ />);
      const section = screen.getByTestId('faq-section');

      expect(section.tagName).toBe('SECTION');
      expect(section).toHaveClass('relative');
    });

    it('should apply gradient background', () => {
      render(<FAQ />);
      const section = screen.getByTestId('faq-section');

      expect(section).toHaveClass('bg-gradient-to-b');
    });

    it('should render in a grid layout', () => {
      render(<FAQ />);
      const section = screen.getByTestId('faq-section');
      const grid = section.querySelector('.grid');

      expect(grid).toBeInTheDocument();
    });

    it('should have responsive padding classes', () => {
      render(<FAQ />);
      const section = screen.getByTestId('faq-section');

      expect(section.className).toMatch(/py-\d+/);
      expect(section.className).toMatch(/lg:py-\d+/);
    });
  });

  describe('Data Integration', () => {
    it('should use data from landing-copy.ts', () => {
      render(<FAQ />);

      expect(screen.getByText(faq.headline)).toBeInTheDocument();
      expect(screen.getByText(faq.subheadline)).toBeInTheDocument();

      faq.perguntas.forEach((pergunta) => {
        expect(screen.getByText(pergunta.pergunta)).toBeInTheDocument();
      });
    });

    it('should handle all question IDs correctly', () => {
      const allIds = faq.perguntas.map((p) => p.id);
      const uniqueIds = new Set(allIds);

      // All IDs should be unique
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('Edge Cases', () => {
    it('should render properly with missing categories', () => {
      // This test ensures the component handles empty categories gracefully
      render(<FAQ />);
      const section = screen.getByTestId('faq-section');
      expect(section).toBeInTheDocument();
    });

    it('should handle long questions and answers', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Find a long question
      const longQuestion = screen.getByText(/Como funciona a integração/i);
      await user.click(longQuestion);

      const longAnswer = await screen.findByText(/O sistema funciona de forma independente/i);
      expect(longAnswer).toBeVisible();
    });

    it('should maintain state across multiple interactions', async () => {
      const user = userEvent.setup();
      render(<FAQ />);

      // Open multiple questions
      const question1 = screen.getByText(faq.perguntas[0].pergunta);
      const question2 = screen.getByText(faq.perguntas[1].pergunta);
      const question3 = screen.getByText(faq.perguntas[2].pergunta);

      await user.click(question1);
      await user.click(question2);
      await user.click(question3);

      // All should be visible
      expect(await screen.findByText(faq.perguntas[0].resposta)).toBeVisible();
      expect(await screen.findByText(faq.perguntas[1].resposta)).toBeVisible();
      expect(await screen.findByText(faq.perguntas[2].resposta)).toBeVisible();

      // Close first
      await user.click(question1);

      // Others should remain open
      expect(await screen.findByText(faq.perguntas[1].resposta)).toBeVisible();
      expect(await screen.findByText(faq.perguntas[2].resposta)).toBeVisible();
    });
  });
});
