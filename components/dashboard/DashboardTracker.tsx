'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

interface Props {
  userId: string;
  username: string;
  score: number;
  tier: string;
  role?: string;
  githubUsername?: string;
}

export default function DashboardTracker({ userId, username, score, tier, role, githubUsername }: Props) {
  useEffect(() => {
    // Identify user with current properties on every dashboard visit
    analytics.identify(userId, {
      username,
      score,
      tier,
      role: role || undefined,
      github_connected: !!githubUsername,
      github_username: githubUsername || undefined,
    });

    // Set person properties for segmentation
    analytics.setPersonProperties({
      username,
      gtmcommit_score: score,
      gtmcommit_tier: tier,
      role: role || 'unset',
      github_connected: !!githubUsername,
    });

    analytics.dashboardViewed(score, tier);
  }, [userId, username, score, tier, role, githubUsername]);

  return null;
}
