'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteProjectMedia, updateProjectMediaDetails } from '@/actions/projects/project-media';
import { Button } from '@/components/ui/button';
import { DateInput } from '@/components/ui/date-input';
import { Textarea } from '@/components/ui/textarea';
import { calendarDate, dateInputValue, todayInputValue } from '@/schemas/setup-schema';
import { VideoBadge } from '@/components/photo-gallery/video-badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';

export type ProjectMediaItem = {
  id: string;
  kind: 'PHOTO' | 'VIDEO';
  src: string;
  thumbSrc: string;
  width: number | null;
  height: number | null;
  description: string | null;
  /** The day it was taken (`@db.Date`, midnight UTC). */
  takenAt: Date | null;
};

/** What a photo says under it in the viewer, and the form to change it for the team. */
function MediaCaption({ item, canEdit }: { item: ProjectMediaItem; canEdit: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [takenAt, setTakenAt] = useState(item.takenAt ? dateInputValue(item.takenAt) : '');
  const [description, setDescription] = useState(item.description ?? '');

  const save = async () => {
    setSaving(true);
    try {
      await updateProjectMediaDetails(item.id, { takenAt: takenAt || null, description });
      toast.success('Guardado');
      setEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No se pudo guardar', true));
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="grid gap-2 font-mono text-xs sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-start">
        <DateInput
          value={takenAt}
          onChange={setTakenAt}
          max={todayInputValue()}
          aria-label="Fecha"
          className="text-xs"
        />
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Descripción (opcional)"
          aria-label="Descripción"
          maxLength={500}
          rows={2}
          className="font-sans text-sm"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="pcn" onClick={() => void save()} loading={saving}>
            guardar
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
            cancelar
          </Button>
        </div>
      </div>
    );
  }

  if (!item.takenAt && !item.description && !canEdit) return null;
  return (
    <div className="flex items-start gap-3 font-mono text-xs text-muted-foreground">
      <div className="min-w-0 flex-1 space-y-1">
        {item.takenAt && (
          <p className="flex items-center gap-1.5 text-pcnGreen-700">
            <CalendarDays className="size-3.5" />
            {format(calendarDate(new Date(item.takenAt)), "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        )}
        {item.description && (
          <p className="font-sans text-sm whitespace-pre-line text-foreground">
            {item.description}
          </p>
        )}
      </div>
      {canEdit && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex shrink-0 items-center gap-1 hover:text-pcnGreen"
        >
          <Pencil className="size-3.5" />
          {item.takenAt || item.description ? 'editar' : 'agregar fecha y descripción'}
        </button>
      )}
    </div>
  );
}

/**
 * A project's photos and videos as square thumbnails; each opens full size (videos play there).
 * Whoever can edit the project also gets a button to remove each one.
 */
export function ProjectMediaGrid({
  media,
  title,
  canEdit,
}: {
  media: ProjectMediaItem[];
  title: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  // By id, so the viewer shows the refreshed item after editing it.
  const [openId, setOpenId] = useState<string | null>(null);
  const open = media.find((item) => item.id === openId) ?? null;
  const [deleting, setDeleting] = useState<string | null>(null);

  const remove = async (item: ProjectMediaItem) => {
    setDeleting(item.id);
    try {
      await deleteProjectMedia(item.id);
      toast.success(item.kind === 'VIDEO' ? 'Video eliminado' : 'Foto eliminada');
      router.refresh();
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No se pudo eliminar', true));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <RuledGrid className="grid-cols-2 sm:grid-cols-3">
        {media.map((item, index) => (
          <div key={item.id} className={cn(ruledCellClassName, 'relative group p-1')}>
            <button
              type="button"
              onClick={() => setOpenId(item.id)}
              className="relative block aspect-square w-full overflow-hidden bg-black"
              aria-label={`${item.kind === 'VIDEO' ? 'Ver video' : 'Ver foto'} ${index + 1} de ${title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbSrc}
                alt={item.description ?? ''}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover brightness-[0.85] transition duration-300 group-hover:scale-[1.04] group-hover:brightness-100"
              />
              {item.kind === 'VIDEO' && <VideoBadge />}
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => remove(item)}
                disabled={deleting === item.id}
                title="Eliminar"
                className="absolute top-2 right-2 rounded-sm bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100 disabled:opacity-50 max-md:opacity-100"
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Eliminar {item.kind === 'VIDEO' ? 'video' : 'foto'}</span>
              </button>
            )}
          </div>
        ))}
      </RuledGrid>

      <Dialog open={!!open} onOpenChange={(value) => !value && setOpenId(null)}>
        <DialogContent className="max-w-5xl gap-3 border-pcnGreen-200 bg-black p-2 sm:p-3">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {open?.kind === 'VIDEO' ? (
            <video
              key={open.id}
              src={open.src}
              poster={open.thumbSrc}
              controls
              autoPlay
              playsInline
              className="max-h-[75dvh] w-full"
            />
          ) : (
            open && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={open.src}
                alt={title}
                width={open.width ?? undefined}
                height={open.height ?? undefined}
                className="mx-auto max-h-[75dvh] w-auto max-w-full object-contain"
              />
            )
          )}
          {open && <MediaCaption key={open.id} item={open} canEdit={canEdit} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
