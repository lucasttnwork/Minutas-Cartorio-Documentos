import { EntityCard } from '@/components/layout/EntityCard';
import { FormSection } from '../FormSection';
import { EditableField } from '../EditableField';
import { User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RepresentanteAdministrador, RepresentanteProcurador } from '@/types/minuta';

interface RepresentanteCardProps {
  representante: RepresentanteAdministrador | RepresentanteProcurador;
  tipo: 'administrador' | 'procurador';
  index: number;
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
  onViewDetails?: () => void;
  camposEditados: string[];
}

export function RepresentanteCard({
  representante,
  tipo,
  index,
  onUpdate,
  onRemove,
  onViewDetails,
  camposEditados,
}: RepresentanteCardProps) {
  const isProcurador = tipo === 'procurador';
  const proc = representante as RepresentanteProcurador;

  return (
    <EntityCard
      title={representante.nome || `${tipo === 'administrador' ? 'Administrador' : 'Procurador'} ${index + 1}`}
      subtitle={representante.cpf || 'CPF não informado'}
      icon={<User className="w-4 h-4" />}
      isComplete={!!(representante.nome && representante.cpf)}
      onRemove={onRemove}
      defaultOpen={false}
      accentColor={tipo === 'administrador' ? 'blue' : 'purple'}
    >
      {/* DADOS PESSOAIS */}
      <FormSection title="DADOS PESSOAIS" columns={3}>
        <EditableField label="Nome Completo" value={representante.nome} onChange={(v) => onUpdate('nome', v)} wasEditedByUser={camposEditados.includes('nome')} />
        <EditableField label="CPF" value={representante.cpf} onChange={(v) => onUpdate('cpf', v)} wasEditedByUser={camposEditados.includes('cpf')} />
        <EditableField label="RG" value={representante.rg} onChange={(v) => onUpdate('rg', v)} wasEditedByUser={camposEditados.includes('rg')} />
        <EditableField label="Órgão Emissor RG" value={representante.orgaoEmissorRg} onChange={(v) => onUpdate('orgaoEmissorRg', v)} wasEditedByUser={camposEditados.includes('orgaoEmissorRg')} />
        <EditableField label="Estado Emissor RG" value={representante.estadoEmissorRg} onChange={(v) => onUpdate('estadoEmissorRg', v)} wasEditedByUser={camposEditados.includes('estadoEmissorRg')} />
        <EditableField label="Data Emissão RG" value={representante.dataEmissaoRg} type="date" onChange={(v) => onUpdate('dataEmissaoRg', v)} wasEditedByUser={camposEditados.includes('dataEmissaoRg')} />
        <EditableField label="Nacionalidade" value={representante.nacionalidade} onChange={(v) => onUpdate('nacionalidade', v)} wasEditedByUser={camposEditados.includes('nacionalidade')} />
        <EditableField label="Profissão" value={representante.profissao} onChange={(v) => onUpdate('profissao', v)} wasEditedByUser={camposEditados.includes('profissao')} />
      </FormSection>

      {/* DOMICÍLIO */}
      <FormSection title="DOMICÍLIO" columns={3}>
        <EditableField label="Logradouro" value={representante.domicilio.logradouro} onChange={(v) => onUpdate('domicilio.logradouro', v)} wasEditedByUser={camposEditados.includes('domicilio.logradouro')} className="col-span-2" />
        <EditableField label="Número" value={representante.domicilio.numero} onChange={(v) => onUpdate('domicilio.numero', v)} wasEditedByUser={camposEditados.includes('domicilio.numero')} />
        <EditableField label="Complemento" value={representante.domicilio.complemento} onChange={(v) => onUpdate('domicilio.complemento', v)} wasEditedByUser={camposEditados.includes('domicilio.complemento')} />
        <EditableField label="Bairro" value={representante.domicilio.bairro} onChange={(v) => onUpdate('domicilio.bairro', v)} wasEditedByUser={camposEditados.includes('domicilio.bairro')} />
        <EditableField label="Cidade" value={representante.domicilio.cidade} onChange={(v) => onUpdate('domicilio.cidade', v)} wasEditedByUser={camposEditados.includes('domicilio.cidade')} />
        <EditableField label="Estado" value={representante.domicilio.estado} onChange={(v) => onUpdate('domicilio.estado', v)} wasEditedByUser={camposEditados.includes('domicilio.estado')} />
        <EditableField label="CEP" value={representante.domicilio.cep} onChange={(v) => onUpdate('domicilio.cep', v)} wasEditedByUser={camposEditados.includes('domicilio.cep')} />
      </FormSection>

      {/* CONTATO */}
      <FormSection title="CONTATO" columns={2}>
        <EditableField label="E-mail" value={representante.contato.email} type="email" onChange={(v) => onUpdate('contato.email', v)} wasEditedByUser={camposEditados.includes('contato.email')} />
        <EditableField label="Telefone" value={representante.contato.telefone} type="tel" onChange={(v) => onUpdate('contato.telefone', v)} wasEditedByUser={camposEditados.includes('contato.telefone')} />
      </FormSection>

      {/* INSTRUMENTO - Admin or Procuração */}
      {!isProcurador ? (
        <FormSection title="INSTRUMENTO DE NOMEAÇÃO" columns={2}>
          <EditableField label="Instrumento" value={(representante as RepresentanteAdministrador).instrumentoNomeacao} onChange={(v) => onUpdate('instrumentoNomeacao', v)} wasEditedByUser={camposEditados.includes('instrumentoNomeacao')} />
          <EditableField label="Data Instrumento" value={(representante as RepresentanteAdministrador).dataInstrumento} type="date" onChange={(v) => onUpdate('dataInstrumento', v)} wasEditedByUser={camposEditados.includes('dataInstrumento')} />
          <EditableField label="Número Registro" value={(representante as RepresentanteAdministrador).numeroRegistro} onChange={(v) => onUpdate('numeroRegistro', v)} wasEditedByUser={camposEditados.includes('numeroRegistro')} />
          <EditableField label="Data Registro" value={(representante as RepresentanteAdministrador).dataRegistro} type="date" onChange={(v) => onUpdate('dataRegistro', v)} wasEditedByUser={camposEditados.includes('dataRegistro')} />
        </FormSection>
      ) : (
        <FormSection title="PROCURAÇÃO" columns={3}>
          <EditableField label="Livro" value={proc.livro} onChange={(v) => onUpdate('livro', v)} wasEditedByUser={camposEditados.includes('livro')} />
          <EditableField label="Folha" value={proc.folha} onChange={(v) => onUpdate('folha', v)} wasEditedByUser={camposEditados.includes('folha')} />
          <EditableField label="Tabelionato" value={proc.tabelionato} onChange={(v) => onUpdate('tabelionato', v)} wasEditedByUser={camposEditados.includes('tabelionato')} />
          <EditableField label="Cidade" value={proc.cidade} onChange={(v) => onUpdate('cidade', v)} wasEditedByUser={camposEditados.includes('cidade')} />
          <EditableField label="Estado" value={proc.estado} onChange={(v) => onUpdate('estado', v)} wasEditedByUser={camposEditados.includes('estado')} />
          <EditableField label="Data Procuração" value={proc.dataProcuracao} type="date" onChange={(v) => onUpdate('dataProcuracao', v)} wasEditedByUser={camposEditados.includes('dataProcuracao')} />
          <EditableField label="Validade" value={proc.validadeProcuracao} onChange={(v) => onUpdate('validadeProcuracao', v)} wasEditedByUser={camposEditados.includes('validadeProcuracao')} />
        </FormSection>
      )}

      {onViewDetails && (
        <div className="mt-4 flex justify-end">
          <Button size="sm" variant="outline" onClick={onViewDetails}>
            <Eye className="w-4 h-4 mr-1" /> Ver Dados Completos
          </Button>
        </div>
      )}
    </EntityCard>
  );
}
