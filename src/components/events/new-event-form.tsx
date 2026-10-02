'use client';

import { createEvent } from '@/actions/events/create-event';
import { EventForm } from '@/components/events/event-form';
import { EventFormData } from '@/schemas/event-schema';
import { isRedirectError } from '@/lib/error-handler';
import { toast } from 'sonner';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

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
      toast.error(actionErrorMessage(error, 'Ocurrió un error al crear el evento', true), {
        id: toastId,
      });
    }
  };

  return <EventForm onSubmit={onSubmit} submitLabel="crearEvento();" cancelHref="/eventos" />;
}
