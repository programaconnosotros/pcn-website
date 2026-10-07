import { unseenFeedItems, type NotificationFeedItem } from './notification-center';

const item = (id: string, sortKey: string): NotificationFeedItem => ({
  id,
  kind: 'evento',
  title: id,
  href: `/eventos/${id}`,
  sortKey,
});

const items = [
  item('nuevo', '2026-10-06T12:00:00.000Z'),
  item('ayer', '2026-10-05T12:00:00.000Z'),
  item('viejo', '2026-09-01T12:00:00.000Z'),
];

describe('unseenFeedItems', () => {
  it('returns what came after the newest item already seen', () => {
    expect(unseenFeedItems(items, '2026-10-05T12:00:00.000Z').map((i) => i.id)).toEqual(['nuevo']);
    expect(unseenFeedItems(items, '2026-10-06T12:00:00.000Z')).toEqual([]);
  });

  it('counts the last few days as new on a first visit', () => {
    const now = new Date('2026-10-07T00:00:00.000Z').getTime();
    expect(unseenFeedItems(items, null, now).map((i) => i.id)).toEqual(['nuevo', 'ayer']);
  });
});
