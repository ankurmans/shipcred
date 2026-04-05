import type { ProofVerification } from './verify';

export async function verifyMake(url: string): Promise<ProofVerification> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });

    const isTemplate = /make\.com\/en\/templates/i.test(url);
    const isScenario = /\/scenarios\//i.test(url);

    return {
      source_type: 'make',
      verification_status: response.ok ? 'verified' : 'failed',
      verification_method: isTemplate ? 'template_check' : 'dns_check',
      platform_data: {
        http_status: response.status,
        is_template: isTemplate,
        is_scenario: isScenario,
        server: response.headers.get('server'),
      },
    };
  } catch {
    return {
      source_type: 'make',
      verification_status: 'failed',
      verification_method: 'dns_check',
      platform_data: { error: 'unreachable' },
    };
  }
}
