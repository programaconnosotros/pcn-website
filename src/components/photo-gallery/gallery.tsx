'use client';

import { dateContainsString } from '@/lib/date-formatter';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhotoCard } from './photo-card';
import { PhotoDialog } from './photo-dialog';
import { SearchBar } from './search-bar';
import { GalleryPhotoFormDialog } from './gallery-photo-form-dialog';
import { GalleryPhoto } from '@prisma/client';

interface GalleryUser {
  role: string;
}

interface GalleryProps {
  photos: GalleryPhoto[];
  currentUser?: GalleryUser | null;
}

export function Gallery({ photos, currentUser }: GalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const isDialogOpen = selectedPhotoIndex !== -1;
  const isAdmin = currentUser?.role === 'ADMIN';

  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return photos;

    const query = searchQuery.toLowerCase().trim();
    return photos.filter(
      (photo) =>
        photo.title.toLowerCase().includes(query) ||
        photo.location.toLowerCase().includes(query) ||
        dateContainsString(new Date(photo.takenAt), query),
    );
  }, [searchQuery, photos]);

  useEffect(() => {
    const photoId = searchParams.get('foto');
    if (photoId) {
      const photoIndex = filteredPhotos.findIndex((p) => p.id === photoId);
      if (photoIndex !== -1) {
        setSelectedPhotoIndex(photoIndex);
      }
    }
  }, [searchParams, filteredPhotos]);

  const handlePhotoClick = (index: number) => {
    const photo = filteredPhotos[index];
    router.push(`?foto=${photo.id}`, { scroll: false });
    setSelectedPhotoIndex(index);
  };

  const handleCloseDialog = () => {
    router.push('/galeria', { scroll: false });
    setSelectedPhotoIndex(-1);
  };

  const handleNavigate = (index: number) => {
    const photo = filteredPhotos[index];
    router.push(`?foto=${photo.id}`, { scroll: false });
    setSelectedPhotoIndex(index);
  };

  const getShareUrl = (photoId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/galeria?foto=${photoId}`;
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 px-4">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Buscar por título, ubicación o fecha..."
        />
        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Subir foto
          </Button>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-500">Aún no hay fotos en la galería.</p>
          {isAdmin && (
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Subir primera foto
            </Button>
          )}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No se encontraron fotos que coincidan con &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredPhotos.map((photo, index) => (
            <div key={photo.id} className="cursor-pointer">
              <PhotoCard
                photo={photo}
                isAdmin={isAdmin}
                getShareUrl={getShareUrl}
                onCardClick={() => handlePhotoClick(index)}
              />
            </div>
          ))}
        </div>
      )}

      {isDialogOpen && (
        <PhotoDialog
          photos={filteredPhotos}
          currentPhotoIndex={selectedPhotoIndex}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onNavigate={handleNavigate}
          getShareUrl={getShareUrl}
        />
      )}

      {isAdmin && (
        <GalleryPhotoFormDialog
          mode="create"
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      )}
    </>
  );
}
