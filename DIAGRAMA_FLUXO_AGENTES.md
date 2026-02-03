# DIAGRAMA COMPLETO: FLUXO DE EXECUÇÃO DE AGENTES ESPECIALISTAS

## 1. SEQUÊNCIA TEMPORAL COMPLETA

```
TEMPO    FRONTEND                     EDGE FUNCTION              BANCO DE DADOS           GEMINI API
─────────────────────────────────────────────────────────────────────────────────────────────────
T0       [User seleciona RG + upload files]
         │
         ├─ AgenteExtrator.tsx
         │  ├─ status = 'idle'
         │  ├─ arquivos = [doc.pdf]
         │  └─ instrucoes = "Por favor, extraia apenas dados legíveis"
         │
T1       handleAnalyze() chamado
         │
         ├─ useAgentRun().executeRun()
         │  ├─ Cria FormData
         │  │  ├─ agent_slug = 'rg'
         │  │  ├─ instrucoes_customizadas = "Por favor, extraia apenas dados legíveis"
         │  │  └─ documentos = [File]
         │  │
         │  └─ setState({ status: 'analyzing' })
         │
T2       │
         └─ POST /agentes-especialistas/run (FormData)  ──────────────────────────────────────────>
                                                        │
                                            T3: Recebe FormData
                                            │
                                            ├─ createSupabaseClient(req)
                                            ├─ getUser() [Autenticação]
                                            │  └─ Valida auth header
                                            │
                                            ├─ formData.get('agent_slug') = 'rg'
                                            ├─ formData.get('instrucoes_customizadas') = "..."
                                            └─ formData.getAll('documentos') = [File]
                                                        │
                                            T4: Busca Prompt DINÂMICO
                                            │
                                            ├─ supabase.rpc('get_active_specialist_prompt', {p_agent_slug: 'rg'})
                                            │          ──────────────────────────────────────────>
                                            │                                 │
                                            │                      T5: Query no Banco
                                            │                      │
                                            │                      ├─ SELECT id, agent_slug, versao,
                                            │                      │        system_prompt, nome_exibicao,
                                            │                      │        descricao, categoria
                                            │                      │  FROM agentes_especialistas_prompts
                                            │                      │  WHERE agent_slug = 'rg'
                                            │                      │    AND ativo = true
                                            │                      │  LIMIT 1;
                                            │                      │
                                            │                      └─ Retorna: ActivePrompt
                                            │          <──────────────────────────────────────────
                                            │
                                            ├─ promptData = {
                                            │    id: 'abc123',
                                            │    agent_slug: 'rg',
                                            │    versao: 1,
                                            │    system_prompt: 'Voce e um especialista em extracao de dados de RG...[3000+ chars]',
                                            │    nome_exibicao: 'Extrator de RG',
                                            │    descricao: 'Extrai dados de documentos de identidade (RG)',
                                            │    categoria: 'pessoais'
                                            │  }
                                            │
                                            ├─ activePrompt = promptData
                                            │
                                            ├─ runId = crypto.randomUUID() = 'xyz789'
                                            │
                                            ├─ [Validação de arquivos]
                                            │  ├─ Valida tamanho (< 20MB)
                                            │  ├─ Valida MIME type
                                            │  │  (application/pdf, image/jpeg, image/png, etc)
                                            │  │
                                            │  └─ files = [File {name: 'documento.pdf', size: 1024000, type: 'application/pdf'}]
                                            │
                                            ├─ [Upload de documentos para Storage]
                                            │  │
                                            │  └─ Para cada arquivo:
                                            │     ├─ arrayBuffer = await file.arrayBuffer()
                                            │     ├─ storagePath = `${user.id}/xyz789/documento.pdf`
                                            │     │
                                            │     └─ serviceClient.storage.from('agentes-especialistas-docs').upload(storagePath, arrayBuffer, {contentType: 'application/pdf'})
                                            │          ──────────────────────────────────────────>
                                            │                                 │
                                            │                      T6: Upload no Storage
                                            │                      │
                                            │                      └─ storage.objects[
                                            │                           bucket_id = 'agentes-especialistas-docs',
                                            │                           name = '{user_id}/xyz789/documento.pdf',
                                            │                           file_content = ArrayBuffer
                                            │                         ]
                                            │          <──────────────────────────────────────────
                                            │
                                            ├─ documentsMetadata = [
                                            │    {
                                            │      nome: 'documento.pdf',
                                            │      storage_path: '{user_id}/xyz789/documento.pdf',
                                            │      mime_type: 'application/pdf',
                                            │      tamanho_bytes: 1024000
                                            │    }
                                            │  ]
                                            │
                                            ├─ [Normalização de arquivos]
                                            │  └─ Converte DOCX→HTML, se necessário
                                            │  └─ documentsForGemini = [
                                            │       {
                                            │         base64: 'JVBERi0xLjQK...[base64]...',
                                            │         mimeType: 'application/pdf'
                                            │       }
                                            │     ]
                                            │
                                            ├─ [Criar Run Record]
                                            │  │
                                            │  └─ serviceClient.from('agentes_especialistas_runs').insert({
                                            │       id: 'xyz789',
                                            │       user_id: '${auth.uid()}',
                                            │       agent_slug: 'rg',
                                            │       agent_nome: 'Extrator de RG',
                                            │       documentos: documentsMetadata,
                                            │       instrucoes_customizadas: 'Por favor, extraia apenas dados legíveis',
                                            │       prompt_versao: 1,
                                            │       prompt_usado: 'Voce e um especialista em extracao de dados de RG...[SNAPSHOT!]',
                                            │       modelo: 'gemini-3-flash-preview',
                                            │       status: 'processing',
                                            │       started_at: '2024-02-01T10:00:00Z'
                                            │     })
                                            │          ──────────────────────────────────────────>
                                            │                                 │
                                            │                      T7: INSERT no Banco
                                            │                      │
                                            │                      └─ agentes_especialistas_runs
                                            │                           ├─ id = 'xyz789'
                                            │                           ├─ user_id = '...'
                                            │                           ├─ agent_slug = 'rg'
                                            │                           ├─ prompt_usado = '[SNAPSHOT COMPLETO]'
                                            │                           └─ status = 'processing'
                                            │          <──────────────────────────────────────────
                                            │
                                            ├─ fullPrompt = buildFullPrompt(
                                            │    activePrompt.system_prompt,
                                            │    'Por favor, extraia apenas dados legíveis'
                                            │  )
                                            │
                                            │  Resultado:
                                            │  ┌─────────────────────────────────────────┐
                                            │  │ Voce e um especialista em extracao de  │
                                            │  │ dados de RG...                         │
                                            │  │                                         │
                                            │  │ [3000+ caracteres do prompt base]      │
                                            │  │                                         │
                                            │  │ ---                                     │
                                            │  │                                         │
                                            │  │ ## INSTRUCOES ADICIONAIS DO USUARIO    │
                                            │  │                                         │
                                            │  │ Por favor, extraia apenas dados legíveis
                                            │  │                                         │
                                            │  │ ---                                     │
                                            │  │                                         │
                                            │  │ IMPORTANTE: Aplique as instrucoes...  │
                                            │  └─────────────────────────────────────────┘
                                            │
                                            ├─ startTime = Date.now()
                                            │
                                            └─ callGeminiWithDocuments(fullPrompt, documentsForGemini)
                                                        │
                                                        ├─ Monta request JSON:
                                                        │  {
                                                        │    contents: [{
                                                        │      parts: [
                                                        │        {inlineData: {mimeType: 'application/pdf', data: 'JVBERi0xLjQK...'}},
                                                        │        {text: '[fullPrompt aqui]'}
                                                        │      ]
                                                        │    }],
                                                        │    generationConfig: {
                                                        │      temperature: 0.1,
                                                        │      maxOutputTokens: 16384
                                                        │    }
                                                        │  }
                                                        │
                                                        └─ POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=...
                                                                   ──────────────────────────────────────────>
                                                                                              │
                                                                                   T8: Processar no Gemini
                                                                                   │
                                                                                   ├─ Processa PDF
                                                                                   ├─ Lê prompt
                                                                                   ├─ temperature=0.1 (determinístico)
                                                                                   ├─ maxOutputTokens=16384
                                                                                   │
                                                                                   └─ Gera resposta:
                                                                                      "## REESCRITA DO DOCUMENTO\n
                                                                                       REPÚBLICA FEDERATIVA DO BRASIL...\n
                                                                                       \n
                                                                                       ## EXPLICACAO CONTEXTUAL\n
                                                                                       Paragrafo 1: ...\n
                                                                                       \n
                                                                                       ## DADOS CATALOGADOS (JSON)\n
                                                                                       ```json\n
                                                                                       {...}\n
                                                                                       ```"
                                                                                   │
                                                                                   └─ usageMetadata:
                                                                                      ├─ promptTokenCount: 2500
                                                                                      └─ candidatesTokenCount: 1200
                                                                                   │
                                                                                   <──────────────────────────────────────────
                                            │
                                            ├─ geminiResult = {
                                            │    text: '[Resposta 3000+ caracteres]',
                                            │    inputTokens: 2500,
                                            │    outputTokens: 1200
                                            │  }
                                            │
                                            ├─ durationMs = Date.now() - startTime = 3450
                                            ├─ costEstimate = (2500 / 1M) * 0.075 + (1200 / 1M) * 0.30 = 0.000375
                                            │
                                            ├─ [Atualizar Run Record com Resultado]
                                            │  │
                                            │  └─ serviceClient.from('agentes_especialistas_runs').update({
                                            │       status: 'completed',
                                            │       output_texto: '[Resposta do Gemini]',
                                            │       input_tokens: 2500,
                                            │       output_tokens: 1200,
                                            │       cost_estimate: 0.000375,
                                            │       completed_at: '2024-02-01T10:00:03.450Z',
                                            │       duration_ms: 3450
                                            │     }).eq('id', 'xyz789')
                                            │          ──────────────────────────────────────────>
                                            │                                 │
                                            │                      T9: UPDATE no Banco
                                            │                      │
                                            │                      └─ agentes_especialistas_runs
                                            │                           ├─ id = 'xyz789'
                                            │                           ├─ status = 'completed'
                                            │                           ├─ output_texto = '[Resposta completa]'
                                            │                           ├─ input_tokens = 2500
                                            │                           ├─ output_tokens = 1200
                                            │                           ├─ cost_estimate = 0.000375
                                            │                           ├─ completed_at = '...'
                                            │                           └─ duration_ms = 3450
                                            │          <──────────────────────────────────────────
                                            │
                                            └─ return RunResponse {
                                                 run_id: 'xyz789',
                                                 status: 'completed',
                                                 output_texto: '[Resposta completa]',
                                                 input_tokens: 2500,
                                                 output_tokens: 1200,
                                                 duration_ms: 3450
                                               }
         <─────────────────────────────────────────────────────────────────────────────────────────

T10      [Recebe RunResponse]
         │
         ├─ const { data, error } = ...
         │
         ├─ if (!error && !data.error)
         │  └─ setState({
         │       status: 'completed',
         │       resultado: data.output_texto,
         │       runId: data.run_id,
         │       inputTokens: data.input_tokens,
         │       outputTokens: data.output_tokens,
         │       durationMs: data.duration_ms
         │     })
         │
T11      [Renderizar Resultado]
         │
         ├─ <ResultadoAnalise>
         │  ├─ Abas:
         │  │  ├─ Reescrita: texto do documento
         │  │  ├─ Explicação: 5 parágrafos
         │  │  ├─ Dados: campos estruturados (FormSection)
         │  │  └─ JSON: código puro
         │  │
         │  ├─ Buttons:
         │  │  ├─ Copiar
         │  │  ├─ Exportar DOCX
         │  │  ├─ Exportar PDF
         │  │  └─ Expandir modal
         │  │
         │  └─ Métricas:
         │     ├─ Duração: 3.45s
         │     ├─ Tokens: 2500 input, 1200 output
         │     └─ Custo: $0.00055

T12      [Usuário interage]
         │
         ├─ Clica "Copiar"
         │  └─ copyToClipboard(filterJsonSection(resultado))
         │
         ├─ Clica "Exportar DOCX"
         │  └─ exportToDocx(resultado, 'rg-extracao.docx')
         │
         └─ Clica "Ver Histórico"
            └─ GET /agentes-especialistas/history
                   ──────────────────────────────────────────>
                                                              │
                                                    T13: Query no Banco
                                                    │
                                                    ├─ supabase.rpc('get_specialist_runs_history', {
                                                    │    p_user_id: '...',
                                                    │    p_limit: 20,
                                                    │    p_offset: 0,
                                                    │    p_agent_slug: null
                                                    │  })
                                                    │
                                                    └─ Retorna: [
                                                         {
                                                           id: 'xyz789',
                                                           agent_slug: 'rg',
                                                           agent_nome: 'Extrator de RG',
                                                           documentos: [...],
                                                           status: 'completed',
                                                           output_texto: '[Resposta]',
                                                           input_tokens: 2500,
                                                           output_tokens: 1200,
                                                           duration_ms: 3450,
                                                           created_at: '2024-02-01T10:00:00Z'
                                                         },
                                                         ...
                                                       ]
                   <──────────────────────────────────────────
            │
            ├─ <ExecutionHistoryAgentes>
            │  ├─ Lista de runs
            │  │  ├─ Data de execução
            │  │  ├─ Status visual
            │  │  ├─ Agente usado
            │  │  ├─ Duração
            │  │  └─ Tokens
            │  │
            │  ├─ Filtro por agente
            │  ├─ Paginação (20 por página)
            │  └─ Botão "Ver Detalhes"
            │
            └─ Clica "Ver Detalhes" da run xyz789
               │
               └─ GET /agentes-especialistas/run/xyz789
                      ──────────────────────────────────────────>
                                                                 │
                                                       T14: Query no Banco
                                                       │
                                                       ├─ SELECT *
                                                       │  FROM agentes_especialistas_runs
                                                       │  WHERE id = 'xyz789'
                                                       │    AND user_id = '...'
                                                       │
                                                       └─ Retorna: RunDetailResponse
                                                            ├─ id, user_id, agent_slug, agent_nome
                                                            ├─ documentos (metadados)
                                                            ├─ prompt_versao, prompt_usado (SNAPSHOT!)
                                                            ├─ output_texto, output_thinking
                                                            ├─ input_tokens, output_tokens
                                                            ├─ thinking_duration_ms, cost_estimate
                                                            ├─ started_at, completed_at, duration_ms
                                                            └─ status
                      <──────────────────────────────────────────
               │
               └─ <ExecutionDetailModal>
                  ├─ Todas as informações da run
                  ├─ Snapshot do prompt USADO
                  ├─ Instruções customizadas
                  ├─ Documentos processados
                  ├─ Resultado completo
                  └─ Métricas detalhadas

─────────────────────────────────────────────────────────────────────────────────────────────────
```

---

## 2. MAPA MENTAL: COMPONENTES E FLUXOS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SISTEMA DE AGENTES ESPECIALISTAS                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────── FRONTEND ──────────────────────────────┐  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ DashboardAgentes.tsx (Catálogo)                         │   │  │
│  │  │ ├─ Lista 11 agentes por categoria                       │   │  │
│  │  │ ├─ AgenteCard (clicável)                                │   │  │
│  │  │ └─ AgenteFilter (pessoais|imobiliarios|empresariais)   │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │            │                                                     │  │
│  │            └─> Clica em agente                                  │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ AgenteExtrator.tsx (Execução)                           │   │  │
│  │  │ ├─ const { tipo } = useParams() = 'rg'                 │   │  │
│  │  │ ├─ const agente = getAgenteBySlug('rg')                │   │  │
│  │  │ ├─ const agent = useAgentRun()  [Hook]                │   │  │
│  │  │ │                                                        │   │  │
│  │  │ ├─ [Estado]                                              │   │  │
│  │  │ │  ├─ arquivos: ArquivoUpload[]                          │   │  │
│  │  │ │  ├─ instrucoes: string                                │   │  │
│  │  │ │  ├─ status: 'idle'|'analyzing'|'completed'|'error'   │   │  │
│  │  │ │  └─ resultado: string                                 │   │  │
│  │  │ │                                                        │   │  │
│  │  │ ├─ <UploadZone>                                          │   │  │
│  │  │ │  ├─ Drag & drop PDF/PNG/DOCX                          │   │  │
│  │  │ │  └─ onChange: setArquivos([...])                      │   │  │
│  │  │ │                                                        │   │  │
│  │  │ ├─ <Textarea> instrucoes_customizadas                   │   │  │
│  │  │ │                                                        │   │  │
│  │  │ ├─ <Button> Analisar                                    │   │  │
│  │  │ │  └─ onClick: handleAnalyze()                          │   │  │
│  │  │ │     └─ agent.executeRun(agente.slug, files, instrucoes)
│  │  │ │                                                        │   │  │
│  │  │ ├─ <ResultadoAnalise>                                    │   │  │
│  │  │ │  ├─ status={status}                                    │   │  │
│  │  │ │  ├─ conteudo={resultado}                              │   │  │
│  │  │ │  ├─ Abas: Reescrita | Explicação | Dados | JSON      │   │  │
│  │  │ │  └─ Buttons: Copiar | DOCX | PDF | Expandir          │   │  │
│  │  │ │                                                        │   │  │
│  │  │ └─ <ResultadoModal>                                      │   │  │
│  │  │    └─ Exibe em tela cheia se modalOpen                  │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ useAgentRun() Hook                                      │   │  │
│  │  │ ├─ executeRun(agentSlug, files, instrucoes?)            │   │  │
│  │  │ │  ├─ Validar arquivos (length > 0)                     │   │  │
│  │  │ │  ├─ setState({ status: 'analyzing' })                │   │  │
│  │  │ │  ├─ Criar FormData com agent_slug + files             │   │  │
│  │  │ │  └─ supabase.functions.invoke('agentes-especialistas/run',
│  │  │ │     { body: formData })                               │   │  │
│  │  │ │                                                        │   │  │
│  │  │ └─ reset()                                               │   │  │
│  │  │    └─ setState(initialState)                             │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ ExecutionHistoryAgentes.tsx (Histórico)                │   │  │
│  │  │ ├─ GET /agentes-especialistas/history                  │   │  │
│  │  │ ├─ Lista paginada de runs                               │   │  │
│  │  │ ├─ Filtro por agent_slug                                │   │  │
│  │  │ └─ Clica em run → ExecutionDetailModal                  │   │  │
│  │  │    └─ GET /agentes-especialistas/run/:id                │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                                                                         │
│  ┌────────────────────────── EDGE FUNCTION ──────────────────────────┐ │
│  │ supabase/functions/agentes-especialistas/index.ts                 │ │
│  │                                                                    │ │
│  │  handleRun(req) - POST /run                                       │ │
│  │  ├─ createSupabaseClient(req) - Auth user                        │ │
│  │  ├─ createServiceClient() - Admin ops                            │ │
│  │  ├─ getUser(supabase) - Validação                                │ │
│  │  ├─ Parse FormData (agent_slug, documentos, instrucoes)          │ │
│  │  │                                                                 │ │
│  │  ├─ [BUSCA PROMPT DINÂMICO]                                       │ │
│  │  │  └─ supabase.rpc('get_active_specialist_prompt', {p_agent_slug})
│  │  │     └─ Retorna: {id, agent_slug, versao, system_prompt, nome_exibicao}
│  │  │                                                                 │ │
│  │  ├─ [VALIDAÇÃO DE ARQUIVOS]                                      │ │
│  │  │  ├─ Tamanho < 20MB                                             │ │
│  │  │  └─ MIME type permitido                                        │ │
│  │  │                                                                 │ │
│  │  ├─ [UPLOAD PARA STORAGE]                                        │ │
│  │  │  ├─ serviceClient.storage.from('agentes-especialistas-docs')  │ │
│  │  │  └─ .upload('{user_id}/{run_id}/{filename}', buffer)          │ │
│  │  │                                                                 │ │
│  │  ├─ [NORMALIZAÇÃO DE ARQUIVOS]                                   │ │
│  │  │  └─ normalizeFilesForGemini(rawFiles)                          │ │
│  │  │     ├─ DOCX → HTML                                             │ │
│  │  │     └─ Converte para base64                                    │ │
│  │  │                                                                 │ │
│  │  ├─ [CREATE RUN RECORD]                                          │ │
│  │  │  └─ serviceClient.from('agentes_especialistas_runs').insert({
│  │  │     id, user_id, agent_slug, agent_nome,                      │ │
│  │  │     documentos, instrucoes_customizadas,                       │ │
│  │  │     prompt_versao, prompt_usado (SNAPSHOT!),                  │ │
│  │  │     modelo, status: 'processing', started_at              │ │
│  │  │   })                                                           │ │
│  │  │                                                                 │ │
│  │  ├─ [BUILD FULL PROMPT]                                          │ │
│  │  │  └─ buildFullPrompt(system_prompt, user_instructions)          │ │
│  │  │     ┌─ system_prompt (do banco)                                │ │
│  │  │     ├─ ---                                                      │ │
│  │  │     └─ ## INSTRUCOES ADICIONAIS DO USUARIO                    │ │
│  │  │        user_instructions (se fornecido)                        │ │
│  │  │                                                                 │ │
│  │  ├─ [CALL GEMINI API]                                            │ │
│  │  │  └─ callGeminiWithDocuments(fullPrompt, documentsForGemini)   │ │
│  │  │     ├─ POST https://generativelanguage.googleapis.com/...      │ │
│  │  │     ├─ Request: { contents: [{ parts: [doc1, doc2, prompt] }] }
│  │  │     ├─ Response: { text, inputTokens, outputTokens }          │ │
│  │  │     └─ Gemini model: gemini-3-flash-preview                   │ │
│  │  │                                                                 │ │
│  │  ├─ [CALCULA CUSTO]                                              │ │
│  │  │  └─ estimateCost(inputTokens, outputTokens)                   │ │
│  │  │     = (input / 1M) * $0.075 + (output / 1M) * $0.30           │ │
│  │  │                                                                 │ │
│  │  ├─ [UPDATE RUN RECORD]                                          │ │
│  │  │  └─ serviceClient.from('agentes_especialistas_runs')          │ │
│  │  │     .update({                                                  │ │
│  │  │       status: 'completed',                                     │ │
│  │  │       output_texto: geminiResult.text,                         │ │
│  │  │       input_tokens, output_tokens,                             │ │
│  │  │       cost_estimate,                                           │ │
│  │  │       completed_at, duration_ms                                │ │
│  │  │     })                                                         │ │
│  │  │                                                                 │ │
│  │  └─ RETURN RunResponse { run_id, status, output_texto, tokens }  │ │
│  │                                                                    │ │
│  │  handleHistory(req) - GET /history?limit=20&offset=0             │ │
│  │  ├─ getUser(supabase)                                             │ │
│  │  ├─ supabase.rpc('get_specialist_runs_history', {...})           │ │
│  │  └─ RETURN { runs: [...], total: count }                          │ │
│  │                                                                    │ │
│  │  handleRunDetail(req, runId) - GET /run/:id                      │ │
│  │  ├─ getUser(supabase)                                             │ │
│  │  ├─ SELECT * FROM agentes_especialistas_runs WHERE id = runId    │ │
│  │  └─ RETURN RunDetailResponse                                      │ │
│  │                                                                    │ │
│  │  handleAgentsList(req) - GET /agents                             │ │
│  │  ├─ getUser(supabase)                                             │ │
│  │  ├─ supabase.rpc('list_specialist_agents')                       │ │
│  │  └─ RETURN { agents: [...] }                                      │ │
│  │                                                                    │ │
│  │  handleDocumentDownload(req, runId, filename) - GET /run/:id/document/:filename
│  │  ├─ getUser(supabase)                                             │ │
│  │  ├─ Verifica que doc pertence ao usuário                         │ │
│  │  ├─ supabase.storage.createSignedUrl(storage_path, 3600)         │ │
│  │  └─ RETURN { download_url, filename, mime_type, size_bytes }     │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                                                         │
│  ┌────────────────── BANCO DE DADOS (SUPABASE) ──────────────────────┐ │
│  │                                                                    │ │
│  │  ┌─ agentes_especialistas_prompts ────────────────────────────┐  │ │
│  │  │ Versionado, apenas UM ativo por agent_slug                │  │ │
│  │  │                                                             │  │ │
│  │  │ id | agent_slug | versao | system_prompt (3000+ chars)    │  │ │
│  │  │ nome_exibicao | descricao | categoria | ativo | created_at
│  │  │                                                             │  │ │
│  │  │ RLS: Todos usuários autenticados podem SELECT              │  │ │
│  │  │                                                             │  │ │
│  │  │ 11 agentes (seed):                                         │  │ │
│  │  │ 1. rg - Extrator de RG                                    │  │ │
│  │  │ 2. cnh - Extrator de CNH                                  │  │ │
│  │  │ 3. certidao-casamento                                      │  │ │
│  │  │ 4. certidao-nascimento                                     │  │ │
│  │  │ 5. matricula-imovel                                        │  │ │
│  │  │ 6. itbi                                                     │  │ │
│  │  │ 7. iptu                                                     │  │ │
│  │  │ 8. escritura                                               │  │ │
│  │  │ 9. compromisso-compra-venda                                │  │ │
│  │  │ 10. contrato-social                                        │  │ │
│  │  │ 11. cndt                                                    │  │ │
│  │  └────────────────────────────────────────────────────────────┘  │ │
│  │                                                                    │ │
│  │  ┌─ agentes_especialistas_runs ──────────────────────────────┐   │ │
│  │  │ Histórico completo com snapshots de prompts              │   │ │
│  │  │                                                            │   │ │
│  │  │ id | user_id | agent_slug | agent_nome                   │   │ │
│  │  │ documentos (JSONB) | instrucoes_customizadas             │   │ │
│  │  │ prompt_versao | prompt_usado (SNAPSHOT COMPLETO!)        │   │ │
│  │  │ modelo | output_texto | output_thinking                  │   │ │
│  │  │ status | erro_mensagem                                    │   │ │
│  │  │ input_tokens | output_tokens | thinking_duration_ms      │   │ │
│  │  │ cost_estimate | started_at | completed_at | duration_ms  │   │ │
│  │  │ created_at | updated_at                                   │   │ │
│  │  │                                                            │   │ │
│  │  │ RLS: Usuários veem apenas suas próprias runs             │   │ │
│  │  │      (todas as operações: SELECT, INSERT, UPDATE, DELETE) │   │ │
│  │  │                                                            │   │ │
│  │  │ Indexes:                                                   │   │ │
│  │  │ - user_id (paginação por usuário)                         │   │ │
│  │  │ - agent_slug (filtro por agente)                          │   │ │
│  │  │ - status (monitorar processamento)                        │   │ │
│  │  │ - created_at DESC (ordenação)                             │   │ │
│  │  │ - (user_id, agent_slug, created_at DESC) (composite)     │   │ │
│  │  └────────────────────────────────────────────────────────────┘   │ │
│  │                                                                    │ │
│  │  ┌─ storage.buckets[agentes-especialistas-docs] ──────────────┐  │ │
│  │  │ Armazena documentos uploadados (privado)                   │  │ │
│  │  │                                                             │  │ │
│  │  │ Estrutura: {user_id}/{run_id}/{filename}                   │  │ │
│  │  │ Max size: 20MB                                              │  │ │
│  │  │ Types: PDF, PNG, JPEG, WEBP, GIF, DOCX                    │  │ │
│  │  │                                                             │  │ │
│  │  │ RLS: Usuários accessam apenas seus próprios docs          │  │ │
│  │  │      (based on user_id path)                               │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  │                                                                    │ │
│  │  ┌─ SQL Helper Functions ───────────────────────────────────┐    │ │
│  │  │ get_active_specialist_prompt(p_agent_slug)               │    │ │
│  │  │ get_specialist_runs_history(p_user_id, limit, offset)   │    │ │
│  │  │ create_specialist_run(p_user_id, p_agent_slug, docs)    │    │ │
│  │  │ complete_specialist_run(p_run_id, output, tokens, etc)  │    │ │
│  │  │ list_specialist_agents()                                │    │ │
│  │  └────────────────────────────────────────────────────────────┘  │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                                                         │
│  ┌────────────────────────── GEMINI API ──────────────────────────┐   │
│  │ https://generativelanguage.googleapis.com/v1beta/models/...    │   │
│  │                                                                 │   │
│  │ POST :generateContent?key=GEMINI_API_KEY                       │   │
│  │                                                                 │   │
│  │ Request:                                                        │   │
│  │ {                                                               │   │
│  │   contents: [{                                                  │   │
│  │     parts: [                                                    │   │
│  │       {inlineData: {mimeType: 'application/pdf', data: 'base64'}},
│  │       {inlineData: {mimeType: 'image/png', data: 'base64'}},   │   │
│  │       {text: '[FULL PROMPT aqui, 3000+ chars]'}               │   │
│  │     ]                                                           │   │
│  │   }],                                                           │   │
│  │   generationConfig: {                                           │   │
│  │     temperature: 0.1,  // Determinístico                       │   │
│  │     maxOutputTokens: 16384                                      │   │
│  │   }                                                             │   │
│  │ }                                                               │   │
│  │                                                                 │   │
│  │ Response:                                                       │   │
│  │ {                                                               │   │
│  │   candidates: [{                                                │   │
│  │     content: {                                                  │   │
│  │       parts: [{                                                 │   │
│  │         text: '## REESCRITA DO DOCUMENTO\n...\n## EXPLICACAO\n...\n## DADOS CATALOGADOS\n```json\n{...}\n```'
│  │       }]                                                        │   │
│  │     }                                                           │   │
│  │   }],                                                           │   │
│  │   usageMetadata: {                                              │   │
│  │     promptTokenCount: 2500,                                    │   │
│  │     candidatesTokenCount: 1200                                 │   │
│  │   }                                                             │   │
│  │ }                                                               │   │
│  │                                                                 │   │
│  │ Model: gemini-3-flash-preview                                  │   │
│  │ Cost: $0.075/1M input tokens + $0.30/1M output tokens         │   │
│  │                                                                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CICLO DE VIDA DE UMA RUN

```
┌─────────────────────────────────────────────────────────────────────┐
│ CICLO DE VIDA DE UMA RUN DE AGENTE ESPECIALISTA                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 1: PREPARAÇÃO (Frontend)                           │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 1. Usuário seleciona agente (ex: 'rg')                    │   │
│ │ 2. Upload de arquivo(s)                                    │   │
│ │ 3. Digita instruções customizadas (opcional)               │   │
│ │ 4. Clica "Analisar"                                        │   │
│ │                                                             │   │
│ │ Estado: status = 'analyzing'                               │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 2: REQUISIÇÃO (Hook → Edge Function)               │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 1. useAgentRun().executeRun() criado FormData              │   │
│ │ 2. POST /agentes-especialistas/run                         │   │
│ │ 3. FormData contém: agent_slug, documentos, instrucoes     │   │
│ │                                                             │   │
│ │ Em trânsito: FormData                                       │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 3: AUTENTICAÇÃO E VALIDAÇÃO (Edge)                │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 1. createSupabaseClient(req) com auth header               │   │
│ │ 2. getUser() - verifica JWT válido                         │   │
│ │ 3. Parse FormData                                           │   │
│ │ 4. Validações:                                              │   │
│ │    - agent_slug existe?                                    │   │
│ │    - documentos têm tamanho?                                │   │
│ │    - MIME types suportados?                                 │   │
│ │                                                             │   │
│ │ Se validação falha: return 400/404 error                   │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 4: BUSCA DINÂMICA DE PROMPT                        │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 1. supabase.rpc('get_active_specialist_prompt')            │   │
│ │    - Query: SELECT * FROM agentes_especialistas_prompts    │   │
│ │             WHERE agent_slug = 'rg' AND ativo = true       │   │
│ │                                                             │   │
│ │ 2. Retorna: ActivePrompt {                                 │   │
│ │    id, agent_slug, versao, system_prompt (COMPLETO!),      │   │
│ │    nome_exibicao, descricao, categoria                     │   │
│ │  }                                                          │   │
│ │                                                             │   │
│ │ Se prompt não existe: return 404 error                     │   │
│ │ "Prompt nao encontrado para agente: rg"                    │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 5: PROCESSAMENTO DE ARQUIVOS                       │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 1. Para cada arquivo:                                      │   │
│ │    - Lê como ArrayBuffer                                   │   │
│ │    - Valida tamanho (< 20MB)                               │   │
│ │    - Valida MIME type                                      │   │
│ │    - Upload para Storage: {user_id}/{run_id}/{filename}   │   │
│ │                                                             │   │
│ │ 2. Normalização:                                            │   │
│ │    - DOCX → HTML (via normalizeFilesForGemini)             │   │
│ │    - Convert para base64 (para Gemini)                     │   │
│ │                                                             │   │
│ │ Documentos preparados: Array<{base64, mimeType}>           │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 6: CRIAR RUN RECORD (status: processing)           │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ INSERT INTO agentes_especialistas_runs (                    │   │
│ │   id = runId (UUID gerado),                               │   │
│ │   user_id = auth.uid(),                                   │   │
│ │   agent_slug = 'rg',                                      │   │
│ │   agent_nome = 'Extrator de RG',                         │   │
│ │   documentos = [{nome, storage_path, mime_type, ...}],   │   │
│ │   instrucoes_customizadas = "...",                         │   │
│ │   prompt_versao = 1,                                       │   │
│ │   prompt_usado = "[SNAPSHOT COMPLETO DO PROMPT]",         │   │
│ │   modelo = 'gemini-3-flash-preview',                      │   │
│ │   status = 'processing',                                   │   │
│ │   started_at = NOW()                                       │   │
│ │ )                                                           │   │
│ │                                                             │   │
│ │ → runId é salvo no banco!                                  │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 7: CONSTRUIR PROMPT FINAL                          │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 1. buildFullPrompt(basePrompt, userInstructions)           │   │
│ │                                                             │   │
│ │ 2. Resultado:                                               │   │
│ │    - system_prompt (3000+ caracteres)                      │   │
│ │    - "---"                                                  │   │
│ │    - "## INSTRUCOES ADICIONAIS DO USUARIO"                │   │
│ │    - userInstructions (se fornecido)                       │   │
│ │    - "---"                                                  │   │
│ │    - "IMPORTANTE: Aplique as instrucoes..."               │   │
│ │                                                             │   │
│ │ fullPrompt total: ~4000-5000 caracteres                    │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 8: CHAMAR GEMINI API                               │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 1. callGeminiWithDocuments(fullPrompt, docs)               │   │
│ │                                                             │   │
│ │ 2. POST https://generativelanguage.googleapis.com/...      │   │
│ │    Body:                                                    │   │
│ │    {                                                        │   │
│ │      contents: [{                                           │   │
│ │        parts: [                                             │   │
│ │          {inlineData: {mimeType: 'application/pdf', data: base64}},
│ │          {text: fullPrompt}                                 │   │
│ │        ]                                                    │   │
│ │      }],                                                    │   │
│ │      generationConfig: {                                    │   │
│ │        temperature: 0.1,  // MUITO BAIXO = determinístico  │   │
│ │        maxOutputTokens: 16384                               │   │
│ │      }                                                      │   │
│ │    }                                                        │   │
│ │                                                             │   │
│ │ 3. Aguarda resposta (pode levar 3-10 segundos)            │   │
│ │                                                             │   │
│ │ 4. Response contém:                                         │   │
│ │    - text: resposta completa (Markdown 3 seções)           │   │
│ │    - usageMetadata.promptTokenCount: 2500 (exemplo)        │   │
│ │    - usageMetadata.candidatesTokenCount: 1200 (exemplo)    │   │
│ │                                                             │   │
│ │ Se erro Gemini: atualiza run com status='error'           │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 9: CALCULAR MÉTRICAS                               │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 1. durationMs = Date.now() - startTime                     │   │
│ │    (ex: 3450 ms = 3.45 segundos)                           │   │
│ │                                                             │   │
│ │ 2. estimateCost(inputTokens, outputTokens)                 │   │
│ │    = (2500 / 1M) * 0.075 + (1200 / 1M) * 0.30             │   │
│ │    = 0.0001875 + 0.00036                                   │   │
│ │    = 0.0005475 ≈ $0.00055                                  │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 10: ATUALIZAR RUN RECORD                           │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ UPDATE agentes_especialistas_runs SET (                     │   │
│ │   status = 'completed',                                     │   │
│ │   output_texto = "[Resposta do Gemini em Markdown]",      │   │
│ │   input_tokens = 2500,                                      │   │
│ │   output_tokens = 1200,                                     │   │
│ │   cost_estimate = 0.0005475,                                │   │
│ │   completed_at = NOW(),                                     │   │
│ │   duration_ms = 3450,                                       │   │
│ │   updated_at = NOW()                                        │   │
│ │ ) WHERE id = runId                                          │   │
│ │                                                             │   │
│ │ → RUN AGORA TEM RESULTADO COMPLETO NO BANCO!               │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 11: RETORNAR RESULTADO (Edge → Frontend)           │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ return RunResponse {                                        │   │
│ │   run_id: 'xyz789',                                         │   │
│ │   status: 'completed',                                      │   │
│ │   output_texto: "[Resposta em Markdown]",                  │   │
│ │   input_tokens: 2500,                                       │   │
│ │   output_tokens: 1200,                                      │   │
│ │   duration_ms: 3450                                         │   │
│ │ }                                                           │   │
│ │                                                             │   │
│ │ Status: 200 OK                                              │   │
│ │ Content-Type: application/json                              │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 12: PROCESSAR RESULTADO (Frontend)                 │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ 1. const { data, error } = await supabase.functions.invoke(...)
│ │                                                             │   │
│ │ 2. if (!error && data.status === 'completed')              │   │
│ │    setState({                                               │   │
│ │      status: 'completed',                                   │   │
│ │      resultado: data.output_texto,                          │   │
│ │      runId: data.run_id,                                    │   │
│ │      inputTokens: data.input_tokens,                        │   │
│ │      outputTokens: data.output_tokens,                      │   │
│ │      durationMs: data.duration_ms                           │   │
│ │    })                                                       │   │
│ │                                                             │   │
│ │ 3. <ResultadoAnalise> renderiza com:                        │   │
│ │    - Abas: Reescrita | Explicação | Dados | JSON           │   │
│ │    - Buttons: Copiar | Exportar DOCX | Exportar PDF        │   │
│ │    - Métricas: duração, tokens, custo                       │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                           ↓                                        │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ ESTÁGIO 13: USUÁRIO INTERAGE COM RESULTADO                 │   │
│ ├─────────────────────────────────────────────────────────────┤   │
│ │ ┌─ Opção 1: Copiar resultado                               │   │
│ │ │  - Filtra seção JSON                                     │   │
│ │ │  - copia conteúdo para clipboard                         │   │
│ │ │                                                           │   │
│ │ ├─ Opção 2: Exportar DOCX                                   │   │
│ │ │  - exportToDocx(resultado, 'rg-extracao.docx')            │   │
│ │ │  - Download no navegador                                 │   │
│ │ │                                                           │   │
│ │ ├─ Opção 3: Exportar PDF                                    │   │
│ │ │  - exportToPdf(resultado, 'rg-extracao.pdf')              │   │
│ │ │  - Download no navegador                                 │   │
│ │ │                                                           │   │
│ │ ├─ Opção 4: Ver Histórico                                   │   │
│ │ │  - GET /agentes-especialistas/history                    │   │
│ │ │  - Lista todas as runs do usuário                        │   │
│ │ │                                                           │   │
│ │ ├─ Opção 5: Ver Detalhes                                    │   │
│ │ │  - GET /agentes-especialistas/run/:id                    │   │
│ │ │  - Abre modal com todas as informações                   │   │
│ │ │                                                           │   │
│ │ └─ Opção 6: Nova análise                                    │   │
│ │    - handleNewDocument()                                    │   │
│ │    - Reseta estado                                          │   │
│ │    - Permite novo upload                                    │   │
│ │                                                             │   │
│ │ ESTADO FINAL: status = 'completed'                         │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. MATRIZ DE DECISÃO: QUAL AGENTE USAR?

```
TIPO DE DOCUMENTO?
│
├─ PESSOAL (Pessoa Física)
│  │
│  ├─ RG/Carteira de Identidade?
│  │  └─ Agente: RG
│  │     Slug: rg
│  │     Output: Nome, CPF, Filiação, Órgão Expedidor
│  │
│  ├─ Carteira de Motorista (CNH)?
│  │  └─ Agente: CNH
│  │     Slug: cnh
│  │     Output: Categoria de Habilitação, Validade, RG
│  │
│  ├─ Comprovante de Casamento?
│  │  └─ Agente: Certidão de Casamento
│  │     Slug: certidao-casamento
│  │     Output: Cônjuges, Regime de Bens, Averbações
│  │
│  └─ Comprovante de Nascimento?
│     └─ Agente: Certidão de Nascimento
│        Slug: certidao-nascimento
│        Output: Filiação, Data/Local de Nascimento, Avós
│
├─ IMOBILIÁRIO (Propriedade)
│  │
│  ├─ Documento do Cartório (RI)?
│  │  └─ Agente: Matrícula de Imóvel
│  │     Slug: matricula-imovel
│  │     Output: Proprietários, Cadeia Dominial, Ónus
│  │
│  ├─ Imposto de Transferência (ITBI)?
│  │  └─ Agente: ITBI
│  │     Slug: itbi
│  │     Output: Valor Transação, Base Cálculo, Aliquota
│  │
│  ├─ Imposto Predial (IPTU)?
│  │  └─ Agente: IPTU
│  │     Slug: iptu
│  │     Output: Áreas, Valores Venais, Contribuintes
│  │
│  ├─ Ato de Compra e Venda?
│  │  └─ Agente: Escritura
│  │     Slug: escritura
│  │     Output: Partes, Imovel, Valores, ITBI
│  │
│  └─ Contrato de Compra Não Registrado?
│     └─ Agente: Compromisso de Compra e Venda
│        Slug: compromisso-compra-venda
│        Output: Preço, Sinal, Saldo, Prazos
│
└─ EMPRESARIAL (Jurídica)
   │
   ├─ Constituição/Alteração de Empresa?
   │  └─ Agente: Contrato Social
   │     Slug: contrato-social
   │     Output: Sócios, Capital Social, Objeto Social
   │
   └─ Comprovante de Situação Trabalhista?
      └─ Agente: CNDT
         Slug: cndt
         Output: Status (Positiva/Negativa), Validade
```

---

**Documento criado:** 2024-02-01
**Versão:** 1.0
