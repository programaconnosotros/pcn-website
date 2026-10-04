import { articles } from '@/app/(platform)/lectura/articles';
import { isEmbeddable } from '@/lib/embeddable';
import { GET } from './route';

jest.mock('@/lib/embeddable', () => ({
  EMBED_CACHE_HEADERS: { 'Cache-Control': 'public, max-age=60' },
  isEmbeddable: jest.fn(),
}));

const mockIsEmbeddable = isEmbeddable as jest.Mock;
const get = (url?: string) =>
  GET(
    new Request(
      `http://localhost/api/lectura/embed${url === undefined ? '' : `?url=${encodeURIComponent(url)}`}`,
    ),
  );

describe('GET /api/lectura/embed', () => {
  it('says whether a listed article can be embedded, cacheably', async () => {
    mockIsEmbeddable.mockResolvedValue(true);
    const url = articles[0].url;

    const response = await get(url);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ embeddable: true });
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
    expect(mockIsEmbeddable).toHaveBeenCalledWith(url);
  });

  it('rejects a request without url', async () => {
    const response = await get();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Missing url parameter' });
  });

  it('refuses URLs that are not articles, so it cannot be used to probe other hosts', async () => {
    const response = await get('http://169.254.169.254/latest/meta-data');
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'URL not allowed' });
    expect(mockIsEmbeddable).not.toHaveBeenCalled();
  });
});
