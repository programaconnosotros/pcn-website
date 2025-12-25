'use client';

import { registerEvent } from '@/actions/events/register-event';
import { checkEventCapacity } from '@/actions/events/check-event-capacity';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { eventRegistrationSchema, EventRegistrationFormData } from '@/schemas/event-registration-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, User, Mail, Briefcase, GraduationCap, Users } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useEffect } from 'react';

type EventRegistrationFormProps = {
  eventId: string;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    enterprise: string;
    university: string;
    career: string;
  } | null;
  capacityInfo: {
    available: boolean;
    current: number;
    capacity: number | null;
    message?: string;
  };
};

export function EventRegistrationForm({
  eventId,
  userData,
  capacityInfo,
}: EventRegistrationFormProps) {
  const form = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      email: userData?.email || '',
      type: undefined,
      workTitle: userData?.jobTitle || '',
      workPlace: userData?.enterprise || '',
      studyField: userData?.career || '',
      studyPlace: userData?.university || '',
    },
  });

  const registrationType = form.watch('type');

  // Determinar tipo automáticamente si el usuario tiene datos
  useEffect(() => {
    if (userData && !form.getValues('type')) {
      if (userData.jobTitle && userData.enterprise) {
        form.setValue('type', 'PROFESSIONAL');
      } else if (userData.career && userData.university) {
        form.setValue('type', 'STUDENT');
      }
    }
  }, [userData, form]);

  const onSubmit = async (values: EventRegistrationFormData) => {
    // Validar cupo nuevamente antes de submitear
    const capacityCheck = await checkEventCapacity(eventId);
    if (!capacityCheck.available) {
      toast.error(
        capacityCheck.message || 'El cupo del evento está completo. No se pueden aceptar más inscripciones.',
      );
      return;
    }

    await toast.promise(registerEvent(eventId, values), {
      loading: 'Inscribiéndote al evento...',
      success: '¡Te has inscrito exitosamente al evento! 🎉',
      error: (error) => {
        console.error('Error al inscribirse al evento', error);
        return error.message || 'Ocurrió un error al inscribirse al evento';
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Información de cupo */}
      {capacityInfo.capacity !== null && (
        <div className="mb-6 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
            <span className="font-medium">Cupo disponible:</span>
            <span className="text-muted-foreground">
              {capacityInfo.capacity - capacityInfo.current} de {capacityInfo.capacity} cupos
            </span>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <User className="mr-2 inline h-4 w-4" />
                  Nombre
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Juan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Apellido */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <User className="mr-2 inline h-4 w-4" />
                  Apellido
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Correo electrónico */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Mail className="mr-2 inline h-4 w-4" />
                  Correo electrónico
                </FormLabel>
                <FormControl>
                  <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo: Estudiante o Profesional */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Eres estudiante o profesional del software?</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STUDENT">Estudiante</SelectItem>
                    <SelectItem value="PROFESSIONAL">Profesional del software</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campos condicionales para Profesional */}
          {registrationType === 'PROFESSIONAL' && (
            <>
              <FormField
                control={form.control}
                name="workTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Briefcase className="mr-2 inline h-4 w-4" />
                      ¿De qué trabajas?
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Desarrollador Full Stack" {...field} />
                    </FormControl>
                    <FormDescription>Tu puesto o rol actual</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workPlace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Briefcase className="mr-2 inline h-4 w-4" />
                      ¿Dónde trabajas?
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Empresa XYZ" {...field} />
                    </FormControl>
                    <FormDescription>Nombre de la empresa u organización</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Campos condicionales para Estudiante */}
          {registrationType === 'STUDENT' && (
            <>
              <FormField
                control={form.control}
                name="studyField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <GraduationCap className="mr-2 inline h-4 w-4" />
                      ¿Qué estudias?
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ingeniería en Sistemas" {...field} />
                    </FormControl>
                    <FormDescription>Tu carrera o área de estudio</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studyPlace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <GraduationCap className="mr-2 inline h-4 w-4" />
                      ¿Dónde estudias?
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Universidad Nacional" {...field} />
                    </FormControl>
                    <FormDescription>Nombre de la institución educativa</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            <Button type="submit" variant="pcn" className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Inscribirme al evento
            </Button>
            <Link href={`/eventos/${eventId}`} className="flex-1">
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


