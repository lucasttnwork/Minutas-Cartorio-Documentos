// supabase/functions/_shared/templates.ts
// Templates for minuta generation - qualifications and full deed templates

// ============================================================================
// TYPES
// ============================================================================

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface PessoaQualificacao {
  nome: string;
  cpf: string;
  rg?: string;
  orgaoEmissorRg?: string;
  estadoEmissorRg?: string;
  nacionalidade: string;
  profissao: string;
  estadoCivil: string;
  regimeBens?: string;
  dataCasamento?: string;
  pactoAntenupcial?: {
    numero: string;
    livro: string;
    cartorio: string;
  };
  conjuge?: PessoaQualificacao;
  uniaoEstavel?: {
    dataInicio: string;
    regime: string;
    tabelionato: string;
    livro: string;
    folha: string;
  };
  convivente?: PessoaQualificacao;
  domicilio: Endereco;
}

export interface PessoaJuridicaQualificacao {
  tipo: 'juridica';
  razaoSocial: string;
  cnpj: string;
  nire?: string;
  endereco: Endereco;
  juntaComercial?: string;
  representantes: Array<{
    nome: string;
    cpf: string;
    rg?: string;
    rne?: string;
    nacionalidade: string;
    profissao: string;
    estadoCivil: string;
  }>;
}

export interface ImovelMinuta {
  tipo: string;
  numero?: string;
  andar?: string;
  bloco?: string;
  edificio?: string;
  matricula: string;
  cartorio: string;
  cidade: string;
  areaPrivativa?: string;
  areaComum?: string;
  areaTotal?: string;
  endereco: Partial<Endereco>;
  cadastroMunicipal?: string;
  valorVenalReferencia?: string;
  tituloAquisitivo?: string;
  registroAquisicao?: string;
}

export interface Pagamento {
  valor: string;
  data: string;
  modo: string;
  contaOrigem?: {
    banco: string;
    agencia: string;
    conta: string;
    titular?: string;
  };
  contaDestino?: {
    banco: string;
    agencia: string;
    conta: string;
    titular?: string;
  };
}

export interface NegocioMinuta {
  valorTotal: string;
  baseCalculoITBI?: string;
  valorITBI?: string;
  formaPagamento: Pagamento[];
  compromisso?: {
    data: string;
    cidade?: string;
  };
}

export interface MinutaCompleta {
  dataLavratura: string;
  outorgantes: Array<PessoaQualificacao | PessoaJuridicaQualificacao>;
  outorgados: Array<PessoaQualificacao | PessoaJuridicaQualificacao>;
  imovel: ImovelMinuta;
  negocio: NegocioMinuta;
  indisponibilidades?: Array<{
    nome: string;
    hashCode: string;
    resultado: 'negativo' | 'positivo';
  }>;
  certidoes?: {
    cndt?: Array<{ numero: string; dataExpedicao: string; validade: string }>;
    cndFederal?: Array<{ codigo: string; dataExpedicao: string; validade: string }>;
    matricula?: { numero: string; dataExpedicao: string };
  };
}

export interface QualificationOptions {
  includeSpouse?: boolean;
  includeConvivente?: boolean;
  spouseSignsToo?: boolean;
}

// ============================================================================
// QUALIFICATION TEMPLATES
// Templates for person qualification based on civil status
// ============================================================================

export const QUALIFICATION_TEMPLATES = {
  // Solteiro - simplest form
  SOLTEIRO: `**{{NOME}},** {{NACIONALIDADE}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, RG n. {{RG}}-{{ORGAO_RG}}/{{ESTADO_RG}}, CPF n. {{CPF}}, domiciliado{{GENERO_A}} {{DOMICILIO_PREPOSICAO}} {{DOMICILIO_CIDADE}}, {{DOMICILIO_ESTADO}}, onde reside na {{DOMICILIO_ENDERECO}}.`,

  // Casado sem pacto antenupcial - ambos assinam
  CASADO_SEM_PACTO: `**{{NOME}},** {{NACIONALIDADE}}, {{PROFISSAO}}, RG n. {{RG}}-{{ORGAO_RG}}/{{ESTADO_RG}}, CPF n. {{CPF}}, e seu cônjuge, **{{CONJUGE_NOME}},** {{CONJUGE_NACIONALIDADE}}, {{CONJUGE_PROFISSAO}}, RG n. {{CONJUGE_RG}} {{CONJUGE_ORGAO_RG}}/{{CONJUGE_ESTADO_RG}}, CPF n. {{CONJUGE_CPF}}, casados sob o regime da {{REGIME_BENS}} em {{DATA_CASAMENTO}}, domiciliados {{DOMICILIO_PREPOSICAO}} {{DOMICILIO_CIDADE}}, onde residem na {{DOMICILIO_ENDERECO}}.`,

  // Casado com pacto antenupcial - ambos assinam
  CASADO_COM_PACTO_AMBOS: `**{{NOME}},** {{NACIONALIDADE}}, {{PROFISSAO}}, RG n. {{RG}} {{ORGAO_RG}}/{{ESTADO_RG}}, CPF n. {{CPF}}, e seu cônjuge, **{{CONJUGE_NOME}},** {{CONJUGE_NACIONALIDADE}}, {{CONJUGE_PROFISSAO}}, RG n. {{CONJUGE_RG}}-{{CONJUGE_ORGAO_RG}}/{{CONJUGE_ESTADO_RG}}, CPF n. {{CONJUGE_CPF}}, casados sob o regime da {{REGIME_BENS}} em {{DATA_CASAMENTO}}, estando a escritura de pacto antenupcial devidamente registrada sob n. {{PACTO_NUMERO}} no Livro {{PACTO_LIVRO}} de Registro Auxiliar do {{PACTO_CARTORIO}}, domiciliados {{DOMICILIO_PREPOSICAO}} {{DOMICILIO_CIDADE}}, onde residem na {{DOMICILIO_ENDERECO}}.`,

  // Casado com pacto - somente um assina
  CASADO_COM_PACTO_UM: `**{{NOME}},** {{NACIONALIDADE}}, {{PROFISSAO}}, RG n. {{RG}} {{ORGAO_RG}}/{{ESTADO_RG}}, CPF n. {{CPF}}, casado sob o regime da {{REGIME_BENS}} em {{DATA_CASAMENTO}}, estando a escritura de pacto antenupcial devidamente registrada sob n. {{PACTO_NUMERO}} no Livro {{PACTO_LIVRO}} de Registro Auxiliar do {{PACTO_CARTORIO}}, com **{{CONJUGE_NOME}},** {{CONJUGE_NACIONALIDADE}}, {{CONJUGE_PROFISSAO}}, RG n. {{CONJUGE_RG}} {{CONJUGE_ORGAO_RG}}/{{CONJUGE_ESTADO_RG}}, CPF n. {{CONJUGE_CPF}}, domiciliado {{DOMICILIO_PREPOSICAO}} {{DOMICILIO_CIDADE}}, onde reside na {{DOMICILIO_ENDERECO}}.`,

  // Uniao estavel
  UNIAO_ESTAVEL: `**{{NOME}},** {{NACIONALIDADE}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, RG n. {{RG}} {{ORGAO_RG}}/{{ESTADO_RG}}, CPF n. {{CPF}}, e **{{CONVIVENTE_NOME}},** {{CONVIVENTE_NACIONALIDADE}}, {{CONVIVENTE_ESTADO_CIVIL}}, {{CONVIVENTE_PROFISSAO}}, RG n. {{CONVIVENTE_RG}} {{CONVIVENTE_ORGAO_RG}}/{{CONVIVENTE_ESTADO_RG}}, CPF n. {{CONVIVENTE_CPF}}, conviventes em união estável regida pela {{REGIME_UNIAO}}, conforme escritura de declaração lavrada no {{UNIAO_TABELIONATO}} em {{DATA_UNIAO_ESTAVEL}}, nas páginas {{UNIAO_FOLHA}} do Livro {{UNIAO_LIVRO}}, domiciliados {{DOMICILIO_PREPOSICAO}} {{DOMICILIO_CIDADE}}, onde residem na {{DOMICILIO_ENDERECO}}.`,

  // Divorciado
  DIVORCIADO: `**{{NOME}},** {{NACIONALIDADE}}, divorciado{{GENERO_A}}, {{PROFISSAO}}, RG n. {{RG}}-{{ORGAO_RG}}/{{ESTADO_RG}}, CPF n. {{CPF}}, domiciliado{{GENERO_A}} {{DOMICILIO_PREPOSICAO}} {{DOMICILIO_CIDADE}}, {{DOMICILIO_ESTADO}}, onde reside na {{DOMICILIO_ENDERECO}}.`,

  // Viuvo
  VIUVO: `**{{NOME}},** {{NACIONALIDADE}}, viúvo{{GENERO_A}}, {{PROFISSAO}}, RG n. {{RG}}-{{ORGAO_RG}}/{{ESTADO_RG}}, CPF n. {{CPF}}, domiciliado{{GENERO_A}} {{DOMICILIO_PREPOSICAO}} {{DOMICILIO_CIDADE}}, {{DOMICILIO_ESTADO}}, onde reside na {{DOMICILIO_ENDERECO}}.`,

  // Pessoa Juridica
  PESSOA_JURIDICA: `**{{RAZAO_SOCIAL}},** CNPJ sob nº. {{CNPJ}}, com sede {{ENDERECO_PREPOSICAO}} {{ENDERECO_CIDADE}}, na {{ENDERECO_COMPLETO}}, com seu contrato social de constituição e suas alterações registrados na {{JUNTA_COMERCIAL}}, sob o NIRE n. {{NIRE}}, como consta na Ficha Cadastral emitida pela JUCESP dentro do prazo legal, autenticidade ____________, neste ato representada por seus administradores, {{REPRESENTANTES}}.`,
};

// ============================================================================
// MINUTA TEMPLATE - VENDA E COMPRA
// Full deed template with all placeholders
// ============================================================================

export const MINUTA_TEMPLATES = {
  VENDA_COMPRA: `**ESCRITURA DE VENDA E COMPRA**

Aos **{{DATA_LAVRATURA_EXTENSO}} ({{DATA_LAVRATURA}})**, nesta cidade e Comarca de São Paulo, neste Segundo Tabelionato de Notas, situado na Avenida Paulista, n. 1.776, Bela Vista, perante mim, **____________**, ____________, comparecem as partes entre si, justas e contratadas, a saber: **OUTORGANTES VENDEDORES:** {{OUTORGANTES_VENDEDORES}} **OUTORGADA COMPRADORA:** {{OUTORGADA_COMPRADORA}} **IDENTIFICAÇÃO E CAPACIDADE DAS PARTES:** Os presentes demonstram capacidade para este ato e se reconhecem mutuamente capazes, foram reconhecidos como sendo os próprios por mim e entre si à vista dos documentos acima referidos e apresentados, declarando, sob pena de responsabilidade civil e criminal, que se reconhecem mutuamente enquanto identificados, capazes e legítimos, estando corretos os seus dados de qualificação pessoal e estado civil e/ou empresarial e profissional, bem como serem legítimos os documentos de identificação apresentados e/ou os das pessoas jurídicas que representam, os quais reconhecem reciprocamente serem autênticos, atualizados e válidos, garantindo identificação, capacidade e legitimidade para o presente ato, do que dou fé. **IMÓVEL:** Disseram os outorgantes vendedores, sob pena de responsabilidade civil e penal, que, por justo título, são senhores e legítimos proprietários, livres e desembaraçados de quaisquer ônus reais, judiciais ou extrajudiciais, inclusive de natureza fiscal e pessoais reipersecutória, inexistindo, portanto, contra si, quaisquer ações de tal natureza, do seguinte imóvel: {{IMOVEL_DESCRICAO}}, minuciosamente descrito e caracterizado na matrícula n. **{{IMOVEL_MATRICULA}}** do **{{IMOVEL_CARTORIO}}** desta Capital. **TÍTULO AQUISITIVO:** O referido imóvel foi havido pela outorgante vendedora por força do **{{TITULO_AQUISITIVO}}** da referida matrícula. **CADASTRO E VALOR VENAL:** O imóvel está cadastrado na Prefeitura Municipal local sob a inscrição n. **{{CADASTRO_MUNICIPAL}},** com valor venal de referência de {{VALOR_VENAL_REFERENCIA}} para o presente exercício. **VENDA E COMPRA E FORMA DE PAGAMENTO:** As partes declaram que por força do compromisso particular de venda e compra firmado nesta cidade em {{DATA_COMPROMISSO}}, os outorgantes vendedores ajustaram vender, como de fato, pela presente escritura e na melhor forma de direito, VENDEM à outorgada compradora o imóvel aqui descrito, pelo preço certo, livremente ajustado e total de **{{VALOR_TOTAL}}** ({{VALOR_EXTENSO}}), cuja quantia, por conta e ordem dos vendedores, foi paga da seguinte forma: {{FORMA_PAGAMENTO}}. Assim, em razão do que foi aqui ajustado, os outorgantes vendedores conferem plena, geral e irrevogável QUITAÇÃO e transmitem à outorgada compradora, desde já e para sempre, a posse, o domínio, os direitos e as ações que têm e exercem sobre o mesmo imóvel, para que dele use, goze e disponha livremente, como seu que fica sendo de hoje em diante, o que prometem fazer sempre bom, firme e valioso, por si, herdeiros ou sucessores e responder pela evicção, na forma da lei. **DECLARAÇÕES DOS OUTORGANTES VENDEDORES:** Os outorgantes vendedores declaram, na seguinte forma e sob as penas da lei, que: **1)** Não são obrigados à apresentação da Certidão Negativa de Débitos do Instituto Nacional do Seguro Social – INSS, por não serem empregadores, produtores rurais ou equiparados; **2)** O imóvel da presente não é objeto de caução ofertada em negócio jurídico alheio, notadamente em decorrência de fiança prestada em contrato de locação, na forma da lei; **3)** Não existem feitos em trâmite em face deles, seja nesta Comarca, ou perante outra, potencialmente capaz de torná-los insolventes ou que possam, por qualquer causa, gerar constrição judicial sobre o imóvel objeto desta escritura; **4)** Acham-se quites para com o respectivo condomínio, na forma do parágrafo do 2º artigo 2º da Lei 7.433/85. **DECLARAÇÕES DA OUTORGADA COMPRADORA:** Declarou a outorgada compradora que: **1)** Recebeu dos outorgantes vendedores, além da certidão da mencionada matrícula, que fica arquivada neste Tabelionato de Notas, as certidões pessoais dos mesmos, as quais, em tempo hábil, analisou e aceita, dispensando este tabelionato do arquivamento; **2)** Recebeu a **Certidão Conjunta de Débitos de Tributos Imobiliários** de n. **{{CERTIDAO_IPTU_NUMERO}},** emitida pela Prefeitura de São Paulo, Secretaria Municipal da Fazenda, em {{CERTIDAO_IPTU_DATA}}, válida até {{CERTIDAO_IPTU_VALIDADE}}, código de autenticidade **{{CERTIDAO_IPTU_CODIGO}}**. **ARQUIVAMENTO:** Ficam arquivadas neste Tabelionato de Notas a certidão da matrícula imobiliária e de ônus reais, {{CERTIDOES_ARQUIVADAS}}. Todos os documentos de arquivamento obrigatório mencionados neste ato notarial ficam arquivados digitalmente, pelo prazo legal, neste 2º Tabelionato de Notas, sob o número de ordem do protocolo informatizado, nos termos do Provimento CNJ n. 149/2023. **DECLARAÇÕES DAS PARTES:** Disseram mais e finalmente os contratantes: **1)** Que aceitam a presente escritura como está redigida, por achá-la conforme e de acordo com o que haviam entre si previamente convencionado, firmando-a de livre e espontânea vontade; **2)** Que se responsabilizam, expressa e solidariamente, por eventuais débitos tributários incidentes sobre o imóvel objeto desta escritura, autorizando o seu registro independentemente de apresentação de certidões negativas; **3)** Que não são Pessoas Expostas Politicamente - PEP, ou seja, não ocupam ou ocuparam nos últimos cinco anos cargo, emprego ou função pública relevante, não sendo ainda familiares, representantes, estreitos colaboradores ou de relacionamento próximo de pessoas do gênero, nos termos da Resolução n. 40/2021 do COAF e do Provimento n. 161/2024 do Conselho Nacional de Justiça – CNJ; **4)** Declaram ainda, sob pena de responsabilidade civil e penal, que as declarações, documentos e certidões apresentados comprovam e espelham o atual estado civil das partes e são a exata expressão da verdade. **REQUERIMENTOS:** As partes requerem e autorizam os atos necessários ao registro da presente. **TRIBUTOS:** O Imposto de Transmissão "Inter Vivos" têm como base de cálculo o valor do negócio, ou seja, **{{ITBI_BASE_CALCULO}}** ({{ITBI_BASE_CALCULO_EXTENSO}}), e foi recolhido no valor total de **{{ITBI_VALOR}}** ({{ITBI_VALOR_EXTENSO}}), cujo comprovante de pagamento fica arquivado neste Tabelionato de Notas. **DOI:** Emitida DOI, conforme Instrução Normativa da Secretaria da Receita Federal vigente. **INDISPONIBILIDADE DE BENS:** Nos termos do artigo 12 do Provimento CG n. 13/2012, procedi consulta à Central Nacional de Indisponibilidade de Bens - CNIB em nome dos outorgantes vendedores, conforme **códigos hash**: {{INDISPONIBILIDADE_HASHES}}, cujos relatórios restaram **{{INDISPONIBILIDADE_RESULTADO}}. ENCERRAMENTO:** Ficam ressalvados eventuais erros, omissões ou os direitos de terceiros. Assim o disseram, dou fé, pediram-me e lhes lavrei este instrumento que, feito e lido em voz alta, foi achado conforme, aceitaram, outorgam e assinam.`,
};

// ============================================================================
// PLACEHOLDER KEYS
// List of all placeholders used in templates
// ============================================================================

export const PLACEHOLDER_KEYS = [
  // Data e Local
  'DATA_LAVRATURA',
  'DATA_LAVRATURA_EXTENSO',
  'CIDADE_LAVRATURA',
  'TABELIONATO',

  // Partes
  'OUTORGANTES_VENDEDORES',
  'OUTORGADA_COMPRADORA',

  // Qualificacao (pessoa natural)
  'NOME',
  'NACIONALIDADE',
  'ESTADO_CIVIL',
  'PROFISSAO',
  'RG',
  'ORGAO_RG',
  'ESTADO_RG',
  'CPF',
  'GENERO_A',
  'DOMICILIO_PREPOSICAO',
  'DOMICILIO_CIDADE',
  'DOMICILIO_ESTADO',
  'DOMICILIO_ENDERECO',

  // Qualificacao (conjuge)
  'CONJUGE_NOME',
  'CONJUGE_NACIONALIDADE',
  'CONJUGE_PROFISSAO',
  'CONJUGE_RG',
  'CONJUGE_ORGAO_RG',
  'CONJUGE_ESTADO_RG',
  'CONJUGE_CPF',
  'REGIME_BENS',
  'DATA_CASAMENTO',

  // Qualificacao (pacto antenupcial)
  'PACTO_NUMERO',
  'PACTO_LIVRO',
  'PACTO_CARTORIO',

  // Qualificacao (uniao estavel)
  'CONVIVENTE_NOME',
  'CONVIVENTE_NACIONALIDADE',
  'CONVIVENTE_ESTADO_CIVIL',
  'CONVIVENTE_PROFISSAO',
  'CONVIVENTE_RG',
  'CONVIVENTE_ORGAO_RG',
  'CONVIVENTE_ESTADO_RG',
  'CONVIVENTE_CPF',
  'REGIME_UNIAO',
  'DATA_UNIAO_ESTAVEL',
  'UNIAO_TABELIONATO',
  'UNIAO_LIVRO',
  'UNIAO_FOLHA',

  // Qualificacao (pessoa juridica)
  'RAZAO_SOCIAL',
  'CNPJ',
  'NIRE',
  'JUNTA_COMERCIAL',
  'ENDERECO_PREPOSICAO',
  'ENDERECO_CIDADE',
  'ENDERECO_COMPLETO',
  'REPRESENTANTES',

  // Imovel
  'IMOVEL_DESCRICAO',
  'IMOVEL_MATRICULA',
  'IMOVEL_CARTORIO',
  'TITULO_AQUISITIVO',
  'CADASTRO_MUNICIPAL',
  'VALOR_VENAL_REFERENCIA',

  // Negocio
  'VALOR_TOTAL',
  'VALOR_EXTENSO',
  'DATA_COMPROMISSO',
  'FORMA_PAGAMENTO',

  // ITBI
  'ITBI_BASE_CALCULO',
  'ITBI_BASE_CALCULO_EXTENSO',
  'ITBI_VALOR',
  'ITBI_VALOR_EXTENSO',

  // Certidoes
  'CERTIDAO_IPTU_NUMERO',
  'CERTIDAO_IPTU_DATA',
  'CERTIDAO_IPTU_VALIDADE',
  'CERTIDAO_IPTU_CODIGO',
  'CERTIDOES_ARQUIVADAS',

  // Indisponibilidade
  'INDISPONIBILIDADE_HASHES',
  'INDISPONIBILIDADE_RESULTADO',
] as const;

export type PlaceholderKey = (typeof PLACEHOLDER_KEYS)[number];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format date to Brazilian format (DD/MM/YYYY)
 */
function formatDateBR(dateString: string): string {
  if (!dateString) return '';

  // If already in DD/MM/YYYY format, return as-is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }

  // Parse YYYY-MM-DD format
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  return dateString;
}

/**
 * Convert number to Brazilian Portuguese written form
 */
function numberToWords(num: number): string {
  const units = [
    '',
    'um',
    'dois',
    'três',
    'quatro',
    'cinco',
    'seis',
    'sete',
    'oito',
    'nove',
    'dez',
    'onze',
    'doze',
    'treze',
    'quatorze',
    'quinze',
    'dezesseis',
    'dezessete',
    'dezoito',
    'dezenove',
  ];

  const tens = [
    '',
    '',
    'vinte',
    'trinta',
    'quarenta',
    'cinquenta',
    'sessenta',
    'setenta',
    'oitenta',
    'noventa',
  ];

  const hundreds = [
    '',
    'cento',
    'duzentos',
    'trezentos',
    'quatrocentos',
    'quinhentos',
    'seiscentos',
    'setecentos',
    'oitocentos',
    'novecentos',
  ];

  if (num === 0) return 'zero';
  if (num === 100) return 'cem';

  if (num < 20) return units[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return unit === 0 ? tens[ten] : `${tens[ten]} e ${units[unit]}`;
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    if (remainder === 0) return num === 100 ? 'cem' : hundreds[hundred];
    return `${hundreds[hundred]} e ${numberToWords(remainder)}`;
  }
  if (num < 2000) {
    const remainder = num % 1000;
    if (remainder === 0) return 'mil';
    return `mil e ${numberToWords(remainder)}`;
  }
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    const thousandWord = numberToWords(thousands) + ' mil';
    if (remainder === 0) return thousandWord;
    if (remainder < 100) return `${thousandWord} e ${numberToWords(remainder)}`;
    return `${thousandWord} e ${numberToWords(remainder)}`;
  }
  if (num < 2000000) {
    const remainder = num % 1000000;
    if (remainder === 0) return 'um milhão';
    return `um milhão e ${numberToWords(remainder)}`;
  }
  if (num < 1000000000) {
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    const millionWord = numberToWords(millions) + ' milhões';
    if (remainder === 0) return millionWord;
    return `${millionWord} e ${numberToWords(remainder)}`;
  }

  return num.toString();
}

/**
 * Convert currency value to words in Brazilian Portuguese
 */
function currencyToWords(value: number): string {
  const integerPart = Math.floor(value);
  const cents = Math.round((value - integerPart) * 100);

  let result = numberToWords(integerPart);
  result += integerPart === 1 ? ' real' : ' reais';

  if (cents > 0) {
    result += ` e ${numberToWords(cents)}`;
    result += cents === 1 ? ' centavo' : ' centavos';
  }

  return result;
}

/**
 * Format date to written form in Portuguese
 */
function dateToWords(dateString: string): string {
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];

  const dateBR = formatDateBR(dateString);
  const parts = dateBR.split('/');
  if (parts.length !== 3) return dateString;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  return `${numberToWords(day)} de ${months[month]} de ${numberToWords(year)}`;
}

/**
 * Format currency value to Brazilian format
 */
function formatCurrencyBR(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : value;

  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Parse currency string to number
 */
function parseCurrency(value: string): number {
  if (!value) return 0;
  return parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
}

/**
 * Format address to full string
 */
function formatAddress(endereco: Partial<Endereco>): string {
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
 * Get preposition for city (nesta/na/em)
 */
function getCityPreposition(cidade: string): string {
  const thisCity = ['São Paulo', 'Sao Paulo'];
  if (thisCity.some((c) => cidade.toLowerCase().includes(c.toLowerCase()))) {
    return 'nesta cidade';
  }
  return `na cidade de ${cidade}`;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generate qualification text for a person based on their civil status
 */
export function generateQualificationText(
  pessoa: PessoaQualificacao,
  options: QualificationOptions = {}
): string {
  const { includeSpouse = false, includeConvivente = false, spouseSignsToo = true } = options;

  // Determine which template to use
  let templateKey: keyof typeof QUALIFICATION_TEMPLATES;
  const estadoCivil = pessoa.estadoCivil.toLowerCase();

  if (pessoa.uniaoEstavel && includeConvivente && pessoa.convivente) {
    templateKey = 'UNIAO_ESTAVEL';
  } else if (estadoCivil === 'casado' || estadoCivil === 'casada') {
    if (pessoa.pactoAntenupcial) {
      templateKey = includeSpouse && spouseSignsToo ? 'CASADO_COM_PACTO_AMBOS' : 'CASADO_COM_PACTO_UM';
    } else {
      templateKey = includeSpouse ? 'CASADO_SEM_PACTO' : 'SOLTEIRO'; // Use solteiro template structure for single party
    }
  } else if (estadoCivil === 'divorciado' || estadoCivil === 'divorciada') {
    templateKey = 'DIVORCIADO';
  } else if (estadoCivil === 'viúvo' || estadoCivil === 'viuvo' || estadoCivil === 'viúva' || estadoCivil === 'viuva') {
    templateKey = 'VIUVO';
  } else {
    templateKey = 'SOLTEIRO';
  }

  const template = QUALIFICATION_TEMPLATES[templateKey];

  // Build placeholder values
  const values: Record<string, string> = {
    NOME: pessoa.nome,
    NACIONALIDADE: pessoa.nacionalidade,
    ESTADO_CIVIL: pessoa.estadoCivil,
    PROFISSAO: pessoa.profissao,
    RG: pessoa.rg || '',
    ORGAO_RG: pessoa.orgaoEmissorRg || '',
    ESTADO_RG: pessoa.estadoEmissorRg || '',
    CPF: pessoa.cpf,
    GENERO_A: pessoa.nacionalidade.endsWith('a') ? 'a' : '',
    DOMICILIO_PREPOSICAO: getCityPreposition(pessoa.domicilio.cidade),
    DOMICILIO_CIDADE: pessoa.domicilio.cidade,
    DOMICILIO_ESTADO: pessoa.domicilio.estado,
    DOMICILIO_ENDERECO: formatAddress(pessoa.domicilio),
  };

  // Add spouse data if applicable
  if (pessoa.conjuge && includeSpouse) {
    values.CONJUGE_NOME = pessoa.conjuge.nome;
    values.CONJUGE_NACIONALIDADE = pessoa.conjuge.nacionalidade;
    values.CONJUGE_PROFISSAO = pessoa.conjuge.profissao;
    values.CONJUGE_RG = pessoa.conjuge.rg || '';
    values.CONJUGE_ORGAO_RG = pessoa.conjuge.orgaoEmissorRg || '';
    values.CONJUGE_ESTADO_RG = pessoa.conjuge.estadoEmissorRg || '';
    values.CONJUGE_CPF = pessoa.conjuge.cpf;
    values.REGIME_BENS = pessoa.regimeBens || '';
    values.DATA_CASAMENTO = pessoa.dataCasamento || '';
  }

  // Add pacto antenupcial data if applicable
  if (pessoa.pactoAntenupcial) {
    values.PACTO_NUMERO = pessoa.pactoAntenupcial.numero;
    values.PACTO_LIVRO = pessoa.pactoAntenupcial.livro;
    values.PACTO_CARTORIO = pessoa.pactoAntenupcial.cartorio;
  }

  // Add uniao estavel data if applicable
  if (pessoa.uniaoEstavel && includeConvivente && pessoa.convivente) {
    values.CONVIVENTE_NOME = pessoa.convivente.nome;
    values.CONVIVENTE_NACIONALIDADE = pessoa.convivente.nacionalidade;
    values.CONVIVENTE_ESTADO_CIVIL = pessoa.convivente.estadoCivil;
    values.CONVIVENTE_PROFISSAO = pessoa.convivente.profissao;
    values.CONVIVENTE_RG = pessoa.convivente.rg || '';
    values.CONVIVENTE_ORGAO_RG = pessoa.convivente.orgaoEmissorRg || '';
    values.CONVIVENTE_ESTADO_RG = pessoa.convivente.estadoEmissorRg || '';
    values.CONVIVENTE_CPF = pessoa.convivente.cpf;
    values.REGIME_UNIAO = pessoa.uniaoEstavel.regime;
    values.DATA_UNIAO_ESTAVEL = pessoa.uniaoEstavel.dataInicio;
    values.UNIAO_TABELIONATO = pessoa.uniaoEstavel.tabelionato;
    values.UNIAO_LIVRO = pessoa.uniaoEstavel.livro;
    values.UNIAO_FOLHA = pessoa.uniaoEstavel.folha;
  }

  return replacePlaceholders(template, values, { strict: true });
}

/**
 * Generate property description text
 */
function generateImovelDescription(imovel: ImovelMinuta): string {
  const parts: string[] = [];

  // Type and number
  const tipo = imovel.tipo.toUpperCase();
  if (imovel.numero) {
    parts.push(`**${tipo} N. ${imovel.numero},**`);
  } else {
    parts.push(`**${tipo},**`);
  }

  // Floor/location
  if (imovel.andar) {
    parts.push(`localizado no ${imovel.andar}º pavimento`);
    if (imovel.bloco) {
      parts.push(`da ${imovel.bloco}`);
    }
  }

  // Building
  if (imovel.edificio) {
    parts.push(`do **${imovel.edificio},**`);
  }

  // Address
  if (imovel.endereco.logradouro) {
    parts.push(`situado na ${imovel.endereco.logradouro}`);
    if (imovel.endereco.numero) {
      parts.push(`n. ${imovel.endereco.numero},`);
    }
  }

  if (imovel.endereco.bairro) {
    parts.push(`${imovel.endereco.bairro},`);
  }

  // Areas
  if (imovel.areaPrivativa) {
    parts.push(`contendo a área privativa de ${imovel.areaPrivativa} metros quadrados`);
  }
  if (imovel.areaComum) {
    parts.push(`e área comum de ${imovel.areaComum} metros quadrados,`);
  }
  if (imovel.areaTotal) {
    parts.push(`com a área total de ${imovel.areaTotal} metros quadrados`);
  }

  return parts.join(' ');
}

/**
 * Generate payment description text
 */
function generateFormaPagamento(pagamentos: Pagamento[]): string {
  if (!pagamentos || pagamentos.length === 0) return '';

  const parts = pagamentos.map((p) => {
    let desc = `${formatCurrencyBR(p.valor)} (${currencyToWords(parseCurrency(p.valor))})`;
    if (p.data) {
      desc += ` em ${p.data}`;
    }
    if (p.modo) {
      desc += `, pago${p.modo === 'transferencia' ? 's por meio de transferências bancárias' : ` via ${p.modo}`}`;
    }
    return desc;
  });

  return parts.join(' e ');
}

/**
 * Check if entity is pessoa juridica
 */
function isPessoaJuridica(
  entity: PessoaQualificacao | PessoaJuridicaQualificacao
): entity is PessoaJuridicaQualificacao {
  return 'tipo' in entity && entity.tipo === 'juridica';
}

/**
 * Generate qualification for pessoa juridica
 */
function generatePessoaJuridicaQualification(pj: PessoaJuridicaQualificacao): string {
  const repTexts = pj.representantes.map((rep) => {
    return `**${rep.nome}**, ${rep.nacionalidade}, ${rep.estadoCivil}, ${rep.profissao}, ${rep.rne ? `RNE n. ${rep.rne}` : `RG n. ${rep.rg}`}, CPF n. ${rep.cpf}`;
  });

  const values: Record<string, string> = {
    RAZAO_SOCIAL: pj.razaoSocial,
    CNPJ: pj.cnpj,
    NIRE: pj.nire || '',
    JUNTA_COMERCIAL: pj.juntaComercial || 'Junta Comercial do Estado de São Paulo – JUCESP',
    ENDERECO_PREPOSICAO: getCityPreposition(pj.endereco.cidade),
    ENDERECO_CIDADE: pj.endereco.cidade,
    ENDERECO_COMPLETO: formatAddress(pj.endereco),
    REPRESENTANTES: repTexts.join(', e '),
  };

  return replacePlaceholders(QUALIFICATION_TEMPLATES.PESSOA_JURIDICA, values, { strict: true });
}

/**
 * Map database data to template placeholders
 */
export function mapDatabaseToPlaceholders(data: MinutaCompleta): Record<string, string> {
  const placeholders: Record<string, string> = {};

  // Date
  placeholders['DATA_LAVRATURA'] = formatDateBR(data.dataLavratura);
  placeholders['DATA_LAVRATURA_EXTENSO'] = dateToWords(data.dataLavratura);

  // Outorgantes (sellers)
  const outorgantesTexts = data.outorgantes.map((o) => {
    if (isPessoaJuridica(o)) {
      return generatePessoaJuridicaQualification(o);
    }
    return generateQualificationText(o, { includeSpouse: !!o.conjuge });
  });
  placeholders['OUTORGANTES_VENDEDORES'] = outorgantesTexts.join(' e ');

  // Outorgados (buyers)
  const outorgadosTexts = data.outorgados.map((o) => {
    if (isPessoaJuridica(o)) {
      return generatePessoaJuridicaQualification(o);
    }
    return generateQualificationText(o, { includeSpouse: !!o.conjuge });
  });
  placeholders['OUTORGADA_COMPRADORA'] = outorgadosTexts.join(' e ');

  // Property
  placeholders['IMOVEL_DESCRICAO'] = generateImovelDescription(data.imovel);
  placeholders['IMOVEL_MATRICULA'] = data.imovel.matricula;
  placeholders['IMOVEL_CARTORIO'] = data.imovel.cartorio;
  placeholders['TITULO_AQUISITIVO'] = data.imovel.tituloAquisitivo || 'R.___';
  placeholders['CADASTRO_MUNICIPAL'] = data.imovel.cadastroMunicipal || '';
  placeholders['VALOR_VENAL_REFERENCIA'] = data.imovel.valorVenalReferencia
    ? `${formatCurrencyBR(data.imovel.valorVenalReferencia)} (${currencyToWords(parseCurrency(data.imovel.valorVenalReferencia))})`
    : '';

  // Business
  const valorTotal = parseCurrency(data.negocio.valorTotal);
  placeholders['VALOR_TOTAL'] = formatCurrencyBR(valorTotal);
  placeholders['VALOR_EXTENSO'] = currencyToWords(valorTotal);

  if (data.negocio.compromisso) {
    placeholders['DATA_COMPROMISSO'] = data.negocio.compromisso.data;
  }

  placeholders['FORMA_PAGAMENTO'] = generateFormaPagamento(data.negocio.formaPagamento);

  // ITBI
  if (data.negocio.baseCalculoITBI) {
    const baseItbi = parseCurrency(data.negocio.baseCalculoITBI);
    placeholders['ITBI_BASE_CALCULO'] = formatCurrencyBR(baseItbi);
    placeholders['ITBI_BASE_CALCULO_EXTENSO'] = currencyToWords(baseItbi);
  }

  if (data.negocio.valorITBI) {
    const valorItbi = parseCurrency(data.negocio.valorITBI);
    placeholders['ITBI_VALOR'] = formatCurrencyBR(valorItbi);
    placeholders['ITBI_VALOR_EXTENSO'] = currencyToWords(valorItbi);
  }

  // Indisponibilidades
  if (data.indisponibilidades && data.indisponibilidades.length > 0) {
    const hashes = data.indisponibilidades.map((i) => `${i.nome.toUpperCase()}, código ${i.hashCode}`);
    placeholders['INDISPONIBILIDADE_HASHES'] = hashes.join(', ');
    const allNegative = data.indisponibilidades.every((i) => i.resultado === 'negativo');
    placeholders['INDISPONIBILIDADE_RESULTADO'] = allNegative ? 'negativos' : 'com pendências';
  }

  // Certidoes
  if (data.certidoes) {
    if (data.certidoes.cndt && data.certidoes.cndt.length > 0) {
      const cndtTexts = data.certidoes.cndt.map(
        (c) => `**Certidão Negativa de Débitos Trabalhistas** (CNDT), emitida eletronicamente em ${c.dataExpedicao}, sob o n. **${c.numero}**, válida até ${c.validade}`
      );
      placeholders['CERTIDOES_ARQUIVADAS'] = cndtTexts.join(', ');
    }
  }

  return placeholders;
}

/**
 * Replace placeholders in a template string
 */
export function replacePlaceholders(
  template: string,
  values: Record<string, string>,
  options: { strict?: boolean } = {}
): string {
  const { strict = false } = options;

  // First handle escaped braces (convert \{\{ to a temporary marker)
  let result = template.replace(/\\{\\{/g, '\x00LBRACE\x00').replace(/\\}\\}/g, '\x00RBRACE\x00');

  // Replace all placeholders
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in values) {
      return values[key];
    }
    return strict ? '' : match;
  });

  // Restore escaped braces
  result = result.replace(/\x00LBRACE\x00/g, '{{').replace(/\x00RBRACE\x00/g, '}}');

  return result;
}
