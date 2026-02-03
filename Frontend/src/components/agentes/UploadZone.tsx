// src/components/agentes/UploadZone.tsx

import { useCallback, useState } from 'react';
import { Upload, X, FileText, Image, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { ArquivoUpload } from '@/types/agente';

interface UploadZoneProps {
  arquivos: ArquivoUpload[];
  onArquivosChange: (arquivos: ArquivoUpload[]) => void;
  disabled?: boolean;
}

export function UploadZone({ arquivos, onArquivosChange, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewArquivo, setPreviewArquivo] = useState<ArquivoUpload | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const isMobile = useIsMobile();

  const openPreview = useCallback((arquivo: ArquivoUpload) => {
    setPreviewArquivo(arquivo);
    setPreviewOpen(true);
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const newArquivos: ArquivoUpload[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      nome: file.name,
      tamanho: file.size,
      tipo: file.type,
    }));
    onArquivosChange([...arquivos, ...newArquivos]);

    // Toast de confirmacao
    if (files.length === 1) {
      toast.success(`Arquivo "${files[0].name}" adicionado com sucesso`);
    } else if (files.length > 1) {
      toast.success(`${files.length} arquivos adicionados com sucesso`);
    }
  }, [arquivos, onArquivosChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, [disabled, addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files) return;
    const files = Array.from(e.target.files);
    addFiles(files);
    e.target.value = '';
  }, [disabled, addFiles]);

  const removeFile = (id: string) => {
    if (disabled) return;
    onArquivosChange(arquivos.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return Image;
    return FileText;
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      {!disabled && (
        <motion.label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200',
            isMobile ? 'p-8 min-h-[180px]' : 'p-6 min-h-[120px]',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <Upload className={cn(
            'mb-3 transition-colors',
            isMobile ? 'w-10 h-10' : 'w-8 h-8',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} />
          <p className={cn(
            'text-muted-foreground text-center',
            isMobile ? 'text-base' : 'text-sm'
          )}>
            {isMobile ? 'Toque para selecionar' : 'Arraste arquivos ou'}{' '}
            {!isMobile && <span className="text-primary">clique aqui</span>}
          </p>
          <p className={cn(
            'text-muted-foreground/70 mt-1',
            isMobile ? 'text-sm' : 'text-xs'
          )}>
            PDF, Imagens, DOCX, TXT, Markdown, CSV
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.heic,.bmp,.docx,.txt,.md,.csv"
            onChange={handleFileInput}
            className="hidden"
          />
        </motion.label>
      )}

      {/* File List */}
      <AnimatePresence mode="popLayout">
        {arquivos.map((arquivo) => {
          const FileIcon = getFileIcon(arquivo.tipo);
          return (
            <motion.div
              key={arquivo.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group"
            >
              <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <button
                onClick={() => openPreview(arquivo)}
                className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                aria-label={`Abrir preview do arquivo ${arquivo.nome}`}
              >
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {arquivo.nome}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(arquivo.tamanho)}
                </p>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openPreview(arquivo)}
                  className="p-1.5 hover:bg-primary/10 rounded transition-colors opacity-50 group-hover:opacity-100"
                  aria-label={`Visualizar arquivo ${arquivo.nome}`}
                >
                  <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </button>
                {!disabled && (
                  <button
                    onClick={() => removeFile(arquivo.id)}
                    className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
                    aria-label={`Remover arquivo ${arquivo.nome}`}
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        arquivo={previewArquivo}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
