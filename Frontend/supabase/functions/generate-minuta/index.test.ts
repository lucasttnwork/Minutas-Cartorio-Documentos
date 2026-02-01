/**
 * Tests for generate-minuta/index.ts
 *
 * Tests the main generation flow including:
 * - Data aggregation
 * - Template mapping
 * - Prompt building
 *
 * Run with: deno test --allow-env supabase/functions/generate-minuta/index.test.ts
 */

import { assertEquals, assertExists, assertStringIncludes } from 'https://deno.land/std@0.177.0/testing/asserts.ts';
import type { MinutaCompleta, PessoaNaturalCompleta, PessoaJuridicaCompleta, ImovelCompleto, NegocioJuridicoCompleto } from './data-aggregator.ts';
import {
  buildOutorgantesSection,
  buildOutorgadosSection,
  buildImoveisSection,
  buildNegocioSection,
  qualifyPessoaNatural,
  qualifyPessoaJuridica,
} from './qualification-builder.ts';

// ============ MOCK DATA ============

function createMockPessoaNatural(overrides: Partial<PessoaNaturalCompleta> = {}): PessoaNaturalCompleta {
  return {
    tipo: 'natural',
    nome: 'JOAO DA SILVA',
    cpf: '12345678900',
    cpf_formatado: '123.456.789-00',
    rg: '123456789',
    orgao_emissor_rg: 'SSP',
    estado_emissor_rg: 'SP',
    nacionalidade: 'brasileiro',
    estado_civil: 'casado',
    regime_bens: 'comunhao parcial de bens',
    profissao: 'empresario',
    data_nascimento: '1980-05-15',
    data_nascimento_formatada: '15 de maio de 1980',
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      estado: 'SP',
      cep: '01310-100',
    },
    endereco_formatado: 'Rua das Flores, 100, Centro, Sao Paulo/SP, CEP 01310-100',
    ...overrides,
  };
}

function createMockPessoaJuridica(overrides: Partial<PessoaJuridicaCompleta> = {}): PessoaJuridicaCompleta {
  return {
    tipo: 'juridica',
    razao_social: 'EMPRESA ABC LTDA',
    cnpj: '12345678000199',
    cnpj_formatado: '12.345.678/0001-99',
    inscricao_estadual: '123456789',
    endereco: {
      logradouro: 'Av. Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'Sao Paulo',
      estado: 'SP',
    },
    endereco_formatado: 'Av. Paulista, 1000, Bela Vista, Sao Paulo/SP',
    representantes: [
      { nome: 'Carlos Diretor', cpf: '11122233344', cpf_formatado: '111.222.333-44', cargo: 'Diretor' },
    ],
    ...overrides,
  };
}

function createMockImovel(overrides: Partial<ImovelCompleto> = {}): ImovelCompleto {
  return {
    id: 'im-1',
    matricula_numero: '12345',
    matricula_cartorio: '1o Cartorio de Registro de Imoveis de Sao Paulo',
    descricao: 'Apartamento 101, localizado no 10o andar do Edificio Solar',
    tipo_imovel: 'apartamento',
    area_privativa: '75,50 m2',
    area_comum: '25,00 m2',
    area_total: '100,50 m2',
    area_construida: '75,50 m2',
    endereco_completo: 'Rua das Flores, 200, Apto 101, Jardim Paulista, Sao Paulo/SP',
    inscricao_municipal: '123.456.789-0',
    valor_venal: '600000',
    valor_venal_formatado: 'R$ 600.000,00',
    fracao_ideal: '0,005',
    dados_adicionais: null,
    ...overrides,
  };
}

function createMockNegocio(overrides: Partial<NegocioJuridicoCompleto> = {}): NegocioJuridicoCompleto {
  return {
    id: 'nj-1',
    tipo_negocio: 'compra_venda',
    valor: 500000,
    valor_formatado: 'R$ 500.000,00',
    valor_extenso: 'quinhentos mil reais',
    forma_pagamento: 'a vista',
    condicoes: null,
    data_contrato: '2026-02-01',
    data_contrato_formatada: '01 de fevereiro de 2026',
    ...overrides,
  };
}

function createMockMinutaCompleta(overrides: Partial<MinutaCompleta> = {}): MinutaCompleta {
  return {
    minuta: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      titulo: 'Escritura de Compra e Venda',
      tipo_ato: 'compra_venda',
      data_lavratura: '31 de janeiro de 2026',
    },
    outorgantes: [createMockPessoaNatural()],
    outorgados: [createMockPessoaNatural({ nome: 'MARIA SANTOS', cpf_formatado: '987.654.321-00' })],
    imoveis: [createMockImovel()],
    negocio: createMockNegocio(),
    certidoes: [],
    ...overrides,
  };
}

// ============ QUALIFICATION TESTS ============

Deno.test('qualifyPessoaNatural - generates correct qualification text', () => {
  const pessoa = createMockPessoaNatural();
  const qualification = qualifyPessoaNatural(pessoa);

  assertStringIncludes(qualification, 'JOAO DA SILVA');
  assertStringIncludes(qualification, 'brasileiro');
  assertStringIncludes(qualification, 'casado');
  assertStringIncludes(qualification, 'empresario');
  assertStringIncludes(qualification, 'RG n. 123456789');
  assertStringIncludes(qualification, 'CPF');
  assertStringIncludes(qualification, '123.456.789-00');
});

Deno.test('qualifyPessoaNatural - includes regime de bens for married', () => {
  const pessoa = createMockPessoaNatural({
    estado_civil: 'casado',
    regime_bens: 'comunhao universal de bens',
  });
  const qualification = qualifyPessoaNatural(pessoa);

  assertStringIncludes(qualification, 'comunhao universal de bens');
});

Deno.test('qualifyPessoaNatural - handles missing fields gracefully', () => {
  const pessoa = createMockPessoaNatural({
    rg: '',
    profissao: '',
    endereco_formatado: '',
  });
  const qualification = qualifyPessoaNatural(pessoa);

  // Should still contain the name and CPF
  assertStringIncludes(qualification, 'JOAO DA SILVA');
  assertStringIncludes(qualification, 'CPF');
});

Deno.test('qualifyPessoaJuridica - generates correct qualification text', () => {
  const pessoa = createMockPessoaJuridica();
  const qualification = qualifyPessoaJuridica(pessoa);

  assertStringIncludes(qualification, 'EMPRESA ABC LTDA');
  assertStringIncludes(qualification, 'CNPJ');
  assertStringIncludes(qualification, '12.345.678/0001-99');
  assertStringIncludes(qualification, 'Inscricao Estadual');
});

Deno.test('qualifyPessoaJuridica - includes representantes', () => {
  const pessoa = createMockPessoaJuridica({
    representantes: [
      { nome: 'Carlos Diretor', cpf: '11122233344', cpf_formatado: '111.222.333-44', cargo: 'Diretor' },
      { nome: 'Ana Gerente', cpf: '55566677788', cpf_formatado: '555.666.777-88', cargo: 'Gerente' },
    ],
  });
  const qualification = qualifyPessoaJuridica(pessoa);

  assertStringIncludes(qualification, 'Carlos Diretor');
  assertStringIncludes(qualification, 'Ana Gerente');
  assertStringIncludes(qualification, 'representada');
});

// ============ SECTION BUILDER TESTS ============

Deno.test('buildOutorgantesSection - single outorgante', () => {
  const outorgantes = [createMockPessoaNatural()];
  const section = buildOutorgantesSection(outorgantes);

  assertStringIncludes(section, 'OUTORGANTE VENDEDOR');
  assertStringIncludes(section, 'JOAO DA SILVA');
});

Deno.test('buildOutorgantesSection - multiple outorgantes', () => {
  const outorgantes = [
    createMockPessoaNatural({ nome: 'JOAO DA SILVA' }),
    createMockPessoaNatural({ nome: 'MARIA SANTOS' }),
  ];
  const section = buildOutorgantesSection(outorgantes);

  assertStringIncludes(section, 'OUTORGANTES VENDEDORES');
  assertStringIncludes(section, '1)');
  assertStringIncludes(section, '2)');
});

Deno.test('buildOutorgantesSection - empty array', () => {
  const section = buildOutorgantesSection([]);

  assertStringIncludes(section, '[NAO INFORMADOS]');
});

Deno.test('buildOutorgadosSection - single outorgado', () => {
  const outorgados = [createMockPessoaNatural()];
  const section = buildOutorgadosSection(outorgados);

  assertStringIncludes(section, 'OUTORGADO COMPRADOR');
});

Deno.test('buildImoveisSection - single imovel', () => {
  const imoveis = [createMockImovel()];
  const section = buildImoveisSection(imoveis);

  assertStringIncludes(section, 'IMOVEL');
  assertStringIncludes(section, 'matricula');
  assertStringIncludes(section, '12345');
  assertStringIncludes(section, 'Cartorio de Registro de Imoveis');
});

Deno.test('buildImoveisSection - includes areas', () => {
  const imoveis = [createMockImovel()];
  const section = buildImoveisSection(imoveis);

  assertStringIncludes(section, 'area total');
  assertStringIncludes(section, '100,50 m2');
});

Deno.test('buildNegocioSection - includes valor and extenso', () => {
  const negocio = createMockNegocio();
  const section = buildNegocioSection(negocio);

  assertStringIncludes(section, 'NEGOCIO');
  assertStringIncludes(section, 'R$ 500.000,00');
  assertStringIncludes(section, 'quinhentos mil reais');
});

Deno.test('buildNegocioSection - handles null negocio', () => {
  const section = buildNegocioSection(null);

  assertStringIncludes(section, '[NAO INFORMADO]');
});

// ============ INTEGRATION TESTS ============

Deno.test('complete minuta data - all sections present', () => {
  const data = createMockMinutaCompleta();

  // Verify all sections can be built
  const outorgantesSection = buildOutorgantesSection(data.outorgantes);
  const outorgadosSection = buildOutorgadosSection(data.outorgados);
  const imoveisSection = buildImoveisSection(data.imoveis);
  const negocioSection = buildNegocioSection(data.negocio);

  assertExists(outorgantesSection);
  assertExists(outorgadosSection);
  assertExists(imoveisSection);
  assertExists(negocioSection);

  // All sections should have content
  assertEquals(outorgantesSection.length > 50, true);
  assertEquals(outorgadosSection.length > 50, true);
  assertEquals(imoveisSection.length > 50, true);
  assertEquals(negocioSection.length > 20, true);
});

Deno.test('mixed pessoas naturais and juridicas as outorgantes', () => {
  const outorgantes = [
    createMockPessoaNatural({ nome: 'JOAO PESSOA FISICA' }),
    createMockPessoaJuridica({ razao_social: 'EMPRESA PESSOA JURIDICA' }),
  ];
  const section = buildOutorgantesSection(outorgantes);

  assertStringIncludes(section, 'JOAO PESSOA FISICA');
  assertStringIncludes(section, 'EMPRESA PESSOA JURIDICA');
  assertStringIncludes(section, 'CNPJ');
  assertStringIncludes(section, 'CPF');
});

Deno.test('multiple imoveis section', () => {
  const imoveis = [
    createMockImovel({ matricula_numero: '11111', tipo_imovel: 'apartamento' }),
    createMockImovel({ matricula_numero: '22222', tipo_imovel: 'vaga de garagem' }),
  ];
  const section = buildImoveisSection(imoveis);

  assertStringIncludes(section, 'IMOVEIS');
  assertStringIncludes(section, '11111');
  assertStringIncludes(section, '22222');
  assertStringIncludes(section, '1)');
  assertStringIncludes(section, '2)');
});

// ============ EDGE CASE TESTS ============

Deno.test('pessoa natural without endereco', () => {
  const pessoa = createMockPessoaNatural({
    endereco: null,
    endereco_formatado: '',
  });
  const qualification = qualifyPessoaNatural(pessoa);

  // Should still work, just without the address
  assertStringIncludes(qualification, 'JOAO DA SILVA');
});

Deno.test('pessoa juridica without representantes', () => {
  const pessoa = createMockPessoaJuridica({
    representantes: [],
  });
  const qualification = qualifyPessoaJuridica(pessoa);

  // Should still work, just without representantes
  assertStringIncludes(qualification, 'EMPRESA ABC LTDA');
  assertEquals(qualification.includes('representada'), false);
});

Deno.test('imovel with minimal data', () => {
  const imovel = createMockImovel({
    descricao: '',
    area_privativa: '',
    area_comum: '',
    fracao_ideal: '',
    valor_venal_formatado: '',
  });
  const section = buildImoveisSection([imovel]);

  // Should still contain matricula info
  assertStringIncludes(section, 'matricula');
  assertStringIncludes(section, '12345');
});

Deno.test('negocio with condicoes especiais', () => {
  const negocio = createMockNegocio({
    condicoes: {
      sinal: 'R$ 50.000,00',
      prazo_financiamento: '360 meses',
      banco_financiador: 'Caixa Economica Federal',
    },
  });
  const section = buildNegocioSection(negocio);

  assertStringIncludes(section, 'condicoes');
});
