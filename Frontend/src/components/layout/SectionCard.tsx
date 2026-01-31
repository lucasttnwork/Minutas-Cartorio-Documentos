// src/components/layout/SectionCard.tsx
// Premium section card with multiple variants and elegant styling
// Inspired by Linear and Notion card designs

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionCardVariant =
  | "default"
  | "nested"
  | "elevated"
  | "bordered"
  | "ghost"
  | "highlight"
  | "featured";

interface SectionCardProps {
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  variant?: SectionCardVariant;
  icon?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  noPadding?: boolean;
}

// Animation configuration
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// Variant styles mapping
const variantStyles: Record<SectionCardVariant, string> = {
  default: cn(
    "glass-subtle",
    "shadow-sm",
    "hover:shadow-md hover:border-border/60",
    "transition-all duration-200"
  ),
  nested: cn(
    "bg-secondary/30",
    "border border-border/30"
  ),
  elevated: cn(
    "glass-card",
    "shadow-md",
    "hover:shadow-lg",
    "hover:translate-y-[-1px]",
    "transition-all duration-300"
  ),
  bordered: cn(
    "bg-transparent",
    "border-2 border-primary/20",
    "hover:border-primary/30",
    "hover:bg-primary/5",
    "transition-all duration-200"
  ),
  ghost: cn(
    "bg-transparent",
    "border-none"
  ),
  highlight: cn(
    "bg-gradient-to-br from-primary/5 via-card to-card",
    "border border-primary/20",
    "shadow-sm shadow-primary/5",
    "hover:shadow-md hover:shadow-primary/10",
    "transition-all duration-200"
  ),
  featured: cn(
    "glass-card",
    "relative overflow-hidden",
    "shadow-lg",
    "hover:shadow-xl",
    "hover:translate-y-[-2px]",
    "transition-all duration-300",
    // Gradient border effect via pseudo-element
    "before:absolute before:inset-0 before:rounded-xl before:p-[1px]",
    "before:bg-gradient-to-br before:from-primary/30 before:via-transparent before:to-accent-vivid/20",
    "before:-z-10"
  ),
};

// Title styles per variant
const titleStyles: Record<SectionCardVariant, string> = {
  default: "text-foreground",
  nested: "text-foreground/80",
  elevated: "text-foreground",
  bordered: "text-primary",
  ghost: "text-foreground",
  highlight: "text-primary",
  featured: "text-foreground",
};

export function SectionCard({
  title,
  description,
  children,
  className,
  action,
  variant = "default",
  icon,
  noPadding = false,
}: SectionCardProps) {
  const hasHeader = title || action;

  return (
    <motion.section
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "rounded-xl overflow-hidden",
        variantStyles[variant],
        className
      )}
    >
      {/* Header */}
      {hasHeader && (
        <div
          className={cn(
            "flex items-start justify-between gap-4",
            noPadding ? "px-5 md:px-8 pt-5 md:pt-6" : "p-5 md:p-8 pb-0"
          )}
        >
          <div className="flex items-start gap-3 min-w-0">
            {/* Icon */}
            {icon && (
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                  variant === "highlight" || variant === "bordered"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {icon}
              </div>
            )}

            {/* Title & Description */}
            <div className="min-w-0">
              {title && (
                <h3
                  className={cn(
                    "font-semibold tracking-tight",
                    variant === "nested"
                      ? "text-sm uppercase tracking-wider"
                      : "text-base md:text-lg",
                    titleStyles[variant]
                  )}
                >
                  {title}
                </h3>
              )}

              {description && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Action */}
          {action && (
            <div className="flex-shrink-0">{action}</div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(!noPadding && "p-5 md:p-8", hasHeader && !noPadding && "pt-4 md:pt-6")}>
        {children}
      </div>
    </motion.section>
  );
}

// Compact variant for smaller sections
export function SectionCardCompact({
  title,
  children,
  className,
  action,
  variant = "default",
}: Omit<SectionCardProps, "description" | "icon" | "noPadding">) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "rounded-lg overflow-hidden",
        variantStyles[variant],
        "p-4",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-3">
          {title && (
            <h4
              className={cn(
                "text-sm font-semibold",
                titleStyles[variant]
              )}
            >
              {title}
            </h4>
          )}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
}

// Stats card variant
export function StatsCard({
  label,
  value,
  trend,
  trendLabel,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon?: ReactNode;
  className?: string;
}) {
  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ translateY: -2 }}
      className={cn(
        "rounded-xl p-5",
        "glass-subtle",
        "shadow-sm",
        "hover:shadow-md",
        "transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {value}
          </p>

          {trend && trendLabel && (
            <p className={cn("text-xs mt-2 font-medium", trendColors[trend])}>
              {trend === "up" && "+"}
              {trend === "down" && "-"}
              {trendLabel}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl",
              "bg-primary/10 text-primary",
              "transition-transform duration-200 group-hover:scale-110"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Feature card with hover effect
export function FeatureCard({
  title,
  description,
  icon,
  onClick,
  className,
  disabled = false,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={!disabled ? { scale: 1.02, y: -3 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left rounded-xl p-5",
        "glass-subtle",
        "transition-all duration-200",
        !disabled && "hover:border-primary/30 hover:shadow-lg",
        disabled && "opacity-50 cursor-not-allowed grayscale",
        className
      )}
      style={{
        boxShadow: !disabled ? undefined : "none"
      }}
    >
      <motion.div
        className={cn(
          "flex items-center justify-center w-11 h-11 rounded-xl mb-4",
          "bg-primary/10 text-primary"
        )}
        whileHover={!disabled ? { scale: 1.1, rotate: 5 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {icon}
      </motion.div>

      <h4 className="text-base font-semibold text-foreground mb-1">{title}</h4>

      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      )}
    </motion.button>
  );
}
