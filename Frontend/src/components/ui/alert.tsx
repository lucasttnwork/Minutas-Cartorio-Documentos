import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* =============================================================================
   ALERT COMPONENT - Premium Design System v5.0 "Platinum & Onyx"
   -----------------------------------------------------------------------------
   Displays important messages with different severity levels.
   Uses semantic colors for destructive, warning, success states.
   ============================================================================= */

const alertVariants = cva(
  [
    "relative w-full rounded-lg border p-4",
    "[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px]",
    "[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    "transition-colors duration-200",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-background text-foreground",
          "border-border",
        ],
        destructive: [
          "bg-destructive/10 text-destructive",
          "border-destructive/30",
          "[&>svg]:text-destructive",
        ],
        warning: [
          "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
          "border-yellow-500/30",
          "[&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        ],
        success: [
          "bg-success/10 text-success",
          "border-success/30",
          "[&>svg]:text-success",
        ],
        info: [
          "bg-primary/10 text-primary",
          "border-primary/30",
          "[&>svg]:text-primary",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/* -----------------------------------------------------------------------------
   Alert Component
   ----------------------------------------------------------------------------- */

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

/* -----------------------------------------------------------------------------
   Alert Title Component
   ----------------------------------------------------------------------------- */

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

/* -----------------------------------------------------------------------------
   Alert Description Component
   ----------------------------------------------------------------------------- */

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
