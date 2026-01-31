// src/components/agentes/AgenteCard.tsx

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AgenteConfig } from '@/types/agente';

interface AgenteCardProps {
  agente: AgenteConfig;
  index: number;
}

export function AgenteCard({ agente, index }: AgenteCardProps) {
  const navigate = useNavigate();

  // Get icon component dynamically
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[agente.icone] || Icons.FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-200 group h-full"
        onClick={() => navigate(`/agentes/${agente.slug}`)}
      >
        <CardHeader className="pb-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {agente.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">
            {agente.descricao}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
