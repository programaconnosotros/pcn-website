// Browser helpers for the gallery uploader: reading dates, video metadata and posters, and
// sending files to S3 through presigned URLs.

export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export const isVideo = (file: File) => file.type.startsWith('video/');

// The date the photo was taken from its EXIF data, or the file's date when it has none.
export async function readTakenAt(file: File) {
  if (!isVideo(file)) {
    try {
      const { default: exifr } = await import('exifr');
      const exif = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate']);
      const date = exif?.DateTimeOriginal ?? exif?.CreateDate;
      if (date instanceof Date && !Number.isNaN(date.getTime())) return date;
    } catch {
      // No EXIF: fall back to the file date.
    }
  }
  return new Date(file.lastModified);
}

export type VideoInfo = {
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  poster: Blob;
};

// Browsers that can't decode a format sometimes never fire `error`, so give up after a while.
const READ_TIMEOUT_MS = 15_000;

const once = (target: EventTarget, event: string) =>
  new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${event} timeout`)), READ_TIMEOUT_MS);
    target.addEventListener(
      event,
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
    target.addEventListener('error', () => reject(new Error(event)), { once: true });
  });

// Posters are only thumbnails: cap them so a 4K frame doesn't become a multi-MB JPEG (and stays
// under iOS Safari's canvas size limit).
const POSTER_MAX_SIDE = 1280;

const canvasToJpeg = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('poster'))),
      'image/jpeg',
      0.85,
    ),
  );

/** A plain black poster, for videos whose frames the browser can't grab. */
export function placeholderPoster(width = 640, height = 360) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);
  return canvasToJpeg(canvas);
}

/**
 * Reads a video's duration and size and grabs a frame (a second in, or a tenth of the way for
 * short clips) as its poster. Fails when the browser can't read the file at all; when it can
 * read the metadata but not a frame, the poster is a black placeholder.
 */
export async function readVideo(file: File): Promise<VideoInfo> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  try {
    video.src = url;
    video.load();
    // iOS Safari only fires `loadedmetadata` for a video that isn't playing, never `loadeddata`.
    await once(video, 'loadedmetadata');

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const width = video.videoWidth || null;
    const height = video.videoHeight || null;

    let poster: Blob;
    try {
      // iOS Safari doesn't buffer any frame until playback starts; muted inline play is allowed
      // without a user gesture.
      await video.play().catch(() => {});
      video.pause();
      const seeked = once(video, 'seeked');
      video.currentTime = Math.max(0.1, Math.min(1, duration / 10));
      await seeked;

      const scale = Math.min(1, POSTER_MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
      poster = await canvasToJpeg(canvas);
    } catch {
      poster = await placeholderPoster();
    }

    return {
      durationSeconds: duration ? Math.round(duration) : null,
      width,
      height,
      poster,
    };
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}

// Videos are re-encoded in the browser before uploading: H.264 (plays everywhere, unlike the
// HEVC iPhones record) with the short side capped at 1080p, at a bitrate that keeps a minute
// around 40 MB instead of the hundreds a 4K phone clip weighs.
const COMPRESSED_MAX_SHORT_SIDE = 1080;
// 60 fps phone clips come out at twice the bitrate; 30 is plenty for event videos.
const COMPRESSED_MAX_FRAME_RATE = 30;
const COMPRESSED_VIDEO_BITRATE = 5_000_000;
const COMPRESSED_AUDIO_BITRATE = 128_000;

export type CompressedVideo = { file: File; width: number; height: number };

/**
 * Re-encodes a video as a 1080p H.264 MP4 using the browser's own encoders (WebCodecs),
 * reporting progress (0–1). Resolves to `null` when the browser can't do it or the result
 * wouldn't be smaller, so the caller uploads the original instead.
 */
export async function compressVideo(
  file: File,
  onProgress: (_progress: number) => void,
): Promise<CompressedVideo | null> {
  if (typeof VideoEncoder === 'undefined') return null;
  const {
    ALL_FORMATS,
    BlobSource,
    BufferTarget,
    Conversion,
    Input,
    Mp4OutputFormat,
    Output,
    Quality,
    canEncodeVideo,
  } = await import('mediabunny');

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track) return null;

    const width = await track.getDisplayWidth();
    const height = await track.getDisplayHeight();
    const scale = Math.min(1, COMPRESSED_MAX_SHORT_SIDE / Math.min(width, height));
    const size = { width: even(width * scale), height: even(height * scale) };
    const { averagePacketRate } = await track.computePacketStats(100);
    const frameRate =
      averagePacketRate > COMPRESSED_MAX_FRAME_RATE + 1 ? COMPRESSED_MAX_FRAME_RATE : undefined;
    const quality = new Quality({ bitrate: COMPRESSED_VIDEO_BITRATE });
    if (!(await canEncodeVideo('avc', { ...size, quality }))) return null;

    const target = new BufferTarget();
    const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target });
    const conversion = await Conversion.init({
      input,
      output,
      tracks: 'primary',
      video: {
        codec: 'avc',
        ...size,
        fit: 'contain',
        frameRate,
        quality,
        // Bake the phone's rotation into the frames so every player shows it upright.
        allowTransformationMetadata: false,
        forceTranscode: true,
      },
      audio: { codec: 'aac', quality: new Quality({ bitrate: COMPRESSED_AUDIO_BITRATE }) },
      showWarnings: false,
    });
    // Keep both picture and sound: Firefox, for one, can't encode AAC and would drop the audio.
    const audioTrack = await input.getPrimaryAudioTrack();
    const keepsAll = [track, audioTrack].every((t) => !t || conversion.utilizedTracks.includes(t));
    if (!conversion.isValid || !keepsAll) return null;

    conversion.onProgress = onProgress;
    await conversion.execute();

    if (!target.buffer || target.buffer.byteLength >= file.size) return null;
    const name = file.name.replace(/\.\w+$/, '') + '.mp4';
    const compressed = new File([target.buffer], name, {
      type: 'video/mp4',
      lastModified: file.lastModified,
    });
    return { file: compressed, ...size };
  } finally {
    input.dispose();
  }
}

// H.264 needs even dimensions.
const even = (value: number) => Math.max(2, Math.round(value / 2) * 2);

/** PUTs a file to a presigned S3 URL. */
export async function putFile(url: string, file: Blob, contentType: string) {
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });
  if (!response.ok) throw new Error('No se pudo subir el archivo a S3');
}

/**
 * Sends a file through a presigned S3 POST form, reporting progress (0–1). Uses XHR because
 * fetch can't report upload progress.
 */
export function postFile(
  url: string,
  fields: Record<string, string>,
  file: File,
  onProgress: (_progress: number) => void,
) {
  const form = new FormData();
  Object.entries(fields).forEach(([name, value]) => form.append(name, value));
  form.append('file', file);

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error('No se pudo subir el video a S3'));
    xhr.onerror = () => reject(new Error('No se pudo subir el video a S3'));
    xhr.send(form);
  });
}
