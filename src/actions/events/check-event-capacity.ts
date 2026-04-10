'use server';

import { getCapacitySnapshot } from '@/actions/events/event-capacity';

export const checkEventCapacity = async (eventId: string) => {
  const snapshot = await getCapacitySnapshot(eventId);

  if (!snapshot) {
    return { available: false, message: 'Evento no encontrado' };
  }

  if (snapshot.capacity === null) {
    return { available: true, current: snapshot.current, capacity: null, waitlistCount: 0 };
  }

  const available = snapshot.available;

  return {
    available,
    current: snapshot.current,
    capacity: snapshot.capacity,
    waitlistCount: snapshot.waitlistCount,
    message: available
      ? `Quedan ${snapshot.capacity - snapshot.current} lugares disponibles.`
      : 'El cupo del evento está completo. Podés sumarte a la lista de espera.',
  };
};
