-- Imoveis
create table if not exists public.imoveis (
  id uuid primary key default gen_random_uuid(),
  minuta_id uuid not null references public.minutas(id) on delete cascade,

  -- Matricula
  matricula_numero text,
  matricula_registro_imoveis text,
  matricula_cidade text,
  matricula_estado text,

  -- Tipo e descricao
  tipo_imovel text, -- apartamento, casa, terreno, sala_comercial, vaga_garagem, etc.
  edificio_nome text,
  unidade text,
  bloco text,
  andar text,

  -- Areas
  area_total numeric(12,4),
  area_privativa numeric(12,4),
  area_comum numeric(12,4),
  fracao_ideal text,

  -- Endereco
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  cep text,

  -- Cadastro municipal
  sql_inscricao text,

  -- Valores venais
  iptu_valor_venal numeric(18,2),
  vvr_valor numeric(18,2),
  ano_exercicio integer,

  -- Onus
  onus_ativos jsonb, -- Array de onus ativos
  onus_historicos jsonb, -- Array de onus cancelados/quitados

  -- Proprietarios atuais (da matricula)
  proprietarios jsonb,

  -- Descricao completa original
  descricao_completa text,

  fontes jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.imoveis enable row level security;

-- Policy
create policy "Users can manage imoveis of own minutas" on public.imoveis
  for all using (
    exists (
      select 1 from public.minutas m
      where m.id = minuta_id and m.user_id = auth.uid()
    )
  );

-- Indexes
create index idx_imoveis_minuta on public.imoveis(minuta_id);
create index idx_imoveis_matricula on public.imoveis(matricula_numero);
create index idx_imoveis_sql on public.imoveis(sql_inscricao);

-- Trigger
create trigger on_imoveis_updated
  before update on public.imoveis
  for each row execute function public.handle_updated_at();
