import { getAdminUser } from '@/lib/admin';
import prisma from '@/lib/prisma';
import { getIdentityMap } from '@/lib/identity-links';
import { articleAuthors, articles } from './articles';
import type { Writer } from './article-writers';
import { ReadingPage } from './reading-page';

export default async function LecturaPage() {
  const [authors, authorLinks, admin] = await Promise.all([
    prisma.articleAuthor.findMany({
      select: { articleId: true, user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    getIdentityMap('articulos'),
    getAdminUser(),
  ]);

  // Members linked to the article's author names in /vinculos come first, then the ones tagged
  // on the article itself.
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

  return <ReadingPage articleWriters={articleWriters} isAdmin={!!admin} />;
}
