'use client';

import { dateContainsString } from '@/lib/date-formatter';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PhotoCard } from './photo-card';
import { PhotoDialog } from './photo-dialog';
import { SearchBar } from './search-bar';
import { SortSelector, type SortOrder } from './sort-selector';

const photos = [
  {
    id: 1,
    title: 'Agus y Chelo dando una charla de ingeniería de software en Tafí Viejo',
    image: '/photos/agus-chelo-talk.webp',
    date: new Date(2023, 11, 24),
  },
  {
    id: 2,
    title: 'Agus, Chelo y Tobi resolviendo problemas con Docker en la web de PCN',
    image: '/photos/agus-chelo-tobias-watch-pc.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 3,
    title: 'Agus luego de dar una lightning talk virtual en la pandemia',
    image: '/photos/agus-init.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 4,
    title: 'Agus desarrollando la web de PCN',
    image: '/photos/agus-pc.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 5,
    title: 'Agus dando una charla de DDD y arquitectura hexagonal en la UTN-FRT',
    image: '/photos/agus-talk.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 6,
    title: 'Cena de founders de PCN',
    image: '/photos/boys-having-a-snack.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 7,
    title: 'Chelo dando una charla de paradigmas de programación en la UTN-FRT',
    image: '/photos/chelo-watch-pc.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 8,
    title: 'Noche de hamburguesas en la casa de Tobi',
    image: '/photos/leno-time.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 9,
    title: 'Mauri dando una charla sobre diseño en la UTN-FRT',
    image: '/photos/mauricio-talk.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 10,
    title: 'Agus, Facu y Chelo luego de una charla en Tafí Viejo',
    image: '/photos/photo-casual.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 11,
    title: 'Esteban enseñando algoritmos de ordenamiento en la UTN-FRT',
    image: '/photos/talk-class.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 12,
    title: 'Tobi dando una charla sobre unit testing en la UTN-FRT',
    image: '/photos/tobias-talk.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 13,
    title: 'Tobi dando una charla sobre depuración de código en la UTN-FRT',
    image: '/photos/tobias-watch-pc.webp',
    date: new Date(2024, 2, 15),
  },
];

interface GalleryProps {
  initialPhotoId?: number | null;
}

export function Gallery({ initialPhotoId }: GalleryProps) {
  const router = useRouter();
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

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
  };

  const getShareUrl = (photoId: number) => {
    // Create absolute URL for sharing
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/galeria?foto=${photoId}`;
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Buscar por título o fecha..."
        />
        <SortSelector
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          className="w-full max-w-md sm:w-auto"
        />
      </div>

      {sortedPhotos.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No se encontraron fotos que coincidan con &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <>
          <div className="xl:hidden">
            {sortedPhotos.map((photo, index) => (
              <div key={photo.id} className="mb-3 cursor-pointer">
                <PhotoCard
                  photo={photo}
                  getShareUrl={getShareUrl}
                  onCardClick={() => handlePhotoClick(index)}
                />
              </div>
            ))}
          </div>

          <div className="hidden gap-3 xl:block" style={{ columnCount: 4, columnGap: '0.75rem' }}>
            {sortedPhotos.map((photo, index) => (
              <div key={photo.id} className="mb-3 cursor-pointer" style={{ breakInside: 'avoid' }}>
                <PhotoCard
                  photo={photo}
                  getShareUrl={getShareUrl}
                  onCardClick={() => handlePhotoClick(index)}
                />
              </div>
            ))}
          </div>
        </>
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
