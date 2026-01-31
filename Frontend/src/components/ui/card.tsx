/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* =============================================================================
   CARD COMPONENT - Premium Design System v5.0 "Platinum & Onyx"
   -----------------------------------------------------------------------------
   Refined card with sophisticated shadows, glass effects using .glass-card,
   hover lift animations, and premium glow effects.
   ============================================================================= */

const cardVariants = cva(
  // Base styles - premium foundation
  [
    "rounded-xl border border-border bg-card text-card-foreground",
    "transition-all duration-200 ease-out",
  ],
  {
    variants: {
      variant: {
        // Default - Standard card with subtle shadow
        default: [
          "shadow-sm",
        ],

        // Elevated - More prominent shadow with hover lift
        elevated: [
          "shadow-md",
          "hover:shadow-lg hover:-translate-y-0.5",
        ],

        // Outline - Minimal with clear border
        outline: [
          "border-2",
          "shadow-none",
        ],

        // Ghost - No border, minimal styling
        ghost: [
          "border-transparent bg-transparent",
          "shadow-none",
        ],

        // Glass - Premium glassmorphism using .glass-card class from index.css
        glass: [
          // Apply the glass-card CSS class for proper glassmorphism
          "glass-card",
          // Override default bg-card since glass-card has its own background
          "!bg-transparent",
          // Premium hover: subtle lift and glow
          "hover:-translate-y-0.5",
          "hover:[box-shadow:var(--glow-primary),_0_4px_24px_oklch(from_var(--foreground)_l_c_h_/_0.08)]",
        ],

        // Interactive - Designed for clickable cards with lift and glow
        interactive: [
          "shadow-sm cursor-pointer",
          // Required: transition-transform for smooth hover
          "transition-transform",
          "hover:shadow-md hover:border-border/80",
          // Premium lift on hover
          "hover:-translate-y-0.5",
          // Premium glow on hover using --glow-primary
          "hover:[box-shadow:var(--glow-primary),_0_10px_15px_-3px_oklch(from_var(--foreground)_l_c_h_/_0.08)]",
          "active:translate-y-0 active:shadow-sm",
        ],

        // Highlighted - Primary border accent with animated gradient border
        highlighted: [
          "relative overflow-hidden",
          "border-primary/30 bg-card",
          "shadow-md shadow-primary/5",
          // Animated gradient border effect using pseudo-element
          "before:absolute before:inset-0 before:-z-10 before:rounded-xl before:p-[1px]",
          "before:bg-gradient-to-r before:from-primary/20 before:via-accent-vivid/30 before:to-primary/20",
          "before:animate-[shimmer_3s_linear_infinite] before:bg-[length:200%_100%]",
          // Hover glow
          "hover:[box-shadow:var(--glow-primary),_0_4px_6px_-1px_oklch(from_var(--primary)_l_c_h_/_0.1)]",
        ],

        // Muted - Subtle background
        muted: [
          "border-transparent bg-muted/50",
          "shadow-none",
        ],
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "none",
    },
  }
)

/* -----------------------------------------------------------------------------
   Card Root Component
   ----------------------------------------------------------------------------- */

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Make card a clickable link */
  asLink?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, asLink, ...props }, ref) => (
    <div
      ref={ref}
      role={asLink ? "link" : undefined}
      tabIndex={asLink ? 0 : undefined}
      className={cn(
        cardVariants({ variant, padding }),
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

/* -----------------------------------------------------------------------------
   Card Header - Top section with title area
   ----------------------------------------------------------------------------- */

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show bottom border */
  bordered?: boolean
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, bordered, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        bordered && "border-b border-border pb-4",
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

/* -----------------------------------------------------------------------------
   Card Title - Main heading
   ----------------------------------------------------------------------------- */

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** HTML heading level */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Comp = "h3", ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-tight tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

/* -----------------------------------------------------------------------------
   Card Description - Subtitle/description text
   ----------------------------------------------------------------------------- */

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground leading-relaxed",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/* -----------------------------------------------------------------------------
   Card Content - Main content area
   ----------------------------------------------------------------------------- */

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

/* -----------------------------------------------------------------------------
   Card Footer - Bottom action area
   ----------------------------------------------------------------------------- */

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show top border */
  bordered?: boolean
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, bordered, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-0",
        bordered && "border-t border-border pt-4 mt-2",
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

/* -----------------------------------------------------------------------------
   Card Image - Hero image area (optional)
   ----------------------------------------------------------------------------- */

export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image position */
  position?: "top" | "bottom"
  /** Aspect ratio */
  aspectRatio?: "auto" | "square" | "video" | "wide"
}

const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, position = "top", aspectRatio = "auto", alt = "", ...props }, ref) => {
    const aspectClasses = {
      auto: "",
      square: "aspect-square",
      video: "aspect-video",
      wide: "aspect-[21/9]",
    }

    return (
      <div
        className={cn(
          "overflow-hidden",
          position === "top" ? "rounded-t-xl" : "rounded-b-xl",
          aspectClasses[aspectRatio]
        )}
      >
        <img
          ref={ref}
          alt={alt}
          className={cn(
            "w-full h-full object-cover",
            "transition-transform duration-300",
            "group-hover:scale-105",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
CardImage.displayName = "CardImage"

/* -----------------------------------------------------------------------------
   Card Section - Divider section within card
   ----------------------------------------------------------------------------- */

const CardSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 border-t border-border first:border-t-0 first:pt-6",
      className
    )}
    {...props}
  />
))
CardSection.displayName = "CardSection"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardImage,
  CardSection,
  cardVariants,
}
