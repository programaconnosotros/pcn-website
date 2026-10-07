import { fetchEvents } from '@/actions/events/fetch-events';
import { FlyerFrame } from '@/components/events/flyer-frame';
import { LocalShortDate } from '@/components/ui/local-date-time';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type EventWithCount = Awaited<ReturnType<typeof fetchEvents>>[number];

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

// A past event as a piece in the museum: the flyer hangs in full color on its mat, with a plaque
// (catalog number, date, place and what the night left behind) underneath.
export const EventExhibit: React.FC<{
  event: EventWithCount;
  /** Its Nº among every event; left out where it isn't known, like a profile. */
  catalogNumber?: number;
}> = ({ event, catalogNumber }) => {
  const location = event.isOnline ? 'online' : (event.placeName ?? event.city);
  const memories = [
    event._count.registrations > 0 && plural(event._count.registrations, 'inscripto', 'inscriptos'),
    event._count.talks > 0 && plural(event._count.talks, 'charla', 'charlas'),
    event._count.galleryItems > 0 && plural(event._count.galleryItems, 'foto', 'fotos'),
  ].filter(Boolean);

  return (
    <Link
      href={`/eventos/${event.id}`}
      className={cn(ruledCellClassName, 'group flex flex-col gap-3 p-3 sm:gap-4 sm:p-5')}
    >
      {/* The mat: a quiet margin around the flyer, like a framed print on a wall. */}
      <div className="bg-pcnGreen/[0.03] p-2 transition-colors group-hover:bg-pcnGreen/[0.07] sm:p-4">
        <FlyerFrame
          src={event.flyerImages[0]}
          alt={`Flyer de ${event.name}`}
          className="aspect-[4/5] w-full shadow-md ring-1 ring-black/10 group-hover:shadow-xl dark:ring-white/10"
        />
      </div>

      <div className="flex flex-col gap-1 border-l-2 border-pcnGreen-200 pl-2.5 transition-colors group-hover:border-pcnGreen sm:pl-3">
        {catalogNumber !== undefined && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-pcnGreen-500 sm:text-[11px]">
            Nº {String(catalogNumber).padStart(3, '0')}
          </p>
        )}
        <h3 className="line-clamp-2 font-mono text-sm font-semibold leading-snug group-hover:text-pcnGreen">
          {event.name}
        </h3>
        <p className="font-mono text-[11px] text-muted-foreground sm:text-xs">
          <LocalShortDate date={event.date} />
          {location && <span className="max-sm:hidden"> · {location}</span>}
        </p>
        {memories.length > 0 && (
          <p className="font-mono text-[10px] text-muted-foreground/70 sm:text-[11px]">
            {memories.join(' · ')}
          </p>
        )}
      </div>
    </Link>
  );
};
