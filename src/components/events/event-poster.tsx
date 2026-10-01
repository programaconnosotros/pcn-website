import { fetchEvents } from '@/actions/events/fetch-events';
import { EventStatusBadge } from '@/components/events/event-status-badge';
import { FlyerFrame } from '@/components/events/flyer-frame';
import { LocalEventDate } from '@/components/ui/local-date-time';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ArrowRight, MapPin, Video } from 'lucide-react';
import Link from 'next/link';

type EventWithCount = Awaited<ReturnType<typeof fetchEvents>>[number];

// An upcoming event as a poster on the billboard: the flyer gets the room, the details sit below.
export const EventPoster: React.FC<{ event: EventWithCount }> = ({ event }) => {
  const isFull =
    event.markedAsFull || (event.capacity !== null && event._count.registrations >= event.capacity);
  const location = event.isOnline
    ? 'online'
    : [event.placeName, event.city].filter(Boolean).join(', ');
  const LocationIcon = event.isOnline ? Video : MapPin;

  return (
    <Link
      href={`/eventos/${event.id}`}
      className={cn(ruledCellClassName, 'group flex flex-col gap-4 p-4')}
    >
      <FlyerFrame
        src={event.flyerImages[0]}
        alt={`Flyer de ${event.name}`}
        className="aspect-[4/5] w-full rounded-sm border border-pcnGreen-200"
      />

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs text-pcnGreen-500">
            <LocalEventDate date={event.date} />
          </p>
          <span className="flex empty:hidden">
            <EventStatusBadge date={event.date} endDate={event.endDate} isFull={isFull} />
          </span>
        </div>

        <h3 className="flex items-start gap-2 font-mono text-lg font-semibold leading-snug group-hover:text-pcnGreen">
          <span className="min-w-0 flex-1">{event.name}</span>
          <ArrowRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-pcnGreen" />
        </h3>

        {event.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}

        {location && (
          <p className="mt-auto flex min-w-0 items-center gap-1.5 pt-1 font-mono text-xs text-muted-foreground/80">
            <LocationIcon className="h-3.5 w-3.5 shrink-0 text-pcnGreen-500" />
            <span className="truncate">{location}</span>
          </p>
        )}
      </div>
    </Link>
  );
};
