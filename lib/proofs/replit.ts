import type { ProofVerification } from './verify';
import { safeFetch } from '@/lib/url-validation';

export async function verifyReplit(url: string): Promise<ProofVerification> {
  try {
    const response = await safeFetch(url, { method: 'HEAD' });
    return {
      source_type: 'replit',
      verification_status: response.ok ? 'verified' : 'failed',
      verification_method: 'dns_check',
      platform_data: { http_status: response.status },
    };
  } catch {
    return { source_type: 'replit', verification_status: 'failed', verification_method: 'dns_check', platform_data: { error: 'unreachable' } };
  }
}
