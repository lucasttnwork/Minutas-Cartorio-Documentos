// src/pages/Processando.tsx
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useMinuta } from "@/contexts/MinutaContext";
import { useDocumentPipeline } from "@/hooks/useDocumentPipeline";
import type { PipelineStatus } from "@/hooks/useDocumentPipeline";
import { Loader2, CheckCircle2, Brain, AlertCircle, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface DocumentInfo {
  id: string;
  nome_original: string;
}

function DocumentProcessingCard({
  name,
  status
}: {
  name: string;
  status?: PipelineStatus;
}) {
  const step = status?.step || 'queued';

  const getIcon = () => {
    switch (step) {
      case 'queued': return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'classifying': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'extracting': return <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />;
      case 'done': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (step) {
      case 'queued': return 'Na fila';
      case 'classifying': return 'Classificando...';
      case 'extracting': return 'Extraindo dados...';
      case 'done': return 'Concluído';
      case 'error': return status?.error || 'Erro';
      default: return 'Pendente';
    }
  };

  const getBgClass = () => {
    switch (step) {
      case 'classifying': return 'bg-blue-500/10 border-blue-500/30';
      case 'extracting': return 'bg-purple-500/10 border-purple-500/30';
      case 'done': return 'bg-green-500/10 border-green-500/30';
      case 'error': return 'bg-destructive/10 border-destructive/30';
      default: return 'bg-muted/50';
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${getBgClass()}`}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{getStatusText()}</p>
      </div>
    </div>
  );
}

function WorkerIndicator({
  label,
  active,
  queued,
  max,
  color
}: {
  label: string;
  active: number;
  queued: number;
  max: number;
  color: 'blue' | 'purple';
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${active > 0 ? (color === 'blue' ? 'bg-blue-500 animate-pulse' : 'bg-purple-500 animate-pulse') : 'bg-muted'}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${color === 'blue' ? 'text-blue-500' : 'text-purple-500'}`}>
          {active}/{max}
        </span>
        {queued > 0 && (
          <span className="text-xs text-muted-foreground">
            (+{queued} na fila)
          </span>
        )}
      </div>
    </div>
  );
}

export default function Processando() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setCurrentStep } = useMinuta();
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const pipelineStarted = useRef(false);

  const {
    startPipeline,
    isProcessing: _isProcessing,
    overallProgress,
    statuses,
    classificationWorkers,
    extractionWorkers,
    classificationQueue,
    extractionQueue,
  } = useDocumentPipeline({
    onDocumentComplete: (docId) => {
      console.log(`[Pipeline] Document processed: ${docId}`);
    },
    onPipelineComplete: (minutaId) => {
      console.log(`[Pipeline] Pipeline complete for minuta: ${minutaId}`);
      toast.success('Documentos processados com sucesso!');
      setCurrentStep('outorgantes');
      navigate(`/minuta/${minutaId}/outorgantes`);
    },
    onError: (docId, error) => {
      console.error(`[Pipeline] Error processing document ${docId}: ${error}`);
      setPipelineError(error);
      toast.error(`Erro no processamento: ${error}`);
    },
  });

  // Fetch document information
  useEffect(() => {
    if (id) {
      supabase
        .from('documentos')
        .select('id, nome_original')
        .eq('minuta_id', id)
        .in('status', ['uploaded', 'pendente'])
        .then(({ data }) => {
          if (data) setDocuments(data);
        });
    }
  }, [id]);

  // Start the actual document processing pipeline
  useEffect(() => {
    if (id && !pipelineStarted.current) {
      pipelineStarted.current = true;
      console.log(`[Processando] Starting pipeline for minuta: ${id}`);
      startPipeline(id).catch((err) => {
        console.error('[Processando] Pipeline failed:', err);
        setPipelineError(err.message || 'Erro desconhecido no pipeline');
      });
    }
  }, [id, startPipeline]);

  // NOTE: Removed fallback timeout - the pipeline should properly signal completion
  // via onPipelineComplete callback. A timeout-based navigation is dangerous because
  // it can navigate before data is ready, leaving the form empty.
  //
  // If the pipeline gets stuck, the user can:
  // 1. See the error state (if there's an error)
  // 2. Refresh the page and check the documents status
  // 3. Contact support if needed
  //
  // The proper flow is:
  // 1. All documents classified -> 2. All documents extracted ->
  // 3. map-to-fields executed -> 4. onPipelineComplete called -> 5. Navigate

  const getStatusMessage = () => {
    if (classificationWorkers > 0 && extractionWorkers === 0) {
      return 'Classificando documentos...';
    }
    if (extractionWorkers > 0) {
      return 'Extraindo dados com IA...';
    }
    // If we're at 90% (all extraction done), we're in the mapping phase
    if (overallProgress >= 90) {
      return 'Mapeando dados para o formulário...';
    }
    // If classification is done but extraction hasn't started
    if (classificationQueue === 0 && classificationWorkers === 0 && extractionWorkers === 0 && extractionQueue > 0) {
      return 'Preparando extração...';
    }
    return 'Processando documentos...';
  };

  // If there's an error, show error state with option to continue
  if (pipelineError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Erro no Processamento
          </h1>
          <p className="text-muted-foreground mb-4">
            {pipelineError}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Voce pode continuar para revisar os dados manualmente.
          </p>
          <button
            onClick={() => {
              setCurrentStep('outorgantes');
              navigate(`/minuta/${id}/outorgantes`);
            }}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Continuar para revisao
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Brain className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {getStatusMessage()}
        </h1>
        <p className="text-muted-foreground mb-8">
          A IA está analisando seus documentos...
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Progress Percentage */}
        <p className="text-sm text-muted-foreground mb-4">
          {overallProgress}% concluído
        </p>

        {/* Workers Status */}
        <div className="mb-6 p-4 rounded-lg bg-muted/30 space-y-2">
          <WorkerIndicator
            label="Classificação"
            active={classificationWorkers}
            queued={classificationQueue}
            max={10}
            color="blue"
          />
          <WorkerIndicator
            label="Extração"
            active={extractionWorkers}
            queued={extractionQueue}
            max={10}
            color="purple"
          />
          {/* Mapping indicator - shown when extraction is done */}
          {overallProgress >= 90 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Mapeamento</span>
              </div>
              <span className="text-sm font-medium text-green-500">
                Em progresso...
              </span>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto text-left">
          {documents.map((doc) => (
            <DocumentProcessingCard
              key={doc.id}
              name={doc.nome_original}
              status={statuses.get(doc.id)}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Não feche esta página. O processamento pode levar alguns minutos.
        </p>
      </motion.div>
    </main>
  );
}
