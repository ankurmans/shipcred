import { LuLock, LuEyeOff, LuTrash2, LuSearch } from 'react-icons/lu';

const items = [
  { Icon: LuLock, text: 'We never store source code — only commit metadata (timestamp, diff stats, AI tool detection)' },
  { Icon: LuEyeOff, text: 'Private repo names are never displayed — we show "47 commits across 3 private repos," not repo names' },
  { Icon: LuTrash2, text: 'Disconnect anytime — all your commit data is deleted immediately' },
  { Icon: LuSearch, text: 'Transparent by design — read our privacy policy to see exactly what we collect' },
];

export default function Privacy() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-surface-secondary">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Your code stays yours. We just count the commits.
        </h2>
        <div className="space-y-4 sm:space-y-5 mt-8 sm:mt-12">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 sm:gap-4 items-start">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <item.Icon size={18} className="text-brand" />
              </div>
              <p className="text-sm sm:text-base text-fg-secondary leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
