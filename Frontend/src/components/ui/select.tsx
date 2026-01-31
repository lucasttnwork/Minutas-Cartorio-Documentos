/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* =============================================================================
   SELECT COMPONENT - Premium Design System v5.0 "Platinum & Onyx"
   -----------------------------------------------------------------------------
   Refined select with premium dropdown animations (scale-in + fade),
   elegant trigger variants matching Input, and premium glow effects.
   ============================================================================= */

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

/* -----------------------------------------------------------------------------
   Select Trigger Variants - Matches Input component styling
   ----------------------------------------------------------------------------- */

const selectTriggerVariants = cva(
  // Base styles
  [
    "flex w-full items-center justify-between gap-2",
    "rounded-lg text-sm text-foreground font-normal",
    // Premium transition for all states
    "transition-all duration-200 ease-out",
    "ring-offset-background",
    "placeholder:text-muted-foreground/60",
    "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "[&>span]:line-clamp-1 [&>span]:text-left",
  ],
  {
    variants: {
      variant: {
        default: [
          "border border-border bg-input/50",
          "hover:border-border hover:bg-input/80",
          "hover:shadow-sm",
          "focus:border-primary focus:shadow-[0_0_0_3px_oklch(from_var(--primary)_l_c_h_/_0.1)]",
          "data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-ring/30",
        ],
        filled: [
          "border-2 border-transparent bg-secondary",
          "hover:bg-secondary/80",
          "focus:bg-background focus:border-primary",
          "data-[state=open]:bg-background data-[state=open]:border-primary",
        ],
        ghost: [
          "border border-transparent bg-transparent",
          "hover:bg-accent/50 hover:border-border/50",
        ],
        // Premium variant - matches Input premium with champagne glow
        premium: [
          "border-2 border-border/80 bg-input/30",
          "shadow-sm",
          "hover:border-primary/30 hover:bg-input/60 hover:shadow-md",
          "focus:border-primary focus:bg-background",
          // Enhanced champagne/gold glow on focus matching Input premium
          "focus:shadow-[0_0_20px_oklch(from_var(--primary)_l_c_h_/_0.15),_0_0_30px_oklch(from_var(--accent-vivid)_l_c_h_/_0.08)]",
          "data-[state=open]:border-primary",
          "data-[state=open]:shadow-[0_0_20px_oklch(from_var(--primary)_l_c_h_/_0.15),_0_0_30px_oklch(from_var(--accent-vivid)_l_c_h_/_0.08)]",
        ],
      },
      triggerSize: {
        sm: "h-8 px-2.5 py-1.5 text-xs rounded-md",
        default: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      triggerSize: "default",
    },
  }
)

/* -----------------------------------------------------------------------------
   Select Trigger
   ----------------------------------------------------------------------------- */

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {
  /** Error state */
  error?: boolean
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, variant, triggerSize, error, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      selectTriggerVariants({ variant, triggerSize }),
      error && [
        "border-destructive/70 focus:border-destructive",
        "focus:ring-destructive/30",
        "data-[state=open]:border-destructive",
      ],
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/* -----------------------------------------------------------------------------
   Select Scroll Buttons
   ----------------------------------------------------------------------------- */

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1.5",
      "text-muted-foreground hover:text-foreground",
      "transition-colors duration-150",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1.5",
      "text-muted-foreground hover:text-foreground",
      "transition-colors duration-150",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

/* -----------------------------------------------------------------------------
   Select Content (Dropdown) - Premium scale-in + fade animation
   ----------------------------------------------------------------------------- */

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden",
        "rounded-lg border border-border bg-popover text-popover-foreground",
        // Premium shadow with subtle glow
        "shadow-lg",
        // Premium animation: scale-in + fade with refined timing
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        // Enhanced scale animation for premium feel
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        // Origin-aware slide animation
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        // Animation duration for premium smoothness
        "duration-200",
        position === "popper" && [
          "data-[side=bottom]:translate-y-1",
          "data-[side=left]:-translate-x-1",
          "data-[side=right]:translate-x-1",
          "data-[side=top]:-translate-y-1",
        ],
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" && [
            "h-[var(--radix-select-trigger-height)]",
            "w-full min-w-[var(--radix-select-trigger-width)]",
          ]
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

/* -----------------------------------------------------------------------------
   Select Label (Group heading)
   ----------------------------------------------------------------------------- */

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "py-1.5 pl-2 pr-2 text-xs font-medium text-muted-foreground",
      "uppercase tracking-wider",
      className
    )}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

/* -----------------------------------------------------------------------------
   Select Item - Premium hover and focus states
   ----------------------------------------------------------------------------- */

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center",
      "rounded-md py-2 pl-2 pr-8 text-sm outline-none",
      // Premium transition
      "transition-all duration-150",
      // Focus/hover states with premium feel
      "focus:bg-accent focus:text-accent-foreground",
      "hover:bg-accent/50",
      // Disabled state
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Highlighted (keyboard navigation)
      "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-primary" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

/* -----------------------------------------------------------------------------
   Select Separator
   ----------------------------------------------------------------------------- */

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  selectTriggerVariants,
}
