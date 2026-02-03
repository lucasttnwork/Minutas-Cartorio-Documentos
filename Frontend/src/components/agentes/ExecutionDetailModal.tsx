// src/components/agentes/ExecutionDetailModal.tsx
// Modal fullscreen para visualização detalhada de uma execução de agente especialista

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  FileText,
  FileDown,
  Clock,
  Zap,
  Check,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Hash,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FormSection } from '@/components/forms/FormSection';
import { filterJsonSection } from './ResultadoAnalise';
import { exportToDocx, exportToPdf } from '@/utils/documentExport';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { Database } from '@/types/database.types';

type AgentesEspecialistasRun = Database['public']['Tables']['agentes_especialistas_runs']['Row'];
type AgentStatus = Database['public']['Enums']['agentes_especialistas_status'];

export interface ExecutionDetailModalProps {
  execution: AgentesEspecialistasRun | null;
  isOpen: boolean;
  onClose: () => void;
}

// Status configuration
const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pendente',
    color: 'text-yellow-500',
    icon: <Clock className="h-5 w-5" />,
  },
  processing: {
    label: 'Processando',
    color: 'text-blue-500',
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
  },
  streaming: {
    label: 'Streaming',
    color: 'text-primary',
    icon: <Zap className="h-5 w-5" />,
  },
  completed: {
    label: 'Concluído',
    color: 'text-green-500',
    icon: <CheckCircle className="h-5 w-5" />,
  },
  stopped: {
    label: 'Parado',
    color: 'text-orange-500',
    icon: <AlertCircle className="h-5 w-5" />,
  },
  error: {
    label: 'Erro',
    color: 'text-red-500',
    icon: <XCircle className="h-5 w-5" />,
  },
};

// Agent labels
const AGENT_LABELS: Record<string, string> = {
  rg: 'RG - Identidade',
  cnh: 'CNH - Habilitação',
  cpf: 'CPF',
  ctps: 'CTPS - Carteira de Trabalho',
  certidao_nascimento: 'Certidão de Nascimento',
  certidao_casamento: 'Certidão de Casamento',
  certidao_obito: 'Certidão de Óbito',
  'matricula-imovel': 'Matrícula de Imóvel',
  escritura: 'Escritura Pública',
  iptu: 'IPTU',
  contrato_social: 'Contrato Social',
  cnpj: 'CNPJ',
  procuracao: 'Procuração',
};

interface CampoDados {
  label: string;
  value: string;
  section?: string;
}

/**
 * Extract structured fields from markdown content
 */
function extractCamposFromContent(conteudo: string): CampoDados[] {
  const campos: CampoDados[] = [];
  let currentSection = 'DADOS GERAIS';

  const lines = conteudo.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    // Detect sections (headers)
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      currentSection = trimmed.replace(/^#+\s*/, '').toUpperCase();
      continue;
    }

    // Detect fields in format "- **Label:** Value" or "- Label: Value"
    const bulletMatch = trimmed.match(/^[-*]\s*\*?\*?([^:*]+)\*?\*?:\s*(.+)$/);
    if (bulletMatch) {
      campos.push({
        label: bulletMatch[1].trim(),
        value: bulletMatch[2].trim(),
        section: currentSection,
      });
    }
  }

  return campos;
}

/**
 * Format duration
 */
function formatDuration(ms: number | null): string {
  if (ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Format full date
 */
function formatFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Get agent display name
 */
function getAgentLabel(slug: string, nome: string): string {
  return AGENT_LABELS[slug] || nome || slug;
}

/**
 * Read-only field with copy button
 */
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value || value === '-') return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [value]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      <div className="flex">
        <Input
          value={value || '-'}
          readOnly
          className="bg-muted/50 border-border/50 text-foreground cursor-default focus-visible:ring-0 rounded-r-none border-r-0"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value || value === '-'}
          className={cn(
            "flex items-center justify-center px-3",
            "border border-border/50 rounded-r-md",
            "bg-muted/30 hover:bg-muted transition-colors duration-150",
            "text-muted-foreground hover:text-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-muted/30",
            copied && "text-green-500 hover:text-green-500 bg-green-500/10"
          )}
          title={copied ? "Copiado!" : "Copiar"}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/**
 * Structured data fields component
 */
function CamposDados({ campos }: { campos: CampoDados[] }) {
  // Group by section
  const camposPorSecao = useMemo(() => {
    const grupos: Record<string, CampoDados[]> = {};
    campos.forEach((campo) => {
      const secao = campo.section || 'DADOS GERAIS';
      if (!grupos[secao]) {
        grupos[secao] = [];
      }
      grupos[secao].push(campo);
    });
    return grupos;
  }, [campos]);

  return (
    <div className="space-y-2">
      {Object.entries(camposPorSecao).map(([secao, camposSecao], index) => (
        <FormSection
          key={secao}
          title={secao}
          columns={2}
          variant="ghost"
          isFirst={index === 0}
        >
          {camposSecao.map((campo, idx) => (
            <ReadOnlyField key={idx} label={campo.label} value={campo.value} />
          ))}
        </FormSection>
      ))}
    </div>
  );
}

/**
 * Markdown renderer
 */
function MarkdownRenderer({ content }: { content: string }) {
  const renderedContent = useMemo(() => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();

      // Code block
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

      // Lists
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

      // Empty line
      if (!trimmed) {
        return <div key={i} className="h-2" />;
      }

      // Normal paragraph
      return (
        <p key={i} className="mb-2 leading-relaxed text-muted-foreground">
          {renderInlineStyles(trimmed)}
        </p>
      );
    });
  }, [content]);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
      {renderedContent}
    </div>
  );
}

/**
 * Render inline styles (bold, italic, code)
 */
function renderInlineStyles(text: string) {
  const codeRegex = /`([^`]+)`/g;
  const parts: Array<string | React.ReactElement> = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  const textWithCode = text.replace(codeRegex, (_match, code) => {
    return `<code>${code}</code>`;
  });

  const regex = /\*\*([^*]+)\*\*|<code>([^<]+)<\/code>/g;
  const processedText = textWithCode;

  while ((match = regex.exec(processedText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(processedText.slice(lastIndex, match.index));
    }

    if (match[1]) {
      parts.push(<strong key={keyIndex++}>{match[1]}</strong>);
    } else if (match[2]) {
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
 * Document container with title
 */
function DocumentContainer({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="flex-shrink-0 px-6 py-4 border-b border-border/50 bg-muted/20">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}

/**
 * ExecutionDetailModal component
 * Fullscreen modal displaying execution details with two-column layout
 */
export function ExecutionDetailModal({
  execution,
  isOpen,
  onClose,
}: ExecutionDetailModalProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const isMobile = useIsMobile();

  // Extract structured fields
  const camposExtraidos = useMemo(() => {
    if (!execution?.output_texto) return [];
    return extractCamposFromContent(execution.output_texto);
  }, [execution?.output_texto]);

  // Copy all content
  const handleCopyAll = useCallback(async () => {
    if (!execution?.output_texto) return;

    try {
      const filtered = filterJsonSection(execution.output_texto);
      await navigator.clipboard.writeText(filtered);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [execution?.output_texto]);

  // Download as DOCX
  const handleDownloadDocx = useCallback(async () => {
    if (!execution?.output_texto) return;

    try {
      const cleanContent = filterJsonSection(execution.output_texto);
      const filename = `${execution.agent_slug}-extracao`;
      await exportToDocx(cleanContent, filename);
    } catch (err) {
      console.error('Failed to export DOCX:', err);
    }
  }, [execution?.output_texto, execution?.agent_slug]);

  // Download as PDF
  const handleDownloadPdf = useCallback(() => {
    if (!execution?.output_texto) return;

    try {
      const cleanContent = filterJsonSection(execution.output_texto);
      const filename = `${execution.agent_slug}-extracao`;
      exportToPdf(cleanContent, filename);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  }, [execution?.output_texto, execution?.agent_slug]);

  if (!execution) return null;

  const statusConfig = STATUS_CONFIG[execution.status] || STATUS_CONFIG.pending;
  const documentos = execution.documentos as Array<{ nome: string }> | null;
  const hasContent = execution.output_texto && execution.output_texto.length > 0;
  const showDataFields = hasContent && camposExtraidos.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: isMobile ? 1 : 0.95, y: isMobile ? 20 : 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative bg-card flex flex-col overflow-hidden",
              isMobile
                ? "w-full h-full rounded-none"
                : "w-[95vw] h-[90vh] max-w-[1800px] border border-border rounded-xl shadow-2xl"
            )}
          >
            {/* Header - Mobile */}
            {isMobile ? (
              <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors touch-feedback"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="text-base font-semibold leading-tight">
                      {getAgentLabel(execution.agent_slug, execution.agent_nome)}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        statusConfig.color
                      )}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatFullDate(execution.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Header - Desktop */
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={statusConfig.color}>{statusConfig.icon}</span>
                    <h2 className="text-lg font-semibold">
                      {getAgentLabel(execution.agent_slug, execution.agent_nome)}
                    </h2>
                  </div>

                  {/* Status badge */}
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    execution.status === 'completed' && 'bg-green-500/10 text-green-500',
                    execution.status === 'error' && 'bg-red-500/10 text-red-500',
                    execution.status === 'processing' && 'bg-blue-500/10 text-blue-500',
                  )}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Action buttons */}
                  {hasContent && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAll}
                        className="gap-2"
                      >
                        {copiedAll ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadDocx}>
                        <FileText className="h-4 w-4" />
                        DOCX
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadPdf}>
                        <FileDown className="h-4 w-4" />
                        PDF
                      </Button>
                    </>
                  )}

                  {/* Close button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="ml-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Metadata bar */}
            <div className={cn(
              "flex-shrink-0 border-b border-border/50 bg-muted/10",
              isMobile
                ? "flex flex-wrap gap-x-4 gap-y-2 px-4 py-2 text-xs"
                : "flex items-center gap-6 px-6 py-3 text-sm"
            )}>
              {!isMobile && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatFullDate(execution.created_at)}</span>
                </div>
              )}

              {execution.duration_ms !== null && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  <span>{formatDuration(execution.duration_ms)}</span>
                </div>
              )}

              {(execution.input_tokens || execution.output_tokens) && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  <span>
                    {execution.input_tokens ?? 0}/{execution.output_tokens ?? 0} tokens
                  </span>
                </div>
              )}

              {documentos && documentos.length > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  <span>
                    {documentos.length} doc{documentos.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {execution.cost_estimate !== null && (
                <div className={cn(
                  "flex items-center text-muted-foreground",
                  isMobile ? "ml-auto" : ""
                )}>
                  <span className="font-medium">${Number(execution.cost_estimate).toFixed(4)}</span>
                </div>
              )}

              {!isMobile && execution.id && (
                <div className="flex items-center gap-2 text-muted-foreground/60 ml-auto">
                  <Hash className="h-3 w-3" />
                  <span className="text-xs font-mono">{execution.id.slice(0, 8)}</span>
                </div>
              )}
            </div>

            {/* Content area */}
            <div className={cn(
              "flex-1 overflow-hidden bg-gradient-to-b from-background/50 to-background/30",
              isMobile ? "p-4 pb-20" : "p-6"
            )}>
              {/* Error state */}
              {execution.status === 'error' && execution.erro_mensagem && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md px-4">
                    <div className={cn(
                      "mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center",
                      isMobile ? "w-12 h-12" : "w-16 h-16"
                    )}>
                      <XCircle className={cn(isMobile ? "h-6 w-6" : "h-8 w-8", "text-red-500")} />
                    </div>
                    <h3 className={cn(
                      "font-medium text-foreground mb-2",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      Erro na execução
                    </h3>
                    <p className={cn(
                      "text-red-500 bg-red-500/10 rounded-lg p-4",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {execution.erro_mensagem}
                    </p>
                  </div>
                </div>
              )}

              {/* No content state */}
              {!hasContent && execution.status !== 'error' && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileText className={cn(
                      "mx-auto mb-4 text-muted-foreground/50",
                      isMobile ? "h-10 w-10" : "h-12 w-12"
                    )} />
                    <p className="text-muted-foreground">
                      Nenhum resultado disponível para esta execução.
                    </p>
                  </div>
                </div>
              )}

              {/* Two-column layout with content (single column on mobile) */}
              {hasContent && (
                <div className={cn(
                  "h-full overflow-auto",
                  isMobile ? "space-y-4" : "grid gap-6 grid-cols-1 lg:grid-cols-2"
                )}>
                  {/* Left column - Markdown text */}
                  <div className="bg-card shadow-sm border border-border/50 rounded-lg overflow-hidden">
                    <DocumentContainer title="Dados Extraídos">
                      <MarkdownRenderer content={filterJsonSection(execution.output_texto || '')} />
                    </DocumentContainer>
                  </div>

                  {/* Right column / Below on mobile - Structured form with copy buttons */}
                  {showDataFields && (
                    <div className="bg-card shadow-sm border border-border/50 rounded-lg overflow-hidden">
                      <DocumentContainer title="Copiar Dados">
                        <CamposDados campos={camposExtraidos} />
                      </DocumentContainer>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Action Bar */}
            {isMobile && hasContent && (
              <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-card/95 backdrop-blur-sm pb-safe">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAll}
                    className="flex-1 h-10"
                  >
                    {copiedAll ? (
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copiedAll ? 'Copiado' : 'Copiar'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-10" onClick={handleDownloadDocx}>
                    <FileText className="h-4 w-4 mr-1" />
                    DOCX
                  </Button>
                  <Button variant="outline" size="sm" className="h-10" onClick={handleDownloadPdf}>
                    <FileDown className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExecutionDetailModal;
