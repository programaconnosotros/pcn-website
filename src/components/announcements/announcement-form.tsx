'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { announcementSchema, AnnouncementFormData } from '@/schemas/announcement-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Announcement } from '@prisma/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventOption {
  id: string;
  name: string;
  date: Date;
}

interface AnnouncementFormProps {
  defaultValues?: Partial<Announcement>;
  events?: EventOption[];
  onSubmit: (data: AnnouncementFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'evento', label: 'Evento' },
  { value: 'noticia', label: 'Noticia' },
  { value: 'importante', label: 'Importante' },
  { value: 'actualizacion', label: 'Actualización' },
];

export function AnnouncementForm({
  defaultValues,
  events = [],
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Guardar',
}: AnnouncementFormProps) {
  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      content: defaultValues?.content || '',
      category: defaultValues?.category || '',
      pinned: defaultValues?.pinned ?? false,
      published: defaultValues?.published ?? true,
      eventId: defaultValues?.eventId || null,
    },
  });

  const watchCategory = form.watch('category');

  const handleSubmit = async (data: AnnouncementFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Nuevo evento de la comunidad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escribe el contenido del anuncio..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'true')}
                  defaultValue={field.value ? 'true' : 'false'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Publicado</SelectItem>
                    <SelectItem value="false">Borrador</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {watchCategory === 'evento' && events.length > 0 && (
          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evento relacionado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un evento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name} - {format(new Date(event.date), 'dd MMM yyyy', { locale: es })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Este anuncio aparecerá en la página del evento seleccionado
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="pinned"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destacar anuncio</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'true')}
                defaultValue={field.value ? 'true' : 'false'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="¿Destacar?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Sí, destacar</SelectItem>
                  <SelectItem value="false">No destacar</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Los anuncios destacados aparecen primero en la lista
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
