// src/pages/ConferenciaImoveis.tsx
import { AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { FlowStepper } from "@/components/layout/FlowStepper";
import { FlowNavigation } from "@/components/layout/FlowNavigation";
import { EntityCard } from "@/components/layout/EntityCard";
import { EditableField } from "@/components/forms/EditableField";
import { FormSection } from "@/components/forms/FormSection";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMinuta } from "@/contexts/MinutaContext";
import { Home, Plus, Eye } from "lucide-react";
import type { Imovel } from "@/types/minuta";
import { createEmptyImovel } from "@/utils/factories";
import { validateImovel } from "@/schemas/minuta.schemas";
import { toast } from "sonner";

export default function ConferenciaImoveis() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentMinuta, isSaving, addImovel, updateImovel, removeImovel } = useMinuta();

  const imoveis = currentMinuta?.imoveis || [];

  const validateAllData = (): boolean => {
    const errors: string[] = [];

    // Validate each imovel
    imoveis.forEach((imovel, index) => {
      const result = validateImovel(imovel);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          // Only show errors for fields that have values (not empty/required errors)
          if (issue.message) {
            errors.push(`Imovel ${index + 1}: ${issue.message}`);
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
      navigate(`/minuta/${id}/parecer`);
    }
  };

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
                  {/* 1. MATRICULA IMOBILIARIA */}
                  <FormSection title="MATRICULA IMOBILIARIA" columns={3}>
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
                  </FormSection>

                  {/* 2. DESCRICAO DO IMOVEL */}
                  <FormSection title="DESCRICAO DO IMOVEL" columns={3}>
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
                    <div className="col-span-full">
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Descricao Conforme Matricula
                      </Label>
                      <Textarea
                        value={imovel.descricao.descricaoConformeMatricula || ''}
                        onChange={(e) => handleUpdate(imovel.id, 'descricao.descricaoConformeMatricula', e.target.value)}
                        placeholder="Descricao completa do imovel conforme consta na matricula..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </FormSection>

                  {/* 3. CADASTRO IMOBILIARIO */}
                  <FormSection title="CADASTRO IMOBILIARIO" columns={2}>
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
                  </FormSection>

                  {/* 4. VALORES VENAIS */}
                  <FormSection
                    title="VALORES VENAIS"
                    columns={2}
                    action={{
                      label: "Atualizar",
                      onClick: () => toast.info("Funcionalidade de atualizacao de valores venais em desenvolvimento")
                    }}
                  >
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
                  </FormSection>

                  {/* 5. NEGATIVA DE IPTU */}
                  <FormSection
                    title="NEGATIVA DE IPTU"
                    columns={3}
                    action={{
                      label: "Atualizar",
                      onClick: () => toast.info("Funcionalidade de atualizacao de certidao IPTU em desenvolvimento")
                    }}
                  >
                    <EditableField
                      label="N Certidao"
                      value={imovel.negativaIPTU.numeroCertidao}
                      onChange={(v) => handleUpdate(imovel.id, 'negativaIPTU.numeroCertidao', v)}
                      wasEditedByUser={imovel.camposEditados.includes('negativaIPTU.numeroCertidao')}
                    />
                    <EditableField
                      label="Data Expedicao"
                      value={imovel.negativaIPTU.dataExpedicao}
                      type="date"
                      onChange={(v) => handleUpdate(imovel.id, 'negativaIPTU.dataExpedicao', v)}
                      wasEditedByUser={imovel.camposEditados.includes('negativaIPTU.dataExpedicao')}
                    />
                    <EditableField
                      label="Certidao Valida"
                      value={imovel.negativaIPTU.certidaoValida}
                      onChange={(v) => handleUpdate(imovel.id, 'negativaIPTU.certidaoValida', v)}
                      wasEditedByUser={imovel.camposEditados.includes('negativaIPTU.certidaoValida')}
                    />
                  </FormSection>

                  {/* 6. CERTIDAO DA MATRICULA */}
                  <FormSection title="CERTIDAO DA MATRICULA" columns={3}>
                    <EditableField
                      label="Certidao Matricula"
                      value={imovel.certidaoMatricula.certidaoMatricula}
                      onChange={(v) => handleUpdate(imovel.id, 'certidaoMatricula.certidaoMatricula', v)}
                      wasEditedByUser={imovel.camposEditados.includes('certidaoMatricula.certidaoMatricula')}
                    />
                    <EditableField
                      label="Data Expedicao"
                      value={imovel.certidaoMatricula.dataExpedicao}
                      type="date"
                      onChange={(v) => handleUpdate(imovel.id, 'certidaoMatricula.dataExpedicao', v)}
                      wasEditedByUser={imovel.camposEditados.includes('certidaoMatricula.dataExpedicao')}
                    />
                    <EditableField
                      label="Certidao Valida"
                      value={imovel.certidaoMatricula.certidaoValida || ''}
                      onChange={(v) => handleUpdate(imovel.id, 'certidaoMatricula.certidaoValida', v)}
                      wasEditedByUser={imovel.camposEditados.includes('certidaoMatricula.certidaoValida')}
                    />
                  </FormSection>

                  {/* 7. PROPRIETARIOS */}
                  <div className="pt-4 mt-4 border-t border-border/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold tracking-wider text-accent uppercase">
                        PROPRIETARIOS ({imovel.proprietarios?.length || 0})
                      </h4>
                    </div>
                    {imovel.proprietarios && imovel.proprietarios.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Nome</th>
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Fracao Ideal</th>
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Registro Aquisicao</th>
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Data Registro</th>
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Titulo</th>
                              <th className="text-right py-2 px-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {imovel.proprietarios.map((prop) => (
                              <tr key={prop.id} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="py-2 px-3">{prop.nome || '-'}</td>
                                <td className="py-2 px-3">{prop.fracaoIdeal || '-'}</td>
                                <td className="py-2 px-3">{prop.registroAquisicao || '-'}</td>
                                <td className="py-2 px-3">{prop.dataRegistroAquisicao || '-'}</td>
                                <td className="py-2 px-3">{prop.tituloAquisicao || '-'}</td>
                                <td className="py-2 px-3 text-right">
                                  <Button size="sm" variant="ghost" className="h-7">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Ver Dados
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Nenhum proprietario cadastrado.
                      </p>
                    )}
                  </div>

                  {/* 8. ONUS REGISTRADO(S) */}
                  <div className="pt-4 mt-4 border-t border-border/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold tracking-wider text-accent uppercase">
                        ONUS REGISTRADO(S) ({imovel.onus?.length || 0})
                      </h4>
                    </div>
                    {imovel.onus && imovel.onus.length > 0 ? (
                      <div className="space-y-3">
                        {imovel.onus.map((onus) => (
                          <div key={onus.id} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">{onus.tituloOnus || 'Onus sem titulo'}</span>
                              <span className="text-xs text-muted-foreground">
                                Registro: {onus.registroOnus || '-'} | Data: {onus.dataRegistroOnus || '-'}
                              </span>
                            </div>
                            {onus.descricaoConformeMatricula && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {onus.descricaoConformeMatricula}
                              </p>
                            )}
                            {onus.titulares && onus.titulares.length > 0 && (
                              <div className="mt-2 text-xs">
                                <span className="text-muted-foreground">Titulares: </span>
                                {onus.titulares.map((t, i) => (
                                  <span key={t.id}>
                                    {t.nome}{t.fracaoIdeal ? ` (${t.fracaoIdeal})` : ''}
                                    {i < onus.titulares.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Nenhum onus registrado.
                      </p>
                    )}
                  </div>

                  {/* 9. RESSALVAS NA CERTIFICACAO */}
                  <div className="pt-4 mt-4 border-t border-border/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold tracking-wider text-accent uppercase">
                        RESSALVAS NA CERTIFICACAO
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          Existe Ressalva
                        </Label>
                        <Select
                          value={imovel.ressalvas?.existeRessalva || ''}
                          onValueChange={(v) => handleUpdate(imovel.id, 'ressalvas.existeRessalva', v)}
                        >
                          <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Nao</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {imovel.ressalvas?.existeRessalva === 'sim' && (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Descricao da Ressalva
                          </Label>
                          <Textarea
                            value={imovel.ressalvas?.descricaoRessalva || ''}
                            onChange={(e) => handleUpdate(imovel.id, 'ressalvas.descricaoRessalva', e.target.value)}
                            placeholder="Descreva as ressalvas encontradas na certificacao..."
                            className="min-h-[100px]"
                          />
                        </div>
                      )}
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

        <FlowNavigation currentStep="imoveis" onNext={handleNext} isSaving={isSaving} />
      </div>
    </main>
  );
}
