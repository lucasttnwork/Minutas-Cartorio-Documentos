// src/pages/AgenteExtrator.tsx

import { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Square, RefreshCw, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UploadZone, ResultadoAnalise, ResultadoModal } from '@/components/agentes';
import { getAgenteBySlug } from '@/data/agentes';
import { getMockResponse, simulateStreaming, createAbortableStream } from '@/utils/mockStreaming';
import { exportToDocx, exportToPdf, copyToClipboard } from '@/utils/documentExport';
import { toast } from 'sonner';
import type { ArquivoUpload, AnaliseStatus } from '@/types/agente';

export default function AgenteExtrator() {
  const { tipo } = useParams<{ tipo: string }>();
  const navigate = useNavigate();

  const agente = getAgenteBySlug(tipo || '');

  const [arquivos, setArquivos] = useState<ArquivoUpload[]>([]);
  const [instrucoes, setInstrucoes] = useState('');
  const [status, setStatus] = useState<AnaliseStatus>('idle');
  const [resultado, setResultado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const abortRef = useRef<ReturnType<typeof createAbortableStream> | null>(null);

  if (!agente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Agente nao encontrado</p>
      </div>
    );
  }

  const canAnalyze = arquivos.length > 0 && status !== 'analyzing';
  const isAnalyzing = status === 'analyzing';
  const isCompleted = status === 'completed';

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;

    setStatus('analyzing');
    setResultado('');

    const stream = createAbortableStream();
    abortRef.current = stream;

    const mockText = getMockResponse(agente.slug);

    await simulateStreaming(
      mockText,
      (chunk) => {
        if (!stream.isAborted()) {
          setResultado(prev => prev + chunk);
        }
      },
      () => {
        if (!stream.isAborted()) {
          setStatus('completed');
        }
      },
      30
    );
  }, [canAnalyze, agente.slug]);

  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setStatus('completed');
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  const handleNewDocument = useCallback(() => {
    setArquivos([]);
    setInstrucoes('');
    setStatus('idle');
    setResultado('');
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(resultado);
      toast.success('Copiado para a area de transferencia');
    } catch {
      toast.error('Erro ao copiar');
    }
  }, [resultado]);

  const handleDownloadDocx = useCallback(async () => {
    try {
      await exportToDocx(resultado, `${agente.slug}-extracao`);
      toast.success('DOCX baixado com sucesso');
    } catch {
      toast.error('Erro ao gerar DOCX');
    }
  }, [resultado, agente.slug]);

  const handleDownloadPdf = useCallback(() => {
    try {
      exportToPdf(resultado, `${agente.slug}-extracao`);
      toast.success('PDF baixado com sucesso');
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  }, [resultado, agente.slug]);

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
            <h1 className="text-xl font-bold text-foreground mb-1">
              {agente.nome}
            </h1>
            <p className="text-sm text-muted-foreground">
              {agente.descricao}
            </p>
          </div>

          {/* Upload Zone */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Documentos
            </label>
            <UploadZone
              arquivos={arquivos}
              onArquivosChange={setArquivos}
              disabled={isAnalyzing || isCompleted}
            />
          </div>

          {/* Instructions */}
          <div className="mb-6 flex-1">
            <label className="text-sm font-medium mb-2 block">
              Instrucoes extras (opcional)
            </label>
            <Textarea
              value={instrucoes}
              onChange={(e) => setInstrucoes(e.target.value)}
              placeholder="Adicione instrucoes especificas para a extracao..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {status === 'idle' && (
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="w-full"
                size="lg"
              >
                Analisar
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
                <Button
                  onClick={handleRegenerate}
                  className="w-full"
                  size="lg"
                >
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
