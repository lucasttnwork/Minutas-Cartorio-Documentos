# Índice - Documentação do Fluxo de Classificação

## 📚 Documentos Criados

Este conjunto de documentação fornece uma análise completa e detalhada do fluxo de classificação de documentos no sistema Minuta Canvas.

### 1. **SUMARIO_FLUXO_CLASSIFICACAO.md** (Comece por aqui!)
   **Tempo de leitura:** 10-15 minutos

   Sumário executivo com:
   - Visão rápida dos 4 estágios principais
   - Tabelas de componentes
   - Fluxo simplificado
   - Checklist de implementação
   - Stack tecnológico

   **Melhor para:** Primeira vez que você lê sobre o fluxo, precisa de overview

---

### 2. **FLUXO_CLASSIFICACAO_COMPLETO.md** (Documentação Detalhada)
   **Tempo de leitura:** 45-60 minutos

   Documentação completa com:
   - Arquitetura visual (ASCII art)
   - Fluxo de upload (seção 1)
   - Disparo de classificação (seção 2)
   - Edge function classify-document (seção 3)
   - Edge function extract-document (seção 4)
   - Edge function map-to-fields (seção 5)
   - Armazenamento de resultados (seção 6)
   - Fluxo completo timeline (seção 7)
   - Integração com frontend (seção 8)
   - Fluxo de dados: Documentos → Minuta (seção 9)
   - Error handling (seção 10)
   - Resumo de responsabilidades (seção 11)
   - Fluxo visual simplificado (seção 12)

   **Melhor para:** Entender cada componente em profundidade, debugging, arquitetura

---

### 3. **DIAGRAMAS_SEQUENCIA.md** (Diagramas UML)
   **Tempo de leitura:** 30-40 minutos

   8 diagramas de sequência ASCII detalhados:
   1. Diagrama: Upload de Documentos
   2. Diagrama: Processamento Pipeline (Simplified)
   3. Diagrama: Classificação em Detalhe
   4. Diagrama: Extração em Detalhe
   5. Diagrama: Map-to-Fields em Detalhe
   6. Diagrama: Geração de Minuta
   7. Fluxo Completo de Estados do Documento
   8. Integração com Frontend States

   **Melhor para:** Visualizar fluxos, entender sequência de chamadas, apresentações

---

### 4. **EXEMPLOS_CODIGO_FLUXO.md** (Code Snippets)
   **Tempo de leitura:** 40-50 minutos

   Exemplos funcionais de código com explicações:

   **1. Upload de Documentos**
   - UploadDocumentos.tsx (handleUploadFile)
   - useDocumentUpload.ts (uploadDocument hook)

   **2. Pipeline de Processamento**
   - Processando.tsx (integração)
   - useDocumentPipeline.ts (startPipeline, processDocument)

   **3. Edge Functions**
   - classify-document/index.ts
   - extract-document/index.ts
   - map-to-fields/index.ts

   **4. Geração de Minuta**
   - MinutaFinal.tsx (trecho principal)
   - useDocumentPipeline.ts (generateMinuta)

   **5. Data Flow Completo**
   - Fluxo end-to-end com exemplos

   **Melhor para:** Implementação, debugging, copy-paste de padrões

---

## 🎯 Como Usar Esta Documentação

### Se você precisa de...

#### ✅ Uma visão geral rápida (5-10 minutos)
→ Leia: **SUMARIO_FLUXO_CLASSIFICACAO.md**
- Seção: "Fluxo Simplificado"
- Seção: "Fluxo Detalhado por Etapa"

#### ✅ Entender como funciona o upload
→ Leia: **FLUXO_CLASSIFICACAO_COMPLETO.md** (Seção 1)
→ Veja: **DIAGRAMAS_SEQUENCIA.md** (Diagrama 1)
→ Código: **EXEMPLOS_CODIGO_FLUXO.md** (Seção 1)

#### ✅ Entender como funciona a classificação
→ Leia: **FLUXO_CLASSIFICACAO_COMPLETO.md** (Seção 3)
→ Veja: **DIAGRAMAS_SEQUENCIA.md** (Diagrama 3)
→ Código: **EXEMPLOS_CODIGO_FLUXO.md** (Seção 3)

#### ✅ Entender como funciona a extração
→ Leia: **FLUXO_CLASSIFICACAO_COMPLETO.md** (Seção 4)
→ Veja: **DIAGRAMAS_SEQUENCIA.md** (Diagrama 4)
→ Código: **EXEMPLOS_CODIGO_FLUXO.md** (Seção 3)

#### ✅ Entender o mapeamento de dados
→ Leia: **FLUXO_CLASSIFICACAO_COMPLETO.md** (Seção 5)
→ Veja: **DIAGRAMAS_SEQUENCIA.md** (Diagrama 5)
→ Código: **EXEMPLOS_CODIGO_FLUXO.md** (Seção 3)

#### ✅ Entender a geração de minuta
→ Leia: **FLUXO_CLASSIFICACAO_COMPLETO.md** (Seção 7)
→ Veja: **DIAGRAMAS_SEQUENCIA.md** (Diagrama 6)
→ Código: **EXEMPLOS_CODIGO_FLUXO.md** (Seção 4)

#### ✅ Debugar um erro
→ Leia: **FLUXO_CLASSIFICACAO_COMPLETO.md** (Seção 10)
→ Veja: **DIAGRAMAS_SEQUENCIA.md** (qualquer diagrama relevante)
→ Código: **EXEMPLOS_CODIGO_FLUXO.md** (seção relevante)

#### ✅ Implementar uma mudança
→ Código: **EXEMPLOS_CODIGO_FLUXO.md** (seção relevante)
→ Leia: **FLUXO_CLASSIFICACAO_COMPLETO.md** (para contexto)

#### ✅ Apresentar o fluxo para alguém
→ Veja: **DIAGRAMAS_SEQUENCIA.md** (Diagrama 2 ou 12)
→ Leia: **SUMARIO_FLUXO_CLASSIFICACAO.md** (Seção: "Fluxo Simplificado")

---

## 📋 Mapa de Conteúdo por Tópico

### Upload
- **SUMARIO**: Seção "Upload"
- **COMPLETO**: Seção 1 "Upload de Documentos"
- **DIAGRAMAS**: Diagrama 1 "Upload de Documentos"
- **CODIGO**: Seção 1 "Upload de Documentos"
- **Arquivos**: `UploadDocumentos.tsx`, `useDocumentUpload.ts`

### Classificação
- **SUMARIO**: Seção "Classificação"
- **COMPLETO**: Seção 3 "classify-document"
- **DIAGRAMAS**: Diagrama 2, 3
- **CODIGO**: Seção 3 "classify-document"
- **Arquivo**: `supabase/functions/classify-document/index.ts`

### Extração
- **SUMARIO**: Seção "Extração"
- **COMPLETO**: Seção 4 "extract-document"
- **DIAGRAMAS**: Diagrama 2, 4
- **CODIGO**: Seção 3 "extract-document"
- **Arquivo**: `supabase/functions/extract-document/index.ts`

### Mapeamento
- **SUMARIO**: Seção "Mapeamento"
- **COMPLETO**: Seção 5 "map-to-fields"
- **DIAGRAMAS**: Diagrama 2, 5
- **CODIGO**: Seção 3 "map-to-fields"
- **Arquivo**: `supabase/functions/map-to-fields/index.ts`

### Geração
- **SUMARIO**: Seção "Geração"
- **COMPLETO**: Seção 7 "Geração de Minuta"
- **DIAGRAMAS**: Diagrama 6
- **CODIGO**: Seção 4 "Geração de Minuta"
- **Arquivo**: `supabase/functions/generate-minuta/index.ts`

### Pipeline (Orquestração)
- **SUMARIO**: Seção "Fluxo Sequencial"
- **COMPLETO**: Seção 2 "Disparo de Classificação"
- **DIAGRAMAS**: Diagrama 2
- **CODIGO**: Seção 2 "Pipeline de Processamento"
- **Arquivo**: `useDocumentPipeline.ts`

### Database
- **SUMARIO**: Seção "Custo e Performance"
- **COMPLETO**: Seção 6 "Armazenamento e Fluxo de Resultados"
- **DIAGRAMAS**: Diagrama 7
- **CODIGO**: Seção 5 "Data Flow Completo"

### Integração Frontend
- **SUMARIO**: Seção "Stack"
- **COMPLETO**: Seção 8 "Integração com Frontend"
- **DIAGRAMAS**: Diagrama 8
- **CODIGO**: Seção 2 "Processando.tsx"

### Error Handling
- **SUMARIO**: Seção "Tratamento de Erros"
- **COMPLETO**: Seção 10 "Error Handling"
- **DIAGRAMAS**: Seção 7 "Fluxo Completo"

---

## 📊 Estrutura de Todos os Documentos

```
SUMARIO (Executivo)
├─ Visão Rápida
├─ Fluxo Simplificado
├─ Principais Componentes
├─ Fluxo Detalhado por Etapa (7 partes)
├─ Estados do Documento
├─ Fluxo Sequencial
├─ Integração com Frontend States
├─ Tratamento de Erros
├─ Custo e Performance
├─ Arquitetura Visual
├─ Fluxo Completo com Tempos
├─ Checklist de Implementação
└─ Conclusão

COMPLETO (Documentação Detalhada)
├─ Visão Geral
├─ 1. Upload de Documentos
├─ 2. Disparo de Classificação
├─ 3. Edge Function: classify-document
├─ 4. Edge Function: extract-document
├─ 5. Edge Function: map-to-fields
├─ 6. Armazenamento de Resultados
├─ 7. Fluxo Completo: Timeline
├─ 8. Integração com Frontend
├─ 9. Fluxo de Dados
├─ 10. Error Handling
├─ 11. Resumo de Responsabilidades
└─ 12. Fluxo Visual Simplificado

DIAGRAMAS (UML e ASCII Art)
├─ 1. Upload de Documentos
├─ 2. Processamento Pipeline
├─ 3. Classificação em Detalhe
├─ 4. Extração em Detalhe
├─ 5. Map-to-Fields em Detalhe
├─ 6. Geração de Minuta
├─ 7. Fluxo Completo de Estados
└─ 8. Integração com Frontend

CODIGO (Exemplos Funcionais)
├─ 1. Upload de Documentos
│  ├─ UploadDocumentos.tsx
│  └─ useDocumentUpload.ts
├─ 2. Pipeline de Processamento
│  ├─ Processando.tsx
│  └─ useDocumentPipeline.ts
├─ 3. Edge Functions
│  ├─ classify-document
│  ├─ extract-document
│  └─ map-to-fields
├─ 4. Geração de Minuta
│  ├─ MinutaFinal.tsx
│  └─ generateMinuta hook
└─ 5. Data Flow Completo
```

---

## 🔗 Referência Cruzada Rápida

### Por Arquivo de Código

**UploadDocumentos.tsx**
→ SUMARIO: "Upload" | COMPLETO: Seção 1 | DIAGRAMAS: Diagrama 1 | CODIGO: Seção 1

**useDocumentUpload.ts**
→ SUMARIO: "Upload" | COMPLETO: Seção 1 | DIAGRAMAS: Diagrama 1 | CODIGO: Seção 1

**Processando.tsx**
→ SUMARIO: "Fluxo Simplificado" | COMPLETO: Seção 2 | DIAGRAMAS: Diagrama 2 | CODIGO: Seção 2

**useDocumentPipeline.ts**
→ SUMARIO: "Fluxo Sequencial" | COMPLETO: Seção 2 | DIAGRAMAS: Diagrama 2 | CODIGO: Seção 2

**classify-document/index.ts**
→ SUMARIO: "Classificação" | COMPLETO: Seção 3 | DIAGRAMAS: Diagrama 3 | CODIGO: Seção 3

**extract-document/index.ts**
→ SUMARIO: "Extração" | COMPLETO: Seção 4 | DIAGRAMAS: Diagrama 4 | CODIGO: Seção 3

**map-to-fields/index.ts**
→ SUMARIO: "Mapeamento" | COMPLETO: Seção 5 | DIAGRAMAS: Diagrama 5 | CODIGO: Seção 3

**MinutaFinal.tsx**
→ SUMARIO: "Geração" | COMPLETO: Seção 7 | DIAGRAMAS: Diagrama 6 | CODIGO: Seção 4

**generate-minuta/index.ts**
→ SUMARIO: "Geração" | COMPLETO: Seção 7 | DIAGRAMAS: Diagrama 6 | CODIGO: Seção 4

---

## 💾 Arquivos Citados

### Frontend React
- `src/pages/UploadDocumentos.tsx`
- `src/pages/Processando.tsx`
- `src/pages/MinutaFinal.tsx`
- `src/pages/ConferenciaOutorgantes.tsx`
- `src/pages/ConferenciaOutorgados.tsx`
- `src/pages/ConferenciaImoveis.tsx`
- `src/pages/ConferenciaNegocio.tsx`

### Hooks React
- `src/hooks/useDocumentUpload.ts`
- `src/hooks/useDocumentPipeline.ts`
- `src/hooks/useMinutaDatabase.ts`
- `src/hooks/useMinuta.ts` (Context)

### Edge Functions
- `supabase/functions/classify-document/index.ts`
- `supabase/functions/extract-document/index.ts`
- `supabase/functions/map-to-fields/index.ts`
- `supabase/functions/generate-minuta/index.ts`

### Database Tables
- `documentos`
- `minutas`
- `pessoas_naturais`
- `pessoas_juridicas`
- `imoveis`
- `negocios_juridicos`
- `alertas_juridicos`
- `prompts`
- `execution_logs`

---

## ⏱️ Tempo de Leitura Estimado

| Documento | Tempo | Nível |
|-----------|-------|-------|
| SUMARIO | 10-15 min | Iniciante/Gerente |
| COMPLETO | 45-60 min | Desenvolvedor |
| DIAGRAMAS | 30-40 min | Visual Learner |
| CODIGO | 40-50 min | Implementador |
| **TOTAL** | **2-3 horas** | Especialista |

**Recomendação:**
1. Comece com SUMARIO (visão geral)
2. Leia COMPLETO de cima para baixo (arquitetura)
3. Consulte DIAGRAMAS conforme necessário (visualização)
4. Use CODIGO como referência durante implementação

---

## 📞 Próximos Passos

Após ler esta documentação:

1. **Para Gerenciar:**
   - Leia apenas SUMARIO
   - Revise timeline (seção "Fluxo Completo com Tempos")
   - Consulte checklist de implementação

2. **Para Implementar:**
   - Leia COMPLETO (seção relevante)
   - Consulte DIAGRAMAS (diagrama relevante)
   - Use CODIGO (snippets funcionais)
   - Verifique testes correspondentes

3. **Para Debugar:**
   - Consulte COMPLETO (seção "Error Handling")
   - Verifique DIAGRAMAS (fluxo de execução)
   - Trace através de CODIGO (busque o erro)

4. **Para Apresentar:**
   - Use SUMARIO (visão geral)
   - Mostre DIAGRAMAS (visual)
   - Demo CODIGO (proof of concept)

---

## 📝 Notas

- Todos os diagramas são em ASCII art (compatíveis com markdown)
- Todos os exemplos de código são extratos funcionais reais
- Tempos estimados podem variar dependendo do background técnico
- Esta documentação é versionada com o código (mantenha sincronizado)

---

**Última atualização:** 2026-02-02
**Versão:** 1.0
**Status:** Completo e Pronto para Produção
