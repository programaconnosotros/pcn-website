import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const SectionTitle = () => (
  <div className="mb-3 flex h-5 items-center">
    <Skeleton className="h-3.5 w-52" />
  </div>
);

const Paragraph = ({ lines }: { lines: string[] }) => (
  <div className="mb-4 max-w-3xl space-y-2">
    {lines.map((width, i) => (
      <Skeleton key={i} className={`h-3.5 ${width}`} />
    ))}
  </div>
);

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        {/* Title with its meta, and the WhatsApp group / GitHub buttons. */}
        <div className="flex items-start justify-between gap-4">
          <PageTitleSkeleton titleClassName="w-44" className="flex-1" />
          <div className="flex flex-wrap justify-end gap-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          {/* Index: a prompt bar with prev/next on phones, a sticky `tree` pane on desktop. */}
          <div className="-mx-4 border-b border-pcnGreen-200 px-4 py-2 lg:hidden">
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-8 shrink-0 rounded-none" />
              <Skeleton className="h-8 flex-1 rounded-none" />
              <Skeleton className="size-8 shrink-0 rounded-none" />
            </div>
            <Skeleton className="mt-2 h-1 w-full rounded-none" />
          </div>
          <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 flex-col border border-pcnGreen-200 lg:flex">
            <div className="flex h-[33px] items-center justify-between border-b border-pcnGreen-200 px-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-10" />
            </div>
            <div className="border-b border-pcnGreen-200 px-3 py-2">
              <Skeleton className="h-2 w-full rounded-none" />
            </div>
            <div className="flex flex-col gap-2.5 px-2 py-3">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={`ml-6 h-3 ${['w-40', 'w-32', 'w-44', 'w-28'][i % 4]}`}
                />
              ))}
            </div>
          </aside>

          <div className="min-w-0 flex-1 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
            {/* Architecture: term / detail definition list. */}
            <section className="p-4">
              <SectionTitle />
              <div className="grid gap-x-4 gap-y-2 sm:grid-cols-[200px_1fr]">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="contents">
                    <Skeleton className="h-3 w-28" />
                    <div className="space-y-1.5 pb-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Architecture diagrams: intro, then the first diagram. */}
            <section className="p-4">
              <SectionTitle />
              <Paragraph lines={['w-full', 'w-full', 'w-2/3']} />
              <Skeleton className="mb-2 h-3.5 w-48" />
              <Paragraph lines={['w-full', 'w-1/2']} />
              <Skeleton className="h-80 w-full rounded-none" />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
