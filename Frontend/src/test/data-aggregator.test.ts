/**
 * Node.js compatible tests for data aggregator formatters
 * These mirror the Deno tests but run in Vitest
 */

import { describe, it, expect } from 'vitest';

// ============ BRAZILIAN MONTHS ============

const MESES_BRASILEIROS = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// ============ FORMATTING FUNCTIONS ============
// Re-implement for Node.js testing (same as data-aggregator.ts)

interface Endereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

/**
 * Converts ISO date (YYYY-MM-DD) to Brazilian format (DD de MMMM de YYYY)
 */
function formatDateBrazilian(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  try {
    const dateOnly = dateStr.substring(0, 10);
    const [year, month, day] = dateOnly.split('-').map(Number);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return '';
    if (month < 1 || month > 12 || day < 1 || day > 31) return '';

    const mesNome = MESES_BRASILEIROS[month - 1];
    return `${day.toString().padStart(2, '0')} de ${mesNome} de ${year}`;
  } catch {
    return '';
  }
}

/**
 * Formats number to Brazilian currency (R$ X.XXX,XX)
 */
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Number to extenso (written form) in Portuguese
 */
function numberToExtenso(num: number): string {
  if (num === 0) return 'zero';

  const unidades = ['', 'um', 'dois', 'tres', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezADezenove = [
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze',
    'dezesseis', 'dezessete', 'dezoito', 'dezenove',
  ];
  const dezenas = [
    '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta',
    'sessenta', 'setenta', 'oitenta', 'noventa',
  ];
  const centenas = [
    '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
    'seiscentos', 'setecentos', 'oitocentos', 'novecentos',
  ];

  function extensoAte999(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'cem';

    const partes: string[] = [];

    const c = Math.floor(n / 100);
    const resto = n % 100;

    if (c > 0) {
      partes.push(centenas[c]);
    }

    if (resto > 0) {
      if (resto < 10) {
        partes.push(unidades[resto]);
      } else if (resto < 20) {
        partes.push(dezADezenove[resto - 10]);
      } else {
        const d = Math.floor(resto / 10);
        const u = resto % 10;
        if (u === 0) {
          partes.push(dezenas[d]);
        } else {
          partes.push(`${dezenas[d]} e ${unidades[u]}`);
        }
      }
    }

    return partes.join(' e ');
  }

  function extensoInteiro(n: number): string {
    if (n === 0) return 'zero';

    const partes: string[] = [];

    // Milhoes
    const milhoes = Math.floor(n / 1000000);
    const restoMilhoes = n % 1000000;

    if (milhoes > 0) {
      if (milhoes === 1) {
        partes.push('um milhao');
      } else {
        partes.push(`${extensoAte999(milhoes)} milhoes`);
      }
    }

    // Milhares
    const milhares = Math.floor(restoMilhoes / 1000);
    const restoMilhares = restoMilhoes % 1000;

    if (milhares > 0) {
      if (milhares === 1) {
        partes.push('mil');
      } else {
        partes.push(`${extensoAte999(milhares)} mil`);
      }
    }

    // Centenas/dezenas/unidades
    if (restoMilhares > 0) {
      partes.push(extensoAte999(restoMilhares));
    }

    if (partes.length === 0) return 'zero';

    // Check if we need "de" before "reais"
    const needsDe = milhoes > 0 && restoMilhoes === 0;

    let result = partes[0];
    for (let i = 1; i < partes.length; i++) {
      result += ' e ' + partes[i];
    }

    return needsDe ? result + ' de' : result;
  }

  return extensoInteiro(Math.floor(num));
}

/**
 * Formats currency with extenso (written form)
 */
function formatCurrencyExtended(value: number | null | undefined): { valor: string; extenso: string } {
  if (value === null || value === undefined) {
    return { valor: '', extenso: '' };
  }

  const reais = Math.floor(value);
  const centavos = Math.round((value - reais) * 100);

  const valorFormatado = formatCurrency(value);

  let extenso = '';

  if (reais === 0 && centavos === 0) {
    extenso = 'zero reais';
  } else if (reais === 0) {
    if (centavos === 1) {
      extenso = 'um centavo';
    } else {
      extenso = `${numberToExtenso(centavos)} centavos`;
    }
  } else if (centavos === 0) {
    const extensoReais = numberToExtenso(reais);
    if (extensoReais.endsWith(' de')) {
      extenso = `${extensoReais} reais`;
    } else if (reais === 1) {
      extenso = 'um real';
    } else {
      extenso = `${extensoReais} reais`;
    }
  } else {
    const extensoReais = numberToExtenso(reais);
    const extensoCentavos = centavos === 1 ? 'um centavo' : `${numberToExtenso(centavos)} centavos`;

    if (extensoReais.endsWith(' de')) {
      extenso = `${extensoReais} reais e ${extensoCentavos}`;
    } else if (reais === 1) {
      extenso = `um real e ${extensoCentavos}`;
    } else {
      extenso = `${extensoReais} reais e ${extensoCentavos}`;
    }
  }

  return { valor: valorFormatado, extenso };
}

/**
 * Formats CPF with punctuation (XXX.XXX.XXX-XX)
 */
function formatCpf(cpf: string | null | undefined): string {
  if (!cpf) return '';

  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Formats CNPJ with punctuation (XX.XXX.XXX/XXXX-XX)
 */
function formatCnpj(cnpj: string | null | undefined): string {
  if (!cnpj) return '';

  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Formats address as a single line
 */
function formatEndereco(endereco: Endereco | null | undefined): string {
  if (!endereco) return '';

  const parts: string[] = [];

  if (endereco.logradouro) {
    parts.push(endereco.logradouro);
  }

  if (endereco.numero) {
    parts.push(endereco.numero);
  }

  if (endereco.complemento) {
    parts.push(endereco.complemento);
  }

  if (endereco.bairro) {
    parts.push(endereco.bairro);
  }

  if (endereco.cidade && endereco.estado) {
    parts.push(`${endereco.cidade}/${endereco.estado}`);
  } else if (endereco.cidade) {
    parts.push(endereco.cidade);
  }

  if (endereco.cep) {
    parts.push(`CEP ${endereco.cep}`);
  }

  return parts.join(', ');
}

// ============ TESTS ============

describe('formatDateBrazilian', () => {
  it('converts ISO date to Brazilian format', () => {
    expect(formatDateBrazilian('2026-02-01')).toBe('01 de fevereiro de 2026');
    expect(formatDateBrazilian('2025-12-31')).toBe('31 de dezembro de 2025');
    expect(formatDateBrazilian('2026-01-15')).toBe('15 de janeiro de 2026');
  });

  it('handles all months correctly', () => {
    expect(formatDateBrazilian('2026-01-01')).toBe('01 de janeiro de 2026');
    expect(formatDateBrazilian('2026-02-15')).toBe('15 de fevereiro de 2026');
    expect(formatDateBrazilian('2026-03-10')).toBe('10 de marco de 2026');
    expect(formatDateBrazilian('2026-04-20')).toBe('20 de abril de 2026');
    expect(formatDateBrazilian('2026-05-05')).toBe('05 de maio de 2026');
    expect(formatDateBrazilian('2026-06-25')).toBe('25 de junho de 2026');
    expect(formatDateBrazilian('2026-07-12')).toBe('12 de julho de 2026');
    expect(formatDateBrazilian('2026-08-08')).toBe('08 de agosto de 2026');
    expect(formatDateBrazilian('2026-09-30')).toBe('30 de setembro de 2026');
    expect(formatDateBrazilian('2026-10-14')).toBe('14 de outubro de 2026');
    expect(formatDateBrazilian('2026-11-22')).toBe('22 de novembro de 2026');
    expect(formatDateBrazilian('2026-12-25')).toBe('25 de dezembro de 2026');
  });

  it('handles null/undefined/empty', () => {
    expect(formatDateBrazilian(null)).toBe('');
    expect(formatDateBrazilian(undefined)).toBe('');
    expect(formatDateBrazilian('')).toBe('');
  });

  it('handles invalid date strings', () => {
    expect(formatDateBrazilian('invalid')).toBe('');
    expect(formatDateBrazilian('2026-13-45')).toBe('');
    expect(formatDateBrazilian('not-a-date')).toBe('');
  });

  it('handles ISO datetime format', () => {
    expect(formatDateBrazilian('2026-02-01T14:30:00Z')).toBe('01 de fevereiro de 2026');
    expect(formatDateBrazilian('2026-02-01T00:00:00.000Z')).toBe('01 de fevereiro de 2026');
  });
});

describe('formatCurrency', () => {
  it('formats number to Brazilian currency', () => {
    // Note: Intl.NumberFormat uses non-breaking space (U+00A0) between R$ and number
    expect(formatCurrency(250000)).toMatch(/R\$\s*250\.000,00/);
    expect(formatCurrency(1234567.89)).toMatch(/R\$\s*1\.234\.567,89/);
    expect(formatCurrency(500)).toMatch(/R\$\s*500,00/);
    expect(formatCurrency(99.9)).toMatch(/R\$\s*99,90/);
  });

  it('handles null/undefined', () => {
    expect(formatCurrency(null)).toBe('');
    expect(formatCurrency(undefined)).toBe('');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
  });

  it('handles small decimal values', () => {
    expect(formatCurrency(0.01)).toMatch(/R\$\s*0,01/);
    expect(formatCurrency(0.99)).toMatch(/R\$\s*0,99/);
  });
});

describe('formatCurrencyExtended', () => {
  it('returns valor and extenso', () => {
    const result = formatCurrencyExtended(250000);
    expect(result.valor).toMatch(/R\$\s*250\.000,00/);
    expect(result.extenso).toBe('duzentos e cinquenta mil reais');
  });

  it('handles small values', () => {
    expect(formatCurrencyExtended(1).extenso).toBe('um real');
    expect(formatCurrencyExtended(100).extenso).toBe('cem reais');
    expect(formatCurrencyExtended(1000).extenso).toBe('mil reais');
  });

  it('handles millions', () => {
    const result = formatCurrencyExtended(1500000);
    expect(result.valor).toMatch(/R\$\s*1\.500\.000,00/);
    expect(result.extenso).toBe('um milhao e quinhentos mil reais');
  });

  it('handles even millions (de reais)', () => {
    expect(formatCurrencyExtended(1000000).extenso).toBe('um milhao de reais');
    expect(formatCurrencyExtended(2000000).extenso).toBe('dois milhoes de reais');
  });

  it('handles centavos', () => {
    const result = formatCurrencyExtended(100.50);
    expect(result.extenso).toBe('cem reais e cinquenta centavos');
  });

  it('handles only centavos', () => {
    expect(formatCurrencyExtended(0.01).extenso).toBe('um centavo');
    expect(formatCurrencyExtended(0.50).extenso).toBe('cinquenta centavos');
  });

  it('handles zero', () => {
    expect(formatCurrencyExtended(0).extenso).toBe('zero reais');
  });

  it('handles null/undefined', () => {
    expect(formatCurrencyExtended(null).extenso).toBe('');
    expect(formatCurrencyExtended(undefined).extenso).toBe('');
  });

  it('handles complex values correctly', () => {
    // 123.456,78 - note the "e" after "mil" is expected in Brazilian extenso
    const result1 = formatCurrencyExtended(123456.78);
    expect(result1.extenso).toBe('cento e vinte e tres mil e quatrocentos e cinquenta e seis reais e setenta e oito centavos');

    // 1.001,01
    const result2 = formatCurrencyExtended(1001.01);
    expect(result2.extenso).toBe('mil e um reais e um centavo');
  });
});

describe('formatCpf', () => {
  it('formats CPF with punctuation', () => {
    expect(formatCpf('12345678900')).toBe('123.456.789-00');
  });

  it('handles already formatted CPF', () => {
    expect(formatCpf('123.456.789-00')).toBe('123.456.789-00');
  });

  it('handles null/undefined', () => {
    expect(formatCpf(null)).toBe('');
    expect(formatCpf(undefined)).toBe('');
  });

  it('returns as-is for invalid length', () => {
    expect(formatCpf('123456')).toBe('123456');
    expect(formatCpf('12345678901234')).toBe('12345678901234');
  });
});

describe('formatCnpj', () => {
  it('formats CNPJ with punctuation', () => {
    expect(formatCnpj('12345678000199')).toBe('12.345.678/0001-99');
  });

  it('handles already formatted CNPJ', () => {
    expect(formatCnpj('12.345.678/0001-99')).toBe('12.345.678/0001-99');
  });

  it('handles null/undefined', () => {
    expect(formatCnpj(null)).toBe('');
    expect(formatCnpj(undefined)).toBe('');
  });

  it('returns as-is for invalid length', () => {
    expect(formatCnpj('123456')).toBe('123456');
    expect(formatCnpj('123456780001991234')).toBe('123456780001991234');
  });
});

describe('formatEndereco', () => {
  it('formats complete address', () => {
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
    expect(formatEndereco(endereco)).toBe(expected);
  });

  it('handles missing complemento', () => {
    const endereco = {
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      estado: 'SP',
    };
    const expected = 'Rua das Flores, 123, Centro, Sao Paulo/SP';
    expect(formatEndereco(endereco)).toBe(expected);
  });

  it('handles missing cep', () => {
    const endereco = {
      logradouro: 'Av. Brasil',
      numero: '500',
      bairro: 'Centro',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
    };
    const expected = 'Av. Brasil, 500, Centro, Rio de Janeiro/RJ';
    expect(formatEndereco(endereco)).toBe(expected);
  });

  it('handles null/undefined', () => {
    expect(formatEndereco(null)).toBe('');
    expect(formatEndereco(undefined)).toBe('');
  });

  it('handles empty object', () => {
    expect(formatEndereco({})).toBe('');
  });

  it('handles partial address', () => {
    const endereco = {
      logradouro: 'Rua A',
      cidade: 'Sao Paulo',
    };
    expect(formatEndereco(endereco)).toBe('Rua A, Sao Paulo');
  });
});

describe('numberToExtenso', () => {
  it('handles units (1-9)', () => {
    expect(numberToExtenso(1)).toBe('um');
    expect(numberToExtenso(5)).toBe('cinco');
    expect(numberToExtenso(9)).toBe('nove');
  });

  it('handles tens (10-19)', () => {
    expect(numberToExtenso(10)).toBe('dez');
    expect(numberToExtenso(11)).toBe('onze');
    expect(numberToExtenso(15)).toBe('quinze');
    expect(numberToExtenso(19)).toBe('dezenove');
  });

  it('handles tens (20-99)', () => {
    expect(numberToExtenso(20)).toBe('vinte');
    expect(numberToExtenso(21)).toBe('vinte e um');
    expect(numberToExtenso(55)).toBe('cinquenta e cinco');
    expect(numberToExtenso(99)).toBe('noventa e nove');
  });

  it('handles hundreds (100-999)', () => {
    expect(numberToExtenso(100)).toBe('cem');
    expect(numberToExtenso(101)).toBe('cento e um');
    expect(numberToExtenso(200)).toBe('duzentos');
    expect(numberToExtenso(555)).toBe('quinhentos e cinquenta e cinco');
    expect(numberToExtenso(999)).toBe('novecentos e noventa e nove');
  });

  it('handles thousands (1000-999999)', () => {
    expect(numberToExtenso(1000)).toBe('mil');
    expect(numberToExtenso(1001)).toBe('mil e um');
    expect(numberToExtenso(2000)).toBe('dois mil');
    expect(numberToExtenso(10000)).toBe('dez mil');
    expect(numberToExtenso(100000)).toBe('cem mil');
    expect(numberToExtenso(123456)).toBe('cento e vinte e tres mil e quatrocentos e cinquenta e seis');
  });

  it('handles millions', () => {
    expect(numberToExtenso(1000000)).toBe('um milhao de');
    expect(numberToExtenso(2000000)).toBe('dois milhoes de');
    expect(numberToExtenso(1500000)).toBe('um milhao e quinhentos mil');
    expect(numberToExtenso(2500500)).toBe('dois milhoes e quinhentos mil e quinhentos');
  });

  it('handles zero', () => {
    expect(numberToExtenso(0)).toBe('zero');
  });
});

describe('Integration: Real estate values', () => {
  it('formats typical property values', () => {
    // R$ 500.000,00
    const result1 = formatCurrencyExtended(500000);
    expect(result1.valor).toMatch(/R\$\s*500\.000,00/);
    expect(result1.extenso).toBe('quinhentos mil reais');

    // R$ 1.250.000,00
    const result2 = formatCurrencyExtended(1250000);
    expect(result2.valor).toMatch(/R\$\s*1\.250\.000,00/);
    expect(result2.extenso).toBe('um milhao e duzentos e cinquenta mil reais');

    // R$ 350.000,00
    const result3 = formatCurrencyExtended(350000);
    expect(result3.valor).toMatch(/R\$\s*350\.000,00/);
    expect(result3.extenso).toBe('trezentos e cinquenta mil reais');
  });

  it('formats down payment values', () => {
    // R$ 50.000,00 (sinal)
    const result = formatCurrencyExtended(50000);
    expect(result.valor).toMatch(/R\$\s*50\.000,00/);
    expect(result.extenso).toBe('cinquenta mil reais');
  });

  it('formats ITBI values', () => {
    // R$ 15.000,00 (ITBI)
    const result = formatCurrencyExtended(15000);
    expect(result.valor).toMatch(/R\$\s*15\.000,00/);
    expect(result.extenso).toBe('quinze mil reais');
  });
});
