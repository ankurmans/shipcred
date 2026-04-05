import type { ProofVerification } from './verify';

export async function verifyClay(url: string): Promise<ProofVerification> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });

    return {
      source_type: 'clay',
      verification_status: response.ok ? 'verified' : 'failed',
      verification_method: 'dns_check',
      platform_data: {
        http_status: response.status,
        is_workspace: /workspaces/i.test(url),
        is_table: /tables/i.test(url),
        is_public: /public/i.test(url),
        content_type: response.headers.get('content-type'),
      },
    };
  } catch {
    return {
      source_type: 'clay',
      verification_status: 'failed',
      verification_method: 'dns_check',
      platform_data: { error: 'unreachable' },
    };
  }
}
