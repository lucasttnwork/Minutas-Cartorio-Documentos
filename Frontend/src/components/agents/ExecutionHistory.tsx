// src/components/agents/ExecutionHistory.tsx
// Component to display agent execution history for a minuta or document

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Types - matching agent_executions table structure
export interface AgentExecution {
  id: string;
  agent_type: string; // 'classify' | 'extract' | 'map' | 'generate'
  status: 'pending' | 'running' | 'success' | 'error';
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_estimate: number | null;
  error_message: string | null;
  result: unknown;
  model_name: string | null;
}

export interface ExecutionHistoryProps {
  minutaId?: string;
  documentoId?: string;
  limit?: number;
}

// Agent type labels in Portuguese
const AGENT_LABELS: Record<string, string> = {
  classify: 'Classificador',
  extract: 'Extrator',
  map: 'Mapeador',
  generate: 'Gerador de Minuta',
};

/**
 * Get human-readable label for agent type
 */
function getAgentLabel(type: string): string {
  return AGENT_LABELS[type] || type;
}

/**
 * Format duration in ms or seconds
 */
function formatDuration(ms: number): string {
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

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes} min`;
  return 'agora';
}

/**
 * Status icon component
 */
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'running':
    case 'pending':
    default:
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
  }
}

/**
 * ExecutionHistory component
 * Displays a list of agent executions for a minuta or document
 */
export function ExecutionHistory({
  minutaId,
  documentoId,
  limit = 10,
}: ExecutionHistoryProps) {
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExecutions() {
      setLoading(true);

      // Build query - using agent_executions table
      let query = supabase
        .from('agent_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (minutaId) {
        query = query.eq('minuta_id', minutaId);
      }
      if (documentoId) {
        query = query.eq('documento_id', documentoId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching executions:', error);
        setExecutions([]);
      } else {
        // Map agent_executions fields to AgentExecution interface
        const mapped: AgentExecution[] = (data || []).map((exec) => ({
          id: exec.id,
          agent_type: exec.agent_type,
          status: exec.status as 'pending' | 'running' | 'success' | 'error',
          started_at: exec.started_at || exec.created_at,
          completed_at: exec.completed_at,
          duration_ms: exec.duration_ms,
          input_tokens: exec.input_tokens,
          output_tokens: exec.output_tokens,
          cost_estimate: exec.cost_estimate,
          error_message: exec.error_message,
          result: exec.result,
          model_name: exec.model_name,
        }));
        setExecutions(mapped);
      }

      setLoading(false);
    }

    fetchExecutions();
  }, [minutaId, documentoId, limit]);

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-2 text-muted-foreground p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Carregando historico...</span>
      </div>
    );
  }

  // Empty state
  if (executions.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        Nenhuma execucao encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {executions.map((exec) => (
        <div key={exec.id} className="border rounded-lg p-3 bg-card">
          {/* Header row */}
          <div className="flex items-center justify-between">
            {/* Status icon and agent type */}
            <div className="flex items-center gap-2">
              <StatusIcon status={exec.status} />
              <span className="font-medium">{getAgentLabel(exec.agent_type)}</span>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {exec.duration_ms !== null && (
                <span>{formatDuration(exec.duration_ms)}</span>
              )}
              {(exec.input_tokens !== null || exec.output_tokens !== null) && (
                <span>
                  {exec.input_tokens ?? 0}/{exec.output_tokens ?? 0} tokens
                </span>
              )}
              {exec.cost_estimate !== null && (
                <span>${Number(exec.cost_estimate).toFixed(4)}</span>
              )}
              <span>{formatRelativeTime(exec.started_at)}</span>
            </div>
          </div>

          {/* Expandable details section */}
          {(exec.result || exec.error_message) && (
            <div className="mt-2">
              <button
                onClick={() => setExpandedId(expandedId === exec.id ? null : exec.id)}
                className={cn(
                  "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                )}
              >
                {expandedId === exec.id ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Ver detalhes
                  </>
                )}
              </button>

              {expandedId === exec.id && (
                <div className="mt-2 overflow-auto max-h-64 rounded bg-muted p-2">
                  {exec.error_message ? (
                    <pre className="text-destructive text-xs whitespace-pre-wrap break-all">
                      {exec.error_message}
                    </pre>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap break-all">
                      {JSON.stringify(exec.result, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ExecutionHistory;
