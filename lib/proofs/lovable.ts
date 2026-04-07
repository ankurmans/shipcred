import type { ProofVerification } from './verify';
import { safeFetch } from '@/lib/url-validation';

export async function verifyLovable(url: string): Promise<ProofVerification> {
  try {
    const response = await safeFetch(url);
    if (!response.ok) {
      return { source_type: 'lovable', verification_status: 'failed', verification_method: 'api_lookup', platform_data: {} };
    }

    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/);

    return {
      source_type: 'lovable',
      verification_status: 'verified',
      verification_method: 'api_lookup',
      platform_data: {
        project_title: titleMatch?.[1] || 'Unknown',
        public: true,
      },
    };
  } catch {
    return { source_type: 'lovable', verification_status: 'failed', verification_method: 'api_lookup', platform_data: { error: 'unreachable' } };
  }
}
