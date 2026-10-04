import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { getStaticIndex, rankEntries, toEntry } from '@/lib/search/search-index';
import { SEARCH_GROUPS, type SearchResponse } from '@/lib/search/types';

const MAX_QUERY_LENGTH = 100;
const DB_CANDIDATES = 20;

// Everything searchable in the database, cached: a few hundred short rows, so filtering them in
// memory is cheaper than four ILIKE scans per keystroke.
const loadSearchCorpus = cached(
  'search-corpus',
  async () => {
    const [events, talks, advises, projects] = await Promise.all([
      prisma.event.findMany({
        where: { deletedAt: null },
        orderBy: { date: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          date: true,
          placeName: true,
          city: true,
          isOnline: true,
        },
      }),
      prisma.talk.findMany({
        select: { title: true, description: true, speakers: { select: { speakerName: true } } },
      }),
      prisma.advise.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, author: { select: { name: true } } },
      }),
      prisma.project.findMany({
        select: { title: true, description: true, techStack: true, url: true },
      }),
    ]);
    return { events, talks, advises, projects };
  },
  { models: ['Event', 'Talk', 'TalkSpeaker', 'Advise', 'User', 'Project'] },
);

const loadDatabaseEntries = async (query: string) => {
  const needle = query.toLocaleLowerCase('es');
  const contains = (...texts: (string | null | undefined)[]) =>
    texts.some((text) => text?.toLocaleLowerCase('es').includes(needle));
  const corpus = await loadSearchCorpus();
  const events = corpus.events
    .filter((event) => contains(event.name, event.description))
    .slice(0, DB_CANDIDATES);
  const talks = corpus.talks
    .filter((talk) =>
      contains(talk.title, talk.description, ...talk.speakers.map((s) => s.speakerName)),
    )
    .slice(0, DB_CANDIDATES);
  const advises = corpus.advises
    .filter((advise) => contains(advise.content, advise.author.name))
    .slice(0, DB_CANDIDATES);
  const projects = corpus.projects
    .filter((project) => contains(project.title, project.description))
    .slice(0, DB_CANDIDATES);

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
