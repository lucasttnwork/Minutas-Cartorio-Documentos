/**
 * Tests for Qualification Generator
 * Uses Vitest test framework
 *
 * Run with: npm test -- src/lib/qualification-generator.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  generateQualification,
  generateQualifications,
  type PessoaQualificacao,
  type QualificationOptions,
} from './qualification-generator';

// ============ SOLTEIRO TESTS ============

describe('generateQualification - solteiro', () => {
  it('generates qualification for solteiro masculino completo', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'JOAO DA SILVA',
      nacionalidade: 'brasileiro',
      estado_civil: 'solteiro',
      profissao: 'engenheiro',
      rg: '12345678',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '123.456.789-00',
      endereco: {
        logradouro: 'Rua das Flores',
        numero: '100',
        bairro: 'Centro',
        cidade: 'São Paulo',
        cep: '01234-567',
      },
    };

    const result = generateQualification(pessoa);

    expect(result).toBe(
      '**JOAO DA SILVA**, brasileiro, solteiro, engenheiro, RG n. 12345678-SSP/SP, CPF n. 123.456.789-00, domiciliado em São Paulo, onde reside na Rua das Flores, n. 100, Centro, CEP 01234-567.'
    );
  });

  it('generates qualification for solteira feminina completa', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'MARIA DA SILVA',
      nacionalidade: 'brasileira',
      estado_civil: 'solteiro',
      profissao: 'advogada',
      rg: '87654321',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'RJ',
      cpf: '987.654.321-00',
      endereco: {
        logradouro: 'Avenida Brasil',
        numero: '500',
        complemento: 'Apto 101',
        bairro: 'Copacabana',
        cidade: 'Rio de Janeiro',
        cep: '22041-080',
      },
    };

    const result = generateQualification(pessoa);

    expect(result).toBe(
      '**MARIA DA SILVA**, brasileira, solteira, advogada, RG n. 87654321-SSP/RJ, CPF n. 987.654.321-00, domiciliada no Rio de Janeiro, onde reside na Avenida Brasil, n. 500, Apto 101, Copacabana, CEP 22041-080.'
    );
  });
});

// ============ DIVORCIADO/VIUVO TESTS ============

describe('generateQualification - divorciado/viuvo', () => {
  it('generates qualification for divorciado masculino', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'PEDRO ALVES',
      nacionalidade: 'brasileiro',
      estado_civil: 'divorciado',
      profissao: 'médico',
      rg: '11223344',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'MG',
      cpf: '111.222.333-44',
      endereco: {
        logradouro: 'Rua Augusta',
        numero: '200',
        bairro: 'Jardins',
        cidade: 'São Paulo',
        cep: '01305-100',
      },
    };

    const result = generateQualification(pessoa);

    expect(result).toBe(
      '**PEDRO ALVES**, brasileiro, divorciado, médico, RG n. 11223344-SSP/MG, CPF n. 111.222.333-44, domiciliado em São Paulo, onde reside na Rua Augusta, n. 200, Jardins, CEP 01305-100.'
    );
  });

  it('generates qualification for viuva feminina', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'ANA BEATRIZ SOUZA',
      nacionalidade: 'brasileira',
      estado_civil: 'viuvo',
      profissao: 'aposentada',
      rg: '55667788',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '555.666.777-88',
      endereco: {
        logradouro: 'Alameda Santos',
        numero: '1000',
        complemento: 'Cobertura',
        bairro: 'Cerqueira César',
        cidade: 'São Paulo',
        cep: '01418-100',
      },
    };

    const result = generateQualification(pessoa);

    expect(result).toBe(
      '**ANA BEATRIZ SOUZA**, brasileira, viúva, aposentada, RG n. 55667788-SSP/SP, CPF n. 555.666.777-88, domiciliada em São Paulo, onde reside na Alameda Santos, n. 1000, Cobertura, Cerqueira César, CEP 01418-100.'
    );
  });
});

// ============ CASADO SEM PACTO - AMBOS ASSINANDO ============

describe('generateQualification - casado sem pacto, ambos assinando', () => {
  it('generates qualification correctly', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'DANIEL PASCHOAL CAMARGO',
      nacionalidade: 'brasileiro',
      estado_civil: 'casado',
      profissao: 'coordenador de recursos humanos',
      rg: '33554901',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '304.010.618-09',
      endereco: {
        logradouro: 'Rua São Luís',
        numero: '176',
        bairro: 'Vila Assunção',
        cidade: 'São Paulo',
        cep: '01200-090',
      },
      regime_bens: 'comunhão parcial de bens',
      data_casamento: '01/01/2000',
      conjuge: {
        nome: 'JULIANA PASCHOAL CAMARGO',
        nacionalidade: 'brasileira',
        estado_civil: 'casado',
        profissao: 'advogada',
        rg: '46369419',
        orgao_emissor_rg: 'SSP',
        estado_emissor_rg: 'SP',
        cpf: '374.741.918-65',
      },
    };

    const result = generateQualification(pessoa, { conjuge_assina: true });

    expect(result).toBe(
      '**DANIEL PASCHOAL CAMARGO**, brasileiro, coordenador de recursos humanos, RG n. 33554901-SSP/SP, CPF n. 304.010.618-09, e seu cônjuge, **JULIANA PASCHOAL CAMARGO**, brasileira, advogada, RG n. 46369419-SSP/SP, CPF n. 374.741.918-65, casados sob o regime da comunhão parcial de bens em 01/01/2000, domiciliados em São Paulo, onde residem na Rua São Luís, n. 176, Vila Assunção, CEP 01200-090.'
    );
  });
});

// ============ CASADO COM PACTO - AMBOS ASSINANDO ============

describe('generateQualification - casado com pacto, ambos assinando', () => {
  it('generates qualification correctly', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'DANIEL PASCHOAL CAMARGO',
      nacionalidade: 'brasileiro',
      estado_civil: 'casado',
      profissao: 'coordenador de recursos humanos',
      rg: '33554901',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '304.010.618-09',
      endereco: {
        logradouro: 'Rua São Luís',
        numero: '176',
        bairro: 'Vila Assunção',
        cidade: 'São Paulo',
        cep: '01200-090',
      },
      regime_bens: 'comunhão universal de bens',
      data_casamento: '01/01/2000',
      pacto_antenupcial: {
        numero_registro: '7.857',
        livro: '3',
        tipo_livro: 'Registro Auxiliar',
        cartorio_numero: '5',
        cartorio_tipo: 'Oficial de Registro de Imóveis',
        cidade: 'São Paulo',
        esta_capital: true,
      },
      conjuge: {
        nome: 'JULIANA PASCHOAL CAMARGO',
        nacionalidade: 'brasileira',
        estado_civil: 'casado',
        profissao: 'advogada',
        rg: '46369419',
        orgao_emissor_rg: 'SSP',
        estado_emissor_rg: 'SP',
        cpf: '374.741.918-65',
      },
    };

    const result = generateQualification(pessoa, { conjuge_assina: true });

    expect(result).toBe(
      '**DANIEL PASCHOAL CAMARGO**, brasileiro, coordenador de recursos humanos, RG n. 33554901-SSP/SP, CPF n. 304.010.618-09, e seu cônjuge, **JULIANA PASCHOAL CAMARGO**, brasileira, advogada, RG n. 46369419-SSP/SP, CPF n. 374.741.918-65, casados sob o regime da comunhão universal de bens em 01/01/2000, estando a escritura de pacto antenupcial devidamente registrada sob n. 7.857 no Livro 3 de Registro Auxiliar do 5º Oficial de Registro de Imóveis desta Capital, domiciliados em São Paulo, onde residem na Rua São Luís, n. 176, Vila Assunção, CEP 01200-090.'
    );
  });
});

// ============ CASADO COM PACTO - SOMENTE UM ASSINANDO ============

describe('generateQualification - casado com pacto, somente um assinando', () => {
  it('generates qualification correctly', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'DANIEL PASCHOAL CAMARGO',
      nacionalidade: 'brasileiro',
      estado_civil: 'casado',
      profissao: 'coordenador de recursos humanos',
      rg: '33554901',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '304.010.618-09',
      endereco: {
        logradouro: 'Rua São Luís',
        numero: '176',
        bairro: 'Vila Assunção',
        cidade: 'São Paulo',
        cep: '01200-090',
      },
      regime_bens: 'comunhão universal de bens',
      data_casamento: '01/01/2000',
      pacto_antenupcial: {
        numero_registro: '7.857',
        livro: '3',
        tipo_livro: 'Registro Auxiliar',
        cartorio_numero: '5',
        cartorio_tipo: 'Oficial de Registro de Imóveis',
        cidade: 'São Paulo',
        esta_capital: true,
      },
      conjuge: {
        nome: 'JULIANA PASCHOAL CAMARGO',
        nacionalidade: 'brasileira',
        estado_civil: 'casado',
        profissao: 'advogada',
        rg: '46369419',
        orgao_emissor_rg: 'SSP',
        estado_emissor_rg: 'SP',
        cpf: '374.741.918-65',
      },
    };

    const result = generateQualification(pessoa, { conjuge_assina: false });

    expect(result).toBe(
      '**DANIEL PASCHOAL CAMARGO**, brasileiro, coordenador de recursos humanos, RG n. 33554901-SSP/SP, CPF n. 304.010.618-09, casado sob o regime da comunhão universal de bens em 01/01/2000, estando a escritura de pacto antenupcial devidamente registrada sob n. 7.857 no Livro 3 de Registro Auxiliar do 5º Oficial de Registro de Imóveis desta Capital, com **JULIANA PASCHOAL CAMARGO**, brasileira, advogada, RG n. 46369419-SSP/SP, CPF n. 374.741.918-65, domiciliado em São Paulo, onde reside na Rua São Luís, n. 176, Vila Assunção, CEP 01200-090.'
    );
  });
});

// ============ CASADO SEM PACTO - SOMENTE UM ASSINANDO ============

describe('generateQualification - casado sem pacto, somente um assinando', () => {
  it('generates qualification correctly', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'CARLOS ALBERTO FERREIRA',
      nacionalidade: 'brasileiro',
      estado_civil: 'casado',
      profissao: 'empresário',
      rg: '22334455',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '222.333.444-55',
      endereco: {
        logradouro: 'Avenida Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        cep: '01310-100',
      },
      regime_bens: 'comunhão parcial de bens',
      data_casamento: '15/06/2010',
      conjuge: {
        nome: 'PATRICIA FERREIRA',
        nacionalidade: 'brasileira',
        estado_civil: 'casado',
        profissao: 'professora',
        rg: '33445566',
        orgao_emissor_rg: 'SSP',
        estado_emissor_rg: 'SP',
        cpf: '333.444.555-66',
      },
    };

    const result = generateQualification(pessoa, { conjuge_assina: false });

    expect(result).toBe(
      '**CARLOS ALBERTO FERREIRA**, brasileiro, empresário, RG n. 22334455-SSP/SP, CPF n. 222.333.444-55, casado sob o regime da comunhão parcial de bens em 15/06/2010, com **PATRICIA FERREIRA**, brasileira, professora, RG n. 33445566-SSP/SP, CPF n. 333.444.555-66, domiciliado em São Paulo, onde reside na Avenida Paulista, n. 1000, Bela Vista, CEP 01310-100.'
    );
  });
});

// ============ UNIÃO ESTÁVEL ============

describe('generateQualification - união estável', () => {
  it('generates qualification correctly', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'DANIEL PASCHOAL CAMARGO',
      nacionalidade: 'brasileiro',
      estado_civil: 'uniao_estavel',
      estado_civil_anterior: 'divorciado',
      profissao: 'coordenador de recursos humanos',
      rg: '33554901',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '304.010.618-09',
      endereco: {
        logradouro: 'Rua São Luís',
        numero: '176',
        bairro: 'Vila Assunção',
        cidade: 'São Paulo',
        cep: '01200-090',
      },
      uniao_estavel: {
        regime_bens: 'comunhão parcial de bens',
        escritura: {
          tabelionato_numero: '1',
          tabelionato_tipo: 'Tabelionato de Notas',
          cidade: 'São Paulo',
          esta_capital: true,
          data: '02/02/2012',
          paginas: '5/6',
          livro: '1.547',
        },
        convivente: {
          nome: 'JULIANA PASCHOAL CAMARGO',
          nacionalidade: 'brasileira',
          estado_civil: 'uniao_estavel',
          estado_civil_anterior: 'solteiro',
          profissao: 'advogada',
          rg: '46369419',
          orgao_emissor_rg: 'SSP',
          estado_emissor_rg: 'SP',
          cpf: '374.741.918-65',
        },
      },
    };

    const result = generateQualification(pessoa);

    expect(result).toBe(
      '**DANIEL PASCHOAL CAMARGO**, brasileiro, divorciado, coordenador de recursos humanos, RG n. 33554901-SSP/SP, CPF n. 304.010.618-09, e **JULIANA PASCHOAL CAMARGO**, brasileira, solteira, advogada, RG n. 46369419-SSP/SP, CPF n. 374.741.918-65, conviventes em união estável regida pela comunhão parcial de bens, conforme escritura de declaração lavrada no 1º Tabelionato de Notas desta Capital em 02/02/2012, nas páginas 5/6 do Livro 1.547, domiciliados em São Paulo, onde residem na Rua São Luís, n. 176, Vila Assunção, CEP 01200-090.'
    );
  });
});

// ============ EDGE CASES ============

describe('generateQualification - edge cases', () => {
  it('handles address without complemento', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'TESTE SEM COMPLEMENTO',
      nacionalidade: 'brasileiro',
      estado_civil: 'solteiro',
      profissao: 'analista',
      rg: '99887766',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '999.888.777-66',
      endereco: {
        logradouro: 'Rua Teste',
        numero: '50',
        bairro: 'Centro',
        cidade: 'São Paulo',
        cep: '01000-000',
      },
    };

    const result = generateQualification(pessoa);

    // Should not have double comma (where complemento would be)
    expect(result).toContain('n. 50, Centro');
  });

  it('handles city outside capital', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'MORADOR INTERIOR',
      nacionalidade: 'brasileiro',
      estado_civil: 'casado',
      profissao: 'agricultor',
      rg: '11112222',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '111.122.223-33',
      endereco: {
        logradouro: 'Rua Principal',
        numero: '1',
        bairro: 'Centro',
        cidade: 'Campinas',
        cep: '13000-000',
      },
      regime_bens: 'comunhão parcial de bens',
      data_casamento: '01/01/2020',
      pacto_antenupcial: {
        numero_registro: '100',
        livro: '3',
        tipo_livro: 'Registro Auxiliar',
        cartorio_numero: '1',
        cartorio_tipo: 'Oficial de Registro de Imóveis',
        cidade: 'Campinas',
        esta_capital: false,
      },
      conjuge: {
        nome: 'ESPOSA INTERIOR',
        nacionalidade: 'brasileira',
        estado_civil: 'casado',
        profissao: 'professora',
        rg: '33334444',
        orgao_emissor_rg: 'SSP',
        estado_emissor_rg: 'SP',
        cpf: '333.344.445-55',
      },
    };

    const result = generateQualification(pessoa, { conjuge_assina: true });

    // Should use "de Campinas" instead of "desta Capital"
    expect(result).toContain('de Campinas');
    expect(result).not.toContain('desta Capital');
  });

  it('handles RG with space separator', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'TESTE RG ESPACO',
      nacionalidade: 'brasileiro',
      estado_civil: 'solteiro',
      profissao: 'contador',
      rg: '46369419',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '123.456.789-00',
      endereco: {
        logradouro: 'Rua X',
        numero: '1',
        bairro: 'Y',
        cidade: 'São Paulo',
        cep: '00000-000',
      },
    };

    // Default uses hyphen
    const resultHyphen = generateQualification(pessoa);
    expect(resultHyphen).toContain('RG n. 46369419-SSP/SP');

    // Can use space with option
    const resultSpace = generateQualification(pessoa, { rg_separador: ' ' });
    expect(resultSpace).toContain('RG n. 46369419 SSP/SP');
  });

  it('handles feminine vs masculine correctly', () => {
    // Feminine
    const pessoaFem: PessoaQualificacao = {
      nome: 'MARIA TESTE',
      nacionalidade: 'brasileira',
      estado_civil: 'solteiro',
      profissao: 'médica',
      rg: '12345678',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '123.456.789-00',
      endereco: {
        logradouro: 'Rua A',
        numero: '1',
        bairro: 'B',
        cidade: 'São Paulo',
        cep: '00000-000',
      },
    };

    const resultFem = generateQualification(pessoaFem);
    expect(resultFem).toContain('brasileira, solteira');
    expect(resultFem).toContain('domiciliada');

    // Masculine
    const pessoaMasc: PessoaQualificacao = {
      nome: 'JOAO TESTE',
      nacionalidade: 'brasileiro',
      estado_civil: 'solteiro',
      profissao: 'médico',
      rg: '12345678',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '123.456.789-00',
      endereco: {
        logradouro: 'Rua A',
        numero: '1',
        bairro: 'B',
        cidade: 'São Paulo',
        cep: '00000-000',
      },
    };

    const resultMasc = generateQualification(pessoaMasc);
    expect(resultMasc).toContain('brasileiro, solteiro');
    expect(resultMasc).toContain('domiciliado');
  });
});

// ============ PREPOSITION TESTS ============

describe('generateQualification - preposition for city', () => {
  it('uses correct preposition for city (em/no/na)', () => {
    // São Paulo uses "em"
    const pessoaSP: PessoaQualificacao = {
      nome: 'TESTE SP',
      nacionalidade: 'brasileiro',
      estado_civil: 'solteiro',
      profissao: 'teste',
      rg: '12345678',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '123.456.789-00',
      endereco: {
        logradouro: 'Rua A',
        numero: '1',
        bairro: 'B',
        cidade: 'São Paulo',
        cep: '00000-000',
      },
    };
    const resultSP = generateQualification(pessoaSP);
    expect(resultSP).toContain('domiciliado em São Paulo');

    // Rio de Janeiro uses "no"
    const pessoaRJ: PessoaQualificacao = {
      nome: 'TESTE RJ',
      nacionalidade: 'brasileira',
      estado_civil: 'solteiro',
      profissao: 'teste',
      rg: '12345678',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'RJ',
      cpf: '123.456.789-00',
      endereco: {
        logradouro: 'Rua A',
        numero: '1',
        bairro: 'B',
        cidade: 'Rio de Janeiro',
        cep: '00000-000',
      },
    };
    const resultRJ = generateQualification(pessoaRJ);
    expect(resultRJ).toContain('domiciliada no Rio de Janeiro');
  });
});

// ============ PLURAL TESTS ============

describe('generateQualification - plural forms', () => {
  it('uses plural for married couples (domiciliados, residem)', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'MARIDO TESTE',
      nacionalidade: 'brasileiro',
      estado_civil: 'casado',
      profissao: 'teste',
      rg: '12345678',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '123.456.789-00',
      endereco: {
        logradouro: 'Rua A',
        numero: '1',
        bairro: 'B',
        cidade: 'São Paulo',
        cep: '00000-000',
      },
      regime_bens: 'comunhão parcial de bens',
      data_casamento: '01/01/2020',
      conjuge: {
        nome: 'ESPOSA TESTE',
        nacionalidade: 'brasileira',
        estado_civil: 'casado',
        profissao: 'teste',
        rg: '87654321',
        orgao_emissor_rg: 'SSP',
        estado_emissor_rg: 'SP',
        cpf: '987.654.321-00',
      },
    };

    const result = generateQualification(pessoa, { conjuge_assina: true });
    expect(result).toContain('domiciliados');
    expect(result).toContain('residem');
  });

  it('uses singular for single person (domiciliado, reside)', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'SOLTEIRO TESTE',
      nacionalidade: 'brasileiro',
      estado_civil: 'solteiro',
      profissao: 'teste',
      rg: '12345678',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '123.456.789-00',
      endereco: {
        logradouro: 'Rua A',
        numero: '1',
        bairro: 'B',
        cidade: 'São Paulo',
        cep: '00000-000',
      },
    };

    const result = generateQualification(pessoa);
    expect(result).toContain('domiciliado');
    expect(result).toContain('reside');
    expect(result).not.toContain('domiciliados');
    expect(result).not.toContain('residem');
  });
});

// ============ NESTA CIDADE OPTION TESTS ============

describe('generateQualification - nesta_cidade option', () => {
  it('uses "nesta cidade" when option is set', () => {
    const pessoa: PessoaQualificacao = {
      nome: 'TESTE NESTA CIDADE',
      nacionalidade: 'brasileiro',
      estado_civil: 'solteiro',
      profissao: 'teste',
      rg: '12345678',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      cpf: '123.456.789-00',
      endereco: {
        logradouro: 'Rua A',
        numero: '1',
        bairro: 'B',
        cidade: 'São Paulo',
        cep: '00000-000',
      },
    };

    const result = generateQualification(pessoa, { nesta_cidade: true });
    expect(result).toContain('domiciliado nesta cidade');
  });
});

// ============ MULTIPLE PEOPLE TESTS ============

describe('generateQualifications - multiple people', () => {
  it('generates qualifications for multiple people', () => {
    const pessoas: PessoaQualificacao[] = [
      {
        nome: 'PESSOA UM',
        nacionalidade: 'brasileiro',
        estado_civil: 'solteiro',
        profissao: 'analista',
        rg: '11111111',
        orgao_emissor_rg: 'SSP',
        estado_emissor_rg: 'SP',
        cpf: '111.111.111-11',
        endereco: {
          logradouro: 'Rua Um',
          numero: '1',
          bairro: 'Centro',
          cidade: 'São Paulo',
          cep: '01000-000',
        },
      },
      {
        nome: 'PESSOA DOIS',
        nacionalidade: 'brasileira',
        estado_civil: 'divorciado',
        profissao: 'gerente',
        rg: '22222222',
        orgao_emissor_rg: 'SSP',
        estado_emissor_rg: 'RJ',
        cpf: '222.222.222-22',
        endereco: {
          logradouro: 'Rua Dois',
          numero: '2',
          bairro: 'Centro',
          cidade: 'Rio de Janeiro',
          cep: '20000-000',
        },
      },
    ];

    const results = generateQualifications(pessoas);

    expect(results).toHaveLength(2);
    expect(results[0]).toContain('PESSOA UM');
    expect(results[0]).toContain('solteiro');
    expect(results[1]).toContain('PESSOA DOIS');
    expect(results[1]).toContain('divorciada');
  });
});
