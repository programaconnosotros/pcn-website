'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { Article } from './articles';

export const ALL_ARTICLE_CATEGORIES = 'Todas las categorías';

// Articles published in the last two months get a blinking `new` tag.
const NEW_ARTICLE_MS = 60 * 24 * 60 * 60 * 1000;

const formatDate = (iso: string) => iso.replaceAll('-', '.');

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const hexIndex = (index: number) => `0x${(index + 1).toString(16).padStart(2, '0')}`;

// A text progress bar, e.g. `████░░░░`, for the category histogram.
const bar = (value: number, max: number, width = 10) => {
  const filled = max > 0 ? Math.max(1, Math.round((value / max) * width)) : 0;
  return { filled: '█'.repeat(filled), empty: '░'.repeat(width - filled) };
};

interface ArticlesPanelProps {
  /** Every article, used for the stats and the category histogram. */
  articles: Article[];
  /** The articles left after the search and category filters. */
  filteredArticles: Article[];
  category: string;
  onCategoryChange: (_category: string) => void;
  onOpen: (_article: Article) => void;
}

const CategoryHistogram = ({
  articles,
  category,
  onCategoryChange,
}: Pick<ArticlesPanelProps, 'articles' | 'category' | 'onCategoryChange'>) => {
  const counts = new Map<string, number>();
  for (const article of articles) {
    counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
  }
  const entries = [
    [ALL_ARTICLE_CATEGORIES, articles.length] as const,
    ...Array.from(counts.entries()).sort((a, b) => b[1] - a[1]),
  ];

  return (
    <div className="grid grid-cols-2 border-l border-t border-pcnGreen-200 sm:grid-cols-3 lg:grid-cols-5">
      {entries.map(([name, count]) => {
        const active = category === name;
        const { filled, empty } = bar(count, articles.length);
        return (
          <button
            key={name}
            type="button"
            aria-pressed={active}
            onClick={() => onCategoryChange(name)}
            className={cn(
              'group relative flex flex-col gap-0.5 border-b border-r border-pcnGreen-200 px-3 py-2 text-left font-mono transition-colors',
              active ? 'bg-pcnGreen/[0.08]' : 'hover:bg-pcnGreen/[0.04]',
            )}
          >
            {active && (
              <span className="absolute inset-x-0 top-0 h-px bg-pcnGreen shadow-[0_0_8px_rgba(4,244,190,0.9)]" />
            )}
            <span className="flex items-center justify-between gap-2 text-[11px]">
              <span
                className={cn(
                  'truncate lowercase',
                  active
                    ? 'text-glow text-pcnGreen'
                    : 'text-muted-foreground group-hover:text-pcnGreen',
                )}
              >
                #{name === ALL_ARTICLE_CATEGORIES ? 'todas' : name}
              </span>
              <span className="tabular-nums text-pcnGreen-600">{count}</span>
            </span>
            <span aria-hidden className="text-[9px] leading-none tracking-[-0.05em]">
              <span className={active ? 'text-pcnGreen' : 'text-pcnGreen-500'}>{filled}</span>
              <span className="text-pcnGreen-200">{empty}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

const ArticleRow = ({
  article,
  index,
  onOpen,
}: {
  article: Article;
  index: number;
  onOpen: () => void;
}) => {
  const isNew = Date.now() - new Date(article.date).getTime() < NEW_ARTICLE_MS;

  return (
    <article className={cn(ruledCellClassName, 'group relative flex gap-3 overflow-hidden p-3')}>
      {/* Hover: a lit edge on the left and a scan line sweeping down the row. */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-pcnGreen shadow-[0_0_10px_rgba(4,244,190,0.9)] transition-transform duration-300 group-hover:scale-y-100" />
      <span className="article-scan pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-pcnGreen/[0.08] to-transparent opacity-0 group-hover:opacity-100" />

      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <Avatar className="size-10 rounded-sm ring-1 ring-pcnGreen-200 transition-[filter,box-shadow] duration-300 [filter:grayscale(0.7)] group-hover:shadow-[0_0_14px_-2px_rgba(4,244,190,0.6)] group-hover:ring-pcnGreen-500 group-hover:[filter:none]">
          <AvatarImage src={article.avatar} alt={article.author} />
          <AvatarFallback className="rounded-sm font-mono text-xs">
            {initials(article.author)}
          </AvatarFallback>
        </Avatar>
        <span className="font-mono text-[10px] tabular-nums text-pcnGreen-500">
          {hexIndex(index)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
          <span className="border border-pcnGreen-300 px-1 text-pcnGreen-700">
            {article.category}
          </span>
          {isNew && (
            <span className="animate-pulse bg-pcnGreen px-1 font-semibold text-black shadow-[0_0_10px_rgba(4,244,190,0.7)]">
              new
            </span>
          )}
          <time dateTime={article.date} className="ml-auto tabular-nums text-muted-foreground">
            {formatDate(article.date)}
          </time>
        </div>

        {/* The title's button stretches over the whole row so any click opens the reader. */}
        <h2 className="font-mono text-sm font-semibold leading-snug">
          <button
            type="button"
            onClick={onOpen}
            className="group-hover:text-glow text-left transition-colors after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-1 focus-visible:after:ring-inset focus-visible:after:ring-pcnGreen group-hover:text-pcnGreen"
          >
            {article.title}
          </button>
        </h2>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {article.description}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-0.5 font-mono text-[11px] text-muted-foreground/70">
          <span className="min-w-0 truncate">
            <span className="text-pcnGreen-500">@ </span>
            {article.author}
            <span className="text-pcnGreen-500"> ~ </span>
            {article.source}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-0.5 text-pcnGreen-600 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
            leer
            <ChevronRight className="size-3" />
          </span>
        </div>
      </div>
    </article>
  );
};

/** The "artículos" tab of /lectura: a terminal-style index of recommended articles. */
export function ArticlesPanel({
  articles,
  filteredArticles,
  category,
  onCategoryChange,
  onOpen,
}: ArticlesPanelProps) {
  const sources = new Set(articles.map((article) => article.source)).size;
  const authors = new Set(articles.map((article) => article.author)).size;
  const years = articles.map((article) => Number(article.date.slice(0, 4)));

  return (
    <section className="flex flex-col gap-3">
      {/* Terminal window header with the collection's stats. */}
      <div className="relative overflow-hidden border border-pcnGreen-200 bg-black/60 font-mono">
        <div className="flex items-center gap-2 border-b border-pcnGreen-200 px-3 py-1.5 text-[11px]">
          <span className="flex gap-1" aria-hidden>
            <span className="size-2 bg-pcnGreen-300" />
            <span className="size-2 bg-pcnGreen-300" />
            <span className="size-2 bg-pcnGreen shadow-[0_0_6px_rgba(4,244,190,0.9)]" />
          </span>
          <span className="text-pcnGreen-600">~/lectura/articulos</span>
          <span className="ml-auto text-muted-foreground max-sm:hidden">
            {Math.min(...years)} → {Math.max(...years)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-3 py-2 text-xs">
          <span className="text-pcnGreen">
            $ <span className="text-foreground">ls ./articulos --sort=fecha</span>
          </span>
          <span className="flex gap-4 text-muted-foreground">
            <span>
              <span className="text-glow tabular-nums text-pcnGreen">
                {filteredArticles.length}
              </span>
              /{articles.length} artículos
            </span>
            <span>
              <span className="tabular-nums text-pcnGreen">{sources}</span> fuentes
            </span>
            <span>
              <span className="tabular-nums text-pcnGreen">{authors}</span> autores
            </span>
          </span>
        </div>
      </div>

      <CategoryHistogram
        articles={articles}
        category={category}
        onCategoryChange={onCategoryChange}
      />

      {filteredArticles.length > 0 ? (
        <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredArticles.map((article) => (
            <ArticleRow
              key={article.id}
              article={article}
              index={articles.indexOf(article)}
              onOpen={() => onOpen(article)}
            />
          ))}
        </RuledGrid>
      ) : (
        <p className="border border-dashed border-pcnGreen-200 py-8 text-center font-mono text-sm text-muted-foreground">
          <span className="text-pcnGreen">404</span> · no hay artículos con esos filtros
          <span className="ml-0.5 animate-blink text-pcnGreen">_</span>
        </p>
      )}
    </section>
  );
}
