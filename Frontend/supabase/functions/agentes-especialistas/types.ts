// Types for agentes-especialistas Edge Function

export type RunStatus =
  | 'pending'
  | 'processing'
  | 'streaming'
  | 'completed'
  | 'stopped'
  | 'error';

export interface DocumentMetadata {
  nome: string;
  storage_path: string;
  mime_type: string;
  tamanho_bytes: number;
}

export interface RunRequest {
  agent_slug: string;
  instrucoes_customizadas?: string;
  // Documentos são enviados como FormData, não no JSON
}

export interface RunResponse {
  run_id: string;
  status: RunStatus;
  output_texto?: string;
  output_thinking?: string;
  error?: string;
  input_tokens?: number;
  output_tokens?: number;
  duration_ms?: number;
}

export interface HistoryRequest {
  limit?: number;
  offset?: number;
  agent_slug?: string;
}

export interface HistoryItem {
  id: string;
  agent_slug: string;
  agent_nome: string;
  documentos: DocumentMetadata[];
  instrucoes_customizadas: string | null;
  status: RunStatus;
  output_texto: string | null;
  erro_mensagem: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  duration_ms: number | null;
  created_at: string;
}

export interface HistoryResponse {
  runs: HistoryItem[];
  total: number;
}

export interface RunDetailResponse {
  id: string;
  user_id: string;
  agent_slug: string;
  agent_nome: string;
  documentos: DocumentMetadata[];
  instrucoes_customizadas: string | null;
  prompt_versao: number;
  prompt_usado: string;
  modelo: string;
  output_texto: string | null;
  output_thinking: string | null;
  status: RunStatus;
  erro_mensagem: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  thinking_duration_ms: number | null;
  cost_estimate: number | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface ActivePrompt {
  id: string;
  agent_slug: string;
  versao: number;
  system_prompt: string;
  nome_exibicao: string;
  descricao: string | null;
  categoria: string;
}

export interface AgentListItem {
  agent_slug: string;
  nome_exibicao: string;
  descricao: string | null;
  categoria: string;
  versao: number;
}
