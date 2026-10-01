import { prismaMock } from '@/test/prisma';
import { mockHeaders } from '@/test/headers';
import { resetRateLimits, RATE_LIMITS } from '@/lib/rate-limit';
import { GET } from './route';

jest.mock('@/lib/photo-signing', () => ({
  signPhotoSrc: (src: string) => ({
    url: `${src}?Signature=x`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  }),
}));

const request = (size?: string) =>
  GET(new Request(`http://localhost/api/galeria/fotos/photo-1${size ? `?size=${size}` : ''}`), {
    params: Promise.resolve({ id: 'photo-1' }),
  });

describe('GET /api/galeria/fotos/[id]', () => {
  beforeEach(() => {
    resetRateLimits();
    mockHeaders({ 'x-forwarded-for': '1.2.3.4' });
    prismaMock.photo.findUnique.mockResolvedValue({
      src: 'https://cdn.example.com/gallery/a/full.webp',
      thumbSrc: 'https://cdn.example.com/gallery/a/thumb.webp',
    } as any);
  });

  it('redirects to the signed thumbnail by default, cacheable while it is valid', async () => {
    const response = await request();

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(
      'https://cdn.example.com/gallery/a/thumb.webp?Signature=x',
    );
    expect(response.headers.get('cache-control')).toMatch(/^private, max-age=35\d\d$/);
  });

  it('serves the full-size photo on request', async () => {
    const response = await request('full');

    expect(response.headers.get('location')).toContain('/gallery/a/full.webp');
  });

  it('returns 404 for unknown photos', async () => {
    prismaMock.photo.findUnique.mockResolvedValue(null);

    expect((await request()).status).toBe(404);
  });

  it('rate limits each IP', async () => {
    for (let i = 0; i < RATE_LIMITS.photoView.limit; i++) await request();

    const response = await request();
    expect(response.status).toBe(429);
    expect(Number(response.headers.get('retry-after'))).toBeGreaterThan(0);
  });
});
