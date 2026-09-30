'use client';

import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { dateContainsString } from '@/lib/date-formatter';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PhotoCard } from './photo-card';
import { PhotoDialog } from './photo-dialog';
import type { Photo } from './photo-utils';
import { photos } from './photos';
import { ShareDialog } from './share-dialog';

// Lowercase without accents, so `tafi` finds `Tafí`.
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

interface GalleryProps {
  initialPhotoId?: number | null;
}

export function Gallery({ initialPhotoId }: GalleryProps) {
  const router = useRouter();
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [sharedPhoto, setSharedPhoto] = useState<Photo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPhotos = useMemo(() => {
    const query = normalize(searchQuery.trim());
    if (!query) return photos;

    return photos.filter(
      (photo) =>
        normalize(photo.title).includes(query) ||
        photo.image.toLowerCase().includes(query) ||
        (photo.date && dateContainsString(photo.date, query)),
    );
  }, [searchQuery]);

  // Tracked by id rather than index so searching doesn't swap the open photo.
  const selectedPhotoIndex = filteredPhotos.findIndex((photo) => photo.id === selectedPhotoId);

  // Open the photo linked from `?foto=<id>`.
  useEffect(() => {
    if (initialPhotoId) setSelectedPhotoId(initialPhotoId);
  }, [initialPhotoId]);

  const openPhoto = (photo: Photo) => {
    router.push(`?foto=${photo.id}`, { scroll: false });
    setSelectedPhotoId(photo.id);
  };

  const handleCloseDialog = () => {
    router.push('/galeria', { scroll: false });
    setSelectedPhotoId(null);
  };

  const getShareUrl = (photoId: number) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/galeria?foto=${photoId}`;
  };

  return (
    <>
      <StickyHeader className="mt-4">
        <PageTitle path="galeria" meta={`${photos.length} fotos de la comunidad`} />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="título, archivo o fecha"
            label="Buscar fotos"
          />
          <p className="font-mono text-xs tabular-nums text-muted-foreground" aria-live="polite">
            {searchQuery.trim() ? (
              <>
                <span className="text-pcnGreen">{filteredPhotos.length}</span>/{photos.length}{' '}
                coincidencias
              </>
            ) : (
              <>
                ls -la <span className="text-pcnGreen-600">./galeria</span>
              </>
            )}
          </p>
        </div>
      </StickyHeader>

      {filteredPhotos.length === 0 ? (
        <p className="border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
          grep: sin coincidencias para{' '}
          <span className="text-pcnGreen">&quot;{searchQuery}&quot;</span>
        </p>
      ) : (
        <RuledGrid className="mb-14 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredPhotos.map((photo, index) => (
            <div key={photo.id} className={cn(ruledCellClassName, 'p-1')}>
              <PhotoCard
                photo={photo}
                index={index}
                total={filteredPhotos.length}
                onOpen={() => openPhoto(photo)}
                onShare={() => setSharedPhoto(photo)}
              />
            </div>
          ))}
        </RuledGrid>
      )}

      {selectedPhotoIndex !== -1 && (
        <PhotoDialog
          photos={filteredPhotos}
          currentPhotoIndex={selectedPhotoIndex}
          isOpen
          onClose={handleCloseDialog}
          onNavigate={(index) => openPhoto(filteredPhotos[index])}
          onShare={setSharedPhoto}
        />
      )}

      {sharedPhoto && (
        <ShareDialog
          isOpen
          onClose={() => setSharedPhoto(null)}
          url={getShareUrl(sharedPhoto.id)}
          title={sharedPhoto.title}
        />
      )}
    </>
  );
}
