import { FormField } from "./FormField";
import { FieldGrid } from "@/components/layout";

interface AddressData {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface AddressFieldsProps {
  values: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
  disabled?: boolean;
}

const ESTADOS_BR = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export function AddressFields({ values, onChange, disabled }: AddressFieldsProps) {
  return (
    <FieldGrid cols={3}>
      <FormField
        label="Logradouro"
        value={values.logradouro}
        onChange={(v) => onChange("logradouro", v)}
        disabled={disabled}
        fullWidth
        className="sm:col-span-2 lg:col-span-2"
      />
      <FormField
        label="Número"
        value={values.numero}
        onChange={(v) => onChange("numero", v)}
        disabled={disabled}
      />
      <FormField
        label="Complemento"
        value={values.complemento}
        onChange={(v) => onChange("complemento", v)}
        disabled={disabled}
      />
      <FormField
        label="Bairro"
        value={values.bairro}
        onChange={(v) => onChange("bairro", v)}
        disabled={disabled}
      />
      <FormField
        label="Cidade"
        value={values.cidade}
        onChange={(v) => onChange("cidade", v)}
        disabled={disabled}
      />
      <FormField
        label="Estado"
        type="select"
        value={values.estado}
        onChange={(v) => onChange("estado", v)}
        options={ESTADOS_BR}
        disabled={disabled}
      />
      <FormField
        label="CEP"
        value={values.cep}
        onChange={(v) => onChange("cep", v)}
        placeholder="00000-000"
        disabled={disabled}
      />
    </FieldGrid>
  );
}

export { ESTADOS_BR };
