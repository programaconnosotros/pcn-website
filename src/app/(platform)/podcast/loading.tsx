import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';

// The title and the bordered `$ próximamente...` line under it.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <PageTitleSkeleton titleClassName="w-28" className="mt-4" />
      <div className="border border-pcnGreen-200 p-3">
        <TextLineSkeleton lineClassName="h-5" className="h-3.5 w-36" />
      </div>
    </div>
  );
}
