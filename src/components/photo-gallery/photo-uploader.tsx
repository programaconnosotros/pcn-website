'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { createPhoto, getPhotoUploadUrl } from '@/actions/gallery/gallery-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { toDateTimeInput } from './date-input';
import { PhotoEventSelect, type EventOption } from './photo-event-select';

type Status = 'pending' | 'uploading' | 'done' | 'error';

type Item = {
  key: string;
  file: File;
  preview: string;
  takenAt: string;
  description: string;
  status: Status;
  error?: string;
  photoId?: string;
};

// sharp's prebuilt binaries can't decode HEIC, so iPhone photos have to be exported first.
const isHeic = (file: File) => /hei[cf]$/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

// The date the photo was taken from its EXIF data, or the file's date when it has none.
async function readTakenAt(file: File) {
  try {
    const { default: exifr } = await import('exifr');
    const exif = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate']);
    const date = exif?.DateTimeOriginal ?? exif?.CreateDate;
    if (date instanceof Date && !Number.isNaN(date.getTime())) return date;
  } catch {
    // No EXIF: fall back to the file date.
  }
  return new Date(file.lastModified);
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
    const images = [...files].filter((file) => file.type.startsWith('image/') || isHeic(file));
    const added = await Promise.all(
      images.map(async (file): Promise<Item> => {
        const heic = isHeic(file);
        return {
          key: crypto.randomUUID(),
          file,
          preview: heic ? '' : URL.createObjectURL(file),
          takenAt: toDateTimeInput(await readTakenAt(file)),
          description: '',
          status: heic ? 'error' : 'pending',
          error: heic ? 'HEIC no está soportado: exportala como JPG.' : undefined,
        };
      }),
    );
    setItems((current) => [...current, ...added]);
  };

  const remove = (item: Item) => {
    URL.revokeObjectURL(item.preview);
    setItems((current) => current.filter(({ key }) => key !== item.key));
  };

  const uploadOne = async (item: Item) => {
    update(item.key, { status: 'uploading', error: undefined });
    try {
      const { uploadUrl, key } = await getPhotoUploadUrl(item.file.name, item.file.type);
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: item.file,
        headers: { 'Content-Type': item.file.type },
      });
      if (!response.ok) throw new Error('No se pudo subir el archivo a S3');

      const photo = await createPhoto(key, {
        takenAt: new Date(item.takenAt).toISOString(),
        description: item.description,
        eventId,
      });
      update(item.key, { status: 'done', photoId: photo.id });
      return true;
    } catch (error) {
      update(item.key, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Error al subir la foto',
      });
      return false;
    }
  };

  const uploadAll = async () => {
    const pending = items.filter((item) => item.status === 'pending' || item.status === 'error');
    const uploadable = pending.filter((item) => !isHeic(item.file));
    if (uploadable.length === 0) return;

    setIsUploading(true);
    let uploaded = 0;
    // One at a time: each photo is optimized on the server, which is the slow part.
    for (const item of uploadable) {
      if (await uploadOne(item)) uploaded++;
    }
    setIsUploading(false);

    if (uploaded === uploadable.length) toast.success(`${uploaded} fotos subidas`);
    else toast.error(`Se subieron ${uploaded} de ${uploadable.length} fotos`);
  };

  const pendingCount = items.filter(
    (item) => (item.status === 'pending' || item.status === 'error') && !isHeic(item.file),
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
          <span>arrastrá fotos o hacé click para elegirlas</span>
          <span className="text-[10px] text-muted-foreground/70">
            JPG, PNG, WebP, AVIF · se optimizan a WebP al subirlas
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = '';
          }}
        />

        <label className="space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            evento de las fotos
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
                  {item.status === 'uploading' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Loader2 className="size-5 animate-spin text-pcnGreen" />
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

                  {item.status === 'done' && item.photoId ? (
                    <Link
                      href={`/galeria/${item.photoId}`}
                      className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
                    >
                      ver foto y etiquetar personas →
                    </Link>
                  ) : isHeic(item.file) ? null : (
                    <>
                      <Input
                        type="datetime-local"
                        value={item.takenAt}
                        onChange={(event) => update(item.key, { takenAt: event.target.value })}
                        disabled={item.status === 'uploading'}
                        aria-label="Fecha de la foto"
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
                  {item.error && <p className="font-mono text-xs text-red-500">{item.error}</p>}
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
              subir {pendingCount} {pendingCount === 1 ? 'foto' : 'fotos'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
