-- Documentos table - uploaded files
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  minuta_id uuid not null references public.minutas(id) on delete cascade,
  nome_original text not null,
  storage_path text not null,
  mime_type text not null,
  tamanho_bytes bigint not null,
  tipo_documento text, -- RG, CNH, MATRICULA_IMOVEL, etc.
  classificacao_confianca text check (classificacao_confianca in ('alta', 'media', 'baixa')),
  pessoa_relacionada text,
  dados_extraidos jsonb,
  status text not null default 'uploaded' check (status in ('uploaded', 'classificando', 'classificado', 'extraindo', 'extraido', 'erro')),
  erro_mensagem text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.documentos enable row level security;

-- Policies (through minuta ownership)
create policy "Users can view docs of own minutas" on public.documentos
  for select using (
    exists (
      select 1 from public.minutas m
      where m.id = minuta_id and m.user_id = auth.uid()
    )
  );

create policy "Users can insert docs to own minutas" on public.documentos
  for insert with check (
    exists (
      select 1 from public.minutas m
      where m.id = minuta_id and m.user_id = auth.uid()
    )
  );

create policy "Users can update docs of own minutas" on public.documentos
  for update using (
    exists (
      select 1 from public.minutas m
      where m.id = minuta_id and m.user_id = auth.uid()
    )
  );

create policy "Users can delete docs of own minutas" on public.documentos
  for delete using (
    exists (
      select 1 from public.minutas m
      where m.id = minuta_id and m.user_id = auth.uid()
    )
  );

-- Indexes
create index idx_documentos_minuta on public.documentos(minuta_id);
create index idx_documentos_tipo on public.documentos(tipo_documento);
create index idx_documentos_status on public.documentos(status);

-- Trigger
create trigger on_documentos_updated
  before update on public.documentos
  for each row execute function public.handle_updated_at();
