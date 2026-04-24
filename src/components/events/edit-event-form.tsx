'use client';

import { updateEvent } from '@/actions/events/update-event';
import { EventForm } from '@/components/events/event-form';
import { EventFormData } from '@/schemas/event-schema';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type EditEventFormProps = {
  eventId: string;
  defaultValues: Omit<EventFormData, 'date' | 'endDate'> & { date: string; endDate: string };
};

const formatDateForInput = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function EditEventForm({ eventId, defaultValues }: EditEventFormProps) {
  const [formDefaults, setFormDefaults] = useState<EventFormData | null>(null);

  useEffect(() => {
    setFormDefaults({
      ...defaultValues,
      date: formatDateForInput(defaultValues.date),
      endDate: defaultValues.endDate ? formatDateForInput(defaultValues.endDate) : '',
    });
  }, []);

  const onSubmit = async (values: EventFormData) => {
    await toast.promise(updateEvent(eventId, values), {
      loading: 'Actualizando evento...',
      success: 'Evento actualizado exitosamente! 🎉',
      error: (error) => {
        console.error('Error al actualizar el evento', error);
        return error.message || 'Ocurrió un error al actualizar el evento';
      },
    });
  };

  if (!formDefaults) return null;

  return (
    <EventForm
      defaultValues={formDefaults}
      onSubmit={onSubmit}
      submitLabel="Guardar cambios"
      cancelHref={`/eventos/${eventId}`}
    />
  );
}
