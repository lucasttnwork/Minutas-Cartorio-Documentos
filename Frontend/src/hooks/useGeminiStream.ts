// src/hooks/useGeminiStream.ts
// Hook para streaming de respostas do Gemini com suporte a thinking mode

import { useState, useRef, useCallback } from 'react';
import {
  getGeminiClient,
  getModelName,
  shouldUseRealGemini,
  generationConfig,
} from '@/services/gemini';
import { filesToGenerativeParts } from '@/utils/fileToGemini';
import { buildFullPrompt } from '@/data/agentePrompts';
import type { AnaliseStatus } from '@/types/agente';

export interface GeminiStreamState {
  status: AnaliseStatus;
  resultado: string;
  thinking: string;
  error: string | null;
  isStreaming: boolean;
  thinkingDuration: number;
}

export interface UseGeminiStreamReturn extends GeminiStreamState {
  startStream: (
    agentSlug: string,
    arquivos: File[],
    instrucoes?: string
  ) => Promise<void>;
  stopStream: () => void;
  reset: () => void;
}

const initialState: GeminiStreamState = {
  status: 'idle',
  resultado: '',
  thinking: '',
  error: null,
  isStreaming: false,
  thinkingDuration: 0,
};

/**
 * Hook para gerenciar streaming de respostas do Gemini
 * Com suporte a thinking mode para modelos que suportam raciocínio visível
 */
export function useGeminiStream(): UseGeminiStreamReturn {
  const [state, setState] = useState<GeminiStreamState>(initialState);

  const abortControllerRef = useRef<AbortController | null>(null);
  const thinkingStartRef = useRef<number | null>(null);

  /**
   * Para o stream atual
   */
  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isStreaming: false,
      status: prev.resultado ? 'completed' : 'idle',
    }));
  }, []);

  /**
   * Reseta o estado
   */
  const reset = useCallback(() => {
    stopStream();
    setState(initialState);
    thinkingStartRef.current = null;
  }, [stopStream]);

  /**
   * Inicia o streaming de análise
   */
  const startStream = useCallback(
    async (agentSlug: string, arquivos: File[], instrucoes?: string) => {
      // Verificar se deve usar Gemini real
      if (!shouldUseRealGemini()) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error:
            'Gemini não está configurado. Verifique VITE_GEMINI_API_KEY e VITE_USE_REAL_GEMINI no .env.local',
        }));
        return;
      }

      // Verificar se há arquivos
      if (arquivos.length === 0) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: 'Nenhum arquivo fornecido para análise',
        }));
        return;
      }

      // Resetar estado e criar novo AbortController
      abortControllerRef.current = new AbortController();
      thinkingStartRef.current = Date.now();

      setState({
        status: 'analyzing',
        resultado: '',
        thinking: '',
        error: null,
        isStreaming: true,
        thinkingDuration: 0,
      });

      try {
        // 1. Converter arquivos para Parts do Gemini
        const fileParts = await filesToGenerativeParts(arquivos);

        // 2. Obter prompt do agente com instruções customizadas
        const systemPrompt = buildFullPrompt(agentSlug, instrucoes);

        // 3. Obter cliente e modelo
        const client = getGeminiClient();
        const modelName = getModelName();

        // 4. Criar a requisição de streaming
        // Configurar thinking se o modelo suportar
        const streamConfig = {
          ...generationConfig,
          systemInstruction: systemPrompt,
        };

        // Adicionar thinking config para modelos que suportam
        // (gemini-2.5-pro, gemini-2.5-flash, gemini-3-pro-preview, etc.)
        const supportsThinking = modelName.includes('2.5') || modelName.includes('3');
        if (supportsThinking) {
          (streamConfig as Record<string, unknown>).thinkingConfig = {
            includeThoughts: true,
          };
        }

        const response = await client.models.generateContentStream({
          model: modelName,
          config: streamConfig,
          contents: [
            {
              role: 'user',
              parts: [
                ...fileParts,
                {
                  text: 'Analise o(s) documento(s) acima seguindo as instruções do sistema.',
                },
              ],
            },
          ],
        });

        // 5. Processar chunks do stream
        let fullText = '';
        let thinkingText = '';
        let isAborted = false;

        for await (const chunk of response) {
          // Verificar se foi abortado
          if (abortControllerRef.current?.signal.aborted) {
            isAborted = true;
            break;
          }

          // Extrair texto do chunk
          const chunkText = chunk.text || '';

          // Verificar se há pensamentos no chunk (para modelos com thinking)
          const parts = chunk.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            // @ts-expect-error - thought field existe em modelos com thinking
            if (part.thought) {
              // @ts-expect-error - thought field
              thinkingText += part.thought;

              // Calcular duração do thinking
              const duration = thinkingStartRef.current
                ? (Date.now() - thinkingStartRef.current) / 1000
                : 0;

              setState((prev) => ({
                ...prev,
                thinking: thinkingText,
                thinkingDuration: duration,
              }));
            }
          }

          if (chunkText) {
            fullText += chunkText;

            // Atualizar estado com o novo texto
            // Usar função de atualização para evitar race conditions
            setState((prev) => ({
              ...prev,
              resultado: fullText,
            }));
          }
        }

        // 6. Finalizar (se não foi abortado)
        if (!isAborted) {
          const finalDuration = thinkingStartRef.current
            ? (Date.now() - thinkingStartRef.current) / 1000
            : 0;

          setState((prev) => ({
            ...prev,
            status: 'completed',
            isStreaming: false,
            thinkingDuration: finalDuration,
          }));
        }
      } catch (error) {
        // Ignorar erros de abort
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        console.error('Erro no streaming Gemini:', error);

        let errorMessage = 'Erro desconhecido ao analisar documento';

        if (error instanceof Error) {
          // Tratar erros específicos
          if (error.message.includes('API key')) {
            errorMessage = 'API key do Gemini inválida ou não configurada';
          } else if (error.message.includes('quota')) {
            errorMessage = 'Limite de requisições excedido. Tente novamente mais tarde.';
          } else if (error.message.includes('SAFETY')) {
            errorMessage =
              'O conteúdo foi bloqueado por motivos de segurança. Tente com outro documento.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          } else {
            errorMessage = error.message;
          }
        }

        setState((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
          isStreaming: false,
        }));
      } finally {
        abortControllerRef.current = null;
      }
    },
    []
  );

  return {
    ...state,
    startStream,
    stopStream,
    reset,
  };
}
