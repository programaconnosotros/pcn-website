'use client';
import { signIn } from '@/actions/auth/sign-in';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LogIn, SquareAsterisk, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const emailParam = searchParams.get('email') || '';
  const passwordParam = searchParams.get('password') || '';
  const redirectTo = searchParams.get('redirect') || '';
  const autoRegister = searchParams.get('autoRegister') === 'true';
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailParam,
      password: passwordParam,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    console.log('[SignInPage] onSubmit iniciado');

    // Construir redirectTo con autoRegister si es necesario
    let finalRedirect = redirectTo;
    if (autoRegister && redirectTo) {
      const separator = redirectTo.includes('?') ? '&' : '?';
      finalRedirect = `${redirectTo}${separator}autoRegister=true`;
    }

    try {
      const result = await signIn({ ...values, redirectTo: finalRedirect });

      if (result.success) {
        toast.success('Hola! 👋');
        router.push(result.redirectTo);
        return;
      }

      // Manejar errores específicos
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        const email = result.email || values.email;
        toast.info(
          'Detectamos que tu email no está verificado. Por favor, verificá tu cuenta para continuar.',
        );

        // Redirigir a la página de verificación
        const verifyUrl = `/autenticacion/verificar-email?email=${encodeURIComponent(email)}${finalRedirect ? `&redirect=${encodeURIComponent(finalRedirect)}` : ''}`;
        router.push(verifyUrl);
        return;
      }

      // Error de credenciales
      if (result.error === 'INVALID_CREDENTIALS') {
        toast.error('Credenciales incorrectas.');
        setIsLoading(false);
        return;
      }

      // Error desconocido
      toast.error('No pudimos iniciar la sesión.');
      setIsLoading(false);
    } catch (error) {
      toast.error('Ocurrió un error inesperado. Por favor, intentá nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-[425px]">
        <div className="flex flex-col items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedTheme === 'dark' ? '/logo.webp' : '/pcn-purple.png'}
            alt="Logo"
            className="w-20"
          />

          <div className="space-y-2 text-center">
            <h1 className="mb-8 text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar
                  <LogIn className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 flex flex-row gap-4">
          <Link
            href={
              redirectTo
                ? `/autenticacion/registro?redirect=${encodeURIComponent(redirectTo)}${autoRegister ? '&autoRegister=true' : ''}`
                : '/autenticacion/registro'
            }
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              Crear cuenta
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/autenticacion/recuperar-clave" className="w-full">
            <Button variant="outline" className="w-full">
              Cambiar contraseña
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

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
