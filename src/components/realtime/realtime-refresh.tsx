'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRealtime } from './use-realtime';

/** Bursts of messages (several people signing up at once) refresh once. */
const THROTTLE_MS = 1_000;

/**
 * Re-renders the page's server components when a live message arrives on these topics, e.g. an
 * event's places left as people sign up. Renders nothing.
 */
export function RealtimeRefresh({ topics }: { topics: string[] }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useRealtime(topics, () => {
    if (timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      router.refresh();
    }, THROTTLE_MS);
  });

  return null;
}
