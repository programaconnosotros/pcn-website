import prisma from '@/lib/prisma';
import { buildRssFeed, type FeedItem } from '@/lib/rss';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';
const ITEMS_PER_SOURCE = 30;

// Built per request (CDNs may cache it for 10 minutes) so `next build` never needs a database.
export const dynamic = 'force-dynamic';

const truncate = (text: string, max = 400) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

const formatEventDate = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date);

export async function GET() {
  const [announcements, events, talks] = await Promise.all([
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_SOURCE,
      select: { id: true, title: true, content: true, createdAt: true, eventId: true },
    }),
    prisma.event.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_SOURCE,
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        isOnline: true,
        placeName: true,
        city: true,
        createdAt: true,
      },
    }),
    prisma.talk.findMany({
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_SOURCE,
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        speakers: { select: { speakerName: true }, orderBy: { order: 'asc' } },
      },
    }),
  ]);

  const items: FeedItem[] = [
    ...announcements.map((a) => ({
      id: `announcement-${a.id}`,
      title: a.title,
      link: a.eventId ? `${SITE_URL}/eventos/${a.eventId}` : `${SITE_URL}/anuncios`,
      description: truncate(a.content),
      date: a.createdAt,
      category: 'Anuncios',
    })),
    ...events.map((e) => {
      const place = e.isOnline ? 'Online' : [e.placeName, e.city].filter(Boolean).join(', ');
      return {
        id: `event-${e.id}`,
        title: `Evento: ${e.name}`,
        link: `${SITE_URL}/eventos/${e.id}`,
        description: [formatEventDate(e.date), place, truncate(e.description)]
          .filter(Boolean)
          .join(' · '),
        date: e.createdAt,
        category: 'Eventos',
      };
    }),
    ...talks.map((t) => {
      const speakers = t.speakers.map((s) => s.speakerName).join(', ');
      return {
        id: `talk-${t.id}`,
        title: speakers ? `Charla: ${t.title} (${speakers})` : `Charla: ${t.title}`,
        link: `${SITE_URL}/charlas`,
        description: truncate(t.description),
        date: t.createdAt,
        category: 'Charlas',
      };
    }),
  ];

  const xml = buildRssFeed({
    title: 'programaConNosotros',
    description: 'Anuncios, eventos y charlas de la comunidad programaConNosotros.',
    link: SITE_URL,
    feedUrl: `${SITE_URL}/feed.xml`,
    items,
  });

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  });
}
