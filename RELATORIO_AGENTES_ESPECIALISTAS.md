# RELATÓRIO COMPLETO: SISTEMA DE AGENTES ESPECIALISTAS

## Sumário Executivo

O sistema de **Agentes Especialistas** é um sistema de extração de dados de documentos totalmente isolado do pipeline de minutas. Funciona com:

- **11 agentes** especializados em diferentes tipos de documentos
- **Prompts dinâmicos** armazenados no banco de dados
- **Edge Functions** para orquestração e integração com Gemini
- **Histórico completo** de execuções com snapshots de prompts
- **Storage isolado** para documentos processados

---

## 1. ARQUITETURA COMPLETA DO SISTEMA

### 1.1 Visão Geral em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  AgenteExtrator.tsx → useAgentRun() → Edge Function Call   │
└────────────────────────┬────────────────────────────────────┘
                         │ FormData (agent_slug + Files)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              EDGE FUNCTION (agentes-especialistas)          │
│  - Busca prompt ativo do banco                              │
│  - Upload de docs para Storage                              │
│  - Chama Gemini API                                          │
│  - Salva resultado na tabela runs                           │
└────────────────────────┬────────────────────────────────────┘
                         │ JSON Response (run_id + output)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  BANCO DE DADOS (Supabase)                  │
│  - agentes_especialistas_prompts (prompts versionados)      │
│  - agentes_especialistas_runs (histórico de execuções)      │
│  - storage.buckets[agentes-especialistas-docs]              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Componentes Principais

#### Frontend
- **`src/pages/AgenteExtrator.tsx`** - Página principal do agente (upload, análise, resultados)
- **`src/hooks/useAgentRun.ts`** - Hook React para chamar Edge Function
- **`src/components/agentes/`** - Componentes especializados (UploadZone, ResultadoAnalise, etc)
- **`src/types/agente.ts`** - Tipos TypeScript para agentes
- **`src/data/agentes.ts`** - Catálogo dos 11 agentes

#### Backend
- **`supabase/functions/agentes-especialistas/index.ts`** - Edge Function principal (4 endpoints)
- **`supabase/functions/agentes-especialistas/types.ts`** - Tipos TypeScript compartilhados

#### Banco de Dados
- **`supabase/migrations/20260131000006_create_agent_tables.sql`** - Schema de prompts e execuções (antigo)
- **`supabase/migrations/20260201000001_create_agentes_especialistas_schema.sql`** - Schema novo (isolado)
- **`supabase/migrations/20260201000002_seed_agentes_especialistas_prompts.sql`** - Seed com 11 prompts

---

## 2. SCHEMA DO BANCO DE DADOS

### 2.1 Tabela: `agentes_especialistas_prompts`

Armazena **prompts versionados** para cada agente especialista.

```sql
CREATE TABLE agentes_especialistas_prompts (
  id UUID PRIMARY KEY,

  -- Identificação do agente
  agent_slug TEXT NOT NULL,              -- rg, cnh, matricula-imovel, etc
  versao INTEGER NOT NULL,                -- Versão do prompt (atual: 1)

  -- Conteúdo
  system_prompt TEXT NOT NULL,            -- Prompt COMPLETO (3000-5000 caracteres)

  -- Metadados
  nome_exibicao TEXT NOT NULL,            -- "Extrator de RG"
  descricao TEXT,                         -- Descrição breve
  categoria TEXT NOT NULL,                -- 'pessoais' | 'imobiliarios' | 'empresariais'

  -- Controle de versão
  ativo BOOLEAN DEFAULT TRUE,             -- Apenas UM prompt ativo por agent_slug
  criado_por UUID REFERENCES auth.users,

  -- Timestamps
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,

  CONSTRAINT unique_agent_slug_versao UNIQUE (agent_slug, versao)
);

-- Index crucial: garante apenas UM prompt ativo por agent_slug
CREATE UNIQUE INDEX idx_agentes_especialistas_prompts_ativo_unico
  ON agentes_especialistas_prompts(agent_slug)
  WHERE ativo = true;
```

**Características:**
- ✓ Prompts versionados (permite rollback)
- ✓ Apenas UM prompt ativo por agente
- ✓ Snapshot completo do prompt salvo em cada run
- ✓ Row-level security: qualquer usuário autenticado pode LER

---

### 2.2 Tabela: `agentes_especialistas_runs`

Histórico **completo** de execuções com snapshot do prompt usado.

```sql
CREATE TABLE agentes_especialistas_runs (
  id UUID PRIMARY KEY,

  -- Relacionamento
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificação do agente usado
  agent_slug TEXT NOT NULL,              -- rg, cnh, etc (para agrupamento)
  agent_nome TEXT NOT NULL,              -- Nome snapshot (ex: "Extrator de RG")

  -- Documentos processados
  documentos JSONB DEFAULT '[]'::jsonb,  -- [{nome, storage_path, mime_type, tamanho_bytes}]

  -- Input do usuário
  instrucoes_customizadas TEXT,          -- Instruções extras do usuário

  -- Snapshot do prompt (CRÍTICO para reprodutibilidade)
  prompt_versao INTEGER NOT NULL,        -- Versão do prompt usada
  prompt_usado TEXT NOT NULL,            -- Snapshot COMPLETO do prompt

  -- Modelo de IA
  modelo TEXT DEFAULT 'gemini-3-flash-preview',

  -- Output
  output_texto TEXT,                     -- Resultado em Markdown (3 seções)
  output_thinking TEXT,                  -- Thinking mode (se disponível)

  -- Status
  status agentes_especialistas_status,   -- pending|processing|streaming|completed|stopped|error
  erro_mensagem TEXT,

  -- Métricas
  input_tokens INTEGER,
  output_tokens INTEGER,
  thinking_duration_ms INTEGER,
  cost_estimate NUMERIC(10,6),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Indexes para queries frequentes
CREATE INDEX idx_agentes_especialistas_runs_user_id ON agentes_especialistas_runs(user_id);
CREATE INDEX idx_agentes_especialistas_runs_agent_slug ON agentes_especialistas_runs(agent_slug);
CREATE INDEX idx_agentes_especialistas_runs_status ON agentes_especialistas_runs(status);
CREATE INDEX idx_agentes_especialistas_runs_created_at ON agentes_especialistas_runs(created_at DESC);
CREATE INDEX idx_agentes_especialistas_runs_user_agent ON agentes_especialistas_runs(user_id, agent_slug, created_at DESC);
```

**Características:**
- ✓ Snapshot completo do prompt (permite reconstruir a run)
- ✓ Documentos metadados com storage paths
- ✓ Instruções customizadas por usuário
- ✓ Métricas completas (tokens, custo, duração)
- ✓ RLS: usuários só veem suas próprias runs

---

### 2.3 Storage Bucket: `agentes-especialistas-docs`

Armazena documentos uploaded para os agentes.

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agentes-especialistas-docs',
  'agentes-especialistas-docs',
  false,  -- Privado
  20971520,  -- 20MB limite
  ARRAY[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  -- DOCX
  ]
);

-- Storage path structure: {user_id}/{run_id}/{filename}
```

**Policies RLS:**
- ✓ Insert/Select/Update/Delete - apenas próprios documentos (based on user_id path)

---

### 2.4 Funções SQL Helper

#### `get_active_specialist_prompt(p_agent_slug TEXT)`
Retorna o prompt **ativo** para um agente específico.

```sql
SELECT
  id, agent_slug, versao, system_prompt,
  nome_exibicao, descricao, categoria
FROM agentes_especialistas_prompts
WHERE agent_slug = p_agent_slug AND ativo = true
LIMIT 1;
```

**Usada por:** Edge Function ao iniciar uma run

---

#### `get_specialist_runs_history(p_user_id, p_limit, p_offset, p_agent_slug?)`
Lista histórico paginado de runs.

```sql
SELECT id, agent_slug, agent_nome, documentos, status,
       output_texto, erro_mensagem, input_tokens,
       output_tokens, duration_ms, created_at
FROM agentes_especialistas_runs
WHERE user_id = p_user_id
  AND (p_agent_slug IS NULL OR agent_slug = p_agent_slug)
ORDER BY created_at DESC
LIMIT p_limit OFFSET p_offset;
```

---

#### `create_specialist_run(p_user_id, p_agent_slug, p_documentos, p_instrucoes?)`
Cria nova run com **snapshot automático** do prompt ativo.

```sql
-- 1. Busca o prompt ativo
-- 2. Valida que prompt existe
-- 3. Insere run com status='processing'
-- 4. Retorna run_id
```

---

#### `complete_specialist_run(p_run_id, p_output_texto, p_output_thinking?, ...)`
Completa a run com resultado e métricas.

```sql
UPDATE agentes_especialistas_runs
SET output_texto = p_output_texto,
    output_thinking = p_output_thinking,
    input_tokens = p_input_tokens,
    output_tokens = p_output_tokens,
    cost_estimate = p_cost_estimate,
    status = p_status,
    erro_mensagem = p_erro_mensagem,
    completed_at = NOW(),
    duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000
WHERE id = p_run_id;
```

---

#### `list_specialist_agents()`
Lista todos os agentes disponíveis (prompts ativos), ordenados por categoria.

```sql
SELECT agent_slug, nome_exibicao, descricao, categoria, versao
FROM agentes_especialistas_prompts
WHERE ativo = true
ORDER BY categoria, nome_exibicao;
```

---

## 3. OS 11 AGENTES ESPECIALISTAS

Cada agente tem um **prompt completo e detalhado** (3000-5000 caracteres) que instrui o Gemini sobre como extrair dados específicos do tipo de documento.

### 3.1 Categoria: PESSOAIS (4 agentes)

#### 1️⃣ **RG** (Carteira de Identidade)
- **Slug:** `rg`
- **Prompt:** Extrai dados de RG/Carteira de Identidade brasileiros
- **Regras:** Distingue TITULAR vs AUTORIDADE (delegado), extrai CPF, filiação, observações legais
- **Output formato:** Reescrita + Explicação (5 parágrafos obrigatórios) + JSON estruturado
- **Dados principais:** nome_completo, numero_rg, cpf, data_nascimento, filiação, órgão expedidor

```json
{
  "tipo_documento": "RG",
  "nome_completo": "...",
  "numero_rg": "00.000.000-0",
  "cpf": "000.000.000-00",
  "data_nascimento": "DD/MM/AAAA",
  "naturalidade": "S.PAULO - SP",
  "filiacao": { "pai": "...", "mae": "..." },
  "orgao_expedidor": "SSP",
  "uf_expedidor": "SP",
  "campos_vazios": [],
  "elementos_presentes": { "foto": true, "assinatura_titular": true },
  "autoridade_emissora": { "nome": "...", "cargo": "..." }
}
```

---

#### 2️⃣ **CNH** (Carteira Nacional de Habilitação)
- **Slug:** `cnh`
- **Prompt:** Extrai dados de CNH brasileiras
- **Regras:** Titular vs autoridade DETRAN, extrai categoria de habilitação, validade
- **Output:** Reescrita + Explicação (5 parágrafos) + JSON
- **Dados principais:** nome_completo, cpf, rg, data_nascimento, categoria (A/B/AB/C/D/E), data_validade

```json
{
  "tipo_documento": "CNH",
  "dados_catalogados": {
    "nome_completo": "...",
    "cpf": "000.000.000-00",
    "rg": "00.000.000-0",
    "habilitacao": {
      "categoria": "AB",
      "numero_registro": "00000000000",
      "data_emissao": "DD/MM/AAAA",
      "data_validade": "DD/MM/AAAA"
    }
  }
}
```

---

#### 3️⃣ **CERTIDÃO DE CASAMENTO**
- **Slug:** `certidao-casamento`
- **Prompt:** Extrai dados de certidões de casamento brasileiras
- **Regras Anti-fabricação:** NUNCA invente dados, use null se ilegível
- **Output:** Reescrita + Explicação (seções detalhadas) + JSON
- **Dados principais:** cônjuge1, cônjuge2, data_casamento, regime_bens, averbações

```json
{
  "tipo_certidao": "CASAMENTO",
  "cartorio": "...",
  "livro": "1234", "folha": "001", "termo": "100",
  "data_casamento": "DD/MM/AAAA",
  "regime_bens": "COMUNHAO PARCIAL DE BENS",
  "conjuge1": {
    "nome_completo": "...",
    "nome_solteiro": "...",
    "cpf": "000.000.000-00",
    "data_nascimento": "DD/MM/AAAA",
    "filiacao": { "pai": "...", "mae": "..." }
  },
  "conjuge2": { ... },
  "averbacoes": [],
  "situacao_atual_vinculo": "CASADOS|DIVORCIADOS"
}
```

---

#### 4️⃣ **CERTIDÃO DE NASCIMENTO**
- **Slug:** `certidao-nascimento`
- **Prompt:** Extrai dados de certidões de nascimento brasileiras
- **Regras:** Valida que data_nascimento < data_registro, trata campo "ILEGÍVEL"
- **Output:** Reescrita + Explicação (3-5 parágrafos) + JSON
- **Dados principais:** nome_completo, data_nascimento, filiação, cartório, averbações

```json
{
  "tipo_certidao": "NASCIMENTO",
  "nome_completo": null,
  "data_nascimento": null,
  "local_nascimento": { "cidade": null, "estado": null },
  "filiacao": { "pai": null, "mae": null },
  "cartorio": { "nome": null, "endereco": null },
  "registro": { "livro": null, "folha": null, "termo": null },
  "averbacoes": [],
  "qualidade_imagem": "BOA|MEDIA|RUIM",
  "confianca_extracao": "ALTA|MEDIA|BAIXA"
}
```

---

### 3.2 Categoria: IMOBILIÁRIOS (5 agentes)

#### 5️⃣ **MATRÍCULA DE IMÓVEL**
- **Slug:** `matricula-imovel`
- **Prompt:** Extrai dados de matrículas imobiliárias (RGI)
- **Regras:** Cadeia dominial COMPLETA, verifica cancelamentos de ónus
- **Output:** Reescrita + Explicação (5 parágrafos) + JSON
- **Dados principais:** proprietarios, endereço, onus_ativos, onus_historicos, cadeia_dominial

```json
{
  "tipo_documento": "MATRICULA_IMOVEL",
  "numero_matricula": "00.000",
  "cartorio": "Nome do Cartorio",
  "imovel": {
    "tipo_unidade": "apartamento",
    "endereco": { "logradouro": "Rua", "numero": "000", "bairro": "..." },
    "sql": "000.000.0000-0",
    "area_util_m2": 70.00,
    "area_total_m2": 80.00
  },
  "cadeia_dominial": [ /* histórico completo de proprietários */ ],
  "proprietarios_atuais": [ /* donos atuais */ ],
  "onus_ativos": [ /* ónus válidos */ ],
  "onus_historicos": [ /* ónus cancelados */ ],
  "alertas": []
}
```

---

#### 6️⃣ **ITBI** (Imposto de Transmissão de Bens Imóveis)
- **Slug:** `itbi`
- **Prompt:** Extrai dados de guias de ITBI
- **Regras:** Valida base_calculo = MAX(valor_transacao, valor_venal), calcula ITBI
- **Output:** Reescrita + Explicação (3-5 parágrafos) + JSON
- **Dados principais:** valor_transacao, valor_venal, aliquota, valor_itbi

```json
{
  "identificacao": { "numero_transacao": "...", "sql": "..." },
  "imovel": { "endereco_completo": "...", "matricula": "..." },
  "transacao": { "natureza": "COMPRA E VENDA", "proporcao_transmitida": null },
  "partes": {
    "transmitente": { "nome": null, "cpf_cnpj": null },
    "adquirente": { "nome": "...", "cpf_cnpj": null }
  },
  "valores": {
    "valor_transacao": 500000.00,
    "valor_venal_referencia": 450000.00,
    "base_calculo": 500000.00,
    "aliquota_percentual": 2.5,
    "valor_itbi": 12500.00
  }
}
```

---

#### 7️⃣ **IPTU** (Imposto Predial Territorial Urbano)
- **Slug:** `iptu`
- **Prompt:** Extrai dados de carnês e certidões de IPTU
- **Output:** Reescrita + Explicação (4 seções) + JSON
- **Dados principais:** sql, áreas (terreno, construção), valores venais, contribuintes

```json
{
  "identificacao_imovel": {
    "sql": "000.000.0000-0",
    "logradouro": "R EXEMPLO",
    "numero": "123",
    "endereco_completo": "..."
  },
  "contribuintes": [
    { "tipo_pessoa": "fisica", "nome": "...", "cpf": "000.000.000-00" }
  ],
  "dados_terreno": {
    "area_total_m2": 250.00,
    "testada_m": 10.00,
    "fracao_ideal": 0.0000
  },
  "dados_construcao": {
    "area_construida_m2": 150.00,
    "ano_construcao_corrigido": 2015,
    "padrao_construcao": "6-A",
    "uso": "residencia",
    "tipo_imovel": "APARTAMENTO"
  },
  "valores_venais": {
    "ano_exercicio": 2024,
    "valor_venal_total": 500000.00,
    "base_calculo_iptu": 500000.00
  }
}
```

---

#### 8️⃣ **ESCRITURA** (Pública)
- **Slug:** `escritura`
- **Prompt:** Extrai dados de escrituras públicas (compra/venda, doação, permuta)
- **Regras:** Qualificação COMPLETA das partes, valores EXATOS, todas as certidões
- **Output:** Reescrita + Explicação (5 parágrafos obrigatórios) + JSON
- **Dados principais:** outorgantes, outorgados, imovel, valores, pagamento, ITBI

```json
{
  "tipo_escritura": "COMPRA E VENDA",
  "cartorio": "Nome do tabelionato",
  "tabeliao": "NOME",
  "livro": "0001", "folhas": "001-010",
  "data_lavratura": "DD/MM/AAAA",
  "partes": {
    "outorgantes_vendedores": [
      {
        "nome": "NOME",
        "cpf": "000.000.000-00",
        "rg": "00.000.000-0 SSP/SP",
        "estado_civil": "CASADO",
        "regime_bens": "COMUNHAO PARCIAL",
        "conjuge": { "nome": "NOME", "cpf": "000.000.000-00" }
      }
    ],
    "outorgados_compradores": [ ... ]
  },
  "imovel": {
    "tipo": "APARTAMENTO",
    "endereco_completo": "...",
    "matricula": "00000",
    "area_privativa_m2": 70.00,
    "area_total_m2": 80.00
  },
  "valores": {
    "valor_transacao": 500000.00,
    "moeda": "BRL"
  },
  "itbi": { "guia_numero": "000000000000", "valor_recolhido": null },
  "certidoes_apresentadas": []
}
```

---

#### 9️⃣ **COMPROMISSO DE COMPRA E VENDA**
- **Slug:** `compromisso-compra-venda`
- **Prompt:** Extrai dados de contratos de compromisso
- **Regras:** Validação financeira (sinal + saldo = preço total), detecta aditivos
- **Output:** Reescrita + Explicação (5 parágrafos) + Seções + JSON
- **Dados principais:** vendedores, compradores, imovel, valores_financeiros, prazos

```json
{
  "tipo_documento": "COMPROMISSO_COMPRA_VENDA",
  "eh_aditivo": false,
  "data_contrato": "AAAA-MM-DD",
  "vendedores": [
    {
      "nome": "Nome",
      "cpf": "000.000.000-00",
      "estado_civil": "CASADO",
      "dados_bancarios": {
        "banco": "Banco",
        "agencia": "0000",
        "conta_corrente": "00000000"
      }
    }
  ],
  "compradores": [ ... ],
  "imovel": {
    "tipo": "APARTAMENTO",
    "endereco_completo": "...",
    "matriculas": [ ... ],
    "area_privativa_m2": 70.00
  },
  "valores_financeiros": {
    "preco_total": 500000.00,
    "sinal_entrada": 50000.00,
    "saldo": 450000.00,
    "sinal_percentual_calculado": 10.0,
    "validacao_valores_ok": true
  },
  "prazos": {
    "prazo_pagamento_sinal_dias": 4,
    "prazo_pagamento_saldo_dias": 60,
    "prazo_escritura": "60 dias corridos"
  },
  "penalidades": {
    "multa_rescisoria_percentual": 10.0,
    "multa_rescisoria_valor_calculado": 50000.00
  }
}
```

---

### 3.3 Categoria: EMPRESARIAIS (2 agentes)

#### 🔟 **CONTRATO SOCIAL**
- **Slug:** `contrato-social`
- **Prompt:** Extrai dados de contratos sociais de empresas
- **Output:** Reescrita + Explicação (5 parágrafos) + JSON
- **Dados principais:** razão_social, cnpj, socios, capital_social, objeto_social

```json
{
  "tipo_documento": "CONTRATO_SOCIAL",
  "empresa": {
    "razao_social": "NOME DA EMPRESA LTDA",
    "cnpj": "00.000.000/0001-00",
    "nire": "00000000000",
    "data_constituicao": "DD/MM/AAAA",
    "tipo_societario": "SOCIEDADE LIMITADA",
    "endereco": { "logradouro": "Rua", "numero": "000", "bairro": "..." }
  },
  "capital_social": {
    "valor": 100000.00,
    "moeda": "BRL",
    "integralizado": true,
    "quotas_totais": 100000
  },
  "socios": [
    {
      "nome": "NOME DO SOCIO",
      "cpf": "000.000.000-00",
      "nacionalidade": "brasileiro",
      "quotas": 50000,
      "participacao_percentual": 50.0,
      "eh_administrador": true
    }
  ],
  "administradores": [ ... ],
  "objeto_social": "Descricao",
  "prazo_duracao": "INDETERMINADO"
}
```

---

#### 1️⃣1️⃣ **CNDT** (Certidão Negativa de Débitos Trabalhistas)
- **Slug:** `cndt`
- **Prompt:** Extrai dados de CNDT brasileiras
- **Regras:** Usa EXATAMENTE os termos do documento, valida status
- **Output:** Reescrita + Explicação (5 parágrafos) + JSON
- **Dados principais:** nome_pessoa, cpf, status (NAO CONSTA/CONSTA), resultado (NEGATIVA/POSITIVA), validade

```json
{
  "tipo_certidao": "CNDT",
  "orgao_emissor": "PODER JUDICIARIO - JUSTICA DO TRABALHO",
  "nome_pessoa": "NOME COMPLETO",
  "cpf": "000.000.000-00",
  "tipo_pessoa": "pessoa_fisica",
  "numero_certidao": "00000000/0000",
  "data_emissao": "DD/MM/AAAA",
  "data_validade": "DD/MM/AAAA",
  "prazo_validade_dias": 180,
  "status": "NAO CONSTA",
  "resultado_certidao": "NEGATIVA",
  "situacao_regular": true,
  "base_legal": {
    "artigos_clt": ["642-A", "883-A"],
    "leis": ["Lei 12.440/2011"]
  },
  "url_verificacao": "http://www.tst.jus.br"
}
```

---

## 4. CARREGAMENTO DINÂMICO DE PROMPTS

### 4.1 Fluxo de Busca e Carregamento

```
1. Frontend chama useAgentRun().executeRun(agentSlug, files, instrucoes)
   ↓
2. Hook monta FormData com:
   - agent_slug (ex: 'rg')
   - instrucoes_customizadas (opcional)
   - documentos[] (Files)
   ↓
3. Chama Edge Function: POST /agentes-especialistas/run
   ↓
4. Edge Function executa:
   a) Autenticação: getUser(supabase)
   b) Busca prompt ativo: supabase.rpc('get_active_specialist_prompt', {p_agent_slug})
   c) Valida que prompt existe (error 404 se não)
   d) Extrai: system_prompt, versao, nome_exibicao
   ↓
5. Se instrucoes_customizadas fornecidas:
   buildFullPrompt(system_prompt, instrucoes_customizadas)
   ↓
6. Resultado: prompt_completo com até 3 seções:
   - Instruções base (do banco)
   - Divisor "---"
   - Instruções adicionais do usuário (se houver)
```

### 4.2 Função SQL: `get_active_specialist_prompt`

**Arquivo:** `supabase/migrations/20260201000001_create_agentes_especialistas_schema.sql` (linhas 248-274)

```sql
CREATE OR REPLACE FUNCTION public.get_active_specialist_prompt(p_agent_slug text)
RETURNS TABLE (
  id uuid,
  agent_slug text,
  versao integer,
  system_prompt text,
  nome_exibicao text,
  descricao text,
  categoria text
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    id, agent_slug, versao, system_prompt,
    nome_exibicao, descricao, categoria
  FROM public.agentes_especialistas_prompts
  WHERE agent_slug = p_agent_slug
    AND ativo = true
  LIMIT 1;
$$;
```

**Garantias:**
- ✓ Retorna apenas prompt ATIVO
- ✓ Uma única versão ativa por agent_slug (unique index)
- ✓ Falha se agente não existe (Edge Function retorna 404)

### 4.3 Implementação na Edge Function

**Arquivo:** `supabase/functions/agentes-especialistas/index.ts` (linhas 217-235)

```typescript
// Get active prompt for agent
console.log('[handleRun] Getting prompt for agent:', agentSlug);
const { data: promptData, error: promptError } = await supabase
  .rpc('get_active_specialist_prompt', { p_agent_slug: agentSlug })
  .single();

if (promptError || !promptData) {
  console.error('[handleRun] Prompt error:', promptError);
  return new Response(
    JSON.stringify({
      error: `Prompt nao encontrado para agente: ${agentSlug}.
              Verifique se o agente existe no banco de dados.`
    }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
console.log('[handleRun] Prompt found:', promptData.nome_exibicao);

const activePrompt = promptData as ActivePrompt;
```

### 4.4 Construção do Prompt Final

**Arquivo:** `supabase/functions/agentes-especialistas/index.ts` (linhas 105-121 e 374-375)

```typescript
/**
 * Build full prompt with user instructions
 */
function buildFullPrompt(basePrompt: string, userInstructions?: string): string {
  if (!userInstructions || userInstructions.trim() === '') {
    return basePrompt;  // Usa prompt base se sem instruções
  }

  return `${basePrompt}

---

## INSTRUCOES ADICIONAIS DO USUARIO

${userInstructions.trim()}

---

IMPORTANTE: Aplique as instrucoes adicionais do usuario ao analisar este documento,
mas mantenha o formato de saida especificado acima.`;
}

// ...

// Build full prompt
const fullPrompt = buildFullPrompt(activePrompt.system_prompt, instrucoesCustomizadas ?? undefined);
```

---

## 5. FLUXO COMPLETO DE EXECUÇÃO

### 5.1 Diagrama de Sequência

```
Usuário                Frontend              Edge Function          Banco de Dados
   │                     │                        │                      │
   │ 1. Upload files     │                        │                      │
   ├────────────────────>│                        │                      │
   │                     │ 2. POST /run           │                      │
   │                     │ (FormData: slug, docs) │                      │
   │                     ├───────────────────────>│                      │
   │                     │                        │ 3. Autenticação      │
   │                     │                        ├─────────────────────>│
   │                     │                        │<─────────────────────┤
   │                     │                        │ 4. Busca prompt      │
   │                     │                        ├─────────────────────>│
   │                     │                        │<─ prompt ativo ──────┤
   │                     │                        │ 5. Upload files      │
   │                     │                        ├─────────────────────>│
   │                     │                        │<─ storage_paths ─────┤
   │                     │                        │ 6. Cria run record   │
   │                     │                        ├─────────────────────>│
   │                     │                        │<─ run_id ────────────┤
   │                     │                        │ 7. Chama Gemini      │
   │                     │                        │ (com documentos)     │
   │                     │                        ├──────────────────────────────>
   │                     │                        │<─────────────────────────────┤
   │                     │                        │        (output_texto)        │
   │                     │                        │ 8. Atualiza run              │
   │                     │                        │ (resultado + tokens)         │
   │                     │                        ├─────────────────────>│
   │                     │<─ RunResponse ─────────┤                      │
   │                     │ (run_id + output)      │                      │
   │<───── resultado ────┤                        │                      │
   │                     │                        │                      │
```

### 5.2 Step-by-Step Detalhado

#### PASSO 1: Preparação Frontend

**Arquivo:** `src/pages/AgenteExtrator.tsx` (linhas 59-64)

```typescript
const handleAnalyze = useCallback(async () => {
  if (!canAnalyze || !agente) return;

  const files = arquivos.map((a) => a.file);  // Extrai File objects
  await agent.executeRun(agente.slug, files, instrucoes);  // Chama hook
}, [canAnalyze, agente, arquivos, instrucoes, agent]);
```

#### PASSO 2: Hook prepara FormData

**Arquivo:** `src/hooks/useAgentRun.ts` (linhas 79-117)

```typescript
const executeRun = useCallback(
  async (agentSlug: string, arquivos: File[], instrucoes?: string) => {
    // Validar
    if (arquivos.length === 0) { /* error */ }

    setState({ ...initialState, status: 'analyzing' });

    try {
      // Criar FormData
      const formData = new FormData();
      formData.append('agent_slug', agentSlug);

      if (instrucoes?.trim()) {
        formData.append('instrucoes_customizadas', instrucoes.trim());
      }

      // Adicionar arquivos
      arquivos.forEach((file) => {
        formData.append('documentos', file);
      });

      // Chamar Edge Function
      const { data, error } = await supabase.functions.invoke<RunResponse>(
        'agentes-especialistas/run',
        { body: formData }
      );

      // Tratar resultado...
    }
  },
  []
);
```

#### PASSO 3: Edge Function - Autenticação e Busca Prompt

**Arquivo:** `supabase/functions/agentes-especialistas/index.ts` (linhas 194-235)

```typescript
async function handleRun(req: Request): Promise<Response> {
  const supabase = createSupabaseClient(req);
  const serviceClient = createServiceClient();

  try {
    // 1. Autenticar
    const user = await getUser(supabase);
    console.log('[handleRun] User authenticated:', user.id);

    // 2. Parse FormData
    const formData = await req.formData();
    const agentSlug = formData.get('agent_slug') as string;
    const instrucoesCustomizadas = formData.get('instrucoes_customizadas') as string | null;

    if (!agentSlug) {
      return new Response(JSON.stringify({ error: 'agent_slug is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. BUSCAR PROMPT ATIVO (DINÂMICO!)
    const { data: promptData, error: promptError } = await supabase
      .rpc('get_active_specialist_prompt', { p_agent_slug: agentSlug })
      .single();

    if (promptError || !promptData) {
      console.error('[handleRun] Prompt error:', promptError);
      return new Response(
        JSON.stringify({
          error: `Prompt nao encontrado para agente: ${agentSlug}`
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    const activePrompt = promptData as ActivePrompt;
    console.log('[handleRun] Prompt found:', activePrompt.nome_exibicao);

    // ... continua ...
  }
}
```

#### PASSO 4: Upload de Documentos para Storage

**Arquivo:** `supabase/functions/agentes-especialistas/index.ts` (linhas 240-315)

```typescript
// Process uploaded files
const files = formData.getAll('documentos') as File[];

const documentsMetadata: DocumentMetadata[] = [];
const rawFiles: Array<{ buffer: ArrayBuffer; name: string; mimeType: string }> = [];

for (const file of files) {
  // Validar tamanho (max 20MB)
  if (file.size > MAX_FILE_SIZE) {
    return new Response(
      JSON.stringify({ error: `Arquivo excede 20MB` }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Validar MIME type
  if (!isMimeTypeSupported(file.type)) {
    return new Response(
      JSON.stringify({ error: `Tipo de arquivo não suportado` }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Ler arquivo
  const arrayBuffer = await file.arrayBuffer();

  // Storage path: {user_id}/{run_id}/{filename}
  const storagePath = `${user.id}/${runId}/${file.name}`;

  // Upload para Storage (service client)
  const { error: uploadError } = await serviceClient.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return new Response(
      JSON.stringify({ error: `Falha ao fazer upload de ${file.name}` }),
      { status: 500, headers: corsHeaders }
    );
  }

  // Salvar metadados
  documentsMetadata.push({
    nome: file.name,
    storage_path: storagePath,
    mime_type: file.type,
    tamanho_bytes: file.size,
  });

  rawFiles.push({ buffer: arrayBuffer, name: file.name, mimeType: file.type });
}
```

#### PASSO 5: Normalização de Arquivos para Gemini

**Arquivo:** `supabase/functions/agentes-especialistas/index.ts` (linhas 317-348)

```typescript
// Normalize files for Gemini (converts DOCX to HTML, etc)
let normalizationResult;
try {
  normalizationResult = await normalizeFilesForGemini(rawFiles);
} catch (normalizeError) {
  console.error('Normalization error:', normalizeError);
  return new Response(
    JSON.stringify({
      error: normalizeError instanceof Error
        ? normalizeError.message
        : 'Erro ao processar arquivos'
    }),
    { status: 400, headers: corsHeaders }
  );
}

// Log conversion warnings
if (normalizationResult.warnings.length > 0) {
  console.log('File normalization warnings:', normalizationResult.warnings);
}

// Prepare documents for Gemini (convert to base64)
const documentsForGemini: Array<{ base64: string; mimeType: string }> = [];
for (const normalizedFile of normalizationResult.files) {
  documentsForGemini.push({
    base64: arrayBufferToBase64(normalizedFile.content),
    mimeType: normalizedFile.mimeType,
  });
}
```

#### PASSO 6: Criar Registro de Run com Status "processing"

**Arquivo:** `supabase/functions/agentes-especialistas/index.ts` (linhas 350-372)

```typescript
// Create run record with 'processing' status
const { error: insertError } = await serviceClient
  .from('agentes_especialistas_runs')
  .insert({
    id: runId,
    user_id: user.id,
    agent_slug: agentSlug,
    agent_nome: activePrompt.nome_exibicao,  // "Extrator de RG", etc
    documentos: documentsMetadata,            // [{nome, storage_path, ...}]
    instrucoes_customizadas: instrucoesCustomizadas,
    prompt_versao: activePrompt.versao,       // 1
    prompt_usado: activePrompt.system_prompt, // SNAPSHOT completo do prompt!
    status: 'processing',
    started_at: new Date().toISOString(),
  });

if (insertError) {
  console.error('Insert error:', insertError);
  return new Response(JSON.stringify({ error: 'Failed to create run record' }), {
    status: 500,
    headers: corsHeaders
  });
}
```

**O que foi salvo:**
- ✓ `prompt_versao`: Número da versão (para versionamento)
- ✓ `prompt_usado`: SNAPSHOT completo do prompt (para reprodutibilidade)
- ✓ `documentos`: Metadados com storage paths (para reconstruir a run)
- ✓ `instrucoes_customizadas`: Instruções extras do usuário

#### PASSO 7: Chamar Gemini API com Prompt Dinâmico + Documentos

**Arquivo:** `supabase/functions/agentes-especialistas/index.ts` (linhas 374-406)

```typescript
// Build full prompt (base + user instructions)
const fullPrompt = buildFullPrompt(activePrompt.system_prompt, instrucoesCustomizadas ?? undefined);

// Call Gemini
let geminiResult: { text: string; inputTokens: number; outputTokens: number };
const startTime = Date.now();

try {
  geminiResult = await callGeminiWithDocuments(fullPrompt, documentsForGemini);
} catch (geminiError) {
  // Update run with error status
  await serviceClient
    .from('agentes_especialistas_runs')
    .update({
      status: 'error',
      erro_mensagem: geminiError instanceof Error ? geminiError.message : 'Unknown Gemini error',
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    })
    .eq('id', runId);

  return new Response(
    JSON.stringify({
      run_id: runId,
      status: 'error',
      error: geminiError instanceof Error ? geminiError.message : 'Gemini processing failed',
    } as RunResponse),
    { status: 500, headers: corsHeaders }
  );
}
```

**O que acontece em `callGeminiWithDocuments`:**

```typescript
async function callGeminiWithDocuments(
  prompt: string,
  documents: Array<{ base64: string; mimeType: string }>
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  // Build parts array: [doc1, doc2, ..., prompt_text]
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  // Add all documents (as inline data)
  for (const doc of documents) {
    parts.push({
      inlineData: {
        mimeType: doc.mimeType,
        data: doc.base64,
      },
    });
  }

  // Add prompt as text
  parts.push({ text: prompt });

  // Call Gemini API
  const request = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,           // Baixo temperature = determinístico
      maxOutputTokens: 16384,     // Máximo permitido
    },
  };

  const response = await fetch(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }
  );

  const data = await response.json();

  return {
    text: data.candidates[0].content.parts[0].text,
    inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
  };
}
```

#### PASSO 8: Salvar Resultado na Run

**Arquivo:** `supabase/functions/agentes-especialistas/index.ts` (linhas 407-423)

```typescript
const durationMs = Date.now() - startTime;
const costEstimate = estimateCost(geminiResult.inputTokens, geminiResult.outputTokens);

// Update run with success
await serviceClient
  .from('agentes_especialistas_runs')
  .update({
    status: 'completed',
    output_texto: geminiResult.text,           // Markdown com 3 seções
    input_tokens: geminiResult.inputTokens,
    output_tokens: geminiResult.outputTokens,
    cost_estimate: costEstimate,               // USD
    completed_at: new Date().toISOString(),
    duration_ms: durationMs,                   // Milisegundos
  })
  .eq('id', runId);

// Return success response to client
const response: RunResponse = {
  run_id: runId,
  status: 'completed',
  output_texto: geminiResult.text,
  input_tokens: geminiResult.inputTokens,
  output_tokens: geminiResult.outputTokens,
  duration_ms: durationMs,
};

return new Response(JSON.stringify(response), {
  status: 200,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});
```

#### PASSO 9: Frontend Recebe Resultado

**Arquivo:** `src/hooks/useAgentRun.ts` (linhas 162-181)

```typescript
// Tratar erro retornado pela função
if (!data || data.error || data.status === 'error') {
  setState({
    ...initialState,
    status: 'error',
    error: data?.error || 'Erro desconhecido ao processar documento',
  });
  return;
}

// Sucesso
setState({
  status: 'completed',
  resultado: data.output_texto || '',
  error: null,
  runId: data.run_id,
  inputTokens: data.input_tokens || 0,
  outputTokens: data.output_tokens || 0,
  durationMs: data.duration_ms || 0,
});
```

---

## 6. PROCESSAMENTO E EXIBIÇÃO DE OUTPUTS

### 6.1 Formato de Saída do Gemini

Cada agente retorna um resultado estruturado em **3 seções** (Markdown):

```markdown
## REESCRITA DO DOCUMENTO
[Transcrição literal do documento]

## EXPLICACAO CONTEXTUAL
[3-5 parágrafos descrevendo o documento]

## DADOS CATALOGADOS (JSON)
```json
{
  "tipo_documento": "RG",
  "nome_completo": "...",
  ...
}
```
```

### 6.2 Componente ResultadoAnalise

**Arquivo:** `src/components/agentes/ResultadoAnalise.tsx`

Este componente:

1. **Extrai JSON da resposta:**
   ```typescript
   function extractJsonFromContent(conteudo: string): Record<string, unknown> | null {
     const jsonBlockRegex = /```json\s*([\s\S]*?)```/;
     const match = conteudo.match(jsonBlockRegex);
     if (match && match[1]) {
       return JSON.parse(match[1].trim());
     }
     return null;
   }
   ```

2. **Converte JSON em campos estruturados:**
   ```typescript
   function jsonToCampos(
     json: Record<string, unknown>,
     parentSection: string = 'DADOS GERAIS'
   ): CampoDados[] {
     // Ignora: tipo_documento, tipo_certidao, pessoa_relacionada, qualidade_imagem, confianca_extracao
     // Cria seções para: filiacao, habilitacao, elementos_presentes, imovel, valores, etc
     // Retorna array de CampoDados com label, value, section
   }
   ```

3. **Formata valores para exibição:**
   ```typescript
   function formatValue(value: unknown): string {
     if (value === null || value === undefined) return '-';
     if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
     if (typeof value === 'number') return value.toLocaleString('pt-BR');
     if (Array.isArray(value)) return value.length === 0 ? '-' : value.join(', ');
     return String(value);
   }
   ```

4. **Exibe resultado com 4 abas:**
   - **Reescrita**: Texto original do documento
   - **Explicação**: Contextualização em prosa
   - **Dados**: Campos estruturados em FormSection
   - **JSON**: Código JSON puro

### 6.3 Exportação de Resultados

**Arquivo:** `src/pages/AgenteExtrator.tsx` (linhas 86-109)

```typescript
// Handler para copiar resultado
const handleCopy = useCallback(async () => {
  try {
    const cleanContent = filterJsonSection(resultado);  // Remove bloco JSON
    await copyToClipboard(cleanContent);
    toast.success('Copiado para a área de transferência');
  } catch {
    toast.error('Erro ao copiar');
  }
}, [resultado]);

// Handler para exportar DOCX
const handleDownloadDocx = useCallback(async () => {
  if (!agente) return;
  try {
    const cleanContent = filterJsonSection(resultado);
    await exportToDocx(cleanContent, `${agente.slug}-extracao`);
    toast.success('Documento exportado com sucesso');
  } catch {
    toast.error('Erro ao exportar documento');
  }
}, [resultado, agente]);

// Handler para exportar PDF
const handleDownloadPdf = useCallback(async () => {
  if (!agente) return;
  try {
    const cleanContent = filterJsonSection(resultado);
    await exportToPdf(cleanContent, `${agente.slug}-extracao`);
    toast.success('PDF gerado com sucesso');
  } catch {
    toast.error('Erro ao gerar PDF');
  }
}, [resultado, agente]);
```

---

## 7. HISTÓRICO DE EXECUÇÕES

### 7.1 Endpoints de Histórico

#### GET /history - Lista runs do usuário

**Arquivo:** `supabase/functions/agentes-especialistas/index.ts` (linhas 468-530)

```typescript
async function handleHistory(req: Request): Promise<Response> {
  const supabase = createSupabaseClient(req);

  try {
    const user = await getUser(supabase);

    // Parse query params
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);
    const offset = parseInt(url.searchParams.get('offset') ?? '0', 10);
    const agentSlug = url.searchParams.get('agent_slug');

    // Get history using helper function
    const { data, error } = await supabase.rpc('get_specialist_runs_history', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
      p_agent_slug: agentSlug,  // Filtro opcional
    });

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch history' }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Get total count
    let query = supabase
      .from('agentes_especialistas_runs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (agentSlug) {
      query = query.eq('agent_slug', agentSlug);
    }

    const { count } = await query;

    const response: HistoryResponse = {
      runs: data ?? [],
      total: count ?? 0,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    // ... error handling ...
  }
}
```

**Retorna:**
```json
{
  "runs": [
    {
      "id": "uuid",
      "agent_slug": "rg",
      "agent_nome": "Extrator de RG",
      "documentos": [{"nome": "doc.pdf", "storage_path": "...", "mime_type": "application/pdf", "tamanho_bytes": 1024000}],
      "status": "completed",
      "output_texto": "## REESCRITA...",
      "input_tokens": 2500,
      "output_tokens": 1200,
      "duration_ms": 3450,
      "created_at": "2024-02-01T10:30:00Z"
    }
  ],
  "total": 45
}
```

#### GET /run/:id - Detalhes de uma run específica

```typescript
async function handleRunDetail(req: Request, runId: string): Promise<Response> {
  const supabase = createSupabaseClient(req);

  try {
    const user = await getUser(supabase);

    // Get run detail (RLS ensures user can only see their own)
    const { data, error } = await supabase
      .from('agentes_especialistas_runs')
      .select('*')
      .eq('id', runId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Run not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify(data as RunDetailResponse), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    // ... error handling ...
  }
}
```

**Retorna:** Todos os dados da run incluindo `prompt_usado` (snapshot completo!)

---

### 7.2 Componente ExecutionHistoryAgentes

**Arquivo:** `src/components/agentes/ExecutionHistoryAgentes.tsx`

Exibe histórico com:
- Lista paginada de runs
- Filtro por agente
- Status visual (completed, error, processing)
- Botão para abrir detalhes em modal
- Duração, tokens, custo estimado

---

## 8. SEGURANÇA E ISOLAMENTO

### 8.1 Row Level Security (RLS)

```sql
-- Prompts: todos usuários autenticados podem LER
CREATE POLICY "agentes_especialistas_prompts_select_authenticated"
  ON agentes_especialistas_prompts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Runs: usuários só acessam suas próprias runs
CREATE POLICY "agentes_especialistas_runs_select_own"
  ON agentes_especialistas_runs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agentes_especialistas_runs_insert_own"
  ON agentes_especialistas_runs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agentes_especialistas_runs_update_own"
  ON agentes_especialistas_runs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "agentes_especialistas_runs_delete_own"
  ON agentes_especialistas_runs
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 8.2 Storage Policies

```sql
-- Storage path structure: {user_id}/{run_id}/{filename}
CREATE POLICY "agentes_especialistas_docs_insert_own"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'agentes-especialistas-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "agentes_especialistas_docs_select_own"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'agentes-especialistas-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 8.3 Isolamento do Sistema

- ✓ **Totalmente independente** do pipeline de minutas
- ✓ **Sem FK references** para tabelas de documentos/minutas
- ✓ **Usuário-cêntrico**: tudo baseado em user_id
- ✓ **Histórico completo**: snapshots de prompts para auditoria
- ✓ **Sem compartilhamento** de dados entre usuários (RLS)

---

## 9. VERSIONAMENTO E REPRODUTIBILIDADE

### 9.1 Snapshots de Prompts

Cada run salva:
- `prompt_versao`: Número da versão usada
- `prompt_usado`: Snapshot **completo** do prompt no momento da execução

Isso permite:
1. **Reproduzir** uma run (mesmo prompt = mesmos resultados)
2. **Comparar** resultados entre versões
3. **Fazer rollback** de prompts ruins
4. **Auditar** que prompt foi usado em cada análise

### 9.2 Exemplo: Mudança de Prompt

```sql
-- Versão 1 (atual)
INSERT INTO agentes_especialistas_prompts (agent_slug, versao, system_prompt, ativo)
VALUES ('rg', 1, 'Prompt v1...', TRUE);

-- Depois, se quiser melhorar:
UPDATE agentes_especialistas_prompts
SET ativo = FALSE
WHERE agent_slug = 'rg' AND versao = 1;

INSERT INTO agentes_especialistas_prompts (agent_slug, versao, system_prompt, ativo)
VALUES ('rg', 2, 'Prompt v2 melhorado...', TRUE);

-- Agora:
-- - Runs antigas continuam com snapshots de v1
-- - Runs novas usam v2
-- - Possível comparar resultados
```

---

## 10. MÉTRICAS E MONITORAMENTO

### 10.1 Dados Coletados por Run

```typescript
{
  id: UUID,                           // ID único da run
  user_id: UUID,                      // Quem executou
  agent_slug: 'rg',                   // Qual agente
  started_at: '2024-02-01T10:00:00Z',
  completed_at: '2024-02-01T10:00:03.450Z',
  duration_ms: 3450,                  // Tempo total

  input_tokens: 2500,                 // Tokens do prompt + docs
  output_tokens: 1200,                // Tokens da resposta
  cost_estimate: 0.000375,            // USD estimado

  modelo: 'gemini-3-flash-preview',
  prompt_versao: 1,
  status: 'completed',

  documentos: [                        // Quais arquivos foram analisados
    {
      nome: 'documento.pdf',
      storage_path: 'user_id/run_id/documento.pdf',
      mime_type: 'application/pdf',
      tamanho_bytes: 512000
    }
  ]
}
```

### 10.2 Cálculo de Custo

**Arquivo:** `supabase/functions/agentes-especialistas/index.ts` (linhas 186-190)

```typescript
/**
 * Estimate cost based on token usage
 * Gemini 3.0 Flash: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
 */
function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 0.075;
  const outputCost = (outputTokens / 1_000_000) * 0.30;
  return inputCost + outputCost;
}
```

**Exemplo:**
```
Input: 2500 tokens × ($0.075 / 1M) = $0.0001875
Output: 1200 tokens × ($0.30 / 1M) = $0.00036
Total: $0.0005475 ≈ $0.00055 por análise
```

---

## 11. TIPOS TYPESCRIPT

### 11.1 Types Principales

**Arquivo:** `src/types/agente.ts`

```typescript
export type AgenteCategoria = 'pessoais' | 'imobiliarios' | 'empresariais';

export interface AgenteConfig {
  id: string;
  slug: string;                  // 'rg', 'cnh', etc
  nome: string;                  // 'Extrator de RG'
  descricao: string;             // Descrição breve
  categoria: AgenteCategoria;
  icone: string;                 // Lucide icon name
  imagemUrl?: string;
  promptBase?: string;           // Não usado (no BD)
}

export interface ArquivoUpload {
  id: string;
  file: File;
  nome: string;
  tamanho: number;
  tipo: string;
  preview?: string;
}

export type AnaliseStatus = 'idle' | 'analyzing' | 'completed' | 'error';

export interface AnaliseState {
  status: AnaliseStatus;
  resultado: string;
  erro?: string;
}
```

**Arquivo:** `supabase/functions/agentes-especialistas/types.ts`

```typescript
export type RunStatus =
  | 'pending'
  | 'processing'
  | 'streaming'
  | 'completed'
  | 'stopped'
  | 'error';

export interface DocumentMetadata {
  nome: string;
  storage_path: string;
  mime_type: string;
  tamanho_bytes: number;
}

export interface RunResponse {
  run_id: string;
  status: RunStatus;
  output_texto?: string;
  output_thinking?: string;
  error?: string;
  input_tokens?: number;
  output_tokens?: number;
  duration_ms?: number;
}

export interface RunDetailResponse {
  id: string;
  user_id: string;
  agent_slug: string;
  agent_nome: string;
  documentos: DocumentMetadata[];
  instrucoes_customizadas: string | null;
  prompt_versao: number;           // Versão do prompt USADO
  prompt_usado: string;            // SNAPSHOT do prompt
  modelo: string;
  output_texto: string | null;
  output_thinking: string | null;
  status: RunStatus;
  erro_mensagem: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  thinking_duration_ms: number | null;
  cost_estimate: number | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface ActivePrompt {
  id: string;
  agent_slug: string;
  versao: number;
  system_prompt: string;
  nome_exibicao: string;
  descricao: string | null;
  categoria: string;
}
```

---

## 12. ROTAS PRINCIPAIS

### 12.1 Edge Function Routes

**URL base:** `https://<project>.supabase.co/functions/v1/agentes-especialistas`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/run` | Inicia nova run (upload + análise) |
| GET | `/history` | Lista runs do usuário (paginado) |
| GET | `/history?agent_slug=rg&limit=10&offset=0` | Filtra por agente |
| GET | `/agents` | Lista todos os agentes disponíveis |
| GET | `/run/:id` | Detalhes de uma run específica |
| GET | `/run/:id/document/:filename` | Download de documento processado |

### 12.2 Frontend Routes

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/agentes` | `DashboardAgentes.tsx` | Dashboard com catálogo de agentes |
| `/agentes/:tipo` | `AgenteExtrator.tsx` | Página de análise (upload + resultado) |

---

## 13. FLUXO FINAL DE DADOS

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO FOCA NO DOCUMENTO                                    │
│    - Seleciona agente (ex: "Extrator de RG")                   │
│    - Upload de arquivo(s) (PDF, PNG, DOCX)                     │
│    - Opcionalmente: instruções customizadas                    │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 2. FRONTEND PREPARA DADOS                                       │
│    - useAgentRun().executeRun('rg', [files], instrucoes)      │
│    - FormData: agent_slug + files + instrucoes               │
│    - Estado: 'analyzing'                                       │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 3. EDGE FUNCTION EXECUTA                                        │
│    ├─ POST /agentes-especialistas/run                          │
│    ├─ Autenticação: getUser()                                 │
│    ├─ Busca prompt DINÂMICO: get_active_specialist_prompt()  │
│    ├─ Valida: agent_slug existe? prompt ativo?               │
│    ├─ Upload docs: storage/agentes-especialistas-docs/        │
│    ├─ Cria run: agentes_especialistas_runs (status=processing)│
│    ├─ Normaliza arquivos: DOCX->HTML, etc                    │
│    ├─ Chama Gemini API: POST /generateContent                │
│    │   - Prompt (com instruções customizadas)                 │
│    │   - Documentos (base64)                                   │
│    ├─ Recebe: output_texto (Markdown 3 seções)               │
│    ├─ Atualiza run: output_texto, tokens, status=completed   │
│    └─ Retorna: RunResponse com output_texto                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 4. FRONTEND PROCESSA RESULTADO                                  │
│    ├─ setState: { status: 'completed', resultado, tokens }    │
│    ├─ ResultadoAnalise exibe:                                 │
│    │   ├─ Abas: Reescrita, Explicação, Dados, JSON           │
│    │   ├─ Extrai JSON estruturado                             │
│    │   ├─ Converte em campos formulário                       │
│    │   └─ Formata valores (pt-BR)                             │
│    └─ Buttons: Copiar, Exportar DOCX, Exportar PDF           │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│ 5. USUÁRIO INTERAGE COM RESULTADO                               │
│    ├─ Visualiza dados extraídos                               │
│    ├─ Copia conteúdo                                          │
│    ├─ Exporta DOCX/PDF                                        │
│    ├─ Visualiza histórico (GET /history)                      │
│    └─ Executa nova análise ou agente diferente               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BANCO DE DADOS                                                  │
│ ├─ agentes_especialistas_prompts                               │
│ │   └─ agent_slug='rg', versao=1, system_prompt='...', ativo  │
│ │   └─ agent_slug='cnh', versao=1, system_prompt='...', ativo │
│ │   └─ ... (11 agentes total)                                 │
│ │                                                              │
│ ├─ agentes_especialistas_runs                                  │
│ │   └─ id=uuid, user_id=uuid, agent_slug='rg'                │
│ │   └─ prompt_versao=1, prompt_usado='...'  (SNAPSHOT!)     │
│ │   └─ documentos=[{nome, storage_path, ...}]               │
│ │   └─ output_texto='## REESCRITA\n...'                     │
│ │   └─ input_tokens=2500, output_tokens=1200               │
│ │   └─ cost_estimate=0.000375, duration_ms=3450            │
│ │   └─ status='completed', created_at='...'                │
│ │                                                              │
│ └─ storage.buckets[agentes-especialistas-docs]                │
│    └─ {user_id}/{run_id}/documento.pdf                        │
│    └─ {user_id}/{run_id}/imagem.png                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 14. RESUMO TÉCNICO

| Aspecto | Detalhes |
|---------|----------|
| **Arquitetura** | Frontend (React) → Edge Function → Gemini API → Supabase DB |
| **Prompts** | 11 especializados, versionados, armazenados em BD, carregados dinamicamente |
| **Isolamento** | Completamente separado do pipeline de minutas, user-centric com RLS |
| **Segurança** | RLS em tabelas e storage, snapshots para auditoria |
| **Escalabilidade** | Paginação de histórico, indexes otimizados, cost tracking |
| **Reprodutibilidade** | Snapshots de prompts, metadados completos, timestamps precisos |
| **Extensibilidade** | Fácil adicionar novos agentes (inserir prompt no BD) |
| **Monitoramento** | Duração, tokens, custo estimado por run |

---

## CONCLUSÃO

O sistema de **Agentes Especialistas** é um exemplo de arquitetura moderna para IA:

✓ **Dinâmico**: Prompts no banco, não hardcoded
✓ **Versionado**: Snapshots para cada execução
✓ **Auditável**: Histórico completo de todos os dados
✓ **Seguro**: RLS em todos os níveis
✓ **Escalável**: Paginação, índices, cost tracking
✓ **Isolado**: Sem dependências do pipeline principal
✓ **Extensível**: Fácil adicionar novos agentes

---

**Data da análise:** 2024-02-02
**Versão:** 1.0
**Autores:** Agentes Especialistas System
