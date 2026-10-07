'use client';

import Link from 'next/link';
import { Marquee } from '@/components/magicui/marquee';
import { useNotificationCenter } from '@/components/notifications/use-notification-center';
import { cn } from '@/lib/utils';

const KIND_STYLES: Record<string, { label: string; className: string }> = {
  evento: { label: 'EVENTO', className: 'text-pcnGreen' },
  charla: { label: 'CHARLA', className: 'text-sky-400' },
  fotos: { label: 'FOTOS', className: 'text-pink-400' },
  setup: { label: 'SETUP', className: 'text-amber-400' },
  proyecto: { label: 'PROYECTO', className: 'text-violet-400' },
  conversacion: { label: 'CHAT', className: 'text-teal-300' },
  changelog: { label: 'SITIO', className: 'text-orange-400' },
  desarrollo: { label: 'CÓDIGO', className: 'text-lime-400' },
};

/** How many headlines go around. */
const HEADLINES = 10;

// A sports-channel news crawl at the bottom of the classic layout: the latest feed headlines
// scrolling by, refreshed live as things happen (the notification center's data). Desktop only:
// phones have the tab bar there, and PCN OS has its own status bar.
export function NewsTicker() {
  const { data } = useNotificationCenter();
  const items = data?.feed.slice(0, HEADLINES) ?? [];
  if (items.length === 0) return null;

  // The page column is a min-h-svh flex column: `mt-auto` keeps the crawl on the bottom edge even
  // when the page is shorter than the screen (loading skeletons), and the spacer keeps the gap
  // above it when it isn't, unless the page ends in something meant to sit right on the crawl
  // (`data-ticker-flush`, like the home footer's wordmark).
  return (
    <>
      <div
        aria-hidden
        className="hidden h-6 shrink-0 md:block embedded:hidden [:has([data-ticker-flush])_&]:hidden"
      />
      <aside
        aria-label="Últimas novedades"
        className="sticky bottom-0 z-30 -mx-6 mt-auto hidden h-8 items-stretch border-t border-pcnGreen-200 bg-background/95 font-mono text-xs backdrop-blur-sm md:flex embedded:hidden"
      >
        <Link
          href="/feed"
          className="flex shrink-0 items-center gap-1.5 bg-pcnGreen px-3 font-bold tracking-wider text-black uppercase hover:bg-pcnGreen/90"
        >
          <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-red-600" />
          PCN News
        </Link>
        <Marquee
          pauseOnHover
          repeat={2}
          className="min-w-0 flex-1 items-center p-0 [--duration:90s] [--gap:2rem]"
        >
          {items.map((item) => {
            const kind = KIND_STYLES[item.kind] ?? {
              label: item.kind.toUpperCase(),
              className: '',
            };
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap text-foreground/85 hover:text-pcnGreen"
              >
                <span className={cn('font-bold', kind.className)}>{kind.label}</span>
                {item.title}
                {item.meta && <span className="text-muted-foreground">· {item.meta}</span>}
                <span aria-hidden className="pl-6 text-pcnGreen-600">
                  ◆
                </span>
              </Link>
            );
          })}
        </Marquee>
      </aside>
    </>
  );
}
