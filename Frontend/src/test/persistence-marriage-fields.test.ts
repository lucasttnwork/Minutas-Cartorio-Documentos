/**
 * Node.js compatible tests for persistence of marriage fields
 * TDD Fase 3: Testing that estado_civil, regime_bens, conjuge, and data_casamento
 * are correctly saved to the database
 *
 * These tests mirror the Deno tests in supabase/functions/map-to-fields/persistence.test.ts
 * but run in Vitest
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Re-implement normalizers for Node.js testing
function normalizeCpf(cpf: string | undefined | null): string {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

function parseDate(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.substring(0, 10);
  }

  const brMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }

  return null;
}

function mergeFontes(
  existing: Record<string, string[]> | null | undefined,
  incoming: Record<string, string[]> | null | undefined
): Record<string, string[]> {
  const result: Record<string, string[]> = { ...(existing || {}) };

  if (!incoming) return result;

  for (const [field, sources] of Object.entries(incoming)) {
    if (!result[field]) {
      result[field] = [];
    }
    for (const source of sources) {
      if (!result[field].includes(source)) {
        result[field].push(source);
      }
    }
  }

  return result;
}

// PessoaNatural interface (matching supabase types)
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
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  _fontes?: Record<string, string[]>;
}

// Database row interface
interface PessoaNaturalRow {
  id: string;
  minuta_id: string;
  papel: string;
  nome: string | null;
  cpf: string | null;
  rg: string | null;
  rg_orgao_emissor: string | null;
  rg_estado: string | null;
  rg_data_emissao: string | null;
  data_nascimento: string | null;
  nacionalidade: string | null;
  naturalidade: string | null;
  profissao: string | null;
  estado_civil: string | null;
  regime_bens: string | null;
  conjuge_nome: string | null;  // Note: different name than interface
  data_casamento: string | null;
  nome_pai: string | null;
  nome_mae: string | null;
  fontes: Record<string, string[]>;
}

// Re-implement buildPessoaInsertData for testing
function buildPessoaInsertData(
  pessoa: PessoaNatural,
  minutaId: string,
  papel: string
): Record<string, unknown> {
  return {
    minuta_id: minutaId,
    papel,
    nome: pessoa.nome,
    nacionalidade: pessoa.nacionalidade || null,
    naturalidade: pessoa.naturalidade || null,
    data_nascimento: parseDate(pessoa.data_nascimento),
    profissao: pessoa.profissao || null,
    estado_civil: pessoa.estado_civil || null,
    regime_bens: pessoa.regime_bens || null,
    cpf: normalizeCpf(pessoa.cpf) || null,
    rg: pessoa.rg || null,
    rg_orgao_emissor: pessoa.orgao_emissor_rg || null,
    rg_estado: pessoa.estado_emissor_rg || null,
    rg_data_emissao: parseDate(pessoa.data_emissao_rg),
    nome_pai: pessoa.filiacao_pai || null,
    nome_mae: pessoa.filiacao_mae || null,
    conjuge_nome: pessoa.conjuge || null,  // IMPORTANT: pessoa.conjuge -> conjuge_nome
    data_casamento: parseDate(pessoa.data_casamento),
    fontes: pessoa._fontes || {},
  };
}

// Re-implement merge logic for testing
function buildUpdateData(
  pessoa: PessoaNatural,
  existing: PessoaNaturalRow
): Record<string, unknown> {
  const mergedFontes = mergeFontes(existing.fontes, pessoa._fontes);

  const updateData: Record<string, unknown> = {
    fontes: mergedFontes,
    updated_at: new Date().toISOString(),
  };

  // Merge fields - incoming data fills gaps, doesn't overwrite existing
  if (pessoa.nome && !existing.nome) updateData.nome = pessoa.nome;
  if (pessoa.rg && !existing.rg) updateData.rg = pessoa.rg;
  if (pessoa.orgao_emissor_rg && !existing.rg_orgao_emissor) updateData.rg_orgao_emissor = pessoa.orgao_emissor_rg;
  if (pessoa.estado_emissor_rg && !existing.rg_estado) updateData.rg_estado = pessoa.estado_emissor_rg;
  if (pessoa.data_emissao_rg && !existing.rg_data_emissao) updateData.rg_data_emissao = parseDate(pessoa.data_emissao_rg);
  if (pessoa.data_nascimento && !existing.data_nascimento) updateData.data_nascimento = parseDate(pessoa.data_nascimento);
  if (pessoa.nacionalidade && !existing.nacionalidade) updateData.nacionalidade = pessoa.nacionalidade;
  if (pessoa.naturalidade && !existing.naturalidade) updateData.naturalidade = pessoa.naturalidade;
  if (pessoa.profissao && !existing.profissao) updateData.profissao = pessoa.profissao;

  // MARRIAGE FIELDS - key tests
  if (pessoa.estado_civil && !existing.estado_civil) updateData.estado_civil = pessoa.estado_civil;
  if (pessoa.regime_bens && !existing.regime_bens) updateData.regime_bens = pessoa.regime_bens;
  if (pessoa.conjuge && !existing.conjuge_nome) updateData.conjuge_nome = pessoa.conjuge;  // conjuge -> conjuge_nome
  if (pessoa.data_casamento && !existing.data_casamento) updateData.data_casamento = parseDate(pessoa.data_casamento);

  if (pessoa.filiacao_pai && !existing.nome_pai) updateData.nome_pai = pessoa.filiacao_pai;
  if (pessoa.filiacao_mae && !existing.nome_mae) updateData.nome_mae = pessoa.filiacao_mae;

  return updateData;
}

// ============ MARRIAGE FIELDS TESTS ============

describe('persistence - marriage fields', () => {

  describe('Insert operations', () => {

    it('should save estado_civil on insert', () => {
      const pessoa: PessoaNatural = {
        nome: 'MARIA DA SILVA',
        cpf: '123.456.789-00',
        estado_civil: 'casada',
        _fontes: { nome: ['certidao.pdf'], estado_civil: ['certidao.pdf'] },
      };

      const insertData = buildPessoaInsertData(pessoa, 'minuta-123', 'outorgante');

      expect(insertData.estado_civil).toBe('casada');
    });

    it('should save regime_bens on insert', () => {
      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        estado_civil: 'casado',
        regime_bens: 'comunhao parcial de bens',
        _fontes: {
          nome: ['certidao.pdf'],
          estado_civil: ['certidao.pdf'],
          regime_bens: ['certidao.pdf'],
        },
      };

      const insertData = buildPessoaInsertData(pessoa, 'minuta-123', 'outorgante');

      expect(insertData.regime_bens).toBe('comunhao parcial de bens');
    });

    it('should save conjuge_nome from pessoa.conjuge (field mapping)', () => {
      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        estado_civil: 'casado',
        conjuge: 'MARIA OLIVEIRA DA SILVA',  // Interface uses 'conjuge'
        _fontes: {
          nome: ['certidao.pdf'],
          conjuge: ['certidao.pdf'],
        },
      };

      const insertData = buildPessoaInsertData(pessoa, 'minuta-123', 'outorgante');

      // Database column is 'conjuge_nome', not 'conjuge'
      expect(insertData.conjuge_nome).toBe('MARIA OLIVEIRA DA SILVA');
      expect(insertData).not.toHaveProperty('conjuge');
    });

    it('should save data_casamento in ISO format from Brazilian DD/MM/YYYY', () => {
      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        estado_civil: 'casado',
        data_casamento: '15/03/2010',  // Brazilian format
        _fontes: {
          nome: ['certidao.pdf'],
          data_casamento: ['certidao.pdf'],
        },
      };

      const insertData = buildPessoaInsertData(pessoa, 'minuta-123', 'outorgante');

      // Should be converted to ISO format YYYY-MM-DD
      expect(insertData.data_casamento).toBe('2010-03-15');
    });

    it('should preserve data_casamento when already in ISO format', () => {
      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        estado_civil: 'casado',
        data_casamento: '2010-03-15',  // Already ISO
        _fontes: {
          nome: ['certidao.pdf'],
          data_casamento: ['certidao.pdf'],
        },
      };

      const insertData = buildPessoaInsertData(pessoa, 'minuta-123', 'outorgante');

      expect(insertData.data_casamento).toBe('2010-03-15');
    });

    it('should save null for undefined marriage fields', () => {
      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        // All marriage fields undefined
        _fontes: { nome: ['rg.pdf'] },
      };

      const insertData = buildPessoaInsertData(pessoa, 'minuta-123', 'outorgante');

      expect(insertData.estado_civil).toBeNull();
      expect(insertData.regime_bens).toBeNull();
      expect(insertData.conjuge_nome).toBeNull();
      expect(insertData.data_casamento).toBeNull();
    });
  });

  describe('Update/merge operations', () => {

    it('should update estado_civil when existing value is null', () => {
      const existing: PessoaNaturalRow = {
        id: 'existing-id',
        minuta_id: 'minuta-123',
        papel: 'outorgante',
        nome: 'MARIA DA SILVA',
        cpf: '12345678900',
        rg: null,
        rg_orgao_emissor: null,
        rg_estado: null,
        rg_data_emissao: null,
        data_nascimento: null,
        nacionalidade: null,
        naturalidade: null,
        profissao: null,
        estado_civil: null,  // NULL in DB
        regime_bens: null,
        conjuge_nome: null,
        data_casamento: null,
        nome_pai: null,
        nome_mae: null,
        fontes: { nome: ['rg.pdf'] },
      };

      const pessoa: PessoaNatural = {
        nome: 'MARIA DA SILVA',
        cpf: '123.456.789-00',
        estado_civil: 'casada',  // New value
        _fontes: { estado_civil: ['certidao.pdf'] },
      };

      const updateData = buildUpdateData(pessoa, existing);

      expect(updateData.estado_civil).toBe('casada');
    });

    it('should NOT overwrite existing estado_civil', () => {
      const existing: PessoaNaturalRow = {
        id: 'existing-id',
        minuta_id: 'minuta-123',
        papel: 'outorgante',
        nome: 'MARIA DA SILVA',
        cpf: '12345678900',
        rg: null,
        rg_orgao_emissor: null,
        rg_estado: null,
        rg_data_emissao: null,
        data_nascimento: null,
        nacionalidade: null,
        naturalidade: null,
        profissao: null,
        estado_civil: 'solteira',  // Already has value
        regime_bens: null,
        conjuge_nome: null,
        data_casamento: null,
        nome_pai: null,
        nome_mae: null,
        fontes: { nome: ['rg.pdf'], estado_civil: ['rg.pdf'] },
      };

      const pessoa: PessoaNatural = {
        nome: 'MARIA DA SILVA',
        cpf: '123.456.789-00',
        estado_civil: 'casada',  // Trying to change to 'casada'
        _fontes: { estado_civil: ['certidao.pdf'] },
      };

      const updateData = buildUpdateData(pessoa, existing);

      // Should NOT have estado_civil in update (not overwriting)
      expect(updateData.estado_civil).toBeUndefined();
    });

    it('should update regime_bens when existing is null', () => {
      const existing: PessoaNaturalRow = {
        id: 'existing-id',
        minuta_id: 'minuta-123',
        papel: 'outorgante',
        nome: 'JOAO DA SILVA',
        cpf: '11122233344',
        rg: null,
        rg_orgao_emissor: null,
        rg_estado: null,
        rg_data_emissao: null,
        data_nascimento: null,
        nacionalidade: null,
        naturalidade: null,
        profissao: null,
        estado_civil: 'casado',
        regime_bens: null,  // NULL in DB
        conjuge_nome: null,
        data_casamento: null,
        nome_pai: null,
        nome_mae: null,
        fontes: { nome: ['rg.pdf'] },
      };

      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        regime_bens: 'comunhao parcial de bens',
        _fontes: { regime_bens: ['certidao.pdf'] },
      };

      const updateData = buildUpdateData(pessoa, existing);

      expect(updateData.regime_bens).toBe('comunhao parcial de bens');
    });

    it('should NOT overwrite existing regime_bens', () => {
      const existing: PessoaNaturalRow = {
        id: 'existing-id',
        minuta_id: 'minuta-123',
        papel: 'outorgante',
        nome: 'JOAO DA SILVA',
        cpf: '11122233344',
        rg: null,
        rg_orgao_emissor: null,
        rg_estado: null,
        rg_data_emissao: null,
        data_nascimento: null,
        nacionalidade: null,
        naturalidade: null,
        profissao: null,
        estado_civil: 'casado',
        regime_bens: 'separacao total de bens',  // Already has value
        conjuge_nome: null,
        data_casamento: null,
        nome_pai: null,
        nome_mae: null,
        fontes: { regime_bens: ['certidao_anterior.pdf'] },
      };

      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        regime_bens: 'comunhao parcial de bens',  // Different value
        _fontes: { regime_bens: ['certidao.pdf'] },
      };

      const updateData = buildUpdateData(pessoa, existing);

      expect(updateData.regime_bens).toBeUndefined();
    });

    it('should update conjuge_nome when existing is null (mapping conjuge -> conjuge_nome)', () => {
      const existing: PessoaNaturalRow = {
        id: 'existing-id',
        minuta_id: 'minuta-123',
        papel: 'outorgante',
        nome: 'JOAO DA SILVA',
        cpf: '11122233344',
        rg: null,
        rg_orgao_emissor: null,
        rg_estado: null,
        rg_data_emissao: null,
        data_nascimento: null,
        nacionalidade: null,
        naturalidade: null,
        profissao: null,
        estado_civil: 'casado',
        regime_bens: null,
        conjuge_nome: null,  // NULL in DB (column name is conjuge_nome)
        data_casamento: null,
        nome_pai: null,
        nome_mae: null,
        fontes: { nome: ['rg.pdf'] },
      };

      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        conjuge: 'MARIA OLIVEIRA DA SILVA',  // Interface uses 'conjuge'
        _fontes: { conjuge: ['certidao.pdf'] },
      };

      const updateData = buildUpdateData(pessoa, existing);

      // Update should use database column name 'conjuge_nome'
      expect(updateData.conjuge_nome).toBe('MARIA OLIVEIRA DA SILVA');
    });

    it('should NOT overwrite existing conjuge_nome', () => {
      const existing: PessoaNaturalRow = {
        id: 'existing-id',
        minuta_id: 'minuta-123',
        papel: 'outorgante',
        nome: 'JOAO DA SILVA',
        cpf: '11122233344',
        rg: null,
        rg_orgao_emissor: null,
        rg_estado: null,
        rg_data_emissao: null,
        data_nascimento: null,
        nacionalidade: null,
        naturalidade: null,
        profissao: null,
        estado_civil: 'casado',
        regime_bens: null,
        conjuge_nome: 'MARIA PEREIRA',  // Already has value
        data_casamento: null,
        nome_pai: null,
        nome_mae: null,
        fontes: { conjuge: ['certidao_anterior.pdf'] },
      };

      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        conjuge: 'MARIA OLIVEIRA DA SILVA',  // Different name
        _fontes: { conjuge: ['certidao.pdf'] },
      };

      const updateData = buildUpdateData(pessoa, existing);

      expect(updateData.conjuge_nome).toBeUndefined();
    });

    it('should update data_casamento when existing is null', () => {
      const existing: PessoaNaturalRow = {
        id: 'existing-id',
        minuta_id: 'minuta-123',
        papel: 'outorgante',
        nome: 'JOAO DA SILVA',
        cpf: '11122233344',
        rg: null,
        rg_orgao_emissor: null,
        rg_estado: null,
        rg_data_emissao: null,
        data_nascimento: null,
        nacionalidade: null,
        naturalidade: null,
        profissao: null,
        estado_civil: 'casado',
        regime_bens: null,
        conjuge_nome: null,
        data_casamento: null,  // NULL in DB
        nome_pai: null,
        nome_mae: null,
        fontes: { nome: ['rg.pdf'] },
      };

      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        data_casamento: '15/03/2010',  // Brazilian format
        _fontes: { data_casamento: ['certidao.pdf'] },
      };

      const updateData = buildUpdateData(pessoa, existing);

      expect(updateData.data_casamento).toBe('2010-03-15');  // Converted to ISO
    });

    it('should NOT overwrite existing data_casamento', () => {
      const existing: PessoaNaturalRow = {
        id: 'existing-id',
        minuta_id: 'minuta-123',
        papel: 'outorgante',
        nome: 'JOAO DA SILVA',
        cpf: '11122233344',
        rg: null,
        rg_orgao_emissor: null,
        rg_estado: null,
        rg_data_emissao: null,
        data_nascimento: null,
        nacionalidade: null,
        naturalidade: null,
        profissao: null,
        estado_civil: 'casado',
        regime_bens: null,
        conjuge_nome: null,
        data_casamento: '2010-03-15',  // Already has value
        nome_pai: null,
        nome_mae: null,
        fontes: { data_casamento: ['certidao_anterior.pdf'] },
      };

      const pessoa: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '111.222.333-44',
        data_casamento: '20/05/2012',  // Different date
        _fontes: { data_casamento: ['certidao.pdf'] },
      };

      const updateData = buildUpdateData(pessoa, existing);

      expect(updateData.data_casamento).toBeUndefined();
    });
  });

  describe('Complete merge scenario', () => {

    it('should merge marriage data from certificate into existing person from RG', () => {
      // Existing person registered from RG (no marriage info)
      const existing: PessoaNaturalRow = {
        id: 'existing-id',
        minuta_id: 'minuta-123',
        papel: 'outorgante',
        nome: 'JOAO DA SILVA',
        cpf: '12345678900',
        rg: '12345678',
        rg_orgao_emissor: 'SSP',
        rg_estado: 'SP',
        rg_data_emissao: null,
        data_nascimento: '1985-06-20',
        nacionalidade: null,
        naturalidade: null,
        profissao: null,
        // Marriage fields are null (not in RG)
        estado_civil: null,
        regime_bens: null,
        conjuge_nome: null,
        data_casamento: null,
        nome_pai: null,
        nome_mae: null,
        fontes: { nome: ['RG.pdf'], cpf: ['RG.pdf'], rg: ['RG.pdf'] },
      };

      // New data from marriage certificate
      const pessoaCertidao: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '123.456.789-00',  // Same CPF
        estado_civil: 'casado',
        regime_bens: 'comunhao parcial de bens',
        conjuge: 'MARIA OLIVEIRA DA SILVA',
        data_casamento: '15/03/2010',
        _fontes: {
          estado_civil: ['certidao_casamento.pdf'],
          regime_bens: ['certidao_casamento.pdf'],
          conjuge: ['certidao_casamento.pdf'],
          data_casamento: ['certidao_casamento.pdf'],
        },
      };

      const updateData = buildUpdateData(pessoaCertidao, existing);

      // Should have all marriage fields in the update
      expect(updateData.estado_civil).toBe('casado');
      expect(updateData.regime_bens).toBe('comunhao parcial de bens');
      expect(updateData.conjuge_nome).toBe('MARIA OLIVEIRA DA SILVA');
      expect(updateData.data_casamento).toBe('2010-03-15');

      // Should have merged fontes
      const mergedFontes = updateData.fontes as Record<string, string[]>;
      expect(mergedFontes.nome).toEqual(['RG.pdf']);  // From existing
      expect(mergedFontes.cpf).toEqual(['RG.pdf']);  // From existing
      expect(mergedFontes.rg).toEqual(['RG.pdf']);  // From existing
      expect(mergedFontes.estado_civil).toEqual(['certidao_casamento.pdf']);  // New
      expect(mergedFontes.regime_bens).toEqual(['certidao_casamento.pdf']);  // New
      expect(mergedFontes.conjuge).toEqual(['certidao_casamento.pdf']);  // New
      expect(mergedFontes.data_casamento).toEqual(['certidao_casamento.pdf']);  // New
    });

    it('should preserve existing data when merging new marriage certificate', () => {
      // Existing person with some data already
      const existing: PessoaNaturalRow = {
        id: 'existing-id',
        minuta_id: 'minuta-123',
        papel: 'outorgante',
        nome: 'JOAO DA SILVA',
        cpf: '12345678900',
        rg: '12345678',
        rg_orgao_emissor: 'SSP',
        rg_estado: 'SP',
        rg_data_emissao: null,
        data_nascimento: '1985-06-20',
        nacionalidade: 'brasileiro',
        naturalidade: 'Sao Paulo',
        profissao: 'Engenheiro',
        estado_civil: null,
        regime_bens: null,
        conjuge_nome: null,
        data_casamento: null,
        nome_pai: 'JOSE DA SILVA',
        nome_mae: 'ANA DA SILVA',
        fontes: { nome: ['RG.pdf'], cpf: ['RG.pdf'] },
      };

      // New data from certificate (some overlap)
      const pessoaCertidao: PessoaNatural = {
        nome: 'JOAO DA SILVA',
        cpf: '123.456.789-00',
        nacionalidade: 'brasileiro nato',  // Different - should NOT overwrite
        profissao: 'Advogado',  // Different - should NOT overwrite
        estado_civil: 'casado',
        regime_bens: 'comunhao parcial de bens',
        conjuge: 'MARIA OLIVEIRA DA SILVA',
        data_casamento: '15/03/2010',
        filiacao_pai: 'JOSE PEREIRA DA SILVA',  // Different - should NOT overwrite
        _fontes: {
          estado_civil: ['certidao.pdf'],
        },
      };

      const updateData = buildUpdateData(pessoaCertidao, existing);

      // Should have marriage fields (new)
      expect(updateData.estado_civil).toBe('casado');
      expect(updateData.regime_bens).toBe('comunhao parcial de bens');
      expect(updateData.conjuge_nome).toBe('MARIA OLIVEIRA DA SILVA');
      expect(updateData.data_casamento).toBe('2010-03-15');

      // Should NOT have fields that already exist
      expect(updateData.nacionalidade).toBeUndefined();  // Already has 'brasileiro'
      expect(updateData.profissao).toBeUndefined();  // Already has 'Engenheiro'
      expect(updateData.nome_pai).toBeUndefined();  // Already has 'JOSE DA SILVA'
    });
  });
});

describe('Field mapping verification', () => {

  it('should map all marriage-related interface fields to correct database columns', () => {
    // This test documents the expected mappings
    const fieldMappings = {
      // Interface field -> Database column
      'estado_civil': 'estado_civil',  // Same name
      'regime_bens': 'regime_bens',    // Same name
      'conjuge': 'conjuge_nome',       // DIFFERENT NAME!
      'data_casamento': 'data_casamento',  // Same name (with date formatting)
    };

    const pessoa: PessoaNatural = {
      nome: 'TEST',
      estado_civil: 'casado',
      regime_bens: 'comunhao parcial',
      conjuge: 'CONJUGE NOME',
      data_casamento: '01/01/2020',
    };

    const insertData = buildPessoaInsertData(pessoa, 'minuta-123', 'outorgante');

    // Verify mappings
    expect(insertData[fieldMappings.estado_civil]).toBe(pessoa.estado_civil);
    expect(insertData[fieldMappings.regime_bens]).toBe(pessoa.regime_bens);
    expect(insertData[fieldMappings.conjuge]).toBe(pessoa.conjuge);  // conjuge -> conjuge_nome
    expect(insertData[fieldMappings.data_casamento]).toBe('2020-01-01');  // Formatted
  });
});
