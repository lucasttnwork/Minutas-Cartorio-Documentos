/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* =============================================================================
   TEXTAREA COMPONENT - Premium Design System v5.0 "Platinum & Onyx"
   -----------------------------------------------------------------------------
   Refined textarea with animated focus glow matching Input component,
   premium hover effects, enhanced success/error states with background tints,
   and animated character count that changes color as limit approaches.
   ============================================================================= */

const textareaVariants = cva(
  // Base styles - premium foundation (matches Input)
  [
    "flex w-full rounded-lg text-base text-foreground font-normal",
    "placeholder:text-muted-foreground/60 placeholder:font-normal",
    // Premium transition for all states including glow animation
    "transition-all duration-200 ease-out",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
    // Focus state - animated expanding glow ring (matches Input)
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-0",
    "focus-visible:border-primary",
    // Premium focus glow animation (matches Input)
    "focus-visible:shadow-[0_0_0_3px_oklch(from_var(--primary)_l_c_h_/_0.1),_0_0_15px_oklch(from_var(--primary)_l_c_h_/_0.08)]",
    // Typography optimization
    "md:text-sm",
    // Resize control
    "resize-y",
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
        // Premium variant - champagne glow on focus (matches Input)
        premium: [
          "border-2 border-border/80 bg-input/30",
          "shadow-sm",
          "hover:border-primary/30 hover:bg-input/60 hover:shadow-md",
          "focus-visible:border-primary focus-visible:bg-background",
          // Enhanced champagne/gold glow on focus (matches Input premium)
          "focus-visible:shadow-[0_0_20px_oklch(from_var(--primary)_l_c_h_/_0.15),_0_0_30px_oklch(from_var(--accent-vivid)_l_c_h_/_0.08)]",
        ],
      },
      textareaSize: {
        sm: "min-h-[60px] px-2.5 py-1.5 text-xs rounded-md",
        default: "min-h-[100px] px-3 py-2",
        lg: "min-h-[150px] px-4 py-3 text-base",
        xl: "min-h-[200px] px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      textareaSize: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /** Error state */
  error?: boolean
  /** Success state */
  success?: boolean
  /** Show character count */
  showCount?: boolean
  /** Max characters for count display */
  maxCount?: number
  /** Disable resize */
  noResize?: boolean
  /** Auto-grow height based on content */
  autoGrow?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    textareaSize,
    error,
    success,
    showCount,
    maxCount,
    noResize,
    autoGrow,
    ...props
  }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const [charCount, setCharCount] = React.useState(
      typeof props.value === 'string' ? props.value.length : 0
    )

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

    // Handle character count and auto-grow
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)

      if (autoGrow && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }

      props.onChange?.(e)
    }

    // State-based border colors with background tints (matches Input)
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

    // Calculate character count color based on proximity to limit
    const getCountColorClass = () => {
      if (!maxCount) return "text-muted-foreground/60"
      const ratio = charCount / maxCount
      if (ratio > 1) return "text-destructive font-medium"
      if (ratio > 0.95) return "text-destructive"
      if (ratio > 0.85) return "text-warning"
      return "text-muted-foreground/60"
    }

    if (showCount) {
      return (
        <div className="relative w-full">
          <textarea
            className={cn(
              textareaVariants({ variant, textareaSize }),
              stateClasses,
              noResize && "resize-none",
              autoGrow && "resize-none overflow-hidden",
              className
            )}
            ref={textareaRef}
            onChange={handleInput}
            {...props}
          />

          {/* Character Count - Animated color transition */}
          <div className={cn(
            "absolute right-3 bottom-0 translate-y-full pt-1 text-xs",
            // Premium: smooth color transition
            "transition-colors duration-200",
            getCountColorClass()
          )}>
            {charCount}{maxCount && `/${maxCount}`}
          </div>
        </div>
      )
    }

    return (
      <textarea
        className={cn(
          textareaVariants({ variant, textareaSize }),
          stateClasses,
          noResize && "resize-none",
          autoGrow && "resize-none overflow-hidden",
          className
        )}
        ref={textareaRef}
        onChange={handleInput}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
