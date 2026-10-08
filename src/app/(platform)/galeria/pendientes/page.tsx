import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { PendingGalleryReview } from '@/components/photo-gallery/pending-gallery-review';
import { requireAdminPage } from '@/lib/admin';
import { listPendingGalleryItems } from '@/lib/gallery';

export const metadata = { title: 'ls ~/galeria/pendientes' };

// The photos members uploaded, waiting for an admin to publish or reject them.
export default async function PendingGalleryPage() {
  await requireAdminPage();
  const items = await listPendingGalleryItems();

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path={[{ label: 'galeria', href: '/galeria' }, { label: 'pendientes' }]}
            meta={`${items.length} ${items.length === 1 ? 'foto' : 'fotos'} para revisar`}
          />
        </StickyHeader>

        <PendingGalleryReview items={items} />
      </div>
    </div>
  );
}
