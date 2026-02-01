// src/lib/domain.ts
// Domain utilities for hostname-based routing between landing page and app

/**
 * Check if the current hostname is the app subdomain (app.*)
 */
export function isAppSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.startsWith('app.');
}

/**
 * Get the URL for the app subdomain
 * @param path - Path to append (default: '/')
 * @returns Full URL for app.domain.com
 */
export function getAppUrl(path = '/'): string {
  if (typeof window === 'undefined') return path;

  const { protocol, hostname, port } = window.location;
  const portSuffix = port ? `:${port}` : '';

  // Remove 'app.' prefix if present to get base domain
  const baseDomain = hostname.replace(/^app\./, '');

  return `${protocol}//app.${baseDomain}${portSuffix}${path}`;
}

/**
 * Get the URL for the landing page (main domain without app. subdomain)
 * @param path - Path to append (default: '/')
 * @returns Full URL for domain.com
 */
export function getLandingUrl(path = '/'): string {
  if (typeof window === 'undefined') return path;

  const { protocol, hostname, port } = window.location;
  const portSuffix = port ? `:${port}` : '';

  // Remove 'app.' prefix if present to get base domain
  const baseDomain = hostname.replace(/^app\./, '');

  return `${protocol}//${baseDomain}${portSuffix}${path}`;
}
