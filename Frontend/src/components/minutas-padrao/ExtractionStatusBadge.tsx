/**
 * ExtractionStatusBadge - Badge visual para status de extração de texto
 *
 * Mostra o status atual da extração de texto de um template:
 * - pendente: Aguardando extração (amarelo)
 * - extraindo: Em processamento (azul com animação)
 * - extraido: Texto extraído com sucesso (verde)
 * - erro: Falha na extração (vermelho)
 * - revisado: Texto revisado pelo usuário (roxo)
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Loader2,
  Check,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { StatusExtracao } from '@/types/minutas-padrao';

interface ExtractionStatusBadgeProps {
  status: StatusExtracao;
  errorMessage?: string | null;
  className?: string;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<
  StatusExtracao,
  {
    label: string;
    tooltip: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pendente: {
    label: 'Pendente',
    tooltip: 'Aguardando extração de texto',
    variant: 'outline',
    className: 'border-yellow-500 text-yellow-600 bg-yellow-50',
    icon: Clock,
  },
  extraindo: {
    label: 'Extraindo',
    tooltip: 'Extraindo texto do documento...',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600 bg-blue-50',
    icon: Loader2,
  },
  extraido: {
    label: 'Extraído',
    tooltip: 'Texto extraído com sucesso',
    variant: 'outline',
    className: 'border-green-500 text-green-600 bg-green-50',
    icon: Check,
  },
  erro: {
    label: 'Erro',
    tooltip: 'Falha na extração de texto',
    variant: 'destructive',
    className: '',
    icon: AlertCircle,
  },
  revisado: {
    label: 'Revisado',
    tooltip: 'Texto revisado e aprovado',
    variant: 'outline',
    className: 'border-purple-500 text-purple-600 bg-purple-50',
    icon: CheckCircle2,
  },
};

export function ExtractionStatusBadge({
  status,
  errorMessage,
  className = '',
  showLabel = true,
}: ExtractionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const isAnimated = status === 'extraindo';

  const tooltipText = status === 'erro' && errorMessage
    ? `${config.tooltip}: ${errorMessage}`
    : config.tooltip;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={config.variant}
            className={`${config.className} ${className} inline-flex items-center gap-1`}
          >
            <Icon
              className={`h-3 w-3 ${isAnimated ? 'animate-spin' : ''}`}
            />
            {showLabel && <span>{config.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ExtractionStatusBadge;
