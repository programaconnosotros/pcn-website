import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getStaticIndex, rankEntries, toEntry } from '@/lib/search/search-index';
import { SEARCH_GROUPS, type SearchResponse } from '@/lib/search/types';

const MAX_QUERY_LENGTH = 100;
const DB_CANDIDATES = 20;

const loadDatabaseEntries = async (query: string) => {
  const contains = { contains: query, mode: 'insensitive' as const };
  const [events, talks, advises, projects] = await Promise.all([
    prisma.event.findMany({
      where: { deletedAt: null, OR: [{ name: contains }, { description: contains }] },
      orderBy: { date: 'desc' },
      take: DB_CANDIDATES,
      select: { id: true, name: true, date: true, placeName: true, city: true, isOnline: true },
    }),
    prisma.talk.findMany({
      where: {
        OR: [
          { title: contains },
          { description: contains },
          { speakers: { some: { speakerName: contains } } },
        ],
      },
      take: DB_CANDIDATES,
      select: { title: true, speakers: { select: { speakerName: true } } },
    }),
    prisma.advise.findMany({
      where: { OR: [{ content: contains }, { author: { name: contains } }] },
      orderBy: { createdAt: 'desc' },
      take: DB_CANDIDATES,
      select: { id: true, content: true, author: { select: { name: true } } },
    }),
    prisma.project.findMany({
      where: { OR: [{ title: contains }, { description: contains }] },
      take: DB_CANDIDATES,
      select: { title: true, description: true, techStack: true, url: true },
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeZone: 'America/Argentina/Buenos_Aires',
  });

  return [
    ...events.map((event) =>
      toEntry({
        type: 'evento',
        title: event.name,
        subtitle: [
          dateFormatter.format(event.date),
          event.isOnline ? 'online' : event.placeName || event.city,
        ]
          .filter(Boolean)
          .join(' · '),
        href: `/eventos/${event.id}`,
      }),
    ),
    ...talks.map((talk) => {
      const speakers = talk.speakers.map((s) => s.speakerName).join(', ');
      return toEntry({
        type: 'charla',
        title: talk.title,
        subtitle: speakers || undefined,
        href: '/charlas',
      });
    }),
    ...advises.map((advise) =>
      toEntry(
        {
          type: 'consejo',
          title: advise.content.length > 90 ? `${advise.content.slice(0, 89)}…` : advise.content,
          subtitle: advise.author.name,
          href: `/consejos/${advise.id}`,
        },
        advise.content,
      ),
    ),
    ...projects.map((project) =>
      toEntry(
        {
          type: 'proyecto',
          title: project.title,
          subtitle: project.techStack.slice(0, 3).join(' · ') || undefined,
          href: project.url,
        },
        project.description,
      ),
    ),
  ];
};

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH);

  if (!query) {
    return Response.json({ query, results: [] } satisfies SearchResponse);
  }

  let databaseEntries: Awaited<ReturnType<typeof loadDatabaseEntries>> = [];
  try {
    databaseEntries = await loadDatabaseEntries(query);
  } catch (error) {
    // Static content is still searchable when the database is unavailable.
    console.error('search: database lookup failed', error);
  }

  const order = new Map(SEARCH_GROUPS.map((group, index) => [group.type, index]));
  const results = rankEntries([...getStaticIndex(), ...databaseEntries], query).sort(
    (a, b) => (order.get(a.type) ?? 99) - (order.get(b.type) ?? 99),
  );

  return Response.json({ query, results } satisfies SearchResponse, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
