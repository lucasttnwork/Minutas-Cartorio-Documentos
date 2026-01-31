// src/components/forms/EditableField.tsx
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  wasEditedByUser?: boolean;
  onUserEdit?: () => void;
  type?: "text" | "date" | "email" | "tel";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function EditableField({
  label,
  value,
  onChange,
  onBlur,
  wasEditedByUser = false,
  onUserEdit,
  type = "text",
  placeholder,
  className,
  disabled = false,
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [hasUserEdited, setHasUserEdited] = useState(wasEditedByUser);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setHasUserEdited(wasEditedByUser);
  }, [wasEditedByUser]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);

    if (!hasUserEdited && newValue !== value) {
      setHasUserEdited(true);
      onUserEdit?.();
    }
  };

  const handleBlur = () => {
    onBlur?.();
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </Label>
        {hasUserEdited && (
          <SimpleTooltip content="Campo alterado pelo usuário">
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-blue-500 bg-blue-500/10 rounded">
              <Pencil className="w-3 h-3" />
            </span>
          </SimpleTooltip>
        )}
      </div>
      <Input
        type={type}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "transition-colors",
          hasUserEdited && "border-blue-500/50 bg-blue-500/5"
        )}
      />
    </div>
  );
}
