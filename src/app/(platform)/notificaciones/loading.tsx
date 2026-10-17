import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors the page: title, then the bordered inbox, a `// sin leer` header (with its "mark all"
// button) over divided notification rows.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-48" />
        <div className="mb-14 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <TextLineSkeleton className="w-32" />
            <Skeleton className="h-6 w-28" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex h-5 items-center gap-2">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="ml-auto h-2.5 w-20" />
                </div>
                <TextLineSkeleton lineClassName="h-5" className="w-5/6" />
                <TextLineSkeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-6 w-6 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
