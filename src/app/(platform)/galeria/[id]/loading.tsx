import { ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Same frame as the photo page: the media pane on the left and its info on the right, so moving
// to a photo doesn't flash the gallery grid first.
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-4 flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-56" />
        <div className="flex gap-1.5">
          <Skeleton className="size-8 rounded-sm" />
          <Skeleton className="size-8 rounded-sm" />
        </div>
      </div>

      <div className="mb-14 grid grid-cols-1 divide-y divide-pcnGreen-200 border border-pcnGreen-200 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:divide-x lg:divide-y-0">
        <div className="relative flex min-h-[50vh] items-center justify-center bg-black lg:min-h-[calc(100dvh-10rem)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,244,190,0.06),transparent_70%)]"
          />
          <div className="flex flex-col items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <ImageIcon className="size-6 animate-pulse text-pcnGreen-600" aria-hidden />
            <span>
              <span className="text-pcnGreen-500">$ </span>cargando foto
              <span className="animate-pulse text-pcnGreen">▍</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-pcnGreen-200">
          {[3, 1, 2].map((rows, section) => (
            <div key={section} className="space-y-2 p-3">
              <Skeleton className="h-3 w-16" />
              {Array.from({ length: rows }).map((_, row) => (
                <Skeleton key={row} className="h-4 w-full max-w-56" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
