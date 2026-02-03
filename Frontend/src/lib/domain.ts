// src/lib/domain.ts
// Domain utilities for hostname-based routing between landing page and app
// Supports dual access: app.domain.com/* (subdomain) and domain.com/app/* (path prefix)

/**
 * Check if the current hostname is the app subdomain (app.*)
 */
export function isAppSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.startsWith('app.');
}

/**
 * Check if the current pathname starts with /app (path prefix mode)
 */
export function isAppPathPrefix(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/app');
}

/**
 * Get the URL for the app
 * - If on subdomain (app.*), returns relative path
 * - If on main domain, returns path with /app prefix
 * @param path - Path to append (default: '/')
 * @returns URL for accessing the app
 */
export function getAppUrl(path = '/'): string {
  if (typeof window === 'undefined') return path;

  // If already on the app subdomain, return relative path
  if (isAppSubdomain()) return path;

  // On main domain, use /app prefix
  return `/app${path}`;
}

/**
 * Get the URL for the landing page (main domain without app. subdomain)
 * @param path - Path to append (default: '/')
 * @returns URL for accessing the landing page
 */
export function getLandingUrl(path = '/'): string {
  if (typeof window === 'undefined') return path;

  // If on /app/* path, already on main domain - return relative path
  if (isAppPathPrefix()) return path;

  // If on subdomain, construct full URL to main domain
  const { protocol, hostname, port } = window.location;
  const portSuffix = port ? `:${port}` : '';

  // Remove 'app.' prefix if present to get base domain
  const baseDomain = hostname.replace(/^app\./, '');

  return `${protocol}//${baseDomain}${portSuffix}${path}`;
}
