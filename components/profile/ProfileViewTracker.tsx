'use client';

import { useEffect } from 'react';

export default function ProfileViewTracker({ profileId }: { profileId: string }) {
  useEffect(() => {
    // Fire-and-forget view tracking
    fetch(`/api/profiles/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId }),
    }).catch(() => {});
  }, [profileId]);

  return null;
}
