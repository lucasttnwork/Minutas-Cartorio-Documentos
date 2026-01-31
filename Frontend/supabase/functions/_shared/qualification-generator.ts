/**
 * Qualification Text Generator for Brazilian Notarial Documents
 *
 * Generates qualification text for pessoas físicas (natural persons) following
 * Brazilian notarial standards for various civil statuses.
 *
 * Supported civil statuses:
 * - Solteiro (Single)
 * - Casado sem pacto (Married without prenuptial agreement)
 * - Casado com pacto (Married with prenuptial agreement)
 * - Divorciado (Divorced)
 * - Viúvo (Widowed)
 * - União estável (Stable union / Common-law marriage)
 */

import { Endereco } from './types.ts';

// ============ TYPE DEFINITIONS ============

export interface PactoAntenupcial {
  numero_registro: string;
  livro: string;
  tipo_livro: string; // e.g., "Registro Auxiliar"
  cartorio_numero: string;
  cartorio_tipo: string; // e.g., "Oficial de Registro de Imóveis"
  cidade: string;
  esta_capital: boolean;
}

export interface EscrituraUniaoEstavel {
  tabelionato_numero: string;
  tabelionato_tipo: string; // e.g., "Tabelionato de Notas"
  cidade: string;
  esta_capital: boolean;
  data: string;
  paginas: string;
  livro: string;
}

export interface UniaoEstavel {
  regime_bens: string;
  escritura: EscrituraUniaoEstavel;
  convivente: PessoaQualificacao;
}

export interface PessoaQualificacao {
  nome: string;
  nacionalidade: string;
  estado_civil: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  estado_civil_anterior?: 'solteiro' | 'divorciado' | 'viuvo'; // For união estável
  profissao: string;
  rg: string;
  orgao_emissor_rg: string;
  estado_emissor_rg: string;
  cpf: string;
  endereco?: Endereco;
  regime_bens?: string;
  data_casamento?: string;
  pacto_antenupcial?: PactoAntenupcial;
  conjuge?: Omit<PessoaQualificacao, 'endereco' | 'regime_bens' | 'data_casamento' | 'pacto_antenupcial' | 'conjuge' | 'uniao_estavel'>;
  uniao_estavel?: UniaoEstavel;
}

export interface QualificationOptions {
  conjuge_assina?: boolean; // Whether both spouses sign the document
  rg_separador?: '-' | ' '; // Separator between RG number and issuing agency
  nesta_cidade?: boolean; // Use "nesta cidade" instead of city name
}

// ============ HELPER FUNCTIONS ============

/**
 * Determines if the person is feminine based on nationality ending in 'a'
 */
function isFeminine(nacionalidade: string): boolean {
  return nacionalidade.toLowerCase().endsWith('a');
}

/**
 * Gets the gendered form of estado civil
 */
function getEstadoCivilGendered(estadoCivil: string, feminine: boolean): string {
  const estadosCivis: Record<string, { m: string; f: string }> = {
    solteiro: { m: 'solteiro', f: 'solteira' },
    casado: { m: 'casado', f: 'casada' },
    divorciado: { m: 'divorciado', f: 'divorciada' },
    viuvo: { m: 'viúvo', f: 'viúva' },
    uniao_estavel: { m: 'convivente', f: 'convivente' }, // Not used directly in qualification
  };

  const estado = estadosCivis[estadoCivil];
  return estado ? (feminine ? estado.f : estado.m) : estadoCivil;
}

/**
 * Gets the gendered form of "domiciliado"
 */
function getDomiciliadoGendered(feminine: boolean, plural: boolean): string {
  if (plural) return 'domiciliados';
  return feminine ? 'domiciliada' : 'domiciliado';
}

/**
 * Gets the correct verb form for "reside"
 */
function getResideForm(plural: boolean): string {
  return plural ? 'residem' : 'reside';
}

/**
 * Gets the correct preposition for the city name
 * "em" for most cities, "no" for "Rio de Janeiro", "na" for feminine cities
 */
function getPreposicaoCidade(cidade: string): string {
  const cidadesComNo = ['Rio de Janeiro'];
  const cidadesComNa = ['Bahia', 'Paraíba']; // States/cities that use "na"

  if (cidadesComNo.some(c => cidade.includes(c))) {
    return 'no';
  }
  if (cidadesComNa.some(c => cidade.includes(c))) {
    return 'na';
  }
  return 'em';
}

/**
 * Formats the RG with issuing agency
 */
function formatRG(rg: string, orgao: string, estado: string, separador: string = '-'): string {
  return `${rg}${separador}${orgao}/${estado}`;
}

/**
 * Formats the address for qualification text
 */
function formatEndereco(endereco: Endereco): string {
  const parts: string[] = [];

  if (endereco.logradouro) {
    parts.push(endereco.logradouro);
  }

  if (endereco.numero) {
    parts.push(`n. ${endereco.numero}`);
  }

  if (endereco.complemento) {
    parts.push(endereco.complemento);
  }

  if (endereco.bairro) {
    parts.push(endereco.bairro);
  }

  if (endereco.cep) {
    parts.push(`CEP ${endereco.cep}`);
  }

  return parts.join(', ');
}

/**
 * Formats ordinal number (1º, 2º, 3º, etc.)
 */
function formatOrdinal(numero: string): string {
  return `${numero}º`;
}

/**
 * Formats pacto antenupcial reference
 */
function formatPactoAntenupcial(pacto: PactoAntenupcial): string {
  const localidade = pacto.esta_capital ? 'desta Capital' : `de ${pacto.cidade}`;
  return `estando a escritura de pacto antenupcial devidamente registrada sob n. ${pacto.numero_registro} no Livro ${pacto.livro} de ${pacto.tipo_livro} do ${formatOrdinal(pacto.cartorio_numero)} ${pacto.cartorio_tipo} ${localidade}`;
}

/**
 * Formats união estável escritura reference
 */
function formatEscrituraUniaoEstavel(escritura: EscrituraUniaoEstavel): string {
  const localidade = escritura.esta_capital ? 'desta Capital' : `de ${escritura.cidade}`;
  return `conforme escritura de declaração lavrada no ${formatOrdinal(escritura.tabelionato_numero)} ${escritura.tabelionato_tipo} ${localidade} em ${escritura.data}, nas páginas ${escritura.paginas} do Livro ${escritura.livro}`;
}

/**
 * Formats basic person identification (name, nationality, civil status, profession, RG, CPF)
 */
function formatBasicIdentification(
  pessoa: PessoaQualificacao | Omit<PessoaQualificacao, 'endereco' | 'regime_bens' | 'data_casamento' | 'pacto_antenupcial' | 'conjuge' | 'uniao_estavel'>,
  options: QualificationOptions = {},
  useEstadoCivilAnterior: boolean = false
): string {
  const feminine = isFeminine(pessoa.nacionalidade);
  const estadoCivil = useEstadoCivilAnterior && 'estado_civil_anterior' in pessoa && pessoa.estado_civil_anterior
    ? pessoa.estado_civil_anterior
    : pessoa.estado_civil;
  const estadoCivilFormatted = getEstadoCivilGendered(estadoCivil, feminine);
  const rgSeparador = options.rg_separador || '-';

  return `**${pessoa.nome}**, ${pessoa.nacionalidade}, ${estadoCivilFormatted}, ${pessoa.profissao}, RG n. ${formatRG(pessoa.rg, pessoa.orgao_emissor_rg, pessoa.estado_emissor_rg, rgSeparador)}, CPF n. ${pessoa.cpf}`;
}

/**
 * Formats spouse basic identification (without estado civil for casado com conjuge assinando)
 */
function formatConjugeIdentification(
  conjuge: Omit<PessoaQualificacao, 'endereco' | 'regime_bens' | 'data_casamento' | 'pacto_antenupcial' | 'conjuge' | 'uniao_estavel'>,
  options: QualificationOptions = {}
): string {
  const rgSeparador = options.rg_separador || '-';

  return `**${conjuge.nome}**, ${conjuge.nacionalidade}, ${conjuge.profissao}, RG n. ${formatRG(conjuge.rg, conjuge.orgao_emissor_rg, conjuge.estado_emissor_rg, rgSeparador)}, CPF n. ${conjuge.cpf}`;
}

/**
 * Formats domicile portion of qualification
 */
function formatDomicilio(
  endereco: Endereco,
  feminine: boolean,
  plural: boolean,
  options: QualificationOptions = {}
): string {
  const domiciliado = getDomiciliadoGendered(feminine, plural);
  const reside = getResideForm(plural);

  let cidadePart: string;
  if (options.nesta_cidade) {
    cidadePart = 'nesta cidade';
  } else {
    const preposicao = getPreposicaoCidade(endereco.cidade || '');
    cidadePart = `${preposicao} ${endereco.cidade}`;
  }

  return `${domiciliado} ${cidadePart}, onde ${reside} na ${formatEndereco(endereco)}`;
}

// ============ MAIN GENERATION FUNCTIONS ============

/**
 * Generates qualification for solteiro/divorciado/viúvo (simple civil status)
 */
function generateSimpleQualification(
  pessoa: PessoaQualificacao,
  options: QualificationOptions = {}
): string {
  const feminine = isFeminine(pessoa.nacionalidade);
  const basicId = formatBasicIdentification(pessoa, options);
  const domicilio = formatDomicilio(pessoa.endereco!, feminine, false, options);

  return `${basicId}, ${domicilio}.`;
}

/**
 * Generates qualification for casado (married) - both spouses signing
 */
function generateCasadoAmbosAssinandoQualification(
  pessoa: PessoaQualificacao,
  options: QualificationOptions = {}
): string {
  const feminine = isFeminine(pessoa.nacionalidade);
  const rgSeparador = options.rg_separador || '-';

  // Main person without estado civil (will be in the "casados" part)
  const mainPersonParts = [
    `**${pessoa.nome}**`,
    pessoa.nacionalidade,
    pessoa.profissao,
    `RG n. ${formatRG(pessoa.rg, pessoa.orgao_emissor_rg, pessoa.estado_emissor_rg, rgSeparador)}`,
    `CPF n. ${pessoa.cpf}`,
  ];

  // Spouse
  const conjugeId = formatConjugeIdentification(pessoa.conjuge!, options);

  // Marriage info
  const marriageInfo = `casados sob o regime da ${pessoa.regime_bens} em ${pessoa.data_casamento}`;

  // Pacto antenupcial if exists
  const pactoInfo = pessoa.pacto_antenupcial
    ? `, ${formatPactoAntenupcial(pessoa.pacto_antenupcial)}`
    : '';

  // Domicile (plural)
  const domicilio = formatDomicilio(pessoa.endereco!, feminine, true, options);

  return `${mainPersonParts.join(', ')}, e seu cônjuge, ${conjugeId}, ${marriageInfo}${pactoInfo}, ${domicilio}.`;
}

/**
 * Generates qualification for casado (married) - only one signing
 */
function generateCasadoUmAssinandoQualification(
  pessoa: PessoaQualificacao,
  options: QualificationOptions = {}
): string {
  const feminine = isFeminine(pessoa.nacionalidade);
  const rgSeparador = options.rg_separador || '-';
  const estadoCivil = getEstadoCivilGendered('casado', feminine);

  // Main person parts
  const mainPersonParts = [
    `**${pessoa.nome}**`,
    pessoa.nacionalidade,
    pessoa.profissao,
    `RG n. ${formatRG(pessoa.rg, pessoa.orgao_emissor_rg, pessoa.estado_emissor_rg, rgSeparador)}`,
    `CPF n. ${pessoa.cpf}`,
  ];

  // Marriage info (singular)
  const marriageInfo = `${estadoCivil} sob o regime da ${pessoa.regime_bens} em ${pessoa.data_casamento}`;

  // Pacto antenupcial if exists
  const pactoInfo = pessoa.pacto_antenupcial
    ? `, ${formatPactoAntenupcial(pessoa.pacto_antenupcial)}`
    : '';

  // Spouse info
  const conjugeId = formatConjugeIdentification(pessoa.conjuge!, options);

  // Domicile (singular)
  const domicilio = formatDomicilio(pessoa.endereco!, feminine, false, options);

  return `${mainPersonParts.join(', ')}, ${marriageInfo}${pactoInfo}, com ${conjugeId}, ${domicilio}.`;
}

/**
 * Generates qualification for união estável (stable union)
 */
function generateUniaoEstavelQualification(
  pessoa: PessoaQualificacao,
  options: QualificationOptions = {}
): string {
  const feminine = isFeminine(pessoa.nacionalidade);
  const uniaoEstavel = pessoa.uniao_estavel!;

  // Main person with estado civil anterior
  const mainPersonId = formatBasicIdentification(pessoa, options, true);

  // Convivente with estado civil anterior
  const convivente = uniaoEstavel.convivente;
  const convivemteId = formatBasicIdentification(convivente, options, true);

  // União estável info
  const uniaoInfo = `conviventes em união estável regida pela ${uniaoEstavel.regime_bens}`;

  // Escritura reference
  const escrituraRef = formatEscrituraUniaoEstavel(uniaoEstavel.escritura);

  // Domicile (plural)
  const domicilio = formatDomicilio(pessoa.endereco!, feminine, true, options);

  return `${mainPersonId}, e ${convivemteId}, ${uniaoInfo}, ${escrituraRef}, ${domicilio}.`;
}

// ============ MAIN EXPORT ============

/**
 * Generates qualification text for a pessoa física (natural person)
 * following Brazilian notarial standards.
 *
 * @param pessoa - Person data
 * @param options - Optional configuration
 * @returns Formatted qualification text
 */
export function generateQualification(
  pessoa: PessoaQualificacao,
  options: QualificationOptions = {}
): string {
  switch (pessoa.estado_civil) {
    case 'solteiro':
    case 'divorciado':
    case 'viuvo':
      return generateSimpleQualification(pessoa, options);

    case 'casado':
      if (pessoa.conjuge) {
        if (options.conjuge_assina) {
          return generateCasadoAmbosAssinandoQualification(pessoa, options);
        } else {
          return generateCasadoUmAssinandoQualification(pessoa, options);
        }
      }
      // Casado without conjuge info - treat as simple
      return generateSimpleQualification(pessoa, options);

    case 'uniao_estavel':
      if (pessoa.uniao_estavel) {
        return generateUniaoEstavelQualification(pessoa, options);
      }
      // União estável without convivente info - shouldn't happen, but handle
      return generateSimpleQualification(pessoa, options);

    default:
      return generateSimpleQualification(pessoa, options);
  }
}

/**
 * Generates qualification text for multiple people (e.g., all outorgantes)
 *
 * @param pessoas - Array of person data
 * @param options - Optional configuration
 * @returns Array of formatted qualification texts
 */
export function generateQualifications(
  pessoas: PessoaQualificacao[],
  options: QualificationOptions = {}
): string[] {
  return pessoas.map(pessoa => generateQualification(pessoa, options));
}
