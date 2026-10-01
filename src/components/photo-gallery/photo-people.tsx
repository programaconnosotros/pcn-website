'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { tagGalleryItemUser, untagGalleryItemUser } from '@/actions/gallery/gallery-tags';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import { UserCombobox } from '@/components/admin/user-combobox';
import { PersonLink, type Person } from '@/components/people/person-link';

type Props = {
  photoId: string;
  people: Person[];
  viewerId: string | null;
  isAdmin: boolean;
};

// Who appears in the photo, each linking to their profile. Logged-in members can tag or untag
// themselves; admins tag anyone.
export function PhotoPeople({ photoId, people, viewerId, isAdmin }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isTagged = !!viewerId && people.some((person) => person.id === viewerId);

  const run = (action: () => Promise<unknown>, success: string) =>
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        toast.error(
          message.startsWith('RATE_LIMIT')
            ? 'Demasiados cambios seguidos, probá en un rato'
            : message || 'No se pudo guardar',
        );
      }
    });

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
                    run(
                      () => untagGalleryItemUser(photoId, person.id),
                      person.id === viewerId
                        ? 'Te quitaste de la foto'
                        : `Quitaste a ${person.name}`,
                    )
                  }
                  disabled={isPending}
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

      {viewerId && !isTagged && (
        <button
          type="button"
          onClick={() =>
            run(() => tagGalleryItemUser(photoId, viewerId), '¡Listo! Ya aparecés en la foto')
          }
          disabled={isPending}
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
            run(() => tagGalleryItemUser(photoId, user.id), `Etiquetaste a ${user.name}`)
          }
          placeholder="etiquetar persona"
          disabled={isPending}
        />
      )}

      {!viewerId && (
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
