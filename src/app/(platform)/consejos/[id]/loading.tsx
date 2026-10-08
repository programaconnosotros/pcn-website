import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-56" action={<Skeleton className="h-4 w-40" />} />

        {/* The terminal reader: path bar with its key caps, the consejo and the comments. */}
        <div className="mx-auto mb-14 w-full max-w-3xl border border-pcnGreen-200 bg-black/40">
          <div className="flex items-center gap-3 border-b border-dashed border-pcnGreen-200 py-2 pr-2 pl-3">
            <Skeleton className="h-3 w-40" />
            <div className="ml-auto flex shrink-0 gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="size-7" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex h-4 items-center gap-2">
              <Skeleton className="h-2.5 w-44" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <div className="flex h-5 items-center">
              <Skeleton className="h-3 w-32" />
            </div>

            {/* Numbered lines, one per sentence. */}
            <div className="border-l border-pcnGreen-200">
              {['w-full', 'w-5/6', 'w-3/4'].map((width) => (
                <div key={width} className="flex h-[33px] items-center gap-3 pl-3">
                  <Skeleton className="h-2.5 w-3 shrink-0" />
                  <Skeleton className={`h-4 ${width}`} />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-dashed border-pcnGreen-200 pt-4">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="size-5" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="ml-auto h-6 w-10" />
            </div>

            <div className="-mx-5 border-t border-dashed border-pcnGreen-200 sm:-mx-6">
              <div className="flex h-8 items-center border-b border-pcnGreen-200 px-3">
                <Skeleton className="h-2.5 w-28" />
              </div>
              <div className="p-3">
                <Skeleton className="h-[72px] w-full" />
                <Skeleton className="mt-2 h-8 w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
