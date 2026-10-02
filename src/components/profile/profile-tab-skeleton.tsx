import { Skeleton } from '@/components/ui/skeleton';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import type { ProfileTab } from './profile-tabs';

const RowsSkeleton = ({ rows }: { rows: number }) => (
  <RuledGrid className="grid-cols-1">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={cn(ruledCellClassName, 'flex gap-3 p-3')}>
        <Skeleton className="size-12 shrink-0" />
        <div className="flex flex-1 flex-col gap-2 py-0.5">
          <Skeleton className="h-3.5 w-2/5" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-2.5 w-1/4" />
        </div>
      </div>
    ))}
  </RuledGrid>
);

const HeadingSkeleton = () => (
  <div className="mb-2 flex items-center gap-2">
    <Skeleton className="h-3 w-24" />
    <span className="h-px flex-1 bg-pcnGreen-200" />
  </div>
);

/** Placeholder for a profile tab while its content streams in. */
export function ProfileTabSkeleton({ tab }: { tab: ProfileTab }) {
  return (
    <div className="mb-14 space-y-8" aria-busy aria-label="Cargando">
      {tab === 'resumen' ? (
        <>
          <RuledGrid className="grid-cols-2 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn(ruledCellClassName, 'space-y-2 px-3 py-2.5')}>
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </RuledGrid>
          {Array.from({ length: 2 }).map((_, i) => (
            <section key={i}>
              <HeadingSkeleton />
              <RowsSkeleton rows={2} />
            </section>
          ))}
        </>
      ) : tab === 'fotos' ? (
        <RuledGrid className="grid-cols-3 sm:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'p-1')}>
              <Skeleton className="aspect-square w-full" />
            </div>
          ))}
        </RuledGrid>
      ) : tab === 'contribuciones' ? (
        <RuledGrid className="grid-cols-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'space-y-2 px-3 py-2.5')}>
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </RuledGrid>
      ) : (
        <RowsSkeleton rows={4} />
      )}
    </div>
  );
}
