import { prismaMock } from '@/test/prisma';
import { findNextEventByShortcut, slugToLabel } from './event-shortcuts';

describe('findNextEventByShortcut', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-06-01T12:00:00Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('looks up the nearest upcoming or ongoing event with the slug, case-insensitively', async () => {
    const event = { id: 'e1', shortcut: 'cowork', galleryItems: [] };
    prismaMock.event.findFirst.mockResolvedValue(event as any);

    await expect(findNextEventByShortcut('CoWork')).resolves.toBe(event);

    const now = new Date('2025-06-01T12:00:00Z');
    expect(prismaMock.event.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          shortcut: 'cowork',
          OR: [{ date: { gte: now } }, { endDate: { gte: now } }],
        },
        orderBy: { date: 'asc' },
      }),
    );
  });

  it('returns null when no upcoming event uses the slug', async () => {
    prismaMock.event.findFirst.mockResolvedValue(null);
    await expect(findNextEventByShortcut('nada')).resolves.toBeNull();
  });
});

describe('slugToLabel', () => {
  it('capitalizes the first letter', () => {
    expect(slugToLabel('nextgen')).toBe('Nextgen');
    expect(slugToLabel('dev-meetup')).toBe('Dev-meetup');
  });

  it('handles an empty slug', () => {
    expect(slugToLabel('')).toBe('');
  });
});
