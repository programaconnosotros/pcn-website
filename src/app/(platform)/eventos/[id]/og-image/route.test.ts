import { fetchEvent } from '@/actions/events/fetch-event';
import { renderTerminalCard } from '@/lib/og/terminal-card';
import { GET } from './route';

jest.mock('@/actions/events/fetch-event', () => ({ fetchEvent: jest.fn() }));
jest.mock('@/lib/og/terminal-card', () => ({
  renderTerminalCard: jest.fn(async () => new Response('png')),
}));

const event = {
  id: 'e1',
  name: 'Meetup',
  description: 'Charlas y pizza',
  date: new Date('2026-05-03T22:00:00Z'),
  isOnline: false,
  placeName: 'Cowork',
  city: 'Córdoba',
};

const get = (id = 'e1') => GET(new Request('http://test'), { params: Promise.resolve({ id }) });

describe('GET /eventos/[id]/og-image', () => {
  it('returns 404 for an event that does not exist', async () => {
    jest.mocked(fetchEvent).mockResolvedValue(null as never);
    const response = await get('missing');
    expect(response.status).toBe(404);
    expect(fetchEvent).toHaveBeenCalledWith('missing');
    expect(renderTerminalCard).not.toHaveBeenCalled();
  });

  it('renders the card with the date in Argentina time and the place', async () => {
    jest.mocked(fetchEvent).mockResolvedValue(event as never);
    expect(await (await get()).text()).toBe('png');
    const card = jest.mocked(renderTerminalCard).mock.calls[0][0];
    expect(card).toMatchObject({
      path: 'eventos',
      command: 'cat evento.md',
      title: 'Meetup',
      description: 'Charlas y pizza',
    });
    expect(card.meta).toHaveLength(2);
    expect(card.meta![0]).toMatch(/3 de mayo.*19:00/);
    expect(card.meta![1]).toBe('Cowork');
  });

  it('says online for an online event', async () => {
    jest.mocked(fetchEvent).mockResolvedValue({ ...event, isOnline: true } as never);
    await get();
    expect(jest.mocked(renderTerminalCard).mock.calls[0][0].meta![1]).toBe('online');
  });

  it('falls back to the city, and to no place at all', async () => {
    jest.mocked(fetchEvent).mockResolvedValue({ ...event, placeName: null } as never);
    await get();
    expect(jest.mocked(renderTerminalCard).mock.calls[0][0].meta![1]).toBe('Córdoba');

    jest.mocked(fetchEvent).mockResolvedValue({ ...event, placeName: '', city: null } as never);
    await get();
    expect(jest.mocked(renderTerminalCard).mock.calls[1][0].meta).toHaveLength(1);
  });
});
