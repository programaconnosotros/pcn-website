'use client';

import { updateEvent } from '@/actions/events/update-event';
import { EventForm } from '@/components/events/event-form';
import { EventFormData } from '@/schemas/event-schema';
import { useEffect, useState } from 'react';
import { isRedirectError } from '@/lib/error-handler';
import { toast } from 'sonner';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type EditEventFormProps = {
  eventId: string;
  defaultValues: Omit<EventFormData, 'date' | 'endDate'> & { date: string; endDate: string };
  flyerAgent?: boolean;
};

const formatDateForInput = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Moving an upcoming event in time or place tells everyone signed up for it (see updateEvent).
 * Both sides are the form's local values.
 */
export const editEventNotice = (before: EventFormData, after: EventFormData) => {
  const same = (a: unknown, b: unknown) => String(a || '') === String(b || '');
  const when = !same(before.date, after.date) || !same(before.endDate, after.endDate);
  const where =
    !same(before.isOnline, after.isOnline) ||
    !same(before.placeName, after.placeName) ||
    !same(before.address, after.address) ||
    !same(before.city, after.city);
  if (!(when || where) || !(new Date(after.date) > new Date())) return null;

  const what = when && where ? 'la fecha y el lugar' : when ? 'la fecha' : 'el lugar';
  return `Cambiaste ${what}: al guardar se le manda una notificación en la app y un email a todos los inscriptos al evento.`;
};

export function EditEventForm({ eventId, defaultValues, flyerAgent = false }: EditEventFormProps) {
  const [formDefaults, setFormDefaults] = useState<EventFormData | null>(null);

  useEffect(() => {
    setFormDefaults({
      ...defaultValues,
      date: formatDateForInput(defaultValues.date),
      endDate: defaultValues.endDate ? formatDateForInput(defaultValues.endDate) : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: EventFormData) => {
    const toastId = toast.loading('Actualizando evento...');

    try {
      await updateEvent(eventId, values);
    } catch (error) {
      if (isRedirectError(error)) {
        toast.success('Evento actualizado exitosamente! 🎉', { id: toastId });
        throw error;
      }

      console.error('Error al actualizar el evento', error);
      toast.error(actionErrorMessage(error, 'Ocurrió un error al actualizar el evento', true), {
        id: toastId,
      });
    }
  };

  if (!formDefaults) return null;

  return (
    <EventForm
      defaultValues={formDefaults}
      onSubmit={onSubmit}
      submitLabel="guardarCambios();"
      cancelHref={`/eventos/${eventId}`}
      flyerAgent={flyerAgent}
      notificationNotice={(values) => editEventNotice(formDefaults, values)}
    />
  );
}
