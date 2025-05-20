'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PhotoCard } from './photo-card';
import { PhotoDialog } from './photo-dialog';
import { SearchBar } from './search-bar';
import { SortSelector, type SortOrder } from './sort-selector';
import { dateContainsString } from '@/lib/date-formatter';

// Sample gallery photos with Date objects and Spanish titles
const photos = [
  {
    id: 1,
    title: 'Agustín y Chelo dando una charla de ingeniería de softwareen Tafí Viejo',
    image: '/gallery-photos/agus-chelo-talk.webp',
    date: new Date(2023, 11, 24),
  },
  {
    id: 2,
    title: 'Agustín, Chelo y Tobías resolviendo problemas con Docker en la web de PCN',
    image: '/gallery-photos/agus-chelo-tobias-watch-pc.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 3,
    title: 'Agustín luego de dar una lightning talk virtual en la pandemia',
    image: '/gallery-photos/agus-init.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 4,
    title: 'Agustín desarrollando la web de PCN',
    image: '/gallery-photos/agus-pc.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 5,
    title: 'Agustín dando una charla de DDD y arquitectura hexagonal en la UTN-FRT',
    image: '/gallery-photos/agus-talk.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 6,
    title: 'Cena de founders de PCN',
    image: '/gallery-photos/boys-having-a-snack.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 7,
    title: 'Chelo dando una charla de paradigmas de programación en la UTN-FRT',
    image: '/gallery-photos/chelo-watch-pc.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 8,
    title: 'Noche de hamburguesas en la casa de Tobi',
    image: '/gallery-photos/leno-time.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 9,
    title: 'Mauricio dando una charla sobre diseño en la UTN-FRT',
    image: '/gallery-photos/mauricio-talk.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 10,
    title: 'Agustín, Facundo y Chelo luego de una charla en Tafí Viejo',
    image: '/gallery-photos/photo-casual.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 11,
    title: 'Esteban enseñando algoritmos de ordenamiento en la UTN-FRT',
    image: '/gallery-photos/talk-class.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 12,
    title: 'Tobías dando una charla sobre unit testing en la UTN-FRT',
    image: '/gallery-photos/tobias-talk.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 13,
    title: 'Tobías dando una charla sobre depuración de código en la UTN-FRT',
    image: '/gallery-photos/tobias-watch-pc.webp',
    date: new Date(2024, 2, 15),
  },
];

interface GalleryProps {
  initialPhotoId?: number | null;
}

export function Gallery({ initialPhotoId }: GalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
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

  // Sort photos based on sort order
  const sortedPhotos = useMemo(() => {
    const photosToSort = [...filteredPhotos];

    switch (sortOrder) {
      case 'date-asc':
        return photosToSort.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return a.date.getTime() - b.date.getTime();
        });
      case 'date-desc':
        return photosToSort.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return b.date.getTime() - a.date.getTime();
        });
      default:
        // For default order, we need to restore the original order
        // We can do this by sorting based on the index in the original array
        return photosToSort.sort((a, b) => {
          const indexA = photos.findIndex((p) => p.id === a.id);
          const indexB = photos.findIndex((p) => p.id === b.id);
          return indexA - indexB;
        });
    }
  }, [filteredPhotos, sortOrder]);

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
    router.push(`?photo=${photo.id}`, { scroll: false });
    setSelectedPhotoIndex(index);
  };

  const handleCloseDialog = () => {
    // Remove photo ID from URL
    router.push('/photos', { scroll: false });
    setSelectedPhotoIndex(-1);
  };

  const handleNavigate = (index: number) => {
    const photo = sortedPhotos[index];
    // Update URL with new photo ID
    router.push(`?photo=${photo.id}`, { scroll: false });
    setSelectedPhotoIndex(index);
  };

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
  };

  const getShareUrl = (photoId: number) => {
    // Create absolute URL for sharing
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}?photo=${photoId}`;
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Buscar por título o fecha..."
        />
        <SortSelector sortOrder={sortOrder} onSortChange={handleSortChange} />
      </div>

      {sortedPhotos.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No se encontraron fotos que coincidan con &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {sortedPhotos.map((photo, index) => (
            <div key={photo.id} className="cursor-pointer">
              <PhotoCard
                photo={photo}
                getShareUrl={getShareUrl}
                onCardClick={() => handlePhotoClick(index)}
              />
            </div>
          ))}
        </div>
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
