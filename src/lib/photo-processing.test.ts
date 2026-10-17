import sharp from 'sharp';
import {
  FULL_SIZE,
  POSTER_SIZE,
  THUMB_SIZE,
  optimizePhoto,
  optimizePoster,
} from './photo-processing';

const jpeg = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: '#04f4be' } })
    .jpeg()
    .toBuffer();

describe('optimizePhoto', () => {
  it('shrinks large photos into a webp and a thumbnail', async () => {
    const result = await optimizePhoto(await jpeg(4000, 3000));

    expect(result.width).toBe(FULL_SIZE);
    expect(result.height).toBe(1920);
    expect((await sharp(result.full).metadata()).format).toBe('webp');

    const thumb = await sharp(result.thumb).metadata();
    expect(thumb.format).toBe('webp');
    expect([thumb.width, thumb.height]).toEqual([THUMB_SIZE, 480]);
  });

  it('never enlarges small photos', async () => {
    const result = await optimizePhoto(await jpeg(800, 1200));

    expect([result.width, result.height]).toEqual([800, 1200]);
  });

  it('applies the EXIF rotation', async () => {
    const rotated = await sharp(await jpeg(400, 200))
      .withMetadata({ orientation: 6 })
      .toBuffer();

    const result = await optimizePhoto(rotated);

    expect([result.width, result.height]).toEqual([200, 400]);
  });
});

describe('optimizePoster', () => {
  it('shrinks a video frame into a webp poster', async () => {
    const poster = await sharp(await optimizePoster(await jpeg(3840, 2160))).metadata();

    expect(poster.format).toBe('webp');
    expect([poster.width, poster.height]).toEqual([POSTER_SIZE, 720]);
  });

  it('never enlarges small frames', async () => {
    const poster = await sharp(await optimizePoster(await jpeg(640, 360))).metadata();

    expect([poster.width, poster.height]).toEqual([640, 360]);
  });
});
