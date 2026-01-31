// src/components/agentes/ResultadoModal.tsx

import { Copy, FileDown, X, FileText as FileIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ResultadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  conteudo: string;
  onCopy: () => void;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
}

export function ResultadoModal({
  open,
  onOpenChange,
  titulo,
  conteudo,
  onCopy,
  onDownloadDocx,
  onDownloadPdf,
}: ResultadoModalProps) {
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{trimmed.slice(4)}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-semibold mt-5 mb-2">{trimmed.slice(3)}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={i} className="text-xl font-bold mt-6 mb-3">{trimmed.slice(2)}</h1>;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return <li key={i} className="ml-4 mb-1">{trimmed.slice(2)}</li>;
        }
        if (trimmed.match(/^\d+\.\s/)) {
          return <li key={i} className="ml-4 mb-1 list-decimal">{trimmed.replace(/^\d+\.\s/, '')}</li>;
        }
        if (!trimmed) {
          return <div key={i} className="h-2" />;
        }

        const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="mb-2 leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>{titulo}</DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                title="Copiar"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownloadDocx}
                title="Baixar DOCX"
              >
                <FileIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownloadPdf}
                title="Baixar PDF"
              >
                <FileDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 border border-border rounded-lg bg-muted/20">
          <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
            {renderMarkdown(conteudo)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
