import { getAdminUser } from '@/lib/admin';
import { getArticleWriters } from '@/lib/article-writers';
import { ReadingPage } from './reading-page';

export default async function LecturaPage() {
  const [articleWriters, admin] = await Promise.all([getArticleWriters(), getAdminUser()]);

  return <ReadingPage articleWriters={articleWriters} isAdmin={!!admin} />;
}
