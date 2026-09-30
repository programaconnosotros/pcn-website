'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowUpRight, CornerDownLeft, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { dialogContentClassName } from '@/components/ui/dialog-surface';
import { isEmbedded, postToOsHost } from '@/components/os/os-env';
import { visiblePrograms } from '@/components/os/programs';
import { SEARCH_GROUPS, type SearchResponse, type SearchResult } from '@/lib/search/types';
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

const useSearchResults = (query: string) => {
  const [state, setState] = useState<{ query: string; results: SearchResult[] }>({
    query: '',
    results: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data: SearchResponse = await response.json();
        setState({ query: trimmed, results: data.results });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setState({ query: trimmed, results: [] });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const trimmed = query.trim();
  if (!trimmed) return { loading: false, results: SECTION_RESULTS };
  // Keep showing the previous results while the next ones load, so the list doesn't flash.
  return { loading, results: state.results, settled: state.query === trimmed && !loading };
};

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

  const showEmpty = query.trim() !== '' && 'settled' in search && search.settled && !results.length;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPortal>
        <DialogOverlay className={layerClassName} />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={handleKeyDown}
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

          <label className="flex items-center gap-2 border-b border-dashed border-pcnGreen-200 px-3 py-3 text-sm">
            <span aria-hidden className="shrink-0 select-none text-pcnGreen-600">
              $ find ~ -iname
            </span>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="eventos, cursos, charlas, conversaciones…"
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
              className="min-w-0 flex-1 bg-transparent text-foreground caret-pcnGreen outline-none placeholder:text-foreground/25"
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
            {showEmpty && (
              <p className="px-4 py-6 text-xs">
                <span className="text-red-400/90">find: ‘{query.trim()}’: sin resultados</span>
                <span className="mt-1 block text-muted-foreground">
                  # probá con menos palabras o con otro término
                </span>
              </p>
            )}

            {groups.map((group) => (
              <section key={group.type} className="pb-1">
                <h3 className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
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
                            selected && 'text-glow text-pcnGreen',
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
              {query.trim() ? `${results.length} resultados` : `${results.length} secciones`}
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
