// src/components/layout/EntityCard.tsx
// Premium collapsible entity card with luxurious styling
// Features: gradient borders, floating shadows, shimmer effects

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Premium accent color system with gradients and sophisticated styling
// Designed for luxurious, professional appearance - Deep Teal as default
const ACCENT_COLORS: Record<string, {
  border: string;
  bgLight: string;
  bgMedium: string;
  text: string;
  gradient: string;
  iconGradient: string;
  hoverGlow: string;
}> = {
  // Deep Teal - Default premium color
  accent: {
    border: 'border-transparent', // Border handled by ::before pseudo-element
    bgLight: 'bg-transparent',
    bgMedium: 'bg-[oklch(50%_0.08_180_/_0.15)]',
    text: 'text-[oklch(40%_0.10_180)] dark:text-[oklch(70%_0.08_180)]',
    gradient: 'from-[oklch(50%_0.10_180_/_0.15)] via-[oklch(55%_0.08_180_/_0.08)] to-[oklch(45%_0.10_180_/_0.12)]',
    iconGradient: 'from-[oklch(55%_0.12_180_/_0.25)] to-[oklch(45%_0.10_180_/_0.15)]',
    hoverGlow: 'hover:shadow-[0_0_35px_-8px_oklch(55%_0.12_180_/_0.35)]',
  },
  teal: {
    border: 'border-transparent',
    bgLight: 'bg-transparent',
    bgMedium: 'bg-[oklch(50%_0.08_180_/_0.15)]',
    text: 'text-[oklch(40%_0.10_180)] dark:text-[oklch(70%_0.08_180)]',
    gradient: 'from-[oklch(50%_0.10_180_/_0.15)] via-[oklch(55%_0.08_180_/_0.08)] to-[oklch(45%_0.10_180_/_0.12)]',
    iconGradient: 'from-[oklch(55%_0.12_180_/_0.25)] to-[oklch(45%_0.10_180_/_0.15)]',
    hoverGlow: 'hover:shadow-[0_0_35px_-8px_oklch(55%_0.12_180_/_0.35)]',
  },
  gold: {
    border: 'border-transparent',
    bgLight: 'bg-transparent',
    bgMedium: 'bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/15 via-amber-400/8 to-amber-500/12',
    iconGradient: 'from-amber-500/30 to-amber-600/20',
    hoverGlow: 'hover:shadow-[0_0_30px_-8px_oklch(75%_0.12_75_/_0.35)]',
  },
  platinum: {
    border: 'border-transparent',
    bgLight: 'bg-transparent',
    bgMedium: 'bg-slate-400/15',
    text: 'text-slate-600 dark:text-slate-300',
    gradient: 'from-slate-400/12 via-slate-300/6 to-slate-400/10',
    iconGradient: 'from-slate-400/25 to-slate-500/15',
    hoverGlow: 'hover:shadow-[0_0_30px_-8px_oklch(70%_0.01_250_/_0.3)]',
  },
  emerald: {
    border: 'border-transparent',
    bgLight: 'bg-transparent',
    bgMedium: 'bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/15 via-emerald-400/8 to-emerald-500/12',
    iconGradient: 'from-emerald-500/30 to-emerald-600/20',
    hoverGlow: 'hover:shadow-[0_0_30px_-8px_oklch(65%_0.15_155_/_0.35)]',
  },
  rose: {
    border: 'border-transparent',
    bgLight: 'bg-transparent',
    bgMedium: 'bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500/15 via-rose-400/8 to-rose-500/12',
    iconGradient: 'from-rose-500/30 to-rose-600/20',
    hoverGlow: 'hover:shadow-[0_0_30px_-8px_oklch(60%_0.18_15_/_0.35)]',
  },
};

const getAccentColors = (color: string) => ACCENT_COLORS[color] || ACCENT_COLORS.accent;

interface EntityCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  isComplete?: boolean;
  defaultOpen?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
  children: ReactNode;
  className?: string;
  accentColor?: string;
  /** Use premium styling with gradients and glows */
  premium?: boolean;
}

export function EntityCard({
  title,
  subtitle,
  icon,
  isComplete = false,
  defaultOpen = true,
  onRemove,
  removeLabel = "Remover",
  children,
  className,
  accentColor = "accent",
  premium = true, // Default to premium styling
}: EntityCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colors = getAccentColors(accentColor);

  // Premium styling is enabled by default - kept for API compatibility
  void premium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "entity-card-premium",
        "rounded-xl overflow-hidden",
        "bg-card/80 backdrop-blur-sm",
        colors.hoverGlow,
        "transition-all duration-300",
        className
      )}
    >
      {/* Premium Header with gradient background */}
      <div
        className={cn(
          "entity-card-header-premium",
          "flex items-center justify-between p-4 cursor-pointer",
          "transition-all duration-200",
          "hover:bg-accent/5"
        )}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="flex items-center gap-3">
          {/* Premium icon container with gradient and glow */}
          {icon && (
            <div
              className={cn(
                "entity-card-icon-premium",
                "p-2.5 rounded-lg",
                "flex items-center justify-center",
                colors.text
              )}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground tracking-tight truncate">
                {title}
              </h3>
              {/* Status indicator with subtle animation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse-dot" />
                )}
              </motion.div>
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Premium remove button */}
          {onRemove && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5",
                "text-xs font-medium",
                "text-destructive/80 hover:text-destructive",
                "bg-destructive/8 hover:bg-destructive/15",
                "border border-destructive/20 hover:border-destructive/30",
                "rounded-lg transition-all duration-200",
                "shadow-sm hover:shadow"
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {removeLabel}
            </motion.button>
          )}
          {/* Animated chevron with spring physics */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className={cn(
              "p-1 rounded-md",
              "bg-secondary/50",
              "text-muted-foreground"
            )}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      {/* Content with smooth expand/collapse */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.25, ease: "easeOut" },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.05,
              }}
            >
              <div
                className={cn(
                  "entity-card-content-premium",
                  "p-5",
                  "border-t border-border/30"
                )}
              >
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
