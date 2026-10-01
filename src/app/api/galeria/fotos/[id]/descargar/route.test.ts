import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { mockHeaders } from '@/test/headers';
import { enforceRateLimit, resetRateLimits } from '@/lib/rate-limit';
import { getObjectBuffer } from '@/lib/s3';
import { GET } from './route';

jest.mock('@/lib/s3', () => ({
  CLOUDFRONT_URL: 'https://cdn.example.com',
  getObjectBuffer: jest.fn().mockResolvedValue(Buffer.from('webp')),
}));
jest.mock('@/lib/photo-signing', () => ({
  isSignedGallerySrc: (src: string) => src.startsWith('https://cdn.example.com/gallery/'),
}));

const download = () =>
  GET(new Request('http://localhost/api/galeria/fotos/photo-123456/descargar'), {
    params: Promise.resolve({ id: 'photo-123456' }),
  });

describe('GET /api/galeria/fotos/[id]/descargar', () => {
  beforeEach(() => {
    resetRateLimits();
    mockCookies({});
    mockHeaders({ 'x-forwarded-for': '5.6.7.8' });
    prismaMock.photo.findUnique.mockResolvedValue({
      id: 'photo-123456',
      src: 'https://cdn.example.com/gallery/abc/full.webp',
      takenAt: new Date(2026, 4, 12),
    } as any);
  });

  it('streams the photo from S3 as an attachment', async () => {
    const response = await download();

    expect(response.status).toBe(200);
    expect(getObjectBuffer).toHaveBeenCalledWith('gallery/abc/full.webp');
    expect(response.headers.get('content-type')).toBe('image/webp');
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename="pcn-2026-05-12-123456.webp"',
    );
    expect(await response.text()).toBe('webp');
  });

  it('serves the historical photos from /public', async () => {
    prismaMock.photo.findUnique.mockResolvedValue({
      id: 'legacy-5',
      src: '/photos/agus-talk.webp',
      takenAt: new Date(2024, 9, 16),
    } as any);

    const response = await download();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain('agus-talk.webp');
  });

  it('never reads outside /public', async () => {
    prismaMock.photo.findUnique.mockResolvedValue({
      id: 'x',
      src: '/../.env',
      takenAt: new Date(),
    } as any);

    expect((await download()).status).toBe(404);
  });

  it('rate limits downloads', async () => {
    (enforceRateLimit as jest.Mock).mockRejectedValueOnce(new Error('RATE_LIMIT:120'));

    const response = await download();

    expect(enforceRateLimit).toHaveBeenCalledWith('photoDownload');
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('120');
    expect(prismaMock.photo.findUnique).not.toHaveBeenCalled();
  });
});
