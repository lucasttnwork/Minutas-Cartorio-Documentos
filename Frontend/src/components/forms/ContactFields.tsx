import { FormField } from "./FormField";
import { FieldGrid } from "@/components/layout";

interface ContactData {
  email?: string;
  telefone?: string;
}

interface ContactFieldsProps {
  values: ContactData;
  onChange: (field: keyof ContactData, value: string) => void;
  disabled?: boolean;
}

export function ContactFields({ values, onChange, disabled }: ContactFieldsProps) {
  return (
    <FieldGrid cols={2}>
      <FormField
        label="E-mail"
        type="email"
        value={values.email}
        onChange={(v) => onChange("email", v)}
        placeholder="exemplo@email.com"
        disabled={disabled}
      />
      <FormField
        label="Telefone"
        type="tel"
        value={values.telefone}
        onChange={(v) => onChange("telefone", v)}
        placeholder="+55 (11) 99999-9999"
        disabled={disabled}
      />
    </FieldGrid>
  );
}
