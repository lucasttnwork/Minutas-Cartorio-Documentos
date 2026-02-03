# Especificação: Edge Function `extract-template-text`

## 📌 Resumo Executivo

A edge function `extract-template-text` será responsável por:

1. **Receber** um `template_id` e opcional `documento_id`
2. **Fazer download** do arquivo template (PDF, DOCX, etc)
3. **Normalizar** o arquivo (DOCX → HTML se necessário)
4. **Chamar Gemini** para extrair texto e estrutura
5. **Salvar resultado** na tabela `minutas_padrao`
6. **Registrar execução** com tokens e custo

---

## 🎯 Requisitos Funcionais

### Input (RequestBody)

```typescript
interface ExtractTemplateTextRequest {
  template_id: string;      // Obrigatório: ID da minuta padrão
  documento_id?: string;    // Opcional: Se vem de documento
  prompt_custom?: string;   // Opcional: Prompt customizado
}
```

### Output (Response)

```typescript
interface ExtractTemplateTextResponse {
  success: boolean;
  result?: ExtractedTemplate;
  error?: string;
  metadata?: {
    execution_id: string;
    duration_ms: number;
    tokens_used: {
      input: number;
      output: number;
    };
  };
}

interface ExtractedTemplate {
  id: string;                    // template_id
  texto_completo: string;        // Todo o texto extraído
  secoes: {
    [key: string]: string;       // Seção → Conteúdo
  };
  campos_identificados: {
    [key: string]: {
      tipo: string;              // "texto", "data", "valor", etc
      valor?: string;
      localizacao?: string;      // Qual seção
      confianca: 'alta' | 'media' | 'baixa';
    };
  };
  metadados: {
    total_caracteres: number;
    total_paragrafos: number;
    total_secoes: number;
    idioma: string;
    tipo_documento: string;      // "minuta", "contrato", etc
    foi_convertido: boolean;     // Se DOCX → HTML
  };
}
```

---

## 🔄 Fluxo de Execução

```
POST /functions/v1/extract-template-text
├─ Parse RequestBody
├─ Validate: template_id required
├─ startExecution() → execution logging started
├─ Query: SELECT * FROM minutas_padrao WHERE id = ?
├─ Update status → 'extraindo'
├─ Storage.download(storage_path)
├─ normalizeFilesForGemini() if DOCX
├─ arrayBufferToBase64()
├─ callGemini(prompt, base64, mimeType)
├─ parseGeminiJson<ExtractedTemplate>(response)
├─ Update DB: UPDATE minutas_padrao SET ...
├─ logSuccess() with tokens
└─ Return { success: true, result }

Erro em qualquer ponto:
├─ logError() execução
└─ Return { success: false, error: message }
```

---

## 💾 Mudanças no Banco de Dados

### Tabela: `minutas_padrao` (extensões)

Adicionar colúnas se não existirem:

```sql
ALTER TABLE minutas_padrao ADD COLUMN IF NOT EXISTS texto_extraido TEXT;
ALTER TABLE minutas_padrao ADD COLUMN IF NOT EXISTS secoes JSONB;
ALTER TABLE minutas_padrao ADD COLUMN IF NOT EXISTS campos_identificados JSONB;
ALTER TABLE minutas_padrao ADD COLUMN IF NOT EXISTS metadados_extracao JSONB;
ALTER TABLE minutas_padrao ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pendente';
  -- Status: pendente, extraindo, extraido, erro
ALTER TABLE minutas_padrao ADD COLUMN IF NOT EXISTS extraido_em TIMESTAMP;
```

### Exemplo de dados salvos:

```json
{
  "id": "template-123",
  "texto_extraido": "ESCRITURA DE VENDA E COMPRA...",
  "secoes": {
    "cabecalho": "Aos 15 de fevereiro de 2024...",
    "identificacao_partes": "OUTORGANTES VENDEDORES: João da Silva...",
    "descricao_imovel": "Apartamento número 502...",
    "clausulas_negocio": "Disseram as partes que ajustaram venda...",
    "declaracoes": "Declaram as partes que..."
  },
  "campos_identificados": {
    "DATA_LAVRATURA": {
      "tipo": "data",
      "valor": "15/02/2024",
      "localizacao": "cabecalho",
      "confianca": "alta"
    },
    "IMOVEL_MATRICULA": {
      "tipo": "numero_matricula",
      "valor": "2.345-X",
      "localizacao": "descricao_imovel",
      "confianca": "media"
    }
  },
  "metadados_extracao": {
    "total_caracteres": 45230,
    "total_paragrafos": 87,
    "total_secoes": 6,
    "idioma": "pt-BR",
    "tipo_documento": "minuta_venda_compra",
    "foi_convertido": false
  }
}
```

---

## 🔧 Implementação Detalhada

### Arquivo: `supabase/functions/extract-template-text/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { callGemini, parseGeminiJson, arrayBufferToBase64 } from '../_shared/gemini-client.ts';
import { normalizeFilesForGemini } from '../_shared/file-normalizer.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';

// ============================================================================
// TYPES
// ============================================================================

interface ExtractTemplateTextRequest {
  template_id: string;
  documento_id?: string;
  prompt_custom?: string;
}

interface CampoIdentificado {
  tipo: string;
  valor?: string;
  localizacao?: string;
  confianca: 'alta' | 'media' | 'baixa';
}

interface MetadadosExtracao {
  total_caracteres: number;
  total_paragrafos: number;
  total_secoes: number;
  idioma: string;
  tipo_documento: string;
  foi_convertido: boolean;
}

interface ExtractedTemplate {
  id: string;
  texto_completo: string;
  secoes: Record<string, string>;
  campos_identificados: Record<string, CampoIdentificado>;
  metadados: MetadadosExtracao;
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildExtractionPrompt(customPrompt?: string): string {
  if (customPrompt) return customPrompt;

  return `Você é um especialista em análise de documentos jurídicos brasileiros.

## TAREFA
Analise o template/minuta fornecido e extraia:

1. **Texto Completo**: O conteúdo integral do documento
2. **Seções**: Divida em seções lógicas (cabeçalho, identificação de partes, etc)
3. **Campos**: Identifique campos-chave que precisam ser preenchidos (datas, valores, nomes, etc)
4. **Metadados**: Análise estrutural

## RESPOSTA ESPERADA (JSON)

{
  "id": "[deixe em branco - será preenchido]",
  "texto_completo": "[texto integral do documento]",
  "secoes": {
    "cabecalho": "[conteúdo da seção]",
    "identificacao_partes": "[conteúdo]",
    "descricao_imovel": "[conteúdo]",
    "clausulas_negocio": "[conteúdo]",
    "declaracoes": "[conteúdo]",
    "encerramento": "[conteúdo]"
  },
  "campos_identificados": {
    "DATA_LAVRATURA": {
      "tipo": "data",
      "valor": "[extraído ou null]",
      "localizacao": "cabecalho",
      "confianca": "alta|media|baixa"
    },
    "NOME_OUTORGANTE": {
      "tipo": "texto",
      "valor": null,
      "localizacao": "identificacao_partes",
      "confianca": "alta"
    },
    "[OUTRO_CAMPO]": { ... }
  },
  "metadados": {
    "total_caracteres": [número],
    "total_paragrafos": [número],
    "total_secoes": [número],
    "idioma": "pt-BR",
    "tipo_documento": "minuta_venda_compra|minuta_doacao|contrato|outro",
    "foi_convertido": false
  }
}

## INSTRUÇÕES IMPORTANTES

1. **SEÇÕES**: Use nomes em português, snake_case no JSON
2. **CAMPOS**: Liste TODOS os placeholders encontrados ({{EXEMPLO}}) como campos
3. **CONFIANÇA**:
   - "alta": Campo claramente preenchido ou placeholder identificável
   - "media": Campo parcialmente preenchido ou com formatação inconsistente
   - "baixa": Campo ambíguo ou potencialmente incorreto
4. **VALORES**: Extraia valores reais apenas se claramente preenchidos
5. **CARACTERES**: Conte caracteres do texto_completo
6. **PARÁGRAFOS**: Use \n\n ou <p> como delimitador
7. **TIPO_DOCUMENTO**: Identifique o tipo baseado no conteúdo

Gere a análise completa agora:`;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    // 1. Parse request
    const { template_id, documento_id, prompt_custom }: ExtractTemplateTextRequest = await req.json();

    if (!template_id) {
      throw new Error('template_id is required');
    }

    // 2. Fetch template from database
    const { data: template, error: templateError } = await serviceClient
      .from('minutas_padrao')
      .select('*')
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      console.error('Template fetch error:', templateError);
      throw new Error(`Template not found: ${template_id}`);
    }

    // 3. Update status to "extraindo"
    await serviceClient
      .from('minutas_padrao')
      .update({ status: 'extraindo' })
      .eq('id', template_id);

    // 4. Start execution logging
    const prompt = buildExtractionPrompt(prompt_custom);
    execution = await startExecution(serviceClient, 'extract', {
      documentoId: documento_id || template_id,
      promptUsed: prompt.substring(0, 5000),
    });

    // 5. Download file from storage
    console.log(`Downloading template from: ${template.storage_path}`);

    const { data: fileData, error: downloadError } = await serviceClient.storage
      .from('templates')  // ou 'minutas_padrao' dependendo da estrutura
      .download(template.storage_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download template: ${downloadError?.message || 'Unknown error'}`);
    }

    // 6. Normalize file (DOCX → HTML if needed)
    const arrayBuffer = await fileData.arrayBuffer();

    console.log(`Normalizing file: ${template.nome} (${template.mime_type})`);

    const normalized = await normalizeFilesForGemini([
      {
        buffer: arrayBuffer,
        name: template.nome || 'template',
        mimeType: template.mime_type
      }
    ]);

    if (normalized.warnings.length > 0) {
      console.log('Normalization warnings:', normalized.warnings);
    }

    const { content, mimeType, wasConverted } = normalized.files[0];
    const base64 = arrayBufferToBase64(content);

    // 7. Call Gemini for extraction
    console.log(`Calling Gemini for template extraction...`);

    const { text, usage } = await callGemini(
      prompt,
      base64,
      mimeType,
      {
        temperature: 0.2,    // Low temperature for structured extraction
        maxTokens: 16384
      }
    );

    // 8. Parse Gemini response
    const result = parseGeminiJson<ExtractedTemplate>(text);

    // 9. Set template_id in result (Gemini pode não retornar)
    result.id = template_id;

    // 10. Validate metadados if missing
    if (!result.metadados) {
      result.metadados = {
        total_caracteres: result.texto_completo?.length || 0,
        total_paragrafos: result.texto_completo?.split('\n\n').length || 0,
        total_secoes: Object.keys(result.secoes || {}).length || 0,
        idioma: 'pt-BR',
        tipo_documento: 'minuta',
        foi_convertido: wasConverted
      };
    } else {
      result.metadados.foi_convertido = wasConverted;
    }

    // 11. Update database with extracted data
    console.log(`Updating database with extracted data...`);

    const { error: updateError } = await serviceClient
      .from('minutas_padrao')
      .update({
        texto_extraido: result.texto_completo,
        secoes: result.secoes,
        campos_identificados: result.campos_identificados,
        metadados_extracao: result.metadados,
        status: 'extraido',
        extraido_em: new Date().toISOString(),
      })
      .eq('id', template_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to save extraction: ${updateError.message}`);
    }

    // 12. Log successful execution with token usage
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });

    console.log(`[extract-template-text] ✅ Successfully extracted template ${template_id}`);
    console.log(`  Tokens: ${usage.inputTokens} in, ${usage.outputTokens} out`);

    // 13. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        result,
        metadata: {
          execution_id: execution.id,
          tokens_used: {
            input: usage.inputTokens,
            output: usage.outputTokens,
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[extract-template-text] ❌ Error:', error);

    // Log error in execution tracking
    if (execution.id) {
      await logError(serviceClient, execution, error as Error);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 🧪 Teste Manual

### 1. Preparar template no banco

```sql
INSERT INTO minutas_padrao (
  id, nome, tipo, mime_type, storage_path, status
) VALUES (
  'test-template-001',
  'Minuta Venda Compra.docx',
  'venda_compra',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'minutas/venda-compra-template.docx',
  'pendente'
);
```

### 2. Upload do arquivo template

```bash
# Via Supabase Dashboard ou CLI
supabase storage upload-file templates minutas/venda-compra-template.docx --path=venda-compra-template.docx
```

### 3. Chamar a edge function

```bash
curl -X POST http://localhost:54321/functions/v1/extract-template-text \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "test-template-001"
  }'
```

### 4. Resposta esperada

```json
{
  "success": true,
  "result": {
    "id": "test-template-001",
    "texto_completo": "ESCRITURA DE VENDA E COMPRA\n\nAos 15 de fevereiro...",
    "secoes": {
      "cabecalho": "Aos 15 de fevereiro...",
      "identificacao_partes": "OUTORGANTES VENDEDORES: João da Silva..."
    },
    "campos_identificados": {
      "DATA_LAVRATURA": { "tipo": "data", "valor": "15/02/2024", ... }
    },
    "metadados": {
      "total_caracteres": 45230,
      "total_paragrafos": 87,
      "total_secoes": 6,
      "idioma": "pt-BR",
      "tipo_documento": "minuta_venda_compra",
      "foi_convertido": false
    }
  },
  "metadata": {
    "execution_id": "exec-uuid-here",
    "tokens_used": {
      "input": 2500,
      "output": 1200
    }
  }
}
```

---

## 🚀 Próximos Passos Após Implementação

1. **Criar testes** em `extract-template-text/index.test.ts`
2. **Adicionar migração** SQL para criar colunas necessárias
3. **Documentar** no repositório principal
4. **Integrar** com frontend para chamar a edge function
5. **Monitorar** execuções via dashboard de execução de agents
6. **Ajustar prompt** baseado em resultados reais

---

## 📊 Estimativas

| Métrica | Valor |
|---------|-------|
| Temperatura Gemini | 0.2 (determinístico) |
| Max tokens | 16384 |
| Tempo médio | ~5-10 segundos |
| Custo por execução | ~$0.01-0.02 |
| Tokens input | ~2000-3000 |
| Tokens output | ~1000-2000 |

---

## ✅ Checklist Final

- [ ] Arquivo criado: `supabase/functions/extract-template-text/index.ts`
- [ ] Migrations criadas para adicionar colunas ao banco
- [ ] Testado com PDF
- [ ] Testado com DOCX
- [ ] Response format validado
- [ ] Error handling completo
- [ ] Execution logging funcionando
- [ ] CORS headers inclusos
- [ ] Types TypeScript completas
- [ ] Documentação em código
- [ ] Prompt otimizado para sua use case

Este documento fornece tudo o que você precisa para implementar a edge function `extract-template-text`!
