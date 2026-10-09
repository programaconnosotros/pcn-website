import type { Language } from '@/components/ui/language-filter';

// The books themselves live in the database (Recommendation, kind BOOK): read them with
// `getBooks` from `@/lib/recommendations`.

export interface Book {
  id: string;
  title: string;
  author: string;
  /** Language of the edition we recommend. */
  language: Language;
  categories: string[];
  description: string;
  year?: number;
  /** Local path or URL of the cover; books recommended without one show a plain spine. */
  cover?: string;
  isbn?: string;
  url?: string;
}

export const ALL_BOOK_CATEGORIES = 'Todas las categorías';

/** The category filter's options: every category the books use, in order of appearance. */
export const bookCategories = (books: Book[]) => [
  ALL_BOOK_CATEGORIES,
  ...Array.from(new Set(books.flatMap((book) => book.categories))),
];
