import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  href: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function ProgressStepper({ steps, currentStep, onStepClick }: ProgressStepperProps) {
  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        
        {/* Progress Line Active */}
        <motion.div
          className="absolute top-5 left-0 h-0.5 bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
            >
              <motion.button
                onClick={() => onStepClick?.(index)}
                disabled={isPending}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                  isCompleted && "bg-accent text-accent-foreground cursor-pointer hover:bg-accent/90",
                  isCurrent && "bg-accent text-accent-foreground ring-4 ring-accent/30",
                  isPending && "bg-muted text-muted-foreground cursor-not-allowed"
                )}
                whileHover={!isPending ? { scale: 1.05 } : undefined}
                whileTap={!isPending ? { scale: 0.95 } : undefined}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.button>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[80px] leading-tight",
                  isCurrent ? "text-accent" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
