import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FieldGridProps {
  cols?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

const colsClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function FieldGrid({ cols = 2, children, className }: FieldGridProps) {
  return (
    <div className={cn("grid gap-4", colsClasses[cols], className)}>
      {children}
    </div>
  );
}
