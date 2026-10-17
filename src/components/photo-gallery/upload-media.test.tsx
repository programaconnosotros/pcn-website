import exifr from 'exifr';
import * as mediabunny from 'mediabunny';
import {
  compressVideo,
  isVideo,
  placeholderPoster,
  postFile,
  preparePhotoForUpload,
  putFile,
  readTakenAt,
  readVideo,
  UPLOAD_STALL_MS,
  withUploadRetries,
} from './upload-media';

jest.mock('exifr', () => ({ __esModule: true, default: { parse: jest.fn() } }));
jest.mock('mediabunny', () => {
  class Quality {}
  return {
    ALL_FORMATS: [],
    BlobSource: jest.fn(),
    BufferTarget: jest.fn(),
    Mp4OutputFormat: jest.fn(),
    Output: jest.fn(),
    Input: jest.fn(),
    Conversion: { init: jest.fn() },
    Quality,
    canEncodeVideo: jest.fn(),
  };
});

const LAST_MODIFIED = new Date(2024, 0, 2, 3, 4).getTime();
const file = (name: string, type: string, content = 'xxxxxxxxxx') =>
  new File([content], name, { type, lastModified: LAST_MODIFIED });

// jsdom has no canvas: a 2D context that records what it draws and encodes to a fixed blob.
const drawn: string[] = [];
let toBlobResult: Blob | null = new Blob(['jpeg'], { type: 'image/jpeg' });
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: () => drawn.push('fillRect'),
    drawImage: () => drawn.push('drawImage'),
    fillStyle: '',
  })) as never;
  HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback) {
    callback(toBlobResult);
  };
  URL.createObjectURL = jest.fn(() => 'blob:video');
  URL.revokeObjectURL = jest.fn();
});
beforeEach(() => {
  drawn.length = 0;
  toBlobResult = new Blob(['jpeg'], { type: 'image/jpeg' });
});

describe('file checks', () => {
  it('detects videos', () => {
    expect(isVideo(file('a.mp4', 'video/mp4'))).toBe(true);
    expect(isVideo(file('a.jpg', 'image/jpeg'))).toBe(false);
  });
});

describe('readTakenAt', () => {
  const parse = jest.mocked(exifr.parse);

  it('reads the EXIF date the photo was taken', async () => {
    const taken = new Date(2023, 5, 1, 20);
    parse.mockResolvedValueOnce({ DateTimeOriginal: taken });
    parse.mockResolvedValueOnce({ CreateDate: taken });

    await expect(readTakenAt(file('a.jpg', 'image/jpeg'))).resolves.toBe(taken);
    await expect(readTakenAt(file('a.jpg', 'image/jpeg'))).resolves.toBe(taken);
  });

  it('falls back to the file date without EXIF, with a broken one or for videos', async () => {
    parse.mockResolvedValueOnce(undefined);
    parse.mockResolvedValueOnce({ DateTimeOriginal: new Date('nope') });
    parse.mockRejectedValueOnce(new Error('corrupt'));

    for (let i = 0; i < 3; i++) {
      await expect(readTakenAt(file('a.jpg', 'image/jpeg'))).resolves.toEqual(
        new Date(LAST_MODIFIED),
      );
    }
    await expect(readTakenAt(file('a.mp4', 'video/mp4'))).resolves.toEqual(new Date(LAST_MODIFIED));
    expect(parse).toHaveBeenCalledTimes(3);
  });
});

describe('placeholderPoster', () => {
  it('paints a black JPEG', async () => {
    await expect(placeholderPoster(10, 10)).resolves.toBeInstanceOf(Blob);
    expect(drawn).toEqual(['fillRect']);
  });

  it('fails when the canvas cannot be encoded', async () => {
    toBlobResult = null;

    await expect(placeholderPoster()).rejects.toThrow('poster');
  });
});

describe('readVideo', () => {
  // jsdom doesn't play media: fake the events a browser fires while reading a video.
  let fail: 'metadata' | 'seek' | null = null;
  const proto = HTMLMediaElement.prototype;
  const fire = (el: HTMLMediaElement, type: string) =>
    setTimeout(() => el.dispatchEvent(new Event(type)));

  beforeAll(() => {
    proto.load = function () {
      if (this.getAttribute('src')) fire(this, fail === 'metadata' ? 'error' : 'loadedmetadata');
    };
    jest.spyOn(proto, 'play').mockRejectedValue(new Error('autoplay'));
    jest.spyOn(proto, 'pause').mockImplementation(() => {});
    Object.defineProperty(proto, 'duration', { configurable: true, get: () => 42.4 });
    Object.defineProperty(proto, 'currentTime', {
      configurable: true,
      get: () => 0,
      set() {
        fire(this, fail === 'seek' ? 'error' : 'seeked');
      },
    });
    Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
      configurable: true,
      get: () => 3840,
    });
    Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
      configurable: true,
      get: () => 2160,
    });
  });
  beforeEach(() => {
    fail = null;
  });

  it('reads duration and size and grabs a frame as poster', async () => {
    const info = await readVideo(file('a.mp4', 'video/mp4'));

    expect(info).toMatchObject({ durationSeconds: 42, width: 3840, height: 2160 });
    expect(info.poster).toBeInstanceOf(Blob);
    expect(drawn).toEqual(['drawImage']);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:video');
  });

  it('uses a black poster when no frame can be grabbed', async () => {
    fail = 'seek';

    const info = await readVideo(file('a.mp4', 'video/mp4'));

    expect(info.durationSeconds).toBe(42);
    expect(drawn).toEqual(['fillRect']);
  });

  it('fails when the browser cannot read the video', async () => {
    fail = 'metadata';

    await expect(readVideo(file('a.mp4', 'video/mp4'))).rejects.toThrow('loadedmetadata');
  });
});

describe('compressVideo', () => {
  const { Input, Conversion, canEncodeVideo, BufferTarget } = jest.mocked(mediabunny);
  const track = {
    getDisplayWidth: async () => 3840,
    getDisplayHeight: async () => 2160,
    computePacketStats: async () => ({ averagePacketRate: 60 }),
  };
  const audio = { kind: 'audio' };
  const dispose = jest.fn();
  let buffer: ArrayBuffer | null;
  let conversion: {
    isValid: boolean;
    utilizedTracks: unknown[];
    onProgress?: (_p: number) => void;
    execute: jest.Mock;
  };

  beforeEach(() => {
    buffer = new ArrayBuffer(4);
    (globalThis as { VideoEncoder?: unknown }).VideoEncoder = class {};
    Input.mockImplementation(
      () =>
        ({
          getPrimaryVideoTrack: async () => track,
          getPrimaryAudioTrack: async () => audio,
          dispose,
        }) as never,
    );
    BufferTarget.mockImplementation(
      () =>
        ({
          get buffer() {
            return buffer;
          },
        }) as never,
    );
    canEncodeVideo.mockResolvedValue(true);
    conversion = {
      isValid: true,
      utilizedTracks: [track, audio],
      execute: jest.fn(async () => conversion.onProgress?.(1)),
    };
    Conversion.init.mockImplementation(async () => conversion as never);
  });
  afterEach(() => {
    delete (globalThis as { VideoEncoder?: unknown }).VideoEncoder;
  });

  it('re-encodes to a 1080p, 30 fps H.264 MP4 when it comes out smaller', async () => {
    const onProgress = jest.fn();

    const result = await compressVideo(file('clip.mov', 'video/quicktime'), onProgress);

    expect(result).toMatchObject({ width: 1920, height: 1080 });
    expect(result!.file.name).toBe('clip.mp4');
    expect(result!.file.type).toBe('video/mp4');
    expect(onProgress).toHaveBeenCalledWith(1);
    expect(jest.mocked(Conversion.init).mock.calls[0][0]).toMatchObject({
      video: { codec: 'avc', width: 1920, height: 1080, frameRate: 30 },
    });
    expect(dispose).toHaveBeenCalled();
  });

  it('gives up when the browser has no encoder', async () => {
    delete (globalThis as { VideoEncoder?: unknown }).VideoEncoder;

    await expect(compressVideo(file('a.mp4', 'video/mp4'), jest.fn())).resolves.toBeNull();
  });

  it('gives up without a video track, without an H.264 encoder or if it would lose a track', async () => {
    Input.mockImplementationOnce(
      () => ({ getPrimaryVideoTrack: async () => null, dispose }) as never,
    );
    await expect(compressVideo(file('a.mp4', 'video/mp4'), jest.fn())).resolves.toBeNull();

    canEncodeVideo.mockResolvedValueOnce(false);
    await expect(compressVideo(file('a.mp4', 'video/mp4'), jest.fn())).resolves.toBeNull();

    conversion.utilizedTracks = [track];
    await expect(compressVideo(file('a.mp4', 'video/mp4'), jest.fn())).resolves.toBeNull();
  });

  it('keeps the original when the result is not smaller', async () => {
    buffer = new ArrayBuffer(1000);

    await expect(compressVideo(file('a.mp4', 'video/mp4'), jest.fn())).resolves.toBeNull();
  });
});

// A scripted XMLHttpRequest: each request ends the way the next entry of `outcomes` says.
type Outcome = number | 'drop' | 'stall';
let outcomes: Outcome[] = [];
let requests: FakeXhr[] = [];

class FakeXhr {
  status = 0;
  upload: { onprogress?: (_e: Partial<ProgressEvent>) => void } = {};
  onload?: () => void;
  onerror?: () => void;
  onabort?: () => void;
  open = jest.fn();
  setRequestHeader = jest.fn();
  abort = jest.fn(() => this.onabort?.());
  send = jest.fn(() => {
    const outcome = outcomes.shift() ?? 200;
    if (outcome === 'stall') return;
    queueMicrotask(() => {
      if (outcome === 'drop') return this.onerror?.();
      this.upload.onprogress?.({ lengthComputable: true, loaded: 5, total: 10 });
      this.status = outcome;
      this.onload?.();
    });
  });
  constructor() {
    requests.push(this);
  }
}

describe('S3 transfers', () => {
  beforeEach(() => {
    outcomes = [];
    requests = [];
    window.XMLHttpRequest = FakeXhr as never;
    jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
  });
  afterEach(() => jest.useRealTimers());

  it('PUTs a file with its content type', async () => {
    const blob = new Blob(['x']);
    await putFile('https://s3/put', blob, 'image/jpeg');
    expect(requests[0].open).toHaveBeenCalledWith('PUT', 'https://s3/put');
    expect(requests[0].setRequestHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
    expect(requests[0].send).toHaveBeenCalledWith(blob);
  });

  it('posts the presigned form with the file and reports progress', async () => {
    const onProgress = jest.fn();
    await postFile(
      'https://s3/post',
      { key: 'k', policy: 'p' },
      file('a.mp4', 'video/mp4'),
      onProgress,
    );

    expect(requests[0].open).toHaveBeenCalledWith('POST', 'https://s3/post');
    const form = (requests[0].send.mock.calls as unknown as [FormData][])[0][0];
    expect(form.get('key')).toBe('k');
    expect(form.get('policy')).toBe('p');
    expect(form.get('file')).toBeInstanceOf(File);
    expect(onProgress).toHaveBeenLastCalledWith(0.5);
  });

  it('retries when the connection drops, waiting longer each time', async () => {
    outcomes = ['drop', 500, 204];
    const done = putFile('u', new Blob(['x']), 'image/jpeg');
    await jest.advanceTimersByTimeAsync(1000);
    expect(requests).toHaveLength(2);
    await jest.advanceTimersByTimeAsync(2000);
    await done;
    expect(requests).toHaveLength(3);
  });

  it('gives up after three tries', async () => {
    outcomes = ['drop', 'drop', 403];
    const done = expect(postFile('u', {}, file('a.mp4', 'video/mp4'), jest.fn())).rejects.toThrow(
      'No se pudo subir el archivo a S3',
    );
    await jest.advanceTimersByTimeAsync(5000);
    await done;
    expect(requests).toHaveLength(3);
  });

  it('aborts a transfer that stopped moving and tries again', async () => {
    outcomes = ['stall', 204];
    const done = putFile('u', new Blob(['x']), 'image/jpeg');
    await jest.advanceTimersByTimeAsync(UPLOAD_STALL_MS + 5000);
    expect(requests[0].abort).toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1000);
    await done;
    expect(requests).toHaveLength(2);
  });
});

describe('withUploadRetries', () => {
  it('returns the first success', async () => {
    const task = jest.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue('ok');
    await expect(withUploadRetries(task, { baseDelayMs: 0 })).resolves.toBe('ok');
    expect(task).toHaveBeenCalledTimes(2);
  });
});

describe('preparePhotoForUpload', () => {
  const original = { createImageBitmap: window.createImageBitmap };
  afterEach(() => {
    window.createImageBitmap = original.createImageBitmap;
    jest.restoreAllMocks();
  });

  it('copies the file into memory when it is not a JPEG to shrink', async () => {
    const png = file('captura.png', 'image/png');
    const prepared = await preparePhotoForUpload(png);
    expect(prepared).not.toBe(png);
    expect(prepared).toMatchObject({ name: 'captura.png', type: 'image/png', size: png.size });
    expect(prepared.lastModified).toBe(LAST_MODIFIED);
  });

  it('shrinks a big JPEG to the size the site uses, upright', async () => {
    const close = jest.fn();
    window.createImageBitmap = jest.fn().mockResolvedValue({ width: 4032, height: 3024, close });
    const drawImage = jest.fn();
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as never);
    jest
      .spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation((callback) => callback(new Blob(['y'], { type: 'image/jpeg' })));

    const photo = file('IMG_1.jpg', 'image/jpeg', 'x'.repeat(100));
    const prepared = await preparePhotoForUpload(photo);

    expect(window.createImageBitmap).toHaveBeenCalledWith(photo, {
      imageOrientation: 'from-image',
    });
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 2560, 1920);
    expect(prepared).toMatchObject({ name: 'IMG_1.jpg', type: 'image/jpeg', size: 1 });
    expect(close).toHaveBeenCalled();
  });

  it('keeps the original when the browser cannot decode it', async () => {
    window.createImageBitmap = jest.fn().mockRejectedValue(new Error('decode'));
    const photo = file('IMG_2.jpg', 'image/jpeg');
    await expect(preparePhotoForUpload(photo)).resolves.toMatchObject({ size: photo.size });
  });
});
