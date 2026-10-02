'use client';

import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { dateContainsString } from '@/lib/date-formatter';
import type { GalleryFilterOptions, GalleryTile } from '@/lib/gallery';
import { galleryQuery, isFiltered, type GalleryFilter } from '@/lib/gallery-filters';
import { cn } from '@/lib/utils';
import { ImagePlus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { GalleryFilters } from './gallery-filters';
import { PhotoCard } from './photo-card';
import { photoCaption } from './photo-utils';
import { ShareDialog } from './share-dialog';

// Lowercase without accents, so `tafi` finds `Tafí`.
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

interface GalleryProps {
  items: GalleryTile[];
  filter: GalleryFilter;
  options: GalleryFilterOptions;
  canUpload: boolean;
}

// The community's photos and videos, mixed and newest first, filterable by type, event and
// person (in the URL) and searchable by text.
export function Gallery({ items, filter, options, canUpload }: GalleryProps) {
  const [sharedItem, setSharedItem] = useState<GalleryTile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const event = options.events.find(({ id }) => id === filter.eventId) ?? null;
  const query = galleryQuery(filter);

  const filteredItems = useMemo(() => {
    const search = normalize(searchQuery.trim());
    if (!search) return items;

    return items.filter(
      (item) =>
        normalize(item.description ?? '').includes(search) ||
        normalize(item.event?.name ?? '').includes(search) ||
        item.tags.some((tag) => normalize(tag.user.name).includes(search)) ||
        dateContainsString(item.takenAt, search),
    );
  }, [items, searchQuery]);

  const photoCount = items.filter((item) => item.kind === 'PHOTO').length;
  const videoCount = items.length - photoCount;

  return (
    <>
      <StickyHeader className="mt-4">
        <PageTitle
          path={event ? [{ label: 'galeria', href: '/galeria' }, { label: event.name }] : 'galeria'}
          meta={`${plural(photoCount, 'foto', 'fotos')} · ${plural(videoCount, 'video', 'videos')}`}
          action={
            canUpload && (
              <Link href={event ? `/galeria/subir?evento=${event.id}` : '/galeria/subir'}>
                <Button variant="pcn" size="sm" className="flex items-center gap-1.5">
                  <ImagePlus className="h-4 w-4" />
                  subir();
                </Button>
              </Link>
            )
          }
        />

        <div className="mb-4 flex flex-col gap-2">
          <GalleryFilters filter={filter} options={options} />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="descripción, evento, persona o fecha"
              label="Buscar en la galería"
            />
            <p className="font-mono text-xs tabular-nums text-muted-foreground" aria-live="polite">
              {searchQuery.trim() ? (
                <>
                  <span className="text-pcnGreen">{filteredItems.length}</span>/{items.length}{' '}
                  coincidencias
                </>
              ) : (
                <>
                  ls -la <span className="text-pcnGreen-600">./galeria{query}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </StickyHeader>

      {items.length === 0 ? (
        <p className="border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
          {isFiltered(filter) ? (
            <>
              No hay nada con estos filtros.{' '}
              <Link href="/galeria" className="text-pcnGreen hover:underline">
                ver todo
              </Link>
            </>
          ) : (
            'Todavía no hay fotos ni videos.'
          )}
        </p>
      ) : filteredItems.length === 0 ? (
        <p className="border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
          grep: sin coincidencias para{' '}
          <span className="text-pcnGreen">&quot;{searchQuery}&quot;</span>
        </p>
      ) : (
        <RuledGrid className="mb-14 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredItems.map((item, index) => (
            <div key={item.id} className={cn(ruledCellClassName, 'p-1')}>
              <PhotoCard
                photo={item}
                index={index}
                total={filteredItems.length}
                href={`/galeria/${item.id}${query}`}
                onShare={() => setSharedItem(item)}
              />
            </div>
          ))}
        </RuledGrid>
      )}

      {sharedItem && (
        <ShareDialog
          isOpen
          onClose={() => setSharedItem(null)}
          url={`${window.location.origin}/galeria/${sharedItem.id}`}
          title={photoCaption(sharedItem)}
        />
      )}
    </>
  );
}
