import { describe, it, expect } from 'vitest';
import {
  AUTH_CONFIG,
  JWT_EXPIRY_SECONDS,
  CARGOS,
  PROFILE_CACHE_KEY,
  PROFILE_CACHE_TTL_MS,
} from './auth-config';

describe('auth-config', () => {
  describe('AUTH_CONFIG', () => {
    it('should have persistSession enabled', () => {
      expect(AUTH_CONFIG.persistSession).toBe(true);
    });

    it('should have autoRefreshToken enabled', () => {
      expect(AUTH_CONFIG.autoRefreshToken).toBe(true);
    });

    it('should have correct storageKey', () => {
      expect(AUTH_CONFIG.storageKey).toBe('minutas-cartorio-auth');
    });
  });

  describe('JWT_EXPIRY_SECONDS', () => {
    it('should be 7 days in seconds', () => {
      expect(JWT_EXPIRY_SECONDS).toBe(604800);
    });
  });

  describe('CARGOS', () => {
    it('should have admin cargo', () => {
      expect(CARGOS.ADMIN).toBe('admin');
    });

    it('should have escrevente cargo', () => {
      expect(CARGOS.ESCREVENTE).toBe('escrevente');
    });

    it('should have tabeliao cargo', () => {
      expect(CARGOS.TABELIAO).toBe('tabeliao');
    });
  });

  describe('Profile Cache Constants', () => {
    it('should export PROFILE_CACHE_KEY as a string', () => {
      expect(typeof PROFILE_CACHE_KEY).toBe('string');
      expect(PROFILE_CACHE_KEY).toBe('minutas-cartorio-profile-cache');
    });

    it('should export PROFILE_CACHE_TTL_MS as 5 minutes in milliseconds', () => {
      expect(typeof PROFILE_CACHE_TTL_MS).toBe('number');
      expect(PROFILE_CACHE_TTL_MS).toBe(300000); // 5 * 60 * 1000
    });
  });
});
