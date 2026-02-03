-- ============================================================================
-- FUNCAO UTILITARIA: handle_updated_at
-- Atualiza automaticamente o campo updated_at em triggers
-- ============================================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.handle_updated_at() is 'Trigger function para atualizar automaticamente o campo updated_at';
