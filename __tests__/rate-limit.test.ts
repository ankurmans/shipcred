import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit, getRateLimitKey, getUserRateLimitKey } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests under the limit', () => {
    const result = rateLimit('test-allow', { windowMs: 60000, max: 5 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should track remaining count correctly', () => {
    const config = { windowMs: 60000, max: 3 };
    const r1 = rateLimit('test-count', config);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit('test-count', config);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimit('test-count', config);
    expect(r3.remaining).toBe(0);
  });

  it('should block requests over the limit', () => {
    const config = { windowMs: 60000, max: 2 };

    rateLimit('test-block', config);
    rateLimit('test-block', config);

    const result = rateLimit('test-block', config);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThanOrEqual(0);
  });

  it('should reset after the window expires', () => {
    const config = { windowMs: 1000, max: 1 };

    rateLimit('test-reset', config);
    const blocked = rateLimit('test-reset', config);
    expect(blocked.success).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(1001);

    const allowed = rateLimit('test-reset', config);
    expect(allowed.success).toBe(true);
  });

  it('should isolate different keys', () => {
    const config = { windowMs: 60000, max: 1 };

    rateLimit('user-a', config);
    const resultA = rateLimit('user-a', config);
    expect(resultA.success).toBe(false);

    // Different key should still be allowed
    const resultB = rateLimit('user-b', config);
    expect(resultB.success).toBe(true);
  });

  it('should use sliding window (not fixed window)', () => {
    const config = { windowMs: 1000, max: 2 };

    // t=0: first request
    rateLimit('test-sliding', config);

    // t=500: second request
    vi.advanceTimersByTime(500);
    rateLimit('test-sliding', config);

    // t=500: should be blocked (2 requests in last 1000ms)
    const blocked = rateLimit('test-sliding', config);
    expect(blocked.success).toBe(false);

    // t=1001: first request expired, should allow one more
    vi.advanceTimersByTime(501);
    const allowed = rateLimit('test-sliding', config);
    expect(allowed.success).toBe(true);
  });

  it('should provide retryAfterMs when blocked', () => {
    const config = { windowMs: 10000, max: 1 };

    rateLimit('test-retry', config);

    vi.advanceTimersByTime(3000);
    const result = rateLimit('test-retry', config);
    expect(result.success).toBe(false);
    // Should be about 7000ms remaining (10000 - 3000)
    expect(result.retryAfterMs).toBeGreaterThan(6000);
    expect(result.retryAfterMs).toBeLessThanOrEqual(7000);
  });
});

describe('getRateLimitKey', () => {
  it('should extract IP from x-forwarded-for', () => {
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getRateLimitKey(request, 'test')).toBe('test:1.2.3.4');
  });

  it('should fall back to x-real-ip', () => {
    const request = new Request('https://example.com', {
      headers: { 'x-real-ip': '1.2.3.4' },
    });
    expect(getRateLimitKey(request, 'test')).toBe('test:1.2.3.4');
  });

  it('should use unknown when no IP headers present', () => {
    const request = new Request('https://example.com');
    expect(getRateLimitKey(request, 'test')).toBe('test:unknown');
  });
});

describe('getUserRateLimitKey', () => {
  it('should create a user-scoped key', () => {
    expect(getUserRateLimitKey('user-123', 'sync')).toBe('sync:user:user-123');
  });
});
