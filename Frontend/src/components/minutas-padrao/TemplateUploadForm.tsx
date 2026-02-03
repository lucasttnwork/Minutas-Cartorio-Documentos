/**
 * TemplateUploadForm - Formulário para criar templates de minutas
 *
 * Suporta duas formas de criação:
 * 1. Upload de arquivo (PDF/DOCX) - extração assíncrona de texto
 * 2. Colar/Escrever texto diretamente - sem upload de arquivo
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileType2, Upload, X, Loader2, Edit3 } from 'lucide-react';
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
import type { TipoNegocio, MinutaPadraoInsertUpload, MinutaPadraoInsertText } from '@/types/minutas-padrao';
import { TIPO_NEGOCIO_LABELS } from '@/types/minutas-padrao';

type InputMode = 'upload' | 'text';

interface FormData {
  nome: string;
  descricao: string;
  tipo_negocio: TipoNegocio;
  texto: string;
}

export interface TemplateUploadFormProps {
  onSubmitFile: (
    data: Omit<MinutaPadraoInsertUpload, 'storage_path' | 'nome_original' | 'mime_type' | 'tamanho_bytes' | 'status_extracao'>,
    file: File
  ) => void;
  onSubmitText: (
    data: Omit<MinutaPadraoInsertText, 'status_extracao'>
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const MIN_TEXT_LENGTH = 50;

export function TemplateUploadForm({
  onSubmitFile,
  onSubmitText,
  onCancel,
  isLoading,
}: TemplateUploadFormProps) {
  const [mode, setMode] = useState<InputMode>('upload');
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
    tipo_negocio: 'geral',
    texto: '',
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

  const validateUpload = (): boolean => {
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

  const validateText = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Mínimo de 3 caracteres';
    }

    if (!formData.texto.trim()) {
      newErrors.texto = 'O texto do template é obrigatório';
    } else if (formData.texto.trim().length < MIN_TEXT_LENGTH) {
      newErrors.texto = `Mínimo de ${MIN_TEXT_LENGTH} caracteres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'upload') {
      if (!validateUpload() || !file) return;
      onSubmitFile({
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        tipo_negocio: formData.tipo_negocio,
      }, file);
    } else {
      if (!validateText()) return;
      onSubmitText({
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        tipo_negocio: formData.tipo_negocio,
        texto_extraido: formData.texto.trim(),
      });
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
    setErrors({});
  };

  const isPdf = file?.type === 'application/pdf';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => handleModeChange('upload')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            mode === 'upload'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Upload className="w-4 h-4" />
          Upload Arquivo
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('text')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            mode === 'text'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Edit3 className="w-4 h-4" />
          Colar/Escrever Texto
        </button>
      </div>

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
          rows={2}
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

      {/* Conditional Content based on Mode */}
      <AnimatePresence mode="wait">
        {mode === 'upload' ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
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
                >
                  <div
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {errors.file && (
              <p className="text-sm text-destructive" role="alert">{errors.file}</p>
            )}

            <p className="text-xs text-muted-foreground">
              O texto será extraído automaticamente após o upload.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <Label htmlFor="texto">Texto do Template *</Label>
            <Textarea
              id="texto"
              value={formData.texto}
              onChange={e => setFormData(prev => ({ ...prev, texto: e.target.value }))}
              placeholder="Cole ou escreva o texto do template aqui...

Exemplo:
**ESCRITURA DE VENDA E COMPRA**

Aos [DATA], nesta cidade de [CIDADE], perante mim..."
              rows={12}
              className="font-mono text-sm"
              aria-invalid={!!errors.texto}
            />
            {errors.texto && (
              <p className="text-sm text-destructive" role="alert">{errors.texto}</p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Suporta formatação Markdown (**negrito**, *itálico*, listas)</span>
              <span>{formData.texto.length} caracteres</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === 'upload' ? 'Enviando...' : 'Salvando...'}
            </>
          ) : (
            'Salvar Template'
          )}
        </Button>
      </div>
    </form>
  );
}
