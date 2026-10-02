'use client';

import { requestPasswordReset } from '@/actions/auth/request-password-reset';
import { verifyResetCode } from '@/actions/auth/verify-reset-code';
import { completePasswordReset } from '@/actions/auth/complete-password-reset';
import { newPasswordSchema } from '@/lib/validations/auth-schemas';
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
      setEmail(values.email);
      setStep('code');
      setResendCooldown(result.waitSeconds || 60);
      toast.success('Código enviado. Revisá tu correo electrónico.');
      // Deshabilitar loading después del éxito para permitir interacción en el siguiente paso
      setIsLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.startsWith('RATE_LIMIT:')) {
        const waitSeconds = parseInt(errorMessage.split(':')[1], 10);
        setResendCooldown(waitSeconds);
        toast.error(`Tenés que esperar ${waitSeconds} segundos antes de pedir otro código.`);
      } else {
        toast.error('Error al enviar el código. Intentá de nuevo.');
      }
      setIsLoading(false);
    }
  };

  const onCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
    setIsLoading(true);
    try {
      await verifyResetCode(email, values.code);
      setCode(values.code);
      setStep('password');
      toast.success('Código verificado. Ahora podés crear tu nueva contraseña.');
      // Deshabilitar loading después del éxito para permitir interacción en el siguiente paso
      setIsLoading(false);
    } catch {
      toast.error('Código inválido o expirado. Intentá de nuevo.');
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    try {
      await completePasswordReset(email, code, values.password);
      setStep('success');
      toast.success('Contraseña actualizada exitosamente.');
      // Mantener el botón deshabilitado en el estado de éxito (ya no hay más acciones)
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
