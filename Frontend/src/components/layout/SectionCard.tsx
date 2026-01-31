import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionCardProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  variant?: "default" | "nested";
}

export function SectionCard({ title, children, className, action, variant = "default" }: SectionCardProps) {
  const isNested = variant === "nested";
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-xl p-5 md:p-8",
        isNested 
          ? "bg-card/50 border border-muted" 
          : "bg-card border-2 border-accent shadow-lg shadow-accent/5",
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className={cn(
            "font-bold uppercase tracking-wider",
            isNested 
              ? "text-sm md:text-base text-foreground/70" 
              : "text-lg md:text-xl text-foreground"
          )}>
            {title}
          </h3>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </motion.section>
  );
}
