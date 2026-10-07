'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import {
  FEED_SEEN_KEY,
  NOTIFICATIONS_ENDPOINT,
  unseenFeedItems,
  type NotificationCenterData,
} from '@/lib/notification-center';
import { useRealtime } from '@/components/realtime/use-realtime';

/** How often the center checks for news while the tab is visible. */
export const POLL_MS = 60_000;

const SEEN_EVENT = 'pcn-feed-seen';

const readSeen = () => {
  try {
    return window.localStorage.getItem(FEED_SEEN_KEY);
  } catch {
    return null;
  }
};

const subscribeSeen = (onChange: () => void) => {
  // Other tabs (and PCN OS windows, same origin) update it through `storage`.
  window.addEventListener('storage', onChange);
  window.addEventListener(SEEN_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(SEEN_EVENT, onChange);
  };
};

/**
 * The notification center's data, refreshed every minute while the page is visible and right
 * away when it comes back to the front. `markFeedSeen` clears the feed's badge.
 */
export function useNotificationCenter() {
  const [data, setData] = useState<NotificationCenterData | null>(null);
  const [loading, setLoading] = useState(false);
  const seen = useSyncExternalStore(subscribeSeen, readSeen, () => null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(NOTIFICATIONS_ENDPOINT, { cache: 'no-store' });
      if (response.ok) setData((await response.json()) as NotificationCenterData);
    } catch {
      // Offline or the server is restarting: keep what was there and try on the next tick.
    } finally {
      setLoading(false);
    }
  }, []);

  // Something new in the feed: fetch now instead of waiting for the next tick.
  useRealtime(['feed'], () => void refresh());

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const unseen = data ? unseenFeedItems(data.feed, seen) : [];

  const markFeedSeen = useCallback(() => {
    const newest = data?.feed[0]?.sortKey;
    if (!newest) return;
    try {
      window.localStorage.setItem(FEED_SEEN_KEY, newest);
    } catch {
      // Storage blocked: the badge just comes back on the next visit.
    }
    window.dispatchEvent(new Event(SEEN_EVENT));
  }, [data]);

  return {
    data,
    loading,
    refresh,
    unseen,
    unread: unseen.length + (data?.admin?.unread ?? 0),
    markFeedSeen,
  };
}
