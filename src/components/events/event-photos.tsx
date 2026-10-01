import Link from 'next/link';
import { VideoBadge } from '@/components/photo-gallery/video-badge';
import { galleryImageUrl } from '@/lib/gallery-urls';

type EventPhoto = { id: string; kind: 'PHOTO' | 'VIDEO'; description: string | null };

type EventPhotosProps = {
  eventId: string;
  photos: EventPhoto[];
  total: number;
  canUpload: boolean;
};

// Thumbnails of the event's photos, each opening the photo's page in the gallery (browsing
// stays within the event), plus links to all of them and, for admins, to upload more.
export function EventPhotos({ eventId, photos, total, canUpload }: EventPhotosProps) {
  return (
    <>
      {photos.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground">Todavía no hay fotos ni videos.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <Link
              key={photo.id}
              href={`/galeria/${photo.id}?evento=${eventId}`}
              className="group relative aspect-square overflow-hidden rounded-sm bg-black"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={galleryImageUrl(photo.id)}
                alt={
                  photo.description ??
                  `${photo.kind === 'VIDEO' ? 'Video' : 'Foto'} ${index + 1} del evento`
                }
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04] group-hover:opacity-90"
              />
              {photo.kind === 'VIDEO' && <VideoBadge />}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap justify-end gap-x-4 font-mono text-xs">
        {canUpload && (
          <Link
            href={`/galeria/subir?evento=${eventId}`}
            className="text-muted-foreground hover:text-pcnGreen"
          >
            subir fotos y videos →
          </Link>
        )}
        {total > 0 && (
          <Link
            href={`/galeria?evento=${eventId}`}
            className="text-pcnGreen-700 hover:text-pcnGreen"
          >
            ver {total === 1 ? 'todo' : `los ${total}`} en la galería →
          </Link>
        )}
      </div>
    </>
  );
}
