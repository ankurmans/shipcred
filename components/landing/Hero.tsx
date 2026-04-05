import ProfileCard from '@/components/profile/ProfileCard';

const MOCK_TOOLS = [
  { id: '1', profile_id: 'mock', tool_name: 'claude_code', proficiency: 'expert' as const, is_verified: true, verified_commit_count: 47, declared_at: '' },
  { id: '2', profile_id: 'mock', tool_name: 'cursor', proficiency: 'power_user' as const, is_verified: true, verified_commit_count: 23, declared_at: '' },
  { id: '3', profile_id: 'mock', tool_name: 'clay', proficiency: 'user' as const, is_verified: false, verified_commit_count: 0, declared_at: '' },
];

export default function Hero() {
  return (
    <section className="hero min-h-screen bg-neutral text-neutral-content">
      <div className="hero-content flex-col lg:flex-row-reverse gap-12 max-w-6xl mx-auto px-4">
        {/* Mock Profile Card */}
        <div className="hidden lg:block animate-pulse-slow">
          <ProfileCard
            profile={{
              username: 'sarahchen',
              display_name: 'Sarah Chen',
              avatar_url: null,
              role: 'Growth Engineer',
              company: 'Ramp',
              shipcred_score: 724,
              shipcred_tier: 'captain',
              score_breakdown: { github: 450, portfolio: 150, vouches: 74, tools: 50 },
              is_verified: true,
            }}
            tools={MOCK_TOOLS}
          />
        </div>

        {/* Copy */}
        <div className="max-w-lg">
          <h1 className="text-5xl lg:text-6xl font-extrabold font-[family-name:var(--font-dm-sans)] leading-tight">
            Talk is cheap. Commits aren&apos;t.
          </h1>
          <p className="mt-6 text-lg text-neutral-content/70">
            The proof-of-work network for AI-native GTM professionals.
            Connect GitHub. Show what you&apos;ve shipped. Get your ShipCred.
          </p>
          <a
            href="/api/auth/github"
            className="btn btn-primary btn-lg mt-8"
          >
            Get Your ShipCred →
          </a>
          <p className="text-sm text-neutral-content/50 mt-4">
            Join the first builders who prove they ship — not just talk.
          </p>
        </div>
      </div>
    </section>
  );
}
