// src/test/templates.test.ts
// TDD Tests for template loading and processing utilities

import { describe, it, expect } from 'vitest';
import {
  QUALIFICATION_TEMPLATES,
  MINUTA_TEMPLATES,
  PLACEHOLDER_KEYS,
  mapDatabaseToPlaceholders,
  generateQualificationText,
  replacePlaceholders,
  type MinutaCompleta,
} from '../../supabase/functions/_shared/templates';

// ============================================================================
// QUALIFICATION TEMPLATES TESTS
// ============================================================================
describe('QUALIFICATION_TEMPLATES', () => {
  it('should have all required civil status templates', () => {
    expect(QUALIFICATION_TEMPLATES).toHaveProperty('CASADO_SEM_PACTO');
    expect(QUALIFICATION_TEMPLATES).toHaveProperty('CASADO_COM_PACTO_AMBOS');
    expect(QUALIFICATION_TEMPLATES).toHaveProperty('CASADO_COM_PACTO_UM');
    expect(QUALIFICATION_TEMPLATES).toHaveProperty('UNIAO_ESTAVEL');
    expect(QUALIFICATION_TEMPLATES).toHaveProperty('SOLTEIRO');
    expect(QUALIFICATION_TEMPLATES).toHaveProperty('DIVORCIADO');
    expect(QUALIFICATION_TEMPLATES).toHaveProperty('VIUVO');
  });

  it('should have valid template strings with placeholders', () => {
    // Person templates should have basic person placeholders
    const personTemplates = [
      QUALIFICATION_TEMPLATES.SOLTEIRO,
      QUALIFICATION_TEMPLATES.CASADO_SEM_PACTO,
      QUALIFICATION_TEMPLATES.CASADO_COM_PACTO_AMBOS,
      QUALIFICATION_TEMPLATES.CASADO_COM_PACTO_UM,
      QUALIFICATION_TEMPLATES.UNIAO_ESTAVEL,
      QUALIFICATION_TEMPLATES.DIVORCIADO,
      QUALIFICATION_TEMPLATES.VIUVO,
    ];
    personTemplates.forEach((template) => {
      expect(template).toContain('{{NOME}}');
      expect(template).toContain('{{NACIONALIDADE}}');
      expect(template).toContain('{{CPF}}');
    });
    // PESSOA_JURIDICA uses RAZAO_SOCIAL instead of NOME
    expect(QUALIFICATION_TEMPLATES.PESSOA_JURIDICA).toContain('{{RAZAO_SOCIAL}}');
    expect(QUALIFICATION_TEMPLATES.PESSOA_JURIDICA).toContain('{{CNPJ}}');
  });

  it('SEM_PACTO template should include spouse and marriage date', () => {
    expect(QUALIFICATION_TEMPLATES.CASADO_SEM_PACTO).toContain('{{CONJUGE_NOME}}');
    expect(QUALIFICATION_TEMPLATES.CASADO_SEM_PACTO).toContain('{{DATA_CASAMENTO}}');
    expect(QUALIFICATION_TEMPLATES.CASADO_SEM_PACTO).toContain('{{REGIME_BENS}}');
  });

  it('COM_PACTO templates should include pacto antenupcial info', () => {
    expect(QUALIFICATION_TEMPLATES.CASADO_COM_PACTO_AMBOS).toContain('{{PACTO_NUMERO}}');
    expect(QUALIFICATION_TEMPLATES.CASADO_COM_PACTO_AMBOS).toContain('{{PACTO_LIVRO}}');
    expect(QUALIFICATION_TEMPLATES.CASADO_COM_PACTO_AMBOS).toContain('{{PACTO_CARTORIO}}');
  });

  it('UNIAO_ESTAVEL template should include union details', () => {
    expect(QUALIFICATION_TEMPLATES.UNIAO_ESTAVEL).toContain('{{DATA_UNIAO_ESTAVEL}}');
    expect(QUALIFICATION_TEMPLATES.UNIAO_ESTAVEL).toContain('{{REGIME_UNIAO}}');
  });

  it('SOLTEIRO template should be the simplest', () => {
    const solteiro = QUALIFICATION_TEMPLATES.SOLTEIRO;
    expect(solteiro).not.toContain('{{CONJUGE_NOME}}');
    expect(solteiro).not.toContain('{{DATA_CASAMENTO}}');
  });
});

// ============================================================================
// MINUTA TEMPLATES TESTS
// ============================================================================
describe('MINUTA_TEMPLATES', () => {
  it('should have VENDA_COMPRA template', () => {
    expect(MINUTA_TEMPLATES).toHaveProperty('VENDA_COMPRA');
  });

  it('VENDA_COMPRA template should contain required sections', () => {
    const template = MINUTA_TEMPLATES.VENDA_COMPRA;

    // Title
    expect(template).toContain('ESCRITURA DE VENDA E COMPRA');

    // Date and location
    expect(template).toContain('{{DATA_LAVRATURA_EXTENSO}}');
    expect(template).toContain('{{DATA_LAVRATURA}}');

    // Parties
    expect(template).toContain('{{OUTORGANTES_VENDEDORES}}');
    expect(template).toContain('{{OUTORGADA_COMPRADORA}}');

    // Property
    expect(template).toContain('{{IMOVEL_DESCRICAO}}');
    expect(template).toContain('{{IMOVEL_MATRICULA}}');

    // Financial
    expect(template).toContain('{{VALOR_TOTAL}}');
    expect(template).toContain('{{VALOR_EXTENSO}}');
    expect(template).toContain('{{FORMA_PAGAMENTO}}');

    // ITBI
    expect(template).toContain('{{ITBI_BASE_CALCULO}}');
    expect(template).toContain('{{ITBI_VALOR}}');
  });
});

// ============================================================================
// PLACEHOLDER_KEYS TESTS
// ============================================================================
describe('PLACEHOLDER_KEYS', () => {
  it('should contain all placeholders from templates', () => {
    // Check that all placeholders used in templates are listed
    expect(PLACEHOLDER_KEYS).toContain('DATA_LAVRATURA_EXTENSO');
    expect(PLACEHOLDER_KEYS).toContain('DATA_LAVRATURA');
    expect(PLACEHOLDER_KEYS).toContain('OUTORGANTES_VENDEDORES');
    expect(PLACEHOLDER_KEYS).toContain('OUTORGADA_COMPRADORA');
    expect(PLACEHOLDER_KEYS).toContain('IMOVEL_DESCRICAO');
    expect(PLACEHOLDER_KEYS).toContain('VALOR_TOTAL');
  });
});

// ============================================================================
// mapDatabaseToPlaceholders TESTS
// ============================================================================
describe('mapDatabaseToPlaceholders', () => {
  const mockMinutaCompleta: MinutaCompleta = {
    dataLavratura: '2025-12-15',
    outorgantes: [
      {
        nome: 'DANIEL PASCHOAL CAMARGO',
        cpf: '304.010.618-09',
        rg: '33554901',
        orgaoEmissorRg: 'SSP',
        estadoEmissorRg: 'SP',
        nacionalidade: 'brasileiro',
        profissao: 'coordenador de recursos humanos',
        estadoCivil: 'solteiro',
        domicilio: {
          logradouro: 'Rua Afonso Pena',
          numero: '560',
          complemento: 'Torre 01, apartamento 91',
          bairro: 'Bom Retiro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01124-000',
        },
      },
    ],
    outorgados: [
      {
        tipo: 'juridica',
        razaoSocial: 'JUCA EMPREENDIMENTOS IMOBILIARIOS LTDA',
        cnpj: '22.219.833/0001-80',
        endereco: {
          logradouro: 'Rua dos Italianos',
          numero: '1018',
          bairro: 'Bom Retiro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01131-000',
        },
        representantes: [
          {
            nome: 'Hee Dong Kim',
            cpf: '166.742.208-17',
            nacionalidade: 'sul coreano',
            profissao: 'empresário',
            estadoCivil: 'casado',
          },
        ],
      },
    ],
    imovel: {
      tipo: 'apartamento',
      numero: '91',
      andar: '9',
      edificio: 'CONDOMÍNIO RESIDENCIAL DEZ TIRADENTES',
      matricula: '198.637',
      cartorio: '8º Oficial de Registro de Imóveis',
      cidade: 'São Paulo',
      areaPrivativa: '42,64',
      areaComum: '20,9929',
      areaTotal: '63,6329',
      endereco: {
        logradouro: 'Rua Afonso Pena',
        numero: '560',
        bairro: 'Bom Retiro',
      },
      cadastroMunicipal: '018 022 0234 1',
      valorVenalReferencia: '233881.00',
    },
    negocio: {
      valorTotal: '250000.00',
      baseCalculoITBI: '250000.00',
      valorITBI: '7500.00',
      formaPagamento: [
        {
          valor: '40000.00',
          data: '10/11/2025',
          modo: 'transferencia',
        },
        {
          valor: '210000.00',
          data: '15/12/2025',
          modo: 'transferencia',
        },
      ],
    },
  };

  it('should map data_lavratura correctly', () => {
    const result = mapDatabaseToPlaceholders(mockMinutaCompleta);

    expect(result['DATA_LAVRATURA']).toBe('15/12/2025');
    expect(result['DATA_LAVRATURA_EXTENSO']).toContain('quinze');
    expect(result['DATA_LAVRATURA_EXTENSO']).toContain('dezembro');
    expect(result['DATA_LAVRATURA_EXTENSO']).toContain('dois mil e vinte e cinco');
  });

  it('should generate outorgantes text', () => {
    const result = mapDatabaseToPlaceholders(mockMinutaCompleta);

    expect(result['OUTORGANTES_VENDEDORES']).toContain('DANIEL PASCHOAL CAMARGO');
    expect(result['OUTORGANTES_VENDEDORES']).toContain('brasileiro');
    expect(result['OUTORGANTES_VENDEDORES']).toContain('solteiro');
    expect(result['OUTORGANTES_VENDEDORES']).toContain('304.010.618-09');
  });

  it('should generate outorgados text for pessoa juridica', () => {
    const result = mapDatabaseToPlaceholders(mockMinutaCompleta);

    expect(result['OUTORGADA_COMPRADORA']).toContain('JUCA EMPREENDIMENTOS IMOBILIARIOS LTDA');
    expect(result['OUTORGADA_COMPRADORA']).toContain('22.219.833/0001-80');
    expect(result['OUTORGADA_COMPRADORA']).toContain('Hee Dong Kim');
  });

  it('should format imovel description correctly', () => {
    const result = mapDatabaseToPlaceholders(mockMinutaCompleta);

    expect(result['IMOVEL_DESCRICAO']).toContain('APARTAMENTO N. 91');
    expect(result['IMOVEL_DESCRICAO']).toContain('9º pavimento');
    expect(result['IMOVEL_DESCRICAO']).toContain('CONDOMÍNIO RESIDENCIAL DEZ TIRADENTES');
    expect(result['IMOVEL_DESCRICAO']).toContain('42,64 metros quadrados');
  });

  it('should map imovel matricula and cartorio', () => {
    const result = mapDatabaseToPlaceholders(mockMinutaCompleta);

    expect(result['IMOVEL_MATRICULA']).toBe('198.637');
    expect(result['IMOVEL_CARTORIO']).toBe('8º Oficial de Registro de Imóveis');
  });

  it('should format valores correctly', () => {
    const result = mapDatabaseToPlaceholders(mockMinutaCompleta);

    // Standard Brazilian currency format includes space after R$
    expect(result['VALOR_TOTAL']).toMatch(/R\$\s?250\.000,00/);
    expect(result['VALOR_EXTENSO']).toContain('duzentos e cinquenta mil reais');
    expect(result['ITBI_VALOR']).toMatch(/R\$\s?7\.500,00/);
  });

  it('should format forma de pagamento', () => {
    const result = mapDatabaseToPlaceholders(mockMinutaCompleta);

    // Currency values with optional space after R$
    expect(result['FORMA_PAGAMENTO']).toMatch(/R\$\s?40\.000,00/);
    expect(result['FORMA_PAGAMENTO']).toContain('10/11/2025');
    expect(result['FORMA_PAGAMENTO']).toMatch(/R\$\s?210\.000,00/);
  });
});

// ============================================================================
// generateQualificationText TESTS
// ============================================================================
describe('generateQualificationText', () => {
  it('should generate solteiro qualification', () => {
    const pessoa = {
      nome: 'DANIEL PASCHOAL CAMARGO',
      cpf: '304.010.618-09',
      rg: '33554901',
      orgaoEmissorRg: 'SSP',
      estadoEmissorRg: 'SP',
      nacionalidade: 'brasileiro',
      profissao: 'coordenador de recursos humanos',
      estadoCivil: 'solteiro',
      domicilio: {
        logradouro: 'Rua Afonso Pena',
        numero: '560',
        complemento: 'Torre 01, apartamento 91',
        bairro: 'Bom Retiro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01124-000',
      },
    };

    const result = generateQualificationText(pessoa);

    expect(result).toContain('DANIEL PASCHOAL CAMARGO');
    expect(result).toContain('brasileiro');
    expect(result).toContain('solteiro');
    expect(result).toContain('coordenador de recursos humanos');
    expect(result).toContain('RG n. 33554901');
    expect(result).toContain('SSP/SP');
    expect(result).toContain('CPF n. 304.010.618-09');
    expect(result).toContain('Rua Afonso Pena, n. 560');
  });

  it('should generate casado sem pacto qualification with both spouses', () => {
    const pessoa = {
      nome: 'DANIEL PASCHOAL CAMARGO',
      cpf: '304.010.618-09',
      rg: '33554901',
      orgaoEmissorRg: 'SSP',
      estadoEmissorRg: 'SP',
      nacionalidade: 'brasileiro',
      profissao: 'coordenador de recursos humanos',
      estadoCivil: 'casado',
      regimeBens: 'comunhão parcial de bens',
      dataCasamento: '01/01/2000',
      conjuge: {
        nome: 'JULIANA PASCHOAL CAMARGO',
        cpf: '374.741.918-65',
        rg: '46369419',
        orgaoEmissorRg: 'SSP',
        estadoEmissorRg: 'SP',
        nacionalidade: 'brasileira',
        profissao: 'advogada',
      },
      domicilio: {
        logradouro: 'Rua São Luís',
        numero: '176',
        bairro: 'Vila Assunção',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01200-090',
      },
    };

    const result = generateQualificationText(pessoa, { includeSpouse: true });

    expect(result).toContain('DANIEL PASCHOAL CAMARGO');
    expect(result).toContain('e seu cônjuge');
    expect(result).toContain('JULIANA PASCHOAL CAMARGO');
    expect(result).toContain('casados sob o regime da comunhão parcial de bens');
    expect(result).toContain('em 01/01/2000');
  });

  it('should generate casado com pacto qualification', () => {
    const pessoa = {
      nome: 'DANIEL PASCHOAL CAMARGO',
      cpf: '304.010.618-09',
      rg: '33554901',
      orgaoEmissorRg: 'SSP',
      estadoEmissorRg: 'SP',
      nacionalidade: 'brasileiro',
      profissao: 'coordenador de recursos humanos',
      estadoCivil: 'casado',
      regimeBens: 'comunhão universal de bens',
      dataCasamento: '01/01/2000',
      pactoAntenupcial: {
        numero: '7.857',
        livro: '3',
        cartorio: '5º Oficial de Registro de Imóveis desta Capital',
      },
      conjuge: {
        nome: 'JULIANA PASCHOAL CAMARGO',
        cpf: '374.741.918-65',
        rg: '46369419',
        orgaoEmissorRg: 'SSP',
        estadoEmissorRg: 'SP',
        nacionalidade: 'brasileira',
        profissao: 'advogada',
      },
      domicilio: {
        logradouro: 'Rua São Luís',
        numero: '176',
        bairro: 'Vila Assunção',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01200-090',
      },
    };

    const result = generateQualificationText(pessoa, { includeSpouse: true });

    expect(result).toContain('comunhão universal de bens');
    expect(result).toContain('escritura de pacto antenupcial');
    expect(result).toContain('n. 7.857');
    expect(result).toContain('Livro 3 de Registro Auxiliar');
  });

  it('should generate uniao estavel qualification', () => {
    const pessoa = {
      nome: 'DANIEL PASCHOAL CAMARGO',
      cpf: '304.010.618-09',
      rg: '33554901',
      orgaoEmissorRg: 'SSP',
      estadoEmissorRg: 'SP',
      nacionalidade: 'brasileiro',
      profissao: 'coordenador de recursos humanos',
      estadoCivil: 'divorciado',
      uniaoEstavel: {
        dataInicio: '02/02/2012',
        regime: 'comunhão parcial de bens',
        tabelionato: '1º Tabelionato de Notas desta Capital',
        livro: '1.547',
        folha: '5/6',
      },
      convivente: {
        nome: 'JULIANA PASCHOAL CAMARGO',
        cpf: '374.741.918-65',
        rg: '46369419',
        orgaoEmissorRg: 'SSP',
        estadoEmissorRg: 'SP',
        nacionalidade: 'brasileira',
        profissao: 'advogada',
        estadoCivil: 'solteira',
      },
      domicilio: {
        logradouro: 'Rua São Luís',
        numero: '176',
        bairro: 'Vila Assunção',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01200-090',
      },
    };

    const result = generateQualificationText(pessoa, { includeConvivente: true });

    expect(result).toContain('conviventes em união estável');
    expect(result).toContain('comunhão parcial de bens');
    expect(result).toContain('1º Tabelionato de Notas');
    expect(result).toContain('páginas 5/6');
    expect(result).toContain('Livro 1.547');
  });
});

// ============================================================================
// replacePlaceholders TESTS
// ============================================================================
describe('replacePlaceholders', () => {
  it('should replace single placeholder', () => {
    const template = 'Olá, {{NOME}}!';
    const values = { NOME: 'João' };

    expect(replacePlaceholders(template, values)).toBe('Olá, João!');
  });

  it('should replace multiple placeholders', () => {
    const template = '{{NOME}} nasceu em {{DATA_NASCIMENTO}} na cidade de {{CIDADE}}.';
    const values = {
      NOME: 'Maria',
      DATA_NASCIMENTO: '15/05/1990',
      CIDADE: 'São Paulo',
    };

    expect(replacePlaceholders(template, values)).toBe(
      'Maria nasceu em 15/05/1990 na cidade de São Paulo.'
    );
  });

  it('should leave unmatched placeholders as-is by default', () => {
    const template = '{{NOME}} - {{DESCONHECIDO}}';
    const values = { NOME: 'João' };

    expect(replacePlaceholders(template, values)).toBe('João - {{DESCONHECIDO}}');
  });

  it('should replace unmatched placeholders with empty string when strict', () => {
    const template = '{{NOME}} - {{DESCONHECIDO}}';
    const values = { NOME: 'João' };

    expect(replacePlaceholders(template, values, { strict: true })).toBe('João - ');
  });

  it('should handle escaped braces', () => {
    const template = 'Valor: \\{\\{literal\\}\\} e {{VALOR}}';
    const values = { VALOR: '100' };

    const result = replacePlaceholders(template, values);
    expect(result).toContain('{{literal}}');
    expect(result).toContain('100');
  });
});
