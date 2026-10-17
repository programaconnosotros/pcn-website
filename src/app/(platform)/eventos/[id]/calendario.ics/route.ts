import { fetchEvent } from '@/actions/events/fetch-event';
import { createIcsFile } from '@/lib/ics';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await fetchEvent(id);

  if (!event) return new Response('Not found', { status: 404 });

  return new Response(createIcsFile(event), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="pcn-evento-${event.id}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
