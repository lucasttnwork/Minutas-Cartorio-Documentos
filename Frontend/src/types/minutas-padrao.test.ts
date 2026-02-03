import { describe, it, expect } from 'vitest';
import type {
  TipoNegocio,
  MinutaPadrao,
  MinutaPadraoInsert,
  MinutaPadraoUpdate
} from './minutas-padrao';

describe('MinutasPadrao Types', () => {
  describe('TipoNegocio', () => {
    it('should accept valid tipo_negocio values', () => {
      const tipos: TipoNegocio[] = [
        'compra_venda',
        'doacao',
        'permuta',
        'hipoteca',
        'inventario',
        'geral'
      ];
      expect(tipos).toHaveLength(6);
    });
  });

  describe('MinutaPadrao', () => {
    it('should have all required fields', () => {
      const template: MinutaPadrao = {
        id: 'uuid-123',
        user_id: 'user-uuid',
        is_global: false,
        nome: 'Template Teste',
        descricao: 'Descrição',
        tipo_negocio: 'compra_venda',
        storage_path: 'templates/test.pdf',
        nome_original: 'test.pdf',
        mime_type: 'application/pdf',
        tamanho_bytes: 1024,
        thumbnail_path: null,
        uso_count: 0,
        deleted_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(template.id).toBeDefined();
      expect(template.nome).toBe('Template Teste');
    });

    it('should allow null user_id for global templates', () => {
      const globalTemplate: MinutaPadrao = {
        id: 'uuid-456',
        user_id: null,
        is_global: true,
        nome: 'Template Global',
        descricao: null,
        tipo_negocio: 'geral',
        storage_path: 'templates/global.pdf',
        nome_original: 'global.pdf',
        mime_type: 'application/pdf',
        tamanho_bytes: 2048,
        thumbnail_path: null,
        uso_count: 10,
        deleted_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(globalTemplate.user_id).toBeNull();
      expect(globalTemplate.is_global).toBe(true);
    });
  });

  describe('MinutaPadraoInsert', () => {
    it('should only require necessary fields for insert', () => {
      const insert: MinutaPadraoInsert = {
        nome: 'Novo Template',
        tipo_negocio: 'doacao',
        storage_path: 'templates/novo.pdf',
        nome_original: 'novo.pdf',
        mime_type: 'application/pdf',
        tamanho_bytes: 512,
      };

      expect(insert.nome).toBeDefined();
      // id, user_id, created_at should be optional
    });
  });

  describe('MinutaPadraoUpdate', () => {
    it('should make all fields optional for update', () => {
      const update: MinutaPadraoUpdate = {
        nome: 'Nome Atualizado',
      };

      expect(update.nome).toBe('Nome Atualizado');
    });

    it('should allow updating descricao', () => {
      const update: MinutaPadraoUpdate = {
        descricao: 'Nova descrição',
      };

      expect(update.descricao).toBeDefined();
    });
  });
});
