import { LuLink, LuWrench, LuRocket } from 'react-icons/lu';

const steps = [
  { num: '01', Icon: LuLink, color: 'text-brand', bg: 'bg-brand-50', title: 'Connect GitHub', body: 'We scan your commits for AI tool signatures — Claude Code, Copilot, Cursor, Aider, and more. Private repo data stays private. We never store code.' },
  { num: '02', Icon: LuWrench, color: 'text-[#6366F1]', bg: 'bg-[#EEF2FF]', title: 'Build Your Profile', body: 'Add shipped projects, declare your tools, get vouched by peers. The more proof, the higher your score.' },
  { num: '03', Icon: LuRocket, color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]', title: 'Share Your GTM Commit', body: 'Your profile at gtmcommit.com/you is your credential. Drop it in LinkedIn, Twitter, job applications.' },
];

export default function HowItWorks() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Three steps. Two minutes. Permanent proof.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-8 mt-10 sm:mt-14">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${step.bg} flex items-center justify-center mx-auto`}>
                <step.Icon size={22} className={step.color} />
              </div>
              <div className={`font-mono text-xs ${step.color} tracking-[3px] mt-3 sm:mt-4`}>STEP {step.num}</div>
              <h3 className="font-display text-lg sm:text-xl font-bold mt-2">{step.title}</h3>
              <p className="text-sm text-fg-secondary leading-relaxed mt-2 sm:mt-3 max-w-xs mx-auto">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
