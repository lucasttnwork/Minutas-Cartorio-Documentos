// src/pages/ConferenciaOutorgados.tsx
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { useMinuta } from "@/contexts/MinutaContext";

export default function ConferenciaOutorgados() {
  const { id } = useParams();
  const { currentMinuta, isSaving } = useMinuta();

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="CONFERÊNCIA E COMPLEMENTAÇÃO"
          subtitle="(POLO OUTORGADO)"
          instruction="Confira todos os dados e preencha os campos faltantes."
        />

        <div className="mb-8 bg-card rounded-xl p-4 border border-border">
          <FlowStepper currentStep="outorgados" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 text-muted-foreground"
        >
          <p>Página de Conferência de Outorgados</p>
          <p className="text-sm mt-2">Em desenvolvimento...</p>
        </motion.div>

        <FlowNavigation currentStep="outorgados" isSaving={isSaving} />
      </div>
    </main>
  );
}
