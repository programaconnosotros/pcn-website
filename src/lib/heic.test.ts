import { heicTo } from 'heic-to/csp';
import { HEIC_CONVERSION_ERROR, isHeic, toJpegIfHeic } from './heic';

jest.mock('heic-to/csp', () => ({ heicTo: jest.fn() }));

const file = (name: string, type: string) => new File(['x'], name, { type, lastModified: 1234 });

describe('isHeic', () => {
  it('detects HEIC photos by type or extension', () => {
    expect(isHeic(file('a.jpg', 'image/heic'))).toBe(true);
    expect(isHeic(file('a', 'image/heif'))).toBe(true);
    expect(isHeic(file('IMG.HEIF', ''))).toBe(true);
    expect(isHeic(file('a.jpg', 'image/jpeg'))).toBe(false);
  });
});

describe('toJpegIfHeic', () => {
  it('returns other files untouched, without loading the converter', async () => {
    const png = file('a.png', 'image/png');
    expect(await toJpegIfHeic(png)).toBe(png);
    expect(heicTo).not.toHaveBeenCalled();
  });

  it('turns a HEIC photo into a JPEG with the same name and date', async () => {
    jest.mocked(heicTo).mockResolvedValueOnce(new Blob(['jpeg'], { type: 'image/jpeg' }));
    const original = file('IMG_0001.HEIC', '');

    const jpeg = await toJpegIfHeic(original);

    expect(heicTo).toHaveBeenCalledWith({ blob: original, type: 'image/jpeg', quality: 0.9 });
    expect(jpeg.name).toBe('IMG_0001.jpg');
    expect(jpeg.type).toBe('image/jpeg');
    expect(jpeg.lastModified).toBe(1234);
  });

  it('explains what to do when the photo cannot be converted', async () => {
    jest.mocked(heicTo).mockRejectedValueOnce(new Error('libheif'));
    await expect(toJpegIfHeic(file('a.heic', 'image/heic'))).rejects.toThrow(HEIC_CONVERSION_ERROR);
  });
});
