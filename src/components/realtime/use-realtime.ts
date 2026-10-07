'use client';

import { useEffect, useRef } from 'react';

export type RealtimeMessage = { topic: string; data?: Record<string, unknown> };

/**
 * Calls `onMessage` for every live message on these topics (see src/lib/realtime.ts). The
 * browser's EventSource reconnects by itself; nothing happens where it isn't supported.
 */
export function useRealtime(
  topics: string[],
  onMessage: (_message: RealtimeMessage) => void,
  enabled = true,
) {
  const handler = useRef(onMessage);
  useEffect(() => {
    handler.current = onMessage;
  });

  const key = topics.join(',');
  useEffect(() => {
    if (!enabled || !key || typeof EventSource === 'undefined') return;
    const source = new EventSource(`/api/realtime?topics=${encodeURIComponent(key)}`);
    source.onmessage = (event) => {
      try {
        handler.current(JSON.parse(event.data) as RealtimeMessage);
      } catch {
        // A malformed message: skip it.
      }
    };
    return () => source.close();
  }, [key, enabled]);
}
