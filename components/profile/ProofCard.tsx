'use client';

import { SiGithub, SiVercel, SiReplit, SiFigma, SiNetlify, SiRailway } from 'react-icons/si';
import { LuHeart, LuZap, LuGlobe, LuBox, LuCode } from 'react-icons/lu';
import type { ReactNode } from 'react';

// Platform icon registry — maps platform keys to their brand icons + colors
const PLATFORM_ICONS: Record<string, { icon: ReactNode; bg: string }> = {
  github:   { icon: <SiGithub size={14} className="text-white" />,   bg: '#1A1A1A' },
  vercel:   { icon: <SiVercel size={14} className="text-white" />,   bg: '#000000' },
  lovable:  { icon: <LuHeart size={14} className="text-white" />,    bg: '#EC4899' },
  bolt:     { icon: <LuZap size={14} className="text-white" />,      bg: '#F59E0B' },
  v0:       { icon: <LuCode size={14} className="text-white" />,     bg: '#1A1A1A' },
  replit:   { icon: <SiReplit size={14} className="text-white" />,   bg: '#F26207' },
  netlify:  { icon: <SiNetlify size={14} className="text-white" />, bg: '#00C7B7' },
  railway:  { icon: <SiRailway size={14} className="text-white" />, bg: '#0B0D0E' },
  figma:    { icon: <SiFigma size={14} className="text-white" />,   bg: '#F24E1E' },
  fly:      { icon: <LuGlobe size={14} className="text-white" />,   bg: '#7C3AED' },
  custom:   { icon: <LuBox size={14} className="text-white" />,     bg: '#6B7280' },
};

export interface ProofRow {
  platform: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeBg: string;
  badgeColor: string;
}

interface ProofCardProps {
  name: string;
  role: string;
  score: number;
  tier: string;
  proofs: ProofRow[];
  vouchCount?: number;
  url: string;
  variant?: 'light' | 'dark';
}

export default function ProofCard({
  name,
  role,
  score,
  tier,
  proofs,
  vouchCount = 0,
  url,
  variant = 'light',
}: ProofCardProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`w-full max-w-[340px] p-6 rounded-card ${
        isDark
          ? 'bg-surface-inverse border border-surface-border-dark shadow-card-dark'
          : 'bg-white border border-surface-border shadow-card'
      }`}
    >
      {/* Header: Avatar + Name + Score */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full gradient-brand flex items-center justify-center text-white font-display font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-fg-primary'}`}>
            {name}
          </div>
          <div className={`text-xs ${isDark ? 'text-white/50' : 'text-fg-muted'}`}>
            {role}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[28px] font-display font-bold text-brand leading-none">
            {score}
          </div>
          <div className="text-[9px] font-mono text-brand/80 tracking-wider uppercase">
            {tier}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={`h-px my-4 ${isDark ? 'bg-surface-border-dark' : 'bg-surface-border'}`} />

      {/* Proof rows */}
      <div className="space-y-2.5">
        <div className={`text-[9px] font-mono tracking-[2px] uppercase ${isDark ? 'text-white/30' : 'text-fg-faint'}`}>
          Verified proof-of-work
        </div>
        {proofs.map((proof, i) => {
          const platformIcon = PLATFORM_ICONS[proof.platform] || PLATFORM_ICONS.custom;
          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 p-2.5 rounded-proof ${
                isDark ? 'bg-surface-inverse-subtle' : 'bg-[#FAFAFA]'
              }`}
            >
              <div
                className="w-7 h-7 rounded-icon flex items-center justify-center shrink-0"
                style={{ backgroundColor: platformIcon.bg }}
              >
                {platformIcon.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-fg-primary'}`}>
                  {proof.title}
                </div>
                <div className={`text-[11px] ${isDark ? 'text-white/40' : 'text-fg-muted'}`}>
                  {proof.subtitle}
                </div>
              </div>
              <span
                className="badge shrink-0"
                style={{ backgroundColor: proof.badgeBg, color: proof.badgeColor }}
              >
                ✓ {proof.badgeLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className={`h-px my-4 ${isDark ? 'bg-surface-border-dark' : 'bg-surface-border'}`} />

      {/* Footer: Vouches + URL */}
      <div className="flex items-center justify-between">
        {vouchCount > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {['#6366F1', '#06B6D4', '#F59E0B'].slice(0, Math.min(3, vouchCount)).map((color, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border-2 border-white"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className={`text-xs ${isDark ? 'text-white/40' : 'text-fg-muted'}`}>
              {vouchCount} vouches
            </span>
          </div>
        ) : (
          <div />
        )}
        <span className={`text-[10px] font-mono ${isDark ? 'text-white/20' : 'text-fg-faint'}`}>
          {url}
        </span>
      </div>
    </div>
  );
}

// Default mock data for landing page
export const MOCK_PROOFS: ProofRow[] = [
  {
    platform: 'github',
    title: '47 AI-assisted commits',
    subtitle: 'Claude Code · Cursor · 8 repos',
    badgeLabel: 'GitHub',
    badgeBg: '#ECFDF5',
    badgeColor: '#059669',
  },
  {
    platform: 'vercel',
    title: '3 live deployments',
    subtitle: 'Lead gen · Pricing · Dashboard',
    badgeLabel: 'Vercel',
    badgeBg: '#F5F5F5',
    badgeColor: '#1A1A1A',
  },
  {
    platform: 'lovable',
    title: 'Outbound automation app',
    subtitle: 'Built with Lovable · 12 iterations',
    badgeLabel: 'Lovable',
    badgeBg: '#FDF2F8',
    badgeColor: '#EC4899',
  },
];

export const MOCK_PROOFS_DARK: ProofRow[] = MOCK_PROOFS.map((p) => ({
  ...p,
  badgeBg: p.badgeColor + '20',
  badgeColor: p.badgeColor === '#059669' ? '#34D399' : p.badgeColor,
}));
