// src/pages/ConferenciaNegocio.tsx
import { useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { EntityCard } from "@/components/layout/EntityCard";
import { EditableField } from "@/components/forms/EditableField";
import { SectionCard } from "@/components/layout/SectionCard";
import { useMinuta } from "@/contexts/MinutaContext";
import { Briefcase, Home } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ConferenciaNegocio() {
  useParams(); // Route param available for future use
  const { currentMinuta, isSaving, updateNegocioJuridico, updateMinuta } = useMinuta();

  const imoveis = useMemo(() => currentMinuta?.imoveis || [], [currentMinuta?.imoveis]);
  const negocios = useMemo(() => currentMinuta?.negociosJuridicos || [], [currentMinuta?.negociosJuridicos]);

  // Ensure each imovel has a corresponding negocio
  useEffect(() => {
    if (!currentMinuta || imoveis.length === 0) return;

    const existingImovelIds = negocios.map(n => n.imovelId);
    const newNegocios = imoveis
      .filter(i => !existingImovelIds.includes(i.id))
      .map(imovel => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imovelId: imovel.id,
        tipoAto: '',
        valorNegocio: '',
        formaPagamento: '',
        condicoesEspeciais: '',
        clausulasAdicionais: '',
        camposEditados: [] as string[],
      }));

    if (newNegocios.length > 0) {
      updateMinuta({
        negociosJuridicos: [...negocios, ...newNegocios],
      });
    }
  }, [currentMinuta, imoveis, negocios, updateMinuta]);

  const handleUpdate = (negocioId: string, field: string, value: string) => {
    const negocio = negocios.find(n => n.id === negocioId);
    if (!negocio) return;

    updateNegocioJuridico(negocioId, {
      [field]: value,
      camposEditados: [...new Set([...negocio.camposEditados, field])],
    });
  };

  const getImovelName = (imovelId: string) => {
    const imovel = imoveis.find(i => i.id === imovelId);
    return imovel?.descricao.denominacao || imovel?.matricula.numeroMatricula || 'Imovel';
  };

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="NEGOCIO JURIDICO"
          instruction="Defina os termos da transacao para cada imovel."
        />

        <div className="mb-8 bg-card rounded-xl p-4 border border-border">
          <FlowStepper currentStep="negocio" />
        </div>

        <SectionCard
          title={
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-500" />
              <span>Detalhes do Negocio ({negocios.length})</span>
            </div>
          }
        >
          <div className="space-y-6">
            <AnimatePresence>
              {negocios.map((negocio, index) => (
                <EntityCard
                  key={negocio.id}
                  title={`Negocio - ${getImovelName(negocio.imovelId)}`}
                  subtitle={negocio.tipoAto || 'Tipo de ato nao definido'}
                  icon={<Home className="w-4 h-4" />}
                  isComplete={!!(negocio.tipoAto && negocio.valorNegocio)}
                  defaultOpen={index === 0}
                >
                  <div className="space-y-6">
                    {/* Dados Principais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <EditableField
                        label="Tipo de Ato"
                        value={negocio.tipoAto}
                        onChange={(v) => handleUpdate(negocio.id, 'tipoAto', v)}
                        wasEditedByUser={negocio.camposEditados.includes('tipoAto')}
                        placeholder="Ex: Compra e Venda, Doacao, Permuta"
                      />
                      <EditableField
                        label="Valor do Negocio (R$)"
                        value={negocio.valorNegocio}
                        onChange={(v) => handleUpdate(negocio.id, 'valorNegocio', v)}
                        wasEditedByUser={negocio.camposEditados.includes('valorNegocio')}
                        placeholder="Ex: 500.000,00"
                      />
                      <EditableField
                        label="Forma de Pagamento"
                        value={negocio.formaPagamento}
                        onChange={(v) => handleUpdate(negocio.id, 'formaPagamento', v)}
                        wasEditedByUser={negocio.camposEditados.includes('formaPagamento')}
                        placeholder="Ex: A vista, Financiamento"
                      />
                    </div>

                    {/* Condicoes Especiais */}
                    <div className="pt-4 border-t border-border">
                      <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                        Condicoes Especiais
                      </Label>
                      <Textarea
                        value={negocio.condicoesEspeciais}
                        onChange={(e) => handleUpdate(negocio.id, 'condicoesEspeciais', e.target.value)}
                        placeholder="Descreva condicoes especiais do negocio..."
                        className="min-h-[100px]"
                      />
                    </div>

                    {/* Clausulas Adicionais */}
                    <div className="pt-4 border-t border-border">
                      <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                        Clausulas Adicionais
                      </Label>
                      <Textarea
                        value={negocio.clausulasAdicionais}
                        onChange={(e) => handleUpdate(negocio.id, 'clausulasAdicionais', e.target.value)}
                        placeholder="Insira clausulas adicionais que devem constar na minuta..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </EntityCard>
              ))}
            </AnimatePresence>

            {negocios.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum imovel cadastrado.</p>
                <p className="text-sm mt-1">Adicione imoveis na etapa anterior para definir os negocios.</p>
              </div>
            )}
          </div>
        </SectionCard>

        <FlowNavigation currentStep="negocio" isSaving={isSaving} />
      </div>
    </main>
  );
}
