import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronDown, RefreshCw } from "lucide-react"

/* =============================================================================
   FORM SECTION COMPONENT - Premium Design System
   -----------------------------------------------------------------------------
   Elegant section wrapper for grouping related form fields with clear
   visual hierarchy. Inspired by Apple Settings and Linear's form layouts.

   Features:
   - Clear title with optional description
   - Collapsible sections for complex forms
   - Optional action buttons
   - Consistent grid layout for children
   - Subtle visual separators between sections
   ============================================================================= */

export interface FormSectionAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: "default" | "ghost" | "outline" | "secondary"
  loading?: boolean
}

export interface FormSectionProps {
  /** Section title (uppercase by default) */
  title: string
  /** Optional description below title */
  description?: string
  /** Section content */
  children: React.ReactNode
  /** Optional action button */
  action?: FormSectionAction
  /** Additional action buttons */
  actions?: FormSectionAction[]
  /** Grid columns for children (default: 3) */
  columns?: 1 | 2 | 3 | 4
  /** Additional className */
  className?: string
  /** Make section collapsible */
  collapsible?: boolean
  /** Initial collapsed state */
  defaultCollapsed?: boolean
  /** Section variant */
  variant?: "default" | "card" | "bordered" | "ghost"
  /** Icon displayed before title */
  icon?: React.ReactNode
  /** Badge/status indicator */
  badge?: React.ReactNode
  /** Remove top border/padding for first section */
  isFirst?: boolean
}

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
}

export function FormSection({
  title,
  description,
  children,
  action,
  actions = [],
  columns = 3,
  className,
  collapsible = false,
  defaultCollapsed = false,
  variant = "default",
  icon,
  badge,
  isFirst = false,
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  // Combine single action with actions array
  const allActions = action ? [action, ...actions] : actions

  // Variant-specific styles with glass-subtle option
  const variantStyles = {
    default: cn(
      "pt-6 mt-6",
      !isFirst && "border-t border-border/40"
    ),
    card: cn(
      "p-6 rounded-xl",
      "glass-subtle",
      "shadow-sm"
    ),
    bordered: cn(
      "p-5 rounded-lg border-2 border-border/60",
      "bg-transparent"
    ),
    ghost: cn(
      "pt-4 mt-4"
    ),
  }

  // Header content as JSX (not a component to avoid render issues)
  const headerContent = (
    <div className="flex items-start gap-3">
      {/* Icon */}
      {icon && (
        <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}

      {/* Title and Description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "text-xs font-semibold tracking-widest uppercase",
            "text-muted-foreground",
            "transition-colors duration-150"
          )}>
            {title}
          </h4>
          {badge}
        </div>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground/80 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {allActions.length > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {allActions.map((actionItem, index) => (
            <Button
              key={index}
              size="sm"
              variant={actionItem.variant || "ghost"}
              onClick={actionItem.onClick}
              loading={actionItem.loading}
              className="h-7 text-xs gap-1.5"
            >
              {actionItem.icon || <RefreshCw className="w-3 h-3" />}
              <span className="hidden sm:inline">{actionItem.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Collapse Toggle with smooth chevron rotation */}
      {collapsible && (
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex-shrink-0"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expandir seção" : "Recolher seção"}
        >
          <ChevronDown
            className={cn(
              "w-4 h-4",
              "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isCollapsed && "-rotate-90"
            )}
          />
        </Button>
      )}
    </div>
  )

  return (
    <section
      className={cn(
        variantStyles[variant],
        isFirst && variant === "default" && "pt-0 mt-0 border-t-0",
        className
      )}
    >
      {/* Header */}
      <header className="mb-5">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-full text-left",
              "rounded-lg -mx-2 px-2 py-1",
              "hover:bg-accent/50 transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            {headerContent}
          </button>
        ) : (
          headerContent
        )}
      </header>

      {/* Content with smooth collapse transition */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsible && isCollapsed
            ? "grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100"
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("grid gap-4 gap-y-5", gridCols[columns])}>
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

/* -----------------------------------------------------------------------------
   FormSectionDivider - Visual separator between sections
   ----------------------------------------------------------------------------- */

export interface FormSectionDividerProps {
  /** Optional label in the middle of the divider */
  label?: string
  /** Additional className */
  className?: string
}

export function FormSectionDivider({
  label,
  className,
}: FormSectionDividerProps) {
  if (label) {
    return (
      <div className={cn("relative py-6", className)}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-background text-xs text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>
    )
  }

  return (
    <hr className={cn("border-t border-border/40 my-6", className)} />
  )
}

/* -----------------------------------------------------------------------------
   FormSectionGrid - Alternative layout with side-by-side title and fields
   Inspired by Linear's settings pages
   ----------------------------------------------------------------------------- */

export interface FormSectionGridProps {
  /** Section title */
  title: string
  /** Section description */
  description?: string
  /** Form fields */
  children: React.ReactNode
  /** Additional className */
  className?: string
}

export function FormSectionGrid({
  title,
  description,
  children,
  className,
}: FormSectionGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-10",
      "py-6 border-t border-border/40 first:border-t-0 first:pt-0",
      className
    )}>
      {/* Left Side - Title and Description */}
      <div className="md:col-span-4 lg:col-span-3">
        <h4 className="text-sm font-semibold text-foreground">
          {title}
        </h4>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Right Side - Form Fields */}
      <div className="md:col-span-8 lg:col-span-9">
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------------
   FormSectionCard - Card-wrapped section for standalone forms
   ----------------------------------------------------------------------------- */

export interface FormSectionCardProps extends FormSectionProps {
  /** Show footer with save/cancel buttons */
  showFooter?: boolean
  /** Footer content */
  footer?: React.ReactNode
}

export function FormSectionCard({
  showFooter,
  footer,
  ...props
}: FormSectionCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <FormSection
        {...props}
        variant="ghost"
        className="p-6"
      />

      {(showFooter || footer) && (
        <footer className="px-6 py-4 bg-muted/30 border-t border-border/50 flex justify-end gap-3">
          {footer}
        </footer>
      )}
    </div>
  )
}
