'use server';

import prisma from '@/lib/prisma';

export const checkEventCapacity = async (eventId: string) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
    },
  });

  if (!event) {
    return { available: false, message: 'Evento no encontrado' };
  }

  // Si no tiene cupo definido, está disponible
  if (event.capacity === null) {
    return { available: true, current: 0, capacity: null };
  }

  const currentRegistrations = await prisma.eventRegistration.count({
    where: {
      eventId: eventId,
      cancelledAt: null, // Excluir inscripciones canceladas
    },
  });

  const available = currentRegistrations < event.capacity;

  return {
    available,
    current: currentRegistrations,
    capacity: event.capacity,
    message: available
      ? `Quedan ${event.capacity - currentRegistrations} lugares disponibles.`
      : 'El cupo del evento está completo',
  };
};
