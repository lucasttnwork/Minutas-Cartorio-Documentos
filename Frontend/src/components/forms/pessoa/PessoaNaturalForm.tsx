// src/components/forms/pessoa/PessoaNaturalForm.tsx
import { FormSection } from '../FormSection';
import { EditableField } from '../EditableField';
import type { PessoaNatural, FontesCampos } from '@/types/minuta';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PessoaNaturalFormProps {
  pessoa: PessoaNatural;
  onUpdate: (field: string, value: string | boolean) => void;
  camposEditados: string[];
}

/**
 * Helper to get fonte array for a field from the fontes object
 * The fontes object maps field names to arrays of source document names
 */
function getFonte(fontes: FontesCampos | undefined, field: string): string[] | undefined {
  if (!fontes) return undefined;
  return fontes[field];
}

export function PessoaNaturalForm({ pessoa, onUpdate, camposEditados }: PessoaNaturalFormProps) {
  const fontes = pessoa.fontes;

  return (
    <div className="space-y-2">
      {/* DADOS INDIVIDUAIS */}
      <FormSection title="DADOS INDIVIDUAIS" columns={3}>
        <EditableField label="Nome Completo" value={pessoa.nome} onChange={(v) => onUpdate('nome', v)} wasEditedByUser={camposEditados.includes('nome')} fonte={getFonte(fontes, 'nome')} />
        <EditableField label="CPF" value={pessoa.cpf} onChange={(v) => onUpdate('cpf', v)} wasEditedByUser={camposEditados.includes('cpf')} fonte={getFonte(fontes, 'cpf')} />
        <EditableField label="RG" value={pessoa.rg} onChange={(v) => onUpdate('rg', v)} wasEditedByUser={camposEditados.includes('rg')} fonte={getFonte(fontes, 'rg')} />
        <EditableField label="Orgao Emissor RG" value={pessoa.orgaoEmissorRg} onChange={(v) => onUpdate('orgaoEmissorRg', v)} wasEditedByUser={camposEditados.includes('orgaoEmissorRg')} fonte={getFonte(fontes, 'orgao_emissor_rg')} />
        <EditableField label="Estado Emissor RG" value={pessoa.estadoEmissorRg} onChange={(v) => onUpdate('estadoEmissorRg', v)} wasEditedByUser={camposEditados.includes('estadoEmissorRg')} fonte={getFonte(fontes, 'estado_emissor_rg')} />
        <EditableField label="Data Emissao RG" value={pessoa.dataEmissaoRg} type="date" onChange={(v) => onUpdate('dataEmissaoRg', v)} wasEditedByUser={camposEditados.includes('dataEmissaoRg')} fonte={getFonte(fontes, 'data_emissao_rg')} />
        <EditableField label="Nacionalidade" value={pessoa.nacionalidade} onChange={(v) => onUpdate('nacionalidade', v)} wasEditedByUser={camposEditados.includes('nacionalidade')} fonte={getFonte(fontes, 'nacionalidade')} />
        <EditableField label="Profissao" value={pessoa.profissao} onChange={(v) => onUpdate('profissao', v)} wasEditedByUser={camposEditados.includes('profissao')} fonte={getFonte(fontes, 'profissao')} />
        <EditableField label="Data Nascimento" value={pessoa.dataNascimento} type="date" onChange={(v) => onUpdate('dataNascimento', v)} wasEditedByUser={camposEditados.includes('dataNascimento')} fonte={getFonte(fontes, 'data_nascimento')} />
        <EditableField label="Data Obito" value={pessoa.dataObito} type="date" onChange={(v) => onUpdate('dataObito', v)} wasEditedByUser={camposEditados.includes('dataObito')} fonte={getFonte(fontes, 'data_obito')} />
        <EditableField label="CNH" value={pessoa.cnh} onChange={(v) => onUpdate('cnh', v)} wasEditedByUser={camposEditados.includes('cnh')} fonte={getFonte(fontes, 'cnh')} />
        <EditableField label="Orgao Emissor CNH" value={pessoa.orgaoEmissorCnh} onChange={(v) => onUpdate('orgaoEmissorCnh', v)} wasEditedByUser={camposEditados.includes('orgaoEmissorCnh')} fonte={getFonte(fontes, 'orgao_emissor_cnh')} />
      </FormSection>

      {/* DADOS FAMILIARES */}
      <FormSection title="DADOS FAMILIARES" columns={3}>
        <EditableField label="Estado Civil" value={pessoa.dadosFamiliares.estadoCivil} onChange={(v) => onUpdate('dadosFamiliares.estadoCivil', v)} wasEditedByUser={camposEditados.includes('dadosFamiliares.estadoCivil')} fonte={getFonte(fontes, 'estado_civil')} />
        <EditableField label="Regime de Bens" value={pessoa.dadosFamiliares.regimeBens} onChange={(v) => onUpdate('dadosFamiliares.regimeBens', v)} wasEditedByUser={camposEditados.includes('dadosFamiliares.regimeBens')} fonte={getFonte(fontes, 'regime_bens')} />
        <EditableField label="Data Casamento" value={pessoa.dadosFamiliares.dataCasamento} type="date" onChange={(v) => onUpdate('dadosFamiliares.dataCasamento', v)} wasEditedByUser={camposEditados.includes('dadosFamiliares.dataCasamento')} />
        <EditableField label="Data Separacao" value={pessoa.dadosFamiliares.dataSeparacao} type="date" onChange={(v) => onUpdate('dadosFamiliares.dataSeparacao', v)} wasEditedByUser={camposEditados.includes('dadosFamiliares.dataSeparacao')} />
        <EditableField label="Data Divorcio" value={pessoa.dadosFamiliares.dataDivorcio} type="date" onChange={(v) => onUpdate('dadosFamiliares.dataDivorcio', v)} wasEditedByUser={camposEditados.includes('dadosFamiliares.dataDivorcio')} />
        <EditableField label="Data Falec. Conjuge" value={pessoa.dadosFamiliares.dataFalecimentoConjuge} type="date" onChange={(v) => onUpdate('dadosFamiliares.dataFalecimentoConjuge', v)} wasEditedByUser={camposEditados.includes('dadosFamiliares.dataFalecimentoConjuge')} />

        {/* Uniao Estavel section */}
        <div className="col-span-full flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
          <Switch
            id="uniaoEstavel"
            checked={pessoa.dadosFamiliares.uniaoEstavel}
            onCheckedChange={(checked: boolean) => onUpdate('dadosFamiliares.uniaoEstavel', checked)}
          />
          <Label htmlFor="uniaoEstavel" className="cursor-pointer">Uniao Estavel</Label>
        </div>

        {pessoa.dadosFamiliares.uniaoEstavel && (
          <>
            <EditableField label="Data Uniao Estavel" value={pessoa.dadosFamiliares.dataUniaoEstavel} type="date" onChange={(v) => onUpdate('dadosFamiliares.dataUniaoEstavel', v)} wasEditedByUser={camposEditados.includes('dadosFamiliares.dataUniaoEstavel')} />
            <EditableField label="Data Extincao Uniao" value={pessoa.dadosFamiliares.dataExtincaoUniaoEstavel} type="date" onChange={(v) => onUpdate('dadosFamiliares.dataExtincaoUniaoEstavel', v)} wasEditedByUser={camposEditados.includes('dadosFamiliares.dataExtincaoUniaoEstavel')} />
            <EditableField label="Regime de Bens Uniao" value={pessoa.dadosFamiliares.regimeBensUniao} onChange={(v) => onUpdate('dadosFamiliares.regimeBensUniao', v)} wasEditedByUser={camposEditados.includes('dadosFamiliares.regimeBensUniao')} />
          </>
        )}
      </FormSection>

      {/* DOMICILIO */}
      <FormSection title="DOMICILIO" columns={3}>
        <EditableField label="Logradouro" value={pessoa.domicilio.logradouro} onChange={(v) => onUpdate('domicilio.logradouro', v)} wasEditedByUser={camposEditados.includes('domicilio.logradouro')} className="col-span-2" />
        <EditableField label="Numero" value={pessoa.domicilio.numero} onChange={(v) => onUpdate('domicilio.numero', v)} wasEditedByUser={camposEditados.includes('domicilio.numero')} />
        <EditableField label="Complemento" value={pessoa.domicilio.complemento} onChange={(v) => onUpdate('domicilio.complemento', v)} wasEditedByUser={camposEditados.includes('domicilio.complemento')} />
        <EditableField label="Bairro" value={pessoa.domicilio.bairro} onChange={(v) => onUpdate('domicilio.bairro', v)} wasEditedByUser={camposEditados.includes('domicilio.bairro')} />
        <EditableField label="Cidade" value={pessoa.domicilio.cidade} onChange={(v) => onUpdate('domicilio.cidade', v)} wasEditedByUser={camposEditados.includes('domicilio.cidade')} />
        <EditableField label="Estado" value={pessoa.domicilio.estado} onChange={(v) => onUpdate('domicilio.estado', v)} wasEditedByUser={camposEditados.includes('domicilio.estado')} />
        <EditableField label="CEP" value={pessoa.domicilio.cep} onChange={(v) => onUpdate('domicilio.cep', v)} wasEditedByUser={camposEditados.includes('domicilio.cep')} />
      </FormSection>

      {/* CONTATOS */}
      <FormSection title="CONTATOS" columns={2}>
        <EditableField label="E-mail" value={pessoa.contato.email} type="email" onChange={(v) => onUpdate('contato.email', v)} wasEditedByUser={camposEditados.includes('contato.email')} />
        <EditableField label="Telefone" value={pessoa.contato.telefone} type="tel" onChange={(v) => onUpdate('contato.telefone', v)} wasEditedByUser={camposEditados.includes('contato.telefone')} />
      </FormSection>

      {/* CNDT */}
      <FormSection
        title="CNDT"
        columns={3}
        action={{ label: 'Atualizar', onClick: () => console.log('Atualizar CNDT') }}
      >
        <EditableField label="Numero CNDT" value={pessoa.cndt.numeroCNDT} onChange={(v) => onUpdate('cndt.numeroCNDT', v)} wasEditedByUser={camposEditados.includes('cndt.numeroCNDT')} fonte={getFonte(fontes, 'cndt')} />
        <EditableField label="Data Expedicao" value={pessoa.cndt.dataExpedicao} type="date" onChange={(v) => onUpdate('cndt.dataExpedicao', v)} wasEditedByUser={camposEditados.includes('cndt.dataExpedicao')} fonte={getFonte(fontes, 'cndt')} />
        <EditableField label="Hora Expedicao" value={pessoa.cndt.horaExpedicao} onChange={(v) => onUpdate('cndt.horaExpedicao', v)} wasEditedByUser={camposEditados.includes('cndt.horaExpedicao')} fonte={getFonte(fontes, 'cndt')} />
      </FormSection>

      {/* CERTIDAO DA UNIAO */}
      <FormSection
        title="CERTIDAO DA UNIAO"
        columns={3}
        action={{ label: 'Atualizar', onClick: () => console.log('Atualizar Certidao Uniao') }}
      >
        <EditableField label="Tipo Certidao" value={pessoa.certidaoUniao.tipoCertidao} onChange={(v) => onUpdate('certidaoUniao.tipoCertidao', v)} wasEditedByUser={camposEditados.includes('certidaoUniao.tipoCertidao')} />
        <EditableField label="Data Emissao" value={pessoa.certidaoUniao.dataEmissao} type="date" onChange={(v) => onUpdate('certidaoUniao.dataEmissao', v)} wasEditedByUser={camposEditados.includes('certidaoUniao.dataEmissao')} />
        <EditableField label="Hora Emissao" value={pessoa.certidaoUniao.horaEmissao} onChange={(v) => onUpdate('certidaoUniao.horaEmissao', v)} wasEditedByUser={camposEditados.includes('certidaoUniao.horaEmissao')} />
        <EditableField label="Validade" value={pessoa.certidaoUniao.validade} onChange={(v) => onUpdate('certidaoUniao.validade', v)} wasEditedByUser={camposEditados.includes('certidaoUniao.validade')} />
        <EditableField label="Codigo Controle" value={pessoa.certidaoUniao.codigoControle} onChange={(v) => onUpdate('certidaoUniao.codigoControle', v)} wasEditedByUser={camposEditados.includes('certidaoUniao.codigoControle')} />
      </FormSection>
    </div>
  );
}
