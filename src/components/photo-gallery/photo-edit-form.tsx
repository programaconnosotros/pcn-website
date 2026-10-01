'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deletePhoto, updatePhoto } from '@/actions/photos/photo-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { photoImageUrl } from '@/lib/photo-urls';
import { toDateTimeInput } from './date-input';
import { PhotoEventSelect, type EventOption } from './photo-event-select';

type Props = {
  photo: {
    id: string;
    takenAt: Date;
    description: string | null;
    eventId: string | null;
  };
  events: EventOption[];
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block space-y-1">
    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
    {children}
  </label>
);

export function PhotoEditForm({ photo, events }: Props) {
  const router = useRouter();
  const [takenAt, setTakenAt] = useState(() => toDateTimeInput(new Date(photo.takenAt)));
  const [description, setDescription] = useState(photo.description ?? '');
  const [eventId, setEventId] = useState(photo.eventId);
  const [isPending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      try {
        await updatePhoto(photo.id, {
          takenAt: new Date(takenAt).toISOString(),
          description,
          eventId,
        });
        toast.success('Foto actualizada');
        router.push(`/galeria/${photo.id}`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
      }
    });

  const remove = () =>
    startTransition(async () => {
      try {
        await deletePhoto(photo.id);
        toast.success('Foto eliminada');
        router.push('/galeria');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo eliminar');
      }
    });

  return (
    <form
      className="mb-14 grid max-w-3xl gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoImageUrl(photo.id)}
        alt=""
        className="aspect-square w-40 bg-black object-cover"
      />

      <div className="space-y-4">
        <Field label="fecha">
          <Input
            type="datetime-local"
            value={takenAt}
            onChange={(event) => setTakenAt(event.target.value)}
            required
            className="max-w-xs font-mono text-xs"
          />
        </Field>
        <Field label="descripción (opcional)">
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
          />
        </Field>
        <Field label="evento">
          <PhotoEventSelect events={events} value={eventId} onChange={setEventId} />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="pcn" loading={isPending} loadingText="guardando...">
            <Save className="mr-2 h-4 w-4" />
            guardarCambios();
          </Button>
          <Link
            href={`/galeria/${photo.id}`}
            className="font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            cancelar
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" className="ml-auto" disabled={isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar esta foto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se borra de la galería, del evento y de los perfiles de quienes están etiquetados.
                  No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={remove}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </form>
  );
}
