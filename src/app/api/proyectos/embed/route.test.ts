import { prismaMock } from '@/test/prisma';
import { isEmbeddable } from '@/lib/embeddable';
import { GET } from './route';

jest.mock('@/lib/embeddable', () => ({
  EMBED_CACHE_HEADERS: { 'Cache-Control': 'public, max-age=60' },
  isEmbeddable: jest.fn(),
}));

const mockIsEmbeddable = isEmbeddable as jest.Mock;
const get = (query = '') => GET(new Request(`http://localhost/api/proyectos/embed${query}`));

describe('GET /api/proyectos/embed', () => {
  it("checks the project's own URL from the database", async () => {
    prismaMock.project.findUnique.mockResolvedValue({ url: 'https://pcn.dev' } as any);
    mockIsEmbeddable.mockResolvedValue(false);

    const response = await get('?id=p1');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ embeddable: false });
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
    expect(prismaMock.project.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
      select: { url: true },
    });
    expect(mockIsEmbeddable).toHaveBeenCalledWith('https://pcn.dev');
  });

  it('rejects a request without id', async () => {
    const response = await get();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Missing id parameter' });
  });

  it('answers 404 for an unknown project', async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);
    const response = await get('?id=nope');
    expect(response.status).toBe(404);
    expect(mockIsEmbeddable).not.toHaveBeenCalled();
  });
});
