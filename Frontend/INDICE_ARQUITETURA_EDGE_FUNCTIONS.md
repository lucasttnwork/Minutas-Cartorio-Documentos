# Índice de Documentação - Arquitetura Edge Functions

## 📚 Documentos Criados

Este pacote contém 4 documentos que cobrem completamente a arquitetura de edge functions do projeto:

### 1. **ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md** ⭐ COMECE AQUI
**Objetivo:** Visão completa da arquitetura existente

**Contém:**
- Estrutura geral de diretórios
- Documentação de TODAS as shared utilities
  - `supabase-client.ts` (clientes Supabase)
  - `file-normalizer.ts` (conversão de arquivos)
  - `gemini-client.ts` (integração com Gemini)
  - `cors.ts` (headers CORS)
  - `execution-logger.ts` (logging com custo)
  - `prompts.ts` (prompts dinâmicos)
  - `types.ts` (tipos compartilhados)
  - `templates.ts` (templates de minuta)
- Padrão de Edge Function completo
- Importações padrão
- Fluxo pipeline classificação → extração → geração
- Variáveis de ambiente
- Tabelas do banco importantes
- Otimizações e boas práticas
- Checklist para nova edge function
- Padrão de erros comuns

**Leia se:** Quer entender a arquitetura geral e padrões existentes

---

### 2. **PADROES_CODIGO_EDGE_FUNCTIONS.md** 🎨 EXEMPLOS PRÁTICOS
**Objetivo:** 10 padrões de código do mais simples ao mais complexo

**Contém:**
- **Padrão 1:** Estrutura básica mínima
- **Padrão 2:** Com execution logging completo
- **Padrão 3:** Com Gemini API
- **Padrão 4:** Com normalização de arquivo (DOCX → HTML)
- **Padrão 5:** Com wrapper `withExecutionLogging` (mais limpo)
- **Padrão 6:** Loading prompts dinâmicos do banco
- **Padrão 7:** Múltiplos arquivos com validação
- **Padrão 8:** Error handling robusto
- **Padrão 9:** Testes (local testing patterns)
- **Padrão 10:** Checklist de completude

**Cada padrão inclui:**
- Código completo e comentado
- Quando usar este padrão
- Vantagens e desvantagens
- Caso de uso específico

**Leia se:** Quer exemplos prontos para copiar/adaptar

---

### 3. **SPEC_EXTRACT_TEMPLATE_TEXT.md** 🚀 PARA SUA NOVA FUNÇÃO
**Objetivo:** Especificação completa da edge function que você precisa criar

**Contém:**
- Resumo executivo
- Requisitos funcionais (Request/Response)
- Fluxo de execução passo-a-passo
- Mudanças no banco de dados necessárias
- Implementação detalhada com código completo
- Testes manuais (curl commands)
- Próximos passos após implementação
- Estimativas de performance e custo
- Checklist final antes de deploy

**Use para:**
1. Copiar o código completo para `supabase/functions/extract-template-text/index.ts`
2. Executar as migrations SQL
3. Testar manualmente
4. Compreender a especificação completamente

---

### 4. **DIAGRAMA_ARQUITETURA_EDGE_FUNCTIONS.md** 📊 VISUALIZAÇÕES
**Objetivo:** Diagramas ASCII de arquitetura, fluxos e relações

**Contém:**
- Estrutura geral (boxes e setas)
- Pipeline de processamento (4 passos)
- Diagrama de dependências (_shared/)
- Fluxo de dados (exemplo real: CNH + RG)
- Esquema de banco (tabelas e relações)
- Fluxo detalhado de execução (classify-document)
- Stack completo (frontend, edge, infrastructure)

**Útil para:**
- Visualizar como tudo se conecta
- Apresentações
- Documentar decisões arquiteturais
- Onboarding de novos devs

---

## 🎯 Como Usar Este Pacote

### Cenário 1: Entender a Arquitetura Existente
1. Leia: **ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md**
2. Veja: **DIAGRAMA_ARQUITETURA_EDGE_FUNCTIONS.md**
3. Explore: Código em `supabase/functions/`

### Cenário 2: Criar uma Nova Edge Function
1. Leia: **PADROES_CODIGO_EDGE_FUNCTIONS.md** (escolha o padrão)
2. Use: Código como template
3. Adapte: Para seu caso de uso
4. Valide: Com os requisitos do projeto

### Cenário 3: Implementar `extract-template-text`
1. Leia: **SPEC_EXTRACT_TEMPLATE_TEXT.md** (completo)
2. Copie: Código para `supabase/functions/extract-template-text/index.ts`
3. Execute: Migrations SQL
4. Teste: Com exemplos fornecidos
5. Deploy: Seguindo checklist

### Cenário 4: Debug de Edge Function Existente
1. Veja: **DIAGRAMA_ARQUITETURA_EDGE_FUNCTIONS.md** (fluxo)
2. Leia: **ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md** (seções relevantes)
3. Compare: Com **PADROES_CODIGO_EDGE_FUNCTIONS.md** (seu código)
4. Identifique: Desvio do padrão esperado

### Cenário 5: Otimizar Performance
1. Leia: **ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md** (otimizações)
2. Consulte: **PADROES_CODIGO_EDGE_FUNCTIONS.md** (Padrão 6 - prompts dinâmicos)
3. Ajuste: Temperatura, maxTokens, etc conforme necessário

---

## 🔑 Conceitos Importantes Explicados

### 1. Service vs Anon Client
**Service Client:**
```typescript
createServiceClient()  // Bypass RLS (Row Level Security)
```
- Use para: Operações admin, logging, acesso sem restrições
- Cuidado: Pede SUPABASE_SERVICE_ROLE_KEY (mais privilegiado)

**Anon Client:**
```typescript
createSupabaseClient(req)  // Respeita RLS
```
- Use para: Operações que respeitam permissões do usuário
- Seguro: Passa JWT de autorização

### 2. File Normalization
**Problema:** DOCX não é suportado nativamente por Gemini
**Solução:** Converter DOCX → HTML usando Mammoth.js

```typescript
const normalized = await normalizeFilesForGemini([...]);
const { content, mimeType, wasConverted } = normalized.files[0];
```

### 3. Execution Logging
**Rastreia:**
- Quando começou (started_at)
- Quando terminou (completed_at)
- Tokens de entrada/saída
- Custo estimado (baseado em pricing Gemini)
- Erro se houver

**Útil para:**
- Monitorar uso de API
- Calcular custo por operação
- Debug de problemas
- Análise de performance

### 4. Dynamic Prompts
**Benefit:** Mudar prompts sem fazer deploy

```typescript
// No banco: agent_prompts table
SELECT prompt_text, versao
FROM agent_prompts
WHERE tipo_documento = 'RG'
AND ativo = true
ORDER BY versao DESC
LIMIT 1
```

### 5. CORS (Cross-Origin Resource Sharing)
**Necessário para:** Frontend chamar edge functions
**Implementação:**
```typescript
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
// Toda resposta tem: { ...corsHeaders, 'Content-Type': 'application/json' }
```

---

## 📋 Checklist de Implementação - `extract-template-text`

### Fase 1: Preparação
- [ ] Ler SPEC_EXTRACT_TEMPLATE_TEXT.md completamente
- [ ] Entender o fluxo de execução esperado
- [ ] Verificar estrutura do banco de dados

### Fase 2: Implementação
- [ ] Criar arquivo: `supabase/functions/extract-template-text/index.ts`
- [ ] Copiar código de SPEC_EXTRACT_TEMPLATE_TEXT.md
- [ ] Adaptar tipos e interfaces conforme necessário
- [ ] Revisar imports de _shared/

### Fase 3: Banco de Dados
- [ ] Executar migrations para adicionar colunas em `minutas_padrao`
- [ ] Verificar se tabelas existem (documentos, minutas_padrao, agent_executions)
- [ ] Configurar RLS policies se necessário

### Fase 4: Testes
- [ ] Upload arquivo de teste no Storage
- [ ] Inserir registro na tabela `minutas_padrao`
- [ ] Chamar função com curl (comando em SPEC)
- [ ] Verificar resposta esperada
- [ ] Testar com PDF, DOCX, etc

### Fase 5: Integração
- [ ] Chamar a função do frontend (HTTP POST)
- [ ] Validar resposta
- [ ] Tratar erros
- [ ] Mostrar progresso/resultado ao usuário

### Fase 6: Produção
- [ ] Review de código
- [ ] Performance testing
- [ ] Security review
- [ ] Deploy
- [ ] Monitor execução e custos

---

## 🔗 Referência Rápida

### Imports Padrão (Copia e Cola)
```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { normalizeFilesForGemini } from '../_shared/file-normalizer.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';
import { loadExtractionPrompt } from '../_shared/prompts.ts';
import type { ClassificationResult } from '../_shared/types.ts';
```

### Estrutura Mínima (Copia e Cola)
```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    // Seu código aqui

    return new Response(
      JSON.stringify({ success: true, data: {} }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (execution.id) {
      await logError(serviceClient, execution, error as Error);
    }

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Variáveis de Ambiente Necessárias
```bash
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=[chave anon]
SUPABASE_SERVICE_ROLE_KEY=[chave service role]
GEMINI_API_KEY=[chave Google Gemini]
```

### Tabelas Principais
| Tabela | Descrição |
|--------|-----------|
| `documentos` | Arquivos enviados pelos usuários |
| `minutas` | Documentos finais gerados |
| `minutas_padrao` | Templates de minuta |
| `agent_executions` | Log de execuções com custo/tokens |
| `agent_prompts` | Prompts versionados por tipo |

---

## 💡 Dicas Importantes

### Performance
1. Use `withExecutionLogging()` wrapper quando possível (menos código)
2. Carregue prompts dinamicamente (sem hard-coding)
3. Normalize arquivos DOCX antes de enviar para Gemini
4. Use `temperature: 0.1` para extração (determinístico)
5. Use `temperature: 0.3-0.5` para geração (mais criativo)

### Segurança
1. Sempre use `createServiceClient()` para bypass de RLS
2. Validate inputs no início da função
3. Trate erros sem expor detalhes sensíveis
4. Log erros com console.error (depois da resposta)
5. Use JWT Authorization header corretamente

### Custo (Gemini 2.0-Flash)
- Input: $0.25 por 1M tokens
- Output: $1.25 por 1M tokens
- Monitor com agent_executions.cost_estimate
- Exemplo: 2500 input + 1200 output = ~$0.003

### Debugging
1. Use console.log() para logs (visível em logs)
2. Guarde primeira resposta de Gemini em arquivo (JSON é frágil)
3. Test parseGeminiJson() separadamente
4. Valide tipos antes de usar
5. Sempre capture execution.id para erro logging

---

## 📞 Suporte Rápido

**Erro: "DOCX file not supported"**
→ Use `normalizeFilesForGemini()` antes

**Erro: "RLS policy violation"**
→ Troque para `createServiceClient()`

**Erro: "Unexpected token in JSON"**
→ Use `parseGeminiJson()` não `JSON.parse()`

**Erro: "Template not found"**
→ Verifique SELECT query e permissões RLS

**Erro: "Failed to download file"**
→ Verifique storage_path e permissões Storage

**Custo alto?"**
→ Reduza maxTokens ou use versão compacta para arquivos grandes

---

## 🚀 Próximas Etapas Sugeridas

1. **Imediatamente:**
   - Leia ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md

2. **Hoje:**
   - Escolha padrão em PADROES_CODIGO_EDGE_FUNCTIONS.md
   - Comece implementação de extract-template-text

3. **Esta semana:**
   - Complete implementação
   - Testes manuais
   - Integração com frontend

4. **Próximas semanas:**
   - Otimize performance
   - Monitore custos
   - Implemente outras edge functions conforme necessário

---

## 📄 Resumo Executivo

A arquitetura de edge functions neste projeto segue padrões bem definidos:

**Arquitetura:**
- Deno runtime (serverless)
- Integração com Supabase DB
- Google Gemini para AI/ML
- Logging de execução com custo

**Padrão Principal:**
1. Parse request → Validate → Start logging
2. Fetch data → Normalize files → Call API
3. Parse response → Update DB → Log success
4. Return response ou catch error

**Shared Utils (7):**
1. cors - Headers CORS
2. supabase-client - DB access (service + anon)
3. gemini-client - API calls + JSON parsing
4. file-normalizer - DOCX → HTML conversion
5. execution-logger - Tracking com custo/tokens
6. prompts - Dynamic prompt loading
7. templates - Minuta templates + placeholder handling

**Próximo Passo:**
Implementar `extract-template-text` seguindo SPEC_EXTRACT_TEMPLATE_TEXT.md

---

## 📚 Organizando Estes Documentos

Recomendamos salvar em:
```
Frontend/
├── ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md
├── PADROES_CODIGO_EDGE_FUNCTIONS.md
├── SPEC_EXTRACT_TEMPLATE_TEXT.md
├── DIAGRAMA_ARQUITETURA_EDGE_FUNCTIONS.md
└── INDICE_ARQUITETURA_EDGE_FUNCTIONS.md (este arquivo)
```

Todos referenciados em `README.md` do projeto para fácil acesso.

---

**Criado em:** 2026-02-02
**Versão:** 1.0
**Status:** Completo e pronto para uso

Qualquer dúvida, consulte o documento específico ou o índice acima! 🚀
