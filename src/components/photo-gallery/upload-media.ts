// Browser helpers for the gallery uploader: reading dates, video metadata and posters, and
// sending files to S3 through presigned URLs.

export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// sharp's prebuilt binaries can't decode HEIC, so iPhone photos have to be exported first.
export const isHeic = (file: File) => /hei[cf]$/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

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

/**
 * Reads a video's duration and size and grabs a frame (a second in, or a tenth of the way for
 * short clips) as its poster. Fails when the browser can't decode the format.
 */
export async function readVideo(file: File): Promise<VideoInfo> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  try {
    video.src = url;
    await once(video, 'loadeddata');

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    video.currentTime = Math.min(1, duration / 10);
    await once(video, 'seeked');

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    const poster = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('poster'))),
        'image/jpeg',
        0.9,
      ),
    );

    return {
      durationSeconds: duration ? Math.round(duration) : null,
      width: video.videoWidth || null,
      height: video.videoHeight || null,
      poster,
    };
  } finally {
    video.removeAttribute('src');
    URL.revokeObjectURL(url);
  }
}

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
