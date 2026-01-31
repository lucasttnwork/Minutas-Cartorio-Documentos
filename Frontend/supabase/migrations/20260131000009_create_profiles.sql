-- Migration: Create profiles table
-- Description: User profiles extending auth.users with role management

-- Tabela de perfis de usuario (extensao do auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text,
  cargo text check (cargo in ('admin', 'escrevente', 'tabeliao')),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comentarios
comment on table public.profiles is 'Perfis de usuario com informacoes estendidas';
comment on column public.profiles.cargo is 'Cargo do usuario: admin, escrevente ou tabeliao';
comment on column public.profiles.ativo is 'Se o usuario esta ativo no sistema';

-- RLS
alter table public.profiles enable row level security;

-- Usuario pode ver proprio perfil
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Usuario pode atualizar proprio perfil (exceto cargo)
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins podem ver todos os perfis
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.cargo = 'admin'
    )
  );

-- Admins podem atualizar todos os perfis
create policy "Admins can update all profiles" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.cargo = 'admin'
    )
  );

-- Trigger para criar perfil automaticamente quando usuario e criado
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nome, cargo)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'cargo', 'escrevente')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Criar trigger apenas se nao existir
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger para updated_at
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Indice para busca por cargo
create index if not exists idx_profiles_cargo on public.profiles(cargo);
create index if not exists idx_profiles_ativo on public.profiles(ativo);
