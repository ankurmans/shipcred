import Link from 'next/link';
import { LuPackageCheck, LuArrowRight } from 'react-icons/lu';

export default function PoweredByBadge() {
  return (
    <div className="pt-6 border-t border-surface-border mt-6">
      <Link
        href="/"
        className="flex items-center justify-between bg-surface-secondary hover:bg-surface-muted rounded-xl px-4 py-3 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="gradient-brand w-7 h-7 rounded-lg flex items-center justify-center">
            <LuPackageCheck size={14} className="text-white" />
          </span>
          <div>
            <span className="text-sm font-semibold text-fg-primary">GTM Commit</span>
            <span className="text-xs text-fg-muted ml-2">Verified proof-of-work</span>
          </div>
        </div>
        <span className="text-xs text-brand font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Get your score <LuArrowRight size={12} />
        </span>
      </Link>
    </div>
  );
}
