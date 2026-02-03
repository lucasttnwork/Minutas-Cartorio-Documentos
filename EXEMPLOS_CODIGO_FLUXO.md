# Exemplos de Código - Fluxo de Classificação

## 1. Upload de Documentos

### Código: UploadDocumentos.tsx

```typescript
// Método principal de upload
const handleUploadFile = useCallback(
  async (file: File, category: UploadCategory) => {
    // 1. Validar arquivo
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(`Erro: ${validation.error}`);
      return;
    }

    // 2. Gerar ID temporário enquanto faz upload
    const tempId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // 3. Adicionar ao estado local como 'uploading'
    addDocument({
      id: tempId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      category,
      status: 'uploading',
      progress: 0,
    });

    // 4. Se minuta válida, fazer upload real
    if (!currentMinuta?.id || !isDbId(currentMinuta.id)) {
      // Modo mock local
      setTimeout(() => {
        removeDocument(tempId);
        addDocument({
          id: tempId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          category,
          status: 'complete',
          progress: 100,
        });
      }, 500);
      return;
    }

    // 5. Upload real para Supabase
    try {
      const result = await uploadDocument(file, currentMinuta.id, category);

      removeDocument(tempId);

      if (result) {
        // Sucesso: add com ID real do banco
        addDocument({
          id: result.id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          category,
          status: 'complete',
          progress: 100,
        });
        toast.success(`${file.name} enviado com sucesso`);
      } else {
        // Erro: mostrar em vermelho
        addDocument({
          id: tempId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          category,
          status: 'error',
          progress: 0,
          errorMessage: uploadError || 'Erro ao fazer upload',
        });
        toast.error(`Erro ao enviar ${file.name}`);
      }
    } catch (err) {
      // Erro inesperado
      removeDocument(tempId);
      addDocument({
        id: tempId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        category,
        status: 'error',
        progress: 0,
        errorMessage: 'Erro inesperado ao fazer upload',
      });
    }
  },
  [addDocument, removeDocument, currentMinuta?.id, uploadDocument, uploadError]
);

// Clica "Processar Documentos"
const handleProcessar = async () => {
  if (documents.length === 0) {
    toast.error('Adicione pelo menos um documento');
    return;
  }

  setIsProcessing(true);
  toast.info('Iniciando processamento...');

  // Navega para página de processamento
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (currentMinuta) {
    navigate(`/minuta/${currentMinuta.id}/processando`);
  }
};
```

### Código: useDocumentUpload.ts

```typescript
export function useDocumentUpload(): UseDocumentUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = useCallback(
    async (
      file: File,
      minutaId: string,
      _category: string
    ): Promise<UploadResult | null> => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // 1. Obter user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Usuario nao autenticado');
          setUploading(false);
          return null;
        }

        // 2. Gerar storage path
        const storagePath = generateStoragePath(user.id, minutaId, file.name);
        // Resultado: {userId}/{minutaId}/{timestamp}_{filename}

        // 3. Upload para Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progressEvent) => {
              const percentage = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setProgress(percentage);
            },
          });

        if (uploadError) {
          setError(`Erro ao fazer upload: ${uploadError.message}`);
          setUploading(false);
          return null;
        }

        setProgress(100);

        // 4. Criar registro na tabela 'documentos'
        const { data: docData, error: dbError } = await supabase
          .from('documentos')
          .insert({
            minuta_id: minutaId,
            nome_original: file.name,
            storage_path: uploadData.path,
            mime_type: file.type || 'application/octet-stream',
            tamanho_bytes: file.size,
            status: 'uploaded' as const,
          })
          .select()
          .single();

        if (dbError) {
          setError(`Erro ao salvar documento: ${dbError.message}`);
          setUploading(false);
          return null;
        }

        setUploading(false);

        return {
          id: docData.id,
          storagePath: docData.storage_path,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(`Erro inesperado: ${errorMessage}`);
        setUploading(false);
        return null;
      }
    },
    []
  );

  return {
    uploadDocument,
    uploading,
    progress,
    error,
    clearError: () => setError(null),
  };
}
```

---

## 2. Pipeline de Processamento

### Código: Processando.tsx (Integração)

```typescript
export default function Processando() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setCurrentStep } = useMinuta();
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const pipelineStarted = useRef(false);

  // Instancia o hook de pipeline
  const { startPipeline, isProcessing, overallProgress } = useDocumentPipeline({
    // Callback quando um documento é processado com sucesso
    onDocumentComplete: (docId) => {
      console.log(`[Pipeline] Document processed: ${docId}`);
    },

    // Callback quando TODOS os documentos são processados
    onPipelineComplete: (minutaId) => {
      console.log(`[Pipeline] Pipeline complete for minuta: ${minutaId}`);
      toast.success('Documentos processados com sucesso!');
      setCurrentStep('outorgantes');
      navigate(`/minuta/${minutaId}/outorgantes`);
    },

    // Callback quando há erro em um documento
    onError: (docId, error) => {
      console.error(`[Pipeline] Error processing document ${docId}: ${error}`);
      setPipelineError(error);
      toast.error(`Erro no processamento: ${error}`);
    },
  });

  // Dispara o pipeline ao carregar a página
  useEffect(() => {
    if (id && !pipelineStarted.current) {
      pipelineStarted.current = true;
      console.log(`[Processando] Starting pipeline for minuta: ${id}`);
      startPipeline(id).catch((err) => {
        console.error('[Processando] Pipeline failed:', err);
        setPipelineError(err.message || 'Erro desconhecido no pipeline');
      });
    }
  }, [id, startPipeline]);

  // Atualiza a UI baseado no progresso
  useEffect(() => {
    if (overallProgress > 0) {
      setProgress(overallProgress);
      // Mapeia porcentagem para o passo atual
      const stepIndex = Math.min(
        Math.floor(overallProgress / (100 / PROCESSING_STEPS.length)),
        PROCESSING_STEPS.length - 1
      );
      setCurrentProcessingStep(stepIndex);
    }
  }, [overallProgress]);

  // Fallback: se levar muito tempo, navega mesmo assim
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!pipelineError && isProcessing) {
        console.log('[Processando] Fallback timeout - navigating to outorgantes');
        setCurrentStep('outorgantes');
        navigate(`/minuta/${id}/outorgantes`);
      }
    }, 60000); // 60 segundos

    return () => clearTimeout(fallbackTimeout);
  }, [id, navigate, setCurrentStep, pipelineError, isProcessing]);

  // Renderizar UI com progresso...
}
```

### Código: useDocumentPipeline.ts (Core Logic)

```typescript
export function useDocumentPipeline(
  options?: UseDocumentPipelineOptions
): UseDocumentPipelineReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statuses, setStatuses] = useState<Map<string, PipelineStatus>>(new Map());

  // Atualiza o status de um documento específico
  const updateStatus = useCallback(
    (documentId: string, step: PipelineStatus['step'], error?: string) => {
      setStatuses((prev) => {
        const newMap = new Map(prev);
        newMap.set(documentId, {
          documentId,
          step,
          progress: PROGRESS_MAP[step],
          error,
        });
        return newMap;
      });
    },
    []
  );

  // Processa um único documento: classifica → extrai
  const processDocument = useCallback(
    async (documentId: string): Promise<boolean> => {
      try {
        // PASSO 1: CLASSIFICAR
        updateStatus(documentId, 'classifying');

        const classifyResult = await supabase.functions.invoke('classify-document', {
          body: { documento_id: documentId },
        });

        if (classifyResult.error) {
          const errorMessage = classifyResult.error.message || 'Classification failed';
          updateStatus(documentId, 'error', errorMessage);
          options?.onError?.(documentId, errorMessage);
          return false;
        }

        console.log(`[Pipeline] Classified: ${documentId}`, classifyResult.data);

        // PASSO 2: EXTRAIR
        updateStatus(documentId, 'extracting');

        const extractResult = await supabase.functions.invoke('extract-document', {
          body: { documento_id: documentId },
        });

        if (extractResult.error) {
          const errorMessage = extractResult.error.message || 'Extraction failed';
          updateStatus(documentId, 'error', errorMessage);
          options?.onError?.(documentId, errorMessage);
          return false;
        }

        console.log(`[Pipeline] Extracted: ${documentId}`, extractResult.data);

        // SUCESSO
        updateStatus(documentId, 'done');
        options?.onDocumentComplete?.(documentId);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        updateStatus(documentId, 'error', errorMessage);
        options?.onError?.(documentId, errorMessage);
        return false;
      }
    },
    [updateStatus, options]
  );

  // Inicia o pipeline para TODOS os documentos de uma minuta
  const startPipeline = useCallback(
    async (minutaId: string): Promise<void> => {
      setIsProcessing(true);

      let hasErrors = false;

      try {
        // 1. Busca todos os documentos pendentes
        const { data: docs } = await supabase
          .from('documentos')
          .select('id')
          .eq('minuta_id', minutaId)
          .in('status', ['uploaded', 'pendente']);

        console.log(`[Pipeline] Found ${docs?.length || 0} documents to process`);

        // 2. Processa cada documento SEQUENCIALMENTE
        for (const doc of docs || []) {
          const success = await processDocument(doc.id);
          if (!success) {
            hasErrors = true;
            // Continua mesmo com erro em um documento
          }
        }

        // 3. Se NÃO houve erros, executa map-to-fields
        if (!hasErrors) {
          console.log('[Pipeline] All documents processed, running map-to-fields');

          const mapResult = await supabase.functions.invoke('map-to-fields', {
            body: { minuta_id: minutaId },
          });

          if (mapResult.error) {
            console.error('[Pipeline] map-to-fields error:', mapResult.error);
            hasErrors = true;
          } else {
            console.log('[Pipeline] map-to-fields success', mapResult.data);
          }
        }

        // 4. Atualiza status da minuta
        if (!hasErrors) {
          await supabase
            .from('minutas')
            .update({
              status: 'revisao',
              current_step: 'outorgantes',
            })
            .eq('id', minutaId);

          options?.onPipelineComplete?.(minutaId);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [processDocument, options]
  );

  // Calcula progresso geral (média de todos os documentos)
  const overallProgress = useMemo(() => {
    if (statuses.size === 0) return 0;

    let totalProgress = 0;
    statuses.forEach((status) => {
      totalProgress += status.progress;
    });

    return Math.round(totalProgress / statuses.size);
  }, [statuses]);

  return {
    startPipeline,
    processDocument,
    generateMinuta,
    isProcessing,
    isGenerating,
    statuses,
    generationStatus,
    overallProgress,
  };
}
```

---

## 3. Edge Functions

### Código: classify-document/index.ts (Simplified)

```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    // 1. PARSE INPUT
    const { documento_id }: RequestBody = await req.json();
    if (!documento_id) {
      throw new Error('documento_id is required');
    }

    // 2. BUSCAR DOCUMENTO
    const { data: documento, error: docError } = await serviceClient
      .from('documentos')
      .select('*, minutas!inner(user_id)')
      .eq('id', documento_id)
      .single();

    if (docError || !documento) {
      throw new Error(`Document not found: ${documento_id}`);
    }

    // 3. ATUALIZAR STATUS
    await serviceClient
      .from('documentos')
      .update({ status: 'classificando' })
      .eq('id', documento_id);

    // 4. CARREGAR PROMPT
    const { prompt: classificationPrompt, versao: promptVersao } =
      await loadClassificationPrompt();

    // 5. INICIAR LOG DE EXECUÇÃO
    execution = await startExecution(serviceClient, 'classify', {
      documentoId: documento_id,
      minutaId: documento.minuta_id,
      promptUsed: classificationPrompt,
      promptVersion: promptVersao,
    });

    // 6. DOWNLOAD DO ARQUIVO
    const { data: fileData, error: fileError } = await serviceClient.storage
      .from('documentos')
      .download(documento.storage_path);

    if (fileError || !fileData) {
      throw new Error(`Failed to download file: ${fileError?.message}`);
    }

    // 7. CONVERTER PARA BASE64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    // 8. CHAMAR GEMINI
    const { text, usage } = await callGemini(
      classificationPrompt,
      base64,
      documento.mime_type
    );

    // 9. PARSE RESULTADO
    const result = parseGeminiJson<ClassificationResult>(text);
    // Resultado esperado:
    // {
    //   "tipo_documento": "RG",
    //   "confianca": "ALTA",
    //   "pessoa_relacionada": "João Silva"
    // }

    // 10. UPDATE BANCO
    await serviceClient
      .from('documentos')
      .update({
        tipo_documento: result.tipo_documento,
        classificacao_confianca: result.confianca.toLowerCase(),
        pessoa_relacionada: result.pessoa_relacionada,
        status: 'classificado',
      })
      .eq('id', documento_id);

    // 11. LOG SUCESSO
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });

    // 12. RETORNAR
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Classification error:', error);

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

### Código: extract-document/index.ts (Simplified)

```typescript
serve(async (req) => {
  // ... mesma estrutura que classify-document ...

  try {
    const { documento_id }: RequestBody = await req.json();

    // 1. BUSCAR DOCUMENTO
    const { data: documento } = await serviceClient
      .from('documentos')
      .select('*')
      .eq('id', documento_id)
      .single();

    // 2. VERIFICAR SE JÁ ESTÁ CLASSIFICADO
    if (!documento.tipo_documento) {
      throw new Error('Document must be classified before extraction');
    }

    // 3. UPDATE STATUS
    await serviceClient
      .from('documentos')
      .update({ status: 'extraindo' })
      .eq('id', documento_id);

    // 4. CARREGAR PROMPT ESPECÍFICO PARA O TIPO
    const { prompt: extractionPrompt, versao: promptVersao } =
      await loadExtractionPrompt(
        documento.tipo_documento,
        documento.tamanho_bytes
      );

    // 5. DOWNLOAD E CONVERSÃO
    const { data: fileData } = await serviceClient.storage
      .from('documentos')
      .download(documento.storage_path);

    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    // 6. CHAMAR GEMINI COM LIMITE DE TOKENS MAIOR
    const { text, usage } = await callGemini(
      extractionPrompt,
      base64,
      documento.mime_type,
      { maxTokens: 16384 } // Extração pode ser mais verbosa
    );

    // 7. PARSE RESULTADO (estrutura varia por tipo)
    const result = parseGeminiJson<Record<string, unknown>>(text);
    // Exemplo RG:
    // {
    //   "rg": {
    //     "numero_rg": "123456789",
    //     "cpf": "123.456.789-00",
    //     "nome": "JOÃO SILVA",
    //     "data_nascimento": "1980-01-15",
    //     ...
    //   }
    // }

    // 8. UPDATE BANCO
    await serviceClient
      .from('documentos')
      .update({
        dados_extraidos: result,
        status: 'extraido',
      })
      .eq('id', documento_id);

    // 9. LOG E RETORNO
    await logSuccess(serviceClient, execution, result, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // ... error handling ...
  }
});
```

### Código: map-to-fields/index.ts (Simplified)

```typescript
serve(async (req) => {
  try {
    const { minuta_id }: RequestBody = await req.json();

    // 1. BUSCAR TODOS OS DOCUMENTOS EXTRAÍDOS
    const { data: documentos } = await serviceClient
      .from('documentos')
      .select('*')
      .eq('minuta_id', minuta_id)
      .eq('status', 'extraido')
      .not('dados_extraidos', 'is', null);

    if (!documentos || documentos.length === 0) {
      throw new Error('No extracted documents found');
    }

    // 2. ORDENAR POR PRIORIDADE
    const sorted = documentos.sort((a, b) => {
      const prioA = TYPE_PRIORITIES[a.tipo_documento] ?? 0;
      const prioB = TYPE_PRIORITIES[b.tipo_documento] ?? 0;
      return prioB - prioA;
    });

    // 3. MAPEAR DADOS
    const result = mapDocumentsToFields(sorted);
    // Resultado:
    // {
    //   alienantes: [{ cpf, nome, rg, ... }],
    //   adquirentes: [...],
    //   anuentes: [...],
    //   imovel: { matricula, tipo, endereco, ... },
    //   negocio: { tipo, valor_total, ... },
    //   alertas_juridicos: [...]
    // }

    // 4. PERSISTIR EM TABELAS ESTRUTURADAS
    const persistenceResult = await persistMappedFields(
      serviceClient,
      minuta_id,
      result
    );

    // Isso faz:
    // - INSERT/UPDATE pessoas_naturais
    // - INSERT/UPDATE imoveis
    // - INSERT/UPDATE negocios_juridicos
    // - INSERT alertas_juridicos

    // 5. LOG E RETORNO
    await logSuccess(serviceClient, execution, {
      ...result,
      persistence: persistenceResult,
    });

    return new Response(
      JSON.stringify({
        success: true,
        result,
        persistence: persistenceResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // ... error handling ...
  }
});
```

---

## 4. Geração de Minuta

### Código: MinutaFinal.tsx (Trecho Principal)

```typescript
export default function MinutaFinal() {
  const { generateMinuta, isGenerating } = useDocumentPipeline();
  const { editor } = useEditor(); // TipTap

  // Handler para gerar minuta
  const handleGenerate = useCallback(async (templateId?: string) => {
    if (!id) return;

    toast.info("Gerando minuta com IA...", { duration: 3000 });

    // Chama a hook que invoca a edge function
    const result = await generateMinuta(id, "VENDA_COMPRA", templateId);

    if (result.success && result.minuta_texto) {
      // Carrega resultado no editor TipTap
      editor?.commands.setContent(result.minuta_texto);
      updateMinutaTexto(result.minuta_texto);
      toast.success("Minuta gerada com sucesso!");
    } else {
      toast.error(result.error || "Erro ao gerar minuta");
    }
  }, [id, generateMinuta, editor, updateMinutaTexto]);

  // Handler para salvar edições
  const handleSave = useCallback(async () => {
    if (!id || !editor) return;

    const content = editor.getHTML();

    const { error } = await supabase
      .from("minutas")
      .update({
        conteudo_gerado: content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    toast.success("Alteracoes salvas com sucesso!");
  }, [id, editor]);

  return (
    <main>
      {/* Status Card */}
      <SectionCard>
        {hasGeneratedContent ? (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="w-4 h-4" />
            <span>Minuta Gerada</span>
          </div>
        ) : isGenerating ? (
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Gerando minuta...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>Minuta ainda nao foi gerada via IA</span>
          </div>
        )}
      </SectionCard>

      {/* Buttons */}
      <Button
        onClick={() => setIsTemplateModalOpen(true)}
        disabled={isGenerating}
      >
        {hasGeneratedContent ? 'Regenerar' : 'Gerar Minuta'}
      </Button>

      <Button onClick={handleSave} disabled={isSaving}>
        Salvar
      </Button>

      {/* Editor */}
      <div className="prose max-w-none min-h-[500px]">
        <EditorContent editor={editor} />
      </div>
    </main>
  );
}
```

### Código: useDocumentPipeline.ts - generateMinuta

```typescript
const generateMinuta = useCallback(
  async (minutaId: string, templateType?: string, templateId?: string): Promise<GenerationResult> => {
    setIsGenerating(true);
    setGenerationStatus({ status: 'generating' });

    try {
      // 1. Atualizar status no banco
      await supabase
        .from('minutas')
        .update({
          geracao_status: 'gerando',
        })
        .eq('id', minutaId);

      // 2. Invocar edge function
      const { data, error } = await supabase.functions.invoke('generate-minuta', {
        body: {
          minuta_id: minutaId,
          template_type: templateType || 'VENDA_COMPRA',
          template_id: templateId,
        },
      });

      if (error) {
        const errorMessage = error.message || 'Generation failed';
        setGenerationStatus({ status: 'error', error: errorMessage });

        await supabase
          .from('minutas')
          .update({
            geracao_status: 'erro',
            geracao_erro: errorMessage,
          })
          .eq('id', minutaId);

        return {
          success: false,
          error: errorMessage,
        };
      }

      // 3. Sucesso
      const result = data as GenerationResult;
      setGenerationStatus({ status: 'done' });

      await supabase
        .from('minutas')
        .update({
          geracao_status: 'gerado',
          gerado_em: new Date().toISOString(),
        })
        .eq('id', minutaId);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setGenerationStatus({ status: 'error', error: errorMessage });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsGenerating(false);
    }
  },
  [options]
);
```

---

## 5. Data Flow Completo

```typescript
// EXEMPLO: Usuário faz upload de 3 documentos (RG, Certidão Casamento, Matrícula)

// ============ UPLOAD PHASE ============
useDocumentUpload.uploadDocument(rg_file)
  ├─ Supabase.Storage.upload('{userId}/{minutaId}/rg.pdf')
  └─ Supabase.Database.insert({
      minuta_id: 'abc-123',
      nome_original: 'rg.pdf',
      storage_path: '...',
      status: 'uploaded'
    })

// ============ PROCESSING PHASE ============
useDocumentPipeline.startPipeline('abc-123')
  │
  ├─ [Doc 1: RG]
  │  ├─ processDocument('rg_id')
  │  │  ├─ supabase.functions.invoke('classify-document')
  │  │  │  └─ Gemini: "TIPO_DOCUMENTO=RG, CONFIANCA=ALTA"
  │  │  │  └─ Supabase.update({ tipo_documento: 'RG', status: 'classificado' })
  │  │  │
  │  │  └─ supabase.functions.invoke('extract-document')
  │  │     └─ Gemini: "{ rg: { cpf: '123...', nome: 'JOÃO', ... } }"
  │  │     └─ Supabase.update({ dados_extraidos: {...}, status: 'extraido' })
  │  │
  │  └─ updateStatus('rg_id', 'done', progress: 100)
  │
  ├─ [Doc 2: Certidão Casamento] → same flow
  │
  ├─ [Doc 3: Matrícula Imóvel] → same flow
  │
  └─ [All documents extracted]
     └─ supabase.functions.invoke('map-to-fields')
        ├─ SELECT documentos WHERE status='extraido'
        ├─ Normalize & merge data
        ├─ INSERT pessoas_naturais (João Silva)
        ├─ INSERT pessoas_naturais (Maria Silva - cônjuge)
        ├─ INSERT imovel (Av. Paulista, 1000)
        └─ UPDATE minutas { status: 'revisao' }

// ============ REVIEW PHASE ============
// Usuário navega para /outorgantes
ConferenciaOutorgantes.tsx
  ├─ Carrega pessoas_naturais (agregadas pela IA)
  ├─ Usuário revisa dados (João Silva, Maria Silva)
  └─ Salva via useMinutaDatabase

// ============ GENERATION PHASE ============
MinutaFinal.tsx
  └─ generateMinuta('abc-123')
     ├─ supabase.functions.invoke('generate-minuta')
     │  ├─ aggregateMinutaData('abc-123')
     │  │  ├─ SELECT pessoas_naturais FROM minuta_id
     │  │  ├─ SELECT imovel FROM minuta_id
     │  │  └─ SELECT negocios_juridicos FROM minuta_id
     │  │
     │  ├─ mapDataToPlaceholders()
     │  │  └─ OUTORGANTES_VENDEDORES = "JOÃO SILVA, RG 123..., CPF 123..."
     │  │
     │  ├─ loadTemplate('VENDA_COMPRA')
     │  │  └─ "OUTORGANTES {OUTORGANTES_VENDEDORES} ..."
     │  │
     │  ├─ substituteTemplate()
     │  │  └─ "OUTORGANTES JOÃO SILVA, RG 123..., CPF 123... ..."
     │  │
     │  └─ callGemini(prompt: "Gere uma escritura com...")
     │     └─ Gemini: "[FORMATTED DOCUMENT TEXT]"
     │
     └─ Supabase.update({
          conteudo_gerado: '[FORMATTED DOCUMENT TEXT]',
          geracao_status: 'gerado'
        })

// ============ EDITING PHASE ============
MinutaFinal.tsx (Editor)
  ├─ editor.setContent('[FORMATTED DOCUMENT TEXT]')
  ├─ Usuário edita conteúdo no TipTap
  └─ handleSave() → Supabase.update({ conteudo_gerado: '[EDITED TEXT]' })

// ============ FINALIZATION PHASE ============
MinutaFinal.tsx
  └─ finalizarMinuta()
     └─ navigate('/dashboard')
```

Este conjunto de exemplos de código fornece uma visão prática de como o fluxo é implementado no sistema.
