'use client';

import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { dateContainsString } from '@/lib/date-formatter';
import type { PhotoTile } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { ImagePlus, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PhotoCard } from './photo-card';
import { photoCaption } from './photo-utils';
import { ShareDialog } from './share-dialog';

// Lowercase without accents, so `tafi` finds `Tafí`.
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

interface GalleryProps {
  photos: PhotoTile[];
  // When browsing one event's photos.
  event?: { id: string; name: string } | null;
  canUpload: boolean;
}

export function Gallery({ photos, event, canUpload }: GalleryProps) {
  const [sharedPhoto, setSharedPhoto] = useState<PhotoTile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPhotos = useMemo(() => {
    const query = normalize(searchQuery.trim());
    if (!query) return photos;

    return photos.filter(
      (photo) =>
        normalize(photo.description ?? '').includes(query) ||
        normalize(photo.event?.name ?? '').includes(query) ||
        photo.tags.some((tag) => normalize(tag.user.name).includes(query)) ||
        dateContainsString(photo.takenAt, query),
    );
  }, [photos, searchQuery]);

  const photoHref = (photo: PhotoTile) =>
    event ? `/galeria/${photo.id}?evento=${event.id}` : `/galeria/${photo.id}`;

  const getShareUrl = (photo: PhotoTile) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/galeria/${photo.id}`;
  };

  return (
    <>
      <StickyHeader className="mt-4">
        <PageTitle
          path={event ? [{ label: 'galeria', href: '/galeria' }, { label: event.name }] : 'galeria'}
          meta={`${photos.length} fotos ${event ? 'del evento' : 'de la comunidad'}`}
          action={
            canUpload && (
              <Link href={event ? `/galeria/subir?evento=${event.id}` : '/galeria/subir'}>
                <Button variant="pcn" size="sm" className="flex items-center gap-1.5">
                  <ImagePlus className="h-4 w-4" />
                  subirFotos();
                </Button>
              </Link>
            )
          }
        />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="descripción, evento, persona o fecha"
              label="Buscar fotos"
            />
            {event && (
              <span className="flex items-center gap-1 rounded-sm border border-pcnGreen-200 px-2 py-1 font-mono text-xs">
                <Link href={`/eventos/${event.id}`} className="text-pcnGreen hover:underline">
                  evento:{event.name}
                </Link>
                <Link
                  href="/galeria"
                  aria-label="Ver todas las fotos"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </Link>
              </span>
            )}
          </div>
          <p className="font-mono text-xs tabular-nums text-muted-foreground" aria-live="polite">
            {searchQuery.trim() ? (
              <>
                <span className="text-pcnGreen">{filteredPhotos.length}</span>/{photos.length}{' '}
                coincidencias
              </>
            ) : (
              <>
                ls -la <span className="text-pcnGreen-600">./galeria</span>
              </>
            )}
          </p>
        </div>
      </StickyHeader>

      {photos.length === 0 ? (
        <p className="border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
          {event ? 'Este evento todavía no tiene fotos.' : 'Todavía no hay fotos.'}
        </p>
      ) : filteredPhotos.length === 0 ? (
        <p className="border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
          grep: sin coincidencias para{' '}
          <span className="text-pcnGreen">&quot;{searchQuery}&quot;</span>
        </p>
      ) : (
        <RuledGrid className="mb-14 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredPhotos.map((photo, index) => (
            <div key={photo.id} className={cn(ruledCellClassName, 'p-1')}>
              <PhotoCard
                photo={photo}
                index={index}
                total={filteredPhotos.length}
                href={photoHref(photo)}
                onShare={() => setSharedPhoto(photo)}
              />
            </div>
          ))}
        </RuledGrid>
      )}

      {sharedPhoto && (
        <ShareDialog
          isOpen
          onClose={() => setSharedPhoto(null)}
          url={getShareUrl(sharedPhoto)}
          title={photoCaption(sharedPhoto)}
        />
      )}
    </>
  );
}
