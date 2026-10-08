import { HomeSectionSkeleton } from '@/components/home/home-section-skeleton';
import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors the home page, the one this boundary loads: the full-bleed hero (title, prompt line,
// heading, terminal copy and buttons beside the stats panel), the partners strip, and the first
// sections with the same skeletons the page streams them in behind.
const Loading = () => (
  <div className="-mx-1 md:-mx-6">
    <section className="mx-auto max-w-6xl px-6 pt-3 pb-10 md:pb-14 lg:px-8">
      <PageTitleSkeleton titleClassName="w-6" meta="w-20" className="mb-0" />
      <div className="grid items-center gap-8 pt-6 md:pt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
        <div>
          <TextLineSkeleton lineClassName="h-5 max-md:hidden" className="w-96 max-w-full" />
          <div className="flex flex-col gap-2 py-1 md:mt-4">
            <Skeleton className="h-8 w-56 sm:h-9 sm:w-64 lg:h-10 lg:w-72" />
            <Skeleton className="h-8 w-64 sm:h-9 sm:w-80 lg:h-10 lg:w-96" />
          </div>
          <div className="mt-5 max-w-xl space-y-1 border-l border-pcnGreen-200 pl-4">
            {['w-3/4', 'w-2/3', 'w-5/6'].map((width) => (
              <TextLineSkeleton key={width} lineClassName="h-5" className={width} />
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Skeleton className="h-11 w-44" />
            <Skeleton className="h-11 w-44" />
          </div>
          <TextLineSkeleton lineClassName="mt-6 h-4" className="h-2.5 w-48" />
        </div>

        <div className="overflow-hidden rounded-lg border border-pcnGreen-400">
          <div className="border-b border-pcnGreen-200 px-4 py-3">
            <TextLineSkeleton className="h-2.5 w-40" />
          </div>
          <div className="grid grid-cols-2 gap-px bg-pcnGreen-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-background p-4 md:p-5">
                <TextLineSkeleton lineClassName="h-9 md:h-10" className="h-7 w-20 md:h-8" />
                <TextLineSkeleton lineClassName="mt-1.5 h-4" className="h-2.5 w-24" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-pcnGreen-200 px-5 py-3.5">
            <TextLineSkeleton className="w-52" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
      </div>
    </section>

    <section className="border-y border-pcnGreen-200 bg-pcnGreen-50 py-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <TextLineSkeleton className="h-2.5 w-28" />
          <TextLineSkeleton className="w-20" />
        </div>
        <div className="flex h-16 items-center gap-14 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-32 shrink-0" />
          ))}
        </div>
      </div>
    </section>

    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 md:gap-16 md:py-14 lg:px-8">
      <HomeSectionSkeleton
        cells={2}
        gridClassName="grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
        cellClassName="h-72"
      />
      <HomeSectionSkeleton
        cells={6}
        gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        cellClassName="h-24"
      />
    </div>
  </div>
);

export default Loading;
