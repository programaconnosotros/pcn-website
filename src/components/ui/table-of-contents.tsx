'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, List, type LucideIcon } from 'lucide-react';
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
  label?: string;
}

/**
 * Distance from the top of the viewport at which a section is considered "current".
 * Matches the sticky mobile bar plus the scroll margin used by the sections.
 */
const REFERENCE_POINT = 140;

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
};

/**
 * Sticky table of contents shared by long-form pages.
 *
 * Renders a compact dropdown bar on small screens and a sidebar with a sliding
 * indicator and reading progress on large screens. Meant to be placed as the
 * first child of a `flex flex-col lg:flex-row` container next to the content.
 */
export function TableOfContents({ sections, label = 'Contenido' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const navRef = useRef<HTMLElement>(null);
  const sectionsKey = sections.map((section) => section.id).join('|');

  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeId),
  );
  const activeSection = sections[activeIndex];
  const progress = sections.length > 1 ? (activeIndex / (sections.length - 1)) * 100 : 100;

  const groupedSections = useMemo(() => {
    const groups: { group?: string; sections: TocSection[] }[] = [];
    for (const section of sections) {
      const last = groups[groups.length - 1];
      if (last && last.group === section.group) {
        last.sections.push(section);
      } else {
        groups.push({ group: section.group, sections: [section] });
      }
    }
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsKey]);

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

  // Track the section currently under the reference point.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
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

  const handleSelect = (id: string) => {
    setActiveId(id);
    scrollToSection(id);
  };

  const counter = `${activeIndex + 1}/${sections.length}`;

  return (
    <>
      {/* Mobile: sticky bar with a dropdown listing every section. */}
      <div className="sticky top-0 z-30 -mx-4 border-b bg-background/95 px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pcnPurple dark:focus-visible:ring-pcnGreen"
            >
              <List className="h-4 w-4 shrink-0 text-pcnPurple dark:text-pcnGreen" />
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{counter}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{activeSection?.title}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                  <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.group}
                  </DropdownMenuLabel>
                )}
                {group.sections.map((section) => (
                  <DropdownMenuItem
                    key={section.id}
                    onSelect={() => handleSelect(section.id)}
                    className={cn(
                      'gap-2.5',
                      section.id === activeId && 'font-medium text-pcnPurple dark:text-pcnGreen',
                    )}
                  >
                    {section.icon && <section.icon className="h-4 w-4 shrink-0" />}
                    <span className="flex-1">{section.title}</span>
                    {section.meta && (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {section.meta}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-pcnPurple dark:bg-pcnGreen"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>
      </div>

      {/* Desktop: sticky sidebar with rail, sliding indicator and progress. */}
      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-64 shrink-0 flex-col lg:flex">
        <div className="flex items-baseline justify-between px-3 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <span className="text-xs tabular-nums text-muted-foreground">{counter}</span>
        </div>
        <div className="mx-3 h-0.5 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-pcnPurple dark:bg-pcnGreen"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          />
        </div>
        <nav
          ref={navRef}
          aria-label={label}
          className="relative min-h-0 flex-1 overflow-y-auto py-4 pr-2 [scrollbar-width:thin]"
        >
          <ol className="relative ml-3 border-l border-border">
            {groupedSections.map((group, groupIndex) => (
              <li key={group.group ?? groupIndex} className={cn(groupIndex > 0 && 'mt-4')}>
                {group.group && (
                  <p className="mb-1 pl-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.group}
                  </p>
                )}
                <ol>
                  {group.sections.map((section) => {
                    const isActive = section.id === activeId;
                    return (
                      <li key={section.id} className="relative">
                        {isActive && (
                          <motion.span
                            layoutId="toc-active-indicator"
                            aria-hidden
                            className="absolute -left-px bottom-1 top-1 w-0.5 rounded-full bg-pcnPurple dark:bg-pcnGreen dark:shadow-[0_0_8px_rgba(4,244,190,0.7)]"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                          />
                        )}
                        <a
                          href={`#${section.id}`}
                          data-toc-id={section.id}
                          aria-current={isActive ? 'location' : undefined}
                          onClick={(event) => {
                            event.preventDefault();
                            handleSelect(section.id);
                          }}
                          className={cn(
                            'flex items-start gap-2.5 rounded-r-md py-1.5 pl-4 pr-2 text-sm leading-snug transition-colors',
                            isActive
                              ? 'font-medium text-foreground'
                              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                          )}
                        >
                          {section.icon && (
                            <section.icon
                              className={cn(
                                'mt-0.5 h-4 w-4 shrink-0 transition-colors',
                                isActive ? 'text-pcnPurple dark:text-pcnGreen' : 'opacity-70',
                              )}
                            />
                          )}
                          <span className="flex-1">{section.title}</span>
                          {section.meta && (
                            <span
                              className={cn(
                                'mt-0.5 shrink-0 text-[11px] tabular-nums',
                                isActive
                                  ? 'text-pcnPurple dark:text-pcnGreen'
                                  : 'text-muted-foreground/70',
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
            ))}
          </ol>
        </nav>
      </aside>
    </>
  );
}
