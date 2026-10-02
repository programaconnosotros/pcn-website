import prisma from '@/lib/prisma';
import { getIdentityMap } from '@/lib/identity-links';
import { articleAuthors, articles } from '@/app/(platform)/lectura/articles';
import type { Writer } from '@/app/(platform)/lectura/article-writers';

/**
 * The community members who wrote each /lectura article, by article id. Members linked to the
 * article's author names in /vinculos come first, then the ones tagged on the article itself.
 */
export const getArticleWriters = async (): Promise<Record<string, Writer[]>> => {
  const [authors, authorLinks] = await Promise.all([
    prisma.articleAuthor.findMany({
      select: { articleId: true, user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    getIdentityMap('articulos'),
  ]);

  const articleWriters: Record<string, Writer[]> = {};
  for (const article of articles) {
    for (const name of articleAuthors(article)) {
      const user = authorLinks[name];
      if (user) (articleWriters[article.id] ??= []).push({ ...user, linkedAuthor: name });
    }
  }
  for (const { articleId, user } of authors) {
    const writers = (articleWriters[articleId] ??= []);
    if (!writers.some((writer) => writer.id === user.id)) writers.push(user);
  }
  return articleWriters;
};
