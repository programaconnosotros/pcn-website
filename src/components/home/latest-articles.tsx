import { articles } from '@/app/(platform)/lectura/articles';
import { RelatedArticles } from '@/components/courses/related-articles';
import { SectionHeader } from './section-header';

const LATEST_ARTICLES_COUNT = 6;

// `articles` is already sorted newest first.
const latestArticles = articles.slice(0, LATEST_ARTICLES_COUNT);

export const LatestArticlesSection = () => (
  <section>
    <SectionHeader
      eyebrow="Lectura"
      title={
        <>
          Últimos artículos <span className="text-pcnGreen">sugeridos</span>
        </>
      }
      description="Lo más reciente que estamos leyendo sobre ingeniería de software, arquitectura y producto."
      action={{ label: 'Ver todos los artículos', href: '/lectura' }}
    />

    <RelatedArticles articles={latestArticles} showDate />
  </section>
);
