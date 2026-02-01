// src/components/agentes/ResultadoAnalise.tsx
// Componente de resultado com suporte a streaming em tempo real

import { useEffect, useRef, memo, useMemo } from 'react';
import { Copy, FileDown, Maximize2, FileText as FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThinkingIndicator } from '@/components/streaming';
import type { AnaliseStatus } from '@/types/agente';

interface ResultadoAnaliseProps {
  status: AnaliseStatus;
  conteudo: string;
  thinking?: string;
  thinkingDuration?: number;
  isStreaming?: boolean;
  onCopy: () => void;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
  onExpand: () => void;
}

/**
 * Componente de Markdown otimizado para streaming
 * Usa memo para evitar re-renders desnecessários
 */
const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  // Auto-scroll quando novo conteúdo chega durante streaming
  useEffect(() => {
    if (isStreaming && containerRef.current && content.length > prevLengthRef.current) {
      const container = containerRef.current;
      // Verificar se o usuário está perto do final (dentro de 100px)
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
    prevLengthRef.current = content.length;
  }, [content, isStreaming]);

  // Renderizar markdown de forma otimizada
  const renderedContent = useMemo(() => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();

      // Código block
      if (trimmed.startsWith('```')) {
        return (
          <div key={i} className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">
            {trimmed}
          </div>
        );
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={i} className="text-base font-semibold mt-4 mb-2 text-foreground">
            {trimmed.slice(4)}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={i} className="text-lg font-semibold mt-5 mb-2 text-foreground border-b border-border pb-1">
            {trimmed.slice(3)}
          </h2>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">
            {trimmed.slice(2)}
          </h1>
        );
      }

      // Listas
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={i} className="ml-4 mb-1 list-disc text-muted-foreground">
            {renderInlineStyles(trimmed.slice(2))}
          </li>
        );
      }
      if (trimmed.match(/^\d+\.\s/)) {
        return (
          <li key={i} className="ml-4 mb-1 list-decimal text-muted-foreground">
            {renderInlineStyles(trimmed.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }

      // Linha vazia
      if (!trimmed) {
        return <div key={i} className="h-2" />;
      }

      // Parágrafo normal
      return (
        <p key={i} className="mb-2 leading-relaxed text-muted-foreground">
          {renderInlineStyles(trimmed)}
        </p>
      );
    });
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="prose prose-sm max-w-none dark:prose-invert font-serif overflow-auto"
    >
      {renderedContent}
      {/* Cursor piscante durante streaming */}
      {isStreaming && (
        <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-middle animate-blink" />
      )}
    </div>
  );
});

/**
 * Renderiza estilos inline (bold, italic, code)
 */
function renderInlineStyles(text: string) {
  // Handle inline code
  const codeRegex = /`([^`]+)`/g;

  const parts: Array<string | JSX.Element> = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  // Primeiro, processar código inline
  const textWithCode = text.replace(codeRegex, (_match, code) => {
    return `<code>${code}</code>`;
  });

  // Depois, processar bold e code tags
  const regex = /\*\*([^*]+)\*\*|<code>([^<]+)<\/code>/g;
  const processedText = textWithCode;

  while ((match = regex.exec(processedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(processedText.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold match
      parts.push(<strong key={keyIndex++}>{match[1]}</strong>);
    } else if (match[2]) {
      // Code match
      parts.push(
        <code key={keyIndex++} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
          {match[2]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < processedText.length) {
    parts.push(processedText.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Indicador de loading animado
 */
const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-primary/20" />
      </div>
      <p className="text-sm text-muted-foreground mt-4">Analisando documento...</p>
      <div className="flex gap-1 mt-2">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
});

/**
 * Componente principal de resultado da análise
 */
export function ResultadoAnalise({
  status,
  conteudo,
  thinking,
  thinkingDuration = 0,
  isStreaming = false,
  onCopy,
  onDownloadDocx,
  onDownloadPdf,
  onExpand,
}: ResultadoAnaliseProps) {
  const hasContent = status === 'completed' || status === 'analyzing';
  const showThinking = thinking && thinking.length > 0;

  return (
    <div className="h-full flex flex-col border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">Resultado da Análise</h3>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Streaming
            </span>
          )}
        </div>

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
      <div
        className={cn(
          'flex-1 overflow-auto p-6',
          !hasContent && 'flex items-center justify-center'
        )}
      >
        {/* Estado idle */}
        {status === 'idle' && (
          <div className="text-center text-muted-foreground">
            <FileIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">O resultado da análise aparecerá aqui</p>
            <p className="text-xs mt-1 opacity-70">
              Faça upload de um documento e clique em Analisar
            </p>
          </div>
        )}

        {/* Estado analyzing - sem conteúdo ainda */}
        {status === 'analyzing' && !conteudo && (
          <LoadingIndicator />
        )}

        {/* Thinking indicator (se disponível) */}
        {showThinking && (
          <ThinkingIndicator
            content={thinking}
            isStreaming={isStreaming}
            duration={thinkingDuration}
            isVisible={true}
            autoCollapse={!isStreaming}
          />
        )}

        {/* Conteúdo em streaming ou completo */}
        {(status === 'analyzing' || status === 'completed') && conteudo && (
          <MarkdownRenderer content={conteudo} isStreaming={isStreaming} />
        )}

        {/* Estado de erro */}
        {status === 'error' && (
          <div className="text-center text-destructive">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
              <FileIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">Erro ao processar documento</p>
            <p className="text-xs mt-1 opacity-70">
              Tente novamente ou use outro documento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
