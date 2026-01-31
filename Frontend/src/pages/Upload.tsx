import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/layout/SectionCard";
import { 
  Upload as UploadIcon, 
  X, 
  FileText, 
  Image, 
  File, 
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trash2,
  CloudUpload,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "complete" | "error";
  errorMessage?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return Image;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Formatos aceitos
const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function Upload() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Warn user about unsaved uploads when leaving
  useEffect(() => {
    const hasUploads = uploadedFiles.length > 0;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUploads) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploadedFiles]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `Arquivo muito grande (max 50MB)` };
    }
    
    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return { valid: false, error: `Tipo não suportado: ${file.type}` };
    }

    return { valid: true };
  };

  const simulateUpload = useCallback((file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const validation = validateFile(file);
    
    const newFile: UploadedFile = {
      id,
      file,
      progress: validation.valid ? 0 : 100,
      status: validation.valid ? "uploading" : "error",
      errorMessage: validation.error,
    };
    
    setUploadedFiles(prev => [...prev, newFile]);
    
    if (!validation.valid) {
      toast.error(`Erro no arquivo ${file.name}: ${validation.error}`);
      return;
    }
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadedFiles(prev => 
        prev.map(f => {
          if (f.id === id && f.status === "uploading") {
            const newProgress = Math.min(f.progress + Math.random() * 25, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...f, progress: 100, status: "complete" as const };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        })
      );
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => simulateUpload(file));
  }, [simulateUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const handleNavigateBack = () => {
    if (uploadedFiles.length > 0) {
      setShowExitWarning(true);
    } else {
      navigate("/");
    }
  };

  const confirmExit = () => {
    setShowExitWarning(false);
    navigate("/");
  };

  const handleFinalize = () => {
    toast.success("Upload finalizado com sucesso!", {
      description: `${completedCount} arquivo(s) enviado(s).`
    });
    // Em produção, enviar para o backend aqui
  };

  const completedCount = uploadedFiles.filter(f => f.status === "complete").length;
  const uploadingCount = uploadedFiles.filter(f => f.status === "uploading").length;
  const errorCount = uploadedFiles.filter(f => f.status === "error").length;

  return (
    <main className="min-h-screen p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <header className="mb-8">
          <button 
            onClick={handleNavigateBack}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Upload de Arquivos
          </h1>
          <p className="text-muted-foreground text-lg">
            Envie documentos e anexos para o sistema
          </p>
        </header>

        {/* Warning Banner */}
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-500">
                Arquivos não persistidos
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Os arquivos enviados serão perdidos se você sair desta página sem finalizar o upload.
              </p>
            </div>
          </motion.div>
        )}

        {/* Drop Zone */}
        <SectionCard title="Área de Upload" className="mb-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300",
              isDragging 
                ? "border-primary bg-primary/10 scale-[1.02]" 
                : "border-muted hover:border-accent hover:bg-accent/5"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            
            <motion.div
              animate={{ 
                scale: isDragging ? 1.1 : 1,
                y: isDragging ? -5 : 0 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className={cn(
                "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-colors duration-300",
                isDragging ? "bg-primary/20" : "bg-secondary"
              )}>
                <CloudUpload className={cn(
                  "w-10 h-10 transition-colors duration-300",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
            </motion.div>

            <h3 className="text-xl font-semibold text-foreground mb-2">
              {isDragging ? "Solte os arquivos aqui" : "Arraste e solte arquivos"}
            </h3>
            <p className="text-muted-foreground mb-4">
              ou clique para selecionar do computador
            </p>
            <p className="text-sm text-muted-foreground/70">
              Formatos aceitos: PDF, JPG, PNG, DOC, DOCX • Máximo 50MB por arquivo
            </p>
          </div>
        </SectionCard>

        {/* Upload Status Bar */}
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4 px-2"
          >
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{uploadedFiles.length}</span> arquivo(s)
              </span>
              {completedCount > 0 && (
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle2 className="w-4 h-4" />
                  {completedCount} concluído(s)
                </span>
              )}
              {uploadingCount > 0 && (
                <span className="flex items-center gap-1 text-primary">
                  <UploadIcon className="w-4 h-4 animate-pulse" />
                  {uploadingCount} enviando...
                </span>
              )}
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {errorCount} erro(s)
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearAll}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Limpar Todos
            </Button>
          </motion.div>
        )}

        {/* File List */}
        <SectionCard title="Arquivos Enviados">
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <File className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum arquivo enviado ainda</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Arraste arquivos para a área acima
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {uploadedFiles.map((item) => {
                  const FileIcon = getFileIcon(item.file.type);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "relative flex items-center gap-4 p-4 rounded-lg border transition-colors",
                        item.status === "complete" 
                          ? "bg-green-500/5 border-green-500/30" 
                          : item.status === "error"
                          ? "bg-destructive/5 border-destructive/30"
                          : "bg-secondary/50 border-border"
                      )}
                    >
                      {/* File Icon */}
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                        item.status === "complete" 
                          ? "bg-green-500/10" 
                          : item.status === "error"
                          ? "bg-destructive/10"
                          : "bg-secondary"
                      )}>
                        <FileIcon className={cn(
                          "w-6 h-6",
                          item.status === "complete" 
                            ? "text-green-500" 
                            : item.status === "error"
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )} />
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground truncate">
                            {item.file.name}
                          </p>
                          {item.status === "complete" && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                          {item.status === "error" && (
                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(item.file.size)}
                          {item.errorMessage && (
                            <span className="text-destructive ml-2">• {item.errorMessage}</span>
                          )}
                        </p>

                        {/* Progress Bar */}
                        {item.status === "uploading" && (
                          <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(item.id)}
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </SectionCard>

        {/* Action Buttons */}
        {uploadedFiles.length > 0 && completedCount === uploadedFiles.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex justify-end gap-4"
          >
            <Button variant="outline" onClick={clearAll}>
              Enviar Mais Arquivos
            </Button>
            <Button onClick={handleFinalize}>
              Finalizar Upload
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Exit Warning Modal */}
      <AnimatePresence>
        {showExitWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowExitWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border-2 border-yellow-500 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-foreground">Sair sem salvar?</h3>
              </div>

              <p className="text-muted-foreground mb-6">
                Você tem {uploadedFiles.length} arquivo(s) enviado(s) que ainda não foram salvos.
                Se você sair agora, eles serão perdidos.
              </p>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowExitWarning(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={confirmExit}>
                  Sair mesmo assim
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
