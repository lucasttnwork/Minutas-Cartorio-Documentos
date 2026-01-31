/**
 * Data Aggregator for Minuta Generation
 *
 * Collects all data from database and formats it for LLM consumption.
 * Handles Brazilian formatting for dates, currency, and documents.
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// ============ TYPE DEFINITIONS ============

export interface Endereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface MinutaBasica {
  id: string;
  titulo: string;
  tipo_ato: string;
  data_lavratura: string;
}

export interface PessoaNaturalCompleta {
  tipo: 'natural';
  nome: string;
  cpf: string;
  cpf_formatado: string;
  rg: string;
  orgao_emissor_rg: string;
  estado_emissor_rg: string;
  nacionalidade: string;
  estado_civil: string;
  regime_bens: string;
  profissao: string;
  data_nascimento: string;
  data_nascimento_formatada: string;
  endereco: Endereco | null;
  endereco_formatado: string;
  conjuge?: string;
}

export interface PessoaJuridicaCompleta {
  tipo: 'juridica';
  razao_social: string;
  cnpj: string;
  cnpj_formatado: string;
  inscricao_estadual: string;
  endereco: Endereco | null;
  endereco_formatado: string;
  representantes?: RepresentanteLegal[];
}

export interface RepresentanteLegal {
  nome: string;
  cpf: string;
  cpf_formatado: string;
  cargo: string;
}

export type PessoaCompleta = PessoaNaturalCompleta | PessoaJuridicaCompleta;

export interface ImovelCompleto {
  id: string;
  matricula_numero: string;
  matricula_cartorio: string;
  descricao: string;
  tipo_imovel: string;
  area_privativa: string;
  area_comum: string;
  area_total: string;
  area_construida: string;
  endereco_completo: string;
  inscricao_municipal: string;
  valor_venal: string;
  valor_venal_formatado: string;
  fracao_ideal: string;
  dados_adicionais: Record<string, unknown> | null;
}

export interface NegocioJuridicoCompleto {
  id: string;
  tipo_negocio: string;
  valor: number | null;
  valor_formatado: string;
  valor_extenso: string;
  forma_pagamento: string;
  condicoes: Record<string, unknown> | null;
  data_contrato: string;
  data_contrato_formatada: string;
}

export interface Certidao {
  tipo: string;
  numero: string;
  data_expedicao: string;
  validade: string;
  pessoa_relacionada?: string;
}

export interface MinutaCompleta {
  minuta: MinutaBasica;
  outorgantes: PessoaCompleta[];
  outorgados: PessoaCompleta[];
  imoveis: ImovelCompleto[];
  negocio: NegocioJuridicoCompleto | null;
  certidoes: Certidao[];
}

// ============ BRAZILIAN MONTHS ============

const MESES_BRASILEIROS = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// ============ FORMATTING FUNCTIONS ============

/**
 * Converts ISO date (YYYY-MM-DD) to Brazilian format (DD de MMMM de YYYY)
 */
export function formatDateBrazilian(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  try {
    // Handle ISO datetime format
    const dateOnly = dateStr.substring(0, 10);
    const [year, month, day] = dateOnly.split('-').map(Number);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return '';
    if (month < 1 || month > 12 || day < 1 || day > 31) return '';

    const mesNome = MESES_BRASILEIROS[month - 1];
    return `${day.toString().padStart(2, '0')} de ${mesNome} de ${year}`;
  } catch {
    return '';
  }
}

/**
 * Formats number to Brazilian currency (R$ X.XXX,XX)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Number to extenso (written form) in Portuguese
 */
function numberToExtenso(num: number): string {
  if (num === 0) return 'zero';

  const unidades = ['', 'um', 'dois', 'tres', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezADezenove = [
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze',
    'dezesseis', 'dezessete', 'dezoito', 'dezenove',
  ];
  const dezenas = [
    '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta',
    'sessenta', 'setenta', 'oitenta', 'noventa',
  ];
  const centenas = [
    '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
    'seiscentos', 'setecentos', 'oitocentos', 'novecentos',
  ];

  function extensoAte999(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'cem';

    const partes: string[] = [];

    const c = Math.floor(n / 100);
    const resto = n % 100;

    if (c > 0) {
      partes.push(centenas[c]);
    }

    if (resto > 0) {
      if (resto < 10) {
        partes.push(unidades[resto]);
      } else if (resto < 20) {
        partes.push(dezADezenove[resto - 10]);
      } else {
        const d = Math.floor(resto / 10);
        const u = resto % 10;
        if (u === 0) {
          partes.push(dezenas[d]);
        } else {
          partes.push(`${dezenas[d]} e ${unidades[u]}`);
        }
      }
    }

    return partes.join(' e ');
  }

  function extensoInteiro(n: number): string {
    if (n === 0) return 'zero';

    const partes: string[] = [];

    // Milhoes
    const milhoes = Math.floor(n / 1000000);
    const restoMilhoes = n % 1000000;

    if (milhoes > 0) {
      if (milhoes === 1) {
        partes.push('um milhao');
      } else {
        partes.push(`${extensoAte999(milhoes)} milhoes`);
      }
    }

    // Milhares
    const milhares = Math.floor(restoMilhoes / 1000);
    const restoMilhares = restoMilhoes % 1000;

    if (milhares > 0) {
      if (milhares === 1) {
        partes.push('mil');
      } else {
        partes.push(`${extensoAte999(milhares)} mil`);
      }
    }

    // Centenas/dezenas/unidades
    if (restoMilhares > 0) {
      partes.push(extensoAte999(restoMilhares));
    }

    // Join with proper connector
    if (partes.length === 0) return 'zero';

    // Check if we need "de" before "reais"
    // Used when there are only millions without smaller units
    const needsDe = milhoes > 0 && restoMilhoes === 0;

    let result = partes[0];
    for (let i = 1; i < partes.length; i++) {
      // Use "e" as connector
      result += ' e ' + partes[i];
    }

    return needsDe ? result + ' de' : result;
  }

  return extensoInteiro(Math.floor(num));
}

/**
 * Formats currency with extenso (written form)
 */
export function formatCurrencyExtended(value: number | null | undefined): { valor: string; extenso: string } {
  if (value === null || value === undefined) {
    return { valor: '', extenso: '' };
  }

  const reais = Math.floor(value);
  const centavos = Math.round((value - reais) * 100);

  const valorFormatado = formatCurrency(value);

  let extenso = '';

  if (reais === 0 && centavos === 0) {
    extenso = 'zero reais';
  } else if (reais === 0) {
    // Only centavos
    if (centavos === 1) {
      extenso = 'um centavo';
    } else {
      extenso = `${numberToExtenso(centavos)} centavos`;
    }
  } else if (centavos === 0) {
    // Only reais
    const extensoReais = numberToExtenso(reais);
    // Check if extenso ends with "de" (millions case)
    if (extensoReais.endsWith(' de')) {
      extenso = `${extensoReais} reais`;
    } else if (reais === 1) {
      extenso = 'um real';
    } else {
      extenso = `${extensoReais} reais`;
    }
  } else {
    // Both reais and centavos
    const extensoReais = numberToExtenso(reais);
    const extensoCentavos = centavos === 1 ? 'um centavo' : `${numberToExtenso(centavos)} centavos`;

    if (extensoReais.endsWith(' de')) {
      extenso = `${extensoReais} reais e ${extensoCentavos}`;
    } else if (reais === 1) {
      extenso = `um real e ${extensoCentavos}`;
    } else {
      extenso = `${extensoReais} reais e ${extensoCentavos}`;
    }
  }

  return { valor: valorFormatado, extenso };
}

/**
 * Formats CPF with punctuation (XXX.XXX.XXX-XX)
 */
export function formatCpf(cpf: string | null | undefined): string {
  if (!cpf) return '';

  // Remove non-digits
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf; // Return as-is if invalid

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Formats CNPJ with punctuation (XX.XXX.XXX/XXXX-XX)
 */
export function formatCnpj(cnpj: string | null | undefined): string {
  if (!cnpj) return '';

  // Remove non-digits
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj; // Return as-is if invalid

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Formats address as a single line
 */
export function formatEndereco(endereco: Endereco | null | undefined): string {
  if (!endereco) return '';

  const parts: string[] = [];

  if (endereco.logradouro) {
    parts.push(endereco.logradouro);
  }

  if (endereco.numero) {
    parts.push(endereco.numero);
  }

  if (endereco.complemento) {
    parts.push(endereco.complemento);
  }

  if (endereco.bairro) {
    parts.push(endereco.bairro);
  }

  if (endereco.cidade && endereco.estado) {
    parts.push(`${endereco.cidade}/${endereco.estado}`);
  } else if (endereco.cidade) {
    parts.push(endereco.cidade);
  }

  if (endereco.cep) {
    parts.push(`CEP ${endereco.cep}`);
  }

  return parts.join(', ');
}

/**
 * Formats area value (number to "X,XX m2")
 */
function formatArea(area: number | null | undefined): string {
  if (area === null || area === undefined) return '';
  return `${area.toFixed(2).replace('.', ',')} m2`;
}

// ============ DATA AGGREGATION ============

/**
 * Aggregates all minuta data from database and formats for LLM consumption
 */
export async function aggregateMinutaData(
  supabase: SupabaseClient,
  minutaId: string
): Promise<MinutaCompleta> {
  // Fetch all data in parallel
  const [
    { data: minuta, error: minutaError },
    { data: pessoasNaturais },
    { data: pessoasJuridicas },
    { data: imoveis },
    { data: negocios },
    { data: documentos },
  ] = await Promise.all([
    supabase.from('minutas').select('*').eq('id', minutaId).single(),
    supabase.from('pessoas_naturais').select('*').eq('minuta_id', minutaId),
    supabase.from('pessoas_juridicas').select('*').eq('minuta_id', minutaId),
    supabase.from('imoveis').select('*').eq('minuta_id', minutaId),
    supabase.from('negocios_juridicos').select('*').eq('minuta_id', minutaId),
    supabase.from('documentos').select('*').eq('minuta_id', minutaId),
  ]);

  if (minutaError || !minuta) {
    throw new Error(`Minuta not found: ${minutaId}`);
  }

  // Format minuta basica
  const minutaBasica: MinutaBasica = {
    id: minuta.id,
    titulo: minuta.titulo,
    tipo_ato: minuta.tipo_ato,
    data_lavratura: formatDateBrazilian(minuta.created_at),
  };

  // Process pessoas naturais
  const pessoasNaturaisFormatadas = (pessoasNaturais || []).map((p: Record<string, unknown>) => formatPessoaNatural(p));

  // Process pessoas juridicas
  const pessoasJuridicasFormatadas = (pessoasJuridicas || []).map((p: Record<string, unknown>) => formatPessoaJuridica(p));

  // Combine and separate by papel
  const todasPessoas = [...pessoasNaturaisFormatadas, ...pessoasJuridicasFormatadas];

  const outorgantes = todasPessoas.filter((p) => {
    const raw = [...(pessoasNaturais || []), ...(pessoasJuridicas || [])].find(
      (raw: Record<string, unknown>) =>
        (p.tipo === 'natural' && raw.id === (p as PessoaNaturalCompleta).nome && raw.papel === 'outorgante') ||
        (p.tipo === 'juridica' && raw.id === (p as PessoaJuridicaCompleta).razao_social && raw.papel === 'outorgante')
    );
    return raw;
  });

  // Actually, let's do this properly by tracking papel during formatting
  const outorgantesNaturais = (pessoasNaturais || [])
    .filter((p: Record<string, unknown>) => p.papel === 'outorgante')
    .map((p: Record<string, unknown>) => formatPessoaNatural(p));

  const outorgantesJuridicas = (pessoasJuridicas || [])
    .filter((p: Record<string, unknown>) => p.papel === 'outorgante')
    .map((p: Record<string, unknown>) => formatPessoaJuridica(p));

  const outorgadosNaturais = (pessoasNaturais || [])
    .filter((p: Record<string, unknown>) => p.papel === 'outorgado')
    .map((p: Record<string, unknown>) => formatPessoaNatural(p));

  const outorgadosJuridicas = (pessoasJuridicas || [])
    .filter((p: Record<string, unknown>) => p.papel === 'outorgado')
    .map((p: Record<string, unknown>) => formatPessoaJuridica(p));

  // Process imoveis
  const imoveisFormatados = (imoveis || []).map((i: Record<string, unknown>) => formatImovel(i));

  // Process negocio juridico (take first one)
  const negocio = negocios && negocios.length > 0 ? formatNegocio(negocios[0]) : null;

  // Extract certidoes from documentos (simplified)
  const certidoes = extractCertidoes(documentos || []);

  return {
    minuta: minutaBasica,
    outorgantes: [...outorgantesNaturais, ...outorgantesJuridicas],
    outorgados: [...outorgadosNaturais, ...outorgadosJuridicas],
    imoveis: imoveisFormatados,
    negocio,
    certidoes,
  };
}

/**
 * Formats pessoa natural from database row
 */
function formatPessoaNatural(row: Record<string, unknown>): PessoaNaturalCompleta {
  const endereco = row.endereco as Endereco | null;

  return {
    tipo: 'natural',
    nome: (row.nome_completo as string) || '',
    cpf: (row.cpf as string) || '',
    cpf_formatado: formatCpf(row.cpf as string),
    rg: (row.rg as string) || '',
    orgao_emissor_rg: (row.orgao_emissor_rg as string) || '',
    estado_emissor_rg: (row.estado_emissor_rg as string) || '',
    nacionalidade: (row.nacionalidade as string) || '',
    estado_civil: (row.estado_civil as string) || '',
    regime_bens: (row.regime_bens as string) || '',
    profissao: (row.profissao as string) || '',
    data_nascimento: (row.data_nascimento as string) || '',
    data_nascimento_formatada: formatDateBrazilian(row.data_nascimento as string),
    endereco: endereco,
    endereco_formatado: formatEndereco(endereco),
    conjuge: (row.conjuge as string) || undefined,
  };
}

/**
 * Formats pessoa juridica from database row
 */
function formatPessoaJuridica(row: Record<string, unknown>): PessoaJuridicaCompleta {
  const endereco = row.endereco as Endereco | null;

  return {
    tipo: 'juridica',
    razao_social: (row.razao_social as string) || '',
    cnpj: (row.cnpj as string) || '',
    cnpj_formatado: formatCnpj(row.cnpj as string),
    inscricao_estadual: (row.inscricao_estadual as string) || '',
    endereco: endereco,
    endereco_formatado: formatEndereco(endereco),
    representantes: undefined, // TODO: fetch from related table if needed
  };
}

/**
 * Formats imovel from database row
 */
function formatImovel(row: Record<string, unknown>): ImovelCompleto {
  const dadosAdicionais = row.dados_adicionais as Record<string, unknown> | null;
  const valorVenal = dadosAdicionais?.valor_venal as number | null;

  return {
    id: (row.id as string) || '',
    matricula_numero: (row.matricula as string) || '',
    matricula_cartorio: (row.cartorio_registro as string) || '',
    descricao: (row.descricao as string) || '',
    tipo_imovel: (row.tipo_imovel as string) || '',
    area_privativa: formatArea(row.area_privativa as number | null),
    area_comum: formatArea(row.area_comum as number | null),
    area_total: formatArea(row.area_total as number | null),
    area_construida: formatArea(row.area_construida as number | null),
    endereco_completo: (row.endereco_completo as string) || '',
    inscricao_municipal: (row.inscricao_municipal as string) || '',
    valor_venal: valorVenal ? String(valorVenal) : '',
    valor_venal_formatado: formatCurrency(valorVenal),
    fracao_ideal: (dadosAdicionais?.fracao_ideal as string) || '',
    dados_adicionais: dadosAdicionais,
  };
}

/**
 * Formats negocio juridico from database row
 */
function formatNegocio(row: Record<string, unknown>): NegocioJuridicoCompleto {
  const valor = row.valor as number | null;
  const { valor: valorFormatado, extenso: valorExtenso } = formatCurrencyExtended(valor);

  return {
    id: (row.id as string) || '',
    tipo_negocio: (row.tipo_negocio as string) || '',
    valor: valor,
    valor_formatado: valorFormatado,
    valor_extenso: valorExtenso,
    forma_pagamento: (row.forma_pagamento as string) || '',
    condicoes: row.condicoes as Record<string, unknown> | null,
    data_contrato: (row.data_assinatura as string) || '',
    data_contrato_formatada: formatDateBrazilian(row.data_assinatura as string),
  };
}

/**
 * Extracts certidao information from documentos
 */
function extractCertidoes(documentos: Record<string, unknown>[]): Certidao[] {
  const certidaoTypes = [
    'certidao_nascimento',
    'certidao_casamento',
    'certidao_obito',
    'certidao_negativa',
  ];

  return documentos
    .filter((doc) => certidaoTypes.includes(doc.tipo_documento as string))
    .map((doc) => {
      const dados = doc.dados_extraidos as Record<string, unknown> | null;
      return {
        tipo: (doc.tipo_documento as string) || '',
        numero: (dados?.numero as string) || '',
        data_expedicao: formatDateBrazilian(dados?.data_expedicao as string),
        validade: formatDateBrazilian(dados?.validade as string),
        pessoa_relacionada: (dados?.pessoa_relacionada as string) || undefined,
      };
    });
}
