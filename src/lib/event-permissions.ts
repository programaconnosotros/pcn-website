// Quién puede crear, editar y eliminar eventos. Los admins pueden todo; los ambassadors
// crean eventos, editan los que crearon y solo eliminan los que crearon. Cualquier usuario
// que figure como organizador de un evento puede editarlo y gestionarlo.

type EventUser = { id: string; role: string; isAmbassador: boolean };
type EventOwnership = {
  createdById: string | null;
  deletedAt?: Date | null;
  organizers: { userId: string }[];
};

export const isSiteAdmin = (user: EventUser | null | undefined) => user?.role === 'ADMIN';

export function canCreateEvents(user: EventUser | null | undefined): user is EventUser {
  return !!user && (isSiteAdmin(user) || user.isAmbassador);
}

const isEventCreator = (user: EventUser, event: EventOwnership) =>
  user.isAmbassador && !event.deletedAt && event.createdById === user.id;

// Editar el evento y gestionar sus inscripciones, charlas y propuestas.
export function canEditEvent(user: EventUser | null | undefined, event: EventOwnership) {
  if (isSiteAdmin(user)) return true;
  if (!user || event.deletedAt) return false;
  return (
    isEventCreator(user, event) ||
    event.organizers.some((organizer) => organizer.userId === user.id)
  );
}

// Eliminar el evento y elegir sus organizadores queda para quien lo creó.
export function canDeleteEvent(user: EventUser | null | undefined, event: EventOwnership) {
  if (isSiteAdmin(user)) return true;
  return !!user && isEventCreator(user, event);
}

export const canManageEventOrganizers = canDeleteEvent;
