import { fetchPublicTalks } from './fetch-public-talks';
import { prismaMock } from '@/test/prisma';

const makeDate = (iso: string) => new Date(iso);

const talkWithEvent = (id: string, eventDate: string) => ({
  id,
  title: `Talk ${id}`,
  createdAt: makeDate('2025-01-01'),
  manualEventDate: null,
  event: {
    id: `event-${id}`,
    name: 'Some Event',
    date: makeDate(eventDate),
    placeName: 'Place',
    city: 'City',
    isOnline: false,
  },
  speakers: [],
});

const talkWithManualDate = (id: string, manualDate: string) => ({
  id,
  title: `Talk ${id}`,
  createdAt: makeDate('2025-01-01'),
  manualEventDate: makeDate(manualDate),
  event: null,
  speakers: [],
});

const talkWithNoDate = (id: string, createdAt: string) => ({
  id,
  title: `Talk ${id}`,
  createdAt: makeDate(createdAt),
  manualEventDate: null,
  event: null,
  speakers: [],
});

describe('fetchPublicTalks', () => {
  it('returns an empty array when there are no talks', async () => {
    prismaMock.talk.findMany.mockResolvedValue([]);
    const result = await fetchPublicTalks();
    expect(result).toEqual([]);
  });

  it('sorts talks by event date descending', async () => {
    const older = talkWithEvent('older', '2024-01-01');
    const newer = talkWithEvent('newer', '2025-06-01');
    prismaMock.talk.findMany.mockResolvedValue([older, newer] as any);

    const result = await fetchPublicTalks();

    expect(result[0].id).toBe('newer');
    expect(result[1].id).toBe('older');
  });

  it('places talks with a date before talks without a date', async () => {
    const withDate = talkWithEvent('withDate', '2024-01-01');
    const noDate = talkWithNoDate('noDate', '2025-06-01');
    prismaMock.talk.findMany.mockResolvedValue([noDate, withDate] as any);

    const result = await fetchPublicTalks();

    expect(result[0].id).toBe('withDate');
    expect(result[1].id).toBe('noDate');
  });

  it('sorts talks without any date by createdAt descending', async () => {
    const older = talkWithNoDate('older', '2024-01-01');
    const newer = talkWithNoDate('newer', '2025-06-01');
    prismaMock.talk.findMany.mockResolvedValue([older, newer] as any);

    const result = await fetchPublicTalks();

    expect(result[0].id).toBe('newer');
    expect(result[1].id).toBe('older');
  });

  it('uses manualEventDate when event is null', async () => {
    const manual = talkWithManualDate('manual', '2025-03-01');
    const withEvent = talkWithEvent('withEvent', '2024-01-01');
    prismaMock.talk.findMany.mockResolvedValue([withEvent, manual] as any);

    const result = await fetchPublicTalks();

    // manual (2025-03-01) is newer than withEvent (2024-01-01)
    expect(result[0].id).toBe('manual');
    expect(result[1].id).toBe('withEvent');
  });
});
