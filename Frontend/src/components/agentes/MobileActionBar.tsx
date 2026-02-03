// src/components/agentes/MobileActionBar.tsx

import { motion } from 'framer-motion';
import { RefreshCw, FilePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'analyzing' | 'completed' | 'error';

interface MobileActionBarProps {
  status: Status;
  canAnalyze: boolean;
  onAnalyze: () => void;
  onRegenerate: () => void;
  onNewDocument: () => void;
}

export function MobileActionBar({
  status,
  canAnalyze,
  onAnalyze,
  onRegenerate,
  onNewDocument,
}: MobileActionBarProps) {
  const isAnalyzing = status === 'analyzing';
  const isCompleted = status === 'completed';
  const hasError = status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'px-4 py-3 pb-safe',
        'bg-background/85 backdrop-blur-xl border-t border-border/50',
        'flex gap-2'
      )}
    >
      {(status === 'idle' || hasError) && (
        <Button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="flex-1 h-12 text-base font-medium touch-feedback"
          size="lg"
        >
          {hasError ? 'Tentar Novamente' : 'Analisar Documento'}
        </Button>
      )}

      {isAnalyzing && (
        <Button
          disabled
          variant="secondary"
          className="flex-1 h-12 text-base"
          size="lg"
        >
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Processando...
        </Button>
      )}

      {isCompleted && (
        <>
          <Button
            onClick={onRegenerate}
            className="flex-1 h-12 text-base font-medium touch-feedback"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Gerar Novamente
          </Button>
          <Button
            onClick={onNewDocument}
            variant="outline"
            className="h-12 px-4 touch-feedback"
            size="lg"
          >
            <FilePlus className="w-5 h-5" />
          </Button>
        </>
      )}
    </motion.div>
  );
}
