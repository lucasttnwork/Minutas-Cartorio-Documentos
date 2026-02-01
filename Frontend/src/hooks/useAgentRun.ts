// src/hooks/useAgentRun.ts
// Hook para executar runs de agentes especialistas via Edge Function

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AnaliseStatus } from '@/types/agente';

/**
 * Response type from Edge Function
 */
interface RunResponse {
  run_id: string;
  status: 'completed' | 'error';
  output_texto?: string;
  error?: string;
  input_tokens?: number;
  output_tokens?: number;
  duration_ms?: number;
}

/**
 * State for agent run
 */
interface AgentRunState {
  status: AnaliseStatus;
  resultado: string;
  error: string | null;
  runId: string | null;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
}

/**
 * Return type for useAgentRun hook
 */
export interface UseAgentRunReturn extends AgentRunState {
  executeRun: (
    agentSlug: string,
    arquivos: File[],
    instrucoes?: string
  ) => Promise<void>;
  reset: () => void;
}

const initialState: AgentRunState = {
  status: 'idle',
  resultado: '',
  error: null,
  runId: null,
  inputTokens: 0,
  outputTokens: 0,
  durationMs: 0,
};

/**
 * Hook para executar runs de agentes especialistas
 *
 * Chama a Edge Function `agentes-especialistas/run` que:
 * - Busca o prompt ativo do banco de dados
 * - Salva documentos no Storage
 * - Cria registro de run na tabela agentes_especialistas_runs
 * - Chama a API do Gemini
 * - Retorna resultado com tokens e duração
 */
export function useAgentRun(): UseAgentRunReturn {
  const [state, setState] = useState<AgentRunState>(initialState);

  /**
   * Reseta o estado para inicial
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Executa uma run do agente especialista
   */
  const executeRun = useCallback(
    async (agentSlug: string, arquivos: File[], instrucoes?: string) => {
      // Validar arquivos
      if (arquivos.length === 0) {
        setState({
          ...initialState,
          status: 'error',
          error: 'Nenhum arquivo fornecido para análise',
        });
        return;
      }

      // Iniciar processamento
      setState({
        ...initialState,
        status: 'analyzing',
      });

      try {
        // Criar FormData
        const formData = new FormData();
        formData.append('agent_slug', agentSlug);

        if (instrucoes && instrucoes.trim()) {
          formData.append('instrucoes_customizadas', instrucoes.trim());
        }

        // Adicionar arquivos
        arquivos.forEach((file) => {
          formData.append('documentos', file);
        });

        // Chamar Edge Function
        const { data, error } = await supabase.functions.invoke<RunResponse>(
          'agentes-especialistas/run',
          {
            body: formData,
          }
        );

        // Tratar erro de invocação
        if (error) {
          console.error('Edge Function invocation error:', error);
          console.error('Error details:', {
            message: error.message,
            name: error.name,
            context: error.context,
          });

          let errorMessage = 'Erro ao processar documento';

          // Erro de autenticacao
          if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
            errorMessage = 'Sessao expirada. Por favor, faca login novamente.';
          }
          // Erro de rede/conexao
          else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
            errorMessage = 'Erro de conexao. Verifique sua internet e tente novamente.';
          }
          // Erro generico de Edge Function (non-2xx)
          else if (error.message?.includes('non-2xx') || error.message?.includes('Edge Function')) {
            // Tentar extrair mais detalhes do contexto do erro
            const contextError = error.context?.error || error.context?.message;
            if (contextError) {
              errorMessage = `Erro no servidor: ${contextError}`;
            } else {
              errorMessage = 'Erro no servidor ao processar documento. Tente novamente em alguns instantes.';
            }
            console.error('Edge Function error context:', error.context);
          }
          // Outros erros com mensagem
          else if (error.message) {
            errorMessage = error.message;
          }

          setState({
            ...initialState,
            status: 'error',
            error: errorMessage,
          });
          return;
        }

        // Tratar erro retornado pela função
        if (!data || data.error || data.status === 'error') {
          setState({
            ...initialState,
            status: 'error',
            error: data?.error || 'Erro desconhecido ao processar documento',
          });
          return;
        }

        // Sucesso
        setState({
          status: 'completed',
          resultado: data.output_texto || '',
          error: null,
          runId: data.run_id,
          inputTokens: data.input_tokens || 0,
          outputTokens: data.output_tokens || 0,
          durationMs: data.duration_ms || 0,
        });
      } catch (err) {
        console.error('Unexpected error in executeRun:', err);

        setState({
          ...initialState,
          status: 'error',
          error: err instanceof Error ? err.message : 'Erro inesperado ao processar documento',
        });
      }
    },
    []
  );

  return {
    ...state,
    executeRun,
    reset,
  };
}
