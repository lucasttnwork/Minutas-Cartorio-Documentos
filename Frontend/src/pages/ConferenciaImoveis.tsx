// src/pages/ConferenciaImoveis.tsx
import { AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { EntityCard } from "@/components/layout/EntityCard";
import { EditableField } from "@/components/forms/EditableField";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { useMinuta } from "@/contexts/MinutaContext";
import { Home, Plus } from "lucide-react";
import type { Imovel } from "@/types/minuta";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyImovel(): Imovel {
  return {
    id: generateId(),
    matricula: {
      numeroMatricula: '',
      numeroRegistroImoveis: '',
      cidadeRegistroImoveis: '',
      estadoRegistroImoveis: '',
      numeroNacionalMatricula: '',
    },
    descricao: {
      denominacao: '',
      areaTotalM2: '',
      areaPrivativaM2: '',
      areaConstruida: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      },
      descricaoConformeMatricula: '',
    },
    cadastro: {
      cadastroMunicipalSQL: '',
      dataExpedicaoCertidao: '',
    },
    valoresVenais: {
      valorVenalIPTU: '',
      valorVenalReferenciaITBI: '',
    },
    negativaIPTU: {
      numeroCertidao: '',
      dataExpedicao: '',
      certidaoValida: '',
    },
    certidaoMatricula: {
      certidaoMatricula: '',
      dataExpedicao: '',
      certidaoValida: '',
    },
    proprietarios: [],
    onus: [],
    ressalvas: {
      existeRessalva: '',
      descricaoRessalva: '',
    },
    camposEditados: [],
  };
}

export default function ConferenciaImoveis() {
  useParams(); // Route param available for future use
  const { currentMinuta, isSaving, addImovel, updateImovel, removeImovel } = useMinuta();

  const imoveis = currentMinuta?.imoveis || [];

  const handleAddImovel = () => {
    addImovel(createEmptyImovel());
  };

  const handleUpdate = (imovelId: string, path: string, value: string) => {
    const imovel = imoveis.find(i => i.id === imovelId);
    if (!imovel) return;

    const parts = path.split('.');
    const updated: Record<string, unknown> = { ...imovel };
    let current: Record<string, unknown> = updated;

    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = { ...(current[parts[i]] as Record<string, unknown>) };
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
    (updated as { camposEditados: string[] }).camposEditados = [...new Set([...imovel.camposEditados, path])];

    updateImovel(imovelId, updated as Partial<Imovel>);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="CONFERENCIA DOS IMOVEIS"
          instruction="Confira os dados de cada imovel envolvido na transacao."
        />

        <div className="mb-8 bg-card rounded-xl p-4 border border-border">
          <FlowStepper currentStep="imoveis" />
        </div>

        <SectionCard
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-yellow-500" />
                <span>Imoveis ({imoveis.length})</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddImovel}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar Imovel
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <AnimatePresence>
              {imoveis.map((imovel, index) => (
                <EntityCard
                  key={imovel.id}
                  title={imovel.descricao.denominacao || `Imovel ${index + 1}`}
                  subtitle={imovel.matricula.numeroMatricula ? `Matricula: ${imovel.matricula.numeroMatricula}` : 'Matricula nao informada'}
                  icon={<Home className="w-4 h-4" />}
                  isComplete={!!(imovel.matricula.numeroMatricula && imovel.descricao.denominacao)}
                  onRemove={() => removeImovel(imovel.id)}
                  defaultOpen={index === 0}
                >
                  {/* Matricula */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">Dados da Matricula</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <EditableField
                        label="N Matricula"
                        value={imovel.matricula.numeroMatricula}
                        onChange={(v) => handleUpdate(imovel.id, 'matricula.numeroMatricula', v)}
                        wasEditedByUser={imovel.camposEditados.includes('matricula.numeroMatricula')}
                      />
                      <EditableField
                        label="N Registro de Imoveis"
                        value={imovel.matricula.numeroRegistroImoveis}
                        onChange={(v) => handleUpdate(imovel.id, 'matricula.numeroRegistroImoveis', v)}
                        wasEditedByUser={imovel.camposEditados.includes('matricula.numeroRegistroImoveis')}
                      />
                      <EditableField
                        label="Cidade RI"
                        value={imovel.matricula.cidadeRegistroImoveis}
                        onChange={(v) => handleUpdate(imovel.id, 'matricula.cidadeRegistroImoveis', v)}
                        wasEditedByUser={imovel.camposEditados.includes('matricula.cidadeRegistroImoveis')}
                      />
                      <EditableField
                        label="Estado RI"
                        value={imovel.matricula.estadoRegistroImoveis}
                        onChange={(v) => handleUpdate(imovel.id, 'matricula.estadoRegistroImoveis', v)}
                        wasEditedByUser={imovel.camposEditados.includes('matricula.estadoRegistroImoveis')}
                      />
                      <EditableField
                        label="N Nacional Matricula"
                        value={imovel.matricula.numeroNacionalMatricula}
                        onChange={(v) => handleUpdate(imovel.id, 'matricula.numeroNacionalMatricula', v)}
                        wasEditedByUser={imovel.camposEditados.includes('matricula.numeroNacionalMatricula')}
                      />
                    </div>
                  </div>

                  {/* Descricao */}
                  <div className="mb-6 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">Descricao do Imovel</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <EditableField
                        label="Denominacao"
                        value={imovel.descricao.denominacao}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.denominacao', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.denominacao')}
                      />
                      <EditableField
                        label="Area Total (m2)"
                        value={imovel.descricao.areaTotalM2}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.areaTotalM2', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.areaTotalM2')}
                      />
                      <EditableField
                        label="Area Privativa (m2)"
                        value={imovel.descricao.areaPrivativaM2}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.areaPrivativaM2', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.areaPrivativaM2')}
                      />
                      <EditableField
                        label="Area Construida"
                        value={imovel.descricao.areaConstruida}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.areaConstruida', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.areaConstruida')}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <EditableField
                        label="Logradouro"
                        value={imovel.descricao.endereco.logradouro}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.endereco.logradouro', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.endereco.logradouro')}
                      />
                      <EditableField
                        label="Numero"
                        value={imovel.descricao.endereco.numero}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.endereco.numero', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.endereco.numero')}
                      />
                      <EditableField
                        label="Complemento"
                        value={imovel.descricao.endereco.complemento}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.endereco.complemento', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.endereco.complemento')}
                      />
                      <EditableField
                        label="Bairro"
                        value={imovel.descricao.endereco.bairro}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.endereco.bairro', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.endereco.bairro')}
                      />
                      <EditableField
                        label="Cidade"
                        value={imovel.descricao.endereco.cidade}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.endereco.cidade', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.endereco.cidade')}
                      />
                      <EditableField
                        label="Estado"
                        value={imovel.descricao.endereco.estado}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.endereco.estado', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.endereco.estado')}
                      />
                      <EditableField
                        label="CEP"
                        value={imovel.descricao.endereco.cep}
                        onChange={(v) => handleUpdate(imovel.id, 'descricao.endereco.cep', v)}
                        wasEditedByUser={imovel.camposEditados.includes('descricao.endereco.cep')}
                      />
                    </div>
                  </div>

                  {/* Cadastro e Valores */}
                  <div className="mb-6 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">Cadastro e Valores</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <EditableField
                        label="Cadastro Municipal/SQL"
                        value={imovel.cadastro.cadastroMunicipalSQL}
                        onChange={(v) => handleUpdate(imovel.id, 'cadastro.cadastroMunicipalSQL', v)}
                        wasEditedByUser={imovel.camposEditados.includes('cadastro.cadastroMunicipalSQL')}
                      />
                      <EditableField
                        label="Data Expedicao Certidao"
                        value={imovel.cadastro.dataExpedicaoCertidao}
                        type="date"
                        onChange={(v) => handleUpdate(imovel.id, 'cadastro.dataExpedicaoCertidao', v)}
                        wasEditedByUser={imovel.camposEditados.includes('cadastro.dataExpedicaoCertidao')}
                      />
                      <EditableField
                        label="Valor Venal IPTU"
                        value={imovel.valoresVenais.valorVenalIPTU}
                        onChange={(v) => handleUpdate(imovel.id, 'valoresVenais.valorVenalIPTU', v)}
                        wasEditedByUser={imovel.camposEditados.includes('valoresVenais.valorVenalIPTU')}
                      />
                      <EditableField
                        label="Valor Referencia ITBI"
                        value={imovel.valoresVenais.valorVenalReferenciaITBI}
                        onChange={(v) => handleUpdate(imovel.id, 'valoresVenais.valorVenalReferenciaITBI', v)}
                        wasEditedByUser={imovel.camposEditados.includes('valoresVenais.valorVenalReferenciaITBI')}
                      />
                    </div>
                  </div>

                  {/* Certidoes */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">Certidoes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <EditableField
                        label="N Certidao IPTU"
                        value={imovel.negativaIPTU.numeroCertidao}
                        onChange={(v) => handleUpdate(imovel.id, 'negativaIPTU.numeroCertidao', v)}
                        wasEditedByUser={imovel.camposEditados.includes('negativaIPTU.numeroCertidao')}
                      />
                      <EditableField
                        label="Data Expedicao IPTU"
                        value={imovel.negativaIPTU.dataExpedicao}
                        type="date"
                        onChange={(v) => handleUpdate(imovel.id, 'negativaIPTU.dataExpedicao', v)}
                        wasEditedByUser={imovel.camposEditados.includes('negativaIPTU.dataExpedicao')}
                      />
                      <EditableField
                        label="Certidao Valida?"
                        value={imovel.negativaIPTU.certidaoValida}
                        onChange={(v) => handleUpdate(imovel.id, 'negativaIPTU.certidaoValida', v)}
                        wasEditedByUser={imovel.camposEditados.includes('negativaIPTU.certidaoValida')}
                      />
                      <EditableField
                        label="Certidao Matricula"
                        value={imovel.certidaoMatricula.certidaoMatricula}
                        onChange={(v) => handleUpdate(imovel.id, 'certidaoMatricula.certidaoMatricula', v)}
                        wasEditedByUser={imovel.camposEditados.includes('certidaoMatricula.certidaoMatricula')}
                      />
                      <EditableField
                        label="Data Expedicao Matricula"
                        value={imovel.certidaoMatricula.dataExpedicao}
                        type="date"
                        onChange={(v) => handleUpdate(imovel.id, 'certidaoMatricula.dataExpedicao', v)}
                        wasEditedByUser={imovel.camposEditados.includes('certidaoMatricula.dataExpedicao')}
                      />
                    </div>
                  </div>
                </EntityCard>
              ))}
            </AnimatePresence>
            {imoveis.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum imovel cadastrado. Clique em "Adicionar Imovel" para comecar.</p>
            )}
          </div>
        </SectionCard>

        <FlowNavigation currentStep="imoveis" isSaving={isSaving} />
      </div>
    </main>
  );
}
