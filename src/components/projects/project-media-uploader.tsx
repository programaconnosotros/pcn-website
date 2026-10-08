'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  addProjectPhoto,
  addProjectVideo,
  getProjectImageUploadForm,
  getProjectVideoUploadForm,
} from '@/actions/projects/project-media';
import {
  compressVideo,
  isVideo,
  placeholderPoster,
  postFile,
  readVideo,
  type VideoInfo,
} from '@/components/photo-gallery/upload-media';
import { Button } from '@/components/ui/button';
import { isHeic, toJpegIfHeic } from '@/lib/heic';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import {
  PROJECT_IMAGE_MAX_BYTES,
  PROJECT_IMAGE_TYPES,
  PROJECT_MEDIA_LIMIT,
  PROJECT_VIDEO_MAX_BYTES,
  PROJECT_VIDEO_TYPES,
} from '@/schemas/project-media-schema';

const MB = 1024 * 1024;

type Status = { name: string; step: 'optimizando' | 'subiendo' | 'procesando'; progress?: number };

const fileError = (file: File) => {
  if (isVideo(file)) {
    if (!PROJECT_VIDEO_TYPES.includes(file.type))
      return 'Formato de video no soportado: subí MP4, WebM o MOV.';
    return null;
  }
  if (!PROJECT_IMAGE_TYPES.includes(file.type) && !isHeic(file)) {
    return 'Formato no soportado: subí JPG, PNG, WebP, AVIF o HEIC.';
  }
  if (file.size > PROJECT_IMAGE_MAX_BYTES) {
    return `La foto pesa más de ${PROJECT_IMAGE_MAX_BYTES / MB} MB.`;
  }
  return null;
};

// The browser can't always read a video (e.g. HEVC on a desktop without the codec), but the file
// itself is fine: upload it anyway with a placeholder poster and no metadata.
const videoInfo = (file: File): Promise<VideoInfo> =>
  readVideo(file).catch(async () => ({
    durationSeconds: null,
    width: null,
    height: null,
    poster: await placeholderPoster(),
  }));

/**
 * Adds photos and videos to a project's page. Photos go up as they are and the server turns them
 * into WebP; videos are re-encoded in the browser first, like the gallery's, then go up with a
 * frame captured as their poster.
 */
export function ProjectMediaUploader({ projectId, count }: { projectId: string; count: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const full = count >= PROJECT_MEDIA_LIMIT;

  const uploadImage = async (blob: File) => {
    const { url, fields, key } = await getProjectImageUploadForm(projectId, blob.type);
    await postFile(url, fields, blob, () => {});
    return key;
  };

  const uploadOne = async (original: File) => {
    if (!isVideo(original)) {
      setStatus({ name: original.name, step: 'subiendo' });
      const key = await uploadImage(await toJpegIfHeic(original));
      setStatus({ name: original.name, step: 'procesando' });
      await addProjectPhoto(projectId, key);
      return;
    }

    const info = await videoInfo(original);
    setStatus({ name: original.name, step: 'optimizando', progress: 0 });
    const compressed = await compressVideo(original, (progress) =>
      setStatus({ name: original.name, step: 'optimizando', progress }),
    ).catch(() => null);
    const file = compressed?.file ?? original;
    if (file.size > PROJECT_VIDEO_MAX_BYTES) {
      throw new Error(`El video pesa más de ${PROJECT_VIDEO_MAX_BYTES / MB} MB.`);
    }

    setStatus({ name: original.name, step: 'subiendo', progress: 0 });
    const { url, fields, key } = await getProjectVideoUploadForm(projectId, file.type, file.size);
    await postFile(url, fields, file, (progress) =>
      setStatus({ name: original.name, step: 'subiendo', progress }),
    );
    const poster = new File([info.poster], 'poster.jpg', { type: 'image/jpeg' });
    const posterKey = await uploadImage(poster);

    setStatus({ name: original.name, step: 'procesando' });
    await addProjectVideo(projectId, key, posterKey, {
      durationSeconds: info.durationSeconds,
      width: compressed?.width ?? info.width,
      height: compressed?.height ?? info.height,
    });
  };

  const upload = async (files: File[]) => {
    const room = PROJECT_MEDIA_LIMIT - count;
    if (files.length > room) {
      toast.error(`Podés sumar ${room} más: un proyecto tiene hasta ${PROJECT_MEDIA_LIMIT}.`);
      files = files.slice(0, room);
    }
    let added = 0;
    // One at a time: videos are big and photos are optimized on the server.
    for (const file of files) {
      const error = fileError(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }
      try {
        await uploadOne(file);
        added++;
      } catch (error) {
        toast.error(
          `${file.name}: ${actionErrorMessage(error, 'No se pudo subir el archivo', true)}`,
        );
      }
    }
    setStatus(null);
    if (added > 0) {
      toast.success(added === 1 ? 'Archivo agregado' : `${added} archivos agregados`);
      router.refresh();
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={[...PROJECT_IMAGE_TYPES, '.heic', '.heif', ...PROJECT_VIDEO_TYPES].join(',')}
        className="hidden"
        aria-label="Fotos y videos del proyecto"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = '';
          if (files.length) void upload(files);
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="w-full font-mono"
        disabled={!!status || full}
        onClick={() => inputRef.current?.click()}
      >
        {status ? (
          <Loader2 className="mr-1 size-4 animate-spin" />
        ) : (
          <ImagePlus className="mr-1 size-4" />
        )}
        {full ? `límite de ${PROJECT_MEDIA_LIMIT} archivos` : 'subirFotosYVideos();'}
      </Button>
      {status ? (
        <p className="font-mono text-[11px] text-muted-foreground" aria-live="polite">
          <span className="text-pcnGreen">{status.step}</span>
          {status.progress !== undefined && ` ${Math.round(status.progress * 100)}%`} ·{' '}
          <span className="break-all">{status.name}</span>
          {status.step === 'optimizando' && (
            <span className="block">no cierres ni bloquees esta pestaña mientras tanto.</span>
          )}
        </p>
      ) : (
        <p className="font-mono text-[11px] text-muted-foreground">
          fotos JPG, PNG, WebP o HEIC · videos MP4, WebM o MOV (se optimizan en tu dispositivo)
        </p>
      )}
    </div>
  );
}
