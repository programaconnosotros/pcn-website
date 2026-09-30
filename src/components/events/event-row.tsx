import { EventStatusBadge } from '@/components/events/event-status-badge';
import { fetchEvents } from '@/actions/events/fetch-events';
import { LocalDate, LocalTime } from '@/components/ui/local-date-time';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type EventWithCount = Awaited<ReturnType<typeof fetchEvents>>[number];

export const EventRow: React.FC<{ event: EventWithCount; className?: string }> = ({
  event,
  className,
}) => {
  const isFull =
    event.markedAsFull || (event.capacity !== null && event._count.registrations >= event.capacity);
  const flyer = event.flyerImages[0];
  const location = event.isOnline
    ? 'online'
    : [event.placeName, event.city].filter(Boolean).join(', ');

  return (
    <Link
      href={`/eventos/${event.id}`}
      className={cn(ruledCellClassName, 'group flex gap-3 p-3', className)}
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-pcnGreen-200 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flyer ?? '/logo.webp'}
          alt={event.name}
          className={cn('h-full w-full object-cover object-top', !flyer && 'p-3 opacity-30')}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 font-mono text-sm">
          <h2 className="truncate font-semibold group-hover:text-pcnGreen">{event.name}</h2>
          <span className="ml-auto flex shrink-0 items-center gap-1">
            <EventStatusBadge date={event.date} endDate={event.endDate} isFull={isFull} />
            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-pcnGreen" />
          </span>
        </div>

        {event.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}

        <p className="truncate font-mono text-[11px] text-muted-foreground/70">
          <span className="text-pcnGreen-500">$ </span>
          <LocalDate date={event.date} /> <LocalTime date={event.date} />
          {location && ` · ${location}`}
        </p>
      </div>
    </Link>
  );
};
