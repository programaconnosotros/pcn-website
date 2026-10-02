import { PageTitleSkeleton, ProseSkeleton } from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitleSkeleton />
          <ProseSkeleton paragraphs={3} />
        </div>
      </div>
    </>
  );
}
