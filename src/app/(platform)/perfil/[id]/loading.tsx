import { ProfileTabSkeleton } from '@/components/profile/profile-tab-skeleton';
import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors the page: the `~/miembros/<name>` title, then on large screens the bordered profile
// card on the left (avatar and name, socials, slogan, badges, work, languages) and the tab strip
// over the summary tab on the right; stacked on phones.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-64 max-w-[60vw]" meta={false} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
            <div className="flex items-center gap-3 p-4">
              <Skeleton className="h-12 w-12 shrink-0" />
              <TextLineSkeleton lineClassName="h-6" className="h-4 w-40" />
            </div>
            <div className="flex divide-x divide-pcnGreen-200">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-1 justify-center py-2.5">
                  <Skeleton className="size-4" />
                </div>
              ))}
            </div>
            <div className="p-4">
              <TextLineSkeleton lineClassName="h-6" className="h-3.5 w-full" />
              <TextLineSkeleton lineClassName="h-6" className="h-3.5 w-2/3" />
            </div>
            <div className="p-4">
              <TextLineSkeleton lineClassName="mb-3 h-4" className="w-20" />
              <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-[69px] w-[60px] rounded-none [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4">
              <TextLineSkeleton lineClassName="mb-2 h-4" className="w-20" />
              <div className="border-l-2 border-pcnGreen-200 pl-3">
                <TextLineSkeleton lineClassName="h-5" className="h-3.5 w-1/2" />
                <TextLineSkeleton className="w-1/3" />
              </div>
            </div>
            <div className="p-4">
              <TextLineSkeleton lineClassName="mb-2 h-4" className="w-24" />
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-16" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-2">
          <div className="mb-4 py-px">
            <Skeleton className="h-8 w-full" />
          </div>
          <ProfileTabSkeleton tab="resumen" />
        </div>
      </div>
    </div>
  );
}
