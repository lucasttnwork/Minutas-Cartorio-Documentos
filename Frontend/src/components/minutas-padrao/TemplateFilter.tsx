// src/components/minutas-padrao/TemplateFilter.tsx

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TipoNegocio } from '@/types/minutas-padrao';
import { TIPO_NEGOCIO_LABELS } from '@/types/minutas-padrao';

export interface TemplateFilterProps {
  value: TipoNegocio | undefined;
  onChange: (value: TipoNegocio | undefined) => void;
}

const FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'todos', label: 'Todos' },
  ...Object.entries(TIPO_NEGOCIO_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

export function TemplateFilter({ value, onChange }: TemplateFilterProps) {
  const handleChange = (newValue: string) => {
    if (newValue === 'todos') {
      onChange(undefined);
    } else {
      onChange(newValue as TipoNegocio);
    }
  };

  return (
    <Select value={value ?? 'todos'} onValueChange={handleChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Filtrar por tipo" />
      </SelectTrigger>
      <SelectContent>
        {FILTER_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
