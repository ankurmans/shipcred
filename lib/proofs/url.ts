import type { ProofVerification } from './verify';

export async function verifyGenericURL(url: string): Promise<ProofVerification> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return {
      source_type: 'custom_url',
      verification_status: response.ok ? 'verified' : 'failed',
      verification_method: 'dns_check',
      platform_data: {
        http_status: response.status,
        content_type: response.headers.get('content-type'),
        server: response.headers.get('server'),
      },
    };
  } catch {
    return {
      source_type: 'custom_url',
      verification_status: 'failed',
      verification_method: 'dns_check',
      platform_data: { error: 'unreachable' },
    };
  }
}
