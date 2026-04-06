import { LuTrendingUp, LuArrowRight } from 'react-icons/lu';

export default function AnnouncementBar() {
  return (
    <div className="w-full bg-brand-50 py-2 text-center px-4">
      <span className="text-xs sm:text-sm font-medium text-brand inline-flex items-center gap-1">
        <LuTrendingUp size={14} />
        <span className="hidden sm:inline">Ramp, Notion, Stripe are hiring &ldquo;extremely AI-pilled&rdquo; GTM roles. Can you prove it?</span>
        <span className="sm:hidden">Companies want &ldquo;AI-pilled&rdquo; GTM hires. Can you prove it?</span>
        <LuArrowRight size={14} className="ml-1" />
      </span>
    </div>
  );
}
