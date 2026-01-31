// src/pages/DashboardAgentes.tsx

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AgenteCard, AgenteFilter } from '@/components/agentes';
import { ExecutionHistory } from '@/components/agents';
import { getAgentesByCategoria } from '@/data/agentes';
import { History, Bot } from 'lucide-react';

type TabType = 'agentes' | 'historico';

export default function DashboardAgentes() {
  const [activeTab, setActiveTab] = useState<TabType>('agentes');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [busca, setBusca] = useState('');

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
    <div className="p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl"
      >
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Agentes Auxiliares
          </h1>
          <p className="text-muted-foreground">
            Selecione um agente para extrair dados de documentos
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('agentes')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'agentes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bot className="w-4 h-4" />
            Agentes
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'historico'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="w-4 h-4" />
            Historico de Execucoes
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Ultimas Execucoes de IA</h2>
            <ExecutionHistory limit={20} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
