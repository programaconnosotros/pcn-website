import { listRandomGalleryPhotos } from '@/lib/gallery';
import { GET } from './route';

jest.mock('@/lib/gallery', () => ({ listRandomGalleryPhotos: jest.fn() }));

describe('GET /api/galeria/aleatorias', () => {
  it('answers a fresh sample of 40 photos that is never cached', async () => {
    jest
      .mocked(listRandomGalleryPhotos)
      .mockResolvedValue([{ id: 'a', thumbUrl: 'https://cdn.example.com/a.webp' }]);

    const response = await GET();

    expect(listRandomGalleryPhotos).toHaveBeenCalledWith(40);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({
      photos: [{ id: 'a', thumbUrl: 'https://cdn.example.com/a.webp' }],
    });
  });

  it('answers an empty list when the gallery has no photos', async () => {
    jest.mocked(listRandomGalleryPhotos).mockResolvedValue([]);

    expect(await (await GET()).json()).toEqual({ photos: [] });
  });
});
