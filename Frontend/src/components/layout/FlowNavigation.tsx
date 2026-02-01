// src/components/layout/FlowNavigation.tsx
// Premium flow navigation bar with elegant animations
// Sticky bottom bar for step-by-step flows

import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Check, Home } from "lucide-react";
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
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  className?: string;
  variant?: "default" | "compact" | "floating";
}

const STEP_ORDER: MinutaStep[] = [
  "upload",
  "processando",
  "outorgantes",
  "outorgados",
  "imoveis",
  "parecer",
  "negocio",
  "minuta",
];

const STEP_ROUTES: Record<MinutaStep, string> = {
  upload: "/minuta/nova",
  processando: "/minuta/:id/processando",
  outorgantes: "/minuta/:id/outorgantes",
  outorgados: "/minuta/:id/outorgados",
  imoveis: "/minuta/:id/imoveis",
  parecer: "/minuta/:id/parecer",
  negocio: "/minuta/:id/negocio",
  minuta: "/minuta/:id/minuta",
};

export function FlowNavigation({
  currentStep,
  onBack,
  onNext,
  backLabel = "Voltar",
  nextLabel = "Próximo",
  showSaveIndicator = true,
  isSaving = false,
  isNextDisabled = false,
  isBackDisabled = false,
  className,
  variant = "default",
}: FlowNavigationProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < STEP_ORDER.length - 1;
  const isLastStep = currentIndex === STEP_ORDER.length - 1;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (hasPrevious) {
      const prevStep = STEP_ORDER[currentIndex - 1];
      const route = STEP_ROUTES[prevStep].replace(":id", id || "");
      navigate(route);
    } else {
      navigate("/dashboard");
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (hasNext) {
      const nextStep = STEP_ORDER[currentIndex + 1];
      const route = STEP_ROUTES[nextStep].replace(":id", id || "");
      navigate(route);
    }
  };

  const isFloating = variant === "floating";
  const isCompact = variant === "compact";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky bottom-0 left-0 right-0 z-40",
        isFloating ? "p-4" : "mt-8",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-4",
          isFloating
            ? cn(
                "max-w-3xl mx-auto px-5 py-3.5 rounded-2xl",
                "glass-card",
                "shadow-lg"
              )
            : cn(
                "p-4",
                "bg-card/90 backdrop-blur-xl backdrop-saturate-150",
                "border-t border-border/40"
              ),
          isCompact && "py-2"
        )}
      >
        {/* Back Button */}
        <motion.div
          whileHover={!isBackDisabled ? { x: -3 } : undefined}
          whileTap={!isBackDisabled ? { scale: 0.98 } : undefined}
        >
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isBackDisabled}
            className={cn(
              "group flex items-center gap-2",
              isCompact && "h-9 text-sm",
              isBackDisabled && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            {!hasPrevious ? (
              <>
                <motion.span
                  className="inline-flex"
                  whileHover={{ scale: 1.1 }}
                >
                  <Home className="w-4 h-4" />
                </motion.span>
                <span className="hidden sm:inline">Dashboard</span>
              </>
            ) : (
              <>
                <motion.span
                  className="inline-flex transition-transform duration-200 group-hover:-translate-x-0.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                </motion.span>
                <span className="hidden sm:inline">{backLabel}</span>
              </>
            )}
          </Button>
        </motion.div>

        {/* Center: Save Indicator & Progress */}
        <div className="flex items-center gap-4">
          {/* Save Indicator */}
          {showSaveIndicator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm"
            >
              {isSaving ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Salvando...</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 text-success"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success/10">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="hidden sm:inline text-muted-foreground">
                    Salvo
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Progress indicator */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Etapa {currentIndex + 1} de {STEP_ORDER.length}
            </span>
            <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={false}
                animate={{
                  width: `${((currentIndex + 1) / STEP_ORDER.length) * 100}%`,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Next/Finish Button */}
        <motion.div
          whileHover={!isNextDisabled ? { x: 3 } : undefined}
          whileTap={!isNextDisabled ? { scale: 0.98 } : undefined}
        >
          {isLastStep ? (
            <Button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={cn(
                "group flex items-center gap-2",
                "bg-success hover:bg-success/90 text-success-foreground",
                isCompact && "h-9 text-sm",
                isNextDisabled && "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              <motion.span
                className="inline-flex"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Check className="w-4 h-4" />
              </motion.span>
              <span>Finalizar</span>
            </Button>
          ) : hasNext ? (
            <Button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={cn(
                "group flex items-center gap-2",
                isCompact && "h-9 text-sm",
                isNextDisabled && "opacity-50 grayscale cursor-not-allowed"
              )}
            >
              <span className="hidden sm:inline">{nextLabel}</span>
              <motion.span
                className="inline-flex transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Button>
          ) : null}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Simple navigation for non-flow pages
export function PageNavigation({
  onBack,
  backLabel = "Voltar",
  onAction,
  actionLabel,
  actionIcon,
  className,
}: {
  onBack?: () => void;
  backLabel?: string;
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  className?: string;
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-center justify-between mb-6", className)}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Button>

      {onAction && actionLabel && (
        <Button onClick={onAction} size="sm" className="flex items-center gap-2">
          {actionIcon}
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
