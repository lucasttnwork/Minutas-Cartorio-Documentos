// src/components/forms/EditableField.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableField } from './EditableField';

describe('EditableField', () => {
  const defaultProps = {
    label: 'Nome',
    value: 'João Silva',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fonte Indicator', () => {
    it('should not render fonte badge when fonte is undefined', () => {
      render(<EditableField {...defaultProps} />);

      // Badge should not exist
      expect(screen.queryByText(/fonte/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/extraído/i)).not.toBeInTheDocument();
    });

    it('should not render fonte badge when fonte is empty array', () => {
      render(<EditableField {...defaultProps} fonte={[]} />);

      // Badge should not exist
      expect(screen.queryByText(/fonte/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/extraído/i)).not.toBeInTheDocument();
    });

    it('should render fonte badge when fonte has 1 item', () => {
      render(<EditableField {...defaultProps} fonte={['RG-001.pdf']} />);

      // Badge should show the document name
      expect(screen.getByText('RG-001.pdf')).toBeInTheDocument();
    });

    it('should show document name in badge when single fonte', () => {
      render(<EditableField {...defaultProps} fonte={['CNH-002.pdf']} />);

      // Should display the exact filename
      expect(screen.getByText('CNH-002.pdf')).toBeInTheDocument();
    });

    it('should show count "X fontes" when multiple sources', () => {
      render(
        <EditableField
          {...defaultProps}
          fonte={['RG-001.pdf', 'CNH-002.pdf', 'Certidao.pdf']}
        />
      );

      // Should show "3 fontes" instead of individual names
      expect(screen.getByText('3 fontes')).toBeInTheDocument();
    });

    it('should show "2 fontes" for exactly 2 sources', () => {
      render(
        <EditableField {...defaultProps} fonte={['RG-001.pdf', 'CNH-002.pdf']} />
      );

      expect(screen.getByText('2 fontes')).toBeInTheDocument();
    });

    it('should have tooltip trigger for badge with multiple documents', () => {
      const { container } = render(
        <EditableField
          {...defaultProps}
          fonte={['RG-001.pdf', 'CNH-002.pdf', 'Certidao.pdf']}
        />
      );

      // Find the badge with tooltip trigger (cursor-help class indicates tooltip)
      const badge = screen.getByText('3 fontes').closest('span');
      expect(badge).toBeTruthy();
      expect(badge?.className).toContain('cursor-help');

      // The TooltipTrigger wraps the badge with data-state attribute
      const tooltipTrigger = container.querySelector('[data-state]');
      expect(tooltipTrigger).toBeTruthy();
    });

    it('should have tooltip trigger for badge with single document', () => {
      const { container } = render(
        <EditableField {...defaultProps} fonte={['RG-001.pdf']} />
      );

      // Find the badge with tooltip trigger (cursor-help class indicates tooltip)
      const badge = screen.getByText('RG-001.pdf').closest('span');
      expect(badge).toBeTruthy();
      expect(badge?.className).toContain('cursor-help');

      // The TooltipTrigger wraps the badge with data-state attribute
      const tooltipTrigger = container.querySelector('[data-state]');
      expect(tooltipTrigger).toBeTruthy();
    });

    it('should have FileText icon in the badge', () => {
      const { container } = render(
        <EditableField {...defaultProps} fonte={['RG-001.pdf']} />
      );

      // Badge should contain an SVG icon (FileText from lucide-react)
      const badge = screen.getByText('RG-001.pdf').closest('span');
      expect(badge).toBeTruthy();

      const svgIcon = badge?.querySelector('svg');
      expect(svgIcon).toBeTruthy();
    });

    it('should render fonte badge with discrete styling', () => {
      render(<EditableField {...defaultProps} fonte={['RG-001.pdf']} />);

      // Badge should have discrete styling (outline variant style)
      const badge = screen.getByText('RG-001.pdf').closest('span');
      expect(badge).toBeTruthy();

      // Should have outline/discrete styling classes
      expect(badge?.className).toContain('text-xs');
    });

    it('should not interfere with field layout', () => {
      const { container } = render(
        <EditableField {...defaultProps} fonte={['RG-001.pdf']} />
      );

      // The main value should still be visible
      expect(screen.getByText('João Silva')).toBeInTheDocument();

      // The label should still be visible
      expect(screen.getByText('Nome')).toBeInTheDocument();
    });
  });

  describe('Basic EditableField functionality with fonte', () => {
    it('should allow editing when fonte is present', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <EditableField
          label="Nome"
          value="João"
          onChange={onChange}
          fonte={['RG.pdf']}
        />
      );

      // Click to edit
      const valueButton = screen.getByRole('button', { name: /João/i });
      await user.click(valueButton);

      // Should enter edit mode
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should show fonte badge in both view and edit modes', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <EditableField {...defaultProps} fonte={['RG-001.pdf']} />
      );

      // View mode - badge should be visible
      expect(screen.getByText('RG-001.pdf')).toBeInTheDocument();

      // Click to edit
      const valueButton = screen.getByRole('button', { name: /João Silva/i });
      await user.click(valueButton);

      // Edit mode - badge should still be visible
      expect(screen.getByText('RG-001.pdf')).toBeInTheDocument();
    });
  });
});
