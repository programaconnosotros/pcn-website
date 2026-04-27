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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';
import { SpeakerUserPicker } from '@/components/talks/speaker-user-picker';
import { talkSchema, TalkFormData } from '@/schemas/talk-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createTalk } from '@/actions/talks/create-talk';
import { updateTalk } from '@/actions/talks/update-talk';
import { fetchEventsForSelect } from '@/actions/talks/fetch-events-for-select';
import { fetchTalks } from '@/actions/talks/fetch-talks';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';

type EventOption = {
  id: string;
  name: string;
  date: Date;
  placeName: string | null;
  city: string | null;
};

type TalkWithSpeakers = Awaited<ReturnType<typeof fetchTalks>>[number];

const EMPTY_SPEAKER: TalkFormData['speakers'][number] = {
  userId: null,
  speakerName: '',
  speakerPhone: '',
  isProfessional: false,
  isStudent: false,
  jobTitle: '',
  enterprise: '',
  career: '',
  studyPlace: '',
};

type Props = {
  eventId?: string;
  talk?: TalkWithSpeakers;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function SpeakerFields({
  index,
  onRemove,
  canRemove,
}: {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { control, setValue } = useFormContext<TalkFormData>();
  const isProfessional = !!useWatch({ control, name: `speakers.${index}.isProfessional` });
  const isStudent = !!useWatch({ control, name: `speakers.${index}.isStudent` });

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Orador {index + 1}</h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <FormField
        control={control}
        name={`speakers.${index}.userId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Usuario registrado (opcional)</FormLabel>
            <FormControl>
              <SpeakerUserPicker
                value={field.value ?? null}
                onSelect={(user) => {
                  field.onChange(user?.id ?? null);
                  if (user) {
                    setValue(`speakers.${index}.speakerName`, user.name, {
                      shouldValidate: true,
                    });
                    if (user.phoneNumber)
                      setValue(`speakers.${index}.speakerPhone`, user.phoneNumber, {
                        shouldValidate: true,
                      });
                    if (user.jobTitle || user.enterprise) {
                      setValue(`speakers.${index}.isProfessional`, true);
                      if (user.jobTitle) setValue(`speakers.${index}.jobTitle`, user.jobTitle);
                      if (user.enterprise)
                        setValue(`speakers.${index}.enterprise`, user.enterprise);
                    }
                    if (user.career || user.studyPlace) {
                      setValue(`speakers.${index}.isStudent`, true);
                      if (user.career) setValue(`speakers.${index}.career`, user.career);
                      if (user.studyPlace)
                        setValue(`speakers.${index}.studyPlace`, user.studyPlace);
                    }
                  }
                }}
              />
            </FormControl>
            <FormDescription>
              Buscá un usuario para autocompletar los datos del orador.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`speakers.${index}.speakerName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del orador</FormLabel>
              <FormControl>
                <Input placeholder="Ej: María García" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`speakers.${index}.speakerPhone`}
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
        control={control}
        name={`speakers.${index}.isProfessional`}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-3">
              <FormControl>
                <input
                  type="checkbox"
                  id={`isProfessional-${index}`}
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-input accent-pcnPurple dark:accent-pcnGreen"
                />
              </FormControl>
              <FormLabel htmlFor={`isProfessional-${index}`} className="cursor-pointer">
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
            control={control}
            name={`speakers.${index}.jobTitle`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol / Puesto</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Software Engineer"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`speakers.${index}.enterprise`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Mercado Libre"
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

      <FormField
        control={control}
        name={`speakers.${index}.isStudent`}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-3">
              <FormControl>
                <input
                  type="checkbox"
                  id={`isStudent-${index}`}
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-input accent-pcnPurple dark:accent-pcnGreen"
                />
              </FormControl>
              <FormLabel htmlFor={`isStudent-${index}`} className="cursor-pointer">
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
            control={control}
            name={`speakers.${index}.career`}
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
            control={control}
            name={`speakers.${index}.studyPlace`}
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
    </div>
  );
}

export function TalkForm({ eventId, talk, onSuccess, onCancel }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<EventOption[]>([]);

  useEffect(() => {
    if (eventId === undefined) {
      fetchEventsForSelect().then(setEvents);
    }
  }, []);

  const form = useForm<TalkFormData>({
    resolver: zodResolver(talkSchema),
    defaultValues: {
      eventId: talk?.eventId ?? eventId ?? null,
      title: talk?.title ?? '',
      description: talk?.description ?? '',
      speakers:
        talk?.speakers && talk.speakers.length > 0
          ? talk.speakers.map((s) => ({
              userId: s.userId ?? null,
              speakerName: s.speakerName,
              speakerPhone: s.speakerPhone,
              isProfessional: s.isProfessional,
              jobTitle: s.jobTitle ?? '',
              enterprise: s.enterprise ?? '',
              isStudent: s.isStudent,
              career: s.career ?? '',
              studyPlace: s.studyPlace ?? '',
            }))
          : [{ ...EMPTY_SPEAKER }],
      order: talk?.order ?? 0,
      portraitUrl: talk?.portraitUrl ?? '',
      slidesUrl: talk?.slidesUrl ?? '',
      slideImages: talk?.slideImages ?? [],
      videoUrl: talk?.videoUrl ?? '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'speakers',
  });

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
        {eventId === undefined && (
          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evento (opcional)</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(val === '__none__' ? null : val)}
                  value={field.value ?? '__none__'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin evento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">Sin evento</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name} &mdash;{' '}
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}{' '}
                        &mdash; {event.placeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Oradores</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ ...EMPTY_SPEAKER })}
            >
              <Plus className="mr-1 h-4 w-4" />
              Agregar orador
            </Button>
          </div>
          {fields.map((field, idx) => (
            <SpeakerFields
              key={field.id}
              index={idx}
              onRemove={() => remove(idx)}
              canRemove={fields.length > 1}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="portraitUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto de la charla</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  folder="talks/portraits"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del video</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="slidesUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de slides</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://slides.example.com"
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
          name="slideImages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imágenes de slides</FormLabel>
              <FormControl>
                <MultiFileUpload
                  value={field.value ?? []}
                  onChange={field.onChange}
                  folder="talks/slides"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
