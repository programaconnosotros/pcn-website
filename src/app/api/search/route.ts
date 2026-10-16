import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import {
  buildRecommendationEntries,
  getStaticIndex,
  normalizeSearchText,
  rankEntries,
  toEntry,
  type IndexedEntry,
} from '@/lib/search/search-index';
import { getAllCourses, getArticles, getVideos } from '@/lib/recommendations';
import { listHiddenConsejoIds } from '@/lib/hidden-consejos';
import { SEARCH_GROUPS, type SearchResponse } from '@/lib/search/types';
import { visibleGalleryItem } from '@/lib/gallery';
import { ACTIVE_USER } from '@/lib/active-user';
import { listOpenJobOffers } from '@/lib/job-offers';

const MAX_QUERY_LENGTH = 100;
const DB_CANDIDATES = 20;

// Everything searchable in the database, cached: a few hundred short rows, so filtering them in
// memory is cheaper than four ILIKE scans per keystroke.
const loadSearchCorpus = cached(
  'search-corpus',
  async () => {
    const [
      events,
      talks,
      advice,
      projects,
      users,
      setups,
      photos,
      testimonials,
      forumPosts,
      forumComments,
      announcements,
      workPlaces,
      jobOffers,
    ] = await Promise.all([
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
      prisma.advice.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, author: { select: { name: true } } },
      }),
      prisma.project.findMany({
        select: { title: true, description: true, techStack: true, url: true },
      }),
      // Only what a public profile shows: never emails or phones. Suspended accounts stay out.
      prisma.user.findMany({
        where: ACTIVE_USER,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          jobTitle: true,
          enterprise: true,
          slogan: true,
          career: true,
          studyPlace: true,
        },
      }),
      prisma.setup.findMany({
        orderBy: { date: 'desc' },
        select: { id: true, title: true, description: true, author: { select: { name: true } } },
      }),
      // Untitled photos would only add noise: just the ones with a description.
      prisma.galleryItem.findMany({
        where: { ...visibleGalleryItem, description: { not: null } },
        orderBy: { takenAt: 'desc' },
        select: {
          id: true,
          description: true,
          takenAt: true,
          event: { select: { name: true } },
          tags: { select: { user: { select: { name: true } } } },
        },
      }),
      prisma.testimonial.findMany({
        where: { user: ACTIVE_USER },
        orderBy: { createdAt: 'desc' },
        select: { id: true, body: true, user: { select: { name: true } } },
      }),
      prisma.forumPost.findMany({
        orderBy: { activeAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true,
          author: { select: { name: true } },
          category: { select: { slug: true } },
        },
      }),
      // Replies too: the answer someone is looking for is often in one.
      prisma.forumComment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 2000,
        select: {
          id: true,
          content: true,
          author: { select: { name: true } },
          post: { select: { id: true, title: true } },
        },
      }),
      prisma.announcement.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, content: true, category: true },
      }),
      prisma.workPlace.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, city: true, address: true, notes: true },
      }),
      // The open offers of /empleos, the same ones the page lists.
      listOpenJobOffers(),
    ]);
    return {
      events,
      talks,
      advice,
      projects,
      users,
      setups,
      photos,
      testimonials,
      forumPosts,
      forumComments,
      announcements,
      workPlaces,
      jobOffers,
    };
  },
  {
    models: [
      'Event',
      'Talk',
      'TalkSpeaker',
      'Advice',
      'User',
      'Project',
      'Setup',
      'GalleryItem',
      'GalleryItemTag',
      'Testimonial',
      'ForumPost',
      'ForumComment',
      'Announcement',
      'WorkPlace',
      'JobOffers',
    ],
  },
);

// The courses, videos and articles the community recommends, from their cached listing.
const loadRecommendationEntries = async () => {
  const [courses, videos, articles] = await Promise.all([
    getAllCourses(),
    getVideos(),
    getArticles(),
  ]);
  return buildRecommendationEntries({ courses, videos, articles });
};

const clip = (text: string, max = 90) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

const loadDatabaseEntries = async (query: string) => {
  // The same matching as the ranking (rankEntries): every word, at the start of a word, ignoring
  // accents and case, so "programacion" finds "Programación" and word order doesn't matter.
  const words = normalizeSearchText(query).split(' ').filter(Boolean);
  const contains = (...texts: (string | null | undefined)[]) => {
    const text = normalizeSearchText(texts.filter(Boolean).join(' '));
    return words.every((word) => text.includes(` ${word}`));
  };
  const corpus = await loadSearchCorpus();
  const events = corpus.events
    .filter((event) => contains(event.name, event.description))
    .slice(0, DB_CANDIDATES);
  const talks = corpus.talks
    .filter((talk) =>
      contains(talk.title, talk.description, ...talk.speakers.map((s) => s.speakerName)),
    )
    .slice(0, DB_CANDIDATES);
  const advice = corpus.advice
    .filter((advice) => contains(advice.content, advice.author.name))
    .slice(0, DB_CANDIDATES);
  const projects = corpus.projects
    .filter((project) => contains(project.title, project.description))
    .slice(0, DB_CANDIDATES);
  const users = corpus.users
    .filter((user) =>
      contains(
        user.name,
        user.jobTitle,
        user.enterprise,
        user.slogan,
        user.career,
        user.studyPlace,
      ),
    )
    .slice(0, DB_CANDIDATES);
  const setups = corpus.setups
    .filter((setup) => contains(setup.title, setup.description, setup.author.name))
    .slice(0, DB_CANDIDATES);
  const photos = corpus.photos
    .filter((photo) =>
      contains(photo.description, photo.event?.name, ...photo.tags.map((tag) => tag.user.name)),
    )
    .slice(0, DB_CANDIDATES);
  const forumPosts = corpus.forumPosts
    .filter((post) => contains(post.title, post.content, post.author.name))
    .slice(0, DB_CANDIDATES);
  const forumComments = corpus.forumComments
    .filter((comment) => contains(comment.content, comment.author.name))
    .slice(0, DB_CANDIDATES);
  const announcements = corpus.announcements
    .filter((announcement) => contains(announcement.title, announcement.content))
    .slice(0, DB_CANDIDATES);
  const workPlaces = corpus.workPlaces
    .filter((place) => contains(place.name, place.city, place.address, place.notes))
    .slice(0, DB_CANDIDATES);
  const jobOffers = corpus.jobOffers
    .filter((offer) =>
      contains(offer.title, offer.company, offer.location, offer.description, ...offer.tags),
    )
    .slice(0, DB_CANDIDATES);
  const testimonials = corpus.testimonials
    .filter((testimonial) => contains(testimonial.body, testimonial.user.name))
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
    ...advice.map((advice) =>
      toEntry(
        {
          type: 'consejo',
          title: clip(advice.content),
          subtitle: advice.author.name,
          href: `/consejos/${advice.id}`,
        },
        advice.content,
      ),
    ),
    ...users.map((user) =>
      toEntry(
        {
          type: 'perfil',
          title: user.name,
          subtitle:
            [user.jobTitle, user.enterprise].filter(Boolean).join(' en ') ||
            user.slogan ||
            undefined,
          href: `/perfil/${user.id}`,
        },
        user.slogan,
        user.career,
        user.studyPlace,
      ),
    ),
    ...setups.map((setup) =>
      toEntry(
        {
          type: 'setup',
          title: setup.title,
          subtitle: setup.author.name,
          href: `/setups/${setup.id}`,
        },
        setup.description,
      ),
    ),
    ...photos.map((photo) =>
      toEntry(
        {
          type: 'foto',
          title: clip(photo.description ?? ''),
          subtitle: [photo.event?.name, dateFormatter.format(photo.takenAt)]
            .filter(Boolean)
            .join(' · '),
          href: `/galeria/${photo.id}`,
        },
        photo.description ?? undefined,
        ...photo.tags.map((tag) => tag.user.name),
      ),
    ),
    ...forumPosts.map((post) =>
      toEntry(
        {
          type: 'foro',
          title: post.title,
          subtitle: `#${post.category.slug} · ${post.author.name}`,
          href: `/foro/tema/${post.id}`,
        },
        post.content,
      ),
    ),
    ...forumComments.map((comment) =>
      toEntry(
        {
          type: 'foro',
          title: clip(comment.content),
          subtitle: `respuesta en "${clip(comment.post.title, 50)}" · ${comment.author.name}`,
          href: `/foro/tema/${comment.post.id}#comentario-${comment.id}`,
        },
        comment.content,
      ),
    ),
    ...announcements.map((announcement) =>
      toEntry(
        {
          type: 'anuncio',
          title: announcement.title,
          subtitle: announcement.category,
          href: '/anuncios',
        },
        announcement.content,
      ),
    ),
    ...workPlaces.map((place) =>
      toEntry(
        {
          type: 'lugar',
          title: place.name,
          subtitle: [place.city, place.address].filter(Boolean).join(' · '),
          href: `/lugares?q=${encodeURIComponent(place.name)}`,
        },
        place.notes,
      ),
    ),
    ...jobOffers.map((offer) =>
      toEntry(
        {
          type: 'empleo',
          title: offer.title,
          subtitle: [offer.company, offer.location].join(' · '),
          href: `/empleos?q=${encodeURIComponent(offer.title)}`,
        },
        offer.description,
        offer.tags.join(' '),
      ),
    ),
    ...testimonials.map((testimonial) =>
      toEntry(
        {
          type: 'testimonio',
          title: clip(testimonial.body),
          subtitle: testimonial.user.name,
          href: `/testimonios/${testimonial.id}`,
        },
        testimonial.body,
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

  let databaseEntries: IndexedEntry[] = [];
  let hidden = new Set<string>();
  try {
    const [entries, recommendations, hiddenIds] = await Promise.all([
      loadDatabaseEntries(query),
      loadRecommendationEntries(),
      listHiddenConsejoIds(),
    ]);
    databaseEntries = [...recommendations, ...entries];
    hidden = new Set(hiddenIds.map((id) => `/consejos/${id}`));
  } catch (error) {
    // Static content is still searchable when the database is unavailable.
    console.error('search: database lookup failed', error);
  }

  const order = new Map(SEARCH_GROUPS.map((group, index) => [group.type, index]));
  // Extracted consejos their member took down stay out of the static index's results.
  const staticEntries = getStaticIndex().filter(({ href }) => !hidden.has(href));
  const results = rankEntries([...staticEntries, ...databaseEntries], query).sort(
    (a, b) => (order.get(a.type) ?? 99) - (order.get(b.type) ?? 99),
  );

  return Response.json({ query, results } satisfies SearchResponse, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
