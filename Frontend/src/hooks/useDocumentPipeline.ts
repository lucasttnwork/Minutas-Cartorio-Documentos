/**
 * Hook para orquestrar o pipeline de processamento de documentos
 *
 * O pipeline consiste em:
 * 1. classify-document - Classifica o tipo do documento
 * 2. extract-document - Extrai dados do documento
 * 3. map-to-fields - Mapeia dados extraidos para campos estruturados (executado apos todos os docs)
 * 4. generate-minuta - Gera a minuta final (opcional, acionado pelo usuario)
 */

import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export interface PipelineStatus {
  documentId: string;
  step: 'classifying' | 'extracting' | 'mapping' | 'done' | 'error';
  progress: number; // 0-100
  error?: string;
}

export interface GenerationStatus {
  status: 'idle' | 'generating' | 'done' | 'error';
  error?: string;
}

export interface GenerationResult {
  success: boolean;
  minuta_texto?: string;
  template_usado?: string;
  dados_utilizados?: Record<string, unknown>;
  error?: string;
}

export interface UseDocumentPipelineOptions {
  onDocumentComplete?: (documentId: string) => void;
  onPipelineComplete?: (minutaId: string) => void;
  onError?: (documentId: string, error: string) => void;
  onGenerationComplete?: (minutaId: string, resultado: GenerationResult) => void;
  onGenerationError?: (minutaId: string, error: string) => void;
}

export interface UseDocumentPipelineReturn {
  /** Processa todos os documentos pendentes de uma minuta */
  startPipeline: (minutaId: string) => Promise<void>;

  /** Processa um unico documento */
  processDocument: (documentId: string) => Promise<boolean>;

  /** Gera a minuta final para uma minuta */
  generateMinuta: (minutaId: string, templateType?: string) => Promise<GenerationResult>;

  /** Indica se o pipeline esta em execucao */
  isProcessing: boolean;

  /** Indica se a geracao esta em andamento */
  isGenerating: boolean;

  /** Status de cada documento sendo processado */
  statuses: Map<string, PipelineStatus>;

  /** Status da geracao da minuta */
  generationStatus: GenerationStatus;

  /** Progresso geral (0-100) - media de todos os documentos */
  overallProgress: number;
}

const PROGRESS_MAP: Record<PipelineStatus['step'], number> = {
  classifying: 0,
  extracting: 33,
  mapping: 66,
  done: 100,
  error: 0,
};

export function useDocumentPipeline(
  options?: UseDocumentPipelineOptions
): UseDocumentPipelineReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statuses, setStatuses] = useState<Map<string, PipelineStatus>>(new Map());
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: 'idle',
  });

  /**
   * Atualiza o status de um documento especifico
   */
  const updateStatus = useCallback(
    (documentId: string, step: PipelineStatus['step'], error?: string) => {
      setStatuses((prev) => {
        const newMap = new Map(prev);
        newMap.set(documentId, {
          documentId,
          step,
          progress: PROGRESS_MAP[step],
          error,
        });
        return newMap;
      });
    },
    []
  );

  /**
   * Processa um unico documento pelo pipeline
   * classify -> extract
   */
  const processDocument = useCallback(
    async (documentId: string): Promise<boolean> => {
      try {
        // 1. Classificar
        updateStatus(documentId, 'classifying');

        const classifyResult = await supabase.functions.invoke('classify-document', {
          body: { documento_id: documentId },
        });

        if (classifyResult.error) {
          const errorMessage = classifyResult.error.message || 'Classification failed';
          updateStatus(documentId, 'error', errorMessage);
          options?.onError?.(documentId, errorMessage);
          return false;
        }

        // 2. Extrair
        updateStatus(documentId, 'extracting');

        const extractResult = await supabase.functions.invoke('extract-document', {
          body: { documento_id: documentId },
        });

        if (extractResult.error) {
          const errorMessage = extractResult.error.message || 'Extraction failed';
          updateStatus(documentId, 'error', errorMessage);
          options?.onError?.(documentId, errorMessage);
          return false;
        }

        // 3. Marcar como concluido
        updateStatus(documentId, 'done');
        options?.onDocumentComplete?.(documentId);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        updateStatus(documentId, 'error', errorMessage);
        options?.onError?.(documentId, errorMessage);
        return false;
      }
    },
    [updateStatus, options]
  );

  /**
   * Inicia o pipeline para todos os documentos pendentes de uma minuta
   */
  const startPipeline = useCallback(
    async (minutaId: string): Promise<void> => {
      setIsProcessing(true);

      let hasErrors = false;

      try {
        // 1. Buscar documentos pendentes
        const { data: docs } = await supabase
          .from('documentos')
          .select('id')
          .eq('minuta_id', minutaId)
          .in('status', ['uploaded', 'pendente']);

        // 2. Processar cada documento sequencialmente
        for (const doc of docs || []) {
          const success = await processDocument(doc.id);
          if (!success) {
            hasErrors = true;
          }
        }

        // 3. Se nao houve erros, executar map-to-fields
        if (!hasErrors) {
          await supabase.functions.invoke('map-to-fields', {
            body: { minuta_id: minutaId },
          });

          // 4. Atualizar status da minuta
          await supabase
            .from('minutas')
            .update({
              status: 'revisao',
              current_step: 'outorgantes',
            })
            .eq('id', minutaId);

          options?.onPipelineComplete?.(minutaId);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [processDocument, options]
  );

  /**
   * Gera a minuta final utilizando a edge function generate-minuta
   */
  const generateMinuta = useCallback(
    async (minutaId: string, templateType?: string): Promise<GenerationResult> => {
      setIsGenerating(true);
      setGenerationStatus({ status: 'generating' });

      try {
        // 1. Atualizar status da minuta para 'gerando'
        await supabase
          .from('minutas')
          .update({
            geracao_status: 'gerando',
          })
          .eq('id', minutaId);

        // 2. Chamar edge function generate-minuta
        const { data, error } = await supabase.functions.invoke('generate-minuta', {
          body: {
            minuta_id: minutaId,
            template_type: templateType || 'VENDA_COMPRA',
          },
        });

        if (error) {
          const errorMessage = error.message || 'Generation failed';
          setGenerationStatus({ status: 'error', error: errorMessage });

          // Atualizar status de erro no banco
          await supabase
            .from('minutas')
            .update({
              geracao_status: 'erro',
              geracao_erro: errorMessage,
            })
            .eq('id', minutaId);

          options?.onGenerationError?.(minutaId, errorMessage);

          return {
            success: false,
            error: errorMessage,
          };
        }

        // 3. Sucesso - a edge function ja atualiza o banco
        const result = data as GenerationResult;
        setGenerationStatus({ status: 'done' });

        // Atualizar status para gerado (pode ja ter sido feito pela edge function)
        await supabase
          .from('minutas')
          .update({
            geracao_status: 'gerado',
            gerado_em: new Date().toISOString(),
          })
          .eq('id', minutaId);

        options?.onGenerationComplete?.(minutaId, result);

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setGenerationStatus({ status: 'error', error: errorMessage });

        // Atualizar status de erro no banco
        await supabase
          .from('minutas')
          .update({
            geracao_status: 'erro',
            geracao_erro: errorMessage,
          })
          .eq('id', minutaId);

        options?.onGenerationError?.(minutaId, errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );

  /**
   * Calcula o progresso geral como a media de todos os documentos
   */
  const overallProgress = useMemo(() => {
    if (statuses.size === 0) return 0;

    let totalProgress = 0;
    statuses.forEach((status) => {
      totalProgress += status.progress;
    });

    return Math.round(totalProgress / statuses.size);
  }, [statuses]);

  return {
    startPipeline,
    processDocument,
    generateMinuta,
    isProcessing,
    isGenerating,
    statuses,
    generationStatus,
    overallProgress,
  };
}
