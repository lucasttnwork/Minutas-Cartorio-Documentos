/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* =============================================================================
   LABEL COMPONENT - Premium Design System
   -----------------------------------------------------------------------------
   Refined label with clear typography, optional required indicator,
   and consistent styling. Built on Radix UI primitives.
   ============================================================================= */

const labelVariants = cva(
  // Base styles
  [
    "text-sm font-medium leading-none text-foreground",
    "transition-colors duration-150",
    // Peer disabled state
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        // Default - Standard form label
        default: "",

        // Muted - Less emphasis
        muted: "text-muted-foreground font-normal",

        // Caption - Small helper text style
        caption: "text-xs text-muted-foreground font-normal",

        // Overline - Uppercase small label
        overline: [
          "text-xs font-medium uppercase tracking-wider",
          "text-muted-foreground",
        ],

        // Inline - For inline form elements
        inline: "text-sm font-normal cursor-pointer",
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  /** Show required asterisk */
  required?: boolean
  /** Optional indicator text */
  optional?: boolean
  /** Helper/description text below label */
  description?: string
  /** Error state - changes color */
  error?: boolean
  /** Disabled state */
  disabled?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({
  className,
  variant,
  size,
  required,
  optional,
  description,
  error,
  disabled,
  children,
  ...props
}, ref) => (
  <div className={cn("flex flex-col", disabled && "opacity-60")}>
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        labelVariants({ variant, size }),
        error && "text-destructive",
        disabled && "cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}

      {/* Required Indicator */}
      {required && (
        <span
          className="ml-0.5 text-destructive"
          aria-hidden="true"
        >
          *
        </span>
      )}

      {/* Optional Indicator */}
      {optional && (
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
          (opcional)
        </span>
      )}
    </LabelPrimitive.Root>

    {/* Description Text */}
    {description && (
      <span className={cn(
        "mt-1 text-xs text-muted-foreground leading-relaxed",
        error && "text-destructive/80"
      )}>
        {description}
      </span>
    )}
  </div>
))
Label.displayName = LabelPrimitive.Root.displayName

/* -----------------------------------------------------------------------------
   FormLabel - Enhanced label with built-in spacing for forms
   ----------------------------------------------------------------------------- */

export interface FormLabelProps extends LabelProps {
  /** Add bottom margin for form spacing */
  withMargin?: boolean
}

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  FormLabelProps
>(({ withMargin = true, className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn(withMargin && "mb-2", className)}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

/* -----------------------------------------------------------------------------
   FieldLabel - Compact inline label for form fields
   ----------------------------------------------------------------------------- */

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("mb-1.5", className)}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

export { Label, FormLabel, FieldLabel, labelVariants }
