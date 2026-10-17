import { CourseRowSkeleton, PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-14">
        <PageTitleSkeleton titleClassName="w-28" />

        {/* `$ grep` and the --all / --pcn / --video / --web flags (a toggle on phones). */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-8 max-w-md min-w-0 flex-1 md:max-w-sm" />
          <Skeleton className="h-8 w-24 shrink-0 md:hidden" />
          {['w-16', 'w-16', 'w-20', 'w-16'].map((width, i) => (
            <Skeleton key={i} className={`h-8 shrink-0 max-md:hidden ${width}`} />
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <RuledGrid className="grid-cols-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-0.5 border-r border-b border-pcnGreen-200 px-3 py-2.5 sm:px-4"
              >
                <div className="flex h-7 items-center sm:h-8">
                  <Skeleton className="h-5 w-12 sm:h-6" />
                </div>
                <div className="flex h-4 items-center">
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
            ))}
          </RuledGrid>

          {/* `hechos en pcn`, then `recomendados`. */}
          {[3, 6].map((count, section) => (
            <section key={section}>
              <div className="mb-2 flex h-4 items-center gap-2">
                <Skeleton className="h-2.5 w-32" />
                <div className="h-px flex-1 bg-pcnGreen-200" />
              </div>
              <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: count }).map((_, i) => (
                  <CourseRowSkeleton key={i} />
                ))}
              </RuledGrid>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
