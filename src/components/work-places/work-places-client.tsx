'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteWorkPlace } from '@/actions/work-places/work-places';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/empty-state';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { StickyHeader } from '@/components/ui/sticky-header';
import type { WorkPlaceWithAuthor } from '@/lib/work-places';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';
import { WORK_PLACE_RATINGS } from '@/schemas/work-place-schema';
import { WorkPlaceForm } from './work-place-form';

type Viewer = { id: string; isAdmin: boolean } | null;

/** A 1–5 score as a terminal bar: `▮▮▮▮▯`. */
const Score = ({ label, value }: { label: string; value: number | null }) => (
  <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
    <span className="text-muted-foreground">{label}</span>
    {value === null ? (
      <span className="text-muted-foreground/60">—</span>
    ) : (
      <span aria-label={`${label}: ${value} de 5`} className="text-xs tracking-tighter">
        <span className="text-pcnGreen">{'▮'.repeat(value)}</span>
        <span className="text-pcnGreen-200">{'▮'.repeat(5 - value)}</span>
      </span>
    )}
  </div>
);

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function WorkPlacesClient({
  places,
  viewer,
}: {
  places: WorkPlaceWithAuthor[];
  viewer: Viewer;
}) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<WorkPlaceWithAuthor | 'new' | null>(null);

  const visible = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return places.filter((place) => {
      const text = normalize([place.name, place.city, place.address, place.notes].join(' '));
      return words.every((word) => text.includes(word));
    });
  }, [places, query]);
  const cities = new Set(places.map((place) => place.city.trim().toLowerCase())).size;

  const remove = async (place: WorkPlaceWithAuthor) => {
    try {
      await deleteWorkPlace(place.id);
      toast.success('Lugar eliminado');
    } catch (error) {
      toast.error(actionErrorMessage(error, 'Error al eliminar el lugar'));
    }
  };

  return (
    <div className="mt-4 mb-14">
      <StickyHeader>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <PageTitle
            path="lugares"
            meta={`${places.length} ${places.length === 1 ? 'lugar' : 'lugares'} para laburar en ${cities} ${cities === 1 ? 'ciudad' : 'ciudades'}`}
            className="mb-0 flex-1"
          />
          {viewer ? (
            <Button variant="pcn" size="sm" onClick={() => setEditing('new')}>
              <Plus className="mr-1.5 size-4" />
              sumarLugar();
            </Button>
          ) : (
            <Link
              href="/iniciar-sesion?redirect=/lugares"
              className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
            >
              iniciá sesión para sumar un lugar
            </Link>
          )}
        </div>
        <SearchBar
          searchQuery={query}
          setSearchQuery={setQuery}
          placeholder="nombre, ciudad o dirección"
          label="Buscar lugares"
          className="mb-4"
        />
      </StickyHeader>

      {visible.length === 0 ? (
        <EmptyState
          showRefresh={false}
          title={places.length === 0 ? 'Todavía no hay lugares' : 'No hay lugares que coincidan'}
          description={
            places.length === 0
              ? 'Sumá el café o cowork donde mejor trabajás, así lo conocen los demás.'
              : 'Probá con otro nombre o ciudad.'
          }
        />
      ) : (
        <RuledGrid className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((place) => {
            const canChange = !!viewer && (viewer.isAdmin || viewer.id === place.authorId);
            return (
              <article key={place.id} className={cn(ruledCellClassName, 'flex flex-col')}>
                {place.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={place.photoUrl}
                    alt={`Foto de ${place.name}`}
                    loading="lazy"
                    className="aspect-video w-full border-b border-pcnGreen-200 object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-mono text-sm font-semibold">{place.name}</h2>
                      <p className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        {[place.address, place.city].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    {canChange && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          aria-label={`Editar ${place.name}`}
                          onClick={() => setEditing(place)}
                          className="text-muted-foreground hover:text-pcnGreen"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Eliminar ${place.name}`}
                          onClick={() => remove(place)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {WORK_PLACE_RATINGS.map(({ key, label }) => (
                      <Score key={key} label={label} value={place[key]} />
                    ))}
                  </div>

                  {place.notes && (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {place.notes}
                    </p>
                  )}

                  <p className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[11px] text-muted-foreground/80">
                    <Link href={`/perfil/${place.author.id}`} className="hover:text-pcnGreen">
                      <span className="text-pcnGreen-500">@ </span>
                      {place.author.name}
                    </Link>
                    {place.googleMapsUrl && (
                      <a
                        href={place.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pcnGreen-600 hover:text-pcnGreen"
                      >
                        ver en el mapa ↗
                      </a>
                    )}
                  </p>
                </div>
              </article>
            );
          })}
        </RuledGrid>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'Sumar un lugar' : 'Editar lugar'}</DialogTitle>
          </DialogHeader>
          {editing !== null && (
            <WorkPlaceForm
              place={editing === 'new' ? undefined : editing}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
