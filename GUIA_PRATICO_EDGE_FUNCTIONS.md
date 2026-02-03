# Guia Prático: Edge Functions Minutas Cartório

**Documento de Referência Rápida**

---

## 1. DIAGRAMA DO PIPELINE

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PIPELINE DE PROCESSAMENTO                        │
└─────────────────────────────────────────────────────────────────────┘

Upload Documento (PDF/IMG)
        │
        ▼
   ┌─────────────────────┐
   │ 1. CLASSIFY         │
   │ classify-document   │────────┐
   └─────────────────────┘        │
        │                         │
        │ Tipo identificado       │ Gemini
        │                         │ (CLASSIFICATION_PROMPT)
        ▼                         │
   ┌─────────────────────┐        │
   │ 2. EXTRACT          │◄───────┘
   │ extract-document    │────────┐
   └─────────────────────┘        │
        │                         │
        │ Dados estruturados      │ Gemini
        │                         │ (agent_prompts.tipo_documento)
        ▼                         │
   ┌─────────────────────┐        │
   │ 3. MAP              │◄───────┘
   │ map-to-fields       │────────┐
   └─────────────────────┘        │
        │                         │ Determinístico
        │ Structured schema       │ (sem LLM)
        ▼                         │
   ┌─────────────────────┐        │
   │ 4. GENERATE         │◄───────┘
   │ generate-minuta     │────────┐
   └─────────────────────┘        │
        │                         │
        │ Minuta em texto         │ Gemini
        │                         │ (template + dados)
        ▼                         │
   ┌─────────────────────┐        │
   │ MINUTA PRONTA       │◄───────┘
   └─────────────────────┘
```

---

## 2. EXEMPLO: Processando Uma CNH

### Passo 1: Upload
```bash
curl -X POST https://your-project.supabase.co/storage/v1/object/documentos/user-123/cnh.jpg \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @cnh.jpg
```

**BD Record**:
```json
{
  "id": "doc-001",
  "minuta_id": "minuta-123",
  "storage_path": "user-123/doc-001/cnh.jpg",
  "mime_type": "image/jpeg",
  "status": "pendente"
}
```

### Passo 2: Classificação
```bash
curl -X POST https://your-project.supabase.co/functions/v1/classify-document \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documento_id": "doc-001"}'
```

**Prompt Enviado ao Gemini**:
```
Você é um especialista em documentos brasileiros de cartório...

Analise esta imagem de documento e identifique:
1. TIPO_DOCUMENTO: [lista de tipos]
2. CONFIANCA: Alta, Media ou Baixa
3. PESSOA_RELACIONADA: Nome da pessoa no documento (ou null)
4. OBSERVACAO: Breve descrição

[Imagem em base64 inline]
```

**Resposta Esperada**:
```json
{
  "tipo_documento": "CNH",
  "confianca": "Alta",
  "pessoa_relacionada": "JOÃO SILVA",
  "observacao": "CNH do estado de SP, válida"
}
```

**BD Atualizado**:
```json
{
  "id": "doc-001",
  "tipo_documento": "CNH",
  "classificacao_confianca": "alta",
  "pessoa_relacionada": "JOÃO SILVA",
  "status": "classificado"
}
```

### Passo 3: Extração
```bash
curl -X POST https://your-project.supabase.co/functions/v1/extract-document \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documento_id": "doc-001"}'
```

**Prompt Enviado ao Gemini**:
```
[Prompt específico para CNH, carregado de agent_prompts BD]

Instruções para extrair:
- Número da CNH
- Nome completo
- CPF
- Data de nascimento
- Nacionalidade
- etc...

[Imagem em base64]
```

**Resposta Esperada**:
```json
{
  "cnh": {
    "numero": "123456789",
    "dv": "99"
  },
  "pessoa": {
    "nome_completo": "JOÃO SILVA",
    "cpf": "12345678900",
    "data_nascimento": "1990-05-15",
    "nacionalidade": "Brasileira",
    "sexo": "M"
  }
}
```

**BD Atualizado**:
```json
{
  "id": "doc-001",
  "dados_extraidos": {
    "cnh": { "numero": "123456789", ... },
    "pessoa": { "nome_completo": "JOÃO SILVA", ... }
  },
  "status": "extraido"
}
```

### Passo 4: Mapeamento
```bash
curl -X POST https://your-project.supabase.co/functions/v1/map-to-fields \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"minuta_id": "minuta-123"}'
```

**Processamento** (sem LLM):
1. Busca todos docs extraídos da minuta
2. Ordena por prioridade: RG (100), CNH (88), MATRICULA (80)...
3. Mapeia CNH → PessoaNatural
4. Deduplicação por CPF
5. Persiste em `pessoas_naturais` table

**BD Atualizado**:
```json
{
  "table": "pessoas_naturais",
  "record": {
    "id": "pessoa-001",
    "minuta_id": "minuta-123",
    "cpf": "12345678900",
    "nome": "JOÃO SILVA",
    "rg": null,
    "data_nascimento": "1990-05-15",
    "nacionalidade": "Brasileira",
    "_fontes": {
      "cpf": ["CNH"],
      "nome": ["CNH"],
      "data_nascimento": ["CNH"]
    }
  }
}
```

### Passo 5: Geração da Minuta
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-minuta \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"minuta_id": "minuta-123", "template_type": "VENDA_COMPRA"}'
```

**Prompt Construído**:
```
Você é um especialista em minutas de escritura pública brasileira...

## TAREFA
Gere uma minuta completa de compra e venda...

## TEMPLATE DE REFERENCIA (VENDA_COMPRA)
[Template completo com placeholders]

## DADOS ESTRUTURADOS DA MINUTA

### Informações Básicas
- Titulo: Minuta 001
- Tipo de Ato: compra e venda
- Data de Lavratura: 2026-02-02

### OUTORGANTES (Vendedores)
**JOÃO SILVA**, Brasileiro, casado, comerciante...

### OUTORGADOS (Compradores)
[Dados compilados]

### IMOVEIS
[Dados compilados]

### NEGÓCIO JURÍDICO
[Dados compilados]

### Certidões Disponíveis
- CERTIDAO_NASCIMENTO: 123456/2000, expedida em 15/05/1990
```

**BD Atualizado**:
```json
{
  "id": "minuta-123",
  "minuta_texto": "Pela presente escritura pública...",
  "status": "gerada"
}
```

---

## 3. EXEMPLO: Usando Agentes Especialistas

### Request com DOCX Customizado
```bash
curl -X POST https://your-project.supabase.co/functions/v1/agentes-especialistas/run \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'agent_slug=analista-contrato' \
  -F 'instrucoes_customizadas=Foque em cláusulas penais e rescisão' \
  -F 'documentos=@contrato.docx'
```

### Processamento
1. **Validação**
   - agent_slug: "analista-contrato" ✓
   - tamanho: 500KB < 20MB ✓
   - MIME: application/vnd.openxmlformats-officedocument.wordprocessingml.document ✓

2. **Conversão**
   - DOCX → HTML usando Mammoth.js
   - Base64 encode

3. **Carregamento do Prompt**
   ```sql
   SELECT system_prompt, versao
   FROM specialist_prompts
   WHERE agent_slug = 'analista-contrato'
   AND ativo = true
   ORDER BY versao DESC
   LIMIT 1
   ```
   Resultado:
   ```
   "Você é um especialista em análise de contratos empresariais...
    Forneça análise estruturada com:
    - Partes contratantes
    - Cláusulas principais
    - Riscos identificados
    - Recomendações"
   ```

4. **Construção do Prompt Final**
   ```
   Você é um especialista em análise de contratos empresariais...
   Forneça análise estruturada com:
   - Partes contratantes
   - Cláusulas principais
   - Riscos identificados
   - Recomendações

   ---

   ## INSTRUCOES ADICIONAIS DO USUARIO

   Foque em cláusulas penais e rescisão

   ---

   IMPORTANTE: Aplique as instruções adicionais do usuário ao analisar este documento...

   [CONTRATO EM HTML]
   ```

5. **Gemini API**
   - temperature: 0.1
   - maxTokens: 16384
   - Conteúdo: HTML do contrato

6. **Resposta**
   ```json
   {
     "run_id": "run-abc123",
     "status": "completed",
     "output_texto": "## ANÁLISE DO CONTRATO\n\n### Partes\n...",
     "input_tokens": 8234,
     "output_tokens": 2156,
     "duration_ms": 4200
   }
   ```

7. **Persistência**
   ```json
   {
     "table": "agentes_especialistas_runs",
     "record": {
       "id": "run-abc123",
       "user_id": "user-123",
       "agent_slug": "analista-contrato",
       "agent_nome": "Analista de Contratos",
       "documentos": [
         {
           "nome": "contrato.docx",
           "storage_path": "user-123/run-abc123/contrato.docx",
           "mime_type": "application/vnd.openxmlformats...",
           "tamanho_bytes": 512000
         }
       ],
       "instrucoes_customizadas": "Foque em cláusulas penais e rescisão",
       "output_texto": "## ANÁLISE DO CONTRATO\n...",
       "status": "completed",
       "input_tokens": 8234,
       "output_tokens": 2156,
       "cost_estimate": 0.0125,
       "duration_ms": 4200
     }
   }
   ```

---

## 4. MANIPULAÇÃO DE PROMPTS

### Carregamento Dinâmico - Código
```typescript
// Em extract-document/index.ts
const prompt = await loadExtractionPrompt(
  documento.tipo_documento,  // "MATRICULA_IMOVEL"
  documento.tamanho_bytes    // 5000000 (5MB)
);

// Implementação em prompts.ts
async function loadExtractionPrompt(
  tipoDocumento: string,
  fileSize?: number
): Promise<string> {
  // 1. Se MATRICULA_IMOVEL > 2MB, tenta versão compacta
  if (tipoDocumento === 'MATRICULA_IMOVEL' && fileSize > 2_000_000) {
    const { data } = await supabase
      .from('agent_prompts')
      .select('prompt_text')
      .eq('tipo_documento', 'MATRICULA_IMOVEL_COMPACT')
      .eq('ativo', true)
      .order('versao', { ascending: false })
      .single();

    if (data) return data.prompt_text;
  }

  // 2. Senão, tenta tipo específico
  const { data } = await supabase
    .from('agent_prompts')
    .select('prompt_text')
    .eq('tipo_documento', tipoDocumento.toUpperCase())
    .eq('ativo', true)
    .order('versao', { ascending: false })
    .single();

  if (data) return data.prompt_text;

  // 3. Fallback para GENERIC
  const { data: generic } = await supabase
    .from('agent_prompts')
    .select('prompt_text')
    .eq('tipo_documento', 'GENERIC')
    .single();

  return generic.prompt_text;
}
```

### Tabela `agent_prompts`
```sql
INSERT INTO agent_prompts (tipo_documento, prompt_text, versao, ativo)
VALUES (
  'MATRICULA_IMOVEL_COMPACT',
  'Você é especialista em matrículas imobiliárias compactas...
   Extraia APENAS: número, proprietário, endereço, área, valor venal',
  1,
  true
);

-- Atualizar versão anterior
UPDATE agent_prompts
SET ativo = false, updated_at = now()
WHERE tipo_documento = 'MATRICULA_IMOVEL'
AND versao = 1;

-- Inserir nova versão
INSERT INTO agent_prompts (tipo_documento, prompt_text, versao, ativo)
VALUES (
  'MATRICULA_IMOVEL',
  '[NOVO PROMPT MELHORADO]',
  2,
  true
);
```

### Versionamento de Agentes
```sql
-- Tabela: specialist_prompts
INSERT INTO specialist_prompts (
  agent_slug,
  sistema_prompt,
  versao,
  ativo,
  data_criacao
) VALUES (
  'analista-contrato',
  'Você é um especialista em contratos comerciais...',
  2,
  true,
  now()
);

-- Log de auditoria
SELECT * FROM agentes_especialistas_runs
WHERE agent_slug = 'analista-contrato'
ORDER BY created_at DESC;
```

---

## 5. TRATAMENTO DE ERROS COMUNS

### Erro: Arquivo não suportado
```
Request:
{
  "agent_slug": "analista-contrato",
  "documentos": [arquivo.exe]
}

Response:
Status: 400
{
  "error": "Tipo de arquivo application/x-msdownload não suportado.
            Formatos aceitos: PDF, imagens (JPG, PNG, WebP, GIF, HEIC, BMP),
            documentos (DOCX), texto (TXT, MD, CSV)."
}
```

### Erro: Arquivo muito grande
```
Request: [arquivo.pdf de 25MB]

Response:
Status: 400
{
  "error": "Arquivo relatorio.pdf excede o tamanho máximo de 20MB"
}
```

### Erro: Prompt não encontrado
```
Request:
{
  "documento_id": "doc-xyz",
  "tipo_documento": "TIPO_INEXISTENTE"
}

Response:
Status: 404
{
  "error": "Prompt não encontrado para document type: TIPO_INEXISTENTE"
}
```

### Erro: Não autenticado
```
Request: [sem header Authorization]

Response:
Status: 401
{
  "error": "Não autorizado. Por favor, faça login novamente."
}
```

---

## 6. MONITORAMENTO E OBSERVABILIDADE

### Query: Token Usage Últimas 24h
```sql
SELECT
  agent_type,
  COUNT(*) as execucoes,
  SUM(input_tokens) as total_input,
  SUM(output_tokens) as total_output,
  SUM(cost_estimate) as custo_total,
  AVG(duration_ms) as tempo_medio_ms,
  MIN(duration_ms) as tempo_minimo_ms,
  MAX(duration_ms) as tempo_maximo_ms
FROM agent_executions
WHERE created_at >= now() - interval '24 hours'
GROUP BY agent_type
ORDER BY custo_total DESC;
```

### Query: Erros Últimas 24h
```sql
SELECT
  agent_type,
  COUNT(*) as falhas,
  error_message,
  MAX(completed_at) as ultimo_erro
FROM agent_executions
WHERE status = 'error'
AND created_at >= now() - interval '24 hours'
GROUP BY agent_type, error_message
ORDER BY falhas DESC;
```

### Query: Performance por Minuta
```sql
SELECT
  minuta_id,
  COUNT(*) as total_execucoes,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as sucesso,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as falhas,
  SUM(cost_estimate) as custo_total,
  AVG(duration_ms) as tempo_medio_ms
FROM agent_executions
WHERE minuta_id IS NOT NULL
AND created_at >= now() - interval '7 days'
GROUP BY minuta_id
ORDER BY custo_total DESC
LIMIT 20;
```

---

## 7. API RESUMIDA

### Endpoints Principais

| Método | Endpoint | Função |
|--------|----------|--------|
| POST | `/classify-document` | Classifica documento |
| POST | `/extract-document` | Extrai dados |
| POST | `/map-to-fields` | Mapeia para schema |
| POST | `/generate-minuta` | Gera minuta |
| POST | `/agentes-especialistas/run` | Executa agente customizado |
| GET | `/agentes-especialistas/history` | Histórico de runs |
| GET | `/agentes-especialistas/run/:id` | Detalhes de run |
| GET | `/agentes-especialistas/agents` | Lista agentes |
| GET | `/agentes-especialistas/run/:id/document/:filename` | Download documento |

### Headers Necessários
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json  (ou multipart/form-data para upload)
```

---

## 8. PRICING E CUSTOS

### Gemini 2.0 Flash (Valores Atuais)
```
Input:  $0.00025 por 1K tokens ($0.25 por 1M)
Output: $0.00125 por 1K tokens ($1.25 por 1M)
```

### Exemplo: Processamento de Minuta Completa

| Passo | Input Tokens | Output Tokens | Custo |
|-------|--------------|---------------|-------|
| 1. Classify | 850 | 150 | $0.00044 |
| 2. Extract RG | 2100 | 280 | $0.00079 |
| 3. Extract CPF | 1200 | 150 | $0.00035 |
| 4. Extract MATRICULA | 8500 | 1200 | $0.00363 |
| 5. Map (determinístico) | 0 | 0 | $0.00000 |
| 6. Generate Minuta | 5200 | 2800 | $0.00521 |
| **TOTAL** | **17850** | **4580** | **$0.01042** |

---

## 9. PRÓXIMOS PASSOS / ROADMAP

### Curto Prazo
- [ ] Adicionar novo tipo de documento (ex: PASSPORT)
- [ ] Criar novo agente especialista (ex: "revisor-minutas")
- [ ] Otimizar prompt para MATRICULA_IMOVEL

### Médio Prazo
- [ ] Suporte a processamento em batch (múltiplas minutas)
- [ ] Webhook de conclusão
- [ ] Cache de prompts para reduzir latência
- [ ] Dashboard de observabilidade

### Longo Prazo
- [ ] Trocar Gemini por modelo customizado/fine-tuned
- [ ] Integração com OCR on-device para classificação offline
- [ ] Sistema de qualidade com feedback loop

---

**Última atualização**: 2026-02-02
