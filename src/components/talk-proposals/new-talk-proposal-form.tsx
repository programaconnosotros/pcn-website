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
import { talkProposalSchema, TalkProposalFormData } from '@/schemas/talk-proposal-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createTalkProposal } from '@/actions/talk-proposals/create-talk-proposal';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';

type Props = {
  eventId: string;
  defaults: {
    speakerName: string;
    speakerPhone: string;
    isProfessional: boolean;
    jobTitle: string;
    enterprise: string;
    isStudent: boolean;
    career: string;
    studyPlace: string;
  };
};

export function NewTalkProposalForm({ eventId, defaults }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TalkProposalFormData>({
    resolver: zodResolver(talkProposalSchema),
    defaultValues: {
      title: '',
      description: '',
      speakerName: defaults.speakerName,
      speakerPhone: defaults.speakerPhone,
      isProfessional: defaults.isProfessional,
      jobTitle: defaults.jobTitle,
      enterprise: defaults.enterprise,
      isStudent: defaults.isStudent,
      career: defaults.career,
      studyPlace: defaults.studyPlace,
    },
  });

  const isProfessional = !!form.watch('isProfessional');
  const isStudent = !!form.watch('isStudent');

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
          {/* Título de la charla */}
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

          {/* Descripción de la charla */}
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

          {/* Nombre completo del speaker */}
          <FormField
            control={form.control}
            name="speakerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo del speaker</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: María García" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Teléfono del speaker */}
          <FormField
            control={form.control}
            name="speakerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de teléfono (WhatsApp)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 5493815123456" {...field} />
                </FormControl>
                <FormDescription>
                  Solo dígitos, sin espacios ni guiones. Incluí el código de país. Ej:
                  5493815123456
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Es profesional */}
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
                    Soy profesional
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {isProfessional && (
            <>
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
            </>
          )}

          {/* Es estudiante */}
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
                    Soy estudiante
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {isStudent && (
            <>
              <FormField
                control={form.control}
                name="career"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrera</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ingeniería en Sistemas" {...field} value={field.value ?? ''} />
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
                      <Input placeholder="Ej: Universidad Nacional de Tucumán" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="flex gap-4">
            <Button type="submit" variant="pcn" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enviar propuesta
                </>
              )}
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
