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
import { signUpSchema } from '@/lib/validations/auth-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LogIn, SquareAsterisk, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = signUpSchema;

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';
  const autoRegister = searchParams.get('autoRegister') === 'true';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: undefined,
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Construir redirectTo con autoRegister si es necesario
    let finalRedirect = redirectTo;
    if (autoRegister && redirectTo) {
      const separator = redirectTo.includes('?') ? '&' : '?';
      finalRedirect = `${redirectTo}${separator}autoRegister=true`;
    }
    
    await toast.promise(signUp({ ...values, redirectTo: finalRedirect }), {
      loading: 'Creando usuario...',
      success: 'Usuario creado exitosamente! 🥳',
      error: (error) => {
        console.error('Error al crear el usuario', error);

        if (error.message.includes('Unique constraint failed on the fields: (`email`)')) {
          return 'Ya hay un usuario con ese correo electrónico.';
        }

        return error.message;
      },
    });
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-[425px]">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.webp" alt="Logo" className="w-10" />

          <div className="space-y-2 text-center">
            <h1 className="mb-8 text-2xl font-semibold tracking-tight">Crear cuenta</h1>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Lionel Messi"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!/^[a-zA-ZÀ-ÿ\s]*$/.test(value)) {
                          form.setError('name', {
                            type: 'manual',
                            message:
                              'El nombre solo puede contener letras (a-z, A-Z) y espacios. No se permiten números ni caracteres especiales',
                          });
                        } else {
                          form.clearErrors('name');
                        }
                        field.onChange(e);
                      }}
                    />
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

            <Button type="submit" className="w-full">
              Crear usuario
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>

        <div className="mt-4 flex flex-row gap-4">
          <Link href={redirectTo ? `/autenticacion/iniciar-sesion?redirect=${encodeURIComponent(redirectTo)}${autoRegister ? '&autoRegister=true' : ''}` : '/autenticacion/iniciar-sesion'} className="w-full">
            <Button variant="outline" className="w-full">
              Iniciar sesión
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/autenticacion/recuperar-clave" className="w-full">
            <Button variant="outline" className="w-full">
              Me olvidé la contraseña
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
