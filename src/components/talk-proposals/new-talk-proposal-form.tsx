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
import {
  talkProposalSchema,
  TalkProposalFormData,
  TalkProposalSpeakerFormData,
} from '@/schemas/talk-proposal-schema';
import { SpeakerUserPicker } from '@/components/talks/speaker-user-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createTalkProposal } from '@/actions/talk-proposals/create-talk-proposal';
import { Plus, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

type Props = {
  eventId: string;
  defaults: {
    firstSpeaker: TalkProposalFormData['speakers'][number];
  };
};

const EMPTY_SPEAKER: TalkProposalSpeakerFormData = {
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

function SpeakerFields({
  index,
  onRemove,
  canRemove,
}: {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { control, setValue } = useFormContext<TalkProposalFormData>();
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
                Soy profesional
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
                Soy estudiante
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

export function NewTalkProposalForm({ eventId, defaults }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TalkProposalFormData>({
    resolver: zodResolver(talkProposalSchema),
    defaultValues: {
      title: '',
      description: '',
      speakers: [defaults.firstSpeaker],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'speakers',
  });

  const handleSubmit = async (values: TalkProposalFormData) => {
    setIsSubmitting(true);
    try {
      await createTalkProposal(eventId, values);
      toast.success('¡Propuesta enviada! Nos pondremos en contacto pronto.');
      router.push(`/eventos/${eventId}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar la propuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
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
                <FormLabel>Descripción de la charla</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Contanos de qué va tu charla, qué van a aprender los asistentes, etc."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h2 className="text-base font-semibold">Oradores</h2>
            {fields.map((field, index) => (
              <SpeakerFields
                key={field.id}
                index={index}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ ...EMPTY_SPEAKER })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar orador
            </Button>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="pcn"
              className="flex-1"
              loading={isSubmitting}
              loadingText="Enviando..."
            >
              <Save className="mr-2 h-4 w-4" />
              Enviar propuesta
            </Button>
            <Link href={`/eventos/${eventId}`} className="flex-1">
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
