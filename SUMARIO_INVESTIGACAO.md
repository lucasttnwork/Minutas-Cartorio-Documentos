# Sumário Executivo: Investigação de Edge Functions

**Data**: 2026-02-02
**Status**: Investigação Completa ✓

---

## O Que Foi Investigado

Investigação completa de todas as **Edge Functions do Supabase** relacionadas a agentes e processamento de documentos/minutas no projeto Minutas Cartório.

### Escopo
```
supabase/functions/ - Todas as functions
├── _shared/       - Código compartilhado (8 arquivos)
├── classify-document/      - Agent 1
├── extract-document/       - Agent 2
├── map-to-fields/         - Agent 3
├── generate-minuta/       - Agent 4
├── agentes-especialistas/ - Agent dinâmico
└── bootstrap-admin/       - Utility local

Total: 30+ arquivos TypeScript analisados
Total: 3000+ linhas de código mapeadas
```

---

## Achados Principais

### 1. Arquitetura em Pipeline Sequencial
- 4 agentes principais: Classify → Extract → Map → Generate
- 1 sistema dinâmico de agentes especialistas
- Cada agente executa em sequência, com logs de execução

### 2. LLM: Gemini 2.0 Flash
- Google Gemini é o único LLM integrado
- Temperature = 0.1 (muito determinístico)
- Max tokens = 16384 por resposta
- Pricing: $0.25/1M input, $1.25/1M output

### 3. Sistema de Prompts Híbrido
- **Classification**: Hardcoded em prompts.ts
- **Extraction**: Dinâmico, carregado de `agent_prompts` table
- **Generation**: Construído em runtime com dados + template
- **Specialist**: Dinâmico, versioned em `specialist_prompts` table

### 4. Prompts Podem Ser Dinâmicos OU Hardcoded

| Tipo | Carregamento | Atualização |
|------|-------------|------------|
| Classification | Hardcoded em código | Redeploy função |
| Extraction | BD (agent_prompts) | SQL INSERT/UPDATE |
| Generation | Construído em runtime | Sem storage direto |
| Specialist | BD (specialist_prompts) | SQL INSERT/UPDATE |

### 5. Formato de Saída
- **Classification**: JSON estruturado (tipo, confiança, pessoa)
- **Extraction**: JSON livre (estrutura varia por tipo)
- **Map**: JSON com schema relacional definido
- **Generate**: Markdown/texto formatado notarialmente
- **Specialists**: Texto livre (customizável por agente)

### 6. Integração com BD
- Service client bypassa RLS para operações privilegiadas
- User client verifica JWT para RLS
- Rastreamento completo em `agent_executions`
- Armazenamento de documentos em Supabase Storage

---

## Documentação Criada

### 1. **INVESTIGACAO_EDGE_FUNCTIONS.md** (Principal)
Análise técnica completa:
- Estrutura e localização
- Cliente Gemini e configuração
- Sistema de prompts (3 tipos)
- Cada agent em detalhe (4 + 1)
- Logging de execução
- Normalização de arquivos
- Tipos compartilhados
- Autenticação e RLS
- Fluxo de dados completo
- Configuração crítica
- Tratamento de erros

**Tamanho**: ~2500 linhas
**Tempo de leitura**: 30-45 minutos
**Para**: Arquitetos, tech leads

### 2. **GUIA_PRATICO_EDGE_FUNCTIONS.md** (Implementação)
Exemplos passo a passo:
- Diagrama do pipeline
- Exemplo: Processando uma CNH
- Exemplo: Usando agentes especialistas
- Manipulação de prompts (código real)
- Tratamento de erros comuns
- Monitoramento e queries SQL
- API resumida
- Pricing e custos
- Roadmap

**Tamanho**: ~1200 linhas
**Tempo de leitura**: 20-30 minutos
**Para**: Desenvolvedores

### 3. **ARQUITETURA_EDGE_FUNCTIONS.md** (Técnico)
Detalhes arquiteturais:
- Camadas e responsabilidades
- Padrões e convenções
- Fluxo de dados detalhado
- Integrações externas
- Tratamento de erros
- Segurança (auth, RLS, service role)
- Performance e gargalos
- Transações e atomicidade
- Versionamento de prompts
- Evolução arquitetural (v1, v2, v3)
- Monitoramento recomendado

**Tamanho**: ~800 linhas
**Tempo de leitura**: 20-25 minutos
**Para**: Arquitetos de sistema

### 4. **INDICE_EDGE_FUNCTIONS.md** (Referência)
Navegação e índices:
- Mapa visual completo do sistema
- Índice temático (11 categorias)
- Fluxos por caso de uso
- Checklist de referência
- Tabela de endpoints
- Arquivo de variáveis de ambiente
- Mapa de arquivos principais

**Tamanho**: ~600 linhas
**Tempo de leitura**: 10-15 minutos
**Para**: Qualquer um buscando algo específico

### 5. **SUMARIO_INVESTIGACAO.md** (Este documento)
Visão geral executiva e achados

---

## Insights Técnicos Importantes

### Prompt Dinâmico vs Hardcoded

#### Classification (HARDCODED)
```typescript
export const CLASSIFICATION_PROMPT = `Você é um especialista...`
// Para atualizar: editar arquivo + redeploy
```

#### Extraction (DINÂMICO)
```typescript
const prompt = await loadExtractionPrompt(tipoDocumento, fileSize);
// Busca em agent_prompts table
// Para atualizar: SQL INSERT/UPDATE
```

**Implicação**: Extraction pode ser otimizado sem redeploy!

### Normalização Automática de Arquivos

```
PDF/IMG     → Passa direto para Gemini
DOCX        → Converte para HTML (Mammoth.js) → Gemini
Outro       → Rejeita (400)
```

### Rastreamento de Custos

Cada execução registra:
```json
{
  "input_tokens": 1234,
  "output_tokens": 567,
  "cost_estimate": 0.00378,
  "duration_ms": 3200
}
```

**Possibilita**: Billing detalhado, otimização baseada em custos

### Deduplicação Inteligente

Map function:
- Ordena docs por prioridade (RG > CNH > MATRICULA > ...)
- Deduplicação por CPF
- Merge automático de fontes
- Rastreamento de origem de dados

---

## Fluxos Principais

### Fluxo 1: Pipeline Padrão (Minuta Completa)
```
Upload documento
    ↓
classify-document (identifica tipo)
    ↓
extract-document (extrai dados)
    ↓
map-to-fields (mapeia para schema)
    ↓
generate-minuta (gera texto notarial)
    ↓
Minuta pronta
```

**Tempo total**: ~15-25 segundos
**Custo total**: ~$0.01-0.02

### Fluxo 2: Agentes Especialistas (Customizado)
```
Upload documento(s) + prompt customizado
    ↓
agentes-especialistas/run
    ↓
Gemini processa com instrução customizada
    ↓
Resultado armazenado em agentes_especialistas_runs
    ↓
Acesso via GET /history e GET /run/:id
```

**Suporta**: DOCX (auto-converte para HTML), PDF, IMG, TXT

---

## Configuração Crítica

### Variáveis de Ambiente
```bash
SUPABASE_URL              # URL do projeto
SUPABASE_ANON_KEY         # Chave pública
SUPABASE_SERVICE_ROLE_KEY # Chave privada
GEMINI_API_KEY            # Google Cloud
```

### Limites
- Arquivo max: 20MB (agentes-especialistas)
- PDF max: 50MB (Gemini)
- Output max: 16384 tokens

### Pricing
- Input: $0.25 por 1M tokens
- Output: $1.25 por 1M tokens
- Custo médio por minuta: $0.01-0.02

---

## O Que Pode Ser Melhorado

### 1. Classification Prompt (Hardcoded)
**Problema**: Requer redeploy para atualizar
**Solução**: Mover para agent_prompts table

### 2. Processamento Sequencial
**Problema**: Se classify falha, não pode extract
**Solução**: Implementar retry automático

### 3. Sem Transações
**Problema**: Estado inconsistente se Gemini falha
**Solução**: Usar PL/pgSQL transactions

### 4. Sem Caching
**Problema**: Mesmo prompt carregado múltiplas vezes
**Solução**: In-memory cache de prompts

### 5. Sem Paralelismo
**Problema**: Múltiplos docs processados sequencialmente
**Solução**: Paralelizar classify + extract

---

## Recomendações

### Curto Prazo (1-2 semanas)
1. Documentar prompts em BD (versioning)
2. Criar dashboard de monitoring
3. Implementar alerts para erros

### Médio Prazo (1-2 meses)
1. Mover Classification para BD
2. Adicionar retry com exponential backoff
3. Implementar paralelismo (classify + extract)

### Longo Prazo (3-6 meses)
1. Fine-tune modelo customizado
2. Integração OCR on-device
3. Feedback loop para qualidade

---

## Casos de Uso Cobertos

| Caso | Function | Status |
|------|----------|--------|
| Classificar documento | classify-document | ✓ Implementado |
| Extrair dados | extract-document | ✓ Implementado |
| Mapear para schema | map-to-fields | ✓ Implementado |
| Gerar minuta | generate-minuta | ✓ Implementado |
| Análise customizada | agentes-especialistas | ✓ Implementado |
| Versionamento de prompts | agent_prompts | ✓ Parcial (somente extraction) |
| Processamento em batch | - | ✗ Não implementado |
| Webhooks | - | ✗ Não implementado |
| Cache de prompts | - | ✗ Não implementado |

---

## Como Usar Esta Documentação

### Para Arquitetos
1. Leia: INVESTIGACAO_EDGE_FUNCTIONS.md (completo)
2. Revise: ARQUITETURA_EDGE_FUNCTIONS.md (design patterns)
3. Consulte: INDICE_EDGE_FUNCTIONS.md (quando precisar procurar algo)

### Para Desenvolvedores
1. Leia: GUIA_PRATICO_EDGE_FUNCTIONS.md (exemplos)
2. Consulte: INDICE_EDGE_FUNCTIONS.md (referência rápida)
3. Revise: INVESTIGACAO_EDGE_FUNCTIONS.md (quando precisar entender)

### Para DevOps / Ops
1. Leia: GUIA_PRATICO_EDGE_FUNCTIONS.md (Seção 6 - Monitoramento)
2. Implemente: Queries SQL fornecidas
3. Configure: Alertas e dashboards

### Para Buscar Algo Específico
1. Use: INDICE_EDGE_FUNCTIONS.md (índice temático)
2. Pule para: Seção correta no documento apropriado

---

## Estatísticas da Investigação

| Métrica | Valor |
|---------|-------|
| Arquivos analisados | 30+ |
| Linhas de código mapeadas | 3000+ |
| Funções identificadas | 7 (4 pipeline + 1 dinâmico + 1 utility) |
| Endpoints documentados | 8 |
| Tipos TypeScript | 15+ |
| Tabelas do BD | 10+ |
| Documentos criados | 5 |
| Linhas de documentação | 6000+ |

---

## Arquivos Criados

```
C:\Users\Lucas\OneDrive\Documentos\PROJETOS - CODE\GOOGLE ANTIGRAVITY PROJECTS\
Minutas-Cartorio-Documentos\

├── INVESTIGACAO_EDGE_FUNCTIONS.md         (2500+ linhas)
├── GUIA_PRATICO_EDGE_FUNCTIONS.md        (1200+ linhas)
├── ARQUITETURA_EDGE_FUNCTIONS.md         (800+ linhas)
├── INDICE_EDGE_FUNCTIONS.md              (600+ linhas)
└── SUMARIO_INVESTIGACAO.md               (Este arquivo)

Total: ~6000 linhas de documentação
```

---

## Próximos Passos

### Imediato
- [ ] Revisar documentação
- [ ] Validar acurácia contra codebase
- [ ] Compartilhar com time

### Curto Prazo
- [ ] Implementar melhorias recomendadas
- [ ] Setup monitoramento
- [ ] Treinar time

### Contínuo
- [ ] Manter docs atualizado
- [ ] Rastrear mudanças em functions
- [ ] Atualizar com novos aprendizados

---

## Contato / Referência

**Investigação realizada**: 2026-02-02
**Pesquisador**: Claude Code
**Escopo**: Minutas Cartório - Edge Functions
**Status**: Completo

Para dúvidas ou clarificações, consulte:
- INDICE_EDGE_FUNCTIONS.md para navegação rápida
- INVESTIGACAO_EDGE_FUNCTIONS.md para resposta completa
- GUIA_PRATICO_EDGE_FUNCTIONS.md para exemplos práticos

---

## Conclusão

O projeto possui uma arquitetura bem estruturada de Edge Functions com:

✓ Pipeline claro e sequencial
✓ Logging completo de execuções
✓ Rastreamento de custos
✓ Sistema dinâmico de agentes
✓ Suporte a múltiplos tipos de documento
✓ Autenticação e RLS implementados

Com potencial para melhorias em:
→ Versionamento de prompts (generalizar para todos os tipos)
→ Processamento paralelo
→ Resilência (retry, transações)
→ Observabilidade (dashboards)
→ Performance (caching, otimização de prompts)

**Recomendação**: Usar documentação como base para roadmap técnico dos próximos trimestres.

---

**Investigação Concluída com Sucesso**
