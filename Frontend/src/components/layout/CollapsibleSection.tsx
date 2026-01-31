// src/components/layout/CollapsibleSection.tsx
// Premium collapsible section with smooth animations
// Inspired by Notion's accordion design

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";

type CollapsibleVariant = "default" | "bordered" | "ghost" | "filled";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  variant?: CollapsibleVariant;
  icon?: ReactNode;
  subtitle?: string;
  badge?: ReactNode;
  headerAction?: ReactNode;
  disabled?: boolean;
}

// Variant styles
const variantStyles: Record<CollapsibleVariant, { container: string; header: string; content: string }> = {
  default: {
    container: "border border-border/50 rounded-xl overflow-hidden bg-card",
    header: "hover:bg-secondary/50",
    content: "border-t border-border/30",
  },
  bordered: {
    container: "border-2 border-primary/20 rounded-xl overflow-hidden",
    header: "hover:bg-primary/5",
    content: "border-t border-primary/10",
  },
  ghost: {
    container: "",
    header: "rounded-lg hover:bg-secondary/50",
    content: "pl-4 border-l-2 border-border/50 ml-3",
  },
  filled: {
    container: "rounded-xl overflow-hidden bg-secondary/30",
    header: "hover:bg-secondary/50",
    content: "",
  },
};

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
  variant = "default",
  icon,
  subtitle,
  badge,
  headerAction,
  disabled = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const styles = variantStyles[variant];

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(styles.container, disabled && "opacity-60", className)}
    >
      {/* Header / Trigger */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-3 p-4",
          "text-left transition-colors duration-200",
          !disabled && "cursor-pointer",
          disabled && "cursor-not-allowed",
          styles.header
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Chevron indicator - with overshoot animation */}
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              // Subtle overshoot effect
            }}
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-md shrink-0",
              "bg-secondary/50 text-muted-foreground",
              "transition-colors duration-200",
              isOpen && "bg-primary/10 text-primary"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>

          {/* Icon (optional) */}
          {icon && (
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                "bg-primary/10 text-primary"
              )}
            >
              {icon}
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "font-semibold text-foreground tracking-tight truncate",
                  variant === "ghost" ? "text-base" : "text-sm md:text-base"
                )}
              >
                {title}
              </h3>

              {badge && <div className="shrink-0">{badge}</div>}
            </div>

            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Header Action or Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {headerAction && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              {headerAction}
            </div>
          )}
        </div>
      </button>

      {/* Content - with fade + slide animation */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.25, ease: "easeOut" }
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
                delay: 0.05
              }}
              className={cn("p-4 pt-0", styles.content)}
            >
              <div className="pt-4">{children}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Simpler accordion variant for grouped items
export function AccordionGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

// Accordion item that works within AccordionGroup
export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  icon,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3 p-3",
          "text-left transition-colors duration-200",
          "hover:bg-secondary/30"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <div className="text-muted-foreground">{icon}</div>
          )}
          <span className="text-sm font-medium text-foreground truncate">
            {title}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          className="text-muted-foreground"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.2, ease: "easeOut" }
            }}
          >
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.03 }}
              className="px-3 pb-3 pt-0"
            >
              <div className="pt-2 border-t border-border/30">{children}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
