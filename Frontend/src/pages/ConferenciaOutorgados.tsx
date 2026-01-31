// src/pages/ConferenciaOutorgados.tsx
import { AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { EntityCard } from "@/components/layout/EntityCard";
import { PessoaNaturalForm } from "@/components/forms/pessoa/PessoaNaturalForm";
import { PessoaJuridicaForm } from "@/components/forms/pessoa/PessoaJuridicaForm";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { useMinuta } from "@/contexts/MinutaContext";
import { User, Building2, Plus } from "lucide-react";
import type { Endereco, Contato, DadosFamiliares, CertidaoCNDT, CertidaoUniao, RegistroVigente, CertidaoEmpresa } from "@/types/minuta";
import { createEmptyPessoaNatural, createEmptyPessoaJuridica, createEmptyRepresentanteAdministrador, createEmptyRepresentanteProcurador } from "@/utils/factories";
import { validatePessoaNatural, validatePessoaJuridica } from "@/schemas/minuta.schemas";
import { toast } from "sonner";

export default function ConferenciaOutorgados() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    currentMinuta,
    isSaving,
    addPessoaNaturalOutorgado,
    updatePessoaNaturalOutorgado,
    removePessoaNaturalOutorgado,
    addPessoaJuridicaOutorgado,
    updatePessoaJuridicaOutorgado,
    removePessoaJuridicaOutorgado,
    addAdministradorOutorgado,
    updateAdministradorOutorgado,
    removeAdministradorOutorgado,
    addProcuradorOutorgado,
    updateProcuradorOutorgado,
    removeProcuradorOutorgado,
  } = useMinuta();

  const pessoasNaturais = currentMinuta?.outorgados.pessoasNaturais || [];
  const pessoasJuridicas = currentMinuta?.outorgados.pessoasJuridicas || [];

  const validateAllData = (): boolean => {
    const errors: string[] = [];

    // Validate each pessoa natural
    pessoasNaturais.forEach((pessoa, index) => {
      const result = validatePessoaNatural(pessoa);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          // Only show errors for fields that have values (not empty/required errors)
          if (issue.message) {
            errors.push(`Pessoa ${index + 1}: ${issue.message}`);
          }
        });
      }
    });

    // Validate each pessoa juridica
    pessoasJuridicas.forEach((empresa, index) => {
      const result = validatePessoaJuridica(empresa);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          if (issue.message) {
            errors.push(`Empresa ${index + 1}: ${issue.message}`);
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
      navigate(`/minuta/${id}/imoveis`);
    }
  };

  const handleAddPessoaNatural = () => {
    addPessoaNaturalOutorgado(createEmptyPessoaNatural());
  };

  const handleAddPessoaJuridica = () => {
    addPessoaJuridicaOutorgado(createEmptyPessoaJuridica());
  };

  const handleUpdatePessoaNatural = (pessoaId: string, field: string, value: string | boolean) => {
    const pessoa = pessoasNaturais.find(p => p.id === pessoaId);
    if (!pessoa) return;

    if (field.startsWith('domicilio.')) {
      const subField = field.replace('domicilio.', '') as keyof Endereco;
      updatePessoaNaturalOutorgado(pessoaId, {
        domicilio: { ...pessoa.domicilio, [subField]: value as string },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('contato.')) {
      const subField = field.replace('contato.', '') as keyof Contato;
      updatePessoaNaturalOutorgado(pessoaId, {
        contato: { ...pessoa.contato, [subField]: value as string },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('dadosFamiliares.')) {
      const subField = field.replace('dadosFamiliares.', '') as keyof DadosFamiliares;
      updatePessoaNaturalOutorgado(pessoaId, {
        dadosFamiliares: { ...pessoa.dadosFamiliares, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('cndt.')) {
      const subField = field.replace('cndt.', '') as keyof CertidaoCNDT;
      updatePessoaNaturalOutorgado(pessoaId, {
        cndt: { ...pessoa.cndt, [subField]: value as string },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('certidaoUniao.')) {
      const subField = field.replace('certidaoUniao.', '') as keyof CertidaoUniao;
      updatePessoaNaturalOutorgado(pessoaId, {
        certidaoUniao: { ...pessoa.certidaoUniao, [subField]: value as string },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else {
      updatePessoaNaturalOutorgado(pessoaId, {
        [field]: value,
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    }
  };

  const handleUpdatePessoaJuridica = (pessoaId: string, field: string, value: string) => {
    const pessoa = pessoasJuridicas.find(p => p.id === pessoaId);
    if (!pessoa) return;

    if (field.startsWith('endereco.')) {
      const subField = field.replace('endereco.', '') as keyof Endereco;
      updatePessoaJuridicaOutorgado(pessoaId, {
        endereco: { ...pessoa.endereco, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('contato.')) {
      const subField = field.replace('contato.', '') as keyof Contato;
      updatePessoaJuridicaOutorgado(pessoaId, {
        contato: { ...pessoa.contato, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('registroVigente.')) {
      const subField = field.replace('registroVigente.', '') as keyof RegistroVigente;
      updatePessoaJuridicaOutorgado(pessoaId, {
        registroVigente: { ...pessoa.registroVigente, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('certidaoEmpresa.')) {
      const subField = field.replace('certidaoEmpresa.', '') as keyof CertidaoEmpresa;
      updatePessoaJuridicaOutorgado(pessoaId, {
        certidaoEmpresa: { ...pessoa.certidaoEmpresa, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('cndt.')) {
      const subField = field.replace('cndt.', '') as keyof CertidaoCNDT;
      updatePessoaJuridicaOutorgado(pessoaId, {
        cndt: { ...pessoa.cndt, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('certidaoUniao.')) {
      const subField = field.replace('certidaoUniao.', '') as keyof CertidaoUniao;
      updatePessoaJuridicaOutorgado(pessoaId, {
        certidaoUniao: { ...pessoa.certidaoUniao, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else {
      updatePessoaJuridicaOutorgado(pessoaId, {
        [field]: value,
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="CONFERENCIA E COMPLEMENTACAO"
          subtitle="(POLO OUTORGADO)"
          instruction="Confira todos os dados e preencha os campos faltantes."
        />

        <div className="mb-8 bg-card rounded-xl p-4 border border-border">
          <FlowStepper currentStep="outorgados" />
        </div>

        {/* Pessoas Naturais */}
        <SectionCard
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                <span>Pessoas Fisicas ({pessoasNaturais.length})</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddPessoaNatural}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>
          }
          className="mb-6"
        >
          <div className="space-y-4">
            <AnimatePresence>
              {pessoasNaturais.map((pessoa, index) => (
                <EntityCard
                  key={pessoa.id}
                  title={pessoa.nome || `Pessoa ${index + 1}`}
                  subtitle={pessoa.cpf || 'CPF nao informado'}
                  icon={<User className="w-4 h-4" />}
                  isComplete={!!(pessoa.nome && pessoa.cpf && pessoa.rg)}
                  onRemove={() => removePessoaNaturalOutorgado(pessoa.id)}
                  defaultOpen={index === 0}
                >
                  <PessoaNaturalForm
                    pessoa={pessoa}
                    onUpdate={(field, value) => handleUpdatePessoaNatural(pessoa.id, field, value)}
                    camposEditados={pessoa.camposEditados}
                  />
                </EntityCard>
              ))}
            </AnimatePresence>
            {pessoasNaturais.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma pessoa fisica cadastrada. Clique em "Adicionar" para comecar.</p>
            )}
          </div>
        </SectionCard>

        {/* Pessoas Juridicas */}
        <SectionCard
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-500" />
                <span>Pessoas Juridicas ({pessoasJuridicas.length})</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddPessoaJuridica}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <AnimatePresence>
              {pessoasJuridicas.map((pessoa, index) => (
                <EntityCard
                  key={pessoa.id}
                  title={pessoa.razaoSocial || `Empresa ${index + 1}`}
                  subtitle={pessoa.cnpj || 'CNPJ nao informado'}
                  icon={<Building2 className="w-4 h-4" />}
                  isComplete={!!(pessoa.razaoSocial && pessoa.cnpj)}
                  onRemove={() => removePessoaJuridicaOutorgado(pessoa.id)}
                  defaultOpen={index === 0}
                >
                  <PessoaJuridicaForm
                    pessoa={pessoa}
                    onUpdate={(field, value) => handleUpdatePessoaJuridica(pessoa.id, field, value)}
                    onAddAdministrador={() => addAdministradorOutorgado(pessoa.id, createEmptyRepresentanteAdministrador())}
                    onUpdateAdministrador={(adminId, field, value) => updateAdministradorOutorgado(pessoa.id, adminId, { [field]: value })}
                    onRemoveAdministrador={(adminId) => removeAdministradorOutorgado(pessoa.id, adminId)}
                    onAddProcurador={() => addProcuradorOutorgado(pessoa.id, createEmptyRepresentanteProcurador())}
                    onUpdateProcurador={(procId, field, value) => updateProcuradorOutorgado(pessoa.id, procId, { [field]: value })}
                    onRemoveProcurador={(procId) => removeProcuradorOutorgado(pessoa.id, procId)}
                    camposEditados={pessoa.camposEditados}
                  />
                </EntityCard>
              ))}
            </AnimatePresence>
            {pessoasJuridicas.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma pessoa juridica cadastrada. Clique em "Adicionar" para comecar.</p>
            )}
          </div>
        </SectionCard>

        <FlowNavigation currentStep="outorgados" onNext={handleNext} isSaving={isSaving} />
      </div>
    </main>
  );
}
