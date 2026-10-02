export type CalendarEvent = {
  id: string;
  name: string;
  description: string;
  date: Date;
  endDate: Date | null;
  isOnline: boolean;
  streamingUrl: string | null;
  placeName: string | null;
  address: string | null;
  city: string | null;
};

const EVENT_TIME_ZONE = 'America/Argentina/Buenos_Aires';
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

function utcDateTime(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

export function createGoogleCalendarUrl(event: CalendarEvent): string {
  const hasEndTime = event.endDate !== null && event.endDate > event.date;
  const endDate = hasEndTime
    ? event.endDate!
    : new Date(event.date.getTime() + DEFAULT_DURATION_MS);
  const eventUrl = `https://programaconnosotros.com/eventos/${event.id}`;
  const location = event.isOnline
    ? event.streamingUrl
    : [event.placeName, event.address, event.city].filter(Boolean).join(', ');
  const details = [
    event.description,
    event.streamingUrl && `Transmisión: ${event.streamingUrl}`,
    !hasEndTime && 'Hora de finalización no definida. Ajustá la duración antes de guardar.',
    eventUrl,
  ]
    .filter(Boolean)
    .join('\n\n');
  const url = new URL('https://calendar.google.com/calendar/r/eventedit');

  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('dates', `${utcDateTime(event.date)}/${utcDateTime(endDate)}`);
  url.searchParams.set('stz', EVENT_TIME_ZONE);
  url.searchParams.set('etz', EVENT_TIME_ZONE);
  url.searchParams.set('text', event.name);
  url.searchParams.set('details', details);
  if (location) url.searchParams.set('location', location);

  return url.toString();
}
