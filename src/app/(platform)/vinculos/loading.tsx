import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

// The intro paragraph and the identity tables (two side by side from 2xl): a header with the
// command and progress, the filter row, then the numbered rows.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-28" />

        <div className="mb-4 max-w-3xl">
          {['w-full', 'w-full', 'w-full', 'w-full', 'w-1/2'].map((width, i) => (
            <TextLineSkeleton key={i} lineClassName="h-5" className={`h-3 ${width}`} />
          ))}
        </div>

        <div className="mb-14 grid gap-6 2xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <section key={i} className="min-w-0 border border-pcnGreen-200">
              <div className="flex items-center gap-3 border-b border-pcnGreen-200 px-3 py-2">
                <TextLineSkeleton lineClassName="h-4" className="h-3 w-20" />
                <Skeleton className="h-2.5 w-40" />
                <Skeleton className="ml-auto h-2.5 w-24" />
              </div>
              <div className="flex items-center gap-2 border-b border-pcnGreen-200 px-3 py-2">
                <Skeleton className="h-7 min-w-0 flex-1" />
                <Skeleton className="h-7 w-56 max-w-[50%]" />
              </div>
              <div className="flex h-[27px] items-center gap-4 px-3">
                <Skeleton className="h-2 w-4" />
                <Skeleton className="h-2 w-16" />
                <Skeleton className="h-2 w-16" />
                <Skeleton className="ml-auto h-2 w-24" />
              </div>
              {Array.from({ length: 6 }).map((_, row) => (
                <div
                  key={row}
                  className="flex h-9 items-center gap-4 border-t border-pcnGreen-200/60 px-3"
                >
                  <Skeleton className="h-2.5 w-4" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="ml-auto h-5 w-40 max-w-[35%]" />
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
