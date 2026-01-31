/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* =============================================================================
   BUTTON COMPONENT - Premium Design System v5.0 "Platinum & Onyx"
   -----------------------------------------------------------------------------
   Refined button with sophisticated hover effects, loading states,
   and premium micro-interactions. Uses --glow-primary and shimmer effects.
   ============================================================================= */

const buttonVariants = cva(
  // Base styles - premium foundation
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg text-sm font-medium",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Premium disabled: opacity + grayscale for refined look
    "disabled:pointer-events-none disabled:opacity-50 disabled:grayscale",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // Active state: scale + inward shadow effect
    "active:scale-[0.98] active:shadow-inner",
  ],
  {
    variants: {
      variant: {
        // Primary - Main CTA with glow on hover
        default: [
          "bg-primary text-primary-foreground",
          "shadow-sm shadow-primary/20",
          "hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25",
          // Premium: add glow effect on hover using --glow-primary
          "hover:[box-shadow:var(--glow-primary),_0_4px_6px_-1px_oklch(from_var(--primary)_l_c_h_/_0.15)]",
          "active:bg-primary/95",
        ],

        // Destructive - Warning actions with glow
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-sm shadow-destructive/20",
          "hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/25",
          "hover:[box-shadow:0_0_20px_oklch(from_var(--destructive)_l_c_h_/_0.25),_0_4px_6px_-1px_oklch(from_var(--destructive)_l_c_h_/_0.15)]",
          "active:bg-destructive/95",
        ],

        // Outline - Secondary importance with elegant border
        outline: [
          "border border-border bg-transparent",
          "text-foreground",
          "shadow-sm",
          "hover:bg-accent hover:text-accent-foreground hover:border-accent",
          "active:bg-accent/80",
        ],

        // Secondary - Muted actions
        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-sm",
          "hover:bg-secondary/80 hover:shadow-md",
          "active:bg-secondary/90",
        ],

        // Ghost - Minimal visual weight
        ghost: [
          "text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "active:bg-accent/80",
        ],

        // Link - Text-only with underline
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
          "active:text-primary/80",
        ],

        // Premium - Champagne/Gold gradient with shimmer and glow
        premium: [
          "relative overflow-hidden",
          // Champagne/gold gradient background using accent-vivid
          "bg-gradient-to-r from-[oklch(70%_0.090_48)] to-[oklch(62%_0.085_45)]",
          "text-white",
          "shadow-md",
          // Hover: enhanced glow using --glow-accent
          "hover:shadow-lg hover:[box-shadow:var(--glow-accent),_0_10px_15px_-3px_oklch(from_var(--accent-vivid)_l_c_h_/_0.2)]",
          "hover:from-[oklch(72%_0.095_48)] hover:to-[oklch(64%_0.090_45)]",
          "active:from-[oklch(68%_0.085_48)] active:to-[oklch(60%_0.080_45)]",
          // Shimmer pseudo-element applied via shimmer-gradient class
          "[&::after]:absolute [&::after]:inset-0 [&::after]:shimmer-gradient",
          "[&::after]:opacity-0 [&::after]:transition-opacity [&::after]:duration-300",
          "hover:[&::after]:opacity-100 hover:[&::after]:animate-[shimmer_1.5s_ease-in-out_infinite]",
        ],

        // Success - Positive actions with glow
        success: [
          "bg-success text-success-foreground",
          "shadow-sm shadow-success/20",
          "hover:bg-success/90 hover:shadow-md hover:shadow-success/25",
          "hover:[box-shadow:0_0_20px_oklch(from_var(--success)_l_c_h_/_0.25),_0_4px_6px_-1px_oklch(from_var(--success)_l_c_h_/_0.15)]",
          "active:bg-success/95",
        ],

        // Subtle - Very low visual weight
        subtle: [
          "bg-muted/50 text-muted-foreground",
          "hover:bg-muted hover:text-foreground",
          "active:bg-muted/80",
        ],
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md gap-1.5",
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        default: "h-10 px-4 py-2",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-xs": "h-7 w-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/* -----------------------------------------------------------------------------
   Loading Spinner Component
   ----------------------------------------------------------------------------- */

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

/* -----------------------------------------------------------------------------
   Button Props Interface
   ----------------------------------------------------------------------------- */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child element (Radix Slot) */
  asChild?: boolean
  /** Loading state - shows spinner and disables button */
  loading?: boolean
  /** Loading text to display */
  loadingText?: string
  /** Left icon/element */
  leftIcon?: React.ReactNode
  /** Right icon/element */
  rightIcon?: React.ReactNode
}

/* -----------------------------------------------------------------------------
   Button Component
   ----------------------------------------------------------------------------- */

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          // Loading state styles
          loading && "relative cursor-wait",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <LoadingSpinner className="h-4 w-4 shrink-0" />
        )}

        {/* Left Icon */}
        {!loading && leftIcon && (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button Content */}
        {loading && loadingText ? (
          <span>{loadingText}</span>
        ) : (
          children
        )}

        {/* Right Icon */}
        {!loading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

/* -----------------------------------------------------------------------------
   Icon Button Component - Convenience wrapper for icon-only buttons
   ----------------------------------------------------------------------------- */

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  /** Accessible label for screen readers */
  "aria-label": string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = "icon", ...props }, ref) => (
    <Button ref={ref} size={size} {...props} />
  )
)
IconButton.displayName = "IconButton"

export { Button, IconButton, buttonVariants, LoadingSpinner }
