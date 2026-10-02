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
import { Mail } from 'lucide-react';
import { AuthShell, AuthStatus, codeInputClassName } from '@/components/auth/auth-shell';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { safeRedirectPath } from '@/lib/safe-redirect';
import { actionErrorMessage, parseRateLimitError } from '@/lib/rate-limit-messages';

const codeSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código solo puede contener números'),
});

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const redirectTo = safeRedirectPath(searchParams.get('redirect'));

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
      setResendCooldown(result.waitSeconds || 60);
    } catch (error) {
      // Sin aviso en el envío automático; si es el rate limit, el botón de reenviar muestra la espera
      const rateLimit = parseRateLimitError(error);
      if (rateLimit) setResendCooldown(rateLimit.waitSeconds);
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

    setIsVerifying(true);
    try {
      await verifyEmailCode(email, values.code);
      setIsVerified(true);
      toast.success('¡Email verificado! Redirigiendo...');
      setTimeout(() => {
        router.push(redirectTo);
      }, 1500);
    } catch (error) {
      toast.error(actionErrorMessage(error, 'Código inválido o expirado. Intentá de nuevo.'));
      setIsVerifying(false);
    }
  };

  const resendCode = async () => {
    if (resendCooldown > 0 || !email) return;

    setIsResending(true);
    try {
      const result = await sendVerificationCode(email);
      setResendCooldown(result.waitSeconds || 60);
      toast.success('Nuevo código enviado. Revisá tu correo electrónico.');
    } catch (error) {
      const rateLimit = parseRateLimitError(error);
      if (rateLimit) setResendCooldown(rateLimit.waitSeconds);
      toast.error(actionErrorMessage(error, 'Error al reenviar el código.'));
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <AuthShell
        command="verify"
        title="Verificación de email"
        description="No se especificó un email para verificar."
      >
        <Button asChild size="lg" className="w-full">
          <Link href="/autenticacion/iniciar-sesion">irAIniciarSesion();</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      command="verify"
      title={isVerified ? '¡Email verificado!' : 'Verificá tu email'}
      description={
        !isVerified && (
          <>
            Enviamos un código de 6 dígitos a{' '}
            <span className="break-all font-mono text-foreground">{email}</span>
          </>
        )
      }
    >
      {isVerified ? (
        <AuthStatus>Tu email fue verificado. Ya podés acceder a la plataforma.</AuthStatus>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de verificación</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      maxLength={6}
                      className={codeInputClassName}
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
              loading={isVerifying}
              loadingText="verificando..."
              disabled={isVerifying || isResending}
            >
              verificarEmail();
              <Mail className="ml-2 h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={resendCode}
              disabled={isResending || resendCooldown > 0}
              className="font-mono text-xs text-muted-foreground hover:text-pcnGreen disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending
                ? 'Enviando...'
                : resendCooldown > 0
                  ? `Reenviar en ${resendCooldown}s`
                  : 'Reenviar código'}
            </button>
          </form>
        </Form>
      )}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
