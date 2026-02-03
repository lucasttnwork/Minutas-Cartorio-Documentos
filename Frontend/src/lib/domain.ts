// src/lib/domain.ts
// Domain utilities for path-based routing between landing page and app

/**
 * Check if current path is within the app (/app/*)
 */
export function isAppPath(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/app');
}

/**
 * Legacy: Check if the current hostname is the app subdomain (app.*)
 * Kept for backwards compatibility during transition
 */
export function isAppSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  // Check both: path-based (/app/*) or subdomain (app.*)
  return isAppPath() || window.location.hostname.startsWith('app.');
}

/**
 * Get the URL for the app
 * @param path - Path to append (default: '/')
 * @returns Path for /app/* routes
 */
export function getAppUrl(path = '/'): string {
  // Normalize path to not have leading slash for concatenation
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/app${normalizedPath}`;
}

/**
 * Get the URL for the landing page (main domain)
 * @param path - Path to append (default: '/')
 * @returns Path for landing routes
 */
export function getLandingUrl(path = '/'): string {
  return path;
}
