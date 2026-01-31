import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
}: TextareaWithCounterProps) {
  const charCount = value?.length || 0;
  const isNearLimit = charCount > maxLength * 0.8;
  const isOverLimit = charCount > maxLength;

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-semibold text-foreground/80 tracking-wide block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className="flex min-h-[100px] w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        />
        <div 
          className={cn(
            "absolute bottom-2 right-2 text-xs",
            isOverLimit ? "text-destructive font-semibold" : 
            isNearLimit ? "text-yellow-500" : 
            "text-muted-foreground"
          )}
        >
          {charCount.toLocaleString('pt-BR')}/{maxLength.toLocaleString('pt-BR')}
        </div>
      </div>
      {isOverLimit && (
        <p className="text-xs text-destructive">
          Limite de caracteres excedido
        </p>
      )}
    </div>
  );
}
