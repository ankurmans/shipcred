'use client';

import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';

const faqs = [
  {
    q: 'What if my score is low?',
    a: 'Everyone starts somewhere. Self-reported proof gets you up to 150 points immediately. Add portfolio items, get peer vouches, and keep shipping — your score rewards consistency over time.',
  },
  {
    q: "What if I don't use GitHub?",
    a: "GitHub is how we auto-verify AI commits, but it's not the only way to prove you ship. Platform deployments (Vercel, Replit, Lovable), uploaded artifacts, video proof, and peer vouches all count toward your score.",
  },
  {
    q: 'Can you see my private code?',
    a: 'No. We read commit metadata only — timestamps, diff stats, and AI tool signatures. We never store source code. Private repo names are never displayed publicly. Disconnect anytime and all data is deleted immediately.',
  },
  {
    q: 'What AI tools do you detect?',
    a: 'We detect 18 tools: Claude Code, GitHub Copilot, Cursor, Aider, Windsurf, Devin, Lovable, Bolt.new, Replit Agent, v0.dev, Base44, OpenAI Codex, Google Jules, Gemini Code Assist, Cody, Pythagora, Same.dev, and Firebase Studio.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-surface-border rounded-card bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-surface-secondary/50 transition-colors"
      >
        <span className="font-semibold text-sm sm:text-base">{q}</span>
        <LuChevronDown
          size={18}
          className={`text-fg-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-48 pb-4 sm:pb-5' : 'max-h-0'}`}
      >
        <p className="text-sm text-fg-secondary leading-relaxed px-4 sm:px-5">{a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-surface-secondary">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center">
          Frequently asked questions
        </h2>
        <div className="space-y-3 mt-8 sm:mt-12">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
