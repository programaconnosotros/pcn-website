'use server';

import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { canCreateEvents, canEditEvent } from '@/lib/event-permissions';

// Esta función permite obtener eventos incluso si están eliminados
// para que los admins puedan editarlos. Los ambassadors solo obtienen los que pueden editar.
export const fetchEventForEdit = async (id: string) => {
  const session = await getCurrentSession();
  if (!canCreateEvents(session?.user)) throw new Error('No autorizado');

  const event = await prisma.event.findUnique({
    where: {
      id: id,
    },
    include: {
      images: true,
      sponsors: true,
      admins: {
        select: { userId: true, user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (event && !canEditEvent(session?.user, event)) throw new Error('No autorizado');

  return event;
};
