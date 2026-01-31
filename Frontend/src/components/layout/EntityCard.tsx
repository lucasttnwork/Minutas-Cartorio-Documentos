// src/components/layout/EntityCard.tsx
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT_COLORS: Record<string, { border: string; bgLight: string; bgMedium: string; text: string }> = {
  accent: {
    border: 'border-accent/50',
    bgLight: 'bg-accent/5',
    bgMedium: 'bg-accent/10',
    text: 'text-accent',
  },
  blue: {
    border: 'border-blue-500/50',
    bgLight: 'bg-blue-500/5',
    bgMedium: 'bg-blue-500/10',
    text: 'text-blue-500',
  },
  green: {
    border: 'border-green-500/50',
    bgLight: 'bg-green-500/5',
    bgMedium: 'bg-green-500/10',
    text: 'text-green-500',
  },
  yellow: {
    border: 'border-yellow-500/50',
    bgLight: 'bg-yellow-500/5',
    bgMedium: 'bg-yellow-500/10',
    text: 'text-yellow-500',
  },
  purple: {
    border: 'border-purple-500/50',
    bgLight: 'bg-purple-500/5',
    bgMedium: 'bg-purple-500/10',
    text: 'text-purple-500',
  },
  red: {
    border: 'border-red-500/50',
    bgLight: 'bg-red-500/5',
    bgMedium: 'bg-red-500/10',
    text: 'text-red-500',
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
}: EntityCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        "border-2 rounded-lg overflow-hidden",
        getAccentColors(accentColor).border,
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors",
          getAccentColors(accentColor).bgLight
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn("p-2 rounded-lg", getAccentColors(accentColor).bgMedium, getAccentColors(accentColor).text)}>
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:text-destructive/80 bg-destructive/10 hover:bg-destructive/20 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {removeLabel}
            </button>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 border-t border-border/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
