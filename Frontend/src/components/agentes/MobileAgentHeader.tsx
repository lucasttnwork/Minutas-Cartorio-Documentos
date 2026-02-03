// src/components/agentes/MobileAgentHeader.tsx

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileAgentHeaderProps {
  title: string;
  subtitle?: string;
}

export function MobileAgentHeader({ title, subtitle }: MobileAgentHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'sticky top-0 z-40 flex items-center gap-3 h-14 px-4',
        'bg-background/80 backdrop-blur-xl border-b border-border/50',
        'pt-safe'
      )}
    >
      <button
        onClick={() => navigate('/dashboard/agentes')}
        className="touch-target touch-feedback flex items-center justify-center -ml-2"
        aria-label="Voltar"
      >
        <ArrowLeft className="w-6 h-6 text-muted-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">
            {subtitle}
          </p>
        )}
      </div>
    </motion.header>
  );
}
