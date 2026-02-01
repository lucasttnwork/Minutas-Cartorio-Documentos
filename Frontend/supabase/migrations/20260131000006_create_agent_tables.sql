-- Agent executions - log de chamadas de IA
create table if not exists public.agent_executions (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid references public.documentos(id) on delete set null,
  minuta_id uuid references public.minutas(id) on delete set null,

  -- Tipo de operacao
  agent_type text not null, -- classify, extract, map, generate

  -- Modelo usado
  model_name text not null default 'gemini-2.5-flash',

  -- Input/Output
  prompt_used text,
  prompt_version integer default 1,
  input_tokens integer,
  output_tokens integer,

  -- Resultado
  status text not null check (status in ('pending', 'running', 'success', 'error')),
  result jsonb,
  error_message text,

  -- Timing
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer,

  -- Custo estimado
  cost_estimate numeric(10,6),

  created_at timestamptz not null default now()
);

-- Agent prompts - versioned prompts
create table if not exists public.agent_prompts (
  id uuid primary key default gen_random_uuid(),

  -- Identificacao
  tipo_documento text not null, -- RG, CNH, MATRICULA_IMOVEL, etc.
  versao integer not null default 1,

  -- Conteudo
  prompt_text text not null,

  -- Metadados
  descricao text,
  ativo boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Unique constraint: um prompt ativo por tipo
  unique (tipo_documento, versao)
);

-- Enable RLS (agent tables are service-level, read-only for users)
alter table public.agent_executions enable row level security;
alter table public.agent_prompts enable row level security;

-- Policies for executions - users can only view their own
create policy "Users can view own agent executions" on public.agent_executions
  for select using (
    documento_id in (
      select d.id from public.documentos d
      join public.minutas m on m.id = d.minuta_id
      where m.user_id = auth.uid()
    ) or
    minuta_id in (
      select id from public.minutas where user_id = auth.uid()
    )
  );

-- Prompts are readable by all authenticated users
create policy "Authenticated users can read prompts" on public.agent_prompts
  for select using (auth.role() = 'authenticated');

-- Indexes
create index idx_agent_executions_documento on public.agent_executions(documento_id);
create index idx_agent_executions_minuta on public.agent_executions(minuta_id);
create index idx_agent_executions_type on public.agent_executions(agent_type);
create index idx_agent_executions_status on public.agent_executions(status);
create index idx_agent_prompts_tipo on public.agent_prompts(tipo_documento);
create index idx_agent_prompts_ativo on public.agent_prompts(ativo);

-- Trigger
create trigger on_agent_prompts_updated
  before update on public.agent_prompts
  for each row execute function public.handle_updated_at();
