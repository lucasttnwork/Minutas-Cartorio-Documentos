import * as React from "react"
import { cn } from "@/lib/utils"

// Skeleton base com animação shimmer
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "animate-pulse rounded-lg bg-muted/50",
      "relative overflow-hidden",
      "before:absolute before:inset-0",
      "before:-translate-x-full",
      "before:animate-[shimmer_2s_infinite]",
      "before:bg-gradient-to-r",
      "before:from-transparent before:via-white/10 before:to-transparent",
      className
    )}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

// Skeleton para texto (linha única)
const SkeletonText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { width?: string }
>(({ className, width = "w-full", ...props }, ref) => (
  <Skeleton
    ref={ref}
    className={cn("h-4", width, className)}
    {...props}
  />
))
SkeletonText.displayName = "SkeletonText"

// Skeleton para heading
const SkeletonHeading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { width?: string }
>(({ className, width = "w-1/2", ...props }, ref) => (
  <Skeleton
    ref={ref}
    className={cn("h-8", width, className)}
    {...props}
  />
))
SkeletonHeading.displayName = "SkeletonHeading"

// Skeleton para avatar/círculo
const SkeletonAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }
  
  return (
    <Skeleton
      ref={ref}
      className={cn("rounded-full", sizeClasses[size], className)}
      {...props}
    />
  )
})
SkeletonAvatar.displayName = "SkeletonAvatar"

// Skeleton para input/campo de formulário
const SkeletonInput = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    <Skeleton className="h-4 w-24" /> {/* Label */}
    <Skeleton className="h-10 w-full rounded-lg" /> {/* Input */}
  </div>
))
SkeletonInput.displayName = "SkeletonInput"

// Skeleton para botão
const SkeletonButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { width?: string }
>(({ className, width = "w-24", ...props }, ref) => (
  <Skeleton
    ref={ref}
    className={cn("h-10 rounded-lg", width, className)}
    {...props}
  />
))
SkeletonButton.displayName = "SkeletonButton"

// Skeleton para Card completo (estilo do projeto)
const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    lines?: number
    showAvatar?: boolean
    showActions?: boolean
  }
>(({ className, lines = 3, showAvatar = false, showActions = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card p-6 space-y-4",
      className
    )}
    {...props}
  >
    {/* Header */}
    <div className="flex items-center gap-4">
      {showAvatar && <SkeletonAvatar />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    
    {/* Content lines */}
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
    
    {/* Actions */}
    {showActions && (
      <div className="flex gap-3 pt-2">
        <SkeletonButton width="w-20" />
        <SkeletonButton width="w-20" />
      </div>
    )}
  </div>
))
SkeletonCard.displayName = "SkeletonCard"

// Skeleton para formulário com várias seções
const SkeletonForm = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    sections?: number
    fieldsPerSection?: number
  }
>(({ className, sections = 2, fieldsPerSection = 4, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-8", className)} {...props}>
    {Array.from({ length: sections }).map((_, sectionIndex) => (
      <div
        key={sectionIndex}
        className="rounded-xl border border-border bg-card p-6 space-y-6"
      >
        {/* Section header */}
        <div className="space-y-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        
        {/* Grid of fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: fieldsPerSection }).map((_, fieldIndex) => (
            <SkeletonInput key={fieldIndex} />
          ))}
        </div>
      </div>
    ))}
    
    {/* Submit button */}
    <div className="flex justify-end gap-4">
      <SkeletonButton width="w-28" />
      <SkeletonButton width="w-36" />
    </div>
  </div>
))
SkeletonForm.displayName = "SkeletonForm"

// Skeleton para tabela
const SkeletonTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    rows?: number
    columns?: number
  }
>(({ className, rows = 5, columns = 4, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card overflow-hidden",
      className
    )}
    {...props}
  >
    {/* Header */}
    <div className="border-b border-border p-4 bg-muted/30">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn(
                  "h-4 flex-1",
                  colIndex === 0 && "max-w-[200px]"
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
))
SkeletonTable.displayName = "SkeletonTable"

// Skeleton para Dashboard cards
const SkeletonDashboardCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card p-6 space-y-4",
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-10 w-24" />
    <Skeleton className="h-3 w-40" />
  </div>
))
SkeletonDashboardCard.displayName = "SkeletonDashboardCard"

export {
  Skeleton,
  SkeletonText,
  SkeletonHeading,
  SkeletonAvatar,
  SkeletonInput,
  SkeletonButton,
  SkeletonCard,
  SkeletonForm,
  SkeletonTable,
  SkeletonDashboardCard,
}
