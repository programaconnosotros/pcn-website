import { notFound } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { PhotoEditForm } from '@/components/photo-gallery/photo-edit-form';
import { photoFileName } from '@/components/photo-gallery/photo-utils';
import { requireAdminPage } from '@/lib/admin';
import { getPhoto } from '@/lib/photos';
import prisma from '@/lib/prisma';

export const metadata = { title: 'Editar foto' };

export default async function EditPhotoPage(props: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await props.params;

  const [photo, events] = await Promise.all([
    getPhoto(id),
    prisma.event.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, date: true },
      orderBy: { date: 'desc' },
    }),
  ]);
  if (!photo) notFound();

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path={[
              { label: 'galeria', href: '/galeria' },
              { label: photoFileName(photo), href: `/galeria/${photo.id}` },
              { label: 'editar' },
            ]}
          />
        </StickyHeader>

        <PhotoEditForm photo={photo} events={events} />
      </div>
    </div>
  );
}
