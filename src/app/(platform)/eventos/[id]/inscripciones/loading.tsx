import { Skeleton } from '@/components/ui/skeleton';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { cn } from '@/lib/utils';

// A bordered block under a `// title` bar, like the page's sections.
function PanelSkeleton({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('border border-pcnGreen-200', className)}>
      <div className="flex h-8 items-center border-b border-pcnGreen-200 px-3">
        <Skeleton className={cn('h-3', title)} />
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton meta={false} titleClassName="w-80" />

        <RuledGrid className="mb-4 grid-cols-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'space-y-2 p-3')}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-3 w-28 max-w-full" />
            </div>
          ))}
        </RuledGrid>

        <PanelSkeleton title="w-56" className="mb-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {['w-24', 'w-28', 'w-32', 'w-24'].map((width, i) => (
                <Skeleton key={i} className={cn('h-8', width)} />
              ))}
            </div>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-[140px] w-full" />
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </PanelSkeleton>

        <PanelSkeleton title="w-44" className="mb-14">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="overflow-hidden rounded-md border">
              <div className="flex h-8 items-center gap-6 border-b px-3">
                {['w-16', 'w-24', 'w-28', 'w-14', 'w-16'].map((width, i) => (
                  <Skeleton key={i} className={cn('h-2.5', width, i > 2 && 'max-sm:hidden')} />
                ))}
              </div>
              <div className="divide-y">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex h-12 items-center gap-6 px-3">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-44" />
                    <Skeleton className="h-3 flex-1" />
                    <Skeleton className="h-5 w-16 max-sm:hidden" />
                    <Skeleton className="h-3 w-20 max-sm:hidden" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PanelSkeleton>
      </div>
    </div>
  );
}
