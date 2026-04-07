/**
 * URL validation and safe fetching to prevent SSRF attacks.
 *
 * All server-side fetches of user-provided URLs must go through safeFetch()
 * to block requests to internal networks, cloud metadata, and localhost.
 */

import { resolve4, resolve6 } from 'node:dns/promises';

/** Check if an IP address is in a private/reserved range */
export function isPrivateIP(ip: string): boolean {
  // IPv4 private and reserved ranges
  const ipv4Patterns = [
    /^127\./, // Loopback
    /^10\./, // Class A private
    /^172\.(1[6-9]|2\d|3[01])\./, // Class B private
    /^192\.168\./, // Class C private
    /^169\.254\./, // Link-local
    /^0\./, // Current network
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // Shared address space (CGNAT) 100.64-127
    /^192\.0\.0\./, // IETF protocol assignments
    /^192\.0\.2\./, // TEST-NET-1
    /^198\.51\.100\./, // TEST-NET-2
    /^203\.0\.113\./, // TEST-NET-3
    /^224\./, // Multicast
    /^240\./, // Reserved
    /^255\.255\.255\.255$/, // Broadcast
  ];

  if (ipv4Patterns.some((p) => p.test(ip))) return true;

  // IPv6 private and reserved
  const ipv6Lower = ip.toLowerCase();
  if (
    ipv6Lower === '::1' || // Loopback
    ipv6Lower === '::' || // Unspecified
    ipv6Lower.startsWith('fc') || // Unique local (fc00::/7)
    ipv6Lower.startsWith('fd') || // Unique local (fc00::/7)
    ipv6Lower.startsWith('fe80') || // Link-local
    ipv6Lower.startsWith('ff') // Multicast
  ) {
    return true;
  }

  return false;
}

/** Blocked hostnames */
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal', // GCP metadata
  'metadata', // Common alias
]);

export class UrlValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UrlValidationError';
  }
}

/** Validate a URL is safe to fetch (no SSRF) */
export async function validateUrl(url: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new UrlValidationError('Invalid URL');
  }

  // Only allow https
  if (parsed.protocol !== 'https:') {
    throw new UrlValidationError('Only HTTPS URLs are allowed');
  }

  // Block known dangerous hostnames
  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new UrlValidationError('URL hostname is not allowed');
  }

  // Block IP addresses used directly in URLs
  // IPv4 literal
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new UrlValidationError('URL resolves to a private IP address');
    }
  }

  // IPv6 literal (in brackets in URL, but hostname strips brackets)
  if (hostname.startsWith('[') || hostname.includes(':')) {
    const cleanIp = hostname.replace(/^\[|\]$/g, '');
    if (isPrivateIP(cleanIp)) {
      throw new UrlValidationError('URL resolves to a private IP address');
    }
  }

  // DNS resolution check — resolve hostname and verify no private IPs
  try {
    const ips: string[] = [];
    try {
      const ipv4s = await resolve4(hostname);
      ips.push(...ipv4s);
    } catch {
      // No A record — ok, might be IPv6 only
    }
    try {
      const ipv6s = await resolve6(hostname);
      ips.push(...ipv6s);
    } catch {
      // No AAAA record — ok
    }

    if (ips.length === 0) {
      throw new UrlValidationError('URL hostname could not be resolved');
    }

    for (const ip of ips) {
      if (isPrivateIP(ip)) {
        throw new UrlValidationError('URL resolves to a private IP address');
      }
    }
  } catch (err) {
    if (err instanceof UrlValidationError) throw err;
    throw new UrlValidationError('URL hostname could not be resolved');
  }

  return parsed;
}

/**
 * Fetch a user-provided URL safely, blocking SSRF attempts.
 * Drop-in replacement for fetch() with URL validation.
 */
export async function safeFetch(
  url: string,
  options?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  await validateUrl(url);

  const { timeoutMs = 10000, ...fetchOptions } = options || {};

  return fetch(url, {
    ...fetchOptions,
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  });
}
