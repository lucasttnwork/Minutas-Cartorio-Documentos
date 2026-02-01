-- Minutas table - main document
create table if not exists public.minutas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  status text not null default 'rascunho' check (status in ('rascunho', 'processando', 'revisao', 'concluida', 'arquivada')),
  current_step text not null default 'upload' check (current_step in ('upload', 'outorgantes', 'outorgados', 'imovel', 'parecer', 'negocio', 'minuta', 'concluido')),
  minuta_texto text,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.minutas enable row level security;

-- Policies
create policy "Users can view own minutas" on public.minutas
  for select using (auth.uid() = user_id);

create policy "Users can insert own minutas" on public.minutas
  for insert with check (auth.uid() = user_id);

create policy "Users can update own minutas" on public.minutas
  for update using (auth.uid() = user_id);

create policy "Users can delete own minutas" on public.minutas
  for delete using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_minutas_updated
  before update on public.minutas
  for each row execute function public.handle_updated_at();
