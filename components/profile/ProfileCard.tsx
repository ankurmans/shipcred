import type { ToolDeclaration, ScoreBreakdown, GtmCommitTier } from '@/types';
import Avatar from '@/components/shared/Avatar';
import GtmCommitScore from './GtmCommitScore';
import ToolBadges from './ToolBadges';
import PoweredByBadge from './PoweredByBadge';

interface ProfileCardProps {
  profile: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    role: string | null;
    company: string | null;
    gtmcommit_score: number;
    gtmcommit_tier: GtmCommitTier;
    score_breakdown: ScoreBreakdown;
    is_verified: boolean;
  };
  tools?: ToolDeclaration[];
  showPoweredBy?: boolean;
}

export default function ProfileCard({ profile, tools = [], showPoweredBy = true }: ProfileCardProps) {
  return (
    <div className="card-light w-full max-w-md p-6">
      <div className="flex items-center gap-4">
        <Avatar src={profile.avatar_url} alt={profile.display_name} size="lg" isVerified={profile.is_verified} />
        <div>
          <h2 className="text-xl font-bold">{profile.display_name}</h2>
          <p className="text-sm text-fg-muted">@{profile.username}{profile.role && ` · ${profile.role}`}{profile.company && ` @ ${profile.company}`}</p>
        </div>
      </div>
      <div className="mt-4"><GtmCommitScore score={profile.gtmcommit_score} tier={profile.gtmcommit_tier} breakdown={profile.score_breakdown} size="lg" /></div>
      {tools.length > 0 && <div className="mt-4"><ToolBadges tools={tools} /></div>}
      <div className="text-xs text-fg-faint mt-4 text-center">gtmcommit.com/{profile.username}</div>
      {showPoweredBy && <PoweredByBadge />}
    </div>
  );
}
