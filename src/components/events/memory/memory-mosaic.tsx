import Link from 'next/link';
import { Images, Play } from 'lucide-react';
import type { EventMemoryItem } from '@/lib/gallery';
import { formatDuration } from '@/lib/gallery-filters';
import { LocalTime } from '@/components/ui/local-date-time';
import { cn } from '@/lib/utils';

type Shape = 'square' | 'wide' | 'tall' | 'feature';

// Each tile takes the shape of its photo (landscape ones span two columns, portrait ones two
// rows) and every so often a landscape one is blown up, so the grid reads like a photo album
// instead of a contact sheet. `grid-flow-dense` fills the holes the big ones leave.
function shapeOf(item: EventMemoryItem, index: number): Shape {
  if (!item.width || !item.height) return 'square';
  const ratio = item.width / item.height;
  if (ratio > 1.2) return index % 6 === 0 ? 'feature' : 'wide';
  if (ratio < 0.85) return 'tall';
  return 'square';
}

const shapeClassName: Record<Shape, string> = {
  square: '',
  wide: 'col-span-2',
  tall: 'row-span-2',
  feature: 'col-span-2 row-span-2',
};

const tileClassName =
  'group relative overflow-hidden rounded-[3px] bg-black ring-1 ring-inset ring-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pcnGreen';

/**
 * The event's photos and videos as an album: full colour, in the order they were taken, each
 * opening on its page in the gallery (browsing stays within the event). When there are more
 * than fit, the last tile links to all of them.
 */
export function MemoryMosaic({
  eventId,
  items,
  total,
}: {
  eventId: string;
  items: EventMemoryItem[];
  total: number;
}) {
  const remaining = total - items.length;

  return (
    <div className="grid grid-flow-dense auto-rows-[8.5rem] grid-cols-2 gap-1 sm:auto-rows-[10rem] sm:grid-cols-4 lg:grid-cols-6">
      {items.map((item, index) => {
        const isVideo = item.kind === 'VIDEO';
        return (
          <Link
            key={item.id}
            href={`/galeria/${item.id}?evento=${eventId}`}
            className={cn(tileClassName, shapeClassName[shapeOf(item, index)])}
            aria-label={`${isVideo ? 'Video' : 'Foto'} ${index + 1} de ${total}${
              item.description ? `: ${item.description}` : ''
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbUrl}
              alt=""
              loading={index < 6 ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
            />

            {isVideo && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:border-pcnGreen group-hover:text-pcnGreen">
                  <Play className="ml-0.5 size-4 fill-current" />
                </span>
              </span>
            )}

            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pb-1.5 pt-10 font-mono text-[10px] leading-tight text-white/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:hidden"
            >
              <span className="line-clamp-2 min-w-0">{item.description}</span>
              <span className="shrink-0 tabular-nums text-pcnGreen">
                {isVideo && item.durationSeconds !== null && (
                  <>{formatDuration(item.durationSeconds)} · </>
                )}
                <LocalTime date={item.takenAt} />
              </span>
            </span>
          </Link>
        );
      })}

      {remaining > 0 && (
        <Link
          href={`/galeria?evento=${eventId}`}
          className={cn(
            tileClassName,
            'flex flex-col items-center justify-center gap-1 bg-pcnGreen/[0.06] font-mono text-pcnGreen-700 ring-pcnGreen-200 transition-colors hover:bg-pcnGreen/[0.12] hover:text-pcnGreen',
          )}
        >
          <Images className="size-5" />
          <span className="text-2xl font-semibold tabular-nums">+{remaining}</span>
          <span className="text-[10px] text-muted-foreground">ver todo en la galería</span>
        </Link>
      )}
    </div>
  );
}
