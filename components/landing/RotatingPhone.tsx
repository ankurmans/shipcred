'use client';

import { useState, useEffect, useCallback } from 'react';
import PhoneMockup from '@/components/shared/PhoneMockup';
import ProfileCardMock from './ProfileCardMock';

interface ProfileSlide {
  name: string;
  role: string;
  company: string;
  avatar: string;
  score: number;
  tier: string;
  tierProgress: number;
  tierLabel: string;
  tier1: number;
  tier1Max: number;
  tier2: number;
  tier2Max: number;
  tier3: number;
  tier3Max: number;
  tools: { name: string; color: string }[];
  username: string;
  streak: number;
  dark: boolean;
}

const SLIDES: ProfileSlide[] = [
  {
    name: 'Sarah Chen', role: 'Growth Engineer', company: 'Ramp',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    score: 724, tier: 'captain', tierProgress: 90, tierLabel: '26 pts to Legend',
    tier1: 520, tier1Max: 700, tier2: 140, tier2Max: 200, tier3: 64, tier3Max: 100,
    tools: [
      { name: 'Claude Code', color: '#FF5C00' },
      { name: 'Cursor', color: '#6366F1' },
      { name: 'Copilot', color: '#1F883D' },
    ],
    username: 'sarahchen', streak: 8, dark: true,
  },
  {
    name: 'Marc Rivera', role: 'SDR', company: 'Apollo',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    score: 812, tier: 'legend', tierProgress: 100, tierLabel: 'Already Legend!',
    tier1: 580, tier1Max: 700, tier2: 170, tier2Max: 200, tier3: 62, tier3Max: 100,
    tools: [
      { name: 'Claude Code', color: '#FF5C00' },
      { name: 'Cursor', color: '#6366F1' },
      { name: 'Copilot', color: '#1F883D' },
    ],
    username: 'marc', streak: 12, dark: false,
  },
  {
    name: 'Emily Brooks', role: 'RevOps Lead', company: 'Intercom',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    score: 641, tier: 'captain', tierProgress: 56, tierLabel: '109 pts to Legend',
    tier1: 430, tier1Max: 700, tier2: 145, tier2Max: 200, tier3: 66, tier3Max: 100,
    tools: [
      { name: 'Claude Code', color: '#FF5C00' },
      { name: 'Clay', color: '#3B82F6' },
      { name: 'n8n', color: '#EA4335' },
    ],
    username: 'emily', streak: 6, dark: true,
  },
  {
    name: 'Dmitri Volkov', role: 'GTM Engineer', company: 'Notion',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    score: 486, tier: 'builder', tierProgress: 95, tierLabel: '14 pts to Captain',
    tier1: 330, tier1Max: 700, tier2: 98, tier2Max: 200, tier3: 58, tier3Max: 100,
    tools: [
      { name: 'Cursor', color: '#6366F1' },
      { name: 'Lovable', color: '#EC4899' },
      { name: 'Bolt', color: '#F59E0B' },
    ],
    username: 'dmitri', streak: 4, dark: false,
  },
  {
    name: 'Jordan Lee', role: 'Agentic Operator', company: 'Stripe',
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    score: 567, tier: 'captain', tierProgress: 27, tierLabel: '183 pts to Legend',
    tier1: 390, tier1Max: 700, tier2: 120, tier2Max: 200, tier3: 57, tier3Max: 100,
    tools: [
      { name: 'Claude Code', color: '#FF5C00' },
      { name: 'Devin', color: '#10B981' },
      { name: 'Replit', color: '#F97316' },
    ],
    username: 'jordan', streak: 10, dark: true,
  },
  {
    name: 'Mia Thompson', role: 'Growth Marketer', company: 'Lovable',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    score: 395, tier: 'builder', tierProgress: 58, tierLabel: '105 pts to Captain',
    tier1: 240, tier1Max: 700, tier2: 105, tier2Max: 200, tier3: 50, tier3Max: 100,
    tools: [
      { name: 'Lovable', color: '#EC4899' },
      { name: 'v0', color: '#000000' },
      { name: 'Make', color: '#6366F1' },
    ],
    username: 'mia', streak: 3, dark: false,
  },
];

export default function RotatingPhone() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isAnimating || index === current) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 50);
    }, 400);
  }, [current, isAnimating]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % SLIDES.length);
        setTimeout(() => setIsAnimating(false), 50);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="flex flex-col items-center gap-5">
      <PhoneMockup url={`gtmcommit.com/${slide.username}`}>
        <div className="w-full h-full relative overflow-hidden">
          <div
            className="transition-all duration-500 ease-out"
            style={{
              transform: isAnimating ? 'translateX(-40px)' : 'translateX(0)',
              opacity: isAnimating ? 0 : 1,
            }}
          >
            <ProfileCardMock {...slide} />
          </div>
        </div>
      </PhoneMockup>
    </div>
  );
}
