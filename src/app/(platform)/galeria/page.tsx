'use client';

import { Gallery } from '@/components/photo-gallery/gallery';
import { Heading2 } from '@/components/ui/heading-2';
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
                <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Galería</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full flex-row justify-between">
              <Heading2 className="m-0">Galería</Heading2>
            </div>
          </div>

          <Gallery initialPhotoId={initialPhotoId} />
        </div>
      </div>
    </>
  );
}
