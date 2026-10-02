import { fetchEvent } from '@/actions/events/fetch-event';
import { renderTerminalCard } from '@/lib/og/terminal-card';

// Link-preview card for events without a flyer. Not an `opengraph-image` file because that
// would replace the flyer, which is the better preview when there is one.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await fetchEvent(id);

  if (!event) return new Response('Not found', { status: 404 });

  const date = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(event.date);
  const place = event.isOnline ? 'online' : event.placeName || event.city;

  return renderTerminalCard({
    path: 'eventos',
    command: 'cat evento.md',
    title: event.name,
    description: event.description,
    meta: [date, ...(place ? [place] : [])],
  });
}
