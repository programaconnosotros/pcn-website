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

export type FeedKind =
  | 'evento'
  | 'charla'
  | 'fotos'
  | 'setup'
  | 'proyecto'
  | 'conversacion'
  | 'changelog'
  | 'desarrollo';

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
    ]);
    return sources
      .flat()
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
