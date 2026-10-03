'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { tagGalleryItemUser, untagGalleryItemUser } from '@/actions/gallery/gallery-tags';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import { UserCombobox } from '@/components/admin/user-combobox';
import { PersonLink, type Person } from '@/components/people/person-link';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type Props = {
  photoId: string;
  people: Person[];
  viewer: Person | null;
  isAdmin: boolean;
};

const without = (people: Person[], id: string) => people.filter((person) => person.id !== id);

// Who appears in the photo, each linking to their profile. Logged-in members can tag or untag
// themselves; admins tag anyone. Changes show up at once (optimistically) and are undone with a
// toast if the server rejects them; the page is never re-rendered for them.
export function PhotoPeople({ photoId, people: initialPeople, viewer, isAdmin }: Props) {
  const viewerId = viewer?.id ?? null;
  const [people, setPeople] = useState(initialPeople);
  // Whoever is being tagged or untagged right now, so the same person can't be toggled twice
  // while the first request is still on its way.
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  // Moving to another photo (or any server re-render) brings a fresh list from the server.
  const [syncedPeople, setSyncedPeople] = useState(initialPeople);
  if (syncedPeople !== initialPeople) {
    setSyncedPeople(initialPeople);
    setPeople(initialPeople);
  }

  const isTagged = !!viewerId && people.some((person) => person.id === viewerId);

  const setPending = (id: string, pending: boolean) =>
    setPendingIds((current) => {
      const next = new Set(current);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });

  const tag = async (person: Person, success: string) => {
    if (pendingIds.has(person.id)) return;
    setPending(person.id, true);
    setPeople((current) => [...without(current, person.id), person]);
    try {
      const { person: saved } = await tagGalleryItemUser(photoId, person.id);
      setPeople((current) => current.map((p) => (p.id === saved.id ? saved : p)));
      toast.success(success);
    } catch (error) {
      setPeople((current) => without(current, person.id));
      toast.error(actionErrorMessage(error, 'No se pudo guardar', true));
    } finally {
      setPending(person.id, false);
    }
  };

  const untag = async (person: Person, success: string) => {
    if (pendingIds.has(person.id)) return;
    const index = people.findIndex((p) => p.id === person.id);
    setPending(person.id, true);
    setPeople((current) => without(current, person.id));
    try {
      await untagGalleryItemUser(photoId, person.id);
      toast.success(success);
    } catch (error) {
      // Back where it was, unless something else already put it back.
      setPeople((current) =>
        current.some((p) => p.id === person.id)
          ? current
          : [...current.slice(0, index), person, ...current.slice(index)],
      );
      toast.error(actionErrorMessage(error, 'No se pudo guardar', true));
    } finally {
      setPending(person.id, false);
    }
  };

  return (
    <div className="space-y-3">
      {people.length > 0 ? (
        <ul className="space-y-1.5">
          {people.map((person) => (
            <li key={person.id} className="flex items-center gap-2">
              <PersonLink person={person} className="flex-1" />
              {(isAdmin || person.id === viewerId) && (
                <button
                  type="button"
                  onClick={() =>
                    untag(
                      person,
                      person.id === viewerId
                        ? 'Te quitaste de la foto'
                        : `Quitaste a ${person.name}`,
                    )
                  }
                  disabled={pendingIds.has(person.id)}
                  aria-label={`Quitar a ${person.name} de la foto`}
                  className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-xs text-muted-foreground">Todavía no hay nadie etiquetado.</p>
      )}

      {viewer && !isTagged && (
        <button
          type="button"
          onClick={() => tag(viewer, '¡Listo! Ya aparecés en la foto')}
          disabled={pendingIds.has(viewer.id)}
          className="flex items-center gap-1.5 font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen disabled:opacity-50"
        >
          <UserCheck className="size-3.5" />
          aparezco en esta foto
        </button>
      )}

      {isAdmin && (
        <UserCombobox
          search={searchCommunityMembers}
          excludeIds={people.map((person) => person.id)}
          onSelect={(user) =>
            tag({ id: user.id, name: user.name, image: user.image }, `Etiquetaste a ${user.name}`)
          }
          placeholder="etiquetar persona"
        />
      )}

      {!viewer && (
        <p className="font-mono text-[11px] text-muted-foreground">
          ¿Aparecés en la foto?{' '}
          <Link
            href={`/autenticacion/iniciar-sesion?redirect=/galeria/${photoId}`}
            className="text-pcnGreen-700 hover:text-pcnGreen"
          >
            Iniciá sesión
          </Link>{' '}
          para etiquetarte.
        </p>
      )}
    </div>
  );
}
