import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface FormSectionProps {
  title: string;           // Ex: "DADOS INDIVIDUAIS"
  children: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  columns?: 1 | 2 | 3 | 4;     // Grid columns (default: 3)
  className?: string;
}

export function FormSection({
  title,
  children,
  action,
  columns = 3,
  className,
}: FormSectionProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('pt-4 mt-4 border-t border-border/30 first:pt-0 first:mt-0 first:border-t-0', className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold tracking-wider text-accent uppercase">
          {title}
        </h4>
        {action && (
          <Button
            size="sm"
            variant="outline"
            onClick={action.onClick}
            className="h-7 text-xs"
          >
            {action.icon || <RefreshCw className="w-3 h-3 mr-1" />}
            {action.label}
          </Button>
        )}
      </div>
      <div className={cn('grid gap-4', gridCols[columns])}>
        {children}
      </div>
    </div>
  );
}
