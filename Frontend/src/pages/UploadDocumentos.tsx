// src/pages/UploadDocumentos.tsx
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout/SectionCard";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { useMinuta } from "@/contexts/MinutaContext";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import {
  Upload,
  X,
  FileText,
  Image,
  File,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  CloudUpload,
  Users,
  Home,
  Briefcase,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { UploadedDocument } from "@/types/minuta";

type UploadCategory = UploadedDocument['category'];

const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  blue: { text: 'text-blue-500', bg: 'bg-blue-500/10' },
  green: { text: 'text-green-500', bg: 'bg-green-500/10' },
  yellow: { text: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  purple: { text: 'text-purple-500', bg: 'bg-purple-500/10' },
  gray: { text: 'text-gray-500', bg: 'bg-gray-500/10' },
};

interface CategoryConfig {
  id: UploadCategory;
  title: string;
  description: string;
  icon: typeof Users;
  color: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'outorgantes',
    title: 'Documentos dos Outorgantes',
    description: 'RG, CPF, Certidões, Comprovantes',
    icon: Users,
    color: 'blue',
  },
  {
    id: 'outorgados',
    title: 'Documentos dos Outorgados',
    description: 'RG, CPF, Certidões, Comprovantes',
    icon: Users,
    color: 'green',
  },
  {
    id: 'imoveis',
    title: 'Documentos dos Imóveis',
    description: 'Matrículas, IPTU, Certidões',
    icon: Home,
    color: 'yellow',
  },
  {
    id: 'negocio',
    title: 'Documentos do Negócio Jurídico',
    description: 'Contratos, Procurações, Acordos',
    icon: Briefcase,
    color: 'purple',
  },
  {
    id: 'outros',
    title: 'Demais Documentos',
    description: 'Outros documentos relevantes',
    icon: FolderOpen,
    color: 'gray',
  },
];

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to check if an id is a database UUID (not a local timestamp-based id)
const isDbId = (id: string | undefined): boolean => {
  if (!id) return false;
  // UUID format: 8-4-4-4-12 hex characters
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export default function UploadDocumentos() {
  const navigate = useNavigate();
  const { currentMinuta, addDocument, removeDocument, createMinutaInDatabase, isLoading: isCreatingMinuta } = useMinuta();
  const { uploadDocument, uploading: hookUploading, progress: hookProgress, error: uploadError } = useDocumentUpload();
  const [isDragging, setIsDragging] = useState<UploadCategory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);
  const hasInitialized = useRef(false);

  // Auto-create minuta in database if none exists (handles direct navigation to /minuta/nova)
  useEffect(() => {
    const initMinuta = async () => {
      // Only create if no current minuta or if current minuta is not in database
      if (!hasInitialized.current && !isCreatingMinuta) {
        if (!currentMinuta || !isDbId(currentMinuta.id)) {
          hasInitialized.current = true;
          const titulo = `Minuta ${new Date().toLocaleDateString('pt-BR')}`;
          const dbId = await createMinutaInDatabase(titulo);
          if (dbId) {
            toast.success('Nova minuta criada');
          } else {
            toast.error('Erro ao criar minuta no banco de dados');
          }
        }
      }
    };
    initMinuta();
  }, [currentMinuta, createMinutaInDatabase, isCreatingMinuta]);

  // Track global upload state
  const isUploading = hookUploading || activeUploads > 0;
  const fileInputRefs = useRef<Record<UploadCategory, HTMLInputElement | null>>({
    outorgantes: null,
    outorgados: null,
    imoveis: null,
    negocio: null,
    outros: null,
  });

  const documents = currentMinuta?.documentos || [];

  const getDocumentsByCategory = (category: UploadCategory) =>
    documents.filter((d) => d.category === category);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'Arquivo muito grande (max 50MB)' };
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return { valid: false, error: `Tipo não suportado` };
    }
    return { valid: true };
  };

  /**
   * Upload de arquivo para Supabase Storage + Database
   * Mantendo compatibilidade com o estado local do contexto
   */
  const handleUploadFile = useCallback(
    async (file: File, category: UploadCategory) => {
      const validation = validateFile(file);
      const tempId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      if (!validation.valid) {
        // Arquivo invalido - adicionar ao estado local com erro
        const errorDoc: UploadedDocument = {
          id: tempId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          category,
          status: 'error',
          progress: 0,
          errorMessage: validation.error,
        };
        addDocument(errorDoc);
        toast.error(`Erro: ${validation.error}`);
        return;
      }

      // Adicionar documento em estado "uploading" ao contexto local
      const uploadingDoc: UploadedDocument = {
        id: tempId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        category,
        status: 'uploading',
        progress: 0,
      };
      addDocument(uploadingDoc);
      setActiveUploads(prev => prev + 1);

      // Verificar se temos uma minuta valida para upload (deve ser um UUID do banco)
      if (!currentMinuta?.id || !isDbId(currentMinuta.id)) {
        // Se nao houver minuta no banco, manter comportamento local (mock)
        // Atualizar para complete apos simular upload
        setTimeout(() => {
          removeDocument(tempId);
          const completeDoc: UploadedDocument = {
            id: tempId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            category,
            status: 'complete',
            progress: 100,
          };
          addDocument(completeDoc);
          setActiveUploads(prev => Math.max(0, prev - 1));
          toast.success(`${file.name} adicionado (modo local)`);
        }, 500);
        return;
      }

      // Upload real para Supabase
      try {
        const result = await uploadDocument(file, currentMinuta.id, category);

        // Remover documento temporario
        removeDocument(tempId);

        if (result) {
          // Adicionar documento com ID real do banco
          const completeDoc: UploadedDocument = {
            id: result.id,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            category,
            status: 'complete',
            progress: 100,
          };
          addDocument(completeDoc);
          toast.success(`${file.name} enviado com sucesso`);
        } else {
          // Erro no upload - adicionar com status de erro
          const errorDoc: UploadedDocument = {
            id: tempId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            category,
            status: 'error',
            progress: 0,
            errorMessage: uploadError || 'Erro ao fazer upload',
          };
          addDocument(errorDoc);
          toast.error(`Erro ao enviar ${file.name}`);
        }
      } catch (_err) {
        // Erro inesperado - error already captured in uploadError
        removeDocument(tempId);
        const errorDoc: UploadedDocument = {
          id: tempId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          category,
          status: 'error',
          progress: 0,
          errorMessage: 'Erro inesperado ao fazer upload',
        };
        addDocument(errorDoc);
        toast.error(`Erro inesperado ao enviar ${file.name}`);
      } finally {
        setActiveUploads(prev => Math.max(0, prev - 1));
      }
    },
    [addDocument, removeDocument, currentMinuta?.id, uploadDocument, uploadError]
  );

  const handleFiles = useCallback(
    (files: FileList | null, category: UploadCategory) => {
      if (!files) return;
      Array.from(files).forEach((file) => handleUploadFile(file, category));
    },
    [handleUploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, category: UploadCategory) => {
      e.preventDefault();
      setIsDragging(null);
      handleFiles(e.dataTransfer.files, category);
    },
    [handleFiles]
  );

  const handleProcessar = async () => {
    if (documents.length === 0) {
      toast.error('Adicione pelo menos um documento');
      return;
    }

    setIsProcessing(true);
    toast.info('Iniciando processamento...');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (currentMinuta) {
      navigate(`/minuta/${currentMinuta.id}/processando`);
    }
  };

  // Count only successfully uploaded documents (not errors)
  const validDocs = documents.filter(d => d.status === 'complete');
  const totalDocs = validDocs.length;

  return (
    <main className="min-h-screen p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Upload de Documentos
          </h1>
          <p className="text-muted-foreground text-lg">
            Envie os documentos separados por categoria
          </p>
          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enviando... {hookProgress > 0 && `${hookProgress}%`}</span>
            </div>
          )}
        </header>

        {/* Stepper */}
        <div className="mb-8 bg-card rounded-xl p-4 border border-border">
          <FlowStepper currentStep="upload" />
        </div>

        {/* Upload Sections */}
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const categoryDocs = getDocumentsByCategory(category.id);
            const Icon = category.icon;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SectionCard
                  title={
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-5 h-5', CATEGORY_COLORS[category.color].text)} />
                      <span>{category.title}</span>
                      {categoryDocs.length > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                          ({categoryDocs.length})
                        </span>
                      )}
                    </div>
                  }
                >
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>

                  {/* Drop Zone */}
                  <div
                    onDrop={(e) => handleDrop(e, category.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(category.id);
                    }}
                    onDragLeave={() => setIsDragging(null)}
                    onClick={() => fileInputRefs.current[category.id]?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
                      isDragging === category.id
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-accent hover:bg-accent/5'
                    )}
                  >
                    <input
                      ref={(el) => { fileInputRefs.current[category.id] = el; }}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files, category.id)}
                    />
                    <CloudUpload
                      className={cn(
                        'w-8 h-8 mx-auto mb-2',
                        isDragging === category.id ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <p className="text-sm text-muted-foreground">
                      Arraste arquivos ou clique para selecionar
                    </p>
                  </div>

                  {/* File List */}
                  {categoryDocs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <AnimatePresence>
                        {categoryDocs.map((doc) => {
                          const FileIcon = getFileIcon(doc.fileType);
                          return (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg border',
                                doc.status === 'complete'
                                  ? 'bg-green-500/5 border-green-500/30'
                                  : doc.status === 'error'
                                  ? 'bg-destructive/5 border-destructive/30'
                                  : 'bg-secondary/50 border-border'
                              )}
                            >
                              <FileIcon className="w-5 h-5 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.fileSize)}
                                  {doc.status === 'error' && doc.errorMessage && (
                                    <span className="text-destructive ml-2">- {doc.errorMessage}</span>
                                  )}
                                </p>
                              </div>
                              {doc.status === 'complete' && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                              {doc.status === 'error' && (
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              )}
                              <button
                                onClick={() => removeDocument(doc.id)}
                                className="p-1 hover:bg-destructive/10 rounded"
                              >
                                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </SectionCard>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-end"
        >
          <Button
            size="lg"
            onClick={handleProcessar}
            disabled={totalDocs === 0 || isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Processar Documentos ({totalDocs})
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
