// Quién puede crear, editar y eliminar eventos. Los admins pueden todo; los ambassadors
// crean eventos, editan los que crearon o en los que figuran como administradores, y solo
// eliminan los que crearon.

type EventUser = { id: string; role: string; isAmbassador: boolean };
type EventOwnership = {
  createdById: string | null;
  deletedAt?: Date | null;
  admins: { userId: string }[];
};

const isAdmin = (user: EventUser | null | undefined) => user?.role === 'ADMIN';

export function canCreateEvents(user: EventUser | null | undefined): user is EventUser {
  return !!user && (isAdmin(user) || user.isAmbassador);
}

const isEventCreator = (user: EventUser, event: EventOwnership) =>
  user.isAmbassador && !event.deletedAt && event.createdById === user.id;

export function canEditEvent(user: EventUser | null | undefined, event: EventOwnership) {
  if (isAdmin(user)) return true;
  if (!user?.isAmbassador || event.deletedAt) return false;
  return isEventCreator(user, event) || event.admins.some((admin) => admin.userId === user.id);
}

// Eliminar el evento y elegir sus administradores queda para quien lo creó.
export function canDeleteEvent(user: EventUser | null | undefined, event: EventOwnership) {
  if (isAdmin(user)) return true;
  return !!user && isEventCreator(user, event);
}

export const canManageEventAdmins = canDeleteEvent;
