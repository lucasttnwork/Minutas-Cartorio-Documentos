// src/components/minutas-padrao/TemplateCard.tsx

import { FileText, FileType2, Shield, Pencil, Trash2, BarChart3, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MinutaPadrao } from '@/types/minutas-padrao';
import { TIPO_NEGOCIO_LABELS } from '@/types/minutas-padrao';
import { ExtractionStatusBadge } from './ExtractionStatusBadge';

export interface TemplateCardProps {
  template: MinutaPadrao;
  isSelected?: boolean;
  onSelect?: (template: MinutaPadrao) => void;
  onEdit?: (template: MinutaPadrao) => void;
  onDelete?: (template: MinutaPadrao) => void;
  onViewText?: (template: MinutaPadrao) => void;
}

export function TemplateCard({
  template,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onViewText,
}: TemplateCardProps) {
  const isPdf = template.mime_type === 'application/pdf';
  const isGlobal = template.is_global;
  const canEdit = !isGlobal && (onEdit || onDelete);
  const hasText = template.status_extracao === 'extraido' || template.status_extracao === 'revisado';
  const showViewText = hasText && onViewText;

  const handleClick = () => {
    onSelect?.(template);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(template);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(template);
  };

  const handleViewText = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewText?.(template);
  };

  return (
    <Card
      role="article"
      variant="interactive"
      className={cn(
        'cursor-pointer group h-full',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        {/* File Icon */}
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
          {isPdf ? (
            <FileText className="w-6 h-6 text-primary" data-testid="file-icon" />
          ) : (
            <FileType2 className="w-6 h-6 text-primary" data-testid="file-icon" />
          )}
        </div>

        {/* Header with title and badge */}
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
            {template.nome}
          </CardTitle>
          {isGlobal && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
              <Shield className="w-3 h-3" />
              Global
            </span>
          )}
        </div>

        {/* Extraction Status Badge */}
        {template.status_extracao && (
          <div className="mt-2">
            <ExtractionStatusBadge
              status={template.status_extracao}
              errorMessage={template.erro_extracao}
              showLabel={true}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {template.descricao && (
          <CardDescription className="line-clamp-2">
            {template.descricao}
          </CardDescription>
        )}

        {/* Footer: Usage count and actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {/* Usage count */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{template.uso_count} uso{template.uso_count !== 1 ? 's' : ''}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* View Text button (when text is available) */}
            {showViewText && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Ver texto extraído"
                onClick={handleViewText}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            )}
            {/* Edit/Delete actions (only for user templates) */}
            {canEdit && (
              <>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Editar template"
                    onClick={handleEdit}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Excluir template"
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tipo negocio badge */}
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
            {TIPO_NEGOCIO_LABELS[template.tipo_negocio]}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
