'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Home,
  MessageCircle,
  Search,
  SquareTerminal,
  X,
} from 'lucide-react';
import type { SessionUser } from '@/lib/session';

import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSidebar } from '@/components/ui/sidebar';
import { NavUser } from '@/components/ui/nav-user';
import { InstallAppButton } from '@/components/ui/install-app-button';
import type { NavItem } from '@/components/ui/nav-main';
import { cn } from '@/lib/utils';
import { openGlobalSearch } from '@/components/search/global-search';

export interface NavSection {
  label?: string;
  items: NavItem[];
}

const isExternal = (url: string) => /^https?:\/\//.test(url);

const isActivePath = (pathname: string, url: string) =>
  pathname === url || (url !== '/' && pathname.startsWith(url));

const tabItems = [
  { title: 'Inicio', url: '/', icon: Home },
  { title: 'Eventos', url: '/eventos', icon: CalendarDays },
  { title: 'Cursos', url: '/cursos', icon: GraduationCap },
  { title: 'Conversaciones', url: '/conversaciones', icon: MessageCircle },
];

// Geist Mono is wide, so the labels are set tight and truncate (e.g. "Conversaciones" on a narrow
// phone) instead of pushing the other tabs around.
const tabClassName =
  'relative flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 font-mono text-[10px] font-medium tracking-tighter text-foreground/55 transition-colors active:bg-pcnGreen/10';

/** A lit bar over the active tab, like a selected pane in tmux. */
const TabIndicator = () => (
  <span className="absolute inset-x-4 top-0 h-0.5 bg-pcnGreen shadow-[0_0_12px_2px_rgba(4,244,190,0.6)]" />
);

type MenuEntry = Pick<NavItem, 'title' | 'icon' | 'badge'> & {
  url: string;
  /** Stable line number across the whole menu, also used to stagger the entrance. */
  line: number;
};

interface MenuGroup {
  label: string;
  entries: MenuEntry[];
}

/** Sub-items (e.g. "Redes") become their own rows so every destination is one tap away. */
const flatten = (items: NavItem[]): Omit<MenuEntry, 'line'>[] =>
  items.flatMap((item) =>
    item.items?.length
      ? item.items.map((sub) => ({ title: sub.title, url: sub.url, icon: item.icon }))
      : item.url
        ? [{ title: item.title, url: item.url, icon: item.icon, badge: item.badge }]
        : [],
  );

const displayPath = (url: string) =>
  isExternal(url) ? new URL(url).hostname.replace(/^www\./, '') : `~${url}`;

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const pad = (n: number) => String(n).padStart(2, '0');

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GLYPHS = '!<>-_\\/[]{}=+*^?#$%01';

/** Resolves random glyphs into the real label, left to right, like a decrypting terminal. */
const ScrambleText = ({ text, delay }: { text: string; delay: number }) => {
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const frames = 12;
    let frame = 0;
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        frame += 1;
        const revealed = Math.floor((frame / frames) * text.length);
        setOutput(
          frame >= frames
            ? text
            : [...text]
                .map((char, i) =>
                  i < revealed || char === ' '
                    ? char
                    : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
                )
                .join(''),
        );
        if (frame >= frames) window.clearInterval(interval);
      }, 30);
    }, delay);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [text, delay]);

  return (
    <>
      <span aria-hidden>{output}</span>
      <span className="sr-only">{text}</span>
    </>
  );
};

const Clock = () => {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <span className="tabular-nums">
      {now
        ? new Intl.DateTimeFormat('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(now)
        : '--:--'}
    </span>
  );
};

const MenuRow = ({ item, active }: { item: MenuEntry; active: boolean }) => {
  const external = isExternal(item.url);
  const delay = Math.min(item.line * 22, 600);
  const className = cn(
    'group relative flex h-12 items-center gap-2.5 border-b border-pcnGreen-200 px-2.5 text-[14px] min-[380px]:gap-3 min-[380px]:px-3 min-[380px]:text-[15px] font-medium text-foreground/85 duration-300 animate-in fade-in slide-in-from-left-3 fill-mode-both last:border-b-0 active:bg-pcnGreen/10',
    active && 'bg-pcnGreen/[0.08] text-pcnGreen',
  );
  const content = (
    <>
      {active && (
        <span className="absolute inset-y-0 left-0 w-0.5 bg-pcnGreen shadow-[0_0_10px_1px_rgba(4,244,190,0.7)]" />
      )}
      <span
        className={cn(
          'w-5 shrink-0 font-mono text-[10px] tabular-nums',
          active ? 'text-pcnGreen' : 'text-pcnGreen-400',
        )}
      >
        {active ? '▸' : pad(item.line)}
      </span>
      <item.icon
        className={cn('size-[18px] shrink-0', active ? 'text-pcnGreen' : 'text-pcnGreen-600')}
        strokeWidth={1.75}
      />
      <span className={cn('max-w-[65%] shrink-0 truncate', active && 'text-glow')}>
        <ScrambleText text={item.title} delay={delay} />
      </span>
      {item.badge ? (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-sm bg-pcnGreen px-1.5 font-mono text-[10px] font-semibold tabular-nums text-black">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      ) : (
        <span className="min-w-0 flex-1 truncate text-right font-mono text-[11px] tracking-tight text-foreground/30">
          {displayPath(item.url)}
        </span>
      )}
      {external ? (
        <ArrowUpRight className="size-3.5 shrink-0 text-foreground/35" />
      ) : (
        <ChevronRight
          className={cn('size-3.5 shrink-0', active ? 'text-pcnGreen' : 'text-foreground/25')}
        />
      )}
    </>
  );

  const style: CSSProperties = { animationDelay: `${delay}ms` };

  return external ? (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
    >
      {content}
    </a>
  ) : (
    <Link
      href={item.url}
      aria-current={active ? 'page' : undefined}
      className={className}
      style={style}
    >
      {content}
    </Link>
  );
};

/**
 * The open menu, laid out as a shell session: a prompt with the user's handle, a `cd` search
 * that filters every destination (Enter jumps to the first match), numbered listings per
 * section and a vim-like status line. Mounted only while open, so the search resets each time.
 */
const MenuPanel = ({
  groups,
  user,
  onClose,
}: {
  groups: MenuGroup[];
  user: SessionUser | null;
  onClose: () => void;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handle = user ? normalize(user.name.split(' ')[0] ?? 'dev').replace(/\W/g, '') : 'guest';
  const total = groups.reduce((sum, group) => sum + group.entries.length, 0);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim().replace(/^\/+|\/+$/g, ''));
    if (!needle) return groups;
    return groups
      .map((group) => ({
        ...group,
        entries: group.entries.filter((entry) =>
          normalize(`${entry.title} ${entry.url}`).includes(needle),
        ),
      }))
      .filter((group) => group.entries.length > 0);
  }, [groups, query]);

  const matches = filtered.reduce((sum, group) => sum + group.entries.length, 0);

  const openFirstMatch = () => {
    const first = filtered[0]?.entries[0];
    if (!query.trim() || !first) return;
    if (isExternal(first.url)) window.open(first.url, '_blank', 'noopener,noreferrer');
    else router.push(first.url);
    onClose();
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="bg-grid-fade absolute inset-0" />
        <div className="absolute -top-32 left-1/2 size-72 -translate-x-1/2 rounded-full bg-pcnGreen/15 blur-3xl" />
      </div>

      <header className="relative shrink-0 border-b border-pcnGreen-200 bg-black/70 backdrop-blur">
        <div className="flex h-12 items-center gap-2.5 pl-3 pr-2 min-[380px]:pl-4">
          <span className="relative flex size-7 shrink-0 items-center justify-center rounded-sm ring-1 ring-inset ring-pcnGreen-400">
            <span className="absolute inset-0 rounded-sm bg-pcnGreen/20 blur-md" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" className="relative size-5" />
          </span>
          <SheetTitle className="min-w-0 flex-1 truncate font-mono text-[13px] font-medium">
            <span className="text-pcnGreen">{handle}@pcn</span>
            <span className="text-foreground/40">:</span>
            <span className="text-sky-400">~</span>
            <span className="text-foreground/40">$ </span>
            <span className="cursor-blink text-foreground/80">menu</span>
          </SheetTitle>
          <SheetClose className="flex h-9 items-center gap-1.5 rounded-sm border border-pcnGreen-200 px-2.5 font-mono text-[11px] text-foreground/60 active:bg-pcnGreen/10">
            <X className="size-3.5" />
            exit
          </SheetClose>
        </div>

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            openFirstMatch();
          }}
          className="mx-3 mb-3 flex h-11 items-center gap-2 rounded-sm border border-pcnGreen-300 bg-black/80 px-3 font-mono text-[14px] transition-shadow focus-within:border-pcnGreen-600 focus-within:shadow-[0_0_20px_-6px_rgba(4,244,190,0.6)] min-[380px]:mx-4"
        >
          <span className="shrink-0 text-pcnGreen">$</span>
          <span className="shrink-0 text-foreground/50">cd</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="buscar sección…"
            aria-label="Buscar sección"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            className="min-w-0 flex-1 bg-transparent text-foreground caret-pcnGreen outline-none placeholder:text-foreground/25 [&::-webkit-search-cancel-button]:hidden"
          />
          <span className="shrink-0 text-[10px] tabular-nums text-pcnGreen-500">
            {pad(matches)}/{pad(total)}
          </span>
        </form>
      </header>

      <div className="relative flex-1 overflow-y-auto overscroll-contain px-3 pb-6 min-[380px]:px-4">
        {/* The prompt above only filters sections; this hands the query to the site-wide search. */}
        <button
          type="button"
          onClick={() => {
            onClose();
            openGlobalSearch(query.trim());
          }}
          className="mt-4 flex w-full items-center gap-2 rounded-sm border border-dashed border-pcnGreen-300 px-3 py-2.5 text-left font-mono text-[13px] active:bg-pcnGreen/10"
        >
          <Search className="size-4 shrink-0 text-pcnGreen" />
          <span className="min-w-0 flex-1 truncate">
            {query.trim() ? (
              <>
                <span className="text-foreground/50">find ~ -iname </span>
                <span className="text-pcnGreen">&quot;{query.trim()}&quot;</span>
              </>
            ) : (
              <span className="text-foreground/70">buscar en todo el sitio</span>
            )}
          </span>
          <span className="hidden shrink-0 text-[10px] text-pcnGreen-500 min-[380px]:inline">
            eventos · cursos · charlas…
          </span>
        </button>

        {filtered.length === 0 ? (
          <div className="mt-6 font-mono text-[13px] leading-relaxed">
            <p className="text-red-400/90">
              bash: cd: {query.trim()}: No existe el archivo o el directorio
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-3 text-pcnGreen underline-offset-4 active:underline"
            >
              $ clear
            </button>
          </div>
        ) : (
          filtered.map((group) => (
            <section key={group.label} className="mt-5">
              <h2 className="mb-1.5 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-pcnGreen-600">
                <span className="text-pcnGreen-300">{'//'}</span>
                {group.label}
                <span className="h-px flex-1 bg-gradient-to-r from-pcnGreen-300 to-transparent" />
                <span className="tabular-nums text-pcnGreen-400">{pad(group.entries.length)}</span>
              </h2>
              <div className="overflow-hidden rounded-sm border border-pcnGreen-200 bg-black/60">
                {group.entries.map((item) => (
                  <MenuRow
                    key={`${item.title}-${item.url}`}
                    item={item}
                    active={!isExternal(item.url) && isActivePath(pathname, item.url)}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        {!query && (
          <div className="mt-6 flex flex-col gap-2">
            <InstallAppButton />
            <NavUser user={user} />
          </div>
        )}
      </div>

      <div className="relative flex h-7 shrink-0 items-center gap-2 border-t border-pcnGreen-200 bg-black font-mono text-[10px] text-foreground/50">
        <span className="flex h-full items-center bg-pcnGreen px-2 font-semibold tracking-wider text-black">
          NAV
        </span>
        <span className="min-w-0 flex-1 truncate text-pcnGreen-700">~{pathname}</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-pcnGreen shadow-[0_0_6px_rgba(4,244,190,0.9)]" />
          {total} rutas
        </span>
        <span className="pr-2 text-foreground/40">
          <Clock />
        </span>
      </div>
    </>
  );
};

/**
 * Phone navigation: a fixed bottom tab bar with the main destinations plus a terminal tab that
 * opens the full menu. Shares `openMobile` with the sidebar context, so any `SidebarTrigger`
 * opens it too.
 */
export function MobileNav({
  sections,
  footerItems,
  user,
}: {
  sections: NavSection[];
  footerItems: NavItem[];
  user: SessionUser | null;
}) {
  const pathname = usePathname();
  const { openMobile, setOpenMobile } = useSidebar();
  const tabBarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const groups = useMemo(() => {
    let line = 0;
    return [...sections, { label: 'Ayuda', items: footerItems }].map((section, i) => ({
      label: section.label ?? `Sección ${i + 1}`,
      entries: flatten(section.items).map((entry) => ({ ...entry, line: ++line })),
    }));
  }, [sections, footerItems]);

  return (
    <>
      <nav
        ref={tabBarRef}
        aria-label="Navegación principal"
        // Safari 26 tints its floating toolbar by sampling fixed bottom containers, and a
        // translucent or blurred one makes it bleed page content or turn white. Keep the root
        // transparent and paint an opaque fill in an absolute child instead. The fill runs
        // past the bottom edge: with the floating URL bar expanded, `bottom: 0` sits above it
        // and page content would otherwise scroll by underneath, visible through the glass.
        className="mobile-tab-bar pointer-events-auto fixed inset-x-0 bottom-0 z-[60] bg-transparent pb-[env(safe-area-inset-bottom)] embedded:hidden md:hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-[50vh] top-0 border-t border-pcnGreen-200 bg-black"
        />
        <div className="relative flex h-16 items-stretch">
          {tabItems.map((item) => {
            const active = !openMobile && isActivePath(pathname, item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                aria-current={active ? 'page' : undefined}
                // Any other tab closes the open menu right away, as if "Menú" had been tapped,
                // instead of waiting for the route change (which never comes on the current tab).
                onClick={() => setOpenMobile(false)}
                className={cn(tabClassName, active && 'text-pcnGreen')}
              >
                {active && <TabIndicator />}
                <item.icon
                  className={cn('size-[22px]', active && 'drop-shadow-[0_0_6px_#04f4be]')}
                  strokeWidth={1.75}
                />
                <span className={cn('max-w-full truncate', active && 'text-glow')}>
                  {item.title}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpenMobile(!openMobile)}
            aria-expanded={openMobile}
            aria-label={openMobile ? 'Cerrar menú' : 'Abrir menú'}
            className={cn(tabClassName, openMobile && 'text-pcnGreen')}
          >
            {openMobile && <TabIndicator />}
            <span
              className={cn(
                'flex size-[26px] items-center justify-center rounded-sm border transition-all',
                openMobile
                  ? 'border-pcnGreen bg-pcnGreen text-black shadow-[0_0_14px_rgba(4,244,190,0.6)]'
                  : 'border-pcnGreen-400 text-pcnGreen',
              )}
            >
              {openMobile ? (
                <X className="size-4" strokeWidth={2.25} />
              ) : (
                <SquareTerminal className="size-4" strokeWidth={2} />
              )}
            </span>
            <span className={cn('max-w-full truncate', openMobile && 'text-glow')}>Menú</span>
          </button>
        </div>
      </nav>

      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="bottom"
          // Focusing the search on open would pop the keyboard over the menu.
          onOpenAutoFocus={(event) => event.preventDefault()}
          // The tab bar stays usable over the open menu: its own tabs toggle or navigate.
          onInteractOutside={(event) => {
            if (tabBarRef.current?.contains(event.target as Node)) event.preventDefault();
          }}
          className="flex h-[100dvh] flex-col gap-0 overflow-hidden border-t-0 bg-black p-0 md:hidden [&>button:last-child]:hidden"
        >
          <MenuPanel groups={groups} user={user} onClose={() => setOpenMobile(false)} />

          {/* Keeps the tab bar's footprint so the status line never sits under it. */}
          <div className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0" />
        </SheetContent>
      </Sheet>
    </>
  );
}
