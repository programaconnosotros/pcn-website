'use client';

import { SidebarGroup } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { ArrowRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarSectionLabel } from './nav-main';

export interface UpcomingEvent {
  id: string;
  name: string;
  date: Date;
}

// Format in Argentina's timezone on the server so the markup matches the
// first client render; the client re-renders in the visitor's own timezone.
const CANONICAL_TZ = 'America/Argentina/Buenos_Aires';
const tz = () => (typeof window === 'undefined' ? CANONICAL_TZ : undefined);

const parts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz(),
  });
  const map = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const clean = (value: string) => value.replace('.', '');

  return {
    day: map.day,
    month: clean(map.month ?? '').slice(0, 3),
    weekday: clean(map.weekday ?? ''),
    time: `${map.hour}:${map.minute}`,
  };
};

export const SidebarUpcomingEvents = ({
  events,
  limit = 3,
}: {
  events: UpcomingEvent[];
  limit?: number;
}) => {
  const pathname = usePathname();

  if (events.length === 0) return null;

  return (
    <SidebarGroup className="py-1.5">
      <SidebarSectionLabel>Próximos eventos</SidebarSectionLabel>

      <div className="flex flex-col gap-1.5 px-0.5">
        {events.slice(0, limit).map((event) => {
          const { day, month, weekday, time } = parts(new Date(event.date));
          const isActive = pathname === `/eventos/${event.id}`;

          return (
            <Link
              key={event.id}
              href={`/eventos/${event.id}`}
              className={cn(
                'group flex items-center gap-2.5 rounded-lg border border-sidebar-border/70 bg-pcnGreen-50 p-2 transition-colors hover:border-pcnGreen/35 hover:bg-pcnGreen/[0.05]',
                isActive && 'border-pcnGreen/40 bg-pcnGreen/[0.07]',
              )}
            >
              <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-sm bg-black text-pcnGreen ring-1 ring-inset ring-pcnGreen-400">
                <span
                  className={cn(
                    GeistMono.className,
                    'text-[9px] uppercase leading-none tracking-wider',
                  )}
                  suppressHydrationWarning
                >
                  {month}
                </span>
                <span
                  className="mt-0.5 text-sm font-semibold leading-none"
                  suppressHydrationWarning
                >
                  {day}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-sidebar-foreground/90 group-hover:text-sidebar-foreground">
                  {event.name}
                </p>
                <p className="text-[11px] text-sidebar-foreground/45" suppressHydrationWarning>
                  <span className="capitalize">{weekday}</span> · {time} hs
                </p>
              </div>
            </Link>
          );
        })}

        <Link
          href="/eventos"
          className="group mt-0.5 flex items-center gap-1.5 px-2 py-1 font-mono text-[11px] font-medium text-pcnGreen-600 transition-colors hover:text-pcnGreen"
        >
          <CalendarDays className="size-3.5" />
          Ver todos los eventos
          <ArrowRight className="ml-auto size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </SidebarGroup>
  );
};
