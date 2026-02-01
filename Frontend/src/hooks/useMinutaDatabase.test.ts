/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMinutaDatabase } from './useMinutaDatabase';

// Mock the supabase module
vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    },
  };
});

// Mock type-mappers
vi.mock('@/lib/type-mappers', () => ({
  frontendToDbPessoaNatural: vi.fn((pessoa, minutaId, papel) => ({
    minuta_id: minutaId,
    nome_completo: pessoa.nome,
    cpf: pessoa.cpf,
    papel,
  })),
  dbToFrontendPessoaNatural: vi.fn((row) => ({
    id: row.id,
    nome: row.nome_completo,
    cpf: row.cpf || '',
    rg: '',
    orgaoEmissorRg: '',
    estadoEmissorRg: '',
    dataEmissaoRg: '',
    nacionalidade: row.nacionalidade || '',
    profissao: row.profissao || '',
    dataNascimento: '',
    dataObito: '',
    cnh: '',
    orgaoEmissorCnh: '',
    dadosFamiliares: { estadoCivil: row.estado_civil || '' },
    domicilio: {},
    contato: {},
    cndt: {},
    certidaoUniao: {},
    camposEditados: [],
  })),
  frontendToDbPessoaJuridica: vi.fn((pessoa, minutaId, papel) => ({
    minuta_id: minutaId,
    razao_social: pessoa.razaoSocial,
    cnpj: pessoa.cnpj,
    papel,
  })),
  dbToFrontendPessoaJuridica: vi.fn((row) => ({
    id: row.id,
    razaoSocial: row.razao_social,
    cnpj: row.cnpj || '',
    nire: '',
    inscricaoEstadual: row.inscricao_estadual || '',
    dataConstituicao: '',
    endereco: {},
    contato: {},
    registroVigente: {},
    certidaoEmpresa: {},
    representantes: [],
    administradores: [],
    procuradores: [],
    cndt: {},
    certidaoUniao: {},
    camposEditados: [],
  })),
  frontendToDbImovel: vi.fn((imovel, minutaId) => ({
    minuta_id: minutaId,
    matricula: imovel.matricula?.numeroMatricula,
    tipo_imovel: imovel.descricao?.denominacao,
  })),
  dbToFrontendImovel: vi.fn((row) => ({
    id: row.id,
    matricula: { numeroMatricula: row.matricula || '' },
    descricao: { denominacao: row.tipo_imovel || '' },
    cadastro: {},
    valoresVenais: {},
    negativaIPTU: {},
    certidaoMatricula: {},
    proprietarios: [],
    onus: [],
    ressalvas: {},
    camposEditados: [],
  })),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  frontendToDbNegocio: vi.fn((negocio, minutaId, _imovelId) => ({
    minuta_id: minutaId,
    tipo_negocio: negocio.tipoAto,
    valor: parseFloat(negocio.valorNegocio) || null,
  })),
  dbToFrontendNegocio: vi.fn((row) => ({
    id: row.id,
    imovelId: '',
    tipoAto: row.tipo_negocio,
    fracaoIdealAlienada: '',
    valorTotalAlienacao: '',
    valorNegocio: row.valor?.toString() || '',
    formaPagamento: row.forma_pagamento || '',
    formaPagamentoDetalhada: {},
    alienantes: [],
    adquirentes: [],
    termosEspeciais: {},
    declaracoes: {},
    dispensas: {},
    indisponibilidade: {},
    impostoTransmissao: {},
    condicoesEspeciais: '',
    clausulasAdicionais: '',
    camposEditados: [],
  })),
}));

import { supabase } from '@/lib/supabase';
import {
  frontendToDbPessoaNatural,
  dbToFrontendPessoaNatural,
  frontendToDbPessoaJuridica,
  dbToFrontendPessoaJuridica,
  frontendToDbImovel,
  dbToFrontendImovel,
  frontendToDbNegocio,
  dbToFrontendNegocio,
} from '@/lib/type-mappers';

describe('useMinutaDatabase', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful auth mock
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // createMinuta Tests
  // ============================================================================
  describe('createMinuta', () => {
    it('should create a minuta and return its id', async () => {
      const mockMinutaId = 'minuta-456';

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: mockMinutaId },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.createMinuta('Escritura de Compra e Venda');
      });

      expect(returnedId).toBe(mockMinutaId);
      expect(supabase.from).toHaveBeenCalledWith('minutas');
    });

    it('should set loading to true during operation and false after', async () => {
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'minuta-123' },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      expect(result.current.loading).toBe(false);

      const promise = act(async () => {
        await result.current.createMinuta('Test');
      });

      await promise;
      expect(result.current.loading).toBe(false);
    });

    it('should set error when user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.createMinuta('Test');
      });

      expect(returnedId).toBeNull();
      expect(result.current.error).toBe('Usuário não autenticado');
    });

    it('should set error when database operation fails', async () => {
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.createMinuta('Test');
      });

      expect(returnedId).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  // ============================================================================
  // loadMinuta Tests
  // ============================================================================
  describe('loadMinuta', () => {
    it('should load complete minuta data with all related entities', async () => {
      const mockMinutaData = {
        id: 'minuta-123',
        titulo: 'Test Minuta',
        status: 'rascunho',
        tipo_ato: 'compra_venda',
        texto_final: 'Minuta text content',
        dados_estruturados: { currentStep: 'outorgantes' },
      };

      const mockPessoasNaturais = [
        { id: 'pn-1', nome_completo: 'João Silva', cpf: '123.456.789-00', papel: 'outorgante' },
        { id: 'pn-2', nome_completo: 'Maria Silva', cpf: '987.654.321-00', papel: 'outorgado' },
      ];

      const mockPessoasJuridicas = [
        { id: 'pj-1', razao_social: 'Empresa ABC', cnpj: '12.345.678/0001-90', papel: 'outorgante' },
      ];

      const mockImoveis = [
        { id: 'im-1', matricula: '12345', tipo_imovel: 'apartamento' },
      ];

      const mockNegocios = [
        { id: 'neg-1', tipo_negocio: 'compra_venda', valor: 500000 },
      ];

      // Setup mock for minutas table
      const mockMinutaSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockMinutaData, error: null }),
        }),
      });

      // Setup mock for pessoas_naturais
      const mockPessoasNaturaisSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockPessoasNaturais, error: null }),
      });

      // Setup mock for pessoas_juridicas
      const mockPessoasJuridicasSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockPessoasJuridicas, error: null }),
      });

      // Setup mock for imoveis
      const mockImoveisSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockImoveis, error: null }),
      });

      // Setup mock for negocios_juridicos
      const mockNegociosSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockNegocios, error: null }),
      });

      (supabase.from as any).mockImplementation((table: string) => {
        switch (table) {
          case 'minutas':
            return { select: mockMinutaSelect };
          case 'pessoas_naturais':
            return { select: mockPessoasNaturaisSelect };
          case 'pessoas_juridicas':
            return { select: mockPessoasJuridicasSelect };
          case 'imoveis':
            return { select: mockImoveisSelect };
          case 'negocios_juridicos':
            return { select: mockNegociosSelect };
          default:
            return { select: vi.fn() };
        }
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let data: any = null;
      await act(async () => {
        data = await result.current.loadMinuta('minuta-123');
      });

      expect(data).not.toBeNull();
      expect(data.id).toBe('minuta-123');
      expect(data.titulo).toBe('Test Minuta');
      expect(dbToFrontendPessoaNatural).toHaveBeenCalled();
      expect(dbToFrontendPessoaJuridica).toHaveBeenCalled();
      expect(dbToFrontendImovel).toHaveBeenCalled();
      expect(dbToFrontendNegocio).toHaveBeenCalled();
    });

    it('should return null when minuta not found', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let data: any = null;
      await act(async () => {
        data = await result.current.loadMinuta('nonexistent-id');
      });

      expect(data).toBeNull();
    });
  });

  // ============================================================================
  // updateMinutaStatus Tests
  // ============================================================================
  describe('updateMinutaStatus', () => {
    it('should update minuta status and step', async () => {
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let success = false;
      await act(async () => {
        success = await result.current.updateMinutaStatus('minuta-123', 'processando', 'imoveis');
      });

      expect(success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('minutas');
    });

    it('should return false on error', async () => {
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let success = false;
      await act(async () => {
        success = await result.current.updateMinutaStatus('minuta-123', 'processando');
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  // ============================================================================
  // syncPessoaNatural Tests (upsert behavior)
  // ============================================================================
  describe('syncPessoaNatural', () => {
    const mockPessoa = {
      id: '',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      rg: '',
      orgaoEmissorRg: '',
      estadoEmissorRg: '',
      dataEmissaoRg: '',
      nacionalidade: 'brasileira',
      profissao: 'engenheiro',
      dataNascimento: '',
      dataObito: '',
      cnh: '',
      orgaoEmissorCnh: '',
      dadosFamiliares: { estadoCivil: 'solteiro' },
      domicilio: {},
      contato: {},
      cndt: {},
      certidaoUniao: {},
      camposEditados: [],
    };

    it('should insert new pessoa natural when id is empty', async () => {
      const newId = 'new-pessoa-123';

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: newId },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.syncPessoaNatural(mockPessoa as any, 'minuta-123', 'outorgante');
      });

      expect(returnedId).toBe(newId);
      expect(frontendToDbPessoaNatural).toHaveBeenCalledWith(mockPessoa, 'minuta-123', 'outorgante');
    });

    it('should update existing pessoa natural when id is provided', async () => {
      const existingPessoa = { ...mockPessoa, id: 'existing-pessoa-456' };

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: existingPessoa.id },
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.syncPessoaNatural(existingPessoa as any, 'minuta-123', 'outorgante');
      });

      expect(returnedId).toBe(existingPessoa.id);
    });

    it('should return null and set error on failure', async () => {
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.syncPessoaNatural(mockPessoa as any, 'minuta-123', 'outorgante');
      });

      expect(returnedId).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  // ============================================================================
  // deletePessoaNatural Tests
  // ============================================================================
  describe('deletePessoaNatural', () => {
    it('should delete pessoa natural and return true', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let success = false;
      await act(async () => {
        success = await result.current.deletePessoaNatural('pessoa-123');
      });

      expect(success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('pessoas_naturais');
    });

    it('should return false and set error on failure', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Delete failed' } }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let success = false;
      await act(async () => {
        success = await result.current.deletePessoaNatural('pessoa-123');
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  // ============================================================================
  // syncPessoaJuridica Tests
  // ============================================================================
  describe('syncPessoaJuridica', () => {
    const mockPessoaJuridica = {
      id: '',
      razaoSocial: 'Empresa ABC Ltda',
      cnpj: '12.345.678/0001-90',
      nire: '',
      inscricaoEstadual: '',
      dataConstituicao: '',
      endereco: {},
      contato: {},
      registroVigente: {},
      certidaoEmpresa: {},
      representantes: [],
      administradores: [],
      procuradores: [],
      cndt: {},
      certidaoUniao: {},
      camposEditados: [],
    };

    it('should insert new pessoa juridica when id is empty', async () => {
      const newId = 'new-pj-123';

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: newId },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.syncPessoaJuridica(mockPessoaJuridica as any, 'minuta-123', 'outorgado');
      });

      expect(returnedId).toBe(newId);
      expect(frontendToDbPessoaJuridica).toHaveBeenCalledWith(mockPessoaJuridica, 'minuta-123', 'outorgado');
    });

    it('should update existing pessoa juridica when id is provided', async () => {
      const existingPJ = { ...mockPessoaJuridica, id: 'existing-pj-456' };

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: existingPJ.id },
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.syncPessoaJuridica(existingPJ as any, 'minuta-123', 'outorgado');
      });

      expect(returnedId).toBe(existingPJ.id);
    });
  });

  // ============================================================================
  // deletePessoaJuridica Tests
  // ============================================================================
  describe('deletePessoaJuridica', () => {
    it('should delete pessoa juridica and return true', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let success = false;
      await act(async () => {
        success = await result.current.deletePessoaJuridica('pj-123');
      });

      expect(success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('pessoas_juridicas');
    });
  });

  // ============================================================================
  // syncImovel Tests
  // ============================================================================
  describe('syncImovel', () => {
    const mockImovel = {
      id: '',
      matricula: { numeroMatricula: '12345' },
      descricao: { denominacao: 'apartamento' },
      cadastro: {},
      valoresVenais: {},
      negativaIPTU: {},
      certidaoMatricula: {},
      proprietarios: [],
      onus: [],
      ressalvas: {},
      camposEditados: [],
    };

    it('should insert new imovel when id is empty', async () => {
      const newId = 'new-imovel-123';

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: newId },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.syncImovel(mockImovel as any, 'minuta-123');
      });

      expect(returnedId).toBe(newId);
      expect(frontendToDbImovel).toHaveBeenCalledWith(mockImovel, 'minuta-123');
    });

    it('should update existing imovel when id is provided', async () => {
      const existingImovel = { ...mockImovel, id: 'existing-imovel-456' };

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: existingImovel.id },
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.syncImovel(existingImovel as any, 'minuta-123');
      });

      expect(returnedId).toBe(existingImovel.id);
    });
  });

  // ============================================================================
  // deleteImovel Tests
  // ============================================================================
  describe('deleteImovel', () => {
    it('should delete imovel and return true', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let success = false;
      await act(async () => {
        success = await result.current.deleteImovel('imovel-123');
      });

      expect(success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('imoveis');
    });
  });

  // ============================================================================
  // syncNegocio Tests
  // ============================================================================
  describe('syncNegocio', () => {
    const mockNegocio = {
      id: '',
      imovelId: 'imovel-123',
      tipoAto: 'compra_venda',
      fracaoIdealAlienada: '100%',
      valorTotalAlienacao: '500000.00',
      valorNegocio: '500000.00',
      formaPagamento: 'a_vista',
      formaPagamentoDetalhada: {},
      alienantes: [],
      adquirentes: [],
      termosEspeciais: {},
      declaracoes: {},
      dispensas: {},
      indisponibilidade: {},
      impostoTransmissao: {},
      condicoesEspeciais: '',
      clausulasAdicionais: '',
      camposEditados: [],
    };

    it('should insert new negocio when id is empty', async () => {
      const newId = 'new-negocio-123';

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: newId },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.syncNegocio(mockNegocio as any, 'minuta-123', 'imovel-123');
      });

      expect(returnedId).toBe(newId);
      expect(frontendToDbNegocio).toHaveBeenCalledWith(mockNegocio, 'minuta-123', 'imovel-123');
    });

    it('should update existing negocio when id is provided', async () => {
      const existingNegocio = { ...mockNegocio, id: 'existing-negocio-456' };

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: existingNegocio.id },
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.syncNegocio(existingNegocio as any, 'minuta-123', 'imovel-123');
      });

      expect(returnedId).toBe(existingNegocio.id);
    });
  });

  // ============================================================================
  // deleteNegocio Tests
  // ============================================================================
  describe('deleteNegocio', () => {
    it('should delete negocio and return true', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      let success = false;
      await act(async () => {
        success = await result.current.deleteNegocio('negocio-123');
      });

      expect(success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('negocios_juridicos');
    });
  });

  // ============================================================================
  // Loading and Error State Tests
  // ============================================================================
  describe('loading and error states', () => {
    it('should clear error on new operation', async () => {
      // First operation fails
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'First error' },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMinutaDatabase());

      await act(async () => {
        await result.current.createMinuta('Test');
      });

      expect(result.current.error).toBeTruthy();

      // Second operation succeeds - error should be cleared
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new-id' },
              error: null,
            }),
          }),
        }),
      });

      await act(async () => {
        await result.current.createMinuta('Test 2');
      });

      expect(result.current.error).toBeNull();
    });
  });
});
