import type { HistoriaEvent } from '@/lib/historia-events';
import { ArrowUpRight, CalendarDays, Images } from 'lucide-react';
import Link from 'next/link';

const formatDate = (date: Date) =>
  date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });

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
              <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
                {event.photos.map((photo) => (
                  <Link
                    key={photo.id}
                    href={`/galeria/${photo.id}?evento=${event.id}`}
                    className="block aspect-square overflow-hidden border border-pcnGreen-200 transition-colors hover:border-pcnGreen"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbUrl}
                      alt={photo.description ?? `Foto de ${event.name}`}
                      loading="lazy"
                      className="size-full object-cover"
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
