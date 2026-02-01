import { Button } from "@/components/ui/button";
import { SectionCard, FieldGrid } from "@/components/layout";
import { FormField } from "./FormField";
import { RefreshCw } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface CertidaoField {
  key: string;
  label: string;
  value?: string;
  type?: "text" | "date" | "select";
  options?: SelectOption[];
}

interface CertidaoSectionProps {
  title: string;
  fields: CertidaoField[];
  onUpdate?: () => void;
  onChange?: (key: string, value: string) => void;
  updateLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CertidaoSection({
  title,
  fields,
  onUpdate,
  onChange,
  updateLabel = "ATUALIZAR",
  isLoading = false,
  disabled = false,
}: CertidaoSectionProps) {
  return (
    <SectionCard
      title={title}
      action={
        onUpdate && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onUpdate}
            disabled={isLoading || disabled}
            className="uppercase tracking-wide text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            {updateLabel}
          </Button>
        )
      }
    >
      <FieldGrid cols={fields.length <= 3 ? fields.length as 1 | 2 | 3 : 3}>
        {fields.map((field) => (
          <FormField
            key={field.key}
            label={field.label}
            value={field.value}
            type={field.type}
            options={field.options}
            onChange={(v) => onChange?.(field.key, v)}
            disabled={disabled}
          />
        ))}
      </FieldGrid>
    </SectionCard>
  );
}
