/** Fecha y hora de un evento como la leen los avisos: "sábado, 15 de agosto de 2026, 15:00". */
export const formatEventWhen = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'full',
    timeStyle: 'short',
    hourCycle: 'h23',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date);

type EventPlace = {
  isOnline: boolean;
  placeName?: string | null;
  address?: string | null;
  city?: string | null;
};

/** Dónde es un evento, en una línea: "online" o "lugar, dirección, ciudad". */
export const formatEventWhere = (event: EventPlace) =>
  event.isOnline
    ? 'online'
    : [event.placeName, event.address, event.city].filter(Boolean).join(', ') || 'a confirmar';
