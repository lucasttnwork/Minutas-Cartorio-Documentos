/**
 * Persistence functions for mapped fields
 * Handles upsert, deduplication, and source tracking
 */

import { normalizeCpf, mergeFontes, parseCurrency, parseDate, parseArea } from './normalizers.ts';
import type { MappedFields, PessoaNatural, Imovel, NegocioJuridico } from '../_shared/types.ts';

// Supabase client type (simplified for edge functions)
interface SupabaseClient {
  from(table: string): TableQuery;
}

interface TableQuery {
  select(columns?: string): SelectQuery;
  insert(data: Record<string, unknown> | Record<string, unknown>[]): InsertQuery;
  update(data: Record<string, unknown>): UpdateQuery;
  upsert(data: Record<string, unknown> | Record<string, unknown>[]): UpsertQuery;
}

interface SelectQuery {
  eq(column: string, value: unknown): SelectQuery;
  single(): Promise<{ data: Record<string, unknown> | null; error: Error | null }>;
  maybeSingle(): Promise<{ data: Record<string, unknown> | null; error: Error | null }>;
}

interface InsertQuery {
  select(columns?: string): { single(): Promise<{ data: Record<string, unknown> | null; error: Error | null }> };
}

interface UpdateQuery {
  eq(column: string, value: unknown): { select(columns?: string): { single(): Promise<{ data: Record<string, unknown> | null; error: Error | null }> } };
}

interface UpsertQuery {
  select(columns?: string): { single(): Promise<{ data: Record<string, unknown> | null; error: Error | null }> };
}

/**
 * Main function to persist all mapped fields to database
 * Handles deduplication and source tracking
 */
export async function persistMappedFields(
  supabaseClient: SupabaseClient,
  minutaId: string,
  result: MappedFields
): Promise<{
  pessoas_ids: string[];
  imovel_id: string | null;
  negocio_id: string | null;
}> {
  const pessoasIds: string[] = [];

  // 1. ALIENANTES (outorgantes)
  for (const pessoa of result.alienantes) {
    const id = await upsertPessoaNatural(supabaseClient, pessoa, minutaId, 'outorgante');
    if (id) pessoasIds.push(id);
  }

  // 2. ADQUIRENTES (outorgados)
  for (const pessoa of result.adquirentes) {
    const id = await upsertPessoaNatural(supabaseClient, pessoa, minutaId, 'outorgado');
    if (id) pessoasIds.push(id);
  }

  // 3. ANUENTES
  for (const pessoa of result.anuentes) {
    const id = await upsertPessoaNatural(supabaseClient, pessoa, minutaId, 'anuente');
    if (id) pessoasIds.push(id);
  }

  // 4. IMOVEL
  const imovelId = await upsertImovel(supabaseClient, result.imovel, minutaId);

  // 5. NEGOCIO (needs imovel_id)
  let negocioId: string | null = null;
  if (result.negocio) {
    negocioId = await upsertNegocio(supabaseClient, result.negocio, minutaId, imovelId);
  }

  return {
    pessoas_ids: pessoasIds,
    imovel_id: imovelId,
    negocio_id: negocioId,
  };
}

/**
 * Upsert pessoa natural with deduplication by CPF
 * If person with same CPF exists in this minuta, merge data
 * Otherwise, insert new person
 */
export async function upsertPessoaNatural(
  supabase: SupabaseClient,
  pessoa: PessoaNatural,
  minutaId: string,
  papel: 'outorgante' | 'outorgado' | 'anuente' | 'representante' | 'procurador'
): Promise<string | null> {
  const cpfNormalizado = normalizeCpf(pessoa.cpf);

  // If no CPF, insert as new (can't deduplicate without it)
  if (!cpfNormalizado) {
    const insertData = buildPessoaInsertData(pessoa, minutaId, papel);
    const { data, error } = await supabase
      .from('pessoas_naturais')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting pessoa:', error);
      return null;
    }
    return data?.id as string || null;
  }

  // Check if pessoa with this CPF already exists in this minuta
  const { data: existing } = await supabase
    .from('pessoas_naturais')
    .select('id, fontes, nome, rg, rg_orgao_emissor, rg_estado, rg_data_emissao, data_nascimento, nacionalidade, naturalidade, profissao, estado_civil, regime_bens, conjuge_nome, conjuge_cpf, data_casamento, nome_pai, nome_mae, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep, email, telefone, cndt_numero, cndt_data_expedicao, cndt_validade, cndt_status')
    .eq('minuta_id', minutaId)
    .eq('cpf', cpfNormalizado)
    .maybeSingle();

  if (existing && existing.id) {
    // MERGE: Update existing pessoa with new data
    const mergedFontes = mergeFontes(
      existing.fontes as Record<string, string[]> | null,
      pessoa._fontes
    );

    // Build update data - only update null/empty fields with new values
    const updateData: Record<string, unknown> = {
      fontes: mergedFontes,
      updated_at: new Date().toISOString(),
    };

    // Merge fields - incoming data fills gaps, doesn't overwrite existing
    if (pessoa.nome && !existing.nome) updateData.nome = pessoa.nome;
    if (pessoa.rg && !existing.rg) updateData.rg = pessoa.rg;
    if (pessoa.orgao_emissor_rg && !existing.rg_orgao_emissor) updateData.rg_orgao_emissor = pessoa.orgao_emissor_rg;
    if (pessoa.estado_emissor_rg && !existing.rg_estado) updateData.rg_estado = pessoa.estado_emissor_rg;
    if (pessoa.data_emissao_rg && !existing.rg_data_emissao) updateData.rg_data_emissao = parseDate(pessoa.data_emissao_rg);
    if (pessoa.data_nascimento && !existing.data_nascimento) updateData.data_nascimento = parseDate(pessoa.data_nascimento);
    if (pessoa.nacionalidade && !existing.nacionalidade) updateData.nacionalidade = pessoa.nacionalidade;
    if (pessoa.naturalidade && !existing.naturalidade) updateData.naturalidade = pessoa.naturalidade;
    if (pessoa.profissao && !existing.profissao) updateData.profissao = pessoa.profissao;
    if (pessoa.estado_civil && !existing.estado_civil) updateData.estado_civil = pessoa.estado_civil;
    if (pessoa.regime_bens && !existing.regime_bens) updateData.regime_bens = pessoa.regime_bens;
    if (pessoa.conjuge && !existing.conjuge_nome) updateData.conjuge_nome = pessoa.conjuge;
    if (pessoa.data_casamento && !existing.data_casamento) updateData.data_casamento = parseDate(pessoa.data_casamento);
    if (pessoa.filiacao_pai && !existing.nome_pai) updateData.nome_pai = pessoa.filiacao_pai;
    if (pessoa.filiacao_mae && !existing.nome_mae) updateData.nome_mae = pessoa.filiacao_mae;

    // Endereco
    if (pessoa.endereco) {
      if (pessoa.endereco.logradouro && !existing.endereco_logradouro) updateData.endereco_logradouro = pessoa.endereco.logradouro;
      if (pessoa.endereco.numero && !existing.endereco_numero) updateData.endereco_numero = pessoa.endereco.numero;
      if (pessoa.endereco.complemento && !existing.endereco_complemento) updateData.endereco_complemento = pessoa.endereco.complemento;
      if (pessoa.endereco.bairro && !existing.endereco_bairro) updateData.endereco_bairro = pessoa.endereco.bairro;
      if (pessoa.endereco.cidade && !existing.endereco_cidade) updateData.endereco_cidade = pessoa.endereco.cidade;
      if (pessoa.endereco.estado && !existing.endereco_estado) updateData.endereco_estado = pessoa.endereco.estado;
      if (pessoa.endereco.cep && !existing.endereco_cep) updateData.endereco_cep = pessoa.endereco.cep;
    }

    // CNDT
    if (pessoa.cndt) {
      if (pessoa.cndt.numero && !existing.cndt_numero) updateData.cndt_numero = pessoa.cndt.numero;
      if (pessoa.cndt.data_expedicao && !existing.cndt_data_expedicao) updateData.cndt_data_expedicao = pessoa.cndt.data_expedicao;
      if (pessoa.cndt.validade && !existing.cndt_validade) updateData.cndt_validade = pessoa.cndt.validade;
      if (pessoa.cndt.status && !existing.cndt_status) updateData.cndt_status = pessoa.cndt.status;
    }

    await supabase
      .from('pessoas_naturais')
      .update(updateData)
      .eq('id', existing.id as string);

    return existing.id as string;
  } else {
    // INSERT: New pessoa
    const insertData = buildPessoaInsertData(pessoa, minutaId, papel);
    insertData.cpf = cpfNormalizado;

    const { data, error } = await supabase
      .from('pessoas_naturais')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting pessoa:', error);
      return null;
    }
    return data?.id as string || null;
  }
}

/**
 * Build insert data object for pessoa_natural
 */
function buildPessoaInsertData(
  pessoa: PessoaNatural,
  minutaId: string,
  papel: string
): Record<string, unknown> {
  return {
    minuta_id: minutaId,
    papel,
    nome: pessoa.nome,
    nacionalidade: pessoa.nacionalidade || null,
    naturalidade: pessoa.naturalidade || null,
    data_nascimento: parseDate(pessoa.data_nascimento),
    profissao: pessoa.profissao || null,
    estado_civil: pessoa.estado_civil || null,
    regime_bens: pessoa.regime_bens || null,
    cpf: normalizeCpf(pessoa.cpf) || null,
    rg: pessoa.rg || null,
    rg_orgao_emissor: pessoa.orgao_emissor_rg || null,
    rg_estado: pessoa.estado_emissor_rg || null,
    rg_data_emissao: parseDate(pessoa.data_emissao_rg),
    nome_pai: pessoa.filiacao_pai || null,
    nome_mae: pessoa.filiacao_mae || null,
    conjuge_nome: pessoa.conjuge || null,
    data_casamento: parseDate(pessoa.data_casamento),
    endereco_logradouro: pessoa.endereco?.logradouro || null,
    endereco_numero: pessoa.endereco?.numero || null,
    endereco_complemento: pessoa.endereco?.complemento || null,
    endereco_bairro: pessoa.endereco?.bairro || null,
    endereco_cidade: pessoa.endereco?.cidade || null,
    endereco_estado: pessoa.endereco?.estado || null,
    endereco_cep: pessoa.endereco?.cep || null,
    cndt_numero: pessoa.cndt?.numero || null,
    cndt_data_expedicao: pessoa.cndt?.data_expedicao || null,
    cndt_validade: pessoa.cndt?.validade || null,
    cndt_status: pessoa.cndt?.status || null,
    fontes: pessoa._fontes || {},
  };
}

/**
 * Upsert imovel for minuta
 * Only one imovel per minuta typically
 */
export async function upsertImovel(
  supabase: SupabaseClient,
  imovel: Imovel,
  minutaId: string
): Promise<string | null> {
  // Check if imovel already exists for this minuta
  const { data: existing } = await supabase
    .from('imoveis')
    .select('id, fontes')
    .eq('minuta_id', minutaId)
    .maybeSingle();

  const imovelData: Record<string, unknown> = {
    minuta_id: minutaId,
    matricula_numero: imovel.matricula_numero || null,
    matricula_registro_imoveis: imovel.registro_imoveis || null,
    matricula_cidade: imovel.cidade || null,
    matricula_estado: imovel.estado || null,
    tipo_imovel: imovel.tipo || null,
    edificio_nome: imovel.edificio || null,
    unidade: imovel.unidade || null,
    bloco: imovel.bloco || null,
    andar: imovel.andar || null,
    area_total: parseArea(imovel.area_total),
    area_privativa: parseArea(imovel.area_privativa),
    area_comum: parseArea(imovel.area_comum),
    fracao_ideal: imovel.fracao_ideal || null,
    logradouro: imovel.endereco?.logradouro || null,
    numero: imovel.endereco?.numero || null,
    complemento: imovel.endereco?.complemento || null,
    bairro: imovel.endereco?.bairro || null,
    cidade: imovel.endereco?.cidade || imovel.cidade || null,
    estado: imovel.endereco?.estado || imovel.estado || null,
    cep: imovel.endereco?.cep || null,
    sql_inscricao: imovel.sql || null,
    iptu_valor_venal: parseCurrency(imovel.iptu_valor_venal),
    vvr_valor: parseCurrency(imovel.vvr_valor),
    onus_ativos: imovel.onus_ativos || null,
    onus_historicos: imovel.onus_historicos || null,
    proprietarios: imovel.proprietarios || null,
  };

  if (existing && existing.id) {
    // Update existing
    imovelData.updated_at = new Date().toISOString();

    await supabase
      .from('imoveis')
      .update(imovelData)
      .eq('id', existing.id as string);

    return existing.id as string;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('imoveis')
      .insert(imovelData)
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting imovel:', error);
      return null;
    }
    return data?.id as string || null;
  }
}

/**
 * Upsert negocio juridico
 */
export async function upsertNegocio(
  supabase: SupabaseClient,
  negocio: NegocioJuridico,
  minutaId: string,
  imovelId: string | null
): Promise<string | null> {
  // Check if negocio already exists
  const { data: existing } = await supabase
    .from('negocios_juridicos')
    .select('id, fontes')
    .eq('minuta_id', minutaId)
    .maybeSingle();

  const negocioData: Record<string, unknown> = {
    minuta_id: minutaId,
    imovel_id: imovelId,
    tipo: negocio.tipo,
    valor_total: parseCurrency(negocio.valor_total),
    fracao_alienada: negocio.fracao_alienada || null,
    pagamento_tipo: negocio.pagamento?.tipo || null,
    valor_sinal: parseCurrency(negocio.pagamento?.sinal),
    valor_saldo: parseCurrency(negocio.pagamento?.saldo),
    pagamento_prazo: negocio.pagamento?.prazo || null,
    itbi_numero_guia: negocio.itbi?.numero_guia || null,
    itbi_base_calculo: parseCurrency(negocio.itbi?.base_calculo),
    itbi_valor: parseCurrency(negocio.itbi?.valor),
    itbi_data_vencimento: parseDate(negocio.itbi?.data_vencimento),
    itbi_data_pagamento: parseDate(negocio.itbi?.data_pagamento),
    corretagem_valor: parseCurrency(negocio.corretagem?.valor),
    corretagem_responsavel: negocio.corretagem?.responsavel || null,
    corretagem_intermediador: negocio.corretagem?.intermediador || null,
  };

  if (existing && existing.id) {
    // Update existing
    negocioData.updated_at = new Date().toISOString();

    await supabase
      .from('negocios_juridicos')
      .update(negocioData)
      .eq('id', existing.id as string);

    return existing.id as string;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('negocios_juridicos')
      .insert(negocioData)
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting negocio:', error);
      return null;
    }
    return data?.id as string || null;
  }
}
