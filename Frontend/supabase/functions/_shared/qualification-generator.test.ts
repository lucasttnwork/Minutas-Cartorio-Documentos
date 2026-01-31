/**
 * Tests for Qualification Generator
 * Uses Deno's built-in test framework
 *
 * Run with: deno test --allow-env supabase/functions/_shared/qualification-generator.test.ts
 */

import { assertEquals } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import {
  generateQualification,
  type PessoaQualificacao,
  type QualificationOptions,
} from './qualification-generator.ts';

// ============ SOLTEIRO TESTS ============

Deno.test('generateQualification - solteiro masculino completo', () => {
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

  assertEquals(
    result,
    '**JOAO DA SILVA**, brasileiro, solteiro, engenheiro, RG n. 12345678-SSP/SP, CPF n. 123.456.789-00, domiciliado em São Paulo, onde reside na Rua das Flores, n. 100, Centro, CEP 01234-567.'
  );
});

Deno.test('generateQualification - solteira feminina completa', () => {
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

  assertEquals(
    result,
    '**MARIA DA SILVA**, brasileira, solteira, advogada, RG n. 87654321-SSP/RJ, CPF n. 987.654.321-00, domiciliada no Rio de Janeiro, onde reside na Avenida Brasil, n. 500, Apto 101, Copacabana, CEP 22041-080.'
  );
});

// ============ DIVORCIADO/VIUVO TESTS ============

Deno.test('generateQualification - divorciado masculino', () => {
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

  assertEquals(
    result,
    '**PEDRO ALVES**, brasileiro, divorciado, médico, RG n. 11223344-SSP/MG, CPF n. 111.222.333-44, domiciliado em São Paulo, onde reside na Rua Augusta, n. 200, Jardins, CEP 01305-100.'
  );
});

Deno.test('generateQualification - viuva feminina', () => {
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

  assertEquals(
    result,
    '**ANA BEATRIZ SOUZA**, brasileira, viúva, aposentada, RG n. 55667788-SSP/SP, CPF n. 555.666.777-88, domiciliada em São Paulo, onde reside na Alameda Santos, n. 1000, Cobertura, Cerqueira César, CEP 01418-100.'
  );
});

// ============ CASADO SEM PACTO - AMBOS ASSINANDO ============

Deno.test('generateQualification - casado sem pacto, ambos assinando', () => {
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

  assertEquals(
    result,
    '**DANIEL PASCHOAL CAMARGO**, brasileiro, coordenador de recursos humanos, RG n. 33554901-SSP/SP, CPF n. 304.010.618-09, e seu cônjuge, **JULIANA PASCHOAL CAMARGO**, brasileira, advogada, RG n. 46369419-SSP/SP, CPF n. 374.741.918-65, casados sob o regime da comunhão parcial de bens em 01/01/2000, domiciliados em São Paulo, onde residem na Rua São Luís, n. 176, Vila Assunção, CEP 01200-090.'
  );
});

// ============ CASADO COM PACTO - AMBOS ASSINANDO ============

Deno.test('generateQualification - casado com pacto, ambos assinando', () => {
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

  assertEquals(
    result,
    '**DANIEL PASCHOAL CAMARGO**, brasileiro, coordenador de recursos humanos, RG n. 33554901-SSP/SP, CPF n. 304.010.618-09, e seu cônjuge, **JULIANA PASCHOAL CAMARGO**, brasileira, advogada, RG n. 46369419-SSP/SP, CPF n. 374.741.918-65, casados sob o regime da comunhão universal de bens em 01/01/2000, estando a escritura de pacto antenupcial devidamente registrada sob n. 7.857 no Livro 3 de Registro Auxiliar do 5º Oficial de Registro de Imóveis desta Capital, domiciliados em São Paulo, onde residem na Rua São Luís, n. 176, Vila Assunção, CEP 01200-090.'
  );
});

// ============ CASADO COM PACTO - SOMENTE UM ASSINANDO ============

Deno.test('generateQualification - casado com pacto, somente um assinando', () => {
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

  assertEquals(
    result,
    '**DANIEL PASCHOAL CAMARGO**, brasileiro, coordenador de recursos humanos, RG n. 33554901-SSP/SP, CPF n. 304.010.618-09, casado sob o regime da comunhão universal de bens em 01/01/2000, estando a escritura de pacto antenupcial devidamente registrada sob n. 7.857 no Livro 3 de Registro Auxiliar do 5º Oficial de Registro de Imóveis desta Capital, com **JULIANA PASCHOAL CAMARGO**, brasileira, advogada, RG n. 46369419-SSP/SP, CPF n. 374.741.918-65, domiciliado em São Paulo, onde reside na Rua São Luís, n. 176, Vila Assunção, CEP 01200-090.'
  );
});

// ============ CASADO SEM PACTO - SOMENTE UM ASSINANDO ============

Deno.test('generateQualification - casado sem pacto, somente um assinando', () => {
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

  assertEquals(
    result,
    '**CARLOS ALBERTO FERREIRA**, brasileiro, empresário, RG n. 22334455-SSP/SP, CPF n. 222.333.444-55, casado sob o regime da comunhão parcial de bens em 15/06/2010, com **PATRICIA FERREIRA**, brasileira, professora, RG n. 33445566-SSP/SP, CPF n. 333.444.555-66, domiciliado em São Paulo, onde reside na Avenida Paulista, n. 1000, Bela Vista, CEP 01310-100.'
  );
});

// ============ UNIÃO ESTÁVEL ============

Deno.test('generateQualification - união estável', () => {
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

  assertEquals(
    result,
    '**DANIEL PASCHOAL CAMARGO**, brasileiro, divorciado, coordenador de recursos humanos, RG n. 33554901-SSP/SP, CPF n. 304.010.618-09, e **JULIANA PASCHOAL CAMARGO**, brasileira, solteira, advogada, RG n. 46369419-SSP/SP, CPF n. 374.741.918-65, conviventes em união estável regida pela comunhão parcial de bens, conforme escritura de declaração lavrada no 1º Tabelionato de Notas desta Capital em 02/02/2012, nas páginas 5/6 do Livro 1.547, domiciliados em São Paulo, onde residem na Rua São Luís, n. 176, Vila Assunção, CEP 01200-090.'
  );
});

// ============ EDGE CASES ============

Deno.test('generateQualification - sem complemento no endereço', () => {
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

  // Não deve haver vírgula dupla (onde complemento estaria)
  assertEquals(
    result.includes('n. 50, Centro'),
    true
  );
});

Deno.test('generateQualification - cidade fora da capital', () => {
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

  // Deve usar "de Campinas" em vez de "desta Capital"
  assertEquals(
    result.includes('de Campinas'),
    true
  );
  assertEquals(
    result.includes('desta Capital'),
    false
  );
});

Deno.test('generateQualification - RG com formatação especial (espaço)', () => {
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

  // Por padrão usa hífen
  const resultHifen = generateQualification(pessoa);
  assertEquals(resultHifen.includes('RG n. 46369419-SSP/SP'), true);

  // Pode usar espaço com opção
  const resultEspaco = generateQualification(pessoa, { rg_separador: ' ' });
  assertEquals(resultEspaco.includes('RG n. 46369419 SSP/SP'), true);
});

Deno.test('generateQualification - nacionalidade inferida do gênero', () => {
  // Feminina
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
  assertEquals(resultFem.includes('brasileira, solteira'), true);
  assertEquals(resultFem.includes('domiciliada'), true);

  // Masculino
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
  assertEquals(resultMasc.includes('brasileiro, solteiro'), true);
  assertEquals(resultMasc.includes('domiciliado'), true);
});

// ============ PREPOSIÇÃO "EM" vs "NO/NA" TESTS ============

Deno.test('generateQualification - preposição correta para cidade (em/no/na)', () => {
  // São Paulo usa "em"
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
  assertEquals(resultSP.includes('domiciliado em São Paulo'), true);

  // Rio de Janeiro usa "no"
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
  assertEquals(resultRJ.includes('domiciliada no Rio de Janeiro'), true);
});

// ============ PLURAL (domiciliados/residem) TESTS ============

Deno.test('generateQualification - casados usam plural (domiciliados, residem)', () => {
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
  assertEquals(result.includes('domiciliados'), true);
  assertEquals(result.includes('residem'), true);
});

Deno.test('generateQualification - solteiro usa singular (domiciliado, reside)', () => {
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
  assertEquals(result.includes('domiciliado'), true);
  assertEquals(result.includes('reside'), true);
  assertEquals(result.includes('domiciliados'), false);
  assertEquals(result.includes('residem'), false);
});

// ============ "NESTA CIDADE" OPTION TESTS ============

Deno.test('generateQualification - opção nesta_cidade', () => {
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
  assertEquals(result.includes('domiciliado nesta cidade'), true);
});
