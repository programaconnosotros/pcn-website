'use client';

import { dateContainsString } from '@/lib/date-formatter';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PhotoCard } from './photo-card';
import { PhotoDialog } from './photo-dialog';
import { SearchBar } from './search-bar';

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
    date: new Date(2024, 6, 30),
  },
  {
    id: 3,
    title: 'Agus luego de dar una lightning talk virtual en la pandemia',
    image: '/photos/agus-init.webp',
    date: new Date(2024, 11, 27),
  },
  {
    id: 4,
    title: 'Agus desarrollando la web de PCN',
    image: '/photos/agus-pc.webp',
    date: new Date(2024, 6, 30),
  },
  {
    id: 5,
    title: 'Agus dando una charla de DDD y arquitectura hexagonal en la UTN-FRT',
    image: '/photos/agus-talk.webp',
    date: new Date(2024, 9, 16),
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
  {
    id: 14,
    title: 'Evento de PCN',
    image: '/IMG_2332.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 15,
    title: 'Evento de PCN',
    image: '/IMG_8943.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 16,
    title: 'Header de PCN',
    image: '/pcn-header.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 17,
    title: 'Mauri y Tobi en un evento de PCN',
    image: '/mauri-y-tobias.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 18,
    title: 'Miembros de PCN programando',
    image: '/programando-1.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 19,
    title: 'Pre Lightning Talks',
    image: '/pre-lightning-talks.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 20,
    title: 'Evento de PCN',
    image: '/IMG_9143.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 21,
    title: 'Juntada de PCN',
    image: '/juntada.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 22,
    title: 'Evento de PCN',
    image: '/IMG_9119.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 23,
    title: 'Agus dando una lightning talk',
    image: '/agus-lightning-talk-1.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 24,
    title: 'Evento de PCN',
    image: '/galeria/814a45cf-d0dd-43f6-b4aa-8a3b93b4b6c7.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 25,
    title: 'Evento de PCN',
    image: '/galeria/FullSizeRender (1).webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 26,
    title: 'Evento de PCN',
    image: '/galeria/IMG_0620.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 27,
    title: 'Evento de PCN',
    image: '/galeria/IMG_1076.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 28,
    title: 'Evento de PCN',
    image: '/galeria/IMG_1099.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 29,
    title: 'Evento de PCN',
    image: '/galeria/IMG_1113.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 30,
    title: 'Evento de PCN',
    image: '/galeria/IMG_1150.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 31,
    title: 'Evento de PCN',
    image: '/galeria/IMG_2275.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 32,
    title: 'Evento de PCN',
    image: '/galeria/IMG_2322.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 33,
    title: 'Evento de PCN',
    image: '/galeria/IMG_2345.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 34,
    title: 'Evento de PCN',
    image: '/galeria/IMG_2420.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 35,
    title: 'Evento de PCN',
    image: '/galeria/IMG_2482.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 36,
    title: 'Evento de PCN',
    image: '/galeria/IMG_2496.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 37,
    title: 'Evento de PCN',
    image: '/galeria/IMG_2497.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 38,
    title: 'Evento de PCN',
    image: '/galeria/IMG_3046.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 39,
    title: 'Evento de PCN',
    image: '/galeria/IMG_3048.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 40,
    title: 'Evento de PCN',
    image: '/galeria/IMG_3082.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 41,
    title: 'Evento de PCN',
    image: '/galeria/IMG_3084.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 42,
    title: 'Evento de PCN',
    image: '/galeria/IMG_3087.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 43,
    title: 'Evento de PCN',
    image: '/galeria/IMG_3088.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 44,
    title: 'Evento de PCN',
    image: '/galeria/IMG_3097.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 45,
    title: 'Evento de PCN',
    image: '/galeria/IMG_3220.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 46,
    title: 'Evento de PCN',
    image: '/galeria/IMG_3653.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 47,
    title: 'Evento de PCN',
    image: '/galeria/IMG_3660.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 48,
    title: 'Evento de PCN',
    image: '/galeria/IMG_4254.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 49,
    title: 'Evento de PCN',
    image: '/galeria/IMG_4322.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 50,
    title: 'Evento de PCN',
    image: '/galeria/IMG_4695.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 51,
    title: 'Evento de PCN',
    image: '/galeria/IMG_4707.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 52,
    title: 'Evento de PCN',
    image: '/galeria/IMG_4763.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 53,
    title: 'Evento de PCN',
    image: '/galeria/IMG_4766.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 54,
    title: 'Evento de PCN',
    image: '/galeria/IMG_4872.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 55,
    title: 'Evento de PCN',
    image: '/galeria/IMG_4881.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 56,
    title: 'Evento de PCN',
    image: '/galeria/IMG_4900.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 57,
    title: 'Evento de PCN',
    image: '/galeria/IMG_5142.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 58,
    title: 'Evento de PCN',
    image: '/galeria/IMG_5166.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 59,
    title: 'Evento de PCN',
    image: '/galeria/IMG_5180.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 60,
    title: 'Evento de PCN',
    image: '/galeria/IMG_5188.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 61,
    title: 'Evento de PCN',
    image: '/galeria/IMG_5191.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 62,
    title: 'Evento de PCN',
    image: '/galeria/IMG_5751.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 63,
    title: 'Evento de PCN',
    image: '/galeria/IMG_5917.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 64,
    title: 'Evento de PCN',
    image: '/galeria/IMG_6719.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 65,
    title: 'Evento de PCN',
    image: '/galeria/IMG_7611.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 66,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8414.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 67,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8723.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 68,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8740.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 69,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8824.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 70,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8870.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 71,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8936.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 72,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8945.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 73,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8949.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 74,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8955.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 75,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8968.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 76,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8973.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 77,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8975.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 78,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8985.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 79,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8999 (1).webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 80,
    title: 'Evento de PCN',
    image: '/galeria/IMG_8999.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 81,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9011.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 82,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9025.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 83,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9031.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 84,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9040.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 85,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9076.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 86,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9104.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 87,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9109.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 88,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9113.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 89,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9123.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 90,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9261.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 91,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9308.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 92,
    title: 'Evento de PCN',
    image: '/galeria/IMG_9512.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 93,
    title: 'Evento de PCN',
    image: '/galeria/photo_2019-10-14_01-58-24.webp',
    date: new Date(2024, 2, 15),
  },
  {
    id: 94,
    title: 'Evento de PCN',
    image: '/IMG_1457.webp',
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
      <div className="mb-6 flex justify-center">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Buscar por título o fecha..."
        />
      </div>

      {sortedPhotos.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No se encontraron fotos que coincidan con &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
