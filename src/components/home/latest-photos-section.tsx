import Link from 'next/link';
import { VideoBadge } from '@/components/photo-gallery/video-badge';
import { photoCaption } from '@/components/photo-gallery/photo-utils';
import { listLatestGalleryItems } from '@/lib/gallery';
import { SectionHeader } from './section-header';

const LATEST_PHOTOS_COUNT = 8;

/** The photos and videos most recently uploaded to the gallery, each opening its page. */
export const LatestPhotosSection = async () => {
  const items = await listLatestGalleryItems(LATEST_PHOTOS_COUNT);

  if (items.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="Galería"
        title={
          <>
            Últimas fotos <span className="text-pcnGreen">subidas</span>
          </>
        }
        description="Momentos de meetups, conferencias y encuentros de la comunidad."
        action={{ label: 'Ver toda la galería', href: '/galeria' }}
      />

      <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/galeria/${item.id}`}
            className="group relative aspect-square overflow-hidden rounded-sm bg-black"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbUrl}
              alt={photoCaption(item)}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover brightness-[0.85] transition duration-300 group-hover:scale-[1.04] group-hover:brightness-100"
            />
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 translate-y-full truncate bg-gradient-to-t from-black via-black/70 to-transparent px-2 pb-1.5 pt-6 font-mono text-[10px] text-pcnGreen transition-transform duration-300 group-hover:translate-y-0"
            >
              {photoCaption(item)}
            </span>
            {item.kind === 'VIDEO' && (
              <VideoBadge className="transition-opacity group-hover:opacity-0" />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};
