// src/components/forms/negocio/NegocioJuridicoForm.tsx
import { FormSection } from '../FormSection';
import { EditableField } from '../EditableField';
import { CheckboxGroup } from '../CheckboxGroup';
import { ParticipanteCard } from './ParticipanteCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search } from 'lucide-react';
import type { NegocioJuridico, Imovel, PessoaNatural, PessoaJuridica } from '@/types/minuta';

// Declaracoes legais para checkbox
const DECLARACOES_ITEMS = [
  { id: 'declaracaoIRPF', label: 'Declaracao de IR atualizada', description: 'Confirmacao de regularidade fiscal' },
  { id: 'declaracaoIPTU', label: 'Declaracao de quitacao de IPTU', description: 'Sem debitos de IPTU' },
  { id: 'declaracaoCivilCapaz', label: 'Declaracao de capacidade civil', description: 'Partes civilmente capazes' },
  { id: 'declaracaoNaoFalencia', label: 'Nao esta em falencia ou recuperacao', description: 'Empresa sem processo falimentar' },
];

// Dispensas
const DISPENSAS_ITEMS = [
  { id: 'dispensaCertidaoImovel', label: 'Dispensa certidao atualizada do imovel' },
  { id: 'dispensaCertidaoDistribuidor', label: 'Dispensa certidao de distribuidor' },
  { id: 'dispensaCertidaoJusticaFederal', label: 'Dispensa certidao da Justica Federal' },
  { id: 'dispensaCertidaoTrabalhista', label: 'Dispensa certidao trabalhista' },
];

interface NegocioJuridicoFormProps {
  negocio: NegocioJuridico;
  imoveis: Imovel[];
  pessoasNaturais: PessoaNatural[];
  pessoasJuridicas: PessoaJuridica[];
  onUpdate: (field: string, value: string | boolean | Record<string, boolean>) => void;
  onAddAlienante: () => void;
  onUpdateAlienante: (id: string, field: string, value: string) => void;
  onRemoveAlienante: (id: string) => void;
  onAddAdquirente: () => void;
  onUpdateAdquirente: (id: string, field: string, value: string) => void;
  onRemoveAdquirente: (id: string) => void;
  onConsultarIndisponibilidade?: () => void;
}

export function NegocioJuridicoForm({
  negocio,
  imoveis,
  pessoasNaturais,
  pessoasJuridicas,
  onUpdate,
  onAddAlienante,
  onUpdateAlienante,
  onRemoveAlienante,
  onAddAdquirente,
  onUpdateAdquirente,
  onRemoveAdquirente,
  onConsultarIndisponibilidade,
}: NegocioJuridicoFormProps) {

  const getPessoaNome = (pessoaId: string, tipo: 'natural' | 'juridica') => {
    if (tipo === 'natural') {
      return pessoasNaturais.find(p => p.id === pessoaId)?.nome || '';
    }
    return pessoasJuridicas.find(p => p.id === pessoaId)?.razaoSocial || '';
  };

  // Get imovel name for reference (unused variable removed)
  const _imovelOptions = imoveis.map(i => ({
    value: i.id,
    label: i.descricao.denominacao || i.matricula.numeroMatricula || 'Imovel sem nome',
  }));
  void _imovelOptions; // Suppress unused variable warning

  return (
    <div className="space-y-2">
      {/* VALOR */}
      <FormSection title="VALOR" columns={3}>
        <EditableField
          label="Imovel da Matricula"
          value={negocio.imovelId}
          onChange={(v) => onUpdate('imovelId', v)}
          placeholder="Selecione o imovel"
        />
        <EditableField
          label="Fracao Ideal Alienada"
          value={negocio.fracaoIdealAlienada}
          onChange={(v) => onUpdate('fracaoIdealAlienada', v)}
          placeholder="Ex: 100%"
        />
        <EditableField
          label="Valor Total Alienacao"
          value={negocio.valorTotalAlienacao}
          onChange={(v) => onUpdate('valorTotalAlienacao', v)}
          placeholder="Ex: R$ 500.000,00"
        />
      </FormSection>

      {/* ALIENANTES */}
      <FormSection title="ALIENANTES" columns={1}>
        <div className="col-span-full space-y-4">
          {negocio.alienantes.map((alienante, index) => (
            <ParticipanteCard
              key={alienante.id}
              participante={alienante}
              tipo="alienante"
              index={index}
              pessoaNome={getPessoaNome(alienante.pessoaId, alienante.tipoPessoa)}
              onUpdate={(field, value) => onUpdateAlienante(alienante.id, field, value)}
              onRemove={() => onRemoveAlienante(alienante.id)}
            />
          ))}
          <Button variant="outline" size="sm" onClick={onAddAlienante} className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10">
            <Plus className="w-4 h-4 mr-1" /> Adicionar Alienante
          </Button>
        </div>
      </FormSection>

      {/* ADQUIRENTES */}
      <FormSection title="ADQUIRENTES" columns={1}>
        <div className="col-span-full space-y-4">
          {negocio.adquirentes.map((adquirente, index) => (
            <ParticipanteCard
              key={adquirente.id}
              participante={adquirente}
              tipo="adquirente"
              index={index}
              pessoaNome={getPessoaNome(adquirente.pessoaId, adquirente.tipoPessoa)}
              onUpdate={(field, value) => onUpdateAdquirente(adquirente.id, field, value)}
              onRemove={() => onRemoveAdquirente(adquirente.id)}
            />
          ))}
          <Button variant="outline" size="sm" onClick={onAddAdquirente} className="w-full border-green-500/50 text-green-500 hover:bg-green-500/10">
            <Plus className="w-4 h-4 mr-1" /> Adicionar Adquirente
          </Button>
        </div>
      </FormSection>

      {/* FORMA DE PAGAMENTO */}
      <FormSection title="FORMA DE PAGAMENTO" columns={3}>
        <EditableField
          label="Tipo"
          value={negocio.formaPagamentoDetalhada.tipo}
          onChange={(v) => onUpdate('formaPagamentoDetalhada.tipo', v)}
          placeholder="Ex: A vista, Financiamento"
        />
        <EditableField
          label="Data"
          value={negocio.formaPagamentoDetalhada.data}
          type="date"
          onChange={(v) => onUpdate('formaPagamentoDetalhada.data', v)}
        />
        <EditableField
          label="Modo"
          value={negocio.formaPagamentoDetalhada.modo}
          onChange={(v) => onUpdate('formaPagamentoDetalhada.modo', v)}
          placeholder="Ex: TED, PIX, Cheque"
        />
        {/* Conta Origem */}
        <EditableField
          label="Banco Origem"
          value={negocio.formaPagamentoDetalhada.contaOrigem.banco}
          onChange={(v) => onUpdate('formaPagamentoDetalhada.contaOrigem.banco', v)}
        />
        <EditableField
          label="Agencia Origem"
          value={negocio.formaPagamentoDetalhada.contaOrigem.agencia}
          onChange={(v) => onUpdate('formaPagamentoDetalhada.contaOrigem.agencia', v)}
        />
        <EditableField
          label="Conta Origem"
          value={negocio.formaPagamentoDetalhada.contaOrigem.conta}
          onChange={(v) => onUpdate('formaPagamentoDetalhada.contaOrigem.conta', v)}
        />
        {/* Conta Destino */}
        <EditableField
          label="Banco Destino"
          value={negocio.formaPagamentoDetalhada.contaDestino.banco}
          onChange={(v) => onUpdate('formaPagamentoDetalhada.contaDestino.banco', v)}
        />
        <EditableField
          label="Agencia Destino"
          value={negocio.formaPagamentoDetalhada.contaDestino.agencia}
          onChange={(v) => onUpdate('formaPagamentoDetalhada.contaDestino.agencia', v)}
        />
        <EditableField
          label="Conta Destino"
          value={negocio.formaPagamentoDetalhada.contaDestino.conta}
          onChange={(v) => onUpdate('formaPagamentoDetalhada.contaDestino.conta', v)}
        />
      </FormSection>

      {/* TERMOS ESPECIAIS DA ESCRITURA */}
      <FormSection title="TERMOS ESPECIAIS DA ESCRITURA" columns={1}>
        <div className="col-span-full space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Termos da Promessa</Label>
            <Textarea
              value={negocio.termosEspeciais.termosPromessa}
              onChange={(e) => onUpdate('termosEspeciais.termosPromessa', e.target.value)}
              placeholder="Descreva os termos da promessa..."
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Termos Especiais</Label>
            <Textarea
              value={negocio.termosEspeciais.termosEspeciais}
              onChange={(e) => onUpdate('termosEspeciais.termosEspeciais', e.target.value)}
              placeholder="Descreva termos especiais..."
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Condicao Resolutiva</Label>
            <Textarea
              value={negocio.termosEspeciais.condicaoResolutiva}
              onChange={(e) => onUpdate('termosEspeciais.condicaoResolutiva', e.target.value)}
              placeholder="Descreva condicoes resolutivas..."
              className="min-h-[80px]"
            />
          </div>
        </div>
      </FormSection>

      {/* DECLARACOES */}
      <FormSection title="DECLARACOES" columns={1}>
        <div className="col-span-full">
          <CheckboxGroup
            items={DECLARACOES_ITEMS}
            values={negocio.declaracoes}
            onChange={(id, checked) => onUpdate('declaracoes', { ...negocio.declaracoes, [id]: checked })}
            columns={2}
          />
        </div>
      </FormSection>

      {/* DISPENSAS */}
      <FormSection title="DISPENSAS" columns={1}>
        <div className="col-span-full">
          <CheckboxGroup
            items={DISPENSAS_ITEMS}
            values={negocio.dispensas}
            onChange={(id, checked) => onUpdate('dispensas', { ...negocio.dispensas, [id]: checked })}
            columns={2}
          />
        </div>
      </FormSection>

      {/* INDISPONIBILIDADE DE BENS */}
      <FormSection
        title="INDISPONIBILIDADE DE BENS"
        columns={1}
        action={onConsultarIndisponibilidade ? {
          label: 'Realizar Consulta',
          onClick: onConsultarIndisponibilidade,
          icon: <Search className="w-3 h-3 mr-1" />
        } : undefined}
      >
        <div className="col-span-full">
          {negocio.indisponibilidade.consultaRealizada ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Consulta realizada em: {negocio.indisponibilidade.dataConsulta}
              </p>
              {negocio.indisponibilidade.resultados.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Documento</th>
                        <th className="text-left p-2">Situacao</th>
                        <th className="text-left p-2">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {negocio.indisponibilidade.resultados.map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="p-2">{r.nome}</td>
                          <td className="p-2">{r.documento}</td>
                          <td className="p-2">{r.situacao}</td>
                          <td className="p-2">{r.dataRegistro}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-green-500">Nenhuma indisponibilidade encontrada.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Consulta nao realizada. Clique em "Realizar Consulta" para verificar.</p>
          )}
        </div>
      </FormSection>

      {/* IMPOSTO DE TRANSMISSAO */}
      <FormSection title="IMPOSTO DE TRANSMISSAO" columns={3}>
        <EditableField
          label="Numero Guia ITBI"
          value={negocio.impostoTransmissao.numeroGuiaITBI}
          onChange={(v) => onUpdate('impostoTransmissao.numeroGuiaITBI', v)}
        />
        <EditableField
          label="Base de Calculo"
          value={negocio.impostoTransmissao.baseCalculo}
          onChange={(v) => onUpdate('impostoTransmissao.baseCalculo', v)}
          placeholder="Ex: R$ 500.000,00"
        />
        <EditableField
          label="Valor da Guia"
          value={negocio.impostoTransmissao.valorGuia}
          onChange={(v) => onUpdate('impostoTransmissao.valorGuia', v)}
          placeholder="Ex: R$ 15.000,00"
        />
      </FormSection>
    </div>
  );
}
