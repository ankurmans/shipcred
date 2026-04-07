import { describe, it, expect } from 'vitest';
import nextConfig from '../next.config.js';

describe('Security headers in next.config.js', () => {
  it('should have a headers function', () => {
    expect(typeof nextConfig.headers).toBe('function');
  });

  it('should include required security headers', async () => {
    const headers = await nextConfig.headers();
    expect(headers.length).toBeGreaterThan(0);

    const globalHeaders = headers[0];
    expect(globalHeaders.source).toBe('/(.*)');

    const headerMap = new Map(
      globalHeaders.headers.map((h: { key: string; value: string }) => [h.key, h.value])
    );

    // Check each required header
    expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headerMap.get('X-Frame-Options')).toBe('DENY');
    expect(headerMap.get('Strict-Transport-Security')).toContain('max-age=');
    expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headerMap.get('Permissions-Policy')).toContain('camera=()');
  });
});
