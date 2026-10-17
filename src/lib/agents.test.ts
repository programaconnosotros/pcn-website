import { getObjectBuffer } from '@/lib/s3';
import { bucketImagesForModel, imageForModel } from './agents';

jest.mock('@/lib/s3', () => ({
  keyFromPublicUrl: (url: string) =>
    url.startsWith('https://cdn.dev/') ? url.slice('https://cdn.dev/'.length) : null,
  getObjectBuffer: jest.fn(async () => Buffer.from('original')),
}));
jest.mock('sharp', () =>
  jest.fn(() => {
    const pipeline = {
      rotate: () => pipeline,
      resize: () => pipeline,
      jpeg: () => pipeline,
      toBuffer: async () => Buffer.from('jpeg'),
    };
    return pipeline;
  }),
);

describe('imageForModel', () => {
  it('returns a JPEG buffer', async () => {
    await expect(imageForModel(Buffer.from('x'))).resolves.toEqual(Buffer.from('jpeg'));
  });
});

describe('bucketImagesForModel', () => {
  it('loads only bucket images, up to the max, as base64', async () => {
    const images = await bucketImagesForModel(
      [
        'https://elsewhere.dev/a.png',
        'https://cdn.dev/events/flyers/1.png',
        'https://cdn.dev/events/flyers/2.png',
        'https://cdn.dev/events/flyers/3.png',
      ],
      2,
    );

    expect(images).toEqual([
      Buffer.from('jpeg').toString('base64'),
      Buffer.from('jpeg').toString('base64'),
    ]);
    expect(getObjectBuffer).toHaveBeenCalledTimes(2);
    expect(getObjectBuffer).toHaveBeenCalledWith('events/flyers/1.png');
  });
});
