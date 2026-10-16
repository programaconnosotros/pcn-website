import { summarizeSponsorClicks } from './sponsor-clicks-report';

const group = (
  name: string,
  eventId: string | null,
  source: string,
  count: number,
  last = '2026-10-01T12:00:00Z',
) => ({ name, eventId, source, _count: { _all: count }, _max: { createdAt: new Date(last) } });

describe('summarizeSponsorClicks', () => {
  it('adds up each sponsor across places, most clicked first, keeping partners without clicks', () => {
    const rows = summarizeSponsorClicks(
      [
        group('Dizenz', null, 'inicio', 5, '2026-10-02T12:00:00Z'),
        group('Dizenz', null, 'partners', 2, '2026-10-05T12:00:00Z'),
        group('Acme', 'e1', 'evento', 9),
        group('Acme', 'e2', 'evento', 1),
      ],
      [
        { name: 'Dizenz', eventId: null, _count: { _all: 3 } },
        { name: 'Acme', eventId: 'e1', _count: { _all: 4 } },
      ],
      ['Dizenz', 'Xetro'],
      { e1: 'Meetup' },
    );

    expect(rows.map((row) => [row.name, row.event?.name ?? null, row.total, row.recent])).toEqual([
      ['Acme', 'Meetup', 9, 4],
      ['Dizenz', null, 7, 3],
      ['Acme', 'evento borrado', 1, 0],
      ['Xetro', null, 0, 0],
    ]);
    expect(rows[1].bySource).toEqual({ inicio: 5, partners: 2 });
    expect(rows[1].lastClickAt).toEqual(new Date('2026-10-05T12:00:00Z'));
    expect(rows[3].lastClickAt).toBeNull();
  });
});
