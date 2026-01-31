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
  dataObito: string;
  cnh: string;
  orgaoEmissorCnh: string;
  dadosFamiliares: DadosFamiliares;
  domicilio: Endereco;
  contato: Contato;
  cndt: CertidaoCNDT;
  certidaoUniao: CertidaoUniao;
  camposEditados: string[];
}

// === Pessoa Juridica ===
export interface PessoaJuridica {
  id: string;
  razaoSocial: string;
  cnpj: string;
  nire: string;
  inscricaoEstadual: string;
  dataConstituicao: string;
  endereco: Endereco;
  contato: Contato;
  registroVigente: RegistroVigente;
  certidaoEmpresa: CertidaoEmpresa;
  representantes: RepresentanteLegal[];
  administradores: RepresentanteAdministrador[];
  procuradores: RepresentanteProcurador[];
  cndt: CertidaoCNDT;
  certidaoUniao: CertidaoUniao;
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
  fracaoIdealAlienada: string;
  valorTotalAlienacao: string;
  valorNegocio: string;
  formaPagamento: string;
  formaPagamentoDetalhada: FormaPagamentoDetalhada;
  alienantes: ParticipanteNegocio[];
  adquirentes: ParticipanteNegocio[];
  termosEspeciais: TermosEspeciais;
  declaracoes: Record<string, boolean>;
  dispensas: Record<string, boolean>;
  indisponibilidade: IndisponibilidadeBens;
  impostoTransmissao: ImpostoTransmissao;
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

// === Certidoes ===
export interface CertidaoCNDT {
  numeroCNDT: string;
  dataExpedicao: string;
  horaExpedicao: string;
}

export interface CertidaoUniao {
  tipoCertidao: string;
  dataEmissao: string;
  horaEmissao: string;
  validade: string;
  codigoControle: string;
}

// === Dados Familiares (Pessoa Natural) ===
export interface DadosFamiliares {
  estadoCivil: string;
  regimeBens: string;
  dataCasamento: string;
  dataSeparacao: string;
  dataDivorcio: string;
  dataFalecimentoConjuge: string;
  uniaoEstavel: boolean;
  dataUniaoEstavel: string;
  dataExtincaoUniaoEstavel: string;
  regimeBensUniao: string;
}

// === Pessoa Juridica - Registro e Representacao ===
export interface RegistroVigente {
  instrumentoConstitutivo: string;
  juntaComercial: string;
  numeroRegistro: string;
  dataSessaoRegistro: string;
}

export interface CertidaoEmpresa {
  dataExpedicaoFichaCadastral: string;
  dataExpedicaoCertidaoRegistro: string;
}

export interface RepresentanteAdministrador {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  orgaoEmissorRg: string;
  estadoEmissorRg: string;
  dataEmissaoRg: string;
  nacionalidade: string;
  profissao: string;
  domicilio: Endereco;
  contato: Contato;
  instrumentoNomeacao: string;
  dataInstrumento: string;
  numeroRegistro: string;
  dataRegistro: string;
}

export interface RepresentanteProcurador {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  orgaoEmissorRg: string;
  estadoEmissorRg: string;
  dataEmissaoRg: string;
  nacionalidade: string;
  profissao: string;
  domicilio: Endereco;
  contato: Contato;
  livro: string;
  folha: string;
  tabelionato: string;
  cidade: string;
  estado: string;
  dataProcuracao: string;
  validadeProcuracao: string;
}

// === Negocio Juridico - Participantes ===
export interface ParticipanteNegocio {
  id: string;
  pessoaId: string;
  tipoPessoa: 'natural' | 'juridica';
  fracaoIdeal: string;
  valorParticipacao: string;
  conjuge?: string;
  qualidade: string;
}

export interface FormaPagamentoDetalhada {
  tipo: string;
  data: string;
  modo: string;
  contaOrigem: DadosBancarios;
  contaDestino: DadosBancarios;
}

export interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
}

export interface TermosEspeciais {
  termosPromessa: string;
  termosEspeciais: string;
  condicaoResolutiva: string;
}

export interface IndisponibilidadeBens {
  consultaRealizada: boolean;
  dataConsulta: string;
  resultados: ResultadoIndisponibilidade[];
}

export interface ResultadoIndisponibilidade {
  id: string;
  nome: string;
  documento: string;
  situacao: string;
  dataRegistro: string;
}

export interface ImpostoTransmissao {
  numeroGuiaITBI: string;
  baseCalculo: string;
  valorGuia: string;
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
