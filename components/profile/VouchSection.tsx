import type { Vouch, Profile } from '@/types';
import Avatar from '@/components/shared/Avatar';

interface VouchSectionProps {
  vouches: (Vouch & { voucher?: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> })[];
}

export default function VouchSection({ vouches }: VouchSectionProps) {
  if (!vouches.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">
        Vouches ({vouches.length})
      </h3>
      <div className="space-y-3">
        {vouches.map((vouch) => (
          <div key={vouch.id} className="flex gap-3 items-start">
            <Avatar
              src={vouch.voucher?.avatar_url || null}
              alt={vouch.voucher?.display_name || 'User'}
              size="sm"
            />
            <div>
              <div className="text-sm font-medium">
                {vouch.voucher?.display_name || 'Anonymous'}
              </div>
              {vouch.message && (
                <p className="text-xs text-base-content/60 mt-0.5">
                  &ldquo;{vouch.message}&rdquo;
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
