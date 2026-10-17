import { PhotoCard } from '@/components/photo-gallery/photo-card';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { listLatestGalleryItems } from '@/lib/gallery';
import { cn } from '@/lib/utils';
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
            Últimas <span className="text-pcnGreen">fotos</span>
          </>
        }
        description="Momentos de meetups, conferencias y encuentros de la comunidad."
        action={{ label: 'Ver toda la galería', href: '/galeria' }}
      />

      {/* Same tiles as /galeria, so the photos look and behave the same in both places. */}
      <RuledGrid className="grid-cols-2 sm:grid-cols-4">
        {items.map((item, index) => (
          <div key={item.id} className={cn(ruledCellClassName, 'p-1')}>
            <PhotoCard
              photo={item}
              index={index}
              total={items.length}
              href={`/galeria/${item.id}`}
            />
          </div>
        ))}
      </RuledGrid>
    </section>
  );
};
