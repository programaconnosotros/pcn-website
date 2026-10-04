import { fetchEvent } from '@/actions/events/fetch-event';
import { GET } from './route';

jest.mock('@/actions/events/fetch-event', () => ({ fetchEvent: jest.fn() }));

const get = (id = 'e1') => GET(new Request('http://test'), { params: Promise.resolve({ id }) });

describe('GET /eventos/[id]/calendario.ics', () => {
  it('returns 404 for an event that does not exist', async () => {
    jest.mocked(fetchEvent).mockResolvedValue(null as never);
    const response = await get('missing');
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not found');
  });

  it('downloads the event as an uncached calendar file', async () => {
    jest.mocked(fetchEvent).mockResolvedValue({
      id: 'e1',
      name: 'Meetup',
      description: 'Charlas',
      date: new Date('2026-05-03T22:00:00Z'),
      endDate: null,
      isOnline: false,
      placeName: 'Cowork',
      address: 'Calle 1',
      city: 'Córdoba',
    } as never);
    const response = await get();
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/calendar; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="pcn-evento-e1.ics"',
    );
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const ics = await response.text();
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('SUMMARY:Meetup');
    expect(ics).toContain('DTSTART:20260503T220000Z');
  });
});
