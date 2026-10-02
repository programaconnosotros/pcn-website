import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { MAX_IMAGE_BYTES, getImageUploadForm } from './s3';

jest.mock('@aws-sdk/s3-presigned-post', () => ({
  createPresignedPost: jest.fn().mockResolvedValue({ url: 'https://bucket', fields: { a: 'b' } }),
}));

describe('getImageUploadForm', () => {
  it('caps the upload size and names the key after the content type', async () => {
    const result = await getImageUploadForm('image/png', 'profiles');

    const { Key, Conditions } = (createPresignedPost as jest.Mock).mock.calls[0][1];
    expect(Key).toMatch(/^profiles\/\d+-[0-9a-f-]{36}\.png$/);
    expect(Conditions).toContainEqual(['content-length-range', 1, MAX_IMAGE_BYTES]);
    expect(Conditions).toContainEqual(['eq', '$Content-Type', 'image/png']);
    expect(result).toEqual({
      url: 'https://bucket',
      fields: { a: 'b' },
      fileUrl: expect.stringMatching(new RegExp(`${Key}$`)),
    });
  });

  it('rejects content types that are not images', async () => {
    await expect(getImageUploadForm('text/html', 'profiles')).rejects.toThrow(
      'Tipo de archivo no permitido',
    );
  });
});
