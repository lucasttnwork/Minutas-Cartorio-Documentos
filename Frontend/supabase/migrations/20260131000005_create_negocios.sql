-- Negocios Juridicos
create table if not exists public.negocios_juridicos (
  id uuid primary key default gen_random_uuid(),
  minuta_id uuid not null references public.minutas(id) on delete cascade,
  imovel_id uuid references public.imoveis(id),

  -- Tipo de negocio
  tipo text not null, -- compra_venda, permuta, doacao, etc.

  -- Valores
  valor_total numeric(18,2),
  fracao_alienada text, -- "1/1", "1/2", etc.

  -- Forma de pagamento
  pagamento_tipo text, -- a_vista, parcelado, financiamento
  valor_sinal numeric(18,2),
  valor_saldo numeric(18,2),
  pagamento_prazo text,
  pagamento_descricao text,

  -- ITBI
  itbi_numero_guia text,
  itbi_base_calculo numeric(18,2),
  itbi_valor numeric(18,2),
  itbi_data_vencimento date,
  itbi_data_pagamento date,
  itbi_codigo_autenticacao text,

  -- Corretagem
  corretagem_valor numeric(18,2),
  corretagem_responsavel text,
  corretagem_intermediador text,

  -- Condicoes especiais
  condicoes_especiais text,

  -- Alertas juridicos detectados
  alertas_juridicos jsonb,

  fontes jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Participantes do negocio (vincula pessoas ao negocio com percentual)
create table if not exists public.participantes_negocio (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios_juridicos(id) on delete cascade,
  papel text not null check (papel in ('alienante', 'adquirente')),

  -- Pode ser pessoa natural ou juridica
  pessoa_natural_id uuid references public.pessoas_naturais(id),
  pessoa_juridica_id uuid references public.pessoas_juridicas(id),

  -- Participacao
  percentual numeric(5,2), -- 100.00 = 100%

  created_at timestamptz not null default now(),

  -- Constraint: deve ter pessoa natural OU juridica
  constraint chk_pessoa check (
    (pessoa_natural_id is not null and pessoa_juridica_id is null) or
    (pessoa_natural_id is null and pessoa_juridica_id is not null)
  )
);

-- Enable RLS
alter table public.negocios_juridicos enable row level security;
alter table public.participantes_negocio enable row level security;

-- Policies
create policy "Users can manage negocios of own minutas" on public.negocios_juridicos
  for all using (
    exists (
      select 1 from public.minutas m
      where m.id = minuta_id and m.user_id = auth.uid()
    )
  );

create policy "Users can manage participantes" on public.participantes_negocio
  for all using (
    exists (
      select 1 from public.negocios_juridicos n
      join public.minutas m on m.id = n.minuta_id
      where n.id = negocio_id and m.user_id = auth.uid()
    )
  );

-- Indexes
create index idx_negocios_minuta on public.negocios_juridicos(minuta_id);
create index idx_negocios_imovel on public.negocios_juridicos(imovel_id);
create index idx_participantes_negocio on public.participantes_negocio(negocio_id);

-- Trigger
create trigger on_negocios_updated
  before update on public.negocios_juridicos
  for each row execute function public.handle_updated_at();
