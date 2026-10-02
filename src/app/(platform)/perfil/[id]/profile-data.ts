import { cache } from 'react';
import prisma from '@/lib/prisma';
import { galleryOrder, visibleGalleryItem } from '@/lib/gallery';
import { signGalleryItem } from '@/lib/gallery-signing';
import { articleAuthors, articles as allArticles } from '@/app/(platform)/lectura/articles';
import { conversations as allConversations } from '@/data/whatsapp-conversations';
import { getCollaborationStats } from '@/lib/github-stats';
import { getUserIdentities } from '@/lib/identity-links';
import type { ProfileProject, ProfileTab } from '@/components/profile/profile-sections';

// One loader per profile section, each memoized for the request, so a tab only waits for its
// own data while the overview and the tab counts reuse whatever the other loaders fetched.

export const getProfileIdentities = cache((userId: string) => getUserIdentities(userId));

export const getProfileAdvises = cache((userId: string) =>
  prisma.advise.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, image: true, email: true } },
      likes: true,
    },
  }),
);

export const getProfileTalks = cache((userId: string) =>
  prisma.talk.findMany({
    where: { speakers: { some: { userId } } },
    include: {
      event: { select: { date: true, placeName: true, city: true } },
      speakers: { orderBy: { order: 'asc' } },
    },
    orderBy: [{ event: { date: 'desc' } }, { createdAt: 'desc' }],
  }),
);

export const getProfileProjects = cache(async (userId: string): Promise<ProfileProject[]> => {
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
});

export const getProfileEvents = cache((userId: string) =>
  prisma.event.findMany({
    where: { deletedAt: null, organizers: { some: { userId } } },
    select: {
      id: true,
      name: true,
      date: true,
      isOnline: true,
      placeName: true,
      city: true,
      flyerImages: true,
    },
    orderBy: { date: 'desc' },
  }),
);

export const getProfilePhotos = cache(async (userId: string) => {
  const items = await prisma.galleryItem.findMany({
    where: { ...visibleGalleryItem, tags: { some: { userId } } },
    select: { id: true, kind: true, description: true, src: true, thumbSrc: true },
    orderBy: galleryOrder,
  });
  return items.map(signGalleryItem);
});

// Articles from /lectura that an admin marked as written by this user, one by one or through
// an author name linked in /vinculos, newest first. `index` is the article's spot in /lectura.
export const getProfileArticles = cache(async (userId: string) => {
  const [authorships, identities] = await Promise.all([
    prisma.articleAuthor.findMany({ where: { userId }, select: { articleId: true } }),
    getProfileIdentities(userId),
  ]);
  const writtenIds = new Set(authorships.map(({ articleId }) => articleId));
  const authorNames = new Set(identities.articulos);
  return allArticles
    .filter(
      (article) =>
        writtenIds.has(article.id) || articleAuthors(article).some((name) => authorNames.has(name)),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((article) => ({ article, index: allArticles.indexOf(article) }));
});

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

export const getProfileCounts = cache(
  async (userId: string): Promise<Partial<Record<ProfileTab, number>>> => {
    const [projects, advises, talks, articles, events, photos, conversations, github] =
      await Promise.all([
        getProfileProjects(userId),
        getProfileAdvises(userId),
        getProfileTalks(userId),
        getProfileArticles(userId),
        getProfileEvents(userId),
        getProfilePhotos(userId),
        getProfileConversations(userId),
        getProfileContributions(userId),
      ]);
    return {
      proyectos: projects.length,
      consejos: advises.length,
      charlas: talks.length,
      articulos: articles.length,
      eventos: events.length,
      fotos: photos.length,
      conversaciones: conversations.length,
      ...(github.contributions.length > 0 && { contribuciones: github.mergedPrs }),
    };
  },
);
