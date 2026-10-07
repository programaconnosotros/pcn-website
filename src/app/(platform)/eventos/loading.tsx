import { Skeleton } from '@/components/ui/skeleton';
import { EventsListSkeleton } from '@/components/skeletons/event-skeletons';
import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <PageTitleSkeleton titleClassName="w-32" meta="w-52" className="mb-0 flex-1" />
          <Skeleton className="h-4 w-36" />
        </div>
        <EventsListSkeleton />
      </div>
    </div>
  );
}
