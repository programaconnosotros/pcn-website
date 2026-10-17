'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { addEventOrganizer, removeEventOrganizer } from '@/actions/events/organizer-actions';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import { UserCombobox } from '@/components/admin/user-combobox';
import { PersonLink, type Person } from '@/components/people/person-link';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';

type Props = {
  eventId: string;
  organizers: Person[];
  canManage: boolean;
};

// The event's organizing team: anyone can be added (ambassador or not) and each one gets the
// event on their profile and the right to manage it.
export function EventOrganizersManager({ eventId, organizers: initial, canManage }: Props) {
  const [organizers, setOrganizers] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const add = (person: Person) =>
    startTransition(async () => {
      try {
        await addEventOrganizer(eventId, person.id);
        setOrganizers((current) => [...current, person]);
        toast.success(`${person.name} ahora organiza el evento`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo agregar');
      }
    });

  const remove = (person: Person) =>
    startTransition(async () => {
      try {
        await removeEventOrganizer(eventId, person.id);
        setOrganizers((current) => current.filter((organizer) => organizer.id !== person.id));
        toast.success(`${person.name} ya no organiza el evento`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo quitar');
      }
    });

  return (
    <div className="mb-14 max-w-2xl space-y-4">
      {canManage && (
        <UserCombobox
          search={searchCommunityMembers}
          excludeIds={organizers.map((organizer) => organizer.id)}
          onSelect={({ id, name, image }) => add({ id, name, image })}
          placeholder="sumar organizador por nombre"
          disabled={isPending}
        />
      )}

      {organizers.length === 0 ? (
        <p className="border border-dashed border-pcnGreen-200 py-8 text-center font-mono text-xs text-muted-foreground">
          Este evento todavía no tiene organizadores.
        </p>
      ) : (
        <RuledGrid className="grid-cols-1">
          {organizers.map((organizer) => (
            <div
              key={organizer.id}
              className={cn(ruledCellClassName, 'flex items-center gap-2 px-3 py-2')}
            >
              <PersonLink person={organizer} className="flex-1" />
              {canManage && (
                <button
                  type="button"
                  onClick={() => remove(organizer)}
                  disabled={isPending}
                  aria-label={`Quitar a ${organizer.name}`}
                  className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </RuledGrid>
      )}

      <p className="font-mono text-[11px] text-muted-foreground">
        <span className="text-pcnGreen-500">{'// '}</span>
        Los organizadores pueden editar el evento, ver sus inscripciones, charlas y propuestas, y el
        evento aparece en su perfil.
      </p>
    </div>
  );
}
