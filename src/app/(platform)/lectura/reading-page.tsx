'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { articleAuthors, type Article } from './articles';
import { ALL_BOOK_CATEGORIES, bookCategories, type Book } from './books';
import { ArticleReaderDialog } from './article-reader-dialog';
import { ArticlesPanel, isReadStatus, type ReadStatus } from './articles-panel';
import { useContentMarks } from '@/hooks/use-content-marks';
import { SearchBar } from '@/components/ui/search-bar';
import { CollapsibleFilters } from '@/components/ui/collapsible-filters';
import {
  LanguageFilter,
  matchesLanguage,
  type LanguageFilterValue,
} from '@/components/ui/language-filter';
import { RecommendButton } from '@/components/recommendations/recommend-button';
import type { Writer } from './article-writers';

const BookRow = ({ book }: { book: Book }) => {
  const content = (
    <>
      {/* Cover shown as a physical book: a lit spine, page edge and a tilt towards the reader
          on hover. Covers come in different proportions, so the book hugs the whole image
          inside a fixed slot that keeps every row's text aligned. */}
      <div className="flex h-32 w-26 shrink-0 items-start justify-center perspective-[600px] sm:h-36 sm:w-30">
        <div className="relative w-fit origin-[left_center] rounded-[2px] shadow-[4px_6px_18px_-6px_rgba(0,0,0,0.9)] ring-1 ring-pcnGreen-200 transition-[transform,box-shadow] duration-300 ease-out group-hover:shadow-[10px_10px_28px_-8px_rgba(4,244,190,0.45)] group-hover:ring-pcnGreen-500 motion-safe:group-hover:transform-[rotateY(-14deg)]">
          {book.cover ? (
            <Image
              src={book.cover}
              alt={`Portada de ${book.title}`}
              width={240}
              height={360}
              className="block h-auto max-h-32 w-auto max-w-26 rounded-[2px] bg-muted sm:max-h-36 sm:max-w-30"
              sizes="120px"
              // Covers from other sites (a recommended book) aren't in next.config's image hosts.
              unoptimized={!book.cover.startsWith('/')}
            />
          ) : (
            // A recommended book without a cover yet: a plain spine with its title.
            <div className="flex h-32 w-22 flex-col justify-end rounded-[2px] bg-muted p-2 font-mono text-[9px] leading-tight text-muted-foreground sm:h-36 sm:w-24">
              <span className="line-clamp-4">{book.title}</span>
            </div>
          )}
          <span className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-linear-to-r from-black/60 via-white/10 to-transparent" />
          <span className="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-white/0 to-white/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-2 font-mono text-sm">
          {/* Long titles wrap on phones instead of being cut off. */}
          <h2 className="font-semibold group-hover:text-pcnGreen md:truncate">{book.title}</h2>
          <span className="ml-auto flex shrink-0 items-center gap-1 pt-0.5 text-[11px] text-muted-foreground group-hover:text-pcnGreen">
            {book.year}
            {book.url && <ArrowUpRight className="h-3 w-3" />}
          </span>
        </div>

        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {book.description}
        </p>

        <p className="truncate font-mono text-[11px] text-muted-foreground/70">
          <span className="text-pcnGreen-500">@ </span>
          {book.author}
          <span className="text-pcnGreen-500"> # </span>
          {book.categories.join(' · ')}
          {book.isbn && ` · isbn ${book.isbn}`}
        </p>
      </div>
    </>
  );

  // The tilted cover and its glow are clipped so they never spill past the row's hairlines.
  const className = cn(ruledCellClassName, 'group flex gap-4 overflow-hidden p-3');

  return book.url ? (
    <Link href={book.url} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
};

type ReadingPageProps = {
  /** Newest first. */
  articles: Article[];
  /** By title. */
  books: Book[];
  // Community members who wrote each article, by article id.
  articleWriters: Record<string, Writer[]>;
  isAdmin: boolean;
};

export const ReadingPage = ({ articles, books, articleWriters, isAdmin }: ReadingPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_BOOK_CATEGORIES);
  const categories = useMemo(() => bookCategories(books), [books]);
  const [activeTab, setActiveTab] = useState<'libros' | 'articulos'>('articulos');
  const [readerArticle, setReaderArticle] = useState<Article | null>(null);
  const [readStatus, setReadStatus] = useState<ReadStatus>('todos');
  const [language, setLanguage] = useState<LanguageFilterValue>('todos');
  const savedCount = useContentMarks('article').ids('saved').size;

  // `/lectura?lista=para-leer` opens straight into the user's reading list (and any other
  // status filter), so it can be bookmarked or linked from elsewhere.
  useEffect(() => {
    const lista = new URLSearchParams(window.location.search).get('lista');
    if (isReadStatus(lista)) {
      setActiveTab('articulos');
      setReadStatus(lista);
    }
  }, []);

  const handleReadStatusChange = (status: ReadStatus) => {
    setReadStatus(status);
    const url = new URL(window.location.href);
    if (status === 'todos') url.searchParams.delete('lista');
    else url.searchParams.set('lista', status);
    window.history.replaceState(null, '', url);
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todas las categorías' || book.categories.includes(selectedCategory);

      return matchesSearch && matchesCategory && matchesLanguage(book.language, language);
    });
  }, [books, searchTerm, selectedCategory, language]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articleAuthors(article).some((author) =>
          author.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ||
        article.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todas las categorías' || article.category === selectedCategory;

      return matchesSearch && matchesCategory && matchesLanguage(article.language, language);
    });
  }, [articles, searchTerm, selectedCategory, language]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'libros' | 'articulos');
    setSelectedCategory('Todas las categorías');
  };

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <StickyHeader>
                <PageTitle
                  path="lectura"
                  meta={`${articles.length} artículos · ${books.length} libros`}
                  action={
                    <RecommendButton
                      key={activeTab}
                      kind={activeTab === 'libros' ? 'BOOK' : 'ARTICLE'}
                    />
                  }
                />

                {/* Tabs, búsqueda y filtros en una sola línea; en el celular los filtros se pliegan */}
                <CollapsibleFilters
                  className="mb-4"
                  activeCount={
                    Number(language !== 'todos') +
                    Number(activeTab === 'libros' && selectedCategory !== 'Todas las categorías')
                  }
                  leading={
                    <TabsList className="h-8 shrink-0">
                      <TabsTrigger value="articulos">
                        Artículos
                        {savedCount > 0 && (
                          <span
                            title={`${savedCount} en tu lista para leer`}
                            className="ml-1 bg-pcnGreen px-1 text-[10px] text-black tabular-nums"
                          >
                            {savedCount}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="libros">Libros</TabsTrigger>
                    </TabsList>
                  }
                  search={
                    <SearchBar
                      searchQuery={searchTerm}
                      setSearchQuery={setSearchTerm}
                      placeholder="título, autor o descripción"
                      label="Buscar por título, autor o descripción"
                      className="max-w-none flex-1"
                    />
                  }
                >
                  <LanguageFilter value={language} onChange={setLanguage} />

                  {/* Filtro por categoría (los artículos filtran desde su propio histograma) */}
                  {activeTab === 'libros' && (
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-8 w-full md:w-[200px]">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CollapsibleFilters>
              </StickyHeader>

              {/* Tab: Artículos */}
              <TabsContent value="articulos">
                <ArticlesPanel
                  articles={articles}
                  filteredArticles={filteredArticles}
                  category={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onOpen={setReaderArticle}
                  status={readStatus}
                  onStatusChange={handleReadStatusChange}
                  writers={articleWriters}
                  isAdmin={isAdmin}
                />
              </TabsContent>

              {/* Tab: Libros */}
              <TabsContent value="libros">
                {filteredBooks.length > 0 ? (
                  <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                    {filteredBooks.map((book) => (
                      <BookRow key={book.id} book={book} />
                    ))}
                  </RuledGrid>
                ) : (
                  <p className="py-8 text-center font-mono text-sm text-muted-foreground">
                    No se encontraron libros con los filtros seleccionados.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <ArticleReaderDialog
            article={readerArticle}
            open={!!readerArticle}
            onOpenChange={(open) => {
              if (!open) setReaderArticle(null);
            }}
          />

          {/* Banner AgusLogs */}
          <RuledGrid className="mb-14 grid-cols-1">
            <Link
              href="https://aguslogs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(ruledCellClassName, 'flex group items-center gap-3 p-3')}
            >
              <Image
                src="/aguslogs-logo.png"
                alt="AgusLogs"
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-semibold group-hover:text-pcnGreen">
                  AgusLogs
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Aprendé y crecé como ingeniero de software.
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-foreground group-hover:text-pcnGreen">
                aguslogs.com
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </Link>
          </RuledGrid>
        </div>
      </div>
    </>
  );
};
