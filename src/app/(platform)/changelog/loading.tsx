import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

// Two days of changes, as the log groups them.
const DAYS = [4, 3];

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-36" />

        {/* Search and count share one row, even on phones. */}
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-8 w-full max-w-md" />
          <Skeleton className="ml-auto h-3 w-20 shrink-0" />
        </div>

        <div className="mb-14 space-y-6">
          {DAYS.map((entries, day) => (
            <section key={day}>
              <div className="mb-2 flex h-4 items-center gap-2">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-2.5 w-44 max-sm:hidden" />
                <div className="h-px flex-1 bg-pcnGreen-200" />
                <Skeleton className="h-2.5 w-6" />
              </div>
              <RuledGrid className="grid-cols-1 lg:grid-cols-2">
                {Array.from({ length: entries }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 border-b border-r border-pcnGreen-200 p-3"
                  >
                    <div className="flex h-[18px] items-center gap-2">
                      <Skeleton className="h-[18px] w-16" />
                      <Skeleton className="ml-auto h-2.5 w-24" />
                    </div>
                    <div className="flex h-[22px] items-center">
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                    <div className="space-y-1.5 py-0.5">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-2/3" />
                    </div>
                  </div>
                ))}
              </RuledGrid>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
