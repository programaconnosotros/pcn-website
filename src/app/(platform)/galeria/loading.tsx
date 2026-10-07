import { Skeleton } from '@/components/ui/skeleton';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { PageTitleSkeleton, SearchBarSkeleton } from '@/components/skeletons/page-skeletons';
import { cn } from '@/lib/utils';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton
          titleClassName="w-32"
          meta="w-36"
          action={<Skeleton className="h-8 w-24" />}
        />

        {/* Mirrors CollapsibleFilters: search plus a `filtros` toggle on phones; the type, event
            and person filters on their own row above the search on md+. */}
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
          <div className="flex items-center gap-2 md:contents">
            <div className="min-w-0 flex-1 md:contents">
              <SearchBarSkeleton />
            </div>
            <Skeleton className="h-8 w-24 shrink-0 md:hidden" />
          </div>
          <div className="flex flex-wrap items-center gap-2 max-md:hidden md:order-first md:basis-full">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-8 w-56" />
          </div>
          <Skeleton className="h-3 w-32 max-md:hidden md:ml-auto" />
        </div>

        <RuledGrid className="mb-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'p-1')}>
              <Skeleton className="aspect-square w-full rounded-none" />
            </div>
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
