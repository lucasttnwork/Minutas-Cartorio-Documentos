// src/lib/type-mappers.ts
// Bidirectional mappers between frontend types and database types

import type {
  PessoaNatural,
  PessoaJuridica,
  Imovel,
  NegocioJuridico,
  Endereco,
  Contato,
  DadosFamiliares,
  CertidaoCNDT,
  CertidaoUniao,
  MatriculaImobiliaria,
  DescricaoImovel,
  CadastroImobiliario,
  ValoresVenais,
  NegativaIPTU,
  CertidaoMatricula,
  Proprietario,
  OnusRegistrado,
  RessalvasMatricula,
  RegistroVigente,
  CertidaoEmpresa,
  ParticipanteNegocio,
  FormaPagamentoDetalhada,
  TermosEspeciais,
  IndisponibilidadeBens,
  ImpostoTransmissao,
  FontesCampos,
} from '../types/minuta';
import type { Database, Json } from '../types/database.types';

// ============================================================================
// Estado Civil / Regime de Bens Normalization (Bidirectional)
// ============================================================================

/**
 * Maps normalized database values to frontend display values for estado civil
 * Database stores: "casado", "solteiro", etc.
 * Frontend displays: "Casado(a)", "Solteiro(a)", etc.
 */
const ESTADO_CIVIL_DB_TO_FRONTEND: Record<string, string> = {
  'solteiro': 'Solteiro(a)',
  'solteira': 'Solteiro(a)',
  'casado': 'Casado(a)',
  'casada': 'Casado(a)',
  'divorciado': 'Divorciado(a)',
  'divorciada': 'Divorciado(a)',
  'viuvo': 'Viúvo(a)',
  'viúvo': 'Viúvo(a)',
  'viuva': 'Viúvo(a)',
  'viúva': 'Viúvo(a)',
  'separado': 'Separado(a)',
  'separada': 'Separado(a)',
  'uniao_estavel': 'União Estável',
  'uniao estavel': 'União Estável',
  'união estável': 'União Estável',
};

const ESTADO_CIVIL_FRONTEND_TO_DB: Record<string, string> = {
  'Solteiro(a)': 'solteiro',
  'Casado(a)': 'casado',
  'Divorciado(a)': 'divorciado',
  'Viúvo(a)': 'viuvo',
  'Separado(a)': 'separado',
  'União Estável': 'uniao_estavel',
};

/**
 * Maps normalized database values to frontend display values for regime de bens
 * Database stores: "comunhao parcial", "comunhao_parcial", etc.
 * Frontend displays: "Comunhão Parcial", etc.
 */
const REGIME_BENS_DB_TO_FRONTEND: Record<string, string> = {
  'comunhao parcial': 'Comunhão Parcial',
  'comunhao_parcial': 'Comunhão Parcial',
  'comunhão parcial': 'Comunhão Parcial',
  'comunhao parcial de bens': 'Comunhão Parcial',
  'comunhão parcial de bens': 'Comunhão Parcial',
  'comunhao universal': 'Comunhão Universal',
  'comunhao_universal': 'Comunhão Universal',
  'comunhão universal': 'Comunhão Universal',
  'comunhao universal de bens': 'Comunhão Universal',
  'comunhão universal de bens': 'Comunhão Universal',
  'separacao total': 'Separação Total',
  'separacao_total': 'Separação Total',
  'separação total': 'Separação Total',
  'separacao total de bens': 'Separação Total',
  'separação total de bens': 'Separação Total',
  'participacao final': 'Participação Final nos Aquestos',
  'participacao_final_aquestos': 'Participação Final nos Aquestos',
  'participação final nos aquestos': 'Participação Final nos Aquestos',
  'participacao final nos aquestos': 'Participação Final nos Aquestos',
};

const REGIME_BENS_FRONTEND_TO_DB: Record<string, string> = {
  'Comunhão Parcial': 'comunhao_parcial',
  'Comunhão Universal': 'comunhao_universal',
  'Separação Total': 'separacao_total',
  'Participação Final nos Aquestos': 'participacao_final_aquestos',
};

/**
 * Converts a database estado_civil value to frontend format
 * @param dbValue - The value from the database (e.g., "casado", "solteiro")
 * @returns The frontend display value (e.g., "Casado(a)", "Solteiro(a)")
 */
export function normalizeEstadoCivilFromDb(dbValue: string | null | undefined): string {
  if (!dbValue) return '';

  const normalized = dbValue.toLowerCase().trim();
  return ESTADO_CIVIL_DB_TO_FRONTEND[normalized] || dbValue;
}

/**
 * Converts a frontend estado_civil value to database format
 * @param frontendValue - The value from the frontend (e.g., "Casado(a)")
 * @returns The database value (e.g., "casado")
 */
export function normalizeEstadoCivilToDb(frontendValue: string | null | undefined): string | null {
  if (!frontendValue) return null;

  return ESTADO_CIVIL_FRONTEND_TO_DB[frontendValue] || frontendValue.toLowerCase();
}

/**
 * Converts a database regime_bens value to frontend format
 * @param dbValue - The value from the database (e.g., "comunhao parcial")
 * @returns The frontend display value (e.g., "Comunhão Parcial")
 */
export function normalizeRegimeBensFromDb(dbValue: string | null | undefined): string {
  if (!dbValue) return '';

  const normalized = dbValue.toLowerCase().trim();
  return REGIME_BENS_DB_TO_FRONTEND[normalized] || dbValue;
}

/**
 * Converts a frontend regime_bens value to database format
 * @param frontendValue - The value from the frontend (e.g., "Comunhão Parcial")
 * @returns The database value (e.g., "comunhao_parcial")
 */
export function normalizeRegimeBensToDb(frontendValue: string | null | undefined): string | null {
  if (!frontendValue) return null;

  return REGIME_BENS_FRONTEND_TO_DB[frontendValue] || frontendValue.toLowerCase().replace(/ /g, '_');
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalizes a date value to YYYY-MM-DD format
 */
export function normalizeDate(date: string | Date | null): string | null {
  if (date === null || date === '') {
    return null;
  }

  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  // If already in YYYY-MM-DD format or ISO string
  if (typeof date === 'string') {
    // Handle ISO datetime strings
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    // Already in YYYY-MM-DD
    return date;
  }

  return null;
}

/**
 * Formats a date string for database insertion
 */
export function formatDateForDb(isoString: string | null): string | null {
  if (!isoString || isoString === '') {
    return null;
  }
  return normalizeDate(isoString);
}

/**
 * Parses a numeric string (handles Brazilian format 1.234,56)
 */
export function parseNumeric(value: string | null): number | null {
  if (value === null || value === '') {
    return null;
  }

  // Remove R$ prefix and spaces
  let cleaned = value.replace(/R\$\s*/g, '').trim();

  // Check if it's Brazilian format (has comma as decimal separator)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Brazilian format: 1.234,56 -> 1234.56
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',') && !cleaned.includes('.')) {
    // Only comma: 1234,56 -> 1234.56
    cleaned = cleaned.replace(',', '.');
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Formats a number to a string with 2 decimal places
 */
export function formatNumeric(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return value.toFixed(2);
}

/**
 * Formats a number as currency string (simple format, no R$ prefix)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return value.toFixed(2);
}

/**
 * Parses a currency string to number
 */
export function parseCurrency(value: string | null): number | null {
  return parseNumeric(value);
}

/**
 * Returns an empty string if value is null/undefined, otherwise the value
 */
function emptyIfNull(value: string | null | undefined): string {
  return value ?? '';
}

/**
 * Returns null if string is empty, otherwise the string
 */
function nullIfEmpty(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return value;
}

// ============================================================================
// Empty Object Creators
// ============================================================================

function createEmptyEndereco(): Endereco {
  return {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  };
}

function createEmptyContato(): Contato {
  return {
    email: '',
    telefone: '',
  };
}

function createEmptyDadosFamiliares(): DadosFamiliares {
  return {
    estadoCivil: '',
    regimeBens: '',
    dataCasamento: '',
    dataSeparacao: '',
    dataDivorcio: '',
    dataFalecimentoConjuge: '',
    uniaoEstavel: false,
    dataUniaoEstavel: '',
    dataExtincaoUniaoEstavel: '',
    regimeBensUniao: '',
  };
}

function createEmptyCNDT(): CertidaoCNDT {
  return {
    numeroCNDT: '',
    dataExpedicao: '',
    horaExpedicao: '',
  };
}

function createEmptyCertidaoUniao(): CertidaoUniao {
  return {
    tipoCertidao: '',
    dataEmissao: '',
    horaEmissao: '',
    validade: '',
    codigoControle: '',
  };
}

function createEmptyMatricula(): MatriculaImobiliaria {
  return {
    numeroMatricula: '',
    numeroRegistroImoveis: '',
    cidadeRegistroImoveis: '',
    estadoRegistroImoveis: '',
    numeroNacionalMatricula: '',
  };
}

function createEmptyDescricao(): DescricaoImovel {
  return {
    denominacao: '',
    areaTotalM2: '',
    areaPrivativaM2: '',
    areaConstruida: '',
    endereco: createEmptyEndereco(),
    descricaoConformeMatricula: '',
  };
}

function createEmptyCadastro(): CadastroImobiliario {
  return {
    cadastroMunicipalSQL: '',
    dataExpedicaoCertidao: '',
  };
}

function createEmptyValoresVenais(): ValoresVenais {
  return {
    valorVenalIPTU: '',
    valorVenalReferenciaITBI: '',
  };
}

function createEmptyNegativaIPTU(): NegativaIPTU {
  return {
    numeroCertidao: '',
    dataExpedicao: '',
    certidaoValida: '',
  };
}

function createEmptyCertidaoMatricula(): CertidaoMatricula {
  return {
    certidaoMatricula: '',
    dataExpedicao: '',
    certidaoValida: '',
  };
}

function createEmptyRessalvas(): RessalvasMatricula {
  return {
    existeRessalva: '',
    descricaoRessalva: '',
  };
}

function createEmptyRegistroVigente(): RegistroVigente {
  return {
    instrumentoConstitutivo: '',
    juntaComercial: '',
    numeroRegistro: '',
    dataSessaoRegistro: '',
  };
}

function createEmptyCertidaoEmpresa(): CertidaoEmpresa {
  return {
    dataExpedicaoFichaCadastral: '',
    dataExpedicaoCertidaoRegistro: '',
  };
}

function createEmptyFormaPagamentoDetalhada(): FormaPagamentoDetalhada {
  return {
    tipo: '',
    data: '',
    modo: '',
    contaOrigem: { banco: '', agencia: '', conta: '' },
    contaDestino: { banco: '', agencia: '', conta: '' },
  };
}

function createEmptyTermosEspeciais(): TermosEspeciais {
  return {
    termosPromessa: '',
    termosEspeciais: '',
    condicaoResolutiva: '',
  };
}

function createEmptyIndisponibilidade(): IndisponibilidadeBens {
  return {
    consultaRealizada: false,
    dataConsulta: '',
    resultados: [],
  };
}

function createEmptyImpostoTransmissao(): ImpostoTransmissao {
  return {
    numeroGuiaITBI: '',
    baseCalculo: '',
    valorGuia: '',
  };
}

// ============================================================================
// JSON Helpers
// ============================================================================


function jsonToEndereco(json: Json | null): Endereco {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return createEmptyEndereco();
  }
  const obj = json as Record<string, unknown>;
  return {
    logradouro: emptyIfNull(obj.logradouro as string | null),
    numero: emptyIfNull(obj.numero as string | null),
    complemento: emptyIfNull(obj.complemento as string | null),
    bairro: emptyIfNull(obj.bairro as string | null),
    cidade: emptyIfNull(obj.cidade as string | null),
    estado: emptyIfNull(obj.estado as string | null),
    cep: emptyIfNull(obj.cep as string | null),
  };
}

function enderecoToString(endereco: Endereco): string {
  const parts = [
    endereco.logradouro,
    endereco.numero,
    endereco.complemento,
    endereco.bairro,
    endereco.cidade,
    endereco.estado,
    endereco.cep,
  ].filter(Boolean);
  return parts.join(', ');
}

// ============================================================================
// Pessoa Natural Mappers
// ============================================================================

// Note: Database types are outdated. Using Record<string, unknown> until types are regenerated.
// IMPORTANT: This mapper only includes fields that are tracked/editable in the frontend.
// Fields like conjuge_nome, conjuge_cpf, nome_pai, nome_mae are populated by backend extraction
// and should NOT be overwritten by frontend auto-save (they would be set to null and destroy data).
export function frontendToDbPessoaNatural(
  pessoa: PessoaNatural,
  minutaId: string,
  papel: 'outorgante' | 'outorgado' | 'anuente'
): Record<string, unknown> {
  // Build the base object with all frontend-tracked fields
  const baseData: Record<string, unknown> = {
    minuta_id: minutaId,
    nome: pessoa.nome,
    cpf: nullIfEmpty(pessoa.cpf),
    rg: nullIfEmpty(pessoa.rg),
    rg_orgao_emissor: nullIfEmpty(pessoa.orgaoEmissorRg),
    rg_estado: nullIfEmpty(pessoa.estadoEmissorRg),
    rg_data_emissao: nullIfEmpty(pessoa.dataEmissaoRg),
    nacionalidade: nullIfEmpty(pessoa.nacionalidade),
    data_nascimento: nullIfEmpty(pessoa.dataNascimento),
    estado_civil: normalizeEstadoCivilToDb(pessoa.dadosFamiliares?.estadoCivil),
    regime_bens: normalizeRegimeBensToDb(pessoa.dadosFamiliares?.regimeBens),
    profissao: nullIfEmpty(pessoa.profissao),
    data_casamento: nullIfEmpty(pessoa.dadosFamiliares?.dataCasamento),
    endereco_logradouro: pessoa.domicilio?.logradouro || null,
    endereco_numero: pessoa.domicilio?.numero || null,
    endereco_complemento: pessoa.domicilio?.complemento || null,
    endereco_bairro: pessoa.domicilio?.bairro || null,
    endereco_cidade: pessoa.domicilio?.cidade || null,
    endereco_estado: pessoa.domicilio?.estado || null,
    endereco_cep: pessoa.domicilio?.cep || null,
    email: pessoa.contato?.email || null,
    telefone: pessoa.contato?.telefone || null,
    cndt_numero: pessoa.cndt?.numeroCNDT || null,
    cndt_data_expedicao: pessoa.cndt?.dataExpedicao || null,
    papel: papel,
  };

  // NOTE: The following backend-only fields are intentionally OMITTED:
  // - conjuge_nome: Extracted from marriage certificates, not editable in UI
  // - conjuge_cpf: Extracted from marriage certificates, not editable in UI
  // - nome_pai: Extracted from documents, not editable in UI
  // - nome_mae: Extracted from documents, not editable in UI
  // - naturalidade: Not tracked in frontend
  //
  // By omitting these fields from updates, we preserve values set by backend extraction.

  return baseData;
}

// Note: Database types are outdated. Using Record<string, unknown> until types are regenerated.
export function dbToFrontendPessoaNatural(
  row: Record<string, unknown>
): PessoaNatural {
  // Build endereco from individual columns
  const endereco: Endereco = {
    logradouro: emptyIfNull(row.endereco_logradouro as string | null),
    numero: emptyIfNull(row.endereco_numero as string | null),
    complemento: emptyIfNull(row.endereco_complemento as string | null),
    bairro: emptyIfNull(row.endereco_bairro as string | null),
    cidade: emptyIfNull(row.endereco_cidade as string | null),
    estado: emptyIfNull(row.endereco_estado as string | null),
    cep: emptyIfNull(row.endereco_cep as string | null),
  };

  // Parse fontes (source documents tracking)
  let fontes: FontesCampos | undefined;
  if (row.fontes && typeof row.fontes === 'object' && !Array.isArray(row.fontes)) {
    fontes = row.fontes as FontesCampos;
  }

  return {
    id: row.id as string,
    nome: emptyIfNull(row.nome as string | null),
    cpf: emptyIfNull(row.cpf as string | null),
    rg: emptyIfNull(row.rg as string | null),
    orgaoEmissorRg: emptyIfNull(row.rg_orgao_emissor as string | null),
    estadoEmissorRg: emptyIfNull(row.rg_estado as string | null),
    dataEmissaoRg: emptyIfNull(row.rg_data_emissao as string | null),
    nacionalidade: emptyIfNull(row.nacionalidade as string | null),
    profissao: emptyIfNull(row.profissao as string | null),
    dataNascimento: emptyIfNull(row.data_nascimento as string | null),
    dataObito: '',
    cnh: '',
    orgaoEmissorCnh: '',
    dadosFamiliares: {
      ...createEmptyDadosFamiliares(),
      estadoCivil: normalizeEstadoCivilFromDb(row.estado_civil as string | null),
      regimeBens: normalizeRegimeBensFromDb(row.regime_bens as string | null),
      dataCasamento: emptyIfNull(row.data_casamento as string | null),
    },
    domicilio: endereco,
    contato: {
      email: emptyIfNull(row.email as string | null),
      telefone: emptyIfNull(row.telefone as string | null),
    },
    cndt: {
      numeroCNDT: emptyIfNull(row.cndt_numero as string | null),
      dataExpedicao: emptyIfNull(row.cndt_data_expedicao as string | null),
      horaExpedicao: '',
    },
    certidaoUniao: createEmptyCertidaoUniao(),
    camposEditados: [],
    fontes,
  };
}

// ============================================================================
// Pessoa Juridica Mappers
// ============================================================================

export function frontendToDbPessoaJuridica(
  pessoa: PessoaJuridica,
  minutaId: string,
  papel: 'outorgante' | 'outorgado' | 'anuente'
): Database['public']['Tables']['pessoas_juridicas']['Insert'] {
  return {
    minuta_id: minutaId,
    razao_social: pessoa.razaoSocial,
    nome_fantasia: nullIfEmpty(pessoa.razaoSocial), // Use razaoSocial as fallback
    cnpj: nullIfEmpty(pessoa.cnpj),
    inscricao_estadual: nullIfEmpty(pessoa.inscricaoEstadual),
    papel: papel,
  } as any;
}

export function dbToFrontendPessoaJuridica(
  row: Database['public']['Tables']['pessoas_juridicas']['Row']
): PessoaJuridica {
  const rowAny = row as any;
  const endereco = jsonToEndereco(rowAny.endereco);

  return {
    id: row.id,
    razaoSocial: row.razao_social,
    cnpj: emptyIfNull(row.cnpj),
    nire: '',
    inscricaoEstadual: emptyIfNull(row.inscricao_estadual),
    dataConstituicao: '',
    endereco: endereco,
    contato: createEmptyContato(),
    registroVigente: createEmptyRegistroVigente(),
    certidaoEmpresa: createEmptyCertidaoEmpresa(),
    representantes: [],
    administradores: [],
    procuradores: [],
    cndt: createEmptyCNDT(),
    certidaoUniao: createEmptyCertidaoUniao(),
    camposEditados: [],
  };
}

// ============================================================================
// Imovel Mappers
// ============================================================================

export function frontendToDbImovel(
  imovel: Imovel,
  minutaId: string
): Database['public']['Tables']['imoveis']['Insert'] {
  const enderecoStr = imovel.descricao?.endereco
    ? enderecoToString(imovel.descricao.endereco)
    : '';

  // Store all complex data in dados_adicionais
  const dadosAdicionais = {
    matriculaCompleta: imovel.matricula,
    descricao: {
      denominacao: imovel.descricao?.denominacao ?? '',
      areaTotalM2: imovel.descricao?.areaTotalM2 ?? '',
      areaPrivativaM2: imovel.descricao?.areaPrivativaM2 ?? '',
      areaConstruida: imovel.descricao?.areaConstruida ?? '',
      descricaoConformeMatricula: imovel.descricao?.descricaoConformeMatricula ?? '',
    },
    cadastro: imovel.cadastro,
    valoresVenais: imovel.valoresVenais,
    negativaIPTU: imovel.negativaIPTU,
    certidaoMatricula: imovel.certidaoMatricula,
    proprietarios: imovel.proprietarios,
    onus: imovel.onus,
    ressalvas: imovel.ressalvas,
  } as unknown as Json;

  return {
    minuta_id: minutaId,
    tipo_imovel: nullIfEmpty(imovel.descricao?.denominacao),
    endereco_completo: nullIfEmpty(enderecoStr),
    matricula: nullIfEmpty(imovel.matricula?.numeroMatricula),
    cartorio_registro: nullIfEmpty(imovel.matricula?.numeroRegistroImoveis),
    area_total: parseNumeric(imovel.descricao?.areaTotalM2 ?? null),
    area_construida: parseNumeric(imovel.descricao?.areaConstruida ?? null),
    inscricao_municipal: nullIfEmpty(imovel.cadastro?.cadastroMunicipalSQL),
    dados_adicionais: dadosAdicionais,
  } as any;
}

export function dbToFrontendImovel(
  row: Database['public']['Tables']['imoveis']['Row']
): Imovel {
  const rowAny = row as any;
  const dados = rowAny.dados_adicionais as Record<string, unknown> | null;

  // Extract matricula from dados_adicionais or reconstruct from basic fields
  let matricula: MatriculaImobiliaria;
  if (dados?.matriculaCompleta && typeof dados.matriculaCompleta === 'object') {
    const mc = dados.matriculaCompleta as Record<string, unknown>;
    matricula = {
      numeroMatricula: emptyIfNull(mc.numeroMatricula as string | null) || emptyIfNull(rowAny.matricula_numero),
      numeroRegistroImoveis: emptyIfNull(mc.numeroRegistroImoveis as string | null) || emptyIfNull(rowAny.matricula_registro_imoveis),
      cidadeRegistroImoveis: emptyIfNull(mc.cidadeRegistroImoveis as string | null) || emptyIfNull(rowAny.matricula_cidade),
      estadoRegistroImoveis: emptyIfNull(mc.estadoRegistroImoveis as string | null) || emptyIfNull(rowAny.matricula_estado),
      numeroNacionalMatricula: emptyIfNull(mc.numeroNacionalMatricula as string | null),
    };
  } else {
    matricula = {
      ...createEmptyMatricula(),
      numeroMatricula: emptyIfNull(rowAny.matricula_numero),
      numeroRegistroImoveis: emptyIfNull(rowAny.matricula_registro_imoveis),
      cidadeRegistroImoveis: emptyIfNull(rowAny.matricula_cidade),
      estadoRegistroImoveis: emptyIfNull(rowAny.matricula_estado),
    };
  }

  // Extract descricao from dados_adicionais
  let descricao: DescricaoImovel;
  if (dados?.descricao && typeof dados.descricao === 'object') {
    const d = dados.descricao as Record<string, unknown>;
    descricao = {
      denominacao: emptyIfNull(d.denominacao as string | null),
      areaTotalM2: emptyIfNull(d.areaTotalM2 as string | null) || formatNumeric(rowAny.area_total),
      areaPrivativaM2: emptyIfNull(d.areaPrivativaM2 as string | null),
      areaConstruida: emptyIfNull(d.areaConstruida as string | null) || formatNumeric(rowAny.area_construida),
      endereco: createEmptyEndereco(),
      descricaoConformeMatricula: emptyIfNull(d.descricaoConformeMatricula as string | null),
    };
  } else {
    descricao = {
      ...createEmptyDescricao(),
      areaTotalM2: formatNumeric(rowAny.area_total),
      areaConstruida: formatNumeric(rowAny.area_construida),
    };
  }

  // Extract cadastro from dados_adicionais
  let cadastro: CadastroImobiliario;
  if (dados?.cadastro && typeof dados.cadastro === 'object') {
    const c = dados.cadastro as Record<string, unknown>;
    cadastro = {
      cadastroMunicipalSQL: emptyIfNull(c.cadastroMunicipalSQL as string | null) || emptyIfNull(rowAny.inscricao_municipal),
      dataExpedicaoCertidao: emptyIfNull(c.dataExpedicaoCertidao as string | null),
    };
  } else {
    cadastro = {
      ...createEmptyCadastro(),
      cadastroMunicipalSQL: emptyIfNull(rowAny.inscricao_municipal),
    };
  }

  // Extract valoresVenais from dados_adicionais
  let valoresVenais: ValoresVenais = createEmptyValoresVenais();
  if (dados?.valoresVenais && typeof dados.valoresVenais === 'object') {
    const v = dados.valoresVenais as Record<string, unknown>;
    valoresVenais = {
      valorVenalIPTU: emptyIfNull(v.valorVenalIPTU as string | null),
      valorVenalReferenciaITBI: emptyIfNull(v.valorVenalReferenciaITBI as string | null),
    };
  }

  // Extract negativaIPTU from dados_adicionais
  let negativaIPTU: NegativaIPTU = createEmptyNegativaIPTU();
  if (dados?.negativaIPTU && typeof dados.negativaIPTU === 'object') {
    const n = dados.negativaIPTU as Record<string, unknown>;
    negativaIPTU = {
      numeroCertidao: emptyIfNull(n.numeroCertidao as string | null),
      dataExpedicao: emptyIfNull(n.dataExpedicao as string | null),
      certidaoValida: emptyIfNull(n.certidaoValida as string | null),
    };
  }

  // Extract certidaoMatricula from dados_adicionais
  let certidaoMatricula: CertidaoMatricula = createEmptyCertidaoMatricula();
  if (dados?.certidaoMatricula && typeof dados.certidaoMatricula === 'object') {
    const cm = dados.certidaoMatricula as Record<string, unknown>;
    certidaoMatricula = {
      certidaoMatricula: emptyIfNull(cm.certidaoMatricula as string | null),
      dataExpedicao: emptyIfNull(cm.dataExpedicao as string | null),
      certidaoValida: emptyIfNull(cm.certidaoValida as string | null),
    };
  }

  // Extract proprietarios from dados_adicionais
  let proprietarios: Proprietario[] = [];
  if (dados?.proprietarios && Array.isArray(dados.proprietarios)) {
    proprietarios = dados.proprietarios as Proprietario[];
  }

  // Extract onus from dados_adicionais
  let onus: OnusRegistrado[] = [];
  if (dados?.onus && Array.isArray(dados.onus)) {
    onus = dados.onus as OnusRegistrado[];
  }

  // Extract ressalvas from dados_adicionais
  let ressalvas: RessalvasMatricula = createEmptyRessalvas();
  if (dados?.ressalvas && typeof dados.ressalvas === 'object') {
    const r = dados.ressalvas as Record<string, unknown>;
    ressalvas = {
      existeRessalva: emptyIfNull(r.existeRessalva as string | null),
      descricaoRessalva: emptyIfNull(r.descricaoRessalva as string | null),
    };
  }

  return {
    id: rowAny.id,
    matricula,
    descricao,
    cadastro,
    valoresVenais,
    negativaIPTU,
    certidaoMatricula,
    proprietarios,
    onus,
    ressalvas,
    camposEditados: [],
  };
}

// ============================================================================
// Negocio Juridico Mappers
// ============================================================================

export function frontendToDbNegocio(
  negocio: NegocioJuridico,
  minutaId: string,
  _imovelId: string
): Database['public']['Tables']['negocios_juridicos']['Insert'] {
  // Store all complex data in condicoes
  const condicoes = {
    imovelId: negocio.imovelId,
    fracaoIdealAlienada: negocio.fracaoIdealAlienada,
    valorTotalAlienacao: negocio.valorTotalAlienacao,
    formaPagamentoDetalhada: negocio.formaPagamentoDetalhada,
    alienantes: negocio.alienantes,
    adquirentes: negocio.adquirentes,
    termosEspeciais: negocio.termosEspeciais,
    declaracoes: negocio.declaracoes,
    dispensas: negocio.dispensas,
    indisponibilidade: negocio.indisponibilidade,
    impostoTransmissao: negocio.impostoTransmissao,
    condicoesEspeciais: negocio.condicoesEspeciais,
    clausulasAdicionais: negocio.clausulasAdicionais,
  } as unknown as Json;

  return {
    minuta_id: minutaId,
    tipo_negocio: negocio.tipoAto,
    valor: parseNumeric(negocio.valorNegocio),
    moeda: 'BRL',
    forma_pagamento: nullIfEmpty(negocio.formaPagamento),
    condicoes,
    data_assinatura: nullIfEmpty(negocio.formaPagamentoDetalhada?.data),
  } as any;
}

export function dbToFrontendNegocio(
  row: Database['public']['Tables']['negocios_juridicos']['Row']
): NegocioJuridico {
  const rowAny = row as any;
  const condicoes = rowAny.condicoes as Record<string, unknown> | null;

  // Extract impostoTransmissao from condicoes
  let impostoTransmissao: ImpostoTransmissao = createEmptyImpostoTransmissao();
  if (condicoes?.impostoTransmissao && typeof condicoes.impostoTransmissao === 'object') {
    const it = condicoes.impostoTransmissao as Record<string, unknown>;
    impostoTransmissao = {
      numeroGuiaITBI: emptyIfNull(it.numeroGuiaITBI as string | null),
      baseCalculo: emptyIfNull(it.baseCalculo as string | null),
      valorGuia: emptyIfNull(it.valorGuia as string | null),
    };
  }

  // Extract formaPagamentoDetalhada from condicoes
  let formaPagamentoDetalhada: FormaPagamentoDetalhada = createEmptyFormaPagamentoDetalhada();
  if (condicoes?.formaPagamentoDetalhada && typeof condicoes.formaPagamentoDetalhada === 'object') {
    formaPagamentoDetalhada = condicoes.formaPagamentoDetalhada as FormaPagamentoDetalhada;
  }

  // Extract termosEspeciais from condicoes
  let termosEspeciais: TermosEspeciais = createEmptyTermosEspeciais();
  if (condicoes?.termosEspeciais && typeof condicoes.termosEspeciais === 'object') {
    termosEspeciais = condicoes.termosEspeciais as TermosEspeciais;
  }

  // Extract indisponibilidade from condicoes
  let indisponibilidade: IndisponibilidadeBens = createEmptyIndisponibilidade();
  if (condicoes?.indisponibilidade && typeof condicoes.indisponibilidade === 'object') {
    indisponibilidade = condicoes.indisponibilidade as IndisponibilidadeBens;
  }

  // Extract alienantes and adquirentes from condicoes
  let alienantes: ParticipanteNegocio[] = [];
  if (condicoes?.alienantes && Array.isArray(condicoes.alienantes)) {
    alienantes = condicoes.alienantes as ParticipanteNegocio[];
  }

  let adquirentes: ParticipanteNegocio[] = [];
  if (condicoes?.adquirentes && Array.isArray(condicoes.adquirentes)) {
    adquirentes = condicoes.adquirentes as ParticipanteNegocio[];
  }

  return {
    id: rowAny.id,
    imovelId: emptyIfNull(condicoes?.imovelId as string | null),
    tipoAto: rowAny.tipo_negocio,
    fracaoIdealAlienada: emptyIfNull(condicoes?.fracaoIdealAlienada as string | null),
    valorTotalAlienacao: emptyIfNull(condicoes?.valorTotalAlienacao as string | null),
    valorNegocio: formatCurrency(rowAny.valor),
    formaPagamento: emptyIfNull(rowAny.forma_pagamento),
    formaPagamentoDetalhada,
    alienantes,
    adquirentes,
    termosEspeciais,
    declaracoes: (condicoes?.declaracoes as Record<string, boolean>) ?? {},
    dispensas: (condicoes?.dispensas as Record<string, boolean>) ?? {},
    indisponibilidade,
    impostoTransmissao,
    condicoesEspeciais: emptyIfNull(condicoes?.condicoesEspeciais as string | null),
    clausulasAdicionais: emptyIfNull(condicoes?.clausulasAdicionais as string | null),
    camposEditados: [],
  };
}
