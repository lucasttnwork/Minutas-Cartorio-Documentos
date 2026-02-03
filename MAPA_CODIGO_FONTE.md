# Mapa de Código-Fonte: Edge Functions

**Referência cruzada entre código e documentação**

---

## Arquivos Compartilhados (_shared/)

### cors.ts
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```
**Usado por**: Todas as functions
**Referência**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 1)

---

### gemini-client.ts
**Funções principais**:
```typescript
export function arrayBufferToBase64(buffer: ArrayBuffer): string
export async function callGemini(
  prompt: string,
  imageBase64?: string,
  imageMimeType?: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<{ text: string; usage: { inputTokens; outputTokens } }>
export function parseGeminiJson<T>(text: string): T
```

**Detalhes**:
- Integração completa com Google Gemini 2.0 Flash
- Tratamento robusto de JSON com cleanup
- Encode seguro de arquivos grandes

**Referência**:
- INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 2)
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Exemplos)
- ARQUITETURA_EDGE_FUNCTIONS.md (Seção 4.1)

---

### prompts.ts
**Exports principais**:
```typescript
export const CLASSIFICATION_PROMPT = `Você é um especialista...` // Hardcoded

export async function loadExtractionPrompt(
  tipoDocumento: string,
  fileSize?: number
): Promise<string>
```

**Estratégia**:
1. Classification: Embarcado em código
2. Extraction: Dinâmico do BD (agent_prompts table)
3. Fallback: GENERIC se tipo não encontrado

**Banco de Dados**:
- Tabela: `agent_prompts`
- Colunas: tipo_documento, prompt_text, versao, ativo
- Query: SELECT prompt_text WHERE tipo_documento = ? AND ativo = true ORDER BY versao DESC

**Referência**:
- INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 3)
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 4)

---

### supabase-client.ts
```typescript
export function createSupabaseClient(req: Request) // Com JWT do usuário
export function createServiceClient()              // Service role (admin)
```

**Uso**:
- `createSupabaseClient`: Verificar JWT, aplicar RLS
- `createServiceClient`: Operações privilegiadas, bypass RLS

**Referência**: ARQUITETURA_EDGE_FUNCTIONS.md (Seção 6)

---

### execution-logger.ts
**Funções principais**:
```typescript
export async function startExecution(supabase, agentType, options): Promise<ExecutionLog>
export async function logSuccess(supabase, execution, result, usage?)
export async function logError(supabase, execution, error)
export async function finishExecution(supabase, execution, result)
```

**Tabela**: `agent_executions`
**Campos rastreados**:
- agent_type, status, started_at, completed_at, duration_ms
- input_tokens, output_tokens, cost_estimate
- prompt_used, result, error_message

**Pricing Gemini 1.5 Flash**:
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens

**Referência**:
- INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 5)
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 6)

---

### file-normalizer.ts
```typescript
export interface NormalizedFile {
  content: ArrayBuffer;
  mimeType: string;
  originalName: string;
  originalMimeType: string;
  wasConverted: boolean;
  conversionWarnings?: string[];
}

export async function normalizeFilesForGemini(
  files: InputFile[]
): Promise<NormalizationResult>
```

**Conversões**:
- PDF → Passa direto (native)
- JPEG/PNG/WebP/etc → Passa direto
- DOCX → Converte para HTML (Mammoth.js)
- Outro → Rejeita com erro 400

**Usado por**: agentes-especialistas/index.ts

**Referência**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 6)

---

### types.ts
**Tipos principais**:
```typescript
export type DocumentType = 'RG' | 'CNH' | 'CPF' | ... | 'DESCONHECIDO'

export interface ClassificationResult {
  tipo_documento: DocumentType;
  confianca: 'Alta' | 'Media' | 'Baixa';
  pessoa_relacionada: string | null;
  observacao: string;
}

export interface ExtractionResult {
  dados_estruturados: Record<string, unknown>;
  explicacao_contextual: string;
  campos_extraidos: string[];
  campos_faltantes: string[];
}

export interface MappedFields {
  alienantes: PessoaNatural[];
  adquirentes: PessoaNatural[];
  anuentes: PessoaNatural[];
  imovel: Imovel;
  negocio: NegocioJuridico;
  alertas_juridicos: AlertaJuridico[];
  metadata: MappingMetadata;
}
```

**Referência**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 7)

---

### templates.ts
**Conteúdo**: Templates de minutas (qualificações, estrutura)

**Interfaces**:
```typescript
export interface Endereco { ... }
export interface PessoaQualificacao { ... }
export interface ImovelMinuta { ... }
export interface Pagamento { ... }
```

**Usado por**: generate-minuta/index.ts

**Referência**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 4.4)

---

### qualification-generator.ts
**Função**: Gerar seções de qualificação notarial

**Exemplo de saída**:
```
**JOÃO SILVA**, brasileiro, casado, comerciante...
```

**Usado por**: generate-minuta/qualification-builder.ts

---

## Agents (Pipeline Sequencial)

### classify-document/index.ts
**Fluxo**:
1. Parse request: `{ documento_id }`
2. Fetch documento from BD
3. Download arquivo do storage
4. Base64 encode
5. Call Gemini(CLASSIFICATION_PROMPT, image)
6. Parse JSON response
7. Update documentos { tipo_documento, classificacao_confianca, ... }
8. Log execution

**Input**:
```json
{
  "documento_id": "uuid"
}
```

**Output**:
```json
{
  "success": true,
  "result": {
    "tipo_documento": "CNH",
    "confianca": "Alta",
    "pessoa_relacionada": "JOÃO SILVA",
    "observacao": "CNH de SP"
  }
}
```

**Prompt**: CLASSIFICATION_PROMPT (hardcoded em prompts.ts)

**BD Updated**:
- Table: documentos
- Fields: tipo_documento, classificacao_confianca, pessoa_relacionada, status

**Referência**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 4.1)

---

### extract-document/index.ts
**Fluxo**:
1. Parse request: `{ documento_id }`
2. Validate documento was classified
3. Load prompt via loadExtractionPrompt(tipo_documento, fileSize)
4. Download arquivo
5. Base64 encode
6. Call Gemini(prompt, image)
7. Parse JSON response
8. Update documentos { dados_extraidos, status: 'extraido' }
9. Log execution

**Input**:
```json
{
  "documento_id": "uuid"
}
```

**Output**:
```json
{
  "success": true,
  "result": {
    "numero": "123456789",
    "cpf": "12345678900",
    "data_nascimento": "1990-05-15",
    ...
  }
}
```

**Prompt**: Dinâmico de agent_prompts BD

**BD Updated**:
- Table: documentos
- Fields: dados_extraidos (JSONB), status: 'extraido'

**Referência**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 4.2)

---

### map-to-fields/index.ts
**Fluxo**:
1. Parse request: `{ minuta_id }`
2. Fetch all documentos with status='extraido'
3. Sort by priority (RG > CNH > MATRICULA > ...)
4. For each documento:
   - Map tipo_documento → PessoaNatural/Imovel/NegocioJuridico
   - Deduplicate por CPF (merge sources)
   - Upsert em tabelas estruturadas
5. Log execution

**Input**:
```json
{
  "minuta_id": "uuid"
}
```

**Output**:
```json
{
  "success": true,
  "result": {
    "alienantes": [...],
    "adquirentes": [...],
    "imovel": {...},
    "negocio": {...}
  }
}
```

**Determinístico**: Sem chamadas a Gemini

**BD Updated**:
- Table: pessoas_naturais (with dedup by CPF)
- Table: imoveis
- Table: negocios_juridicos
- Field: fontes (JSON tracking sources)

**Componentes**:
- persistence.ts: upsert com dedup
- normalizers.ts: parsers para valores

**Referência**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 4.3)

---

### generate-minuta/index.ts
**Fluxo**:
1. Parse request: `{ minuta_id, template_type }`
2. Aggregate data via data-aggregator.ts
3. Load template from BD
4. Build prompt = basePrompt + template + dados
5. Call Gemini(prompt)
6. Parse response
7. Update minutas { minuta_texto, status }
8. Log execution

**Input**:
```json
{
  "minuta_id": "uuid",
  "template_type": "VENDA_COMPRA"
}
```

**Output**:
```json
{
  "success": true,
  "result": {
    "minuta_texto": "Pela presente escritura pública...",
    "template_usado": "VENDA_COMPRA",
    ...
  }
}
```

**Componentes**:
- data-aggregator.ts: Coleta e formata dados
- qualification-builder.ts: Seções notariais

**BD Updated**:
- Table: minutas
- Field: minuta_texto

**Referência**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 4.4)

---

### generate-minuta/data-aggregator.ts
**Função**: Agregar dados de tabelas estruturadas para LLM

**Interfaces**:
```typescript
export interface MinutaCompleta {
  minuta: MinutaBasica;
  outorgantes: PessoaCompleta[];
  outorgados: PessoaCompleta[];
  imoveis: ImovelCompleto[];
  negocio: NegocioJuridicoCompleto | null;
  certidoes: Certidao[];
}
```

**Formatação Brasileira**:
```typescript
export function formatDateBrazilian(dateStr: string): string
export function formatCurrency(value: number): string
export function formatCPF(cpf: string): string
```

**Exemplo saída**:
```
Data: 02 de fevereiro de 2026
CPF: 123.456.789-00
Valor: R$ 1.500.000,00
```

---

### generate-minuta/qualification-builder.ts
**Função**: Construir seções notariais formatadas

```typescript
export function buildOutorgantesSection(outorgantes: Pessoa[])
export function buildOutorgadosSection(outorgados: Pessoa[])
export function buildImoveisSection(imoveis: Imovel[])
export function buildNegocioSection(negocio: NegocioJuridico)
```

**Exemplo seção**:
```
### OUTORGANTES (Vendedores)

**JOÃO SILVA**, brasileiro, casado pelo regime da comunhão
universal de bens, comerciante, RG n. 123456789-X/SP,
CPF n. 123.456.789-00, domiciliado...
```

---

## Agent Dinâmico

### agentes-especialistas/index.ts
**Endpoints**:

#### POST /run
**Fluxo**:
1. Parse FormData: agent_slug, documentos, instrucoes_customizadas
2. Validate agent_slug
3. Fetch prompt ativo via RPC get_active_specialist_prompt()
4. Validate + upload arquivos
5. Normalize (DOCX → HTML)
6. Create run record { status: 'processing' }
7. Build prompt = basePrompt + userInstructions
8. Call Gemini
9. Update run { status: 'completed', output_texto, tokens }
10. Return response

**Input**:
```
FormData:
- agent_slug: "analista-contrato"
- instrucoes_customizadas: "Foque em cláusulas penais"
- documentos: [file1.docx, file2.pdf]
```

**Output**:
```json
{
  "run_id": "uuid",
  "status": "completed",
  "output_texto": "## ANÁLISE...",
  "input_tokens": 8234,
  "output_tokens": 2156,
  "duration_ms": 4200
}
```

**Storage**: agentes-especialistas-docs bucket
**DB**: agentes_especialistas_runs table

#### GET /history
Query: ?limit=20&offset=0&agent_slug=...
Returns: { runs: [...], total: N }

#### GET /run/:id
Returns: Complete run details

#### GET /agents
Returns: { agents: [...] }

#### GET /run/:id/document/:filename
Returns: { download_url, filename, mime_type, size_bytes }

**RPC Functions usadas**:
- get_active_specialist_prompt(p_agent_slug)
- get_specialist_runs_history(p_user_id, p_limit, p_offset, p_agent_slug)
- list_specialist_agents()

**Referência**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 4.5)

---

### agentes-especialistas/types.ts
```typescript
export type RunStatus = 'pending' | 'processing' | 'streaming' | 'completed' | 'stopped' | 'error'

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
  error?: string;
  input_tokens?: number;
  output_tokens?: number;
  duration_ms?: number;
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

## Bootstrap (Desenvolvimento Local)

### bootstrap-admin/index.ts
**Função**: Criar usuário admin para desenvolvimento local

**Verificações**:
- Apenas executa em localhost/127.0.0.1
- Verifica se admin já existe

**Credenciais padrão**:
```
Email: admin@minutas.local
Password: admin123456
```

---

## Banco de Dados - Tabelas Principais

### documentos
```sql
id UUID PRIMARY KEY
minuta_id UUID -> minutas
nome_original VARCHAR
storage_path VARCHAR
mime_type VARCHAR
tipo_documento VARCHAR (de VALID_DOCUMENT_TYPES)
classificacao_confianca VARCHAR
pessoa_relacionada VARCHAR
dados_extraidos JSONB
tamanho_bytes INTEGER
status VARCHAR ('pendente', 'classificando', 'classificado', 'extraindo', 'extraido', 'erro')
created_at TIMESTAMP
```

### minutas
```sql
id UUID PRIMARY KEY
user_id UUID
titulo VARCHAR
tipo_ato VARCHAR
data_lavratura DATE
minuta_texto TEXT
status VARCHAR
created_at TIMESTAMP
```

### pessoas_naturais
```sql
id UUID PRIMARY KEY
minuta_id UUID -> minutas
cpf VARCHAR (normalized, UNIQUE per minuta)
nome VARCHAR
rg VARCHAR
data_nascimento DATE
nacionalidade VARCHAR
endereco_* (logradouro, numero, cidade, estado, cep)
papel VARCHAR ('outorgante', 'outorgado', 'anuente')
fontes JSONB { campo: [fonte1, fonte2] }
created_at TIMESTAMP
```

### imoveis
```sql
id UUID PRIMARY KEY
minuta_id UUID
matricula_numero VARCHAR
matricula_cartorio VARCHAR
endereco_* (completo)
area_total VARCHAR
area_privativa VARCHAR
valor_venal VARCHAR
fontes JSONB
created_at TIMESTAMP
```

### negocios_juridicos
```sql
id UUID PRIMARY KEY
minuta_id UUID
imovel_id UUID
tipo VARCHAR
valor DECIMAL
forma_pagamento VARCHAR
data_contrato DATE
fontes JSONB
created_at TIMESTAMP
```

### agent_executions
```sql
id UUID PRIMARY KEY
minuta_id UUID (nullable)
documento_id UUID (nullable)
agent_type VARCHAR ('classify', 'extract', 'map', 'generate')
status VARCHAR ('running', 'success', 'error')
prompt_used TEXT
input_tokens INTEGER
output_tokens INTEGER
cost_estimate DECIMAL
started_at TIMESTAMP
completed_at TIMESTAMP
duration_ms INTEGER
error_message TEXT
result JSONB
created_at TIMESTAMP
```

### agent_prompts
```sql
id UUID PRIMARY KEY
tipo_documento VARCHAR
prompt_text TEXT
versao INTEGER
ativo BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

### specialist_agents
```sql
agent_slug VARCHAR PRIMARY KEY
nome_exibicao VARCHAR
descricao TEXT
categoria VARCHAR
ativo BOOLEAN
```

### specialist_prompts
```sql
id UUID PRIMARY KEY
agent_slug VARCHAR -> specialist_agents
system_prompt TEXT
versao INTEGER
ativo BOOLEAN
created_at TIMESTAMP
```

### agentes_especialistas_runs
```sql
id UUID PRIMARY KEY
user_id UUID
agent_slug VARCHAR
agent_nome VARCHAR
documentos JSONB [{ nome, storage_path, mime_type, tamanho_bytes }]
instrucoes_customizadas TEXT
status VARCHAR
prompt_versao INTEGER
prompt_usado TEXT
output_texto TEXT
input_tokens INTEGER
output_tokens INTEGER
cost_estimate DECIMAL
erro_mensagem TEXT
started_at TIMESTAMP
completed_at TIMESTAMP
duration_ms INTEGER
created_at TIMESTAMP
```

---

## Referência Cruzada Rápida

### Para encontrar informação sobre...

**Como classificar documento**
→ classify-document/index.ts + INVESTIGACAO (4.1)

**Como extrair dados**
→ extract-document/index.ts + INVESTIGACAO (4.2)

**Como carregar prompts dinamicamente**
→ prompts.ts + GUIA_PRATICO (Seção 4)

**Como mapear dados para BD**
→ map-to-fields/index.ts + INVESTIGACAO (4.3)

**Como gerar minuta**
→ generate-minuta/index.ts + INVESTIGACAO (4.4)

**Como usar agentes especialistas**
→ agentes-especialistas/index.ts + GUIA_PRATICO (Seção 3)

**Como rastrear custos**
→ execution-logger.ts + GUIA_PRATICO (Seção 6)

**Como normalizar arquivos**
→ file-normalizer.ts + INVESTIGACAO (Seção 6)

**Como autenticar**
→ supabase-client.ts + ARQUITETURA (Seção 6)

**Como tratar erros**
→ Cada index.ts + GUIA_PRATICO (Seção 5)

---

**Mapa Completo Criado**
**Data**: 2026-02-02
