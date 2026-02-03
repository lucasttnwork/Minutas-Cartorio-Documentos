# 📖 Documentação de Edge Functions - Minuta Canvas

## 🎯 O Que Você Encontra Aqui

5 documentos completos sobre a arquitetura de edge functions do projeto **Minuta Canvas**. Tudo que você precisa saber para entender, manter e criar novas edge functions.

---

## 📚 Documentos (em ordem de leitura recomendada)

### 1️⃣ QUICK_REFERENCE_EDGE_FUNCTIONS.md (⏱️ 5 min)
**Para:** Quem quer entender rápido o essencial
**Contém:** TL;DR, 3 minutos template, imports, padrões comuns, checklist

```
Comece aqui se:
✅ Tem pressa
✅ Já conhece o projeto
✅ Quer template pronto
```

---

### 2️⃣ ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md (⏱️ 30 min) ⭐ RECOMENDADO
**Para:** Entender a arquitetura completa
**Contém:** 8 shared utilities documentadas, padrão de edge function, fluxo pipeline

```
Seções:
1. Estrutura geral
2. supabase-client.ts (quando usar service vs anon)
3. file-normalizer.ts (DOCX → HTML)
4. gemini-client.ts (integração Gemini)
5. cors.ts (headers)
6. execution-logger.ts (logging com custo)
7. prompts.ts (dynamic prompts)
8. types.ts (tipos compartilhados)
9. templates.ts (templates de minuta)
10. Padrão de edge function completo
11. Importações padrão
12. Fluxo de operações
13. Variáveis de ambiente
14. Tabelas importantes
15. Otimizações
16. Checklist
17. Erros comuns
```

---

### 3️⃣ PADROES_CODIGO_EDGE_FUNCTIONS.md (⏱️ 20 min)
**Para:** Ver exemplos de código funcionando
**Contém:** 10 padrões (do simples ao complexo)

```
Padrões inclusos:
1. Estrutura básica mínima
2. Com execution logging
3. Com Gemini API
4. Com normalização de arquivo
5. Com wrapper withExecutionLogging
6. Loading prompts dinâmicos
7. Múltiplos arquivos com validação
8. Error handling robusto
9. Testes
10. Checklist

Use como template para sua edge function!
```

---

### 4️⃣ SPEC_EXTRACT_TEMPLATE_TEXT.md (⏱️ 15 min)
**Para:** Criar a edge function `extract-template-text`
**Contém:** Especificação completa + código pronto + testes

```
O que você encontra:
- Requisitos funcionais (Request/Response)
- Fluxo de execução
- Mudanças no banco (migrations)
- Código completo ready-to-use
- Testes manuais (curl commands)
- Estimativas de performance

Basicamente: copie o código e customize
```

---

### 5️⃣ DIAGRAMA_ARQUITETURA_EDGE_FUNCTIONS.md (⏱️ 10 min)
**Para:** Visualizar como tudo se conecta
**Contém:** 7 diagramas ASCII

```
Diagramas:
1. Estrutura geral (boxes)
2. Pipeline (4 passos)
3. Dependências (_shared/)
4. Fluxo de dados real (exemplo CNH + RG)
5. Esquema de banco (tabelas)
6. Fluxo detalhado (classify-document)
7. Stack completo

Útil para:
- Apresentações
- Entender fluxos
- Documentar decisões
```

---

### 6️⃣ INDICE_ARQUITETURA_EDGE_FUNCTIONS.md (⏱️ 15 min)
**Para:** Navegar e entender como usar os documentos
**Contém:** Índice, como usar, conceitos importantes, checklist

```
Contém:
- Como usar este pacote (6 cenários)
- Explicação de 5 conceitos-chave
- Checklist de implementação
- Referência rápida (imports, tabelas)
- Troubleshooting
- Próximas etapas
```

---

## 🚀 Como Começar

### Cenário 1: "Quero entender a arquitetura"
1. Leia: QUICK_REFERENCE_EDGE_FUNCTIONS.md (5 min)
2. Leia: ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md (30 min)
3. Veja: DIAGRAMA_ARQUITETURA_EDGE_FUNCTIONS.md (10 min)

**Tempo total:** ~45 min

---

### Cenário 2: "Vou criar uma nova edge function"
1. Skim: QUICK_REFERENCE_EDGE_FUNCTIONS.md (5 min)
2. Copie: Padrão relevante de PADROES_CODIGO_EDGE_FUNCTIONS.md
3. Refira: ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md conforme necessário

**Tempo total:** ~2h (desenvolvimento)

---

### Cenário 3: "Vou implementar `extract-template-text`"
1. Leia: SPEC_EXTRACT_TEMPLATE_TEXT.md (15 min)
2. Copie: Código completo
3. Execute: Migrations SQL
4. Teste: Usando curl commands
5. Integre: Com frontend

**Tempo total:** ~4h (desenvolvimento + testes)

---

### Cenário 4: "Preciso debugar uma edge function"
1. Veja: DIAGRAMA_ARQUITETURA_EDGE_FUNCTIONS.md (fluxo)
2. Compare: Com PADROES_CODIGO_EDGE_FUNCTIONS.md
3. Refira: ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md (seção relevante)
4. Consulte: Erros comuns em QUICK_REFERENCE_EDGE_FUNCTIONS.md

**Tempo total:** ~30 min

---

## 🎯 Decisões-Chave (Resumidas)

### Quando usar Service vs Anon Client

```typescript
// SERVICE (Bypass RLS - use para admin ops)
const serviceClient = createServiceClient();

// ANON (Respeita RLS - use quando possível)
const anonClient = createSupabaseClient(req);
```

### Quando normalizar arquivo

```typescript
// USE SEMPRE QUE:
// - Arquivo pode ser DOCX
// - Enviando para Gemini
const normalized = await normalizeFilesForGemini([...]);

// NÃO USE PARA:
// - PDF nativo (passa direto)
// - Imagens (passa direto)
```

### Quando logar execução

```typescript
// SEMPRE
const execution = await startExecution(serviceClient, 'classify', {...});
// ... código ...
await logSuccess(serviceClient, execution, result, {inputTokens, outputTokens});
// ou
await logError(serviceClient, execution, error);
```

### Quando carregar prompt dinamicamente

```typescript
// DINAMICAMENTE (do banco - sem deploy)
const { prompt, versao } = await loadExtractionPrompt(tipo, fileSize);

// NÃO hard-code (exige deploy para mudar)
const prompt = "fixed prompt";  // ❌ Evite
```

---

## 📊 Shared Utilities - Resumo

| Arquivo | O que faz | Quando usar |
|---------|----------|-----------|
| **cors.ts** | Headers CORS | Sempre, em toda resposta |
| **supabase-client.ts** | Cria clientes DB | Sempre |
| **gemini-client.ts** | Chama Gemini API | Quando precisa AI/ML |
| **file-normalizer.ts** | Converte DOCX→HTML | Quando aceita arquivos |
| **execution-logger.ts** | Logs com custo/tokens | Sempre |
| **prompts.ts** | Load prompts do DB | Quando usa Gemini |
| **templates.ts** | Templates de minuta | Quando gera minutas |
| **types.ts** | Tipos compartilhados | Sempre (imports) |

---

## 🔧 Padrão Padrão (Use Este!)

```typescript
serve(async (req) => {
  // 1. CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    // 2. PARSE & VALIDATE
    const { id }: RequestBody = await req.json();
    if (!id) throw new Error('id is required');

    // 3. START LOGGING
    execution = await startExecution(serviceClient, 'classify', { documentoId: id });

    // 4. FETCH & PROCESS
    const { data } = await serviceClient.from('tabela').select('*').eq('id', id).single();
    if (!data) throw new Error('Not found');

    // 5. DOWNLOAD & NORMALIZE
    const { data: fileData } = await serviceClient.storage.from('bucket').download(data.path);
    const base64 = arrayBufferToBase64(await fileData.arrayBuffer());

    // 6. CALL API
    const { text, usage } = await callGemini('prompt', base64, data.mime_type);

    // 7. PARSE RESULT
    const result = parseGeminiJson(text);

    // 8. SAVE & LOG
    await serviceClient.from('tabela').update({ result }).eq('id', id);
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });

    // 9. RETURN
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // 10. ERROR HANDLING
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

---

## 💾 Variáveis de Ambiente (Necessárias)

```bash
# Database
SUPABASE_URL=https://[projeto].supabase.co
SUPABASE_ANON_KEY=[chave-anon]
SUPABASE_SERVICE_ROLE_KEY=[chave-service-role]

# AI
GEMINI_API_KEY=[chave-google-gemini]
```

---

## 📈 Custo Estimado

| Operação | Tokens Típicos | Custo |
|----------|----------------|-------|
| Classificação | 2000 in, 200 out | ~$0.0005 |
| Extração | 4000 in, 1000 out | ~$0.002 |
| Geração | 3000 in, 2000 out | ~$0.003 |
| **Total típico por minuta** | **~20k tokens** | **~$0.01** |

---

## ✅ Checklist - Antes de Deploy

- [ ] CORS handling
- [ ] Input validation
- [ ] Execution logging (start/success/error)
- [ ] File normalization (se DOCX)
- [ ] Error handling completo
- [ ] Response format correto
- [ ] Headers corretos
- [ ] Types TypeScript
- [ ] Database updated
- [ ] Testado com arquivo real

---

## 🆘 Troubleshooting Rápido

**Q: DOCX não funciona**
A: Use `normalizeFilesForGemini()` antes

**Q: RLS policy error**
A: Troque para `createServiceClient()`

**Q: JSON parse error**
A: Use `parseGeminiJson()` não `JSON.parse()`

**Q: Custo alto**
A: Reduza `maxTokens` ou use versão compacta

**Q: Execution log failing**
A: É OK - código continua (graceful degradation)

---

## 📞 Links Rápidos

| Documento | Uso | Tempo |
|-----------|-----|-------|
| QUICK_REFERENCE | Cheat sheet | 5 min |
| ARQUITETURA | Aprender | 30 min |
| PADROES | Copiar código | 20 min |
| SPEC_EXTRACT | Criar function | 15 min |
| DIAGRAMA | Visualizar | 10 min |
| INDICE | Navegar | 15 min |

---

## 🎓 Nível de Compreensão Esperado

Após ler estes documentos, você será capaz de:

✅ Entender arquitetura geral (shared + edge functions)
✅ Explicar o fluxo de uma edge function
✅ Criar uma nova edge function seguindo padrões
✅ Debugar problemas em edge functions existentes
✅ Otimizar performance e custo
✅ Integrar com frontend (HTTP calls)
✅ Monitorar execuções e logs
✅ Documentar decisões arquiteturais

---

## 🚀 Próximas Ações

1. **Imediatamente:** Leia QUICK_REFERENCE_EDGE_FUNCTIONS.md
2. **Hoje:** Leia ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md
3. **Esta semana:** Implemente extract-template-text
4. **Próximas semanas:** Otimize conforme necessário

---

## 📝 Observações Importantes

### Sobre Gemini API
- Model: `gemini-2.0-flash` (mais rápido, barato)
- Max file: 50MB
- Max PDF pages: 1000
- Suporta: PDF, imagens, texto
- Não nativo: DOCX (use Mammoth.js)

### Sobre Deno Runtime
- Versão: STD @0.177.0
- Imports: https:// (não via npm)
- Timeout: ~30 segundos
- Memory: Limite Supabase

### Sobre Supabase Edge Functions
- Sem RLS por padrão (service role)
- JWT via Authorization header
- Storage via service role
- Database via service role

---

## 🎯 Filosofia do Projeto

> "Push complexity into deterministic code"

**O que significa:**
- Prompts versionados no DB (não hard-coded)
- Execution logging automático
- Error handling robusto
- Padrões consistentes
- Shared utilities reutilizáveis

---

## 📄 Versão & Última Atualização

- **Versão:** 1.0
- **Data:** 2026-02-02
- **Status:** Completo e pronto para produção
- **Autor:** Claude Code

---

## 🙋 FAQ Rápido

**P: Por onde começo?**
R: QUICK_REFERENCE_EDGE_FUNCTIONS.md (5 min)

**P: Preciso criar uma nova function, e agora?**
R: PADROES_CODIGO_EDGE_FUNCTIONS.md (escolha padrão + customize)

**P: Tenho dúvidas sobre `extract-template-text`?**
R: SPEC_EXTRACT_TEMPLATE_TEXT.md (tudo lá)

**P: Quero entender tudo?**
R: Leia em ordem: QUICK → ARQUITETURA → PADROES → SPEC → DIAGRAMA

**P: Qual é o arquivo mais importante?**
R: ARQUITETURA_EDGE_FUNCTIONS_RESUMO.md (visão geral)

---

## 🏆 Sucesso!

Com estes documentos, você tem tudo que precisa para:
- ✅ Entender a arquitetura
- ✅ Criar novas edge functions
- ✅ Manter o código limpo
- ✅ Debugar problemas
- ✅ Otimizar performance

**Bora começar! 🚀**

---

**Documentação completa criada em:** 2026-02-02
**Todos os arquivos prontos para produção**
