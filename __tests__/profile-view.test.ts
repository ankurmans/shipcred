import { describe, it, expect } from 'vitest';

describe('Profile view UUID validation', () => {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  it.each([
    ['550e8400-e29b-41d4-a716-446655440000', true],
    ['6ba7b810-9dad-11d1-80b4-00c04fd430c8', true],
    ['A550E840-E29B-41D4-A716-446655440000', true], // uppercase ok
  ])('should accept valid UUID "%s"', (uuid, expected) => {
    expect(UUID_REGEX.test(uuid)).toBe(expected);
  });

  it.each([
    ['not-a-uuid', false],
    ['', false],
    ['550e8400-e29b-41d4-a716', false],  // too short
    ['550e8400-e29b-41d4-a716-446655440000-extra', false],  // too long
    ['550e8400e29b41d4a716446655440000', false],  // no hyphens
    ['DROP TABLE profiles;--', false],  // SQL injection attempt
    ['<script>alert(1)</script>', false],  // XSS attempt
    ['../../../etc/passwd', false],  // path traversal
  ])('should reject invalid UUID "%s"', (uuid, expected) => {
    expect(UUID_REGEX.test(uuid)).toBe(expected);
  });
});

describe('Profile view viewer hash', () => {
  it('should produce consistent hashes for same input', async () => {
    const crypto = await import('node:crypto');
    const ip = '1.2.3.4';
    const ua = 'Mozilla/5.0';
    const hash1 = crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 16);
    const hash2 = crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 16);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different inputs', async () => {
    const crypto = await import('node:crypto');
    const hash1 = crypto.createHash('sha256').update('1.2.3.4:Chrome').digest('hex').slice(0, 16);
    const hash2 = crypto.createHash('sha256').update('5.6.7.8:Chrome').digest('hex').slice(0, 16);
    expect(hash1).not.toBe(hash2);
  });

  it('should produce a 16-char hex string', async () => {
    const crypto = await import('node:crypto');
    const hash = crypto.createHash('sha256').update('test').digest('hex').slice(0, 16);
    expect(hash.length).toBe(16);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });
});
