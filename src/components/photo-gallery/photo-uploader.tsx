'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ImagePlus, Loader2, Play, Smartphone, Upload, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { toDateTimeInput } from './date-input';
import { findEventForDate } from './event-for-date';
import { PhotoEventSelect, type EventOption } from './photo-event-select';
import {
  VIDEO_TYPES,
  compressVideo,
  isVideo,
  placeholderPoster,
  postFile,
  preparePhotoForUpload,
  putFile,
  readTakenAt,
  readVideo,
  type VideoInfo,
} from './upload-media';
import { DateInput } from '@/components/ui/date-input';
import { isHeic, toJpegIfHeic } from '@/lib/heic';

type Status = 'pending' | 'compressing' | 'uploading' | 'done' | 'error';

type Item = {
  key: string;
  file: File;
  // Object URL of the photo, or of the frame captured as the video's poster.
  preview: string;
  video: VideoInfo | null;
  takenAt: string;
  description: string;
  eventId: string | null;
  // The event was picked because the file's date falls on it.
  eventFromDate: boolean;
  status: Status;
  // Why the file can't be uploaded at all (a HEIC that didn't convert, a video too big…).
  unsupported?: string;
  error?: string;
  progress?: number;
  // Size of what was actually uploaded, when the video was compressed first.
  uploadedSize?: number;
  itemId?: string;
};

const MAX_VIDEO_MB = MAX_VIDEO_BYTES / 1024 / 1024;

const toMb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

// Checks a picked file and reads what the form needs from it. Files taken during an event
// start with that event; the rest, with the one chosen for every file. HEIC photos become JPEGs
// here, after reading their date (the conversion drops the EXIF).
async function prepare(file: File, eventId: string | null, events: EventOption[]): Promise<Item> {
  const takenAt = await readTakenAt(file);
  const eventOnDate = findEventForDate(events, takenAt);
  const base = {
    key: crypto.randomUUID(),
    file,
    preview: '',
    video: null,
    takenAt: toDateTimeInput(takenAt),
    description: '',
    eventId: eventOnDate?.id ?? eventId,
    eventFromDate: !!eventOnDate,
    status: 'pending' as Status,
  };
  if (!isVideo(file)) {
    try {
      const photo = await preparePhotoForUpload(await toJpegIfHeic(file));
      return { ...base, file: photo, preview: URL.createObjectURL(photo) };
    } catch (error) {
      return { ...base, unsupported: (error as Error).message };
    }
  }

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
  canUploadVideos = true,
  needsReview = false,
  defaultWorking = false,
}: {
  events: EventOption[];
  defaultEventId: string | null;
  /** Videos are admins only: they're big and there's no review queue for them. */
  canUploadVideos?: boolean;
  /** What a member uploads waits for an admin before it shows in the gallery. */
  needsReview?: boolean;
  /** Coming from "upload a photo at work" on the profile. */
  defaultWorking?: boolean;
}) {
  const [items, setItems] = useState<Item[]>([]);
  // Photos of the uploader at work: they go to the gallery's "trabajando" tab and their profile.
  const [working, setWorking] = useState(defaultWorking);
  // Event for every file: new files start with it and changing it re-tags the pending ones.
  // Each file can still be moved to another event on its own.
  const [eventId, setEventId] = useState<string | null>(defaultEventId);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Files picked but still being read (HEIC conversion, shrinking, video frames).
  const [preparing, setPreparing] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Free the previews when leaving the page.
  useEffect(() => () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview)), []);

  // While uploading, keep the screen on (a locked phone suspends the tab and kills the video
  // compression) and ask before leaving the page.
  useEffect(() => {
    if (!isUploading) return;
    let wakeLock: WakeLockSentinel | null = null;
    let released = false;
    const requestWakeLock = async () => {
      if (document.visibilityState !== 'visible' || !('wakeLock' in navigator)) return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (released) sentinel.release();
        else wakeLock = sentinel;
      } catch {
        // Denied (low battery, unsupported): the on-screen notice is all we have.
      }
    };
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => event.preventDefault();

    requestWakeLock();
    // The browser drops the lock whenever the tab is hidden; take it again on return.
    document.addEventListener('visibilitychange', requestWakeLock);
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => {
      released = true;
      wakeLock?.release();
      document.removeEventListener('visibilitychange', requestWakeLock);
      window.removeEventListener('beforeunload', warnBeforeLeaving);
    };
  }, [isUploading]);

  const update = (key: string, patch: Partial<Item>) =>
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const addFiles = async (files: FileList | File[]) => {
    const media = [...files].filter(
      (file) => file.type.startsWith('image/') || isVideo(file) || isHeic(file),
    );
    // One at a time, each shown as soon as it's ready: a phone converting and reading a dozen
    // photos at once (many just downloaded from iCloud) runs out of memory and shows nothing.
    setPreparing((count) => count + media.length);
    for (const file of media) {
      const item =
        !canUploadVideos && isVideo(file)
          ? {
              ...(await prepare(file, eventId, [])),
              unsupported: 'Por ahora solo se pueden subir fotos.',
            }
          : await prepare(file, eventId, events);
      setItems((current) => [...current, item]);
      setPreparing((count) => count - 1);
    }
  };

  const setEventForAll = (next: string | null) => {
    setEventId(next);
    setItems((current) =>
      current.map((item) =>
        item.status === 'done' ? item : { ...item, eventId: next, eventFromDate: false },
      ),
    );
  };

  // A new date moves the file to the event on that date, unless its event was picked by hand.
  const changeTakenAt = (item: Item, takenAt: string) => {
    const eventOnDate = item.eventFromDate ? findEventForDate(events, new Date(takenAt)) : null;
    update(item.key, {
      takenAt,
      ...(item.eventFromDate && {
        eventId: eventOnDate?.id ?? eventId,
        eventFromDate: !!eventOnDate,
      }),
    });
  };

  const remove = (item: Item) => {
    URL.revokeObjectURL(item.preview);
    setItems((current) => current.filter(({ key }) => key !== item.key));
  };

  // Photos: PUT the original, the server optimizes it. Videos: compress them in the browser
  // (or keep the original when that isn't possible), POST the file (S3 enforces the size
  // limit), PUT the captured poster, then save both.
  const uploadOne = async (item: Item) => {
    update(item.key, { error: undefined, progress: 0 });
    const details = {
      takenAt: new Date(item.takenAt).toISOString(),
      description: item.description,
      eventId: item.eventId,
    };
    try {
      let created: { id: string };
      if (item.video) {
        update(item.key, { status: 'compressing' });
        const compressed = await compressVideo(item.file, (progress) =>
          update(item.key, { progress }),
        ).catch(() => null);
        const file = compressed?.file ?? item.file;

        update(item.key, { status: 'uploading', progress: 0, uploadedSize: compressed?.file.size });
        const { url, fields, key } = await getVideoUploadUrl(file.type, file.size);
        await postFile(url, fields, file, (progress) => update(item.key, { progress }));

        const poster = await getPhotoUploadUrl('poster.jpg', 'image/jpeg');
        await putFile(poster.uploadUrl, item.video.poster, 'image/jpeg');

        created = await createVideo(key, poster.key, {
          ...details,
          durationSeconds: item.video.durationSeconds,
          width: compressed?.width ?? item.video.width,
          height: compressed?.height ?? item.video.height,
        });
      } else {
        update(item.key, { status: 'uploading' });
        const { uploadUrl, key } = await getPhotoUploadUrl(item.file.name, item.file.type);
        await putFile(uploadUrl, item.file, item.file.type);
        created = await createPhoto(key, { ...details, working });
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

    if (uploaded === uploadable.length) {
      toast.success(
        needsReview
          ? `${uploaded} ${uploaded === 1 ? 'foto enviada' : 'fotos enviadas'}: se publican cuando un admin las apruebe`
          : `${uploaded} archivos subidos`,
      );
    } else toast.error(`Se subieron ${uploaded} de ${uploadable.length} archivos`);
  };

  const pendingCount = items.filter(
    (item) => (item.status === 'pending' || item.status === 'error') && !item.unsupported,
  ).length;
  const done = items.filter((item) => item.status === 'done');
  const doneEventIds = new Set(done.map((item) => item.eventId));
  // Link to the event's gallery only when everything uploaded went to the same one.
  const doneEventId = doneEventIds.size === 1 ? [...doneEventIds][0] : null;
  const mixedEvents = new Set(items.map((item) => item.eventId)).size > 1;
  const hasPendingVideos = items.some(
    (item) => item.video && !item.unsupported && item.status !== 'done',
  );

  return (
    <div className="mb-14 space-y-4">
      {needsReview && (
        <p
          role="note"
          className="border border-dashed border-pcnGreen-200 px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          <span className="text-pcnGreen">[revisión]</span> Las fotos que subís aparecen en la
          galería cuando un admin las aprueba.
        </p>
      )}
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
          <span>
            arrastrá {canUploadVideos ? 'fotos y videos' : 'fotos'} o hacé click para elegirlos
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            fotos: JPG, PNG, WebP, AVIF, HEIC (se optimizan a WebP)
            {canUploadVideos &&
              ` · videos: MP4, WebM, MOV hasta ${MAX_VIDEO_MB} MB (se optimizan a MP4 1080p)`}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={canUploadVideos ? 'image/*,video/mp4,video/webm,video/quicktime' : 'image/*'}
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = '';
          }}
        />

        <label className="space-y-1">
          <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            evento para todos
            {mixedEvents && <span className="tracking-normal normal-case"> · hay varios</span>}
          </span>
          <PhotoEventSelect
            events={events}
            value={eventId}
            onChange={setEventForAll}
            disabled={isUploading}
          />
        </label>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 font-mono text-xs">
        <input
          type="checkbox"
          checked={working}
          onChange={(event) => setWorking(event.target.checked)}
          disabled={isUploading}
          className="size-4 cursor-pointer accent-pcnPurple dark:accent-pcnGreen"
        />
        <span>
          son fotos mías trabajando
          <span className="text-muted-foreground">
            {' '}
            · van a la pestaña &quot;trabajando&quot; de la galería y a tu perfil
          </span>
        </span>
      </label>

      {preparing > 0 && (
        <p
          role="status"
          className="flex items-center gap-2 border border-dashed border-pcnGreen-200 px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          <Loader2 className="size-3.5 shrink-0 animate-spin text-pcnGreen" />
          preparando {preparing} {preparing === 1 ? 'archivo' : 'archivos'}… si están en iCloud, el
          teléfono primero los descarga.
        </p>
      )}

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
                  {item.video && (item.status === 'pending' || item.status === 'error') && (
                    <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-sm bg-black/70 px-1 font-mono text-[10px] text-pcnGreen">
                      <Play className="size-2.5 fill-current" />
                      {item.video.durationSeconds !== null
                        ? formatDuration(item.video.durationSeconds)
                        : 'video'}
                    </span>
                  )}
                  {(item.status === 'compressing' || item.status === 'uploading') && (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60">
                      <Loader2 className="size-5 animate-spin text-pcnGreen" />
                      {item.video && (
                        <span className="text-center font-mono text-[10px] text-pcnGreen tabular-nums">
                          {item.status === 'compressing' ? 'optimizando' : 'subiendo'}
                          <br />
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
                      {toMb(item.file.size)} MB
                      {item.uploadedSize !== undefined && (
                        <span className="text-pcnGreen"> → {toMb(item.uploadedSize)} MB</span>
                      )}
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

                  {item.status === 'done' && needsReview ? (
                    <p className="font-mono text-xs text-muted-foreground">
                      en revisión: se publica cuando un admin la apruebe
                    </p>
                  ) : item.status === 'done' && item.itemId ? (
                    <Link
                      href={`/galeria/${item.itemId}`}
                      className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
                    >
                      ver y etiquetar personas →
                    </Link>
                  ) : item.unsupported ? null : (
                    <>
                      <div className="grid gap-2 sm:grid-cols-2 lg:max-w-2xl">
                        <DateInput
                          withTime
                          value={item.takenAt}
                          onChange={(value) => changeTakenAt(item, value)}
                          disabled={item.status === 'compressing' || item.status === 'uploading'}
                          aria-label="Fecha"
                          className="text-xs"
                        />
                        <PhotoEventSelect
                          events={events}
                          value={item.eventId}
                          onChange={(next) =>
                            update(item.key, { eventId: next, eventFromDate: false })
                          }
                          aria-label="Evento"
                          disabled={item.status === 'compressing' || item.status === 'uploading'}
                        />
                      </div>
                      {item.eventFromDate && item.eventId && (
                        <p className="-mt-1 font-mono text-[10px] text-pcnGreen-700">
                          evento elegido por la fecha del archivo
                        </p>
                      )}
                      <Textarea
                        value={item.description}
                        onChange={(event) => update(item.key, { description: event.target.value })}
                        disabled={item.status === 'compressing' || item.status === 'uploading'}
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

          {(isUploading || hasPendingVideos) && (
            <p
              role="status"
              className={cn(
                'flex items-start gap-2 border px-3 py-2 font-mono text-xs',
                isUploading
                  ? 'border-pcnGreen bg-pcnGreen/5 text-pcnGreen'
                  : 'border-pcnGreen-200 text-muted-foreground',
              )}
            >
              <Smartphone className="mt-0.5 size-3.5 shrink-0" />
              <span>
                {isUploading
                  ? 'Subiendo: no bloquees la pantalla, no cambies de app ni cierres esta pestaña hasta que termine. Si el dispositivo se bloquea, la subida se corta.'
                  : 'Los videos se optimizan en este dispositivo antes de subirse y puede tardar unos minutos. Mientras tanto, no bloquees la pantalla ni salgas de esta página.'}
              </span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3">
            {done.length > 0 && !needsReview && (
              <Link
                href={doneEventId ? `/galeria?evento=${doneEventId}` : '/galeria'}
                className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
              >
                ver {done.length} subidas en la galería →
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
