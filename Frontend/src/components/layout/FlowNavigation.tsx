// src/components/layout/FlowNavigation.tsx
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MinutaStep } from "@/types/minuta";

interface FlowNavigationProps {
  currentStep: MinutaStep;
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  showSaveIndicator?: boolean;
  isSaving?: boolean;
  className?: string;
}

const STEP_ORDER: MinutaStep[] = [
  'upload',
  'processando',
  'outorgantes',
  'outorgados',
  'imoveis',
  'parecer',
  'negocio',
  'minuta',
];

const STEP_ROUTES: Record<MinutaStep, string> = {
  upload: '/minuta/nova',
  processando: '/minuta/:id/processando',
  outorgantes: '/minuta/:id/outorgantes',
  outorgados: '/minuta/:id/outorgados',
  imoveis: '/minuta/:id/imoveis',
  parecer: '/minuta/:id/parecer',
  negocio: '/minuta/:id/negocio',
  minuta: '/minuta/:id/minuta',
};

export function FlowNavigation({
  currentStep,
  onBack,
  onNext,
  backLabel = "Voltar",
  nextLabel = "Próximo",
  showSaveIndicator = true,
  isSaving = false,
  className,
}: FlowNavigationProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < STEP_ORDER.length - 1;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (hasPrevious) {
      const prevStep = STEP_ORDER[currentIndex - 1];
      const route = STEP_ROUTES[prevStep].replace(':id', id || '');
      navigate(route);
    } else {
      navigate('/');
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (hasNext) {
      const nextStep = STEP_ORDER[currentIndex + 1];
      const route = STEP_ROUTES[nextStep].replace(':id', id || '');
      navigate(route);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "sticky bottom-0 left-0 right-0 p-4 mt-8 bg-background/95 backdrop-blur border-t border-border",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Button>

        <div className="flex items-center gap-4">
          {showSaveIndicator && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-green-500" />
                  <span>Salvo automaticamente</span>
                </>
              )}
            </div>
          )}

          {hasNext && (
            <Button onClick={handleNext} className="flex items-center gap-2">
              {nextLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
