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
  streak: number;
  dark?: boolean;
}

const TIER_ICONS: Record<string, string> = {
  legend: '🏆',
  captain: '🚀',
  builder: '🔨',
  shipper: '📦',
};

export default function ProfileCardMock({
  name, role, company, avatar, score, tier, tierProgress, tierLabel,
  tier1, tier1Max, tier2, tier2Max, tier3, tier3Max,
  tools, username, streak, dark = false,
}: ProfileCardMockProps) {
  const bg = dark ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = dark ? 'text-white' : 'text-[#1A1A1A]';
  const muted = dark ? 'text-white/40' : 'text-[#999]';
  const subtle = dark ? 'text-white/60' : 'text-[#666]';
  const barBg = dark ? 'bg-[#333]' : 'bg-[#E5E7EB]';
  const divider = dark ? 'border-white/10' : 'border-[#F0F0F0]';

  return (
    <div className={`${bg} w-full min-h-[564px] px-5 py-6 flex flex-col`}>
      {/* Header: avatar + name + streak */}
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
          <div className={`text-[14px] font-bold ${text} truncate leading-tight`}>{name}</div>
          <div className={`text-[11px] ${subtle} truncate`}>{role} @ {company}</div>
        </div>
        {streak > 0 && (
          <div className="px-2.5 py-1 rounded-full gradient-brand">
            <span className="text-[10px] font-bold text-white">{streak}w</span>
          </div>
        )}
      </div>

      {/* Score card */}
      <div className="rounded-2xl p-5 mt-5 gradient-brand">
        <div className="flex items-center gap-4">
          <div className="text-[52px] font-bold font-display text-white leading-none">{score}</div>
          <div>
            <div className="text-[13px] font-semibold text-white">GTM Commit Score</div>
            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>
              <span className="text-[10px]">{TIER_ICONS[tier]}</span>
              <span className="text-[10px] font-semibold text-white capitalize">{tier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier progress */}
      <div className={`border-b ${divider} pb-4 mt-5`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-[11px] ${subtle}`}>{tierLabel}</span>
          <span className={`text-[11px] ${muted}`}>{tierProgress}%</span>
        </div>
        <div className={`w-full h-2 ${barBg} rounded-full overflow-hidden`}>
          <div className="h-full rounded-full gradient-brand" style={{ width: `${tierProgress}%` }} />
        </div>
      </div>

      {/* Tier bars */}
      <div className="mt-5 space-y-4">
        {[
          { label: 'Auto-Verified', value: tier1, max: tier1Max, color: '#10B981' },
          { label: 'Community Verified', value: tier2, max: tier2Max, color: '#3B82F6' },
          { label: 'Self-Reported', value: tier3, max: tier3Max, color: '#F59E0B' },
        ].map(b => (
          <div key={b.label}>
            <div className="flex justify-between mb-1">
              <span className={`text-[11px] font-medium ${subtle}`}>{b.label}</span>
              <span className={`text-[11px] font-mono ${muted}`}>{b.value}/{b.max}</span>
            </div>
            <div className={`w-full h-1.5 ${barBg} rounded-full overflow-hidden`}>
              <div className="h-full rounded-full" style={{ width: `${(b.value / b.max) * 100}%`, backgroundColor: b.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Tools — dot style */}
      <div className="flex flex-wrap gap-3 mt-5">
        {tools.map(t => (
          <span key={t.name} className={`inline-flex items-center gap-1.5 text-[11px] ${subtle}`}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: t.color }} />
            {t.name}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6">
        <div className={`text-[10px] font-mono ${muted}`}>gtmcommit.com/{username}</div>
        <div className={`text-[9px] ${muted} uppercase tracking-widest mt-1`}>Verified proof-of-work</div>
      </div>
    </div>
  );
}
