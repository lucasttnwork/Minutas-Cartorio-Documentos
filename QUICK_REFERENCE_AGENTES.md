# QUICK REFERENCE: AGENTES ESPECIALISTAS

## Tabela Rápida dos 11 Agentes

| # | Slug | Nome | Categoria | Input | Output Principal |
|---|------|------|-----------|-------|-------------------|
| 1 | `rg` | Extrator de RG | Pessoais | Fotografia RG | Nome, CPF, Filiação |
| 2 | `cnh` | Extrator de CNH | Pessoais | Fotografia CNH | Categoria, Validade |
| 3 | `certidao-casamento` | Cert. Casamento | Pessoais | PDF Certidão | Cônjuges, Regime |
| 4 | `certidao-nascimento` | Cert. Nascimento | Pessoais | PDF Certidão | Filiação, Avós |
| 5 | `matricula-imovel` | Matrícula Imóvel | Imobiliarios | PDF RI | Proprietários, Ónus |
| 6 | `itbi` | ITBI | Imobiliarios | PDF/Imagem | Valores, Aliquota |
| 7 | `iptu` | IPTU | Imobiliarios | PDF Carnê | Áreas, Valores |
| 8 | `escritura` | Escritura | Imobiliarios | PDF Escritura | Partes, Valores |
| 9 | `compromisso-compra-venda` | Compromisso | Imobiliarios | PDF Contrato | Preço, Prazos |
| 10 | `contrato-social` | Contrato Social | Empresariais | PDF Contrato | Sócios, Capital |
| 11 | `cndt` | CNDT | Empresariais | PDF/Imagem | Status, Validade |

---

## URLs Importantes

### Frontend Routes
```
http://localhost:5173/agentes                     # Dashboard
http://localhost:5173/agentes/rg                  # RG Extractor
http://localhost:5173/agentes/cnh                 # CNH Extractor
http://localhost:5173/agentes/matricula-imovel    # Matrícula Extractor
```

### Edge Function Endpoints
```
POST   /agentes-especialistas/run
GET    /agentes-especialistas/history?limit=20&offset=0&agent_slug=rg
GET    /agentes-especialistas/agents
GET    /agentes-especialistas/run/:id
GET    /agentes-especialistas/run/:id/document/:filename
```

### Database
```
Prompt Table:     agentes_especialistas_prompts
Run History:      agentes_especialistas_runs
Storage Bucket:   agentes-especialistas-docs
```

---

## Arquivo Paths (Absolute)

```
FRONTEND:
C:\...\Frontend\src\pages\AgenteExtrator.tsx
C:\...\Frontend\src\hooks\useAgentRun.ts
C:\...\Frontend\src\components\agentes\
C:\...\Frontend\src\types\agente.ts
C:\...\Frontend\src\data\agentes.ts

BACKEND:
C:\...\Frontend\supabase\functions\agentes-especialistas\index.ts
C:\...\Frontend\supabase\functions\agentes-especialistas\types.ts

DATABASE:
C:\...\Frontend\supabase\migrations\20260201000001_create_agentes_especialistas_schema.sql
C:\...\Frontend\supabase\migrations\20260201000002_seed_agentes_especialistas_prompts.sql
```

---

## Ciclo de Vida Resumido

```
1. User → Upload + Agent Select
2. Frontend → useAgentRun().executeRun()
3. Edge Function → GET PROMPT → VALIDATE → UPLOAD DOCS
4. Edge Function → CREATE RUN → CALL GEMINI
5. Gemini → Response (3 sections: Reescrita, Explicação, JSON)
6. Edge Function → UPDATE RUN → RETURN RESPONSE
7. Frontend → setState(resultado) → Render <ResultadoAnalise>
8. User → Copy/Export/View History
9. DB → Armazena run completa com snapshot do prompt
```

---

## TypeScript Interfaces Principais

### Frontend
```typescript
// src/types/agente.ts
interface AgenteConfig {
  id: string;
  slug: string;                // 'rg', 'cnh', etc
  nome: string;                // 'Extrator de RG'
  descricao: string;
  categoria: AgenteCategoria;  // 'pessoais' | 'imobiliarios' | 'empresariais'
  icone: string;              // Lucide icon
}

// src/hooks/useAgentRun.ts
interface UseAgentRunReturn {
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  resultado: string;
  error: string | null;
  runId: string | null;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  executeRun: (agentSlug: string, files: File[], instrucoes?: string) => Promise<void>;
  reset: () => void;
}
```

### Backend
```typescript
// supabase/functions/agentes-especialistas/types.ts
interface RunResponse {
  run_id: string;
  status: 'completed' | 'error';
  output_texto?: string;
  error?: string;
  input_tokens?: number;
  output_tokens?: number;
  duration_ms?: number;
}

interface ActivePrompt {
  id: string;
  agent_slug: string;
  versao: number;
  system_prompt: string;
  nome_exibicao: string;
  descricao: string | null;
  categoria: string;
}

interface RunDetailResponse {
  id: string;
  user_id: string;
  agent_slug: string;
  agent_nome: string;
  documentos: DocumentMetadata[];
  prompt_versao: number;
  prompt_usado: string;          // SNAPSHOT!
  output_texto: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_estimate: number | null;
  duration_ms: number | null;
  status: RunStatus;
  created_at: string;
}
```

---

## SQL Helpers (Quick Query)

### Get Active Prompt
```sql
SELECT * FROM agentes_especialistas_prompts
WHERE agent_slug = 'rg' AND ativo = true
LIMIT 1;
```

### Get Run History
```sql
SELECT * FROM agentes_especialistas_runs
WHERE user_id = '...' AND agent_slug = 'rg'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### Create Run
```sql
INSERT INTO agentes_especialistas_runs (
  id, user_id, agent_slug, agent_nome,
  documentos, prompt_versao, prompt_usado,
  status, started_at
) VALUES (...)
```

### Complete Run
```sql
UPDATE agentes_especialistas_runs
SET status = 'completed',
    output_texto = '...',
    input_tokens = 2500,
    output_tokens = 1200,
    cost_estimate = 0.0005,
    duration_ms = 3450,
    completed_at = NOW()
WHERE id = '...'
```

---

## Checklist: Adicionar Novo Agente

- [ ] Criar prompt specializado (3000-5000 chars)
- [ ] Definir estrutura JSON para output
- [ ] Inserir em `agentes_especialistas_prompts`
  ```sql
  INSERT INTO agentes_especialistas_prompts (
    agent_slug, versao, system_prompt,
    nome_exibicao, descricao, categoria, ativo
  ) VALUES (
    'novo-agent',
    1,
    'Voce eh...',
    'Extrator de XXXX',
    'Descricao...',
    'pessoais|imobiliarios|empresariais',
    TRUE
  );
  ```
- [ ] Adicionar ao `src/data/agentes.ts`
  ```typescript
  {
    id: '12',
    slug: 'novo-agent',
    nome: 'Extrator de XXXX',
    descricao: 'Descricao...',
    categoria: 'pessoais|imobiliarios|empresariais',
    icone: 'IconName',
  }
  ```
- [ ] Adicionar ao `src/types/agente.ts` se houver tipos especiais
- [ ] Testar upload e análise
- [ ] Verificar JSON output
- [ ] Documentar na seed

---

## Troubleshooting Rápido

### Erro: "Prompt nao encontrado para agente"
**Causa:** Prompt não inserido no banco ou `ativo = false`
**Solução:**
```sql
SELECT * FROM agentes_especialistas_prompts WHERE agent_slug = 'rg';
-- Se vazio, inserir novo prompt
-- Se ativo=false, UPDATE SET ativo=true
```

### Erro: "Arquivo excede tamanho máximo"
**Causa:** Arquivo > 20MB
**Solução:** Usar arquivo menor

### Erro: "Tipo de arquivo não suportado"
**Causa:** MIME type não está em ALLOWED_MIME_TYPES
**Solução:** Verificar tipo: PDF, PNG, JPEG, WEBP, GIF, DOCX

### Gemini retorna erro
**Causa:** API key inválida, quota excedida, document muito grande
**Solução:**
- Verificar GEMINI_API_KEY em .env
- Checar uso em Google Cloud Console
- Reduzir tamanho do documento

### Run criada mas não aparece no histórico
**Causa:** RLS bloqueando (user_id diferente)
**Solução:** Verificar que usuário autenticado é o dono da run

---

## Performance e Otimizações

### Tokens e Custo
```
Gemini 3.0 Flash:
- Input:  $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

Estimativa por análise:
- Input tokens: ~2000-3000 (documento + prompt)
- Output tokens: ~1000-1500 (resposta estruturada)
- Custo: ~$0.0004-0.0006 por análise
```

### Indexes Otimizados
```sql
-- Criados automaticamente na migration:
CREATE INDEX idx_agentes_especialistas_runs_user_id ON agentes_especialistas_runs(user_id);
CREATE INDEX idx_agentes_especialistas_runs_agent_slug ON agentes_especialistas_runs(agent_slug);
CREATE INDEX idx_agentes_especialistas_runs_created_at ON agentes_especialistas_runs(created_at DESC);
CREATE INDEX idx_agentes_especialistas_runs_user_agent ON
  agentes_especialistas_runs(user_id, agent_slug, created_at DESC);
```

### Paginação
```typescript
// Sempre paginar histórico
GET /history?limit=20&offset=0          // Primeira página
GET /history?limit=20&offset=20         // Segunda página
GET /history?limit=20&offset=40&agent_slug=rg  // Filtrar por agente
```

---

## Gemini Prompt Engineering

### Temperature
```typescript
temperature: 0.1  // SEMPRE baixo = determinístico
// Garante resultados consistentes mesmo com mesmo prompt
```

### Max Tokens
```typescript
maxOutputTokens: 16384  // Máximo permitido
// Garante que resposta não seja truncada
```

### Parts Order
```typescript
// Documentos ANTES do prompt (melhor para Gemini entender contexto)
parts: [
  {inlineData: {mimeType: 'application/pdf', data: base64}},
  {text: prompt}
]
```

### Output Format
```markdown
## REESCRITA DO DOCUMENTO
[Texto original transcrito]

## EXPLICACAO CONTEXTUAL
[3-5 parágrafos]

## DADOS CATALOGADOS (JSON)
```json
{...}
```
```

---

## Segurança (RLS)

### Tabelas
```sql
-- Prompts: qualquer usuário autenticado lê
CREATE POLICY "Read prompts" ON agentes_especialistas_prompts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Runs: usuário vê apenas suas próprias
CREATE POLICY "Own runs" ON agentes_especialistas_runs
  FOR SELECT USING (auth.uid() = user_id);
```

### Storage
```sql
-- Documentos: usuário acessa apenas seus próprios
-- Path: {user_id}/{run_id}/{filename}
-- RLS valida: (storage.foldername(name))[1] = auth.uid()
```

---

## Debugging

### Logs no Edge Function
```typescript
console.log('[handleRun] Getting user...');
console.log('[handleRun] User authenticated:', user.id);
console.log('[handleRun] Getting prompt for agent:', agentSlug);
console.log('[handleRun] Prompt found:', promptData.nome_exibicao);
console.log('[handleRun] Starting Gemini call...');
console.log('[handleRun] Gemini response received');
console.log('[handleRun] Run completed:', { runId, duration, tokens });
```

### Ver Logs no Supabase
```bash
supabase functions logs agentes-especialistas
```

### Query Histórico Manualmente
```sql
SELECT id, user_id, agent_slug, status, created_at, error_mensagem
FROM agentes_especialistas_runs
WHERE user_id = '...'
ORDER BY created_at DESC;
```

### Inspecionar Run Específica
```sql
SELECT
  id, agent_slug, status,
  prompt_versao, prompt_usado,
  output_texto, input_tokens, output_tokens,
  cost_estimate, duration_ms,
  created_at, completed_at
FROM agentes_especialistas_runs
WHERE id = '...';
```

---

## Environment Variables (.env)

```
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSy...
```

---

## Testing Checklist

### Manual Testing
- [ ] Upload PDF com sucesso
- [ ] Upload imagem com sucesso
- [ ] Upload DOCX e verifica conversão
- [ ] Enviar sem arquivo (erro esperado)
- [ ] Enviar arquivo > 20MB (erro esperado)
- [ ] Enviar formato não suportado (erro esperado)
- [ ] Instruções customizadas aplicadas no prompt
- [ ] Resultado retornou em 3-10 segundos
- [ ] JSON extraído corretamente
- [ ] Copiar resultado (sem JSON)
- [ ] Exportar DOCX
- [ ] Exportar PDF
- [ ] Ver histórico
- [ ] Filtrar histórico por agente
- [ ] Ver detalhes de run específica

### Edge Cases
- [ ] Documento ilegível (teste com imagem borrada)
- [ ] Documento em idioma diferente
- [ ] Documento com múltiplas páginas
- [ ] Documento DOCX com tabelas
- [ ] Run com instruções muito longas
- [ ] Dois uploads simultâneos
- [ ] Logout durante análise
- [ ] Refresh página durante análise

---

## Métricas Importantes

```
Total Runs: SELECT COUNT(*) FROM agentes_especialistas_runs;
Runs por Agente: SELECT agent_slug, COUNT(*) FROM agentes_especialistas_runs GROUP BY agent_slug;
Tempo Médio: SELECT AVG(duration_ms) FROM agentes_especialistas_runs;
Custo Total: SELECT SUM(cost_estimate) FROM agentes_especialistas_runs;
Taxa de Erro: SELECT COUNT(*) FROM agentes_especialistas_runs WHERE status = 'error';
Tokens Totais: SELECT SUM(input_tokens + output_tokens) FROM agentes_especialistas_runs;
```

---

## Upgrade/Manutenção

### Adicionar Novo Prompt (sem quebrar antigos)
```sql
-- Versão 1 (atual)
UPDATE agentes_especialistas_prompts SET ativo = FALSE
WHERE agent_slug = 'rg' AND versao = 1;

-- Versão 2 (nova)
INSERT INTO agentes_especialistas_prompts (
  agent_slug, versao, system_prompt, ...
) VALUES ('rg', 2, 'Novo prompt melhorado...', true);

-- Resultado: runs antigas mantêm v1 (snapshot), novas usam v2
```

### Rollback Rápido
```sql
UPDATE agentes_especialistas_prompts SET ativo = FALSE WHERE agent_slug = 'rg' AND versao = 2;
UPDATE agentes_especialistas_prompts SET ativo = TRUE WHERE agent_slug = 'rg' AND versao = 1;
```

---

## Conversão de Modelos (Future-Proof)

Código preparado para trocar modelo facilmente:

```typescript
// Gemini 3.0 Flash (current)
const GEMINI_MODEL = 'gemini-3-flash-preview';

// Para trocar para novo modelo:
// 1. Atualizar GEMINI_MODEL
// 2. Atualizar GEMINI_API_URL (se necessário)
// 3. Atualizar pricing em estimateCost()
// 4. Testar com documento piloto
// 5. Deploy
```

---

## Recursos Externos

- Gemini API Docs: https://ai.google.dev/
- Supabase Functions: https://supabase.com/docs/guides/functions
- Storage: https://supabase.com/docs/guides/storage
- RLS: https://supabase.com/docs/guides/auth/row-level-security

---

**Última atualização:** 2024-02-01
**Versão:** 1.0
**Próximas melhorias:** Streaming responses, thinking mode, multi-model support
