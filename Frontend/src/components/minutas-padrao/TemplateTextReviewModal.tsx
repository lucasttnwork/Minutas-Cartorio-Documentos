/**
 * TemplateTextReviewModal - Modal para revisar e editar texto extraído
 *
 * Split view:
 * - Esquerda: Texto original extraído (readonly)
 * - Direita: Editor TipTap para edição do Markdown
 *
 * Permite salvar revisões do texto para uso por agentes de IA.
 */

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
  RotateCcw,
  Save,
  Loader2,
  FileText,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MinutaPadrao } from '@/types/minutas-padrao';
import { ExtractionStatusBadge } from './ExtractionStatusBadge';

export interface TemplateTextReviewModalProps {
  template: MinutaPadrao | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, markdown: string) => Promise<void>;
  onReExtract?: (id: string) => Promise<void>;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(isActive && 'bg-muted')}
      title={title}
    >
      {children}
    </Button>
  );
}

export function TemplateTextReviewModal({
  template,
  isOpen,
  onClose,
  onSave,
  onReExtract,
}: TemplateTextReviewModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isReExtracting, setIsReExtracting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Get content to display (prefer conteudo_markdown, fallback to texto_extraido)
  const originalText = template?.texto_extraido || '';
  const editedText = template?.conteudo_markdown || template?.texto_extraido || '';

  // TipTap editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: editedText,
    onUpdate: ({ editor }) => {
      setHasChanges(editor.getHTML() !== editedText);
    },
  });

  // Reset editor when template changes
  useEffect(() => {
    if (editor && template) {
      const content = template.conteudo_markdown || template.texto_extraido || '';
      editor.commands.setContent(content);
      setHasChanges(false);
    }
  }, [editor, template]);

  const handleSave = useCallback(async () => {
    if (!template || !editor) return;

    setIsSaving(true);
    try {
      const markdown = editor.getHTML();
      await onSave(template.id, markdown);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  }, [template, editor, onSave]);

  const handleReExtract = useCallback(async () => {
    if (!template || !onReExtract) return;

    setIsReExtracting(true);
    try {
      await onReExtract(template.id);
    } finally {
      setIsReExtracting(false);
    }
  }, [template, onReExtract]);

  const handleResetToOriginal = useCallback(() => {
    if (editor && originalText) {
      editor.commands.setContent(originalText);
      setHasChanges(true);
    }
  }, [editor, originalText]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">{template.nome}</DialogTitle>
              <DialogDescription>
                Revise e edite o texto extraído do template
              </DialogDescription>
            </div>
            <ExtractionStatusBadge
              status={template.status_extracao}
              errorMessage={template.erro_extracao}
            />
          </div>
        </DialogHeader>

        {/* Split View Container */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 overflow-hidden">
          {/* Left Panel: Original Text (readonly) */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
              <FileText className="w-4 h-4" />
              Texto Original Extraído
            </div>
            <ScrollArea className="flex-1 border rounded-lg bg-muted/30">
              <div className="p-4 prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                {originalText || (
                  <span className="italic">Nenhum texto extraído disponível</span>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel: Editor */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
              <Edit3 className="w-4 h-4" />
              Editar Texto
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1 border rounded-t-lg border-b-0 bg-muted/50">
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                isActive={editor?.isActive('bold')}
                title="Negrito"
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                isActive={editor?.isActive('italic')}
                title="Itálico"
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                isActive={editor?.isActive('underline')}
                title="Sublinhado"
              >
                <UnderlineIcon className="w-4 h-4" />
              </ToolbarButton>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                isActive={editor?.isActive('bulletList')}
                title="Lista"
              >
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                isActive={editor?.isActive('orderedList')}
                title="Lista Numerada"
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <ToolbarButton
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                title="Desfazer"
              >
                <Undo className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                title="Refazer"
              >
                <Redo className="w-4 h-4" />
              </ToolbarButton>

              <div className="flex-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToOriginal}
                disabled={!originalText}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Restaurar Original
              </Button>
            </div>

            {/* Editor Content */}
            <ScrollArea className="flex-1 border rounded-b-lg">
              <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none p-4 min-h-full focus:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:outline-none"
              />
            </ScrollArea>
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onReExtract && (
              <Button
                variant="outline"
                onClick={handleReExtract}
                disabled={isReExtracting || isSaving}
              >
                {isReExtracting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                Re-extrair Texto
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Revisão
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TemplateTextReviewModal;
