import type { Metadata } from 'next';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RecommendationReview } from '@/components/recommendations/recommendation-review';
import { requireAdminPage } from '@/lib/admin';
import { listRecommendationsForReview } from '@/lib/recommendations';
import { tabTitle } from '@/lib/tab-title';

export const metadata: Metadata = {
  title: tabTitle.sudo('admin/recomendaciones'),
  robots: { index: false, follow: false },
};

// The articles, books, courses and videos members recommended, waiting for an admin to publish
// or reject them (and every published one, to correct or take down).
export default async function RecommendationsReviewPage() {
  await requireAdminPage();
  const items = await listRecommendationsForReview();
  const pending = items.filter((item) => item.status === 'PENDING').length;

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path={[{ label: 'admin', href: '/admin' }, { label: 'recomendaciones' }]}
            meta={`${pending} para revisar · ${items.length - pending} revisadas`}
          />
        </StickyHeader>

        <RecommendationReview items={items} />
      </div>
    </div>
  );
}
