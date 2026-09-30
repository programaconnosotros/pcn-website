import {
  PageHeaderSkeleton,
  PageTitleSkeleton,
  TableSkeleton,
} from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton breadcrumbs={4} />
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitleSkeleton />
          <TableSkeleton rows={10} cols={4} />
        </div>
      </div>
    </>
  );
}
