'use client';

import { createEvent } from '@/actions/events/create-event';
import { EventForm } from '@/components/events/event-form';
import { EventFormData } from '@/schemas/event-schema';
import { isRedirectError } from '@/lib/error-handler';
import { toast } from 'sonner';

export function NewEventForm() {
  const onSubmit = async (values: EventFormData) => {
    const toastId = toast.loading('Creando evento...');

    try {
      await createEvent(values);
    } catch (error) {
      if (isRedirectError(error)) {
        toast.success('Evento creado exitosamente! 🎉', { id: toastId });
        throw error;
      }

      console.error('Error al crear el evento', error);
      toast.error(
        error instanceof Error ? error.message : 'Ocurrió un error al crear el evento',
        { id: toastId },
      );
    }
  };

  return <EventForm onSubmit={onSubmit} submitLabel="Crear evento" cancelHref="/eventos" />;
}
