import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-base-100">
      {/* Top nav */}
      <div className="navbar bg-base-100 border-b border-base-300 px-4 lg:px-8">
        <div className="flex-1">
          <Link href="/" className="text-xl font-bold font-[family-name:var(--font-dm-sans)] text-primary">
            ShipCred
          </Link>
        </div>
        <div className="flex-none gap-2">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            Dashboard
          </Link>
          <Link href="/portfolio" className="btn btn-ghost btn-sm">
            Portfolio
          </Link>
          <Link href="/profile/edit" className="btn btn-ghost btn-sm">
            Profile
          </Link>
          {profile && (
            <Link href={`/${profile.username}`} className="btn btn-ghost btn-sm">
              View Public
            </Link>
          )}
          <Link href="/settings" className="btn btn-ghost btn-sm">
            Settings
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
