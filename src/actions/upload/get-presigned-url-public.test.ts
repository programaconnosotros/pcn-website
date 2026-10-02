import { getPresignedUrlPublic } from './get-presigned-url-public';
import { getImageUploadForm } from '@/lib/s3';

jest.mock('@/lib/s3', () => ({
  getImageUploadForm: jest.fn().mockResolvedValue({
    url: 'https://s3.example.com/bucket',
    fields: { key: 'k' },
    fileUrl: 'https://s3.example.com/file',
  }),
}));

describe('getPresignedUrlPublic', () => {
  it('throws when the content type is not allowed', async () => {
    await expect(getPresignedUrlPublic({ contentType: 'application/pdf' })).rejects.toThrow(
      'Tipo de archivo no permitido',
    );
    expect(getImageUploadForm).not.toHaveBeenCalled();
  });

  it('returns the signed upload form and fileUrl on a valid request', async () => {
    const result = await getPresignedUrlPublic({
      contentType: 'image/jpeg',
    });

    expect(result).toEqual({
      url: 'https://s3.example.com/bucket',
      fields: { key: 'k' },
      fileUrl: 'https://s3.example.com/file',
    });
  });

  it('always uploads to the registration-profiles folder regardless of input', async () => {
    await getPresignedUrlPublic({ contentType: 'image/png' });

    expect(getImageUploadForm).toHaveBeenCalledWith('image/png', 'registration-profiles');
  });

  it('accepts all allowed image types', async () => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    for (const contentType of allowedTypes) {
      (getImageUploadForm as jest.Mock).mockClear();
      await expect(getPresignedUrlPublic({ contentType })).resolves.toBeDefined();
    }
  });
});
