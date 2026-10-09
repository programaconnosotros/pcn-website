import type { Language } from '@/components/ui/language-filter';

// The articles themselves live in the database (Recommendation, kind ARTICLE): read them with
// `getArticles` from `@/lib/recommendations`.

export interface Article {
  id: string;
  title: string;
  author: string;
  /** Other people who signed the article with `author`. */
  coauthors?: string[];
  source: string;
  category: string;
  description: string;
  url: string;
  avatar: string;
  date: string; // ISO YYYY-MM-DD
  language: Language;
}

/** Everyone who signed an article: its author first, then any coauthors. */
export const articleAuthors = (article: Article) => [article.author, ...(article.coauthors ?? [])];
