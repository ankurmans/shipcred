'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export default function ProfileViewTracker({ profileId, username }: { profileId: string; username: string }) {
  useEffect(() => {
    // Fire-and-forget view tracking
    fetch(`/api/profiles/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId }),
    }).catch(() => {});

    // PostHog profile view
    analytics.profileViewed(username, false);
  }, [profileId, username]);

  return null;
}
