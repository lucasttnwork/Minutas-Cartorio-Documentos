// src/components/agentes/AgenteFilter.tsx

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { categorias } from '@/data/agentes';
import { useIsMobile } from '@/hooks/useIsMobile';

interface AgenteFilterProps {
  categoriaAtiva: string;
  onCategoriaChange: (categoria: string) => void;
  busca: string;
  onBuscaChange: (busca: string) => void;
}

export function AgenteFilter({
  categoriaAtiva,
  onCategoriaChange,
  busca,
  onBuscaChange,
}: AgenteFilterProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Category Pills */}
      <div
        className={cn(
          isMobile
            ? 'flex gap-2 overflow-x-auto scroll-touch-x scrollbar-hide scroll-snap-x -mx-4 px-4 pb-2'
            : 'flex gap-2 flex-wrap'
        )}
      >
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoriaChange(cat.id)}
            className={cn(
              'px-4 rounded-full text-sm font-medium transition-all duration-200',
              'whitespace-nowrap flex-shrink-0',
              'touch-feedback touch-target',
              isMobile ? 'h-11 scroll-snap-item' : 'py-2',
              categoriaAtiva === cat.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted active:bg-muted/70'
            )}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar agente..."
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          className={cn('pl-10', isMobile && 'h-11')}
        />
      </div>
    </div>
  );
}
