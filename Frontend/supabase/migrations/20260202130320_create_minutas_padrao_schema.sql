-- ============================================================================
-- MINUTAS PADRAO - Sistema de Templates de Minutas
-- ============================================================================
-- Templates podem ser globais (disponiveis para todos) ou do usuario (privados).
-- Suporta soft delete para preservar historico de uso.
-- ============================================================================

-- ============================================================================
-- TABELA: minutas_padrao
-- Armazena templates de minutas que podem ser reutilizados
-- ============================================================================
create table if not exists public.minutas_padrao (
  id uuid primary key default gen_random_uuid(),

  -- Proprietario (null para templates globais)
  user_id uuid references auth.users(id) on delete cascade,

  -- Identificacao
  is_global boolean not null default false,
  nome text not null,
  descricao text,

  -- Tipo de negocio
  tipo_negocio text not null default 'geral' check (
    tipo_negocio in ('compra_venda', 'doacao', 'permuta', 'hipoteca', 'inventario', 'geral')
  ),

  -- Arquivo do template
  storage_path text not null,
  nome_original text not null,
  mime_type text not null,
  tamanho_bytes bigint not null,
  thumbnail_path text,

  -- Metricas de uso
  uso_count integer not null default 0,

  -- Soft delete
  deleted_at timestamptz,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraints
  constraint check_global_or_user check (
    (is_global = true and user_id is null) or
    (is_global = false and user_id is not null)
  )
);

-- ============================================================================
-- STORAGE BUCKET: minutas-padrao
-- Armazena os arquivos de templates
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'minutas-padrao',
  'minutas-padrao',
  false,
  52428800, -- 50MB limit
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ]
) on conflict (id) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
alter table public.minutas_padrao enable row level security;

-- SELECT: Usuarios veem templates globais (is_global=true) + proprios (user_id = auth.uid())
-- Exclui soft deleted
create policy "minutas_padrao_select_visible"
  on public.minutas_padrao
  for select
  using (
    deleted_at is null and
    (is_global = true or user_id = auth.uid())
  );

-- INSERT: Usuarios criam apenas templates proprios (user_id = auth.uid(), is_global = false)
create policy "minutas_padrao_insert_own"
  on public.minutas_padrao
  for insert
  with check (
    user_id = auth.uid() and
    is_global = false
  );

-- UPDATE: Usuarios modificam apenas templates proprios nao-globais
create policy "minutas_padrao_update_own"
  on public.minutas_padrao
  for update
  using (
    user_id = auth.uid() and
    is_global = false
  );

-- DELETE: Usuarios deletam apenas templates proprios nao-globais
create policy "minutas_padrao_delete_own"
  on public.minutas_padrao
  for delete
  using (
    user_id = auth.uid() and
    is_global = false
  );

-- ============================================================================
-- STORAGE POLICIES para minutas-padrao
-- Estrutura para usuarios: {user_id}/{filename}
-- Estrutura para globais: global/{filename}
-- ============================================================================

-- INSERT: Usuarios podem fazer upload em sua propria pasta
create policy "minutas_padrao_storage_insert_own"
  on storage.objects
  for insert
  with check (
    bucket_id = 'minutas-padrao' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- SELECT: Usuarios podem ler seus arquivos + globais
create policy "minutas_padrao_storage_select_visible"
  on storage.objects
  for select
  using (
    bucket_id = 'minutas-padrao' and
    (
      auth.uid()::text = (storage.foldername(name))[1] or
      (storage.foldername(name))[1] = 'global'
    )
  );

-- UPDATE: Usuarios podem atualizar apenas seus arquivos
create policy "minutas_padrao_storage_update_own"
  on storage.objects
  for update
  using (
    bucket_id = 'minutas-padrao' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- DELETE: Usuarios podem deletar apenas seus arquivos
create policy "minutas_padrao_storage_delete_own"
  on storage.objects
  for delete
  using (
    bucket_id = 'minutas-padrao' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index por user_id para buscar templates do usuario
create index idx_minutas_padrao_user_id
  on public.minutas_padrao(user_id)
  where deleted_at is null;

-- Index por tipo_negocio para filtrar por categoria
create index idx_minutas_padrao_tipo_negocio
  on public.minutas_padrao(tipo_negocio)
  where deleted_at is null;

-- Index por is_global para buscar templates globais
create index idx_minutas_padrao_is_global
  on public.minutas_padrao(is_global)
  where deleted_at is null and is_global = true;

-- Index composto para query comum: templates visiveis por tipo
create index idx_minutas_padrao_tipo_global
  on public.minutas_padrao(tipo_negocio, is_global)
  where deleted_at is null;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para updated_at
create trigger on_minutas_padrao_updated
  before update on public.minutas_padrao
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Funcao: Retorna templates disponiveis para o usuario (globais + proprios)
create or replace function public.get_available_templates(
  p_tipo_negocio text default null
)
returns table (
  id uuid,
  nome text,
  descricao text,
  tipo_negocio text,
  is_global boolean,
  storage_path text,
  nome_original text,
  mime_type text,
  tamanho_bytes bigint,
  thumbnail_path text,
  uso_count integer,
  created_at timestamptz
)
language sql
stable
security definer
as $$
  select
    m.id,
    m.nome,
    m.descricao,
    m.tipo_negocio,
    m.is_global,
    m.storage_path,
    m.nome_original,
    m.mime_type,
    m.tamanho_bytes,
    m.thumbnail_path,
    m.uso_count,
    m.created_at
  from public.minutas_padrao m
  where m.deleted_at is null
    and (m.is_global = true or m.user_id = auth.uid())
    and (p_tipo_negocio is null or m.tipo_negocio = p_tipo_negocio)
  order by
    m.is_global desc, -- Globais primeiro
    m.uso_count desc,
    m.nome;
$$;

-- Funcao: Incrementa contador de uso de um template
create or replace function public.increment_template_usage(p_template_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.minutas_padrao
  set uso_count = uso_count + 1
  where id = p_template_id
    and deleted_at is null
    and (is_global = true or user_id = auth.uid());
end;
$$;

-- Funcao: Soft delete de um template do usuario
create or replace function public.soft_delete_template(p_template_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  update public.minutas_padrao
  set deleted_at = now()
  where id = p_template_id
    and user_id = auth.uid()
    and is_global = false
    and deleted_at is null;

  return found;
end;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table public.minutas_padrao is 'Templates de minutas reutilizaveis, podem ser globais (sistema) ou do usuario';
comment on column public.minutas_padrao.is_global is 'Se true, template disponivel para todos os usuarios. Se false, apenas para o dono.';
comment on column public.minutas_padrao.tipo_negocio is 'Categoria do template: compra_venda, doacao, permuta, hipoteca, inventario, geral';
comment on column public.minutas_padrao.uso_count is 'Contador de quantas vezes o template foi usado';
comment on column public.minutas_padrao.deleted_at is 'Soft delete - se preenchido, template esta "excluido" mas preservado no historico';

comment on function public.get_available_templates(text) is 'Retorna templates disponiveis para o usuario atual, filtraveis por tipo de negocio';
comment on function public.increment_template_usage(uuid) is 'Incrementa o contador de uso de um template';
comment on function public.soft_delete_template(uuid) is 'Realiza soft delete em um template do usuario';
