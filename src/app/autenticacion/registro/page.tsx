'use client';
import { signUp } from '@/actions/auth/sign-up';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { signUpSchema, ARGENTINA_PROVINCES } from '@/lib/validations/auth-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  LogIn,
  Loader2,
  SquareAsterisk,
  UserPlus,
  User,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = signUpSchema;

// Lista de países (puedes expandirla)
const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro',
];

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';
  const autoRegister = searchParams.get('autoRegister') === 'true';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: undefined,
      confirmPassword: '',
      country: '',
      province: undefined,
      profession: '',
      enterprise: '',
      studyField: '',
      studyPlace: '',
    },
  });

  const watchCountry = form.watch('country');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Construir redirectTo con autoRegister si es necesario
      let finalRedirect = redirectTo;
      if (autoRegister && redirectTo) {
        const separator = redirectTo.includes('?') ? '&' : '?';
        finalRedirect = `${redirectTo}${separator}autoRegister=true`;
      }

      const result = await signUp({ ...values, redirectTo: finalRedirect });

      toast.success('Usuario creado exitosamente! 🥳');

      // Redirigir a la página de verificación
      // No deshabilitamos isSubmitting aquí para mantener el botón deshabilitado durante la redirección
      if (result?.redirectUrl) {
        router.push(result.redirectUrl);
      }
    } catch (error) {
      console.error('Error al crear el usuario', error);

      if (error instanceof Error) {
        if (error.message.includes('Unique constraint failed on the fields: (`email`)')) {
          toast.error('Ya hay un usuario con ese correo electrónico.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Error al crear el usuario');
      }

      // Solo rehabilitar el botón si hubo un error
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-[500px]">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.webp" alt="Logo" className="w-10" />

          <div className="space-y-2 text-center">
            <h1 className="mb-8 text-2xl font-semibold tracking-tight">Crear cuenta</h1>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              // Mostrar toast cuando hay errores de validación
              const firstError = Object.values(errors)[0];
              if (firstError?.message) {
                toast.error(firstError.message);
              } else {
                toast.error('Por favor, completa todos los campos requeridos correctamente');
              }
            })}
            className="space-y-6"
          >
            {/* Sección: Información de cuenta */}
            <div className="space-y-4 rounded-md border p-4 transition-all duration-300 hover:border-pcnPurple hover:shadow-[0_0_15px_rgba(80,56,189,0.3)] dark:hover:border-white/20 dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Datos principales
              </h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Lionel Messi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Limpiar provincia si cambia el país y no es Argentina
                        if (value !== 'Argentina') {
                          form.setValue('province', undefined);
                          form.clearErrors('province');
                        } else {
                          // Si cambia a Argentina, forzar validación de provincia
                          form.trigger('province');
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchCountry === 'Argentina' && (
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.clearErrors('province');
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu provincia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ARGENTINA_PROVINCES.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Sección: Información profesional */}
            <div className="space-y-4 rounded-md border p-4 transition-all duration-300 hover:border-pcnPurple hover:shadow-[0_0_15px_rgba(80,56,189,0.3)] dark:hover:border-white/20 dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Briefcase className="h-5 w-5" />
                Información profesional (opcional)
              </h3>

              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿De qué trabajás?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Desarrollador Full Stack, Diseñador UX, etc."
                        {...field}
                      />
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
                    <FormLabel>¿En qué empresa trabajás?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Google, Microsoft, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sección: Información académica */}
            <div className="space-y-4 rounded-md border p-4 transition-all duration-300 hover:border-pcnPurple hover:shadow-[0_0_15px_rgba(80,56,189,0.3)] dark:hover:border-white/30 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <GraduationCap className="h-5 w-5" />
                Información académica (opcional)
              </h3>

              <FormField
                control={form.control}
                name="studyField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Qué estudiás o estudiaste?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Ingeniería en Sistemas, Desarrollo Web, etc."
                        {...field}
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
                    <FormLabel>¿Dónde o cómo estudiás/estudiaste?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Universidad Nacional, Autodidacta, Bootcamp, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando usuario...
                </>
              ) : (
                <>
                  Crear usuario
                  <UserPlus className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 flex flex-row gap-4">
          <Link
            href={
              redirectTo
                ? `/autenticacion/iniciar-sesion?redirect=${encodeURIComponent(redirectTo)}${autoRegister ? '&autoRegister=true' : ''}`
                : '/autenticacion/iniciar-sesion'
            }
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              Iniciar sesión
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/autenticacion/recuperar-clave" className="w-full">
            <Button variant="outline" className="w-full">
              Recuperar contraseña
              <SquareAsterisk className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Link
          href="/"
          className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
