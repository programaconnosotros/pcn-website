import { prismaMock } from '@/test/prisma';
import { HISTORIA_FLYERS } from '@/components/historia/event-flyers';
import { getHistoriaEvents } from './historia-events';

describe('getHistoriaEvents', () => {
  it('returns the flyer events with their photos and photo count', async () => {
    const date = new Date('2023-05-01T20:00:00Z');
    prismaMock.event.findMany.mockResolvedValue([
      {
        id: 'e1',
        name: 'Lightning Talks',
        date,
        flyerImages: ['f.jpg'],
        galleryItems: [{ id: 'p1', thumbSrc: 't.jpg', description: null }],
        _count: { galleryItems: 12 },
      },
    ] as any);

    await expect(getHistoriaEvents()).resolves.toEqual([
      {
        id: 'e1',
        name: 'Lightning Talks',
        date,
        flyerImages: ['f.jpg'],
        photos: [{ id: 'p1', thumbSrc: 't.jpg', description: null }],
        photoCount: 12,
      },
    ]);
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, flyerImages: { hasSome: Object.values(HISTORIA_FLYERS) } },
      }),
    );
  });

  it('returns no events instead of failing when the database errors', async () => {
    prismaMock.event.findMany.mockRejectedValue(new Error('db down'));
    await expect(getHistoriaEvents()).resolves.toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      'historia: failed to load the events',
      expect.any(Error),
    );
  });
});
