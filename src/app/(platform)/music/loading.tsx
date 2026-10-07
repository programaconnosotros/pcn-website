import {
  PageTitleSkeleton,
  SectionLabelSkeleton,
  TextLineSkeleton,
} from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Mirrors the page: title, then the radios and the external playlists, each a labelled ruled
// grid of video thumbnails with their title and channel.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-28" />
      </div>
      <div className="mb-6">
        {Array.from({ length: 2 }).map((_, section) => (
          <section key={section} className="mb-8">
            <SectionLabelSkeleton className="w-48" />
            <RuledGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cn(ruledCellClassName, 'flex flex-col gap-2 p-3')}>
                  <Skeleton className="aspect-video w-full" />
                  <TextLineSkeleton className="w-2/3" />
                  <TextLineSkeleton lineClassName="-mt-1 h-4" className="h-2.5 w-1/3" />
                </div>
              ))}
            </RuledGrid>
          </section>
        ))}
      </div>
    </div>
  );
}
