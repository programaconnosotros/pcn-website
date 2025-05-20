'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Gallery } from '@/components/photo-gallery/gallery';
import { Heading2 } from '@/components/ui/heading-2';

export default function PhotoGallery() {
  const searchParams = useSearchParams();
  const photoId = searchParams.get('photo');
  const [initialPhotoId, setInitialPhotoId] = useState<number | null>(null);

  useEffect(() => {
    if (photoId) {
      const id = Number.parseInt(photoId);
      if (!isNaN(id)) {
        setInitialPhotoId(id);
      }
    }
  }, [photoId]);

  return (
    <div className="min-h-screen">
      <header className="py-6">
        <div className="container mx-auto">
          <Heading2 className="text-center">Galería de fotos</Heading2>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Gallery initialPhotoId={initialPhotoId} />
      </main>
    </div>
  );
}
