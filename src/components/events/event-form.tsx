'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { eventSchema, EventFormData } from '@/schemas/event-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, MapPin, Building2, Image as ImageIcon, Save } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

type EventFormProps = {
  defaultValues?: Partial<EventFormData>;
  onSubmit: (values: EventFormData) => Promise<void>;
  submitLabel?: string;
  cancelHref?: string;
};

export function EventForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Guardar evento',
  cancelHref = '/eventos',
}: EventFormProps) {
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      date: defaultValues?.date || '',
      endDate: defaultValues?.endDate || '',
      city: defaultValues?.city || '',
      address: defaultValues?.address || '',
      placeName: defaultValues?.placeName || '',
      flyerSrc: defaultValues?.flyerSrc || '',
      latitude: defaultValues?.latitude || '',
      longitude: defaultValues?.longitude || '',
    },
  });

  const handleSubmit = async (values: EventFormData) => {
    await onSubmit(values);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Nombre del evento */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del evento</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Meetup de desarrolladores" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descripción */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe el evento, qué se hará, quién puede asistir, etc."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha de inicio */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Calendar className="mr-2 inline h-4 w-4" />
                  Fecha de inicio
                </FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha de finalización */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Calendar className="mr-2 inline h-4 w-4" />
                  Fecha de finalización (opcional)
                </FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>Si el evento tiene una duración específica</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ciudad */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <MapPin className="mr-2 inline h-4 w-4" />
                  Ciudad
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Buenos Aires" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre del lugar */}
          <FormField
            control={form.control}
            name="placeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Building2 className="mr-2 inline h-4 w-4" />
                  Nombre del lugar
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Universidad de Buenos Aires, Bar XYZ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dirección */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <MapPin className="mr-2 inline h-4 w-4" />
                  Dirección
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Av. Corrientes 1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Latitud */}
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitud (opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Ej: -34.6037"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Coordenada de latitud para el mapa</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Longitud */}
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud (opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Ej: -58.3816"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Coordenada de longitud para el mapa</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* URL del flyer */}
          <FormField
            control={form.control}
            name="flyerSrc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <ImageIcon className="mr-2 inline h-4 w-4" />
                  URL del flyer
                </FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://ejemplo.com/flyer.jpg" {...field} />
                </FormControl>
                <FormDescription>URL de la imagen del flyer del evento</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botones */}
          <div className="flex gap-4">
            <Button type="submit" variant="pcn" className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {submitLabel}
            </Button>
            <Link href={cancelHref} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}

