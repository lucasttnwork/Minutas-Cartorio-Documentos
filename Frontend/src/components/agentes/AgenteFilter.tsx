// src/components/agentes/AgenteFilter.tsx

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { categorias } from '@/data/agentes';

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
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoriaChange(cat.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              categoriaAtiva === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar agente..."
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
