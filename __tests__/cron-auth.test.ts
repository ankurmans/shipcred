import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    })),
  })),
}));

// Mock sync and other dependencies
vi.mock('@/lib/github/sync', () => ({
  syncGitHubData: vi.fn(),
}));

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(),
}));

vi.mock('@/lib/email/templates/weekly-digest', () => ({
  weeklyDigestEmail: vi.fn(),
}));

vi.mock('@/lib/proofs/anti-gaming', () => ({
  reVerifyProof: vi.fn(),
}));

vi.mock('@/lib/scoring/calculate', () => ({
  calculateGtmCommitScore: vi.fn(() => ({ total: 100 })),
  scoreToTier: vi.fn(() => 'shipper'),
}));

describe('Cron endpoint CRON_SECRET guard', () => {
  const originalEnv = process.env.CRON_SECRET;

  beforeEach(() => {
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CRON_SECRET = originalEnv;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  it('github-sync: returns 500 when CRON_SECRET is not set', async () => {
    const { GET } = await import('@/app/api/cron/github-sync/route');
    const request = new Request('https://example.com/api/cron/github-sync', {
      headers: { authorization: 'Bearer undefined' },
    });
    const response = await GET(request as any);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('Server misconfigured');
  });

  it('github-sync: returns 401 with wrong secret', async () => {
    process.env.CRON_SECRET = 'correct-secret';
    // Need fresh import since module caches env
    vi.resetModules();
    const { GET } = await import('@/app/api/cron/github-sync/route');
    const request = new Request('https://example.com/api/cron/github-sync', {
      headers: { authorization: 'Bearer wrong-secret' },
    });
    const response = await GET(request as any);
    expect(response.status).toBe(401);
  });

  it('digest: returns 500 when CRON_SECRET is not set', async () => {
    vi.resetModules();
    const { GET } = await import('@/app/api/cron/digest/route');
    const request = new Request('https://example.com/api/cron/digest', {
      headers: { authorization: 'Bearer undefined' },
    });
    const response = await GET(request as any);
    expect(response.status).toBe(500);
  });

  it('reverify: returns 500 when CRON_SECRET is not set', async () => {
    vi.resetModules();
    const { GET } = await import('@/app/api/cron/reverify/route');
    const request = new Request('https://example.com/api/cron/reverify', {
      headers: { authorization: 'Bearer undefined' },
    });
    const response = await GET(request as any);
    expect(response.status).toBe(500);
  });

  it('github-sync: blocks "Bearer undefined" even when CRON_SECRET is not set', async () => {
    // This is the critical test: the exact attack vector
    vi.resetModules();
    delete process.env.CRON_SECRET;
    const { GET } = await import('@/app/api/cron/github-sync/route');
    const request = new Request('https://example.com/api/cron/github-sync', {
      headers: { authorization: 'Bearer undefined' },
    });
    const response = await GET(request as any);
    // Should be 500 (misconfigured), NOT 200 (authenticated)
    expect(response.status).not.toBe(200);
    expect(response.status).toBe(500);
  });
});
