-- ============================================================================
-- AGENTES ESPECIALISTAS - Schema completamente isolado do fluxo de minutas
-- ============================================================================
-- Este schema é independente e não tem nenhum relacionamento FK com as tabelas
-- do fluxo de minutas (documentos, minutas, pessoas, imoveis, negocios).
-- ============================================================================

-- ============================================================================
-- TABELA: agentes_especialistas_prompts
-- Armazena prompts versionados para cada agente especialista
-- ============================================================================
create table if not exists public.agentes_especialistas_prompts (
  id uuid primary key default gen_random_uuid(),

  -- Identificação do agente
  agent_slug text not null,                    -- rg, cnh, matricula-imovel, etc.
  versao integer not null default 1,

  -- Conteúdo do prompt
  system_prompt text not null,                 -- Prompt completo do sistema

  -- Metadados do agente
  nome_exibicao text not null,                 -- Nome para display (ex: "Extrator de RG")
  descricao text,                              -- Descrição do agente
  categoria text not null check (categoria in ('pessoais', 'imobiliarios', 'empresariais')),

  -- Controle de versão
  ativo boolean not null default true,         -- Apenas UM ativo por slug
  criado_por uuid references auth.users(id) on delete set null,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraints
  constraint unique_agent_slug_versao unique (agent_slug, versao)
);

-- Partial unique index: apenas um prompt ativo por agent_slug
create unique index idx_agentes_especialistas_prompts_ativo_unico
  on public.agentes_especialistas_prompts(agent_slug)
  where ativo = true;

-- ============================================================================
-- TABELA: agentes_especialistas_runs
-- Histórico completo de execuções com todos os dados para reconstruir uma run
-- ============================================================================
create type public.agentes_especialistas_status as enum (
  'pending',
  'processing',
  'streaming',
  'completed',
  'stopped',
  'error'
);

create table if not exists public.agentes_especialistas_runs (
  id uuid primary key default gen_random_uuid(),

  -- Dono da run (relacionamento direto com auth.users, sem FK para minutas)
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Identificação do agente usado
  agent_slug text not null,                    -- Slug do agente usado
  agent_nome text not null,                    -- Nome snapshot no momento da run

  -- Documentos processados (metadados, arquivos no storage)
  documentos jsonb not null default '[]'::jsonb, -- [{nome, storage_path, mime_type, tamanho_bytes}]

  -- Input do usuário
  instrucoes_customizadas text,                -- Instruções extras do usuário

  -- Snapshot do prompt usado (para reprodutibilidade)
  prompt_versao integer not null,              -- Versão do prompt usado
  prompt_usado text not null,                  -- Snapshot completo do prompt

  -- Modelo de IA usado
  modelo text not null default 'gemini-3-flash-preview',

  -- Output da execução
  output_texto text,                           -- Resultado completo em markdown
  output_thinking text,                        -- Texto do thinking mode (se disponível)

  -- Status da execução
  status public.agentes_especialistas_status not null default 'pending',
  erro_mensagem text,                          -- Mensagem de erro (se houver)

  -- Métricas de uso
  input_tokens integer,
  output_tokens integer,
  thinking_duration_ms integer,                -- Duração do thinking
  cost_estimate numeric(10,6),                 -- Custo estimado em USD

  -- Timing
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- STORAGE BUCKET: agentes-especialistas-docs
-- Armazena documentos uploadados para os agentes especialistas
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agentes-especialistas-docs',
  'agentes-especialistas-docs',
  false,
  20971520, -- 20MB limit
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' -- DOCX
  ]
) on conflict (id) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
alter table public.agentes_especialistas_prompts enable row level security;
alter table public.agentes_especialistas_runs enable row level security;

-- Prompts: todos usuários autenticados podem ler
create policy "agentes_especialistas_prompts_select_authenticated"
  on public.agentes_especialistas_prompts
  for select
  using (auth.role() = 'authenticated');

-- Runs: usuários só acessam suas próprias runs
create policy "agentes_especialistas_runs_select_own"
  on public.agentes_especialistas_runs
  for select
  using (auth.uid() = user_id);

create policy "agentes_especialistas_runs_insert_own"
  on public.agentes_especialistas_runs
  for insert
  with check (auth.uid() = user_id);

create policy "agentes_especialistas_runs_update_own"
  on public.agentes_especialistas_runs
  for update
  using (auth.uid() = user_id);

create policy "agentes_especialistas_runs_delete_own"
  on public.agentes_especialistas_runs
  for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- STORAGE POLICIES para agentes-especialistas-docs
-- Estrutura: {user_id}/{run_id}/{filename}
-- ============================================================================

create policy "agentes_especialistas_docs_insert_own"
  on storage.objects
  for insert
  with check (
    bucket_id = 'agentes-especialistas-docs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "agentes_especialistas_docs_select_own"
  on storage.objects
  for select
  using (
    bucket_id = 'agentes-especialistas-docs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "agentes_especialistas_docs_update_own"
  on storage.objects
  for update
  using (
    bucket_id = 'agentes-especialistas-docs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "agentes_especialistas_docs_delete_own"
  on storage.objects
  for delete
  using (
    bucket_id = 'agentes-especialistas-docs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Prompts indexes
create index idx_agentes_especialistas_prompts_slug
  on public.agentes_especialistas_prompts(agent_slug);

create index idx_agentes_especialistas_prompts_categoria
  on public.agentes_especialistas_prompts(categoria);

create index idx_agentes_especialistas_prompts_ativo
  on public.agentes_especialistas_prompts(ativo);

-- Runs indexes
create index idx_agentes_especialistas_runs_user_id
  on public.agentes_especialistas_runs(user_id);

create index idx_agentes_especialistas_runs_agent_slug
  on public.agentes_especialistas_runs(agent_slug);

create index idx_agentes_especialistas_runs_status
  on public.agentes_especialistas_runs(status);

create index idx_agentes_especialistas_runs_created_at
  on public.agentes_especialistas_runs(created_at desc);

-- Composite index for common query patterns
create index idx_agentes_especialistas_runs_user_created
  on public.agentes_especialistas_runs(user_id, created_at desc);

create index idx_agentes_especialistas_runs_user_agent
  on public.agentes_especialistas_runs(user_id, agent_slug, created_at desc);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para updated_at
create trigger on_agentes_especialistas_prompts_updated
  before update on public.agentes_especialistas_prompts
  for each row execute function public.handle_updated_at();

create trigger on_agentes_especialistas_runs_updated
  before update on public.agentes_especialistas_runs
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Função: Retorna o prompt ativo para um agente
create or replace function public.get_active_specialist_prompt(p_agent_slug text)
returns table (
  id uuid,
  agent_slug text,
  versao integer,
  system_prompt text,
  nome_exibicao text,
  descricao text,
  categoria text
)
language sql
stable
security definer
as $$
  select
    id,
    agent_slug,
    versao,
    system_prompt,
    nome_exibicao,
    descricao,
    categoria
  from public.agentes_especialistas_prompts
  where agent_slug = p_agent_slug
    and ativo = true
  limit 1;
$$;

-- Função: Retorna histórico paginado de runs do usuário
create or replace function public.get_specialist_runs_history(
  p_user_id uuid,
  p_limit integer default 20,
  p_offset integer default 0,
  p_agent_slug text default null
)
returns table (
  id uuid,
  agent_slug text,
  agent_nome text,
  documentos jsonb,
  instrucoes_customizadas text,
  status public.agentes_especialistas_status,
  output_texto text,
  erro_mensagem text,
  input_tokens integer,
  output_tokens integer,
  duration_ms integer,
  created_at timestamptz
)
language sql
stable
security definer
as $$
  select
    r.id,
    r.agent_slug,
    r.agent_nome,
    r.documentos,
    r.instrucoes_customizadas,
    r.status,
    r.output_texto,
    r.erro_mensagem,
    r.input_tokens,
    r.output_tokens,
    r.duration_ms,
    r.created_at
  from public.agentes_especialistas_runs r
  where r.user_id = p_user_id
    and (p_agent_slug is null or r.agent_slug = p_agent_slug)
  order by r.created_at desc
  limit p_limit
  offset p_offset;
$$;

-- Função: Cria uma nova run com snapshot do prompt
create or replace function public.create_specialist_run(
  p_user_id uuid,
  p_agent_slug text,
  p_documentos jsonb default '[]'::jsonb,
  p_instrucoes_customizadas text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_prompt_record record;
  v_run_id uuid;
begin
  -- Busca o prompt ativo
  select id, versao, system_prompt, nome_exibicao
  into v_prompt_record
  from public.agentes_especialistas_prompts
  where agent_slug = p_agent_slug
    and ativo = true
  limit 1;

  if v_prompt_record is null then
    raise exception 'Prompt não encontrado para agente: %', p_agent_slug;
  end if;

  -- Cria a run
  insert into public.agentes_especialistas_runs (
    user_id,
    agent_slug,
    agent_nome,
    documentos,
    instrucoes_customizadas,
    prompt_versao,
    prompt_usado,
    status,
    started_at
  ) values (
    p_user_id,
    p_agent_slug,
    v_prompt_record.nome_exibicao,
    p_documentos,
    p_instrucoes_customizadas,
    v_prompt_record.versao,
    v_prompt_record.system_prompt,
    'processing',
    now()
  )
  returning id into v_run_id;

  return v_run_id;
end;
$$;

-- Função: Completa uma run com resultados
create or replace function public.complete_specialist_run(
  p_run_id uuid,
  p_output_texto text,
  p_output_thinking text default null,
  p_input_tokens integer default null,
  p_output_tokens integer default null,
  p_thinking_duration_ms integer default null,
  p_cost_estimate numeric default null,
  p_status public.agentes_especialistas_status default 'completed',
  p_erro_mensagem text default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_started_at timestamptz;
begin
  -- Busca started_at para calcular duration
  select started_at into v_started_at
  from public.agentes_especialistas_runs
  where id = p_run_id;

  -- Atualiza a run
  update public.agentes_especialistas_runs
  set
    output_texto = p_output_texto,
    output_thinking = p_output_thinking,
    input_tokens = p_input_tokens,
    output_tokens = p_output_tokens,
    thinking_duration_ms = p_thinking_duration_ms,
    cost_estimate = p_cost_estimate,
    status = p_status,
    erro_mensagem = p_erro_mensagem,
    completed_at = now(),
    duration_ms = extract(epoch from (now() - v_started_at)) * 1000
  where id = p_run_id;
end;
$$;

-- Função: Lista todos os agentes disponíveis (prompts ativos)
create or replace function public.list_specialist_agents()
returns table (
  agent_slug text,
  nome_exibicao text,
  descricao text,
  categoria text,
  versao integer
)
language sql
stable
security definer
as $$
  select
    agent_slug,
    nome_exibicao,
    descricao,
    categoria,
    versao
  from public.agentes_especialistas_prompts
  where ativo = true
  order by
    case categoria
      when 'pessoais' then 1
      when 'imobiliarios' then 2
      when 'empresariais' then 3
    end,
    nome_exibicao;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table public.agentes_especialistas_prompts is 'Prompts versionados para cada agente especialista de extração de documentos';
comment on table public.agentes_especialistas_runs is 'Histórico de execuções dos agentes especialistas, completamente isolado do fluxo de minutas';

comment on function public.get_active_specialist_prompt(text) is 'Retorna o prompt ativo para um agente específico';
comment on function public.get_specialist_runs_history(uuid, integer, integer, text) is 'Retorna histórico paginado de runs do usuário com filtro opcional por agente';
comment on function public.create_specialist_run(uuid, text, jsonb, text) is 'Cria uma nova run com snapshot automático do prompt ativo';
comment on function public.complete_specialist_run(uuid, text, text, integer, integer, integer, numeric, public.agentes_especialistas_status, text) is 'Completa uma run com resultados da execução';
comment on function public.list_specialist_agents() is 'Lista todos os agentes especialistas disponíveis';
