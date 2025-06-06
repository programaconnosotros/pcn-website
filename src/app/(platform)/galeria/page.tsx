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
      <div className="z-10 bg-background/95 pb-3 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full flex-row justify-between">
          <Heading2 className="m-0">Galería</Heading2>
        </div>
      </div>

      <main className="mx-auto my-4">
        <Gallery initialPhotoId={initialPhotoId} />
      </main>
    </div>
  );
}
