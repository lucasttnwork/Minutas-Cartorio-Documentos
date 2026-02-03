// src/pages/AgenteExtrator.tsx

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, FilePlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UploadZone, ResultadoAnalise, ResultadoModal, MobileAgentHeader, MobileActionBar, filterJsonSection } from '@/components/agentes';
import { getAgenteBySlug } from '@/data/agentes';
import { exportToDocx, exportToPdf, copyToClipboard } from '@/utils/documentExport';
import { useAgentRun } from '@/hooks/useAgentRun';
import { useIsMobile } from '@/hooks/useIsMobile';
import { toast } from 'sonner';
import type { ArquivoUpload } from '@/types/agente';

export default function AgenteExtrator() {
  const { tipo } = useParams<{ tipo: string }>();
  const navigate = useNavigate();

  const agente = useMemo(() => getAgenteBySlug(tipo || ''), [tipo]);

  const [arquivos, setArquivos] = useState<ArquivoUpload[]>([]);
  const [instrucoes, setInstrucoes] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Hook para executar runs via Edge Function
  const agent = useAgentRun();

  // Estados derivados do hook
  const { status, resultado, error, runId, inputTokens, outputTokens, durationMs } = agent;

  const isMobile = useIsMobile();
  const [showResults, setShowResults] = useState(false);

  const canAnalyze = arquivos.length > 0 && status !== 'analyzing';
  const isAnalyzing = status === 'analyzing';
  const isCompleted = status === 'completed';
  const hasError = status === 'error';

  // Quando a analise completar, mostrar resultados no mobile
  useEffect(() => {
    if (isCompleted && isMobile) {
      setShowResults(true);
    }
  }, [isCompleted, isMobile]);

  // Mostrar toast de erro quando houver
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Log de métricas quando completar (útil para debugging)
  useEffect(() => {
    if (isCompleted && runId) {
      console.log('[AgenteExtrator] Run completed:', {
        runId,
        inputTokens,
        outputTokens,
        durationMs: `${durationMs}ms`,
      });
    }
  }, [isCompleted, runId, inputTokens, outputTokens, durationMs]);

  /**
   * Handler para executar análise
   */
  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze || !agente) return;

    const files = arquivos.map((a) => a.file);
    await agent.executeRun(agente.slug, files, instrucoes);
  }, [canAnalyze, agente, arquivos, instrucoes, agent]);

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
    agent.reset();
  }, [agent]);

  /**
   * Handler para novo documento no mobile (reseta showResults)
   */
  const handleNewDocumentMobile = useCallback(() => {
    setShowResults(false);
    handleNewDocument();
  }, [handleNewDocument]);

  /**
   * Handlers de exportação
   * Usam filterJsonSection para remover dados JSON do conteúdo exportado
   */
  const handleCopy = useCallback(async () => {
    try {
      const cleanContent = filterJsonSection(resultado);
      await copyToClipboard(cleanContent);
      toast.success('Copiado para a área de transferência');
    } catch {
      toast.error('Erro ao copiar');
    }
  }, [resultado]);

  const handleDownloadDocx = useCallback(async () => {
    if (!agente) return;
    try {
      const cleanContent = filterJsonSection(resultado);
      await exportToDocx(cleanContent, `${agente.slug}-extracao`);
      toast.success('DOCX baixado com sucesso');
    } catch {
      toast.error('Erro ao gerar DOCX');
    }
  }, [resultado, agente]);

  const handleDownloadPdf = useCallback(() => {
    if (!agente) return;
    try {
      const cleanContent = filterJsonSection(resultado);
      exportToPdf(cleanContent, `${agente.slug}-extracao`);
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

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MobileAgentHeader
          title={agente.nome}
          subtitle={showResults ? 'Resultado da análise' : 'Upload de documento'}
        />

        <AnimatePresence mode="wait">
          {!showResults ? (
            // Upload View
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-4 overflow-auto scroll-touch"
            >
              {/* Agent Description */}
              <p className="text-sm text-muted-foreground mb-6">
                {agente.descricao}
              </p>

              {/* Upload Zone */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">
                  Documentos
                </label>
                <UploadZone
                  arquivos={arquivos}
                  onArquivosChange={setArquivos}
                  disabled={isAnalyzing || isCompleted}
                />
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">
                  Instruções extras (opcional)
                </label>
                <Textarea
                  value={instrucoes}
                  onChange={(e) => setInstrucoes(e.target.value)}
                  placeholder="Adicione instruções específicas..."
                  className="min-h-[100px] resize-none text-base"
                  disabled={isAnalyzing}
                />
              </div>

              {/* Inline Action Button - right after content */}
              <div className="mb-6">
                {(status === 'idle' || hasError) && (
                  <Button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className="w-full h-12 text-base font-medium"
                    size="lg"
                  >
                    {hasError ? 'Tentar Novamente' : 'Analisar Documento'}
                  </Button>
                )}

                {isAnalyzing && (
                  <Button
                    disabled
                    variant="secondary"
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    <div className="w-5 h-5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </Button>
                )}
              </div>

              {/* Error Alert */}
              {hasError && error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </motion.div>
          ) : (
            // Results View
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden pb-20"
            >
              <ResultadoAnalise
                status={status}
                conteudo={resultado}
                onCopy={handleCopy}
                onDownloadDocx={handleDownloadDocx}
                onDownloadPdf={handleDownloadPdf}
                onExpand={() => setModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Action Bar - only when showing results */}
        {showResults && (
          <MobileActionBar
            status={status}
            canAnalyze={canAnalyze}
            onAnalyze={handleAnalyze}
            onRegenerate={handleRegenerate}
            onNewDocument={handleNewDocumentMobile}
          />
        )}

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

  // Desktop Layout
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left Column - Inputs */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full md:w-72 lg:w-80 xl:w-96 flex-shrink-0 border-b md:border-b-0 md:border-r border-border p-4 md:p-5 max-h-[50vh] md:max-h-none overflow-auto md:overflow-visible"
      >
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard/agentes')}
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Agentes
        </Button>

        {/* Agent Info */}
        <div className="mb-5">
          <h1 className="text-lg font-bold text-foreground mb-1">{agente.nome}</h1>
          <p className="text-sm text-muted-foreground">{agente.descricao}</p>
        </div>

        {/* Upload Zone */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Documentos</label>
          <UploadZone
            arquivos={arquivos}
            onArquivosChange={setArquivos}
            disabled={isAnalyzing || isCompleted}
          />
        </div>

        {/* Action Buttons - logo abaixo do upload */}
        <div className="mb-5 space-y-2">
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
            <Button disabled variant="secondary" className="w-full" size="lg">
              <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processando...
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

        {/* Instructions - abaixo dos botões */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">
            Instruções extras (opcional)
          </label>
          <Textarea
            value={instrucoes}
            onChange={(e) => setInstrucoes(e.target.value)}
            placeholder="Adicione instruções específicas para a extração..."
            className="min-h-[80px] resize-none"
            disabled={isAnalyzing}
          />
        </div>

        {/* Error Alert */}
        {hasError && error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </motion.aside>

      {/* Right Column - Result */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex-1 min-h-0 overflow-hidden"
      >
        <ResultadoAnalise
          status={status}
          conteudo={resultado}
          onCopy={handleCopy}
          onDownloadDocx={handleDownloadDocx}
          onDownloadPdf={handleDownloadPdf}
          onExpand={() => setModalOpen(true)}
        />
      </motion.main>

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
