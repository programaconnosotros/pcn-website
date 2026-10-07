import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const FieldSkeleton = ({ className }: { className?: string }) => (
  <div className={className}>
    <TextLineSkeleton lineClassName="mb-1.5 h-3" className="h-2.5 w-20" />
    <Skeleton className="h-9 w-full rounded-none" />
  </div>
);

const SectionHeaderSkeleton = () => (
  <div className="flex h-9 items-center justify-between gap-4 border-b border-pcnGreen-200 px-4">
    <Skeleton className="h-3.5 w-40" />
    <Skeleton className="h-3 w-8" />
  </div>
);

// The profile form: the `whoami` preview aside and the form's sections in one bordered column.
export default function Loading() {
  return (
    <div className="mt-4 px-4 md:px-10">
      <PageTitleSkeleton titleClassName="w-24" />

      <div className="grid gap-4 pb-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
          <div className="flex items-center justify-between px-4 py-2">
            <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-16" />
            <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-8" />
          </div>
          <div className="flex gap-4 p-4 lg:flex-col">
            <Skeleton className="h-32 w-32 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <TextLineSkeleton lineClassName="h-6" className="h-4 w-36" />
              <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-44" />
              <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-28" />
            </div>
          </div>
          <div className="space-y-1 p-4">
            <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-full" />
            <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-full" />
          </div>
          <div className="hidden space-y-2 px-4 py-3 lg:block">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-28" />
            ))}
          </div>
        </div>

        <div className="min-w-0 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
          <section>
            <SectionHeaderSkeleton />
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <FieldSkeleton key={i} />
              ))}
              <div className="col-span-full">
                <TextLineSkeleton lineClassName="mb-1.5 h-3" className="h-2.5 w-20" />
                <Skeleton className="h-20 w-full rounded-none" />
              </div>
            </div>
          </section>
          <section>
            <SectionHeaderSkeleton />
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
          </section>
          <section>
            <SectionHeaderSkeleton />
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
