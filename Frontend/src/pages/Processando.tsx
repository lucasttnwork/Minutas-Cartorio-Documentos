// src/pages/Processando.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useMinuta } from "@/contexts/MinutaContext";
import { Loader2, FileSearch, CheckCircle2, Brain } from "lucide-react";

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

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentProcessingStep((prev) => {
        if (prev >= PROCESSING_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const completeTimeout = setTimeout(() => {
      setCurrentStep('outorgantes');
      navigate(`/minuta/${id}/outorgantes`);
    }, PROCESSING_STEPS.length * 1500 + 500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [id, navigate, setCurrentStep]);

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
