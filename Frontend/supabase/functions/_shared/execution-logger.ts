import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Types for execution logging
export interface ExecutionLog {
  id: string;
  started_at: string;
}

export interface ExecutionResult {
  status: 'success' | 'error';
  result?: unknown;
  error_message?: string;
  input_tokens?: number;
  output_tokens?: number;
}

// Agent types used in the system
export type AgentType = 'classify' | 'extract' | 'generate' | 'map';

// Gemini 1.5 Flash pricing (as of 2024)
// https://ai.google.dev/pricing
const COST_PER_1K_INPUT = 0.00025;  // $0.25 per 1M input tokens
const COST_PER_1K_OUTPUT = 0.00125; // $1.25 per 1M output tokens

/**
 * Calculate estimated cost based on token usage
 */
export function calculateCost(inputTokens?: number, outputTokens?: number): number {
  const inputCost = ((inputTokens || 0) / 1000) * COST_PER_1K_INPUT;
  const outputCost = ((outputTokens || 0) / 1000) * COST_PER_1K_OUTPUT;
  return inputCost + outputCost;
}

/**
 * Start logging an execution in the agent_executions table
 * Call this at the beginning of any agent operation
 */
export async function startExecution(
  supabase: SupabaseClient,
  agentType: AgentType,
  options: {
    minutaId?: string;
    documentoId?: string;
    promptUsed?: string;
  } = {}
): Promise<ExecutionLog> {
  const { data, error } = await supabase
    .from('agent_executions')
    .insert({
      agent_type: agentType,
      minuta_id: options.minutaId,
      documento_id: options.documentoId,
      prompt_used: options.promptUsed,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id, started_at')
    .single();

  if (error) {
    console.error('Failed to start execution logging:', error);
    // Return a placeholder to allow processing to continue even if logging fails
    return {
      id: 'logging-failed',
      started_at: new Date().toISOString(),
    };
  }

  return data;
}

/**
 * Finish logging an execution - call this when processing completes (success or error)
 */
export async function finishExecution(
  supabase: SupabaseClient,
  execution: ExecutionLog,
  result: ExecutionResult
): Promise<void> {
  // Don't try to update if logging failed at start
  if (execution.id === 'logging-failed') {
    console.warn('Skipping execution log update - logging failed at start');
    return;
  }

  const durationMs = Date.now() - new Date(execution.started_at).getTime();
  const costEstimate = calculateCost(result.input_tokens, result.output_tokens);

  const { error } = await supabase
    .from('agent_executions')
    .update({
      status: result.status,
      completed_at: new Date().toISOString(),
      duration_ms: durationMs,
      result: result.result,
      error_message: result.error_message,
      input_tokens: result.input_tokens,
      output_tokens: result.output_tokens,
      cost_estimate: costEstimate,
    })
    .eq('id', execution.id);

  if (error) {
    console.error('Failed to finish execution logging:', error);
  }
}

/**
 * Helper to log a successful execution with token usage
 */
export async function logSuccess(
  supabase: SupabaseClient,
  execution: ExecutionLog,
  result: unknown,
  usage?: { inputTokens?: number; outputTokens?: number }
): Promise<void> {
  await finishExecution(supabase, execution, {
    status: 'success',
    result,
    input_tokens: usage?.inputTokens,
    output_tokens: usage?.outputTokens,
  });
}

/**
 * Helper to log a failed execution
 */
export async function logError(
  supabase: SupabaseClient,
  execution: ExecutionLog,
  error: Error | string
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : error;

  await finishExecution(supabase, execution, {
    status: 'error',
    error_message: errorMessage,
  });
}

/**
 * Wrapper that handles the full execution logging lifecycle
 * Use this for a cleaner API when you want to wrap an entire operation
 */
export async function withExecutionLogging<T>(
  supabase: SupabaseClient,
  agentType: AgentType,
  options: {
    minutaId?: string;
    documentoId?: string;
    promptUsed?: string;
  },
  operation: () => Promise<{ result: T; usage?: { inputTokens?: number; outputTokens?: number } }>
): Promise<T> {
  const execution = await startExecution(supabase, agentType, options);

  try {
    const { result, usage } = await operation();
    await logSuccess(supabase, execution, result, usage);
    return result;
  } catch (error) {
    await logError(supabase, execution, error as Error);
    throw error;
  }
}
