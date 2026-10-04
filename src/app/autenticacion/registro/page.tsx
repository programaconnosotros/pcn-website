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
import { UserPlus } from 'lucide-react';
import { FileUploadPublic } from '@/components/ui/file-upload-public';
import { AuthLinks, AuthSection, AuthShell } from '@/components/auth/auth-shell';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { safeRedirectPath } from '@/lib/safe-redirect';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

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

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get('redirect'), '');
  const autoRegister = searchParams.get('autoRegister') === 'true';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      country: '',
      province: undefined,
      profession: '',
      enterprise: '',
      studyField: '',
      studyPlace: '',
      image: '',
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

      if (result.success) {
        toast.success('Usuario creado exitosamente! 🥳');
        // Redirigir a la página de verificación
        // No llamamos setIsSubmitting(false) aquí para mantener el botón deshabilitado durante la redirección
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        }
        return;
      }

      // Rehabilitar el botón solo en caso de error
      setIsSubmitting(false);

      // Manejar errores específicos
      if (result.error === 'EMAIL_ALREADY_EXISTS') {
        toast.error('Ya hay un usuario con ese correo electrónico.');
      } else {
        toast.error('Error al crear el usuario. Por favor, intentá nuevamente.');
      }
    } catch (error) {
      setIsSubmitting(false);
      toast.error(
        actionErrorMessage(error, 'Ocurrió un error inesperado. Por favor, intentá nuevamente.'),
      );
    }
  };

  return (
    <AuthShell
      command="signup"
      title="Crear cuenta"
      description="Sumate a la comunidad. Solo los datos principales son obligatorios."
      wide
    >
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
          <AuthSection title="Datos principales">
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

            <div className="grid gap-4 sm:grid-cols-2">
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
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+54 9 11 1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="********"
                        {...field}
                      />
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
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
          </AuthSection>

          {/* Sección: Información profesional */}
          <AuthSection title="Información profesional" optional>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿De qué trabajás?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Desarrollador Full Stack" {...field} />
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
                    <FormLabel>¿En qué empresa?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AuthSection>

          {/* Sección: Información académica */}
          <AuthSection title="Información académica" optional>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="studyField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Qué estudiás o estudiaste?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ingeniería en Sistemas" {...field} />
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
                    <FormLabel>¿Dónde estudiás?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Universidad, autodidacta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AuthSection>

          {/* Sección: Foto de perfil */}
          <AuthSection title="Foto de perfil" optional>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subí una foto para tu perfil</FormLabel>
                  <FormControl>
                    <FileUploadPublic
                      value={field.value || ''}
                      onChange={field.onChange}
                      maxSize={10 * 1024 * 1024}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </AuthSection>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isSubmitting}
            loadingText="creando cuenta..."
          >
            crearCuenta();
            <UserPlus className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>

      <AuthLinks
        links={[
          {
            href: redirectTo
              ? `/autenticacion/iniciar-sesion?redirect=${encodeURIComponent(redirectTo)}${autoRegister ? '&autoRegister=true' : ''}`
              : '/autenticacion/iniciar-sesion',
            label: '¿Ya tenés cuenta? Iniciá sesión',
          },
          { href: '/autenticacion/recuperar-clave', label: 'Olvidé mi contraseña' },
        ]}
      />
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpContent />
    </Suspense>
  );
}
