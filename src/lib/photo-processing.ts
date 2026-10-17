import sharp from 'sharp';

/** Longest edge of the full-size photo and of the grid thumbnail, in pixels. */
export const FULL_SIZE = 2560;
export const THUMB_SIZE = 640;

const resize = { fit: 'inside', withoutEnlargement: true } as const;

/**
 * Turns an uploaded photo (JPEG, PNG, WebP, AVIF, TIFF or GIF) into two WebP files: a large one
 * for the photo's page and a small one for grids. Applies the EXIF rotation and drops the rest
 * of the metadata (GPS included).
 */
export async function optimizePhoto(input: Buffer) {
  const image = sharp(input, { failOn: 'none' }).rotate();

  const [full, thumb] = await Promise.all([
    image
      .clone()
      .resize({ width: FULL_SIZE, height: FULL_SIZE, ...resize })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true }),
    image
      .clone()
      .resize({ width: THUMB_SIZE, height: THUMB_SIZE, ...resize })
      .webp({ quality: 70 })
      .toBuffer(),
  ]);

  return { full: full.data, thumb, width: full.info.width, height: full.info.height };
}

/** Longest edge of a video's poster, shown in grids and before the video plays. */
export const POSTER_SIZE = 1280;

/** Turns a frame captured from a video into its webp poster. */
export async function optimizePoster(input: Buffer) {
  return sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: POSTER_SIZE, height: POSTER_SIZE, ...resize })
    .webp({ quality: 75 })
    .toBuffer();
}
