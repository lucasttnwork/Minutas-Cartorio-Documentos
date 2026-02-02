/**
 * Hook para gerenciar minutas padrao (templates)
 * Implementacao real com integracao ao Supabase
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type {
  MinutaPadrao,
  MinutaPadraoInsert,
  MinutaPadraoUpdate,
  TipoNegocio,
} from '@/types/minutas-padrao';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const VALID_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface UseMinutasPadraoReturn {
  templates: MinutaPadrao[];
  isLoading: boolean;
  error: string | null;
  loadTemplates: (tipoNegocio?: TipoNegocio) => Promise<void>;
  uploadTemplate: (
    file: File,
    data: Omit<MinutaPadraoInsert, 'storage_path' | 'nome_original' | 'mime_type' | 'tamanho_bytes'>
  ) => Promise<MinutaPadrao>;
  updateTemplate: (id: string, data: MinutaPadraoUpdate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getDownloadUrl: (storagePath: string) => Promise<string>;
  incrementUsage: (id: string) => Promise<void>;
}

/**
 * Hook para gerenciar templates de minutas padrao
 * Integracao completa com Supabase Storage e Database
 */
export function useMinutasPadrao(): UseMinutasPadraoReturn & { templates: MinutaPadrao[] } {
  const [templates, setTemplates] = useState<MinutaPadrao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega templates do Supabase
   * Filtra por tipo_negocio se fornecido
   * Sempre exclui templates com deleted_at
   */
  const loadTemplates = useCallback(async (tipoNegocio?: TipoNegocio) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('minutas_padrao')
        .select('*');

      // Filtrar por tipo se fornecido
      if (tipoNegocio) {
        query = query.eq('tipo_negocio', tipoNegocio);
      }

      // Excluir soft-deleted e ordenar
      query = query
        .is('deleted_at', null)
        .order('is_global', { ascending: false })
        .order('created_at', { ascending: false });

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setTemplates(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar templates';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Faz upload de um arquivo e cria o registro no banco
   * Valida tipo e tamanho do arquivo antes do upload
   */
  const uploadTemplate = useCallback(async (
    file: File,
    data: Omit<MinutaPadraoInsert, 'storage_path' | 'nome_original' | 'mime_type' | 'tamanho_bytes'>
  ): Promise<MinutaPadrao> => {
    // Validar tipo de arquivo
    if (!VALID_MIME_TYPES.includes(file.type)) {
      throw new Error('Tipo de arquivo nao suportado. Use PDF ou DOCX.');
    }

    // Validar tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Tamanho maximo permitido: 50MB');
    }

    // Obter usuario atual
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuario nao autenticado');
    }

    // Gerar path unico
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${user.id}/${timestamp}-${safeName}`;

    // Upload para o storage
    const { error: uploadError } = await supabase.storage
      .from('minutas-padrao')
      .upload(storagePath, file);

    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    // Inserir registro no banco
    const insertData: MinutaPadraoInsert = {
      ...data,
      user_id: user.id,
      is_global: false,
      storage_path: storagePath,
      nome_original: file.name,
      mime_type: file.type,
      tamanho_bytes: file.size,
    };

    const { data: template, error: insertError } = await supabase
      .from('minutas_padrao')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      // Rollback do upload em caso de erro
      await supabase.storage.from('minutas-padrao').remove([storagePath]);
      throw new Error(`Erro ao salvar: ${insertError.message}`);
    }

    toast.success('Template criado com sucesso!');
    setTemplates(prev => [template, ...prev]);
    return template;
  }, []);

  /**
   * Atualiza metadados de um template
   * Nao permite atualizar templates globais
   */
  const updateTemplate = useCallback(async (
    id: string,
    data: MinutaPadraoUpdate
  ): Promise<void> => {
    // Verificar se e template global
    const template = templates.find(t => t.id === id);
    if (template?.is_global) {
      throw new Error('Templates globais nao podem ser editados');
    }

    const { error: updateError } = await supabase
      .from('minutas_padrao')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      throw new Error(`Erro ao atualizar: ${updateError.message}`);
    }

    toast.success('Template atualizado!');
    setTemplates(prev =>
      prev.map(t => t.id === id ? { ...t, ...data } : t)
    );
  }, [templates]);

  /**
   * Exclui um template (soft delete)
   * Nao permite excluir templates globais
   */
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    // Verificar se e template global
    const template = templates.find(t => t.id === id);
    if (template?.is_global) {
      throw new Error('Templates globais nao podem ser excluidos');
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('minutas_padrao')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Erro ao excluir: ${deleteError.message}`);
    }

    toast.success('Template excluido!');
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, [templates]);

  /**
   * Gera URL assinada para download de um arquivo
   * URL valida por 1 hora
   */
  const getDownloadUrl = useCallback(async (storagePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('minutas-padrao')
      .createSignedUrl(storagePath, 3600); // 1 hora

    if (error) {
      throw new Error(`Erro ao gerar URL: ${error.message}`);
    }

    return data.signedUrl;
  }, []);

  /**
   * Incrementa contador de uso de um template via RPC
   */
  const incrementUsage = useCallback(async (id: string): Promise<void> => {
    await supabase.rpc('increment_template_usage', { template_id: id });
  }, []);

  return {
    templates,
    isLoading,
    error,
    loadTemplates,
    uploadTemplate,
    updateTemplate,
    deleteTemplate,
    getDownloadUrl,
    incrementUsage,
  };
}
