'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { GeistMono } from 'geist/font/mono';
import { ArrowUpRight, CalendarDays, GraduationCap, Home, Menu, Rocket, X } from 'lucide-react';
import { User } from '@prisma/client';

import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSidebar } from '@/components/ui/sidebar';
import { NavUser } from '@/components/ui/nav-user';
import type { NavItem } from '@/components/ui/nav-main';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';

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
  { title: 'Proyectos', url: '/proyectos', icon: Rocket },
];

const tabClassName =
  'flex h-full flex-1 flex-col items-center justify-center gap-1 font-mono text-[11px] font-medium text-foreground/60 transition-colors active:bg-pcnGreen/10';

type MenuEntry = Pick<NavItem, 'title' | 'icon' | 'badge'> & { url: string };

/** Sub-items (e.g. "Redes") become their own tiles so every destination is one tap away. */
const flatten = (items: NavItem[]): MenuEntry[] =>
  items.flatMap((item) =>
    item.items?.length
      ? item.items.map((sub) => ({ title: sub.title, url: sub.url, icon: item.icon }))
      : item.url
        ? [{ title: item.title, url: item.url, icon: item.icon, badge: item.badge }]
        : [],
  );

const MenuTile = ({ item, active }: { item: MenuEntry; active: boolean }) => {
  const external = isExternal(item.url);
  const className = cn(
    ruledCellClassName,
    'relative flex min-h-20 flex-col justify-between gap-2 p-3 text-[15px] font-medium text-foreground/80 active:bg-pcnGreen/10',
    active && 'bg-pcnGreen/[0.09] font-mono text-pcnGreen',
  );
  const content = (
    <>
      <span className="flex items-start justify-between">
        <item.icon
          className={cn('size-6', active ? 'text-pcnGreen' : 'text-pcnGreen-500')}
          strokeWidth={1.75}
        />
        {item.badge ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-sm bg-pcnGreen px-1.5 font-mono text-[10px] font-semibold tabular-nums text-black">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        ) : external ? (
          <ArrowUpRight className="size-4 text-foreground/40" />
        ) : null}
      </span>
      <span className="leading-tight">{item.title}</span>
    </>
  );

  return external ? (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={item.url} aria-current={active ? 'page' : undefined} className={className}>
      {content}
    </Link>
  );
};

/**
 * Phone navigation: a fixed bottom tab bar with the main destinations plus a "Menú" tab that
 * opens every section as large tap targets. Shares `openMobile` with the sidebar context, so
 * any `SidebarTrigger` opens it too.
 */
export function MobileNav({
  sections,
  footerItems,
  user,
}: {
  sections: NavSection[];
  footerItems: NavItem[];
  user: User | null;
}) {
  const pathname = usePathname();
  const { openMobile, setOpenMobile } = useSidebar();
  const tabBarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <>
      <nav
        ref={tabBarRef}
        aria-label="Navegación principal"
        className="pointer-events-auto fixed inset-x-0 bottom-0 z-[60] border-t border-pcnGreen-200 bg-black/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="flex h-16 items-stretch">
          {tabItems.map((item) => {
            const active = !openMobile && isActivePath(pathname, item.url);
            return (
              <Link
                key={item.url}
                href={item.url}
                aria-current={active ? 'page' : undefined}
                className={cn(tabClassName, active && 'text-pcnGreen')}
              >
                <item.icon className="size-6" strokeWidth={1.75} />
                <span>{item.title}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpenMobile(!openMobile)}
            aria-expanded={openMobile}
            className={cn(tabClassName, openMobile && 'text-pcnGreen')}
          >
            {openMobile ? (
              <X className="size-6" strokeWidth={1.75} />
            ) : (
              <Menu className="size-6" strokeWidth={1.75} />
            )}
            <span>Menú</span>
          </button>
        </div>
      </nav>

      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="bottom"
          // The tab bar stays usable over the open menu: its own tabs toggle or navigate.
          onInteractOutside={(event) => {
            if (tabBarRef.current?.contains(event.target as Node)) event.preventDefault();
          }}
          className="flex h-[100dvh] flex-col gap-0 border-t-0 bg-black p-0 md:hidden [&>button:last-child]:hidden"
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-pcnGreen-200 px-4">
            <SheetTitle className="flex items-center gap-2.5 font-mono text-base font-semibold text-pcnGreen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.webp" alt="" className="size-6" />
              ~/menú
            </SheetTitle>
            <SheetClose className="-mr-2 flex size-11 items-center justify-center rounded-sm text-foreground/70 active:bg-pcnGreen/10">
              <X className="size-6" />
              <span className="sr-only">Cerrar menú</span>
            </SheetClose>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2">
            {sections.map((section, i) => (
              <section key={section.label ?? i} className="mt-4">
                {section.label && (
                  <h2
                    className={cn(
                      GeistMono.className,
                      'mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-pcnGreen-500 before:mr-1.5 before:text-pcnGreen-300 before:content-["##"]',
                    )}
                  >
                    {section.label}
                  </h2>
                )}
                <RuledGrid className="grid-cols-2">
                  {flatten(section.items).map((item) => (
                    <MenuTile
                      key={`${item.title}-${item.url}`}
                      item={item}
                      active={!isExternal(item.url) && isActivePath(pathname, item.url)}
                    />
                  ))}
                </RuledGrid>
              </section>
            ))}

            <div className="mt-6 flex flex-col gap-3">
              <RuledGrid className="grid-cols-2">
                {footerItems.map((item) => (
                  <MenuTile key={item.title} item={{ ...item, url: item.url! }} active={false} />
                ))}
              </RuledGrid>
              <NavUser user={user} />
            </div>
          </div>

          {/* Keeps the tab bar's footprint so the last tiles never sit under it. */}
          <div className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0" />
        </SheetContent>
      </Sheet>
    </>
  );
}
