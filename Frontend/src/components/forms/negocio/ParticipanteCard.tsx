// src/components/forms/negocio/ParticipanteCard.tsx
import { EntityCard } from '@/components/layout/EntityCard';
import { EditableField } from '../EditableField';
import { Button } from '@/components/ui/button';
import { User, Eye } from 'lucide-react';
import type { ParticipanteNegocio } from '@/types/minuta';

interface ParticipanteCardProps {
  participante: ParticipanteNegocio;
  tipo: 'alienante' | 'adquirente';
  index: number;
  pessoaNome?: string;
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
  onViewDetails?: () => void;
}

export function ParticipanteCard({
  participante,
  tipo,
  index,
  pessoaNome,
  onUpdate,
  onRemove,
  onViewDetails,
}: ParticipanteCardProps) {
  const accentColor = tipo === 'alienante' ? 'red' : 'green';
  const label = tipo === 'alienante' ? 'Alienante' : 'Adquirente';

  return (
    <EntityCard
      title={pessoaNome || `${label} ${index + 1}`}
      subtitle={participante.fracaoIdeal ? `Fracao: ${participante.fracaoIdeal}` : 'Fracao nao informada'}
      icon={<User className="w-4 h-4" />}
      isComplete={!!(participante.pessoaId && participante.fracaoIdeal)}
      onRemove={onRemove}
      defaultOpen={true}
      accentColor={accentColor}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EditableField
          label="Fracao Ideal"
          value={participante.fracaoIdeal}
          onChange={(v) => onUpdate('fracaoIdeal', v)}
          placeholder="Ex: 50%"
        />
        <EditableField
          label="Valor Participacao"
          value={participante.valorParticipacao}
          onChange={(v) => onUpdate('valorParticipacao', v)}
          placeholder="Ex: R$ 250.000,00"
        />
        <EditableField
          label="Conjuge"
          value={participante.conjuge || ''}
          onChange={(v) => onUpdate('conjuge', v)}
          placeholder="Nome do conjuge"
        />
        <EditableField
          label="Qualidade"
          value={participante.qualidade}
          onChange={(v) => onUpdate('qualidade', v)}
          placeholder="Ex: Proprietario"
        />
      </div>

      {onViewDetails && (
        <div className="mt-4 flex justify-end">
          <Button size="sm" variant="outline" onClick={onViewDetails}>
            <Eye className="w-4 h-4 mr-1" /> Ver Dados
          </Button>
        </div>
      )}
    </EntityCard>
  );
}
