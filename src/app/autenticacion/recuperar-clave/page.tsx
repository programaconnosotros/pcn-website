'use client';

import { requestPasswordReset } from '@/actions/auth/request-password-reset';
import { verifyResetCode } from '@/actions/auth/verify-reset-code';
import { completePasswordReset } from '@/actions/auth/complete-password-reset';
import { newPasswordSchema } from '@/lib/validations/auth-schemas';
import { rateLimitMessage } from '@/lib/rate-limit-messages';
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
import { LogIn, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import { AuthLinks, AuthShell, AuthStatus, codeInputClassName } from '@/components/auth/auth-shell';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Schemas para cada paso
const emailSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

const codeSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código solo puede contener números'),
});

const passwordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type Step = 'email' | 'code' | 'password' | 'success';

const STEPS: { id: Step; label: string }[] = [
  { id: 'email', label: 'email' },
  { id: 'code', label: 'código' },
  { id: 'password', label: 'clave' },
];

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer para el cooldown de reenvío
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(values.email);
      if (!result.success) {
        toast.error(
          result.error === 'RATE_LIMIT'
            ? rateLimitMessage('sendCode', result.waitSeconds)
            : 'No pudimos enviar el código. Intentá de nuevo en unos minutos.',
        );
        return;
      }
      setEmail(values.email);
      setStep('code');
      setResendCooldown(result.waitSeconds);
      toast.success('Código enviado. Revisá tu correo electrónico.');
    } catch {
      toast.error('Error al enviar el código. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const onCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
    setIsLoading(true);
    try {
      const result = await verifyResetCode(email, values.code);
      if (!result.success) {
        toast.error(
          result.error === 'RATE_LIMIT'
            ? rateLimitMessage('verifyCode', result.waitSeconds)
            : 'Código inválido o vencido. Revisalo o pedí uno nuevo.',
        );
        return;
      }
      setCode(values.code);
      setStep('password');
      toast.success('Código verificado. Ahora podés crear tu nueva contraseña.');
    } catch {
      toast.error('No pudimos verificar el código. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    try {
      const result = await completePasswordReset(email, code, values.password);
      if (result.success) {
        setStep('success');
        toast.success('Contraseña actualizada exitosamente.');
        // Queda en loading: en el estado de éxito ya no hay más acciones
        return;
      }
      if (result.error === 'WEAK_PASSWORD') {
        passwordForm.setError('password', { message: result.message });
      } else if (result.error === 'INVALID_CODE') {
        // El código venció o se invalidó entre pasos: hay que volver a validarlo
        setCode('');
        codeForm.reset({ code: '' });
        setStep('code');
        toast.error('El código venció o ya no es válido. Pedí uno nuevo.');
      } else {
        toast.error(rateLimitMessage('verifyCode', result.waitSeconds));
      }
      setIsLoading(false);
    } catch {
      toast.error('Error al actualizar la contraseña. Intentá de nuevo.');
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setResendCooldown(result.waitSeconds);
        codeForm.reset({ code: '' });
        toast.success('Nuevo código enviado. Revisá tu correo electrónico.');
      } else if (result.error === 'RATE_LIMIT') {
        setResendCooldown(result.waitSeconds);
        toast.error(rateLimitMessage('sendCode', result.waitSeconds));
      } else {
        toast.error('No pudimos reenviar el código. Intentá de nuevo en unos minutos.');
      }
    } catch {
      toast.error('Error al reenviar el código.');
    } finally {
      setIsResending(false);
    }
  };

  const goBack = () => {
    if (step === 'code') {
      setStep('email');
      setEmail('');
    } else if (step === 'password') {
      setStep('code');
      setCode('');
    }
  };

  return (
    <AuthShell
      command="passwd"
      title={
        step === 'email'
          ? 'Restablecer contraseña'
          : step === 'code'
            ? 'Verificar código'
            : step === 'password'
              ? 'Nueva contraseña'
              : '¡Contraseña actualizada!'
      }
      description={
        step !== 'success' && (
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]">
            {STEPS.map((item, index) => (
              <li key={item.id} className="flex items-center gap-2">
                {index > 0 && <span className="text-pcnGreen-200">──</span>}
                <span
                  className={
                    item.id === step
                      ? 'text-pcnGreen'
                      : STEPS.findIndex((other) => other.id === step) > index
                        ? 'text-pcnGreen-600'
                        : 'text-muted-foreground/60'
                  }
                >
                  [{index + 1}] {item.label}
                </span>
              </li>
            ))}
          </ol>
        )
      }
    >
      {/* Paso 1: Email */}
      {step === 'email' && (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
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

            <Button type="submit" className="w-full" loading={isLoading} loadingText="enviando...">
              enviarCodigo();
              <Mail className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      )}

      {/* Paso 2: Código */}
      {step === 'code' && (
        <Form {...codeForm}>
          <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enviamos un código de 6 dígitos a{' '}
              <span className="break-all font-mono text-foreground">{email}</span>
            </p>

            <FormField
              control={codeForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de verificación</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
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
              className="w-full"
              loading={isLoading}
              loadingText="verificando..."
            >
              verificarCodigo();
              <ShieldCheck className="ml-2 h-4 w-4" />
            </Button>

            <div className="flex flex-wrap justify-between gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={goBack}
                className="text-muted-foreground hover:text-pcnGreen"
              >
                ← Cambiar email
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={isResending || resendCooldown > 0}
                className="text-muted-foreground hover:text-pcnGreen disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResending
                  ? 'Enviando...'
                  : resendCooldown > 0
                    ? `Reenviar en ${resendCooldown}s`
                    : 'Reenviar código'}
              </button>
            </div>
          </form>
        </Form>
      )}

      {/* Paso 3: Nueva contraseña */}
      {step === 'password' && (
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              loadingText="actualizando..."
            >
              actualizarClave();
              <KeyRound className="ml-2 h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={goBack}
              className="font-mono text-xs text-muted-foreground hover:text-pcnGreen"
            >
              ← Volver al código
            </button>
          </form>
        </Form>
      )}

      {/* Éxito */}
      {step === 'success' && (
        <div className="space-y-4">
          <AuthStatus>
            Tu contraseña fue actualizada. Ya podés iniciar sesión con la nueva.
          </AuthStatus>
          <Button asChild size="lg" className="w-full">
            <Link href="/autenticacion/iniciar-sesion">
              iniciarSesion();
              <LogIn className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {step !== 'success' && (
        <AuthLinks
          links={[
            { href: '/autenticacion/iniciar-sesion', label: 'Volver a iniciar sesión' },
            { href: '/autenticacion/registro', label: '¿No tenés cuenta? Creá una' },
          ]}
        />
      )}
    </AuthShell>
  );
}
