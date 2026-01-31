import * as React from "react"
import { Input, type InputProps } from "@/components/ui/input"
import { Textarea, type TextareaProps } from "@/components/ui/textarea"
import { Label, FormLabel } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MaskedInput,
  CPFInput,
  CNPJInput,
  PhoneInput,
  CEPInput,
  RGInput,
  CurrencyInput,
  DateInput,
} from "@/components/ui/masked-input"
import type { MaskType } from "@/components/ui/masked-input"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"

/* =============================================================================
   FORM FIELD COMPONENT - Premium Design System
   -----------------------------------------------------------------------------
   Universal form field component with premium styling, validation states,
   and consistent visual hierarchy. Integrates seamlessly with the refined
   UI components (Input, Select, Textarea, etc).

   Features:
   - Automatic label with required indicator
   - Error/success state visualization
   - Helper text and error messages
   - All input types including masked inputs
   - Consistent spacing and typography
   ============================================================================= */

type FieldType =
  | "text"
  | "date"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "textarea"
  | "cpf"
  | "cnpj"
  | "phone"
  | "cep"
  | "rg"
  | "currency"
  | "masked-date"

interface MaskedComponentProps {
  value?: string
  onChange?: (formatted: string, raw: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export interface FormFieldProps {
  /** Field label */
  label: string
  /** Current value */
  value?: string
  /** Change handler */
  onChange?: (value: string) => void
  /** Input type */
  type?: FieldType
  /** Custom mask pattern */
  mask?: MaskType
  /** Options for select type */
  options?: { value: string; label: string }[]
  /** Placeholder text */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Required field indicator */
  required?: boolean
  /** Additional className */
  className?: string
  /** Span full width in grid */
  fullWidth?: boolean
  /** Error message */
  error?: string
  /** Success state */
  success?: boolean
  /** Helper text displayed below input */
  helperText?: string
  /** Input variant */
  variant?: InputProps["variant"]
  /** Input size */
  inputSize?: InputProps["inputSize"]
  /** Hide label visually (still accessible) */
  hideLabel?: boolean
  /** Optional field indicator */
  optional?: boolean
  /** ID for accessibility */
  id?: string
}

// Mapping of type to masked component
const maskedComponents: Record<
  string,
  React.ForwardRefExoticComponent<
    MaskedComponentProps & React.RefAttributes<HTMLInputElement>
  >
> = {
  cpf: CPFInput,
  cnpj: CNPJInput,
  phone: PhoneInput,
  cep: CEPInput,
  rg: RGInput,
  currency: CurrencyInput,
  "masked-date": DateInput,
}

export function FormField({
  label,
  value = "",
  onChange,
  type = "text",
  mask,
  options = [],
  placeholder,
  disabled = false,
  required = false,
  className,
  fullWidth = false,
  error,
  success,
  helperText,
  variant = "default",
  inputSize = "default",
  hideLabel = false,
  optional = false,
  id,
}: FormFieldProps) {
  // Generate stable ID - always call hook unconditionally
  const generatedId = React.useId()
  const fieldId = id || generatedId
  const errorId = `${fieldId}-error`
  const helperId = `${fieldId}-helper`

  const handleChange = (newValue: string) => {
    onChange?.(newValue)
  }

  const handleMaskedChange = (_formatted: string, raw: string) => {
    onChange?.(raw)
  }

  // Check if it's a masked type
  const isMaskedType = type in maskedComponents
  const MaskedComponent = isMaskedType ? maskedComponents[type] : null

  // Determine if field has error or success state
  const hasError = Boolean(error)
  const hasSuccess = success && !hasError

  // Common input classes for state styling
  const inputStateClasses = cn(
    hasError && "border-destructive/70 focus-visible:border-destructive focus-visible:ring-destructive/30",
    hasSuccess && "border-success/70 focus-visible:border-success focus-visible:ring-success/30"
  )

  // Render the appropriate input component
  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      disabled,
      required,
      "aria-invalid": hasError,
      "aria-describedby": cn(
        hasError && errorId,
        helperText && helperId
      ) || undefined,
    }

    if (type === "select") {
      return (
        <Select value={value} onValueChange={handleChange} disabled={disabled}>
          <SelectTrigger
            {...commonProps}
            error={hasError}
            variant={variant === "premium" ? "premium" : variant === "filled" ? "filled" : "default"}
            className={cn(inputStateClasses)}
          >
            <SelectValue placeholder={placeholder || `Selecione ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (type === "textarea") {
      return (
        <Textarea
          {...commonProps}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          variant={variant as TextareaProps["variant"]}
          error={hasError}
          success={hasSuccess}
          className={cn(inputStateClasses)}
        />
      )
    }

    if (MaskedComponent) {
      return (
        <MaskedComponent
          {...commonProps}
          value={value}
          onChange={handleMaskedChange}
          placeholder={placeholder}
          className={cn(
            inputStateClasses,
            "w-full"
          )}
        />
      )
    }

    if (mask) {
      return (
        <MaskedInput
          {...commonProps}
          mask={mask}
          value={value}
          onChange={handleMaskedChange}
          placeholder={placeholder}
          className={cn(
            inputStateClasses,
            "w-full"
          )}
        />
      )
    }

    return (
      <Input
        {...commonProps}
        type={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        variant={variant}
        inputSize={inputSize}
        error={hasError}
        success={hasSuccess}
        className={cn(inputStateClasses)}
      />
    )
  }

  return (
    <div
      className={cn(
        "group/field flex flex-col gap-2",
        fullWidth && "col-span-full",
        className
      )}
    >
      {/* Label with focus color shift micro-animation */}
      <FormLabel
        htmlFor={fieldId}
        required={required}
        optional={optional}
        error={hasError}
        disabled={disabled}
        withMargin={false}
        className={cn(
          hideLabel && "sr-only",
          "text-sm font-medium text-foreground/90",
          "transition-colors duration-200 ease-out",
          "group-focus-within/field:text-primary"
        )}
      >
        {label}
      </FormLabel>

      {/* Input Container with optional state icons */}
      <div className="relative">
        {renderInput()}

        {/* State Icon (for non-select types) with smooth transition */}
        {type !== "select" && (hasError || hasSuccess) && (
          <div className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
            "transition-all duration-200 ease-out",
            "animate-in fade-in-0 zoom-in-75"
          )}>
            {hasError && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            {hasSuccess && (
              <CheckCircle2 className="h-4 w-4 text-success" />
            )}
          </div>
        )}
      </div>

      {/* Error Message with refined visual treatment */}
      {hasError && (
        <p
          id={errorId}
          role="alert"
          className={cn(
            "flex items-center gap-1.5 text-sm text-destructive",
            "py-1 px-2 -mx-2 rounded-md",
            "bg-destructive/5",
            "animate-in fade-in-0 slide-in-from-top-1 duration-200"
          )}
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Helper Text (only show if no error) with fade-in animation */}
      {helperText && !hasError && (
        <p
          id={helperId}
          className={cn(
            "text-xs text-muted-foreground leading-relaxed",
            "animate-in fade-in-0 duration-300"
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  )
}

/* -----------------------------------------------------------------------------
   FormFieldGroup - Groups related fields with optional label
   ----------------------------------------------------------------------------- */

export interface FormFieldGroupProps {
  /** Group label (optional) */
  label?: string
  /** Group description */
  description?: string
  /** Children fields */
  children: React.ReactNode
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4
  /** Additional className */
  className?: string
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}

export function FormFieldGroup({
  label,
  description,
  children,
  columns = 2,
  className,
}: FormFieldGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Group Header */}
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <Label variant="overline" className="text-xs">
              {label}
            </Label>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Fields Grid */}
      <div className={cn("grid gap-4", columnClasses[columns])}>
        {children}
      </div>
    </div>
  )
}

export { type FieldType }
