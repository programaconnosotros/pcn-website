/** What the notification center shows: news from the feed and, for admins, their own inbox. */
export interface NotificationCenterData {
  /** The latest feed items, newest first. */
  feed: NotificationFeedItem[];
  /** Admin notifications; null for everyone else. */
  admin: { unread: number; items: AdminNotificationItem[] } | null;
}

export interface NotificationFeedItem {
  id: string;
  kind: string;
  title: string;
  meta?: string;
  href: string;
  /** ISO timestamp, to tell what's new since the last visit. */
  sortKey: string;
}

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const NOTIFICATIONS_ENDPOINT = '/api/notificaciones';
/** How many feed items the center lists. */
export const FEED_NEWS_LIMIT = 15;
/** Where the newest feed item someone saw is kept, per browser. */
export const FEED_SEEN_KEY = 'pcn-feed-seen';
/** Without a stored mark, items from this many days back count as new. */
export const FIRST_VISIT_DAYS = 3;

/** Feed items newer than what was last seen; on a first visit, the last few days' ones. */
export const unseenFeedItems = (
  items: NotificationFeedItem[],
  seen: string | null,
  now = Date.now(),
) => {
  const since = seen ?? new Date(now - FIRST_VISIT_DAYS * 86_400_000).toISOString();
  return items.filter((item) => item.sortKey > since);
};
