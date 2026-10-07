import { Skeleton } from '@/components/ui/skeleton';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { TabStripSkeleton } from '@/components/skeletons/event-skeletons';
import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { cn } from '@/lib/utils';

// Rows per day; a row with thumbs mirrors a photo or setup post.
const DAYS = [
  [false, true, false],
  [false, false, true, false],
];

function FeedRowSkeleton({ thumbs }: { thumbs: boolean }) {
  return (
    <div className="flex flex-col gap-2 border-b border-r border-pcnGreen-200 p-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-14 rounded-none" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="ml-auto size-3.5" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      {thumbs && (
        <div className="mt-1 grid grid-cols-4 gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      )}
    </div>
  );
}

// Mirrors the aside's `// title` panels.
function PanelSkeleton({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-pcnGreen-200">
      <div className="flex h-8 items-center border-b border-pcnGreen-200 px-3">
        <Skeleton className={cn('h-2.5', title)} />
      </div>
      {children}
    </section>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-24" meta="w-36" />
        <div className="-mx-1 mb-3 overflow-hidden px-1 pb-1">
          <TabStripSkeleton
            tabs={['w-8', 'w-14', 'w-14', 'w-10', 'w-12', 'w-16', 'w-14', 'w-16']}
          />
        </div>

        <div className="flex items-start gap-6">
          <div className="min-w-0 max-w-3xl flex-1">
            <div className="mb-14 space-y-6">
              {DAYS.map((rows, i) => (
                <section key={i}>
                  <div className="mb-2 flex h-4 items-center gap-2">
                    <Skeleton className="h-3 w-20" />
                    <span className="h-px flex-1 bg-gradient-to-r from-pcnGreen-200 to-transparent" />
                    <Skeleton className="h-3 w-6" />
                  </div>
                  <RuledGrid className="grid-cols-1">
                    {rows.map((thumbs, j) => (
                      <FeedRowSkeleton key={j} thumbs={thumbs} />
                    ))}
                  </RuledGrid>
                </section>
              ))}
            </div>
          </div>

          <aside className="sticky top-[calc(var(--sticky-header-offset,0px)+1rem)] mb-14 hidden w-72 shrink-0 flex-col gap-3 xl:flex">
            <PanelSkeleton title="w-28">
              <div className="space-y-2 p-3">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-16" />
              </div>
            </PanelSkeleton>
            <PanelSkeleton title="w-16">
              <div className="divide-y divide-pcnGreen-200">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2 px-3 py-2.5">
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </PanelSkeleton>
            <PanelSkeleton title="w-24">
              <div className="grid grid-cols-2 divide-x divide-y divide-pcnGreen-200">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex h-16 items-center justify-center px-2">
                    <Skeleton className="h-7 w-24" />
                  </div>
                ))}
              </div>
              <div className="border-t border-pcnGreen-200 px-3 py-2">
                <Skeleton className="h-3 w-36" />
              </div>
            </PanelSkeleton>
          </aside>
        </div>
      </div>
    </div>
  );
}
