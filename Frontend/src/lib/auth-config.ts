/**
 * Configuracoes de autenticacao para o cliente Supabase
 *
 * Este arquivo define as configuracoes de sessao e autenticacao
 * para garantir que usuarios permanecam logados ate logout explicito.
 */

export const AUTH_CONFIG = {
  // Sessao persiste ate logout explicito
  persistSession: true,

  // Renovar token automaticamente antes de expirar
  autoRefreshToken: true,

  // Storage key para o token (localStorage)
  storageKey: 'minutas-cartorio-auth',

  // Detectar sessao em outras abas
  detectSessionInUrl: true,
} as const;

// Tempo de expiracao do JWT no servidor (deve corresponder ao config.toml)
// 7 dias em segundos
export const JWT_EXPIRY_SECONDS = 604800;

// Credenciais de desenvolvimento (apenas para referencia)
// NAO usar em producao!
export const DEV_CREDENTIALS = {
  email: 'admin@minutas.local',
  password: 'admin123456',
} as const;

// Cargos disponiveis no sistema
export const CARGOS = {
  ADMIN: 'admin',
  ESCREVENTE: 'escrevente',
  TABELIAO: 'tabeliao',
} as const;

export type Cargo = typeof CARGOS[keyof typeof CARGOS];

// Configuracoes de cache do profile no localStorage
export const PROFILE_CACHE_KEY = 'minutas-cartorio-profile-cache';
export const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
