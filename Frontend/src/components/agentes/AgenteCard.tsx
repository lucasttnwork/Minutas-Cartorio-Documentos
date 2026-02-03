// src/components/agentes/AgenteCard.tsx

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { icons, FileText, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { AgenteConfig } from '@/types/agente';

interface AgenteCardProps {
  agente: AgenteConfig;
  index: number;
}

export function AgenteCard({ agente, index }: AgenteCardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Get icon component dynamically
  const IconComponent: LucideIcon = icons[agente.icone as keyof typeof icons] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          'cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-200 group h-full',
          isMobile && 'min-h-[120px] active:bg-muted/30'
        )}
        onClick={() => navigate(`/agentes/${agente.slug}`)}
      >
        <CardHeader className={cn('pb-3', isMobile && 'pb-2')}>
          <div
            className={cn(
              'rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors',
              isMobile ? 'w-14 h-14' : 'w-12 h-12'
            )}
          >
            <IconComponent
              className={cn(
                'text-primary',
                isMobile ? 'w-7 h-7' : 'w-6 h-6'
              )}
            />
          </div>
          <CardTitle
            className={cn(
              'group-hover:text-primary transition-colors',
              isMobile ? 'text-lg' : 'text-lg'
            )}
          >
            {agente.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription
            className={cn(
              isMobile ? 'text-sm leading-relaxed' : 'text-sm'
            )}
          >
            {agente.descricao}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
