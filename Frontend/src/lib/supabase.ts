/**
 * Cliente Supabase tipado para o sistema de Minutas
 *
 * Este arquivo configura o cliente Supabase com:
 * - Tipos TypeScript gerados do schema do banco
 * - Configuracoes de autenticacao persistente
 * - Helpers tipados para acesso as tabelas
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { AUTH_CONFIG } from './auth-config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log config on startup (without sensitive data)
console.log('[Supabase] URL configured:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET');
console.log('[Supabase] Anon key configured:', supabaseAnonKey ? 'YES' : 'NO');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local'
  );
}

/**
 * Cliente Supabase configurado com tipos e autenticacao persistente
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: AUTH_CONFIG.persistSession,
    autoRefreshToken: AUTH_CONFIG.autoRefreshToken,
    storageKey: AUTH_CONFIG.storageKey,
    detectSessionInUrl: AUTH_CONFIG.detectSessionInUrl,
  },
});

// ============================================
// Type Exports - Helpers tipados
// ============================================

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Tipos de Row (dados retornados)
export type Minuta = Tables['minutas']['Row'];
export type Documento = Tables['documentos']['Row'];
export type PessoaNatural = Tables['pessoas_naturais']['Row'];
export type PessoaJuridica = Tables['pessoas_juridicas']['Row'];
export type Imovel = Tables['imoveis']['Row'];
export type NegocioJuridico = Tables['negocios_juridicos']['Row'];
export type Profile = Tables['profiles']['Row'];

// Tipos de Insert (dados para inserir)
export type MinutaInsert = Tables['minutas']['Insert'];
export type DocumentoInsert = Tables['documentos']['Insert'];
export type PessoaNaturalInsert = Tables['pessoas_naturais']['Insert'];
export type PessoaJuridicaInsert = Tables['pessoas_juridicas']['Insert'];
export type ImovelInsert = Tables['imoveis']['Insert'];

// Tipos de Update (dados para atualizar)
export type MinutaUpdate = Tables['minutas']['Update'];
export type DocumentoUpdate = Tables['documentos']['Update'];
export type ProfileUpdate = Tables['profiles']['Update'];

// Enums
export type StatusMinuta = Enums['status_minuta'];
export type StatusDocumento = Enums['status_documento'];
export type TipoDocumento = Enums['tipo_documento'];

// ============================================
// Helper Functions
// ============================================

/**
 * Retorna o usuario atual autenticado
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Retorna o perfil do usuario atual
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Verifica se o usuario atual e admin
 */
export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.cargo === 'admin';
}
