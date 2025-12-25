'use client';

import { createEvent } from '@/actions/events/create-event';
import { EventForm } from '@/components/events/event-form';
import { EventFormData } from '@/schemas/event-schema';
import { toast } from 'sonner';

export function NewEventForm() {
  const onSubmit = async (values: EventFormData) => {
    await toast.promise(createEvent(values), {
      loading: 'Creando evento...',
      success: 'Evento creado exitosamente! 🎉',
      error: (error) => {
        console.error('Error al crear el evento', error);
        return error.message || 'Ocurrió un error al crear el evento';
      },
    });
  };

  return <EventForm onSubmit={onSubmit} submitLabel="Crear evento" cancelHref="/eventos" />;
}
