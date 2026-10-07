import { cached } from '@/lib/cache';
import prisma from '@/lib/prisma';

// Reads for /foro, the same for everyone: cached and expired by any write to these tables.

const authorSelect = { select: { id: true, name: true, image: true } } as const;
const FORUM_MODELS = [
  'ForumCategory',
  'ForumPost',
  'ForumComment',
  'ForumPostLike',
  'User',
] as const;

/** Threads per page of a list. */
export const FORUM_PAGE_SIZE = 50;

export const listForumCategories = cached(
  'forum-categories',
  () =>
    prisma.forumCategory.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { posts: true } } },
    }),
  { models: ['ForumCategory', 'ForumPost'] },
);

/** Threads, pinned first and then by last activity, optionally of one category. */
export const listForumPosts = cached(
  'forum-posts',
  (categoryId: string | null) =>
    prisma.forumPost.findMany({
      where: categoryId ? { categoryId } : {},
      orderBy: [{ isPinned: 'desc' }, { activeAt: 'desc' }],
      take: FORUM_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        isPinned: true,
        isLocked: true,
        createdAt: true,
        activeAt: true,
        author: authorSelect,
        category: { select: { slug: true, name: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
  { models: FORUM_MODELS },
);

export type ForumPostSummary = Awaited<ReturnType<typeof listForumPosts>>[number];

/** One thread with its likes and every reply (flat, oldest first; the page nests them). */
export const getForumPost = cached(
  'forum-post',
  (id: string) =>
    prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: authorSelect,
        category: { select: { id: true, slug: true, name: true } },
        likes: { select: { userId: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { author: authorSelect },
        },
      },
    }),
  { models: FORUM_MODELS },
);

export type ForumPostDetail = NonNullable<Awaited<ReturnType<typeof getForumPost>>>;
export type ForumCommentRow = ForumPostDetail['comments'][number];
