/**
 * TDD Tests for mapMarriageCertificate function
 *
 * These tests verify the name/CPF matching logic when updating
 * pessoas from marriage certificate data.
 *
 * Problem identified: CINTIA had empty estado_civil and regime_bens
 * even after marriage certificate was processed. Likely cause is
 * failure in the matching algorithm.
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.177.0/testing/asserts.ts';

// Types needed for testing
interface PessoaNatural {
  nome: string;
  cpf?: string;
  rg?: string;
  orgao_emissor_rg?: string;
  estado_emissor_rg?: string;
  data_emissao_rg?: string;
  data_nascimento?: string;
  nacionalidade?: string;
  naturalidade?: string;
  profissao?: string;
  estado_civil?: string;
  regime_bens?: string;
  conjuge?: string;
  data_casamento?: string;
  filiacao_pai?: string;
  filiacao_mae?: string;
  endereco?: Record<string, unknown>;
  cndt?: Record<string, unknown>;
  _fontes?: Record<string, string[]>;
}

/**
 * Normalizes a name for matching purposes:
 * - Removes accents (NFD normalization + diacritic removal)
 * - Removes common articles (DA, DE, DO, DOS, DAS, E)
 * - Converts to uppercase
 * - Normalizes whitespace
 */
function normalizeNameForMatching(name: string | undefined | null): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toUpperCase()
    .replace(/\b(DA|DE|DO|DOS|DAS|E)\b/g, '') // Remove articles
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Re-implement the matching logic for isolated testing (with accent normalization fix)
function matchesConjuge(pessoa: PessoaNatural, cpf: string | null, nome: string | undefined): boolean {
  // Match by CPF if available (first priority)
  if (cpf && pessoa.cpf === cpf) return true;
  // Match by name (normalized to handle accents and articles)
  if (nome && pessoa.nome) {
    const normalizedPessoaNome = normalizeNameForMatching(pessoa.nome);
    const normalizedCertNome = normalizeNameForMatching(nome);
    // Exact match after normalization
    if (normalizedPessoaNome === normalizedCertNome) return true;
    // Handle married name vs maiden name differences
    // Check if first and last name parts match
    const certParts = normalizedCertNome.split(' ').filter(p => p.length > 0);
    const pessoaParts = normalizedPessoaNome.split(' ').filter(p => p.length > 0);
    if (certParts.length > 0 && pessoaParts.length > 0) {
      const certFirst = certParts[0];
      const certLast = certParts[certParts.length - 1];
      const pessoaFirst = pessoaParts[0];
      const pessoaLast = pessoaParts[pessoaParts.length - 1];
      // pessoa has cert's first and last name
      if (normalizedPessoaNome.includes(certFirst) && normalizedPessoaNome.includes(certLast)) return true;
      // cert has pessoa's first and last name
      if (normalizedCertNome.includes(pessoaFirst) && normalizedCertNome.includes(pessoaLast)) return true;
    }
  }
  return false;
}

// Re-implement normalizeCPF for isolated testing
function normalizeCPF(cpf: string | undefined): string | null {
  if (!cpf) return null;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return null;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// Re-implement addSource for testing
function addSource(pessoa: PessoaNatural, field: string, source: string) {
  if (!pessoa._fontes) pessoa._fontes = {};
  if (!pessoa._fontes[field]) pessoa._fontes[field] = [];
  pessoa._fontes[field].push(source);
}

// Re-implement mapMarriageCertificate for isolated testing
function mapMarriageCertificate(
  dados: Record<string, unknown>,
  source: string,
  alienantes: Map<string, PessoaNatural>,
  adquirentes: Map<string, PessoaNatural>,
  _alertas: unknown[]
) {
  // Handle both field naming conventions: conjuge1/conjuge2 and conjuge_1/conjuge_2
  const conjuge1 = (dados.conjuge_1 || dados.conjuge1) as Record<string, unknown> | undefined;
  const conjuge2 = (dados.conjuge_2 || dados.conjuge2) as Record<string, unknown> | undefined;

  if (!conjuge1 && !conjuge2) {
    console.log('[map-to-fields] Marriage certificate has no conjuge data');
    return;
  }

  // Get CPFs if available
  const conjuge1Cpf = normalizeCPF(conjuge1?.cpf as string | undefined);
  const conjuge2Cpf = normalizeCPF(conjuge2?.cpf as string | undefined);

  // Get names for matching (required since CPF is often not in marriage certificates)
  const conjuge1Nome = ((conjuge1?.nome_completo as string) || (conjuge1?.nome as string))?.toUpperCase();
  const conjuge2Nome = ((conjuge2?.nome_completo as string) || (conjuge2?.nome as string))?.toUpperCase();

  // Get filiacao from marriage certificate
  const conjuge1Filiacao = conjuge1?.filiacao as Record<string, unknown> | undefined;
  const conjuge2Filiacao = conjuge2?.filiacao as Record<string, unknown> | undefined;
  const conjuge1Naturalidade = conjuge1?.naturalidade as string | undefined;
  const conjuge2Naturalidade = conjuge2?.naturalidade as string | undefined;
  const conjuge1Nacionalidade = conjuge1?.nacionalidade as string | undefined;
  const conjuge2Nacionalidade = conjuge2?.nacionalidade as string | undefined;

  console.log(`[map-to-fields] Processing marriage certificate: ${conjuge1Nome} + ${conjuge2Nome}`);

  // Update each person in alienantes and adquirentes
  for (const [_key, pessoa] of [...alienantes.entries(), ...adquirentes.entries()]) {
    if (matchesConjuge(pessoa, conjuge1Cpf, conjuge1Nome)) {
      pessoa.estado_civil = 'casado';
      pessoa.regime_bens = dados.regime_bens as string | undefined;
      pessoa.data_casamento = dados.data_casamento as string | undefined;
      pessoa.conjuge = conjuge2Nome;
      // Map filiacao from marriage certificate if not already set
      if (!pessoa.filiacao_pai && conjuge1Filiacao?.pai) {
        pessoa.filiacao_pai = conjuge1Filiacao.pai as string;
      }
      if (!pessoa.filiacao_mae && conjuge1Filiacao?.mae) {
        pessoa.filiacao_mae = conjuge1Filiacao.mae as string;
      }
      if (!pessoa.naturalidade && conjuge1Naturalidade) {
        pessoa.naturalidade = conjuge1Naturalidade;
      }
      if (!pessoa.nacionalidade && conjuge1Nacionalidade) {
        pessoa.nacionalidade = conjuge1Nacionalidade;
      }
      addSource(pessoa, 'estado_civil', source);
      console.log(`[map-to-fields] Updated ${pessoa.nome} with marriage info (conjuge: ${conjuge2Nome})`);
    }
    if (matchesConjuge(pessoa, conjuge2Cpf, conjuge2Nome)) {
      pessoa.estado_civil = 'casado';
      pessoa.regime_bens = dados.regime_bens as string | undefined;
      pessoa.data_casamento = dados.data_casamento as string | undefined;
      pessoa.conjuge = conjuge1Nome;
      // Map filiacao from marriage certificate if not already set
      if (!pessoa.filiacao_pai && conjuge2Filiacao?.pai) {
        pessoa.filiacao_pai = conjuge2Filiacao.pai as string;
      }
      if (!pessoa.filiacao_mae && conjuge2Filiacao?.mae) {
        pessoa.filiacao_mae = conjuge2Filiacao.mae as string;
      }
      if (!pessoa.naturalidade && conjuge2Naturalidade) {
        pessoa.naturalidade = conjuge2Naturalidade;
      }
      if (!pessoa.nacionalidade && conjuge2Nacionalidade) {
        pessoa.nacionalidade = conjuge2Nacionalidade;
      }
      addSource(pessoa, 'estado_civil', source);
      console.log(`[map-to-fields] Updated ${pessoa.nome} with marriage info (conjuge: ${conjuge1Nome})`);
    }
  }
}

// ===== TESTS =====

Deno.test('matchesConjuge - should match when CPF matches exactly', () => {
  const pessoa: PessoaNatural = {
    nome: 'JOAO SILVA',
    cpf: '123.456.789-00',
  };

  const result = matchesConjuge(pessoa, '123.456.789-00', undefined);
  assertEquals(result, true);
});

Deno.test('matchesConjuge - should NOT match when CPF does not match', () => {
  const pessoa: PessoaNatural = {
    nome: 'JOAO SILVA',
    cpf: '123.456.789-00',
  };

  const result = matchesConjuge(pessoa, '999.888.777-66', undefined);
  assertEquals(result, false);
});

Deno.test('matchesConjuge - should match when name matches exactly', () => {
  const pessoa: PessoaNatural = {
    nome: 'MARIA SANTOS',
  };

  const result = matchesConjuge(pessoa, null, 'MARIA SANTOS');
  assertEquals(result, true);
});

Deno.test('matchesConjuge - should match when first and last name match (first+last in pessoa contains cert)', () => {
  // Pessoa has full married name: CINTIA APARECIDA CASTRO DIAS
  // Certificate has maiden name: CINTIA APARECIDA CASTRO
  const pessoa: PessoaNatural = {
    nome: 'CINTIA APARECIDA CASTRO DIAS',
  };

  // The algorithm checks: pessoaNome.includes(first) && pessoaNome.includes(last)
  // first = 'CINTIA', last = 'CASTRO'
  // 'CINTIA APARECIDA CASTRO DIAS'.includes('CINTIA') = true
  // 'CINTIA APARECIDA CASTRO DIAS'.includes('CASTRO') = true
  const result = matchesConjuge(pessoa, null, 'CINTIA APARECIDA CASTRO');
  assertEquals(result, true);
});

Deno.test('matchesConjuge - should match when cert has married name and pessoa has maiden name', () => {
  // Pessoa has maiden name: MARIA SILVA
  // Certificate has married name: MARIA SILVA SANTOS
  const pessoa: PessoaNatural = {
    nome: 'MARIA SILVA',
  };

  // The algorithm checks: nome.includes(pessoaFirst) && nome.includes(pessoaLast)
  // pessoaFirst = 'MARIA', pessoaLast = 'SILVA'
  // 'MARIA SILVA SANTOS'.includes('MARIA') = true
  // 'MARIA SILVA SANTOS'.includes('SILVA') = true
  const result = matchesConjuge(pessoa, null, 'MARIA SILVA SANTOS');
  assertEquals(result, true);
});

Deno.test('matchesConjuge - should NOT match when names are completely different', () => {
  const pessoa: PessoaNatural = {
    nome: 'JOAO SILVA',
  };

  const result = matchesConjuge(pessoa, null, 'MARIA SANTOS');
  assertEquals(result, false);
});

Deno.test('matchesConjuge - should match with articles like DA, DE, DOS in name', () => {
  // Pessoa: MARIA DA SILVA
  // Certificate: MARIA DA SILVA (exact match)
  const pessoa: PessoaNatural = {
    nome: 'MARIA DA SILVA',
  };

  const result = matchesConjuge(pessoa, null, 'MARIA DA SILVA');
  assertEquals(result, true);
});

Deno.test('matchesConjuge - should match first+last with articles (DE, DA, DOS)', () => {
  // Pessoa: JOSE DA SILVA SANTOS
  // Certificate: JOSE DA SILVA
  // first = 'JOSE', last = 'SILVA'
  const pessoa: PessoaNatural = {
    nome: 'JOSE DA SILVA SANTOS',
  };

  // 'JOSE DA SILVA SANTOS'.includes('JOSE') = true
  // 'JOSE DA SILVA SANTOS'.includes('SILVA') = true
  const result = matchesConjuge(pessoa, null, 'JOSE DA SILVA');
  assertEquals(result, true);
});

Deno.test('matchesConjuge - should handle accent differences (BUG FIXED)', () => {
  // This test verifies that accent normalization works
  // Pessoa has accents: CINTIA
  // Certificate has no accents: CINTIA
  // Or vice versa: CÍNTIA vs CINTIA
  const pessoa: PessoaNatural = {
    nome: 'CÍNTIA CASTRO',
  };

  // After normalization:
  // 'CÍNTIA CASTRO' -> 'CINTIA CASTRO'
  // 'CINTIA CASTRO' -> 'CINTIA CASTRO'
  // Now they match!
  const result = matchesConjuge(pessoa, null, 'CINTIA CASTRO');

  // BUG FIXED: Accent normalization now works correctly
  assertEquals(result, true);
});

Deno.test('mapMarriageCertificate - should update person when CPF matches', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: pessoa with CPF in alienantes
  alienantes.set('123.456.789-00', {
    nome: 'JOAO SILVA',
    cpf: '123.456.789-00',
  });

  // Marriage certificate with matching CPF
  const dados = {
    conjuge_1: {
      nome: 'JOAO SILVA',
      cpf: '12345678900', // Will be normalized
    },
    conjuge_2: {
      nome: 'MARIA SANTOS',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2020-01-15',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const joao = alienantes.get('123.456.789-00');
  assertExists(joao);
  assertEquals(joao.estado_civil, 'casado');
  assertEquals(joao.regime_bens, 'comunhao_parcial');
  assertEquals(joao.data_casamento, '2020-01-15');
  assertEquals(joao.conjuge, 'MARIA SANTOS');
});

Deno.test('mapMarriageCertificate - should update person when name matches exactly', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: pessoa with name only (no CPF) in alienantes
  alienantes.set('nome:MARIA SANTOS', {
    nome: 'MARIA SANTOS',
  });

  // Marriage certificate with matching name
  const dados = {
    conjuge_1: {
      nome: 'JOAO SILVA',
    },
    conjuge_2: {
      nome: 'MARIA SANTOS', // Exact match
    },
    regime_bens: 'separacao_total',
    data_casamento: '2019-06-20',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const maria = alienantes.get('nome:MARIA SANTOS');
  assertExists(maria);
  assertEquals(maria.estado_civil, 'casado');
  assertEquals(maria.regime_bens, 'separacao_total');
  assertEquals(maria.conjuge, 'JOAO SILVA');
});

Deno.test('mapMarriageCertificate - should update person when first and last name match', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: pessoa with married name
  alienantes.set('nome:CINTIA APARECIDA CASTRO DIAS', {
    nome: 'CINTIA APARECIDA CASTRO DIAS',
  });

  // Marriage certificate with maiden name
  const dados = {
    conjuge_1: {
      nome: 'CINTIA APARECIDA CASTRO', // First=CINTIA, Last=CASTRO
    },
    conjuge_2: {
      nome: 'ROBERTO DIAS',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2015-03-10',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const cintia = alienantes.get('nome:CINTIA APARECIDA CASTRO DIAS');
  assertExists(cintia);
  assertEquals(cintia.estado_civil, 'casado');
  assertEquals(cintia.regime_bens, 'comunhao_parcial');
  assertEquals(cintia.conjuge, 'ROBERTO DIAS');
});

Deno.test('mapMarriageCertificate - should NOT update person when names do not match', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: pessoa with different name
  alienantes.set('nome:ANA PAULA FERREIRA', {
    nome: 'ANA PAULA FERREIRA',
  });

  // Marriage certificate with different people
  const dados = {
    conjuge_1: {
      nome: 'JOAO SILVA',
    },
    conjuge_2: {
      nome: 'MARIA SANTOS',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2020-01-15',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const ana = alienantes.get('nome:ANA PAULA FERREIRA');
  assertExists(ana);
  assertEquals(ana.estado_civil, undefined); // Should NOT be updated
  assertEquals(ana.regime_bens, undefined);
});

Deno.test('mapMarriageCertificate - should match by name when certificate has no CPF', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: pessoa with CPF in system
  alienantes.set('987.654.321-00', {
    nome: 'PEDRO OLIVEIRA',
    cpf: '987.654.321-00',
  });

  // Marriage certificate WITHOUT CPF (common scenario)
  const dados = {
    conjuge_1: {
      nome: 'PEDRO OLIVEIRA', // Only name, no CPF
    },
    conjuge_2: {
      nome: 'LUCIA MENDES',
    },
    regime_bens: 'comunhao_universal',
    data_casamento: '2018-11-25',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const pedro = alienantes.get('987.654.321-00');
  assertExists(pedro);
  assertEquals(pedro.estado_civil, 'casado');
  assertEquals(pedro.regime_bens, 'comunhao_universal');
  assertEquals(pedro.conjuge, 'LUCIA MENDES');
});

Deno.test('mapMarriageCertificate - should match names with articles like DA, DE, DOS', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: pessoa with "DA" in name
  alienantes.set('nome:MARIA DA SILVA', {
    nome: 'MARIA DA SILVA',
  });

  // Marriage certificate with same name
  const dados = {
    conjuge_1: {
      nome: 'JOSE DOS SANTOS',
    },
    conjuge_2: {
      nome: 'MARIA DA SILVA',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2021-07-04',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const maria = alienantes.get('nome:MARIA DA SILVA');
  assertExists(maria);
  assertEquals(maria.estado_civil, 'casado');
  assertEquals(maria.conjuge, 'JOSE DOS SANTOS');
});

Deno.test('mapMarriageCertificate - should match names with accent differences (BUG FIXED)', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: pessoa with accented name
  alienantes.set('nome:CÍNTIA CASTRO', {
    nome: 'CÍNTIA CASTRO',
  });

  // Marriage certificate WITHOUT accent
  const dados = {
    conjuge_1: {
      nome: 'CINTIA CASTRO', // No accent
    },
    conjuge_2: {
      nome: 'ROBERTO DIAS',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2015-03-10',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const cintia = alienantes.get('nome:CÍNTIA CASTRO');
  assertExists(cintia);
  // BUG FIXED: Accent normalization now works correctly
  assertEquals(cintia.estado_civil, 'casado');
  assertEquals(cintia.regime_bens, 'comunhao_parcial');
  assertEquals(cintia.conjuge, 'ROBERTO DIAS');
});

Deno.test('mapMarriageCertificate - should update BOTH spouses from same certificate', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: both spouses in alienantes
  alienantes.set('111.222.333-44', {
    nome: 'CARLOS SOUZA',
    cpf: '111.222.333-44',
  });
  alienantes.set('555.666.777-88', {
    nome: 'PAULA SOUZA',
    cpf: '555.666.777-88',
  });

  // Marriage certificate with both spouses
  const dados = {
    conjuge_1: {
      nome: 'CARLOS SOUZA',
      cpf: '11122233344',
    },
    conjuge_2: {
      nome: 'PAULA SOUZA',
      cpf: '55566677788',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2022-02-22',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const carlos = alienantes.get('111.222.333-44');
  const paula = alienantes.get('555.666.777-88');

  assertExists(carlos);
  assertExists(paula);

  // Carlos should be updated
  assertEquals(carlos.estado_civil, 'casado');
  assertEquals(carlos.regime_bens, 'comunhao_parcial');
  assertEquals(carlos.conjuge, 'PAULA SOUZA');

  // Paula should also be updated
  assertEquals(paula.estado_civil, 'casado');
  assertEquals(paula.regime_bens, 'comunhao_parcial');
  assertEquals(paula.conjuge, 'CARLOS SOUZA');
});

Deno.test('mapMarriageCertificate - should update filiacao from certificate if not already set', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: pessoa WITHOUT filiacao
  alienantes.set('nome:JOAO SILVA', {
    nome: 'JOAO SILVA',
  });

  // Marriage certificate WITH filiacao
  const dados = {
    conjuge_1: {
      nome: 'JOAO SILVA',
      filiacao: {
        pai: 'ANTONIO SILVA',
        mae: 'ROSA SILVA',
      },
      naturalidade: 'SAO PAULO',
      nacionalidade: 'BRASILEIRA',
    },
    conjuge_2: {
      nome: 'MARIA SANTOS',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2020-01-15',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const joao = alienantes.get('nome:JOAO SILVA');
  assertExists(joao);
  assertEquals(joao.filiacao_pai, 'ANTONIO SILVA');
  assertEquals(joao.filiacao_mae, 'ROSA SILVA');
  assertEquals(joao.naturalidade, 'SAO PAULO');
  assertEquals(joao.nacionalidade, 'BRASILEIRA');
});

Deno.test('mapMarriageCertificate - should NOT overwrite existing filiacao', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: pessoa WITH filiacao already set (from RG)
  alienantes.set('nome:JOAO SILVA', {
    nome: 'JOAO SILVA',
    filiacao_pai: 'ANTONIO JOSE SILVA', // Already set
    filiacao_mae: 'ROSA MARIA SILVA', // Already set
  });

  // Marriage certificate with different filiacao format
  const dados = {
    conjuge_1: {
      nome: 'JOAO SILVA',
      filiacao: {
        pai: 'A. SILVA', // Different format
        mae: 'R. SILVA', // Different format
      },
    },
    conjuge_2: {
      nome: 'MARIA SANTOS',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2020-01-15',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const joao = alienantes.get('nome:JOAO SILVA');
  assertExists(joao);
  // Should keep original values, not overwrite
  assertEquals(joao.filiacao_pai, 'ANTONIO JOSE SILVA');
  assertEquals(joao.filiacao_mae, 'ROSA MARIA SILVA');
});

Deno.test('mapMarriageCertificate - should handle conjuge1/conjuge2 field names (without underscore)', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  alienantes.set('nome:LUCAS FERREIRA', {
    nome: 'LUCAS FERREIRA',
  });

  // Using conjuge1/conjuge2 instead of conjuge_1/conjuge_2
  const dados = {
    conjuge1: {
      nome: 'LUCAS FERREIRA',
    },
    conjuge2: {
      nome: 'ANA COSTA',
    },
    regime_bens: 'separacao_total',
    data_casamento: '2023-05-10',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const lucas = alienantes.get('nome:LUCAS FERREIRA');
  assertExists(lucas);
  assertEquals(lucas.estado_civil, 'casado');
  assertEquals(lucas.regime_bens, 'separacao_total');
  assertEquals(lucas.conjuge, 'ANA COSTA');
});

Deno.test('mapMarriageCertificate - should update pessoa in adquirentes (not just alienantes)', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Setup: pessoa in ADQUIRENTES
  adquirentes.set('nome:FERNANDA LIMA', {
    nome: 'FERNANDA LIMA',
  });

  const dados = {
    conjuge_1: {
      nome: 'MARCOS LIMA',
    },
    conjuge_2: {
      nome: 'FERNANDA LIMA',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2019-12-01',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const fernanda = adquirentes.get('nome:FERNANDA LIMA');
  assertExists(fernanda);
  assertEquals(fernanda.estado_civil, 'casado');
  assertEquals(fernanda.regime_bens, 'comunhao_parcial');
  assertEquals(fernanda.conjuge, 'MARCOS LIMA');
});

// ===== EDGE CASE TESTS =====

Deno.test('mapMarriageCertificate - should handle empty certificate gracefully', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  alienantes.set('nome:JOAO SILVA', {
    nome: 'JOAO SILVA',
  });

  // Empty certificate
  const dados = {};

  // Should not throw
  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const joao = alienantes.get('nome:JOAO SILVA');
  assertExists(joao);
  assertEquals(joao.estado_civil, undefined); // Not updated
});

Deno.test('mapMarriageCertificate - should handle missing regime_bens', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  alienantes.set('nome:JOAO SILVA', {
    nome: 'JOAO SILVA',
  });

  const dados = {
    conjuge_1: {
      nome: 'JOAO SILVA',
    },
    conjuge_2: {
      nome: 'MARIA SANTOS',
    },
    // regime_bens is MISSING
    data_casamento: '2020-01-15',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const joao = alienantes.get('nome:JOAO SILVA');
  assertExists(joao);
  assertEquals(joao.estado_civil, 'casado');
  assertEquals(joao.regime_bens, undefined); // Should be undefined, not crash
  assertEquals(joao.conjuge, 'MARIA SANTOS');
});

Deno.test('matchesConjuge - should handle nome_completo field in certificate', () => {
  // This tests that the main function handles nome_completo correctly
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  alienantes.set('nome:PATRICIA GOMES', {
    nome: 'PATRICIA GOMES',
  });

  const dados = {
    conjuge_1: {
      nome_completo: 'PATRICIA GOMES', // Using nome_completo instead of nome
    },
    conjuge_2: {
      nome_completo: 'RICARDO ALVES',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2017-08-12',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const patricia = alienantes.get('nome:PATRICIA GOMES');
  assertExists(patricia);
  assertEquals(patricia.estado_civil, 'casado');
  assertEquals(patricia.conjuge, 'RICARDO ALVES');
});

// ===== REAL-WORLD SCENARIO TEST =====

Deno.test('REAL SCENARIO - CINTIA with different name formats', () => {
  // This test replicates the actual bug scenario
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // System has pessoa from RG with full married name
  alienantes.set('nome:CINTIA APARECIDA DE CASTRO DIAS', {
    nome: 'CINTIA APARECIDA DE CASTRO DIAS',
    rg: '12345678',
    // Note: no CPF from RG front
  });

  // Marriage certificate has maiden name (before adding spouse's surname)
  const dados = {
    conjuge_1: {
      nome: 'CINTIA APARECIDA DE CASTRO',
      // Note: no CPF in marriage certificate
    },
    conjuge_2: {
      nome: 'ROBERTO DIAS',
    },
    regime_bens: 'comunhao_parcial_de_bens',
    data_casamento: '15/03/2010',
  };

  mapMarriageCertificate(dados, 'certidao_casamento.pdf', alienantes, adquirentes, alertas);

  const cintia = alienantes.get('nome:CINTIA APARECIDA DE CASTRO DIAS');
  assertExists(cintia);

  // Should match because:
  // pessoaNome = 'CINTIA APARECIDA DE CASTRO DIAS'
  // certNome = 'CINTIA APARECIDA DE CASTRO'
  // first = 'CINTIA', last = 'CASTRO'
  // pessoaNome.includes('CINTIA') = true
  // pessoaNome.includes('CASTRO') = true
  assertEquals(cintia.estado_civil, 'casado');
  assertEquals(cintia.regime_bens, 'comunhao_parcial_de_bens');
  assertEquals(cintia.conjuge, 'ROBERTO DIAS');
});

// ===== NORMALIZATION FUNCTION TESTS =====

Deno.test('normalizeNameForMatching - should remove accents', () => {
  assertEquals(normalizeNameForMatching('CÍNTIA'), 'CINTIA');
  assertEquals(normalizeNameForMatching('JOSÉ'), 'JOSE');
  assertEquals(normalizeNameForMatching('JOÃO'), 'JOAO');
  assertEquals(normalizeNameForMatching('ANTÔNIO'), 'ANTONIO');
  assertEquals(normalizeNameForMatching('SEBASTIÃO'), 'SEBASTIAO');
  assertEquals(normalizeNameForMatching('MÁRCIA'), 'MARCIA');
  assertEquals(normalizeNameForMatching('ÂNGELA'), 'ANGELA');
});

Deno.test('normalizeNameForMatching - should remove common articles', () => {
  assertEquals(normalizeNameForMatching('MARIA DA SILVA'), 'MARIA SILVA');
  assertEquals(normalizeNameForMatching('JOSE DE SOUZA'), 'JOSE SOUZA');
  assertEquals(normalizeNameForMatching('ANA DOS SANTOS'), 'ANA SANTOS');
  assertEquals(normalizeNameForMatching('PEDRO DAS NEVES'), 'PEDRO NEVES');
  assertEquals(normalizeNameForMatching('CARLOS DO AMARAL'), 'CARLOS AMARAL');
  assertEquals(normalizeNameForMatching('MARIA E SILVA'), 'MARIA SILVA');
});

Deno.test('normalizeNameForMatching - should handle combined accents and articles', () => {
  assertEquals(normalizeNameForMatching('JOSÉ DA SILVA'), 'JOSE SILVA');
  assertEquals(normalizeNameForMatching('CÍNTIA APARECIDA DE CASTRO'), 'CINTIA APARECIDA CASTRO');
  assertEquals(normalizeNameForMatching('JOÃO DOS SANTOS'), 'JOAO SANTOS');
});

Deno.test('normalizeNameForMatching - should handle null/undefined/empty', () => {
  assertEquals(normalizeNameForMatching(null), '');
  assertEquals(normalizeNameForMatching(undefined), '');
  assertEquals(normalizeNameForMatching(''), '');
});

Deno.test('normalizeNameForMatching - should normalize whitespace', () => {
  assertEquals(normalizeNameForMatching('MARIA   SILVA'), 'MARIA SILVA');
  assertEquals(normalizeNameForMatching('  JOSE SOUZA  '), 'JOSE SOUZA');
  assertEquals(normalizeNameForMatching('ANA\t\tSANTOS'), 'ANA SANTOS');
});

Deno.test('matchesConjuge - should match with accents on pessoa name', () => {
  const pessoa: PessoaNatural = {
    nome: 'JOSÉ ANTÔNIO DA SILVA',
  };
  // Certificate without accents
  const result = matchesConjuge(pessoa, null, 'JOSE ANTONIO DA SILVA');
  assertEquals(result, true);
});

Deno.test('matchesConjuge - should match with accents on certificate name', () => {
  const pessoa: PessoaNatural = {
    nome: 'MARIA SANTOS',
  };
  // Certificate WITH accents
  const result = matchesConjuge(pessoa, null, 'MARÍA SANTOS');
  assertEquals(result, true);
});

Deno.test('matchesConjuge - should match complex accent scenario', () => {
  // Real-world scenario: RG has one format, certificate has another
  const pessoa: PessoaNatural = {
    nome: 'CÍNTIA APARECIDA DE CASTRO DIAS',
  };
  // Certificate with different accent pattern
  const result = matchesConjuge(pessoa, null, 'CINTIA APARECIDA DE CASTRO');
  assertEquals(result, true);
});

Deno.test('mapMarriageCertificate - should handle multiple accent differences', () => {
  const alienantes = new Map<string, PessoaNatural>();
  const adquirentes = new Map<string, PessoaNatural>();
  const alertas: unknown[] = [];

  // Pessoa with various accents
  alienantes.set('nome:JOSÉ ANTÔNIO DA CONCEIÇÃO', {
    nome: 'JOSÉ ANTÔNIO DA CONCEIÇÃO',
  });

  // Certificate without accents
  const dados = {
    conjuge_1: {
      nome: 'JOSE ANTONIO DA CONCEICAO',
    },
    conjuge_2: {
      nome: 'ANA BEATRIZ',
    },
    regime_bens: 'comunhao_parcial',
    data_casamento: '2010-05-20',
  };

  mapMarriageCertificate(dados, 'certidao.pdf', alienantes, adquirentes, alertas);

  const jose = alienantes.get('nome:JOSÉ ANTÔNIO DA CONCEIÇÃO');
  assertExists(jose);
  assertEquals(jose.estado_civil, 'casado');
  assertEquals(jose.conjuge, 'ANA BEATRIZ');
});
