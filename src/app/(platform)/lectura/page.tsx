import { getAdminUser } from '@/lib/admin';
import prisma from '@/lib/prisma';
import type { Person } from '@/components/people/person-link';
import { ReadingPage } from './reading-page';

export default async function LecturaPage() {
  const [authors, admin] = await Promise.all([
    prisma.articleAuthor.findMany({
      select: { articleId: true, user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    getAdminUser(),
  ]);

  const articleWriters: Record<string, Person[]> = {};
  for (const { articleId, user } of authors) (articleWriters[articleId] ??= []).push(user);

  return <ReadingPage articleWriters={articleWriters} isAdmin={!!admin} />;
}
