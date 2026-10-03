'use client';

import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { CollapsibleFilters } from '@/components/ui/collapsible-filters';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { dateContainsString } from '@/lib/date-formatter';
import type { GalleryFilterOptions, GalleryTile } from '@/lib/gallery';
import { galleryQuery, isFiltered, type GalleryFilter } from '@/lib/gallery-filters';
import { cn } from '@/lib/utils';
import { Check, ImagePlus, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { GalleryBulkBar } from './gallery-bulk-bar';
import { GalleryFilters } from './gallery-filters';
import type { EventOption } from './photo-event-select';
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
  /** Every event, for admins: enables selecting many items to edit them at once. */
  events: EventOption[] | null;
}

// The community's photos and videos, mixed and newest first, filterable by type, event and
// person (in the URL) and searchable by text.
export function Gallery({ items, filter, options, canUpload, events }: GalleryProps) {
  const [sharedItem, setSharedItem] = useState<GalleryTile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Admins' bulk editing: while selecting, a click on a tile toggles it instead of opening it.
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Where the last click landed, so shift + click selects the whole range up to it.
  const [anchor, setAnchor] = useState<number | null>(null);

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

  // Only what's still in the gallery (and on screen) counts: a refresh or a search can hide items.
  const selected = filteredItems.filter((item) => selectedIds.has(item.id));

  const exitSelection = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
    setAnchor(null);
  };

  useEffect(() => {
    if (!isSelecting) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // Esc inside a dialog or a dropdown closes that, not the selection.
      if (event.key === 'Escape' && !document.querySelector('[role="dialog"],[role="listbox"]')) {
        exitSelection();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSelecting]);

  const toggle = (index: number, range: boolean) => {
    const id = filteredItems[index].id;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (range && anchor !== null) {
        // The range takes the state of the item where it started.
        const select = current.has(filteredItems[anchor]?.id);
        const [from, to] = anchor < index ? [anchor, index] : [index, anchor];
        filteredItems
          .slice(from, to + 1)
          .forEach((item) => (select ? next.add(item.id) : next.delete(item.id)));
      } else if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setAnchor(index);
  };

  const photoCount = items.filter((item) => item.kind === 'PHOTO').length;
  const videoCount = items.length - photoCount;

  return (
    <>
      <StickyHeader className="mt-4">
        <PageTitle
          path={event ? [{ label: 'galeria', href: '/galeria' }, { label: event.name }] : 'galeria'}
          meta={`${plural(photoCount, 'foto', 'fotos')} · ${plural(videoCount, 'video', 'videos')}`}
          action={
            <>
              {events && items.length > 0 && (
                <Button
                  variant={isSelecting ? 'pcn' : 'outline'}
                  size="sm"
                  onClick={() => (isSelecting ? exitSelection() : setIsSelecting(true))}
                  aria-pressed={isSelecting}
                  className="flex items-center gap-1.5 font-mono"
                >
                  <ListChecks className="h-4 w-4" />
                  {/* Icon only on phones, so the actions fit next to the meta. */}
                  <span className="max-sm:sr-only">{isSelecting ? 'listo' : 'seleccionar'}</span>
                </Button>
              )}
              {canUpload && (
                <Link href={event ? `/galeria/subir?evento=${event.id}` : '/galeria/subir'}>
                  <Button variant="pcn" size="sm" className="flex items-center gap-1.5">
                    <ImagePlus className="h-4 w-4" />
                    subir();
                  </Button>
                </Link>
              )}
            </>
          }
        />

        <CollapsibleFilters
          className="mb-4"
          // Type, event and person stay on their own row above the search on wide screens.
          panelClassName="md:order-first md:basis-full"
          activeCount={
            Number(filter.type !== 'todo') + Number(!!filter.eventId) + Number(!!filter.userId)
          }
          search={
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="descripción, evento, persona o fecha"
              label="Buscar en la galería"
            />
          }
          aside={
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
          }
        >
          <GalleryFilters filter={filter} options={options} />
        </CollapsibleFilters>
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
        <div className="mb-14">
          <RuledGrid className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredItems.map((item, index) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div key={item.id} className={cn(ruledCellClassName, 'relative p-1')}>
                  <PhotoCard
                    photo={item}
                    index={index}
                    total={filteredItems.length}
                    href={`/galeria/${item.id}${query}`}
                    onShare={() => setSharedItem(item)}
                  />
                  {isSelecting && (
                    <button
                      type="button"
                      onClick={(event) => toggle(index, event.shiftKey)}
                      aria-pressed={isSelected}
                      aria-label={`Seleccionar ${photoCaption(item)}`}
                      className={cn(
                        'absolute inset-1 z-10 flex items-start justify-end p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pcnGreen',
                        isSelected
                          ? 'bg-pcnGreen/15 ring-2 ring-inset ring-pcnGreen'
                          : 'bg-black/30 hover:bg-black/10',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-5 items-center justify-center rounded-sm border transition-colors',
                          isSelected
                            ? 'border-pcnGreen bg-pcnGreen text-black'
                            : 'border-white/70 bg-black/60',
                        )}
                      >
                        {isSelected && <Check className="size-3.5" strokeWidth={3} />}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </RuledGrid>

          {isSelecting && events && (
            <GalleryBulkBar
              selected={selected}
              visibleCount={filteredItems.length}
              events={events}
              onSelectAll={() => setSelectedIds(new Set(filteredItems.map((item) => item.id)))}
              onClear={() => setSelectedIds(new Set())}
              onExit={exitSelection}
              onDeleted={(ids) =>
                setSelectedIds((current) => {
                  const next = new Set(current);
                  ids.forEach((id) => next.delete(id));
                  return next;
                })
              }
            />
          )}
        </div>
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
