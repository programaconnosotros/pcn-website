import { redirect } from 'next/navigation';
import { Gallery } from '@/components/photo-gallery/gallery';
import { getAdminUser } from '@/lib/admin';
import { getGalleryFilterOptions, listGalleryItems } from '@/lib/gallery';
import { parseGalleryFilter } from '@/lib/gallery-filters';
import prisma from '@/lib/prisma';

export default async function GalleryPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;

  // Links from the old static gallery (`/galeria?foto=<n>`): its photos are no longer shown.
  if (searchParams.foto !== undefined) redirect('/galeria');

  const filter = parseGalleryFilter(searchParams);
  const [items, options, admin] = await Promise.all([
    listGalleryItems(filter),
    getGalleryFilterOptions(),
    getAdminUser(),
  ]);
  // Every event, for the admins' bulk editing (the filters only list the ones with photos).
  const events = admin
    ? await prisma.event.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, date: true },
        orderBy: { date: 'desc' },
      })
    : null;

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <Gallery
        items={items}
        filter={filter}
        options={options}
        canUpload={!!admin}
        events={events}
      />
    </div>
  );
}
