import { prismaMock } from '@/test/prisma';
import { requireAdmin } from '@/lib/admin';
import { fetchAnnouncements, fetchAllAnnouncements } from './get-announcements';

jest.mock('@/lib/admin', () => ({ requireAdmin: jest.fn() }));

const publishedAnnouncement = {
  id: 'ann-1',
  title: 'Published Announcement',
  content: 'Content here.',
  category: 'general',
  pinned: false,
  published: true,
  authorId: 'user-admin',
  eventId: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  author: { id: 'user-admin', name: 'Admin', image: null },
};

const unpublishedAnnouncement = {
  ...publishedAnnouncement,
  id: 'ann-2',
  title: 'Unpublished Announcement',
  published: false,
};

describe('fetchAnnouncements', () => {
  it('returns published announcements ordered by pinned then date', async () => {
    prismaMock.announcement.findMany.mockResolvedValue([publishedAnnouncement] as any);

    const result = await fetchAnnouncements();

    expect(result).toEqual([publishedAnnouncement]);
    expect(prismaMock.announcement.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  });

  it('returns an empty array when there are no published announcements', async () => {
    prismaMock.announcement.findMany.mockResolvedValue([]);

    const result = await fetchAnnouncements();

    expect(result).toEqual([]);
  });
});

describe('fetchAllAnnouncements', () => {
  it('refuses anyone who is not an admin, since it includes drafts', async () => {
    (requireAdmin as jest.Mock).mockRejectedValueOnce(new Error('No autorizado'));

    await expect(fetchAllAnnouncements()).rejects.toThrow('No autorizado');
    expect(prismaMock.announcement.findMany).not.toHaveBeenCalled();
  });

  it('returns all announcements including unpublished', async () => {
    prismaMock.announcement.findMany.mockResolvedValue([
      publishedAnnouncement,
      unpublishedAnnouncement,
    ] as any);

    const result = await fetchAllAnnouncements();

    expect(result).toHaveLength(2);
    expect(prismaMock.announcement.findMany).toHaveBeenCalledWith({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  });

  it('returns an empty array when there are no announcements', async () => {
    prismaMock.announcement.findMany.mockResolvedValue([]);

    const result = await fetchAllAnnouncements();

    expect(result).toEqual([]);
  });
});
