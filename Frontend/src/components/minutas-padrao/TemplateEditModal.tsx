// src/components/minutas-padrao/TemplateEditModal.tsx
import * as React from 'react';
import { FileText, File } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MinutaPadrao, MinutaPadraoUpdate, TipoNegocio } from '@/types/minutas-padrao';
import { TIPO_NEGOCIO_LABELS } from '@/types/minutas-padrao';

export interface TemplateEditModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** The template being edited */
  template: MinutaPadrao;
  /** Called when the modal should close */
  onClose: () => void;
  /** Called when the form is submitted with updated data */
  onSave: (id: string, data: MinutaPadraoUpdate) => void;
  /** Whether a save operation is in progress */
  isLoading?: boolean;
}

interface FormErrors {
  nome?: string;
}

export function TemplateEditModal({
  isOpen,
  template,
  onClose,
  onSave,
  isLoading = false,
}: TemplateEditModalProps) {
  // Form state
  const [nome, setNome] = React.useState(template.nome);
  const [descricao, setDescricao] = React.useState(template.descricao ?? '');
  const [tipoNegocio, setTipoNegocio] = React.useState<TipoNegocio>(template.tipo_negocio);
  const [errors, setErrors] = React.useState<FormErrors>({});

  // Reset form when modal opens/closes or template changes
  React.useEffect(() => {
    if (isOpen) {
      setNome(template.nome);
      setDescricao(template.descricao ?? '');
      setTipoNegocio(template.tipo_negocio);
      setErrors({});
    }
  }, [isOpen, template]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!nome.trim()) {
      newErrors.nome = 'Nome e obrigatorio';
    } else if (nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter no minimo 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSave(template.id, {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      tipo_negocio: tipoNegocio,
    });
  };

  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
  };

  // Get file type label
  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('wordprocessingml')) return 'DOCX';
    return 'Arquivo';
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent onKeyDown={handleKeyDown} className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Template</DialogTitle>
          <DialogDescription>
            Atualize as informacoes do template. O arquivo nao pode ser alterado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Field */}
          <div className="space-y-2">
            <Label htmlFor="nome" required>
              Nome
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (errors.nome) setErrors((prev) => ({ ...prev, nome: undefined }));
              }}
              placeholder="Nome do template"
              disabled={isLoading}
              error={!!errors.nome}
              aria-describedby={errors.nome ? 'nome-error' : undefined}
            />
            {errors.nome && (
              <p id="nome-error" className="text-sm text-destructive">
                {errors.nome}
              </p>
            )}
          </div>

          {/* Descricao Field */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descricao</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descricao do template (opcional)"
              disabled={isLoading}
              textareaSize="sm"
              noResize
            />
          </div>

          {/* Tipo Negocio Field */}
          <div className="space-y-2">
            <Label htmlFor="tipo-negocio">Tipo de Negocio</Label>
            <Select
              value={tipoNegocio}
              onValueChange={(value) => setTipoNegocio(value as TipoNegocio)}
              disabled={isLoading}
            >
              <SelectTrigger id="tipo-negocio" aria-label="Tipo de Negocio">
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

          {/* File Info (Read-only) */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Arquivo (somente leitura)
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {template.mime_type === 'application/pdf' ? (
                  <FileText className="h-8 w-8 text-destructive/70" />
                ) : (
                  <File className="h-8 w-8 text-primary/70" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{template.nome_original}</p>
                <p className="text-xs text-muted-foreground">
                  {getFileTypeLabel(template.mime_type || '')} - {formatFileSize(template.tamanho_bytes || 0)}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              loadingText="Salvando..."
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
