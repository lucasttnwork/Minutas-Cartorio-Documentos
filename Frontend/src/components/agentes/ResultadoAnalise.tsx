// src/components/agentes/ResultadoAnalise.tsx

import { Copy, FileDown, Maximize2, FileText as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AnaliseStatus } from '@/types/agente';

interface ResultadoAnaliseProps {
  status: AnaliseStatus;
  conteudo: string;
  onCopy: () => void;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
  onExpand: () => void;
}

export function ResultadoAnalise({
  status,
  conteudo,
  onCopy,
  onDownloadDocx,
  onDownloadPdf,
  onExpand,
}: ResultadoAnaliseProps) {
  const renderMarkdown = (text: string) => {
    // Simple markdown to HTML conversion for display
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

        // Handle inline bold
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

  const hasContent = status === 'completed' || status === 'analyzing';

  return (
    <div className="h-full flex flex-col border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="font-medium text-sm">Resultado da Análise</h3>

        {status === 'completed' && (
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              title="Expandir"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        'flex-1 overflow-auto p-6',
        !hasContent && 'flex items-center justify-center'
      )}>
        {status === 'idle' && (
          <div className="text-center text-muted-foreground">
            <FileIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">O resultado da análise aparecerá aqui</p>
          </div>
        )}

        {status === 'analyzing' && (
          <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
            {renderMarkdown(conteudo)}
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
          </div>
        )}

        {status === 'completed' && (
          <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
            {renderMarkdown(conteudo)}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center text-destructive">
            <p className="text-sm">Erro ao processar documento</p>
          </div>
        )}
      </div>
    </div>
  );
}
