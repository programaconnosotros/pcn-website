'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ImagePlus, Loader2, Play, RotateCw, Upload, X } from 'lucide-react';
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
  readTakenAt,
  readVideo,
  type VideoInfo,
} from '@/components/photo-gallery/upload-media';
import { DateInput } from '@/components/ui/date-input';
import { Textarea } from '@/components/ui/textarea';
import { todayInputValue } from '@/schemas/setup-schema';
import { Button } from '@/components/ui/button';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { formatDuration } from '@/lib/gallery-filters';
import { isHeic, toJpegIfHeic } from '@/lib/heic';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';
import {
  PROJECT_IMAGE_MAX_BYTES,
  PROJECT_IMAGE_TYPES,
  PROJECT_MEDIA_LIMIT,
  PROJECT_VIDEO_MAX_BYTES,
  PROJECT_VIDEO_TYPES,
} from '@/schemas/project-media-schema';

const MB = 1024 * 1024;

type Status = 'pending' | 'optimizing' | 'uploading' | 'processing' | 'done' | 'error';

type Item = {
  key: string;
  file: File;
  // Object URL of the photo, or of the frame captured as the video's poster.
  preview: string;
  video: VideoInfo | null;
  /** The day it was taken, `YYYY-MM-DD`: from the photo's EXIF (or the file's date), editable. */
  takenAt: string;
  description: string;
  status: Status;
  progress?: number;
  // Why the file can't be uploaded at all (wrong format, too big, a HEIC that didn't convert).
  unsupported?: string;
  error?: string;
};

const STEP_LABEL: Partial<Record<Status, string>> = {
  optimizing: 'optimizando',
  uploading: 'subiendo',
  processing: 'procesando',
};

const toMb = (bytes: number) => (bytes / MB).toFixed(1);

/** A date as `YYYY-MM-DD` in the device's time zone: the day the person saw it happen. */
const localDay = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const unsupportedReason = (file: File) => {
  if (isVideo(file)) {
    return PROJECT_VIDEO_TYPES.includes(file.type)
      ? null
      : 'Formato de video no soportado: subí MP4, WebM o MOV.';
  }
  if (!PROJECT_IMAGE_TYPES.includes(file.type) && !isHeic(file)) {
    return 'Formato no soportado: subí JPG, PNG, WebP, AVIF o HEIC.';
  }
  if (file.size > PROJECT_IMAGE_MAX_BYTES) {
    return `La foto pesa más de ${PROJECT_IMAGE_MAX_BYTES / MB} MB.`;
  }
  return null;
};

// Reads what each picked file needs before it goes up: HEIC photos become JPEGs here, and the
// browser can't always read a video (e.g. HEVC on a desktop without the codec), but the file
// itself is fine: it goes up with a placeholder poster and no metadata.
async function prepare(file: File): Promise<Item> {
  const base = {
    key: crypto.randomUUID(),
    file,
    preview: '',
    video: null,
    // Read before converting a HEIC: the conversion drops the EXIF.
    takenAt: localDay(await readTakenAt(file)),
    description: '',
    status: 'pending' as const,
  };
  const unsupported = unsupportedReason(file);
  if (unsupported) return { ...base, unsupported };
  if (!isVideo(file)) {
    try {
      const photo = await toJpegIfHeic(file);
      return { ...base, file: photo, preview: URL.createObjectURL(photo) };
    } catch (error) {
      return { ...base, unsupported: (error as Error).message };
    }
  }
  const video = await readVideo(file).catch(async () => ({
    durationSeconds: null,
    width: null,
    height: null,
    poster: await placeholderPoster(),
  }));
  return { ...base, video, preview: URL.createObjectURL(video.poster) };
}

/**
 * The page that adds photos and videos to a project, like the gallery's uploader: pick files, see
 * each one with its state, and retry the ones that failed without picking them again. Photos go up
 * as they are and the server turns them into WebP; videos are re-encoded in the browser first,
 * then go up with a frame captured as their poster.
 */
export function ProjectMediaUploader({ projectId, count }: { projectId: string; count: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Free the previews when leaving the page.
  useEffect(() => () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview)), []);

  // Ask before leaving while something is going up.
  useEffect(() => {
    if (!isUploading) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isUploading]);

  const done = items.filter((item) => item.status === 'done').length;
  const room = PROJECT_MEDIA_LIMIT - count - done;
  const queued = items.filter(
    (item) => (item.status === 'pending' || item.status === 'error') && !item.unsupported,
  );

  const update = (key: string, patch: Partial<Item>) =>
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const addFiles = async (files: FileList | File[]) => {
    const picked = [...files].filter(
      (file) => file.type.startsWith('image/') || isVideo(file) || isHeic(file),
    );
    const added = await Promise.all(picked.map(prepare));
    setItems((current) => [...current, ...added]);
  };

  const remove = (item: Item) => {
    URL.revokeObjectURL(item.preview);
    setItems((current) => current.filter(({ key }) => key !== item.key));
  };

  const uploadImage = async (blob: File) => {
    const { url, fields, key } = await getProjectImageUploadForm(projectId, blob.type);
    await postFile(url, fields, blob, () => {});
    return key;
  };

  const uploadOne = async (item: Item) => {
    update(item.key, { error: undefined, progress: undefined });
    const details = { takenAt: item.takenAt || null, description: item.description };
    try {
      if (!item.video) {
        update(item.key, { status: 'uploading' });
        const key = await uploadImage(item.file);
        update(item.key, { status: 'processing' });
        await addProjectPhoto(projectId, key, details);
      } else {
        update(item.key, { status: 'optimizing', progress: 0 });
        const compressed = await compressVideo(item.file, (progress) =>
          update(item.key, { progress }),
        ).catch(() => null);
        const file = compressed?.file ?? item.file;
        if (file.size > PROJECT_VIDEO_MAX_BYTES) {
          throw new Error(`El video pesa más de ${PROJECT_VIDEO_MAX_BYTES / MB} MB.`);
        }

        update(item.key, { status: 'uploading', progress: 0 });
        const { url, fields, key } = await getProjectVideoUploadForm(
          projectId,
          file.type,
          file.size,
        );
        await postFile(url, fields, file, (progress) => update(item.key, { progress }));
        const poster = new File([item.video.poster], 'poster.jpg', { type: 'image/jpeg' });
        const posterKey = await uploadImage(poster);

        update(item.key, { status: 'processing', progress: undefined });
        await addProjectVideo(projectId, key, posterKey, {
          durationSeconds: item.video.durationSeconds,
          width: compressed?.width ?? item.video.width,
          height: compressed?.height ?? item.video.height,
          ...details,
        });
      }
      update(item.key, { status: 'done', progress: undefined });
      return true;
    } catch (error) {
      update(item.key, {
        status: 'error',
        progress: undefined,
        error: actionErrorMessage(error, 'No se pudo subir el archivo', true),
      });
      return false;
    }
  };

  // Goes through what's waiting or failed, one at a time: videos are big and photos are optimized
  // on the server. Whatever doesn't fit under the project's limit stays waiting.
  const uploadAll = async (only?: Item) => {
    const batch = (only ? [only] : queued).slice(0, Math.max(0, room));
    if (!batch.length) {
      if (room <= 0) toast.error(`Un proyecto puede tener hasta ${PROJECT_MEDIA_LIMIT} archivos.`);
      return;
    }
    setIsUploading(true);
    let uploaded = 0;
    for (const item of batch) if (await uploadOne(item)) uploaded++;
    setIsUploading(false);

    if (uploaded > 0) router.refresh();
    if (uploaded === batch.length) {
      toast.success(uploaded === 1 ? 'Archivo agregado' : `${uploaded} archivos agregados`);
    } else {
      toast.error(
        `Se subieron ${uploaded} de ${batch.length}: reintentá los que fallaron desde la lista.`,
      );
    }
  };

  const busy = (item: Item) =>
    item.status === 'optimizing' || item.status === 'uploading' || item.status === 'processing';

  return (
    <div className="mb-14 space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void addFiles(event.dataTransfer.files);
        }}
        disabled={isUploading || room <= 0}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 border border-dashed border-pcnGreen-200 px-4 py-8 font-mono text-xs text-muted-foreground transition-colors hover:border-pcnGreen hover:text-pcnGreen disabled:pointer-events-none disabled:opacity-60',
          isDragging && 'border-pcnGreen bg-pcnGreen/5 text-pcnGreen',
        )}
      >
        <ImagePlus className="size-6" />
        <span>
          {room > 0
            ? 'arrastrá fotos y videos o hacé click para elegirlos'
            : `el proyecto llegó al límite de ${PROJECT_MEDIA_LIMIT} archivos`}
        </span>
        <span className="text-[10px] text-muted-foreground/70">
          fotos JPG, PNG, WebP o HEIC · videos MP4, WebM o MOV (se optimizan en tu dispositivo) ·
          lugar para {Math.max(0, room)} más
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept={[...PROJECT_IMAGE_TYPES, '.heic', '.heif', ...PROJECT_VIDEO_TYPES].join(',')}
        aria-label="Fotos y videos del proyecto"
        onChange={(event) => {
          if (event.target.files) void addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {items.length > 0 && (
        <>
          <RuledGrid className="grid-cols-1">
            {items.map((item) => (
              <div
                key={item.key}
                className={cn(ruledCellClassName, 'flex flex-col gap-3 p-3 sm:flex-row')}
              >
                <div className="relative size-28 shrink-0 overflow-hidden bg-black">
                  {item.preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.preview} alt="" className="size-full object-cover" />
                  )}
                  {item.video && !busy(item) && item.status !== 'done' && (
                    <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-sm bg-black/70 px-1 font-mono text-[10px] text-pcnGreen">
                      <Play className="size-2.5 fill-current" />
                      {item.video.durationSeconds !== null
                        ? formatDuration(item.video.durationSeconds)
                        : 'video'}
                    </span>
                  )}
                  {busy(item) && (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 font-mono text-[10px] text-pcnGreen tabular-nums">
                      <Loader2 className="size-5 animate-spin" />
                      {STEP_LABEL[item.status]}
                      {item.progress !== undefined && ` ${Math.round(item.progress * 100)}%`}
                    </span>
                  )}
                  {item.status === 'done' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Check className="size-6 text-pcnGreen" />
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-pcnGreen">{item.file.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {toMb(item.file.size)} MB
                    </span>
                    {(item.status === 'pending' || item.status === 'error') && (
                      <button
                        type="button"
                        onClick={() => remove(item)}
                        disabled={isUploading}
                        aria-label={`Quitar ${item.file.name}`}
                        className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {item.status === 'done' && <p className="text-pcnGreen-700">agregado ✓</p>}
                  {!item.unsupported && (item.status === 'pending' || item.status === 'error') && (
                    <div className="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)] lg:max-w-2xl">
                      <DateInput
                        value={item.takenAt}
                        onChange={(takenAt) => update(item.key, { takenAt })}
                        max={todayInputValue()}
                        disabled={isUploading}
                        aria-label={`Fecha de ${item.file.name}`}
                        className="text-xs"
                      />
                      <Textarea
                        value={item.description}
                        onChange={(event) => update(item.key, { description: event.target.value })}
                        disabled={isUploading}
                        placeholder="Descripción (opcional)"
                        aria-label={`Descripción de ${item.file.name}`}
                        maxLength={500}
                        rows={2}
                        className="font-sans text-sm"
                      />
                    </div>
                  )}
                  {(item.unsupported ?? item.error) && (
                    <p className="text-red-500">{item.unsupported ?? item.error}</p>
                  )}
                  {item.status === 'error' && !item.unsupported && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void uploadAll(item)}
                      disabled={isUploading}
                      className="w-fit gap-1.5"
                    >
                      <RotateCw className="size-3.5" />
                      reintentar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </RuledGrid>

          {isUploading && (
            <p
              role="status"
              className="border border-pcnGreen bg-pcnGreen/5 px-3 py-2 font-mono text-xs text-pcnGreen"
            >
              Subiendo: no bloquees la pantalla ni cierres esta pestaña hasta que termine.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3">
            {done > 0 && (
              <Link
                href={`/proyectos/${projectId}`}
                className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
              >
                ver {done === 1 ? 'el archivo' : `los ${done} archivos`} en el proyecto →
              </Link>
            )}
            <Button
              type="button"
              variant="pcn"
              onClick={() => void uploadAll()}
              disabled={queued.length === 0}
              loading={isUploading}
              loadingText="subiendo..."
              className="flex items-center gap-1.5"
            >
              <Upload className="h-4 w-4" />
              subir {queued.length} {queued.length === 1 ? 'archivo' : 'archivos'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
