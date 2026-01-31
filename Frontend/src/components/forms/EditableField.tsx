import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SimpleTooltip } from "@/components/ui/tooltip"
import { Pencil, Check, X, AlertCircle } from "lucide-react"

/* =============================================================================
   EDITABLE FIELD COMPONENT - Premium Design System
   -----------------------------------------------------------------------------
   Elegant inline editable field with clear view/edit states, smooth transitions,
   and visual feedback for user modifications. Inspired by Linear's inline editing.

   Features:
   - Clear distinction between view and edit modes
   - Subtle hover indicator in view mode
   - Smooth transitions between modes
   - User edit tracking with visual indicator
   - Keyboard support (Enter to save, Escape to cancel)
   - Accessible with proper ARIA attributes
   ============================================================================= */

export type EditableFieldType = "text" | "date" | "email" | "tel" | "number"

export interface EditableFieldProps {
  /** Field label */
  label: string
  /** Current value */
  value: string
  /** Change handler */
  onChange: (value: string) => void
  /** Blur handler */
  onBlur?: () => void
  /** Whether field was edited by user (tracked externally) */
  wasEditedByUser?: boolean
  /** Handler when user makes first edit */
  onUserEdit?: () => void
  /** Input type */
  type?: EditableFieldType
  /** Placeholder text */
  placeholder?: string
  /** Additional className */
  className?: string
  /** Disabled state */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Always show in edit mode */
  alwaysEditing?: boolean
  /** Variant style */
  variant?: "default" | "inline" | "compact"
  /** Empty state display text */
  emptyText?: string
}

export function EditableField({
  label,
  value,
  onChange,
  onBlur,
  wasEditedByUser = false,
  onUserEdit,
  type = "text",
  placeholder,
  className,
  disabled = false,
  error,
  alwaysEditing = false,
  variant = "default",
  emptyText = "Clique para editar",
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = React.useState(alwaysEditing)
  const [localValue, setLocalValue] = React.useState(value)
  const [hasUserEdited, setHasUserEdited] = React.useState(wasEditedByUser)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const fieldId = React.useId()

  // Sync external value
  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Sync external edit state
  React.useEffect(() => {
    setHasUserEdited(wasEditedByUser)
  }, [wasEditedByUser])

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    if (disabled || alwaysEditing) return
    setIsEditing(true)
  }

  const handleSave = () => {
    if (alwaysEditing) return

    // Track user edit
    if (!hasUserEdited && localValue !== value) {
      setHasUserEdited(true)
      onUserEdit?.()
    }

    onChange(localValue)
    setIsEditing(false)
    onBlur?.()
  }

  const handleCancel = () => {
    if (alwaysEditing) return
    setLocalValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)

    // If always editing, sync immediately
    if (alwaysEditing) {
      if (!hasUserEdited && newValue !== value) {
        setHasUserEdited(true)
        onUserEdit?.()
      }
      onChange(newValue)
    }
  }

  const handleBlur = () => {
    if (alwaysEditing) {
      onBlur?.()
      return
    }
    // Small delay to allow clicking save/cancel buttons
    setTimeout(() => {
      if (isEditing) {
        handleSave()
      }
    }, 150)
  }

  // Variant-specific styles
  const variantStyles = {
    default: "space-y-2",
    inline: "flex items-center gap-3",
    compact: "space-y-1",
  }

  const labelStyles = {
    default: "text-sm font-medium text-muted-foreground",
    inline: "text-sm font-medium text-muted-foreground min-w-[100px] shrink-0",
    compact: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
  }

  const hasError = Boolean(error)

  return (
    <div className={cn(variantStyles[variant], className)}>
      {/* Label Row */}
      <div className="flex items-center gap-2">
        <Label
          htmlFor={fieldId}
          variant={variant === "compact" ? "overline" : undefined}
          className={labelStyles[variant]}
        >
          {label}
        </Label>

        {/* User Edit Indicator */}
        {hasUserEdited && (
          <SimpleTooltip content="Campo alterado pelo usuario">
            <span className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5",
              "text-xs font-medium rounded-md",
              "text-primary bg-primary/10",
              "transition-all duration-200"
            )}>
              <Pencil className="w-3 h-3" />
            </span>
          </SimpleTooltip>
        )}
      </div>

      {/* Value/Input Area */}
      <div className={cn("flex-1", variant === "inline" && "min-w-0")}>
        {isEditing || alwaysEditing ? (
          /* Edit Mode with smooth border transition */
          <div className={cn(
            "flex items-center gap-2",
            "animate-in fade-in-0 duration-200"
          )}>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                id={fieldId}
                type={type}
                value={localValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                error={hasError}
                variant="premium"
                inputSize={variant === "compact" ? "sm" : "default"}
                className={cn(
                  "w-full",
                  "transition-all duration-200 ease-out",
                  !alwaysEditing && "pr-20"
                )}
                aria-invalid={hasError}
              />

              {/* Inline Save/Cancel Buttons */}
              {!alwaysEditing && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={handleSave}
                    className="h-7 w-7 text-success hover:text-success hover:bg-success/10"
                    aria-label="Salvar"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Cancelar"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* View Mode with subtle fade transition */
          <button
            type="button"
            onClick={handleStartEdit}
            disabled={disabled}
            className={cn(
              "group/value w-full text-left",
              "px-3 py-2 rounded-lg",
              "border border-transparent",
              "transition-all duration-200 ease-out",
              "animate-in fade-in-0 duration-150",
              // Hover state
              !disabled && [
                "hover:bg-accent/50 hover:border-border/50",
                "hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              ],
              // Disabled state
              disabled && "cursor-not-allowed opacity-60 bg-muted/30",
              // Error state
              hasError && "border-destructive/30 bg-destructive/5",
              // User edited indicator
              hasUserEdited && !hasError && "border-primary/20 bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "text-sm truncate",
                  value ? "text-foreground" : "text-muted-foreground/60 italic"
                )}
              >
                {value || emptyText}
              </span>

              {/* Edit Icon - shown on hover */}
              {!disabled && (
                <Pencil
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    "text-muted-foreground/40",
                    "opacity-0 group-hover/value:opacity-100",
                    "transition-opacity duration-150"
                  )}
                />
              )}
            </div>
          </button>
        )}

        {/* Error Message */}
        {hasError && (
          <p className="flex items-center gap-1.5 mt-1.5 text-sm text-destructive">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------------
   EditableFieldRow - Horizontal layout variant for settings-style forms
   ----------------------------------------------------------------------------- */

export interface EditableFieldRowProps extends EditableFieldProps {
  /** Description text below label */
  description?: string
}

export function EditableFieldRow({
  label,
  description,
  className,
  ...props
}: EditableFieldRowProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-start gap-3 py-4",
      "border-b border-border/30 last:border-b-0",
      className
    )}>
      {/* Label and Description */}
      <div className="sm:w-1/3 sm:flex-shrink-0">
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Editable Field */}
      <div className="flex-1">
        <EditableField
          {...props}
          label={label}
          variant="compact"
          className="[&_label]:sr-only"
        />
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------------
   EditableFieldGroup - Group multiple editable fields with a shared label
   ----------------------------------------------------------------------------- */

export interface EditableFieldGroupProps {
  /** Group label */
  label: string
  /** Group description */
  description?: string
  /** Children editable fields */
  children: React.ReactNode
  /** Additional className */
  className?: string
}

export function EditableFieldGroup({
  label,
  description,
  children,
  className,
}: EditableFieldGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Group Header */}
      <div>
        <h4 className="text-sm font-semibold text-foreground">
          {label}
        </h4>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Fields Container */}
      <div className={cn(
        "rounded-xl border border-border/50 bg-card/30",
        "divide-y divide-border/30"
      )}>
        {React.Children.map(children, (child) => (
          <div className="p-4">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
