'use client';

import { sendVerificationCode } from '@/actions/auth/send-verification-code';
import { verifyEmailCode } from '@/actions/auth/verify-email-code';
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
import { ArrowLeft, Loader2, ShieldCheck, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const codeSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código solo puede contener números'),
});

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const redirectTo = searchParams.get('redirect') || '/';

  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Timer para el cooldown de reenvío
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Enviar código al cargar si hay email
  useEffect(() => {
    if (email && resendCooldown === 0) {
      sendInitialCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendInitialCode = async () => {
    if (!email) return;

    try {
      const result = await sendVerificationCode(email);
      if (result.alreadyVerified) {
        toast.success('Tu email ya está verificado. Redirigiendo...');
        router.push(redirectTo);
        return;
      }
      setResendCooldown(result.waitSeconds || 60);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.startsWith('RATE_LIMIT:')) {
        const waitSeconds = parseInt(errorMessage.split(':')[1], 10);
        setResendCooldown(waitSeconds);
      }
      // No mostrar error en el envío inicial
    }
  };

  const form = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (values: z.infer<typeof codeSchema>) => {
    if (!email) {
      toast.error('Email no especificado');
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmailCode(email, values.code);
      setIsVerified(true);
      toast.success('¡Email verificado! Redirigiendo...');
      setTimeout(() => {
        router.push(redirectTo);
      }, 1500);
    } catch {
      toast.error('Código inválido o expirado. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendCooldown > 0 || !email) return;

    setIsLoading(true);
    try {
      const result = await sendVerificationCode(email);
      if (result.alreadyVerified) {
        toast.success('Tu email ya está verificado. Redirigiendo...');
        router.push(redirectTo);
        return;
      }
      setResendCooldown(result.waitSeconds || 60);
      toast.success('Nuevo código enviado. Revisá tu correo electrónico.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.startsWith('RATE_LIMIT:')) {
        const waitSeconds = parseInt(errorMessage.split(':')[1], 10);
        setResendCooldown(waitSeconds);
        toast.error(`Tenés que esperar ${waitSeconds} segundos antes de reenviar.`);
      } else {
        toast.error('Error al reenviar el código.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-[425px] text-center">
          <div className="flex flex-col items-center gap-6">
            <img src="/logo.webp" alt="Logo" className="w-10" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Verificación de email
            </h1>
            <p className="text-muted-foreground">
              No se especificó un email para verificar.
            </p>
            <Link href="/autenticacion/iniciar-sesion">
              <Button>Ir a iniciar sesión</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-[425px]">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.webp" alt="Logo" className="w-10" />

          <div className="space-y-2 text-center">
            <h1 className="mb-4 text-2xl font-semibold tracking-tight">
              {isVerified ? '¡Email verificado!' : 'Verificá tu email'}
            </h1>
          </div>
        </div>

        {isVerified ? (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-muted-foreground">
              Tu email fue verificado con éxito. Ya podés acceder a la plataforma.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Enviamos un código de 6 dígitos a <strong>{email}</strong>
              </p>

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de verificación</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Verificar email
                    <Mail className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={isLoading || resendCooldown > 0}
                  className="text-sm text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
                </button>
              </div>
            </form>
          </Form>
        )}

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

