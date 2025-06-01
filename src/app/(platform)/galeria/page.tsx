'use client';

import { Gallery } from '@/components/photo-gallery/gallery';
import { Heading2 } from '@/components/ui/heading-2';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PhotoGallery() {
  const searchParams = useSearchParams();
  const photoId = searchParams.get('foto');
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
    <div className="mt-4 md:px-20">
        <div className="mb-8 flex w-full flex-row items-center justify-between">
          <Heading2 className="text-center">Galería</Heading2>
        </div>

      <main className="mx-auto">
        <Gallery initialPhotoId={initialPhotoId} />
      </main>
    </div>
  );
}