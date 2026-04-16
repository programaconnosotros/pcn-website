'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

type CancelWaitlistParams = {
  eventId: string;
};

export const cancelWaitlist = async (params: CancelWaitlistParams) => {
  const { eventId } = params;

  // Verificar autenticación
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session?.user) {
    throw new Error('No autorizado');
  }

  const waitlistEntry = await prisma.waitlistEntry.findFirst({
    where: { eventId, userId: session.userId },
    include: { event: { select: { name: true, deletedAt: true } } },
  });

  if (!waitlistEntry || waitlistEntry.event.deletedAt !== null) {
    throw new Error('No estás en la lista de espera de este evento');
  }

  await prisma.waitlistEntry.delete({ where: { id: waitlistEntry.id } });

  await notifyAdmins({
    type: 'event_waitlist_cancelled',
    title: 'Salida de lista de espera',
    message: `${session.user.name} salió de la lista de espera del evento "${waitlistEntry.event.name}"`,
    metadata: {
      eventId,
      eventName: waitlistEntry.event.name,
      userName: session.user.name,
      userEmail: session.user.email,
    },
  });

  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
};
