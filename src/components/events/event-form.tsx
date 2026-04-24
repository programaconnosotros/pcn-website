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
import { Calendar, MapPin, Building2, Save, Plus, Trash2, Users, Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { useState } from 'react';

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
      sponsors: defaultValues?.sponsors || [],
      capacity: defaultValues?.capacity?.toString() || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sponsors',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: EventFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
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
                    value={String(field.value ?? '')}
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
                    value={String(field.value ?? '')}
                  />
                </FormControl>
                <FormDescription>Coordenada de longitud para el mapa</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Flyer del evento */}
          <FormField
            control={form.control}
            name="flyerSrc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flyer del evento</FormLabel>
                <FormControl>
                  <FileUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder="events/flyers"
                  />
                </FormControl>
                <FormDescription>
                  Imagen del flyer del evento (JPEG, PNG, WebP, GIF)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cupo */}
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Users className="mr-2 inline h-4 w-4" />
                  Cupo máximo (opcional)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ej: 50"
                    {...field}
                    value={String(field.value ?? '')}
                  />
                </FormControl>
                <FormDescription>
                  Número máximo de personas que pueden inscribirse al evento. Dejar vacío para cupo
                  ilimitado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sponsors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Sponsors (opcional)</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', website: '' })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar sponsor
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`sponsors.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Nombre del sponsor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`sponsors.${index}.website`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://ejemplo.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay sponsors agregados. Haz clic en &quot;Agregar sponsor&quot; para agregar uno.
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <Button type="submit" variant="pcn" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
            <Link href={cancelHref} className="flex-1">
              <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
