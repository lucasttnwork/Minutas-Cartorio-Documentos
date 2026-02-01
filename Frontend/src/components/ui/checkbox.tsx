/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* =============================================================================
   CHECKBOX COMPONENT - Premium Design System v5.0 "Platinum & Onyx"
   -----------------------------------------------------------------------------
   Refined checkbox with hover animations before check, enhanced check
   animation, and premium glow effects using CSS variables.

   Features:
   - Hover state with border shift and subtle grow
   - Smooth check animation with scale
   - Premium glow using --glow-primary on checked state
   - Indeterminate state support
   ============================================================================= */

const checkboxVariants = cva(
  // Base styles
  [
    "peer shrink-0 rounded-[4px] border-2",
    // Premium transition for all states including scale
    "transition-all duration-150 ease-out",
    // Focus ring
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Disabled state
    "disabled:cursor-not-allowed disabled:opacity-50",
    // Checked state with glow
    "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
    // Premium: glow on checked using --glow-primary
    "data-[state=checked]:[box-shadow:var(--glow-primary)]",
    // Indeterminate state
    "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground",
    "data-[state=indeterminate]:[box-shadow:var(--glow-primary)]",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-border bg-input/30",
          // Premium hover: border color shift + subtle scale grow
          "hover:border-primary/60 hover:bg-input/50 hover:scale-105",
          "data-[state=checked]:shadow-sm data-[state=checked]:shadow-primary/20",
        ],
        filled: [
          "border-transparent bg-secondary",
          "hover:bg-secondary/80 hover:scale-105",
          "data-[state=checked]:bg-primary",
        ],
        outline: [
          "border-primary/50 bg-transparent",
          "hover:bg-primary/5 hover:border-primary/70 hover:scale-105",
        ],
      },
      size: {
        sm: "h-4 w-4 rounded-[3px]",
        default: "h-5 w-5",
        lg: "h-6 w-6 rounded-[5px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  /** Error state */
  error?: boolean
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, size, error, ...props }, ref) => {
  // Icon size based on checkbox size
  const iconSize = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }[size || "default"]

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        checkboxVariants({ variant, size }),
        error && [
          "border-destructive/70",
          "data-[state=checked]:border-destructive data-[state=checked]:bg-destructive",
          "data-[state=checked]:[box-shadow:0_0_20px_oklch(from_var(--destructive)_l_c_h_/_0.25)]",
          "focus-visible:ring-destructive/50",
        ],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          "flex items-center justify-center text-current",
          // Premium check animation: scale in with bounce
          "animate-in zoom-in-50 duration-150",
          // Additional scale pop effect
          "data-[state=checked]:scale-100"
        )}
      >
        {props.checked === "indeterminate" ? (
          <Minus className={iconSize} strokeWidth={3} />
        ) : (
          <Check className={iconSize} strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

/* -----------------------------------------------------------------------------
   CheckboxWithLabel - Checkbox with integrated label
   ----------------------------------------------------------------------------- */

export interface CheckboxWithLabelProps extends CheckboxProps {
  /** Label text */
  label: string
  /** Description text */
  description?: string
  /** Label position */
  labelPosition?: "left" | "right"
}

const CheckboxWithLabel = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxWithLabelProps
>(({
  label,
  description,
  labelPosition = "right",
  className,
  id,
  ...props
}, ref) => {
  const generatedId = React.useId()
  const checkboxId = id || generatedId

  const checkboxElement = (
    <Checkbox ref={ref} id={checkboxId} {...props} />
  )

  const labelElement = (
    <div className="flex-1 min-w-0">
      <label
        htmlFor={checkboxId}
        className={cn(
          "text-sm font-medium leading-none cursor-pointer select-none",
          "transition-colors duration-150",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
          // Hover state on label
          "hover:text-foreground"
        )}
      >
        {label}
      </label>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        labelPosition === "left" && "flex-row-reverse",
        className
      )}
    >
      {checkboxElement}
      {labelElement}
    </div>
  )
})
CheckboxWithLabel.displayName = "CheckboxWithLabel"

export { Checkbox, CheckboxWithLabel, checkboxVariants }
