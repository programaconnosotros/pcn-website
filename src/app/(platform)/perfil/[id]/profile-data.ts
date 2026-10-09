import { cache } from 'react';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import {
  galleryOrder,
  getPendingWorkingPhotos,
  getWorkingPhotos,
  visibleGalleryItem,
} from '@/lib/gallery';
import { signGalleryItem } from '@/lib/gallery-signing';
import { articleAuthors } from '@/app/(platform)/lectura/articles';
import { conversations as allConversations } from '@/data/whatsapp-conversations';
import { visibleExtractedConsejos } from '@/lib/hidden-consejos';
import { fromAdvice, fromExtracted, sortByNewest } from '@/lib/consejos';
import { listExtractedActivity } from '@/lib/consejos-server';
import { getCollaborationStats } from '@/lib/github-stats';
import { getIdentityMap, getUserIdentities } from '@/lib/identity-links';
import { changelog } from '@/data/changelog';
import { changelogBy, visibleChangelog } from '@/lib/changelog';
import type { ProfileProject, ProfileTab } from '@/components/profile/profile-sections';
import { setupSelect } from '@/lib/setups';
import { videoSpeakers } from '@/components/videos/videos';
import { courseTeachers } from '@/app/(platform)/cursos/courses';
import { getAllCourses, getArticles, getVideos } from '@/lib/recommendations';

// One loader per profile section, so a tab only waits for its own data while the overview and
// the tab counts reuse whatever the other loaders fetched. The ones that read the database are
// cached across requests (src/lib/cache.ts); the rest are memoized for the request.

export const getProfileIdentities = cache((userId: string) => getUserIdentities(userId));

// Consejos the user published plus the ones extracted from conversations under any WhatsApp
// name an admin linked to them, newest first, like /consejos lists them.
export const getProfileAdvice = cached(
  'profile-advice',
  async (userId: string) => {
    const [advice, identities, user, activity, extractedConsejos] = await Promise.all([
      prisma.advice.findMany({
        where: { authorId: userId },
        include: {
          author: { select: { id: true, name: true, image: true } },
          likes: { select: { userId: true } },
          _count: { select: { comments: true } },
        },
      }),
      getProfileIdentities(userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, image: true },
      }),
      listExtractedActivity(),
      visibleExtractedConsejos(),
    ]);
    // Every linked name resolves to this user, so extracted consejos credit their profile.
    const profiles = user
      ? Object.fromEntries(identities.whatsapp.map((name) => [name, user]))
      : {};
    return sortByNewest([
      ...advice.map(fromAdvice),
      ...extractedConsejos
        .filter((consejo) => consejo.member in profiles)
        .map((consejo) => fromExtracted(consejo, profiles, activity[consejo.id])),
    ]);
  },
  { models: ['Advice', 'User', 'Like', 'Comment', 'IdentityLink', 'HiddenConsejo'] },
);

export const getProfileTalks = cached(
  'profile-talks',
  async (userId: string) => {
    // Same shape as /charlas, so the profile shows them with the same cell.
    const talks = await prisma.talk.findMany({
      where: { speakers: { some: { userId } } },
      include: {
        event: {
          select: { id: true, name: true, date: true, placeName: true, city: true, isOnline: true },
        },
        speakers: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Newest first by the event's date, or the date typed in for talks outside our events.
    const date = (talk: (typeof talks)[number]) =>
      (talk.event?.date ?? talk.manualEventDate)?.getTime() ?? -Infinity;
    return talks.sort((a, b) => date(b) - date(a));
  },
  { models: ['Talk', 'TalkSpeaker', 'Event', 'User'] },
);

export const getProfileProjects = cached(
  'profile-projects',
  async (userId: string): Promise<ProfileProject[]> => {
    const projects = await prisma.project.findMany({
      where: { OR: [{ authorId: userId }, { members: { some: { userId } } }] },
      select: {
        id: true,
        title: true,
        description: true,
        logoUrl: true,
        techStack: true,
        authorId: true,
        authorRole: true,
        members: { where: { userId }, select: { role: true }, take: 1 },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    // El rol que se cargó en el proyecto; si no hay, si es autor o colaborador.
    return projects.map(({ members, authorRole, ...project }) => ({
      ...project,
      role: project.authorId === userId ? authorRole || 'autor' : members[0]?.role || 'colaborador',
    }));
  },
  { models: ['Project', 'ProjectMember'] },
);

export const getProfileEvents = cached(
  'profile-events',
  (userId: string) =>
    // Same shape as /eventos, so the profile shows them with its posters and exhibits.
    prisma.event.findMany({
      where: { deletedAt: null, organizers: { some: { userId } } },
      include: {
        _count: {
          select: {
            registrations: { where: { cancelledAt: null } },
            galleryItems: { where: visibleGalleryItem },
            talks: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    }),
  { models: ['Event', 'EventOrganizer', 'EventRegistration', 'GalleryItem', 'Talk'] },
);

// Videos from /videos where the user is credited, through the speaker names linked to them in
// /vinculos, newest first.
export const getProfileVideos = cache(async (userId: string) => {
  const names = new Set((await getProfileIdentities(userId)).videos);
  if (names.size === 0) return [];
  return (await getVideos()).filter((video) =>
    videoSpeakers(video).some((name) => names.has(name)),
  );
});

// Courses from /cursos the user taught, through the teacher names linked to them in /vinculos,
// newest first.
export const getProfileCourses = cache(async (userId: string) => {
  const names = new Set((await getProfileIdentities(userId)).cursos);
  if (names.size === 0) return [];
  return (await getAllCourses())
    .filter((course) => courseTeachers(course).some((name) => names.has(name)))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
});

// Setups the user shared, by their own date like /setups lists them.
export const getProfileSetups = cached(
  'profile-setups',
  (userId: string) =>
    prisma.setup.findMany({
      where: { authorId: userId },
      select: setupSelect,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    }),
  { models: ['Setup', 'SetupLike', 'User'] },
);

// Cached unsigned: signed URLs expire, so they're signed on each request.
const listProfilePhotos = cached(
  'profile-photos',
  (userId: string) =>
    prisma.galleryItem.findMany({
      where: { ...visibleGalleryItem, tags: { some: { userId } } },
      select: { id: true, kind: true, description: true, src: true, thumbSrc: true },
      orderBy: galleryOrder,
    }),
  { models: ['GalleryItem', 'GalleryItemTag'] },
);

export const getProfilePhotos = cache(async (userId: string) =>
  (await listProfilePhotos(userId)).map(signGalleryItem),
);

// Photos of the person at work (they appear in them), and the ones they uploaded still in review.
export const getProfileWorkingPhotos = cache(getWorkingPhotos);
export const getProfilePendingWorkingPhotos = getPendingWorkingPhotos;

// Articles from /lectura that an admin marked as written by this user, one by one or through
// an author name linked in /vinculos, newest first. `index` is the article's spot in /lectura.
export const getProfileArticles = cached(
  'profile-articles',
  async (userId: string) => {
    const [authorships, identities, allArticles] = await Promise.all([
      prisma.articleAuthor.findMany({ where: { userId }, select: { articleId: true } }),
      getProfileIdentities(userId),
      getArticles(),
    ]);
    const writtenIds = new Set(authorships.map(({ articleId }) => articleId));
    const authorNames = new Set(identities.articulos);
    return allArticles
      .filter(
        (article) =>
          writtenIds.has(article.id) ||
          articleAuthors(article).some((name) => authorNames.has(name)),
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((article) => ({ article, index: allArticles.indexOf(article) }));
  },
  { models: ['ArticleAuthor', 'IdentityLink', 'Recommendation'] },
);

// Conversations where any of the WhatsApp names an admin linked to this user took part.
export const getProfileConversations = cache(async (userId: string) => {
  const whatsappNames = new Set((await getProfileIdentities(userId)).whatsapp);
  return allConversations
    .filter((conversation) => conversation.participants.some((name) => whatsappNames.has(name)))
    .sort((a, b) => b.date.localeCompare(a.date));
});

// Contributions to this website's repo, from the GitHub logins linked to this user.
export const getProfileContributions = cache(async (userId: string) => {
  const logins = (await getProfileIdentities(userId)).github;
  const githubStats = logins.length > 0 ? await getCollaborationStats() : null;
  const contributions =
    githubStats?.topContributors.filter((contributor) => logins.includes(contributor.login)) ?? [];
  return {
    linked: logins.length > 0,
    contributions,
    totals: { mergedPrs: githubStats?.mergedPrs ?? 0, commits: githubStats?.commits ?? 0 },
    mergedPrs: contributions.reduce((sum, contributor) => sum + contributor.mergedPrs, 0),
    commits: contributions.reduce((sum, contributor) => sum + contributor.commits, 0),
    linesAdded: contributions.some((contributor) => contributor.linesAdded === null)
      ? null
      : contributions.reduce((sum, contributor) => sum + (contributor.linesAdded ?? 0), 0),
  };
});

// What this user built in the site, as the /changelog entries crediting their GitHub logins.
export const getProfileChangelog = cache(async (userId: string, isAdmin: boolean) => {
  const logins = (await getProfileIdentities(userId)).github;
  if (logins.length === 0) return [];
  return changelogBy(visibleChangelog(changelog, isAdmin, await getIdentityMap('github')), logins);
});

export const getProfileCounts = cache(
  async (userId: string): Promise<Partial<Record<ProfileTab, number>>> => {
    const [
      projects,
      advice,
      talks,
      articles,
      videos,
      courses,
      events,
      photos,
      setups,
      working,
      conversations,
      github,
    ] = await Promise.all([
      getProfileProjects(userId),
      getProfileAdvice(userId),
      getProfileTalks(userId),
      getProfileArticles(userId),
      getProfileVideos(userId),
      getProfileCourses(userId),
      getProfileEvents(userId),
      getProfilePhotos(userId),
      getProfileSetups(userId),
      getProfileWorkingPhotos(userId),
      getProfileConversations(userId),
      getProfileContributions(userId),
    ]);
    return {
      proyectos: projects.length,
      consejos: advice.length,
      charlas: talks.length,
      articulos: articles.length,
      videos: videos.length,
      cursos: courses.length,
      eventos: events.length,
      fotos: photos.length,
      setups: setups.length,
      trabajando: working.length,
      conversaciones: conversations.length,
      ...(github.contributions.length > 0 && { contribuciones: github.mergedPrs }),
    };
  },
);
