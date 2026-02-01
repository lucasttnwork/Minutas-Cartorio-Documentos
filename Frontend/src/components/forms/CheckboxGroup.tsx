import * as React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle, Info } from "lucide-react"

/* =============================================================================
   CHECKBOX GROUP COMPONENT - Premium Design System
   -----------------------------------------------------------------------------
   Elegant checkbox group with clear visual hierarchy, descriptions,
   and professional styling. Supports various layouts and states.

   Features:
   - Clear visual distinction between items
   - Optional descriptions for each checkbox
   - Multiple layout options (vertical, horizontal, grid)
   - Error and disabled states
   - Accessible with proper ARIA attributes
   ============================================================================= */

export interface CheckboxItem {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Optional description */
  description?: string
  /** Disabled state for individual item */
  disabled?: boolean
  /** Icon to display */
  icon?: React.ReactNode
}

export interface CheckboxGroupProps {
  /** Array of checkbox items */
  items: CheckboxItem[]
  /** Current values (record of id -> boolean) */
  values: Record<string, boolean>
  /** Change handler */
  onChange: (id: string, checked: boolean) => void
  /** Number of columns */
  columns?: 1 | 2 | 3
  /** Additional className */
  className?: string
  /** Group label */
  label?: string
  /** Group description/help text */
  description?: string
  /** Error message */
  error?: string
  /** Disabled state for all items */
  disabled?: boolean
  /** Required indicator */
  required?: boolean
  /** Variant style */
  variant?: "default" | "cards" | "compact" | "bordered"
  /** Orientation for compact variant */
  orientation?: "vertical" | "horizontal"
}

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
}

export function CheckboxGroup({
  items,
  values,
  onChange,
  columns = 1,
  className,
  label,
  description,
  error,
  disabled = false,
  required = false,
  variant = "default",
  orientation = "vertical",
}: CheckboxGroupProps) {
  const groupId = React.useId()
  const hasError = Boolean(error)

  // Variant-specific item styles with premium transitions
  const itemStyles = {
    default: cn(
      "flex items-start gap-3 p-3 rounded-lg",
      "bg-secondary/20 border border-transparent",
      "transition-all duration-200 ease-out",
      "hover:bg-secondary/40 hover:border-border/30",
      "has-[:checked]:bg-primary/5 has-[:checked]:border-primary/20",
      "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2"
    ),
    cards: cn(
      "flex items-start gap-3 p-4 rounded-xl",
      "bg-card border-2 border-border/60",
      "shadow-sm",
      "transition-all duration-200 ease-out",
      "hover:border-border hover:shadow-md",
      "has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-[0_0_0_1px_oklch(from_var(--primary)_l_c_h_/_0.1)]",
      "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2"
    ),
    compact: cn(
      "flex items-center gap-2",
      "transition-colors duration-200 ease-out"
    ),
    bordered: cn(
      "flex items-start gap-3 p-3",
      "border-b border-border/30 last:border-b-0",
      "transition-all duration-200 ease-out",
      "hover:bg-accent/30"
    ),
  }

  // Checkbox size based on variant
  const checkboxSize = variant === "cards" ? "h-5 w-5" : "h-4 w-4"

  // Layout styles
  const layoutStyles = {
    default: cn("grid gap-3", gridCols[columns]),
    cards: cn("grid gap-4", gridCols[columns]),
    compact: orientation === "horizontal"
      ? "flex flex-wrap items-center gap-4 gap-y-2"
      : "flex flex-col gap-2",
    bordered: "flex flex-col",
  }

  return (
    <div
      role="group"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-describedby={cn(
        description && `${groupId}-description`,
        hasError && `${groupId}-error`
      ) || undefined}
      className={cn("space-y-3", className)}
    >
      {/* Group Label with premium overline style */}
      {label && (
        <div className="space-y-1">
          <Label
            id={`${groupId}-label`}
            required={required}
            error={hasError}
            variant="overline"
            className={cn(
              "text-xs font-semibold tracking-widest uppercase",
              "text-muted-foreground",
              "transition-colors duration-200"
            )}
          >
            {label}
          </Label>
          {description && (
            <p
              id={`${groupId}-description`}
              className={cn(
                "text-sm text-muted-foreground leading-relaxed",
                "animate-in fade-in-0 duration-300"
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}

      {/* Error Message - Top */}
      {hasError && (
        <div
          id={`${groupId}-error`}
          role="alert"
          className={cn(
            "flex items-center gap-2 p-3 rounded-lg",
            "bg-destructive/10 border border-destructive/20",
            "text-sm text-destructive"
          )}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Checkbox Items */}
      <div
        className={cn(
          layoutStyles[variant],
          variant === "bordered" && "rounded-lg border border-border/50 overflow-hidden"
        )}
      >
        {items.map((item) => {
          const isDisabled = disabled || item.disabled
          const isChecked = values[item.id] || false

          return (
            <label
              key={item.id}
              className={cn(
                itemStyles[variant],
                isDisabled && "opacity-50 cursor-not-allowed pointer-events-none bg-muted/30"
              )}
            >
              {/* Checkbox */}
              <Checkbox
                id={item.id}
                checked={isChecked}
                onCheckedChange={(checked) => onChange(item.id, checked === true)}
                disabled={isDisabled}
                className={cn(
                  checkboxSize,
                  variant !== "compact" && "mt-0.5 shrink-0"
                )}
                aria-describedby={item.description ? `${item.id}-desc` : undefined}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Icon + Label Row */}
                <div className="flex items-center gap-2">
                  {item.icon && (
                    <span className="text-muted-foreground shrink-0">
                      {item.icon}
                    </span>
                  )}
                  <span
                    className={cn(
                      "font-medium cursor-pointer select-none",
                      variant === "compact" ? "text-sm" : "text-sm leading-tight",
                      isChecked && variant !== "compact" && "text-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Description */}
                {item.description && variant !== "compact" && (
                  <p
                    id={`${item.id}-desc`}
                    className={cn(
                      "mt-1 text-xs text-muted-foreground leading-relaxed",
                      isChecked && "text-muted-foreground/80"
                    )}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </label>
          )
        })}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex items-center justify-center gap-2 p-6 rounded-lg bg-muted/30 text-muted-foreground">
          <Info className="h-4 w-4" />
          <span className="text-sm">Nenhuma opcao disponivel</span>
        </div>
      )}
    </div>
  )
}

/* -----------------------------------------------------------------------------
   CheckboxCard - Single checkbox in card format
   For individual yes/no toggles with more visual weight
   ----------------------------------------------------------------------------- */

export interface CheckboxCardProps {
  /** Unique identifier */
  id: string
  /** Display label */
  label: string
  /** Description text */
  description?: string
  /** Checked state */
  checked: boolean
  /** Change handler */
  onChange: (checked: boolean) => void
  /** Disabled state */
  disabled?: boolean
  /** Icon to display */
  icon?: React.ReactNode
  /** Additional className */
  className?: string
}

export function CheckboxCard({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  icon,
  className,
}: CheckboxCardProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl cursor-pointer",
        "bg-card border-2",
        "transition-all duration-150",
        checked
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border/60 hover:border-border hover:shadow-sm",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className={cn(
          "flex-shrink-0 p-2.5 rounded-lg",
          checked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-foreground">{label}</span>
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            className="h-5 w-5"
          />
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </label>
  )
}

/* -----------------------------------------------------------------------------
   CheckboxList - Simpler list format for many options
   ----------------------------------------------------------------------------- */

export interface CheckboxListProps {
  /** Array of items */
  items: CheckboxItem[]
  /** Current values */
  values: Record<string, boolean>
  /** Change handler */
  onChange: (id: string, checked: boolean) => void
  /** Maximum height before scroll */
  maxHeight?: number | string
  /** Show search/filter */
  searchable?: boolean
  /** Additional className */
  className?: string
  /** Empty state message */
  emptyMessage?: string
}

export function CheckboxList({
  items,
  values,
  onChange,
  maxHeight = 300,
  className,
  emptyMessage = "Nenhum item encontrado",
}: CheckboxListProps) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredItems = React.useMemo(() => {
    if (!searchTerm) return items
    const term = searchTerm.toLowerCase()
    return items.filter(
      item =>
        item.label.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
    )
  }, [items, searchTerm])

  return (
    <div className={cn("space-y-2", className)}>
      {/* Search Input */}
      {items.length > 5 && (
        <input
          type="search"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            "w-full h-9 px-3 rounded-lg text-sm",
            "border border-border bg-input/50",
            "placeholder:text-muted-foreground/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          )}
        />
      )}

      {/* List Container */}
      <div
        className={cn(
          "rounded-lg border border-border/50 overflow-hidden",
          "divide-y divide-border/30"
        )}
        style={{ maxHeight, overflowY: "auto" }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <label
              key={item.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                "hover:bg-accent/30 transition-colors duration-100",
                (item.disabled) && "opacity-50 pointer-events-none"
              )}
            >
              <Checkbox
                id={item.id}
                checked={values[item.id] || false}
                onCheckedChange={(checked) => onChange(item.id, checked === true)}
                disabled={item.disabled}
                className="h-4 w-4"
              />
              <span className="text-sm flex-1 min-w-0 truncate">
                {item.label}
              </span>
            </label>
          ))
        ) : (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* Selection Count */}
      {items.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {Object.values(values).filter(Boolean).length} de {items.length} selecionados
        </p>
      )}
    </div>
  )
}
