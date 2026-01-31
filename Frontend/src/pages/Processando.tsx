// src/pages/Processando.tsx
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useMinuta } from "@/contexts/MinutaContext";
import { useDocumentPipeline } from "@/hooks/useDocumentPipeline";
import { Loader2, FileSearch, CheckCircle2, Brain, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PROCESSING_STEPS = [
  { id: 1, label: 'Analisando documentos...', icon: FileSearch },
  { id: 2, label: 'Extraindo dados com IA...', icon: Brain },
  { id: 3, label: 'Identificando pessoas...', icon: FileSearch },
  { id: 4, label: 'Identificando imóveis...', icon: FileSearch },
  { id: 5, label: 'Gerando parecer jurídico...', icon: Brain },
  { id: 6, label: 'Finalizando...', icon: CheckCircle2 },
];

export default function Processando() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setCurrentStep } = useMinuta();
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const pipelineStarted = useRef(false);

  const { startPipeline, isProcessing, overallProgress } = useDocumentPipeline({
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

  // Update UI progress based on actual pipeline progress
  useEffect(() => {
    if (overallProgress > 0) {
      setProgress(overallProgress);
      // Map progress to steps
      const stepIndex = Math.min(
        Math.floor(overallProgress / (100 / PROCESSING_STEPS.length)),
        PROCESSING_STEPS.length - 1
      );
      setCurrentProcessingStep(stepIndex);
    }
  }, [overallProgress]);

  // Fallback timeout - if pipeline takes too long or doesn't complete
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!pipelineError && isProcessing) {
        // Pipeline is taking too long, navigate anyway
        console.log('[Processando] Fallback timeout - navigating to outorgantes');
        setCurrentStep('outorgantes');
        navigate(`/minuta/${id}/outorgantes`);
      }
    }, 60000); // 60 second fallback

    return () => clearTimeout(fallbackTimeout);
  }, [id, navigate, setCurrentStep, pipelineError, isProcessing]);

  // If no pipeline is active and no errors, show loading animation
  useEffect(() => {
    if (!isProcessing && !pipelineError && overallProgress === 0) {
      // Show loading animation while pipeline initializes
      const stepInterval = setInterval(() => {
        setCurrentProcessingStep((prev) => {
          if (prev >= PROCESSING_STEPS.length - 1) return 0;
          return prev + 1;
        });
      }, 1500);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 10;
          return prev + 5;
        });
      }, 200);

      return () => {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
      };
    }
  }, [isProcessing, pipelineError, overallProgress]);

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
          Processando Documentos
        </h1>
        <p className="text-muted-foreground mb-8">
          A IA está analisando seus documentos...
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Processing Steps */}
        <div className="space-y-3 text-left">
          {PROCESSING_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentProcessingStep;
            const isComplete = index < currentProcessingStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 border border-primary/30'
                    : isComplete
                    ? 'bg-green-500/10'
                    : 'bg-muted/50'
                }`}
              >
                {isActive ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Icon className="w-5 h-5 text-muted-foreground" />
                )}
                <span
                  className={`text-sm ${
                    isActive
                      ? 'text-primary font-medium'
                      : isComplete
                      ? 'text-green-500'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Não feche esta página. O processamento pode levar alguns minutos.
        </p>
      </motion.div>
    </main>
  );
}
