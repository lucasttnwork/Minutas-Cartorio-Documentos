/**
 * Node.js compatible tests for persistence normalizers
 * These mirror the Deno tests but run in Vitest
 */

import { describe, it, expect } from 'vitest';

// Re-implement normalizers for Node.js testing
// These are the same functions from supabase/functions/map-to-fields/normalizers.ts

function normalizeCpf(cpf: string | undefined | null): string {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

function normalizeCnpj(cnpj: string | undefined | null): string {
  if (!cnpj) return '';
  return cnpj.replace(/\D/g, '');
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

function parseCurrency(value: string | number | undefined | null): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === 'number') return value;

  // Check if it's Brazilian format (has R$ or uses comma as decimal separator)
  const isBrazilianFormat = value.includes('R$') || (value.includes(',') && value.includes('.'));

  let cleaned = value.replace(/R\$\s?/g, '').replace(/\s/g, '');

  if (isBrazilianFormat) {
    // Brazilian format: 1.234.567,89 -> 1234567.89
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (value.includes(',') && !value.includes('.')) {
    // Simple comma decimal: 500,00 -> 500.00
    cleaned = cleaned.replace(',', '.');
  }
  // Otherwise, assume it's already in standard format (1234.56)

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
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

function parseArea(area: string | number | undefined | null): number | null {
  if (area === null || area === undefined) return null;

  if (typeof area === 'number') return area;

  const cleaned = area
    .replace(/m[2\u00B2]?\s?/gi, '')
    .replace(/\s/g, '')
    .replace(',', '.');

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Tests

describe('normalizeCpf', () => {
  it('removes formatting from CPF', () => {
    expect(normalizeCpf('123.456.789-00')).toBe('12345678900');
    expect(normalizeCpf('12345678900')).toBe('12345678900');
  });

  it('handles null/undefined/empty', () => {
    expect(normalizeCpf(null)).toBe('');
    expect(normalizeCpf(undefined)).toBe('');
    expect(normalizeCpf('')).toBe('');
  });
});

describe('normalizeCnpj', () => {
  it('removes formatting from CNPJ', () => {
    expect(normalizeCnpj('12.345.678/0001-00')).toBe('12345678000100');
    expect(normalizeCnpj('12345678000100')).toBe('12345678000100');
  });

  it('handles null/undefined', () => {
    expect(normalizeCnpj(null)).toBe('');
    expect(normalizeCnpj(undefined)).toBe('');
  });
});

describe('mergeFontes', () => {
  it('combines sources without duplicates', () => {
    const existing = { nome: ['RG.pdf'], cpf: ['RG.pdf'] };
    const incoming = { nome: ['CNH.pdf'], cpf: ['RG.pdf', 'CNH.pdf'], rg: ['CNH.pdf'] };

    const result = mergeFontes(existing, incoming);

    expect(result.nome).toEqual(['RG.pdf', 'CNH.pdf']);
    expect(result.cpf).toEqual(['RG.pdf', 'CNH.pdf']);
    expect(result.rg).toEqual(['CNH.pdf']);
  });

  it('handles null existing', () => {
    const incoming = { nome: ['RG.pdf'] };
    const result = mergeFontes(null, incoming);
    expect(result.nome).toEqual(['RG.pdf']);
  });

  it('handles null incoming', () => {
    const existing = { nome: ['RG.pdf'] };
    const result = mergeFontes(existing, null);
    expect(result.nome).toEqual(['RG.pdf']);
  });

  it('handles both null', () => {
    const result = mergeFontes(null, null);
    expect(result).toEqual({});
  });
});

describe('parseCurrency', () => {
  it('parses Brazilian currency format', () => {
    expect(parseCurrency('R$ 1.234.567,89')).toBe(1234567.89);
    expect(parseCurrency('R$ 500,00')).toBe(500);
    expect(parseCurrency('1234.56')).toBe(1234.56);
  });

  it('handles numeric input', () => {
    expect(parseCurrency(1234.56)).toBe(1234.56);
  });

  it('handles null/undefined', () => {
    expect(parseCurrency(null)).toBeNull();
    expect(parseCurrency(undefined)).toBeNull();
  });

  it('handles invalid strings', () => {
    expect(parseCurrency('invalid')).toBeNull();
  });
});

describe('parseDate', () => {
  it('parses Brazilian date format DD/MM/YYYY', () => {
    expect(parseDate('31/12/2025')).toBe('2025-12-31');
    expect(parseDate('01/01/2026')).toBe('2026-01-01');
  });

  it('parses ISO date format', () => {
    expect(parseDate('2025-12-31')).toBe('2025-12-31');
    expect(parseDate('2025-12-31T10:00:00Z')).toBe('2025-12-31');
  });

  it('handles null/undefined', () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
  });

  it('handles invalid date strings', () => {
    expect(parseDate('invalid')).toBeNull();
  });
});

describe('parseArea', () => {
  it('parses area with units', () => {
    expect(parseArea('123,45 m2')).toBe(123.45);
    expect(parseArea('100m2')).toBe(100);
    expect(parseArea('50.5')).toBe(50.5);
  });

  it('handles numeric input', () => {
    expect(parseArea(123.45)).toBe(123.45);
  });

  it('handles null/undefined', () => {
    expect(parseArea(null)).toBeNull();
    expect(parseArea(undefined)).toBeNull();
  });
});

// Persistence logic tests (mocked)

describe('Persistence Logic', () => {
  describe('Deduplication', () => {
    it('should identify duplicate by normalized CPF', () => {
      const cpf1 = '123.456.789-00';
      const cpf2 = '12345678900';

      expect(normalizeCpf(cpf1)).toBe(normalizeCpf(cpf2));
    });

    it('should handle CPFs with different formatting', () => {
      const cpfs = [
        '123.456.789-00',
        '123456789-00',
        '12345678900',
        '123.456.78900',
      ];

      const normalized = cpfs.map(normalizeCpf);
      expect(new Set(normalized).size).toBe(1);
      expect(normalized[0]).toBe('12345678900');
    });
  });

  describe('Source Tracking', () => {
    it('should accumulate sources from multiple documents', () => {
      // Simulate processing RG document
      let fontes: Record<string, string[]> = {};
      fontes = mergeFontes(fontes, { nome: ['RG.pdf'], cpf: ['RG.pdf'] });

      // Simulate processing CNH document
      fontes = mergeFontes(fontes, { cpf: ['CNH.pdf'], foto: ['CNH.pdf'] });

      // Simulate processing certidao
      fontes = mergeFontes(fontes, { nome: ['certidao.pdf'], estado_civil: ['certidao.pdf'] });

      expect(fontes.nome).toEqual(['RG.pdf', 'certidao.pdf']);
      expect(fontes.cpf).toEqual(['RG.pdf', 'CNH.pdf']);
      expect(fontes.foto).toEqual(['CNH.pdf']);
      expect(fontes.estado_civil).toEqual(['certidao.pdf']);
    });
  });
});
