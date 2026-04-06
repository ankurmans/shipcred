'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export default function CompareTracker({ user1, user2 }: { user1: string; user2: string }) {
  useEffect(() => {
    analytics.compareProfileViewed(user1, user2);
  }, [user1, user2]);

  return null;
}
