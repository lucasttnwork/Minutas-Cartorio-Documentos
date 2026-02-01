/**
 * Gerenciamento de cache do profile do usuario
 *
 * Este modulo fornece funcoes para cachear o profile do usuario
 * no localStorage, evitando chamadas desnecessarias ao Supabase.
 *
 * O cache tem um TTL configuravel (padrao: 5 minutos) e e
 * automaticamente invalidado quando expira.
 */

import { PROFILE_CACHE_KEY, PROFILE_CACHE_TTL_MS } from './auth-config';
import type { Profile } from './supabase';

/**
 * Estrutura do cache armazenado no localStorage
 */
interface CachedProfile {
  profile: Profile;
  cachedAt: number; // timestamp em milissegundos
}

/**
 * Retorna o profile do cache se valido (nao expirado)
 *
 * @returns Profile do usuario ou null se cache nao existe ou expirou
 *
 * @example
 * ```typescript
 * const cachedProfile = getCachedProfile();
 * if (cachedProfile) {
 *   // Usar profile do cache
 *   console.log('Profile do cache:', cachedProfile.nome);
 * } else {
 *   // Buscar do Supabase
 *   const profile = await getCurrentProfile();
 * }
 * ```
 */
export function getCachedProfile(): Profile | null {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);

    if (!cached) {
      return null;
    }

    const parsed: CachedProfile = JSON.parse(cached);

    // Verifica se os dados estao completos
    if (!parsed.profile || typeof parsed.cachedAt !== 'number') {
      clearProfileCache();
      return null;
    }

    // Verifica se o cache expirou
    const now = Date.now();
    const age = now - parsed.cachedAt;

    if (age >= PROFILE_CACHE_TTL_MS) {
      clearProfileCache();
      return null;
    }

    return parsed.profile;
  } catch {
    // Erro ao parsear JSON ou outro erro
    clearProfileCache();
    return null;
  }
}

/**
 * Salva o profile no cache com timestamp atual
 *
 * @param profile - Profile do usuario a ser cacheado
 *
 * @example
 * ```typescript
 * const profile = await getCurrentProfile();
 * if (profile) {
 *   cacheProfile(profile);
 * }
 * ```
 */
export function cacheProfile(profile: Profile): void {
  const cached: CachedProfile = {
    profile,
    cachedAt: Date.now(),
  };

  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cached));
}

/**
 * Remove o cache de profile do localStorage
 *
 * Deve ser chamado no logout ou quando o profile for atualizado
 * para garantir que dados desatualizados nao sejam usados.
 *
 * @example
 * ```typescript
 * async function logout() {
 *   clearProfileCache();
 *   await supabase.auth.signOut();
 * }
 * ```
 */
export function clearProfileCache(): void {
  localStorage.removeItem(PROFILE_CACHE_KEY);
}
