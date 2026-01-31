// src/pages/Dashboard.tsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMinuta } from "@/contexts/MinutaContext";
import { Plus, FileText, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { minutas, createMinuta, loadMinuta, deleteMinuta } = useMinuta();

  const handleNewMinuta = () => {
    createMinuta();
    navigate('/minuta/nova');
  };

  const handleOpenMinuta = (id: string, status: string, currentStep: string) => {
    loadMinuta(id);

    if (status === 'concluida') {
      navigate(`/minuta/${id}/minuta`);
    } else {
      const stepRoutes: Record<string, string> = {
        upload: '/minuta/nova',
        processando: `/minuta/${id}/processando`,
        outorgantes: `/minuta/${id}/outorgantes`,
        outorgados: `/minuta/${id}/outorgados`,
        imoveis: `/minuta/${id}/imoveis`,
        parecer: `/minuta/${id}/parecer`,
        negocio: `/minuta/${id}/negocio`,
        minuta: `/minuta/${id}/minuta`,
      };
      navigate(stepRoutes[currentStep] || '/minuta/nova');
    }
  };

  const handleDeleteMinuta = (e: React.MouseEvent, id: string, titulo: string) => {
    e.stopPropagation();
    toast.warning(`Excluir "${titulo}"?`, {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Excluir',
        onClick: () => {
          deleteMinuta(id);
          toast.success('Minuta excluída com sucesso');
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
      duration: 10000,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Sistema de Minutas
          </h1>
          <p className="text-muted-foreground text-lg">
            Conferência e Complementação de Documentos
          </p>
        </header>

        {/* New Minuta Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Button
            size="lg"
            onClick={handleNewMinuta}
            className="w-full md:w-auto flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Minuta
          </Button>
        </motion.div>

        {/* Minutas List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Suas Minutas
          </h2>

          {minutas.length === 0 ? (
            <Card className="bg-card/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-center">
                  Nenhuma minuta criada ainda.
                </p>
                <p className="text-sm text-muted-foreground/70 text-center mt-1">
                  Clique em "Nova Minuta" para começar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {minutas.map((minuta, index) => (
                <motion.div
                  key={minuta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card
                    className="bg-card border-2 border-border hover:border-accent transition-colors cursor-pointer group"
                    onClick={() => handleOpenMinuta(minuta.id, minuta.status, minuta.currentStep)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            minuta.status === 'concluida'
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          )}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-foreground group-hover:text-primary transition-colors text-lg">
                              {minuta.titulo}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3" />
                              Criada em {formatDate(minuta.dataCriacao)}
                            </CardDescription>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteMinuta(e, minuta.id, minuta.titulo)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {minuta.status === 'concluida' ? (
                          <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-green-500 bg-green-500/10 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Concluída
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-yellow-500 bg-yellow-500/10 rounded-full">
                            <Clock className="w-3 h-3" />
                            Rascunho
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center text-muted-foreground text-sm"
        >
          <p>Sistema de Minutas v2.0</p>
        </motion.footer>
      </motion.div>
    </main>
  );
}
