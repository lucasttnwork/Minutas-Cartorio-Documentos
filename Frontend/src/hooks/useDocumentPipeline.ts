/**
 * Hook para orquestrar o pipeline de processamento de documentos
 *
 * O pipeline consiste em:
 * 1. classify-document - Classifica o tipo do documento
 * 2. extract-document - Extrai dados do documento
 * 3. map-to-fields - Mapeia dados extraidos para campos estruturados (executado apos todos os docs)
 * 4. generate-minuta - Gera a minuta final (opcional, acionado pelo usuario)
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkerPool } from './useWorkerPool';
import type { WorkerTask } from './useWorkerPool';

const CLASSIFICATION_WORKERS = 10;
const EXTRACTION_WORKERS = 10;

export interface PipelineStatus {
  documentId: string;
  step: 'queued' | 'classifying' | 'extracting' | 'mapping' | 'done' | 'error';
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
  generateMinuta: (minutaId: string, templateType?: string, templateId?: string) => Promise<GenerationResult>;

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

  /** Numero de workers de classificacao ativos */
  classificationWorkers: number;

  /** Numero de workers de extracao ativos */
  extractionWorkers: number;

  /** Numero de documentos na fila de classificacao */
  classificationQueue: number;

  /** Numero de documentos na fila de extracao */
  extractionQueue: number;
}

const PROGRESS_MAP: Record<PipelineStatus['step'], number> = {
  queued: 0,
  classifying: 0,
  extracting: 33,
  mapping: 66,
  done: 100,
  error: 0,
};

interface ClassifyResult {
  tipo_documento: string;
  confianca: number;
}

interface ExtractResult {
  dados_extraidos: Record<string, unknown>;
}

export function useDocumentPipeline(
  options?: UseDocumentPipelineOptions
): UseDocumentPipelineReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statuses, setStatuses] = useState<Map<string, PipelineStatus>>(new Map());
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: 'idle',
  });

  const minutaIdRef = useRef<string | null>(null);
  const optionsRef = useRef(options);
  const sentToExtractionRef = useRef<Set<string>>(new Set());

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

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


  const extractionProcessor = useCallback(async (docId: string) => {
    const { data, error } = await supabase.functions.invoke('extract-document', {
      body: { documento_id: docId }
    });
    if (error) throw new Error(error.message);
    return data;
  }, []);

  const extractionOnComplete = useCallback((task: WorkerTask<string, ExtractResult>) => {
    updateStatus(task.id, 'done');
    optionsRef.current?.onDocumentComplete?.(task.id);
  }, [updateStatus]);

  const extractionOnError = useCallback((task: WorkerTask<string, ExtractResult>, error: Error) => {
    updateStatus(task.id, 'error', error.message);
    optionsRef.current?.onError?.(task.id, error.message);
  }, [updateStatus]);

  // Pool de extração
  const extractionPool = useWorkerPool<string, ExtractResult>({
    maxWorkers: EXTRACTION_WORKERS,
    processor: extractionProcessor,
    onTaskComplete: extractionOnComplete,
    onTaskError: extractionOnError
  });

  const classificationProcessor = useCallback(async (docId: string) => {
    updateStatus(docId, 'classifying');
    const { data, error } = await supabase.functions.invoke('classify-document', {
      body: { documento_id: docId }
    });
    if (error) throw new Error(error.message);
    return data;
  }, [updateStatus]);

  const classificationOnError = useCallback((task: WorkerTask<string, ClassifyResult>, error: Error) => {
    updateStatus(task.id, 'error', error.message);
    optionsRef.current?.onError?.(task.id, error.message);
  }, [updateStatus]);

  // Pool de classificação
  const classificationPool = useWorkerPool<string, ClassifyResult>({
    maxWorkers: CLASSIFICATION_WORKERS,
    processor: classificationProcessor,
    onTaskError: classificationOnError
  });

  // Observar classificações completadas e adicionar à fila de extração
  // Usamos completedCount como dependência para garantir que o effect roda quando tarefas completam
  useEffect(() => {
    const classifiedTasks = Array.from(classificationPool.tasks.values())
      .filter(t => t.status === 'completed' && !sentToExtractionRef.current.has(t.id));

    classifiedTasks.forEach(task => {
      sentToExtractionRef.current.add(task.id);
      updateStatus(task.id, 'extracting');
      extractionPool.addTask(task.id, task.id);
    });
  }, [classificationPool.tasks, classificationPool.completedCount, extractionPool.addTask, updateStatus]);

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
          optionsRef.current?.onError?.(documentId, errorMessage);
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
          optionsRef.current?.onError?.(documentId, errorMessage);
          return false;
        }

        // 3. Marcar como concluido
        updateStatus(documentId, 'done');
        optionsRef.current?.onDocumentComplete?.(documentId);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        updateStatus(documentId, 'error', errorMessage);
        optionsRef.current?.onError?.(documentId, errorMessage);
        return false;
      }
    },
    [updateStatus]
  );

  /**
   * Inicia o pipeline para todos os documentos pendentes de uma minuta
   */
  const startPipeline = useCallback(
    async (minutaId: string): Promise<void> => {
      setIsProcessing(true);
      minutaIdRef.current = minutaId;

      // Reset pools
      classificationPool.reset();
      extractionPool.reset();
      setStatuses(new Map());
      sentToExtractionRef.current = new Set();

      // Buscar documentos
      const { data: docs } = await supabase
        .from('documentos')
        .select('id')
        .eq('minuta_id', minutaId)
        .in('status', ['uploaded', 'pendente']);

      if (!docs?.length) {
        setIsProcessing(false);
        return;
      }

      // Inicializar status e adicionar todos à fila de classificação
      docs.forEach(doc => {
        updateStatus(doc.id, 'queued');
      });

      classificationPool.addTasks(docs.map(d => ({ id: d.id, input: d.id })));
    },
    [classificationPool.reset, classificationPool.addTasks, extractionPool.reset, updateStatus]
  );

  /**
   * Gera a minuta final utilizando a edge function generate-minuta
   */
  const generateMinuta = useCallback(
    async (minutaId: string, templateType?: string, templateId?: string): Promise<GenerationResult> => {
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
            template_id: templateId,
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

          optionsRef.current?.onGenerationError?.(minutaId, errorMessage);

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

        optionsRef.current?.onGenerationComplete?.(minutaId, result);

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

        optionsRef.current?.onGenerationError?.(minutaId, errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  // Verificar quando extraction pool terminou
  useEffect(() => {
    const totalExtraction = extractionPool.tasks.size;
    const completedExtraction = extractionPool.completedCount + extractionPool.failedCount;
    const allExtractionDone = totalExtraction > 0 && completedExtraction === totalExtraction;
    const nothingProcessing = !classificationPool.isProcessing && !extractionPool.isProcessing;

    if (isProcessing && allExtractionDone && nothingProcessing) {
      const hasErrors = extractionPool.failedCount > 0 || classificationPool.failedCount > 0;
      const hasSuccessfulExtractions = extractionPool.completedCount > 0;

      // Executar map-to-fields se houver pelo menos alguma extracao bem-sucedida
      // Isso permite que o mapeamento funcione com dados parciais em caso de erros
      if (hasSuccessfulExtractions && minutaIdRef.current) {
        console.log('[Pipeline] Executing map-to-fields with', extractionPool.completedCount, 'successful extractions');
        supabase.functions.invoke('map-to-fields', {
          body: { minuta_id: minutaIdRef.current }
        }).then(() => {
          return supabase.from('minutas').update({
            status: 'revisao',
            current_step: 'outorgantes',
          }).eq('id', minutaIdRef.current);
        }).then(() => {
          if (hasErrors) {
            console.log('[Pipeline] Completed with some errors:', extractionPool.failedCount, 'failed');
          }
          optionsRef.current?.onPipelineComplete?.(minutaIdRef.current!);
          setIsProcessing(false);
        }).catch((err) => {
          console.error('[Pipeline] Error in map-to-fields:', err);
          setIsProcessing(false);
        });
      } else {
        console.log('[Pipeline] No successful extractions, skipping map-to-fields');
        setIsProcessing(false);
      }
    }
  }, [
    extractionPool.completedCount,
    extractionPool.failedCount,
    extractionPool.tasks.size,
    extractionPool.isProcessing,
    classificationPool.isProcessing,
    classificationPool.failedCount,
    isProcessing,
  ]);

  /**
   * Calcula o progresso geral - 50% classificação, 50% extração
   */
  const overallProgress = useMemo(() => {
    const totalDocs = classificationPool.tasks.size || 1;
    const classifyProgress = classificationPool.progress * 0.5;
    const extractProgress = extractionPool.progress * 0.5;
    return Math.round(classifyProgress + extractProgress);
  }, [classificationPool.progress, extractionPool.progress, classificationPool.tasks.size]);

  return {
    startPipeline,
    processDocument,
    generateMinuta,
    isProcessing,
    isGenerating,
    statuses,
    generationStatus,
    overallProgress,
    classificationWorkers: classificationPool.activeWorkers,
    extractionWorkers: extractionPool.activeWorkers,
    classificationQueue: classificationPool.queuedCount,
    extractionQueue: extractionPool.queuedCount,
  };
}
