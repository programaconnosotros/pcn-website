'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { talkSchema, TalkFormData } from '@/schemas/talk-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';
import { createTalk } from '@/actions/talks/create-talk';
import { updateTalk } from '@/actions/talks/update-talk';
import { Loader2, Save } from 'lucide-react';
import { Talk } from '@prisma/client';

type Props = {
  eventId?: string;
  talk?: Talk;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function TalkForm({ eventId, talk, onSuccess, onCancel }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TalkFormData>({
    resolver: zodResolver(talkSchema),
    defaultValues: {
      eventId: talk?.eventId ?? eventId ?? null,
      title: talk?.title ?? '',
      description: talk?.description ?? '',
      speakerName: talk?.speakerName ?? '',
      speakerPhone: talk?.speakerPhone ?? '',
      isProfessional: talk?.isProfessional ?? false,
      jobTitle: talk?.jobTitle ?? '',
      enterprise: talk?.enterprise ?? '',
      isStudent: talk?.isStudent ?? false,
      career: talk?.career ?? '',
      studyPlace: talk?.studyPlace ?? '',
      order: talk?.order ?? 0,
      slidesUrl: talk?.slidesUrl ?? '',
      videoUrl: talk?.videoUrl ?? '',
    },
  });

  const isProfessional = !!form.watch('isProfessional');
  const isStudent = !!form.watch('isStudent');

  const handleSubmit = async (values: TalkFormData) => {
    setIsSubmitting(true);
    try {
      if (talk) {
        await updateTalk(talk.id, values);
        toast.success('Charla actualizada');
      } else {
        await createTalk(values);
        toast.success('Charla creada');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la charla');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la charla</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Introducción a la inteligencia artificial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="De qué trata la charla, qué aprenderán los asistentes..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="speakerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del speaker</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: María García" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="speakerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono (WhatsApp)</FormLabel>
                <FormControl>
                  <Input placeholder="5493815123456" {...field} />
                </FormControl>
                <FormDescription>Solo dígitos, con código de país.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isProfessional"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <input
                    type="checkbox"
                    id="isProfessional"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-input accent-pcnPurple dark:accent-pcnGreen"
                  />
                </FormControl>
                <FormLabel htmlFor="isProfessional" className="cursor-pointer">
                  Es profesional
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {isProfessional && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol / Puesto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Software Engineer" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enterprise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Mercado Libre" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="isStudent"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <input
                    type="checkbox"
                    id="isStudent"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-input accent-pcnPurple dark:accent-pcnGreen"
                  />
                </FormControl>
                <FormLabel htmlFor="isStudent" className="cursor-pointer">
                  Es estudiante
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {isStudent && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="career"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrera</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Ingeniería en Sistemas"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studyPlace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Universidad / Institución</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Universidad Nacional de Tucumán"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slidesUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de slides</FormLabel>
                <FormControl>
                  <Input placeholder="https://slides.example.com" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del video</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com/watch?v=..." {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                {talk ? 'Actualizar charla' : 'Crear charla'}
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
