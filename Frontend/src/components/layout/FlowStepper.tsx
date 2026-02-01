// src/components/layout/FlowStepper.tsx
// Premium step indicator with elegant animations
// Inspired by Linear's progress indicators

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
  variant?: "default" | "compact" | "minimal";
}

const STEPS: { id: MinutaStep; label: string; shortLabel: string; route: string }[] = [
  { id: "upload", label: "Upload", shortLabel: "1", route: "/minuta/nova" },
  { id: "outorgantes", label: "Outorgantes", shortLabel: "2", route: "/minuta/:id/outorgantes" },
  { id: "outorgados", label: "Outorgados", shortLabel: "3", route: "/minuta/:id/outorgados" },
  { id: "imoveis", label: "Imóveis", shortLabel: "4", route: "/minuta/:id/imoveis" },
  { id: "parecer", label: "Parecer", shortLabel: "5", route: "/minuta/:id/parecer" },
  { id: "negocio", label: "Negócio", shortLabel: "6", route: "/minuta/:id/negocio" },
  { id: "minuta", label: "Minuta", shortLabel: "7", route: "/minuta/:id/minuta" },
];

export function FlowStepper({
  currentStep,
  completedSteps = [],
  onStepClick,
  className,
  variant = "default",
}: FlowStepperProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleStepClick = (step: (typeof STEPS)[number], index: number) => {
    const isClickable = index <= currentIndex || completedSteps.includes(step.id);
    if (!isClickable) return;

    if (onStepClick) {
      onStepClick(step.id);
    } else {
      const route = step.route.replace(":id", id || "");
      navigate(route);
    }
  };

  const isCompact = variant === "compact";
  const isMinimal = variant === "minimal";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
          const isCurrent = step.id === currentStep;
          const isClickable = index <= currentIndex || completedSteps.includes(step.id);
          const isLast = index === STEPS.length - 1;

          return (
            <div
              key={step.id}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              {/* Step Circle */}
              <motion.button
                onClick={() => handleStepClick(step, index)}
                disabled={!isClickable}
                className={cn(
                  "relative flex flex-col items-center gap-2 group",
                  isClickable ? "cursor-pointer" : "cursor-not-allowed"
                )}
                whileHover={isClickable ? { scale: 1.05 } : undefined}
                whileTap={isClickable ? { scale: 0.95 } : undefined}
              >
                {/* Circle indicator */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.05 : 1,
                    boxShadow: isCurrent
                      ? "0 0 0 4px oklch(from var(--primary) l c h / 0.25), 0 0 20px oklch(from var(--primary) l c h / 0.35)"
                      : isCompleted
                      ? "0 0 12px oklch(from var(--primary) l c h / 0.20)"
                      : "0 0 0 0px transparent",
                  }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "relative flex items-center justify-center rounded-full transition-all duration-300",
                    isMinimal ? "w-3 h-3" : isCompact ? "w-8 h-8" : "w-10 h-10",
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                    !isClickable && "opacity-40"
                  )}
                >
                  {isMinimal ? (
                    // Minimal: just a dot
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent || isCompleted ? 1 : 0.6,
                      }}
                      className={cn(
                        "w-full h-full rounded-full",
                        isCompleted || isCurrent ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    />
                  ) : isCompleted ? (
                    // Completed: checkmark with smooth spring transition
                    <motion.div
                      initial={{ scale: 0, opacity: 0, rotate: -45 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: 0.1
                      }}
                    >
                      <Check className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    // Default: number
                    <span
                      className={cn(
                        "font-semibold",
                        isCompact ? "text-xs" : "text-sm"
                      )}
                    >
                      {index + 1}
                    </span>
                  )}

                  {/* Pulse animation for current step - ENHANCED */}
                  {isCurrent && !isMinimal && (
                    <>
                      {/* Primary pulse ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                      {/* Secondary subtle glow pulse */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary"
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: 1.4, opacity: 0 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut",
                          delay: 0.3,
                        }}
                      />
                    </>
                  )}
                </motion.div>

                {/* Label */}
                {!isMinimal && (
                  <span
                    className={cn(
                      "text-center font-medium transition-colors duration-200",
                      isCompact ? "text-[10px]" : "text-xs",
                      isCompact ? "hidden sm:block" : "hidden sm:block",
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground",
                      !isClickable && "opacity-40"
                    )}
                  >
                    {step.label}
                  </span>
                )}
              </motion.button>

              {/* Connector Line - THICKER */}
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 mx-2 sm:mx-3",
                    isMinimal ? "h-0.5" : isCompact ? "h-1" : "h-1.5"
                  )}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-muted/40">
                    <motion.div
                      initial={false}
                      animate={{
                        width: index < currentIndex ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full",
                        "bg-gradient-to-r from-primary to-primary/80"
                      )}
                      style={{
                        boxShadow: index < currentIndex ? "0 0 8px oklch(from var(--primary) l c h / 0.3)" : "none"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Vertical variant for sidebars
export function FlowStepperVertical({
  currentStep,
  completedSteps = [],
  onStepClick,
  className,
}: Omit<FlowStepperProps, "variant">) {
  const navigate = useNavigate();
  const { id } = useParams();

  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleStepClick = (step: (typeof STEPS)[number], index: number) => {
    const isClickable = index <= currentIndex || completedSteps.includes(step.id);
    if (!isClickable) return;

    if (onStepClick) {
      onStepClick(step.id);
    } else {
      const route = step.route.replace(":id", id || "");
      navigate(route);
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
        const isCurrent = step.id === currentStep;
        const isClickable = index <= currentIndex || completedSteps.includes(step.id);
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.id} className="flex">
            {/* Left: Circle & Line */}
            <div className="flex flex-col items-center mr-4">
              <motion.button
                onClick={() => handleStepClick(step, index)}
                disabled={!isClickable}
                whileHover={isClickable ? { scale: 1.1 } : undefined}
                whileTap={isClickable ? { scale: 0.9 } : undefined}
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full",
                  "transition-all duration-300",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
                  isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                )}
                style={{
                  boxShadow: isCurrent
                    ? "0 0 0 4px oklch(from var(--primary) l c h / 0.25), 0 0 20px oklch(from var(--primary) l c h / 0.35)"
                    : isCompleted
                    ? "0 0 10px oklch(from var(--primary) l c h / 0.20)"
                    : "none"
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
                {/* Pulse for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </motion.button>

              {/* Vertical connector - THICKER */}
              {!isLast && (
                <div className="w-1 h-12 bg-muted/40 my-2 relative overflow-hidden rounded-full">
                  <motion.div
                    initial={false}
                    animate={{
                      height: index < currentIndex ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-x-0 top-0 bg-gradient-to-b from-primary to-primary/80 rounded-full"
                    style={{
                      boxShadow: index < currentIndex ? "0 0 8px oklch(from var(--primary) l c h / 0.3)" : "none"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right: Label & Description */}
            <div className={cn("pb-8", isLast && "pb-0")}>
              <button
                onClick={() => handleStepClick(step, index)}
                disabled={!isClickable}
                className={cn(
                  "text-left transition-colors duration-200",
                  isClickable ? "cursor-pointer" : "cursor-not-allowed"
                )}
              >
                <p
                  className={cn(
                    "font-medium",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground",
                    !isClickable && "opacity-50"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Etapa {index + 1} de {STEPS.length}
                </p>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
