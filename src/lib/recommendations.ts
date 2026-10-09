import { cache } from 'react';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import type { Prisma, RecommendationKind } from '@/generated/prisma/client';
import type { Language } from '@/components/ui/language-filter';
import type { Video } from '@/components/videos/videos';
import type { Article } from '@/app/(platform)/lectura/articles';
import type { Book } from '@/app/(platform)/lectura/books';
import type { Course } from '@/app/(platform)/cursos/courses';

// What /lectura, /cursos, /videos and the external talks of /charlas list: the approved rows of
// Recommendation, read once (cached, a few hundred short rows) and shaped like each page's type.

/** The columns a public listing needs: never the submitter's note or who reviewed it. */
export const publicRecommendationSelect = {
  id: true,
  kind: true,
  slug: true,
  title: true,
  description: true,
  url: true,
  author: true,
  coauthors: true,
  source: true,
  categories: true,
  language: true,
  publishedAt: true,
  year: true,
  imageUrl: true,
  isbn: true,
  durationSeconds: true,
  hours: true,
  youtubeUrls: true,
  isTalk: true,
  isMadeByCommunity: true,
  acceptDonations: true,
  position: true,
  createdAt: true,
} satisfies Prisma.RecommendationSelect;

export type RecommendationRow = Prisma.RecommendationGetPayload<{
  select: typeof publicRecommendationSelect;
}>;

/** Every approved recommendation, in the order the lists had (position, then oldest first). */
export const listApprovedRecommendations = cached(
  'approved-recommendations',
  () =>
    prisma.recommendation.findMany({
      where: { status: 'APPROVED' },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: publicRecommendationSelect,
    }),
  { models: ['Recommendation'] },
);

const isoDay = (date: Date | null) => (date ? date.toISOString().slice(0, 10) : '');
const language = (value: string | null): Language => (value === 'en' ? 'en' : 'es');
// Optional fields stay out of the objects when empty, like they were in the old lists.

export const toVideo = (row: RecommendationRow): Video => ({
  id: row.slug,
  title: row.title,
  ...(row.author && { speaker: row.author }),
  channel: row.source ?? '',
  date: isoDay(row.publishedAt),
  durationSeconds: row.durationSeconds ?? 0,
  language: language(row.language),
  ...(row.isTalk && { isTalk: true }),
});

export const toArticle = (row: RecommendationRow): Article => ({
  id: row.slug,
  title: row.title,
  author: row.author ?? '',
  ...(row.coauthors.length > 0 && { coauthors: row.coauthors }),
  source: row.source ?? '',
  category: row.categories[0] ?? '',
  description: row.description,
  url: row.url ?? '',
  avatar: row.imageUrl ?? '',
  date: isoDay(row.publishedAt),
  language: language(row.language),
});

export const toBook = (row: RecommendationRow): Book => ({
  id: row.slug,
  title: row.title,
  author: row.author ?? '',
  language: language(row.language),
  categories: row.categories,
  description: row.description,
  ...(row.year !== null && { year: row.year }),
  ...(row.imageUrl && { cover: row.imageUrl }),
  ...(row.isbn && { isbn: row.isbn }),
  ...(row.url && { url: row.url }),
});

export const toCourse = (row: RecommendationRow): Course => ({
  id: row.slug,
  name: row.title,
  description: row.description,
  ...(row.imageUrl && { logo: row.imageUrl }),
  ...(row.youtubeUrls.length > 0 && { youtubeUrls: row.youtubeUrls }),
  ...(row.url && { websiteUrl: row.url }),
  teachedBy: row.author ?? '',
  acceptDonations: row.acceptDonations,
  isMadeByCommunity: row.isMadeByCommunity,
  date: row.publishedAt ?? row.createdAt,
  ...(row.hours !== null && { hours: row.hours }),
});

const ofKind = async (kind: RecommendationKind) =>
  (await listApprovedRecommendations()).filter((row) => row.kind === kind);

// Array.prototype.sort is stable: same-day items keep the lists' order.
const newestFirst = <T extends { date: string }>(items: T[]) =>
  items.sort((a, b) => b.date.localeCompare(a.date));

/** Every video, newest first. */
export const getVideos = cache(async () => newestFirst((await ofKind('VIDEO')).map(toVideo)));

/** Talks from other conferences the community recommends, newest first. */
export const getExternalTalks = cache(async () =>
  (await getVideos()).filter((video) => video.isTalk),
);

/** Videos that are not conference talks, so they never repeat what the external talks list. */
export const getOtherVideos = cache(async () =>
  (await getVideos()).filter((video) => !video.isTalk),
);

/** Every article, newest first. */
export const getArticles = cache(async () => newestFirst((await ofKind('ARTICLE')).map(toArticle)));

/** Every book, by title. */
export const getBooks = cache(async () =>
  (await ofKind('BOOK')).map(toBook).sort((a, b) => a.title.localeCompare(b.title)),
);

/** The courses made by the community and the recommended ones, each in the lists' order. */
export const getCourses = cache(async () => {
  const courses = (await ofKind('COURSE')).map(toCourse);
  return {
    communityCourses: courses.filter((course) => course.isMadeByCommunity),
    externalCourses: courses.filter((course) => !course.isMadeByCommunity),
  };
});

/** Community courses first, then the recommended ones. */
export const getAllCourses = cache(async () => {
  const { communityCourses, externalCourses } = await getCourses();
  return [...communityCourses, ...externalCourses];
});

export const getCourseById = async (courseId: string) =>
  (await getAllCourses()).find((course) => course.id === courseId);

/**
 * Every recommendation for the admins' review queue, pending first and then the newest, with
 * the note and who sent and reviewed it. Not cached: only admins see it, right after acting.
 */
export const listRecommendationsForReview = async () => {
  const items = await prisma.recommendation.findMany({
    orderBy: [{ createdAt: 'desc' }, { position: 'desc' }],
    include: {
      submittedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });
  const rank = { PENDING: 0, APPROVED: 1, REJECTED: 2 } as const;
  return items.sort((a, b) => rank[a.status] - rank[b.status]);
};

export type ReviewRecommendation = Awaited<ReturnType<typeof listRecommendationsForReview>>[number];
