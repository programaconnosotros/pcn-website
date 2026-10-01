import { notFound, redirect } from 'next/navigation';
import { Gallery } from '@/components/photo-gallery/gallery';
import { getAdminUser } from '@/lib/admin';
import { listGalleryItems } from '@/lib/gallery';
import prisma from '@/lib/prisma';

export default async function PhotoGallery(props: {
  searchParams: Promise<{ foto?: string; evento?: string }>;
}) {
  const { foto, evento } = await props.searchParams;

  // Links from the old static gallery: `/galeria?foto=<n>`.
  if (foto) {
    const legacyId = Number.parseInt(foto, 10);
    const photo = Number.isNaN(legacyId)
      ? null
      : await prisma.galleryItem.findUnique({ where: { legacyId }, select: { id: true } });
    redirect(photo ? `/galeria/${photo.id}` : '/galeria');
  }

  const event = evento
    ? await prisma.event.findFirst({
        where: { id: evento, deletedAt: null },
        select: { id: true, name: true },
      })
    : null;
  if (evento && !event) notFound();

  const [photos, admin] = await Promise.all([
    listGalleryItems({ eventId: event?.id }),
    getAdminUser(),
  ]);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <Gallery photos={photos} event={event} canUpload={!!admin} />
    </div>
  );
}
