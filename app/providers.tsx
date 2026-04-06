'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: '/ingest',
        ui_host: 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: true,
        // Session replay
        disable_session_recording: false,
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: {
            password: true,
          },
        },
        // Scroll depth tracking
        scroll_root_selector: ['main', '#__next'],
        // Autocapture — clicks, form submits, page changes
        autocapture: {
          dom_event_allowlist: ['click', 'submit', 'change'],
          url_allowlist: ['.*'],
          css_selector_allowlist: ['[data-ph]', 'a', 'button', 'input', 'select', 'textarea', 'form'],
        },
        // Performance — Web Vitals (LCP, FID, CLS)
        capture_performance: {
          web_vitals: true,
          network_timing: true,
        },
        // Dead clicks detection
        capture_dead_clicks: true,
        // Error autocapture
        capture_exceptions: true,
      });
    }
  }, []);

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogAuthWrapper />
      {children}
    </PHProvider>
  );
}

// Automatically identify logged-in users and set person properties on every page
function PostHogAuthWrapper() {
  const posthogClient = usePostHog();
  const pathname = usePathname();

  useEffect(() => {
    // Set page-level super properties
    if (posthogClient) {
      posthogClient.register({
        $current_path: pathname,
      });
    }
  }, [pathname, posthogClient]);

  return null;
}
