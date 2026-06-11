import { prismaMock } from '@/test/prisma';
import { getEventAnnouncements } from './get-event-announcements';

const eventAnnouncement = {
  id: 'ann-1',
  title: 'Event Announcement',
  content: 'Content about the event.',
  category: 'evento',
  pinned: false,
  published: true,
  authorId: 'user-admin',
  eventId: 'event-1',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  author: { id: 'user-admin', name: 'Admin', image: null },
};

describe('getEventAnnouncements', () => {
  it('returns published announcements for the given event', async () => {
    prismaMock.announcement.findMany.mockResolvedValue([eventAnnouncement] as any);

    const result = await getEventAnnouncements('event-1');

    expect(result).toEqual([eventAnnouncement]);
    expect(prismaMock.announcement.findMany).toHaveBeenCalledWith({
      where: { eventId: 'event-1', published: true },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  });

  it('returns an empty array when there are no announcements for the event', async () => {
    prismaMock.announcement.findMany.mockResolvedValue([]);

    const result = await getEventAnnouncements('event-empty');

    expect(result).toEqual([]);
  });
});
