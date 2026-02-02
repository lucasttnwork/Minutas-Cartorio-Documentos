# Índice e Mapa de Referência: Edge Functions

**Navegação rápida pelos documentos de investigação**

---

## Documentos Criados

1. **INVESTIGACAO_EDGE_FUNCTIONS.md** (Principal)
   - Análise completa e detalhada de cada função
   - Todos os endpoints, parâmetros, tipos

2. **GUIA_PRATICO_EDGE_FUNCTIONS.md** (Implementação)
   - Exemplos de uso passo a passo
   - Queries SQL úteis
   - Tratamento de erros

3. **ARQUITETURA_EDGE_FUNCTIONS.md** (Técnico)
   - Padrões e convenções
   - Integrações externas
   - Otimizações e segurança

4. **INDICE_EDGE_FUNCTIONS.md** (Este documento)
   - Mapa visual
   - Índice temático

---

## Mapa Visual do Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                  MINUTAS CARTÓRIO                            │
│                 Edge Functions                               │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      SHARED UTILITIES (_shared/)         │
├─────────────────────────────────────────┤
│                                         │
│  ├─ gemini-client.ts                   │
│  │  └─ callGemini() → Gemini API       │
│  │  └─ parseGeminiJson()               │
│  │  └─ arrayBufferToBase64()           │
│  │                                      │
│  ├─ prompts.ts                         │
│  │  └─ CLASSIFICATION_PROMPT           │
│  │  └─ loadExtractionPrompt()          │
│  │                                      │
│  ├─ supabase-client.ts                 │
│  │  └─ createSupabaseClient()          │
│  │  └─ createServiceClient()           │
│  │                                      │
│  ├─ execution-logger.ts                │
│  │  └─ startExecution()                │
│  │  └─ logSuccess()                    │
│  │  └─ logError()                      │
│  │                                      │
│  ├─ file-normalizer.ts                 │
│  │  └─ normalizeFilesForGemini()       │
│  │  └─ DOCX → HTML conversion          │
│  │                                      │
│  ├─ types.ts                           │
│  │  └─ DocumentType enum               │
│  │  └─ ClassificationResult            │
│  │  └─ ExtractionResult                │
│  │  └─ MappedFields                    │
│  │                                      │
│  ├─ templates.ts                       │
│  │  └─ Minuta templates                │
│  │  └─ Interface definitions           │
│  │                                      │
│  └─ qualification-generator.ts         │
│     └─ Notarial formatting             │
│                                         │
└─────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┬──────────────────────┐
│                      │                      │                      │
│  PIPELINE AGENTS     │  PIPELINE AGENTS     │  PIPELINE AGENTS     │
│  (Sequential)        │  (Sequential)        │  (Deterministic)     │
│                      │                      │                      │
└──────────────────────┴──────────────────────┴──────────────────────┘

┌──────────────────────┬──────────────────────┬──────────────────────┐
│ 1. CLASSIFY         │ 2. EXTRACT           │ 3. MAP               │
├──────────────────────┼──────────────────────┼──────────────────────┤
│                      │                      │                      │
│ classify-document/   │ extract-document/    │ map-to-fields/       │
│ index.ts             │ index.ts             │ index.ts             │
│                      │                      │                      │
│ Input:               │ Input:               │ Input:               │
│ - documento_id       │ - documento_id       │ - minuta_id          │
│                      │                      │                      │
│ Process:             │ Process:             │ Process:             │
│ 1. Fetch doc         │ 1. Fetch doc         │ 1. Fetch all docs    │
│ 2. Download file     │ 2. Load prompt       │ 2. Sort by priority  │
│ 3. Base64 encode     │ 3. Download file     │ 3. Map by tipo       │
│ 4. Call Gemini       │ 4. Base64 encode     │ 4. Deduplicate       │
│ 5. Parse JSON        │ 5. Call Gemini       │ 5. Persist           │
│ 6. Update BD         │ 6. Parse JSON        │ 6. Update BD         │
│ 7. Log execution     │ 7. Update BD         │ 7. Log execution     │
│                      │ 8. Log execution     │                      │
│                      │                      │                      │
│ Output:              │ Output:              │ Output:              │
│ Classification       │ Structured data      │ Relational schema    │
│                      │                      │                      │
│ Token Cost:          │ Token Cost:          │ Token Cost:          │
│ ~0.0004              │ ~0.0035              │ ~0.0000              │
│                      │                      │                      │
└──────────────────────┴──────────────────────┴──────────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ 4. GENERATE          │
                        ├──────────────────────┤
                        │                      │
                        │ generate-minuta/     │
                        │ index.ts             │
                        │                      │
                        │ Input:               │
                        │ - minuta_id          │
                        │ - template_type      │
                        │                      │
                        │ Components:          │
                        │ ├─ data-aggregator   │
                        │ ├─ qualification-    │
                        │ │  builder           │
                        │ └─ templates         │
                        │                      │
                        │ Process:             │
                        │ 1. Aggregate data    │
                        │ 2. Load template     │
                        │ 3. Build prompt      │
                        │ 4. Call Gemini       │
                        │ 5. Update BD         │
                        │ 6. Log execution     │
                        │                      │
                        │ Output:              │
                        │ Complete minuta      │
                        │ (formatted text)     │
                        │                      │
                        │ Token Cost:          │
                        │ ~0.0051              │
                        │                      │
                        └──────────────────────┘

┌────────────────────────────────────────────┐
│  AGENTES ESPECIALISTAS                     │
│  (Dinâmico, customizável)                  │
├────────────────────────────────────────────┤
│                                            │
│  agentes-especialistas/index.ts            │
│                                            │
│  Endpoints:                                │
│  ├─ POST /run                              │
│  ├─ GET /history                           │
│  ├─ GET /run/:id                           │
│  ├─ GET /agents                            │
│  └─ GET /run/:id/document/:filename        │
│                                            │
│  Prompts: Dinamicamente do BD              │
│  Storage: agentes-especialistas-docs       │
│  Format support: PDF, IMG, DOCX, TXT       │
│                                            │
│  Cost: ~0.0125 por execução média          │
│                                            │
└────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          EXTERNAL SERVICES                   │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─ Supabase PostgreSQL                     │
│  │  ├─ agent_prompts                        │
│  │  ├─ documentos                           │
│  │  ├─ minutas                              │
│  │  ├─ pessoas_naturais                     │
│  │  ├─ imoveis                              │
│  │  ├─ negocios_juridicos                   │
│  │  ├─ agent_executions                     │
│  │  ├─ specialist_prompts                   │
│  │  └─ agentes_especialistas_runs           │
│  │                                          │
│  ├─ Supabase Storage                        │
│  │  ├─ documentos/              (originals)  │
│  │  └─ agentes-especialistas-docs/ (runs)   │
│  │                                          │
│  └─ Google Gemini 2.0 Flash API             │
│     ├─ generativelanguage.googleapis.com    │
│     ├─ v1beta/models/gemini-2.0-flash       │
│     └─ generateContent endpoint             │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Índice Temático

### A. Estrutura do Projeto

| Arquivo | Localização | Responsabilidade |
|---------|------------|-----------------|
| index.ts | classify-document/ | Classificação de documentos |
| index.ts | extract-document/ | Extração de dados |
| index.ts | map-to-fields/ | Mapeamento para schema |
| index.ts | generate-minuta/ | Geração de minuta |
| index.ts | agentes-especialistas/ | Sistema dinâmico |
| types.ts | agentes-especialistas/ | Tipos específicos do módulo |

**Leia em**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 1)

---

### B. Cliente Gemini

| Tópico | Arquivo | Detalhe |
|--------|---------|--------|
| Função principal | gemini-client.ts | callGemini() |
| Parsing JSON | gemini-client.ts | parseGeminiJson() com cleanup |
| Encoding | gemini-client.ts | arrayBufferToBase64() |
| Configuração | gemini-client.ts | Model = gemini-2.0-flash |
| Pricing | execution-logger.ts | $0.25 per 1M input, $1.25 per 1M output |

**Leia em**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 2)

---

### C. Sistema de Prompts

| Tipo | Armazenamento | Acesso | Exemplo |
|------|---------------|--------|---------|
| Classification | Hardcoded | Direto | CLASSIFICATION_PROMPT |
| Extraction | BD (agent_prompts) | Dinâmico | loadExtractionPrompt() |
| Generation | BD (templates) + runtime | Construído | buildGenerationPrompt() |
| Specialist | BD (specialist_prompts) | RPC call | get_active_specialist_prompt() |

**Leia em**:
- INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 3)
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 4)

---

### D. Pipeline de Processamento

**Sequência Completa**:
```
1. classify-document → tipo_documento
2. extract-document → dados_extraidos
3. map-to-fields → schema relacional
4. generate-minuta → minuta_texto
```

**Leia em**:
- INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 4)
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 2)
- ARQUITETURA_EDGE_FUNCTIONS.md (Seção 3)

---

### E. Agentes Especialistas (Sistema Dinâmico)

| Operação | Endpoint | Parâmetros |
|----------|----------|------------|
| Executar | POST /run | agent_slug, documentos, instrucoes_customizadas |
| Histórico | GET /history | limit, offset, agent_slug |
| Detalhes | GET /run/:id | run_id |
| Listar agentes | GET /agents | - |
| Download doc | GET /run/:id/document/:filename | run_id, filename |

**Recursos**:
- Suporta múltiplos documentos
- DOCX → HTML automático
- Instrucções customizadas do usuário
- Rastreamento completo de execução
- Storage de documentos

**Leia em**:
- INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 4.5)
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 3)

---

### F. Autenticação e Segurança

| Conceito | Implementação | Referência |
|----------|---------------|-----------|
| Auth JWT | req.headers.get('Authorization') | supabase-client.ts |
| RLS | Policies por user_id | Seção 6 ARQUITETURA |
| Service Role | SUPABASE_SERVICE_ROLE_KEY (env var) | supabase-client.ts |
| Rate Limiting | Nenhum (Supabase free tier) | - |

**Leia em**: ARQUITETURA_EDGE_FUNCTIONS.md (Seção 6)

---

### G. Logging e Observabilidade

| Métrica | Tabela | Query |
|---------|--------|-------|
| Custo total | agent_executions | SUM(cost_estimate) |
| Token usage | agent_executions | input_tokens, output_tokens |
| Latência | agent_executions | duration_ms |
| Taxa de erro | agent_executions | COUNT(WHERE status='error') |
| Performance | agent_executions | AVG(duration_ms) GROUP BY agent_type |

**Leia em**:
- INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 5)
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 6)

---

### H. Tratamento de Erros

| Erro | Status | Solução |
|------|--------|--------|
| Arquivo inválido | 400 | Validar MIME type |
| Arquivo muito grande | 400 | Max 20MB |
| Não autenticado | 401 | Verificar JWT |
| Recurso não encontrado | 404 | Verificar IDs |
| Falha Gemini | 500 | Retry com backoff |

**Leia em**:
- INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 11)
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 5)

---

### I. Tipos TypeScript

**Principais tipos** (em `_shared/types.ts`):

```typescript
DocumentType              // Enum com 25 tipos de documento
ClassificationResult      // Saída de classify
ExtractionResult         // Saída de extract
MappedFields             // Saída de map
PessoaNatural            // Pessoa física mapeada
Imovel                   // Imóvel mapeado
NegocioJuridico          // Negócio jurídico mapeado
AlertaJuridico           // Alertas durante processamento
```

**Leia em**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 7)

---

### J. Normalização de Arquivos

| Formato | Ação | Lib |
|---------|------|-----|
| PDF | Passar adiante | Native (Gemini) |
| JPEG/PNG/WebP/etc | Passar adiante | Native |
| DOCX | Converter → HTML | Mammoth.js |
| TXT/MD/CSV | Passar adiante | Native |
| Outro | Rejeitar (400) | - |

**Leia em**: INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 6)

---

### K. Armazenamento e Persistência

| Tabela | Responsável | Quando |
|--------|------------|--------|
| documentos | classify-document, extract-document | Upload e processamento |
| minutas | generate-minuta | Geração |
| pessoas_naturais | map-to-fields | Mapeamento |
| imoveis | map-to-fields | Mapeamento |
| negocios_juridicos | map-to-fields | Mapeamento |
| agent_executions | Todas as functions | Logging |
| agentes_especialistas_runs | agentes-especialistas | Histórico |

**Leia em**: ARQUITETURA_EDGE_FUNCTIONS.md (Seção 4.3)

---

### L. Performance e Otimizações

| Gargalo | Tempo | Causa | Otimização |
|---------|-------|-------|------------|
| Classify | 2-3s | Gemini API | - |
| Extract | 4-6s | Gemini API | Usar COMPACT para arquivos grandes |
| Map | 500ms | DB queries | Índices nas tabelas |
| Generate | 5-8s | Gemini API | Cache de templates |

**Leia em**: ARQUITETURA_EDGE_FUNCTIONS.md (Seção 7)

---

## Fluxo por Caso de Uso

### Caso 1: Processar um Contrato (CNH)

```
1. Upload documento → storage
2. POST /classify-document
   └─ tipo_documento = "CNH"
3. POST /extract-document
   └─ dados_extraidos = { cnh: {...}, pessoa: {...} }
4. POST /map-to-fields
   └─ Insert pessoas_naturais table
5. POST /generate-minuta
   └─ minuta_texto pronta

Documentos relevantes:
- INVESTIGACAO_EDGE_FUNCTIONS.md (Seções 4.1-4.4)
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 2)
```

### Caso 2: Analisar Contrato Customizado

```
1. POST /agentes-especialistas/run
   - agent_slug: "analista-contrato"
   - documentos: [contrato.docx]
   - instrucoes_customizadas: "..."
   └─ output_texto com análise

2. GET /agentes-especialistas/history
   └─ Ver histórico de análises

Documentos relevantes:
- INVESTIGACAO_EDGE_FUNCTIONS.md (Seção 4.5)
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 3)
```

### Caso 3: Rastrear Custos

```
SELECT agent_type, SUM(cost_estimate), AVG(duration_ms)
FROM agent_executions
WHERE created_at >= CURRENT_DATE
GROUP BY agent_type;

Documentos relevantes:
- GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 6)
- ARQUITETURA_EDGE_FUNCTIONS.md (Seção 11)
```

---

## Checklist de Referência Rápida

### Antes de Implementar
- [ ] Ler INVESTIGACAO_EDGE_FUNCTIONS.md (overview completo)
- [ ] Verificar tipos em `_shared/types.ts`
- [ ] Revisar exemplo em GUIA_PRATICO_EDGE_FUNCTIONS.md

### Adicionando Novo Tipo de Documento
- [ ] Adicionar type em VALID_DOCUMENT_TYPES
- [ ] Criar prompt em agent_prompts table
- [ ] Testar classificação
- [ ] Testar extração
- [ ] Atualizar prioridade em TYPE_PRIORITIES

### Criando Novo Agente Especialista
- [ ] Inserir em specialist_agents table
- [ ] Inserir prompt em specialist_prompts table
- [ ] Testar via POST /agentes-especialistas/run
- [ ] Verificar logging em agentes_especialistas_runs

### Debugging
- [ ] Verificar agent_executions table para erros
- [ ] Inspecionar dados_extraidos JSON
- [ ] Validar prompt_usado está correto
- [ ] Rastrear input_tokens vs output_tokens

---

## Tabela de Referência: Endpoints por Tipo

### Classification
```
POST /classify-document
  Input: { documento_id }
  Output: { tipo_documento, confianca, pessoa_relacionada }
  Cost: ~$0.0004
```

### Extraction
```
POST /extract-document
  Input: { documento_id }
  Output: { dados_extraidos: {...} }
  Cost: ~$0.0035
```

### Mapping
```
POST /map-to-fields
  Input: { minuta_id }
  Output: { alienantes, adquirentes, imovel, negocio }
  Cost: ~$0 (determinístico)
```

### Generation
```
POST /generate-minuta
  Input: { minuta_id, template_type }
  Output: { minuta_texto }
  Cost: ~$0.0051
```

### Specialists (Multi-endpoint)
```
POST /agentes-especialistas/run
  Input: FormData(agent_slug, documentos, instrucoes_customizadas)
  Output: { run_id, output_texto, tokens, cost }
  Cost: ~$0.0125

GET /agentes-especialistas/history
  Query: ?limit=20&offset=0&agent_slug=...
  Output: { runs: [...], total }

GET /agentes-especialistas/run/:id
  Output: { id, agent_slug, documentos, output_texto, ... }

GET /agentes-especialistas/agents
  Output: { agents: [...] }

GET /agentes-especialistas/run/:id/document/:filename
  Output: { download_url, filename, mime_type, size_bytes }
```

---

## Variáveis de Ambiente

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
GEMINI_API_KEY=AIza...
```

---

## Recapitulação: Arquivos Principais

```
supabase/functions/
├── _shared/
│   ├── cors.ts                           ← Headers CORS
│   ├── gemini-client.ts                  ← ★ Integração Gemini
│   ├── prompts.ts                        ← ★ Carregamento de prompts
│   ├── supabase-client.ts                ← ★ Clientes Supabase
│   ├── execution-logger.ts               ← ★ Logging
│   ├── file-normalizer.ts                ← Conversão de arquivo
│   ├── templates.ts                      ← Templates de minuta
│   ├── types.ts                          ← ★ Tipos compartilhados
│   └── qualification-generator.ts        ← Formatação notarial
│
├── classify-document/
│   └── index.ts                          ← ★ Agent 1
│
├── extract-document/
│   └── index.ts                          ← ★ Agent 2
│
├── map-to-fields/
│   ├── index.ts                          ← ★ Agent 3
│   ├── normalizers.ts                    ← Utilitários
│   └── persistence.ts                    ← Persistência BD
│
├── generate-minuta/
│   ├── index.ts                          ← ★ Agent 4
│   ├── data-aggregator.ts                ← Coleta de dados
│   └── qualification-builder.ts          ← Seções notariais
│
├── agentes-especialistas/
│   ├── index.ts                          ← ★ Sistema dinâmico
│   └── types.ts                          ← Tipos do módulo
│
└── bootstrap-admin/
    └── index.ts                          ← Setup local
```

**★** = Leitura essencial

---

## Próximas Ações Recomendadas

1. **Entendimento**
   - Ler INVESTIGACAO_EDGE_FUNCTIONS.md (completo)
   - Revisar GUIA_PRATICO_EDGE_FUNCTIONS.md

2. **Implementação**
   - Usar ARQUITETURA_EDGE_FUNCTIONS.md como referência
   - Seguir padrões em _shared/

3. **Extensão**
   - Adicionar novo documento type
   - Criar novo agente especialista
   - Otimizar prompts baseado em métricas

4. **Monitoramento**
   - Setup queries SQL em dashboard
   - Configurar alertas para erros
   - Rastrear custos Gemini

---

**Criado**: 2026-02-02
**Status**: Investigação Completa
