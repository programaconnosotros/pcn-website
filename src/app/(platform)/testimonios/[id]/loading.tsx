import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { Skeleton } from '@/components/ui/skeleton';

// The bordered testimonial: author row with the back link, the full text and the dates.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-52" meta={false} />
        <div className="mb-14 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
          <div className="flex items-center gap-3 p-3">
            <Skeleton className="h-9 w-9 shrink-0" />
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="ml-auto h-2.5 w-12" />
          </div>
          <div className="p-3">
            {['w-full', 'w-full', 'w-11/12', 'w-full', 'w-2/3'].map((width, i) => (
              <TextLineSkeleton
                key={i}
                lineClassName="h-[1.4375rem]"
                className={`h-3.5 ${width}`}
              />
            ))}
          </div>
          <div className="p-3">
            <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-64 max-w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
