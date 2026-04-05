import type { PortfolioItem } from '@/types';
import FlagButton from '@/components/shared/FlagButton';

export default function PortfolioItemCard({ item }: { item: PortfolioItem }) {
  return (
    <div className="bg-surface-secondary rounded-card hover:shadow-card-hover transition-shadow">
      {item.screenshot_url && (
        <div className="h-40 overflow-hidden rounded-t-card">
          <img src={item.screenshot_url} alt={item.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-semibold">{item.title}</h4>
          <div className="flex items-center gap-2">
            {item.is_pinned && <span className="badge bg-brand-50 text-brand">Pinned</span>}
            <FlagButton flagType="portfolio_item" targetId={item.id} targetProfileId={item.profile_id} />
          </div>
        </div>
        {item.description && <p className="text-xs text-fg-muted line-clamp-2 mt-1">{item.description}</p>}
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tools_used.map((t) => <span key={t} className="badge bg-surface-muted text-fg-muted">{t.replace('_', ' ')}</span>)}
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className={`text-xs ${item.verification_status === 'verified' ? 'text-green-600' : 'text-fg-faint'}`}>
            {item.verification_status === 'verified' ? '✓ Verified' : item.vouch_count > 0 ? `Vouched (${item.vouch_count})` : 'Self-reported'}
          </span>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-fg-secondary hover:text-fg-primary">View →</a>
          )}
        </div>
      </div>
    </div>
  );
}
