// src/pages/ConferenciaNegocio.tsx
import { useEffect, useMemo, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { EntityCard } from "@/components/layout/EntityCard";
import { SectionCard } from "@/components/layout/SectionCard";
import { NegocioJuridicoForm } from "@/components/forms/negocio/NegocioJuridicoForm";
import { useMinuta } from "@/contexts/MinutaContext";
import { Briefcase, Home } from "lucide-react";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { validateNegocioJuridico } from "@/schemas/minuta.schemas";
import { createEmptyNegocioJuridico, createEmptyParticipanteNegocio } from "@/utils/factories";
import { toast } from "sonner";
import type { NegocioJuridico } from "@/types/minuta";

export default function ConferenciaNegocio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentMinuta, isSaving, updateNegocioJuridico, updateMinuta } = useMinuta();

  const imoveis = useMemo(() => currentMinuta?.imoveis || [], [currentMinuta?.imoveis]);
  const negocios = useMemo(() => currentMinuta?.negociosJuridicos || [], [currentMinuta?.negociosJuridicos]);

  // Get all pessoas for participant lookup
  const pessoasNaturais = useMemo(() => [
    ...(currentMinuta?.outorgantes.pessoasNaturais || []),
    ...(currentMinuta?.outorgados.pessoasNaturais || []),
  ], [currentMinuta?.outorgantes, currentMinuta?.outorgados]);

  const pessoasJuridicas = useMemo(() => [
    ...(currentMinuta?.outorgantes.pessoasJuridicas || []),
    ...(currentMinuta?.outorgados.pessoasJuridicas || []),
  ], [currentMinuta?.outorgantes, currentMinuta?.outorgados]);

  // Ensure each imovel has a corresponding negocio
  useEffect(() => {
    if (!currentMinuta || imoveis.length === 0) return;

    const existingImovelIds = negocios.map(n => n.imovelId);
    const newNegocios = imoveis
      .filter(i => !existingImovelIds.includes(i.id))
      .map(imovel => ({
        ...createEmptyNegocioJuridico(),
        imovelId: imovel.id,
      }));

    if (newNegocios.length > 0) {
      updateMinuta({
        negociosJuridicos: [...negocios, ...newNegocios],
      });
    }
  }, [currentMinuta, imoveis, negocios, updateMinuta]);

  // Helper to set nested value by path (e.g., "formaPagamentoDetalhada.tipo")
  const setNestedValue = (obj: NegocioJuridico, path: string, value: unknown): Partial<NegocioJuridico> => {
    const parts = path.split('.');
    if (parts.length === 1) {
      return { [path]: value } as Partial<NegocioJuridico>;
    }

    // Deep clone the nested object structure
    const result = { ...obj };
    let current: Record<string, unknown> = result as unknown as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      current[key] = { ...(current[key] as Record<string, unknown>) };
      current = current[key] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;

    // Return only the top-level key that changed
    return { [parts[0]]: result[parts[0] as keyof NegocioJuridico] } as Partial<NegocioJuridico>;
  };

  const handleUpdate = useCallback((negocioId: string, field: string, value: string | boolean | Record<string, boolean>) => {
    const negocio = negocios.find(n => n.id === negocioId);
    if (!negocio) return;

    const updates = setNestedValue(negocio, field, value);

    updateNegocioJuridico(negocioId, {
      ...updates,
      camposEditados: [...new Set([...negocio.camposEditados, field])],
    });
  }, [negocios, updateNegocioJuridico]);

  // Alienante handlers
  const handleAddAlienante = useCallback((negocioId: string) => {
    const negocio = negocios.find(n => n.id === negocioId);
    if (!negocio) return;

    const newAlienante = createEmptyParticipanteNegocio();
    updateNegocioJuridico(negocioId, {
      alienantes: [...negocio.alienantes, newAlienante],
    });
  }, [negocios, updateNegocioJuridico]);

  const handleUpdateAlienante = useCallback((negocioId: string, alienanteId: string, field: string, value: string) => {
    const negocio = negocios.find(n => n.id === negocioId);
    if (!negocio) return;

    const updatedAlienantes = negocio.alienantes.map(a =>
      a.id === alienanteId ? { ...a, [field]: value } : a
    );

    updateNegocioJuridico(negocioId, {
      alienantes: updatedAlienantes,
    });
  }, [negocios, updateNegocioJuridico]);

  const handleRemoveAlienante = useCallback((negocioId: string, alienanteId: string) => {
    const negocio = negocios.find(n => n.id === negocioId);
    if (!negocio) return;

    updateNegocioJuridico(negocioId, {
      alienantes: negocio.alienantes.filter(a => a.id !== alienanteId),
    });
  }, [negocios, updateNegocioJuridico]);

  // Adquirente handlers
  const handleAddAdquirente = useCallback((negocioId: string) => {
    const negocio = negocios.find(n => n.id === negocioId);
    if (!negocio) return;

    const newAdquirente = createEmptyParticipanteNegocio();
    updateNegocioJuridico(negocioId, {
      adquirentes: [...negocio.adquirentes, newAdquirente],
    });
  }, [negocios, updateNegocioJuridico]);

  const handleUpdateAdquirente = useCallback((negocioId: string, adquirenteId: string, field: string, value: string) => {
    const negocio = negocios.find(n => n.id === negocioId);
    if (!negocio) return;

    const updatedAdquirentes = negocio.adquirentes.map(a =>
      a.id === adquirenteId ? { ...a, [field]: value } : a
    );

    updateNegocioJuridico(negocioId, {
      adquirentes: updatedAdquirentes,
    });
  }, [negocios, updateNegocioJuridico]);

  const handleRemoveAdquirente = useCallback((negocioId: string, adquirenteId: string) => {
    const negocio = negocios.find(n => n.id === negocioId);
    if (!negocio) return;

    updateNegocioJuridico(negocioId, {
      adquirentes: negocio.adquirentes.filter(a => a.id !== adquirenteId),
    });
  }, [negocios, updateNegocioJuridico]);

  // Consulta indisponibilidade handler
  const handleConsultarIndisponibilidade = useCallback((negocioId: string) => {
    const negocio = negocios.find(n => n.id === negocioId);
    if (!negocio) return;

    // Simulate API call - in production this would call an actual API
    toast.info("Realizando consulta de indisponibilidade...");

    // Update with mock response
    setTimeout(() => {
      updateNegocioJuridico(negocioId, {
        indisponibilidade: {
          consultaRealizada: true,
          dataConsulta: new Date().toLocaleDateString('pt-BR'),
          resultados: [], // Empty means no indisponibilidade found
        },
      });
      toast.success("Consulta realizada com sucesso!");
    }, 1500);
  }, [negocios, updateNegocioJuridico]);

  const getImovelName = (imovelId: string) => {
    const imovel = imoveis.find(i => i.id === imovelId);
    return imovel?.descricao.denominacao || imovel?.matricula.numeroMatricula || 'Imovel';
  };

  const validateAllData = (): boolean => {
    const errors: string[] = [];

    // Validate each negocio juridico
    negocios.forEach((negocio, index) => {
      const result = validateNegocioJuridico(negocio);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          // Only show errors for fields that have values (not empty/required errors)
          if (issue.message) {
            errors.push(`Negocio ${index + 1}: ${issue.message}`);
          }
        });
      }
    });

    if (errors.length > 0) {
      // Show first 3 errors max to not overwhelm user
      errors.slice(0, 3).forEach(error => {
        toast.error(error);
      });
      if (errors.length > 3) {
        toast.error(`E mais ${errors.length - 3} erro(s)...`);
      }
    }

    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateAllData()) {
      navigate(`/minuta/${id}/minuta`);
    }
  };

  return (
    <AnimatedBackground
      starCount={50}
      showGradient={true}
      className="min-h-screen"
    >
      <main className="p-4 md:p-8 pb-24">
        <div className="max-w-7xl mx-auto form-container-elevated">
          <PageHeader
            title="NEGOCIO JURIDICO"
            instruction="Defina os termos da transacao para cada imovel."
          />

          <div className="mb-8 bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border shadow-md">
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
                  accentColor="purple"
                >
                  <NegocioJuridicoForm
                    negocio={negocio}
                    imoveis={imoveis}
                    pessoasNaturais={pessoasNaturais}
                    pessoasJuridicas={pessoasJuridicas}
                    onUpdate={(field, value) => handleUpdate(negocio.id, field, value)}
                    onAddAlienante={() => handleAddAlienante(negocio.id)}
                    onUpdateAlienante={(alienanteId, field, value) => handleUpdateAlienante(negocio.id, alienanteId, field, value)}
                    onRemoveAlienante={(alienanteId) => handleRemoveAlienante(negocio.id, alienanteId)}
                    onAddAdquirente={() => handleAddAdquirente(negocio.id)}
                    onUpdateAdquirente={(adquirenteId, field, value) => handleUpdateAdquirente(negocio.id, adquirenteId, field, value)}
                    onRemoveAdquirente={(adquirenteId) => handleRemoveAdquirente(negocio.id, adquirenteId)}
                    onConsultarIndisponibilidade={() => handleConsultarIndisponibilidade(negocio.id)}
                  />
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

          <FlowNavigation currentStep="negocio" onNext={handleNext} isSaving={isSaving} />
        </div>
      </main>
    </AnimatedBackground>
  );
}
