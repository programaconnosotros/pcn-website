import { Skeleton } from '@/components/ui/skeleton';
import { TableOfContentsSkeleton } from '@/components/skeletons/event-skeletons';
import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { cn } from '@/lib/utils';

// Mirrors SpecialtyCard: icon and summary, then the bulleted sections.
function SpecialtySkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 pt-1">
          <Skeleton className="h-4 w-48 max-w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      </div>
      <div className="mt-5 space-y-5">
        {[4, 6].map((items, i) => (
          <div key={i}>
            <Skeleton className="h-2.5 w-28" />
            <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {Array.from({ length: items }).map((_, j) => (
                <Skeleton key={j} className={cn('h-3.5', j % 2 ? 'w-3/4' : 'w-5/6')} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-48" meta="w-48" />

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <TableOfContentsSkeleton />

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-3xl space-y-8 pt-4 lg:pt-6">
              {[2, 1].map((cards, i) => (
                <section key={i}>
                  <div className="mb-2 space-y-2">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
                    {Array.from({ length: cards }).map((_, j) => (
                      <SpecialtySkeleton key={j} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
