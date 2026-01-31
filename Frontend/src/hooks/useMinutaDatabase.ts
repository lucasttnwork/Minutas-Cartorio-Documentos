/**
 * useMinutaDatabase - Hook para operacoes CRUD de minutas no Supabase
 *
 * Este hook fornece funcoes para criar, carregar, atualizar e deletar
 * entidades relacionadas a minutas, utilizando os type-mappers para
 * conversao entre tipos do frontend e do banco de dados.
 */

import { useState, useCallback } from 'react';
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
import type {
  PessoaNatural,
  PessoaJuridica,
  Imovel,
  NegocioJuridico,
} from '@/types/minuta';

// ============================================================================
// Types
// ============================================================================

export interface FullMinutaData {
  id: string;
  titulo: string;
  status: string;
  currentStep: string;
  outorgantes: {
    pessoasNaturais: PessoaNatural[];
    pessoasJuridicas: PessoaJuridica[];
  };
  outorgados: {
    pessoasNaturais: PessoaNatural[];
    pessoasJuridicas: PessoaJuridica[];
  };
  imoveis: Imovel[];
  negociosJuridicos: NegocioJuridico[];
  minutaTexto: string;
}

export interface UseMinutaDatabaseReturn {
  loading: boolean;
  error: string | null;

  // Minuta
  createMinuta: (titulo: string) => Promise<string | null>;
  loadMinuta: (id: string) => Promise<FullMinutaData | null>;
  updateMinutaStatus: (id: string, status: string, step?: string) => Promise<boolean>;

  // Pessoas Naturais
  syncPessoaNatural: (
    pessoa: PessoaNatural,
    minutaId: string,
    papel: 'outorgante' | 'outorgado' | 'anuente'
  ) => Promise<string | null>;
  deletePessoaNatural: (id: string) => Promise<boolean>;

  // Pessoas Juridicas
  syncPessoaJuridica: (
    pessoa: PessoaJuridica,
    minutaId: string,
    papel: 'outorgante' | 'outorgado' | 'anuente'
  ) => Promise<string | null>;
  deletePessoaJuridica: (id: string) => Promise<boolean>;

  // Imoveis
  syncImovel: (imovel: Imovel, minutaId: string) => Promise<string | null>;
  deleteImovel: (id: string) => Promise<boolean>;

  // Negocios
  syncNegocio: (
    negocio: NegocioJuridico,
    minutaId: string,
    imovelId: string
  ) => Promise<string | null>;
  deleteNegocio: (id: string) => Promise<boolean>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useMinutaDatabase(): UseMinutaDatabaseReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================================
  // Minuta Operations
  // ==========================================================================

  /**
   * Cria uma nova minuta e retorna seu ID
   */
  const createMinuta = useCallback(async (titulo: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error: dbError } = await supabase
        .from('minutas')
        .insert({
          titulo,
          user_id: user.id,
          status: 'rascunho',
          current_step: 'upload',
        })
        .select('id')
        .single();

      if (dbError) throw dbError;
      return data?.id ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar minuta');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega uma minuta completa com todas as entidades relacionadas
   */
  const loadMinuta = useCallback(async (id: string): Promise<FullMinutaData | null> => {
    setLoading(true);
    setError(null);
    console.log('[useMinutaDatabase] Loading minuta:', id);
    try {
      // Check auth status first
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[useMinutaDatabase] Current user:', user?.id, user?.email);

      // Load minuta base data
      const { data: minutaData, error: minutaError } = await supabase
        .from('minutas')
        .select('*')
        .eq('id', id)
        .single();

      console.log('[useMinutaDatabase] Minuta query result:', { data: minutaData, error: minutaError });

      if (minutaError) {
        console.error('[useMinutaDatabase] Minuta query error:', minutaError);
        throw minutaError;
      }
      if (!minutaData) {
        console.warn('[useMinutaDatabase] No minuta data returned');
        return null;
      }
      console.log('[useMinutaDatabase] Minuta loaded successfully:', minutaData.id, minutaData.titulo);

      // Load pessoas naturais
      console.log('[useMinutaDatabase] Loading pessoas naturais...');
      const { data: pessoasNaturaisData, error: pnError } = await supabase
        .from('pessoas_naturais')
        .select('*')
        .eq('minuta_id', id);

      console.log('[useMinutaDatabase] Pessoas naturais result:', { count: pessoasNaturaisData?.length, error: pnError });
      if (pnError) {
        console.error('[useMinutaDatabase] Pessoas naturais error:', pnError);
        throw pnError;
      }

      // Load pessoas juridicas
      const { data: pessoasJuridicasData, error: pjError } = await supabase
        .from('pessoas_juridicas')
        .select('*')
        .eq('minuta_id', id);

      if (pjError) throw pjError;

      // Load imoveis
      const { data: imoveisData, error: imError } = await supabase
        .from('imoveis')
        .select('*')
        .eq('minuta_id', id);

      if (imError) throw imError;

      // Load negocios juridicos
      const { data: negociosData, error: negError } = await supabase
        .from('negocios_juridicos')
        .select('*')
        .eq('minuta_id', id);

      if (negError) throw negError;

      // Convert and separate pessoas naturais by papel
      const pessoasNaturais = (pessoasNaturaisData || []).map(dbToFrontendPessoaNatural);
      const outorgantesPN = pessoasNaturais.filter((_, i) =>
        pessoasNaturaisData?.[i]?.papel === 'outorgante'
      );
      const outorgadosPN = pessoasNaturais.filter((_, i) =>
        pessoasNaturaisData?.[i]?.papel === 'outorgado'
      );

      // Convert and separate pessoas juridicas by papel
      const pessoasJuridicas = (pessoasJuridicasData || []).map(dbToFrontendPessoaJuridica);
      const outorgantesPJ = pessoasJuridicas.filter((_, i) =>
        pessoasJuridicasData?.[i]?.papel === 'outorgante'
      );
      const outorgadosPJ = pessoasJuridicas.filter((_, i) =>
        pessoasJuridicasData?.[i]?.papel === 'outorgado'
      );

      // Convert imoveis
      const imoveis = (imoveisData || []).map(dbToFrontendImovel);

      // Convert negocios
      const negociosJuridicos = (negociosData || []).map(dbToFrontendNegocio);

      // Extract currentStep from the current_step column
      const currentStep = (minutaData.current_step as string) || 'upload';

      return {
        id: minutaData.id,
        titulo: minutaData.titulo,
        status: minutaData.status,
        currentStep,
        outorgantes: {
          pessoasNaturais: outorgantesPN,
          pessoasJuridicas: outorgantesPJ,
        },
        outorgados: {
          pessoasNaturais: outorgadosPN,
          pessoasJuridicas: outorgadosPJ,
        },
        imoveis,
        negociosJuridicos,
        minutaTexto: minutaData.texto_final || '',
      };
    } catch (err) {
      console.error('[useMinutaDatabase] Error loading minuta:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar minuta');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza o status e/ou step de uma minuta
   */
  const updateMinutaStatus = useCallback(
    async (id: string, status: string, step?: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const updateData: Record<string, unknown> = { status };
        if (step) {
          updateData.current_step = step;
        }

        const { error: dbError } = await supabase
          .from('minutas')
          .update(updateData)
          .eq('id', id);

        if (dbError) throw dbError;
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ==========================================================================
  // Pessoa Natural Operations
  // ==========================================================================

  /**
   * Sincroniza (upsert) uma pessoa natural no banco
   * - Se id vazio: insere nova
   * - Se id existente: atualiza
   */
  const syncPessoaNatural = useCallback(
    async (
      pessoa: PessoaNatural,
      minutaId: string,
      papel: 'outorgante' | 'outorgado' | 'anuente'
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const dbData = frontendToDbPessoaNatural(pessoa, minutaId, papel);

        if (!pessoa.id || pessoa.id === '') {
          // Insert new
          const { data, error: dbError } = await supabase
            .from('pessoas_naturais')
            .insert(dbData)
            .select('id')
            .single();

          if (dbError) throw dbError;
          return data?.id ?? null;
        } else {
          // Update existing
          const { data, error: dbError } = await supabase
            .from('pessoas_naturais')
            .update(dbData)
            .eq('id', pessoa.id)
            .select('id')
            .single();

          if (dbError) throw dbError;
          return data?.id ?? null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao sincronizar pessoa natural');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Deleta uma pessoa natural
   */
  const deletePessoaNatural = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('pessoas_naturais')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar pessoa natural');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================================
  // Pessoa Juridica Operations
  // ==========================================================================

  /**
   * Sincroniza (upsert) uma pessoa juridica no banco
   */
  const syncPessoaJuridica = useCallback(
    async (
      pessoa: PessoaJuridica,
      minutaId: string,
      papel: 'outorgante' | 'outorgado' | 'anuente'
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const dbData = frontendToDbPessoaJuridica(pessoa, minutaId, papel);

        if (!pessoa.id || pessoa.id === '') {
          // Insert new
          const { data, error: dbError } = await supabase
            .from('pessoas_juridicas')
            .insert(dbData)
            .select('id')
            .single();

          if (dbError) throw dbError;
          return data?.id ?? null;
        } else {
          // Update existing
          const { data, error: dbError } = await supabase
            .from('pessoas_juridicas')
            .update(dbData)
            .eq('id', pessoa.id)
            .select('id')
            .single();

          if (dbError) throw dbError;
          return data?.id ?? null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao sincronizar pessoa jurídica');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Deleta uma pessoa juridica
   */
  const deletePessoaJuridica = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('pessoas_juridicas')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar pessoa jurídica');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================================
  // Imovel Operations
  // ==========================================================================

  /**
   * Sincroniza (upsert) um imovel no banco
   */
  const syncImovel = useCallback(
    async (imovel: Imovel, minutaId: string): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const dbData = frontendToDbImovel(imovel, minutaId);

        if (!imovel.id || imovel.id === '') {
          // Insert new
          const { data, error: dbError } = await supabase
            .from('imoveis')
            .insert(dbData)
            .select('id')
            .single();

          if (dbError) throw dbError;
          return data?.id ?? null;
        } else {
          // Update existing
          const { data, error: dbError } = await supabase
            .from('imoveis')
            .update(dbData)
            .eq('id', imovel.id)
            .select('id')
            .single();

          if (dbError) throw dbError;
          return data?.id ?? null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao sincronizar imóvel');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Deleta um imovel
   */
  const deleteImovel = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('imoveis')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar imóvel');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================================
  // Negocio Juridico Operations
  // ==========================================================================

  /**
   * Sincroniza (upsert) um negocio juridico no banco
   */
  const syncNegocio = useCallback(
    async (
      negocio: NegocioJuridico,
      minutaId: string,
      imovelId: string
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const dbData = frontendToDbNegocio(negocio, minutaId, imovelId);

        if (!negocio.id || negocio.id === '') {
          // Insert new
          const { data, error: dbError } = await supabase
            .from('negocios_juridicos')
            .insert(dbData)
            .select('id')
            .single();

          if (dbError) throw dbError;
          return data?.id ?? null;
        } else {
          // Update existing
          const { data, error: dbError } = await supabase
            .from('negocios_juridicos')
            .update(dbData)
            .eq('id', negocio.id)
            .select('id')
            .single();

          if (dbError) throw dbError;
          return data?.id ?? null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao sincronizar negócio jurídico');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Deleta um negocio juridico
   */
  const deleteNegocio = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('negocios_juridicos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar negócio jurídico');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    loading,
    error,
    createMinuta,
    loadMinuta,
    updateMinutaStatus,
    syncPessoaNatural,
    deletePessoaNatural,
    syncPessoaJuridica,
    deletePessoaJuridica,
    syncImovel,
    deleteImovel,
    syncNegocio,
    deleteNegocio,
  };
}
