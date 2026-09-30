'use client';

import { Gallery } from '@/components/photo-gallery/gallery';
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
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <Gallery initialPhotoId={initialPhotoId} />
      </div>
    </>
  );
}
