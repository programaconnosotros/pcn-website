import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mt-4 p-4 pt-0">
      <PageTitleSkeleton titleClassName="w-44" />
      {/* The one-line `coming soon` box. */}
      <div className="flex border border-pcnGreen-200 p-3">
        <div className="flex h-5 items-center">
          <Skeleton className="h-3.5 w-36" />
        </div>
      </div>
    </div>
  );
}
