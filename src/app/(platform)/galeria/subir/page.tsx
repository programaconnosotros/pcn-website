import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { PhotoUploader } from '@/components/photo-gallery/photo-uploader';
import { requireAdminPage } from '@/lib/admin';
import prisma from '@/lib/prisma';

export const metadata = { title: 'Subir fotos y videos' };

export default async function UploadPhotosPage(props: {
  searchParams: Promise<{ evento?: string }>;
}) {
  await requireAdminPage();
  const { evento } = await props.searchParams;

  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, date: true },
    orderBy: { date: 'desc' },
  });
  const defaultEventId = events.some((event) => event.id === evento) ? evento! : null;

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path={[{ label: 'galeria', href: '/galeria' }, { label: 'subir' }]}
            meta="Fotos optimizadas a WebP y videos tal cual, servidos por CloudFront"
          />
        </StickyHeader>

        <PhotoUploader events={events} defaultEventId={defaultEventId} />
      </div>
    </div>
  );
}
