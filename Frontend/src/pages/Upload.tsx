import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
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
  CloudUpload
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback((file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newFile: UploadedFile = {
      id,
      file,
      progress: 0,
      status: "uploading",
    };
    
    setUploadedFiles(prev => [...prev, newFile]);
    
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

  const completedCount = uploadedFiles.filter(f => f.status === "complete").length;
  const uploadingCount = uploadedFiles.filter(f => f.status === "uploading").length;

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
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Upload de Arquivos
          </h1>
          <p className="text-muted-foreground text-lg">
            Envie documentos e anexos para o sistema
          </p>
        </header>

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
                <span className="flex items-center gap-1 text-success">
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
                          ? "bg-success/5 border-success/30" 
                          : item.status === "error"
                          ? "bg-destructive/5 border-destructive/30"
                          : "bg-secondary/50 border-border"
                      )}
                    >
                      {/* File Icon */}
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                        item.status === "complete" 
                          ? "bg-success/10" 
                          : item.status === "error"
                          ? "bg-destructive/10"
                          : "bg-secondary"
                      )}>
                        <FileIcon className={cn(
                          "w-6 h-6",
                          item.status === "complete" 
                            ? "text-success" 
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
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
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
            <Button>
              Finalizar Upload
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
