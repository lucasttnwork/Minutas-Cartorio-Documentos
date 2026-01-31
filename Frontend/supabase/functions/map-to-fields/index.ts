import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import type { MappedFields, PessoaNatural, Imovel, NegocioJuridico, AlertaJuridico } from '../_shared/types.ts';

// Document type priorities for conflict resolution
const TYPE_PRIORITIES: Record<string, number> = {
  'RG': 100,
  'CERTIDAO_NASCIMENTO': 95,
  'CERTIDAO_CASAMENTO': 90,
  'CNH': 88,
  'COMPROMISSO_COMPRA_VENDA': 85,
  'MATRICULA_IMOVEL': 80,
  'CNDT': 75,
  'ITBI': 70,
  'IPTU': 65,
  'VVR': 60,
  'CND_MUNICIPAL': 55,
  'ESCRITURA': 50,
  'COMPROVANTE_PAGAMENTO': 40,
  'PROTOCOLO_ONR': 30,
  'ASSINATURA_DIGITAL': 20,
  'OUTRO': 10,
};

interface RequestBody {
  minuta_id: string;
}

interface DocumentRecord {
  id: string;
  tipo_documento: string;
  nome_original: string;
  dados_extraidos: Record<string, unknown>;
  [key: string]: unknown;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);
    const serviceClient = createServiceClient();
    const { minuta_id }: RequestBody = await req.json();

    // Verify access to minuta
    const { data: minuta, error: minutaError } = await supabase
      .from('minutas')
      .select('id')
      .eq('id', minuta_id)
      .single();

    if (minutaError || !minuta) {
      throw new Error('Minuta not found or access denied');
    }

    // Get all extracted documents for this minuta
    const { data: documentos, error: docsError } = await serviceClient
      .from('documentos')
      .select('*')
      .eq('minuta_id', minuta_id)
      .eq('status', 'extraido')
      .not('dados_extraidos', 'is', null);

    if (docsError) {
      throw new Error(`Failed to fetch documents: ${docsError.message}`);
    }

    if (!documentos || documentos.length === 0) {
      throw new Error('No extracted documents found');
    }

    // Log execution
    const { data: execution } = await serviceClient
      .from('agent_executions')
      .insert({
        minuta_id,
        agent_type: 'map',
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Process and map fields
    const result = mapDocumentsToFields(documentos as DocumentRecord[]);

    // Update execution log
    await serviceClient
      .from('agent_executions')
      .update({
        status: 'success',
        result,
        completed_at: new Date().toISOString(),
        duration_ms: execution ? Date.now() - new Date(execution.started_at).getTime() : 0,
      })
      .eq('id', execution?.id);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Mapping error:', error);

    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function mapDocumentsToFields(documentos: DocumentRecord[]): MappedFields {
  const alienantes: Map<string, PessoaNatural> = new Map();
  const adquirentes: Map<string, PessoaNatural> = new Map();
  const anuentes: Map<string, PessoaNatural> = new Map();
  const alertas: AlertaJuridico[] = [];
  let imovel: Imovel = {};
  let negocio: NegocioJuridico = { tipo: 'compra_venda' };

  // Sort documents by priority
  const sorted = documentos.sort((a, b) => {
    const prioA = TYPE_PRIORITIES[a.tipo_documento] ?? 0;
    const prioB = TYPE_PRIORITIES[b.tipo_documento] ?? 0;
    return prioB - prioA; // Higher priority first
  });

  for (const doc of sorted) {
    const dados = doc.dados_extraidos;
    if (!dados) continue;

    const tipoDoc = doc.tipo_documento;
    const priority = TYPE_PRIORITIES[tipoDoc] ?? 0;
    const source = doc.nome_original;

    // Map based on document type
    switch (tipoDoc) {
      case 'RG':
      case 'CNH':
        mapIdentityDocument(dados, source, alienantes, adquirentes, priority);
        break;

      case 'CERTIDAO_CASAMENTO':
        mapMarriageCertificate(dados, source, alienantes, adquirentes, alertas);
        break;

      case 'COMPROMISSO_COMPRA_VENDA':
        mapPurchaseContract(dados, source, alienantes, adquirentes, imovel, negocio);
        break;

      case 'MATRICULA_IMOVEL':
        imovel = mapPropertyRegistry(dados, source, imovel, alertas);
        break;

      case 'ITBI':
        negocio = mapITBI(dados, source, negocio);
        break;

      case 'IPTU':
      case 'VVR':
        imovel = mapPropertyValues(dados, source, imovel, tipoDoc);
        break;

      case 'CNDT':
        mapCNDT(dados, source, alienantes, adquirentes);
        break;
    }
  }

  // Identify spouses as anuentes
  identifyAnuentes(alienantes, anuentes);

  return {
    alienantes: Array.from(alienantes.values()),
    adquirentes: Array.from(adquirentes.values()),
    anuentes: Array.from(anuentes.values()),
    imovel,
    negocio,
    alertas_juridicos: alertas,
    metadata: {
      documentos_processados: documentos.length,
      campos_preenchidos: countFilledFields({ alienantes: Array.from(alienantes.values()), adquirentes: Array.from(adquirentes.values()), imovel, negocio }),
      campos_faltantes: identifyMissingFields({ alienantes: Array.from(alienantes.values()), adquirentes: Array.from(adquirentes.values()), imovel, negocio }),
    },
  };
}

// Helper functions for mapping each document type
function mapIdentityDocument(
  dados: Record<string, unknown>,
  source: string,
  alienantes: Map<string, PessoaNatural>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _adquirentes: Map<string, PessoaNatural>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _priority: number
) {
  const cpf = normalizeCPF(dados.cpf as string | undefined);
  if (!cpf) return;

  const pessoa: PessoaNatural = {
    nome: (dados.nome as string)?.toUpperCase(),
    cpf,
    rg: dados.rg as string | undefined,
    orgao_emissor_rg: dados.orgao_emissor as string | undefined,
    estado_emissor_rg: dados.estado_emissor as string | undefined,
    data_emissao_rg: dados.data_emissao as string | undefined,
    data_nascimento: dados.data_nascimento as string | undefined,
    nacionalidade: dados.nacionalidade as string | undefined,
    naturalidade: dados.naturalidade as string | undefined,
    filiacao_pai: dados.filiacao_pai as string | undefined,
    filiacao_mae: dados.filiacao_mae as string | undefined,
    _fontes: { cpf: [source], nome: [source] },
  };

  // For now, add to alienantes (role detection would come from contract)
  if (!alienantes.has(cpf)) {
    alienantes.set(cpf, pessoa);
  } else {
    // Merge with existing
    const existing = alienantes.get(cpf)!;
    mergePersonData(existing, pessoa);
  }
}

function mapMarriageCertificate(
  dados: Record<string, unknown>,
  source: string,
  alienantes: Map<string, PessoaNatural>,
  adquirentes: Map<string, PessoaNatural>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _alertas: AlertaJuridico[]
) {
  // Update marriage info for known persons
  const conjuge1 = dados.conjuge1 as Record<string, unknown> | undefined;
  const conjuge2 = dados.conjuge2 as Record<string, unknown> | undefined;
  const conjuge1Cpf = normalizeCPF(conjuge1?.cpf as string | undefined);
  const conjuge2Cpf = normalizeCPF(conjuge2?.cpf as string | undefined);

  for (const [cpf, pessoa] of [...alienantes.entries(), ...adquirentes.entries()]) {
    if (cpf === conjuge1Cpf) {
      pessoa.estado_civil = 'casado';
      pessoa.regime_bens = dados.regime_bens as string | undefined;
      pessoa.data_casamento = dados.data_casamento as string | undefined;
      pessoa.conjuge = conjuge2?.nome as string | undefined;
      addSource(pessoa, 'estado_civil', source);
    }
    if (cpf === conjuge2Cpf) {
      pessoa.estado_civil = 'casado';
      pessoa.regime_bens = dados.regime_bens as string | undefined;
      pessoa.data_casamento = dados.data_casamento as string | undefined;
      pessoa.conjuge = conjuge1?.nome as string | undefined;
      addSource(pessoa, 'estado_civil', source);
    }
  }
}

function mapPurchaseContract(
  dados: Record<string, unknown>,
  source: string,
  alienantes: Map<string, PessoaNatural>,
  adquirentes: Map<string, PessoaNatural>,
  imovel: Imovel,
  negocio: NegocioJuridico
) {
  // Map sellers
  const vendedores = dados.vendedores as Array<Record<string, unknown>> | undefined;
  if (vendedores) {
    for (const v of vendedores) {
      const cpf = normalizeCPF(v.cpf as string | undefined);
      if (cpf) {
        alienantes.set(cpf, {
          nome: (v.nome as string)?.toUpperCase(),
          cpf,
          rg: v.rg as string | undefined,
          estado_civil: v.estado_civil as string | undefined,
          profissao: v.profissao as string | undefined,
          endereco: v.endereco as PessoaNatural['endereco'],
          _fontes: { nome: [source] },
        });
      }
    }
  }

  // Map buyers
  const compradores = dados.compradores as Array<Record<string, unknown>> | undefined;
  if (compradores) {
    for (const c of compradores) {
      const cpf = normalizeCPF(c.cpf as string | undefined);
      if (cpf) {
        adquirentes.set(cpf, {
          nome: (c.nome as string)?.toUpperCase(),
          cpf,
          rg: c.rg as string | undefined,
          estado_civil: c.estado_civil as string | undefined,
          profissao: c.profissao as string | undefined,
          endereco: c.endereco as PessoaNatural['endereco'],
          _fontes: { nome: [source] },
        });
      }
    }
  }

  // Map property info
  const imovelData = dados.imovel as Record<string, unknown> | undefined;
  if (imovelData) {
    Object.assign(imovel, {
      tipo: imovelData.tipo,
      matricula_numero: imovelData.matricula,
      endereco: imovelData.endereco,
    });
  }

  // Map deal info
  const valores = dados.valores as Record<string, unknown> | undefined;
  if (valores) {
    negocio.valor_total = formatCurrency(valores.total);
    negocio.pagamento = {
      tipo: valores.forma_pagamento as string | undefined,
      sinal: formatCurrency(valores.sinal),
      saldo: formatCurrency(valores.saldo),
    };
  }
}

function mapPropertyRegistry(
  dados: Record<string, unknown>,
  _source: string,
  imovel: Imovel,
  alertas: AlertaJuridico[]
): Imovel {
  const result = { ...imovel };

  result.matricula_numero = (dados.matricula_numero as string) || result.matricula_numero;
  result.registro_imoveis = (dados.cartorio as string) || result.registro_imoveis;
  result.cidade = (dados.cidade as string) || result.cidade;
  result.estado = (dados.estado as string) || result.estado;
  result.tipo = (dados.tipo_imovel as string) || result.tipo;
  result.area_total = (dados.area_total as string) || result.area_total;
  result.area_privativa = (dados.area_privativa as string) || result.area_privativa;

  // Capture liens/encumbrances
  const onusAtivos = dados.onus_ativos as Array<unknown> | undefined;
  if (onusAtivos && onusAtivos.length > 0) {
    result.onus_ativos = onusAtivos as Imovel['onus_ativos'];
    alertas.push({
      tipo: 'ONUS_ATIVO',
      severidade: 'ALTA',
      mensagem: `Imovel possui ${onusAtivos.length} onus ativo(s)`,
      recomendacao: 'Verificar situacao dos onus antes de prosseguir',
    });
  }

  if (dados.onus_historicos) {
    result.onus_historicos = dados.onus_historicos as Imovel['onus_historicos'];
  }

  // Capture current owners
  if (dados.proprietarios) {
    result.proprietarios = dados.proprietarios as Imovel['proprietarios'];
  }

  return result;
}

function mapITBI(dados: Record<string, unknown>, _source: string, negocio: NegocioJuridico): NegocioJuridico {
  return {
    ...negocio,
    itbi: {
      numero_guia: dados.numero_guia as string | undefined,
      base_calculo: formatCurrency(dados.base_calculo),
      valor: formatCurrency(dados.valor_itbi),
      data_vencimento: dados.data_vencimento as string | undefined,
      data_pagamento: dados.data_pagamento as string | undefined,
    },
  };
}

function mapPropertyValues(
  dados: Record<string, unknown>,
  _source: string,
  imovel: Imovel,
  tipoDoc: string
): Imovel {
  const result = { ...imovel };

  if (tipoDoc === 'IPTU') {
    result.iptu_valor_venal = formatCurrency(dados.valor_venal);
    result.sql = dados.inscricao_cadastral as string | undefined;
  } else if (tipoDoc === 'VVR') {
    result.vvr_valor = formatCurrency(dados.valor_venal_referencia);
  }

  return result;
}

function mapCNDT(
  dados: Record<string, unknown>,
  source: string,
  alienantes: Map<string, PessoaNatural>,
  adquirentes: Map<string, PessoaNatural>
) {
  const cpf = normalizeCPF(dados.cpf as string | undefined);
  if (!cpf) return;

  // Find person and update CNDT info
  for (const [key, pessoa] of [...alienantes.entries(), ...adquirentes.entries()]) {
    if (key === cpf) {
      pessoa.cndt = {
        numero: dados.numero_certidao as string | undefined,
        data_expedicao: dados.data_expedicao as string | undefined,
        hora_expedicao: dados.hora_expedicao as string | undefined,
        validade: dados.validade as string | undefined,
        status: dados.resultado as string | undefined,
      };
      addSource(pessoa, 'cndt', source);
    }
  }
}

function identifyAnuentes(
  alienantes: Map<string, PessoaNatural>,
  anuentes: Map<string, PessoaNatural>
) {
  for (const pessoa of alienantes.values()) {
    if (pessoa.estado_civil === 'casado' && pessoa.conjuge) {
      // If spouse is not already an alienante, they're an anuente
      const spouseCpf = Array.from(alienantes.values())
        .find(p => p.nome === pessoa.conjuge)?.cpf;

      if (!spouseCpf) {
        anuentes.set(pessoa.conjuge, {
          nome: pessoa.conjuge,
          _fontes: { nome: pessoa._fontes?.estado_civil || [] },
        });
      }
    }
  }
}

// Utility functions
function normalizeCPF(cpf: string | undefined): string | null {
  if (!cpf) return null;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return null;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatCurrency(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const num = typeof value === 'string'
    ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'))
    : (value as number);
  if (isNaN(num)) return undefined;
  return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function mergePersonData(existing: PessoaNatural, incoming: PessoaNatural) {
  // Only update null/undefined fields with incoming data
  for (const [key, value] of Object.entries(incoming)) {
    if (key === '_fontes') continue;
    if (value !== null && value !== undefined && !(existing as Record<string, unknown>)[key]) {
      (existing as Record<string, unknown>)[key] = value;
    }
  }
}

function addSource(pessoa: PessoaNatural, field: string, source: string) {
  if (!pessoa._fontes) pessoa._fontes = {};
  if (!pessoa._fontes[field]) pessoa._fontes[field] = [];
  pessoa._fontes[field].push(source);
}

function countFilledFields(data: Record<string, unknown>): number {
  let count = 0;
  const countObj = (obj: unknown) => {
    if (typeof obj !== 'object' || obj === null) return;
    for (const value of Object.values(obj)) {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          countObj(value);
        } else {
          count++;
        }
      }
    }
  };
  countObj(data);
  return count;
}

function identifyMissingFields(data: { alienantes: PessoaNatural[]; adquirentes: PessoaNatural[]; imovel: Imovel; negocio: NegocioJuridico }): string[] {
  const missing: string[] = [];
  // Simplified check - would need proper path resolution
  if (!data.alienantes?.length) {
    missing.push('alienantes[0].cpf', 'alienantes[0].rg');
  }
  if (!data.adquirentes?.length) {
    missing.push('adquirentes[0].cpf');
  }
  if (!data.imovel?.matricula_numero) {
    missing.push('imovel.matricula_numero');
  }
  if (!data.negocio?.valor_total) {
    missing.push('negocio.valor_total');
  }

  return missing;
}
