import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CheckboxItem {
  id: string;
  label: string;
  description?: string;
}

interface CheckboxGroupProps {
  items: CheckboxItem[];
  values: Record<string, boolean>;
  onChange: (id: string, checked: boolean) => void;
  columns?: 1 | 2;
  className?: string;
}

export function CheckboxGroup({
  items,
  values,
  onChange,
  columns = 1,
  className,
}: CheckboxGroupProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
  };

  return (
    <div className={cn('grid gap-3', gridCols[columns], className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <Checkbox
            id={item.id}
            checked={values[item.id] || false}
            onCheckedChange={(checked) => onChange(item.id, checked === true)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label
              htmlFor={item.id}
              className="text-sm font-medium cursor-pointer leading-tight"
            >
              {item.label}
            </Label>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
