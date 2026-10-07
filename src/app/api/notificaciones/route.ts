import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { fetchFeed } from '@/lib/feed';
import prisma from '@/lib/prisma';
import { FEED_NEWS_LIMIT, type NotificationCenterData } from '@/lib/notification-center';

const ADMIN_ITEMS = 20;

// The notification center's data: the feed's latest news for everyone (public and cached) plus,
// for admins, their unread inbox. Never cached by the browser: it's polled for what's new.
export async function GET() {
  const [feed, session] = await Promise.all([fetchFeed(), getCurrentSession()]);

  let admin: NotificationCenterData['admin'] = null;
  if (session?.user.role === 'ADMIN') {
    const where = { userId: session.userId };
    const [unread, items] = await Promise.all([
      prisma.notification.count({ where: { ...where, read: false } }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: ADMIN_ITEMS,
        select: { id: true, title: true, message: true, read: true, createdAt: true },
      }),
    ]);
    admin = {
      unread,
      items: items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
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
    admin,
  };
  return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
}
