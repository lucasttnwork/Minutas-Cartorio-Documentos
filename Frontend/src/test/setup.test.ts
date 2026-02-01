import { describe, it, expect } from 'vitest';

describe('Test Setup', () => {
  it('should run tests', () => {
    expect(true).toBe(true);
  });

  it('should have environment variables', () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBe('http://localhost:54321');
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBe('test-anon-key');
  });
});
