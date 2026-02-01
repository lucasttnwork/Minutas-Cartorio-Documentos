// src/pages/AgenteExtrator.tsx

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Square, RefreshCw, FilePlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UploadZone, ResultadoAnalise, ResultadoModal } from '@/components/agentes';
import { getAgenteBySlug } from '@/data/agentes';
import { getMockResponse, simulateStreaming, createAbortableStream } from '@/utils/mockStreaming';
import { exportToDocx, exportToPdf, copyToClipboard } from '@/utils/documentExport';
import { useGeminiStream } from '@/hooks/useGeminiStream';
import { shouldUseRealGemini } from '@/services/gemini';
import { toast } from 'sonner';
import type { ArquivoUpload, AnaliseStatus } from '@/types/agente';

export default function AgenteExtrator() {
  const { tipo } = useParams<{ tipo: string }>();
  const navigate = useNavigate();

  const agente = useMemo(() => getAgenteBySlug(tipo || ''), [tipo]);

  const [arquivos, setArquivos] = useState<ArquivoUpload[]>([]);
  const [instrucoes, setInstrucoes] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Estados para modo mock
  const [mockStatus, setMockStatus] = useState<AnaliseStatus>('idle');
  const [mockResultado, setMockResultado] = useState('');
  const [mockIsStreaming, setMockIsStreaming] = useState(false);
  const abortRef = useRef<ReturnType<typeof createAbortableStream> | null>(null);

  // Hook do Gemini para modo real
  const gemini = useGeminiStream();

  // Determinar se usar Gemini real ou mock
  const useRealGemini = shouldUseRealGemini();

  // Estados unificados baseados no modo
  const status = useRealGemini ? gemini.status : mockStatus;
  const resultado = useRealGemini ? gemini.resultado : mockResultado;
  const error = useRealGemini ? gemini.error : null;
  const isStreaming = useRealGemini ? gemini.isStreaming : mockIsStreaming;
  const thinking = useRealGemini ? gemini.thinking : '';
  const thinkingDuration = useRealGemini ? gemini.thinkingDuration : 0;

  const canAnalyze = arquivos.length > 0 && status !== 'analyzing';
  const isAnalyzing = status === 'analyzing';
  const isCompleted = status === 'completed';
  const hasError = status === 'error';

  // Mostrar toast de erro quando houver
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  /**
   * Handler para análise com Gemini real
   */
  const handleAnalyzeReal = useCallback(async () => {
    if (!canAnalyze || !agente) return;

    const files = arquivos.map((a) => a.file);
    await gemini.startStream(agente.slug, files, instrucoes);
  }, [canAnalyze, agente, arquivos, instrucoes, gemini]);

  /**
   * Handler para análise mock (fallback)
   */
  const handleAnalyzeMock = useCallback(async () => {
    if (!canAnalyze || !agente) return;

    setMockStatus('analyzing');
    setMockResultado('');
    setMockIsStreaming(true);

    const stream = createAbortableStream();
    abortRef.current = stream;

    const mockText = getMockResponse(agente.slug);

    await simulateStreaming(
      mockText,
      (chunk) => {
        if (!stream.isAborted()) {
          setMockResultado((prev) => prev + chunk);
        }
      },
      () => {
        if (!stream.isAborted()) {
          setMockStatus('completed');
          setMockIsStreaming(false);
        }
      },
      30
    );
  }, [canAnalyze, agente]);

  /**
   * Handler unificado de análise
   */
  const handleAnalyze = useCallback(async () => {
    if (useRealGemini) {
      await handleAnalyzeReal();
    } else {
      await handleAnalyzeMock();
    }
  }, [useRealGemini, handleAnalyzeReal, handleAnalyzeMock]);

  /**
   * Handler para parar a análise
   */
  const handleStop = useCallback(() => {
    if (useRealGemini) {
      gemini.stopStream();
    } else if (abortRef.current) {
      abortRef.current.abort();
      setMockStatus('completed');
      setMockIsStreaming(false);
    }
  }, [useRealGemini, gemini]);

  /**
   * Handler para regenerar a análise
   */
  const handleRegenerate = useCallback(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  /**
   * Handler para novo documento
   */
  const handleNewDocument = useCallback(() => {
    setArquivos([]);
    setInstrucoes('');

    if (useRealGemini) {
      gemini.reset();
    } else {
      setMockStatus('idle');
      setMockResultado('');
      setMockIsStreaming(false);
    }
  }, [useRealGemini, gemini]);

  /**
   * Handlers de exportação
   */
  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(resultado);
      toast.success('Copiado para a área de transferência');
    } catch {
      toast.error('Erro ao copiar');
    }
  }, [resultado]);

  const handleDownloadDocx = useCallback(async () => {
    if (!agente) return;
    try {
      await exportToDocx(resultado, `${agente.slug}-extracao`);
      toast.success('DOCX baixado com sucesso');
    } catch {
      toast.error('Erro ao gerar DOCX');
    }
  }, [resultado, agente]);

  const handleDownloadPdf = useCallback(() => {
    if (!agente) return;
    try {
      exportToPdf(resultado, `${agente.slug}-extracao`);
      toast.success('PDF baixado com sucesso');
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  }, [resultado, agente]);

  // Early return after all hooks
  if (!agente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Agente não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/agentes')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          {/* Indicador de modo */}
          {!useRealGemini && (
            <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded">
              Modo Demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className="hover:text-foreground cursor-pointer"
            onClick={() => navigate('/dashboard/agentes')}
          >
            Agentes
          </span>
          <span>/</span>
          <span className="text-foreground">{agente.nome}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Column - Inputs */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-96 border-r border-border p-6 overflow-auto flex flex-col"
        >
          {/* Agent Info */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground mb-1">{agente.nome}</h1>
            <p className="text-sm text-muted-foreground">{agente.descricao}</p>
          </div>

          {/* Upload Zone */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Documentos</label>
            <UploadZone
              arquivos={arquivos}
              onArquivosChange={setArquivos}
              disabled={isAnalyzing || isCompleted}
            />
          </div>

          {/* Instructions */}
          <div className="mb-6 flex-1">
            <label className="text-sm font-medium mb-2 block">
              Instruções extras (opcional)
            </label>
            <Textarea
              value={instrucoes}
              onChange={(e) => setInstrucoes(e.target.value)}
              placeholder="Adicione instruções específicas para a extração..."
              className="min-h-[100px] resize-none"
              disabled={isAnalyzing}
            />
          </div>

          {/* Error Alert */}
          {hasError && error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {(status === 'idle' || hasError) && (
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="w-full"
                size="lg"
              >
                {hasError ? 'Tentar Novamente' : 'Analisar'}
              </Button>
            )}

            {isAnalyzing && (
              <Button
                onClick={handleStop}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <Square className="w-4 h-4 mr-2" />
                Parar
              </Button>
            )}

            {isCompleted && (
              <>
                <Button onClick={handleRegenerate} className="w-full" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Novamente
                </Button>
                <Button
                  onClick={handleNewDocument}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <FilePlus className="w-4 h-4 mr-2" />
                  Novo Documento
                </Button>
              </>
            )}
          </div>
        </motion.aside>

        {/* Right Column - Result */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 p-6"
        >
          <ResultadoAnalise
            status={status}
            conteudo={resultado}
            thinking={thinking}
            thinkingDuration={thinkingDuration}
            isStreaming={isStreaming}
            onCopy={handleCopy}
            onDownloadDocx={handleDownloadDocx}
            onDownloadPdf={handleDownloadPdf}
            onExpand={() => setModalOpen(true)}
          />
        </motion.main>
      </div>

      {/* Fullscreen Modal */}
      <ResultadoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        titulo={agente.nome}
        conteudo={resultado}
        onCopy={handleCopy}
        onDownloadDocx={handleDownloadDocx}
        onDownloadPdf={handleDownloadPdf}
      />
    </div>
  );
}
