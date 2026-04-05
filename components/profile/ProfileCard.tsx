import type { Profile, ToolDeclaration, ScoreBreakdown, ShipCredTier } from '@/types';
import Avatar from '@/components/shared/Avatar';
import ShipCredScore from './ShipCredScore';
import ToolBadges from './ToolBadges';
import PoweredByBadge from './PoweredByBadge';

interface ProfileCardProps {
  profile: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    role: string | null;
    company: string | null;
    shipcred_score: number;
    shipcred_tier: ShipCredTier;
    score_breakdown: ScoreBreakdown;
    is_verified: boolean;
  };
  tools?: ToolDeclaration[];
  showPoweredBy?: boolean;
}

export default function ProfileCard({ profile, tools = [], showPoweredBy = true }: ProfileCardProps) {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 w-full max-w-md">
      <div className="card-body p-6">
        {/* Header: Avatar + Name + Role */}
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatar_url}
            alt={profile.display_name}
            size="lg"
            isVerified={profile.is_verified}
          />
          <div>
            <h2 className="text-xl font-bold">{profile.display_name}</h2>
            <p className="text-sm text-base-content/60">
              @{profile.username}
              {profile.role && ` · ${profile.role}`}
              {profile.company && ` @ ${profile.company}`}
            </p>
          </div>
        </div>

        {/* Score */}
        <div className="mt-4">
          <ShipCredScore
            score={profile.shipcred_score}
            tier={profile.shipcred_tier}
            breakdown={profile.score_breakdown}
            size="lg"
          />
        </div>

        {/* Tool badges */}
        {tools.length > 0 && (
          <div className="mt-4">
            <ToolBadges tools={tools} />
          </div>
        )}

        {/* Profile URL */}
        <div className="text-xs text-base-content/40 mt-4 text-center">
          shipcred.io/{profile.username}
        </div>

        {/* Powered by badge */}
        {showPoweredBy && <PoweredByBadge />}
      </div>
    </div>
  );
}
