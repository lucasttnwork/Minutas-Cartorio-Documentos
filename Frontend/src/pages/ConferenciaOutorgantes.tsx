// src/pages/ConferenciaOutorgantes.tsx
import { AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { EntityCard } from "@/components/layout/EntityCard";
import { EditableField } from "@/components/forms/EditableField";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { useMinuta } from "@/contexts/MinutaContext";
import { User, Building2, Plus } from "lucide-react";
import type { Endereco, Contato } from "@/types/minuta";
import { createEmptyPessoaNatural, createEmptyPessoaJuridica } from "@/utils/factories";
import { validatePessoaNatural, validatePessoaJuridica } from "@/schemas/minuta.schemas";
import { toast } from "sonner";

export default function ConferenciaOutorgantes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    currentMinuta,
    isSaving,
    addPessoaNaturalOutorgante,
    updatePessoaNaturalOutorgante,
    removePessoaNaturalOutorgante,
    addPessoaJuridicaOutorgante,
    updatePessoaJuridicaOutorgante,
    removePessoaJuridicaOutorgante,
  } = useMinuta();

  const pessoasNaturais = currentMinuta?.outorgantes.pessoasNaturais || [];
  const pessoasJuridicas = currentMinuta?.outorgantes.pessoasJuridicas || [];

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
      navigate(`/minuta/${id}/outorgados`);
    }
  };

  const handleAddPessoaNatural = () => {
    addPessoaNaturalOutorgante(createEmptyPessoaNatural());
  };

  const handleAddPessoaJuridica = () => {
    addPessoaJuridicaOutorgante(createEmptyPessoaJuridica());
  };

  const handleUpdatePessoaNatural = (pessoaId: string, field: string, value: string) => {
    const pessoa = pessoasNaturais.find(p => p.id === pessoaId);
    if (!pessoa) return;

    if (field.startsWith('domicilio.')) {
      const subField = field.replace('domicilio.', '') as keyof Endereco;
      updatePessoaNaturalOutorgante(pessoaId, {
        domicilio: { ...pessoa.domicilio, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('contato.')) {
      const subField = field.replace('contato.', '') as keyof Contato;
      updatePessoaNaturalOutorgante(pessoaId, {
        contato: { ...pessoa.contato, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else {
      updatePessoaNaturalOutorgante(pessoaId, {
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
      updatePessoaJuridicaOutorgante(pessoaId, {
        endereco: { ...pessoa.endereco, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else if (field.startsWith('contato.')) {
      const subField = field.replace('contato.', '') as keyof Contato;
      updatePessoaJuridicaOutorgante(pessoaId, {
        contato: { ...pessoa.contato, [subField]: value },
        camposEditados: [...new Set([...pessoa.camposEditados, field])],
      });
    } else {
      updatePessoaJuridicaOutorgante(pessoaId, {
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
          subtitle="(POLO OUTORGANTE)"
          instruction="Confira todos os dados e preencha os campos faltantes."
        />

        <div className="mb-8 bg-card rounded-xl p-4 border border-border">
          <FlowStepper currentStep="outorgantes" />
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
                  onRemove={() => removePessoaNaturalOutorgante(pessoa.id)}
                  defaultOpen={index === 0}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <EditableField label="Nome Completo" value={pessoa.nome} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'nome', v)} wasEditedByUser={pessoa.camposEditados.includes('nome')} />
                    <EditableField label="CPF" value={pessoa.cpf} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'cpf', v)} wasEditedByUser={pessoa.camposEditados.includes('cpf')} />
                    <EditableField label="RG" value={pessoa.rg} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'rg', v)} wasEditedByUser={pessoa.camposEditados.includes('rg')} />
                    <EditableField label="Orgao Emissor" value={pessoa.orgaoEmissorRg} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'orgaoEmissorRg', v)} wasEditedByUser={pessoa.camposEditados.includes('orgaoEmissorRg')} />
                    <EditableField label="Estado Emissor" value={pessoa.estadoEmissorRg} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'estadoEmissorRg', v)} wasEditedByUser={pessoa.camposEditados.includes('estadoEmissorRg')} />
                    <EditableField label="Data Emissao RG" value={pessoa.dataEmissaoRg} type="date" onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'dataEmissaoRg', v)} wasEditedByUser={pessoa.camposEditados.includes('dataEmissaoRg')} />
                    <EditableField label="Nacionalidade" value={pessoa.nacionalidade} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'nacionalidade', v)} wasEditedByUser={pessoa.camposEditados.includes('nacionalidade')} />
                    <EditableField label="Profissao" value={pessoa.profissao} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'profissao', v)} wasEditedByUser={pessoa.camposEditados.includes('profissao')} />
                    <EditableField label="Data Nascimento" value={pessoa.dataNascimento} type="date" onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'dataNascimento', v)} wasEditedByUser={pessoa.camposEditados.includes('dataNascimento')} />
                    <EditableField label="Estado Civil" value={pessoa.estadoCivil} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'estadoCivil', v)} wasEditedByUser={pessoa.camposEditados.includes('estadoCivil')} />
                    <EditableField label="Regime de Bens" value={pessoa.regimeBens} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'regimeBens', v)} wasEditedByUser={pessoa.camposEditados.includes('regimeBens')} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Domicilio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <EditableField label="Logradouro" value={pessoa.domicilio.logradouro} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'domicilio.logradouro', v)} wasEditedByUser={pessoa.camposEditados.includes('domicilio.logradouro')} />
                      <EditableField label="Numero" value={pessoa.domicilio.numero} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'domicilio.numero', v)} wasEditedByUser={pessoa.camposEditados.includes('domicilio.numero')} />
                      <EditableField label="Complemento" value={pessoa.domicilio.complemento} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'domicilio.complemento', v)} wasEditedByUser={pessoa.camposEditados.includes('domicilio.complemento')} />
                      <EditableField label="Bairro" value={pessoa.domicilio.bairro} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'domicilio.bairro', v)} wasEditedByUser={pessoa.camposEditados.includes('domicilio.bairro')} />
                      <EditableField label="Cidade" value={pessoa.domicilio.cidade} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'domicilio.cidade', v)} wasEditedByUser={pessoa.camposEditados.includes('domicilio.cidade')} />
                      <EditableField label="Estado" value={pessoa.domicilio.estado} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'domicilio.estado', v)} wasEditedByUser={pessoa.camposEditados.includes('domicilio.estado')} />
                      <EditableField label="CEP" value={pessoa.domicilio.cep} onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'domicilio.cep', v)} wasEditedByUser={pessoa.camposEditados.includes('domicilio.cep')} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Contato</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EditableField label="Email" value={pessoa.contato.email} type="email" onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'contato.email', v)} wasEditedByUser={pessoa.camposEditados.includes('contato.email')} />
                      <EditableField label="Telefone" value={pessoa.contato.telefone} type="tel" onChange={(v) => handleUpdatePessoaNatural(pessoa.id, 'contato.telefone', v)} wasEditedByUser={pessoa.camposEditados.includes('contato.telefone')} />
                    </div>
                  </div>
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
                  onRemove={() => removePessoaJuridicaOutorgante(pessoa.id)}
                  defaultOpen={index === 0}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <EditableField label="Razao Social" value={pessoa.razaoSocial} onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'razaoSocial', v)} wasEditedByUser={pessoa.camposEditados.includes('razaoSocial')} />
                    <EditableField label="CNPJ" value={pessoa.cnpj} onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'cnpj', v)} wasEditedByUser={pessoa.camposEditados.includes('cnpj')} />
                    <EditableField label="Inscricao Estadual" value={pessoa.inscricaoEstadual} onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'inscricaoEstadual', v)} wasEditedByUser={pessoa.camposEditados.includes('inscricaoEstadual')} />
                    <EditableField label="Data Constituicao" value={pessoa.dataConstituicao} type="date" onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'dataConstituicao', v)} wasEditedByUser={pessoa.camposEditados.includes('dataConstituicao')} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Endereco</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <EditableField label="Logradouro" value={pessoa.endereco.logradouro} onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'endereco.logradouro', v)} wasEditedByUser={pessoa.camposEditados.includes('endereco.logradouro')} />
                      <EditableField label="Numero" value={pessoa.endereco.numero} onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'endereco.numero', v)} wasEditedByUser={pessoa.camposEditados.includes('endereco.numero')} />
                      <EditableField label="Complemento" value={pessoa.endereco.complemento} onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'endereco.complemento', v)} wasEditedByUser={pessoa.camposEditados.includes('endereco.complemento')} />
                      <EditableField label="Bairro" value={pessoa.endereco.bairro} onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'endereco.bairro', v)} wasEditedByUser={pessoa.camposEditados.includes('endereco.bairro')} />
                      <EditableField label="Cidade" value={pessoa.endereco.cidade} onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'endereco.cidade', v)} wasEditedByUser={pessoa.camposEditados.includes('endereco.cidade')} />
                      <EditableField label="Estado" value={pessoa.endereco.estado} onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'endereco.estado', v)} wasEditedByUser={pessoa.camposEditados.includes('endereco.estado')} />
                      <EditableField label="CEP" value={pessoa.endereco.cep} onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'endereco.cep', v)} wasEditedByUser={pessoa.camposEditados.includes('endereco.cep')} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Contato</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EditableField label="Email" value={pessoa.contato.email} type="email" onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'contato.email', v)} wasEditedByUser={pessoa.camposEditados.includes('contato.email')} />
                      <EditableField label="Telefone" value={pessoa.contato.telefone} type="tel" onChange={(v) => handleUpdatePessoaJuridica(pessoa.id, 'contato.telefone', v)} wasEditedByUser={pessoa.camposEditados.includes('contato.telefone')} />
                    </div>
                  </div>
                </EntityCard>
              ))}
            </AnimatePresence>
            {pessoasJuridicas.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma pessoa juridica cadastrada. Clique em "Adicionar" para comecar.</p>
            )}
          </div>
        </SectionCard>

        <FlowNavigation currentStep="outorgantes" onNext={handleNext} isSaving={isSaving} />
      </div>
    </main>
  );
}
