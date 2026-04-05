import type { Vouch, Profile } from '@/types';

interface VouchSectionProps {
  vouches: (Vouch & { voucher?: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> })[];
}

export default function VouchSection({ vouches }: VouchSectionProps) {
  if (!vouches.length) return null;

  return (
    <div>
      <h3 className="font-display text-lg font-semibold mb-3">Vouches ({vouches.length})</h3>
      <div className="space-y-3">
        {vouches.map((v) => (
          <div key={v.id} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(v.voucher?.display_name || 'U').charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium">{v.voucher?.display_name || 'Anonymous'}</div>
              {v.message && <p className="text-xs text-fg-muted mt-0.5">&ldquo;{v.message}&rdquo;</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
