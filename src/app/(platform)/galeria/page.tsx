'use client';

import { Gallery } from '@/components/photo-gallery/gallery';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Galería</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col p-0">
        <Gallery initialPhotoId={initialPhotoId} />
      </div>
    </>
  );
}
