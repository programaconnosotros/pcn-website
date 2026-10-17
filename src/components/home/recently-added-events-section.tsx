import Link from 'next/link';
import { ArrowRight, CalendarClock, MapPin, Users, Video } from 'lucide-react';
import { fetchHomeEvents, type HomeEvent } from '@/actions/events/fetch-home-events';
import { EventStatusBadge } from '@/components/events/event-status-badge';
import { FlyerFrame } from '@/components/events/flyer-frame';
import { LocalEventDate } from '@/components/ui/local-date-time';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { SectionHeader } from './section-header';

const TIME_ZONE = 'America/Argentina/Buenos_Aires';
const dayKey = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date);

/** `hoy`, `mañana` or `en 5 días`, by calendar day in Argentina. */
const countdown = (date: Date, now = new Date()) => {
  const days = Math.round(
    (new Date(dayKey(date)).getTime() - new Date(dayKey(now)).getTime()) / 86_400_000,
  );
  if (days <= 0) return 'hoy';
  if (days === 1) return 'mañana';
  return `en ${days} días`;
};

const locationOf = (event: HomeEvent) =>
  event.isOnline ? 'online' : [event.placeName, event.city].filter(Boolean).join(', ');

const isFull = (event: HomeEvent) =>
  event.markedAsFull || (event.capacity !== null && event._count.registrations >= event.capacity);

/** The next event, as the billboard's headline: big flyer, countdown and the details. */
function FeaturedEvent({ event, upcoming }: { event: HomeEvent; upcoming: boolean }) {
  const location = locationOf(event);
  const LocationIcon = event.isOnline ? Video : MapPin;
  return (
    <Link
      href={`/eventos/${event.id}`}
      className={cn(
        ruledCellClassName,
        'relative flex group flex-col gap-4 overflow-hidden p-4 sm:flex-row sm:gap-5',
      )}
    >
      {upcoming && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-pcnGreen shadow-[0_0_12px_#04f4be]"
        />
      )}
      <FlyerFrame
        src={event.flyerImages[0]}
        alt={`Flyer de ${event.name}`}
        className="aspect-4/5 w-full shrink-0 rounded-sm border border-pcnGreen-200 shadow-[0_0_30px_-10px_rgba(4,244,190,0.5)] sm:w-56 lg:w-64"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase">
          {upcoming ? (
            <span className="flex items-center gap-1.5 text-pcnGreen">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-pcnGreen opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-pcnGreen" />
              </span>
              próximo · {countdown(event.date)}
            </span>
          ) : (
            <span className="text-muted-foreground">último evento</span>
          )}
          <span className="flex empty:hidden">
            <EventStatusBadge date={event.date} endDate={event.endDate} isFull={isFull(event)} />
          </span>
        </div>

        <h3 className="font-mono text-2xl leading-tight font-semibold tracking-tight text-balance transition-colors group-hover:text-pcnGreen md:text-3xl md:leading-9">
          {event.name}
        </h3>

        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5 font-mono text-xs text-muted-foreground">
          <CalendarClock className="size-3.5 text-pcnGreen-500" aria-label="Fecha" />
          <dd className="text-foreground">
            <LocalEventDate date={event.date} />
          </dd>
          {location && (
            <>
              <LocationIcon className="size-3.5 text-pcnGreen-500" aria-label="Lugar" />
              <dd className="truncate">{location}</dd>
            </>
          )}
          {event._count.registrations > 0 && (
            <>
              <Users className="size-3.5 text-pcnGreen-500" aria-label="Anotados" />
              <dd>
                <span className="text-foreground">{event._count.registrations}</span>{' '}
                {upcoming ? 'anotados' : 'fueron'}
                {event.capacity !== null && upcoming && ` de ${event.capacity} lugares`}
              </dd>
            </>
          )}
        </dl>

        {event.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}

        <span className="mt-auto inline-flex w-fit items-center gap-1.5 border border-pcnGreen bg-pcnGreen/15 px-3 py-1.5 font-mono text-xs text-pcnGreen shadow-[0_0_14px_-4px_rgba(4,244,190,0.8)] transition-colors group-hover:bg-pcnGreen/25">
          {upcoming ? (isFull(event) ? 'verEvento();' : 'anotarme();') : 'verEvento();'}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** A smaller poster beside the headline; past events fade back so upcoming ones stand out. */
function SideEvent({ event, upcoming }: { event: HomeEvent; upcoming: boolean }) {
  const location = locationOf(event);
  return (
    <Link
      href={`/eventos/${event.id}`}
      className={cn(ruledCellClassName, 'flex min-h-0 group gap-3 p-3')}
    >
      <FlyerFrame
        src={event.flyerImages[0]}
        alt={`Flyer de ${event.name}`}
        className={cn(
          'aspect-4/5 w-24 shrink-0 self-start rounded-sm border border-pcnGreen-200 sm:w-28',
          !upcoming &&
            'opacity-60 grayscale transition-[filter,opacity] group-hover:opacity-100 group-hover:grayscale-0',
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p
          className={cn(
            'font-mono text-[10px] tracking-[0.18em] uppercase',
            upcoming ? 'text-pcnGreen' : 'text-muted-foreground/70',
          )}
        >
          {upcoming ? countdown(event.date) : 'ya pasó'}
        </p>
        <h3
          className={cn(
            'line-clamp-2 font-mono text-sm leading-snug font-semibold transition-colors group-hover:text-pcnGreen',
            !upcoming && 'text-muted-foreground',
          )}
        >
          {event.name}
        </h3>
        <p className="font-mono text-[11px] text-muted-foreground">
          <LocalEventDate date={event.date} />
        </p>
        {location && (
          <p className="truncate font-mono text-[11px] text-muted-foreground/70">
            <span className="text-pcnGreen-500">@ </span>
            {location}
          </p>
        )}
        <span className="mt-auto flex empty:hidden">
          <EventStatusBadge date={event.date} endDate={event.endDate} isFull={isFull(event)} />
        </span>
      </div>
    </Link>
  );
}

export const RecentlyAddedEventsSection = async () => {
  const { upcoming, past } = await fetchHomeEvents();
  const events = [...upcoming, ...past];
  if (events.length === 0) return null;

  const [featured, ...side] = events;
  const hasUpcoming = upcoming.length > 0;
  const isUpcoming = (event: HomeEvent) => upcoming.includes(event);

  return (
    <section>
      <SectionHeader
        eyebrow="Eventos"
        title={
          hasUpcoming ? (
            <>
              Próximos <span className="text-pcnGreen">eventos</span>
            </>
          ) : (
            <>
              Últimos <span className="text-pcnGreen">eventos</span>
            </>
          )
        }
        description="Presenciales y online, para todo el mundo. Sumate al próximo."
        action={{ label: 'Ver todos los eventos', href: '/eventos' }}
      />

      {/* The headline takes the wide column and the rest stack beside it, so the billboard is
          always full: with one event it spans the whole row. */}
      <RuledGrid
        className={cn(
          'grid-cols-1',
          side.length > 0 && 'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]',
        )}
      >
        <FeaturedEvent event={featured} upcoming={isUpcoming(featured)} />
        {side.length > 0 && (
          <div
            className={cn(
              'grid grid-cols-1',
              side.length > 1 && 'sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2',
            )}
          >
            {side.map((event) => (
              <SideEvent key={event.id} event={event} upcoming={isUpcoming(event)} />
            ))}
          </div>
        )}
      </RuledGrid>
    </section>
  );
};
