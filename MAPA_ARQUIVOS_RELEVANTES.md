# Mapa de Arquivos Relevantes - Fluxo de Classificação

## Estrutura de Diretórios

```
Minutas-Cartorio-Documentos/
├─ Frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  │  ├─ UploadDocumentos.tsx          ← 1. Upload interface
│  │  │  ├─ Processando.tsx               ← 2. Processing orchestrator
│  │  │  ├─ ConferenciaOutorgantes.tsx    ← 5. Review page 1
│  │  │  ├─ ConferenciaOutorgados.tsx     ← 5. Review page 2
│  │  │  ├─ ConferenciaImoveis.tsx        ← 5. Review page 3
│  │  │  ├─ ConferenciaNegocio.tsx        ← 5. Review page 4
│  │  │  └─ MinutaFinal.tsx               ← 6,7. Generation + editing
│  │  ├─ hooks/
│  │  │  ├─ useDocumentUpload.ts          ← Step 1: Upload
│  │  │  ├─ useDocumentPipeline.ts        ← Step 2: Classification/Extraction
│  │  │  ├─ useMinutaDatabase.ts          ← Step 5: Persist review data
│  │  │  └─ useMinuta.ts                  ← Context provider
│  │  ├─ contexts/
│  │  │  └─ MinutaContext.tsx             ← Global state management
│  │  └─ components/
│  │     └─ agentes/
│  │        └─ UploadZone.tsx             ← Upload UI component
│  └─ supabase/
│     └─ functions/
│        ├─ classify-document/index.ts    ← Step 2a: Classification
│        ├─ extract-document/index.ts     ← Step 2b: Extraction
│        ├─ map-to-fields/index.ts        ← Step 3: Mapping
│        ├─ generate-minuta/index.ts      ← Step 6: Generation
│        └─ _shared/                      ← Shared utilities
└─ Database/ (PostgreSQL/Supabase)
   ├─ documentos                          ← Raw uploaded files
   ├─ minutas                             ← Minuta metadata
   ├─ pessoas_naturais                    ← Extracted persons
   ├─ imoveis                             ← Extracted properties
   └─ negocios_juridicos                  ← Extracted deals
```

---

## 1. Upload de Documentos

**Localização**: `src/pages/UploadDocumentos.tsx` + `src/hooks/useDocumentUpload.ts`

**Fluxo**:
1. Usuário arrasta/clica para selecionar arquivo
2. UploadDocumentos.tsx valida arquivo
3. useDocumentUpload.uploadDocument() executa:
   - Upload para Storage: `/users/{userId}/{minutaId}/{timestamp}_{filename}`
   - Insert em tabela `documentos` com status='uploaded'
4. UI mostra checkmark ✓

**Arquivos Envolvidos**:
- `src/pages/UploadDocumentos.tsx` (lines 119-322)
- `src/hooks/useDocumentUpload.ts` (lines 45-143)
- `src/components/agentes/UploadZone.tsx`

---

## 2. Pipeline Orchestration

**Localização**: `src/hooks/useDocumentPipeline.ts` + `src/pages/Processando.tsx`

**Fluxo**:
1. Processando.tsx dispara startPipeline(minutaId)
2. useDocumentPipeline.startPipeline():
   - Query documentos com status IN ('uploaded', 'pendente')
   - FOR each documento: processDocument(docId)
   - AFTER all: invoke('map-to-fields')
3. Update minutas: status='revisao'

**Arquivos Envolvidos**:
- `src/hooks/useDocumentPipeline.ts` (lines 158-202)
- `src/pages/Processando.tsx` (lines 28-55)

---

## 3. Classification (classify-document)

**Localização**: `supabase/functions/classify-document/index.ts`

**Fluxo**:
1. Edge function receives: `{ documento_id: uuid }`
2. Download file from Storage
3. Convert to Base64
4. Call Gemini Vision API
5. Parse result: `{ tipo_documento, confianca, pessoa_relacionada }`
6. Update documentos: status='classificado'

**Tipos Detectados**:
RG, CNH, CPF, Certidões (nascimento, casamento, óbito), Matrículas, IPTU, VVR, ITBI, Contratos, etc.

---

## 4. Extraction (extract-document)

**Localização**: `supabase/functions/extract-document/index.ts`

**Fluxo**:
1. Edge function receives: `{ documento_id: uuid }`
2. Check: tipo_documento must NOT be NULL
3. Download file from Storage
4. Call Gemini Vision API with type-specific prompt
5. Parse result based on document type
6. Update documentos: dados_extraidos={...}, status='extraido'

**Dados Extraídos**: Varia por tipo de documento
- RG: cpf, nome, data_nascimento, rg, nacionalidade, filiação, etc
- CNH: cpf, nome, data_nascimento, categoria, etc
- COMPROMISSO: vendedores, compradores, imovel, valores, etc

---

## 5. Mapping (map-to-fields)

**Localização**: `supabase/functions/map-to-fields/index.ts` + `persistence.ts`

**Fluxo**:
1. Query todos documentos com status='extraido'
2. Ordena por prioridade: RG (100) > Certidão (95) > CNH (88) > ...
3. Para cada documento:
   - RG/CNH → mapIdentityDocument() → pessoas_naturais
   - Certidão Casamento → mapMarriageCertificate() → atualiza pessoa
   - Compromisso → mapPurchaseContract() → alienantes, adquirentes
   - Matrícula → mapPropertyRegistry() → imovel
4. Identifica cônjuges como anuentes
5. Persist em tabelas:
   - INSERT/UPDATE pessoas_naturais
   - INSERT/UPDATE imoveis
   - INSERT/UPDATE negocios_juridicos
   - INSERT alertas_juridicos

**Resolução de Conflitos**: Mesmo CPF em múltiplos docs → MERGE

---

## 6. Generation (generate-minuta)

**Localização**: `supabase/functions/generate-minuta/index.ts`

**Fluxo**:
1. Edge function receives: `{ minuta_id, template_type, template_id? }`
2. aggregateMinutaData(): Fetch from pessoas_naturais, imoveis, negocios
3. mapDataToPlaceholders(): Format for template
4. loadTemplate(): Get template structure
5. Call Gemini: "Gere uma escritura com estes dados..."
6. Update minutas: conteudo_gerado={texto}, geracao_status='gerado'

**Templates**: VENDA_COMPRA, LOCACAO, DOACAO, TESTAMENTO, etc

---

## 7. Review & Editing

**Localização**: `src/pages/ConferenciaTrabalhador.tsx` etc + `src/pages/MinutaFinal.tsx`

**Fluxo**:
1. User navigates through review pages (outorgantes → outorgados → imoveis → negocio)
2. Can edit extracted data
3. Save via useMinutaDatabase hook
4. In MinutaFinal.tsx:
   - Editor (TipTap) loads conteudo_gerado
   - User can edit text
   - Click "Salvar" to persist edits
   - Click "Finalizar" to complete

---

## Database Tables

### documentos
- id (uuid, PK)
- minuta_id (uuid, FK)
- nome_original, storage_path, mime_type, tamanho_bytes
- status (uploaded|classificado|extraido)
- tipo_documento (RG, CNH, etc)
- dados_extraidos (jsonb)
- classificacao_confianca (alta|media|baixa)

### minutas
- id (uuid, PK)
- user_id (uuid, FK)
- status (rascunho|revisao|gerada|finalizada)
- current_step (upload|outorgantes|...|minuta)
- conteudo_gerado (text, final document)
- geracao_status (pendente|gerando|gerado|erro)
- template_usado (VENDA_COMPRA, etc)

### pessoas_naturais
- minuta_id, cpf (UNIQUE per minuta)
- nome, rg, data_nascimento, estado_civil, profissao
- _fontes (jsonb, track origin)

### imoveis
- minuta_id, matricula_numero (UNIQUE per minuta)
- tipo, endereco, area_total, cidade, estado
- onus_ativos, proprietarios

### negocios_juridicos
- minuta_id (UNIQUE)
- tipo, valor_total, pagamento (jsonb)

---

## Key Hooks

### useDocumentPipeline
- `startPipeline(minutaId)` - Process all documents
- `processDocument(documentId)` - Process single document
- `generateMinuta(minutaId, templateType, templateId)` - Generate minuta

### useDocumentUpload
- `uploadDocument(file, minutaId, category)` - Upload file

### useMinutaDatabase
- `savePessoaNatural(data)` - Save person
- `saveImovel(data)` - Save property
- `updateNegocio(data)` - Update deal

---

## Error Handling

| Cenário | Comportamento |
|---------|--------------|
| Upload falha | Mostrar erro vermelho, permitir retentar |
| Classificação falha | Marca como erro, continua pipeline |
| Extração sem classificação | Erro: "must classify first" |
| Map-to-fields sem dados | Mostra alerta, permite continuar |
| Geração falha | Mostra erro, permite edição manual |
| Processamento lento | Timeout após 60s, navega mesmo assim |

---

## Performance

| Operação | Tempo |
|----------|-------|
| Upload 1 doc (5MB) | 2-5 segundos |
| Classify 1 doc | 3-8 segundos |
| Extract 1 doc | 5-15 segundos |
| Map-to-fields (5 docs) | 2-5 segundos |
| Generate minuta | 10-30 segundos |
| **Total por minuta** | **2-5 minutos** |

---

## Total Files

- **Frontend React files**: ~15 files
- **Edge Functions**: 4 functions + shared utilities
- **Database tables**: 7 tables
- **Total lines of code**: ~3,000+ lines

**Stack**: React + TypeScript + Supabase + Gemini API + TipTap
