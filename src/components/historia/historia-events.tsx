import type { HistoriaEvent } from '@/lib/historia-events';
import { ArrowUpRight, CalendarDays, Images } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const formatDate = (date: Date) =>
  date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });

// Rows of four photos: two when the event has plenty, one otherwise, never a row half empty.
const COLUMNS = 4;
const shownPhotos = <T,>(photos: T[]) =>
  photos.length < COLUMNS
    ? photos
    : photos.slice(0, photos.length >= 2 * COLUMNS ? 2 * COLUMNS : COLUMNS);

const GRID_COLUMNS = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3'];

interface HistoriaEventsProps {
  /** Flyers shown in the section; the events using them are listed in the same order. */
  flyers: string[];
  events: HistoriaEvent[];
}

/**
 * The platform events a story section tells about: a link to each event's page and, when the
 * gallery has photos of it, a strip of them. Renders nothing for events not on the platform.
 */
export function HistoriaEvents({ flyers, events }: HistoriaEventsProps) {
  const matched = flyers
    .map((flyer) => events.find((event) => event.flyerImages.includes(flyer)))
    .filter((event, index, all): event is HistoriaEvent => !!event && all.indexOf(event) === index);
  if (!matched.length) return null;

  return (
    <div className="not-prose mt-4 space-y-3">
      {matched.map((event) => (
        <div key={event.id} className="border border-pcnGreen-200 font-mono">
          <Link
            href={`/eventos/${event.id}`}
            className="flex group items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-pcnGreen/[0.05]"
          >
            <CalendarDays className="size-3.5 shrink-0 text-pcnGreen-500" />
            <span className="min-w-0 truncate font-semibold text-foreground group-hover:text-pcnGreen">
              {event.name}
            </span>
            <span className="shrink-0 text-muted-foreground max-sm:hidden">
              · {formatDate(event.date)}
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1 text-pcnGreen">
              ver evento
              <ArrowUpRight className="size-3.5" />
            </span>
          </Link>
          {event.photos.length > 0 && (
            <div className="border-t border-pcnGreen-200 p-2">
              <div
                className={cn(
                  'grid gap-1.5',
                  event.photos.length < COLUMNS
                    ? GRID_COLUMNS[event.photos.length]
                    : 'grid-cols-2 sm:grid-cols-4',
                )}
              >
                {shownPhotos(event.photos).map((photo, index) => (
                  <Link
                    key={photo.id}
                    href={`/galeria/${photo.id}?evento=${event.id}`}
                    className={cn(
                      'block aspect-4/3 overflow-hidden border border-pcnGreen-200 transition-colors hover:border-pcnGreen',
                      // Phones show two rows of two.
                      index >= COLUMNS && 'max-sm:hidden',
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbUrl}
                      alt={photo.description ?? `Foto de ${event.name}`}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </Link>
                ))}
              </div>
              <Link
                href={`/galeria?evento=${event.id}`}
                className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-pcnGreen"
              >
                <Images className="size-3.5" />
                ver {event.photoCount === 1 ? 'la foto' : `las ${event.photoCount} fotos`} en la
                galería
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
