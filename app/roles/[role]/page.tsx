import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/landing/Footer';
import { LuArrowRight } from 'react-icons/lu';

const ROLE_META: Record<string, { name: string; description: string }> = {
  marketer: { name: 'Marketers', description: 'AI-native marketers who ship campaigns, landing pages, and growth experiments with code' },
  sdr: { name: 'SDRs', description: 'Sales development reps who build automated outbound systems with AI tools' },
  ae: { name: 'Account Executives', description: 'AEs who use AI to build demos, automations, and custom sales tools' },
  growth: { name: 'Growth Engineers', description: 'Growth operators who ship experiments and automation with AI coding tools' },
  founder: { name: 'Founders', description: 'Founders who ship their own products with AI coding assistants' },
};

interface PageProps { params: Promise<{ role: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role } = await params;
  const meta = ROLE_META[role];
  if (!meta) return { title: 'Role — GTM Commit' };
  return {
    title: `AI-Native ${meta.name} — GTM Commit`,
    description: `${meta.description}. Verified proof-of-work profiles.`,
  };
}

export default async function RolePage({ params }: PageProps) {
  const { role } = await params;
  const meta = ROLE_META[role];
  if (!meta) notFound();

  const supabase = createAdminClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, gtmcommit_score, gtmcommit_tier, role, company')
    .eq('role', role)
    .gt('gtmcommit_score', 0)
    .order('gtmcommit_score', { ascending: false })
    .limit(50);

  const users = profiles || [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="font-display text-3xl font-bold">AI-Native {meta.name}</h1>
          <p className="text-fg-secondary mt-2 mb-8">{meta.description}. {users.length} verified on GTM Commit.</p>

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
        </div>
      </main>
      <Footer />
    </>
  );
}
