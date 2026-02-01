// src/pages/ParecerJuridico.tsx
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { SectionCard } from "@/components/layout/SectionCard";
import { useMinuta } from "@/contexts/MinutaContext";
import { Scale, CheckCircle2, XCircle, AlertTriangle, FileText, AlertCircle } from "lucide-react";

export default function ParecerJuridico() {
  useParams(); // Route param available for future use
  const { currentMinuta, isSaving } = useMinuta();

  const parecer = currentMinuta?.parecer || {
    relatorioMatricula: '',
    matriculaApta: null,
    pontosAtencao: '',
  };

  const hasRelatorio = parecer.relatorioMatricula.length > 0;
  const hasPontosAtencao = parecer.pontosAtencao.length > 0;

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="PARECER JURÍDICO"
          instruction="Análise jurídica da matrícula e situação do imóvel."
        />

        <div className="mb-8 bg-card rounded-xl p-4 border border-border">
          <FlowStepper currentStep="parecer" />
        </div>

        <div className="space-y-6">
          {/* Status da Matrícula */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SectionCard
              title={
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-purple-500" />
                  <span>Status da Matrícula</span>
                </div>
              }
            >
              <div className="flex items-center justify-center py-8">
                {parecer.matriculaApta === true && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <span className="text-xl font-semibold text-green-500">Matrícula Apta</span>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      A matrícula do imóvel está regular e apta para a realização do ato notarial.
                    </p>
                  </div>
                )}
                {parecer.matriculaApta === false && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                      <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <span className="text-xl font-semibold text-red-500">Matrícula com Pendências</span>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Foram identificadas pendências que precisam ser resolvidas antes do ato.
                    </p>
                  </div>
                )}
                {parecer.matriculaApta === null && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-yellow-500" />
                    </div>
                    <span className="text-xl font-semibold text-yellow-500">Análise Pendente</span>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      O parecer jurídico ainda não foi gerado pela IA. Aguarde o processamento.
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>
          </motion.div>

          {/* Relatório da Matrícula */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SectionCard
              title={
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span>Relatório da Matrícula</span>
                </div>
              }
            >
              {hasRelatorio ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="p-4 bg-secondary/50 rounded-lg whitespace-pre-wrap font-mono text-sm">
                    {parecer.relatorioMatricula}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum relatório disponível.</p>
                  <p className="text-sm mt-1">O relatório será gerado automaticamente após o processamento dos documentos.</p>
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* Pontos de Atenção */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SectionCard
              title={
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span>Pontos de Atenção</span>
                </div>
              }
            >
              {hasPontosAtencao ? (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="whitespace-pre-wrap text-sm">
                    {parecer.pontosAtencao}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-30 text-green-500" />
                  <p>Nenhum ponto de atenção identificado.</p>
                  <p className="text-sm mt-1">A análise não identificou irregularidades ou pendências.</p>
                </div>
              )}
            </SectionCard>
          </motion.div>
        </div>

        <FlowNavigation currentStep="parecer" isSaving={isSaving} />
      </div>
    </main>
  );
}
