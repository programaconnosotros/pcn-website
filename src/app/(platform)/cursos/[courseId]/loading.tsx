import { CourseRowSkeleton, PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

const SectionHeading = () => (
  <div className="mb-2 flex h-4 items-center gap-2">
    <Skeleton className="h-2.5 w-28" />
    <Skeleton className="h-2.5 w-36" />
    <div className="h-px flex-1 bg-pcnGreen-200" />
  </div>
);

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-60" />

        {/* Video player beside the course info and the list of classes. */}
        <div className="grid border border-pcnGreen-200 lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)]">
          <div className="border-b border-pcnGreen-200 p-4 lg:border-r lg:border-b-0">
            <Skeleton className="aspect-video w-full rounded-none" />
          </div>
          <div className="flex flex-col divide-y divide-pcnGreen-200">
            <div className="flex gap-3 p-4">
              <Skeleton className="size-9 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-2/3" />
                </div>
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
            <div className="p-4">
              <Skeleton className="mb-3 h-2.5 w-24" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex h-[30px] items-center gap-2 px-2">
                  <Skeleton className="size-3" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-10">
          <SectionHeading />
          <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CourseRowSkeleton key={i} />
            ))}
          </RuledGrid>
        </section>

        {/* Related articles. */}
        <section className="mt-8 mb-14">
          <SectionHeading />
          <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 border-r border-b border-pcnGreen-200 p-3">
                <Skeleton className="size-9 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
              </div>
            ))}
          </RuledGrid>
        </section>
      </div>
    </div>
  );
}
