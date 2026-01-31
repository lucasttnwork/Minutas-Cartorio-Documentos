// src/components/agentes/UploadZone.tsx

import { useCallback, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ArquivoUpload } from '@/types/agente';

interface UploadZoneProps {
  arquivos: ArquivoUpload[];
  onArquivosChange: (arquivos: ArquivoUpload[]) => void;
  disabled?: boolean;
}

export function UploadZone({ arquivos, onArquivosChange, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((files: File[]) => {
    const newArquivos: ArquivoUpload[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      nome: file.name,
      tamanho: file.size,
      tipo: file.type,
    }));
    onArquivosChange([...arquivos, ...newArquivos]);
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
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <Upload className={cn(
            'w-8 h-8 mb-2 transition-colors',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} />
          <p className="text-sm text-muted-foreground text-center">
            Arraste arquivos ou <span className="text-primary">clique aqui</span>
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            PDF, JPG, PNG, DOCX
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
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
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{arquivo.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(arquivo.tamanho)}
                </p>
              </div>
              {!disabled && (
                <button
                  onClick={() => removeFile(arquivo.id)}
                  className="p-1 hover:bg-destructive/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
