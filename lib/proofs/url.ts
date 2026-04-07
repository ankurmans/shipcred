import type { ProofVerification } from './verify';
import { safeFetch } from '@/lib/url-validation';

export async function verifyGenericURL(url: string): Promise<ProofVerification> {
  try {
    const response = await safeFetch(url, { method: 'HEAD' });
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
