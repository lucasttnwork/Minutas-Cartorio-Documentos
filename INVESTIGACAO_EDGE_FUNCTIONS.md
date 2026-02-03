# Investigação Completa: Edge Functions do Supabase

**Data**: 2026-02-02
**Localização**: `/supabase/functions/`

---

## Sumário Executivo

O projeto possui **7 Edge Functions** no Supabase organizadas em um pipeline de processamento de documentos/minutas. O pipeline segue a sequência:

1. **classify-document** → Classifica tipo do documento
2. **extract-document** → Extrai dados estruturados
3. **map-to-fields** → Mapeia dados para estrutura relacional
4. **generate-minuta** → Gera minuta em texto
5. **agentes-especialistas** → Nova função dinâmica para prompts customizados
6. bootstrap-admin → Utility para desenvolvimento local

Todas as funções usam **Gemini 2.0 Flash** como LLM principal, com integração direta via API REST do Gemini.

---

## 1. ESTRUTURA GERAL DAS FUNCTIONS

### Localização
```
supabase/functions/
├── _shared/                    # Código compartilhado
│   ├── cors.ts                # CORS headers
│   ├── types.ts               # Tipos TypeScript compartilhados
│   ├── gemini-client.ts       # Cliente Gemini API
│   ├── supabase-client.ts     # Clientes Supabase (user + service)
│   ├── prompts.ts             # Prompts (embarcados e dinâmicos)
│   ├── execution-logger.ts    # Logging de execuções
│   ├── file-normalizer.ts     # Normalização de arquivos
│   ├── templates.ts           # Templates de minutas
│   └── qualification-generator.ts
├── classify-document/          # Classifica documentos
├── extract-document/           # Extrai dados
├── map-to-fields/             # Mapeia para schema relacional
├── generate-minuta/           # Gera minuta de escritura
├── agentes-especialistas/     # Sistema dinâmico de agentes
└── bootstrap-admin/           # Setup desenvolvimento local
```

### Stack Tecnológico
- **Runtime**: Deno
- **LLM Principal**: Google Gemini 2.0 Flash
- **Cliente Supabase**: `@supabase/supabase-js@2`
- **HTTP Server**: `std@0.177.0/http/server.ts`
- **File Processing**: Mammoth.js (DOCX → HTML)
- **Base64 Encoding**: `std@0.177.0/encoding/base64.ts`

---

## 2. CLIENTE GEMINI - Configuração e Integração

### Arquivo
`supabase/functions/_shared/gemini-client.ts`

### Configuração Gemini
```typescript
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
```

### Função Principal
```typescript
async function callGemini(
  prompt: string,
  imageBase64?: string,
  imageMimeType?: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }>
```

### Parâmetros
- **prompt**: String com instruções em português
- **imageBase64**: Imagem codificada em base64 (opcional)
- **imageMimeType**: MIME type da imagem (ex: `image/jpeg`)
- **options.temperature**: Default = 0.1 (muito determinístico)
- **options.maxTokens**: Default = 16384

### Request Gemini
```json
{
  "contents": [{
    "parts": [
      { "inlineData": { "mimeType": "...", "data": "..." } },
      { "text": "..." }
    ]
  }],
  "generationConfig": {
    "temperature": 0.1,
    "maxOutputTokens": 16384
  }
}
```

### Tratamento de Resposta
- **Parsing JSON**: Função `parseGeminiJson()` com cleanup automático
  - Remove markdown code blocks (```json ... ```)
  - Corrige newlines e caracteres de controle
  - Remove BOM e invisibles
  - Trata erros comuns de escape

---

## 3. SISTEMA DE PROMPTS

### Arquivo
`supabase/functions/_shared/prompts.ts`

### Tipos de Prompts

#### A) Classification Prompt (HARDCODED)
```typescript
export const CLASSIFICATION_PROMPT = `Você é um especialista em documentos brasileiros...
[instrução completa em português]`
```

**Usado por**: `classify-document`
**Entrada**: Imagem do documento
**Saída esperada**: JSON com `tipo_documento`, `confianca`, `pessoa_relacionada`, `observacao`

#### B) Extraction Prompts (DINÂMICOS - BD)
```typescript
async function loadExtractionPrompt(
  tipoDocumento: string,
  fileSize?: number
): Promise<string>
```

**Estratégia**:
1. Procura `MATRICULA_IMOVEL_COMPACT` se arquivo > 2MB
2. Senão, procura versão normal do tipo
3. Fallback para `GENERIC` se tipo não encontrado

**Storage**: Tabela `agent_prompts` (Supabase)

**Campos**:
- `tipo_documento`: Tipo do documento (ex: "MATRICULA_IMOVEL")
- `prompt_text`: Texto completo do prompt
- `versao`: Número da versão
- `ativo`: Boolean para controle

#### C) Generation Prompts (DINÂMICOS - Construídos em Runtime)

Função `buildGenerationPrompt()` em `generate-minuta/index.ts`:

```typescript
function buildGenerationPrompt(
  data: MinutaCompleta,
  template: string,
  templateType: string
): string
```

**Construção**:
1. Template de referência (do banco)
2. Dados estruturados em seções (pessoas, imóveis, negócio)
3. Certidões disponíveis
4. Instruções específicas (formatação notarial)

---

## 4. ARQUITETURA DO PIPELINE

### 4.1 CLASSIFY-DOCUMENT

**Arquivo**: `supabase/functions/classify-document/index.ts`

**Propósito**: Identificar o tipo de documento a partir de uma imagem

**Fluxo**:
```
1. Recebe: documento_id
2. Busca documento no BD
3. Download arquivo do storage
4. Base64 encode
5. Chama Gemini com CLASSIFICATION_PROMPT
6. Parse JSON resposta
7. Salva classificação em "documentos" table
8. Log execução em "agent_executions"
```

**Parâmetros de Entrada**:
```json
{
  "documento_id": "uuid"
}
```

**Estrutura de Resposta (Gemini)**:
```json
{
  "tipo_documento": "RG|CNH|CPF|...|DESCONHECIDO",
  "confianca": "Alta|Media|Baixa",
  "pessoa_relacionada": "NOME OU NULL",
  "observacao": "Breve descrição",
  "tipo_sugerido": "...",           // Se DESCONHECIDO
  "descricao": "...",
  "categoria_recomendada": "...",
  "caracteristicas_identificadoras": ["..."],
  "campos_principais": ["..."]
}
```

**Atualização BD**:
```sql
UPDATE documentos
SET
  tipo_documento = result.tipo_documento,
  classificacao_confianca = result.confianca.toLowerCase(),
  pessoa_relacionada = result.pessoa_relacionada,
  status = 'classificado'
WHERE id = documento_id
```

**Token Usage Rastreado**: Sim (inputTokens, outputTokens)

---

### 4.2 EXTRACT-DOCUMENT

**Arquivo**: `supabase/functions/extract-document/index.ts`

**Propósito**: Extrair dados estruturados do documento classificado

**Fluxo**:
```
1. Recebe: documento_id
2. Valida se documento foi classificado
3. Carrega prompt dinâmico via loadExtractionPrompt()
4. Download documento
5. Base64 encode (com tratamento para arquivos grandes)
6. Chama Gemini
7. Parse JSON resposta → dados_extraidos
8. Salva em "documentos" table
```

**Parâmetros de Entrada**:
```json
{
  "documento_id": "uuid"
}
```

**Seleção de Prompt**:
- Usa `tipo_documento` do documento
- Se MATRICULA_IMOVEL e tamanho > 2MB: tenta MATRICULA_IMOVEL_COMPACT
- Fallback para GENERIC

**Saída (Armazenada)**:
```json
{
  "dados_extraidos": {
    // Estrutura varia por tipo de documento
    // Ex para RG: { rg: {...}, pessoa: {...} }
    // Ex para MATRICULA: { matricula: {...}, imovel: {...} }
  }
}
```

**Token Usage Rastreado**: Sim

---

### 4.3 MAP-TO-FIELDS

**Arquivo**: `supabase/functions/map-to-fields/index.ts`

**Propósito**: Mapear dados extraídos para schema relacional

**Características**:
- Função **DETERMINÍSTICA** (sem LLM)
- Processa múltiplos documentos
- Prioriza fontes confiáveis
- Deduplicação por CPF
- Rastreamento de fontes

**Fluxo**:
```
1. Recebe: minuta_id
2. Busca todos documentos "extraido"
3. Ordena por prioridade (RG > CNH > COMPROMISSO > MATRICULA > ...)
4. Mapeia cada tipo de documento:
   - RG/CNH → PessoaNatural
   - MATRICULA_IMOVEL → Imovel
   - COMPROMISSO_COMPRA_VENDA → NegocioJuridico
   - etc
5. Persiste em tabelas estruturadas:
   - pessoas_naturais
   - imoveis
   - negocios_juridicos
   - alertas_juridicos
```

**Parâmetros de Entrada**:
```json
{
  "minuta_id": "uuid"
}
```

**Prioridade de Documentos** (para resolução de conflito):
```typescript
const TYPE_PRIORITIES: Record<string, number> = {
  'RG': 100,
  'CERTIDAO_NASCIMENTO': 95,
  'CERTIDAO_CASAMENTO': 90,
  'CNH': 88,
  'COMPROMISSO_COMPRA_VENDA': 85,
  'MATRICULA_IMOVEL': 80,
  'CNDT': 75,
  'ITBI': 70,
  // ... outros com prioridades decrescentes
};
```

**Deduplicação**:
- Por CPF para pessoas naturais
- Merge de sources quando CPF já existe
- Arquivo `persistence.ts` implementa lógica

**Saída**:
```json
{
  "alienantes": [{ PessoaNatural }],
  "adquirentes": [{ PessoaNatural }],
  "anuentes": [{ PessoaNatural }],
  "imovel": { Imovel },
  "negocio": { NegocioJuridico },
  "alertas_juridicos": [{ AlertaJuridico }],
  "metadata": { MappingMetadata }
}
```

**Token Usage**: Não rastreado (determinístico)

---

### 4.4 GENERATE-MINUTA

**Arquivo**: `supabase/functions/generate-minuta/index.ts`

**Propósito**: Gerar minuta completa de escritura pública

**Componentes**:
- `data-aggregator.ts`: Coleta e formata dados do BD
- `qualification-builder.ts`: Constrói seções notariais
- `templates.ts`: Templates de minutas

**Fluxo**:
```
1. Recebe: minuta_id (e template_type opcional)
2. Agrega dados:
   - MinutaBasica
   - Outorgantes (com qualificação completa)
   - Outorgados
   - Imóveis
   - Negócio Jurídico
   - Certidões
3. Busca template do BD
4. Constrói prompt com:
   - Template de referência
   - Dados estruturados
   - Instruções notariais
5. Chama Gemini
6. Parse resposta
7. Salva minuta_texto em "minutas"
```

**Parâmetros de Entrada**:
```json
{
  "minuta_id": "uuid",
  "template_type": "VENDA_COMPRA"  // opcional
}
```

**Construção do Prompt**:
```
1. Cabeçalho: "Você é um especialista em minutas de escritura pública..."
2. Template de referência (completo)
3. Dados estruturados:
   - Outorgantes (seção formatada)
   - Outorgados (seção formatada)
   - Imóveis (seção formatada)
   - Negócio (seção formatada)
   - Certidões (lista)
4. Instruções:
   - Seguir template
   - Formatação notarial (nomes em negrito)
   - Preencher placeholders
```

**Formatting Brasileiro**:
- Datas: "DD de MMMM de YYYY"
- Currency: "R$ X.XXX,XX"
- CPF: "XXX.XXX.XXX-XX"
- CNPJ: "XX.XXX.XXX/XXXX-XX"

**Token Usage Rastreado**: Sim

---

### 4.5 AGENTES-ESPECIALISTAS

**Arquivo**: `supabase/functions/agentes-especialistas/index.ts`

**Propósito**: Sistema dinâmico para executar agentes customizados

**Arquitetura**:
- Prompts armazenados no BD com versionamento
- Suporta múltiplos documentos por run
- Histórico de execuções
- Normalizador de arquivos (DOCX → HTML)

**Endpoints**:

#### POST /run
Inicia nova execução do agente

**Parâmetros (FormData)**:
```
agent_slug: string           // ex: "analista-contrato"
instrucoes_customizadas?: string  // Instruções adicionais do usuário
documentos: File[]           // Um ou mais arquivos
```

**Fluxo**:
```
1. Valida agent_slug
2. Busca prompt ativo via RPC get_active_specialist_prompt()
3. Valida arquivos:
   - Size < 20MB
   - MIME type suportado
4. Upload para storage (agentes-especialistas-docs)
5. Normaliza arquivos (DOCX → HTML se necessário)
6. Cria run record com status "processing"
7. Constrói prompt completo (base + user instructions)
8. Chama Gemini com todos documentos
9. Atualiza run com resultado
10. Retorna resposta
```

**Construção do Prompt com Instruções Customizadas**:
```
${basePrompt}

---

## INSTRUCOES ADICIONAIS DO USUARIO

${userInstructions}

---

IMPORTANTE: Aplique as instrucoes do usuario, mas mantenha o formato especificado.
```

**Parâmetros Gemini**:
- temperature: 0.1
- maxOutputTokens: 16384
- Suporta até 20MB de documentos

**Tipos de Arquivo Suportados**:
- PDFs: `application/pdf`
- Imagens: JPEG, PNG, WebP, GIF, HEIC, HEIF, BMP
- Office: DOCX (convertido para HTML)
- Texto: TXT, MD, CSV, HTML

**Resposta POST /run**:
```json
{
  "run_id": "uuid",
  "status": "completed|error",
  "output_texto": "...",
  "input_tokens": 12345,
  "output_tokens": 5678,
  "duration_ms": 3000,
  "error": "..."  // se status = error
}
```

#### GET /history
Lista histórico de runs do usuário

**Query Params**:
- `limit`: 20 (default)
- `offset`: 0 (default)
- `agent_slug`: opcional (filtrar por agente)

**Resposta**:
```json
{
  "runs": [
    {
      "id": "uuid",
      "agent_slug": "...",
      "agent_nome": "...",
      "documentos": [...],
      "status": "completed|error",
      "output_texto": "...",
      "input_tokens": 12345,
      "duration_ms": 3000,
      "created_at": "2026-02-02T10:00:00Z"
    }
  ],
  "total": 42
}
```

#### GET /run/:id
Detalhes completos de uma run

**Resposta**:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "agent_slug": "...",
  "documentos": [
    {
      "nome": "contrato.pdf",
      "storage_path": "user_id/run_id/contrato.pdf",
      "mime_type": "application/pdf",
      "tamanho_bytes": 123456
    }
  ],
  "prompt_versao": 3,
  "prompt_usado": "...",
  "output_texto": "...",
  "status": "completed",
  "input_tokens": 12345,
  "output_tokens": 5678,
  "cost_estimate": 0.025,
  "duration_ms": 3000
}
```

#### GET /agents
Lista agentes disponíveis

**Resposta**:
```json
{
  "agents": [
    {
      "agent_slug": "analista-contrato",
      "nome_exibicao": "Analista de Contratos",
      "descricao": "Analisa contratos...",
      "categoria": "legal",
      "versao": 3
    }
  ]
}
```

#### GET /run/:id/document/:filename
Gera URL assinada para download do documento

**Resposta**:
```json
{
  "download_url": "https://...",
  "filename": "documento.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 123456
}
```

**Storage BD**:
- Tabela: `agentes_especialistas_runs`
- Estrutura completa de execução
- Documentos: JSON array com metadados
- Rastreamento de custos

**RPC Functions Usadas**:
- `get_active_specialist_prompt(p_agent_slug)` → ActivePrompt
- `get_specialist_runs_history(p_user_id, p_limit, p_offset, p_agent_slug)` → HistoryItem[]
- `list_specialist_agents()` → AgentListItem[]

---

## 5. SYSTEM DE LOGGING DE EXECUÇÃO

**Arquivo**: `supabase/functions/_shared/execution-logger.ts`

**Tabela**: `agent_executions`

**Campos Registrados**:
```typescript
interface ExecutionLog {
  agent_type: 'classify' | 'extract' | 'generate' | 'map';
  minuta_id?: string;
  documento_id?: string;
  prompt_used?: string;
  status: 'running' | 'success' | 'error';
  started_at: ISO8601;
  completed_at?: ISO8601;
  duration_ms?: number;
  result?: unknown;
  error_message?: string;
  input_tokens?: number;
  output_tokens?: number;
  cost_estimate?: number;
}
```

**Pricing** (Gemini 1.5 Flash):
```typescript
const COST_PER_1K_INPUT = 0.00025;   // $0.25 por 1M tokens
const COST_PER_1K_OUTPUT = 0.00125;  // $1.25 por 1M tokens

function calculateCost(inputTokens, outputTokens) {
  return (inputTokens / 1000) * 0.00025 +
         (outputTokens / 1000) * 0.00125;
}
```

**API**:
```typescript
// Iniciar logging
const execution = await startExecution(supabase, 'classify', {
  documentoId: 'xxx',
  minutaId: 'yyy',
  promptUsed: CLASSIFICATION_PROMPT
});

// Finalizar com sucesso
await logSuccess(supabase, execution, result, {
  inputTokens: 1234,
  outputTokens: 567
});

// Finalizar com erro
await logError(supabase, execution, error);
```

---

## 6. NORMALIZAÇÃO DE ARQUIVOS

**Arquivo**: `supabase/functions/_shared/file-normalizer.ts`

**Tipos Nativos do Gemini** (sem conversão):
- PDFs: `application/pdf` (até 50MB, 1000 páginas)
- Imagens: JPEG, PNG, WebP, GIF, HEIC, HEIF, BMP
- Texto: TXT, MD, HTML, CSV

**Conversões Automáticas**:
- **DOCX → HTML**: Usa Mammoth.js (`npm:mammoth@1.8.0`)
  - Extrai texto e formatação básica
  - Imagens embutidas podem não ser preservadas
  - Retorna warnings para problemas

**Estrutura de Resposta**:
```typescript
interface NormalizationResult {
  files: Array<{
    content: ArrayBuffer;
    mimeType: string;
    originalName: string;
    originalMimeType: string;
    wasConverted: boolean;
    conversionWarnings?: string[];
  }>;
  warnings: string[];
}
```

**Validação**:
- Tamanho máximo: 20MB (agentes-especialistas)
- MIME type deve estar em ALLOWED_MIME_TYPES

---

## 7. TIPOS COMPARTILHADOS

**Arquivo**: `supabase/functions/_shared/types.ts`

### DocumentType
```typescript
type DocumentType =
  'RG' | 'CNH' | 'CPF' | 'CERTIDAO_NASCIMENTO' | 'CERTIDAO_CASAMENTO' |
  'CERTIDAO_OBITO' | 'CNDT' | 'CND_FEDERAL' | 'CND_ESTADUAL' | 'CND_MUNICIPAL' |
  'CND_CONDOMINIO' | 'MATRICULA_IMOVEL' | 'ITBI' | 'VVR' | 'IPTU' |
  'DADOS_CADASTRAIS' | 'COMPROMISSO_COMPRA_VENDA' | 'ESCRITURA' | 'PROCURACAO' |
  'COMPROVANTE_RESIDENCIA' | 'COMPROVANTE_PAGAMENTO' | 'CONTRATO_SOCIAL' |
  'PROTOCOLO_ONR' | 'ASSINATURA_DIGITAL' | 'OUTRO' | 'ILEGIVEL' | 'DESCONHECIDO';
```

### ClassificationResult
```typescript
interface ClassificationResult {
  tipo_documento: DocumentType;
  confianca: 'Alta' | 'Media' | 'Baixa';
  pessoa_relacionada: string | null;
  observacao: string;
  tipo_sugerido?: string;
  descricao?: string;
  categoria_recomendada?: string;
  caracteristicas_identificadoras?: string[];
  campos_principais?: string[];
}
```

### ExtractionResult
```typescript
interface ExtractionResult {
  dados_estruturados: Record<string, unknown>;
  explicacao_contextual: string;
  campos_extraidos: string[];
  campos_faltantes: string[];
}
```

### MappedFields
```typescript
interface MappedFields {
  alienantes: PessoaNatural[];
  adquirentes: PessoaNatural[];
  anuentes: PessoaNatural[];
  imovel: Imovel;
  negocio: NegocioJuridico;
  alertas_juridicos: AlertaJuridico[];
  metadata: MappingMetadata;
}
```

---

## 8. AUTENTICAÇÃO E AUTORIZAÇÃO

### Clientes Supabase

```typescript
// Cliente com token do usuário (para verificação de acesso)
function createSupabaseClient(req: Request) {
  const authHeader = req.headers.get('Authorization');
  return createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_ANON_KEY'),
    { global: { headers: { Authorization: authHeader } } }
  );
}

// Cliente service (admin, sem restrições)
function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );
}
```

### RLS (Row Level Security)
- Tabelas: `documentos`, `minutas`, `agentes_especialistas_runs`
- Service client usado para operações sensíveis
- Usuário verificado via `getUser()` função
- Propriedade do documento/minuta validada

---

## 9. FLUXO DE DADOS COMPLETO

### Exemplo: Processamento de CNH

```
1. Upload CNH
   ├─ Storage: documentos (arquivo PDF)
   └─ DB: documentos { status: 'pendente' }

2. classify-document
   ├─ Input: documento_id
   ├─ Gemini: Analisa imagem → retorna tipo
   ├─ Output: { tipo_documento: 'CNH', confianca: 'Alta' }
   └─ DB: documentos { status: 'classificado', tipo_documento: 'CNH' }

3. extract-document
   ├─ Input: documento_id
   ├─ Carrega prompt de agent_prompts para CNH
   ├─ Gemini: Extrai dados estruturados
   ├─ Output: {
   │     numero: '123456789',
   │     nome: 'JOÃO SILVA',
   │     cpf: '12345678900',
   │     ...
   │   }
   └─ DB: documentos { status: 'extraido', dados_extraidos: {...} }

4. map-to-fields
   ├─ Input: minuta_id
   ├─ Processa todos documentos extraídos
   ├─ Mapeia CNH → PessoaNatural
   ├─ Deduplicação por CPF
   └─ DB: pessoas_naturais { cpf, nome, rg, ... }

5. generate-minuta
   ├─ Input: minuta_id
   ├─ Agrega: pessoas + imóvel + negócio
   ├─ Template: VENDA_COMPRA
   ├─ Gemini: Gera minuta completa
   └─ DB: minutas { minuta_texto: '...' }
```

---

## 10. CONFIGURAÇÃO CRÍTICA

### Variáveis de Ambiente Necessárias

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyD...
```

### Limites e Quotas

| Recurso | Limite |
|---------|--------|
| Tamanho arquivo (agentes) | 20MB |
| Tamanho PDF (Gemini) | 50MB |
| Tamanho página PDF (Gemini) | 1000 páginas |
| Max tokens output | 16384 |
| Temperature | 0.1 (determinístico) |
| Timeout (implícito) | ~5-10 minutos |

---

## 11. TRATAMENTO DE ERROS

### Padrão de Resposta de Erro

```json
{
  "error": "Mensagem de erro amigável em português",
  "success": false
}
```

### Códigos HTTP

| Code | Situação |
|------|----------|
| 200 | Sucesso |
| 400 | Validação falhou (arquivo inválido, tipo não suportado) |
| 401 | Não autenticado |
| 404 | Recurso não encontrado |
| 500 | Erro interno (Gemini, BD, etc) |

### Exemplo: Erro de Arquivo Inválido
```
Status: 400
Body: {
  "error": "Arquivo contrato.xlsx excede o tamanho máximo de 20MB"
}
```

---

## 12. RASTREAMENTO DE CUSTOS

### Implementação

Cada execução registra:
```typescript
{
  input_tokens: 12345,
  output_tokens: 5678,
  cost_estimate: 0.00378  // Calculado automaticamente
}
```

### Visualização

```sql
-- Total gasto por tipo de agent
SELECT
  agent_type,
  COUNT(*) as execucoes,
  SUM(cost_estimate) as custo_total,
  AVG(duration_ms) as tempo_medio_ms
FROM agent_executions
WHERE created_at >= CURRENT_DATE - INTERVAL 7 DAY
GROUP BY agent_type;

-- Top 10 minutas mais caras
SELECT
  minuta_id,
  COUNT(*) as execucoes,
  SUM(input_tokens) as tokens_entrada,
  SUM(output_tokens) as tokens_saida,
  SUM(cost_estimate) as custo_total
FROM agent_executions
WHERE minuta_id IS NOT NULL
GROUP BY minuta_id
ORDER BY custo_total DESC
LIMIT 10;
```

---

## 13. FLUXO COM INSTRUÇÕES CUSTOMIZADAS (Agentes Especialistas)

### Caso de Uso: Analista de Contratos

**Request**:
```
POST /agentes-especialistas/run
Content-Type: multipart/form-data

agent_slug: "analista-contrato"
instrucoes_customizadas: "Foque em cláusulas de rescisão e penalidades."
documentos: [contrato.pdf]
```

**Processamento**:
1. Carrega prompt base de `agent_prompts` para "analista-contrato"
2. Constrói prompt completo:
   ```
   [PROMPT BASE DO AGENTE]

   ---

   ## INSTRUCOES ADICIONAIS DO USUARIO

   Foque em cláusulas de rescisão e penalidades.

   ---

   IMPORTANTE: Aplique as instruções do usuário ao analisar este documento...
   ```
3. Chama Gemini com documento + prompt completo
4. Armazena resposta em `agentes_especialistas_runs`

---

## 14. PRÓXIMOS PASSOS PARA EXPANSÃO

1. **Novos Agentes**: Adicionar na tabela `specialist_agents` + `specialist_prompts`
2. **Novos Tipos de Documento**: Adicionar em `VALID_DOCUMENT_TYPES` + prompts em BD
3. **Processamento em Batch**: Extensão do sistema para lotes
4. **Webhooks**: Notificação em tempo real de conclusão
5. **Cache de Prompts**: Otimizar carregamento frequente

---

## Resumo de Arquivos Críticos

| Arquivo | Responsabilidade | Tipo |
|---------|------------------|------|
| `_shared/gemini-client.ts` | Integração com Gemini API | Core |
| `_shared/prompts.ts` | Carregamento dinâmico de prompts | Core |
| `_shared/execution-logger.ts` | Logging de execuções | Observabilidade |
| `classify-document/index.ts` | Classificação de documentos | Agente |
| `extract-document/index.ts` | Extração de dados | Agente |
| `map-to-fields/index.ts` | Mapeamento para schema | Agente |
| `generate-minuta/index.ts` | Geração de minutas | Agente |
| `agentes-especialistas/index.ts` | Sistema dinâmico de agentes | Agente |

---

**Investigação Concluída**: 2026-02-02
