import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { mockHeaders } from '@/test/headers';
import { enforceRateLimit, resetRateLimits } from '@/lib/rate-limit';
import { getPresignedDownloadUrl } from '@/lib/s3';
import { GET } from './route';

jest.mock('@/lib/s3', () => ({
  CLOUDFRONT_URL: 'https://cdn.example.com',
  getPresignedDownloadUrl: jest.fn(
    async (key: string, fileName: string) => `https://s3.example.com/${key}?dl=${fileName}`,
  ),
}));
jest.mock('@/lib/gallery-signing', () => ({
  isSignedGallerySrc: (src: string) => src.startsWith('https://cdn.example.com/gallery/'),
}));

const download = () =>
  GET(new Request('http://localhost/api/galeria/photo-123456/descargar'), {
    params: Promise.resolve({ id: 'photo-123456' }),
  });

describe('GET /api/galeria/[id]/descargar', () => {
  beforeEach(() => {
    resetRateLimits();
    mockCookies({});
    mockHeaders({ 'x-forwarded-for': '5.6.7.8' });
    prismaMock.galleryItem.findFirst.mockResolvedValue({
      id: 'photo-123456',
      src: 'https://cdn.example.com/gallery/abc/full.webp',
      takenAt: new Date(2026, 4, 12),
    } as any);
  });

  it('answers uploaded files with a presigned S3 download URL', async () => {
    const response = await download();

    expect(response.status).toBe(200);
    expect(getPresignedDownloadUrl).toHaveBeenCalledWith(
      'gallery/abc/full.webp',
      'pcn-2026-05-12-123456.webp',
    );
    expect(await response.json()).toEqual({
      url: 'https://s3.example.com/gallery/abc/full.webp?dl=pcn-2026-05-12-123456.webp',
    });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('keeps the video extension in the file name', async () => {
    prismaMock.galleryItem.findFirst.mockResolvedValue({
      id: 'video-abcdef',
      src: 'https://cdn.example.com/gallery/xyz/video.mp4',
      takenAt: new Date(2026, 4, 12),
    } as any);

    await download();

    expect(getPresignedDownloadUrl).toHaveBeenCalledWith(
      'gallery/xyz/video.mp4',
      'pcn-2026-05-12-abcdef.mp4',
    );
  });

  it('serves photos stored in /public', async () => {
    prismaMock.galleryItem.findFirst.mockResolvedValue({
      id: 'legacy-5',
      src: '/photos/agus-talk.webp',
      takenAt: new Date(2024, 9, 16),
    } as any);

    const response = await download();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain('agus-talk.webp');
  });

  it('never reads outside /public', async () => {
    prismaMock.galleryItem.findFirst.mockResolvedValue({
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
    expect(prismaMock.galleryItem.findFirst).not.toHaveBeenCalled();
  });
});
