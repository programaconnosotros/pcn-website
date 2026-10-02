'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ImagePlus, Loader2, Play, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  createPhoto,
  createVideo,
  getPhotoUploadUrl,
  getVideoUploadUrl,
} from '@/actions/gallery/gallery-actions';
import { MAX_VIDEO_BYTES } from '@/actions/gallery/gallery-schema';
import { formatDuration } from '@/lib/gallery-filters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { toDateTimeInput } from './date-input';
import { PhotoEventSelect, type EventOption } from './photo-event-select';
import {
  VIDEO_TYPES,
  isHeic,
  isVideo,
  placeholderPoster,
  postFile,
  putFile,
  readTakenAt,
  readVideo,
  type VideoInfo,
} from './upload-media';

type Status = 'pending' | 'uploading' | 'done' | 'error';

type Item = {
  key: string;
  file: File;
  // Object URL of the photo, or of the frame captured as the video's poster.
  preview: string;
  video: VideoInfo | null;
  takenAt: string;
  description: string;
  status: Status;
  // Why the file can't be uploaded at all (HEIC, a video the browser can't read, too big…).
  unsupported?: string;
  error?: string;
  progress?: number;
  itemId?: string;
};

const MAX_VIDEO_MB = MAX_VIDEO_BYTES / 1024 / 1024;

// Checks a picked file and reads what the form needs from it.
async function prepare(file: File): Promise<Item> {
  const base = {
    key: crypto.randomUUID(),
    file,
    preview: '',
    video: null,
    takenAt: toDateTimeInput(await readTakenAt(file)),
    description: '',
    status: 'pending' as Status,
  };
  if (isHeic(file)) return { ...base, unsupported: 'HEIC no está soportado: exportala como JPG.' };
  if (!isVideo(file)) return { ...base, preview: URL.createObjectURL(file) };

  if (!VIDEO_TYPES.includes(file.type)) {
    return { ...base, unsupported: 'Formato de video no soportado: subí MP4, WebM o MOV.' };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return { ...base, unsupported: `El video pesa más de ${MAX_VIDEO_MB} MB.` };
  }
  try {
    const video = await readVideo(file);
    return { ...base, video, preview: URL.createObjectURL(video.poster) };
  } catch {
    // The browser can't read it (e.g. HEVC on a desktop without the codec), but the file itself
    // is fine: upload it anyway, with a placeholder poster and no metadata.
    const poster = await placeholderPoster();
    const video = { durationSeconds: null, width: null, height: null, poster };
    return { ...base, video, preview: URL.createObjectURL(poster) };
  }
}

export function PhotoUploader({
  events,
  defaultEventId,
}: {
  events: EventOption[];
  defaultEventId: string | null;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [eventId, setEventId] = useState<string | null>(defaultEventId);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Free the previews when leaving the page.
  useEffect(() => () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview)), []);

  const update = (key: string, patch: Partial<Item>) =>
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const addFiles = async (files: FileList | File[]) => {
    const media = [...files].filter(
      (file) => file.type.startsWith('image/') || isVideo(file) || isHeic(file),
    );
    const added = await Promise.all(media.map(prepare));
    setItems((current) => [...current, ...added]);
  };

  const remove = (item: Item) => {
    URL.revokeObjectURL(item.preview);
    setItems((current) => current.filter(({ key }) => key !== item.key));
  };

  // Photos: PUT the original, the server optimizes it. Videos: POST the file as is (S3 enforces
  // the size limit), PUT the captured poster, then save both.
  const uploadOne = async (item: Item) => {
    update(item.key, { status: 'uploading', error: undefined, progress: 0 });
    const details = {
      takenAt: new Date(item.takenAt).toISOString(),
      description: item.description,
      eventId,
    };
    try {
      let created: { id: string };
      if (item.video) {
        const { url, fields, key } = await getVideoUploadUrl(item.file.type, item.file.size);
        await postFile(url, fields, item.file, (progress) => update(item.key, { progress }));

        const poster = await getPhotoUploadUrl('poster.jpg', 'image/jpeg');
        await putFile(poster.uploadUrl, item.video.poster, 'image/jpeg');

        const { durationSeconds, width, height } = item.video;
        created = await createVideo(key, poster.key, {
          ...details,
          durationSeconds,
          width,
          height,
        });
      } else {
        const { uploadUrl, key } = await getPhotoUploadUrl(item.file.name, item.file.type);
        await putFile(uploadUrl, item.file, item.file.type);
        created = await createPhoto(key, details);
      }
      update(item.key, { status: 'done', itemId: created.id });
      return true;
    } catch (error) {
      update(item.key, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Error al subir el archivo',
      });
      return false;
    }
  };

  const uploadAll = async () => {
    const pending = items.filter((item) => item.status === 'pending' || item.status === 'error');
    const uploadable = pending.filter((item) => !item.unsupported);
    if (uploadable.length === 0) return;

    setIsUploading(true);
    let uploaded = 0;
    // One at a time: photos are optimized on the server and videos are big.
    for (const item of uploadable) {
      if (await uploadOne(item)) uploaded++;
    }
    setIsUploading(false);

    if (uploaded === uploadable.length) toast.success(`${uploaded} archivos subidos`);
    else toast.error(`Se subieron ${uploaded} de ${uploadable.length} archivos`);
  };

  const pendingCount = items.filter(
    (item) => (item.status === 'pending' || item.status === 'error') && !item.unsupported,
  ).length;
  const doneCount = items.filter((item) => item.status === 'done').length;

  return (
    <div className="mb-14 space-y-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:items-end">
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
            addFiles(event.dataTransfer.files);
          }}
          disabled={isUploading}
          className={cn(
            'flex flex-col items-center justify-center gap-2 border border-dashed border-pcnGreen-200 px-4 py-8 font-mono text-xs text-muted-foreground transition-colors hover:border-pcnGreen hover:text-pcnGreen',
            isDragging && 'border-pcnGreen bg-pcnGreen/5 text-pcnGreen',
          )}
        >
          <ImagePlus className="size-6" />
          <span>arrastrá fotos y videos o hacé click para elegirlos</span>
          <span className="text-[10px] text-muted-foreground/70">
            fotos: JPG, PNG, WebP, AVIF (se optimizan a WebP) · videos: MP4, WebM, MOV hasta{' '}
            {MAX_VIDEO_MB} MB
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = '';
          }}
        />

        <label className="space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            evento
          </span>
          <PhotoEventSelect
            events={events}
            value={eventId}
            onChange={setEventId}
            disabled={isUploading}
          />
        </label>
      </div>

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
                    <img src={item.preview} alt="" className="h-full w-full object-cover" />
                  )}
                  {item.video && item.status !== 'uploading' && item.status !== 'done' && (
                    <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-sm bg-black/70 px-1 font-mono text-[10px] text-pcnGreen">
                      <Play className="size-2.5 fill-current" />
                      {item.video.durationSeconds !== null
                        ? formatDuration(item.video.durationSeconds)
                        : 'video'}
                    </span>
                  )}
                  {item.status === 'uploading' && (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60">
                      <Loader2 className="size-5 animate-spin text-pcnGreen" />
                      {item.video && (
                        <span className="font-mono text-[10px] tabular-nums text-pcnGreen">
                          {Math.round((item.progress ?? 0) * 100)}%
                        </span>
                      )}
                    </span>
                  )}
                  {item.status === 'done' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Check className="size-6 text-pcnGreen" />
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="min-w-0 flex-1 truncate text-pcnGreen">{item.file.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {(item.file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    {item.status !== 'done' && item.status !== 'uploading' && (
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

                  {item.status === 'done' && item.itemId ? (
                    <Link
                      href={`/galeria/${item.itemId}`}
                      className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
                    >
                      ver y etiquetar personas →
                    </Link>
                  ) : item.unsupported ? null : (
                    <>
                      <Input
                        type="datetime-local"
                        value={item.takenAt}
                        onChange={(event) => update(item.key, { takenAt: event.target.value })}
                        disabled={item.status === 'uploading'}
                        aria-label="Fecha"
                        className="max-w-xs font-mono text-xs"
                      />
                      <Textarea
                        value={item.description}
                        onChange={(event) => update(item.key, { description: event.target.value })}
                        disabled={item.status === 'uploading'}
                        placeholder="Descripción (opcional)"
                        maxLength={500}
                        rows={2}
                        className="text-sm"
                      />
                    </>
                  )}
                  {(item.unsupported ?? item.error) && (
                    <p className="font-mono text-xs text-red-500">
                      {item.unsupported ?? item.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RuledGrid>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {doneCount > 0 && (
              <Link
                href={eventId ? `/galeria?evento=${eventId}` : '/galeria'}
                className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
              >
                ver {doneCount} subidas en la galería →
              </Link>
            )}
            <Button
              type="button"
              variant="pcn"
              onClick={uploadAll}
              disabled={pendingCount === 0}
              loading={isUploading}
              loadingText="subiendo..."
              className="flex items-center gap-1.5"
            >
              <Upload className="h-4 w-4" />
              subir {pendingCount} {pendingCount === 1 ? 'archivo' : 'archivos'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
