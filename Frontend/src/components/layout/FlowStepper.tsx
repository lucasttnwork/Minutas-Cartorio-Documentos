// src/components/layout/FlowStepper.tsx
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MinutaStep } from "@/types/minuta";

interface FlowStepperProps {
  currentStep: MinutaStep;
  completedSteps?: MinutaStep[];
  onStepClick?: (step: MinutaStep) => void;
  className?: string;
}

const STEPS: { id: MinutaStep; label: string; route: string }[] = [
  { id: 'upload', label: 'Upload', route: '/minuta/nova' },
  { id: 'outorgantes', label: 'Outorgantes', route: '/minuta/:id/outorgantes' },
  { id: 'outorgados', label: 'Outorgados', route: '/minuta/:id/outorgados' },
  { id: 'imoveis', label: 'Imóveis', route: '/minuta/:id/imoveis' },
  { id: 'parecer', label: 'Parecer', route: '/minuta/:id/parecer' },
  { id: 'negocio', label: 'Negócio', route: '/minuta/:id/negocio' },
  { id: 'minuta', label: 'Minuta', route: '/minuta/:id/minuta' },
];

export function FlowStepper({
  currentStep,
  completedSteps = [],
  onStepClick,
  className,
}: FlowStepperProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  const handleStepClick = (step: typeof STEPS[number], index: number) => {
    // Can navigate to completed steps or current step
    if (index <= currentIndex || completedSteps.includes(step.id)) {
      if (onStepClick) {
        onStepClick(step.id);
      } else {
        const route = step.route.replace(':id', id || '');
        navigate(route);
      }
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
          const isCurrent = step.id === currentStep;
          const isClickable = index <= currentIndex || completedSteps.includes(step.id);

          return (
            <div key={step.id} className="flex-1 flex items-center">
              <button
                onClick={() => handleStepClick(step, index)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? "hsl(var(--accent))"
                      : isCurrent
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted))",
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                    isCompleted || isCurrent ? "text-background" : "text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2">
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: index < currentIndex
                        ? "hsl(var(--accent))"
                        : "hsl(var(--muted))",
                    }}
                    className="h-full rounded-full"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
