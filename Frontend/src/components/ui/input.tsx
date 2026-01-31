/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* =============================================================================
   INPUT COMPONENT - Premium Design System v5.0 "Platinum & Onyx"
   -----------------------------------------------------------------------------
   Refined input with animated focus glow expansion, premium hover effects,
   and enhanced success/error states with background tints.
   ============================================================================= */

const inputVariants = cva(
  // Base styles - premium foundation
  [
    "flex w-full rounded-lg text-base text-foreground font-normal",
    "placeholder:text-muted-foreground/60 placeholder:font-normal",
    // Premium transition for all states including glow animation
    "transition-all duration-200 ease-out",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
    // Focus state - animated expanding glow ring
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-0",
    "focus-visible:border-primary",
    // Premium focus glow animation (expands from 0 to full)
    "focus-visible:shadow-[0_0_0_3px_oklch(from_var(--primary)_l_c_h_/_0.1),_0_0_15px_oklch(from_var(--primary)_l_c_h_/_0.08)]",
    // Typography optimization
    "md:text-sm",
  ],
  {
    variants: {
      variant: {
        default: [
          "border border-border bg-input/50",
          "hover:border-border hover:bg-input/80",
          "hover:shadow-sm",
        ],
        filled: [
          "border-2 border-transparent bg-secondary",
          "hover:bg-secondary/80",
          "focus-visible:bg-background focus-visible:border-primary",
        ],
        ghost: [
          "border border-transparent bg-transparent",
          "hover:bg-accent/50 hover:border-border/50",
        ],
        // Premium variant - champagne glow on focus
        premium: [
          "border-2 border-border/80 bg-input/30",
          "shadow-sm",
          "hover:border-primary/30 hover:bg-input/60 hover:shadow-md",
          "focus-visible:border-primary focus-visible:bg-background",
          // Enhanced champagne/gold glow on focus using --glow-primary
          "focus-visible:shadow-[0_0_20px_oklch(from_var(--primary)_l_c_h_/_0.15),_0_0_30px_oklch(from_var(--accent-vivid)_l_c_h_/_0.08)]",
        ],
      },
      inputSize: {
        sm: "h-8 px-2.5 py-1.5 text-xs rounded-md",
        default: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Left icon/element */
  leftElement?: React.ReactNode
  /** Right icon/element */
  rightElement?: React.ReactNode
  /** Error state */
  error?: boolean
  /** Success state */
  success?: boolean
  /** Show character count */
  showCount?: boolean
  /** Max characters for count display */
  maxCount?: number
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    variant,
    inputSize,
    leftElement,
    rightElement,
    error,
    success,
    showCount,
    maxCount,
    ...props
  }, ref) => {
    const [charCount, setCharCount] = React.useState(
      typeof props.value === 'string' ? props.value.length : 0
    )

    // Handle character count
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length)
      props.onChange?.(e)
    }

    // State-based border colors with background tints for premium feel
    const stateClasses = cn(
      error && [
        "border-destructive/70 focus-visible:border-destructive",
        "focus-visible:ring-destructive/30",
        // Error: subtle red background tint
        "bg-destructive/5 focus-visible:bg-destructive/5",
        "focus-visible:shadow-[0_0_0_3px_oklch(from_var(--destructive)_l_c_h_/_0.1),_0_0_15px_oklch(from_var(--destructive)_l_c_h_/_0.08)]",
      ],
      success && [
        "border-success/70 focus-visible:border-success",
        "focus-visible:ring-success/30",
        // Success: subtle green background tint
        "bg-success/5 focus-visible:bg-success/5",
        "focus-visible:shadow-[0_0_0_3px_oklch(from_var(--success)_l_c_h_/_0.1),_0_0_15px_oklch(from_var(--success)_l_c_h_/_0.08)]",
      ]
    )

    // Wrapper for elements
    if (leftElement || rightElement || showCount) {
      return (
        <div className="relative w-full">
          {/* Left Element */}
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none flex items-center">
              {leftElement}
            </div>
          )}

          {/* Input */}
          <input
            type={type}
            className={cn(
              inputVariants({ variant, inputSize }),
              stateClasses,
              leftElement && "pl-10",
              rightElement && "pr-10",
              className
            )}
            ref={ref}
            onChange={handleChange}
            {...props}
          />

          {/* Right Element */}
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 flex items-center">
              {rightElement}
            </div>
          )}

          {/* Character Count */}
          {showCount && (
            <div className={cn(
              "absolute right-3 bottom-0 translate-y-full pt-1 text-xs transition-colors duration-200",
              charCount > (maxCount ?? Infinity)
                ? "text-destructive"
                : charCount > (maxCount ?? Infinity) * 0.9
                  ? "text-warning"
                  : "text-muted-foreground/60"
            )}>
              {charCount}{maxCount && `/${maxCount}`}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          inputVariants({ variant, inputSize }),
          stateClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
