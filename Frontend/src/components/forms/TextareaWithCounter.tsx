import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* =============================================================================
   TEXTAREA WITH COUNTER - Premium Form Component
   -----------------------------------------------------------------------------
   Wrapper around the Textarea component with character count display.
   Uses the premium Textarea component with built-in count feature.
   Features animated counter color transitions as user approaches limit.
   ============================================================================= */

interface TextareaWithCounterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  /** Warning threshold percentage (default 80%) */
  warningThreshold?: number;
}

export function TextareaWithCounter({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 2000,
  rows = 4,
  className,
  disabled = false,
  required = false,
  warningThreshold = 0.8,
}: TextareaWithCounterProps) {
  const charCount = value?.length || 0;
  const isOverLimit = charCount > maxLength;
  const isNearLimit = charCount >= maxLength * warningThreshold && !isOverLimit;
  const percentage = Math.min((charCount / maxLength) * 100, 100);

  // Determine counter color state with smooth transition
  const getCounterColorClass = () => {
    if (isOverLimit) return "text-destructive";
    if (isNearLimit) return "text-warning";
    return "text-muted-foreground/60";
  };

  return (
    <div className={cn("group/textarea space-y-2", className)}>
      <Label
        required={required}
        disabled={disabled}
        className={cn(
          "text-sm font-semibold text-foreground/80 tracking-wide",
          "transition-colors duration-200",
          "group-focus-within/textarea:text-primary"
        )}
      >
        {label}
      </Label>

      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          variant="premium"
          error={isOverLimit}
          className={cn(
            "pb-8",
            disabled && "bg-muted/30"
          )}
        />

        {/* Custom counter with color transitions */}
        <div className={cn(
          "absolute right-3 bottom-2 text-xs font-medium",
          "transition-colors duration-300 ease-out",
          getCounterColorClass()
        )}>
          <span className={cn(
            "transition-all duration-200",
            isNearLimit && "font-semibold",
            isOverLimit && "font-bold"
          )}>
            {charCount}
          </span>
          <span className="text-muted-foreground/40">/{maxLength}</span>
        </div>

        {/* Progress bar indicator */}
        <div className={cn(
          "absolute bottom-0 left-0 h-0.5 rounded-b-lg",
          "transition-all duration-300 ease-out",
          isOverLimit
            ? "bg-destructive"
            : isNearLimit
              ? "bg-warning"
              : "bg-primary/30"
        )}
        style={{ width: `${percentage}%` }}
        />
      </div>

      {isOverLimit && (
        <p className={cn(
          "text-xs text-destructive",
          "animate-in fade-in-0 slide-in-from-top-1 duration-200"
        )}>
          Limite de caracteres excedido
        </p>
      )}
    </div>
  );
}
