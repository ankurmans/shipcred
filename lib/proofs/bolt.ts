import type { ProofVerification } from './verify';

export async function verifyBolt(url: string): Promise<ProofVerification> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return {
      source_type: 'bolt',
      verification_status: response.ok ? 'verified' : 'failed',
      verification_method: 'dns_check',
      platform_data: { http_status: response.status },
    };
  } catch {
    return { source_type: 'bolt', verification_status: 'failed', verification_method: 'dns_check', platform_data: { error: 'unreachable' } };
  }
}
