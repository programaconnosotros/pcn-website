import { conversationHref } from '@/components/conversations/conversation-utils';
import { changelog } from '@/data/changelog';
import { conversations } from '@/data/whatsapp-conversations';
import { galleryQuery } from '@/lib/gallery-filters';
import { visibleGalleryItem } from '@/lib/gallery';
import { signGallerySrc } from '@/lib/gallery-signing';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { getEventNames } from '@/lib/event-index';
import { getCollaborationStats } from '@/lib/github-stats';
import { getIdentityMap } from '@/lib/identity-links';
import { pullSummary } from '@/lib/pull-kinds';
import { ACTIVE_USER } from '@/lib/active-user';
import { listOpenJobOffers } from '@/lib/job-offers';
import { excerpt } from '@/actions/notifications/excerpt';

export type FeedKind =
  | 'evento'
  | 'charla'
  | 'fotos'
  | 'setup'
  | 'proyecto'
  | 'conversacion'
  | 'changelog'
  | 'desarrollo'
  | 'foro'
  | 'consejo'
  | 'anuncio'
  | 'testimonio'
  | 'lugar'
  | 'empleo'
  | 'miembros';

export interface FeedItem {
  id: string;
  kind: FeedKind;
  /** YYYY-MM-DD, the community's day it happened on. */
  day: string;
  /** Full ISO timestamp (or the day itself) used to order items within a day. */
  sortKey: string;
  title: string;
  description?: string;
  href: string;
  /** Short extra detail shown next to the kind, e.g. who gave the talk. */
  meta?: string;
  /** Overrides the kind's tag, e.g. a conversation summarized from an event, not the chat. */
  tag?: string;
  thumbs?: { id: string; src: string }[];
}

// Days are counted in the community's own time zone, so an evening upload doesn't land on tomorrow.
const TIME_ZONE = 'America/Argentina/Buenos_Aires';
const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE });

export const toFeedDay = (date: Date) => dayFormatter.format(date);

const PER_SOURCE = 15;
// Photo batches are eye-catching; fewer of them keep the rest of the feed visible.
const GALLERY_BATCHES = 6;
const GALLERY_SAMPLE = 120;
const MAX_ITEMS = 60;

const eventItems = async (): Promise<FeedItem[]> => {
  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    // Extra rows make up for the past events filtered out below.
    take: PER_SOURCE * 2,
    select: { id: true, name: true, date: true, isOnline: true, createdAt: true },
  });
  // An event loaded after it happened (e.g. backfilling history) isn't news on the day it was
  // created, so only events announced on or before their own date show up.
  const announced = events.filter((event) => toFeedDay(event.date) >= toFeedDay(event.createdAt));
  return announced.slice(0, PER_SOURCE).map((event) => ({
    id: `evento-${event.id}`,
    kind: 'evento',
    day: toFeedDay(event.createdAt),
    sortKey: event.createdAt.toISOString(),
    title: event.name,
    description: `Nuevo evento${event.isOnline ? ' online' : ''} para el ${toFeedDay(event.date)}. Sumate.`,
    href: `/eventos/${event.id}`,
  }));
};

const talkItems = async (): Promise<FeedItem[]> => {
  const talks = await prisma.talk.findMany({
    orderBy: { createdAt: 'desc' },
    take: PER_SOURCE,
    select: {
      id: true,
      title: true,
      createdAt: true,
      videoUrl: true,
      speakers: { select: { speakerName: true }, orderBy: { order: 'asc' } },
    },
  });
  return talks.map((talk) => ({
    id: `charla-${talk.id}`,
    kind: 'charla',
    day: toFeedDay(talk.createdAt),
    sortKey: talk.createdAt.toISOString(),
    title: talk.title,
    meta: talk.speakers.map((speaker) => speaker.speakerName).join(', ') || undefined,
    description: talk.videoUrl ? 'Ya está la grabación disponible.' : undefined,
    href: '/charlas',
  }));
};

/** Uploads are grouped by day and event, so one batch of 40 photos is a single entry. */
const galleryItems = async (): Promise<FeedItem[]> => {
  const items = await prisma.galleryItem.findMany({
    where: visibleGalleryItem,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: GALLERY_SAMPLE,
    select: {
      id: true,
      kind: true,
      src: true,
      thumbSrc: true,
      createdAt: true,
      event: { select: { id: true, name: true } },
    },
  });

  const batches = new Map<string, typeof items>();
  for (const item of items) {
    const key = `${toFeedDay(item.createdAt)}:${item.event?.id ?? ''}`;
    batches.set(key, [...(batches.get(key) ?? []), item]);
  }

  return [...batches.values()].slice(0, GALLERY_BATCHES).map((batch) => {
    const [first] = batch;
    const photos = batch.filter((item) => item.kind === 'PHOTO').length;
    const videos = batch.length - photos;
    const counts = [
      photos && `${photos} ${photos === 1 ? 'foto' : 'fotos'}`,
      videos && `${videos} ${videos === 1 ? 'video' : 'videos'}`,
    ].filter(Boolean);
    return {
      id: `fotos-${first.id}`,
      kind: 'fotos',
      day: toFeedDay(first.createdAt),
      sortKey: first.createdAt.toISOString(),
      title: first.event ? first.event.name : 'Nuevos recuerdos en la galería',
      meta: counts.join(' y '),
      href:
        batch.length === 1
          ? `/galeria/${first.id}`
          : `/galeria${galleryQuery({ eventId: first.event?.id })}`,
      // Signed in fetchFeed, after the cache.
      thumbs: batch.slice(0, 4).map((item) => ({ id: item.id, src: item.thumbSrc })),
    };
  });
};

const projectItems = async (): Promise<FeedItem[]> => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    take: PER_SOURCE,
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });
  return projects.map((project) => ({
    id: `proyecto-${project.id}`,
    kind: 'proyecto',
    day: toFeedDay(project.createdAt),
    sortKey: project.createdAt.toISOString(),
    title: project.title,
    meta: project.author?.name,
    description: project.description,
    href: `/proyectos/${project.id}`,
  }));
};

const setupItems = async (): Promise<FeedItem[]> => {
  const setups = await prisma.setup.findMany({
    orderBy: { createdAt: 'desc' },
    take: PER_SOURCE,
    select: {
      id: true,
      title: true,
      description: true,
      thumbUrl: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });
  return setups.map((setup) => ({
    id: `setup-${setup.id}`,
    kind: 'setup',
    day: toFeedDay(setup.createdAt),
    sortKey: setup.createdAt.toISOString(),
    title: setup.title,
    meta: setup.author.name,
    description: setup.description,
    href: `/setups/${setup.id}`,
    thumbs: [{ id: setup.id, src: setup.thumbUrl }],
  }));
};

const conversationItems = async (): Promise<FeedItem[]> => {
  const latest = [...conversations]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, PER_SOURCE);
  const eventIds = [...new Set(latest.flatMap((c) => (c.eventId ? [c.eventId] : [])))];
  const eventNames = new Map(Object.entries(await getEventNames(eventIds)));

  return latest.map((conversation) => ({
    id: `conversacion-${conversationHref(conversation)}`,
    kind: 'conversacion',
    day: conversation.date,
    sortKey: conversation.date,
    title: conversation.title,
    description: conversation.summary,
    href: conversationHref(conversation),
    // Summarized from an event (e.g. a virtual meetup), not from the WhatsApp group.
    ...(conversation.eventId && {
      tag: 'evento',
      meta: eventNames.get(conversation.eventId),
    }),
  }));
};

const changelogItems = (): FeedItem[] =>
  changelog
    .filter((entry) => entry.audience !== 'admins')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, PER_SOURCE)
    .map((entry, index) => ({
      id: `changelog-${entry.date}-${index}`,
      kind: 'changelog',
      day: entry.date,
      sortKey: entry.date,
      title: entry.title,
      description: entry.description,
      meta: entry.area,
      href: entry.href ?? '/changelog',
    }));

/**
 * When each person joined the website's development: the day their first PR was merged (or, in
 * older snapshots without PRs, the week of their first commit), linked to their PCN profile when
 * their GitHub login is linked.
 */
const firstContributionItems = async (): Promise<FeedItem[]> => {
  const [stats, profiles] = await Promise.all([getCollaborationStats(), getIdentityMap('github')]);
  return stats.topContributors.flatMap((contributor) => {
    const first = [...(contributor.pulls ?? [])].sort((a, b) =>
      a.mergedAt.localeCompare(b.mergedAt),
    )[0];
    const when = first?.mergedAt ?? contributor.firstContributionWeek;
    if (!when) return [];
    const profile = profiles[contributor.login];
    const name = profile?.name ?? contributor.login;
    return [
      {
        id: `desarrollo-${contributor.login}`,
        kind: 'desarrollo' as const,
        day: toFeedDay(new Date(when)),
        sortKey: new Date(when).toISOString(),
        title: `${name} hizo su primera contribución al sitio`,
        description: first
          ? `Su primera PR: “${pullSummary(first.title)}”. Ya suma ${contributor.mergedPrs} ${contributor.mergedPrs === 1 ? 'PR mergeada' : 'PRs mergeadas'}.`
          : `Ya suma ${contributor.commits} commits en el repo.`,
        meta: `@${contributor.login}`,
        href: profile ? `/perfil/${profile.id}?tab=contribuciones` : '/desarrollo#team',
      },
    ];
  });
};

const forumItems = async (): Promise<FeedItem[]> => {
  const posts = await prisma.forumPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: PER_SOURCE,
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  });
  return posts.map((post) => ({
    id: `foro-${post.id}`,
    kind: 'foro',
    day: toFeedDay(post.createdAt),
    sortKey: post.createdAt.toISOString(),
    title: post.title,
    meta: post.author.name,
    description: `Tema nuevo en ${post.category.name}${
      post._count.comments > 0
        ? ` · ${post._count.comments} ${post._count.comments === 1 ? 'respuesta' : 'respuestas'}`
        : '. Sumá tu respuesta.'
    }`,
    href: `/foro/tema/${post.id}`,
  }));
};

const adviceItems = async (): Promise<FeedItem[]> => {
  const advice = await prisma.advice.findMany({
    orderBy: { createdAt: 'desc' },
    take: PER_SOURCE,
    select: { id: true, content: true, createdAt: true, author: { select: { name: true } } },
  });
  return advice.map((item) => ({
    id: `consejo-${item.id}`,
    kind: 'consejo',
    day: toFeedDay(item.createdAt),
    sortKey: item.createdAt.toISOString(),
    title: excerpt(item.content, 90),
    meta: item.author.name,
    href: `/consejos/${item.id}`,
  }));
};

const announcementItems = async (): Promise<FeedItem[]> => {
  const announcements = await prisma.announcement.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: PER_SOURCE,
    select: { id: true, title: true, content: true, createdAt: true },
  });
  return announcements.map((announcement) => ({
    id: `anuncio-${announcement.id}`,
    kind: 'anuncio',
    day: toFeedDay(announcement.createdAt),
    sortKey: announcement.createdAt.toISOString(),
    title: announcement.title,
    description: excerpt(announcement.content, 160),
    href: '/anuncios',
  }));
};

const testimonialItems = async (): Promise<FeedItem[]> => {
  const testimonials = await prisma.testimonial.findMany({
    where: { user: ACTIVE_USER },
    orderBy: { createdAt: 'desc' },
    take: PER_SOURCE,
    select: { id: true, body: true, createdAt: true, user: { select: { name: true } } },
  });
  return testimonials.map((testimonial) => ({
    id: `testimonio-${testimonial.id}`,
    kind: 'testimonio',
    day: toFeedDay(testimonial.createdAt),
    sortKey: testimonial.createdAt.toISOString(),
    title: `${testimonial.user.name} contó qué le dejó la comunidad`,
    description: excerpt(testimonial.body, 160),
    href: `/testimonios/${testimonial.id}`,
  }));
};

const workPlaceItems = async (): Promise<FeedItem[]> => {
  const places = await prisma.workPlace.findMany({
    orderBy: { createdAt: 'desc' },
    take: PER_SOURCE,
    select: {
      id: true,
      name: true,
      city: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });
  return places.map((place) => ({
    id: `lugar-${place.id}`,
    kind: 'lugar',
    day: toFeedDay(place.createdAt),
    sortKey: place.createdAt.toISOString(),
    title: `${place.name}, en ${place.city}`,
    meta: place.author.name,
    description: 'Un lugar nuevo para ir a laburar.',
    href: '/lugares',
  }));
};

const jobOfferItems = async (): Promise<FeedItem[]> => {
  const offers = await listOpenJobOffers();
  return offers.slice(0, PER_SOURCE).map((offer) => ({
    id: `empleo-${offer.id}`,
    kind: 'empleo',
    day: toFeedDay(offer.createdAt),
    sortKey: offer.createdAt.toISOString(),
    title: `${offer.title} en ${offer.company}`,
    meta: offer.location,
    description: excerpt(offer.description, 160),
    href: `/empleos?q=${encodeURIComponent(offer.title)}`,
  }));
};

/** New members, one entry per day: who joins is news, a row per person would flood the feed. */
const memberItems = async (): Promise<FeedItem[]> => {
  const users = await prisma.user.findMany({
    where: { ...ACTIVE_USER, emailVerified: true },
    orderBy: { createdAt: 'desc' },
    take: 60,
    select: { id: true, name: true, createdAt: true },
  });
  const byDay = new Map<string, typeof users>();
  for (const user of users) {
    const day = toFeedDay(user.createdAt);
    byDay.set(day, [...(byDay.get(day) ?? []), user]);
  }
  return [...byDay.entries()].slice(0, PER_SOURCE).map(([day, joined]) => {
    const names = joined.map((user) => user.name.split(' ')[0]);
    const shown = names.slice(0, 3).join(', ');
    const rest = names.length - 3;
    return {
      id: `miembros-${day}`,
      kind: 'miembros' as const,
      day,
      sortKey: joined[0].createdAt.toISOString(),
      title:
        joined.length === 1
          ? `${names[0]} se sumó a la comunidad`
          : `${joined.length} personas se sumaron a la comunidad`,
      description:
        joined.length === 1
          ? '¡Dale la bienvenida!'
          : `${shown}${rest > 0 ? ` y ${rest} más` : ''}. ¡Denles la bienvenida!`,
      // One newcomer goes to their profile; several, to the members list.
      href: joined.length === 1 ? `/perfil/${joined[0].id}` : '/miembros',
    };
  });
};

const buildFeed = cached(
  'feed',
  async (): Promise<FeedItem[]> => {
    const sources = await Promise.all([
      eventItems(),
      talkItems(),
      galleryItems(),
      setupItems(),
      projectItems(),
      conversationItems(),
      changelogItems(),
      firstContributionItems(),
      forumItems(),
      adviceItems(),
      announcementItems(),
      testimonialItems(),
      workPlaceItems(),
      jobOfferItems(),
      memberItems(),
    ]);
    const hidden = new Set(
      (await prisma.hiddenFeedItem.findMany({ select: { itemId: true } })).map(
        ({ itemId }) => itemId,
      ),
    );
    return sources
      .flat()
      .filter((item) => !hidden.has(item.id))
      .sort((a, b) => b.day.localeCompare(a.day) || b.sortKey.localeCompare(a.sortKey))
      .slice(0, MAX_ITEMS);
  },
  {
    models: [
      'Event',
      'Talk',
      'TalkSpeaker',
      'User',
      'GalleryItem',
      'Setup',
      'Project',
      'IdentityLink',
      'ForumPost',
      'ForumCategory',
      'ForumComment',
      'Advice',
      'Announcement',
      'Testimonial',
      'WorkPlace',
      'JobOffers',
      'HiddenFeedItem',
    ],
  },
);

/** What's been going on in the community lately, from every corner of the site, newest first. */
export const fetchFeed = async (): Promise<FeedItem[]> =>
  (await buildFeed()).map((item) =>
    item.thumbs
      ? {
          ...item,
          thumbs: item.thumbs.map(({ id, src }) => ({ id, src: signGallerySrc(src).url })),
        }
      : item,
  );

/** What the admins took off the feed, newest first, for /admin/feed. */
export const listHiddenFeedItems = () =>
  prisma.hiddenFeedItem.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      itemId: true,
      title: true,
      href: true,
      createdAt: true,
      hiddenBy: { select: { name: true } },
    },
  });
