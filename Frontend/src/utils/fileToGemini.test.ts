// src/utils/fileToGemini.test.ts
// Testes unitários para utilitários de conversão de arquivos para Gemini

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateFile,
  fileToBase64,
  getGeminiMimeType,
  fileToGenerativePart,
  filesToGenerativeParts,
  getTotalFileSize,
  formatFileSize,
} from './fileToGemini';

// Helper para criar arquivos mock
function createMockFile(
  name: string,
  size: number,
  type: string,
  content?: string
): File {
  const actualContent = content || 'x'.repeat(Math.min(size, 100));
  const blob = new Blob([actualContent], { type });
  const file = new File([blob], name, { type });

  // Override size para simular arquivos grandes
  Object.defineProperty(file, 'size', { value: size });

  return file;
}

describe('fileToGemini utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // validateFile()
  // ==========================================================================
  describe('validateFile', () => {
    it('rejeita arquivo maior que 20MB', () => {
      const largeFile = createMockFile('large.pdf', 21 * 1024 * 1024, 'application/pdf');
      const result = validateFile(largeFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('muito grande');
      expect(result.error).toContain('20MB');
    });

    it('aceita arquivo de 19MB', () => {
      const file = createMockFile('valid.pdf', 19 * 1024 * 1024, 'application/pdf');
      const result = validateFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('aceita arquivo exatamente com 20MB', () => {
      const file = createMockFile('exact.pdf', 20 * 1024 * 1024, 'application/pdf');
      const result = validateFile(file);

      expect(result.valid).toBe(true);
    });

    it('rejeita tipo MIME não suportado (.exe)', () => {
      const exeFile = createMockFile('malware.exe', 1024, 'application/x-msdownload');
      const result = validateFile(exeFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('não suportado');
    });

    it('rejeita arquivo .txt não suportado', () => {
      const txtFile = createMockFile('notes.txt', 1024, 'text/plain');
      const result = validateFile(txtFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('não suportado');
    });

    it('aceita PDF', () => {
      const pdfFile = createMockFile('document.pdf', 1024, 'application/pdf');
      const result = validateFile(pdfFile);

      expect(result.valid).toBe(true);
    });

    it('aceita imagem JPEG', () => {
      const jpgFile = createMockFile('photo.jpg', 2048, 'image/jpeg');
      const result = validateFile(jpgFile);

      expect(result.valid).toBe(true);
    });

    it('aceita imagem PNG', () => {
      const pngFile = createMockFile('image.png', 2048, 'image/png');
      const result = validateFile(pngFile);

      expect(result.valid).toBe(true);
    });

    it('aceita imagem WebP', () => {
      const webpFile = createMockFile('image.webp', 2048, 'image/webp');
      const result = validateFile(webpFile);

      expect(result.valid).toBe(true);
    });

    it('aceita imagem GIF', () => {
      const gifFile = createMockFile('animation.gif', 2048, 'image/gif');
      const result = validateFile(gifFile);

      expect(result.valid).toBe(true);
    });

    it('fallback para extensão quando MIME está vazio', () => {
      const pdfNoMime = createMockFile('document.pdf', 1024, '');
      const result = validateFile(pdfNoMime);

      expect(result.valid).toBe(true);
    });

    it('fallback para extensão .jpg quando MIME está vazio', () => {
      const jpgNoMime = createMockFile('photo.jpg', 1024, '');
      const result = validateFile(jpgNoMime);

      expect(result.valid).toBe(true);
    });

    it('rejeita extensão desconhecida com MIME vazio', () => {
      const unknownFile = createMockFile('file.xyz', 1024, '');
      const result = validateFile(unknownFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('não suportado');
    });
  });

  // ==========================================================================
  // fileToBase64()
  // ==========================================================================
  describe('fileToBase64', () => {
    it('converte arquivo para string base64', async () => {
      const content = 'Hello, World!';
      const file = new File([content], 'test.txt', { type: 'text/plain' });

      const base64 = await fileToBase64(file);

      // Decodificar e verificar
      const decoded = atob(base64);
      expect(decoded).toBe(content);
    });

    it('remove prefixo data:mime/type;base64,', async () => {
      const content = 'Test content';
      const file = new File([content], 'test.pdf', { type: 'application/pdf' });

      const base64 = await fileToBase64(file);

      // Não deve conter o prefixo
      expect(base64).not.toContain('data:');
      expect(base64).not.toContain('base64,');
      expect(base64).not.toContain(';');
    });

    it('retorna string base64 válida', async () => {
      const content = 'PDF content simulation';
      const file = new File([content], 'doc.pdf', { type: 'application/pdf' });

      const base64 = await fileToBase64(file);

      // Verificar que é base64 válido (não lança erro ao decodificar)
      expect(() => atob(base64)).not.toThrow();
    });

    it('funciona com arquivos binários', async () => {
      // Criar conteúdo binário
      const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF header
      const file = new File([bytes], 'binary.pdf', { type: 'application/pdf' });

      const base64 = await fileToBase64(file);

      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // getGeminiMimeType()
  // ==========================================================================
  describe('getGeminiMimeType', () => {
    it('retorna image/jpeg para .jpg', () => {
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');
      expect(getGeminiMimeType(file)).toBe('image/jpeg');
    });

    it('retorna image/jpeg para .jpeg', () => {
      const file = createMockFile('photo.jpeg', 1024, 'image/jpeg');
      expect(getGeminiMimeType(file)).toBe('image/jpeg');
    });

    it('retorna application/pdf para .pdf', () => {
      const file = createMockFile('doc.pdf', 1024, 'application/pdf');
      expect(getGeminiMimeType(file)).toBe('application/pdf');
    });

    it('retorna image/png para .png', () => {
      const file = createMockFile('image.png', 1024, 'image/png');
      expect(getGeminiMimeType(file)).toBe('image/png');
    });

    it('retorna image/webp para .webp', () => {
      const file = createMockFile('image.webp', 1024, 'image/webp');
      expect(getGeminiMimeType(file)).toBe('image/webp');
    });

    it('retorna image/gif para .gif', () => {
      const file = createMockFile('anim.gif', 1024, 'image/gif');
      expect(getGeminiMimeType(file)).toBe('image/gif');
    });

    it('mapeia tipos MIME conhecidos corretamente', () => {
      const jpgFile = createMockFile('x.jpg', 100, 'image/jpg');
      expect(getGeminiMimeType(jpgFile)).toBe('image/jpeg'); // Normalizado
    });

    it('infere tipo pela extensão quando MIME desconhecido', () => {
      const file = createMockFile('doc.pdf', 1024, 'unknown/type');
      expect(getGeminiMimeType(file)).toBe('application/pdf');
    });

    it('infere jpeg pela extensão quando MIME vazio', () => {
      const file = createMockFile('photo.jpg', 1024, '');
      expect(getGeminiMimeType(file)).toBe('image/jpeg');
    });

    it('usa fallback PDF para extensão desconhecida', () => {
      const file = createMockFile('file.unknown', 1024, '');
      expect(getGeminiMimeType(file)).toBe('application/pdf');
    });
  });

  // ==========================================================================
  // fileToGenerativePart()
  // ==========================================================================
  describe('fileToGenerativePart', () => {
    it('retorna GeminiPart com inlineData', async () => {
      const content = 'Test PDF content';
      const file = new File([content], 'test.pdf', { type: 'application/pdf' });

      const part = await fileToGenerativePart(file);

      expect(part).toHaveProperty('inlineData');
      expect(part.inlineData).toHaveProperty('mimeType', 'application/pdf');
      expect(part.inlineData).toHaveProperty('data');
      expect(typeof part.inlineData!.data).toBe('string');
    });

    it('valida arquivo antes de converter', async () => {
      const validFile = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      // Não deve lançar erro
      await expect(fileToGenerativePart(validFile)).resolves.toBeDefined();
    });

    it('lança erro para arquivo inválido (muito grande)', async () => {
      const largeFile = createMockFile('huge.pdf', 25 * 1024 * 1024, 'application/pdf');

      await expect(fileToGenerativePart(largeFile)).rejects.toThrow('muito grande');
    });

    it('lança erro para tipo não suportado', async () => {
      const exeFile = createMockFile('app.exe', 1024, 'application/x-executable');

      await expect(fileToGenerativePart(exeFile)).rejects.toThrow('não suportado');
    });

    it('converte conteúdo para base64 corretamente', async () => {
      const content = 'Specific test content';
      const file = new File([content], 'test.pdf', { type: 'application/pdf' });

      const part = await fileToGenerativePart(file);

      // Decodificar e verificar
      const decoded = atob(part.inlineData!.data);
      expect(decoded).toBe(content);
    });
  });

  // ==========================================================================
  // filesToGenerativeParts()
  // ==========================================================================
  describe('filesToGenerativeParts', () => {
    it('converte múltiplos arquivos', async () => {
      const files = [
        new File(['content1'], 'doc1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'doc2.pdf', { type: 'application/pdf' }),
        new File(['content3'], 'image.jpg', { type: 'image/jpeg' }),
      ];

      const parts = await filesToGenerativeParts(files);

      expect(parts).toHaveLength(3);
      expect(parts[0].inlineData?.mimeType).toBe('application/pdf');
      expect(parts[1].inlineData?.mimeType).toBe('application/pdf');
      expect(parts[2].inlineData?.mimeType).toBe('image/jpeg');
    });

    it('mantém ordem dos arquivos', async () => {
      const files = [
        new File(['first'], 'first.pdf', { type: 'application/pdf' }),
        new File(['second'], 'second.pdf', { type: 'application/pdf' }),
      ];

      const parts = await filesToGenerativeParts(files);

      expect(atob(parts[0].inlineData!.data)).toBe('first');
      expect(atob(parts[1].inlineData!.data)).toBe('second');
    });

    it('para no primeiro erro de validação', async () => {
      const files = [
        new File(['valid'], 'valid.pdf', { type: 'application/pdf' }),
        createMockFile('invalid.exe', 1024, 'application/x-executable'),
        new File(['another'], 'another.pdf', { type: 'application/pdf' }),
      ];

      await expect(filesToGenerativeParts(files)).rejects.toThrow('não suportado');
    });

    it('retorna array vazio para lista vazia', async () => {
      const parts = await filesToGenerativeParts([]);

      expect(parts).toEqual([]);
    });

    it('funciona com arquivo único', async () => {
      const files = [new File(['single'], 'single.pdf', { type: 'application/pdf' })];

      const parts = await filesToGenerativeParts(files);

      expect(parts).toHaveLength(1);
    });
  });

  // ==========================================================================
  // getTotalFileSize()
  // ==========================================================================
  describe('getTotalFileSize', () => {
    it('soma tamanhos de todos arquivos', () => {
      const files = [
        createMockFile('a.pdf', 1000, 'application/pdf'),
        createMockFile('b.pdf', 2000, 'application/pdf'),
        createMockFile('c.pdf', 3000, 'application/pdf'),
      ];

      const total = getTotalFileSize(files);

      expect(total).toBe(6000);
    });

    it('retorna 0 para array vazio', () => {
      const total = getTotalFileSize([]);

      expect(total).toBe(0);
    });

    it('funciona com arquivo único', () => {
      const files = [createMockFile('single.pdf', 5000, 'application/pdf')];

      const total = getTotalFileSize(files);

      expect(total).toBe(5000);
    });

    it('lida com arquivos grandes', () => {
      const files = [
        createMockFile('big1.pdf', 10 * 1024 * 1024, 'application/pdf'),
        createMockFile('big2.pdf', 5 * 1024 * 1024, 'application/pdf'),
      ];

      const total = getTotalFileSize(files);

      expect(total).toBe(15 * 1024 * 1024);
    });
  });

  // ==========================================================================
  // formatFileSize()
  // ==========================================================================
  describe('formatFileSize', () => {
    it('formata bytes como B', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('formata KB', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(2048)).toBe('2.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10 * 1024)).toBe('10.0 KB');
    });

    it('formata MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.50 MB');
      expect(formatFileSize(20 * 1024 * 1024)).toBe('20.00 MB');
    });

    it('usa precisão correta para cada unidade', () => {
      // Bytes: sem decimal
      expect(formatFileSize(100)).toBe('100 B');

      // KB: 1 casa decimal
      expect(formatFileSize(1536)).toBe('1.5 KB');

      // MB: 2 casas decimais
      expect(formatFileSize(1.25 * 1024 * 1024)).toBe('1.25 MB');
    });
  });
});
