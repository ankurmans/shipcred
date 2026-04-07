import Image from 'next/image';

interface ProfileCardMockProps {
  name: string;
  role: string;
  company: string;
  avatar: string;
  score: number;
  tier: string;
  tierProgress: number;
  tierLabel: string;
  tier1: number;
  tier1Max: number;
  tier2: number;
  tier2Max: number;
  tier3: number;
  tier3Max: number;
  tools: { name: string; color: string }[];
  username: string;
  dark?: boolean;
}

const TIER_COLORS: Record<string, string> = {
  legend: '#F59E0B',
  captain: '#6366F1',
  builder: '#FF5C00',
  shipper: '#6B7280',
};

export default function ProfileCardMock({
  name, role, company, avatar, score, tier, tierProgress, tierLabel,
  tier1, tier1Max, tier2, tier2Max, tier3, tier3Max,
  tools, username, dark = false,
}: ProfileCardMockProps) {
  const bg = dark ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = dark ? 'text-white' : 'text-[#1A1A1A]';
  const muted = dark ? 'text-white/50' : 'text-[#767676]';
  const cardBg = dark ? 'bg-[#242424]' : 'bg-[#F7F8FA]';
  const barBg = dark ? 'bg-[#333]' : 'bg-[#E5E7EB]';
  const tierColor = TIER_COLORS[tier] || '#FF5C00';

  return (
    <div className={`${bg} w-full h-full px-5 py-6 flex flex-col`}>
      {/* Header: avatar + name */}
      <div className="flex items-center gap-3">
        <Image
          src={avatar}
          alt={name}
          width={44}
          height={44}
          className="rounded-full object-cover"
          style={{ width: 44, height: 44 }}
        />
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-bold ${text} truncate`}>{name}</div>
          <div className={`text-[10px] ${muted} truncate`}>{role} @ {company}</div>
        </div>
        <div className="text-[10px] font-mono text-green-500 font-bold">6.8w</div>
      </div>

      {/* Score */}
      <div className={`${cardBg} rounded-2xl p-5 mt-4`}>
        <div className="flex items-center gap-4">
          <div className="text-5xl font-bold font-display" style={{ color: tierColor }}>{score}</div>
          <div>
            <div className={`text-sm font-semibold ${text}`}>GTM Commit Score</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs" style={{ color: tierColor }}>
                {tier === 'legend' ? '🏆' : tier === 'captain' ? '🚀' : tier === 'builder' ? '🔨' : '📦'}
              </span>
              <span className="text-xs font-medium capitalize" style={{ color: tierColor }}>{tier}</span>
            </div>
          </div>
        </div>

        {/* Tier progress */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className={`text-[9px] ${muted}`}>{tierLabel}</span>
            <span className={`text-[9px] ${muted}`}>{tierProgress}%</span>
          </div>
          <div className={`w-full h-1.5 ${barBg} rounded-full overflow-hidden`}>
            <div className="h-full rounded-full" style={{ width: `${tierProgress}%`, background: `linear-gradient(90deg, ${tierColor}, ${tierColor}dd)` }} />
          </div>
        </div>
      </div>

      {/* Tier bars */}
      <div className="mt-4 space-y-2.5">
        {[
          { label: 'Auto-Verified', value: tier1, max: tier1Max, color: '#10B981' },
          { label: 'Community Verified', value: tier2, max: tier2Max, color: '#3B82F6' },
          { label: 'Self-Reported', value: tier3, max: tier3Max, color: '#F59E0B' },
        ].map(b => (
          <div key={b.label}>
            <div className="flex justify-between mb-0.5">
              <span className={`text-[9px] ${muted}`}>{b.label}</span>
              <span className={`text-[9px] font-mono ${muted}`}>{b.value}/{b.max}</span>
            </div>
            <div className={`w-full h-1 ${barBg} rounded-full overflow-hidden`}>
              <div className="h-full rounded-full" style={{ width: `${(b.value / b.max) * 100}%`, backgroundColor: b.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Tools */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {tools.map(t => (
          <span key={t.name} className="inline-flex items-center gap-1 text-[9px] font-mono font-medium px-2 py-0.5 rounded-full" style={{ color: t.color, backgroundColor: `${t.color}15` }}>
            <span style={{ color: t.color }}>✓</span> {t.name}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 flex justify-between items-center">
        <span className={`text-[8px] font-mono ${muted}`}>gtmcommit.com/{username}</span>
        <span className={`text-[8px] ${muted} uppercase tracking-wider`}>Verified proof-of-work</span>
      </div>
    </div>
  );
}
