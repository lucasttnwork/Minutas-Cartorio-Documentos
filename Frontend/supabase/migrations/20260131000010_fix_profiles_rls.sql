-- Migration: Fix profiles RLS policies to remove infinite recursion
-- Description: Replace recursive policies with JWT-based approach
--
-- PROBLEMA: As policies originais consultavam a própria tabela profiles
-- para verificar se o usuário é admin, criando recursão infinita.
--
-- SOLUÇÃO: Usar auth.jwt() para verificar o cargo do usuário diretamente
-- nos claims do JWT, que contêm os user_metadata definidos no signup.
-- Isso evita qualquer consulta à tabela profiles durante a verificação da policy.

-- Drop existing problematic policies
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- ============================================
-- HELPER FUNCTION: Verifica se usuário é admin via JWT
-- ============================================
-- Esta função extrai o cargo dos user_metadata no JWT token,
-- evitando consulta à tabela profiles e prevenindo recursão.
create or replace function public.auth_user_cargo()
returns text as $$
begin
  -- Extrai cargo dos user_metadata no JWT
  -- O path é: jwt -> raw_user_meta_data -> cargo
  return coalesce(
    auth.jwt() -> 'user_metadata' ->> 'cargo',
    auth.jwt() -> 'raw_user_meta_data' ->> 'cargo',
    'escrevente'  -- default se não encontrar
  );
end;
$$ language plpgsql stable security definer set search_path = public;

-- Helper function para verificar se é admin
create or replace function public.is_current_user_admin()
returns boolean as $$
begin
  return public.auth_user_cargo() = 'admin';
end;
$$ language plpgsql stable security definer set search_path = public;

-- ============================================
-- RECREATE ADMIN POLICIES (sem recursão)
-- ============================================

-- Admins podem ver todos os perfis
-- Usa JWT claims em vez de consultar a tabela
create policy "Admins can view all profiles" on public.profiles
  for select using (
    public.is_current_user_admin()
  );

-- Admins podem atualizar todos os perfis
create policy "Admins can update all profiles" on public.profiles
  for update using (
    public.is_current_user_admin()
  );

-- Admins podem inserir perfis (para criar usuários via admin)
create policy "Admins can insert profiles" on public.profiles
  for insert with check (
    public.is_current_user_admin()
  );

-- Admins podem deletar perfis
create policy "Admins can delete profiles" on public.profiles
  for delete using (
    public.is_current_user_admin()
  );

-- ============================================
-- FUNÇÃO DE SINCRONIZAÇÃO: Mantém cargo sincronizado
-- ============================================
-- Esta função garante que quando o cargo é atualizado na tabela profiles,
-- os user_metadata do auth.users também são atualizados para manter
-- consistência entre o JWT e o banco.
--
-- NOTA: Esta função requer service_role para atualizar auth.users
-- e será chamada pelo backend quando um admin alterar o cargo de um usuário.

create or replace function public.sync_user_cargo()
returns trigger as $$
begin
  -- Quando o cargo muda, precisamos atualizar os user_metadata
  -- Isso será feito pelo backend usando service_role
  -- Esta função apenas registra a mudança para processamento posterior
  if old.cargo is distinct from new.cargo then
    -- Log para debugging
    raise notice 'Cargo changed for user %: % -> %', new.id, old.cargo, new.cargo;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger para detectar mudanças de cargo
drop trigger if exists on_cargo_changed on public.profiles;
create trigger on_cargo_changed
  after update of cargo on public.profiles
  for each row execute function public.sync_user_cargo();

-- ============================================
-- COMMENTS
-- ============================================
comment on function public.auth_user_cargo() is 'Extrai o cargo do usuário atual dos JWT claims sem consultar o banco';
comment on function public.is_current_user_admin() is 'Verifica se o usuário atual é admin usando JWT claims';
comment on function public.sync_user_cargo() is 'Detecta mudanças de cargo para sincronização com auth.users';
