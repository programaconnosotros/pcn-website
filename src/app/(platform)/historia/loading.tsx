import { Skeleton } from '@/components/ui/skeleton';
import { TableOfContentsSkeleton } from '@/components/skeletons/event-skeletons';
import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';

function ParagraphSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? 'h-3.5 w-2/3' : 'h-3.5 w-full'} />
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-32" meta="w-96" />

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <TableOfContentsSkeleton />

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-3xl border border-pcnGreen-200">
              {/* The tagging bar above the story. */}
              <div className="flex h-8 items-center border-b border-dashed border-pcnGreen-200 px-4">
                <Skeleton className="h-3 w-48" />
              </div>

              <div className="border-b border-pcnGreen-200 p-4">
                <Skeleton className="h-5 w-40" />
                <div className="mt-4 space-y-4">
                  <ParagraphSkeleton lines={4} />
                  <ParagraphSkeleton lines={3} />
                </div>
                <Skeleton className="mt-5 h-3 w-3/4" />
              </div>

              <div className="divide-y divide-pcnGreen-200">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-5 w-52" />
                    </div>
                    <ParagraphSkeleton lines={4} />
                    <Skeleton className="mx-auto mt-4 aspect-video w-full max-w-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
