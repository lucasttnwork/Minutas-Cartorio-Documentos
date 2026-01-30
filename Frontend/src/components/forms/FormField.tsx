import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "date" | "email" | "tel" | "number" | "select" | "textarea";
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function FormField({
  label,
  value = "",
  onChange,
  type = "text",
  options = [],
  placeholder,
  disabled = false,
  required = false,
  className,
  fullWidth = false,
}: FormFieldProps) {
  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  return (
    <div className={cn("space-y-2", fullWidth && "col-span-full", className)}>
      <Label className="text-sm font-semibold text-foreground/80 tracking-wide block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {type === "select" ? (
        <Select value={value} onValueChange={handleChange} disabled={disabled}>
          <SelectTrigger className="bg-secondary border-border text-foreground">
            <SelectValue placeholder={placeholder || `Selecione ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="flex min-h-[100px] w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      )}
    </div>
  );
}
