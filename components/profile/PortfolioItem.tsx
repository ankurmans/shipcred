import type { PortfolioItem } from '@/types';

interface PortfolioItemCardProps {
  item: PortfolioItem;
}

export default function PortfolioItemCard({ item }: PortfolioItemCardProps) {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      {item.screenshot_url && (
        <figure className="h-40 overflow-hidden">
          <img src={item.screenshot_url} alt={item.title} className="w-full h-full object-cover" />
        </figure>
      )}
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <h4 className="card-title text-sm">{item.title}</h4>
          {item.is_pinned && <span className="badge badge-xs badge-primary">Pinned</span>}
        </div>

        {item.description && (
          <p className="text-xs text-base-content/60 line-clamp-2">{item.description}</p>
        )}

        <div className="flex flex-wrap gap-1 mt-1">
          {item.tools_used.map((tool) => (
            <span key={tool} className="badge badge-xs badge-ghost">
              {tool.replace('_', ' ')}
            </span>
          ))}
        </div>

        <div className="card-actions justify-between items-center mt-2">
          <div className="flex items-center gap-2 text-xs text-base-content/50">
            {item.verification_status === 'verified' ? (
              <span className="text-primary flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            ) : item.vouch_count > 0 ? (
              <span>Vouched ({item.vouch_count})</span>
            ) : (
              <span className="text-base-content/40">Self-reported</span>
            )}
          </div>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xs btn-ghost"
            >
              View
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
