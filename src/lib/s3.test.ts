import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  CLOUDFRONT_URL,
  MAX_IMAGE_BYTES,
  S3_BUCKET,
  deleteObjects,
  deleteObjectsOrLog,
  getImageUploadForm,
  getObjectBuffer,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  headObject,
  publicFileUrl,
  putImmutableObject,
  s3Client,
} from './s3';

jest.mock('@aws-sdk/s3-presigned-post', () => ({
  createPresignedPost: jest.fn().mockResolvedValue({ url: 'https://bucket', fields: { a: 'b' } }),
}));
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://signed.example.com'),
}));

const send = jest.spyOn(s3Client, 'send');
const sentInput = (call = 0) => (send.mock.calls[call][0] as any).input;

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

describe('getPresignedUploadUrl', () => {
  it('signs a PUT to a unique key that keeps the extension', async () => {
    const result = await getPresignedUploadUrl('foto.final.PNG', 'image/png', 'setups');

    expect(result.key).toMatch(/^setups\/\d+-[0-9a-f-]{36}\.PNG$/);
    expect(result).toEqual({
      uploadUrl: 'https://signed.example.com',
      fileUrl: publicFileUrl(result.key),
      key: result.key,
    });
    const [, command, options] = jest.mocked(getSignedUrl).mock.calls[0];
    expect((command as any).input).toEqual({
      Bucket: S3_BUCKET,
      Key: result.key,
      ContentType: 'image/png',
    });
    expect(options).toEqual({
      expiresIn: 300,
      signableHeaders: new Set(['host', 'content-type']),
    });
  });

  it('defaults to the events folder and a jpg extension', async () => {
    const { key } = await getPresignedUploadUrl('', 'image/jpeg');

    expect(key).toMatch(/^events\/\d+-[0-9a-f-]{36}\.jpg$/);
  });
});

describe('publicFileUrl', () => {
  const ORIGINAL_ENV = process.env;
  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  const load = (env: Record<string, string>) => {
    process.env = { ...ORIGINAL_ENV, ...env };
    let mod!: typeof import('./s3');
    jest.isolateModules(() => {
      mod = require('./s3');
    });
    return mod;
  };

  it('goes through CloudFront when it is configured', () => {
    const { publicFileUrl: url } = load({
      AWS_CLOUDFRONT_URL: 'https://cdn.example.com',
      AWS_S3_BUCKET: 'bucket',
    });

    expect(url('setups/a.webp')).toBe('https://cdn.example.com/setups/a.webp');
  });

  it('points straight at S3 without CloudFront', () => {
    const { publicFileUrl: url } = load({ AWS_CLOUDFRONT_URL: '', AWS_S3_BUCKET: 'bucket' });

    expect(url('setups/a.webp')).toBe('https://bucket.s3.amazonaws.com/setups/a.webp');
  });

  it('matches the exported CLOUDFRONT_URL', () => {
    expect(publicFileUrl('k')).toBe(
      CLOUDFRONT_URL ? `${CLOUDFRONT_URL}/k` : `https://${S3_BUCKET}.s3.amazonaws.com/k`,
    );
  });
});

describe('getObjectBuffer', () => {
  it('downloads the whole object into a Buffer', async () => {
    send.mockResolvedValue({
      Body: { transformToByteArray: async () => new Uint8Array([1, 2, 3]) },
    } as never);

    const buffer = await getObjectBuffer('gallery/a.jpg');

    expect(buffer).toEqual(Buffer.from([1, 2, 3]));
    expect(sentInput()).toEqual({ Bucket: S3_BUCKET, Key: 'gallery/a.jpg' });
  });

  it('fails when the object has no body', async () => {
    send.mockResolvedValue({} as never);

    await expect(getObjectBuffer('missing')).rejects.toThrow('El archivo no existe');
  });
});

describe('putImmutableObject', () => {
  it('uploads with a cache header that never expires', async () => {
    send.mockResolvedValue({} as never);
    const body = Buffer.from('x');

    await putImmutableObject('gallery/a.webp', body, 'image/webp');

    expect(sentInput()).toEqual({
      Bucket: S3_BUCKET,
      Key: 'gallery/a.webp',
      Body: body,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    });
  });
});

describe('headObject', () => {
  it('returns the size and content type', async () => {
    send.mockResolvedValue({ ContentLength: 42, ContentType: 'video/mp4' } as never);

    await expect(headObject('gallery/v.mp4')).resolves.toEqual({
      size: 42,
      contentType: 'video/mp4',
    });
  });

  it('defaults missing metadata', async () => {
    send.mockResolvedValue({} as never);

    await expect(headObject('gallery/v.mp4')).resolves.toEqual({ size: 0, contentType: null });
  });

  it('returns null when the object does not exist', async () => {
    send.mockRejectedValue(new Error('NotFound') as never);

    await expect(headObject('missing')).resolves.toBeNull();
  });
});

describe('getPresignedDownloadUrl', () => {
  it('signs a GET that downloads as an attachment, without quotes in the name', async () => {
    const url = await getPresignedDownloadUrl('gallery/a.webp', 'pcn "2026".webp');

    expect(url).toBe('https://signed.example.com');
    const [, command, options] = jest.mocked(getSignedUrl).mock.calls[0];
    expect((command as any).input).toEqual({
      Bucket: S3_BUCKET,
      Key: 'gallery/a.webp',
      ResponseContentDisposition: 'attachment; filename="pcn 2026.webp"',
    });
    expect(options).toEqual({ expiresIn: 300 });
  });
});
