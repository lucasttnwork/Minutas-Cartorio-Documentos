// src/pages/AgenteExtrator.test.tsx
// Testes de integração para o componente AgenteExtrator

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';

// Mock agente data
const mockAgente = {
  id: 'extrator',
  slug: 'extrator',
  nome: 'Extrator de Dados',
  descricao: 'Extrai dados de documentos',
  icon: 'FileText',
  categoria: 'extracao',
};

const mockCnhAgente = {
  id: 'cnh',
  slug: 'cnh',
  nome: 'CNH',
  descricao: 'Extrai dados de CNH',
  icon: 'CreditCard',
  categoria: 'pessoais',
};

// Mock functions
const mockExecuteRun = vi.fn();
const mockReset = vi.fn();

// Estado para controlar o mock do useAgentRun
let mockAgentRunState = {
  status: 'idle' as const,
  resultado: '',
  error: null as string | null,
  runId: null as string | null,
  inputTokens: 0,
  outputTokens: 0,
  durationMs: 0,
};

// Mock modules
vi.mock('@/data/agentes', () => ({
  getAgenteBySlug: (slug: string) => {
    if (slug === 'extrator') return mockAgente;
    if (slug === 'cnh') return mockCnhAgente;
    return null;
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123' },
    profile: { nome: 'Test User' },
    isAuthenticated: true,
  }),
}));

vi.mock('@/hooks/useAgentRun', () => ({
  useAgentRun: () => ({
    ...mockAgentRunState,
    executeRun: mockExecuteRun,
    reset: mockReset,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import AgenteExtrator from './AgenteExtrator';

const renderWithRouter = (ui: ReactNode, { route = '/agentes/extrator' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/agentes/:tipo" element={ui} />
        <Route path="/dashboard/agentes" element={<div>Dashboard Agentes</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AgenteExtrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAgentRunState = {
      status: 'idle',
      resultado: '',
      error: null,
      runId: null,
      inputTokens: 0,
      outputTokens: 0,
      durationMs: 0,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Rendering
  // ==========================================================================
  describe('Rendering', () => {
    it('should render agent page with upload zone', () => {
      renderWithRouter(<AgenteExtrator />);

      // Use getAllByText since the name appears in breadcrumb and heading
      const agentNames = screen.getAllByText('Extrator de Dados');
      expect(agentNames.length).toBeGreaterThan(0);
      expect(screen.getByText('Documentos')).toBeInTheDocument();
      expect(screen.getByText(/Arraste arquivos/i)).toBeInTheDocument();
    });

    it('should show agent not found when invalid slug', () => {
      render(
        <MemoryRouter initialEntries={['/agentes/invalid']}>
          <Routes>
            <Route path="/agentes/:tipo" element={<AgenteExtrator />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Agente não encontrado/i)).toBeInTheDocument();
    });

    it('should render CNH agent correctly', () => {
      render(
        <MemoryRouter initialEntries={['/agentes/cnh']}>
          <Routes>
            <Route path="/agentes/:tipo" element={<AgenteExtrator />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getAllByText('CNH').length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Analyze Button State
  // ==========================================================================
  describe('Analyze Button State', () => {
    it('should disable analyze button when no files uploaded', () => {
      renderWithRouter(<AgenteExtrator />);

      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      expect(analyzeButton).toBeDisabled();
    });

    it('should enable analyze button when files are uploaded', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      // Find the file input and upload a file
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      expect(analyzeButton).not.toBeDisabled();
    });
  });

  // ==========================================================================
  // Analysis Flow
  // ==========================================================================
  describe('Analysis Flow', () => {
    it('should call executeRun when analyze button clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      // Upload a file first
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      // Click analyze
      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      await user.click(analyzeButton);

      // Should call executeRun with correct params
      expect(mockExecuteRun).toHaveBeenCalledWith(
        'extrator',
        [expect.any(File)],
        ''
      );
    });

    it('should pass custom instructions to executeRun', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      // Upload a file
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      // Add custom instructions
      const textarea = screen.getByPlaceholderText(/Adicione instruções/i);
      await user.type(textarea, 'Minhas instruções');

      // Click analyze
      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      await user.click(analyzeButton);

      expect(mockExecuteRun).toHaveBeenCalledWith(
        'extrator',
        [expect.any(File)],
        'Minhas instruções'
      );
    });

    it('should show processing state during analysis', () => {
      mockAgentRunState = {
        ...mockAgentRunState,
        status: 'analyzing',
      };
      renderWithRouter(<AgenteExtrator />);

      expect(screen.getByText(/Processando/i)).toBeInTheDocument();
    });

    it('shows Gerar Novamente button after completion', () => {
      mockAgentRunState = {
        ...mockAgentRunState,
        status: 'completed',
        resultado: 'Resultado da análise',
      };
      renderWithRouter(<AgenteExtrator />);

      expect(screen.getByRole('button', { name: /Gerar Novamente/i })).toBeInTheDocument();
    });

    it('shows Novo Documento button after completion', () => {
      mockAgentRunState = {
        ...mockAgentRunState,
        status: 'completed',
        resultado: 'Resultado da análise',
      };
      renderWithRouter(<AgenteExtrator />);

      expect(screen.getByRole('button', { name: /Novo Documento/i })).toBeInTheDocument();
    });

    it('should call reset when Novo Documento clicked', async () => {
      mockAgentRunState = {
        ...mockAgentRunState,
        status: 'completed',
        resultado: 'Resultado da análise',
      };
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      const newDocButton = screen.getByRole('button', { name: /Novo Documento/i });
      await user.click(newDocButton);

      expect(mockReset).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Navigation
  // ==========================================================================
  describe('Navigation', () => {
    it('should have back button', () => {
      renderWithRouter(<AgenteExtrator />);

      expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
    });

    it('should show breadcrumb with agent name', () => {
      renderWithRouter(<AgenteExtrator />);

      expect(screen.getByText('Agentes')).toBeInTheDocument();
      // Agent name appears in both breadcrumb and heading
      const agentNames = screen.getAllByText('Extrator de Dados');
      expect(agentNames.length).toBe(2); // breadcrumb + heading
    });

    it('breadcrumb Agentes is clickable', () => {
      renderWithRouter(<AgenteExtrator />);

      const agentesLink = screen.getByText('Agentes');
      expect(agentesLink).toHaveClass('cursor-pointer');
    });
  });

  // ==========================================================================
  // Instructions
  // ==========================================================================
  describe('Instructions', () => {
    it('should have optional instructions textarea', () => {
      renderWithRouter(<AgenteExtrator />);

      expect(screen.getByText(/Instruções extras/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Adicione instruções/i)).toBeInTheDocument();
    });

    it('textarea accepts user input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      const textarea = screen.getByPlaceholderText(/Adicione instruções/i);
      await user.type(textarea, 'Minhas instruções customizadas');

      expect(textarea).toHaveValue('Minhas instruções customizadas');
    });

    it('textarea is not disabled initially', () => {
      renderWithRouter(<AgenteExtrator />);

      const textarea = screen.getByPlaceholderText(/Adicione instruções/i);
      expect(textarea).not.toBeDisabled();
    });

    it('textarea is disabled during analysis', () => {
      mockAgentRunState = {
        ...mockAgentRunState,
        status: 'analyzing',
      };
      renderWithRouter(<AgenteExtrator />);

      const textarea = screen.getByPlaceholderText(/Adicione instruções/i);
      expect(textarea).toBeDisabled();
    });
  });

  // ==========================================================================
  // File Upload
  // ==========================================================================
  describe('File Upload', () => {
    it('accepts PDF files', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['%PDF-1.4'], 'document.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      // Verificar que o arquivo foi aceito (botão habilitado)
      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      expect(analyzeButton).not.toBeDisabled();
    });

    it('accepts image files', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
      await user.upload(input, file);

      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      expect(analyzeButton).not.toBeDisabled();
    });

    it('accepts multiple files', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const files = [
        new File(['content1'], 'doc1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'doc2.pdf', { type: 'application/pdf' }),
      ];

      await user.upload(input, files);

      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      expect(analyzeButton).not.toBeDisabled();
    });
  });

  // ==========================================================================
  // Error handling UI
  // ==========================================================================
  describe('Error handling UI', () => {
    it('shows error alert when error occurs', () => {
      mockAgentRunState = {
        ...mockAgentRunState,
        status: 'error',
        error: 'Erro ao processar documento',
      };
      renderWithRouter(<AgenteExtrator />);

      // The error message appears in multiple places (alert + result panel)
      const errorMessages = screen.getAllByText('Erro ao processar documento');
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('shows Tentar Novamente button on error', () => {
      mockAgentRunState = {
        ...mockAgentRunState,
        status: 'error',
        error: 'Erro ao processar documento',
      };
      renderWithRouter(<AgenteExtrator />);

      expect(screen.getByRole('button', { name: /Tentar Novamente/i })).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Layout structure
  // ==========================================================================
  describe('Layout structure', () => {
    it('has two-column layout', () => {
      renderWithRouter(<AgenteExtrator />);

      // Verificar estrutura: sidebar com inputs, main com resultado
      expect(screen.getByText('Documentos')).toBeInTheDocument();
      expect(screen.getByText(/Instruções extras/i)).toBeInTheDocument();
    });

    it('shows agent description', () => {
      renderWithRouter(<AgenteExtrator />);

      expect(screen.getByText('Extrai dados de documentos')).toBeInTheDocument();
    });
  });
});
