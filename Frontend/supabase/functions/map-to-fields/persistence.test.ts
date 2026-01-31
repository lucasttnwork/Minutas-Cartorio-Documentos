/**
 * Tests for persistence functions
 * Uses Deno's built-in test framework
 *
 * Run with: deno test --allow-env supabase/functions/map-to-fields/persistence.test.ts
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import { normalizeCpf, normalizeCnpj, mergeFontes, parseCurrency, parseDate, parseArea } from './normalizers.ts';

// ============ NORMALIZER TESTS ============

Deno.test('normalizeCpf - removes formatting', () => {
  assertEquals(normalizeCpf('123.456.789-00'), '12345678900');
  assertEquals(normalizeCpf('12345678900'), '12345678900');
});

Deno.test('normalizeCpf - handles null/undefined', () => {
  assertEquals(normalizeCpf(null), '');
  assertEquals(normalizeCpf(undefined), '');
  assertEquals(normalizeCpf(''), '');
});

Deno.test('normalizeCnpj - removes formatting', () => {
  assertEquals(normalizeCnpj('12.345.678/0001-00'), '12345678000100');
  assertEquals(normalizeCnpj('12345678000100'), '12345678000100');
});

Deno.test('normalizeCnpj - handles null/undefined', () => {
  assertEquals(normalizeCnpj(null), '');
  assertEquals(normalizeCnpj(undefined), '');
});

Deno.test('mergeFontes - combines sources without duplicates', () => {
  const existing = { nome: ['RG.pdf'], cpf: ['RG.pdf'] };
  const incoming = { nome: ['CNH.pdf'], cpf: ['RG.pdf', 'CNH.pdf'], rg: ['CNH.pdf'] };

  const result = mergeFontes(existing, incoming);

  assertEquals(result.nome, ['RG.pdf', 'CNH.pdf']);
  assertEquals(result.cpf, ['RG.pdf', 'CNH.pdf']);
  assertEquals(result.rg, ['CNH.pdf']);
});

Deno.test('mergeFontes - handles null existing', () => {
  const incoming = { nome: ['RG.pdf'] };
  const result = mergeFontes(null, incoming);
  assertEquals(result.nome, ['RG.pdf']);
});

Deno.test('mergeFontes - handles null incoming', () => {
  const existing = { nome: ['RG.pdf'] };
  const result = mergeFontes(existing, null);
  assertEquals(result.nome, ['RG.pdf']);
});

Deno.test('parseCurrency - parses Brazilian format', () => {
  assertEquals(parseCurrency('R$ 1.234.567,89'), 1234567.89);
  assertEquals(parseCurrency('R$ 500,00'), 500);
  assertEquals(parseCurrency('500,00'), 500);
  assertEquals(parseCurrency('1234.56'), 1234.56);
});

Deno.test('parseCurrency - handles numeric input', () => {
  assertEquals(parseCurrency(1234.56), 1234.56);
});

Deno.test('parseCurrency - handles null/undefined', () => {
  assertEquals(parseCurrency(null), null);
  assertEquals(parseCurrency(undefined), null);
});

Deno.test('parseDate - parses Brazilian format DD/MM/YYYY', () => {
  assertEquals(parseDate('31/12/2025'), '2025-12-31');
  assertEquals(parseDate('01/01/2026'), '2026-01-01');
});

Deno.test('parseDate - parses ISO format', () => {
  assertEquals(parseDate('2025-12-31'), '2025-12-31');
  assertEquals(parseDate('2025-12-31T10:00:00Z'), '2025-12-31');
});

Deno.test('parseDate - handles null/undefined', () => {
  assertEquals(parseDate(null), null);
  assertEquals(parseDate(undefined), null);
});

Deno.test('parseArea - parses area with units', () => {
  assertEquals(parseArea('123,45 m2'), 123.45);
  assertEquals(parseArea('100m2'), 100);
  assertEquals(parseArea('50.5'), 50.5);
});

Deno.test('parseArea - handles numeric input', () => {
  assertEquals(parseArea(123.45), 123.45);
});

Deno.test('parseArea - handles null/undefined', () => {
  assertEquals(parseArea(null), null);
  assertEquals(parseArea(undefined), null);
});

// ============ MOCK SUPABASE CLIENT ============

interface MockQueryResult {
  data: unknown;
  error: Error | null;
}

interface InsertedRow {
  table: string;
  data: Record<string, unknown>;
}

interface UpdatedRow {
  table: string;
  id: string;
  data: Record<string, unknown>;
}

// Create a mock client for testing
function createMockSupabaseClient() {
  const insertedRows: InsertedRow[] = [];
  const updatedRows: UpdatedRow[] = [];
  let existingData: Record<string, Record<string, unknown>[]> = {};

  const mockClient = {
    from: (table: string) => {
      return {
        select: (columns?: string) => {
          return {
            eq: (column: string, value: unknown) => {
              return {
                eq: (column2: string, value2: unknown) => {
                  return {
                    single: async (): Promise<MockQueryResult> => {
                      const tableData = existingData[table] || [];
                      const found = tableData.find(
                        row => row[column] === value && row[column2] === value2
                      );
                      return { data: found || null, error: null };
                    },
                    maybeSingle: async (): Promise<MockQueryResult> => {
                      const tableData = existingData[table] || [];
                      const found = tableData.find(
                        row => row[column] === value && row[column2] === value2
                      );
                      return { data: found || null, error: null };
                    },
                  };
                },
                single: async (): Promise<MockQueryResult> => {
                  const tableData = existingData[table] || [];
                  const found = tableData.find(row => row[column] === value);
                  return { data: found || null, error: null };
                },
                maybeSingle: async (): Promise<MockQueryResult> => {
                  const tableData = existingData[table] || [];
                  const found = tableData.find(row => row[column] === value);
                  return { data: found || null, error: null };
                },
              };
            },
          };
        },
        insert: (data: Record<string, unknown> | Record<string, unknown>[]) => {
          const rows = Array.isArray(data) ? data : [data];
          for (const row of rows) {
            insertedRows.push({ table, data: { ...row, id: crypto.randomUUID() } });
          }
          return {
            select: (_columns?: string) => ({
              single: async (): Promise<MockQueryResult> => {
                const lastInserted = insertedRows[insertedRows.length - 1];
                return { data: lastInserted?.data || null, error: null };
              },
            }),
          };
        },
        update: (data: Record<string, unknown>) => {
          return {
            eq: (column: string, value: string) => {
              updatedRows.push({ table, id: value, data });
              return {
                select: (_columns?: string) => ({
                  single: async (): Promise<MockQueryResult> => {
                    return { data: { id: value, ...data }, error: null };
                  },
                }),
              };
            },
          };
        },
        upsert: (data: Record<string, unknown> | Record<string, unknown>[]) => {
          const rows = Array.isArray(data) ? data : [data];
          for (const row of rows) {
            insertedRows.push({ table, data: { ...row, id: row.id || crypto.randomUUID() } });
          }
          return {
            select: (_columns?: string) => ({
              single: async (): Promise<MockQueryResult> => {
                const lastInserted = insertedRows[insertedRows.length - 1];
                return { data: lastInserted?.data || null, error: null };
              },
            }),
          };
        },
      };
    },
    // Test helpers
    _setExistingData: (data: Record<string, Record<string, unknown>[]>) => {
      existingData = data;
    },
    _getInsertedRows: () => insertedRows,
    _getUpdatedRows: () => updatedRows,
    _reset: () => {
      insertedRows.length = 0;
      updatedRows.length = 0;
      existingData = {};
    },
  };

  return mockClient;
}

// ============ PERSISTENCE TESTS ============
// These tests will import persistence.ts once it exists

import {
  persistMappedFields,
  upsertPessoaNatural,
  upsertImovel,
  upsertNegocio
} from './persistence.ts';
import type { MappedFields, PessoaNatural, Imovel, NegocioJuridico } from '../_shared/types.ts';

Deno.test('upsertPessoaNatural - inserts new pessoa when CPF not exists', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const pessoa: PessoaNatural = {
    nome: 'JOAO DA SILVA',
    cpf: '123.456.789-00',
    rg: '12345678',
    _fontes: { nome: ['RG.pdf'], cpf: ['RG.pdf'] },
  };

  const result = await upsertPessoaNatural(mockClient as unknown, pessoa, minutaId, 'outorgante');

  assertExists(result);
  const inserted = mockClient._getInsertedRows();
  assertEquals(inserted.length, 1);
  assertEquals(inserted[0].table, 'pessoas_naturais');
  assertEquals(inserted[0].data.cpf, '12345678900');
  assertEquals(inserted[0].data.papel, 'outorgante');
  assertEquals(inserted[0].data.minuta_id, minutaId);
});

Deno.test('upsertPessoaNatural - updates existing pessoa when CPF exists', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';
  const existingId = 'existing-pessoa-id';

  // Set up existing data
  mockClient._setExistingData({
    pessoas_naturais: [{
      id: existingId,
      minuta_id: minutaId,
      cpf: '12345678900',
      nome: 'JOAO DA SILVA',
      fontes: { nome: ['RG.pdf'] },
    }],
  });

  const pessoa: PessoaNatural = {
    nome: 'JOAO DA SILVA',
    cpf: '123.456.789-00',
    rg: '12345678',
    orgao_emissor_rg: 'SSP',
    _fontes: { rg: ['CNH.pdf'] },
  };

  const result = await upsertPessoaNatural(mockClient as unknown, pessoa, minutaId, 'outorgante');

  assertEquals(result, existingId);
  const updated = mockClient._getUpdatedRows();
  assertEquals(updated.length, 1);
  assertEquals(updated[0].table, 'pessoas_naturais');
  assertEquals(updated[0].id, existingId);
});

Deno.test('upsertPessoaNatural - merges fontes correctly', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';
  const existingId = 'existing-pessoa-id';

  mockClient._setExistingData({
    pessoas_naturais: [{
      id: existingId,
      minuta_id: minutaId,
      cpf: '12345678900',
      nome: 'JOAO DA SILVA',
      fontes: { nome: ['RG.pdf'], cpf: ['RG.pdf'] },
    }],
  });

  const pessoa: PessoaNatural = {
    nome: 'JOAO DA SILVA',
    cpf: '123.456.789-00',
    _fontes: { nome: ['CNH.pdf'], rg: ['CNH.pdf'] },
  };

  await upsertPessoaNatural(mockClient as unknown, pessoa, minutaId, 'outorgante');

  const updated = mockClient._getUpdatedRows();
  const updatedFontes = updated[0].data.fontes as Record<string, string[]>;

  // Should have merged fontes
  assertEquals(updatedFontes.nome, ['RG.pdf', 'CNH.pdf']);
  assertEquals(updatedFontes.rg, ['CNH.pdf']);
  assertEquals(updatedFontes.cpf, ['RG.pdf']);
});

Deno.test('persistMappedFields - inserts alienantes as outorgantes', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mappedFields: MappedFields = {
    alienantes: [
      { nome: 'VENDEDOR UM', cpf: '111.111.111-11', _fontes: { nome: ['doc1.pdf'] } },
      { nome: 'VENDEDOR DOIS', cpf: '222.222.222-22', _fontes: { nome: ['doc2.pdf'] } },
    ],
    adquirentes: [],
    anuentes: [],
    imovel: {},
    negocio: { tipo: 'compra_venda' },
    alertas_juridicos: [],
    metadata: { documentos_processados: 2, campos_preenchidos: 4, campos_faltantes: [] },
  };

  await persistMappedFields(mockClient as unknown, minutaId, mappedFields);

  const inserted = mockClient._getInsertedRows();
  const pessoasInseridas = inserted.filter(r => r.table === 'pessoas_naturais');

  assertEquals(pessoasInseridas.length, 2);
  assertEquals(pessoasInseridas[0].data.papel, 'outorgante');
  assertEquals(pessoasInseridas[1].data.papel, 'outorgante');
});

Deno.test('persistMappedFields - inserts adquirentes as outorgados', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mappedFields: MappedFields = {
    alienantes: [],
    adquirentes: [
      { nome: 'COMPRADOR UM', cpf: '333.333.333-33', _fontes: { nome: ['doc3.pdf'] } },
    ],
    anuentes: [],
    imovel: {},
    negocio: { tipo: 'compra_venda' },
    alertas_juridicos: [],
    metadata: { documentos_processados: 1, campos_preenchidos: 2, campos_faltantes: [] },
  };

  await persistMappedFields(mockClient as unknown, minutaId, mappedFields);

  const inserted = mockClient._getInsertedRows();
  const pessoasInseridas = inserted.filter(r => r.table === 'pessoas_naturais');

  assertEquals(pessoasInseridas.length, 1);
  assertEquals(pessoasInseridas[0].data.papel, 'outorgado');
});

Deno.test('persistMappedFields - inserts anuentes correctly', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mappedFields: MappedFields = {
    alienantes: [],
    adquirentes: [],
    anuentes: [
      { nome: 'CONJUGE ANUENTE', cpf: '444.444.444-44', _fontes: { nome: ['certidao.pdf'] } },
    ],
    imovel: {},
    negocio: { tipo: 'compra_venda' },
    alertas_juridicos: [],
    metadata: { documentos_processados: 1, campos_preenchidos: 2, campos_faltantes: [] },
  };

  await persistMappedFields(mockClient as unknown, minutaId, mappedFields);

  const inserted = mockClient._getInsertedRows();
  const pessoasInseridas = inserted.filter(r => r.table === 'pessoas_naturais');

  assertEquals(pessoasInseridas.length, 1);
  assertEquals(pessoasInseridas[0].data.papel, 'anuente');
});

Deno.test('upsertImovel - inserts new imovel', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const imovel: Imovel = {
    matricula_numero: '12345',
    registro_imoveis: '1o Cartorio',
    cidade: 'Sao Paulo',
    estado: 'SP',
    tipo: 'apartamento',
    area_total: '100,50 m2',
    iptu_valor_venal: 'R$ 500.000,00',
  };

  const result = await upsertImovel(mockClient as unknown, imovel, minutaId);

  assertExists(result);
  const inserted = mockClient._getInsertedRows();
  const imoveisInseridos = inserted.filter(r => r.table === 'imoveis');

  assertEquals(imoveisInseridos.length, 1);
  assertEquals(imoveisInseridos[0].data.matricula_numero, '12345');
  assertEquals(imoveisInseridos[0].data.minuta_id, minutaId);
});

Deno.test('upsertImovel - parses numeric values correctly', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const imovel: Imovel = {
    matricula_numero: '12345',
    area_total: '150,75 m2',
    area_privativa: '120.50',
    iptu_valor_venal: 'R$ 1.234.567,89',
    vvr_valor: 'R$ 1.500.000,00',
  };

  await upsertImovel(mockClient as unknown, imovel, minutaId);

  const inserted = mockClient._getInsertedRows();
  const imovelInserido = inserted.find(r => r.table === 'imoveis');

  assertEquals(imovelInserido?.data.area_total, 150.75);
  assertEquals(imovelInserido?.data.area_privativa, 120.50);
  assertEquals(imovelInserido?.data.iptu_valor_venal, 1234567.89);
  assertEquals(imovelInserido?.data.vvr_valor, 1500000);
});

Deno.test('upsertNegocio - inserts negocio with imovel link', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';
  const imovelId = 'imovel-123';

  const negocio: NegocioJuridico = {
    tipo: 'compra_venda',
    valor_total: 'R$ 800.000,00',
    pagamento: {
      tipo: 'financiamento',
      sinal: 'R$ 100.000,00',
      saldo: 'R$ 700.000,00',
    },
    itbi: {
      numero_guia: 'ITBI-2026-001',
      base_calculo: 'R$ 800.000,00',
      valor: 'R$ 24.000,00',
    },
  };

  const result = await upsertNegocio(mockClient as unknown, negocio, minutaId, imovelId);

  assertExists(result);
  const inserted = mockClient._getInsertedRows();
  const negociosInseridos = inserted.filter(r => r.table === 'negocios_juridicos');

  assertEquals(negociosInseridos.length, 1);
  assertEquals(negociosInseridos[0].data.tipo, 'compra_venda');
  assertEquals(negociosInseridos[0].data.imovel_id, imovelId);
  assertEquals(negociosInseridos[0].data.valor_total, 800000);
});

Deno.test('upsertNegocio - parses ITBI values correctly', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';
  const imovelId = 'imovel-123';

  const negocio: NegocioJuridico = {
    tipo: 'compra_venda',
    itbi: {
      numero_guia: 'ITBI-001',
      base_calculo: 'R$ 500.000,00',
      valor: 'R$ 15.000,00',
      data_vencimento: '15/02/2026',
      data_pagamento: '10/02/2026',
    },
  };

  await upsertNegocio(mockClient as unknown, negocio, minutaId, imovelId);

  const inserted = mockClient._getInsertedRows();
  const negocioInserido = inserted.find(r => r.table === 'negocios_juridicos');

  assertEquals(negocioInserido?.data.itbi_numero_guia, 'ITBI-001');
  assertEquals(negocioInserido?.data.itbi_base_calculo, 500000);
  assertEquals(negocioInserido?.data.itbi_valor, 15000);
  assertEquals(negocioInserido?.data.itbi_data_vencimento, '2026-02-15');
  assertEquals(negocioInserido?.data.itbi_data_pagamento, '2026-02-10');
});

Deno.test('persistMappedFields - full integration', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';

  const mappedFields: MappedFields = {
    alienantes: [
      { nome: 'VENDEDOR', cpf: '111.111.111-11', _fontes: { nome: ['contrato.pdf'] } },
    ],
    adquirentes: [
      { nome: 'COMPRADOR', cpf: '222.222.222-22', _fontes: { nome: ['contrato.pdf'] } },
    ],
    anuentes: [],
    imovel: {
      matricula_numero: '12345',
      cidade: 'Sao Paulo',
      area_total: '100 m2',
    },
    negocio: {
      tipo: 'compra_venda',
      valor_total: 'R$ 500.000,00',
    },
    alertas_juridicos: [],
    metadata: { documentos_processados: 3, campos_preenchidos: 10, campos_faltantes: [] },
  };

  await persistMappedFields(mockClient as unknown, minutaId, mappedFields);

  const inserted = mockClient._getInsertedRows();

  // Should have 2 pessoas, 1 imovel, 1 negocio
  const pessoas = inserted.filter(r => r.table === 'pessoas_naturais');
  const imoveis = inserted.filter(r => r.table === 'imoveis');
  const negocios = inserted.filter(r => r.table === 'negocios_juridicos');

  assertEquals(pessoas.length, 2);
  assertEquals(imoveis.length, 1);
  assertEquals(negocios.length, 1);

  // Negocio should reference the imovel
  const negocio = negocios[0];
  const imovel = imoveis[0];
  assertEquals(negocio.data.imovel_id, imovel.data.id);
});

Deno.test('deduplication - does not create duplicate pessoas with same CPF', async () => {
  const mockClient = createMockSupabaseClient();
  const minutaId = '123e4567-e89b-12d3-a456-426614174000';
  const existingId = 'existing-pessoa-id';

  // Simulate existing pessoa in database
  mockClient._setExistingData({
    pessoas_naturais: [{
      id: existingId,
      minuta_id: minutaId,
      cpf: '11111111111',
      nome: 'VENDEDOR',
      papel: 'outorgante',
      fontes: { nome: ['doc1.pdf'] },
    }],
  });

  const mappedFields: MappedFields = {
    alienantes: [
      { nome: 'VENDEDOR', cpf: '111.111.111-11', rg: '12345', _fontes: { rg: ['rg.pdf'] } },
    ],
    adquirentes: [],
    anuentes: [],
    imovel: {},
    negocio: { tipo: 'compra_venda' },
    alertas_juridicos: [],
    metadata: { documentos_processados: 1, campos_preenchidos: 3, campos_faltantes: [] },
  };

  await persistMappedFields(mockClient as unknown, minutaId, mappedFields);

  const inserted = mockClient._getInsertedRows();
  const updated = mockClient._getUpdatedRows();

  // Should NOT have inserted new pessoa, should have updated
  const pessoasInseridas = inserted.filter(r => r.table === 'pessoas_naturais');
  assertEquals(pessoasInseridas.length, 0);

  // Should have updated existing pessoa
  assertEquals(updated.length, 1);
  assertEquals(updated[0].id, existingId);
});
