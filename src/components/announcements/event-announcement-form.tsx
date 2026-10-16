'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Megaphone } from 'lucide-react';
import { createEventAnnouncement } from '@/actions/announcements/event-announcement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'El título debe tener al menos 3 caracteres' })
    .max(200, { message: 'El título no puede exceder 200 caracteres' }),
  content: z
    .string()
    .trim()
    .min(10, { message: 'El contenido debe tener al menos 10 caracteres' })
    .max(5000, { message: 'El contenido no puede exceder 5000 caracteres' }),
  pinned: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const Error = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive">{message}</p> : null;

/** Lets whoever manages the event post an announcement, which notifies everyone signed up. */
export function EventAnnouncementForm({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '', pinned: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { notified } = await createEventAnnouncement({ eventId, ...data });
      toast.success(
        notified === 0
          ? 'Anuncio publicado'
          : `Anuncio publicado: les avisamos a ${notified} ${notified === 1 ? 'inscripto' : 'inscriptos'}`,
      );
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(actionErrorMessage(error, 'Error al publicar el anuncio'));
    }
  };

  if (!open) {
    return (
      <div className="p-3">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Megaphone className="mr-1.5 size-4" />
          nuevoAnuncio();
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 p-3">
      <div className="space-y-1.5">
        <Label htmlFor="event-announcement-title">título</Label>
        <Input id="event-announcement-title" {...register('title')} />
        <Error message={errors.title?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="event-announcement-content">anuncio</Label>
        <Textarea
          id="event-announcement-content"
          rows={4}
          placeholder="Ej: Cambiamos de aula, ahora es en el 204."
          {...register('content')}
        />
        <Error message={errors.content?.message} />
      </div>
      <label className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <input type="checkbox" className="accent-pcnGreen" {...register('pinned')} />
        destacar (aparece primero)
      </label>
      <p className="font-mono text-[11px] text-muted-foreground">
        <span className="text-pcnGreen-500">$ </span>se publica acá y les llega a todos los
        inscriptos como notificación y por email
      </p>
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={isSubmitting} loadingText="publicando...">
          publicar();
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
