import type { PortfolioItem } from '@/types';
import PortfolioItemCard from './PortfolioItem';

interface PortfolioGridProps {
  items: PortfolioItem[];
}

export default function PortfolioGrid({ items }: PortfolioGridProps) {
  if (!items.length) return null;

  const sorted = [...items].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return a.display_order - b.display_order;
  });

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Shipped Projects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((item) => (
          <PortfolioItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
