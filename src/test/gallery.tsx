// Fixtures for the photo gallery component tests.
import type { GalleryTile } from '@/lib/gallery';

export const buildTile = (overrides: Partial<GalleryTile> = {}): GalleryTile => ({
  id: 'photo-abc123',
  kind: 'PHOTO',
  durationSeconds: null,
  src: 'gallery/photo.webp',
  thumbSrc: 'gallery/photo-thumb.webp',
  thumbUrl: 'https://cdn.dev/thumb.webp',
  fullUrl: 'https://cdn.dev/full.webp',
  takenAt: new Date(2030, 4, 10, 20, 30),
  description: null,
  event: null,
  tags: [],
  ...overrides,
});
