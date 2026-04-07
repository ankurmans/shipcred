import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';
import { LuArrowRight, LuTrendingUp, LuUsers, LuZap, LuTarget } from 'react-icons/lu';

interface RoleMeta {
  name: string;
  description: string;
  queryRole?: string; // DB role value to query (if different from URL slug)
  spotlight?: {
    headline: string;
    stats: { label: string; value: string; icon: 'trending' | 'users' | 'zap' | 'target' }[];
    body: string;
  };
}

const SPOTLIGHT_ICONS = {
  trending: LuTrendingUp,
  users: LuUsers,
  zap: LuZap,
  target: LuTarget,
};

const ROLE_META: Record<string, RoleMeta> = {
  marketer: { name: 'Marketers', description: 'AI-native marketers who ship campaigns, landing pages, and growth experiments with code' },
  sdr: { name: 'SDRs', description: 'Sales development reps who build automated outbound systems with AI tools' },
  ae: { name: 'Account Executives', description: 'AEs who use AI to build demos, automations, and custom sales tools' },
  growth: { name: 'Growth Engineers', description: 'Growth operators who ship experiments and automation with AI coding tools' },
  founder: { name: 'Founders', description: 'Founders who ship their own products with AI coding assistants' },
  'gtm-engineer': {
    name: 'GTM Engineers',
    queryRole: 'growth',
    description: 'The fastest-growing role in tech — GTM Engineers who use AI coding tools to ship growth systems, landing pages, outbound automations, and revenue infrastructure',
    spotlight: {
      headline: 'The GTM Engineer role grew 205% from 2024–2025',
      stats: [
        { label: 'Role growth', value: '205%', icon: 'trending' },
        { label: 'Companies hiring', value: 'Ramp, Intercom, Apollo', icon: 'target' },
        { label: 'Top tools', value: 'Claude Code, Cursor', icon: 'zap' },
        { label: 'Avg commits/month', value: '40+', icon: 'users' },
      ],
      body: 'GTM Engineers sit at the intersection of marketing strategy and technical execution. They use AI coding tools like Claude Code and Cursor to build landing pages, outbound systems, analytics dashboards, and growth automations — shipping in hours what used to take weeks with engineering support. Companies like Ramp, Intercom, and Apollo are actively hiring for this role. If you\'re a marketer who commits code, you\'re already a GTM Engineer.',
    },
  },
};

interface PageProps { params: Promise<{ role: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role } = await params;
  const meta = ROLE_META[role];
  if (!meta) return { title: 'Role — GTM Commit' };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gtmcommit.com';
  return {
    title: `AI-Native ${meta.name} — GTM Commit`,
    description: `${meta.description}. Verified proof-of-work profiles on GTM Commit.`,
    openGraph: {
      title: `AI-Native ${meta.name} — GTM Commit`,
      description: meta.description,
      url: `${appUrl}/roles/${role}`,
    },
  };
}

export default async function RolePage({ params }: PageProps) {
  const { role } = await params;
  const meta = ROLE_META[role];
  if (!meta) notFound();

  const supabase = createAdminClient();
  const dbRole = meta.queryRole || role;
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, gtmcommit_score, gtmcommit_tier, role, company')
    .eq('role', dbRole)
    .gt('gtmcommit_score', 0)
    .order('gtmcommit_score', { ascending: false })
    .limit(50);

  const users = profiles || [];

  // Aggregate stats for spotlight
  const avgScore = users.length > 0
    ? Math.round(users.reduce((sum, u) => sum + u.gtmcommit_score, 0) / users.length)
    : 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="font-display text-3xl font-bold">AI-Native {meta.name}</h1>
          <p className="text-fg-secondary mt-2 mb-4">{meta.description}.</p>
          <p className="text-sm text-fg-muted mb-8">{users.length} verified on GTM Commit{avgScore > 0 ? ` · Avg score: ${avgScore}` : ''}.</p>

          {/* Spotlight section for featured roles (e.g. GTM Engineer) */}
          {meta.spotlight && (
            <div className="mb-8 bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand/20 rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold mb-4">{meta.spotlight.headline}</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {meta.spotlight.stats.map((stat) => {
                  const Icon = SPOTLIGHT_ICONS[stat.icon];
                  return (
                    <div key={stat.label} className="bg-white/70 rounded-xl p-3 flex items-start gap-2">
                      <Icon size={16} className="text-brand mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-fg-primary">{stat.value}</div>
                        <div className="text-xs text-fg-muted">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-fg-secondary leading-relaxed">{meta.spotlight.body}</p>
              <Link href="/login" className="btn-brand mt-4 inline-flex">
                Prove You Ship →
              </Link>
            </div>
          )}

          {users.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-fg-muted mb-4">No verified {meta.name.toLowerCase()} yet.</p>
              <Link href="/login" className="btn-brand">Be the First</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <Link
                  key={u.username}
                  href={`/${u.username}`}
                  className="flex items-center justify-between bg-white border border-surface-border rounded-xl p-4 hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.display_name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">
                        {u.display_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm">{u.display_name}</div>
                      <div className="text-xs text-fg-muted">
                        @{u.username}{u.company ? ` @ ${u.company}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-brand">{u.gtmcommit_score}</span>
                    <LuArrowRight size={14} className="text-fg-faint" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Cross-link to related pages */}
          <div className="mt-12 pt-8 border-t border-surface-border">
            <h3 className="font-display text-lg font-bold mb-4">Explore by Tool</h3>
            <div className="flex flex-wrap gap-2">
              {['claude_code', 'copilot', 'cursor', 'aider', 'windsurf'].map((tool) => (
                <Link
                  key={tool}
                  href={`/tools/${tool}`}
                  className="px-3 py-1.5 rounded-full bg-surface-secondary border border-surface-border text-xs font-medium text-fg-secondary hover:border-brand/30 hover:text-brand transition-colors"
                >
                  {tool.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
