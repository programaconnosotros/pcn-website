'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowUpRight, CornerDownLeft, Loader2, RotateCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { dialogContentClassName } from '@/components/ui/dialog-surface';
import { useRestoreFocus } from '@/components/ui/restore-focus';
import { isEmbedded, postToOsHost } from '@/components/os/os-env';
import { visiblePrograms } from '@/components/os/programs';
import {
  SEARCH_GROUPS,
  SEARCH_SCOPES,
  type SearchResponse,
  type SearchResult,
} from '@/lib/search/types';
import { cn } from '@/lib/utils';

const OPEN_SEARCH_EVENT = 'pcn:open-search';
const DEBOUNCE_MS = 150;

/**
 * Opens the global search from anywhere. Inside a PCN OS window the search belongs to the
 * desktop, so the request is handed to it instead.
 */
export const openGlobalSearch = (query = '') => {
  if (isEmbedded()) postToOsHost({ type: 'search', query });
  else window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT, { detail: { query } }));
};

/** ⌘K on macOS, Ctrl+K elsewhere. */
export const isSearchShortcut = (event: KeyboardEvent) =>
  (event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k';

const noopSubscribe = () => () => {};

/** `⌘K` on Apple devices, `Ctrl K` elsewhere; `Ctrl K` while server rendering and hydrating. */
export const useSearchShortcutLabel = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'),
    () => 'Ctrl K',
  );

const isExternal = (href: string) => /^https?:\/\//.test(href);

// With an empty prompt the dialog lists the sections, so it doubles as a quick switcher.
const SECTION_RESULTS: SearchResult[] = visiblePrograms(false).map((program) => ({
  type: 'seccion',
  title: program.name,
  href: program.url,
}));

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-sm border border-pcnGreen-200 px-1 text-pcnGreen-600">{children}</kbd>
);

/** After this long, the search says it's taking longer than usual. */
const SLOW_MS = 1500;

const useSearchResults = (query: string) => {
  const [state, setState] = useState<{ query: string; results: SearchResult[]; failed: boolean }>({
    query: '',
    results: [],
    failed: false,
  });
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  /** Bumped to run the same query again after a failure. */
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setLoading(false);
      setSlow(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setSlow(false);
    const slowTimeout = window.setTimeout(() => setSlow(true), SLOW_MS);
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`search: ${response.status}`);
        const data: SearchResponse = await response.json();
        setState({ query: trimmed, results: data.results, failed: false });
      } catch (error) {
        if ((error as Error).name !== 'AbortError')
          setState({ query: trimmed, results: [], failed: true });
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setSlow(false);
          window.clearTimeout(slowTimeout);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
      window.clearTimeout(slowTimeout);
    };
  }, [query, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const trimmed = query.trim();
  if (!trimmed)
    return { loading: false, slow: false, failed: false, results: SECTION_RESULTS, retry };
  const settled = state.query === trimmed && !loading;
  // Keep showing the previous results while the next ones load, so the list doesn't flash.
  return {
    loading,
    slow,
    failed: settled && state.failed,
    results: state.results,
    /** Results shown belong to an older query (or none yet): dim them, or show the scanner. */
    stale: state.query !== trimmed,
    settled,
    retry,
  };
};

/** Cycles through the places being searched, like a scanner walking the filesystem. */
const ScanningScopes = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setIndex((i) => (i + 1) % SEARCH_SCOPES.length), 140);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <span className="text-pcnGreen">
      ~/{SEARCH_SCOPES[index].replace(/\s+/g, '-')}
      <span className="cursor-blink" />
    </span>
  );
};

/** What the list shows while the first results for a query are on their way. */
const SearchSkeleton = ({ slow }: { slow: boolean }) => (
  <div role="status" aria-live="polite" className="px-4 py-2 text-xs">
    <p className="text-muted-foreground">
      <span className="text-pcnGreen-600">&gt; </span>
      buscando en <ScanningScopes />
    </p>
    {slow && (
      <p className="mt-1 text-[11px] text-amber-300/80">
        # está tardando más de lo normal, ya casi…
      </p>
    )}
    <div aria-hidden className="mt-3 flex flex-col gap-3">
      {[72, 54, 64, 40].map((width, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-pcnGreen-300">&gt;</span>
          <span className="flex flex-1 flex-col gap-1.5">
            <span
              className="h-3 animate-pulse rounded-sm bg-pcnGreen-200"
              style={{ width: `${width}%`, animationDelay: `${i * 120}ms` }}
            />
            <span
              className="h-2.5 w-1/4 animate-pulse rounded-sm bg-pcnGreen-100"
              style={{ animationDelay: `${i * 120 + 60}ms` }}
            />
          </span>
        </div>
      ))}
    </div>
  </div>
);

interface GlobalSearchDialogProps {
  open: boolean;
  initialQuery: string;
  onClose: () => void;
  onNavigate: (_href: string) => void;
  /** Stacking for hosts with their own layers, e.g. above PCN OS windows. */
  layerClassName?: string;
}

function GlobalSearchDialog({
  open,
  initialQuery,
  onClose,
  onNavigate,
  layerClassName,
}: GlobalSearchDialogProps) {
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const search = useSearchResults(query);
  const { results } = search;
  const restoreFocus = useRestoreFocus();

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  useEffect(() => setActive(0), [results]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const groups = useMemo(
    () =>
      SEARCH_GROUPS.map((group) => ({
        ...group,
        items: results
          .map((result, index) => ({ result, index }))
          .filter(({ result }) => result.type === group.type),
      })).filter((group) => group.items.length > 0),
    [results],
  );

  const select = (result: SearchResult | undefined) => {
    if (!result) return;
    onClose();
    onNavigate(result.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') setActive((i) => Math.min(i + 1, results.length - 1));
    else if (event.key === 'ArrowUp') setActive((i) => Math.max(i - 1, 0));
    else if (event.key === 'Enter') select(results[active]);
    else return;
    event.preventDefault();
  };

  const searching = query.trim() !== '';
  const showEmpty =
    searching && 'settled' in search && search.settled && !search.failed && !results.length;
  // First results for this query still on their way: show the scanner instead of the old list.
  const showSkeleton =
    searching && search.loading && 'stale' in search && (search.stale || !results.length);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPortal>
        <DialogOverlay className={layerClassName} />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={handleKeyDown}
          {...restoreFocus}
          className={cn(
            dialogContentClassName,
            'flex max-w-2xl flex-col gap-0 p-0',
            // Spotlight-style: pinned near the top so the list grows downwards as results
            // arrive. On phones, keep clear of the status bar and the tab bar (h-16 + safe area).
            'top-[12vh] max-h-[76vh] translate-y-0',
            'max-md:top-[calc(env(safe-area-inset-top)+0.75rem)] max-md:max-h-[calc(100dvh-env(safe-area-inset-top)-4rem-env(safe-area-inset-bottom)-1.5rem)]',
            'embedded:max-md:max-h-[calc(100dvh-1.5rem)]',
            layerClassName,
          )}
        >
          <DialogPrimitive.Title className="sr-only">Buscar en todo el sitio</DialogPrimitive.Title>

          <label className="relative flex items-center gap-2 border-b border-dashed border-pcnGreen-200 px-3 py-3 text-sm">
            {search.loading && (
              <span
                aria-hidden
                className="pointer-events-none search-scan absolute inset-x-0 -bottom-px h-px overflow-hidden"
              />
            )}
            <span aria-hidden className="shrink-0 text-pcnGreen-600 select-none">
              $ find ~ -iname
            </span>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="perfiles, eventos, conversaciones, consejos, historia…"
              aria-label="Buscar en todo el sitio"
              role="combobox"
              aria-expanded
              aria-controls="global-search-results"
              aria-activedescendant={results.length ? `global-search-${active}` : undefined}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              className="min-w-0 flex-1 bg-transparent text-foreground caret-pcnGreen outline-hidden placeholder:text-foreground/25"
            />
            {search.loading && (
              <Loader2 aria-hidden className="size-4 shrink-0 animate-spin text-pcnGreen-600" />
            )}
            <DialogPrimitive.Close className="shrink-0 rounded-sm border border-pcnGreen-200 px-1.5 text-[10px] text-pcnGreen-600 transition-colors hover:border-pcnGreen hover:text-pcnGreen">
              esc
            </DialogPrimitive.Close>
          </label>

          <div
            ref={listRef}
            id="global-search-results"
            role="listbox"
            aria-label="Resultados"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2"
          >
            {showSkeleton && <SearchSkeleton slow={search.slow} />}

            {search.failed && (
              <div role="alert" className="px-4 py-6 text-xs">
                <span className="text-red-400/90">find: no se pudo buscar (¿sin conexión?)</span>
                <button
                  type="button"
                  onClick={search.retry}
                  className="mt-2 flex items-center gap-1.5 text-pcnGreen hover:underline"
                >
                  <RotateCw className="size-3" /> reintentar
                </button>
              </div>
            )}

            {showEmpty && (
              <p className="px-4 py-6 text-xs">
                <span className="text-red-400/90">find: ‘{query.trim()}’: sin resultados</span>
                <span className="mt-1 block text-muted-foreground">
                  # probá con menos palabras o con otro término
                </span>
              </p>
            )}

            {!showSkeleton &&
              groups.map((group) => (
                <section
                  key={group.type}
                  className={cn(
                    'pb-1 transition-opacity duration-200',
                    // Results of the previous query, while the new ones load.
                    search.loading && 'opacity-60',
                  )}
                >
                  <h3 className="px-4 pt-2 pb-1 text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    <span className="text-pcnGreen-500">{'// '}</span>
                    {query.trim() ? group.label : 'ir a'}
                  </h3>
                  <ul>
                    {group.items.map(({ result, index }) => {
                      const selected = index === active;
                      return (
                        <li
                          key={`${result.type}:${result.href}:${index}`}
                          id={`global-search-${index}`}
                          data-index={index}
                          role="option"
                          aria-selected={selected}
                          onMouseMove={() => active !== index && setActive(index)}
                          onClick={() => select(result)}
                          className={cn(
                            'relative flex cursor-pointer items-center gap-3 px-4 py-1.5 text-sm',
                            selected && 'bg-pcnGreen/[0.08]',
                          )}
                        >
                          {selected && (
                            <span
                              aria-hidden
                              className="absolute inset-y-0 left-0 w-0.5 bg-pcnGreen shadow-[0_0_10px_rgba(4,244,190,0.8)]"
                            />
                          )}
                          <span
                            aria-hidden
                            className={cn(
                              'shrink-0 text-pcnGreen-500',
                              selected && 'text-pcnGreen text-glow',
                            )}
                          >
                            {'>'}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                'block truncate',
                                selected ? 'text-pcnGreen' : 'text-foreground/90',
                              )}
                            >
                              {result.title}
                            </span>
                            {result.subtitle && (
                              <span className="block truncate text-[11px] text-muted-foreground">
                                {result.subtitle}
                              </span>
                            )}
                          </span>
                          {isExternal(result.href) ? (
                            <ArrowUpRight
                              aria-label="se abre en otra pestaña"
                              className="size-3.5 shrink-0 text-pcnGreen-600"
                            />
                          ) : (
                            selected && (
                              <CornerDownLeft
                                aria-hidden
                                className="size-3.5 shrink-0 text-pcnGreen-600"
                              />
                            )
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
          </div>

          <p className="flex items-center gap-4 border-t border-dashed border-pcnGreen-200 px-3 py-1.5 text-[10px] text-muted-foreground max-sm:hidden">
            <span>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> navegar
            </span>
            <span>
              <Kbd>↵</Kbd> abrir
            </span>
            <span>
              <Kbd>esc</Kbd> cerrar
            </span>
            <span className="ml-auto tabular-nums">
              {!query.trim()
                ? `${results.length} secciones`
                : search.loading
                  ? 'buscando…'
                  : `${results.length} resultados`}
            </span>
          </p>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}

interface GlobalSearchProps {
  /** Opens a site path (external URLs are opened in a new tab before this is called). */
  onNavigate: (_path: string) => void;
  layerClassName?: string;
}

/**
 * The site-wide search dialog. Opens with ⌘K / Ctrl+K or `openGlobalSearch()`. Inside a PCN OS
 * window it only forwards the shortcut to the desktop, which owns the search there.
 */
export function GlobalSearch({ onNavigate, layerClassName }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSearchShortcut(event)) return;
      event.preventDefault();
      if (isEmbedded()) {
        postToOsHost({ type: 'search', query: '' });
        return;
      }
      setInitialQuery('');
      setOpen((current) => !current);
    };
    const onOpenEvent = (event: Event) => {
      if (isEmbedded()) return;
      setInitialQuery((event as CustomEvent<{ query: string }>).detail?.query ?? '');
      setOpen(true);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpenEvent);
    };
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (isExternal(href)) window.open(href, '_blank', 'noopener,noreferrer');
      else onNavigate(href);
    },
    [onNavigate],
  );

  return (
    <GlobalSearchDialog
      open={open}
      initialQuery={initialQuery}
      onClose={() => setOpen(false)}
      onNavigate={navigate}
      layerClassName={layerClassName}
    />
  );
}
