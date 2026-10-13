import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { fetchFeed } from '@/lib/feed';
import prisma from '@/lib/prisma';
import {
  FEED_NEWS_LIMIT,
  notificationHref,
  type NotificationCenterData,
} from '@/lib/notification-center';

const INBOX_ITEMS = 20;

// The notification center's data: the feed's latest news for everyone (public and cached) plus,
// with a session, the user's own inbox. Never cached by the browser: it's polled for what's new.
export async function GET() {
  const [feed, session] = await Promise.all([fetchFeed(), getCurrentSession()]);

  let inbox: NotificationCenterData['inbox'] = null;
  if (session) {
    const where = { userId: session.userId };
    const [unread, items] = await Promise.all([
      prisma.notification.count({ where: { ...where, read: false } }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: INBOX_ITEMS,
        select: {
          id: true,
          title: true,
          message: true,
          read: true,
          createdAt: true,
          metadata: true,
        },
      }),
    ]);
    inbox = {
      unread,
      items: items.map(({ metadata, ...item }) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        href: notificationHref(metadata),
      })),
    };
  }

  const data: NotificationCenterData = {
    feed: feed.slice(0, FEED_NEWS_LIMIT).map(({ id, kind, title, meta, href, sortKey }) => ({
      id,
      kind,
      title,
      meta,
      href,
      sortKey,
    })),
    inbox,
  };
  return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
}
