import { LuMegaphone, LuChartSpline, LuCog } from 'react-icons/lu';

const personas = [
  {
    Icon: LuMegaphone,
    title: 'SDRs & AEs',
    body: 'You build outbound tools with Claude Code and automate sequences with AI. Your GitHub proves it.',
    tools: 'Claude Code, Copilot, Clay',
  },
  {
    Icon: LuChartSpline,
    title: 'Growth Marketers',
    body: 'You ship landing pages, build internal tools, and deploy on Vercel. Your deploys prove it.',
    tools: 'Cursor, Vercel, Lovable',
  },
  {
    Icon: LuCog,
    title: 'RevOps & GTM Engineers',
    body: 'You build Clay workflows, Zapier automations, and data pipelines. Your integrations prove it.',
    tools: 'Clay, Replit, Bolt, v0',
  },
];

export default function Audience() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Built for GTM professionals who ship code
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          {personas.map((p) => (
            <div key={p.title} className="p-5 sm:p-6 rounded-card border border-surface-border bg-white">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-3">
                <p.Icon size={20} className="text-brand" />
              </div>
              <h3 className="font-display text-lg font-bold">{p.title}</h3>
              <p className="text-sm text-fg-secondary leading-relaxed mt-2">{p.body}</p>
              <div className="mt-3 text-xs text-fg-muted font-mono">{p.tools}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
