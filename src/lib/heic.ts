// iPhone photos come as HEIC, which only Safari can show and sharp can't decode. They're turned
// into JPEGs in the browser before uploading, so S3, the server and every <img> only ever see
// formats they understand.

export const HEIC_TYPES = ['image/heic', 'image/heif'];

/** Whether the file is HEIC/HEIF, by type or by extension (some browsers leave the type empty). */
export const isHeic = (file: { type: string; name: string }) =>
  /hei[cf]$/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

export const HEIC_CONVERSION_ERROR = 'No se pudo convertir la foto HEIC: exportala como JPG.';

/**
 * The file as a JPEG when it's HEIC (same name with `.jpg`, same date), or the file itself.
 * libheif applies the photo's rotation; the EXIF data (GPS included) doesn't carry over.
 */
export async function toJpegIfHeic(file: File): Promise<File> {
  if (!isHeic(file)) return file;
  try {
    // The CSP build runs libheif in a blob: worker without eval. Loaded only when needed: it's ~3 MB.
    const { heicTo } = await import('heic-to/csp');
    const jpeg = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 });
    return new File([jpeg], file.name.replace(/\.\w+$/, '') + '.jpg', {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } catch {
    throw new Error(HEIC_CONVERSION_ERROR);
  }
}
