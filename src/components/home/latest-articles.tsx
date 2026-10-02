import { articles } from '@/app/(platform)/lectura/articles';
import { RelatedArticles } from '@/components/courses/related-articles';
import { getArticleWriters } from '@/lib/article-writers';
import { SectionHeader } from './section-header';

const LATEST_ARTICLES_COUNT = 6;

// `articles` is already sorted newest first.
const latestArticles = articles.slice(0, LATEST_ARTICLES_COUNT);

export const LatestArticlesSection = async () => {
  const writers = await getArticleWriters();
  // Articles written by community members show the member's profile photo, not the one that
  // came with the article.
  const avatars: Record<string, string> = {};
  for (const article of latestArticles) {
    const image = writers[article.id]?.find((writer) => writer.image)?.image;
    if (image) avatars[article.id] = image;
  }

  return (
    <section>
      <SectionHeader
        eyebrow="Lectura"
        title={
          <>
            Últimos <span className="text-pcnGreen">artículos</span> agregados
          </>
        }
        description="Lo más reciente que estamos leyendo sobre ingeniería de software, arquitectura y producto."
        action={{ label: 'Ver todos los artículos', href: '/lectura' }}
      />

      <RelatedArticles articles={latestArticles} avatars={avatars} showDate />
    </section>
  );
};
