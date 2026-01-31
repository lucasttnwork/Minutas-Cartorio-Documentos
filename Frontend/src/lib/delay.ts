/**
 * Utility function for async delays
 * Exported separately to allow mocking in tests
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Default retry delays for profile fetch (ms)
 */
export const PROFILE_FETCH_DELAYS = [500, 1000, 2000];
