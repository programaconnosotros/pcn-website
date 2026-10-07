import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        {/* Title with its meta, and the RSS link to the right. */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <PageTitleSkeleton titleClassName="w-36" className="mb-0 flex-1" />
          <Skeleton className="h-4 w-10 shrink-0 self-center" />
        </div>

        {/* Announcement cells: category and date, title, body and author. */}
        <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-1.5 border-b border-r border-pcnGreen-200 p-3"
            >
              <div className="flex h-4 items-center gap-2">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="ml-auto h-2.5 w-24" />
              </div>
              <Skeleton className="my-0.5 h-3.5 w-2/3" />
              <div className="space-y-2 py-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-11/12" />
                <Skeleton className="h-3 w-3/5" />
              </div>
              <div className="mt-auto flex items-center gap-1.5 pt-1">
                <Skeleton className="size-4" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
