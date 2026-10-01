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

  // Links from the old static gallery: `/galeria?foto=<n>`.
  if (typeof searchParams.foto === 'string') {
    const legacyId = Number.parseInt(searchParams.foto, 10);
    const item = Number.isNaN(legacyId)
      ? null
      : await prisma.galleryItem.findUnique({ where: { legacyId }, select: { id: true } });
    redirect(item ? `/galeria/${item.id}` : '/galeria');
  }

  const filter = parseGalleryFilter(searchParams);
  const [items, options, admin] = await Promise.all([
    listGalleryItems(filter),
    getGalleryFilterOptions(),
    getAdminUser(),
  ]);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <Gallery items={items} filter={filter} options={options} canUpload={!!admin} />
    </div>
  );
}
