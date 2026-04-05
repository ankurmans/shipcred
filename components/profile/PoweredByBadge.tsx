import Link from 'next/link';

export default function PoweredByBadge() {
  return (
    <div className="text-center pt-4 border-t border-surface-border mt-4">
      <Link href="/" className="text-xs text-fg-faint hover:text-brand transition-colors">
        Powered by <span className="font-semibold">GTM Commit</span>
      </Link>
    </div>
  );
}
