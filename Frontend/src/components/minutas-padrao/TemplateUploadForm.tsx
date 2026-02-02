import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileType2, Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TipoNegocio, MinutaPadraoInsert } from '@/types/minutas-padrao';
import { TIPO_NEGOCIO_LABELS } from '@/types/minutas-padrao';

interface FormData {
  nome: string;
  descricao: string;
  tipo_negocio: TipoNegocio;
}

export interface TemplateUploadFormProps {
  onSubmit: (data: Omit<MinutaPadraoInsert, 'storage_path' | 'nome_original' | 'mime_type' | 'tamanho_bytes'>, file: File) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function TemplateUploadForm({ onSubmit, onCancel, isLoading }: TemplateUploadFormProps) {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
    tipo_negocio: 'geral',
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to validate file type
  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return validTypes.includes(file.type);
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Check for rejected files from dropzone
    if (rejectedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        file: 'Tipo de arquivo não suportado. Use PDF ou DOCX.'
      }));
      return;
    }

    // Additional validation for accepted files (for test environment compatibility)
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (!isValidFileType(selectedFile)) {
        setErrors(prev => ({
          ...prev,
          file: 'Tipo de arquivo não suportado. Use PDF ou DOCX.'
        }));
        return;
      }
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Mínimo de 3 caracteres';
    }

    if (!file) {
      newErrors.file = 'Selecione um arquivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !file) return;

    onSubmit({
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || null,
      tipo_negocio: formData.tipo_negocio,
    }, file);
  };

  const removeFile = () => {
    setFile(null);
  };

  const isPdf = file?.type === 'application/pdf';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Template *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          placeholder="Ex: Escritura de Compra e Venda Padrão"
          aria-invalid={!!errors.nome}
        />
        {errors.nome && (
          <p className="text-sm text-destructive" role="alert">{errors.nome}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          placeholder="Descreva o propósito deste template..."
          rows={3}
        />
      </div>

      {/* Tipo de Negócio */}
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo de Negócio</Label>
        <Select
          value={formData.tipo_negocio}
          onValueChange={(value: TipoNegocio) =>
            setFormData(prev => ({ ...prev, tipo_negocio: value }))
          }
        >
          <SelectTrigger id="tipo" aria-label="Tipo de negócio">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TIPO_NEGOCIO_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dropzone */}
      <div className="space-y-2">
        <Label>Arquivo *</Label>

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50"
            >
              <div data-testid="file-icon" className="p-2 rounded-md bg-primary/10">
                {isPdf ? (
                  <FileText className="w-6 h-6 text-red-500" />
                ) : (
                  <FileType2 className="w-6 h-6 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeFile}
                aria-label="Remover arquivo"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              {...getRootProps()}
              data-testid="dropzone"
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-8",
                "border-2 border-dashed rounded-lg cursor-pointer",
                "transition-colors duration-200",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} data-testid="file-input" />
              <Upload className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm text-center text-muted-foreground">
                <span className="font-medium">Arraste um arquivo</span> ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                PDF ou DOCX (máx. 50MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {errors.file && (
          <p className="text-sm text-destructive" role="alert">{errors.file}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            'Salvar Template'
          )}
        </Button>
      </div>
    </form>
  );
}
