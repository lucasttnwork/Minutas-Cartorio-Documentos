import { FormSection } from '../FormSection';
import { EditableField } from '../EditableField';
import { RepresentanteCard } from './RepresentanteCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { PessoaJuridica } from '@/types/minuta';

interface PessoaJuridicaFormProps {
  pessoa: PessoaJuridica;
  onUpdate: (field: string, value: string) => void;
  onAddAdministrador: () => void;
  onUpdateAdministrador: (id: string, field: string, value: string) => void;
  onRemoveAdministrador: (id: string) => void;
  onAddProcurador: () => void;
  onUpdateProcurador: (id: string, field: string, value: string) => void;
  onRemoveProcurador: (id: string) => void;
  camposEditados: string[];
}

export function PessoaJuridicaForm({
  pessoa,
  onUpdate,
  onAddAdministrador,
  onUpdateAdministrador,
  onRemoveAdministrador,
  onAddProcurador,
  onUpdateProcurador,
  onRemoveProcurador,
  camposEditados,
}: PessoaJuridicaFormProps) {
  return (
    <div className="space-y-2">
      {/* QUALIFICAÇÃO */}
      <FormSection title="QUALIFICAÇÃO" columns={3}>
        <EditableField label="Denominação/Razão Social" value={pessoa.razaoSocial} onChange={(v) => onUpdate('razaoSocial', v)} wasEditedByUser={camposEditados.includes('razaoSocial')} className="col-span-2" />
        <EditableField label="CNPJ" value={pessoa.cnpj} onChange={(v) => onUpdate('cnpj', v)} wasEditedByUser={camposEditados.includes('cnpj')} />
        <EditableField label="NIRE" value={pessoa.nire} onChange={(v) => onUpdate('nire', v)} wasEditedByUser={camposEditados.includes('nire')} />
        <EditableField label="Inscrição Estadual" value={pessoa.inscricaoEstadual} onChange={(v) => onUpdate('inscricaoEstadual', v)} wasEditedByUser={camposEditados.includes('inscricaoEstadual')} />
        <EditableField label="Data Constituição" value={pessoa.dataConstituicao} type="date" onChange={(v) => onUpdate('dataConstituicao', v)} wasEditedByUser={camposEditados.includes('dataConstituicao')} />
      </FormSection>

      {/* SEDE */}
      <FormSection title="SEDE" columns={3}>
        <EditableField label="Logradouro" value={pessoa.endereco.logradouro} onChange={(v) => onUpdate('endereco.logradouro', v)} wasEditedByUser={camposEditados.includes('endereco.logradouro')} className="col-span-2" />
        <EditableField label="Número" value={pessoa.endereco.numero} onChange={(v) => onUpdate('endereco.numero', v)} wasEditedByUser={camposEditados.includes('endereco.numero')} />
        <EditableField label="Complemento" value={pessoa.endereco.complemento} onChange={(v) => onUpdate('endereco.complemento', v)} wasEditedByUser={camposEditados.includes('endereco.complemento')} />
        <EditableField label="Bairro" value={pessoa.endereco.bairro} onChange={(v) => onUpdate('endereco.bairro', v)} wasEditedByUser={camposEditados.includes('endereco.bairro')} />
        <EditableField label="Cidade" value={pessoa.endereco.cidade} onChange={(v) => onUpdate('endereco.cidade', v)} wasEditedByUser={camposEditados.includes('endereco.cidade')} />
        <EditableField label="Estado" value={pessoa.endereco.estado} onChange={(v) => onUpdate('endereco.estado', v)} wasEditedByUser={camposEditados.includes('endereco.estado')} />
        <EditableField label="CEP" value={pessoa.endereco.cep} onChange={(v) => onUpdate('endereco.cep', v)} wasEditedByUser={camposEditados.includes('endereco.cep')} />
      </FormSection>

      {/* REGISTRO VIGENTE */}
      <FormSection title="REGISTRO VIGENTE" columns={2}>
        <EditableField label="Instrumento Constitutivo" value={pessoa.registroVigente.instrumentoConstitutivo} onChange={(v) => onUpdate('registroVigente.instrumentoConstitutivo', v)} wasEditedByUser={camposEditados.includes('registroVigente.instrumentoConstitutivo')} />
        <EditableField label="Junta Comercial" value={pessoa.registroVigente.juntaComercial} onChange={(v) => onUpdate('registroVigente.juntaComercial', v)} wasEditedByUser={camposEditados.includes('registroVigente.juntaComercial')} />
        <EditableField label="Número Registro" value={pessoa.registroVigente.numeroRegistro} onChange={(v) => onUpdate('registroVigente.numeroRegistro', v)} wasEditedByUser={camposEditados.includes('registroVigente.numeroRegistro')} />
        <EditableField label="Data Sessão Registro" value={pessoa.registroVigente.dataSessaoRegistro} type="date" onChange={(v) => onUpdate('registroVigente.dataSessaoRegistro', v)} wasEditedByUser={camposEditados.includes('registroVigente.dataSessaoRegistro')} />
      </FormSection>

      {/* CERTIDÃO */}
      <FormSection title="CERTIDÃO" columns={2}>
        <EditableField label="Data Expedição Ficha Cadastral" value={pessoa.certidaoEmpresa.dataExpedicaoFichaCadastral} type="date" onChange={(v) => onUpdate('certidaoEmpresa.dataExpedicaoFichaCadastral', v)} wasEditedByUser={camposEditados.includes('certidaoEmpresa.dataExpedicaoFichaCadastral')} />
        <EditableField label="Data Expedição Certidão Registro" value={pessoa.certidaoEmpresa.dataExpedicaoCertidaoRegistro} type="date" onChange={(v) => onUpdate('certidaoEmpresa.dataExpedicaoCertidaoRegistro', v)} wasEditedByUser={camposEditados.includes('certidaoEmpresa.dataExpedicaoCertidaoRegistro')} />
      </FormSection>

      {/* REPRESENTAÇÃO POR ADMINISTRAÇÃO */}
      <FormSection title="REPRESENTAÇÃO POR ADMINISTRAÇÃO" columns={1}>
        <div className="col-span-full space-y-4">
          {pessoa.administradores.map((admin, index) => (
            <RepresentanteCard
              key={admin.id}
              representante={admin}
              tipo="administrador"
              index={index}
              onUpdate={(field, value) => onUpdateAdministrador(admin.id, field, value)}
              onRemove={() => onRemoveAdministrador(admin.id)}
              camposEditados={[]}
            />
          ))}
          <Button variant="outline" size="sm" onClick={onAddAdministrador} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Adicionar Administrador
          </Button>
        </div>
      </FormSection>

      {/* REPRESENTAÇÃO POR PROCURAÇÃO */}
      <FormSection title="REPRESENTAÇÃO POR PROCURAÇÃO" columns={1}>
        <div className="col-span-full space-y-4">
          {pessoa.procuradores.map((proc, index) => (
            <RepresentanteCard
              key={proc.id}
              representante={proc}
              tipo="procurador"
              index={index}
              onUpdate={(field, value) => onUpdateProcurador(proc.id, field, value)}
              onRemove={() => onRemoveProcurador(proc.id)}
              camposEditados={[]}
            />
          ))}
          <Button variant="outline" size="sm" onClick={onAddProcurador} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Adicionar Procurador
          </Button>
        </div>
      </FormSection>

      {/* CNDT */}
      <FormSection
        title="CNDT"
        columns={3}
        action={{ label: 'Atualizar', onClick: () => console.log('Atualizar CNDT') }}
      >
        <EditableField label="Número CNDT" value={pessoa.cndt.numeroCNDT} onChange={(v) => onUpdate('cndt.numeroCNDT', v)} wasEditedByUser={camposEditados.includes('cndt.numeroCNDT')} />
        <EditableField label="Data Expedição" value={pessoa.cndt.dataExpedicao} type="date" onChange={(v) => onUpdate('cndt.dataExpedicao', v)} wasEditedByUser={camposEditados.includes('cndt.dataExpedicao')} />
        <EditableField label="Hora Expedição" value={pessoa.cndt.horaExpedicao} onChange={(v) => onUpdate('cndt.horaExpedicao', v)} wasEditedByUser={camposEditados.includes('cndt.horaExpedicao')} />
      </FormSection>

      {/* CERTIDÃO DA UNIÃO */}
      <FormSection
        title="CERTIDÃO DA UNIÃO"
        columns={3}
        action={{ label: 'Atualizar', onClick: () => console.log('Atualizar Certidão União') }}
      >
        <EditableField label="Tipo Certidão" value={pessoa.certidaoUniao.tipoCertidao} onChange={(v) => onUpdate('certidaoUniao.tipoCertidao', v)} wasEditedByUser={camposEditados.includes('certidaoUniao.tipoCertidao')} />
        <EditableField label="Data Emissão" value={pessoa.certidaoUniao.dataEmissao} type="date" onChange={(v) => onUpdate('certidaoUniao.dataEmissao', v)} wasEditedByUser={camposEditados.includes('certidaoUniao.dataEmissao')} />
        <EditableField label="Hora Emissão" value={pessoa.certidaoUniao.horaEmissao} onChange={(v) => onUpdate('certidaoUniao.horaEmissao', v)} wasEditedByUser={camposEditados.includes('certidaoUniao.horaEmissao')} />
        <EditableField label="Validade" value={pessoa.certidaoUniao.validade} onChange={(v) => onUpdate('certidaoUniao.validade', v)} wasEditedByUser={camposEditados.includes('certidaoUniao.validade')} />
        <EditableField label="Código Controle" value={pessoa.certidaoUniao.codigoControle} onChange={(v) => onUpdate('certidaoUniao.codigoControle', v)} wasEditedByUser={camposEditados.includes('certidaoUniao.codigoControle')} />
      </FormSection>
    </div>
  );
}
