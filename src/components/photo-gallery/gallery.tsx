'use client';

import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { dateContainsString } from '@/lib/date-formatter';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PhotoCard } from './photo-card';
import { PhotoDialog } from './photo-dialog';
import { photos } from './photos';
import { SearchBar } from './search-bar';

interface GalleryProps {
  initialPhotoId?: number | null;
}

export function Gallery({ initialPhotoId }: GalleryProps) {
  const router = useRouter();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const isDialogOpen = selectedPhotoIndex !== -1;

  // Filter photos based on search query
  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return [...photos];

    const query = searchQuery.toLowerCase().trim();
    return photos.filter(
      (photo) =>
        photo.title.toLowerCase().includes(query) ||
        (photo.date && dateContainsString(photo.date, query)),
    );
  }, [searchQuery]);

  // Use filtered photos
  const sortedPhotos = filteredPhotos;

  // Open photo dialog when initialPhotoId is provided
  useEffect(() => {
    if (initialPhotoId) {
      const photoIndex = sortedPhotos.findIndex((photo) => photo.id === initialPhotoId);
      if (photoIndex !== -1) {
        setSelectedPhotoIndex(photoIndex);
      }
    }
  }, [initialPhotoId, sortedPhotos]);

  const handlePhotoClick = (index: number) => {
    const photo = sortedPhotos[index];
    // Update URL with photo ID
    router.push(`?foto=${photo.id}`, { scroll: false });
    setSelectedPhotoIndex(index);
  };

  const handleCloseDialog = () => {
    // Remove photo ID from URL
    router.push('/galeria', { scroll: false });
    setSelectedPhotoIndex(-1);
  };

  const handleNavigate = (index: number) => {
    const photo = sortedPhotos[index];
    // Update URL with new photo ID
    router.push(`?foto=${photo.id}`, { scroll: false });
    setSelectedPhotoIndex(index);
  };

  const getShareUrl = (photoId: number) => {
    // Create absolute URL for sharing
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/galeria?foto=${photoId}`;
  };

  return (
    <>
      <PageTitle path="galeria" className="mt-4" meta={`${photos.length} fotos de la comunidad`} />

      <div className="mb-4">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Buscar por título o fecha..."
        />
      </div>

      {sortedPhotos.length === 0 ? (
        <p className="py-8 text-center font-mono text-sm text-muted-foreground">
          No se encontraron fotos que coincidan con &quot;{searchQuery}&quot;
        </p>
      ) : (
        <RuledGrid className="mb-14 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {sortedPhotos.map((photo, index) => (
            <div key={photo.id} className={cn(ruledCellClassName, 'cursor-pointer p-1')}>
              <PhotoCard
                photo={photo}
                getShareUrl={getShareUrl}
                onCardClick={() => handlePhotoClick(index)}
              />
            </div>
          ))}
        </RuledGrid>
      )}

      {isDialogOpen && (
        <PhotoDialog
          photos={sortedPhotos}
          currentPhotoIndex={selectedPhotoIndex}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onNavigate={handleNavigate}
          getShareUrl={getShareUrl}
        />
      )}
    </>
  );
}
