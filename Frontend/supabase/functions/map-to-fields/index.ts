import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient, createServiceClient } from '../_shared/supabase-client.ts';
import { startExecution, logSuccess, logError } from '../_shared/execution-logger.ts';
import type { MappedFields, PessoaNatural, Imovel, NegocioJuridico, AlertaJuridico } from '../_shared/types.ts';
import { persistMappedFields } from './persistence.ts';

// Document type priorities for conflict resolution
// Higher priority = processed first
// Identity docs (RG, CNH) should be processed BEFORE marriage certificates
// so that pessoas already exist when marriage cert tries to update them
const TYPE_PRIORITIES: Record<string, number> = {
  'RG': 100,
  'CERTIDAO_NASCIMENTO': 95,
  'CNH': 90,
  'CERTIDAO_CASAMENTO': 85,  // Process AFTER identity docs so pessoas exist
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

  const serviceClient = createServiceClient();
  let execution = { id: '', started_at: '' };

  try {
    const supabase = createSupabaseClient(req);
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

    // Start execution logging (no tokens for map as it's deterministic)
    execution = await startExecution(serviceClient, 'map', {
      minutaId: minuta_id,
    });

    // Process and map fields
    const result = mapDocumentsToFields(documentos as DocumentRecord[]);

    // Persist mapped fields to structured tables
    const persistenceResult = await persistMappedFields(serviceClient, minuta_id, result);
    console.log('Persistence result:', persistenceResult);

    // Log successful execution (no token usage for map operation)
    await logSuccess(serviceClient, execution, {
      ...result,
      persistence: persistenceResult,
    });

    return new Response(
      JSON.stringify({
        success: true,
        result,
        persistence: persistenceResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Mapping error:', error);

    // Log error in execution tracking
    if (execution.id) {
      await logError(serviceClient, execution, error as Error);
    }

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
    // Handle both V2 format (nested in 'dados') and legacy V1 format (flat)
    const rawDados = doc.dados_extraidos;
    if (!rawDados) continue;

    const dados = (rawDados?.dados && typeof rawDados.dados === 'object')
      ? rawDados.dados as Record<string, unknown>
      : rawDados;

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

  // Correlate identity documents (match front/back of RGs, merge nome with CPF)
  correlateIdentityDocuments(alienantes);
  correlateIdentityDocuments(adquirentes);

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
  // Handle multiple possible structures from extraction:
  // 1. Nested RG format: {rg: {cpf, nome, numero_rg, ...}}
  // 2. Flat CNH format: {cpf, nome_completo, rg, orgao_emissor_rg, ...}
  // 3. V2 extraction format: {dados: {...}, tipo_documento, versao_extracao}

  const rgData = dados.rg as Record<string, unknown> | undefined;
  const isNestedRgFormat = rgData && typeof rgData === 'object' && ('cpf' in rgData || 'numero_rg' in rgData);

  // Get data from the correct location
  const docData = isNestedRgFormat ? rgData : dados;

  // Extract nome - try multiple field names
  const nome = (docData.nome as string)
    || (docData.nome_completo as string)
    || (dados.nome as string)
    || (dados.nome_completo as string);

  // Extract CPF - try multiple locations
  const cpf = normalizeCPF(
    (docData.cpf as string | undefined)
    || (dados.cpf as string | undefined)
  );

  // Extract RG number - handle various field names
  const rgNumber = (docData.numero_rg as string | undefined)
    || (docData.rg as string | undefined)
    || (isNestedRgFormat ? undefined : dados.rg as string | undefined)
    || (dados.numero_rg as string | undefined);

  // Skip if we have neither CPF nor nome - nothing useful to map
  if (!cpf && !nome) return;

  // Extract RG issuing authority - try ALL possible field names from prompts
  const orgaoEmissorRg = (docData.orgao_emissor_rg as string | undefined)
    || (docData.orgao_emissor as string | undefined)
    || (docData.orgao_expedidor as string | undefined)
    || (dados.orgao_emissor_rg as string | undefined)
    || (dados.orgao_emissor as string | undefined)
    || (dados.orgao_expedidor as string | undefined);

  // Extract RG state - try ALL possible field names from prompts
  const estadoEmissorRg = (docData.uf_rg as string | undefined)
    || (docData.estado_emissor_rg as string | undefined)
    || (docData.estado_emissor as string | undefined)
    || (docData.uf_expedidor as string | undefined)
    || (dados.uf_rg as string | undefined)
    || (dados.estado_emissor_rg as string | undefined)
    || (dados.estado_emissor as string | undefined)
    || (dados.uf_expedidor as string | undefined);

  // Extract RG issue date - try multiple field names
  const dataEmissaoRg = (docData.data_expedicao as string | undefined)
    || (docData.data_emissao as string | undefined)
    || (docData.data_emissao_rg as string | undefined)
    || (dados.data_expedicao as string | undefined)
    || (dados.data_emissao as string | undefined);

  // Extract filiacao - handle nested and flat structures
  const filiacaoObj = (docData.filiacao as Record<string, unknown>) || (dados.filiacao as Record<string, unknown>);
  const filiacaoPai = (docData.filiacao_pai as string | undefined)
    || (dados.filiacao_pai as string | undefined)
    || (filiacaoObj?.pai as string | undefined)
    || (filiacaoObj?.nome_pai as string | undefined);
  const filiacaoMae = (docData.filiacao_mae as string | undefined)
    || (dados.filiacao_mae as string | undefined)
    || (filiacaoObj?.mae as string | undefined)
    || (filiacaoObj?.nome_mae as string | undefined);

  // Extract naturalidade - try multiple locations
  const naturalidade = (docData.naturalidade as string | undefined)
    || (dados.naturalidade as string | undefined);

  // Extract data_nascimento
  const dataNascimento = (docData.data_nascimento as string | undefined)
    || (dados.data_nascimento as string | undefined);

  // Extract nacionalidade
  const nacionalidade = (docData.nacionalidade as string | undefined)
    || (dados.nacionalidade as string | undefined);

  const pessoa: PessoaNatural = {
    nome: nome?.toUpperCase(),
    cpf: cpf || undefined,
    rg: rgNumber,
    orgao_emissor_rg: orgaoEmissorRg,
    estado_emissor_rg: estadoEmissorRg,
    data_emissao_rg: dataEmissaoRg,
    data_nascimento: dataNascimento,
    nacionalidade: nacionalidade,
    naturalidade: naturalidade,
    filiacao_pai: filiacaoPai,
    filiacao_mae: filiacaoMae,
    _fontes: {},
  };

  // Track sources for the fields we have
  if (cpf) pessoa._fontes!.cpf = [source];
  if (nome) pessoa._fontes!.nome = [source];

  // Use CPF as key if available, otherwise use normalized nome
  const key = cpf || `nome:${nome?.toUpperCase()}`;

  if (!alienantes.has(key)) {
    alienantes.set(key, pessoa);
  } else {
    // Merge with existing - combine data from multiple documents (RG front + back)
    const existing = alienantes.get(key)!;
    mergePersonData(existing, pessoa);

    // If existing had nome-based key and we now have CPF, re-key by CPF
    if (!key.startsWith('nome:') && cpf && !existing.cpf) {
      // Found CPF for a nome-keyed entry - update the key
      const nomeKey = `nome:${existing.nome}`;
      if (alienantes.has(nomeKey)) {
        alienantes.delete(nomeKey);
        existing.cpf = cpf;
        alienantes.set(cpf, existing);
      }
    }
  }
}

/**
 * Normalizes a name for matching purposes:
 * - Removes accents (NFD normalization + diacritic removal)
 * - Removes common articles (DA, DE, DO, DOS, DAS, E)
 * - Converts to uppercase
 * - Normalizes whitespace
 */
function normalizeNameForMatching(name: string | undefined | null): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toUpperCase()
    .replace(/\b(DA|DE|DO|DOS|DAS|E)\b/g, '') // Remove articles
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
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
  // Handle both field naming conventions: conjuge1/conjuge2 and conjuge_1/conjuge_2
  const conjuge1 = (dados.conjuge_1 || dados.conjuge1) as Record<string, unknown> | undefined;
  const conjuge2 = (dados.conjuge_2 || dados.conjuge2) as Record<string, unknown> | undefined;

  if (!conjuge1 && !conjuge2) {
    console.log('[map-to-fields] Marriage certificate has no conjuge data');
    return;
  }

  // Get CPFs if available
  const conjuge1Cpf = normalizeCPF(conjuge1?.cpf as string | undefined);
  const conjuge2Cpf = normalizeCPF(conjuge2?.cpf as string | undefined);

  // Get names for matching (required since CPF is often not in marriage certificates)
  const conjuge1Nome = ((conjuge1?.nome_completo as string) || (conjuge1?.nome as string))?.toUpperCase();
  const conjuge2Nome = ((conjuge2?.nome_completo as string) || (conjuge2?.nome as string))?.toUpperCase();

  // Get filiacao from marriage certificate
  const conjuge1Filiacao = conjuge1?.filiacao as Record<string, unknown> | undefined;
  const conjuge2Filiacao = conjuge2?.filiacao as Record<string, unknown> | undefined;
  const conjuge1Naturalidade = conjuge1?.naturalidade as string | undefined;
  const conjuge2Naturalidade = conjuge2?.naturalidade as string | undefined;
  const conjuge1Nacionalidade = conjuge1?.nacionalidade as string | undefined;
  const conjuge2Nacionalidade = conjuge2?.nacionalidade as string | undefined;

  console.log(`[map-to-fields] Processing marriage certificate: ${conjuge1Nome} + ${conjuge2Nome}`);

  // Debug log for matching
  console.log('[map-to-fields] Attempting marriage cert match:', {
    conjuge1Nome,
    conjuge2Nome,
    existingPessoas: [...alienantes.values(), ...adquirentes.values()].map(p => p.nome)
  });

  // Helper to check if pessoa matches a conjuge by name or CPF
  const matchesConjuge = (pessoa: PessoaNatural, cpf: string | null, nome: string | undefined): boolean => {
    // Match by CPF if available (first priority)
    if (cpf && pessoa.cpf === cpf) return true;
    // Match by name (normalized to handle accents and articles)
    if (nome && pessoa.nome) {
      const normalizedPessoaNome = normalizeNameForMatching(pessoa.nome);
      const normalizedCertNome = normalizeNameForMatching(nome);
      // Exact match after normalization
      if (normalizedPessoaNome === normalizedCertNome) return true;
      // Handle married name vs maiden name differences
      // Check if first and last name parts match
      const certParts = normalizedCertNome.split(' ').filter(p => p.length > 0);
      const pessoaParts = normalizedPessoaNome.split(' ').filter(p => p.length > 0);
      if (certParts.length > 0 && pessoaParts.length > 0) {
        const certFirst = certParts[0];
        const certLast = certParts[certParts.length - 1];
        const pessoaFirst = pessoaParts[0];
        const pessoaLast = pessoaParts[pessoaParts.length - 1];
        // pessoa has cert's first and last name
        if (normalizedPessoaNome.includes(certFirst) && normalizedPessoaNome.includes(certLast)) return true;
        // cert has pessoa's first and last name
        if (normalizedCertNome.includes(pessoaFirst) && normalizedCertNome.includes(pessoaLast)) return true;
      }
    }
    return false;
  };

  // Update each person in alienantes and adquirentes
  for (const [_key, pessoa] of [...alienantes.entries(), ...adquirentes.entries()]) {
    if (matchesConjuge(pessoa, conjuge1Cpf, conjuge1Nome)) {
      pessoa.estado_civil = 'casado';
      pessoa.regime_bens = dados.regime_bens as string | undefined;
      pessoa.data_casamento = dados.data_casamento as string | undefined;
      pessoa.conjuge = conjuge2Nome;
      // Map filiacao from marriage certificate if not already set
      if (!pessoa.filiacao_pai && conjuge1Filiacao?.pai) {
        pessoa.filiacao_pai = conjuge1Filiacao.pai as string;
      }
      if (!pessoa.filiacao_mae && conjuge1Filiacao?.mae) {
        pessoa.filiacao_mae = conjuge1Filiacao.mae as string;
      }
      if (!pessoa.naturalidade && conjuge1Naturalidade) {
        pessoa.naturalidade = conjuge1Naturalidade;
      }
      if (!pessoa.nacionalidade && conjuge1Nacionalidade) {
        pessoa.nacionalidade = conjuge1Nacionalidade;
      }
      addSource(pessoa, 'estado_civil', source);
      console.log(`[map-to-fields] Updated ${pessoa.nome} with marriage info (conjuge: ${conjuge2Nome})`);
    }
    if (matchesConjuge(pessoa, conjuge2Cpf, conjuge2Nome)) {
      pessoa.estado_civil = 'casado';
      pessoa.regime_bens = dados.regime_bens as string | undefined;
      pessoa.data_casamento = dados.data_casamento as string | undefined;
      pessoa.conjuge = conjuge1Nome;
      // Map filiacao from marriage certificate if not already set
      if (!pessoa.filiacao_pai && conjuge2Filiacao?.pai) {
        pessoa.filiacao_pai = conjuge2Filiacao.pai as string;
      }
      if (!pessoa.filiacao_mae && conjuge2Filiacao?.mae) {
        pessoa.filiacao_mae = conjuge2Filiacao.mae as string;
      }
      if (!pessoa.naturalidade && conjuge2Naturalidade) {
        pessoa.naturalidade = conjuge2Naturalidade;
      }
      if (!pessoa.nacionalidade && conjuge2Nacionalidade) {
        pessoa.nacionalidade = conjuge2Nacionalidade;
      }
      addSource(pessoa, 'estado_civil', source);
      console.log(`[map-to-fields] Updated ${pessoa.nome} with marriage info (conjuge: ${conjuge1Nome})`);
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

  // Handle V2 extraction format with nested structures
  const matriculaData = dados.matricula as Record<string, unknown> | undefined;
  const imovelData = dados.imovel as Record<string, unknown> | undefined;
  const certidaoData = dados.certidao as Record<string, unknown> | undefined;
  const proprietariosData = dados.proprietarios_atuais as Array<unknown> | undefined;

  // Map matricula fields - try nested V2 format first, then flat format
  result.matricula_numero = (matriculaData?.numero as string)
    || (dados.matricula_numero as string)
    || result.matricula_numero;

  result.registro_imoveis = (matriculaData?.cartorio as string)
    || (dados.cartorio as string)
    || result.registro_imoveis;

  result.cidade = (matriculaData?.comarca as string)
    || (imovelData?.cidade as string)
    || (dados.cidade as string)
    || result.cidade;

  result.estado = (imovelData?.uf as string)
    || (dados.estado as string)
    || result.estado;

  // Map imovel fields from nested structure
  result.tipo = (imovelData?.tipo as string)
    || (dados.tipo_imovel as string)
    || result.tipo;

  result.area_total = (imovelData?.area_total_m2 as string)
    || (dados.area_total as string)
    || result.area_total;

  result.area_privativa = (imovelData?.area_privativa_m2 as string)
    || (dados.area_privativa as string)
    || result.area_privativa;

  // Map endereco from imovel nested structure
  if (imovelData) {
    if (!result.endereco) {
      result.endereco = {};
    }
    result.endereco.logradouro = (imovelData.logradouro as string) || result.endereco.logradouro;
    result.endereco.numero = (imovelData.numero as string) || result.endereco.numero;
    result.endereco.complemento = (imovelData.complemento as string) || result.endereco.complemento;
    result.endereco.bairro = (imovelData.bairro as string) || result.endereco.bairro;
    result.endereco.cidade = (imovelData.cidade as string) || result.endereco.cidade;
    result.endereco.estado = (imovelData.uf as string) || result.endereco.estado;
    result.endereco.cep = (imovelData.cep as string) || result.endereco.cep;

    // Map fracao ideal
    if (imovelData.fracao_ideal) {
      result.fracao_ideal = String(imovelData.fracao_ideal);
    }
  }

  // Map certidao data if available
  if (certidaoData) {
    console.log('[map-to-fields] Certidao data found:', certidaoData);
  }

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

  // Capture current owners - try V2 format first
  if (proprietariosData && proprietariosData.length > 0) {
    result.proprietarios = proprietariosData as Imovel['proprietarios'];
  } else if (dados.proprietarios) {
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

/**
 * Correlate identity documents - match front/back of RGs
 *
 * Problem: RG front has name but no CPF, RG back has CPF but no name
 * Solution: Try to match based on shared attributes (naturalidade, data_nascimento, filiacao)
 *
 * Also consolidates entries: if we have both nome:JOHN and a CPF entry for the same person,
 * merge them into one entry keyed by CPF
 */
function correlateIdentityDocuments(pessoas: Map<string, PessoaNatural>) {
  // Separate entries with only name vs entries with only CPF
  const onlyName: Array<[string, PessoaNatural]> = [];
  const onlyCpf: Array<[string, PessoaNatural]> = [];
  const alreadyMatched = new Set<string>();

  for (const [key, pessoa] of pessoas.entries()) {
    const hasName = pessoa.nome && pessoa.nome.trim() !== '';
    const hasCpf = pessoa.cpf && pessoa.cpf.trim() !== '';

    if (hasName && !hasCpf && key.startsWith('nome:')) {
      onlyName.push([key, pessoa]);
    } else if (hasCpf && !hasName) {
      onlyCpf.push([key, pessoa]);
    }
  }

  console.log(`[map-to-fields] Correlation: ${onlyName.length} name-only entries, ${onlyCpf.length} CPF-only entries`);

  // Try to match onlyName entries with onlyCpf entries based on shared attributes
  for (const [nameKey, namePessoa] of onlyName) {
    let bestMatch: { key: string; pessoa: PessoaNatural; score: number } | null = null;

    for (const [cpfKey, cpfPessoa] of onlyCpf) {
      if (alreadyMatched.has(cpfKey)) continue;

      // Calculate correlation score based on shared attributes
      let score = 0;

      // Naturalidade match (strong indicator)
      if (namePessoa.naturalidade && cpfPessoa.naturalidade) {
        const nat1 = namePessoa.naturalidade.toUpperCase().replace(/\s+/g, '');
        const nat2 = cpfPessoa.naturalidade.toUpperCase().replace(/\s+/g, '');
        if (nat1 === nat2) score += 3;
        else if (nat1.includes(nat2) || nat2.includes(nat1)) score += 2;
      }

      // Data nascimento match (very strong indicator)
      if (namePessoa.data_nascimento && cpfPessoa.data_nascimento) {
        const date1 = namePessoa.data_nascimento.replace(/\D/g, '');
        const date2 = cpfPessoa.data_nascimento.replace(/\D/g, '');
        if (date1 === date2) score += 5;
      }

      // Filiacao match (strong indicator)
      if (namePessoa.filiacao_pai && cpfPessoa.filiacao_pai) {
        const pai1 = namePessoa.filiacao_pai.toUpperCase();
        const pai2 = cpfPessoa.filiacao_pai.toUpperCase();
        if (pai1 === pai2) score += 3;
      }
      if (namePessoa.filiacao_mae && cpfPessoa.filiacao_mae) {
        const mae1 = namePessoa.filiacao_mae.toUpperCase();
        const mae2 = cpfPessoa.filiacao_mae.toUpperCase();
        if (mae1 === mae2) score += 3;
      }

      // RG orgao emissor match - same state indicates likely same person
      if (namePessoa.orgao_emissor_rg && cpfPessoa.orgao_emissor_rg) {
        const org1 = namePessoa.orgao_emissor_rg.toUpperCase();
        const org2 = cpfPessoa.orgao_emissor_rg.toUpperCase();
        // Both from SP (SSP-SP and IIRGD-PCSP are both SP)
        if ((org1.includes('SP') || org1.includes('PCSP')) && (org2.includes('SP') || org2.includes('PCSP'))) {
          score += 1;
        }
      }

      // Track best match
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { key: cpfKey, pessoa: cpfPessoa, score };
      }
    }

    // If we found a match with score >= 1, merge
    if (bestMatch && bestMatch.score >= 1) {
      console.log(`[map-to-fields] Correlating ${namePessoa.nome} with CPF ${bestMatch.pessoa.cpf} (score: ${bestMatch.score})`);

      bestMatch.pessoa.nome = namePessoa.nome;
      mergePersonData(bestMatch.pessoa, namePessoa);

      // Merge sources
      if (namePessoa._fontes) {
        for (const [field, sources] of Object.entries(namePessoa._fontes)) {
          if (!bestMatch.pessoa._fontes) bestMatch.pessoa._fontes = {};
          if (!bestMatch.pessoa._fontes[field]) bestMatch.pessoa._fontes[field] = [];
          bestMatch.pessoa._fontes[field].push(...sources);
        }
      }

      pessoas.delete(nameKey);
      alreadyMatched.add(bestMatch.key);
    }
  }

  // FALLBACK: If we have exactly the same number of unmatched name-only and CPF-only entries,
  // and both come from the same document type (RG), match them in order
  // This handles cases like separate front/back photos of the same RG stack
  const remainingNames = onlyName.filter(([key]) => pessoas.has(key));
  const remainingCpfs = onlyCpf.filter(([key]) => !alreadyMatched.has(key));

  if (remainingNames.length > 0 && remainingNames.length === remainingCpfs.length) {
    console.log(`[map-to-fields] Fallback: Matching ${remainingNames.length} remaining entries by order`);

    // Sort by source filename for consistent ordering
    const sortBySource = (a: [string, PessoaNatural], b: [string, PessoaNatural]) => {
      const sourceA = a[1]._fontes?.nome?.[0] || a[1]._fontes?.cpf?.[0] || '';
      const sourceB = b[1]._fontes?.nome?.[0] || b[1]._fontes?.cpf?.[0] || '';
      return sourceA.localeCompare(sourceB);
    };

    remainingNames.sort(sortBySource);
    remainingCpfs.sort(sortBySource);

    for (let i = 0; i < remainingNames.length; i++) {
      const [nameKey, namePessoa] = remainingNames[i];
      const [, cpfPessoa] = remainingCpfs[i];

      console.log(`[map-to-fields] Fallback match: ${namePessoa.nome} with CPF ${cpfPessoa.cpf}`);

      cpfPessoa.nome = namePessoa.nome;
      mergePersonData(cpfPessoa, namePessoa);

      if (namePessoa._fontes) {
        for (const [field, sources] of Object.entries(namePessoa._fontes)) {
          if (!cpfPessoa._fontes) cpfPessoa._fontes = {};
          if (!cpfPessoa._fontes[field]) cpfPessoa._fontes[field] = [];
          cpfPessoa._fontes[field].push(...sources);
        }
      }

      pessoas.delete(nameKey);
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
