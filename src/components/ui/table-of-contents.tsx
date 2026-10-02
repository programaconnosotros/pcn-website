'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface TocSection {
  id: string;
  title: string;
  icon?: LucideIcon;
  /** Optional group heading rendered above the first section of the group. */
  group?: string;
  /** Optional short label rendered at the end of the row (e.g. a year). */
  meta?: string;
}

interface TableOfContentsProps {
  sections: TocSection[];
  /** Route of the page (e.g. `historia`), shown as the `$ tree ~/<path>` prompt. */
  path?: string;
  label?: string;
}

/**
 * Distance from the top of the viewport at which a section is considered "current".
 * Matches the sticky mobile bar plus the scroll margin used by the sections.
 */
const REFERENCE_POINT = 140;

/** How long a jump (click or `]`/`[`) owns the active section while the smooth scroll runs. */
const JUMP_LOCK_MS = 900;

/** Vertical offset (px) of the tree branch: the middle of a row's first line. */
const BRANCH_Y = 'top-[14px]';

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
};

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const pad = (value: number, length: number) => String(value).padStart(length, '0');

type IndexedSection = TocSection & { index: number };

/**
 * Sticky table of contents shared by long-form pages, drawn as a `tree` listing.
 *
 * The tree's branches light up as you read, a segmented bar maps every section (click one to
 * jump) and a vim-like status line shows the reading position; `]`/`[` move between sections
 * (`j`/`k` scroll, see VimNavigation).
 * Small screens get a sticky prompt bar with prev/next buttons and a dropdown instead.
 * Meant to be placed as the first child of a `flex flex-col lg:flex-row` container.
 */
export function TableOfContents({ sections, path, label = 'Contenido' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const [scrollPercent, setScrollPercent] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const jumpLockUntil = useRef(0);
  const sectionsKey = sections.map((section) => section.id).join('|');

  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeId),
  );
  const activeSection = sections[activeIndex];
  const digits = String(sections.length).length;
  const counter = `${pad(activeIndex + 1, digits)}/${pad(sections.length, digits)}`;

  const groupedSections = useMemo(() => {
    const groups: { group?: string; sections: IndexedSection[] }[] = [];
    sections.forEach((section, index) => {
      const last = groups[groups.length - 1];
      if (last && last.group === section.group) {
        last.sections.push({ ...section, index });
      } else {
        groups.push({ group: section.group, sections: [{ ...section, index }] });
      }
    });
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsKey]);

  const handleSelect = useCallback((id: string) => {
    // Without the lock, sections passed mid-scroll would steal the highlight and make
    // repeated `]` presses land on the same target.
    jumpLockUntil.current = Date.now() + JUMP_LOCK_MS;
    setActiveId(id);
    scrollToSection(id);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const target = sections[Math.min(sections.length - 1, Math.max(0, index))];
      if (target) handleSelect(target.id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sectionsKey, handleSelect],
  );

  // Scroll to the section referenced by the URL hash once the DOM is ready.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash || !sections.some((section) => section.id === hash)) return;
    setActiveId(hash);
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsKey]);

  // Track the section currently under the reference point and how far the page is read.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPercent(
        scrollable > 0 ? Math.min(100, Math.round((window.scrollY / scrollable) * 100)) : 100,
      );

      if (Date.now() < jumpLockUntil.current) return;

      if (window.scrollY >= scrollable - 2) {
        setActiveId(sections[sections.length - 1]?.id ?? '');
        return;
      }

      let current = sections[0]?.id ?? '';
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= REFERENCE_POINT) {
          current = section.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsKey]);

  // Vim-style section motions: `]` next section, `[` previous section.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
      if (event.key === ']') goTo(activeIndex + 1);
      else if (event.key === '[') goTo(activeIndex - 1);
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, goTo]);

  // Keep the active item visible inside the sidebar without scrolling the page.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !activeId) return;
    const item = nav.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(activeId)}"]`);
    if (!item) return;

    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const margin = 48;
    if (itemRect.top < navRect.top + margin || itemRect.bottom > navRect.bottom - margin) {
      // Position relative to the nav's scroll box (offsetTop would be relative to the `li`).
      const itemTopInNav = itemRect.top - navRect.top + nav.scrollTop;
      nav.scrollTo({
        top: itemTopInNav - nav.clientHeight / 2 + itemRect.height / 2,
        behavior: 'smooth',
      });
    }
  }, [activeId]);

  const segments = (interactive: boolean) => (
    <div className={cn('flex gap-[2px]', interactive ? 'h-2' : 'h-1')}>
      {sections.map((section, index) => {
        const className = cn(
          'flex-1 transition-colors',
          index < activeIndex && 'bg-pcnGreen-600',
          index === activeIndex && 'bg-pcnGreen shadow-[0_0_6px_rgba(4,244,190,0.8)]',
          index > activeIndex && 'bg-pcnGreen-200',
        );
        return interactive ? (
          <button
            key={section.id}
            type="button"
            title={section.title}
            aria-label={`Ir a ${section.title}`}
            onClick={() => handleSelect(section.id)}
            className={cn(className, 'hover:bg-pcnGreen-400')}
          />
        ) : (
          <span key={section.id} className={className} />
        );
      })}
    </div>
  );

  const stepButtonClassName =
    'flex h-8 w-8 shrink-0 items-center justify-center border border-pcnGreen-200 text-pcnGreen transition-colors hover:bg-pcnGreen/10 disabled:pointer-events-none disabled:opacity-30';

  return (
    <>
      {/* Mobile: sticky prompt bar with prev/next and a dropdown listing every section. It drops
          below the page's StickyHeader while that one is shown. */}
      <div className="sticky top-[var(--sticky-header-offset,0px)] z-30 -mx-4 border-b border-pcnGreen-200 bg-background/95 px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] font-mono backdrop-blur transition-[top] duration-200 ease-out lg:hidden">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Sección anterior"
            disabled={activeIndex === 0}
            onClick={() => goTo(activeIndex - 1)}
            className={stepButtonClassName}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-8 min-w-0 flex-1 items-center gap-2 border border-pcnGreen-200 px-2.5 text-left text-xs transition-colors hover:bg-pcnGreen/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen"
              >
                <span className="shrink-0 tabular-nums text-muted-foreground">[{counter}]</span>
                <span className="shrink-0 text-pcnGreen">▸</span>
                <span className="min-w-0 flex-1 truncate">{activeSection?.title}</span>
                {activeSection?.meta && (
                  <span className="shrink-0 tabular-nums text-pcnGreen-600">
                    {activeSection.meta}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-[60vh] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
            >
              {groupedSections.map((group, groupIndex) => (
                <div key={group.group ?? groupIndex}>
                  {groupIndex > 0 && <DropdownMenuSeparator />}
                  {group.group && (
                    <DropdownMenuLabel className="text-[11px] font-semibold text-pcnGreen-600">
                      {group.group}/
                    </DropdownMenuLabel>
                  )}
                  {group.sections.map((section) => (
                    <DropdownMenuItem
                      key={section.id}
                      onSelect={() => handleSelect(section.id)}
                      className={cn(
                        'gap-2 text-xs',
                        section.index < activeIndex && 'text-muted-foreground',
                        section.index === activeIndex && 'text-pcnGreen',
                      )}
                    >
                      <span className="w-5 shrink-0 tabular-nums text-muted-foreground/60">
                        {pad(section.index + 1, digits)}
                      </span>
                      <span className="flex-1">{section.title}</span>
                      {section.meta && (
                        <span className="tabular-nums text-muted-foreground">{section.meta}</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            aria-label="Sección siguiente"
            disabled={activeIndex === sections.length - 1}
            onClick={() => goTo(activeIndex + 1)}
            className={stepButtonClassName}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2">{segments(false)}</div>
      </div>

      {/* Desktop: sticky `tree` pane whose branches light up as you read. It stays below a page
          header pinned to the top (`--sticky-header-offset`). */}
      <aside className="sticky top-[var(--toc-top)] hidden h-[calc(100vh-var(--toc-top)-1rem)] w-72 shrink-0 flex-col border border-pcnGreen-200 font-mono [--toc-top:max(6rem,calc(var(--sticky-header-offset,0px)+1rem))] lg:flex">
        <div className="flex items-center justify-between gap-2 border-b border-pcnGreen-200 px-3 py-2 text-xs">
          <p className="min-w-0 truncate">
            <span className="text-pcnGreen-500">$ </span>
            tree {path ? `~/${path}` : label.toLowerCase()}
          </p>
          <span className="shrink-0 tabular-nums text-muted-foreground">{counter}</span>
        </div>
        <div className="border-b border-pcnGreen-200 px-3 py-2">{segments(true)}</div>

        <nav
          ref={navRef}
          aria-label={label}
          className="relative min-h-0 flex-1 overflow-y-auto px-2 py-3 [scrollbar-width:thin]"
        >
          <ol className="space-y-2">
            {groupedSections.map((group, groupIndex) => {
              const groupStarted = group.sections[0].index <= activeIndex;
              return (
                <li key={group.group ?? groupIndex}>
                  {group.group && (
                    <p
                      className={cn(
                        'flex items-center gap-1.5 px-1 py-0.5 text-xs font-semibold',
                        groupStarted ? 'text-pcnGreen' : 'text-muted-foreground',
                      )}
                    >
                      <span aria-hidden>{groupStarted ? '▾' : '▸'}</span>
                      <span className="min-w-0 flex-1 truncate">{group.group}/</span>
                      <span className="shrink-0 font-normal tabular-nums text-muted-foreground/60">
                        {group.sections.length}
                      </span>
                    </p>
                  )}
                  <ol>
                    {group.sections.map((section, position) => {
                      const isActive = section.index === activeIndex;
                      const isRead = section.index < activeIndex;
                      const isLast = position === group.sections.length - 1;
                      const reached = section.index <= activeIndex;
                      return (
                        <li key={section.id} className="relative pl-6">
                          {/* Tree branch: rail above the branch, rail below it and the branch. */}
                          <span
                            aria-hidden
                            className={cn(
                              'absolute left-2.5 top-0 h-[14px] w-px',
                              reached ? 'bg-pcnGreen' : 'bg-pcnGreen-300',
                            )}
                          />
                          {!isLast && (
                            <span
                              aria-hidden
                              className={cn(
                                'absolute bottom-0 left-2.5 top-[14px] w-px',
                                isRead ? 'bg-pcnGreen' : 'bg-pcnGreen-300',
                              )}
                            />
                          )}
                          <span
                            aria-hidden
                            className={cn(
                              'absolute left-2.5 h-px w-3',
                              BRANCH_Y,
                              reached ? 'bg-pcnGreen' : 'bg-pcnGreen-300',
                              isActive && 'shadow-[0_0_6px_rgba(4,244,190,0.9)]',
                            )}
                          />
                          <a
                            href={`#${section.id}`}
                            data-toc-id={section.id}
                            aria-current={isActive ? 'location' : undefined}
                            title={section.title}
                            onClick={(event) => {
                              event.preventDefault();
                              handleSelect(section.id);
                            }}
                            className={cn(
                              'group relative flex items-start gap-2 py-1 pl-1.5 pr-2 text-xs leading-5 transition-colors',
                              isActive && 'text-pcnGreen',
                              isRead && 'text-muted-foreground/60 hover:text-foreground',
                              !isActive && !isRead && 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="toc-active-row"
                                aria-hidden
                                className="absolute inset-0 border-l-2 border-pcnGreen bg-gradient-to-r from-pcnGreen/15 via-pcnGreen/[0.05] to-transparent"
                                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                              />
                            )}
                            <span className="relative shrink-0 text-[10px] tabular-nums leading-5 text-muted-foreground/50">
                              {pad(section.index + 1, digits)}
                            </span>
                            <span className="relative min-w-0 flex-1">
                              {section.title}
                              {isActive && (
                                <span
                                  aria-hidden
                                  className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-pcnGreen"
                                />
                              )}
                            </span>
                            {section.meta && (
                              <span
                                className={cn(
                                  'relative shrink-0 text-[10px] tabular-nums leading-5',
                                  isActive ? 'text-pcnGreen' : 'text-muted-foreground/60',
                                )}
                              >
                                {section.meta}
                              </span>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Vim-like status line. */}
        <div className="flex items-center gap-2 border-t border-pcnGreen-200 text-[11px]">
          <span className="bg-pcnGreen px-2 py-1 font-semibold text-background">LEYENDO</span>
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            {activeSection?.meta ?? label.toLowerCase()}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Sección anterior ([)"
              disabled={activeIndex === 0}
              onClick={() => goTo(activeIndex - 1)}
              className="border border-pcnGreen-200 px-1 leading-4 text-muted-foreground transition-colors hover:border-pcnGreen hover:text-pcnGreen disabled:opacity-30"
            >
              [
            </button>
            <button
              type="button"
              aria-label="Sección siguiente (])"
              disabled={activeIndex === sections.length - 1}
              onClick={() => goTo(activeIndex + 1)}
              className="border border-pcnGreen-200 px-1 leading-4 text-muted-foreground transition-colors hover:border-pcnGreen hover:text-pcnGreen disabled:opacity-30"
            >
              ]
            </button>
          </span>
          <span className="w-10 shrink-0 pr-2 text-right tabular-nums text-pcnGreen">
            {scrollPercent}%
          </span>
        </div>
      </aside>
    </>
  );
}
