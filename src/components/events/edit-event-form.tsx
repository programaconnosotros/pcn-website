'use client';

import { updateEvent } from '@/actions/events/update-event';
import { EventForm } from '@/components/events/event-form';
import { EventFormData } from '@/schemas/event-schema';
import { toast } from 'sonner';

type EditEventFormProps = {
  eventId: string;
  defaultValues: EventFormData;
};

export function EditEventForm({ eventId, defaultValues }: EditEventFormProps) {
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

  return (
    <EventForm
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitLabel="Guardar cambios"
      cancelHref={`/eventos/${eventId}`}
    />
  );
}

