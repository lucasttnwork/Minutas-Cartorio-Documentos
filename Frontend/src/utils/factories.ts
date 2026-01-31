// src/utils/factories.ts
import type {
  PessoaNatural,
  PessoaJuridica,
  Imovel,
  Endereco,
  Contato,
  CertidaoCNDT,
  CertidaoUniao,
  DadosFamiliares,
  RegistroVigente,
  CertidaoEmpresa,
  RepresentanteAdministrador,
  RepresentanteProcurador,
  ParticipanteNegocio,
  FormaPagamentoDetalhada,
  DadosBancarios,
  TermosEspeciais,
  IndisponibilidadeBens,
  ImpostoTransmissao,
  NegocioJuridico,
} from '@/types/minuta';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function createEmptyEndereco(): Endereco {
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

export function createEmptyContato(): Contato {
  return {
    email: '',
    telefone: '',
  };
}

export function createEmptyCertidaoCNDT(): CertidaoCNDT {
  return {
    numeroCNDT: '',
    dataExpedicao: '',
    horaExpedicao: '',
  };
}

export function createEmptyCertidaoUniao(): CertidaoUniao {
  return {
    tipoCertidao: '',
    dataEmissao: '',
    horaEmissao: '',
    validade: '',
    codigoControle: '',
  };
}

export function createEmptyDadosFamiliares(): DadosFamiliares {
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

export function createEmptyRegistroVigente(): RegistroVigente {
  return {
    instrumentoConstitutivo: '',
    juntaComercial: '',
    numeroRegistro: '',
    dataSessaoRegistro: '',
  };
}

export function createEmptyCertidaoEmpresa(): CertidaoEmpresa {
  return {
    dataExpedicaoFichaCadastral: '',
    dataExpedicaoCertidaoRegistro: '',
  };
}

export function createEmptyRepresentanteAdministrador(): RepresentanteAdministrador {
  return {
    id: generateId(),
    nome: '',
    cpf: '',
    rg: '',
    orgaoEmissorRg: '',
    estadoEmissorRg: '',
    dataEmissaoRg: '',
    nacionalidade: 'Brasileira',
    profissao: '',
    domicilio: createEmptyEndereco(),
    contato: createEmptyContato(),
    instrumentoNomeacao: '',
    dataInstrumento: '',
    numeroRegistro: '',
    dataRegistro: '',
  };
}

export function createEmptyRepresentanteProcurador(): RepresentanteProcurador {
  return {
    id: generateId(),
    nome: '',
    cpf: '',
    rg: '',
    orgaoEmissorRg: '',
    estadoEmissorRg: '',
    dataEmissaoRg: '',
    nacionalidade: 'Brasileira',
    profissao: '',
    domicilio: createEmptyEndereco(),
    contato: createEmptyContato(),
    livro: '',
    folha: '',
    tabelionato: '',
    cidade: '',
    estado: '',
    dataProcuracao: '',
    validadeProcuracao: '',
  };
}

export function createEmptyDadosBancarios(): DadosBancarios {
  return {
    banco: '',
    agencia: '',
    conta: '',
  };
}

export function createEmptyFormaPagamentoDetalhada(): FormaPagamentoDetalhada {
  return {
    tipo: '',
    data: '',
    modo: '',
    contaOrigem: createEmptyDadosBancarios(),
    contaDestino: createEmptyDadosBancarios(),
  };
}

export function createEmptyTermosEspeciais(): TermosEspeciais {
  return {
    termosPromessa: '',
    termosEspeciais: '',
    condicaoResolutiva: '',
  };
}

export function createEmptyIndisponibilidadeBens(): IndisponibilidadeBens {
  return {
    consultaRealizada: false,
    dataConsulta: '',
    resultados: [],
  };
}

export function createEmptyImpostoTransmissao(): ImpostoTransmissao {
  return {
    numeroGuiaITBI: '',
    baseCalculo: '',
    valorGuia: '',
  };
}

export function createEmptyParticipanteNegocio(): ParticipanteNegocio {
  return {
    id: generateId(),
    pessoaId: '',
    tipoPessoa: 'natural',
    fracaoIdeal: '',
    valorParticipacao: '',
    qualidade: '',
  };
}

export function createEmptyPessoaNatural(): PessoaNatural {
  return {
    id: generateId(),
    nome: '',
    cpf: '',
    rg: '',
    orgaoEmissorRg: '',
    estadoEmissorRg: '',
    dataEmissaoRg: '',
    nacionalidade: 'Brasileira',
    profissao: '',
    dataNascimento: '',
    dataObito: '',
    cnh: '',
    orgaoEmissorCnh: '',
    dadosFamiliares: createEmptyDadosFamiliares(),
    domicilio: createEmptyEndereco(),
    contato: createEmptyContato(),
    cndt: createEmptyCertidaoCNDT(),
    certidaoUniao: createEmptyCertidaoUniao(),
    camposEditados: [],
  };
}

export function createEmptyPessoaJuridica(): PessoaJuridica {
  return {
    id: generateId(),
    razaoSocial: '',
    cnpj: '',
    nire: '',
    inscricaoEstadual: '',
    dataConstituicao: '',
    endereco: createEmptyEndereco(),
    contato: createEmptyContato(),
    registroVigente: createEmptyRegistroVigente(),
    certidaoEmpresa: createEmptyCertidaoEmpresa(),
    representantes: [],
    administradores: [],
    procuradores: [],
    cndt: createEmptyCertidaoCNDT(),
    certidaoUniao: createEmptyCertidaoUniao(),
    camposEditados: [],
  };
}

export function createEmptyNegocioJuridico(): NegocioJuridico {
  return {
    id: generateId(),
    imovelId: '',
    tipoAto: '',
    fracaoIdealAlienada: '',
    valorTotalAlienacao: '',
    valorNegocio: '',
    formaPagamento: '',
    formaPagamentoDetalhada: createEmptyFormaPagamentoDetalhada(),
    alienantes: [],
    adquirentes: [],
    termosEspeciais: createEmptyTermosEspeciais(),
    declaracoes: {},
    dispensas: {},
    indisponibilidade: createEmptyIndisponibilidadeBens(),
    impostoTransmissao: createEmptyImpostoTransmissao(),
    condicoesEspeciais: '',
    clausulasAdicionais: '',
    camposEditados: [],
  };
}

export function createEmptyImovel(): Imovel {
  return {
    id: generateId(),
    matricula: {
      numeroMatricula: '',
      numeroRegistroImoveis: '',
      cidadeRegistroImoveis: '',
      estadoRegistroImoveis: '',
      numeroNacionalMatricula: '',
    },
    descricao: {
      denominacao: '',
      areaTotalM2: '',
      areaPrivativaM2: '',
      areaConstruida: '',
      endereco: createEmptyEndereco(),
      descricaoConformeMatricula: '',
    },
    cadastro: {
      cadastroMunicipalSQL: '',
      dataExpedicaoCertidao: '',
    },
    valoresVenais: {
      valorVenalIPTU: '',
      valorVenalReferenciaITBI: '',
    },
    negativaIPTU: {
      numeroCertidao: '',
      dataExpedicao: '',
      certidaoValida: '',
    },
    certidaoMatricula: {
      certidaoMatricula: '',
      dataExpedicao: '',
      certidaoValida: '',
    },
    proprietarios: [],
    onus: [],
    ressalvas: {
      existeRessalva: '',
      descricaoRessalva: '',
    },
    camposEditados: [],
  };
}
