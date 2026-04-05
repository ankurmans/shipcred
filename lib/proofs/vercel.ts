import type { ProofVerification } from './verify';

export async function verifyVercel(url: string): Promise<ProofVerification> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });

    return {
      source_type: 'vercel',
      verification_status: response.ok ? 'verified' : 'failed',
      verification_method: 'dns_check',
      platform_data: {
        http_status: response.status,
        server: response.headers.get('server'),
        x_vercel_id: response.headers.get('x-vercel-id'),
      },
    };
  } catch {
    return {
      source_type: 'vercel',
      verification_status: 'failed',
      verification_method: 'dns_check',
      platform_data: { error: 'unreachable' },
    };
  }
}
