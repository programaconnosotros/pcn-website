'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Trash2, UserMinus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  bulkDeleteGalleryItems,
  bulkSetGalleryItemsEvent,
} from '@/actions/gallery/gallery-actions';
import { bulkTagGalleryItemsUser, bulkUntagGalleryItemsUser } from '@/actions/gallery/gallery-tags';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import { UserCombobox } from '@/components/admin/user-combobox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GalleryTile } from '@/lib/gallery';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { PhotoEventSelect, type EventOption } from './photo-event-select';

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const labelClassName = 'font-mono text-[10px] uppercase tracking-wider text-muted-foreground';

interface GalleryBulkBarProps {
  /** The selected tiles. */
  selected: GalleryTile[];
  /** How many tiles are on screen, to offer selecting all of them. */
  visibleCount: number;
  events: EventOption[];
  onSelectAll: () => void;
  onClear: () => void;
  onExit: () => void;
  /** After a delete, so the gone tiles leave the selection. */
  onDeleted: (_ids: string[]) => void;
}

// What admins do to many photos and videos at once: move them to an event, tag or untag a
// person, or delete them. Sticks to the bottom of the screen while the selection lasts.
export function GalleryBulkBar({
  selected,
  visibleCount,
  events,
  onSelectAll,
  onClear,
  onExit,
  onDeleted,
}: GalleryBulkBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // undefined = nothing picked yet; null = "sin evento".
  const [eventId, setEventId] = useState<string | null | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ids = selected.map((item) => item.id);
  const count = selected.length;

  // Everyone tagged in at least one selected item, with how many of them they're in.
  const tagged = useMemo(() => {
    const people = new Map<string, { id: string; name: string; count: number }>();
    selected.forEach((item) =>
      item.tags.forEach(({ user }) => {
        const person = people.get(user.id) ?? { ...user, count: 0 };
        people.set(user.id, { ...person, count: person.count + 1 });
      }),
    );
    return [...people.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [selected]);

  const run = (action: () => Promise<string>, after?: () => void) =>
    startTransition(async () => {
      try {
        toast.success(await action());
        after?.();
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo guardar', true));
      }
    });

  const moveToEvent = () => {
    if (eventId === undefined) return;
    const name = events.find((event) => event.id === eventId)?.name;
    run(async () => {
      const { updated } = await bulkSetGalleryItemsEvent(ids, eventId);
      return name
        ? `${plural(updated, 'archivo movido', 'archivos movidos')} a ${name}`
        : `${plural(updated, 'archivo quedó', 'archivos quedaron')} sin evento`;
    });
  };

  const disabled = count === 0 || isPending;

  return (
    <div
      role="region"
      aria-label="Edición masiva"
      className="sticky bottom-3 z-30 mt-3 border border-pcnGreen bg-background/95 p-3 font-mono shadow-[0_0_30px_-8px_rgba(4,244,190,0.45)] backdrop-blur-sm"
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span aria-live="polite">
          <span className="text-pcnGreen">{count}</span>{' '}
          {count === 1 ? 'seleccionado' : 'seleccionados'}
        </span>
        {count < visibleCount && (
          <button
            type="button"
            onClick={onSelectAll}
            className="text-pcnGreen-700 hover:text-pcnGreen"
          >
            seleccionar los {visibleCount} visibles
          </button>
        )}
        {count > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground"
          >
            limpiar
          </button>
        )}
        <span className="text-[10px] text-muted-foreground/70 max-sm:hidden">
          shift + click selecciona un rango · esc para salir
        </span>
        <button
          type="button"
          onClick={onExit}
          className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
          salir
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-1">
          <span className={labelClassName}>evento</span>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <PhotoEventSelect
                events={events}
                value={eventId ?? null}
                onChange={setEventId}
                disabled={disabled}
                aria-label="Evento para los seleccionados"
              />
            </div>
            <Button
              type="button"
              variant="pcn"
              size="sm"
              onClick={moveToEvent}
              disabled={disabled || eventId === undefined}
              className="h-9 shrink-0 gap-1.5"
            >
              <CalendarCheck className="size-3.5" />
              asignar
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <span className={labelClassName}>etiquetar persona</span>
          <UserCombobox
            search={searchCommunityMembers}
            onSelect={(user) =>
              run(async () => {
                const { tagged: added } = await bulkTagGalleryItemsUser(ids, user.id);
                return added > 0
                  ? `Etiquetaste a ${user.name} en ${plural(added, 'archivo', 'archivos')}`
                  : `${user.name} ya estaba en todos`;
              })
            }
            placeholder="buscar persona"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1">
          <span className={labelClassName}>quitar persona</span>
          <Select
            value=""
            onValueChange={(userId) => {
              const person = tagged.find(({ id }) => id === userId);
              run(async () => {
                const { untagged } = await bulkUntagGalleryItemsUser(ids, userId);
                return `Quitaste a ${person?.name ?? 'la persona'} de ${plural(untagged, 'archivo', 'archivos')}`;
              });
            }}
            disabled={disabled || tagged.length === 0}
          >
            <SelectTrigger className="font-mono text-xs" aria-label="Quitar persona">
              <SelectValue
                placeholder={
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <UserMinus className="size-3.5" />
                    {tagged.length === 0 ? 'nadie etiquetado' : `${tagged.length} etiquetadas`}
                  </span>
                }
              />
            </SelectTrigger>
            <SelectContent>
              {tagged.map((person) => (
                <SelectItem key={person.id} value={person.id} className="font-mono text-xs">
                  {person.name}{' '}
                  <span className="text-muted-foreground">
                    · {person.count}/{count}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setConfirmDelete(true)}
          disabled={disabled}
          className="h-9 gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          eliminar
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {plural(count, 'archivo', 'archivos')}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borran de la galería junto con sus etiquetas y sus archivos. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                run(
                  async () => {
                    const { deleted } = await bulkDeleteGalleryItems(ids);
                    return `${plural(deleted, 'archivo eliminado', 'archivos eliminados')}`;
                  },
                  () => onDeleted(ids),
                )
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
