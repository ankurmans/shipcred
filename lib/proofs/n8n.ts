import type { ProofVerification } from './verify';

export async function verifyN8n(url: string): Promise<ProofVerification> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });

    const isTemplate = /n8n\.io\/(workflows|templates)/i.test(url);
    const isCloudInstance = /\.app\.n8n\.cloud/i.test(url);

    return {
      source_type: 'n8n',
      verification_status: response.ok ? 'verified' : 'failed',
      verification_method: isTemplate ? 'template_check' : 'dns_check',
      platform_data: {
        http_status: response.status,
        is_template: isTemplate,
        is_cloud_instance: isCloudInstance,
        server: response.headers.get('server'),
      },
    };
  } catch {
    return {
      source_type: 'n8n',
      verification_status: 'failed',
      verification_method: 'dns_check',
      platform_data: { error: 'unreachable' },
    };
  }
}
