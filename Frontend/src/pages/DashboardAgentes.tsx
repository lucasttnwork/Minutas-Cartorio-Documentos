// src/pages/DashboardAgentes.tsx

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AgenteCard,
  AgenteFilter,
  ExecutionHistoryAgentes,
  ExecutionDetailModal,
} from '@/components/agentes';
import { getAgentesByCategoria } from '@/data/agentes';
import { History, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { Database } from '@/types/database.types';

type AgentesEspecialistasRun = Database['public']['Tables']['agentes_especialistas_runs']['Row'];

type TabType = 'agentes' | 'historico';

export default function DashboardAgentes() {
  const [activeTab, setActiveTab] = useState<TabType>('agentes');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [busca, setBusca] = useState('');
  const isMobile = useIsMobile();

  // Modal state for execution details
  const [selectedExecution, setSelectedExecution] = useState<AgentesEspecialistasRun | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectExecution = (execution: AgentesEspecialistasRun) => {
    setSelectedExecution(execution);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedExecution(null), 200);
  };

  const agentesFiltrados = useMemo(() => {
    let resultado = getAgentesByCategoria(categoriaAtiva);

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      resultado = resultado.filter(
        a => a.nome.toLowerCase().includes(termo) ||
             a.descricao.toLowerCase().includes(termo)
      );
    }

    return resultado;
  }, [categoriaAtiva, busca]);

  return (
    <div className={cn(
      'flex flex-col min-h-full p-4 md:p-6 lg:p-10',
      isMobile && 'w-full max-w-full overflow-x-hidden'
    )}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn('max-w-5xl', isMobile && 'w-full')}
      >
        {/* Header */}
        <header className={cn('mb-6 md:mb-8')}>
          <h1 className={cn(
            'font-bold text-foreground mb-2',
            isMobile ? 'text-xl' : 'text-2xl md:text-3xl'
          )}>
            Agentes Auxiliares
          </h1>
          <p className={cn(
            'text-muted-foreground',
            isMobile && 'text-sm'
          )}>
            Selecione um agente para extrair dados de documentos
          </p>
        </header>

        {/* Tab Navigation - iOS style on mobile */}
        <div className={cn(
          'mb-6 flex gap-1 border-b border-border',
          isMobile && '-mx-4 px-4'
        )}>
          <button
            onClick={() => setActiveTab('agentes')}
            className={cn(
              'flex items-center gap-2 font-medium transition-colors border-b-2 -mb-px touch-feedback',
              isMobile ? 'px-3 py-3 text-sm flex-1 justify-center' : 'px-4 py-2 text-sm',
              activeTab === 'agentes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Bot className={cn(isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
            Agentes
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={cn(
              'flex items-center gap-2 font-medium transition-colors border-b-2 -mb-px touch-feedback',
              isMobile ? 'px-3 py-3 text-sm flex-1 justify-center' : 'px-4 py-2 text-sm',
              activeTab === 'historico'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <History className={cn(isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
            {isMobile ? 'Historico' : 'Historico de Execucoes'}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'agentes' ? (
          <>
            {/* Filters */}
            <AgenteFilter
              categoriaAtiva={categoriaAtiva}
              onCategoriaChange={setCategoriaAtiva}
              busca={busca}
              onBuscaChange={setBusca}
            />

            {/* Agents Grid */}
            {agentesFiltrados.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground"
              >
                <p>Nenhum agente encontrado para "{busca}"</p>
              </motion.div>
            ) : (
              <div className={cn(
                'grid gap-4',
                isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              )}>
                {agentesFiltrados.map((agente, index) => (
                  <AgenteCard
                    key={agente.id}
                    agente={agente}
                    index={index}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-card border border-border rounded-lg p-4 md:p-6">
            <h2 className="text-lg font-semibold mb-4">Ultimas Execucoes de IA</h2>
            <ExecutionHistoryAgentes
              limit={20}
              onSelectExecution={handleSelectExecution}
            />
          </div>
        )}
      </motion.div>

      {/* Execution Detail Modal */}
      <ExecutionDetailModal
        execution={selectedExecution}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
