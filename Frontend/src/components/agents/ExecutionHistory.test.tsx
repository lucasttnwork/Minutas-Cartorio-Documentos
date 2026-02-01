// src/components/agents/ExecutionHistory.test.tsx
// TDD: Write tests FIRST, then implement

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExecutionHistory } from './ExecutionHistory';

// Mock data type matching agent_logs table structure
interface MockAgentLog {
  id: string;
  minuta_id: string | null;
  documento_id: string | null;
  agent_type: string;
  input_data: unknown;
  output_data: unknown;
  tokens_used: number | null;
  duration_ms: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

// Create a chainable mock query builder
function createMockQueryBuilder(data: MockAgentLog[] | null, error: Error | null = null) {
  const response = { data, error };

  const mockEq = vi.fn().mockImplementation(() => ({
    eq: mockEq,
    then: (resolve: (value: typeof response) => void) => {
      resolve(response);
      return Promise.resolve(response);
    },
  }));

  const mockLimit = vi.fn().mockImplementation(() => ({
    eq: mockEq,
    then: (resolve: (value: typeof response) => void) => {
      resolve(response);
      return Promise.resolve(response);
    },
  }));

  const mockOrder = vi.fn().mockReturnValue({
    limit: mockLimit,
  });

  const mockSelect = vi.fn().mockReturnValue({
    order: mockOrder,
  });

  return {
    from: vi.fn().mockReturnValue({
      select: mockSelect,
    }),
    mockSelect,
    mockOrder,
    mockLimit,
    mockEq,
  };
}

// Store current mock builder
let currentMockBuilder: ReturnType<typeof createMockQueryBuilder>;

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((...args) => currentMockBuilder?.from(...args)),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

// Helper to create mock agent_log data
const createMockAgentLog = (overrides: Partial<MockAgentLog> = {}): MockAgentLog => ({
  id: crypto.randomUUID(),
  minuta_id: null,
  documento_id: null,
  agent_type: 'extract',
  input_data: null,
  output_data: { extracted: 'data' },
  tokens_used: 150,
  duration_ms: 1500,
  status: 'success',
  error_message: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

describe('ExecutionHistory', () => {
  describe('Loading State', () => {
    it('should show loading indicator initially', () => {
      // Create a mock that returns a pending promise
      const pendingMock = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue(new Promise(() => {})),
            }),
          }),
        }),
      };
      currentMockBuilder = pendingMock as unknown as ReturnType<typeof createMockQueryBuilder>;

      render(<ExecutionHistory />);

      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show message when no executions found', async () => {
      currentMockBuilder = createMockQueryBuilder([]);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/nenhuma execu/i)).toBeInTheDocument();
      });
    });

    it('should show message when data is null', async () => {
      currentMockBuilder = createMockQueryBuilder(null);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/nenhuma execu/i)).toBeInTheDocument();
      });
    });
  });

  describe('Execution List Rendering', () => {
    it('should render list of executions', async () => {
      const logs = [
        createMockAgentLog({ agent_type: 'extract' }),
        createMockAgentLog({ agent_type: 'classify' }),
        createMockAgentLog({ agent_type: 'generate' }),
      ];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/extrator/i)).toBeInTheDocument();
        expect(screen.getByText(/classificador/i)).toBeInTheDocument();
        expect(screen.getByText(/gerador/i)).toBeInTheDocument();
      });
    });

    it('should render agent type labels correctly', async () => {
      const logs = [
        createMockAgentLog({ agent_type: 'classify' }),
        createMockAgentLog({ agent_type: 'extract' }),
        createMockAgentLog({ agent_type: 'map' }),
        createMockAgentLog({ agent_type: 'generate' }),
      ];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/classificador/i)).toBeInTheDocument();
        expect(screen.getByText(/extrator/i)).toBeInTheDocument();
        expect(screen.getByText(/mapeador/i)).toBeInTheDocument();
        expect(screen.getByText(/gerador de minuta/i)).toBeInTheDocument();
      });
    });
  });

  describe('Status Icons', () => {
    it('should show green icon for success status', async () => {
      const logs = [createMockAgentLog({ status: 'success' })];
      currentMockBuilder = createMockQueryBuilder(logs);

      const { container } = render(<ExecutionHistory />);

      await waitFor(() => {
        const successIcon = container.querySelector('.text-green-500');
        expect(successIcon).toBeTruthy();
      });
    });

    it('should show red icon for error status', async () => {
      const logs = [createMockAgentLog({ status: 'error', error_message: 'Something failed' })];
      currentMockBuilder = createMockQueryBuilder(logs);

      const { container } = render(<ExecutionHistory />);

      await waitFor(() => {
        const errorIcon = container.querySelector('.text-red-500');
        expect(errorIcon).toBeTruthy();
      });
    });

    it('should show blue spinning icon for pending status', async () => {
      const logs = [createMockAgentLog({ status: 'pending' })];
      currentMockBuilder = createMockQueryBuilder(logs);

      const { container } = render(<ExecutionHistory />);

      await waitFor(() => {
        const pendingIcon = container.querySelector('.text-blue-500');
        expect(pendingIcon).toBeTruthy();
        expect(pendingIcon?.classList.contains('animate-spin')).toBe(true);
      });
    });
  });

  describe('Duration Formatting', () => {
    it('should show duration in milliseconds for short durations', async () => {
      const logs = [createMockAgentLog({ duration_ms: 500 })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText('500ms')).toBeInTheDocument();
      });
    });

    it('should show duration in seconds for longer durations', async () => {
      const logs = [createMockAgentLog({ duration_ms: 1500 })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText('1.5s')).toBeInTheDocument();
      });
    });

    it('should not show duration when null', async () => {
      const logs = [createMockAgentLog({ duration_ms: null })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        // Verify execution is rendered
        expect(screen.getByText(/extrator/i)).toBeInTheDocument();
      });

      // Duration should not be present
      expect(screen.queryByText(/ms$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/^\d+\.\d+s$/)).not.toBeInTheDocument();
    });
  });

  describe('Tokens Display', () => {
    it('should show total tokens when tokens_used is present', async () => {
      const logs = [createMockAgentLog({ tokens_used: 150 })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/150 tokens/i)).toBeInTheDocument();
      });
    });

    it('should not show tokens when tokens_used is null', async () => {
      const logs = [createMockAgentLog({ tokens_used: null })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/extrator/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/tokens/)).not.toBeInTheDocument();
    });
  });

  describe('Cost Display', () => {
    it('should show cost estimate when tokens_used is present', async () => {
      // With 150 tokens and rate of 0.00001, cost = 0.0015
      const logs = [createMockAgentLog({ tokens_used: 150 })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
      });
    });

    it('should not show cost when tokens_used is null', async () => {
      const logs = [createMockAgentLog({ tokens_used: null })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/extrator/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    });
  });

  describe('Expandable Details', () => {
    it('should show expand button when output_data exists', async () => {
      const logs = [createMockAgentLog({ output_data: { data: 'test' } })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/ver detalhes/i)).toBeInTheDocument();
      });
    });

    it('should show expand button when error_message exists', async () => {
      const logs = [createMockAgentLog({
        status: 'error',
        error_message: 'Error occurred',
        output_data: null
      })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/ver detalhes/i)).toBeInTheDocument();
      });
    });

    it('should not show expand button when neither output_data nor error exists', async () => {
      const logs = [createMockAgentLog({ output_data: null, error_message: null })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/extrator/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/ver detalhes/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/ocultar/i)).not.toBeInTheDocument();
    });

    it('should expand to show result when clicked', async () => {
      const user = userEvent.setup();
      const logs = [createMockAgentLog({ output_data: { extracted: 'test_data' } })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/ver detalhes/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/ver detalhes/i));

      await waitFor(() => {
        expect(screen.getByText(/ocultar/i)).toBeInTheDocument();
        expect(screen.getByText(/test_data/)).toBeInTheDocument();
      });
    });

    it('should show error message in red when expanded', async () => {
      const user = userEvent.setup();
      const logs = [createMockAgentLog({
        status: 'error',
        error_message: 'API rate limit exceeded',
        output_data: null
      })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/ver detalhes/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/ver detalhes/i));

      await waitFor(() => {
        const errorText = screen.getByText(/API rate limit exceeded/);
        expect(errorText).toBeInTheDocument();
        // Check it has destructive styling (red text)
        expect(errorText.closest('pre')?.classList.contains('text-destructive')).toBe(true);
      });
    });

    it('should collapse when clicked again', async () => {
      const user = userEvent.setup();
      const logs = [createMockAgentLog({ output_data: { data: 'test' } })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(screen.getByText(/ver detalhes/i)).toBeInTheDocument();
      });

      // Expand
      await user.click(screen.getByText(/ver detalhes/i));
      await waitFor(() => {
        expect(screen.getByText(/ocultar/i)).toBeInTheDocument();
      });

      // Collapse
      await user.click(screen.getByText(/ocultar/i));
      await waitFor(() => {
        expect(screen.getByText(/ver detalhes/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by minutaId when provided', async () => {
      const logs = [createMockAgentLog()];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory minutaId="minuta-123" />);

      await waitFor(() => {
        expect(currentMockBuilder.mockEq).toHaveBeenCalledWith('minuta_id', 'minuta-123');
      });
    });

    it('should filter by documentoId when provided', async () => {
      const logs = [createMockAgentLog()];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory documentoId="doc-456" />);

      await waitFor(() => {
        expect(currentMockBuilder.mockEq).toHaveBeenCalledWith('documento_id', 'doc-456');
      });
    });

    it('should filter by both minutaId and documentoId when provided', async () => {
      const logs = [createMockAgentLog()];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory minutaId="minuta-123" documentoId="doc-456" />);

      await waitFor(() => {
        expect(currentMockBuilder.mockEq).toHaveBeenCalledWith('minuta_id', 'minuta-123');
        expect(currentMockBuilder.mockEq).toHaveBeenCalledWith('documento_id', 'doc-456');
      });
    });
  });

  describe('Limit', () => {
    it('should use default limit of 10', async () => {
      currentMockBuilder = createMockQueryBuilder([]);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(currentMockBuilder.mockLimit).toHaveBeenCalledWith(10);
      });
    });

    it('should use custom limit when provided', async () => {
      currentMockBuilder = createMockQueryBuilder([]);

      render(<ExecutionHistory limit={5} />);

      await waitFor(() => {
        expect(currentMockBuilder.mockLimit).toHaveBeenCalledWith(5);
      });
    });
  });

  describe('Relative Time', () => {
    it('should show relative time for started_at', async () => {
      // Create execution from 5 minutes ago
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const logs = [createMockAgentLog({ created_at: fiveMinutesAgo })];
      currentMockBuilder = createMockQueryBuilder(logs);

      render(<ExecutionHistory />);

      await waitFor(() => {
        // Should show something like "5 min"
        const timeElement = screen.getByText(/min/i);
        expect(timeElement).toBeInTheDocument();
      });
    });
  });

  describe('Ordering', () => {
    it('should order by started_at descending', async () => {
      currentMockBuilder = createMockQueryBuilder([]);

      render(<ExecutionHistory />);

      await waitFor(() => {
        expect(currentMockBuilder.mockOrder).toHaveBeenCalledWith('started_at', { ascending: false });
      });
    });
  });

  describe('Re-fetch on prop change', () => {
    it('should refetch when minutaId changes', async () => {
      currentMockBuilder = createMockQueryBuilder([]);

      const { rerender } = render(<ExecutionHistory minutaId="minuta-1" />);

      await waitFor(() => {
        expect(currentMockBuilder.mockEq).toHaveBeenCalledWith('minuta_id', 'minuta-1');
      });

      // Create new mock for rerender
      currentMockBuilder = createMockQueryBuilder([]);

      rerender(<ExecutionHistory minutaId="minuta-2" />);

      await waitFor(() => {
        expect(currentMockBuilder.mockEq).toHaveBeenCalledWith('minuta_id', 'minuta-2');
      });
    });
  });
});
