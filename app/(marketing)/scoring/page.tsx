import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';
import { LuShield, LuUsers, LuPenLine, LuGitCommitHorizontal, LuCode, LuLock, LuFlame, LuGlobe, LuAward, LuWrench, LuCalendar } from 'react-icons/lu';

export const metadata = {
  title: 'How Scoring Works — GTM Commit',
  description: 'Our transparent scoring algorithm: how your GTM Commit Score is calculated from verified commits, deployments, certifications, and community endorsements.',
};

const TIER_1_ITEMS = [
  {
    icon: LuGitCommitHorizontal,
    label: 'GitHub AI Commits',
    max: 350,
    description: 'We scan your commits for AI tool signatures — Claude Code, Cursor, Copilot, Aider, and more. Volume follows a logarithmic curve (diminishing returns past ~100 commits), plus bonuses for repo diversity, tool variety, recency, and velocity.',
    details: [
      'Volume: logarithmic scale, rewarding consistent output over burst activity',
      'Repo diversity: commits across multiple repos score higher than one repo',
      'Tool diversity: using Claude Code + Cursor + Copilot scores higher than one tool',
      'Recency: commits in the last 30 days get a recency bonus',
      'Velocity: 50+ AI commits in a month unlocks a velocity multiplier',
    ],
  },
  {
    icon: LuCode,
    label: 'Code Impact',
    max: 60,
    description: 'Total lines of code added and deleted across your AI-assisted commits. Logarithmic scale — shipping 10K+ lines demonstrates real output, not just config tweaks.',
  },
  {
    icon: LuLock,
    label: 'Private Repo Work',
    max: 40,
    description: 'Using AI tools on private repositories indicates professional usage — real company work, not just toy projects. The higher your private repo ratio, the higher this bonus.',
    details: [
      '50%+ private commits: 40 pts (max)',
      '30%+ private: 30 pts',
      '10%+ private: 20 pts',
      'Any private commits: 10 pts',
    ],
  },
  {
    icon: LuGlobe,
    label: 'Platform Deployments',
    max: 150,
    description: 'Verified deployments on Vercel, Lovable, Bolt, v0, Replit, Clay, n8n, Make.com, and other platforms. Each verified deployment earns 30 pts, with a diversity bonus for shipping across multiple platforms.',
  },
  {
    icon: LuAward,
    label: 'Certifications',
    max: 80,
    description: 'Auto-verified certifications from recognized platforms: Clay University, Credly, OpenAI, HubSpot Academy, n8n, Make.com, and more. Points vary by issuer, deduplicated per platform.',
  },
  {
    icon: LuWrench,
    label: 'Tool Diversity',
    max: 80,
    description: 'How many distinct AI tools you actively use, detected from commits, deployments, declarations, and uploaded config files. Using 5+ tools shows adaptability across the AI stack.',
    details: [
      '7+ tools: 80 pts',
      '5+ tools: 60 pts',
      '3+ tools: 40 pts',
      '2+ tools: 20 pts',
    ],
  },
  {
    icon: LuCalendar,
    label: 'Consistency',
    max: 50,
    description: 'How many distinct months you have been active. Spreading your work over 6+ months proves sustained AI adoption, not a one-week experiment.',
  },
  {
    icon: LuFlame,
    label: 'Shipping Streak',
    max: 50,
    description: 'Consecutive weeks of AI-assisted commits. Your current streak and longest streak both contribute. A 12+ week streak earns the maximum bonus.',
  },
];

const TIERS = [
  { name: 'Unranked', range: '0-49', color: 'text-fg-muted', bg: 'bg-gray-100' },
  { name: 'Shipper', range: '50-249', color: 'text-fg-secondary', bg: 'bg-stone-100' },
  { name: 'Builder', range: '250-499', color: 'text-orange-600', bg: 'bg-orange-50' },
  { name: 'Captain', range: '500-749', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'Legend', range: '750+', color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function ScoringPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Header */}
          <h1 className="font-display text-4xl font-bold">How Scoring Works</h1>
          <p className="text-lg text-fg-secondary mt-4">
            Your GTM Commit Score (0-1,000) measures verified proof-of-work with AI tools.
            The algorithm is weighted by verification level — auto-verified proof from GitHub
            counts the most. Self-reported claims count the least. That&apos;s the point.
          </p>

          {/* Three-tier overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <LuShield size={18} className="text-green-600" />
                <h3 className="font-display font-bold text-green-700">Auto-Verified</h3>
              </div>
              <div className="text-3xl font-bold text-green-700">700</div>
              <p className="text-xs text-green-600 mt-1">max points</p>
              <p className="text-sm text-green-700/70 mt-2">
                Detected automatically from GitHub, deployments, and recognized certifications. Unfakeable.
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <LuUsers size={18} className="text-blue-600" />
                <h3 className="font-display font-bold text-blue-700">Community Verified</h3>
              </div>
              <div className="text-3xl font-bold text-blue-700">200</div>
              <p className="text-xs text-blue-600 mt-1">max points</p>
              <p className="text-sm text-blue-700/70 mt-2">
                Portfolio items, videos, content, and uploads that have been vouched by 2+ other builders.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <LuPenLine size={18} className="text-amber-600" />
                <h3 className="font-display font-bold text-amber-700">Self-Reported</h3>
              </div>
              <div className="text-3xl font-bold text-amber-700">100</div>
              <p className="text-xs text-amber-600 mt-1">max points</p>
              <p className="text-sm text-amber-700/70 mt-2">
                Unvouched portfolio items, tool declarations, and profile completeness. Lowest weight by design.
              </p>
            </div>
          </div>

          {/* Tier 1 breakdown */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <LuShield size={20} className="text-green-600" />
              <h2 className="font-display text-2xl font-bold">Auto-Verified Scoring (700 pts)</h2>
            </div>

            <div className="space-y-6">
              {TIER_1_ITEMS.map((item) => (
                <div key={item.label} className="bg-surface-secondary rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold">{item.label}</h3>
                        <span className="text-sm font-mono text-green-600 font-bold">{item.max} pts</span>
                      </div>
                      <p className="text-sm text-fg-secondary mt-1 leading-relaxed">{item.description}</p>
                      {item.details && (
                        <ul className="mt-3 space-y-1">
                          {item.details.map((d, i) => (
                            <li key={i} className="text-xs text-fg-muted flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">-</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 2 */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <LuUsers size={20} className="text-blue-600" />
              <h2 className="font-display text-2xl font-bold">Community Verified (200 pts)</h2>
            </div>
            <p className="text-sm text-fg-secondary mb-4">
              Items that have received 2+ vouches from other GTM Commit members. To vouch,
              a member must have 50+ points, a 7-day-old account, and at least one verified proof source.
              Mutual vouches (A vouches B, B vouches A) are penalized at 50% value.
            </p>
            <div className="bg-surface-secondary rounded-xl p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Vouched Portfolio', max: 100 },
                  { label: 'Vouched Videos', max: 50 },
                  { label: 'Vouched Uploads', max: 40 },
                  { label: 'Vouched Content', max: 40 },
                  { label: 'Vouch-Verified Certs', max: 30 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-blue-600 font-mono font-bold mt-0.5">{item.max} pts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <LuPenLine size={20} className="text-amber-600" />
              <h2 className="font-display text-2xl font-bold">Self-Reported (100 pts)</h2>
            </div>
            <p className="text-sm text-fg-secondary mb-4">
              Unverified claims and profile completeness. These have the lowest weight because anyone
              can add them without proof. Get your work vouched to move items to Tier 2.
            </p>
            <div className="bg-surface-secondary rounded-xl p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Portfolio Items', max: 30 },
                  { label: 'Uploaded Files', max: 25 },
                  { label: 'Video Proofs', max: 20 },
                  { label: 'Published Content', max: 15 },
                  { label: 'Tool Declarations', max: 15 },
                  { label: 'Profile Completeness', max: 15 },
                  { label: 'Pending Certs', max: 10 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-amber-600 font-mono font-bold mt-0.5">{item.max} pts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tier badges */}
          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold mb-4">Tier Badges</h2>
            <p className="text-sm text-fg-secondary mb-6">
              Your total score maps to a tier. These are displayed on your profile and in the leaderboard.
            </p>
            <div className="flex flex-wrap gap-3">
              {TIERS.map((tier) => (
                <div key={tier.name} className={`${tier.bg} rounded-xl px-5 py-3 border border-surface-border`}>
                  <div className={`font-display font-bold ${tier.color}`}>{tier.name}</div>
                  <div className="text-xs text-fg-muted font-mono mt-0.5">{tier.range} pts</div>
                </div>
              ))}
            </div>
          </div>

          {/* Anti-gaming */}
          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold mb-4">Anti-Gaming Protections</h2>
            <p className="text-sm text-fg-secondary mb-4">
              We take score integrity seriously. The following protections prevent artificial inflation:
            </p>
            <ul className="space-y-3">
              {[
                'Logarithmic scaling on all volume metrics — spamming commits has diminishing returns',
                'Blank template detection — deploying an unmodified starter template is rejected',
                'Deployment age gate — URLs must be live 24+ hours before verification',
                'Content hash deduplication — uploading the same file twice is blocked',
                'Vouch ring detection — mutual vouches (A↔B) are penalized at 50% value',
                'Throwaway account prevention — must have 50+ pts, 7-day account, and verified proof to vouch',
                'Company stacking cap — max 3 vouches from people at the same company',
                'Credential stripping — n8n workflow imports auto-remove API keys and secrets',
                'Weekly re-verification — verified URLs are re-checked to ensure they are still live',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-fg-secondary">
                  <span className="text-brand font-bold mt-0.5">-</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy */}
          <div className="mt-12 bg-surface-secondary rounded-xl p-6">
            <h2 className="font-display text-xl font-bold mb-3">Privacy Commitment</h2>
            <p className="text-sm text-fg-secondary leading-relaxed">
              We never store source code — only commit metadata (timestamp, diff stats, AI tool detection).
              Private repo names are never displayed publicly. We show &ldquo;47 commits across 3 private repos,&rdquo;
              not repo names or commit messages. Disconnect GitHub anytime and all commit data is deleted immediately.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-fg-secondary mb-4">Ready to see your score?</p>
            <a href="/api/auth/github" className="btn-brand">Get Your GTM Commit Score</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
