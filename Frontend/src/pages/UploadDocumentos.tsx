// src/pages/UploadDocumentos.tsx
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout/SectionCard";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { useMinuta } from "@/contexts/MinutaContext";
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

export default function UploadDocumentos() {
  const navigate = useNavigate();
  const { currentMinuta, addDocument, removeDocument } = useMinuta();
  const [isDragging, setIsDragging] = useState<UploadCategory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const simulateUpload = useCallback(
    (file: File, category: UploadCategory) => {
      const validation = validateFile(file);
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newDoc: UploadedDocument = {
        id,
        file,
        category,
        status: validation.valid ? 'complete' : 'error',
        progress: 100,
        errorMessage: validation.error,
      };

      addDocument(newDoc);

      if (!validation.valid) {
        toast.error(`Erro: ${validation.error}`);
      } else {
        toast.success(`${file.name} adicionado`);
      }
    },
    [addDocument]
  );

  const handleFiles = useCallback(
    (files: FileList | null, category: UploadCategory) => {
      if (!files) return;
      Array.from(files).forEach((file) => simulateUpload(file, category));
    },
    [simulateUpload]
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

  const totalDocs = documents.length;

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
                      <Icon className={cn('w-5 h-5', `text-${category.color}-500`)} />
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
                      ref={(el) => (fileInputRefs.current[category.id] = el)}
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
                          const FileIcon = getFileIcon(doc.file.type);
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
                                <p className="text-sm font-medium truncate">{doc.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.file.size)}
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
