import type { Certification } from '@/types';

interface Props {
  certifications: Certification[];
}

const ISSUER_LABELS: Record<string, string> = {
  openai: 'OpenAI', credly: 'Credly', clay: 'Clay', hubspot: 'HubSpot',
  gtm_ai_academy: 'GTM AI Academy', pma: 'Product Marketing Alliance',
  pavilion: 'Pavilion', other: 'Other',
};

export default function Certifications({ certifications }: Props) {
  if (!certifications.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Certifications</h3>
      <div className="space-y-3">
        {certifications.map(cert => (
          <a
            key={cert.id}
            href={cert.cert_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-surface-secondary rounded-card p-3 hover:bg-surface-muted transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{cert.cert_name}</span>
                {cert.verification_status === 'auto_verified' ? (
                  <span className="badge bg-green-100 text-green-700 text-[10px]">Verified</span>
                ) : cert.verification_status === 'vouch_verified' ? (
                  <span className="badge bg-blue-100 text-blue-700 text-[10px]">Vouched</span>
                ) : (
                  <span className="badge bg-yellow-100 text-yellow-700 text-[10px]">Pending</span>
                )}
              </div>
              <p className="text-xs text-fg-muted mt-0.5">
                {ISSUER_LABELS[cert.issuer] || cert.issuer}
                {cert.issued_at && ` · ${new Date(cert.issued_at).toLocaleDateString()}`}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
