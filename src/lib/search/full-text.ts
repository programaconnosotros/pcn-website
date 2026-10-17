import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { ACTIVE_USER } from '@/lib/active-user';
import { normalizeSearchText } from './search-index';

/**
 * Postgres full-text search for the tables that keep growing: forum topics and replies, consejos
 * and members (indexes in prisma/migrations/20261031120000_full_text_search). Every query word
 * must start a word in the row, like the in-memory search; a row that only comes close (a typo,
 * "reakt" for "React") also matches, ranked after the exact ones.
 *
 * Each query finds the matching ids and then loads the rows through Prisma, so they get the same
 * filters, selects and display names as everywhere else. The WHERE expressions repeat the index
 * expressions exactly: change one and Postgres stops using the index.
 */

const CANDIDATES = 20;
// pg_trgm's word similarity a typo needs (0 to 1). Its default, 0.6, misses "reakt" or
// "tipscript"; below 0.5, "python" starts finding "Pytorch".
const TYPO_THRESHOLD = 0.5;
// Shorter queries share too many trigrams with anything to tolerate typos.
const TYPO_MIN_LENGTH = 4;

export interface FullTextQuery {
  /** Every word as a prefix, all required: `progra:* & func:*`. */
  prefixes: string;
  /** The normalized query, for the typo match. */
  text: string;
  typos: boolean;
}

/** Null when the query has nothing to search for. */
export const fullTextQuery = (query: string): FullTextQuery | null => {
  const text = normalizeSearchText(query).trim();
  if (!text) return null;
  // normalizeSearchText leaves only [a-z0-9] and spaces, nothing tsquery would read as syntax.
  const prefixes = text
    .split(' ')
    .map((word) => `${word}:*`)
    .join(' & ');
  return { prefixes, text, typos: text.length >= TYPO_MIN_LENGTH };
};

type IdRow = { id: string };

/** Runs the id query with the typo threshold set for this transaction only. */
const matchingIds = async (query: Prisma.PrismaPromise<IdRow[]>) => {
  const [, rows] = await prisma.$transaction([
    prisma.$executeRaw`SELECT set_config('pg_trgm.word_similarity_threshold', ${String(TYPO_THRESHOLD)}, true)`,
    query,
  ]);
  return rows.map((row) => row.id);
};

/** `rows` in the order of `ids`, the best match first. */
const inOrder = <T extends { id: string }>(ids: string[], rows: T[]) => {
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.flatMap((id) => byId.get(id) ?? []);
};

export const searchMembers = async (query: FullTextQuery) => {
  const ids = await matchingIds(prisma.$queryRaw<IdRow[]>`
    SELECT "id" FROM "User"
    WHERE to_tsvector('simple', search_text("name" || ' ' || coalesce("jobTitle", '') || ' ' || coalesce("enterprise", '') || ' ' || coalesce("slogan", '') || ' ' || coalesce("career", '') || ' ' || coalesce("studyPlace", ''))) @@ to_tsquery('simple', ${query.prefixes})
       OR (${query.typos} AND ${query.text} <% search_text("name" || ' ' || coalesce("jobTitle", '') || ' ' || coalesce("enterprise", '') || ' ' || coalesce("slogan", '') || ' ' || coalesce("career", '') || ' ' || coalesce("studyPlace", '')))
    ORDER BY
      to_tsvector('simple', search_text("name")) @@ to_tsquery('simple', ${query.prefixes}) DESC,
      word_similarity(${query.text}, search_text("name" || ' ' || coalesce("jobTitle", '') || ' ' || coalesce("enterprise", '') || ' ' || coalesce("slogan", '') || ' ' || coalesce("career", '') || ' ' || coalesce("studyPlace", ''))) DESC,
      "createdAt"
    LIMIT ${CANDIDATES}
  `);
  if (ids.length === 0) return [];
  // Only what a public profile shows: never emails or phones. Suspended accounts stay out.
  const users = await prisma.user.findMany({
    where: { id: { in: ids }, ...ACTIVE_USER },
    select: {
      id: true,
      name: true,
      jobTitle: true,
      enterprise: true,
      slogan: true,
      career: true,
      studyPlace: true,
    },
  });
  return inOrder(ids, users);
};

export const searchAdvice = async (query: FullTextQuery) => {
  // By its text, or every consejo of a member whose name matches.
  const ids = await matchingIds(prisma.$queryRaw<IdRow[]>`
    SELECT "Advice"."id" FROM "Advice"
    JOIN "User" ON "User"."id" = "Advice"."authorId"
    WHERE to_tsvector('simple', search_text("Advice"."content")) @@ to_tsquery('simple', ${query.prefixes})
       OR to_tsvector('simple', search_text("User"."name")) @@ to_tsquery('simple', ${query.prefixes})
       OR (${query.typos} AND ${query.text} <% search_text("Advice"."content"))
    ORDER BY
      ts_rank(to_tsvector('simple', search_text("Advice"."content")), to_tsquery('simple', ${query.prefixes})) DESC,
      word_similarity(${query.text}, search_text("Advice"."content")) DESC,
      "Advice"."createdAt" DESC
    LIMIT ${CANDIDATES}
  `);
  if (ids.length === 0) return [];
  const advice = await prisma.advice.findMany({
    where: { id: { in: ids } },
    select: { id: true, content: true, author: { select: { name: true } } },
  });
  return inOrder(ids, advice);
};

export const searchForumPosts = async (query: FullTextQuery) => {
  const ids = await matchingIds(prisma.$queryRaw<IdRow[]>`
    SELECT "id" FROM "ForumPost"
    WHERE to_tsvector('simple', search_text("title" || ' ' || "content")) @@ to_tsquery('simple', ${query.prefixes})
       OR (${query.typos} AND ${query.text} <% search_text("title" || ' ' || "content"))
    ORDER BY
      ts_rank(to_tsvector('simple', search_text("title" || ' ' || "content")), to_tsquery('simple', ${query.prefixes})) DESC,
      word_similarity(${query.text}, search_text("title" || ' ' || "content")) DESC,
      "activeAt" DESC
    LIMIT ${CANDIDATES}
  `);
  if (ids.length === 0) return [];
  const posts = await prisma.forumPost.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      content: true,
      author: { select: { name: true } },
      category: { select: { slug: true } },
    },
  });
  return inOrder(ids, posts);
};

// Replies too: the answer someone is looking for is often in one.
export const searchForumComments = async (query: FullTextQuery) => {
  const ids = await matchingIds(prisma.$queryRaw<IdRow[]>`
    SELECT "id" FROM "ForumComment"
    WHERE to_tsvector('simple', search_text("content")) @@ to_tsquery('simple', ${query.prefixes})
       OR (${query.typos} AND ${query.text} <% search_text("content"))
    ORDER BY
      ts_rank(to_tsvector('simple', search_text("content")), to_tsquery('simple', ${query.prefixes})) DESC,
      word_similarity(${query.text}, search_text("content")) DESC,
      "createdAt" DESC
    LIMIT ${CANDIDATES}
  `);
  if (ids.length === 0) return [];
  const comments = await prisma.forumComment.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      content: true,
      author: { select: { name: true } },
      post: { select: { id: true, title: true } },
    },
  });
  return inOrder(ids, comments);
};
