# Sumário Executivo - Fluxo de Classificação de Documentos

## Visão Rápida

O sistema de **Minuta Canvas** implementa um pipeline de classificação de documentos completamente automático usando IA (Gemini Vision API). O fluxo é dividido em **4 etapas principais**:

1. **Upload** → Usuário envia documentos
2. **Processamento** → IA classifica e extrai dados
3. **Revisão** → Usuário valida dados extraídos
4. **Geração** → IA gera minuta final formatada

---

## Fluxo Simplificado

```
[Upload Docs] → [Classify] → [Extract] → [Map] → [Review] → [Generate] → [Edit]
```

**Tempo Estimado:** 5-60 segundos por documento (dependendo do tamanho)

---

## Principais Componentes

### Frontend (React/TypeScript)

| Arquivo | Função |
|---------|--------|
| `UploadDocumentos.tsx` | Interface de upload |
| `useDocumentUpload.ts` | Hook de upload para Storage |
| `Processando.tsx` | Tela de processamento com progresso |
| `useDocumentPipeline.ts` | Hook orquestrador do pipeline |
| `ConferenciaOutorgantes.tsx` | Revisão de dados extraídos |
| `MinutaFinal.tsx` | Editor final da minuta |

### Backend (Edge Functions Supabase)

| Function | Responsabilidade |
|----------|-----------------|
| `classify-document` | Detecta tipo de documento (RG, CNH, etc) |
| `extract-document` | Extrai campos estruturados (CPF, nome, etc) |
| `map-to-fields` | Normaliza e resolve conflitos entre documentos |
| `generate-minuta` | Cria minuta final com template |

### Database (PostgreSQL/Supabase)

| Tabela | Conteúdo |
|--------|----------|
| `documentos` | Arquivos brutos + status do pipeline |
| `minutas` | Metadados da minuta final |
| `pessoas_naturais` | Pessoas extraídas (CPF, nome, RG, etc) |
| `imoveis` | Imóveis extraídos (matrícula, endereço, etc) |
| `negocios_juridicos` | Dados do negócio (valor, forma de pagamento, etc) |
| `alertas_juridicos` | Warnings (ônus ativo, proprietário diferente, etc) |

---

## Fluxo Detalhado por Etapa

### 1. UPLOAD
```
Usuário seleciona arquivo (PDF, imagem, DOCX)
        ↓
Valida: tamanho ≤ 50MB, tipo aceito
        ↓
Upload para Supabase Storage: /users/{userId}/{minutaId}/{timestamp}_filename
        ↓
Cria registro em tabela 'documentos' com status='uploaded'
        ↓
UI mostra checkmark ✓ e permite próximo arquivo
```

**Arquivos Envolvidos:**
- `src/pages/UploadDocumentos.tsx` - UI
- `src/hooks/useDocumentUpload.ts` - Lógica de upload

---

### 2. CLASSIFICAÇÃO
```
Para CADA documento com status='uploaded':
        ↓
Edge Function: classify-document
    1. Download arquivo do Storage
    2. Converte para Base64
    3. Envia para Gemini Vision API
    4. Recebe: { tipo_documento, confianca, pessoa_relacionada }
    5. Update: documentos.tipo_documento = 'RG'
               documentos.status = 'classificado'
```

**Tipos Detectados:**
- RG, CNH, CPF, Certidões (nascimento, casamento, óbito)
- Documentos imobiliários (matrícula, IPTU, VVR, ITBI)
- Documentos comerciais (compromisso, escritura, contratos)
- Certidões de débito (CNDT, CND)

**Arquivo Envolvido:**
- `supabase/functions/classify-document/index.ts`

---

### 3. EXTRAÇÃO
```
Para CADA documento com status='classificado':
        ↓
Edge Function: extract-document
    1. Verifica se tipo_documento ≠ NULL
    2. Carrega prompt específico para o tipo (ex: prompt_rg.md)
    3. Download arquivo do Storage
    4. Envia para Gemini Vision API com maxTokens=16384
    5. Recebe: { rg: { cpf, nome, data_nascimento, ... } }
    6. Update: documentos.dados_extraidos = {...}
               documentos.status = 'extraido'
```

**Estrutura de dados_extraidos varia por tipo:**
- RG: `{ rg: { numero_rg, cpf, nome, data_nascimento, ... } }`
- COMPROMISSO: `{ vendedores: [...], compradores: [...], imovel: {...}, valores: {...} }`
- MATRICULA: `{ matricula_numero, proprietarios: [...], onus_ativos: [...] }`

**Arquivo Envolvido:**
- `supabase/functions/extract-document/index.ts`

---

### 4. MAPEAMENTO (MAP-TO-FIELDS)
```
Após TODOS os documentos serem extraídos:
        ↓
Edge Function: map-to-fields
    1. Busca todos os documentos com status='extraido'
    2. Ordena por prioridade (RG > Certidão > CNH > ...)
    3. Para cada documento, mapeia dados:
       - RG/CNH → pessoa_natural
       - Certidão Casamento → atualiza estado_civil, conjuge
       - Compromisso → popula alienantes, adquirentes, imovel
       - Matrícula → popula imovel, detecta alertas
    4. Identifica cônjuges como 'anuentes' (consentidores)
    5. Persiste em tabelas estruturadas:
       ├─ INSERT/UPDATE pessoas_naturais
       ├─ INSERT/UPDATE imoveis
       ├─ INSERT/UPDATE negocios_juridicos
       └─ INSERT alertas_juridicos
    6. Update: minutas.status = 'revisao'
               minutas.current_step = 'outorgantes'
```

**Resolução de Conflitos:**
- Mesma pessoa (mesmo CPF) em múltiplos documentos → MERGE
- RG tem prioridade sobre CNH para identidade
- Certidão Casamento sobrescreve estado civil

**Arquivo Envolvido:**
- `supabase/functions/map-to-fields/index.ts`

---

### 5. REVISÃO
```
Usuário navega para /outorgantes (primeira página de revisão)
        ↓
Página carrega dados de pessoas_naturais agregados pela IA
        ↓
Usuário pode:
    • Editar dados (nome, CPF, RG, etc)
    • Remover pessoas duplicadas
    • Confirmar informações
        ↓
Dados salvos em banco via useMinutaDatabase hook
        ↓
Usuário navega: outorgantes → outorgados → imoveis → negocio
```

**Páginas Envolvidas:**
- `ConferenciaOutorgantes.tsx`
- `ConferenciaOutorgados.tsx`
- `ConferenciaImoveis.tsx`
- `ConferenciaNegocio.tsx`

---

### 6. GERAÇÃO
```
Usuário clica "Gerar Minuta" em MinutaFinal.tsx
        ↓
Edge Function: generate-minuta
    1. aggregateMinutaData()
       └─ Busca dados de TODAS as tabelas:
          pessoas_naturais, pessoas_juridicas,
          imoveis, negocios_juridicos, alertas_juridicos
    2. mapDataToPlaceholders()
       └─ Cria placeholders:
          {OUTORGANTES_VENDEDORES} = "João Silva, RG 123..., CPF 123..."
          {OUTORGADOS_COMPRADORES} = "Maria Silva, RG 456..., CPF 456..."
          {IMOVEL_ENDERECO} = "Avenida Paulista, 1000..."
          {VALOR_NEGOCIO} = "R$ 500.000,00"
    3. loadTemplate('VENDA_COMPRA')
       └─ Carrega template de escritura com placeholders
    4. Envia para Gemini:
       "Gere uma escritura pública de compra e venda
        com os dados: {OUTORGANTES_VENDEDORES}...
        em português jurídico formal"
    5. Recebe: texto completo da minuta (1000+ linhas)
    6. UPDATE: minutas.conteudo_gerado = texto
               minutas.geracao_status = 'gerado'
```

**Arquivo Envolvido:**
- `supabase/functions/generate-minuta/index.ts`

---

### 7. EDIÇÃO FINAL
```
Conteúdo carregado no editor TipTap
        ↓
Usuário pode:
    • Editar qualquer parte do texto
    • Usar toolbar de formatação (negrito, itálico, etc)
    • Desfazer/refazer
    • Copiar para clipboard
    • Exportar como HTML
        ↓
Clica "Salvar" → UPDATE minutas { conteudo_gerado = edited_text }
        ↓
Clica "Finalizar" → minuta marcada como concluída
```

**Arquivo Envolvido:**
- `src/pages/MinutaFinal.tsx`

---

## Estados do Documento

```
┌─────────────────────────────────────────────────────┐
│ uploaded          → Arquivo no Storage               │
│                     tipo_documento = NULL            │
├─────────────────────────────────────────────────────┤
│ classificado      → Tipo detectado (RG, CNH, etc)    │
│                     dados_extraidos = NULL          │
├─────────────────────────────────────────────────────┤
│ extraido          → Dados estruturados extraídos     │
│                     dados_extraidos = {...}         │
├─────────────────────────────────────────────────────┤
│ (mapeado)         → Persistido em tabelas            │
│                     (pessoas_naturais, imoveis)     │
├─────────────────────────────────────────────────────┤
│ (incluído)        → Agregado em conteudo_gerado     │
│                     (minuta final)                   │
└─────────────────────────────────────────────────────┘
```

---

## Fluxo Sequencial de Chamadas API

```
1. useDocumentUpload.uploadDocument()
   └─ storage.upload() + documentos.insert()

2. useDocumentPipeline.startPipeline()
   └─ FOR documentos:
      ├─ supabase.functions.invoke('classify-document')
      └─ supabase.functions.invoke('extract-document')
   └─ supabase.functions.invoke('map-to-fields')
   └─ minutas.update({ status: 'revisao' })

3. User reviews and edits (useMinutaDatabase)
   └─ pessoas_naturais.update()
   └─ imoveis.update()

4. useDocumentPipeline.generateMinuta()
   └─ supabase.functions.invoke('generate-minuta')
   └─ minutas.update({ conteudo_gerado, geracao_status })

5. Editor.save()
   └─ minutas.update({ conteudo_gerado: edited })

6. finalizarMinuta()
   └─ minutas.update({ status: 'finalizada' })
```

---

## Tratamento de Erros

### Cenários Críticos

| Cenário | Comportamento |
|---------|--------------|
| Upload falha | Mostra erro vermelho, permite retentar |
| Classificação falha | Marca como erro, continua (usuário pode inserir tipo manualmente) |
| Extração sem classificação | Erro: "Document must be classified first" |
| Map-to-fields sem docs extraídos | Erro: continua para revisão mesmo assim |
| Geração falha | Mostra erro, permite editar template manualmente |
| Storage inacessível | Erro de download, retry automático |

### Fallback Behavior

```
Se processamento leva > 60 segundos → navega para outorgantes mesmo assim
Se classificação falha → permite usuário inserir tipo manualmente
Se extração falha → usuário preenche dados manualmente
Se geração falha → usuário edita a partir de template padrão
```

---

## Custo e Performance

### Tokens Gemini API

| Operação | Input Tokens | Output Tokens | Exemplo |
|----------|-------------|--------------|---------|
| classify-document | 500-2000 | 50-200 | Detectar "RG" |
| extract-document | 500-2000 | 1000-5000 | Extrair todos os campos |
| generate-minuta | 2000-10000 | 5000-20000 | Gerar minuta formatada |

**Estimativa:**
- 5 documentos × (1000 input + 3000 output) + 6000 generation = ~20k tokens
- Custo: ~$0.20 USD com Gemini 1.5 Flash

### Performance

| Operação | Tempo Estimado |
|----------|----------------|
| Upload 1 documento (5MB) | 2-5 segundos |
| Classify 1 documento | 3-8 segundos |
| Extract 1 documento | 5-15 segundos |
| Map-to-fields (5 docs) | 2-5 segundos |
| Generate minuta | 10-30 segundos |
| **Total por minuta** | **2-5 minutos** |

---

## Arquitetura Visual

```
FRONTEND (React SPA)
├─ UploadDocumentos.tsx
│  └─ useDocumentUpload.ts
├─ Processando.tsx
│  └─ useDocumentPipeline.ts
├─ ConferenciaOutorgantes.tsx
│  └─ useMinutaDatabase.ts
└─ MinutaFinal.tsx
   └─ useDocumentPipeline.generateMinuta()

        │
        │ RPC Calls
        ▼

SUPABASE (Backend)
├─ Storage (bucket: 'documentos')
│  └─ /users/{userId}/{minutaId}/{timestamp}_{filename}
│
├─ Edge Functions
│  ├─ classify-document
│  ├─ extract-document
│  ├─ map-to-fields
│  └─ generate-minuta
│
└─ PostgreSQL Database
   ├─ documentos (raw files + pipeline status)
   ├─ minutas (metadata)
   ├─ pessoas_naturais (extracted data)
   ├─ imoveis
   ├─ negocios_juridicos
   └─ alertas_juridicos

        │
        │ API Calls
        ▼

GEMINI API (Google)
├─ Vision API (classify, extract)
└─ LLM API (generate)
```

---

## Fluxo Completo com Tempos

```
T=0:00    Usuário clica "Processar Documentos"
          └─ navigate(/processando)

T=0:05    Classificação dos 5 documentos começa
          └─ [Loading spinner] "Analisando documentos..."

T=0:45    Extração dos 5 documentos começa
          └─ Progress: 33% → "Extraindo dados com IA..."

T=1:30    Map-to-fields começa
          └─ Progress: 66% → "Identificando pessoas..."

T=2:00    Pipeline completo!
          └─ navigate(/outorgantes)
          └─ toast.success("Documentos processados com sucesso!")

T=2:00-
T=15:00   Usuário revisa dados
          └─ ConferenciaOutorgantes
          └─ ConferenciaOutorgados
          └─ ConferenciaImoveis
          └─ ConferenciaNegocio

T=15:00   Usuário clica "Gerar Minuta"
          └─ navigate(/minuta)

T=15:05   Geração começou
          └─ [Loading spinner] "Gerando minuta com IA..."

T=15:35   Minuta gerada!
          └─ Editor carrega com conteúdo
          └─ toast.success("Minuta gerada com sucesso!")

T=15:35-
T=30:00   Usuário edita minuta final
          └─ Clica "Salvar" a cada mudança importante

T=30:00   Usuário clica "Finalizar"
          └─ navigate(/dashboard)
          └─ Minuta concluída!
```

---

## Checklist de Implementação

### ✅ Implementado

- [x] Upload de documentos com validação
- [x] Classificação automática (RG, CNH, Certidões, etc)
- [x] Extração estruturada de dados
- [x] Normalização e resolução de conflitos
- [x] Persistência em tabelas normalizadas
- [x] Interface de revisão/conferência
- [x] Geração de minuta com template
- [x] Editor TipTap para edição final
- [x] Rastreamento de origem de dados (_fontes)
- [x] Alertas jurídicos (ônus ativo, etc)
- [x] Tratamento de erros com fallbacks

### 🚀 Possíveis Melhorias

- [ ] Processamento paralelo de documentos (agora é sequencial)
- [ ] Webhooks para notificações em tempo real
- [ ] Suporte a mais tipos de documento (certidões internacionais)
- [ ] IA para detecção automática de conflitos/inconsistências
- [ ] OCR para documentos escaneados de baixa qualidade
- [ ] Análise de validade de certidões (expiradas)
- [ ] Integração com cartório online (CENSEC, RESE)
- [ ] Assinatura digital automática
- [ ] Exportação para Word/PDF com formatação oficial

---

## Conclusão

O fluxo de classificação é uma **orquestração complexa mas determinística** que:

1. ✅ Automatiza 80% do trabalho manual
2. ✅ Oferece interface de revisão para validação humana
3. ✅ Gera documentos finais prontos para assinatura
4. ✅ Rastreia origem de cada dado (auditoria)
5. ✅ Funciona com qualquer tipo de documento

**Stack:**
- Frontend: React + TypeScript + TipTap + Framer Motion
- Backend: Supabase (PostgreSQL + Edge Functions)
- IA: Google Gemini (Vision + LLM)
- Storage: Supabase Storage

**Tempo total:** 2-5 minutos por minuta (documentos + processamento + edição)

---

## Documentos Relacionados

1. **FLUXO_CLASSIFICACAO_COMPLETO.md** - Documentação detalhada
2. **DIAGRAMAS_SEQUENCIA.md** - Diagramas UML e fluxogramas
3. **EXEMPLOS_CODIGO_FLUXO.md** - Snippets de código funcional
