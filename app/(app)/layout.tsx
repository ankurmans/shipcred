import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import AppNavLinks from '@/components/shared/AppNavLinks';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('user_id', user.id)
    .single();

  const username = profile?.username || null;

  return (
    <div className="min-h-screen bg-surface-primary">
      <nav className="border-b border-surface-border relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/dashboard"><Logo size={20} /></Link>
          <AppNavLinks username={username} />
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
    </div>
  );
}
