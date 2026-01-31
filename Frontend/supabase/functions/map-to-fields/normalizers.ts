/**
 * Normalizers and utility functions for data persistence
 * Used for deduplication, source tracking, and data formatting
 */

/**
 * Normalizes CPF by removing all non-digit characters
 * @param cpf - CPF string in any format
 * @returns Normalized CPF with only digits, or empty string if invalid
 */
export function normalizeCpf(cpf: string | undefined | null): string {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

/**
 * Normalizes CNPJ by removing all non-digit characters
 * @param cnpj - CNPJ string in any format
 * @returns Normalized CNPJ with only digits, or empty string if invalid
 */
export function normalizeCnpj(cnpj: string | undefined | null): string {
  if (!cnpj) return '';
  return cnpj.replace(/\D/g, '');
}

/**
 * Merges two fonte tracking objects
 * Combines arrays of sources for each field without duplicates
 * @param existing - Current fontes object from database
 * @param incoming - New fontes from mapping
 * @returns Merged fontes object
 */
export function mergeFontes(
  existing: Record<string, string[]> | null | undefined,
  incoming: Record<string, string[]> | null | undefined
): Record<string, string[]> {
  const result: Record<string, string[]> = { ...(existing || {}) };

  if (!incoming) return result;

  for (const [field, sources] of Object.entries(incoming)) {
    if (!result[field]) {
      result[field] = [];
    }
    // Add sources without duplicates
    for (const source of sources) {
      if (!result[field].includes(source)) {
        result[field].push(source);
      }
    }
  }

  return result;
}

/**
 * Parses currency string to numeric value
 * Handles formats like "R$ 1.234.567,89" or "1234.56"
 * @param value - Currency string or number
 * @returns Number value or null if invalid
 */
export function parseCurrency(value: string | number | undefined | null): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === 'number') return value;

  // Check if it's Brazilian format (has R$ or uses comma as decimal separator with dot as thousands)
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

/**
 * Parses date string to ISO format
 * Handles DD/MM/YYYY and YYYY-MM-DD formats
 * @param dateStr - Date string in various formats
 * @returns ISO date string (YYYY-MM-DD) or null if invalid
 */
export function parseDate(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;

  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.substring(0, 10);
  }

  // Brazilian format DD/MM/YYYY
  const brMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }

  return null;
}

/**
 * Parses area string to numeric value
 * Handles formats like "123,45 m2" or "123.45"
 * @param area - Area string
 * @returns Number value or null if invalid
 */
export function parseArea(area: string | number | undefined | null): number | null {
  if (area === null || area === undefined) return null;

  if (typeof area === 'number') return area;

  // Remove unit and clean up
  const cleaned = area
    .replace(/m[2\u00B2]?\s?/gi, '')
    .replace(/\s/g, '')
    .replace(',', '.');

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
