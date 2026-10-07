import { Skeleton } from '@/components/ui/skeleton';

// Same shape as the forum index: title row, then the thread rows next to the categories aside.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="border border-pcnGreen-200">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-pcnGreen-200 px-3 py-3 last:border-b-0"
              >
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="hidden h-3 w-32 sm:block" />
              </div>
            ))}
          </div>
          <Skeleton className="h-72" />
        </div>
      </div>
    </div>
  );
}
