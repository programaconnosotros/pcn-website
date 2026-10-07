import { prismaMock } from '@/test/prisma';
import {
  getEventCover,
  getEventMemories,
  getGalleryFilterOptions,
  getGalleryItem,
  getGalleryNeighbours,
  listGalleryItems,
  listLatestGalleryItems,
  listRandomGalleryPhotos,
  listStoryCardPhotos,
  visibleGalleryItem,
} from './gallery';
import { galleryDownloadUrl } from './gallery-urls';

// Without AWS_CLOUDFRONT_URL nothing is signed: thumbUrl/fullUrl are the stored paths.
const tile = (id: string) => ({ id, src: `/full/${id}.webp`, thumbSrc: `/thumb/${id}.webp` });

const findMany = () => prismaMock.galleryItem.findMany;

afterEach(() => jest.restoreAllMocks());

describe('listGalleryItems', () => {
  it('lists every visible item and signs its URLs', async () => {
    findMany().mockResolvedValue([tile('a')] as never);

    const items = await listGalleryItems();

    expect(items).toEqual([{ ...tile('a'), thumbUrl: '/thumb/a.webp', fullUrl: '/full/a.webp' }]);
    expect(findMany().mock.calls[0][0]?.where).toEqual(visibleGalleryItem);
  });

  it.each([
    [{ type: 'fotos' as const }, { kind: 'PHOTO' }],
    [{ type: 'videos' as const }, { kind: 'VIDEO' }],
    [{ eventId: 'e1' }, { eventId: 'e1' }],
    [{ userId: 'u1' }, { tags: { some: { userId: 'u1' } } }],
  ])('filters by %j', async (filter, where) => {
    findMany().mockResolvedValue([] as never);

    await listGalleryItems(filter);

    expect(findMany().mock.calls[0][0]?.where).toEqual({ ...visibleGalleryItem, ...where });
  });
});

describe('getGalleryFilterOptions', () => {
  it('flattens the counts of events and people', async () => {
    const date = new Date('2026-01-01T00:00:00Z');
    prismaMock.event.findMany.mockResolvedValue([
      { id: 'e1', name: 'Meetup', date, _count: { galleryItems: 4 } },
    ] as never);
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'u1', name: 'Agus', _count: { galleryTags: 2 } },
    ] as never);

    await expect(getGalleryFilterOptions()).resolves.toEqual({
      events: [{ id: 'e1', name: 'Meetup', date, count: 4 }],
      people: [{ id: 'u1', name: 'Agus', count: 2 }],
    });
  });
});

describe('getGalleryItem', () => {
  it('returns the signed item', async () => {
    prismaMock.galleryItem.findFirst.mockResolvedValue(tile('a') as never);

    await expect(getGalleryItem('a')).resolves.toMatchObject({
      id: 'a',
      thumbUrl: '/thumb/a.webp',
    });
    expect(prismaMock.galleryItem.findFirst.mock.calls[0][0]?.where).toEqual({
      id: 'a',
      ...visibleGalleryItem,
    });
  });

  it('returns null when it does not exist or is hidden', async () => {
    prismaMock.galleryItem.findFirst.mockResolvedValue(null);

    await expect(getGalleryItem('missing')).resolves.toBeNull();
  });
});

describe('getGalleryNeighbours', () => {
  beforeEach(() => findMany().mockResolvedValue([tile('a'), tile('b'), tile('c')] as never));

  it('returns the previous and next ids, with their signed files to preload', async () => {
    await expect(getGalleryNeighbours('b')).resolves.toEqual({
      previousId: 'a',
      nextId: 'c',
      previous: expect.objectContaining({
        id: 'a',
        thumbUrl: '/thumb/a.webp',
        fullUrl: '/full/a.webp',
      }),
      next: expect.objectContaining({ id: 'c', fullUrl: '/full/c.webp' }),
      index: 1,
      total: 3,
    });
  });

  it('wraps around at both ends', async () => {
    await expect(getGalleryNeighbours('a')).resolves.toMatchObject({
      previousId: 'c',
      nextId: 'b',
    });
    await expect(getGalleryNeighbours('c')).resolves.toMatchObject({
      previousId: 'b',
      nextId: 'a',
    });
  });

  it('has no neighbours when the item is not in the filtered list', async () => {
    await expect(getGalleryNeighbours('z', { type: 'videos' })).resolves.toEqual({
      previousId: null,
      nextId: null,
      previous: null,
      next: null,
      index: -1,
      total: 3,
    });
  });

  it('has no neighbours when it is the only item', async () => {
    findMany().mockResolvedValue([tile('a')] as never);

    await expect(getGalleryNeighbours('a')).resolves.toEqual({
      previousId: null,
      nextId: null,
      previous: null,
      next: null,
      index: 0,
      total: 1,
    });
  });
});

describe('getEventMemories', () => {
  it('counts photos and videos and signs the items', async () => {
    findMany().mockResolvedValue([tile('a')] as never);
    (prismaMock.galleryItem.groupBy as unknown as jest.Mock).mockResolvedValue([
      { kind: 'PHOTO', _count: 5 },
    ] as never);
    prismaMock.user.findMany.mockResolvedValue([{ id: 'u1', name: 'Agus', image: null }] as never);

    const memories = await getEventMemories('e1', 10);

    expect(memories).toEqual({
      items: [{ ...tile('a'), thumbUrl: '/thumb/a.webp', fullUrl: '/full/a.webp' }],
      photoCount: 5,
      videoCount: 0,
      people: [{ id: 'u1', name: 'Agus', image: null }],
    });
    expect(findMany().mock.calls[0][0]).toMatchObject({
      where: { ...visibleGalleryItem, eventId: 'e1' },
      take: 10,
    });
  });
});

describe('getEventCover', () => {
  const photo = (id: string, width: number | null, height: number | null) => ({
    ...tile(id),
    width,
    height,
  });

  it('uses the photo an admin chose', async () => {
    findMany().mockResolvedValue([photo('a', 1600, 900), photo('b', 900, 1600)] as never);

    const cover = await getEventCover('e1', 'b');

    expect(cover.chosenId).toBe('b');
    expect(cover.covers.map((c) => c.id)).toEqual(['b']);
    expect(cover.photos).toHaveLength(2);
  });

  it('falls back to landscape photos when the chosen one is gone', async () => {
    findMany().mockResolvedValue([
      photo('wide', 1600, 900),
      photo('tall', 900, 1600),
      photo('square', 1000, 1000),
      photo('unknown', null, null),
    ] as never);

    const cover = await getEventCover('e1', 'deleted');

    expect(cover.chosenId).toBeNull();
    expect(cover.covers.map((c) => c.id)).toEqual(['wide']);
  });

  it('shuffles the landscape photos and keeps at most `take`', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    findMany().mockResolvedValue(['a', 'b', 'c', 'd'].map((id) => photo(id, 2000, 1000)) as never);

    const cover = await getEventCover('e1', null, 2);

    expect(cover.covers).toHaveLength(2);
    expect(cover.covers.map((c) => c.id)).toEqual(['b', 'c']);
  });

  it('has no covers for an event without photos', async () => {
    findMany().mockResolvedValue([] as never);

    await expect(getEventCover('e1', null)).resolves.toEqual({
      chosenId: null,
      covers: [],
      photos: [],
    });
  });
});

describe('listLatestGalleryItems', () => {
  it('takes the newest uploads and signs them', async () => {
    findMany().mockResolvedValue([tile('a')] as never);

    await expect(listLatestGalleryItems(3)).resolves.toEqual([
      { ...tile('a'), thumbUrl: '/thumb/a.webp', fullUrl: '/full/a.webp' },
    ]);
    expect(findMany().mock.calls[0][0]).toMatchObject({ take: 3 });
  });
});

describe('listRandomGalleryPhotos', () => {
  it('returns `take` distinct photos with their thumbnail URL', async () => {
    findMany().mockResolvedValue(['a', 'b', 'c', 'd', 'e'].map(tile) as never);

    const photos = await listRandomGalleryPhotos(3);

    expect(photos).toHaveLength(3);
    expect(new Set(photos.map((p) => p.id)).size).toBe(3);
    for (const p of photos) expect(p.thumbUrl).toBe(`/thumb/${p.id}.webp`);
  });

  it('returns every photo when there are fewer than `take`', async () => {
    findMany().mockResolvedValue([tile('a')] as never);

    await expect(listRandomGalleryPhotos(40)).resolves.toEqual([
      { id: 'a', thumbUrl: '/thumb/a.webp' },
    ]);
  });
});

describe('listStoryCardPhotos', () => {
  it('deals distinct files into two pools that never share a photo', async () => {
    findMany().mockResolvedValue([
      ...['a', 'b', 'c', 'd', 'e', 'f'].map(tile),
      // Same file as "a": must not appear twice.
      { id: 'dup', src: '/full/a.webp', thumbSrc: '/thumb/dup.webp' },
    ] as never);

    const { historia, galeria } = await listStoryCardPhotos(2);

    expect(historia).toHaveLength(2);
    expect(galeria).toHaveLength(2);
    expect(new Set([...historia, ...galeria]).size).toBe(4);
  });

  it('returns empty pools without photos', async () => {
    findMany().mockResolvedValue([] as never);

    await expect(listStoryCardPhotos()).resolves.toEqual({ historia: [], galeria: [] });
  });
});

describe('galleryDownloadUrl', () => {
  it('points at the rate-limited download route', () => {
    expect(galleryDownloadUrl('abc')).toBe('/api/galeria/abc/descargar');
  });
});
