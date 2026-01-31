// src/types/minuta.ts

// === Pessoa Natural ===
export interface PessoaNatural {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  orgaoEmissorRg: string;
  estadoEmissorRg: string;
  dataEmissaoRg: string;
  nacionalidade: string;
  profissao: string;
  dataNascimento: string;
  estadoCivil: string;
  regimeBens: string;
  domicilio: Endereco;
  contato: Contato;
  camposEditados: string[];
}

// === Pessoa Juridica ===
export interface PessoaJuridica {
  id: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  dataConstituicao: string;
  endereco: Endereco;
  contato: Contato;
  representantes: RepresentanteLegal[];
  camposEditados: string[];
}

export interface RepresentanteLegal {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
}

// === Imovel ===
export interface Imovel {
  id: string;
  matricula: MatriculaImobiliaria;
  descricao: DescricaoImovel;
  cadastro: CadastroImobiliario;
  valoresVenais: ValoresVenais;
  negativaIPTU: NegativaIPTU;
  certidaoMatricula: CertidaoMatricula;
  proprietarios: Proprietario[];
  onus: OnusRegistrado[];
  ressalvas: RessalvasMatricula;
  camposEditados: string[];
}

export interface MatriculaImobiliaria {
  numeroMatricula: string;
  numeroRegistroImoveis: string;
  cidadeRegistroImoveis: string;
  estadoRegistroImoveis: string;
  numeroNacionalMatricula: string;
}

export interface DescricaoImovel {
  denominacao: string;
  areaTotalM2: string;
  areaPrivativaM2: string;
  areaConstruida: string;
  endereco: Endereco;
  descricaoConformeMatricula: string;
}

export interface CadastroImobiliario {
  cadastroMunicipalSQL: string;
  dataExpedicaoCertidao: string;
}

export interface ValoresVenais {
  valorVenalIPTU: string;
  valorVenalReferenciaITBI: string;
}

export interface NegativaIPTU {
  numeroCertidao: string;
  dataExpedicao: string;
  certidaoValida: string;
}

export interface CertidaoMatricula {
  certidaoMatricula: string;
  dataExpedicao: string;
  certidaoValida: string;
}

export interface Proprietario {
  id: string;
  nome: string;
  fracaoIdeal: string;
  registroAquisicao: string;
  dataRegistroAquisicao: string;
  tituloAquisicao: string;
}

export interface OnusRegistrado {
  id: string;
  tituloOnus: string;
  registroOnus: string;
  dataRegistroOnus: string;
  descricaoConformeMatricula: string;
  titulares: TitularOnus[];
}

export interface TitularOnus {
  id: string;
  nome: string;
  fracaoIdeal: string;
}

export interface RessalvasMatricula {
  existeRessalva: string;
  descricaoRessalva: string;
}

// === Parecer Juridico ===
export interface ParecerJuridico {
  relatorioMatricula: string;
  matriculaApta: boolean | null;
  pontosAtencao: string;
}

// === Negocio Juridico ===
export interface NegocioJuridico {
  id: string;
  imovelId: string;
  tipoAto: string;
  valorNegocio: string;
  formaPagamento: string;
  condicoesEspeciais: string;
  clausulasAdicionais: string;
  camposEditados: string[];
}

// === Shared ===
export interface Endereco {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Contato {
  email: string;
  telefone: string;
}

// === Upload ===
export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: 'outorgantes' | 'outorgados' | 'imoveis' | 'negocio' | 'outros';
  status: 'uploading' | 'complete' | 'error';
  progress: number;
  errorMessage?: string;
}

// === Minuta Principal ===
export type MinutaStatus = 'rascunho' | 'concluida';

export type MinutaStep =
  | 'upload'
  | 'processando'
  | 'outorgantes'
  | 'outorgados'
  | 'imoveis'
  | 'parecer'
  | 'negocio'
  | 'minuta';

export interface Minuta {
  id: string;
  titulo: string;
  dataCriacao: string;
  dataAtualizacao: string;
  status: MinutaStatus;
  currentStep: MinutaStep;
  documentos: UploadedDocument[];
  outorgantes: {
    pessoasNaturais: PessoaNatural[];
    pessoasJuridicas: PessoaJuridica[];
  };
  outorgados: {
    pessoasNaturais: PessoaNatural[];
    pessoasJuridicas: PessoaJuridica[];
  };
  imoveis: Imovel[];
  parecer: ParecerJuridico;
  negociosJuridicos: NegocioJuridico[];
  minutaTexto: string;
}
