import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { LuArrowRight, LuUsers } from 'react-icons/lu';

async function getRecentBuilders() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, gtmcommit_score, gtmcommit_tier, role, created_at')
    .gt('gtmcommit_score', 0)
    .order('created_at', { ascending: false })
    .limit(10);
  return data || [];
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function RecentBuilders() {
  const builders = await getRecentBuilders();

  if (builders.length < 10) return null;

  return (
    <section className="py-12 sm:py-16 bg-surface-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
            <LuUsers size={20} className="text-brand" />
            Recently Joined
          </h2>
          <Link href="/leaderboard" className="text-sm text-brand font-medium flex items-center gap-1 hover:text-brand-dark transition-colors">
            Full Leaderboard <LuArrowRight size={14} />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {builders.map((builder) => (
            <Link
              key={builder.username}
              href={`/${builder.username}`}
              className="flex-shrink-0 bg-white border border-surface-border rounded-2xl p-4 hover:shadow-card-hover transition-shadow w-48"
            >
              <div className="flex items-center gap-3 mb-3">
                {builder.avatar_url ? (
                  <img
                    src={builder.avatar_url}
                    alt={builder.display_name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">
                    {builder.display_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{builder.display_name}</div>
                  <div className="text-xs text-fg-muted truncate capitalize">{builder.role || 'Builder'}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-brand">{builder.gtmcommit_score}</span>
                <span className="text-[10px] text-fg-faint">{timeAgo(builder.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
