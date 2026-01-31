# Plano de Integração Backend - Minutas Cartório

## Visão Geral

Este documento descreve o plano de integração do backend usando Supabase para o sistema de criação de minutas cartoriais, integrando os agentes de IA existentes com o novo frontend.

---

## 1. Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Upload    │  │  Conferência│  │   Agentes   │  │   Minuta Final      │ │
│  │  Documentos │  │    Dados    │  │  Extratores │  │   (Rich Editor)     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼────────────┘
          │                │                │                    │
          ▼                ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE LAYER                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Storage   │  │  Database   │  │    Edge     │  │   Realtime          │ │
│  │  (Buckets)  │  │ (PostgreSQL)│  │  Functions  │  │   (Subscriptions)   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼────────────┘
          │                │                │                    │
          ▼                ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI PROCESSING LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                    Edge Functions (Deno)                                 ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  ││
│  │  │  Classifier  │  │  Extractor   │  │   Mapper     │  │  Generator  │  ││
│  │  │   (Gemini)   │  │   (Gemini)   │  │  (Fields)    │  │  (Minuta)   │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Setup Local do Supabase

### 2.1 Pré-requisitos
- Docker Desktop instalado e rodando
- Node.js 18+
- Supabase CLI

### 2.2 Instalação do Supabase CLI
```bash
# Via npm (recomendado para Windows)
npm install -g supabase

# Verificar instalação
supabase --version
```

### 2.3 Inicialização do Projeto
```bash
# Na pasta raiz do Frontend
cd Frontend

# Inicializar Supabase
supabase init

# Estrutura criada:
# supabase/
# ├── config.toml        # Configurações locais
# ├── migrations/        # Migrações do banco
# ├── functions/         # Edge Functions
# └── seed.sql           # Dados iniciais
```

### 2.4 Iniciar Serviços Locais
```bash
# Iniciar todos os serviços (Postgres, Auth, Storage, Studio, etc.)
supabase start

# Output esperado:
# API URL: http://localhost:54321
# GraphQL URL: http://localhost:54321/graphql/v1
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.5 Comandos Úteis
```bash
# Parar serviços
supabase stop

# Resetar banco (reaplicar migrations)
supabase db reset

# Aplicar novas migrations
supabase migration up

# Ver status
supabase status

# Gerar tipos TypeScript
supabase gen types typescript --local > src/types/database.types.ts
```

---

## 3. Schema do Banco de Dados

### 3.1 Diagrama ER Simplificado

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    minutas      │     │   documentos    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (uuid) PK    │────<│ id (uuid) PK    │────<│ id (uuid) PK    │
│ email           │     │ user_id FK      │     │ minuta_id FK    │
│ created_at      │     │ titulo          │     │ tipo            │
└─────────────────┘     │ status          │     │ arquivo_path    │
                        │ step_atual      │     │ classificacao   │
                        │ created_at      │     │ confianca       │
                        │ updated_at      │     │ extracao_json   │
                        └────────┬────────┘     │ status          │
                                 │              └─────────────────┘
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│pessoas_naturais │     │pessoas_juridicas│     │     imoveis     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (uuid) PK    │     │ id (uuid) PK    │     │ id (uuid) PK    │
│ minuta_id FK    │     │ minuta_id FK    │     │ minuta_id FK    │
│ papel (enum)    │     │ papel (enum)    │     │ matricula       │
│ nome            │     │ razao_social    │     │ descricao       │
│ cpf             │     │ cnpj            │     │ endereco_json   │
│ dados_json      │     │ dados_json      │     │ valores_json    │
│ fontes_json     │     │ fontes_json     │     │ onus_json       │
└─────────────────┘     └─────────────────┘     │ fontes_json     │
                                                └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│negocios_juridicos│    │ agent_executions│     │  agent_prompts  │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (uuid) PK    │     │ id (uuid) PK    │     │ id (uuid) PK    │
│ minuta_id FK    │     │ minuta_id FK    │     │ tipo_documento  │
│ tipo            │     │ documento_id FK │     │ versao          │
│ valores_json    │     │ agent_type      │     │ prompt_text     │
│ partes_json     │     │ input_json      │     │ is_active       │
│ pagamento_json  │     │ output_json     │     │ created_at      │
│ fontes_json     │     │ tokens_used     │     └─────────────────┘
└─────────────────┘     │ cost_usd        │
                        │ duration_ms     │
                        │ status          │
                        │ error_message   │
                        │ created_at      │
                        └─────────────────┘
```

### 3.2 Tabelas Principais

#### 3.2.1 minutas
Armazena os metadados principais de cada minuta.

```sql
CREATE TABLE minutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'processando', 'conferencia', 'concluida')),
  step_atual TEXT NOT NULL DEFAULT 'upload' CHECK (step_atual IN ('upload', 'processando', 'outorgantes', 'outorgados', 'imoveis', 'parecer', 'negocio', 'minuta')),
  minuta_texto TEXT, -- HTML do documento final
  parecer_json JSONB,
  alertas_json JSONB, -- Alertas jurídicos gerados
  metadata_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_minutas_user_id ON minutas(user_id);
CREATE INDEX idx_minutas_status ON minutas(status);

-- RLS
ALTER TABLE minutas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own minutas"
  ON minutas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own minutas"
  ON minutas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own minutas"
  ON minutas FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 3.2.2 documentos
Armazena informações sobre documentos uploaded e processados.

```sql
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minuta_id UUID REFERENCES minutas(id) ON DELETE CASCADE,

  -- Arquivo
  nome_original TEXT NOT NULL,
  arquivo_path TEXT NOT NULL, -- Path no Storage
  tamanho_bytes INTEGER,
  mime_type TEXT,
  categoria TEXT CHECK (categoria IN ('outorgantes', 'outorgados', 'imoveis', 'negocio', 'outros')),

  -- Classificação (Phase 1)
  tipo_documento TEXT, -- RG, CNH, MATRICULA_IMOVEL, etc.
  confianca_classificacao DECIMAL(3,2),
  classificacao_manual BOOLEAN DEFAULT FALSE,

  -- Extração (Phase 3)
  extracao_json JSONB, -- Dados extraídos estruturados
  reescrita_text TEXT, -- Transcrição do documento
  explicacao_contextual TEXT,

  -- Status
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'classificando', 'classificado', 'extraindo', 'extraido', 'erro')),
  erro_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_documentos_minuta_id ON documentos(minuta_id);
CREATE INDEX idx_documentos_tipo ON documentos(tipo_documento);
CREATE INDEX idx_documentos_status ON documentos(status);

-- RLS via minuta
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage documents of own minutas"
  ON documentos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM minutas
      WHERE minutas.id = documentos.minuta_id
      AND minutas.user_id = auth.uid()
    )
  );
```

#### 3.2.3 pessoas_naturais
```sql
CREATE TABLE pessoas_naturais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minuta_id UUID REFERENCES minutas(id) ON DELETE CASCADE,

  -- Papel na transação
  papel TEXT NOT NULL CHECK (papel IN ('outorgante', 'outorgado', 'anuente', 'representante', 'procurador')),
  pessoa_juridica_id UUID REFERENCES pessoas_juridicas(id), -- Se for representante/procurador

  -- Dados pessoais
  nome TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  orgao_emissor TEXT,
  data_nascimento DATE,
  nacionalidade TEXT,
  profissao TEXT,

  -- Dados familiares
  estado_civil TEXT,
  regime_bens TEXT,
  dados_conjuge_json JSONB,

  -- Contato e endereço
  endereco_json JSONB,
  contato_json JSONB,

  -- Certidões
  cndt_json JSONB,
  certidao_uniao_json JSONB,

  -- Campos editados pelo usuário
  campos_editados TEXT[], -- Array de nomes de campos editados manualmente

  -- Rastreabilidade
  fontes_json JSONB, -- De qual documento cada campo foi extraído

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pessoas_naturais_minuta_id ON pessoas_naturais(minuta_id);
CREATE INDEX idx_pessoas_naturais_papel ON pessoas_naturais(papel);
CREATE INDEX idx_pessoas_naturais_cpf ON pessoas_naturais(cpf);

-- RLS
ALTER TABLE pessoas_naturais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage pessoas of own minutas"
  ON pessoas_naturais FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM minutas
      WHERE minutas.id = pessoas_naturais.minuta_id
      AND minutas.user_id = auth.uid()
    )
  );
```

#### 3.2.4 agent_executions (Rastreamento de IA)
```sql
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minuta_id UUID REFERENCES minutas(id) ON DELETE CASCADE,
  documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,

  -- Tipo de agente
  agent_type TEXT NOT NULL CHECK (agent_type IN (
    'classifier', 'extractor', 'mapper', 'generator',
    'rg_extractor', 'cnh_extractor', 'matricula_extractor',
    'escritura_extractor', 'certidao_extractor', 'generic_extractor'
  )),

  -- Input/Output
  input_json JSONB,
  output_json JSONB,
  prompt_used TEXT,
  prompt_version TEXT,

  -- Métricas
  model_used TEXT, -- gemini-2.5-flash, gpt-4, etc.
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd DECIMAL(10,6),
  duration_ms INTEGER,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  error_stack TEXT,

  -- Retry info
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_agent_executions_minuta_id ON agent_executions(minuta_id);
CREATE INDEX idx_agent_executions_documento_id ON agent_executions(documento_id);
CREATE INDEX idx_agent_executions_agent_type ON agent_executions(agent_type);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_created_at ON agent_executions(created_at);

-- RLS
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agent executions of own minutas"
  ON agent_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM minutas
      WHERE minutas.id = agent_executions.minuta_id
      AND minutas.user_id = auth.uid()
    )
  );
```

#### 3.2.5 agent_prompts (Versionamento de Prompts)
```sql
CREATE TABLE agent_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  tipo_documento TEXT NOT NULL, -- RG, CNH, MATRICULA_IMOVEL, etc.
  versao TEXT NOT NULL, -- v1, v2, v3, compact

  prompt_text TEXT NOT NULL,
  descricao TEXT,

  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,

  -- Métricas de qualidade
  total_executions INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  avg_duration_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tipo_documento, versao)
);

-- Índice
CREATE INDEX idx_agent_prompts_tipo ON agent_prompts(tipo_documento);
CREATE INDEX idx_agent_prompts_active ON agent_prompts(is_active, is_default);
```

---

## 4. Storage Buckets

### 4.1 Estrutura de Buckets

```
supabase-storage/
├── documentos/                    # Documentos originais
│   └── {minuta_id}/
│       ├── outorgantes/
│       ├── outorgados/
│       ├── imoveis/
│       ├── negocio/
│       └── outros/
│
├── extractions/                   # JSONs de extração
│   └── {minuta_id}/
│       └── {documento_id}.json
│
└── minutas-finais/               # Documentos gerados
    └── {minuta_id}/
        ├── minuta.docx
        └── minuta.pdf
```

### 4.2 Configuração de Buckets

```sql
-- Criar buckets via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documentos', 'documentos', false),
  ('extractions', 'extractions', false),
  ('minutas-finais', 'minutas-finais', false);

-- Políticas de acesso
CREATE POLICY "Users can upload to own minuta folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documentos' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM minutas WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own minuta files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id IN ('documentos', 'extractions', 'minutas-finais') AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM minutas WHERE user_id = auth.uid()
    )
  );
```

---

## 5. Edge Functions (Agentes de IA)

### 5.1 Estrutura de Functions

```
supabase/functions/
├── classify-document/           # Classificação visual com Gemini
│   └── index.ts
├── extract-document/            # Extração contextual
│   └── index.ts
├── map-to-fields/              # Consolidação de dados
│   └── index.ts
├── generate-minuta/            # Geração do documento final
│   └── index.ts
└── _shared/                    # Código compartilhado
    ├── gemini-client.ts
    ├── prompts/
    │   ├── rg.ts
    │   ├── cnh.ts
    │   ├── matricula.ts
    │   └── ...
    └── schemas/
        └── ...
```

### 5.2 Exemplo: classify-document

```typescript
// supabase/functions/classify-document/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documento_id } = await req.json()

    // Inicializar clientes
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Buscar documento
    const { data: documento } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', documento_id)
      .single()

    // Baixar arquivo do Storage
    const { data: fileData } = await supabase.storage
      .from('documentos')
      .download(documento.arquivo_path)

    // Classificar com Gemini
    const startTime = Date.now()
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: documento.mime_type,
          data: await fileToBase64(fileData)
        }
      },
      CLASSIFICATION_PROMPT
    ])
    const duration = Date.now() - startTime

    const classification = JSON.parse(result.response.text())

    // Registrar execução do agente
    await supabase.from('agent_executions').insert({
      minuta_id: documento.minuta_id,
      documento_id: documento_id,
      agent_type: 'classifier',
      input_json: { documento_id },
      output_json: classification,
      model_used: 'gemini-2.5-flash',
      tokens_input: result.usageMetadata?.promptTokenCount,
      tokens_output: result.usageMetadata?.candidatesTokenCount,
      duration_ms: duration,
      status: 'completed'
    })

    // Atualizar documento
    await supabase
      .from('documentos')
      .update({
        tipo_documento: classification.tipo,
        confianca_classificacao: classification.confianca,
        status: 'classificado'
      })
      .eq('id', documento_id)

    return new Response(
      JSON.stringify({ success: true, classification }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 5.3 Desenvolvimento Local de Functions

```bash
# Criar nova function
supabase functions new classify-document

# Servir localmente (com hot reload)
supabase functions serve --env-file ./supabase/.env.local

# Testar function
curl -i --location --request POST 'http://localhost:54321/functions/v1/classify-document' \
  --header 'Authorization: Bearer eyJhbG...' \
  --header 'Content-Type: application/json' \
  --data '{"documento_id": "uuid-here"}'

# Deploy para produção
supabase functions deploy classify-document
```

---

## 6. Integração Frontend

### 6.1 Cliente Supabase

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 6.2 Hooks de Dados

```typescript
// src/hooks/useMinutaSupabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMinuta(id: string) {
  return useQuery({
    queryKey: ['minuta', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('minutas')
        .select(`
          *,
          documentos(*),
          pessoas_naturais(*),
          pessoas_juridicas(*),
          imoveis(*),
          negocios_juridicos(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    }
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ minutaId, file, categoria }: UploadParams) => {
      // 1. Upload para Storage
      const path = `${minutaId}/${categoria}/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(path, file)

      if (uploadError) throw uploadError

      // 2. Criar registro no banco
      const { data, error } = await supabase
        .from('documentos')
        .insert({
          minuta_id: minutaId,
          nome_original: file.name,
          arquivo_path: path,
          tamanho_bytes: file.size,
          mime_type: file.type,
          categoria,
          status: 'uploaded'
        })
        .select()
        .single()

      if (error) throw error

      // 3. Invocar classificação
      await supabase.functions.invoke('classify-document', {
        body: { documento_id: data.id }
      })

      return data
    },
    onSuccess: (_, { minutaId }) => {
      queryClient.invalidateQueries({ queryKey: ['minuta', minutaId] })
    }
  })
}
```

### 6.3 Realtime Subscriptions

```typescript
// src/hooks/useDocumentProcessing.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useDocumentProcessing(minutaId: string) {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    // Buscar documentos iniciais
    const fetchDocuments = async () => {
      const { data } = await supabase
        .from('documentos')
        .select('*')
        .eq('minuta_id', minutaId)

      setDocuments(data || [])
    }

    fetchDocuments()

    // Subscrever a atualizações em tempo real
    const channel = supabase
      .channel(`documents-${minutaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documentos',
          filter: `minuta_id=eq.${minutaId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDocuments(prev => [...prev, payload.new as Document])
          } else if (payload.eventType === 'UPDATE') {
            setDocuments(prev =>
              prev.map(doc =>
                doc.id === payload.new.id ? payload.new as Document : doc
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [minutaId])

  return documents
}
```

---

## 7. Fluxo de Processamento

### 7.1 Pipeline Completo

```
1. UPLOAD
   └─> Storage: documentos/{minuta_id}/{categoria}/{arquivo}
   └─> DB: documentos (status: 'uploaded')

2. CLASSIFICAÇÃO (Edge Function: classify-document)
   └─> Gemini: Análise visual do documento
   └─> DB: documentos (tipo_documento, confianca, status: 'classificado')
   └─> DB: agent_executions (log da execução)

3. EXTRAÇÃO (Edge Function: extract-document)
   └─> Gemini: Extração contextual com prompt específico
   └─> DB: documentos (extracao_json, reescrita_text, status: 'extraido')
   └─> DB: agent_executions (log)

4. MAPEAMENTO (Edge Function: map-to-fields)
   └─> Consolidação de todas as extrações
   └─> Resolução de conflitos por prioridade
   └─> DB: pessoas_naturais, pessoas_juridicas, imoveis, negocios_juridicos
   └─> DB: minutas (alertas_json)

5. CONFERÊNCIA (Frontend)
   └─> Usuário valida/edita dados extraídos
   └─> DB: atualizações com campos_editados

6. GERAÇÃO (Edge Function: generate-minuta)
   └─> Compilação do documento final
   └─> Storage: minutas-finais/{minuta_id}/minuta.docx
   └─> DB: minutas (minuta_texto, status: 'concluida')
```

---

## 8. Migração dos Scripts Existentes

### 8.1 Mapeamento Python → Edge Functions

| Script Python | Edge Function | Notas |
|--------------|---------------|-------|
| `classify_with_gemini.py` | `classify-document` | Adaptar para processar 1 doc por vez |
| `extract_with_gemini.py` | `extract-document` | Carregar prompts do banco |
| `map_to_fields.py` | `map-to-fields` | Lógica de priorização mantida |
| `prompt_loader.py` | `_shared/prompts/` | Prompts versionados no banco |

### 8.2 Prompts a Migrar

Os 22 prompts em `backend-reference/execution/prompts/` devem ser:
1. Importados para a tabela `agent_prompts`
2. Versionados (v1, v2, v3 quando existir)
3. Marcados como `is_active` e `is_default`

### 8.3 Schemas a Migrar

Os 15 schemas em `backend-reference/execution/schemas/` servem como referência para:
1. Validação de saída das Edge Functions
2. Tipagem TypeScript gerada

---

## 9. Variáveis de Ambiente

### 9.1 Local (.env.local)
```env
# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Gemini AI
GEMINI_API_KEY=AIza...

# Desenvolvimento
NODE_ENV=development
```

### 9.2 Produção (Supabase Dashboard)
```env
# Secrets configurados no Dashboard
GEMINI_API_KEY=AIza...
```

---

## 10. Próximos Passos

### Fase 1: Setup Inicial
- [ ] Instalar Supabase CLI
- [ ] Inicializar projeto Supabase local
- [ ] Criar migrations do schema
- [ ] Configurar Storage buckets
- [ ] Gerar tipos TypeScript

### Fase 2: Edge Functions
- [ ] Criar função de classificação
- [ ] Criar função de extração
- [ ] Migrar prompts para o banco
- [ ] Testar pipeline localmente

### Fase 3: Integração Frontend
- [ ] Configurar cliente Supabase
- [ ] Criar hooks de dados
- [ ] Substituir localStorage por Supabase
- [ ] Implementar upload real
- [ ] Adicionar realtime subscriptions

### Fase 4: Refinamento
- [ ] Otimizar performance
- [ ] Adicionar retry logic
- [ ] Implementar rate limiting
- [ ] Testes de integração

---

## Referências

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Backend Reference](./execution/) - Scripts Python originais
- [Directives](./directives/) - SOPs do sistema

