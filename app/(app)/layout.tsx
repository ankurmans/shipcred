import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-surface-primary">
      <nav className="border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/"><Logo size={20} /></Link>
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">Dashboard</Link>
            <Link href="/portfolio" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">Portfolio</Link>
            <Link href="/proofs" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">Proofs</Link>
            <Link href="/profile/edit" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">Profile</Link>
            {profile && (
              <Link href={`/${profile.username}`} className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">View Public</Link>
            )}
            <Link href="/settings" className="text-sm text-fg-secondary hover:text-fg-primary transition-colors">Settings</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
