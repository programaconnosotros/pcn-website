import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { canEditEvent, isSiteAdmin } from '@/lib/event-permissions';

type SessionUser = { id: string; role: string; isAmbassador: boolean };

/**
 * Si el usuario puede gestionar el evento (editarlo, ver inscripciones, charlas y propuestas):
 * admins del sitio, quien lo creó siendo ambassador y sus organizadores.
 */
export async function canManageEventById(
  user: SessionUser | null | undefined,
  eventId: string | null | undefined,
) {
  if (!user) return false;
  if (isSiteAdmin(user)) return true;
  if (!eventId) return false;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdById: true, deletedAt: true, organizers: { select: { userId: true } } },
  });
  return !!event && canEditEvent(user, event);
}

/** El usuario logueado si puede gestionar el evento (sin evento, solo admins), o null. */
export async function getEventManager(eventId: string | null) {
  const user = (await getCurrentSession())?.user;
  return (await canManageEventById(user, eventId)) ? user! : null;
}

/** Para Server Actions: lanza un error salvo que quien llama gestione el evento. */
export async function requireEventManager(eventId: string | null) {
  const user = await getEventManager(eventId);
  if (!user) throw new Error('No autorizado');
  return user;
}

/** Admins, ambassadors u organizadores de al menos un evento. */
export async function canManageSomeEvent(user: SessionUser | null | undefined) {
  if (!user) return false;
  if (isSiteAdmin(user) || user.isAmbassador) return true;
  return (await prisma.eventOrganizer.count({ where: { userId: user.id } })) > 0;
}
