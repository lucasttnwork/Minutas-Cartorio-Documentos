// src/components/minutas-padrao/TemplateGrid.tsx

import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplateCard } from './TemplateCard';
import type { MinutaPadrao } from '@/types/minutas-padrao';

export interface TemplateGridProps {
  templates: MinutaPadrao[];
  isLoading?: boolean;
  emptyMessage?: string;
  selectedId?: string;
  onSelect?: (template: MinutaPadrao) => void;
  onEdit?: (template: MinutaPadrao) => void;
  onDelete?: (template: MinutaPadrao) => void;
}

function LoadingSkeleton() {
  return (
    <div data-testid="loading-skeleton" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function TemplateGrid({
  templates,
  isLoading = false,
  emptyMessage = 'Nenhum template encontrado',
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: TemplateGridProps) {
  // Sort templates: global first, then by name
  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => {
      // Global templates first
      if (a.is_global && !b.is_global) return -1;
      if (!a.is_global && b.is_global) return 1;
      // Then sort by name
      return a.nome.localeCompare(b.nome);
    });
  }, [templates]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (templates.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div
      data-testid="template-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {sortedTemplates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={selectedId === template.id}
          onSelect={onSelect}
          onEdit={!template.is_global ? onEdit : undefined}
          onDelete={!template.is_global ? onDelete : undefined}
        />
      ))}
    </div>
  );
}
