# RESUMO EXECUTIVO DA INVESTIGAÇÃO

## Sistema de Agentes Especialistas - Análise Completa

**Data:** 2024-02-02
**Status:** ✓ INVESTIGAÇÃO CONCLUÍDA COM SUCESSO
**Documentos Gerados:** 4

---

## Arquivos Gerados

### 1. RELATORIO_AGENTES_ESPECIALISTAS.md (14 seções)
Análise profunda e detalhada:
- Schema do banco (tabelas, funções SQL, RLS)
- Descrição de cada um dos 11 agentes
- Carregamento dinâmico de prompts
- Fluxo completo de execução (13 passos)
- Processamento e exibição de outputs
- Histórico, segurança, versionamento
- Métricas, custo estimado

### 2. DIAGRAMA_FLUXO_AGENTES.md (Visual)
Diagramas técnicos:
- Sequência temporal completa (T0-T14)
- Mapa mental dos componentes
- Ciclo de vida de uma run (13 estágios)
- Matriz de decisão de agentes

### 3. QUICK_REFERENCE_AGENTES.md (Prático)
Referência rápida:
- Tabela dos 11 agentes
- URLs e file paths
- TypeScript interfaces
- SQL helpers
- Troubleshooting
- Performance
- Testing checklist
- Debugging

### 4. RESUMO_INVESTIGACAO.md (Este arquivo)
Sumário executivo

---

## Descobertas Principais

### ✓ Sistema Completamente Dinâmico

**Prompts armazenados NO BANCO:**
- Tabela: `agentes_especialistas_prompts`
- 11 agentes com prompts especializados (3000-5000 caracteres cada)
- Versionáveis (rollback fácil)
- Apenas UM ativo por agent_slug (unique index)

**Edge Function busca dinamicamente:**
```typescript
supabase.rpc('get_active_specialist_prompt', { p_agent_slug })
// Retorna prompt ativo do banco em tempo de execução
```

### ✓ 11 Agentes Especializados

**PESSOAIS (4):**
1. RG - Carteira de Identidade
2. CNH - Carteira Nacional de Habilitação
3. Certidão de Casamento
4. Certidão de Nascimento

**IMOBILIÁRIOS (5):**
5. Matrícula de Imóvel
6. ITBI - Imposto de Transferência
7. IPTU - Imposto Predial
8. Escritura Pública
9. Compromisso de Compra e Venda

**EMPRESARIAIS (2):**
10. Contrato Social
11. CNDT - Certidão Negativa de Débitos Trabalhistas

### ✓ Fluxo Dinâmico Completo

```
1. Frontend: useAgentRun().executeRun(agentSlug, files, instrucoes)
2. Edge: POST /agentes-especialistas/run
3. Edge: Busca prompt ativo: get_active_specialist_prompt()
4. Edge: Upload files → Storage bucket
5. Edge: CREATE RUN record (status: 'processing')
6. Edge: Constrói prompt final (base + user instructions)
7. Gemini: Processa documents + prompt (temperature: 0.1)
8. Gemini: Retorna resposta em 3 seções (Reescrita + Explicação + JSON)
9. Edge: UPDATE RUN (output_texto + tokens + cost + duration)
10. Frontend: setState(resultado)
11. User: Vê resultado em 4 abas (Reescrita | Explicação | Dados | JSON)
12. User: Copia/Exporta DOCX/PDF/Vê histórico
13. DB: Armazena run completa com snapshot do prompt
```

### ✓ Snapshots de Prompts = Reprodutibilidade

Cada run salva:
- `prompt_versao`: Número da versão (1, 2, 3, ...)
- `prompt_usado`: Snapshot **COMPLETO** do prompt no momento da execução

Benefícios:
- Reconstruir execução idêntica com mesmo prompt
- Comparar resultados entre versões
- Auditoria completa
- Fácil rollback se prompt novo quebra algo

### ✓ Isolamento Total

- Schema completamente separado do pipeline de minutas
- Sem Foreign Keys para tabelas de documentos/minutas
- User-centric: tudo baseado em `user_id`
- RLS em todos os níveis (tabelas + storage)

### ✓ Histórico Completo

Tabela: `agentes_especialistas_runs`
- Paginado (20 por página)
- Filtro por agent_slug
- Métricas: tokens, custo, duração
- Status: pending | processing | completed | error
- Documentos: metadados com storage paths
- Instruções customizadas: salvas para auditoria

### ✓ Segurança RLS

```sql
-- Prompts: todos podem ler
CREATE POLICY "Read prompts"
  USING (auth.role() = 'authenticated');

-- Runs: usuário vê apenas suas
CREATE POLICY "Own runs"
  USING (auth.uid() = user_id);

-- Storage: path-based (user_id/run_id/file)
CREATE POLICY "Own documents"
  USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### ✓ Edge Function (4 Endpoints)

```
POST   /agentes-especialistas/run
       → Inicia nova run (upload + análise)

GET    /agentes-especialistas/history
       → Lista runs do usuário (paginado, filtro)

GET    /agentes-especialistas/agents
       → Lista agentes disponíveis

GET    /agentes-especialistas/run/:id
       → Detalhes de uma run específica
```

### ✓ Output em 3 Seções Markdown

```markdown
## REESCRITA DO DOCUMENTO
[Transcrição literal]

## EXPLICACAO CONTEXTUAL
[3-5 parágrafos explicando]

## DADOS CATALOGADOS (JSON)
```json
{...estrutura específica do agente...}
```
```

### ✓ Componentes React Especializados

- `AgenteExtrator.tsx` - Página principal (upload + análise)
- `useAgentRun()` - Hook para executar runs
- `ResultadoAnalise` - Exibe resultado com 4 abas
- `ExecutionHistoryAgentes` - Lista histórico
- `ExecutionDetailModal` - Modal com detalhes

### ✓ Processamento de Arquivos

- **Formatos:** PDF, PNG, JPEG, WEBP, GIF, DOCX
- **Máx:** 20MB por arquivo
- **Normalização:** DOCX → HTML (automática)
- **Storage:** Bucket privado com path structure `{user_id}/{run_id}/{filename}`
- **Download:** Signed URLs (1 hora validade)

### ✓ Métricas Coletadas

```
input_tokens:    2000-3000 (documento + prompt)
output_tokens:   1000-1500 (resposta estruturada)
duration_ms:     3450ms (tipicamente)
cost_estimate:   ~$0.0004-0.0006 USD por análise

Pricing (Gemini 3.0 Flash):
- Input:  $0.075 per 1M tokens
- Output: $0.30 per 1M tokens
```

### ✓ Versionamento de Prompts

```sql
-- V1 (atual)
UPDATE agentes_especialistas_prompts SET ativo = FALSE
WHERE agent_slug = 'rg' AND versao = 1;

-- V2 (nova)
INSERT INTO agentes_especialistas_prompts (
  agent_slug, versao, system_prompt, ...
) VALUES ('rg', 2, 'Novo prompt...', true);

-- Resultado:
-- - Runs antigas mantêm v1 (snapshot)
-- - Novas runs usam v2
-- - Rollback: UPDATE SET ativo = FALSE/TRUE
```

---

## Arquitetura em Camadas

```
┌─ FRONTEND (React) ──────────────────────────────────┐
│ AgenteExtrator.tsx → useAgentRun() Hook            │
│ → ResultadoAnalise (4 abas)                         │
│ → ExecutionHistoryAgentes (paginado, filtro)       │
└──────────────────────────────────────────────────────┘
                         ↓ FormData
┌─ EDGE FUNCTION (Deno) ──────────────────────────────┐
│ - Autenticação (getUser)                            │
│ - Busca prompt DINÂMICO (RPC)                       │
│ - Upload arquivos (Storage)                         │
│ - Normaliza (DOCX→HTML)                             │
│ - Cria RUN record                                   │
│ - Chama Gemini (documents + prompt)                 │
│ - Atualiza RUN com resultado                        │
│ - Calcula custo                                     │
└──────────────────────────────────────────────────────┘
                         ↓ SQL
┌─ BANCO (Supabase PostgreSQL) ──────────────────────┐
│ agentes_especialistas_prompts (11 ativos)          │
│ agentes_especialistas_runs (histórico)             │
│ storage.buckets[agentes-especialistas-docs]        │
│ RLS policies (select, insert, update, delete)      │
│ Helper functions SQL                                │
└──────────────────────────────────────────────────────┘
                         ↓ HTTP
┌─ GEMINI API (Google) ───────────────────────────────┐
│ gemini-3-flash-preview                             │
│ Temperature: 0.1 (determinístico)                  │
│ MaxTokens: 16384                                    │
│ Processa: documents (inline) + prompt (text)       │
└──────────────────────────────────────────────────────┘
```

---

## Tabelas do Banco

### agentes_especialistas_prompts (11 ativos)

```
id (UUID)
├─ agent_slug (rg, cnh, ...) - UNIQUE per version
├─ versao (1, 2, 3, ...)
├─ system_prompt (3000-5000 caracteres)
├─ nome_exibicao (para display: "Extrator de RG")
├─ descricao
├─ categoria (pessoais|imobiliarios|empresariais)
├─ ativo (apenas UM true por agent_slug - unique index)
├─ criado_por (UUID)
├─ created_at, updated_at
└─ RLS: todos podem SELECT se autenticados
```

### agentes_especialistas_runs (histórico)

```
id (UUID)
├─ user_id (FK auth.users)
├─ agent_slug (rg, cnh, ...)
├─ agent_nome (snapshot do nome)
├─ documentos (JSONB: [{nome, storage_path, mime_type, tamanho_bytes}])
├─ instrucoes_customizadas (usuário pode adicionar)
├─ prompt_versao (número: 1, 2, 3, ...)
├─ prompt_usado (SNAPSHOT COMPLETO do prompt!)
├─ modelo (gemini-3-flash-preview)
├─ output_texto (resultado em Markdown)
├─ output_thinking (se disponível)
├─ status (pending|processing|completed|stopped|error)
├─ erro_mensagem
├─ input_tokens, output_tokens
├─ thinking_duration_ms
├─ cost_estimate (USD)
├─ started_at, completed_at
├─ duration_ms
├─ created_at, updated_at
└─ RLS: usuários veem apenas suas próprias runs
```

### storage.buckets[agentes-especialistas-docs]

```
Structure: {user_id}/{run_id}/{filename}
Max size: 20MB per file
Types: PDF, PNG, JPEG, WEBP, GIF, DOCX
Access: Private (RLS path-based)
```

---

## SQL Helper Functions

1. **get_active_specialist_prompt(p_agent_slug)**
   - Retorna prompt ativo para agente
   - Chamada pela Edge Function

2. **get_specialist_runs_history(p_user_id, limit, offset, p_agent_slug?)**
   - Lista runs paginadas do usuário
   - Com filtro opcional por agente

3. **create_specialist_run(p_user_id, p_agent_slug, p_documentos, p_instrucoes?)**
   - Cria run com snapshot automático do prompt

4. **complete_specialist_run(p_run_id, p_output, p_tokens, ...)**
   - Completa run com resultado e métricas

5. **list_specialist_agents()**
   - Lista agentes disponíveis (prompts ativos)

---

## Performance

### Tempo Típico

- Upload: < 1 segundo
- Gemini processing: 3-10 segundos
- Total: 3.5-11 segundos

### Temperature: 0.1

- Muito baixo = determinístico
- Mesma entrada = mesma saída
- Essencial para resultados estruturados consistentes

### Tokens Típicos

```
Input:  2000-3000  (documento + prompt)
Output: 1000-1500  (resposta estruturada)
Custo:  ~$0.0004-0.0006 por análise
```

### Indexes Otimizados

```sql
CREATE INDEX idx_agentes_especialistas_runs_user_id ON ...
CREATE INDEX idx_agentes_especialistas_runs_agent_slug ON ...
CREATE INDEX idx_agentes_especialistas_runs_created_at ON ...
CREATE INDEX idx_agentes_especialistas_runs_user_agent ON ... (composite)
```

---

## Segurança (RLS)

### Tabelas

- **Prompts:** `SELECT` para todos autenticados
- **Runs:** Usuários veem APENAS suas próprias (via `user_id`)

### Storage

- Path-based: `{user_id}/{run_id}/{filename}`
- RLS valida: `(storage.foldername(name))[1] = auth.uid()`

### Download

- Signed URLs com 1 hora de validade
- Geradas no backend (seguro)

---

## Próximos Passos

1. **Streaming responses** - SSE para resultado em tempo real
2. **Thinking mode** - Extended thinking com output_thinking
3. **Multi-model support** - Suportar múltiplos modelos de IA
4. **Batch processing** - Processar múltiplos documentos em paralelo
5. **Advanced filtering** - Data range, status, busca em output
6. **Export history** - CSV/JSON das runs
7. **Prompt versioning UI** - Interface para criar/editar prompts
8. **Integração com minutas** - Link bidirecional

---

## Conclusão

O sistema de Agentes Especialistas é:

✓ **Robusto** - Separado, isolado, RLS completo
✓ **Dinâmico** - Prompts no banco, fácil atualizar
✓ **Auditável** - Snapshots para reprodutibilidade
✓ **Escalável** - Paginação, índices, cost tracking
✓ **Seguro** - RLS em 3 níveis, signed URLs
✓ **Extensível** - Novo agente = 1 SQL insert
✓ **Observável** - Métricas (tokens, custo, duração)

**Pronto para produção e expansão.**

---

## Arquivos de Referência

| Arquivo | Tamanho | Tipo |
|---------|---------|------|
| RELATORIO_AGENTES_ESPECIALISTAS.md | ~30KB | Análise Detalhada |
| DIAGRAMA_FLUXO_AGENTES.md | ~50KB | Visual/Diagramas |
| QUICK_REFERENCE_AGENTES.md | ~20KB | Referência Rápida |
| RESUMO_INVESTIGACAO.md | ~10KB | Executivo (este) |

**Total:** ~110KB de documentação técnica

---

**Investigação concluída:** 2024-02-02
**Versão:** 1.0
**Próxima revisão:** Conforme mudanças no sistema
