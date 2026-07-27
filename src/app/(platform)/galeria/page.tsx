import { Suspense } from 'react';
import { Gallery } from '@/components/photo-gallery/gallery';
import { getGalleryPhotos } from '@/actions/gallery/get-gallery-photos';
import { getCurrentSession } from '@/actions/auth/get-current-session';
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

export default async function PhotoGallery() {
  const [photos, session] = await Promise.all([getGalleryPhotos(), getCurrentSession()]);

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
        <Suspense>
          <Gallery photos={photos} currentUser={session?.user ?? null} />
        </Suspense>
      </div>
    </>
  );
}
