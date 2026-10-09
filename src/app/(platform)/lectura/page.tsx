import { getAdminUser } from '@/lib/admin';
import { getArticleWriters } from '@/lib/article-writers';
import { getArticles, getBooks } from '@/lib/recommendations';
import { ReadingPage } from './reading-page';

export default async function LecturaPage() {
  const [articles, books, articleWriters, admin] = await Promise.all([
    getArticles(),
    getBooks(),
    getArticleWriters(),
    getAdminUser(),
  ]);

  return (
    <ReadingPage
      articles={articles}
      books={books}
      articleWriters={articleWriters}
      isAdmin={!!admin}
    />
  );
}
