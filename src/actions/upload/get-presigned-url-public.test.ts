import { getPresignedUrlPublic } from './get-presigned-url-public';
import { getPresignedUploadUrl } from '@/lib/s3';

jest.mock('@/lib/s3', () => ({
  getPresignedUploadUrl: jest.fn().mockResolvedValue({
    uploadUrl: 'https://s3.example.com/presigned',
    fileUrl: 'https://s3.example.com/file',
  }),
}));

describe('getPresignedUrlPublic', () => {
  it('throws when the content type is not allowed', async () => {
    await expect(
      getPresignedUrlPublic({ fileName: 'doc.pdf', contentType: 'application/pdf' }),
    ).rejects.toThrow('Tipo de archivo no permitido');
    expect(getPresignedUploadUrl).not.toHaveBeenCalled();
  });

  it('returns uploadUrl and fileUrl on a valid request', async () => {
    const result = await getPresignedUrlPublic({
      fileName: 'avatar.jpg',
      contentType: 'image/jpeg',
    });

    expect(result).toEqual({
      uploadUrl: 'https://s3.example.com/presigned',
      fileUrl: 'https://s3.example.com/file',
    });
  });

  it('always uploads to the registration-profiles folder regardless of input', async () => {
    await getPresignedUrlPublic({ fileName: 'photo.png', contentType: 'image/png' });

    expect(getPresignedUploadUrl).toHaveBeenCalledWith(
      'photo.png',
      'image/png',
      'registration-profiles',
    );
  });

  it('accepts all allowed image types', async () => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    for (const contentType of allowedTypes) {
      (getPresignedUploadUrl as jest.Mock).mockClear();
      await expect(getPresignedUrlPublic({ fileName: 'img', contentType })).resolves.toBeDefined();
    }
  });
});
