'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import PhoneMockup from '@/components/shared/PhoneMockup';

interface CardSlide {
  image: string;
  url: string;
}

const SLIDES: CardSlide[] = [
  { image: '/cards/sarah-dark.png', url: 'gtmcommit.com/sarahchen' },
  { image: '/cards/marc-light.png', url: 'gtmcommit.com/marc' },
  { image: '/cards/priya-dark.png', url: 'gtmcommit.com/priya' },
  { image: '/cards/alex-light.png', url: 'gtmcommit.com/alex' },
  { image: '/cards/jordan-dark.png', url: 'gtmcommit.com/jordan' },
  { image: '/cards/mia-light.png', url: 'gtmcommit.com/mia' },
];

export default function RotatingPhone() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isAnimating || index === current) return;
    setDirection(index > current ? 'left' : 'right');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 50);
    }, 400);
  }, [current, isAnimating]);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (current + 1) % SLIDES.length;
      setDirection('left');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(next);
        setTimeout(() => setIsAnimating(false), 50);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [current]);

  const slide = SLIDES[current];

  return (
    <div className="flex flex-col items-center gap-5">
      <PhoneMockup url={slide.url}>
        <div className="w-full h-full relative overflow-hidden">
          <div
            className="transition-all duration-500 ease-out"
            style={{
              transform: isAnimating
                ? `translateX(${direction === 'left' ? '-40px' : '40px'})`
                : 'translateX(0)',
              opacity: isAnimating ? 0 : 1,
            }}
          >
            <Image
              src={slide.image}
              alt={`GTM Commit profile — ${slide.url}`}
              width={720}
              height={1280}
              className="w-full h-auto"
              priority={current === 0}
            />
          </div>
        </div>
      </PhoneMockup>

      {/* Dot indicators */}
      <div className="flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.url}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'bg-brand w-6' : 'bg-fg-faint w-2 hover:bg-fg-muted'
            }`}
            aria-label={`Show ${s.url}`}
          />
        ))}
      </div>
    </div>
  );
}
