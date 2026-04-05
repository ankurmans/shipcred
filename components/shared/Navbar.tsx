import Link from 'next/link';

export default function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4 lg:px-8">
      <div className="flex-1">
        <Link href="/" className="text-xl font-bold font-[family-name:var(--font-dm-sans)] text-primary">
          ShipCred
        </Link>
      </div>
      <div className="flex-none gap-2">
        <Link href="/leaderboard" className="btn btn-ghost btn-sm">
          Leaderboard
        </Link>
        <Link href="/about" className="btn btn-ghost btn-sm">
          About
        </Link>
        {isLoggedIn ? (
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Dashboard
          </Link>
        ) : (
          <a href="/api/auth/github" className="btn btn-primary btn-sm">
            Get Your ShipCred
          </a>
        )}
      </div>
    </div>
  );
}
