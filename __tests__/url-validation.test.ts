import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isPrivateIP, validateUrl, UrlValidationError } from '@/lib/url-validation';

// Mock dns resolution
vi.mock('node:dns/promises', () => ({
  resolve4: vi.fn(),
  resolve6: vi.fn(),
}));

import { resolve4, resolve6 } from 'node:dns/promises';

const mockResolve4 = vi.mocked(resolve4);
const mockResolve6 = vi.mocked(resolve6);

describe('isPrivateIP', () => {
  // IPv4 private ranges
  it.each([
    ['127.0.0.1', true],
    ['127.255.255.255', true],
    ['10.0.0.1', true],
    ['10.255.255.255', true],
    ['172.16.0.1', true],
    ['172.31.255.255', true],
    ['192.168.0.1', true],
    ['192.168.255.255', true],
    ['169.254.169.254', true], // Cloud metadata
    ['169.254.0.1', true],
    ['0.0.0.0', true],
    ['224.0.0.1', true],  // Multicast
    ['240.0.0.1', true],  // Reserved
    ['255.255.255.255', true],  // Broadcast
    ['100.64.0.1', true],  // CGNAT
    ['100.127.255.255', true],  // CGNAT
    ['192.0.0.1', true],  // IETF
    ['192.0.2.1', true],  // TEST-NET-1
    ['198.51.100.1', true],  // TEST-NET-2
    ['203.0.113.1', true],  // TEST-NET-3
  ])('should block private IPv4 %s → %s', (ip, expected) => {
    expect(isPrivateIP(ip)).toBe(expected);
  });

  // IPv4 public ranges
  it.each([
    ['8.8.8.8', false],
    ['1.1.1.1', false],
    ['93.184.216.34', false],
    ['172.15.255.255', false],  // Just below 172.16
    ['172.32.0.0', false],  // Just above 172.31
    ['192.169.0.1', false],  // Just above 192.168
    ['100.63.255.255', false],  // Just below CGNAT
    ['100.128.0.0', false],  // Just above CGNAT
  ])('should allow public IPv4 %s → %s', (ip, expected) => {
    expect(isPrivateIP(ip)).toBe(expected);
  });

  // IPv6
  it.each([
    ['::1', true],  // Loopback
    ['::', true],  // Unspecified
    ['fc00::1', true],  // Unique local
    ['fd00::1', true],  // Unique local
    ['fe80::1', true],  // Link-local
    ['ff02::1', true],  // Multicast
  ])('should block private IPv6 %s → %s', (ip, expected) => {
    expect(isPrivateIP(ip)).toBe(expected);
  });

  it.each([
    ['2607:f8b0:4004:800::200e', false],  // Google public
    ['2001:db8::1', false],  // Documentation (not private in our list, but could be added)
  ])('should allow public IPv6 %s → %s', (ip, expected) => {
    expect(isPrivateIP(ip)).toBe(expected);
  });
});

describe('validateUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: resolve to a safe public IP
    mockResolve4.mockResolvedValue(['93.184.216.34']);
    mockResolve6.mockRejectedValue(new Error('no AAAA'));
  });

  it('should accept a valid HTTPS URL', async () => {
    const result = await validateUrl('https://example.com');
    expect(result.hostname).toBe('example.com');
  });

  it('should reject HTTP URLs', async () => {
    await expect(validateUrl('http://example.com')).rejects.toThrow(UrlValidationError);
    await expect(validateUrl('http://example.com')).rejects.toThrow('Only HTTPS URLs are allowed');
  });

  it('should reject invalid URLs', async () => {
    await expect(validateUrl('not-a-url')).rejects.toThrow('Invalid URL');
    await expect(validateUrl('')).rejects.toThrow('Invalid URL');
  });

  it('should reject FTP and other protocols', async () => {
    await expect(validateUrl('ftp://example.com')).rejects.toThrow('Only HTTPS');
    await expect(validateUrl('file:///etc/passwd')).rejects.toThrow('Only HTTPS');
    await expect(validateUrl('javascript:alert(1)')).rejects.toThrow('Only HTTPS');
  });

  // Blocked hostnames
  it('should reject localhost', async () => {
    await expect(validateUrl('https://localhost')).rejects.toThrow('not allowed');
    await expect(validateUrl('https://localhost:3000')).rejects.toThrow('not allowed');
  });

  it('should reject metadata hostname', async () => {
    await expect(validateUrl('https://metadata.google.internal')).rejects.toThrow('not allowed');
  });

  // Private IP direct access
  it('should reject private IPv4 in URL', async () => {
    await expect(validateUrl('https://127.0.0.1')).rejects.toThrow('private IP');
    await expect(validateUrl('https://10.0.0.1')).rejects.toThrow('private IP');
    await expect(validateUrl('https://192.168.1.1')).rejects.toThrow('private IP');
    await expect(validateUrl('https://169.254.169.254')).rejects.toThrow('private IP');
  });

  // DNS resolution to private IP (DNS rebinding defense)
  it('should reject URLs that resolve to private IPs via DNS', async () => {
    mockResolve4.mockResolvedValue(['127.0.0.1']);
    await expect(validateUrl('https://evil.example.com')).rejects.toThrow('private IP');
  });

  it('should reject URLs that resolve to cloud metadata IP via DNS', async () => {
    mockResolve4.mockResolvedValue(['169.254.169.254']);
    await expect(validateUrl('https://evil.example.com')).rejects.toThrow('private IP');
  });

  it('should reject URLs that resolve to internal network via DNS', async () => {
    mockResolve4.mockResolvedValue(['10.0.0.5']);
    await expect(validateUrl('https://internal.example.com')).rejects.toThrow('private IP');
  });

  it('should reject if DNS resolution fails completely', async () => {
    mockResolve4.mockRejectedValue(new Error('ENOTFOUND'));
    mockResolve6.mockRejectedValue(new Error('ENOTFOUND'));
    await expect(validateUrl('https://nonexistent.example.com')).rejects.toThrow('could not be resolved');
  });

  it('should allow URLs that resolve to public IPs', async () => {
    mockResolve4.mockResolvedValue(['93.184.216.34']);
    const result = await validateUrl('https://example.com');
    expect(result.hostname).toBe('example.com');
  });

  it('should reject if any resolved IP is private (mixed results)', async () => {
    mockResolve4.mockResolvedValue(['93.184.216.34', '10.0.0.1']);
    await expect(validateUrl('https://evil.example.com')).rejects.toThrow('private IP');
  });

  it('should accept public IP as hostname', async () => {
    // Public IP literal in URL — no DNS needed but validate still runs
    mockResolve4.mockResolvedValue(['93.184.216.34']);
    const result = await validateUrl('https://93.184.216.34');
    expect(result).toBeDefined();
  });
});
