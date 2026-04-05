import Avatar from '@/components/shared/Avatar';

interface ProfileSummary {
  username: string;
  display_name: string;
  avatar_url: string | null;
  gtmcommit_score: number;
  gtmcommit_tier: string;
  role: string | null;
}

function TierLabel({ tier }: { tier: string }) {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);
  const colors: Record<string, string> = {
    legend: 'text-amber-600 bg-amber-50',
    captain: 'text-brand bg-brand-50',
    builder: 'text-indigo-600 bg-indigo-50',
    shipper: 'text-green-600 bg-green-50',
    unranked: 'text-fg-muted bg-surface-muted',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[tier] || colors.unranked}`}>
      {label}
    </span>
  );
}

export default function CompareCard({ left, right }: { left: ProfileSummary; right: ProfileSummary }) {
  const winner = left.gtmcommit_score > right.gtmcommit_score ? 'left' : right.gtmcommit_score > left.gtmcommit_score ? 'right' : 'tie';

  return (
    <div className="grid grid-cols-2 gap-6">
      {[{ profile: left, side: 'left' as const }, { profile: right, side: 'right' as const }].map(({ profile, side }) => (
        <div
          key={side}
          className={`bg-white border rounded-2xl p-6 text-center ${
            winner === side ? 'border-brand shadow-card-hover' : 'border-surface-border'
          }`}
        >
          {winner === side && (
            <div className="text-xs font-bold text-brand mb-3">WINNER</div>
          )}
          <div className="flex justify-center mb-3">
            <Avatar src={profile.avatar_url} alt={profile.display_name} size="lg" />
          </div>
          <h3 className="font-display text-lg font-bold">{profile.display_name}</h3>
          <p className="text-sm text-fg-muted mb-3">@{profile.username}</p>
          <div className="text-4xl font-bold text-brand mb-2">{profile.gtmcommit_score}</div>
          <TierLabel tier={profile.gtmcommit_tier} />
        </div>
      ))}
    </div>
  );
}
