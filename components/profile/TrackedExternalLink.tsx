'use client';

import { analytics } from '@/lib/analytics';
import type { ReactNode } from 'react';

interface Props {
  href: string;
  platform: string;
  className?: string;
  'aria-label'?: string;
  children: ReactNode;
}

export default function TrackedExternalLink({ href, platform, children, ...props }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analytics.profileExternalLinkClicked(platform, href)}
      {...props}
    >
      {children}
    </a>
  );
}
