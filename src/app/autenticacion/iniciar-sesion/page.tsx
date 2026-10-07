'use client';
import { notifyOsSessionChange } from '@/components/os/os-env';
import { signIn } from '@/actions/auth/sign-in';
import { verifyTwoFactorSignIn } from '@/actions/auth/two-factor';
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
import { LogIn } from 'lucide-react';
import { AuthLinks, AuthShell } from '@/components/auth/auth-shell';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { safeRedirectPath } from '@/lib/safe-redirect';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

const formSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const redirectTo = safeRedirectPath(searchParams.get('redirect'), '');
  const autoRegister = searchParams.get('autoRegister') === 'true';
  const [isLoading, setIsLoading] = useState(false);
  // The password was right and the account has two-factor on: ask for the code.
  const [needsCode, setNeedsCode] = useState(false);
  const [code, setCode] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailParam,
      password: '',
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
        notifyOsSessionChange();
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

      if (result.error === 'TWO_FACTOR_REQUIRED') {
        setNeedsCode(true);
        setIsLoading(false);
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
      toast.error(
        actionErrorMessage(error, 'Ocurrió un error inesperado. Por favor, intentá nuevamente.'),
      );
      setIsLoading(false);
    }
  };

  const onSubmitCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await verifyTwoFactorSignIn(code);
      if (result.success) {
        if (result.usedRecoveryCode) {
          toast.warning(
            `Usaste un código de recuperación: te quedan ${result.recoveryCodesLeft}. Podés generar nuevos en tu perfil.`,
          );
        } else {
          toast.success('Hola! 👋');
        }
        notifyOsSessionChange();
        router.push(result.redirectTo);
        return;
      }
      if (result.error === 'EXPIRED') {
        toast.error('Se venció el intento. Ingresá tu contraseña de nuevo.');
        setNeedsCode(false);
        form.setValue('password', '');
      } else {
        toast.error('El código no es válido.');
      }
      setCode('');
      setIsLoading(false);
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No pudimos verificar el código.'));
      setIsLoading(false);
    }
  };

  if (needsCode) {
    return (
      <AuthShell
        command="login --2fa"
        title="Verificación en dos pasos"
        description="Ingresá el código de 6 dígitos de tu app de autenticación, o uno de tus códigos de recuperación."
      >
        <form onSubmit={onSubmitCode} className="space-y-4">
          <Input
            aria-label="Código de verificación"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="one-time-code"
            autoFocus
            placeholder="123456"
            maxLength={20}
            className="font-mono tracking-widest"
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!code.trim()}
            loading={isLoading}
            loadingText="verificando..."
          >
            verificar();
            <LogIn className="ml-2 h-4 w-4" />
          </Button>
          <button
            type="button"
            onClick={() => {
              setNeedsCode(false);
              setCode('');
            }}
            className="w-full font-mono text-xs text-muted-foreground hover:text-pcnGreen"
          >
            ← volver
          </button>
        </form>
      </AuthShell>
    );
  }

  const signUpHref = redirectTo
    ? `/autenticacion/registro?redirect=${encodeURIComponent(redirectTo)}${autoRegister ? '&autoRegister=true' : ''}`
    : '/autenticacion/registro';

  return (
    <AuthShell command="login" title="Iniciar sesión" description="Qué bueno verte de nuevo.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>

                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    {...field}
                  />
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
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isLoading}
            loadingText="ingresando..."
          >
            ingresar();
            <LogIn className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>

      <AuthLinks
        links={[
          { href: signUpHref, label: '¿No tenés cuenta? Creá una' },
          { href: '/autenticacion/recuperar-clave', label: 'Olvidé mi contraseña' },
        ]}
      />
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
