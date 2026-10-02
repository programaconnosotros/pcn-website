import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import {
  MAX_IMAGE_BYTES,
  deleteObjects,
  deleteObjectsOrLog,
  getImageUploadForm,
  s3Client,
} from './s3';

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

describe('deleteObjects', () => {
  const send = jest.spyOn(s3Client, 'send');

  it('does nothing without keys', async () => {
    await deleteObjects([]);

    expect(send).not.toHaveBeenCalled();
  });

  it('deletes in batches of 1000 keys', async () => {
    send.mockResolvedValue({ Errors: [] } as never);
    const keys = Array.from({ length: 1500 }, (_, i) => `setups/${i}.webp`);

    await deleteObjects(keys);

    expect(send).toHaveBeenCalledTimes(2);
    const batches = send.mock.calls.map(([command]) => (command.input as any).Delete.Objects);
    expect(batches.map((objects) => objects.length)).toEqual([1000, 500]);
  });

  it('fails when S3 reports keys it could not delete', async () => {
    send.mockResolvedValue({
      Errors: [{ Key: 'setups/a.webp', Code: 'AccessDenied' }],
    } as never);

    await expect(deleteObjects(['setups/a.webp'])).rejects.toThrow(
      'No se pudieron borrar de S3: setups/a.webp (AccessDenied)',
    );
  });

  it('only logs the failure when cleaning up', async () => {
    send.mockResolvedValue({ Errors: [{ Key: 'a', Code: 'AccessDenied' }] } as never);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(deleteObjectsOrLog(['a'])).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalled();
  });
});
