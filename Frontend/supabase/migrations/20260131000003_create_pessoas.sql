-- Pessoas Naturais
create table if not exists public.pessoas_naturais (
  id uuid primary key default gen_random_uuid(),
  minuta_id uuid not null references public.minutas(id) on delete cascade,
  papel text not null check (papel in ('outorgante', 'outorgado', 'anuente', 'representante', 'procurador')),

  -- Identificacao
  nome text not null,
  nacionalidade text,
  naturalidade text,
  data_nascimento date,
  profissao text,
  estado_civil text,
  regime_bens text,

  -- Documentos
  cpf text,
  rg text,
  rg_orgao_emissor text,
  rg_estado text,
  rg_data_emissao date,

  -- Filiacao
  nome_pai text,
  nome_mae text,

  -- Conjuge
  conjuge_nome text,
  conjuge_cpf text,
  data_casamento date,

  -- Endereco
  endereco_logradouro text,
  endereco_numero text,
  endereco_complemento text,
  endereco_bairro text,
  endereco_cidade text,
  endereco_estado text,
  endereco_cep text,

  -- Contato
  email text,
  telefone text,

  -- Certidoes
  cndt_numero text,
  cndt_data_expedicao timestamptz,
  cndt_validade timestamptz,
  cndt_status text,

  -- Metadata
  fontes jsonb, -- Rastreamento de qual documento veio cada campo
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pessoas Juridicas
create table if not exists public.pessoas_juridicas (
  id uuid primary key default gen_random_uuid(),
  minuta_id uuid not null references public.minutas(id) on delete cascade,
  papel text not null check (papel in ('outorgante', 'outorgado')),

  -- Identificacao
  razao_social text not null,
  nome_fantasia text,
  cnpj text,
  inscricao_estadual text,
  inscricao_municipal text,

  -- Constituicao
  tipo_societario text,
  data_constituicao date,
  capital_social numeric(18,2),

  -- Endereco sede
  sede_logradouro text,
  sede_numero text,
  sede_complemento text,
  sede_bairro text,
  sede_cidade text,
  sede_estado text,
  sede_cep text,

  -- Contato
  email text,
  telefone text,

  fontes jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Representantes (administradores e procuradores de PJ)
create table if not exists public.representantes (
  id uuid primary key default gen_random_uuid(),
  pessoa_juridica_id uuid not null references public.pessoas_juridicas(id) on delete cascade,
  tipo text not null check (tipo in ('administrador', 'procurador')),
  pessoa_natural_id uuid references public.pessoas_naturais(id),

  -- Se nao vinculado a pessoa_natural, dados inline
  nome text,
  cpf text,
  cargo text,

  -- Procuracao especifica
  procuracao_tipo text,
  procuracao_data date,
  procuracao_validade date,
  procuracao_poderes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.pessoas_naturais enable row level security;
alter table public.pessoas_juridicas enable row level security;
alter table public.representantes enable row level security;

-- Policies for pessoas_naturais
create policy "Users can manage pessoas_naturais of own minutas" on public.pessoas_naturais
  for all using (
    exists (
      select 1 from public.minutas m
      where m.id = minuta_id and m.user_id = auth.uid()
    )
  );

-- Policies for pessoas_juridicas
create policy "Users can manage pessoas_juridicas of own minutas" on public.pessoas_juridicas
  for all using (
    exists (
      select 1 from public.minutas m
      where m.id = minuta_id and m.user_id = auth.uid()
    )
  );

-- Policies for representantes
create policy "Users can manage representantes" on public.representantes
  for all using (
    exists (
      select 1 from public.pessoas_juridicas pj
      join public.minutas m on m.id = pj.minuta_id
      where pj.id = pessoa_juridica_id and m.user_id = auth.uid()
    )
  );

-- Indexes
create index idx_pessoas_naturais_minuta on public.pessoas_naturais(minuta_id);
create index idx_pessoas_naturais_papel on public.pessoas_naturais(papel);
create index idx_pessoas_naturais_cpf on public.pessoas_naturais(cpf);
create index idx_pessoas_juridicas_minuta on public.pessoas_juridicas(minuta_id);
create index idx_pessoas_juridicas_cnpj on public.pessoas_juridicas(cnpj);
create index idx_representantes_pj on public.representantes(pessoa_juridica_id);

-- Triggers
create trigger on_pessoas_naturais_updated
  before update on public.pessoas_naturais
  for each row execute function public.handle_updated_at();

create trigger on_pessoas_juridicas_updated
  before update on public.pessoas_juridicas
  for each row execute function public.handle_updated_at();

create trigger on_representantes_updated
  before update on public.representantes
  for each row execute function public.handle_updated_at();
