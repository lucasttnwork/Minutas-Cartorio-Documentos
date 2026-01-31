import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MaskedInput,
  CPFInput,
  CNPJInput,
  PhoneInput,
  CEPInput,
  RGInput,
  CurrencyInput,
  DateInput,
} from "@/components/ui/masked-input";
import type { MaskType } from "@/components/ui/masked-input";
import { cn } from "@/lib/utils";

type FieldType = "text" | "date" | "email" | "tel" | "number" | "select" | "textarea" | "cpf" | "cnpj" | "phone" | "cep" | "rg" | "currency" | "masked-date";

interface MaskedComponentProps {
  value?: string;
  onChange?: (formatted: string, raw: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

interface FormFieldProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: FieldType;
  mask?: MaskType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
}

// Mapeamento de tipo para componente de máscara
const maskedComponents: Record<string, React.ForwardRefExoticComponent<MaskedComponentProps & React.RefAttributes<HTMLInputElement>>> = {
  cpf: CPFInput,
  cnpj: CNPJInput,
  phone: PhoneInput,
  cep: CEPInput,
  rg: RGInput,
  currency: CurrencyInput,
  "masked-date": DateInput,
};

export function FormField({
  label,
  value = "",
  onChange,
  type = "text",
  mask,
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

  const handleMaskedChange = (_formatted: string, raw: string) => {
    onChange?.(raw);
  };

  // Verifica se é um tipo de máscara
  const isMaskedType = type in maskedComponents;
  const MaskedComponent = isMaskedType ? maskedComponents[type] : null;

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
      ) : MaskedComponent ? (
        <MaskedComponent
          value={value}
          onChange={handleMaskedChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      ) : mask ? (
        <MaskedInput
          mask={mask}
          value={value}
          onChange={handleMaskedChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
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
