// src/lib/type-mappers.test.ts
import { describe, it, expect } from 'vitest';
import {
  frontendToDbPessoaNatural,
  dbToFrontendPessoaNatural,
  frontendToDbPessoaJuridica,
  dbToFrontendPessoaJuridica,
  frontendToDbImovel,
  dbToFrontendImovel,
  frontendToDbNegocio,
  dbToFrontendNegocio,
  normalizeDate,
  formatDateForDb,
  parseNumeric,
  formatNumeric,
  formatCurrency,
  parseCurrency,
} from './type-mappers';
import type { PessoaNatural, PessoaJuridica, Imovel, NegocioJuridico } from '../types/minuta';
import type { Database } from '../types/database.types';

// ============================================================================
// Test Fixtures
// ============================================================================

const createEmptyEndereco = () => ({
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
});

const createEmptyContato = () => ({
  email: '',
  telefone: '',
});

const createEmptyDadosFamiliares = () => ({
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
});

const createEmptyCNDT = () => ({
  numeroCNDT: '',
  dataExpedicao: '',
  horaExpedicao: '',
});

const createEmptyCertidaoUniao = () => ({
  tipoCertidao: '',
  dataEmissao: '',
  horaEmissao: '',
  validade: '',
  codigoControle: '',
});

const samplePessoaNatural: PessoaNatural = {
  id: 'pn-123',
  nome: 'João da Silva',
  cpf: '123.456.789-00',
  rg: '12.345.678-9',
  orgaoEmissorRg: 'SSP',
  estadoEmissorRg: 'SP',
  dataEmissaoRg: '2020-01-15',
  nacionalidade: 'brasileira',
  profissao: 'Engenheiro',
  dataNascimento: '1985-05-20',
  dataObito: '',
  cnh: '12345678901',
  orgaoEmissorCnh: 'DETRAN-SP',
  dadosFamiliares: {
    estadoCivil: 'casado',
    regimeBens: 'comunhao parcial de bens',
    dataCasamento: '2010-06-15',
    dataSeparacao: '',
    dataDivorcio: '',
    dataFalecimentoConjuge: '',
    uniaoEstavel: false,
    dataUniaoEstavel: '',
    dataExtincaoUniaoEstavel: '',
    regimeBensUniao: '',
  },
  domicilio: {
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: 'Apto 45',
    bairro: 'Jardim Primavera',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
  },
  contato: {
    email: 'joao.silva@email.com',
    telefone: '(11) 99999-8888',
  },
  cndt: {
    numeroCNDT: 'CNDT-123456',
    dataExpedicao: '2024-01-10',
    horaExpedicao: '14:30',
  },
  certidaoUniao: {
    tipoCertidao: 'Negativa',
    dataEmissao: '2024-01-10',
    horaEmissao: '15:00',
    validade: '2024-07-10',
    codigoControle: 'CTRL-789',
  },
  camposEditados: ['nome', 'cpf'],
};

const samplePessoaJuridica: PessoaJuridica = {
  id: 'pj-456',
  razaoSocial: 'Empresa Exemplo LTDA',
  cnpj: '12.345.678/0001-99',
  nire: '35.123.456.789',
  inscricaoEstadual: '123.456.789.000',
  dataConstituicao: '2015-03-10',
  endereco: {
    logradouro: 'Avenida Paulista',
    numero: '1000',
    complemento: 'Sala 501',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
  },
  contato: {
    email: 'contato@empresa.com.br',
    telefone: '(11) 3333-4444',
  },
  registroVigente: {
    instrumentoConstitutivo: 'Contrato Social',
    juntaComercial: 'JUCESP',
    numeroRegistro: 'REG-123456',
    dataSessaoRegistro: '2015-03-15',
  },
  certidaoEmpresa: {
    dataExpedicaoFichaCadastral: '2024-01-05',
    dataExpedicaoCertidaoRegistro: '2024-01-06',
  },
  representantes: [
    { id: 'rep-1', nome: 'Maria Representante', cpf: '987.654.321-00', cargo: 'Sócia-Administradora' },
  ],
  administradores: [],
  procuradores: [],
  cndt: createEmptyCNDT(),
  certidaoUniao: createEmptyCertidaoUniao(),
  camposEditados: [],
};

const sampleImovel: Imovel = {
  id: 'im-789',
  matricula: {
    numeroMatricula: '12345',
    numeroRegistroImoveis: '1º RI',
    cidadeRegistroImoveis: 'São Paulo',
    estadoRegistroImoveis: 'SP',
    numeroNacionalMatricula: 'BR-SP-001-12345',
  },
  descricao: {
    denominacao: 'Apartamento 101',
    areaTotalM2: '75.50',
    areaPrivativaM2: '65.00',
    areaConstruida: '70.00',
    endereco: {
      logradouro: 'Rua dos Pinheiros',
      numero: '500',
      complemento: 'Apto 101',
      bairro: 'Pinheiros',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '05422-000',
    },
    descricaoConformeMatricula: 'Apartamento 101 do Edifício Sol Nascente',
  },
  cadastro: {
    cadastroMunicipalSQL: '123.456.7890-1',
    dataExpedicaoCertidao: '2024-01-08',
  },
  valoresVenais: {
    valorVenalIPTU: '250000.00',
    valorVenalReferenciaITBI: '300000.00',
  },
  negativaIPTU: {
    numeroCertidao: 'IPTU-2024-123',
    dataExpedicao: '2024-01-09',
    certidaoValida: 'Sim',
  },
  certidaoMatricula: {
    certidaoMatricula: 'CM-2024-456',
    dataExpedicao: '2024-01-07',
    certidaoValida: 'Sim',
  },
  proprietarios: [
    {
      id: 'prop-1',
      nome: 'João da Silva',
      fracaoIdeal: '100%',
      registroAquisicao: 'R-1',
      dataRegistroAquisicao: '2018-05-20',
      tituloAquisicao: 'Compra e Venda',
    },
  ],
  onus: [],
  ressalvas: {
    existeRessalva: 'Não',
    descricaoRessalva: '',
  },
  camposEditados: [],
};

const sampleNegocio: NegocioJuridico = {
  id: 'neg-001',
  imovelId: 'im-789',
  tipoAto: 'compra_venda',
  fracaoIdealAlienada: '100%',
  valorTotalAlienacao: '500000.00',
  valorNegocio: '500000.00',
  formaPagamento: 'à vista',
  formaPagamentoDetalhada: {
    tipo: 'transferência',
    data: '2024-02-01',
    modo: 'PIX',
    contaOrigem: { banco: 'Itaú', agencia: '1234', conta: '56789-0' },
    contaDestino: { banco: 'Bradesco', agencia: '4321', conta: '98765-0' },
  },
  alienantes: [
    { id: 'al-1', pessoaId: 'pn-123', tipoPessoa: 'natural', fracaoIdeal: '100%', valorParticipacao: '500000.00', qualidade: 'proprietário' },
  ],
  adquirentes: [
    { id: 'ad-1', pessoaId: 'pn-456', tipoPessoa: 'natural', fracaoIdeal: '100%', valorParticipacao: '500000.00', qualidade: 'comprador' },
  ],
  termosEspeciais: {
    termosPromessa: '',
    termosEspeciais: '',
    condicaoResolutiva: '',
  },
  declaracoes: {},
  dispensas: {},
  indisponibilidade: {
    consultaRealizada: true,
    dataConsulta: '2024-01-15',
    resultados: [],
  },
  impostoTransmissao: {
    numeroGuiaITBI: 'ITBI-2024-789',
    baseCalculo: '300000.00',
    valorGuia: '6000.00',
  },
  condicoesEspeciais: '',
  clausulasAdicionais: '',
  camposEditados: [],
};

// ============================================================================
// Helper Functions Tests
// ============================================================================

describe('Helper Functions', () => {
  describe('normalizeDate', () => {
    it('should return null for null input', () => {
      expect(normalizeDate(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(normalizeDate('')).toBeNull();
    });

    it('should return ISO string for Date object', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = normalizeDate(date);
      expect(result).toBe('2024-01-15');
    });

    it('should return date string for ISO string input', () => {
      expect(normalizeDate('2024-01-15T12:00:00Z')).toBe('2024-01-15');
    });

    it('should preserve YYYY-MM-DD format', () => {
      expect(normalizeDate('2024-01-15')).toBe('2024-01-15');
    });
  });

  describe('formatDateForDb', () => {
    it('should return null for null input', () => {
      expect(formatDateForDb(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(formatDateForDb('')).toBeNull();
    });

    it('should return ISO date string', () => {
      expect(formatDateForDb('2024-01-15')).toBe('2024-01-15');
    });
  });

  describe('parseNumeric', () => {
    it('should return null for null input', () => {
      expect(parseNumeric(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseNumeric('')).toBeNull();
    });

    it('should parse simple number string', () => {
      expect(parseNumeric('123.45')).toBe(123.45);
    });

    it('should handle Brazilian currency format', () => {
      expect(parseNumeric('1.234,56')).toBe(1234.56);
    });

    it('should handle number with R$ prefix', () => {
      expect(parseNumeric('R$ 1.234,56')).toBe(1234.56);
    });
  });

  describe('formatNumeric', () => {
    it('should return empty string for null input', () => {
      expect(formatNumeric(null)).toBe('');
    });

    it('should format number to string with 2 decimals', () => {
      expect(formatNumeric(123.456)).toBe('123.46');
    });

    it('should handle integer', () => {
      expect(formatNumeric(100)).toBe('100.00');
    });
  });

  describe('formatCurrency', () => {
    it('should return empty string for null input', () => {
      expect(formatCurrency(null)).toBe('');
    });

    it('should format number as currency string', () => {
      expect(formatCurrency(1234.56)).toBe('1234.56');
    });
  });

  describe('parseCurrency', () => {
    it('should return null for null input', () => {
      expect(parseCurrency(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseCurrency('')).toBeNull();
    });

    it('should parse currency string', () => {
      expect(parseCurrency('500000.00')).toBe(500000.00);
    });
  });
});

// ============================================================================
// Pessoa Natural Tests
// ============================================================================

describe('Pessoa Natural Mappers', () => {
  describe('frontendToDbPessoaNatural', () => {
    it('should convert basic fields correctly', () => {
      const result = frontendToDbPessoaNatural(samplePessoaNatural, 'minuta-001', 'outorgante');

      expect(result.nome_completo).toBe('João da Silva');
      expect(result.cpf).toBe('123.456.789-00');
      expect(result.rg).toBe('12.345.678-9');
      expect(result.nacionalidade).toBe('brasileira');
      expect(result.profissao).toBe('Engenheiro');
      expect(result.minuta_id).toBe('minuta-001');
      expect(result.papel).toBe('outorgante');
    });

    it('should convert estado_civil from nested dadosFamiliares', () => {
      const result = frontendToDbPessoaNatural(samplePessoaNatural, 'minuta-001', 'outorgante');

      expect(result.estado_civil).toBe('casado');
    });

    it('should convert endereco as JSON', () => {
      const result = frontendToDbPessoaNatural(samplePessoaNatural, 'minuta-001', 'outorgante');

      expect(result.endereco).toBeDefined();
      const endereco = result.endereco as Record<string, unknown>;
      expect(endereco.logradouro).toBe('Rua das Flores');
      expect(endereco.numero).toBe('123');
      expect(endereco.cidade).toBe('São Paulo');
    });

    it('should handle null/undefined optional fields', () => {
      const minimalPessoa: PessoaNatural = {
        id: 'pn-min',
        nome: 'Pessoa Mínima',
        cpf: '',
        rg: '',
        orgaoEmissorRg: '',
        estadoEmissorRg: '',
        dataEmissaoRg: '',
        nacionalidade: '',
        profissao: '',
        dataNascimento: '',
        dataObito: '',
        cnh: '',
        orgaoEmissorCnh: '',
        dadosFamiliares: createEmptyDadosFamiliares(),
        domicilio: createEmptyEndereco(),
        contato: createEmptyContato(),
        cndt: createEmptyCNDT(),
        certidaoUniao: createEmptyCertidaoUniao(),
        camposEditados: [],
      };

      const result = frontendToDbPessoaNatural(minimalPessoa, 'minuta-001', 'outorgante');

      expect(result.nome_completo).toBe('Pessoa Mínima');
      expect(result.cpf).toBeNull();
      expect(result.rg).toBeNull();
    });

    it('should preserve papel (outorgante, outorgado, anuente)', () => {
      const outorgante = frontendToDbPessoaNatural(samplePessoaNatural, 'minuta-001', 'outorgante');
      const outorgado = frontendToDbPessoaNatural(samplePessoaNatural, 'minuta-001', 'outorgado');
      const anuente = frontendToDbPessoaNatural(samplePessoaNatural, 'minuta-001', 'anuente');

      expect(outorgante.papel).toBe('outorgante');
      expect(outorgado.papel).toBe('outorgado');
      expect(anuente.papel).toBe('anuente');
    });
  });

  describe('dbToFrontendPessoaNatural', () => {
    it('should convert basic fields correctly', () => {
      const dbRow: Database['public']['Tables']['pessoas_naturais']['Row'] = {
        id: 'pn-db-123',
        minuta_id: 'minuta-001',
        documento_origem_id: null,
        nome_completo: 'Maria da Silva',
        cpf: '987.654.321-00',
        rg: '98.765.432-1',
        nacionalidade: 'brasileira',
        estado_civil: 'solteira',
        profissao: 'Advogada',
        endereco: {
          logradouro: 'Avenida Brasil',
          numero: '500',
          complemento: '',
          bairro: 'Centro',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          cep: '20000-000',
        },
        papel: 'outorgado',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendPessoaNatural(dbRow);

      expect(result.id).toBe('pn-db-123');
      expect(result.nome).toBe('Maria da Silva');
      expect(result.cpf).toBe('987.654.321-00');
      expect(result.rg).toBe('98.765.432-1');
      expect(result.nacionalidade).toBe('brasileira');
      expect(result.profissao).toBe('Advogada');
    });

    it('should reconstruct nested domicilio object from JSON', () => {
      const dbRow: Database['public']['Tables']['pessoas_naturais']['Row'] = {
        id: 'pn-db-123',
        minuta_id: 'minuta-001',
        documento_origem_id: null,
        nome_completo: 'Maria da Silva',
        cpf: null,
        rg: null,
        nacionalidade: null,
        estado_civil: null,
        profissao: null,
        endereco: {
          logradouro: 'Avenida Brasil',
          numero: '500',
          complemento: 'Sala 1',
          bairro: 'Centro',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          cep: '20000-000',
        },
        papel: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendPessoaNatural(dbRow);

      expect(result.domicilio.logradouro).toBe('Avenida Brasil');
      expect(result.domicilio.numero).toBe('500');
      expect(result.domicilio.complemento).toBe('Sala 1');
      expect(result.domicilio.bairro).toBe('Centro');
      expect(result.domicilio.cidade).toBe('Rio de Janeiro');
      expect(result.domicilio.estado).toBe('RJ');
      expect(result.domicilio.cep).toBe('20000-000');
    });

    it('should reconstruct dadosFamiliares with estadoCivil', () => {
      const dbRow: Database['public']['Tables']['pessoas_naturais']['Row'] = {
        id: 'pn-db-123',
        minuta_id: 'minuta-001',
        documento_origem_id: null,
        nome_completo: 'Teste',
        cpf: null,
        rg: null,
        nacionalidade: null,
        estado_civil: 'casado',
        profissao: null,
        endereco: null,
        papel: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendPessoaNatural(dbRow);

      expect(result.dadosFamiliares.estadoCivil).toBe('casado');
    });

    it('should handle null endereco', () => {
      const dbRow: Database['public']['Tables']['pessoas_naturais']['Row'] = {
        id: 'pn-db-123',
        minuta_id: 'minuta-001',
        documento_origem_id: null,
        nome_completo: 'Teste',
        cpf: null,
        rg: null,
        nacionalidade: null,
        estado_civil: null,
        profissao: null,
        endereco: null,
        papel: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendPessoaNatural(dbRow);

      expect(result.domicilio.logradouro).toBe('');
      expect(result.domicilio.numero).toBe('');
      expect(result.domicilio.cidade).toBe('');
    });
  });

  describe('Round-trip: PessoaNatural', () => {
    it('should preserve data through frontend -> db -> frontend conversion', () => {
      const dbInsert = frontendToDbPessoaNatural(samplePessoaNatural, 'minuta-001', 'outorgante');

      // Simulate what would come back from DB (Row type)
      const dbRow: Database['public']['Tables']['pessoas_naturais']['Row'] = {
        id: samplePessoaNatural.id,
        minuta_id: dbInsert.minuta_id,
        documento_origem_id: dbInsert.documento_origem_id ?? null,
        nome_completo: dbInsert.nome_completo,
        cpf: dbInsert.cpf ?? null,
        rg: dbInsert.rg ?? null,
        nacionalidade: dbInsert.nacionalidade ?? null,
        estado_civil: dbInsert.estado_civil ?? null,
        profissao: dbInsert.profissao ?? null,
        endereco: dbInsert.endereco ?? null,
        papel: dbInsert.papel ?? null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendPessoaNatural(dbRow);

      expect(result.nome).toBe(samplePessoaNatural.nome);
      expect(result.cpf).toBe(samplePessoaNatural.cpf);
      expect(result.rg).toBe(samplePessoaNatural.rg);
      expect(result.nacionalidade).toBe(samplePessoaNatural.nacionalidade);
      expect(result.profissao).toBe(samplePessoaNatural.profissao);
      expect(result.dadosFamiliares.estadoCivil).toBe(samplePessoaNatural.dadosFamiliares.estadoCivil);
      expect(result.domicilio.logradouro).toBe(samplePessoaNatural.domicilio.logradouro);
      expect(result.domicilio.cidade).toBe(samplePessoaNatural.domicilio.cidade);
    });
  });
});

// ============================================================================
// Pessoa Juridica Tests
// ============================================================================

describe('Pessoa Juridica Mappers', () => {
  describe('frontendToDbPessoaJuridica', () => {
    it('should convert basic fields correctly', () => {
      const result = frontendToDbPessoaJuridica(samplePessoaJuridica, 'minuta-001', 'outorgante');

      expect(result.razao_social).toBe('Empresa Exemplo LTDA');
      expect(result.cnpj).toBe('12.345.678/0001-99');
      expect(result.inscricao_estadual).toBe('123.456.789.000');
      expect(result.minuta_id).toBe('minuta-001');
      expect(result.papel).toBe('outorgante');
    });

    it('should convert endereco as JSON', () => {
      const result = frontendToDbPessoaJuridica(samplePessoaJuridica, 'minuta-001', 'outorgante');

      expect(result.endereco).toBeDefined();
      const endereco = result.endereco as Record<string, unknown>;
      expect(endereco.logradouro).toBe('Avenida Paulista');
      expect(endereco.cidade).toBe('São Paulo');
    });
  });

  describe('dbToFrontendPessoaJuridica', () => {
    it('should convert basic fields correctly', () => {
      const dbRow: Database['public']['Tables']['pessoas_juridicas']['Row'] = {
        id: 'pj-db-456',
        minuta_id: 'minuta-001',
        documento_origem_id: null,
        razao_social: 'Outra Empresa LTDA',
        nome_fantasia: 'Outra Fantasia',
        cnpj: '98.765.432/0001-11',
        inscricao_estadual: '987.654.321.000',
        endereco: {
          logradouro: 'Rua Augusta',
          numero: '2000',
          complemento: '',
          bairro: 'Consolação',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01305-000',
        },
        representante_id: null,
        papel: 'outorgado',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendPessoaJuridica(dbRow);

      expect(result.id).toBe('pj-db-456');
      expect(result.razaoSocial).toBe('Outra Empresa LTDA');
      expect(result.cnpj).toBe('98.765.432/0001-11');
      expect(result.inscricaoEstadual).toBe('987.654.321.000');
    });

    it('should reconstruct nested endereco object', () => {
      const dbRow: Database['public']['Tables']['pessoas_juridicas']['Row'] = {
        id: 'pj-db-456',
        minuta_id: 'minuta-001',
        documento_origem_id: null,
        razao_social: 'Teste LTDA',
        nome_fantasia: null,
        cnpj: null,
        inscricao_estadual: null,
        endereco: {
          logradouro: 'Rua Teste',
          numero: '100',
          complemento: 'Conj 5',
          bairro: 'Teste',
          cidade: 'Teste City',
          estado: 'TC',
          cep: '12345-678',
        },
        representante_id: null,
        papel: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendPessoaJuridica(dbRow);

      expect(result.endereco.logradouro).toBe('Rua Teste');
      expect(result.endereco.numero).toBe('100');
      expect(result.endereco.cidade).toBe('Teste City');
    });
  });

  describe('Round-trip: PessoaJuridica', () => {
    it('should preserve data through frontend -> db -> frontend conversion', () => {
      const dbInsert = frontendToDbPessoaJuridica(samplePessoaJuridica, 'minuta-001', 'outorgante');

      const dbRow: Database['public']['Tables']['pessoas_juridicas']['Row'] = {
        id: samplePessoaJuridica.id,
        minuta_id: dbInsert.minuta_id,
        documento_origem_id: dbInsert.documento_origem_id ?? null,
        razao_social: dbInsert.razao_social,
        nome_fantasia: dbInsert.nome_fantasia ?? null,
        cnpj: dbInsert.cnpj ?? null,
        inscricao_estadual: dbInsert.inscricao_estadual ?? null,
        endereco: dbInsert.endereco ?? null,
        representante_id: dbInsert.representante_id ?? null,
        papel: dbInsert.papel ?? null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendPessoaJuridica(dbRow);

      expect(result.razaoSocial).toBe(samplePessoaJuridica.razaoSocial);
      expect(result.cnpj).toBe(samplePessoaJuridica.cnpj);
      expect(result.inscricaoEstadual).toBe(samplePessoaJuridica.inscricaoEstadual);
      expect(result.endereco.logradouro).toBe(samplePessoaJuridica.endereco.logradouro);
    });
  });
});

// ============================================================================
// Imovel Tests
// ============================================================================

describe('Imovel Mappers', () => {
  describe('frontendToDbImovel', () => {
    it('should convert basic fields correctly', () => {
      const result = frontendToDbImovel(sampleImovel, 'minuta-001');

      expect(result.minuta_id).toBe('minuta-001');
      expect(result.matricula).toBe('12345');
      expect(result.cartorio_registro).toBe('1º RI');
      expect(result.inscricao_municipal).toBe('123.456.7890-1');
    });

    it('should convert area fields as numbers', () => {
      const result = frontendToDbImovel(sampleImovel, 'minuta-001');

      expect(result.area_total).toBe(75.50);
      expect(result.area_construida).toBe(70.00);
    });

    it('should convert endereco_completo from nested object', () => {
      const result = frontendToDbImovel(sampleImovel, 'minuta-001');

      expect(result.endereco_completo).toContain('Rua dos Pinheiros');
      expect(result.endereco_completo).toContain('500');
    });

    it('should store additional data in dados_adicionais JSON', () => {
      const result = frontendToDbImovel(sampleImovel, 'minuta-001');

      expect(result.dados_adicionais).toBeDefined();
      const dados = result.dados_adicionais as Record<string, unknown>;
      expect(dados.valoresVenais).toBeDefined();
      expect(dados.proprietarios).toBeDefined();
    });
  });

  describe('dbToFrontendImovel', () => {
    it('should convert basic fields correctly', () => {
      const dbRow: Database['public']['Tables']['imoveis']['Row'] = {
        id: 'im-db-789',
        minuta_id: 'minuta-001',
        documento_origem_id: null,
        tipo_imovel: 'apartamento',
        endereco_completo: 'Rua dos Pinheiros, 500, Apto 101, Pinheiros, São Paulo, SP, 05422-000',
        matricula: '12345',
        cartorio_registro: '1º RI',
        area_total: 75.50,
        area_construida: 70.00,
        inscricao_municipal: '123.456.7890-1',
        dados_adicionais: {
          valoresVenais: {
            valorVenalIPTU: '250000.00',
            valorVenalReferenciaITBI: '300000.00',
          },
          proprietarios: [],
          descricao: {
            denominacao: 'Apartamento 101',
            areaTotalM2: '75.50',
            areaPrivativaM2: '65.00',
            areaConstruida: '70.00',
            descricaoConformeMatricula: 'Apartamento 101 do Edifício Sol Nascente',
          },
          matriculaCompleta: {
            numeroMatricula: '12345',
            numeroRegistroImoveis: '1º RI',
            cidadeRegistroImoveis: 'São Paulo',
            estadoRegistroImoveis: 'SP',
            numeroNacionalMatricula: 'BR-SP-001-12345',
          },
        },
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendImovel(dbRow);

      expect(result.id).toBe('im-db-789');
      expect(result.matricula.numeroMatricula).toBe('12345');
      expect(result.matricula.numeroRegistroImoveis).toBe('1º RI');
    });

    it('should reconstruct descricao object with area fields', () => {
      const dbRow: Database['public']['Tables']['imoveis']['Row'] = {
        id: 'im-db-789',
        minuta_id: 'minuta-001',
        documento_origem_id: null,
        tipo_imovel: 'apartamento',
        endereco_completo: 'Rua Teste, 100',
        matricula: '99999',
        cartorio_registro: '2º RI',
        area_total: 100.00,
        area_construida: 80.00,
        inscricao_municipal: '999.999.9999-9',
        dados_adicionais: {
          descricao: {
            denominacao: 'Casa Teste',
            areaTotalM2: '100.00',
            areaPrivativaM2: '90.00',
            areaConstruida: '80.00',
            descricaoConformeMatricula: 'Casa Teste conforme matrícula',
          },
        },
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendImovel(dbRow);

      expect(result.descricao.denominacao).toBe('Casa Teste');
      expect(result.descricao.areaTotalM2).toBe('100.00');
      expect(result.descricao.areaConstruida).toBe('80.00');
    });
  });

  describe('Round-trip: Imovel', () => {
    it('should preserve data through frontend -> db -> frontend conversion', () => {
      const dbInsert = frontendToDbImovel(sampleImovel, 'minuta-001');

      const dbRow: Database['public']['Tables']['imoveis']['Row'] = {
        id: sampleImovel.id,
        minuta_id: dbInsert.minuta_id,
        documento_origem_id: dbInsert.documento_origem_id ?? null,
        tipo_imovel: dbInsert.tipo_imovel ?? null,
        endereco_completo: dbInsert.endereco_completo ?? null,
        matricula: dbInsert.matricula ?? null,
        cartorio_registro: dbInsert.cartorio_registro ?? null,
        area_total: dbInsert.area_total ?? null,
        area_construida: dbInsert.area_construida ?? null,
        inscricao_municipal: dbInsert.inscricao_municipal ?? null,
        dados_adicionais: dbInsert.dados_adicionais ?? null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendImovel(dbRow);

      expect(result.matricula.numeroMatricula).toBe(sampleImovel.matricula.numeroMatricula);
      expect(result.cadastro.cadastroMunicipalSQL).toBe(sampleImovel.cadastro.cadastroMunicipalSQL);
    });
  });
});

// ============================================================================
// Negocio Juridico Tests
// ============================================================================

describe('Negocio Juridico Mappers', () => {
  describe('frontendToDbNegocio', () => {
    it('should convert basic fields correctly', () => {
      const result = frontendToDbNegocio(sampleNegocio, 'minuta-001', 'im-789');

      expect(result.minuta_id).toBe('minuta-001');
      expect(result.tipo_negocio).toBe('compra_venda');
      expect(result.forma_pagamento).toBe('à vista');
    });

    it('should convert valor as number', () => {
      const result = frontendToDbNegocio(sampleNegocio, 'minuta-001', 'im-789');

      expect(result.valor).toBe(500000.00);
    });

    it('should store complex data in condicoes JSON', () => {
      const result = frontendToDbNegocio(sampleNegocio, 'minuta-001', 'im-789');

      expect(result.condicoes).toBeDefined();
      const condicoes = result.condicoes as Record<string, unknown>;
      expect(condicoes.alienantes).toBeDefined();
      expect(condicoes.adquirentes).toBeDefined();
      expect(condicoes.impostoTransmissao).toBeDefined();
    });
  });

  describe('dbToFrontendNegocio', () => {
    it('should convert basic fields correctly', () => {
      const dbRow: Database['public']['Tables']['negocios_juridicos']['Row'] = {
        id: 'neg-db-001',
        minuta_id: 'minuta-001',
        tipo_negocio: 'compra_venda',
        valor: 500000.00,
        moeda: 'BRL',
        forma_pagamento: 'à vista',
        condicoes: {
          imovelId: 'im-789',
          fracaoIdealAlienada: '100%',
          valorTotalAlienacao: '500000.00',
          alienantes: [],
          adquirentes: [],
          impostoTransmissao: {
            numeroGuiaITBI: 'ITBI-2024-789',
            baseCalculo: '300000.00',
            valorGuia: '6000.00',
          },
        },
        data_assinatura: '2024-02-01',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendNegocio(dbRow);

      expect(result.id).toBe('neg-db-001');
      expect(result.tipoAto).toBe('compra_venda');
      expect(result.valorNegocio).toBe('500000.00');
      expect(result.formaPagamento).toBe('à vista');
    });

    it('should reconstruct impostoTransmissao from condicoes', () => {
      const dbRow: Database['public']['Tables']['negocios_juridicos']['Row'] = {
        id: 'neg-db-001',
        minuta_id: 'minuta-001',
        tipo_negocio: 'compra_venda',
        valor: 500000.00,
        moeda: 'BRL',
        forma_pagamento: 'à vista',
        condicoes: {
          impostoTransmissao: {
            numeroGuiaITBI: 'ITBI-2024-789',
            baseCalculo: '300000.00',
            valorGuia: '6000.00',
          },
        },
        data_assinatura: null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendNegocio(dbRow);

      expect(result.impostoTransmissao.numeroGuiaITBI).toBe('ITBI-2024-789');
      expect(result.impostoTransmissao.baseCalculo).toBe('300000.00');
      expect(result.impostoTransmissao.valorGuia).toBe('6000.00');
    });
  });

  describe('Round-trip: NegocioJuridico', () => {
    it('should preserve data through frontend -> db -> frontend conversion', () => {
      const dbInsert = frontendToDbNegocio(sampleNegocio, 'minuta-001', 'im-789');

      const dbRow: Database['public']['Tables']['negocios_juridicos']['Row'] = {
        id: sampleNegocio.id,
        minuta_id: dbInsert.minuta_id,
        tipo_negocio: dbInsert.tipo_negocio,
        valor: dbInsert.valor ?? null,
        moeda: dbInsert.moeda ?? null,
        forma_pagamento: dbInsert.forma_pagamento ?? null,
        condicoes: dbInsert.condicoes ?? null,
        data_assinatura: dbInsert.data_assinatura ?? null,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      const result = dbToFrontendNegocio(dbRow);

      expect(result.tipoAto).toBe(sampleNegocio.tipoAto);
      expect(result.formaPagamento).toBe(sampleNegocio.formaPagamento);
      expect(result.impostoTransmissao.numeroGuiaITBI).toBe(sampleNegocio.impostoTransmissao.numeroGuiaITBI);
    });
  });
});
