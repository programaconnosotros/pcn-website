'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { MarkToggle } from '@/components/ui/mark-toggle';
import { useContentMarks } from '@/hooks/use-content-marks';
import { Bookmark, Check, CheckCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { articleAuthors, type Article } from './articles';
import { ArticleWriters, type Writer } from './article-writers';

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

const READ_STATUSES = [
  { value: 'todos', label: 'todos' },
  { value: 'pendientes', label: 'sin leer' },
  { value: 'leidos', label: 'leídos' },
  { value: 'para-leer', label: 'para leer' },
] as const;

export type ReadStatus = (typeof READ_STATUSES)[number]['value'];

export const isReadStatus = (value: string | null): value is ReadStatus =>
  READ_STATUSES.some((status) => status.value === value);

interface ArticlesPanelProps {
  /** Every article, used for the stats and the category histogram. */
  articles: Article[];
  /** The articles left after the search and category filters. */
  filteredArticles: Article[];
  category: string;
  onCategoryChange: (_category: string) => void;
  onOpen: (_article: Article) => void;
  status: ReadStatus;
  onStatusChange: (_status: ReadStatus) => void;
  /** Community members who wrote each article, by article id. */
  writers: Record<string, Writer[]>;
  isAdmin: boolean;
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

// The article's author names, each one linking to the member's profile when they're one of us.
const AuthorNames = ({ article, writers }: { article: Article; writers: Writer[] }) => {
  const names = articleAuthors(article);
  const parts = names.map((name) => ({
    name,
    writer: writers.find((writer) => writer.linkedAuthor === name || writer.name === name),
  }));
  const unmatched = writers.filter((writer) => !parts.some((part) => part.writer === writer));
  // A lone author tagged by hand under another spelling is still that same person.
  if (parts.length === 1 && !parts[0].writer && unmatched.length === 1) {
    parts[0].writer = unmatched.pop();
  }
  const people = [...parts, ...unmatched.map((writer) => ({ name: writer.name, writer }))];

  return people.map(({ name, writer }, i) => (
    <Fragment key={writer?.id ?? name}>
      {i > 0 && ', '}
      {writer ? (
        <Link
          href={`/perfil/${writer.id}`}
          className="relative z-10 text-pcnGreen-600 hover:text-pcnGreen hover:underline"
        >
          {name}
        </Link>
      ) : (
        name
      )}
    </Fragment>
  ));
};

export const ArticleRow = ({
  article,
  index,
  onOpen,
  read,
  onToggleRead,
  saved,
  onToggleSaved,
  writers,
  isAdmin,
}: {
  article: Article;
  index: number;
  onOpen: () => void;
  read: boolean;
  onToggleRead: () => void;
  saved: boolean;
  onToggleSaved: () => void;
  writers: Writer[];
  isAdmin: boolean;
}) => {
  const isNew = Date.now() - new Date(article.date).getTime() < NEW_ARTICLE_MS;
  // The writer search drops down past the card, so it can't clip while it's open.
  const [isEditingWriters, setIsEditingWriters] = useState(false);

  return (
    <article
      className={cn(
        ruledCellClassName,
        'group relative flex gap-3 p-3',
        !isEditingWriters && 'overflow-hidden',
      )}
    >
      {/* Hover: a lit edge on the left and a scan line sweeping down the row. */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-pcnGreen shadow-[0_0_10px_rgba(4,244,190,0.9)] transition-transform duration-300 group-hover:scale-y-100" />
      <span className="article-scan pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-pcnGreen/[0.08] to-transparent opacity-0 group-hover:opacity-100" />

      <div className="relative flex shrink-0 flex-col items-center gap-1.5">
        {read && (
          <span className="absolute -right-1 -top-1 z-10 flex size-4 items-center justify-center bg-pcnGreen text-black shadow-[0_0_8px_rgba(4,244,190,0.8)]">
            <Check className="size-3" strokeWidth={3} />
          </span>
        )}
        <Avatar className="size-10 rounded-sm ring-1 ring-pcnGreen-200 transition-[filter,box-shadow] duration-300 [filter:grayscale(0.7)] group-hover:shadow-[0_0_14px_-2px_rgba(4,244,190,0.6)] group-hover:ring-pcnGreen-500 group-hover:[filter:none]">
          {/* A writer who's a member shows their profile photo instead of the article's. */}
          <AvatarImage
            src={writers.find((writer) => writer.image)?.image ?? article.avatar}
            alt={writers[0]?.name ?? article.author}
          />
          <AvatarFallback className="rounded-sm font-mono text-xs">
            {initials(article.author)}
          </AvatarFallback>
        </Avatar>
        <span className="font-mono text-[10px] tabular-nums text-pcnGreen-500">
          {hexIndex(index)}
        </span>
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-1 transition-opacity',
          read && 'opacity-60 group-hover:opacity-100',
        )}
      >
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

        <ArticleWriters
          articleId={article.id}
          writers={writers}
          isAdmin={isAdmin}
          isEditing={isEditingWriters}
          onEditingChange={setIsEditingWriters}
        />

        <div className="mt-auto flex items-center gap-2 pt-0.5 font-mono text-[11px] text-muted-foreground/70">
          <span className="min-w-0 truncate">
            <span className="text-pcnGreen-500">@ </span>
            <AuthorNames article={article} writers={writers} />
            <span className="text-pcnGreen-500"> ~ </span>
            {article.source}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-0.5 text-pcnGreen-600 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 max-sm:hidden">
            leer
            <ChevronRight className="size-3" />
          </span>
          {!read && (
            <MarkToggle
              active={saved}
              onToggle={onToggleSaved}
              icon={Bookmark}
              label="para leer"
              title={saved ? 'Quitar de mi lista para leer' : 'Guardar en mi lista para leer'}
            />
          )}
          <MarkToggle
            active={read}
            onToggle={onToggleRead}
            icon={CheckCheck}
            label="leído"
            title={read ? 'Desmarcar como leído' : 'Marcar como leído'}
          />
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
  status,
  onStatusChange,
  writers,
  isAdmin,
}: ArticlesPanelProps) {
  const marks = useContentMarks('article');
  const readIds = marks.ids('read');
  const savedIds = marks.ids('saved');
  const readCount = articles.filter((article) => readIds.has(article.id)).length;
  const progress = bar(readCount, articles.length, 16);
  const visibleArticles = filteredArticles.filter((article) =>
    status === 'todos'
      ? true
      : status === 'leidos'
        ? readIds.has(article.id)
        : status === 'para-leer'
          ? savedIds.has(article.id)
          : !readIds.has(article.id),
  );

  // Reading an article takes it off the "to read" list.
  const toggleRead = (id: string) =>
    marks.set(
      readIds.has(id)
        ? [{ contentId: id, mark: 'read', value: false }]
        : [
            { contentId: id, mark: 'read', value: true },
            ...(savedIds.has(id) ? [{ contentId: id, mark: 'saved' as const, value: false }] : []),
          ],
    );

  const sources = new Set(articles.map((article) => article.source)).size;
  const authors = new Set(articles.flatMap(articleAuthors)).size;
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
              <span className="text-glow tabular-nums text-pcnGreen">{visibleArticles.length}</span>
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
        {/* Reading progress and the read/unread filter. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-pcnGreen-200 px-3 py-2 text-[11px]">
          <span className="flex items-center gap-2 text-muted-foreground">
            progreso
            <span aria-hidden className="tracking-[-0.05em]">
              <span className="text-glow text-pcnGreen">
                {readCount > 0 ? progress.filled : ''}
              </span>
              <span className="text-pcnGreen-200">
                {readCount > 0 ? progress.empty : '░'.repeat(16)}
              </span>
            </span>
            <span className="tabular-nums text-pcnGreen">
              {readCount}/{articles.length}
            </span>
            {!marks.isAuthenticated && !marks.isLoading && (
              <span className="text-muted-foreground/70 max-sm:hidden">
                · iniciá sesión para guardar lo que leés
              </span>
            )}
          </span>
          <span
            className="ml-auto flex h-8 border border-pcnGreen-200"
            role="group"
            aria-label="Filtrar por estado"
          >
            {READ_STATUSES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={status === value}
                onClick={() => onStatusChange(value)}
                className={cn(
                  'border-r border-pcnGreen-200 px-2 transition-colors last:border-r-0',
                  status === value
                    ? 'bg-pcnGreen text-black'
                    : 'text-muted-foreground hover:bg-pcnGreen/[0.06] hover:text-pcnGreen',
                )}
              >
                {label}
                {value === 'para-leer' && savedIds.size > 0 && (
                  <span className="ml-1 tabular-nums">[{savedIds.size}]</span>
                )}
              </button>
            ))}
          </span>
        </div>
      </div>

      <CategoryHistogram
        articles={articles}
        category={category}
        onCategoryChange={onCategoryChange}
      />

      {visibleArticles.length > 0 ? (
        // As many ~22rem columns as fit the panel: one on phones, three on wide windows.
        <RuledGrid className="grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))]">
          {visibleArticles.map((article) => (
            <ArticleRow
              key={article.id}
              article={article}
              index={articles.indexOf(article)}
              onOpen={() => onOpen(article)}
              read={readIds.has(article.id)}
              onToggleRead={() => toggleRead(article.id)}
              saved={savedIds.has(article.id)}
              onToggleSaved={() => marks.toggle(article.id, 'saved')}
              writers={writers[article.id] ?? []}
              isAdmin={isAdmin}
            />
          ))}
        </RuledGrid>
      ) : (
        <p className="border border-dashed border-pcnGreen-200 py-8 text-center font-mono text-sm text-muted-foreground">
          <span className="text-pcnGreen">404</span> ·{' '}
          {status === 'para-leer'
            ? 'tu lista está vacía: guardá artículos con “para leer”'
            : 'no hay artículos con esos filtros'}
          <span className="ml-0.5 animate-blink text-pcnGreen">_</span>
        </p>
      )}
    </section>
  );
}
