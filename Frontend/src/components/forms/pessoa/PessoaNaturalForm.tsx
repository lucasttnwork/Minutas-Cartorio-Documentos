// src/components/forms/pessoa/PessoaNaturalForm.tsx
import { useMemo, useState, useEffect } from 'react';
import { FormSection } from '../FormSection';
import { EditableField } from '../EditableField';
import type { PessoaNatural } from '@/types/minuta';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PessoaNaturalFormProps {
  pessoa: PessoaNatural;
  onUpdate: (field: string, value: string | boolean) => void;
  camposEditados: string[];
}

// Valores possíveis de estado civil
const ESTADOS_CIVIS = [
  { value: 'Solteiro(a)', label: 'Solteiro(a)' },
  { value: 'Casado(a)', label: 'Casado(a)' },
  { value: 'Divorciado(a)', label: 'Divorciado(a)' },
  { value: 'Viúvo(a)', label: 'Viúvo(a)' },
  { value: 'União Estável', label: 'União Estável' },
];

// Valores possíveis de regime de bens
const REGIMES_BENS = [
  { value: 'Comunhão Parcial', label: 'Comunhão Parcial de Bens' },
  { value: 'Comunhão Universal', label: 'Comunhão Universal de Bens' },
  { value: 'Separação Total', label: 'Separação Total de Bens' },
  { value: 'Participação Final nos Aquestos', label: 'Participação Final nos Aquestos' },
];

/**
 * Determina quais campos de dados familiares devem ser visíveis
 * baseado no estado civil selecionado
 */
function getVisibilidadeCamposFamiliares(estadoCivil: string) {
  // Se vazio, mostra APENAS o campo de estado civil
  if (!estadoCivil) {
    return {
      regimeBens: false,
      dataCasamento: false,
      dataSeparacao: false,
      dataDivorcio: false,
      dataFalecimentoConjuge: false,
      uniaoEstavelToggle: false,
    };
  }

  switch (estadoCivil) {
    case 'Solteiro(a)':
      // Solteiro: não mostra campos de casamento, mas pode ter união estável
      return {
        regimeBens: false,
        dataCasamento: false,
        dataSeparacao: false,
        dataDivorcio: false,
        dataFalecimentoConjuge: false,
        uniaoEstavelToggle: true,
      };

    case 'Casado(a)':
      // Casado: mostra regime de bens, data casamento, permite separação de fato
      return {
        regimeBens: true,
        dataCasamento: true,
        dataSeparacao: true, // Pode estar separado de fato
        dataDivorcio: false,
        dataFalecimentoConjuge: false,
        uniaoEstavelToggle: false,
      };

    case 'Divorciado(a)':
      // Divorciado: mostra histórico do casamento e data do divórcio
      return {
        regimeBens: false, // Não mais relevante
        dataCasamento: true, // Contexto histórico
        dataSeparacao: true, // Pode ter sido separado antes
        dataDivorcio: true,
        dataFalecimentoConjuge: false,
        uniaoEstavelToggle: true, // Pode ter nova união estável
      };

    case 'Viúvo(a)':
      // Viúvo: mostra dados do casamento e falecimento do cônjuge
      return {
        regimeBens: true, // Relevante para partilha/inventário
        dataCasamento: true,
        dataSeparacao: false,
        dataDivorcio: false,
        dataFalecimentoConjuge: true,
        uniaoEstavelToggle: true, // Pode ter nova união estável
      };

    case 'União Estável':
      // União Estável: foca nos campos específicos, oculta casamento formal
      return {
        regimeBens: false,
        dataCasamento: false,
        dataSeparacao: false,
        dataDivorcio: false,
        dataFalecimentoConjuge: false,
        uniaoEstavelToggle: true, // O toggle vai aparecer ativado
      };

    default:
      // Fallback: mostra tudo
      return {
        regimeBens: true,
        dataCasamento: true,
        dataSeparacao: true,
        dataDivorcio: true,
        dataFalecimentoConjuge: true,
        uniaoEstavelToggle: true,
      };
  }
}

export function PessoaNaturalForm({ pessoa, onUpdate, camposEditados }: PessoaNaturalFormProps) {

  // Determina visibilidade dos campos baseado no estado civil
  const visibilidade = useMemo(
    () => getVisibilidadeCamposFamiliares(pessoa.dadosFamiliares.estadoCivil),
    [pessoa.dadosFamiliares.estadoCivil]
  );

  // Se estado civil é "União Estável", força o toggle ligado
  const isUniaoEstavelPorEstadoCivil = pessoa.dadosFamiliares.estadoCivil === 'União Estável';
  const mostrarCamposUniaoEstavel = pessoa.dadosFamiliares.uniaoEstavel || isUniaoEstavelPorEstadoCivil;

  // Estado local para controlar o toggle de falecido
  // Inicializa como true se já existe data de óbito
  const [mostrarCamposFalecido, setMostrarCamposFalecido] = useState(() => Boolean(pessoa.dataObito));

  // Sincroniza o estado se a data de óbito mudar externamente
  useEffect(() => {
    if (pessoa.dataObito && !mostrarCamposFalecido) {
      setMostrarCamposFalecido(true);
    }
  }, [pessoa.dataObito, mostrarCamposFalecido]);

  return (
    <div className="space-y-2">
      {/* DADOS INDIVIDUAIS */}
      <FormSection title="DADOS INDIVIDUAIS" columns={3}>
        <EditableField label="Nome Completo" value={pessoa.nome} onChange={(v) => onUpdate('nome', v)} wasEditedByUser={camposEditados.includes('nome')} />
        <EditableField label="CPF" value={pessoa.cpf} onChange={(v) => onUpdate('cpf', v)} wasEditedByUser={camposEditados.includes('cpf')} />
        <EditableField label="RG" value={pessoa.rg} onChange={(v) => onUpdate('rg', v)} wasEditedByUser={camposEditados.includes('rg')} />
        <EditableField label="Orgao Emissor RG" value={pessoa.orgaoEmissorRg} onChange={(v) => onUpdate('orgaoEmissorRg', v)} wasEditedByUser={camposEditados.includes('orgaoEmissorRg')} />
        <EditableField label="Estado Emissor RG" value={pessoa.estadoEmissorRg} onChange={(v) => onUpdate('estadoEmissorRg', v)} wasEditedByUser={camposEditados.includes('estadoEmissorRg')} />
        <EditableField label="Data Emissao RG" value={pessoa.dataEmissaoRg} type="date" onChange={(v) => onUpdate('dataEmissaoRg', v)} wasEditedByUser={camposEditados.includes('dataEmissaoRg')} />
        <EditableField label="Nacionalidade" value={pessoa.nacionalidade} onChange={(v) => onUpdate('nacionalidade', v)} wasEditedByUser={camposEditados.includes('nacionalidade')} />
        <EditableField label="Profissao" value={pessoa.profissao} onChange={(v) => onUpdate('profissao', v)} wasEditedByUser={camposEditados.includes('profissao')} />
        <EditableField label="Data Nascimento" value={pessoa.dataNascimento} type="date" onChange={(v) => onUpdate('dataNascimento', v)} wasEditedByUser={camposEditados.includes('dataNascimento')} />
        <EditableField label="CNH" value={pessoa.cnh} onChange={(v) => onUpdate('cnh', v)} wasEditedByUser={camposEditados.includes('cnh')} />
        <EditableField label="Orgao Emissor CNH" value={pessoa.orgaoEmissorCnh} onChange={(v) => onUpdate('orgaoEmissorCnh', v)} wasEditedByUser={camposEditados.includes('orgaoEmissorCnh')} />

        {/* Toggle Falecido */}
        <div className="col-span-full flex items-center gap-4 p-3 bg-muted/30 border border-muted-foreground/10 rounded-lg">
          <Switch
            id="pessoaFalecida"
            checked={mostrarCamposFalecido}
            onCheckedChange={(checked: boolean) => {
              setMostrarCamposFalecido(checked);
              if (!checked) {
                // Se desmarcar, limpa a data de óbito
                onUpdate('dataObito', '');
              }
            }}
          />
          <Label htmlFor="pessoaFalecida" className="cursor-pointer flex items-center gap-2">
            <span className="text-muted-foreground">†</span>
            Pessoa Falecida
          </Label>
        </div>

        {/* Campos de óbito - só aparecem se o toggle estiver ativo */}
        {mostrarCamposFalecido && (
          <div className="col-span-full grid grid-cols-3 gap-4 p-3 bg-muted/20 border border-muted-foreground/10 rounded-lg">
            <EditableField
              label="Data do Óbito"
              value={pessoa.dataObito}
              type="date"
              onChange={(v) => onUpdate('dataObito', v)}
              wasEditedByUser={camposEditados.includes('dataObito')}
            />
          </div>
        )}
      </FormSection>

      {/* DADOS FAMILIARES */}
      <FormSection title="DADOS FAMILIARES" columns={3}>
        {/* Estado Civil - Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Estado Civil
          </label>
          <Select
            value={pessoa.dadosFamiliares.estadoCivil || undefined}
            onValueChange={(v) => onUpdate('dadosFamiliares.estadoCivil', v)}
          >
            <SelectTrigger
              className={`h-9 ${camposEditados.includes('dadosFamiliares.estadoCivil') ? 'ring-2 ring-primary/50' : ''}`}
            >
              <SelectValue placeholder="Selecione o estado civil" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_CIVIS.map((estado) => (
                <SelectItem key={estado.value} value={estado.value}>
                  {estado.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Regime de Bens - Select (condicional) */}
        {visibilidade.regimeBens && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Regime de Bens
            </label>
            <Select
              value={pessoa.dadosFamiliares.regimeBens || undefined}
              onValueChange={(v) => onUpdate('dadosFamiliares.regimeBens', v)}
            >
              <SelectTrigger
                className={`h-9 ${camposEditados.includes('dadosFamiliares.regimeBens') ? 'ring-2 ring-primary/50' : ''}`}
              >
                <SelectValue placeholder="Selecione o regime" />
              </SelectTrigger>
              <SelectContent>
                {REGIMES_BENS.map((regime) => (
                  <SelectItem key={regime.value} value={regime.value}>
                    {regime.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Data Casamento (condicional) */}
        {visibilidade.dataCasamento && (
          <EditableField
            label="Data Casamento"
            value={pessoa.dadosFamiliares.dataCasamento}
            type="date"
            onChange={(v) => onUpdate('dadosFamiliares.dataCasamento', v)}
            wasEditedByUser={camposEditados.includes('dadosFamiliares.dataCasamento')}
          />
        )}

        {/* Data Separação (condicional) */}
        {visibilidade.dataSeparacao && (
          <EditableField
            label="Data Separacao"
            value={pessoa.dadosFamiliares.dataSeparacao}
            type="date"
            onChange={(v) => onUpdate('dadosFamiliares.dataSeparacao', v)}
            wasEditedByUser={camposEditados.includes('dadosFamiliares.dataSeparacao')}
          />
        )}

        {/* Data Divórcio (condicional) */}
        {visibilidade.dataDivorcio && (
          <EditableField
            label="Data Divorcio"
            value={pessoa.dadosFamiliares.dataDivorcio}
            type="date"
            onChange={(v) => onUpdate('dadosFamiliares.dataDivorcio', v)}
            wasEditedByUser={camposEditados.includes('dadosFamiliares.dataDivorcio')}
          />
        )}

        {/* Data Falecimento Cônjuge (condicional) */}
        {visibilidade.dataFalecimentoConjuge && (
          <EditableField
            label="Data Falec. Conjuge"
            value={pessoa.dadosFamiliares.dataFalecimentoConjuge}
            type="date"
            onChange={(v) => onUpdate('dadosFamiliares.dataFalecimentoConjuge', v)}
            wasEditedByUser={camposEditados.includes('dadosFamiliares.dataFalecimentoConjuge')}
          />
        )}

        {/* União Estável section (condicional) */}
        {visibilidade.uniaoEstavelToggle && (
          <div className="col-span-full flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
            <Switch
              id="uniaoEstavel"
              checked={mostrarCamposUniaoEstavel}
              onCheckedChange={(checked: boolean) => onUpdate('dadosFamiliares.uniaoEstavel', checked)}
              disabled={isUniaoEstavelPorEstadoCivil}
            />
            <Label htmlFor="uniaoEstavel" className="cursor-pointer">
              União Estável
              {isUniaoEstavelPorEstadoCivil && (
                <span className="text-xs text-muted-foreground ml-2">(definido pelo estado civil)</span>
              )}
            </Label>
          </div>
        )}

        {/* Campos de União Estável (condicional) */}
        {mostrarCamposUniaoEstavel && (
          <>
            <EditableField
              label="Data União Estável"
              value={pessoa.dadosFamiliares.dataUniaoEstavel}
              type="date"
              onChange={(v) => onUpdate('dadosFamiliares.dataUniaoEstavel', v)}
              wasEditedByUser={camposEditados.includes('dadosFamiliares.dataUniaoEstavel')}
            />
            <EditableField
              label="Data Extinção União"
              value={pessoa.dadosFamiliares.dataExtincaoUniaoEstavel}
              type="date"
              onChange={(v) => onUpdate('dadosFamiliares.dataExtincaoUniaoEstavel', v)}
              wasEditedByUser={camposEditados.includes('dadosFamiliares.dataExtincaoUniaoEstavel')}
            />
            {/* Regime de Bens da União Estável - Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Regime de Bens União
              </label>
              <Select
                value={pessoa.dadosFamiliares.regimeBensUniao || undefined}
                onValueChange={(v) => onUpdate('dadosFamiliares.regimeBensUniao', v)}
              >
                <SelectTrigger
                  className={`h-9 ${camposEditados.includes('dadosFamiliares.regimeBensUniao') ? 'ring-2 ring-primary/50' : ''}`}
                >
                  <SelectValue placeholder="Selecione o regime" />
                </SelectTrigger>
                <SelectContent>
                  {REGIMES_BENS.map((regime) => (
                    <SelectItem key={regime.value} value={regime.value}>
                      {regime.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
        <EditableField label="Numero CNDT" value={pessoa.cndt.numeroCNDT} onChange={(v) => onUpdate('cndt.numeroCNDT', v)} wasEditedByUser={camposEditados.includes('cndt.numeroCNDT')} />
        <EditableField label="Data Expedicao" value={pessoa.cndt.dataExpedicao} type="date" onChange={(v) => onUpdate('cndt.dataExpedicao', v)} wasEditedByUser={camposEditados.includes('cndt.dataExpedicao')} />
        <EditableField label="Hora Expedicao" value={pessoa.cndt.horaExpedicao} onChange={(v) => onUpdate('cndt.horaExpedicao', v)} wasEditedByUser={camposEditados.includes('cndt.horaExpedicao')} />
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
