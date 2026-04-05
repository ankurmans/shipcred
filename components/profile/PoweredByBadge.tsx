import Link from 'next/link';

export default function PoweredByBadge() {
  return (
    <div className="text-center pt-4 border-t border-base-300 mt-4">
      <Link
        href="/"
        className="text-xs text-base-content/40 hover:text-primary transition-colors"
      >
        Powered by <span className="font-semibold">ShipCred</span>
      </Link>
    </div>
  );
}
