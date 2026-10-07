import { EventFormSkeleton } from '@/components/skeletons/event-skeletons';
import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton
          meta={false}
          titleClassName="w-72"
          action={<Skeleton className="h-8 w-28" />}
        />
        <EventFormSkeleton />
      </div>
    </div>
  );
}
