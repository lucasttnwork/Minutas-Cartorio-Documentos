// src/components/minutas-padrao/TemplateSelectionModal.tsx
// Modal para selecionar template de minuta antes de gerar documento

import { useState, useEffect, useMemo, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, LayoutTemplate, FileText, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMinutasPadrao } from '@/hooks/useMinutasPadrao';
import type { MinutaPadrao, TipoNegocio } from '@/types/minutas-padrao';
import { TIPO_NEGOCIO_LABELS } from '@/types/minutas-padrao';

export interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: MinutaPadrao) => void;
  initialSelectedId?: string;
}

/**
 * Template card component
 */
function TemplateCard({
  template,
  isSelected,
  onClick,
}: {
  template: MinutaPadrao;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-lg border cursor-pointer',
        'transition-all duration-200',
        'bg-card hover:bg-accent/30',
        isSelected
          ? 'ring-2 ring-primary border-primary shadow-md'
          : 'border-border hover:border-border/80'
      )}
    >
      {/* Selection checkmark overlay */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-primary-foreground" />
        </motion.div>
      )}

      {/* Global badge */}
      {template.is_global && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium flex items-center gap-1">
          <Globe className="w-3 h-3" />
          Global
        </div>
      )}

      {/* User badge for non-global templates */}
      {!template.is_global && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium flex items-center gap-1">
          <User className="w-3 h-3" />
          Meu Template
        </div>
      )}

      {/* Template icon */}
      <div className="mt-6 mb-3 flex justify-center">
        <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>

      {/* Template info */}
      <div className="text-center">
        <h3 className="font-medium text-foreground truncate">{template.nome}</h3>
        {template.descricao && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {template.descricao}
          </p>
        )}
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 rounded bg-muted/50">
            {TIPO_NEGOCIO_LABELS[template.tipo_negocio]}
          </span>
          <span>{template.uso_count} usos</span>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Loading skeleton for templates
 */
function LoadingSkeleton() {
  return (
    <div data-testid="loading-skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-4 rounded-lg border border-border bg-card animate-pulse"
        >
          <div className="h-4 w-16 bg-muted rounded mb-4" />
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-lg bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded mx-auto w-32" />
            <div className="h-4 bg-muted rounded mx-auto w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <LayoutTemplate className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-foreground mb-2">Nenhum template encontrado</h3>
      <p className="text-sm text-muted-foreground">
        Nao ha templates disponiveis para o filtro selecionado.
      </p>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <X className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="font-medium text-foreground mb-2">Erro ao carregar templates</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * TemplateSelectionModal component
 * Modal fullscreen para selecionar template antes de gerar minuta
 */
export function TemplateSelectionModal({
  isOpen,
  onClose,
  onSelect,
  initialSelectedId,
}: TemplateSelectionModalProps) {
  const titleId = useId();
  const { templates, isLoading, error, loadTemplates } = useMinutasPadrao();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [filterTipo, setFilterTipo] = useState<TipoNegocio | 'all'>('all');

  // Reset selection when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedId(initialSelectedId ?? null);
      setFilterTipo('all');
      loadTemplates();
    }
  }, [isOpen, initialSelectedId, loadTemplates]);

  // Filter and sort templates: global first, then by uso_count
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Apply filter
    if (filterTipo !== 'all') {
      filtered = filtered.filter((t) => t.tipo_negocio === filterTipo);
    }

    // Sort: global first, then by uso_count
    return [...filtered].sort((a, b) => {
      if (a.is_global !== b.is_global) {
        return a.is_global ? -1 : 1;
      }
      return b.uso_count - a.uso_count;
    });
  }, [templates, filterTipo]);

  // Get selected template
  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedId) ?? null;
  }, [templates, selectedId]);

  // Handle template selection
  const handleSelectTemplate = useCallback((template: MinutaPadrao) => {
    setSelectedId(template.id);
  }, []);

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    }
  }, [selectedTemplate, onSelect, onClose]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && selectedTemplate) {
        handleConfirm();
      }
    },
    [onClose, selectedTemplate, handleConfirm]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop/Overlay */}
          <motion.div
            data-testid="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            className={cn(
              'relative w-[95vw] max-w-4xl h-[80vh]',
              'bg-card border border-border rounded-xl shadow-2xl',
              'flex flex-col overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5 text-primary" />
                </div>
                <h2 id={titleId} className="text-lg font-semibold text-foreground">
                  Selecionar Template
                </h2>
              </div>

              <div className="flex items-center gap-4">
                {/* Filter dropdown */}
                <Select
                  value={filterTipo}
                  onValueChange={(value) => setFilterTipo(value as TipoNegocio | 'all')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {Object.entries(TIPO_NEGOCIO_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Close button */}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Body - Scrollable template grid */}
            <div className="flex-1 overflow-auto p-6">
              {isLoading && <LoadingSkeleton />}

              {error && <ErrorState message={error} />}

              {!isLoading && !error && filteredTemplates.length === 0 && <EmptyState />}

              {!isLoading && !error && filteredTemplates.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={selectedId === template.id}
                        onClick={() => handleSelectTemplate(template)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={!selectedTemplate}>
                Selecionar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TemplateSelectionModal;
