// src/schemas/minuta.schemas.ts
// Zod validation schemas for all Minuta entities
// These mirror the TypeScript interfaces in src/types/minuta.ts with runtime validation

import { z } from 'zod';

// =============================================================================
// REGEX PATTERNS FOR BRAZILIAN DOCUMENTS
// =============================================================================

const CPF_REGEX = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
const CNPJ_REGEX = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;
const CEP_REGEX = /^\d{5}-?\d{3}$/;
const ESTADO_REGEX = /^[A-Z]{2}$/;

// =============================================================================
// SHARED SCHEMAS
// =============================================================================

export const EnderecoSchema = z.object({
  logradouro: z.string().default(''),
  numero: z.string().default(''),
  complemento: z.string().default(''),
  bairro: z.string().default(''),
  cidade: z.string().default(''),
  estado: z.string().default(''),
  cep: z
    .string()
    .refine((val) => val === '' || CEP_REGEX.test(val), {
      message: 'CEP inválido (formato: 00000-000)',
    })
    .default(''),
});

export const ContatoSchema = z.object({
  email: z
    .string()
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'Email inválido',
    })
    .default(''),
  telefone: z.string().default(''),
});

// =============================================================================
// PESSOA NATURAL SCHEMAS
// =============================================================================

export const EstadoCivilEnum = z.enum([
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável',
  '',
]);

export const RegimeBensEnum = z.enum([
  'Comunhão Parcial',
  'Comunhão Universal',
  'Separação Total',
  'Participação Final nos Aquestos',
  '',
]);

export const PessoaNaturalSchema = z.object({
  id: z.string().default(''),
  nome: z
    .string()
    .refine((val) => val === '' || val.length >= 2, {
      message: 'Nome deve ter pelo menos 2 caracteres',
    })
    .default(''),
  cpf: z
    .string()
    .refine((val) => val === '' || CPF_REGEX.test(val), {
      message: 'CPF inválido (formato: 000.000.000-00)',
    })
    .default(''),
  rg: z.string().default(''),
  orgaoEmissorRg: z.string().default(''),
  estadoEmissorRg: z
    .string()
    .refine((val) => val === '' || ESTADO_REGEX.test(val), {
      message: 'Estado deve ter 2 letras maiúsculas (ex: SP, RJ)',
    })
    .default(''),
  dataEmissaoRg: z.string().default(''),
  nacionalidade: z.string().default('Brasileira'),
  profissao: z.string().default(''),
  dataNascimento: z.string().default(''),
  estadoCivil: EstadoCivilEnum.default(''),
  regimeBens: RegimeBensEnum.default(''),
  domicilio: EnderecoSchema.default(() => ({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  })),
  contato: ContatoSchema.default(() => ({
    email: '',
    telefone: '',
  })),
  camposEditados: z.array(z.string()).default([]),
});

// =============================================================================
// PESSOA JURIDICA SCHEMAS
// =============================================================================

export const RepresentanteLegalSchema = z.object({
  id: z.string().default(''),
  nome: z
    .string()
    .refine((val) => val === '' || val.length >= 2, {
      message: 'Nome deve ter pelo menos 2 caracteres',
    })
    .default(''),
  cpf: z
    .string()
    .refine((val) => val === '' || CPF_REGEX.test(val), {
      message: 'CPF inválido (formato: 000.000.000-00)',
    })
    .default(''),
  cargo: z.string().default(''),
});

export const PessoaJuridicaSchema = z.object({
  id: z.string().default(''),
  razaoSocial: z
    .string()
    .refine((val) => val === '' || val.length >= 2, {
      message: 'Razão Social deve ter pelo menos 2 caracteres',
    })
    .default(''),
  cnpj: z
    .string()
    .refine((val) => val === '' || CNPJ_REGEX.test(val), {
      message: 'CNPJ inválido (formato: 00.000.000/0000-00)',
    })
    .default(''),
  inscricaoEstadual: z.string().default(''),
  dataConstituicao: z.string().default(''),
  endereco: EnderecoSchema.default(() => ({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  })),
  contato: ContatoSchema.default(() => ({
    email: '',
    telefone: '',
  })),
  representantes: z.array(RepresentanteLegalSchema).default([]),
  camposEditados: z.array(z.string()).default([]),
});

// =============================================================================
// IMOVEL SCHEMAS
// =============================================================================

export const MatriculaImobiliariaSchema = z.object({
  numeroMatricula: z.string().default(''),
  numeroRegistroImoveis: z.string().default(''),
  cidadeRegistroImoveis: z.string().default(''),
  estadoRegistroImoveis: z
    .string()
    .refine((val) => val === '' || ESTADO_REGEX.test(val), {
      message: 'Estado deve ter 2 letras maiúsculas (ex: SP, RJ)',
    })
    .default(''),
  numeroNacionalMatricula: z.string().default(''),
});

export const DescricaoImovelSchema = z.object({
  denominacao: z.string().default(''),
  areaTotalM2: z.string().default(''),
  areaPrivativaM2: z.string().default(''),
  areaConstruida: z.string().default(''),
  endereco: EnderecoSchema.default(() => ({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  })),
  descricaoConformeMatricula: z.string().default(''),
});

export const CadastroImobiliarioSchema = z.object({
  cadastroMunicipalSQL: z.string().default(''),
  dataExpedicaoCertidao: z.string().default(''),
});

export const ValoresVenaisSchema = z.object({
  valorVenalIPTU: z.string().default(''),
  valorVenalReferenciaITBI: z.string().default(''),
});

export const NegativaIPTUSchema = z.object({
  numeroCertidao: z.string().default(''),
  dataExpedicao: z.string().default(''),
  certidaoValida: z.string().default(''),
});

export const CertidaoMatriculaSchema = z.object({
  certidaoMatricula: z.string().default(''),
  dataExpedicao: z.string().default(''),
  certidaoValida: z.string().default(''),
});

export const ProprietarioSchema = z.object({
  id: z.string().default(''),
  nome: z.string().default(''),
  fracaoIdeal: z.string().default(''),
  registroAquisicao: z.string().default(''),
  dataRegistroAquisicao: z.string().default(''),
  tituloAquisicao: z.string().default(''),
});

export const TitularOnusSchema = z.object({
  id: z.string().default(''),
  nome: z.string().default(''),
  fracaoIdeal: z.string().default(''),
});

export const OnusRegistradoSchema = z.object({
  id: z.string().default(''),
  tituloOnus: z.string().default(''),
  registroOnus: z.string().default(''),
  dataRegistroOnus: z.string().default(''),
  descricaoConformeMatricula: z.string().default(''),
  titulares: z.array(TitularOnusSchema).default([]),
});

export const RessalvasMatriculaSchema = z.object({
  existeRessalva: z.string().default(''),
  descricaoRessalva: z.string().default(''),
});

export const ImovelSchema = z.object({
  id: z.string().default(''),
  matricula: MatriculaImobiliariaSchema.default(() => ({
    numeroMatricula: '',
    numeroRegistroImoveis: '',
    cidadeRegistroImoveis: '',
    estadoRegistroImoveis: '',
    numeroNacionalMatricula: '',
  })),
  descricao: DescricaoImovelSchema.default(() => ({
    denominacao: '',
    areaTotalM2: '',
    areaPrivativaM2: '',
    areaConstruida: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    },
    descricaoConformeMatricula: '',
  })),
  cadastro: CadastroImobiliarioSchema.default(() => ({
    cadastroMunicipalSQL: '',
    dataExpedicaoCertidao: '',
  })),
  valoresVenais: ValoresVenaisSchema.default(() => ({
    valorVenalIPTU: '',
    valorVenalReferenciaITBI: '',
  })),
  negativaIPTU: NegativaIPTUSchema.default(() => ({
    numeroCertidao: '',
    dataExpedicao: '',
    certidaoValida: '',
  })),
  certidaoMatricula: CertidaoMatriculaSchema.default(() => ({
    certidaoMatricula: '',
    dataExpedicao: '',
    certidaoValida: '',
  })),
  proprietarios: z.array(ProprietarioSchema).default([]),
  onus: z.array(OnusRegistradoSchema).default([]),
  ressalvas: RessalvasMatriculaSchema.default(() => ({
    existeRessalva: '',
    descricaoRessalva: '',
  })),
  camposEditados: z.array(z.string()).default([]),
});

// =============================================================================
// NEGOCIO JURIDICO SCHEMAS
// =============================================================================

export const TipoAtoEnum = z.enum([
  'Compra e Venda',
  'Doação',
  'Permuta',
  'Dação em Pagamento',
  '',
]);

export const NegocioJuridicoSchema = z.object({
  id: z.string().default(''),
  imovelId: z.string().default(''),
  tipoAto: TipoAtoEnum.default(''),
  valorNegocio: z.string().default(''),
  formaPagamento: z.string().default(''),
  condicoesEspeciais: z.string().default(''),
  clausulasAdicionais: z.string().default(''),
  camposEditados: z.array(z.string()).default([]),
});

// =============================================================================
// PARECER JURIDICO SCHEMAS
// =============================================================================

export const ParecerJuridicoSchema = z.object({
  relatorioMatricula: z.string().default(''),
  matriculaApta: z.boolean().nullable().default(null),
  pontosAtencao: z.string().default(''),
});

// =============================================================================
// UPLOAD DOCUMENT SCHEMAS
// =============================================================================

export const DocumentCategoryEnum = z.enum([
  'outorgantes',
  'outorgados',
  'imoveis',
  'negocio',
  'outros',
]);

export const DocumentStatusEnum = z.enum(['uploading', 'complete', 'error']);

export const UploadedDocumentSchema = z.object({
  id: z.string().default(''),
  fileName: z.string().default(''),
  fileSize: z.number().default(0),
  fileType: z.string().default(''),
  category: DocumentCategoryEnum.default('outros'),
  status: DocumentStatusEnum.default('uploading'),
  progress: z.number().min(0).max(100).default(0),
  errorMessage: z.string().optional(),
});

// =============================================================================
// MINUTA PRINCIPAL SCHEMAS
// =============================================================================

export const MinutaStatusEnum = z.enum(['rascunho', 'concluida']);

export const MinutaStepEnum = z.enum([
  'upload',
  'processando',
  'outorgantes',
  'outorgados',
  'imoveis',
  'parecer',
  'negocio',
  'minuta',
]);

export const MinutaSchema = z.object({
  id: z.string().default(''),
  titulo: z.string().default(''),
  dataCriacao: z.string().default(''),
  dataAtualizacao: z.string().default(''),
  status: MinutaStatusEnum.default('rascunho'),
  currentStep: MinutaStepEnum.default('upload'),
  documentos: z.array(UploadedDocumentSchema).default([]),
  outorgantes: z
    .object({
      pessoasNaturais: z.array(PessoaNaturalSchema).default([]),
      pessoasJuridicas: z.array(PessoaJuridicaSchema).default([]),
    })
    .default(() => ({
      pessoasNaturais: [],
      pessoasJuridicas: [],
    })),
  outorgados: z
    .object({
      pessoasNaturais: z.array(PessoaNaturalSchema).default([]),
      pessoasJuridicas: z.array(PessoaJuridicaSchema).default([]),
    })
    .default(() => ({
      pessoasNaturais: [],
      pessoasJuridicas: [],
    })),
  imoveis: z.array(ImovelSchema).default([]),
  parecer: ParecerJuridicoSchema.default(() => ({
    relatorioMatricula: '',
    matriculaApta: null,
    pontosAtencao: '',
  })),
  negociosJuridicos: z.array(NegocioJuridicoSchema).default([]),
  minutaTexto: z.string().default(''),
});

// =============================================================================
// TYPE INFERENCE HELPERS
// =============================================================================

export type EnderecoValidated = z.infer<typeof EnderecoSchema>;
export type ContatoValidated = z.infer<typeof ContatoSchema>;

export type PessoaNaturalValidated = z.infer<typeof PessoaNaturalSchema>;
export type RepresentanteLegalValidated = z.infer<typeof RepresentanteLegalSchema>;
export type PessoaJuridicaValidated = z.infer<typeof PessoaJuridicaSchema>;

export type MatriculaImobiliariaValidated = z.infer<typeof MatriculaImobiliariaSchema>;
export type DescricaoImovelValidated = z.infer<typeof DescricaoImovelSchema>;
export type CadastroImobiliarioValidated = z.infer<typeof CadastroImobiliarioSchema>;
export type ValoresVenaisValidated = z.infer<typeof ValoresVenaisSchema>;
export type NegativaIPTUValidated = z.infer<typeof NegativaIPTUSchema>;
export type CertidaoMatriculaValidated = z.infer<typeof CertidaoMatriculaSchema>;
export type ProprietarioValidated = z.infer<typeof ProprietarioSchema>;
export type TitularOnusValidated = z.infer<typeof TitularOnusSchema>;
export type OnusRegistradoValidated = z.infer<typeof OnusRegistradoSchema>;
export type RessalvasMatriculaValidated = z.infer<typeof RessalvasMatriculaSchema>;
export type ImovelValidated = z.infer<typeof ImovelSchema>;

export type NegocioJuridicoValidated = z.infer<typeof NegocioJuridicoSchema>;
export type ParecerJuridicoValidated = z.infer<typeof ParecerJuridicoSchema>;

export type UploadedDocumentValidated = z.infer<typeof UploadedDocumentSchema>;
export type MinutaValidated = z.infer<typeof MinutaSchema>;

// =============================================================================
// VALIDATION HELPER FUNCTIONS
// =============================================================================

/**
 * Validates a PessoaNatural object
 * @param data - Unknown data to validate
 * @returns SafeParseReturnType with success status and data or error
 */
export function validatePessoaNatural(data: unknown) {
  return PessoaNaturalSchema.safeParse(data);
}

/**
 * Validates a PessoaJuridica object
 * @param data - Unknown data to validate
 * @returns SafeParseReturnType with success status and data or error
 */
export function validatePessoaJuridica(data: unknown) {
  return PessoaJuridicaSchema.safeParse(data);
}

/**
 * Validates an Imovel object
 * @param data - Unknown data to validate
 * @returns SafeParseReturnType with success status and data or error
 */
export function validateImovel(data: unknown) {
  return ImovelSchema.safeParse(data);
}

/**
 * Validates a NegocioJuridico object
 * @param data - Unknown data to validate
 * @returns SafeParseReturnType with success status and data or error
 */
export function validateNegocioJuridico(data: unknown) {
  return NegocioJuridicoSchema.safeParse(data);
}

/**
 * Validates a ParecerJuridico object
 * @param data - Unknown data to validate
 * @returns SafeParseReturnType with success status and data or error
 */
export function validateParecerJuridico(data: unknown) {
  return ParecerJuridicoSchema.safeParse(data);
}

/**
 * Validates an Endereco object
 * @param data - Unknown data to validate
 * @returns SafeParseReturnType with success status and data or error
 */
export function validateEndereco(data: unknown) {
  return EnderecoSchema.safeParse(data);
}

/**
 * Validates a Contato object
 * @param data - Unknown data to validate
 * @returns SafeParseReturnType with success status and data or error
 */
export function validateContato(data: unknown) {
  return ContatoSchema.safeParse(data);
}

/**
 * Validates an UploadedDocument object
 * @param data - Unknown data to validate
 * @returns SafeParseReturnType with success status and data or error
 */
export function validateUploadedDocument(data: unknown) {
  return UploadedDocumentSchema.safeParse(data);
}

/**
 * Validates a complete Minuta object
 * @param data - Unknown data to validate
 * @returns SafeParseReturnType with success status and data or error
 */
export function validateMinuta(data: unknown) {
  return MinutaSchema.safeParse(data);
}

// =============================================================================
// PARTIAL VALIDATION HELPERS (for form steps)
// =============================================================================

/**
 * Creates a partial schema where all fields are optional
 * Useful for validating partial form data during drafts
 */
export const PartialPessoaNaturalSchema = PessoaNaturalSchema.partial();
export const PartialPessoaJuridicaSchema = PessoaJuridicaSchema.partial();
export const PartialImovelSchema = ImovelSchema.partial();
export const PartialNegocioJuridicoSchema = NegocioJuridicoSchema.partial();

export type PartialPessoaNatural = z.infer<typeof PartialPessoaNaturalSchema>;
export type PartialPessoaJuridica = z.infer<typeof PartialPessoaJuridicaSchema>;
export type PartialImovel = z.infer<typeof PartialImovelSchema>;
export type PartialNegocioJuridico = z.infer<typeof PartialNegocioJuridicoSchema>;
