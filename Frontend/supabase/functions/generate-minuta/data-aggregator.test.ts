/**
 * Tests for data-aggregator.ts
 * Uses Deno's built-in test framework
 *
 * Run with: deno test --allow-env supabase/functions/generate-minuta/data-aggregator.test.ts
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import {
  formatDateBrazilian,
  formatCurrency,
  formatCurrencyExtended,
  formatCpf,
  formatCnpj,
  formatEndereco,
  aggregateMinutaData,
  type MinutaCompleta,
} from './data-aggregator.ts';

// ============ FORMATTER TESTS ============

Deno.test('formatDateBrazilian - converts ISO date to Brazilian format', () => {
  assertEquals(formatDateBrazilian('2026-02-01'), '01 de fevereiro de 2026');
  assertEquals(formatDateBrazilian('2025-12-31'), '31 de dezembro de 2025');
  assertEquals(formatDateBrazilian('2026-01-15'), '15 de janeiro de 2026');
});

Deno.test('formatDateBrazilian - handles null/undefined', () => {
  assertEquals(formatDateBrazilian(null), '');
  assertEquals(formatDateBrazilian(undefined), '');
  assertEquals(formatDateBrazilian(''), '');
});

Deno.test('formatDateBrazilian - handles invalid date', () => {
  assertEquals(formatDateBrazilian('invalid'), '');
  assertEquals(formatDateBrazilian('2026-13-45'), '');
});

Deno.test('formatCurrency - formats number to Brazilian currency', () => {
  assertEquals(formatCurrency(250000), 'R$ 250.000,00');
  assertEquals(formatCurrency(1234567.89), 'R$ 1.234.567,89');
  assertEquals(formatCurrency(500), 'R$ 500,00');
  assertEquals(formatCurrency(99.9), 'R$ 99,90');
});

Deno.test('formatCurrency - handles null/undefined', () => {
  assertEquals(formatCurrency(null), '');
  assertEquals(formatCurrency(undefined), '');
});

Deno.test('formatCurrency - handles zero', () => {
  assertEquals(formatCurrency(0), 'R$ 0,00');
});

Deno.test('formatCurrencyExtended - returns value and extenso', () => {
  const result = formatCurrencyExtended(250000);
  assertEquals(result.valor, 'R$ 250.000,00');
  assertEquals(result.extenso, 'duzentos e cinquenta mil reais');
});

Deno.test('formatCurrencyExtended - handles small values', () => {
  assertEquals(formatCurrencyExtended(1).extenso, 'um real');
  assertEquals(formatCurrencyExtended(100).extenso, 'cem reais');
  assertEquals(formatCurrencyExtended(1000).extenso, 'mil reais');
});

Deno.test('formatCurrencyExtended - handles millions', () => {
  const result = formatCurrencyExtended(1500000);
  assertEquals(result.valor, 'R$ 1.500.000,00');
  assertEquals(result.extenso, 'um milhao e quinhentos mil reais');
});

Deno.test('formatCurrencyExtended - handles centavos', () => {
  const result = formatCurrencyExtended(100.50);
  assertEquals(result.extenso, 'cem reais e cinquenta centavos');
});

Deno.test('formatCpf - formats CPF with punctuation', () => {
  assertEquals(formatCpf('12345678900'), '123.456.789-00');
  assertEquals(formatCpf('123.456.789-00'), '123.456.789-00');
});

Deno.test('formatCpf - handles null/undefined', () => {
  assertEquals(formatCpf(null), '');
  assertEquals(formatCpf(undefined), '');
});

Deno.test('formatCnpj - formats CNPJ with punctuation', () => {
  assertEquals(formatCnpj('12345678000199'), '12.345.678/0001-99');
  assertEquals(formatCnpj('12.345.678/0001-99'), '12.345.678/0001-99');
});

Deno.test('formatCnpj - handles null/undefined', () => {
  assertEquals(formatCnpj(null), '');
  assertEquals(formatCnpj(undefined), '');
});

Deno.test('formatEndereco - formats complete address', () => {
  const endereco = {
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: 'Apto 45',
    bairro: 'Jardim Paulista',
    cidade: 'Sao Paulo',
    estado: 'SP',
    cep: '01310-100',
  };
  const expected = 'Rua das Flores, 123, Apto 45, Jardim Paulista, Sao Paulo/SP, CEP 01310-100';
  assertEquals(formatEndereco(endereco), expected);
});

Deno.test('formatEndereco - handles missing complemento', () => {
  const endereco = {
    logradouro: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'Sao Paulo',
    estado: 'SP',
  };
  const expected = 'Rua das Flores, 123, Centro, Sao Paulo/SP';
  assertEquals(formatEndereco(endereco), expected);
});

Deno.test('formatEndereco - handles null/undefined', () => {
  assertEquals(formatEndereco(null), '');
  assertEquals(formatEndereco(undefined), '');
});

// ============ MOCK SUPABASE CLIENT ============

interface MockQueryResult {
  data: unknown;
  error: Error | null;
}

interface MockDbData {
  minutas?: Record<string, unknown>[];
  pessoas_naturais?: Record<string, unknown>[];
  pessoas_juridicas?: Record<string, unknown>[];
  imoveis?: Record<string, unknown>[];
  negocios_juridicos?: Record<string, unknown>[];
  documentos?: Record<string, unknown>[];
}

function createMockSupabaseClient(dbData: MockDbData = {}) {
  const mockClient = {
    from: (table: string) => {
      return {
        select: (_columns?: string) => {
          return {
            eq: (column: string, value: unknown) => {
              return {
                single: async (): Promise<MockQueryResult> => {
                  const tableData = dbData[table as keyof MockDbData] || [];
                  const found = tableData.find((row: Record<string, unknown>) => row[column] === value);
                  return { data: found || null, error: found ? null : new Error('Not found') };
                },
                // Return array of matches
                then: async (resolve: (result: MockQueryResult) => void) => {
                  const tableData = dbData[table as keyof MockDbData] || [];
                  const matches = tableData.filter((row: Record<string, unknown>) => row[column] === value);
                  resolve({ data: matches, error: null });
                },
              };
            },
          };
        },
      };
    },
  };

  // Add async iteration support for chained queries
  const enhancedMockClient = {
    from: (table: string) => {
      return {
        select: (_columns?: string) => {
          return {
            eq: (column: string, value: unknown) => {
              const tableData = dbData[table as keyof MockDbData] || [];
              const matches = tableData.filter((row: Record<string, unknown>) => row[column] === value);
              return {
                single: async (): Promise<MockQueryResult> => {
                  return { data: matches[0] || null, error: matches[0] ? null : new Error('Not found') };
                },
                then: (resolve: (result: MockQueryResult) => void) => {
                  resolve({ data: matches, error: null });
                  return Promise.resolve({ data: matches, error: null });
                },
              };
            },
          };
        },
      };
    },
  };

  return enhancedMockClient;
}

// ============ AGGREGATOR TESTS ============

Deno.test('aggregateMinutaData - returns complete minuta structure', async () => {
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mockData: MockDbData = {
    minutas: [{
      id: minutaId,
      titulo: 'Escritura de Compra e Venda',
      tipo_ato: 'compra_venda',
      created_at: '2026-01-31T10:00:00Z',
    }],
    pessoas_naturais: [
      {
        id: 'pn-1',
        minuta_id: minutaId,
        nome_completo: 'JOAO DA SILVA',
        cpf: '12345678900',
        rg: '123456789',
        nacionalidade: 'brasileiro',
        estado_civil: 'casado',
        profissao: 'empresario',
        endereco: { logradouro: 'Rua A', numero: '100', bairro: 'Centro', cidade: 'Sao Paulo', estado: 'SP' },
        papel: 'outorgante',
      },
      {
        id: 'pn-2',
        minuta_id: minutaId,
        nome_completo: 'MARIA SANTOS',
        cpf: '98765432100',
        nacionalidade: 'brasileira',
        estado_civil: 'solteira',
        profissao: 'advogada',
        papel: 'outorgado',
      },
    ],
    pessoas_juridicas: [],
    imoveis: [{
      id: 'im-1',
      minuta_id: minutaId,
      tipo_imovel: 'apartamento',
      matricula: '12345',
      cartorio_registro: '1o Cartorio de Registro de Imoveis',
      area_total: 100.50,
      endereco_completo: 'Rua das Flores, 200, Apto 101, Jardim Paulista, Sao Paulo/SP',
      inscricao_municipal: '123.456.789-0',
    }],
    negocios_juridicos: [{
      id: 'nj-1',
      minuta_id: minutaId,
      tipo_negocio: 'compra_venda',
      valor: 500000,
      forma_pagamento: 'a vista',
      condicoes: { sinal: 50000, prazo: '30 dias' },
    }],
    documentos: [],
  };

  const mockClient = createMockSupabaseClient(mockData);
  const result = await aggregateMinutaData(mockClient as unknown, minutaId);

  assertExists(result);
  assertExists(result.minuta);
  assertEquals(result.minuta.titulo, 'Escritura de Compra e Venda');
  assertEquals(result.outorgantes.length, 1);
  assertEquals(result.outorgados.length, 1);
  assertEquals(result.imoveis.length, 1);
  assertExists(result.negocio);
});

Deno.test('aggregateMinutaData - formats pessoa natural correctly', async () => {
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mockData: MockDbData = {
    minutas: [{
      id: minutaId,
      titulo: 'Escritura',
      tipo_ato: 'compra_venda',
      created_at: '2026-01-31',
    }],
    pessoas_naturais: [{
      id: 'pn-1',
      minuta_id: minutaId,
      nome_completo: 'JOAO DA SILVA',
      cpf: '12345678900',
      rg: '123456789',
      orgao_emissor_rg: 'SSP',
      estado_emissor_rg: 'SP',
      nacionalidade: 'brasileiro',
      estado_civil: 'casado',
      regime_bens: 'comunhao parcial',
      profissao: 'empresario',
      data_nascimento: '1980-05-15',
      endereco: {
        logradouro: 'Rua A',
        numero: '100',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        estado: 'SP',
        cep: '01310-100',
      },
      papel: 'outorgante',
    }],
    pessoas_juridicas: [],
    imoveis: [],
    negocios_juridicos: [],
    documentos: [],
  };

  const mockClient = createMockSupabaseClient(mockData);
  const result = await aggregateMinutaData(mockClient as unknown, minutaId);

  const outorgante = result.outorgantes[0];
  assertExists(outorgante);
  assertEquals(outorgante.nome, 'JOAO DA SILVA');
  assertEquals(outorgante.cpf_formatado, '123.456.789-00');
  assertEquals(outorgante.rg, '123456789');
  assertEquals(outorgante.orgao_emissor_rg, 'SSP');
  assertEquals(outorgante.nacionalidade, 'brasileiro');
  assertEquals(outorgante.estado_civil, 'casado');
  assertEquals(outorgante.regime_bens, 'comunhao parcial');
  assertEquals(outorgante.profissao, 'empresario');
  assertExists(outorgante.endereco_formatado);
});

Deno.test('aggregateMinutaData - formats pessoa juridica correctly', async () => {
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mockData: MockDbData = {
    minutas: [{
      id: minutaId,
      titulo: 'Escritura',
      tipo_ato: 'compra_venda',
      created_at: '2026-01-31',
    }],
    pessoas_naturais: [],
    pessoas_juridicas: [{
      id: 'pj-1',
      minuta_id: minutaId,
      razao_social: 'EMPRESA ABC LTDA',
      cnpj: '12345678000199',
      inscricao_estadual: '123456789',
      endereco: {
        logradouro: 'Av. Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'Sao Paulo',
        estado: 'SP',
      },
      papel: 'outorgante',
    }],
    imoveis: [],
    negocios_juridicos: [],
    documentos: [],
  };

  const mockClient = createMockSupabaseClient(mockData);
  const result = await aggregateMinutaData(mockClient as unknown, minutaId);

  const outorgante = result.outorgantes[0];
  assertExists(outorgante);
  assertEquals(outorgante.razao_social, 'EMPRESA ABC LTDA');
  assertEquals(outorgante.cnpj_formatado, '12.345.678/0001-99');
  assertExists(outorgante.endereco_formatado);
});

Deno.test('aggregateMinutaData - formats imovel correctly', async () => {
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mockData: MockDbData = {
    minutas: [{
      id: minutaId,
      titulo: 'Escritura',
      tipo_ato: 'compra_venda',
      created_at: '2026-01-31',
    }],
    pessoas_naturais: [],
    pessoas_juridicas: [],
    imoveis: [{
      id: 'im-1',
      minuta_id: minutaId,
      tipo_imovel: 'apartamento',
      matricula: '12345',
      cartorio_registro: '1o Cartorio de Registro de Imoveis de Sao Paulo',
      area_total: 150.75,
      area_construida: 120.50,
      endereco_completo: 'Rua das Flores, 200, Apto 101',
      inscricao_municipal: '123.456.789-0',
      dados_adicionais: {
        valor_venal: 600000,
        fracao_ideal: '0,005',
      },
    }],
    negocios_juridicos: [],
    documentos: [],
  };

  const mockClient = createMockSupabaseClient(mockData);
  const result = await aggregateMinutaData(mockClient as unknown, minutaId);

  const imovel = result.imoveis[0];
  assertExists(imovel);
  assertEquals(imovel.matricula_numero, '12345');
  assertEquals(imovel.matricula_cartorio, '1o Cartorio de Registro de Imoveis de Sao Paulo');
  assertEquals(imovel.tipo_imovel, 'apartamento');
  assertEquals(imovel.area_total, '150,75 m2');
  assertEquals(imovel.area_construida, '120,50 m2');
  assertEquals(imovel.inscricao_municipal, '123.456.789-0');
});

Deno.test('aggregateMinutaData - formats negocio juridico correctly', async () => {
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mockData: MockDbData = {
    minutas: [{
      id: minutaId,
      titulo: 'Escritura',
      tipo_ato: 'compra_venda',
      created_at: '2026-01-31',
    }],
    pessoas_naturais: [],
    pessoas_juridicas: [],
    imoveis: [],
    negocios_juridicos: [{
      id: 'nj-1',
      minuta_id: minutaId,
      tipo_negocio: 'compra_venda',
      valor: 500000,
      forma_pagamento: 'financiamento',
      condicoes: {
        sinal: 100000,
        prazo_financiamento: '360 meses',
        banco: 'Caixa Economica Federal',
      },
      data_assinatura: '2026-02-15',
    }],
    documentos: [],
  };

  const mockClient = createMockSupabaseClient(mockData);
  const result = await aggregateMinutaData(mockClient as unknown, minutaId);

  const negocio = result.negocio;
  assertExists(negocio);
  assertEquals(negocio.tipo_negocio, 'compra_venda');
  assertEquals(negocio.valor_formatado, 'R$ 500.000,00');
  assertEquals(negocio.valor_extenso, 'quinhentos mil reais');
  assertEquals(negocio.forma_pagamento, 'financiamento');
  assertExists(negocio.condicoes);
});

Deno.test('aggregateMinutaData - handles empty data gracefully', async () => {
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mockData: MockDbData = {
    minutas: [{
      id: minutaId,
      titulo: 'Escritura Vazia',
      tipo_ato: 'compra_venda',
      created_at: '2026-01-31',
    }],
    pessoas_naturais: [],
    pessoas_juridicas: [],
    imoveis: [],
    negocios_juridicos: [],
    documentos: [],
  };

  const mockClient = createMockSupabaseClient(mockData);
  const result = await aggregateMinutaData(mockClient as unknown, minutaId);

  assertExists(result);
  assertEquals(result.outorgantes.length, 0);
  assertEquals(result.outorgados.length, 0);
  assertEquals(result.imoveis.length, 0);
  assertEquals(result.negocio, null);
});

Deno.test('aggregateMinutaData - combines pessoas naturais and juridicas as outorgantes', async () => {
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mockData: MockDbData = {
    minutas: [{
      id: minutaId,
      titulo: 'Escritura',
      tipo_ato: 'compra_venda',
      created_at: '2026-01-31',
    }],
    pessoas_naturais: [{
      id: 'pn-1',
      minuta_id: minutaId,
      nome_completo: 'JOAO DA SILVA',
      cpf: '12345678900',
      papel: 'outorgante',
    }],
    pessoas_juridicas: [{
      id: 'pj-1',
      minuta_id: minutaId,
      razao_social: 'EMPRESA ABC LTDA',
      cnpj: '12345678000199',
      papel: 'outorgante',
    }],
    imoveis: [],
    negocios_juridicos: [],
    documentos: [],
  };

  const mockClient = createMockSupabaseClient(mockData);
  const result = await aggregateMinutaData(mockClient as unknown, minutaId);

  // Should have both pessoa natural and juridica as outorgantes
  assertEquals(result.outorgantes.length, 2);
});

Deno.test('aggregateMinutaData - formats data_lavratura correctly', async () => {
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mockData: MockDbData = {
    minutas: [{
      id: minutaId,
      titulo: 'Escritura',
      tipo_ato: 'compra_venda',
      created_at: '2026-02-01T14:30:00Z',
    }],
    pessoas_naturais: [],
    pessoas_juridicas: [],
    imoveis: [],
    negocios_juridicos: [],
    documentos: [],
  };

  const mockClient = createMockSupabaseClient(mockData);
  const result = await aggregateMinutaData(mockClient as unknown, minutaId);

  assertEquals(result.minuta.data_lavratura, '01 de fevereiro de 2026');
});

// ============ EXTENSO TESTS ============

Deno.test('formatCurrencyExtended - handles complex values', () => {
  // 123.456,78
  const result1 = formatCurrencyExtended(123456.78);
  assertEquals(result1.extenso, 'cento e vinte e tres mil quatrocentos e cinquenta e seis reais e setenta e oito centavos');

  // 2.000.000,00
  const result2 = formatCurrencyExtended(2000000);
  assertEquals(result2.extenso, 'dois milhoes de reais');

  // 1.001,01
  const result3 = formatCurrencyExtended(1001.01);
  assertEquals(result3.extenso, 'mil e um reais e um centavo');
});

Deno.test('formatCurrencyExtended - handles edge cases', () => {
  assertEquals(formatCurrencyExtended(0).extenso, 'zero reais');
  assertEquals(formatCurrencyExtended(0.01).extenso, 'um centavo');
  assertEquals(formatCurrencyExtended(0.50).extenso, 'cinquenta centavos');
});
