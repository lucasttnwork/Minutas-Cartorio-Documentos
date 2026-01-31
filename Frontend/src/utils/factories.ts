// src/utils/factories.ts
import type { PessoaNatural, PessoaJuridica, Imovel, Endereco, Contato } from '@/types/minuta';

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
    estadoCivil: '',
    regimeBens: '',
    domicilio: createEmptyEndereco(),
    contato: createEmptyContato(),
    camposEditados: [],
  };
}

export function createEmptyPessoaJuridica(): PessoaJuridica {
  return {
    id: generateId(),
    razaoSocial: '',
    cnpj: '',
    inscricaoEstadual: '',
    dataConstituicao: '',
    endereco: createEmptyEndereco(),
    contato: createEmptyContato(),
    representantes: [],
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
