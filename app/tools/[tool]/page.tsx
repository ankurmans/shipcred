import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';
import { LuArrowRight } from 'react-icons/lu';

const TOOL_META: Record<string, { name: string; description: string }> = {
  claude_code: { name: 'Claude Code', description: 'AI coding assistant by Anthropic for terminal-based development' },
  copilot: { name: 'GitHub Copilot', description: 'AI pair programmer by GitHub for inline code suggestions' },
  cursor: { name: 'Cursor', description: 'AI-first code editor with intelligent autocomplete and chat' },
  aider: { name: 'Aider', description: 'Open-source AI coding assistant for the command line' },
  windsurf: { name: 'Windsurf', description: 'AI-powered IDE by Codeium for agentic coding' },
  devin: { name: 'Devin', description: 'Autonomous AI software engineer by Cognition' },
  lovable: { name: 'Lovable', description: 'AI-powered full-stack app builder' },
};

interface PageProps { params: Promise<{ tool: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool } = await params;
  const meta = TOOL_META[tool];
  if (!meta) return { title: 'Tool — GTM Commit' };
  return {
    title: `${meta.name} Users — GTM Commit`,
    description: `GTM professionals who use ${meta.name} to ship real work. Verified by GitHub commits.`,
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { tool } = await params;
  const meta = TOOL_META[tool];
  if (!meta) notFound();

  const supabase = createAdminClient();
  const { data: profiles } = await supabase
    .from('tool_declarations')
    .select('profile_id, is_verified, verified_commit_count, profiles!inner(username, display_name, avatar_url, gtmcommit_score, gtmcommit_tier, role)')
    .eq('tool_name', tool)
    .order('verified_commit_count', { ascending: false })
    .limit(50);

  const users = (profiles || []).map((t: any) => ({
    ...t.profiles,
    is_verified: t.is_verified,
    commit_count: t.verified_commit_count,
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="font-display text-3xl font-bold">{meta.name} Users</h1>
          <p className="text-fg-secondary mt-2 mb-8">{meta.description}. {users.length} verified builders on GTM Commit.</p>

          {users.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-fg-muted mb-4">No verified {meta.name} users yet.</p>
              <Link href="/login" className="btn-brand">Be the First</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u: any) => (
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
                        @{u.username}{u.role ? ` · ${u.role}` : ''}
                        {u.commit_count > 0 && ` · ${u.commit_count} commits`}
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
        </div>
      </main>
      <Footer />
    </>
  );
}
