// src/components/layout/PageHeader.tsx
// Premium page header with elegant typography and animations
// Inspired by Apple and Notion design patterns

import { motion } from "framer-motion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  instruction?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  variant?: "default" | "compact" | "hero";
}

// Animation variants for staggered reveal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function PageHeader({
  title,
  subtitle,
  instruction,
  breadcrumbs,
  showBreadcrumbs = true,
  actions,
  badge,
  className,
  variant = "default",
}: PageHeaderProps) {
  const isCompact = variant === "compact";
  const isHero = variant === "hero";

  return (
    <motion.header
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "relative",
        isHero && "pb-8 border-b border-border/50",
        isCompact ? "mb-4" : "mb-8",
        className
      )}
    >
      {/* Background gradient for hero variant */}
      {isHero && (
        <div
          className={cn(
            "absolute inset-0 -z-10",
            "bg-gradient-to-b from-primary/5 via-transparent to-transparent",
            "rounded-xl -mx-2 -mt-2 px-2 pt-2"
          )}
        />
      )}

      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <motion.div variants={itemVariants} className={cn(isCompact ? "mb-2" : "mb-4")}>
          <Breadcrumbs items={breadcrumbs} />
        </motion.div>
      )}

      {/* Main Header Content */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {/* Title with optional badge */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 flex-wrap"
          >
            <h1
              className={cn(
                "font-bold text-foreground tracking-tight text-balance",
                isHero
                  ? "text-3xl md:text-4xl"
                  : isCompact
                  ? "text-xl md:text-2xl"
                  : "text-2xl md:text-3xl"
              )}
            >
              {title}
            </h1>

            {badge && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                {badge}
              </motion.div>
            )}
          </motion.div>

          {/* Subtitle */}
          {subtitle && (
            <motion.h2
              variants={itemVariants}
              className={cn(
                "font-semibold text-muted-foreground mt-1",
                isHero
                  ? "text-lg md:text-xl"
                  : isCompact
                  ? "text-base"
                  : "text-lg md:text-xl"
              )}
            >
              {subtitle}
            </motion.h2>
          )}

          {/* Instruction text */}
          {instruction && (
            <motion.p
              variants={itemVariants}
              className={cn(
                "mt-4 text-overline",
                "inline-flex items-center gap-2"
              )}
            >
              {/* Decorative line */}
              <span
                className={cn(
                  "inline-block w-8 h-px",
                  "bg-gradient-to-r from-primary/50 to-transparent"
                )}
              />
              {instruction}
            </motion.p>
          )}
        </div>

        {/* Actions slot */}
        {actions && (
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 flex-shrink-0"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}

// Simpler variant for subpages or modals
export function PageHeaderSimple({
  title,
  subtitle,
  icon,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex items-start gap-3 mb-6", className)}
    >
      {icon && (
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            "bg-primary/10 text-primary",
            "shrink-0"
          )}
        >
          {icon}
        </div>
      )}

      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

// Section header for dividing content areas
export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex items-center justify-between gap-4 pb-4 mb-4",
        "border-b border-border/50",
        className
      )}
    >
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
