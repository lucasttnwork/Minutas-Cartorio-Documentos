// src/components/minutas-padrao/TemplateDeleteDialog.tsx
import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { MinutaPadrao } from '@/types/minutas-padrao';

export interface TemplateDeleteDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** The template to be deleted */
  template: MinutaPadrao;
  /** Called when the dialog should close */
  onClose: () => void;
  /** Called when deletion is confirmed */
  onConfirm: (id: string) => void;
  /** Whether a delete operation is in progress */
  isLoading?: boolean;
}

export function TemplateDeleteDialog({
  isOpen,
  template,
  onClose,
  onConfirm,
  isLoading = false,
}: TemplateDeleteDialogProps) {
  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    onConfirm(template.id);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <AlertDialogContent onKeyDown={handleKeyDown}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Voce esta prestes a excluir o template{' '}
            <strong className="text-foreground">{template.nome}</strong>.
          </AlertDialogDescription>
          <p className="text-sm text-destructive font-medium mt-2">
            Esta acao nao pode ser desfeita.
          </p>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            loading={isLoading}
            loadingText="Excluindo..."
          >
            Excluir
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
