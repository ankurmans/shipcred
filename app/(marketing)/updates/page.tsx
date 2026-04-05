import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';
import { LuRocket, LuWrench, LuShield, LuLayoutDashboard, LuGitBranch } from 'react-icons/lu';

export const metadata = { title: 'Updates', description: 'What we\'ve shipped and when — the GTM Commit changelog.' };

const UPDATES = [
  {
    date: 'April 5, 2026',
    entries: [
      {
        type: 'feat' as const,
        title: 'Login page with GitHub, Google & LinkedIn',
        description: 'Multiple sign-in options so you can get started with whatever account you prefer.',
      },
      {
        type: 'feat' as const,
        title: 'Privacy policy',
        description: 'Full privacy policy page covering how we handle your data, GitHub tokens, and commit metadata.',
      },
      {
        type: 'fix' as const,
        title: 'Score calculation fixes',
        description: 'Fixed anti-gaming filters that were incorrectly rejecting legitimate commits. First-time users now get scored properly without velocity limits.',
      },
      {
        type: 'fix' as const,
        title: 'Dynamic rendering for onboarding & leaderboard',
        description: 'Pages that depend on live data now render correctly on every visit.',
      },
    ],
  },
  {
    date: 'April 4, 2026',
    entries: [
      {
        type: 'launch' as const,
        title: 'GTM Commit goes live',
        description: 'Initial launch with GitHub OAuth, AI commit detection (Claude Code, Copilot, Cursor, Aider), proof-of-work scoring, public profiles, and community leaderboard.',
      },
    ],
  },
];

const TYPE_CONFIG = {
  launch: { label: 'Launch', icon: LuRocket, color: 'text-brand bg-brand-50' },
  feat: { label: 'New', icon: LuLayoutDashboard, color: 'text-indigo-600 bg-indigo-50' },
  fix: { label: 'Fix', icon: LuWrench, color: 'text-amber-600 bg-amber-50' },
  security: { label: 'Security', icon: LuShield, color: 'text-red-600 bg-red-50' },
};

export default function UpdatesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <h1 className="font-display text-4xl font-bold">Updates</h1>
          <p className="text-lg text-fg-secondary mt-2">What we&apos;ve shipped and when.</p>

          <div className="mt-10 relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-0 w-px bg-surface-border" />

            {UPDATES.map((group, gi) => (
              <div key={gi} className={gi > 0 ? 'mt-10' : ''}>
                {/* Date marker */}
                <div className="flex items-center gap-3 relative">
                  <div className="w-[15px] h-[15px] rounded-full bg-brand border-2 border-white shrink-0 z-10" />
                  <h2 className="font-display text-lg font-bold text-fg-primary">{group.date}</h2>
                </div>

                {/* Entries */}
                <div className="ml-[7px] pl-6 border-l border-transparent space-y-4 mt-4">
                  {group.entries.map((entry, ei) => {
                    const config = TYPE_CONFIG[entry.type];
                    const Icon = config.icon;
                    return (
                      <div key={ei} className="bg-white border border-surface-border rounded-xl p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
                            <Icon size={12} />
                            {config.label}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-fg-primary">{entry.title}</h3>
                        <p className="text-sm text-fg-secondary mt-1 leading-relaxed">{entry.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div className="mt-12 flex items-center gap-2 text-sm text-fg-muted">
            <LuGitBranch size={16} />
            <span>Built in public. Every feature shipped with Claude Code.</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
