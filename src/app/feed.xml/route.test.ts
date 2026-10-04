import { prismaMock } from '@/test/prisma';
import { dynamic, GET } from './route';

const at = (iso: string) => new Date(iso);

const mockSources = ({
  announcements = [],
  events = [],
  talks = [],
}: {
  announcements?: unknown[];
  events?: unknown[];
  talks?: unknown[];
}) => {
  prismaMock.announcement.findMany.mockResolvedValue(announcements as never);
  prismaMock.event.findMany.mockResolvedValue(events as never);
  prismaMock.talk.findMany.mockResolvedValue(talks as never);
};

const items = (xml: string) => xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

describe('GET /feed.xml', () => {
  it('is built per request', () => {
    expect(dynamic).toBe('force-dynamic');
  });

  it('returns an empty RSS channel with cache headers when there is nothing', async () => {
    mockSources({});
    const response = await GET();
    expect(response.headers.get('Content-Type')).toBe('application/rss+xml; charset=utf-8');
    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=600, stale-while-revalidate=3600',
    );
    const xml = await response.text();
    expect(xml).toContain('<rss');
    expect(xml).toContain('/feed.xml');
    expect(items(xml)).toHaveLength(0);
  });

  it('only reads published announcements and events that were not deleted', async () => {
    mockSources({});
    await GET();
    expect(prismaMock.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { published: true }, take: 30 }),
    );
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null }, take: 30 }),
    );
  });

  it('lists announcements, events and talks newest first', async () => {
    mockSources({
      announcements: [
        {
          id: 'a1',
          title: 'Linked',
          content: 'x'.repeat(500),
          createdAt: at('2026-06-03T12:00:00Z'),
          eventId: 'e1',
        },
        {
          id: 'a2',
          title: 'Plain',
          content: 'Hola',
          createdAt: at('2026-06-01T12:00:00Z'),
          eventId: null,
        },
      ],
      events: [
        {
          id: 'e1',
          name: 'Meetup',
          description: 'Charlas',
          date: at('2026-06-10T22:00:00Z'),
          isOnline: false,
          placeName: 'Cowork',
          city: 'Córdoba',
          createdAt: at('2026-06-02T12:00:00Z'),
        },
        {
          id: 'e2',
          name: 'Remote',
          description: 'Por Meet',
          date: at('2026-06-11T22:00:00Z'),
          isOnline: true,
          placeName: null,
          city: null,
          createdAt: at('2026-05-30T12:00:00Z'),
        },
        {
          id: 'e3',
          name: 'TBD',
          description: '',
          date: at('2026-06-12T22:00:00Z'),
          isOnline: false,
          placeName: null,
          city: null,
          createdAt: at('2026-05-29T12:00:00Z'),
        },
      ],
      talks: [
        {
          id: 't1',
          title: 'Testing',
          description: 'Sobre tests',
          createdAt: at('2026-06-04T12:00:00Z'),
          speakers: [{ speakerName: 'Ana' }, { speakerName: 'Beto' }],
        },
        {
          id: 't2',
          title: 'Solo',
          description: 'Sin speakers',
          createdAt: at('2026-05-28T12:00:00Z'),
          speakers: [],
        },
      ],
    });
    const xml = await (await GET()).text();
    const list = items(xml);
    expect(list.map((item) => item.match(/<guid[^>]*>(.*)<\/guid>/)![1])).toEqual([
      'talk-t1',
      'announcement-a1',
      'event-e1',
      'announcement-a2',
      'event-e2',
      'event-e3',
      'talk-t2',
    ]);
    const [talk, linked, meetup, plain, remote, tbd, solo] = list;
    expect(talk).toContain('<title>Charla: Testing (Ana, Beto)</title>');
    expect(talk).toContain('/charlas</link>');
    expect(talk).toContain('<category>Charlas</category>');
    expect(solo).toContain('<title>Charla: Solo</title>');
    expect(linked).toContain('/eventos/e1</link>');
    // Long content is cut at 400 characters with an ellipsis.
    expect(linked).toContain(`<description>${'x'.repeat(399)}…</description>`);
    expect(plain).toContain('/anuncios</link>');
    expect(meetup).toContain('<title>Evento: Meetup</title>');
    expect(meetup).toMatch(/<description>.*2026.* · Cowork, Córdoba · Charlas<\/description>/);
    expect(remote).toContain(' · Online · Por Meet</description>');
    // No place and no description: just the date.
    expect(tbd).not.toContain(' · ');
  });
});
