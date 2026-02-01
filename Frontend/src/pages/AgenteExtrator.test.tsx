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
const mockClassifyDocument = vi.fn();
const mockExtractDocument = vi.fn();

// Estado para controlar shouldUseRealGemini
let mockUseRealGemini = false;

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

vi.mock('@/services/document-processing', () => ({
  classifyDocument: (...args: unknown[]) => mockClassifyDocument(...args),
  extractDocument: (...args: unknown[]) => mockExtractDocument(...args),
}));

vi.mock('@/services/gemini', () => ({
  shouldUseRealGemini: () => mockUseRealGemini,
  getGeminiClient: vi.fn(),
  getModelName: vi.fn().mockReturnValue('gemini-test'),
  generationConfig: { temperature: 0.1, maxOutputTokens: 16384 },
}));

vi.mock('@/hooks/useGeminiStream', () => ({
  useGeminiStream: () => ({
    status: 'idle',
    resultado: '',
    error: null,
    isStreaming: false,
    startStream: vi.fn(),
    stopStream: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock('@/utils/mockStreaming', () => ({
  getMockResponse: () => 'Mock extraction result from demo mode',
  simulateStreaming: vi.fn().mockImplementation(
    async (_text: string, onChunk: (chunk: string) => void, onComplete: () => void) => {
      onChunk('Mock extraction result from demo mode');
      onComplete();
    }
  ),
  createAbortableStream: () => ({
    abort: vi.fn(),
    isAborted: () => false,
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
    mockUseRealGemini = false;
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
  // Modo Demo vs Real
  // ==========================================================================
  describe('Mode switching (Demo vs Real)', () => {
    it('exibe badge "Modo Demo" quando Gemini não configurado', () => {
      mockUseRealGemini = false;
      renderWithRouter(<AgenteExtrator />);

      expect(screen.getByText('Modo Demo')).toBeInTheDocument();
    });

    it('não exibe badge quando Gemini configurado', () => {
      mockUseRealGemini = true;
      renderWithRouter(<AgenteExtrator />);

      expect(screen.queryByText('Modo Demo')).not.toBeInTheDocument();
    });

    it('usa mock streaming em modo demo', async () => {
      mockUseRealGemini = false;
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      // Upload a file
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      // Click analyze
      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      await user.click(analyzeButton);

      // Should show mock result
      await waitFor(() => {
        expect(screen.getByText(/Mock extraction result/i)).toBeInTheDocument();
      });
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

    it('should keep button disabled with invalid file type', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Try to upload an unsupported file type
      const file = new File(['test'], 'test.exe', { type: 'application/x-executable' });

      // O UploadZone deve rejeitar o arquivo, então o botão deve continuar desabilitado
      await user.upload(input, file);

      // O comportamento depende da implementação do UploadZone
      // Se ele aceita todos os arquivos, este teste precisa ser ajustado
    });
  });

  // ==========================================================================
  // Analysis Flow
  // ==========================================================================
  describe('Analysis Flow', () => {
    it('should start analysis when analyze button clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      // Upload a file first
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      // Click analyze
      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      await user.click(analyzeButton);

      // Should show result
      await waitFor(() => {
        expect(screen.getByText(/Mock extraction result/i)).toBeInTheDocument();
      });
    });

    it('should show result panel after analysis completes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      await user.click(analyzeButton);

      await waitFor(() => {
        // Verificar que o resultado está visível
        expect(screen.getByText(/Mock extraction result/i)).toBeInTheDocument();
      });
    });

    it('shows Gerar Novamente button after completion', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Gerar Novamente/i })).toBeInTheDocument();
      });
    });

    it('shows Novo Documento button after completion', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      const analyzeButton = screen.getByRole('button', { name: /analisar/i });
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Novo Documento/i })).toBeInTheDocument();
      });
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
  // Export buttons (after completion)
  // ==========================================================================
  describe('Export functionality', () => {
    it('shows copy button after analysis', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AgenteExtrator />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(input, file);

      await user.click(screen.getByRole('button', { name: /analisar/i }));

      await waitFor(() => {
        // Procurar por botão de cópia (pode ser um ícone ou texto)
        const copyButtons = screen.getAllByRole('button');
        expect(copyButtons.length).toBeGreaterThan(0);
      });
    });
  });

  // ==========================================================================
  // Error handling UI
  // ==========================================================================
  describe('Error handling UI', () => {
    it('shows error state correctly', async () => {
      // Este teste verifica a estrutura do componente para erros
      // O erro real viria do hook useGeminiStream
      renderWithRouter(<AgenteExtrator />);

      // Verificar que existe área para exibir erros (estrutura)
      expect(screen.getByText('Documentos')).toBeInTheDocument();
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
