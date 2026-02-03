// src/components/agentes/ExecutionHistoryAgentes.tsx
// Componente para listar o histórico de execuções dos agentes especialistas

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  FileText,
  Filter,
  ChevronRight,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { Database } from '@/types/database.types';

// Types from database
type AgentesEspecialistasRun = Database['public']['Tables']['agentes_especialistas_runs']['Row'];
type AgentStatus = Database['public']['Enums']['agentes_especialistas_status'];

export interface ExecutionHistoryAgentesProps {
  limit?: number;
  onSelectExecution?: (execution: AgentesEspecialistasRun) => void;
}

// Status labels and colors
const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pendente',
    color: 'text-yellow-500 bg-yellow-500/10',
    icon: <Clock className="h-4 w-4" />,
  },
  processing: {
    label: 'Processando',
    color: 'text-blue-500 bg-blue-500/10',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },
  streaming: {
    label: 'Streaming',
    color: 'text-primary bg-primary/10',
    icon: <Zap className="h-4 w-4 animate-pulse" />,
  },
  completed: {
    label: 'Concluído',
    color: 'text-green-500 bg-green-500/10',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  stopped: {
    label: 'Parado',
    color: 'text-orange-500 bg-orange-500/10',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  error: {
    label: 'Erro',
    color: 'text-red-500 bg-red-500/10',
    icon: <XCircle className="h-4 w-4" />,
  },
};

// Agent type labels
const AGENT_LABELS: Record<string, string> = {
  rg: 'RG - Identidade',
  cnh: 'CNH - Habilitação',
  cpf: 'CPF',
  ctps: 'CTPS - Carteira de Trabalho',
  certidao_nascimento: 'Certidão de Nascimento',
  certidao_casamento: 'Certidão de Casamento',
  certidao_obito: 'Certidão de Óbito',
  'matricula-imovel': 'Matrícula de Imóvel',
  escritura: 'Escritura Pública',
  iptu: 'IPTU',
  contrato_social: 'Contrato Social',
  cnpj: 'CNPJ',
  procuracao: 'Procuração',
};

/**
 * Format duration in ms or seconds
 */
function formatDuration(ms: number | null): string {
  if (ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Format relative time (e.g., "5 min atrás")
 */
function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d atrás`;
  if (hours > 0) return `${hours}h atrás`;
  if (minutes > 0) return `${minutes} min atrás`;
  return 'agora';
}

/**
 * Format full date for tooltip
 */
function formatFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get agent display name
 */
function getAgentLabel(slug: string, nome: string): string {
  return AGENT_LABELS[slug] || nome || slug;
}

/**
 * Status Badge component
 */
function StatusBadge({ status }: { status: AgentStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
      config.color
    )}>
      {config.icon}
      {config.label}
    </span>
  );
}

/**
 * Execution list item component
 */
function ExecutionItem({
  execution,
  onClick,
  index,
  isMobile,
}: {
  execution: AgentesEspecialistasRun;
  onClick?: () => void;
  index: number;
  isMobile: boolean;
}) {
  const documentos = execution.documentos as Array<{ nome: string }> | null;
  const documentCount = documentos?.length || 0;
  const firstDocName = documentos?.[0]?.nome || 'Documento';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left rounded-xl border border-border/50 bg-card',
          'hover:border-primary/50 hover:bg-card/80 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
          'group touch-feedback',
          isMobile ? 'p-3' : 'p-4'
        )}
      >
        {/* Header row - Agent name + Status + Time */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={cn(
              "font-medium text-foreground truncate",
              isMobile ? "text-sm" : "text-base"
            )}>
              {getAgentLabel(execution.agent_slug, execution.agent_nome)}
            </span>
            <StatusBadge status={execution.status} />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className="text-xs text-muted-foreground"
              title={formatFullDate(execution.created_at)}
            >
              {formatRelativeTime(execution.created_at)}
            </span>
            <ChevronRight className={cn(
              "text-muted-foreground group-hover:text-primary transition-colors",
              isMobile ? "h-4 w-4" : "h-5 w-5"
            )} />
          </div>
        </div>

        {/* Document info */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {documentCount > 1
              ? `${documentCount} documentos`
              : firstDocName}
          </span>
        </div>

        {/* Metrics row - simplified on mobile */}
        <div className={cn(
          "flex items-center text-xs text-muted-foreground",
          isMobile ? "gap-3" : "gap-4"
        )}>
          {execution.duration_ms !== null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(execution.duration_ms)}
            </span>
          )}
          {!isMobile && (execution.input_tokens || execution.output_tokens) && (
            <span>
              {execution.input_tokens ?? 0}/{execution.output_tokens ?? 0} tokens
            </span>
          )}
          {execution.cost_estimate !== null && (
            <span className={cn(
              "px-1.5 py-0.5 rounded bg-muted/50",
              isMobile && "ml-auto"
            )}>
              ${Number(execution.cost_estimate).toFixed(4)}
            </span>
          )}
        </div>

        {/* Error message preview */}
        {execution.status === 'error' && execution.erro_mensagem && (
          <div className={cn(
            "mt-2 text-xs text-red-500 bg-red-500/10 rounded-lg px-2 py-1.5",
            isMobile ? "line-clamp-2" : "truncate"
          )}>
            {execution.erro_mensagem}
          </div>
        )}
      </button>
    </motion.div>
  );
}

/**
 * ExecutionHistoryAgentes component
 * Displays a list of agent specialist executions
 */
export function ExecutionHistoryAgentes({
  limit = 20,
  onSelectExecution,
}: ExecutionHistoryAgentesProps) {
  const [executions, setExecutions] = useState<AgentesEspecialistasRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  // Fetch executions
  useEffect(() => {
    async function fetchExecutions() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('agentes_especialistas_runs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        // Apply status filter
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter as 'pending' | 'processing' | 'streaming' | 'completed' | 'stopped' | 'error');
        }

        // Apply agent filter
        if (agentFilter !== 'all') {
          query = query.eq('agent_slug', agentFilter);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('Error fetching executions:', fetchError);
          setError('Erro ao carregar execuções');
          setExecutions([]);
        } else {
          setExecutions(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Erro ao carregar execuções');
        setExecutions([]);
      }

      setLoading(false);
    }

    fetchExecutions();
  }, [limit, statusFilter, agentFilter]);

  // Get unique agents for filter
  const uniqueAgents = useMemo(() => {
    const agents = new Map<string, string>();
    executions.forEach((exec) => {
      if (!agents.has(exec.agent_slug)) {
        agents.set(exec.agent_slug, exec.agent_nome);
      }
    });
    return Array.from(agents.entries());
  }, [executions]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <span className="text-muted-foreground">Carregando histórico...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-foreground font-medium mb-2">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          size="sm"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className={cn(
        "flex gap-3",
        isMobile ? "flex-col" : "flex-wrap items-center"
      )}>
        {!isMobile && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros:</span>
          </div>
        )}

        <div className={cn(
          "flex gap-2",
          isMobile && "w-full"
        )}>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={cn(
              "h-10",
              isMobile ? "flex-1" : "w-[150px]"
            )}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
              <SelectItem value="error">Com erro</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className={cn(
              "h-10",
              isMobile ? "flex-1" : "w-[180px]"
            )}>
              <SelectValue placeholder="Agente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os agentes</SelectItem>
              {uniqueAgents.map(([slug, nome]) => (
                <SelectItem key={slug} value={slug}>
                  {getAgentLabel(slug, nome)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className={cn(
        "text-muted-foreground",
        isMobile ? "text-xs" : "text-sm"
      )}>
        {executions.length} execuç{executions.length === 1 ? 'ão' : 'ões'} encontrada{executions.length === 1 ? '' : 's'}
      </div>

      {/* Empty state */}
      {executions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhuma execução encontrada.</p>
          {(statusFilter !== 'all' || agentFilter !== 'all') && (
            <Button
              variant="link"
              onClick={() => {
                setStatusFilter('all');
                setAgentFilter('all');
              }}
              className="mt-2"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        /* Execution list */
        <div className={cn("space-y-2", isMobile && "space-y-3")}>
          {executions.map((execution, index) => (
            <ExecutionItem
              key={execution.id}
              execution={execution}
              onClick={() => onSelectExecution?.(execution)}
              index={index}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExecutionHistoryAgentes;
