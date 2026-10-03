import { PageTitleSkeleton, RuledGridSkeleton } from '@/components/skeletons/page-skeletons';

// Fallback for the pages without a loading.tsx of their own: the shape of a regular page (title
// plus a ruled grid), so the layout shows up right away instead of a full-screen animation.
const Loading = () => (
  <div className="flex flex-1 flex-col p-4 pt-0">
    <div className="mt-4">
      <PageTitleSkeleton />
      <RuledGridSkeleton count={8} />
    </div>
  </div>
);

export default Loading;
